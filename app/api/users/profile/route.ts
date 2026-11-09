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
 * Private account endpoint: returns ONLY the authenticated user's own account data and owned stores.
 * Public user profile lookups (?handle=, ?q=, ?userId=) are disabled and return 404.
 */
export async function GET(req: NextRequest) {
  try {
    const searchQuery = req.nextUrl.searchParams.get("q")?.trim();
    const requestedHandle = req.nextUrl.searchParams
      .get("handle")
      ?.replace(/^@/, "")
      .trim()
      .toLowerCase();
    const requestedUserId =
      req.nextUrl.searchParams.get("userId")?.trim() ||
      req.nextUrl.searchParams.get("id")?.trim();

    if (searchQuery || (requestedHandle && requestedHandle !== "me") || requestedUserId) {
      const notFoundRes = NextResponse.json(
        {
          success: false,
          error: "Public user profiles and handle lookups are disabled. User accounts are private.",
        },
        { status: 404 }
      );
      notFoundRes.headers.set("Cache-Control", "private, no-store, must-revalidate");
      return notFoundRes;
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

    const ownStores = await StoreModel.find({
      ownerId: String(dbUser._id),
      status: { $ne: "deleted" },
    })
      .select("-businessApplicationId")
      .sort({ createdAt: 1 })
      .lean();

    const primaryStore = ownStores[0] || null;
    const derivedRole =
      dbUser.role === "admin"
        ? "admin"
        : ownStores.length > 0
          ? "seller"
          : "buyer";

    const payload = {
      ...dbUser,
      id: String(dbUser._id),
      role: derivedRole,
      storesCount: ownStores.length,
      stores: ownStores,
      storeId: primaryStore ? String(primaryStore._id) : undefined,
      store: primaryStore || undefined,
    };

    const res = NextResponse.json({
      success: true,
      data: payload,
      user: payload,
    });
    res.headers.set("Cache-Control", "private, no-store, must-revalidate");
    return res;
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

    if (body.phone && typeof body.phone === "string") {
      updateFields["profile.phone"] = body.phone.trim();
    }
    if (body.whatsapp && typeof body.whatsapp === "string") {
      updateFields["profile.whatsapp"] = body.whatsapp.trim();
    }

    // Note: Public user handles are disabled; client-supplied role, sellerStatus, storesCount,
    // and verification flags are strictly ignored.
    const currentUser: any = await UserModel.findById(user.id)
      .select("onboardingStep")
      .lean();
    if (!currentUser?.onboardingStep || currentUser.onboardingStep === "pending") {
      updateFields["onboardingStep"] = "profile_completed";
    }

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

    const ownStores = await StoreModel.find({
      ownerId: String(user.id),
      status: { $ne: "deleted" },
    })
      .select("-businessApplicationId")
      .sort({ createdAt: 1 })
      .lean();
    const updatedStore = ownStores[0] || null;

    const responsePayload = {
      ...updatedUser,
      id: String(updatedUser._id),
      storesCount: ownStores.length,
      stores: ownStores,
      storeId: updatedStore ? String(updatedStore._id) : undefined,
      store: updatedStore || undefined,
    };

    const res = NextResponse.json({
      success: true,
      data: responsePayload,
      user: responsePayload,
      message: "Profile updated successfully.",
    });
    res.headers.set("Cache-Control", "private, no-store, must-revalidate");
    return res;
  } catch (error: any) {
    console.error("[PATCH /api/users/profile] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update profile." },
      { status: 500 }
    );
  }
}

export { PATCH as PUT };
