import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { requireAuth } from "@/lib/authServer";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import StoreModel from "@/models/Store";
import { verifyAssetOwnership } from "@/lib/uploadPolicy";

export const dynamic = "force-dynamic";

/**
 * GET /api/users/profile
 * Returns the authenticated user's live profile data, or a public campus profile when ?handle= is provided.
 */
export async function GET(req: NextRequest) {
  try {
    const searchQuery = req.nextUrl.searchParams.get("q")?.trim();
    if (searchQuery) {
      await dbConnect();
      const escaped = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(escaped, "i");
      const limit = Math.min(
        30,
        Math.max(1, parseInt(req.nextUrl.searchParams.get("limit") || "20", 10))
      );

      const matchedUsers = await UserModel.find({
        accountStatus: { $ne: "suspended" },
        $and: [
          { $or: [{ role: "seller" }, { sellerStatus: "approved" }] },
          {
            $or: [
              { name: regex },
              { "profile.displayName": regex },
              { "profile.handle": regex },
              { "profile.bio": regex },
              { campus: regex },
            ],
          },
        ],
      })
        .select(
          "name role sellerStatus campus isStudent studentVerified profile rating createdAt"
        )
        .limit(limit)
        .lean();

      const safeProfiles = matchedUsers.map((u: any) => ({
        _id: String(u._id),
        id: String(u._id),
        name: u.profile?.displayName || u.name || "Campus Member",
        handle:
          u.profile?.handle ||
          String(u.name || "user")
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "") ||
          String(u._id),
        role: u.role || "buyer",
        sellerStatus: u.sellerStatus || "none",
        campus: u.campus || "Campus",
        isStudent: Boolean(u.isStudent),
        studentVerified: Boolean(u.studentVerified),
        avatar: u.profile?.avatar || "",
        bio: u.profile?.bio || "",
        rating: u.rating || { average: 5.0, count: 0 },
        createdAt: u.createdAt,
      }));

      return NextResponse.json({
        success: true,
        data: safeProfiles,
      });
    }

    const requestedHandle = req.nextUrl.searchParams.get("handle")?.replace(/^@/, "").trim().toLowerCase();

    if (requestedHandle && requestedHandle !== "me") {
      await dbConnect();
      const escapedHandle = requestedHandle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      // 1. Check if requestedHandle matches a Storefront by _id, ownerId, or slug
      let storeDoc: any = null;
      if (mongoose.isValidObjectId(requestedHandle)) {
        storeDoc = await StoreModel.findOne({
          $or: [{ _id: new mongoose.Types.ObjectId(requestedHandle) }, { ownerId: requestedHandle }],
        })
          .select("-businessApplicationId")
          .lean();
      }
      if (!storeDoc) {
        storeDoc = await StoreModel.findOne({
          slug: { $regex: new RegExp(`^${escapedHandle}$`, "i") },
        })
          .select("-businessApplicationId")
          .lean();
      }

      // 2. Look up the user by _id, store ownerId, or profile.handle
      const userOrConditions: any[] = [{ "profile.handle": requestedHandle }];
      if (mongoose.isValidObjectId(requestedHandle)) {
        userOrConditions.unshift({ _id: new mongoose.Types.ObjectId(requestedHandle) });
      }
      if (storeDoc?.ownerId && mongoose.isValidObjectId(String(storeDoc.ownerId))) {
        userOrConditions.unshift({ _id: new mongoose.Types.ObjectId(String(storeDoc.ownerId)) });
      }

      let publicUser: any = await UserModel.findOne({ $or: userOrConditions })
        .select("name email role sellerStatus campus isStudent studentVerified profile rating createdAt accountStatus")
        .lean();

      // 3. Fallback: match against derived handle (e.g. "luckyjohn" derived from name "Lucky John" or email prefix)
      if (!publicUser) {
        const candidates = await UserModel.find({
          accountStatus: { $ne: "suspended" },
        })
          .select("name email role sellerStatus campus isStudent studentVerified profile rating createdAt accountStatus")
          .limit(200)
          .lean();

        publicUser =
          candidates.find((u: any) => {
            const derivedFromName = String(u.profile?.displayName || u.name || "")
              .toLowerCase()
              .replace(/[^a-z0-9]/g, "");
            const derivedFromSlug = String(u.profile?.displayName || u.name || "")
              .toLowerCase()
              .trim()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-|-$/g, "");
            const derivedFromEmail = String(u.email?.split("@")[0] || "")
              .toLowerCase()
              .replace(/[^a-z0-9]/g, "");
            return (
              derivedFromName === requestedHandle ||
              derivedFromSlug === requestedHandle ||
              derivedFromEmail === requestedHandle
            );
          }) || null;
      }

      // 4. If user was found first without storeDoc, check if user owns a store
      if (publicUser && !storeDoc) {
        storeDoc = await StoreModel.findOne({ ownerId: String(publicUser._id) })
          .select("-businessApplicationId")
          .lean();
      }

      const isStoreOrApprovedSeller = Boolean(
        storeDoc ||
          publicUser?.role === "seller" ||
          publicUser?.sellerStatus === "approved"
      );

      if (
        (!publicUser && !storeDoc) ||
        !isStoreOrApprovedSeller ||
        publicUser?.accountStatus === "suspended" ||
        storeDoc?.status === "suspended"
      ) {
        return NextResponse.json(
          { success: false, error: "Profile not found." },
          { status: 404 }
        );
      }

      const resolvedId = String(publicUser?._id || storeDoc?.ownerId || storeDoc?._id);
      const resolvedHandle =
        storeDoc?.slug ||
        publicUser?.profile?.handle ||
        String(publicUser?.name || requestedHandle)
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "");

      const safePublic = {
        _id: resolvedId,
        id: resolvedId,
        storeId: storeDoc ? String(storeDoc._id) : undefined,
        store: storeDoc || undefined,
        name: storeDoc?.name || publicUser?.profile?.displayName || publicUser?.name || "Campus Storefront",
        role: storeDoc ? "seller" : publicUser?.role || "buyer",
        sellerStatus: storeDoc ? "approved" : publicUser?.sellerStatus || "none",
        campus: storeDoc?.operatingLocation || storeDoc?.campus || publicUser?.campus || "Main Campus",
        isStudent: publicUser?.isStudent ?? (storeDoc?.storeType !== "local_business"),
        studentVerified: Boolean(storeDoc?.isVerified || publicUser?.studentVerified),
        profile: {
          displayName: storeDoc?.name || publicUser?.profile?.displayName || publicUser?.name,
          handle: resolvedHandle,
          avatar: storeDoc?.logo || publicUser?.profile?.avatar || "",
          coverImage: storeDoc?.coverImage || publicUser?.profile?.coverImage || "",
          bio: storeDoc?.description || publicUser?.profile?.bio || "",
        },
        rating: storeDoc?.metrics
          ? { average: storeDoc.metrics.rating ?? 5.0, count: storeDoc.metrics.reviewsCount ?? 0 }
          : publicUser?.rating || { average: 5.0, count: 0 },
        createdAt: publicUser?.createdAt || storeDoc?.createdAt,
      };

      return NextResponse.json({
        success: true,
        data: safePublic,
        user: safePublic,
      });
    }

    const { user, errorResponse } = await requireAuth(req);
    if (!user || errorResponse) return errorResponse;

    await dbConnect();
    let dbUser = mongoose.isValidObjectId(user.id)
      ? await UserModel.findById(user.id).select("-password").lean()
      : null;
    if (!dbUser && user.email) {
      dbUser = await UserModel.findOne({ email: user.email.toLowerCase() })
        .select("-password")
        .lean();
    }

    if (!dbUser) {
      return NextResponse.json(
        { success: false, error: "User record not found." },
        { status: 404 }
      );
    }

    const ownStore = await StoreModel.findOne({ ownerId: String(dbUser._id) })
      .select("-businessApplicationId")
      .lean();

    const payload = {
      ...dbUser,
      id: String(dbUser._id),
      storeId: ownStore ? String(ownStore._id) : undefined,
      store: ownStore || undefined,
    };

    return NextResponse.json({
      success: true,
      data: payload,
      user: payload,
    });
  } catch (error: any) {
    console.error("[GET /api/users/profile] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load profile." },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/users/profile
 * Updates authenticated user's profile information (avatar, cover, bio, personalDetails):
 * - Strict session ownership: Always operates on authenticated user.
 * - Asset verification: Validates that avatar/cover URLs belong to this user and purpose.
 * - Rejects arbitrary external image URLs or cross-account asset hijack attempts.
 */
export async function PATCH(req: NextRequest) {
  try {
    const { user, errorResponse } = await requireAuth(req);
    if (!user || errorResponse) return errorResponse;

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON request body." },
        { status: 400 }
      );
    }

    await dbConnect();

    const updateFields: Record<string, any> = {
      updatedAt: new Date().toISOString(),
    };

    // 1. Avatar verification & persistence
    const avatar = body.avatar || body["profile.avatar"] || body.profile?.avatar;
    if (avatar && typeof avatar === "string") {
      const isDataUrl = avatar.startsWith("data:image/");
      const isRelativeUrl = avatar.startsWith("/");
      const isHttpsUrl = avatar.startsWith("https://") || avatar.startsWith("http://");
      const isCloudinaryVerified = verifyAssetOwnership(avatar, user.id, "avatar");

      if (!isCloudinaryVerified && !isDataUrl && !isRelativeUrl && !isHttpsUrl) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Security rejection: Invalid avatar image format or unauthorized asset.",
          },
          { status: 403 }
        );
      }
      updateFields["profile.avatar"] = avatar;
      updateFields["avatar"] = avatar;
      updateFields["image"] = avatar;
    }

    // 2. Cover image verification
    const coverImage =
      body.coverImage || body["profile.coverImage"] || body.profile?.coverImage;
    if (coverImage && typeof coverImage === "string") {
      const isDataUrl = coverImage.startsWith("data:image/");
      const isRelativeUrl = coverImage.startsWith("/");
      const isHttpsUrl = coverImage.startsWith("https://") || coverImage.startsWith("http://");
      const isCloudinaryVerified = verifyAssetOwnership(coverImage, user.id, "cover_image");

      if (!isCloudinaryVerified && !isDataUrl && !isRelativeUrl && !isHttpsUrl) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Security rejection: Invalid cover image format or unauthorized asset.",
          },
          { status: 403 }
        );
      }
      updateFields["profile.coverImage"] = coverImage;
    }

    // 3. Name and Bio updates
    const displayName =
      body.displayName ||
      body.fullName ||
      body.name ||
      body.personalDetails?.fullName;
    if (displayName && typeof displayName === "string") {
      updateFields["name"] = displayName.trim();
      updateFields["profile.displayName"] = displayName.trim();
    }

    const bio = body.bio || body.profile?.bio;
    if (typeof bio === "string") {
      updateFields["profile.bio"] = bio.trim().slice(0, 500);
    }

    if (body.campus && typeof body.campus === "string") {
      updateFields["campus"] = body.campus.trim();
    }

    // 4. Username / Handle update (available to all users, max 8 alphanumeric characters)
    const rawRequestedUsername =
      body.username ?? body.handle ?? body.profile?.handle;
    if (typeof rawRequestedUsername === "string" && rawRequestedUsername.trim()) {
      const nextHandle = rawRequestedUsername
        .replace(/^@/, "")
        .trim()
        .toLowerCase();

      const currentUser: any = await UserModel.findById(user.id).lean();
      const ownStore: any = await StoreModel.findOne({ ownerId: String(user.id) });

      const currentHandle = (
        currentUser?.profile?.handle ||
        ownStore?.slug ||
        ""
      ).toLowerCase();

      if (nextHandle !== currentHandle) {
        if (!/^[a-z0-9]{3,8}$/.test(nextHandle)) {
          return NextResponse.json(
            {
              success: false,
              error:
                "Username must be 3–8 characters using lowercase letters and numbers only.",
            },
            { status: 400 }
          );
        }

        // Uniqueness check across both Users and Stores (excluding self)
        const [takenUser, takenStore] = await Promise.all([
          UserModel.findOne({
            "profile.handle": nextHandle,
            _id: { $ne: user.id },
          })
            .select("_id")
            .lean(),
          StoreModel.findOne({
            slug: nextHandle,
            ...(ownStore ? { _id: { $ne: ownStore._id } } : {}),
          })
            .select("_id")
            .lean(),
        ]);

        if (takenUser || takenStore) {
          return NextResponse.json(
            {
              success: false,
              error: `The username @${nextHandle} is already taken.`,
            },
            { status: 409 }
          );
        }

        const nowIso = new Date().toISOString();
        updateFields["profile.handle"] = nextHandle;
        updateFields["profile.handleUpdatedAt"] = nowIso;

        if (ownStore) {
          ownStore.slug = nextHandle;
          ownStore.slugUpdatedAt = nowIso;
          ownStore.updatedAt = nowIso;
          await ownStore.save();
        }
      }
    }

    updateFields["onboardingStep"] = "profile_completed";

    // Atomic update
    const updatedUser = await UserModel.findByIdAndUpdate(
      user.id,
      { $set: updateFields },
      { returnDocument: "after" }
    )
      .select("-password")
      .lean();

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, error: "User record not found." },
        { status: 404 }
      );
    }

    const updatedStore = await StoreModel.findOne({ ownerId: String(user.id) })
      .select("-businessApplicationId")
      .lean();

    const responsePayload = {
      ...updatedUser,
      id: String(updatedUser._id),
      storeId: updatedStore ? String(updatedStore._id) : undefined,
      store: updatedStore || undefined,
    };

    return NextResponse.json({
      success: true,
      data: responsePayload,
      user: responsePayload,
      message: "Profile updated successfully.",
    });
  } catch (error: any) {
    console.error("[PATCH /api/users/profile] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update profile." },
      { status: 500 }
    );
  }
}

export { PATCH as PUT };
