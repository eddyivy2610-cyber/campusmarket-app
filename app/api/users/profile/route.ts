import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/authServer";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import { verifyAssetOwnership } from "@/lib/uploadPolicy";

export const dynamic = "force-dynamic";

/**
 * GET /api/users/profile
 * Returns the authenticated user's live profile data.
 */
export async function GET(req: NextRequest) {
  try {
    const { user, errorResponse } = await requireAuth(req);
    if (!user || errorResponse) return errorResponse;

    await dbConnect();
    const dbUser = await UserModel.findOne({ email: user.email.toLowerCase() })
      .select("-password")
      .lean();

    if (!dbUser) {
      return NextResponse.json(
        { success: false, error: "User record not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...dbUser,
        id: String(dbUser._id),
      },
      user: {
        ...dbUser,
        id: String(dbUser._id),
      },
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

    // 1. Avatar verification
    const avatar = body.avatar || body["profile.avatar"] || body.profile?.avatar;
    if (avatar) {
      if (!verifyAssetOwnership(avatar, user.id, "avatar")) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Security rejection: Avatar asset does not belong to your account or has not been verified.",
          },
          { status: 403 }
        );
      }
      updateFields["profile.avatar"] = avatar;
    }

    // 2. Cover image verification
    const coverImage =
      body.coverImage || body["profile.coverImage"] || body.profile?.coverImage;
    if (coverImage) {
      if (!verifyAssetOwnership(coverImage, user.id, "cover_image")) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Security rejection: Cover image asset does not belong to your account or has not been verified.",
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

    updateFields["onboardingStep"] = "profile_completed";

    // Atomic update
    const updatedUser = await UserModel.findByIdAndUpdate(
      user.id,
      { $set: updateFields },
      { returnDocument: "after" }
    ).select("-password");

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, error: "User record not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedUser,
      user: updatedUser,
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
