import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import dbConnect from "@/lib/dbConnect";
import FollowerModel from "@/models/Follower";
import { StoreModel } from "@/models/Store";
import { requireAuth } from "@/lib/authServer";
import { executeFollow, executeUnfollow } from "@/lib/followHelpers";
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
 * - Non-existent, suspended, banned or removed stores return 404.
 * - Store owner cannot follow their own store (returns 400).
 */
async function validateStoreForFollow(storeId: string, currentUserId: string) {
  if (!storeId || !Types.ObjectId.isValid(storeId)) {
    return { errorResponse: NextResponse.json({ success: false, error: "Store not found." }, { status: 404, headers: PRIVATE_CACHE_HEADERS }) };
  }

  const store = await StoreModel.findById(storeId).lean();
  if (!store) {
    return { errorResponse: NextResponse.json({ success: false, error: "Store not found." }, { status: 404, headers: PRIVATE_CACHE_HEADERS }) };
  }

  // Suspended, rejected, or non-active stores return 404
  if (store.status !== "active") {
    return { errorResponse: NextResponse.json({ success: false, error: "Store not found." }, { status: 404, headers: PRIVATE_CACHE_HEADERS }) };
  }

  // Owner self-follow restriction
  if (store.ownerId && store.ownerId.toString() === currentUserId) {
    return { errorResponse: NextResponse.json({ success: false, error: "You cannot follow your own store." }, { status: 400, headers: PRIVATE_CACHE_HEADERS }) };
  }

  return { store };
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

    const { store, errorResponse: valError } = await validateStoreForFollow(storeId, user.id);
    if (valError || !store) return valError;

    const { isFollowing, newlyFollowed } = await executeFollow(
      user.id,
      store._id as Types.ObjectId,
      "store",
      { name: user.name, handle: user.email?.split("@")[0] }
    );

    return NextResponse.json(
      {
        success: true,
        message: newlyFollowed ? "Successfully followed store." : "Already following store.",
        isFollowing,
        newlyFollowed,
        storeId: store._id.toString(),
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

    if (!storeId || !Types.ObjectId.isValid(storeId)) {
      return NextResponse.json(
        { success: false, error: "Store not found." },
        { status: 404, headers: PRIVATE_CACHE_HEADERS }
      );
    }

    const { isFollowing, newlyUnfollowed } = await executeUnfollow(
      user.id,
      new Types.ObjectId(storeId),
      "store"
    );

    return NextResponse.json(
      {
        success: true,
        message: newlyUnfollowed ? "Successfully unfollowed store." : "Not currently following store.",
        isFollowing,
        newlyUnfollowed,
        storeId,
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
 * Check if authenticated user follows this store.
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

    if (!storeId || !Types.ObjectId.isValid(storeId)) {
      return NextResponse.json(
        { success: false, error: "Store not found." },
        { status: 404, headers: PRIVATE_CACHE_HEADERS }
      );
    }

    const follow = await FollowerModel.findOne({
      followerId: new Types.ObjectId(user.id),
      followingId: new Types.ObjectId(storeId),
      targetType: "store",
    }).lean();

    return NextResponse.json(
      {
        success: true,
        isFollowing: Boolean(follow),
        storeId,
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
