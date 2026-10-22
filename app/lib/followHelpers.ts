import mongoose, { Types } from "mongoose";
import FollowerModel, { FollowTargetType } from "@/models/Follower";
import UserModel from "@/models/User";
import StoreModel from "@/models/Store";
import { ListingModel } from "@/models/Listing";
import { createNotification } from "@/lib/notificationService";
import { executeInTransaction } from "@/lib/transactionHelper";

export const FOLLOW_LIMIT_PER_USER = 300;

export interface ResolveTargetResult {
  valid: boolean;
  targetId?: Types.ObjectId;
  targetType: FollowTargetType;
  entity?: any;
  error?: string;
  statusCode?: number;
}

/**
 * Resolves a target identifier (ObjectId or user handle) and validates existence, eligibility,
 * and prevents self-follow across both personal profiles and owned storefronts.
 */
export async function resolveAndValidateTarget(
  rawTargetId: string,
  targetTypeHint: string = "user",
  callerUserId?: string
): Promise<ResolveTargetResult> {
  if (!rawTargetId || typeof rawTargetId !== "string") {
    return { valid: false, error: "Target ID is required.", statusCode: 400, targetType: "user" };
  }

  const cleanHint = targetTypeHint?.toLowerCase() === "store" ? "store" : "user";

  if (cleanHint === "store") {
    let storeDoc: any = null;
    if (mongoose.Types.ObjectId.isValid(rawTargetId)) {
      storeDoc = await StoreModel.findById(rawTargetId).lean();
    }
    if (!storeDoc) {
      // Check slug lookup for convenience
      storeDoc = await StoreModel.findOne({ slug: rawTargetId.trim().toLowerCase() }).lean();
    }

    if (!storeDoc) {
      return { valid: false, error: "Store not found.", statusCode: 404, targetType: "store" };
    }

    // Suspended, banned, or removed stores return 404 on follow actions
    if (storeDoc.status === "suspended" || storeDoc.status === "removed" || storeDoc.status === "banned") {
      return { valid: false, error: "Store not found.", statusCode: 404, targetType: "store" };
    }

    // Prevent store owner from following their own store
    if (callerUserId && storeDoc.ownerId && storeDoc.ownerId.toString() === callerUserId) {
      return { valid: false, error: "You cannot follow your own storefront.", statusCode: 400, targetType: "store" };
    }

    return {
      valid: true,
      targetId: storeDoc._id as Types.ObjectId,
      targetType: "store",
      entity: storeDoc,
    };
  } else {
    // Target is a user
    let userDoc: any = null;
    if (mongoose.Types.ObjectId.isValid(rawTargetId)) {
      userDoc = await UserModel.findById(rawTargetId).lean();
    }
    if (!userDoc) {
      // Try handle lookup (stripping leading @ if present)
      const cleanHandle = rawTargetId.replace(/^@/, "").trim().toLowerCase();
      userDoc = await UserModel.findOne({ "profile.handle": cleanHandle }).lean();
    }

    if (!userDoc) {
      return { valid: false, error: "User not found.", statusCode: 404, targetType: "user" };
    }

    // Rejection of suspended accounts
    if (userDoc.accountStatus === "suspended" || userDoc.accountStatus === "banned") {
      return { valid: false, error: "This user account is suspended.", statusCode: 403, targetType: "user" };
    }

    // Prevent user from following themselves
    if (callerUserId && userDoc._id.toString() === callerUserId) {
      return { valid: false, error: "You cannot follow yourself.", statusCode: 400, targetType: "user" };
    }



    return {
      valid: true,
      targetId: userDoc._id as Types.ObjectId,
      targetType: "user",
      entity: userDoc,
    };
  }
}

/**
 * Idempotently follows a target entity (User or Store).
 * Enforces transaction atomicity, follow limits, and handles 11000 duplicate keys gracefully.
 */
export async function executeFollow(
  followerUserId: string,
  targetId: Types.ObjectId,
  targetType: FollowTargetType,
  followerInfo?: { name?: string; handle?: string }
): Promise<{ isFollowing: boolean; newlyFollowed: boolean }> {
  const followerObjectId = new Types.ObjectId(followerUserId);

  // Check if relationship already exists (fast-path idempotent return)
  const existing = await FollowerModel.findOne({
    followerId: followerObjectId,
    followingId: targetId,
    targetType,
  }).lean();

  if (existing) {
    return { isFollowing: true, newlyFollowed: false };
  }

  // Enforce that only stores and seller accounts / service providers can be followed
  if (targetType === "user") {
    const userDoc = await UserModel.findById(targetId).select("role sellerStatus isStudentSeller").lean();
    if (userDoc) {
      const isSeller =
        userDoc.role === "seller" ||
        (userDoc as any).sellerStatus === "approved" ||
        (userDoc as any).isStudentSeller === true;
      if (!isSeller) {
        const [ownsStore, hasListings] = await Promise.all([
          StoreModel.exists({ ownerId: targetId.toString() }),
          ListingModel.exists({ sellerId: targetId.toString() }),
        ]);
        if (!ownsStore && !hasListings) {
          const error: any = new Error(
            "Only stores and seller accounts offering products or services can be followed."
          );
          error.statusCode = 400;
          throw error;
        }
      }
    }
  }

  // Enforce follow cap per user
  const currentCount = await FollowerModel.countDocuments({ followerId: followerObjectId });
  if (currentCount >= FOLLOW_LIMIT_PER_USER) {
    const error: any = new Error(
      `Follow limit reached. You can follow a maximum of ${FOLLOW_LIMIT_PER_USER} stores and sellers.`
    );
    error.statusCode = 400;
    throw error;
  }

  try {
    return await executeInTransaction(async (session) => {
      // Verify inside transaction that it doesn't already exist
      const checkInside = await FollowerModel.findOne({
        followerId: followerObjectId,
        followingId: targetId,
        targetType,
      }).session(session || null).lean();

      if (checkInside) {
        return { isFollowing: true, newlyFollowed: false };
      }

      await FollowerModel.create(
        [
          {
            followerId: followerObjectId,
            followingId: targetId,
            targetType,
            schemaVersion: 1,
          },
        ],
        { session: session || undefined }
      );

      // Atomically increment follower count on target entity
      if (targetType === "user") {
        await UserModel.updateOne(
          { _id: targetId },
          { $inc: { "businessProfile.followersCount": 1 } },
          { session: session || undefined }
        );

        // Dispatch notification asynchronously without blocking transaction
        try {
          await createNotification({
            recipient: targetId.toString(),
            sender: followerObjectId.toString(),
            type: "new_follower",
            category: "reviews",
            title: "New follower",
            message: `${followerInfo?.name || "A student"} is now following you.`,
            link: followerInfo?.handle ? `/profile/${followerInfo.handle}` : "",
            dedupeKey: `follower:${targetId}:${followerObjectId}`,
            session: session ? (session as any) : undefined,
          });
        } catch {
          // notification dispatch failure non-fatal
        }
      } else if (targetType === "store") {
        await StoreModel.updateOne(
          { _id: targetId },
          { $inc: { "metrics.followersCount": 1 } },
          { session: session || undefined }
        );
      }

      return { isFollowing: true, newlyFollowed: true };
    });
  } catch (err: any) {
    if (err.code === 11000) {
      // Caught outside transaction: race condition resolved by unique compound index.
      // Another competing concurrent follow inserted the record and incremented the counter.
      return { isFollowing: true, newlyFollowed: false };
    }
    throw err;
  }
}

/**
 * Idempotently unfollows a target entity (User or Store).
 * Transaction-safe, bounds counters at >= 0.
 */
export async function executeUnfollow(
  followerUserId: string,
  targetId: Types.ObjectId,
  targetType: FollowTargetType
): Promise<{ isFollowing: boolean; newlyUnfollowed: boolean }> {
  const followerObjectId = new Types.ObjectId(followerUserId);

  return await executeInTransaction(async (session) => {
    const deletedDoc = await FollowerModel.findOneAndDelete(
      {
        followerId: followerObjectId,
        followingId: targetId,
        targetType,
      },
      { session: session || undefined }
    );

    if (deletedDoc) {
      // Atomically decrement follower count on target entity without going below 0
      if (targetType === "user") {
        await UserModel.updateOne(
          { _id: targetId, "businessProfile.followersCount": { $gt: 0 } },
          { $inc: { "businessProfile.followersCount": -1 } },
          { session: session || undefined }
        );
      } else if (targetType === "store") {
        await StoreModel.updateOne(
          { _id: targetId, "metrics.followersCount": { $gt: 0 } },
          { $inc: { "metrics.followersCount": -1 } },
          { session: session || undefined }
        );
      }
      return { isFollowing: false, newlyUnfollowed: true };
    }

    return { isFollowing: false, newlyUnfollowed: false };
  });
}

/**
 * Atomically toggles follow status for a target entity (User or Store).
 * Preserved for legacy clients with full transaction protection.
 */
export async function executeToggle(
  followerUserId: string,
  targetId: Types.ObjectId,
  targetType: FollowTargetType,
  followerInfo?: { name?: string; handle?: string }
): Promise<{ isFollowing: boolean }> {
  const followerObjectId = new Types.ObjectId(followerUserId);

  // Attempt atomic deletion first
  const deletedDoc = await FollowerModel.findOneAndDelete({
    followerId: followerObjectId,
    followingId: targetId,
    targetType,
  });

  if (deletedDoc) {
    // Relationship existed and was deleted: decrement counter safely (bounded at >= 0)
    if (targetType === "user") {
      await UserModel.findOneAndUpdate(
        { _id: targetId, "businessProfile.followersCount": { $gt: 0 } },
        { $inc: { "businessProfile.followersCount": -1 } }
      );
    } else if (targetType === "store") {
      await StoreModel.findOneAndUpdate(
        { _id: targetId, "metrics.followersCount": { $gt: 0 } },
        { $inc: { "metrics.followersCount": -1 } }
      );
    }
    return { isFollowing: false };
  }

  // Relationship did not exist at the time of deletion: attempt creation
  try {
    await FollowerModel.create({
      followerId: followerObjectId,
      followingId: targetId,
      targetType,
      schemaVersion: 1,
    });

    if (targetType === "user") {
      await UserModel.findByIdAndUpdate(targetId, {
        $inc: { "businessProfile.followersCount": 1 },
      });
      try {
        await createNotification({
          recipient: targetId.toString(),
          sender: followerObjectId.toString(),
          type: "new_follower",
          category: "reviews",
          title: "New follower",
          message: `${followerInfo?.name || "A student"} is now following you.`,
          link: followerInfo?.handle ? `/profile/${followerInfo.handle}` : "",
          dedupeKey: `follower:${targetId}:${followerObjectId}`,
        });
      } catch {
        // Notification dispatch failure non-fatal
      }
    } else if (targetType === "store") {
      await StoreModel.findByIdAndUpdate(targetId, {
        $inc: { "metrics.followersCount": 1 },
      });
    }

    return { isFollowing: true };
  } catch (err: any) {
    if (err.code === 11000) {
      const cancelledDoc = await FollowerModel.findOneAndDelete({
        followerId: followerObjectId,
        followingId: targetId,
        targetType,
      });

      if (cancelledDoc) {
        if (targetType === "user") {
          await UserModel.findOneAndUpdate(
            { _id: targetId, "businessProfile.followersCount": { $gt: 0 } },
            { $inc: { "businessProfile.followersCount": -1 } }
          );
        } else if (targetType === "store") {
          await StoreModel.findOneAndUpdate(
            { _id: targetId, "metrics.followersCount": { $gt: 0 } },
            { $inc: { "metrics.followersCount": -1 } }
          );
        }
      }
      return { isFollowing: false };
    }
    throw err;
  }
}

/**
 * Verifies counter consistency across all stored counters vs index-backed countDocuments.
 */
export async function checkFollowCountersDrift(): Promise<{
  storeMismatches: Array<{ storeId: string; stored: number; actual: number }>;
  userMismatches: Array<{ userId: string; stored: number; actual: number }>;
  totalMismatches: number;
}> {
  const storeMismatches: Array<{ storeId: string; stored: number; actual: number }> = [];
  const userMismatches: Array<{ userId: string; stored: number; actual: number }> = [];

  const stores = await StoreModel.find({}).select("_id metrics.followersCount").lean();
  for (const s of stores) {
    const actual = await FollowerModel.countDocuments({
      followingId: s._id,
      targetType: "store",
    });
    const stored = s.metrics?.followersCount ?? 0;
    if (actual !== stored) {
      storeMismatches.push({ storeId: s._id.toString(), stored, actual });
    }
  }

  const users = await UserModel.find({ "businessProfile.followersCount": { $exists: true } })
    .select("_id businessProfile.followersCount")
    .lean();
  for (const u of users) {
    const actual = await FollowerModel.countDocuments({
      followingId: u._id,
      targetType: "user",
    });
    const stored = (u as any).businessProfile?.followersCount ?? 0;
    if (actual !== stored) {
      userMismatches.push({ userId: u._id.toString(), stored, actual });
    }
  }

  return {
    storeMismatches,
    userMismatches,
    totalMismatches: storeMismatches.length + userMismatches.length,
  };
}

/**
 * Repairs counter drift by synchronizing stored counters with actual index-backed follow counts.
 */
export async function repairFollowCountersDrift(): Promise<{
  repairedStores: number;
  repairedUsers: number;
}> {
  const { storeMismatches, userMismatches } = await checkFollowCountersDrift();

  for (const sm of storeMismatches) {
    await StoreModel.updateOne(
      { _id: sm.storeId },
      { $set: { "metrics.followersCount": sm.actual } }
    );
  }

  for (const um of userMismatches) {
    await UserModel.updateOne(
      { _id: um.userId },
      { $set: { "businessProfile.followersCount": um.actual } }
    );
  }

  return {
    repairedStores: storeMismatches.length,
    repairedUsers: userMismatches.length,
  };
}
