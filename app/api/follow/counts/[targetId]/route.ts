import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import dbConnect from "@/lib/dbConnect";
import FollowerModel from "@/models/Follower";
import { resolveAndValidateTarget } from "@/lib/followHelpers";

export const dynamic = "force-dynamic";

/**
 * GET /api/follow/counts/[targetId]
 * Retrieve followers count and following count for an entity.
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

    await dbConnect();

    const target = await resolveAndValidateTarget(targetId, targetTypeHint);
    if (!target.valid || !target.targetId) {
      return NextResponse.json(
        { success: false, error: target.error || "Target entity not found." },
        { status: target.statusCode || 404 }
      );
    }

    const targetObjectId = target.targetId;

    // Count followers of this entity
    const followersCount = await FollowerModel.countDocuments({
      followingId: targetObjectId,
      targetType: target.targetType,
    });

    // If target is a user, also count how many entities they follow
    let followingCount = 0;
    if (target.targetType === "user") {
      followingCount = await FollowerModel.countDocuments({
        followerId: targetObjectId,
      });
    }

    return NextResponse.json({
      success: true,
      targetId: targetObjectId.toString(),
      targetType: target.targetType,
      followersCount,
      followingCount,
    });
  } catch (error: any) {
    console.error("[GET /api/follow/counts] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to retrieve follow counts." },
      { status: 500 }
    );
  }
}
