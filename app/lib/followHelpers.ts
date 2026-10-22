import mongoose, { Types } from "mongoose";
import FollowerModel, { FollowTargetType } from "@/models/Follower";
import UserModel from "@/models/User";
import StoreModel from "@/models/Store";
import NotificationModel from "@/models/Notification";

export interface ResolveTargetResult {
  valid: boolean;
  targetId?: Types.ObjectId;
  targetType: FollowTargetType;
  entity?: any;
  error?: string;
  statusCode?: number;
}

/**
 * Resolves a target identifier (ObjectId or user handle) and validates existence and eligibility.
 */
export async function resolveAndValidateTarget(
  rawTargetId: string,
  targetTypeHint: string = "user"
): Promise<ResolveTargetResult> {
  if (!rawTargetId || typeof rawTargetId !== "string") {
    return { valid: false, error: "Target ID is required.", statusCode: 400, targetType: "user" };
  }

  const cleanHint = targetTypeHint?.toLowerCase() === "store" ? "store" : "user";

  if (cleanHint === "store") {
    // Target is a store
    if (!mongoose.Types.ObjectId.isValid(rawTargetId)) {
      // Check slug lookup for convenience
      const storeBySlug = await StoreModel.findOne({ slug: rawTargetId.trim().toLowerCase() }).lean();
      if (storeBySlug) {
        return {
          valid: true,
          targetId: storeBySlug._id as Types.ObjectId,
          targetType: "store",
          entity: storeBySlug,
        };
      }
      return { valid: false, error: "Store not found.", statusCode: 404, targetType: "store" };
    }

    const store = await StoreModel.findById(rawTargetId).lean();
    if (!store) {
      return { valid: false, error: "Store not found.", statusCode: 404, targetType: "store" };
    }
    if (store.status === "suspended") {
      return { valid: false, error: "This store is suspended.", statusCode: 403, targetType: "store" };
    }
    return {
      valid: true,
      targetId: store._id as Types.ObjectId,
      targetType: "store",
      entity: store,
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
    if (userDoc.accountStatus === "suspended") {
      return { valid: false, error: "This user account is suspended.", statusCode: 403, targetType: "user" };
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
 */
export async function executeFollow(
  followerUserId: string,
  targetId: Types.ObjectId,
  targetType: FollowTargetType,
  followerInfo?: { name?: string; handle?: string }
): Promise<{ isFollowing: boolean; newlyFollowed: boolean }> {
  const followerObjectId = new Types.ObjectId(followerUserId);

  // Check if relationship already exists
  const existing = await FollowerModel.findOne({
    followerId: followerObjectId,
    followingId: targetId,
    targetType,
  }).lean();

  if (existing) {
    return { isFollowing: true, newlyFollowed: false };
  }

  try {
    await FollowerModel.create({
      followerId: followerObjectId,
      followingId: targetId,
      targetType,
      schemaVersion: 1,
    });

    // Atomically increment follower count on target entity
    if (targetType === "user") {
      await UserModel.findByIdAndUpdate(targetId, {
        $inc: { "businessProfile.followersCount": 1 },
      });

      // Dispatch notification
      try {
        await NotificationModel.create({
          recipient: targetId,
          sender: followerObjectId,
          type: "new_follower",
          title: "New Follower!",
          message: `${followerInfo?.name || "A student"} is now following you!`,
          link: followerInfo?.handle ? `/profile/${followerInfo.handle}` : "",
        });
      } catch (notifErr) {
        // Notification delivery failure should not fail follow action
        console.warn("[executeFollow] Notification creation failed:", notifErr);
      }
    } else if (targetType === "store") {
      await StoreModel.findByIdAndUpdate(targetId, {
        $inc: { "metrics.followersCount": 1 },
      });
    }

    return { isFollowing: true, newlyFollowed: true };
  } catch (err: any) {
    if (err.code === 11000) {
      // Race condition resolved by unique compound index: already followed!
      return { isFollowing: true, newlyFollowed: false };
    }
    throw err;
  }
}

/**
 * Atomically toggles follow status for a target entity (User or Store).
 * Guarantees that two concurrent toggles legitimately cancel each other out
 * without throwing duplicate-key errors, deletion races, or underflowing counts.
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
        await NotificationModel.create({
          recipient: targetId,
          sender: followerObjectId,
          type: "new_follower",
          title: "New Follower!",
          message: `${followerInfo?.name || "A student"} is now following you!`,
          link: followerInfo?.handle ? `/profile/${followerInfo.handle}` : "",
        });
      } catch (err) {
        console.warn("[executeToggle] Notification dispatch failed:", err);
      }
    } else if (targetType === "store") {
      await StoreModel.findByIdAndUpdate(targetId, {
        $inc: { "metrics.followersCount": 1 },
      });
    }

    return { isFollowing: true };
  } catch (err: any) {
    if (err.code === 11000) {
      // A competing concurrent toggle created the record at the exact same millisecond.
      // In toggle semantics, this competing toggle cancels it out: delete the newly created record.
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
 * Idempotently unfollows a target entity (User or Store).
 */
export async function executeUnfollow(
  followerUserId: string,
  targetId: Types.ObjectId,
  targetType: FollowTargetType
): Promise<{ isFollowing: boolean; newlyUnfollowed: boolean }> {
  const followerObjectId = new Types.ObjectId(followerUserId);

  const deletedDoc = await FollowerModel.findOneAndDelete({
    followerId: followerObjectId,
    followingId: targetId,
    targetType,
  });

  if (deletedDoc) {
    // Atomically decrement follower count on target entity without going below 0
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
    return { isFollowing: false, newlyUnfollowed: true };
  }

  return { isFollowing: false, newlyUnfollowed: false };
}
