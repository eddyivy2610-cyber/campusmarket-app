import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import dbConnect from "@/lib/dbConnect";
import FollowerModel from "@/models/Follower";
import { resolveAndValidateTarget } from "@/lib/followHelpers";

export const dynamic = "force-dynamic";

/**
 * GET /api/follow/followers/[targetId]
 * Lists followers for a target user or store with pagination.
 * Public endpoint (does not require authentication to view public followers).
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ targetId: string }> }
) {
  try {
    const { targetId } = await context.params;
    if (!targetId) {
      return NextResponse.json({ success: false, error: "Target ID is required." }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const targetTypeHint = searchParams.get("targetType") || "user";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10) || 20));
    const skip = (page - 1) * limit;

    await dbConnect();

    const target = await resolveAndValidateTarget(targetId, targetTypeHint);
    if (!target.valid || !target.targetId) {
      return NextResponse.json(
        { success: false, error: target.error || "Target entity not found." },
        { status: target.statusCode || 404 }
      );
    }

    const query = {
      followingId: target.targetId,
      targetType: target.targetType,
    };

    const total = await FollowerModel.countDocuments(query);
    const records = await FollowerModel.find(query)
      .populate({
        path: "followerId",
        select: "name profile.displayName profile.avatar profile.handle accountStatus",
        match: { accountStatus: { $ne: "suspended" } },
      })
      .sort({ createdAt: -1, _id: -1 }) // Deterministic sort
      .skip(skip)
      .limit(limit)
      .lean();

    // Map only public fields (exclude email and exclude suspended accounts)
    const followers = records
      .filter((r: any) => r.followerId && r.followerId.accountStatus !== "suspended")
      .map((r: any) => ({
        followId: r._id.toString(),
        follower: {
          _id: r.followerId._id ? r.followerId._id.toString() : r.followerId.toString(),
          name: r.followerId.name,
          profile: {
            displayName: r.followerId.profile?.displayName,
            avatar: r.followerId.profile?.avatar,
            handle: r.followerId.profile?.handle,
          },
        },
        followedAt: r.createdAt,
      }));

    return NextResponse.json(
      {
        success: true,
        targetId: target.targetId.toString(),
        targetType: target.targetType,
        total,
        page,
        pages: Math.ceil(total / limit),
        count: followers.length,
        followers,
        data: followers,
      },
      {
        headers: {
          "Cache-Control": "private, no-store, must-revalidate",
        },
      }
    );
  } catch (error: any) {
    console.error("[GET /api/follow/followers] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to list followers." },
      { status: 500 }
    );
  }
}
