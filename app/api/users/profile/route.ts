import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { requireAuth } from "@/lib/authServer";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
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
        accountStatus: "active",
        $or: [
          { name: regex },
          { "profile.displayName": regex },
          { "profile.handle": regex },
          { "profile.bio": regex },
          { campus: regex },
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
      const query = mongoose.isValidObjectId(requestedHandle)
        ? { $or: [{ _id: new mongoose.Types.ObjectId(requestedHandle) }, { "profile.handle": requestedHandle }] }
        : { "profile.handle": requestedHandle };

      const publicUser = await UserModel.findOne(query)
        .select("name role sellerStatus campus isStudent studentVerified profile rating createdAt accountStatus")
        .lean();

      if (!publicUser || (publicUser.accountStatus && publicUser.accountStatus !== "active")) {
        return NextResponse.json(
          { success: false, error: "User record not found." },
          { status: 404 }
        );
      }

      const safePublic = {
        _id: String(publicUser._id),
        id: String(publicUser._id),
        name: publicUser.name,
        role: publicUser.role,
        sellerStatus: publicUser.sellerStatus,
        campus: publicUser.campus,
        isStudent: publicUser.isStudent,
        studentVerified: publicUser.studentVerified,
        profile: {
          displayName: publicUser.profile?.displayName,
          handle: publicUser.profile?.handle,
          avatar: publicUser.profile?.avatar,
          coverImage: publicUser.profile?.coverImage,
          bio: publicUser.profile?.bio,
        },
        rating: publicUser.rating,
        createdAt: publicUser.createdAt,
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
