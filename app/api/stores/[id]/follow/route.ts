import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import dbConnect from "@/lib/dbConnect";
import FollowerModel from "@/models/Follower";
import { StoreModel } from "@/models/Store";
import { requireAuth } from "@/lib/authServer";
import { executeFollow, executeUnfollow, resolveAndValidateTarget } from "@/lib/followHelpers";
import { applyRateLimit, RATE_LIMIT_PRESETS } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

const PRIVATE_CACHE_HEADERS = {
  "Cache-Control": "private, no-store, must-revalidate",
};

function withPrivateCache(res: NextResponse): NextResponse {
  res.headers.set("Cache-Control", "private, no-store, must-revalidate");
  return res;
}

/**
 * Common store validation for follow actions.
 * - Supports Store ObjectId, Store slug, and User handle fallback.
 * - Non-existent, suspended, banned or removed stores return 404.
 * - Store owner cannot follow their own store (returns 400).
 */
async function validateStoreForFollow(storeId: string, currentUserId: string) {
  // First attempt resolving as a store
  let resolved = await resolveAndValidateTarget(storeId, "store", currentUserId);

  // If not resolved as a store, attempt resolving as a user profile
  if (!resolved.valid || !resolved.targetId) {
    resolved = await resolveAndValidateTarget(storeId, "user", currentUserId);
  }

  if (!resolved.valid || !resolved.targetId) {
    return {
      errorResponse: NextResponse.json(
        { success: false, error: resolved.error || "Store not found." },
        { status: resolved.statusCode || 404, headers: PRIVATE_CACHE_HEADERS }
      ),
    };
  }

  return { target: resolved };
}

/**
 * PUT /api/stores/[id]/follow
 * Idempotently follows a store.
 */
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { user, errorResponse } = await requireAuth(req);
    if (!user || errorResponse) return withPrivateCache(errorResponse!);

    // Rate limiting: abuse prevention
    const rateCheck = applyRateLimit(req, "follow_action", RATE_LIMIT_PRESETS.FOLLOW, user.id);
    if (!rateCheck.allowed) return withPrivateCache(rateCheck.response!);

    const { id: storeId } = await context.params;
    await dbConnect();

    const { target, errorResponse: valError } = await validateStoreForFollow(storeId, user.id);
    if (valError || !target || !target.targetId) return valError;

    const { isFollowing, newlyFollowed, followersCount } = await executeFollow(
      user.id,
      target.targetId,
      target.targetType,
      { name: user.name, handle: user.email?.split("@")[0] }
    );

    return NextResponse.json(
      {
        success: true,
        message: newlyFollowed ? "Successfully followed store." : "Already following store.",
        isFollowing,
        newlyFollowed,
        followersCount,
        storeId: target.targetId.toString(),
      },
      { headers: PRIVATE_CACHE_HEADERS }
    );
  } catch (error: any) {
    if (error?.statusCode === 400) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400, headers: PRIVATE_CACHE_HEADERS }
      );
    }
    console.error("[PUT /api/stores/[id]/follow] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to follow store." },
      { status: 500, headers: PRIVATE_CACHE_HEADERS }
    );
  }
}

/**
 * POST /api/stores/[id]/follow
 * Alias to PUT for HTTP client compatibility.
 */
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return PUT(req, context);
}

/**
 * DELETE /api/stores/[id]/follow
 * Idempotently unfollows a store.
 */
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { user, errorResponse } = await requireAuth(req);
    if (!user || errorResponse) return withPrivateCache(errorResponse!);

    const rateCheck = applyRateLimit(req, "follow_action", RATE_LIMIT_PRESETS.FOLLOW, user.id);
    if (!rateCheck.allowed) return withPrivateCache(rateCheck.response!);

    const { id: storeId } = await context.params;
    await dbConnect();

    const { target, errorResponse: valError } = await validateStoreForFollow(storeId, user.id);
    if (valError || !target || !target.targetId) return valError;

    const { isFollowing, newlyUnfollowed, followersCount } = await executeUnfollow(
      user.id,
      target.targetId,
      target.targetType
    );

    return NextResponse.json(
      {
        success: true,
        message: newlyUnfollowed ? "Successfully unfollowed store." : "Not currently following store.",
        isFollowing,
        newlyUnfollowed,
        followersCount,
        storeId: target.targetId.toString(),
      },
      { headers: PRIVATE_CACHE_HEADERS }
    );
  } catch (error: any) {
    console.error("[DELETE /api/stores/[id]/follow] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to unfollow store." },
      { status: 500, headers: PRIVATE_CACHE_HEADERS }
    );
  }
}

/**
 * GET /api/stores/[id]/follow
 * Check if authenticated user follows this store, and return live followersCount.
 * Returns private, viewer-specific isFollowing state.
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { user, errorResponse } = await requireAuth(req);
    if (!user || errorResponse) return withPrivateCache(errorResponse!);

    const { id: storeId } = await context.params;
    await dbConnect();

    const { target, errorResponse: valError } = await validateStoreForFollow(storeId, user.id);
    if (valError || !target || !target.targetId) return valError;

    const follow = await FollowerModel.findOne({
      followerId: new Types.ObjectId(user.id),
      followingId: target.targetId,
      targetType: target.targetType,
    }).lean();

    const followersCount = await FollowerModel.countDocuments({
      followingId: target.targetId,
      targetType: target.targetType,
    });

    return NextResponse.json(
      {
        success: true,
        isFollowing: Boolean(follow),
        followersCount,
        storeId: target.targetId.toString(),
      },
      { headers: PRIVATE_CACHE_HEADERS }
    );
  } catch (error: any) {
    console.error("[GET /api/stores/[id]/follow] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to check follow status." },
      { status: 500, headers: PRIVATE_CACHE_HEADERS }
    );
  }
}
