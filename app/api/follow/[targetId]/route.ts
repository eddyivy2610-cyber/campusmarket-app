import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import dbConnect from "@/lib/dbConnect";
import FollowerModel from "@/models/Follower";
import { requireAuth } from "@/lib/authServer";
import { resolveAndValidateTarget, executeFollow, executeUnfollow } from "@/lib/followHelpers";
import { applyRateLimit, RATE_LIMIT_PRESETS } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

/**
 * POST /api/follow/[targetId]
 * Idempotently follow a target user or store.
 * Repeated calls safely succeed without creating duplicates or double-counting.
 */
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ targetId: string }> }
) {
  try {
    const { user, errorResponse } = await requireAuth(req);
    if (!user || errorResponse) return errorResponse;

    // Rate limiting: abuse prevention
    const rateCheck = applyRateLimit(req, "follow_action", RATE_LIMIT_PRESETS.FOLLOW, user.id);
    if (!rateCheck.allowed) return rateCheck.response!;

    const { targetId } = await context.params;
    if (!targetId) {
      return NextResponse.json({ success: false, error: "Target ID is required." }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    let targetTypeHint = searchParams.get("targetType") || "user";
    try {
      const body = await req.json();
      if (body?.targetType) targetTypeHint = body.targetType;
    } catch {
      // Body is optional
    }

    await dbConnect();

    const target = await resolveAndValidateTarget(targetId, targetTypeHint);
    if (!target.valid || !target.targetId) {
      return NextResponse.json(
        { success: false, error: target.error || "Target entity not found." },
        { status: target.statusCode || 404 }
      );
    }

    const resolvedTargetIdStr = target.targetId.toString();
    const currentUserIdStr = user.id.toString();

    // Prevent self-following
    if (target.targetType === "user" && resolvedTargetIdStr === currentUserIdStr) {
      return NextResponse.json({ success: false, error: "You cannot follow yourself." }, { status: 400 });
    }
    if (target.targetType === "store" && target.entity?.ownerId?.toString() === currentUserIdStr) {
      return NextResponse.json({ success: false, error: "You cannot follow your own store." }, { status: 400 });
    }

    const { isFollowing, newlyFollowed } = await executeFollow(
      user.id,
      target.targetId,
      target.targetType,
      { name: user.name, handle: user.email?.split("@")[0] }
    );

    return NextResponse.json({
      success: true,
      message: newlyFollowed ? "Successfully followed." : "Already following.",
      isFollowing,
      newlyFollowed,
      targetId: target.targetId.toString(),
      targetType: target.targetType,
    });
  } catch (error: any) {
    console.error("[POST /api/follow/[targetId]] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to follow." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/follow/[targetId]
 * Idempotently unfollow a target user or store.
 * Repeated calls safely succeed with isFollowing: false.
 */
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ targetId: string }> }
) {
  try {
    const { user, errorResponse } = await requireAuth(req);
    if (!user || errorResponse) return errorResponse;

    // Rate limiting: abuse prevention
    const rateCheck = applyRateLimit(req, "follow_action", RATE_LIMIT_PRESETS.FOLLOW, user.id);
    if (!rateCheck.allowed) return rateCheck.response!;

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

    const { isFollowing, newlyUnfollowed } = await executeUnfollow(
      user.id,
      target.targetId,
      target.targetType
    );

    return NextResponse.json({
      success: true,
      message: newlyUnfollowed ? "Successfully unfollowed." : "Not currently following.",
      isFollowing,
      newlyUnfollowed,
      targetId: target.targetId.toString(),
      targetType: target.targetType,
    });
  } catch (error: any) {
    console.error("[DELETE /api/follow/[targetId]] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to unfollow." },
      { status: 500 }
    );
  }
}

/**
 * GET /api/follow/[targetId]
 * Check follow status.
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ targetId: string }> }
) {
  try {
    const { user, errorResponse } = await requireAuth(req);
    if (!user || errorResponse) return errorResponse;

    // Rate limiting: abuse prevention
    const rateCheck = applyRateLimit(req, "follow_action", RATE_LIMIT_PRESETS.FOLLOW, user.id);
    if (!rateCheck.allowed) return rateCheck.response!;

    const { targetId } = await context.params;
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

    return NextResponse.json({
      success: true,
      isFollowing: Boolean(follow),
      targetId: target.targetId.toString(),
      targetType: target.targetType,
    });
  } catch (error: any) {
    console.error("[GET /api/follow/[targetId]] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to get follow status." },
      { status: 500 }
    );
  }
}
