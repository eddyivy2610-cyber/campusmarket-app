import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import dbConnect from "@/lib/dbConnect";
import FollowerModel from "@/models/Follower";
import { requireAuth } from "@/lib/authServer";
import { resolveAndValidateTarget } from "@/lib/followHelpers";

export const dynamic = "force-dynamic";

/**
 * GET /api/follow/status/[targetId]
 * Check if the currently authenticated user follows a target user or store.
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ targetId: string }> }
) {
  try {
    const { user, errorResponse } = await requireAuth(req);
    if (!user || errorResponse) return errorResponse;

    const { targetId } = await context.params;
    if (!targetId || typeof targetId !== "string") {
      return NextResponse.json(
        { success: false, error: "Target ID is required." },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(req.url);
    const targetTypeHint = searchParams.get("targetType") || "user";

    await dbConnect();

    const target = await resolveAndValidateTarget(targetId, targetTypeHint);
    if (!target.valid || !target.targetId) {
      return NextResponse.json(
        { success: false, error: target.error || "Target entity not found." },
        { status: target.statusCode || 404 }
      );
    }

    const follow = await FollowerModel.findOne({
      followerId: new Types.ObjectId(user.id),
      followingId: target.targetId,
      targetType: target.targetType,
    }).lean();

    return NextResponse.json(
      {
        success: true,
        isFollowing: Boolean(follow),
        targetId: target.targetId.toString(),
        targetType: target.targetType,
      },
      {
        headers: {
          "Cache-Control": "private, no-store, must-revalidate",
        },
      }
    );
  } catch (error: any) {
    console.error("[GET /api/follow/status] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to check follow status." },
      { status: 500 }
    );
  }
}
