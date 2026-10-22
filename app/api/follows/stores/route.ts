import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import dbConnect from "@/lib/dbConnect";
import FollowerModel from "@/models/Follower";
import { StoreModel } from "@/models/Store";
import { requireAuth } from "@/lib/authServer";

export const dynamic = "force-dynamic";

const PRIVATE_CACHE_HEADERS = {
  "Cache-Control": "private, no-store, must-revalidate",
};

/**
 * GET /api/follows/stores
 * Returns a paginated list of active, visible stores followed by the authenticated user.
 * Strictly filters out non-active stores (suspended, banned, removed, paused).
 * Never exposes follower identities, emails or tokens.
 */
export async function GET(req: NextRequest) {
  try {
    const { user, errorResponse } = await requireAuth(req);
    if (!user || errorResponse) return errorResponse;

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10) || 20));
    const cursor = searchParams.get("cursor"); // Optional opaque base64 cursor

    await dbConnect();

    const followerObjectId = new Types.ObjectId(user.id);

    // 1. Fetch all store IDs followed by this user
    // Query uses compound index { followerId: 1, targetType: 1, createdAt: -1, _id: -1 }
    const followQuery: Record<string, any> = {
      followerId: followerObjectId,
      targetType: "store",
    };

    if (cursor) {
      try {
        const decoded = Buffer.from(cursor, "base64url").toString("utf-8");
        const [cursorTime, cursorId] = decoded.split("::");
        if (cursorTime && cursorId && Types.ObjectId.isValid(cursorId)) {
          followQuery.$or = [
            { createdAt: { $lt: new Date(cursorTime) } },
            {
              createdAt: new Date(cursorTime),
              _id: { $lt: new Types.ObjectId(cursorId) },
            },
          ];
        }
      } catch {
        return NextResponse.json(
          { success: false, error: "Invalid cursor." },
          { status: 400, headers: PRIVATE_CACHE_HEADERS }
        );
      }
    }

    // 2. We resolve followed store records and join active stores
    // Using aggregation with $lookup to ensure filtering before page cutting
    const pipeline: any[] = [
      { $match: followQuery },
      { $sort: { createdAt: -1, _id: -1 } },
      {
        $lookup: {
          from: "stores",
          localField: "followingId",
          foreignField: "_id",
          as: "store",
        },
      },
      { $unwind: "$store" },
      // Strict visibility rule: only active stores appear in following list
      { $match: { "store.status": "active" } },
      { $limit: limit + 1 }, // Fetch 1 extra to determine hasNextPage
      {
        $project: {
          _id: 1,
          createdAt: 1,
          store: {
            _id: "$store._id",
            name: "$store.name",
            slug: "$store.slug",
            description: "$store.description",
            logo: "$store.logo",
            banner: "$store.banner",
            campus: "$store.campus",
            campusCity: "$store.campusCity",
            category: "$store.category",
            isVerified: "$store.isVerified",
            metrics: {
              rating: "$store.metrics.rating",
              reviewsCount: "$store.metrics.reviewsCount",
              listingsCount: "$store.metrics.listingsCount",
              followersCount: "$store.metrics.followersCount",
            },
          },
        },
      },
    ];

    const results = await FollowerModel.aggregate(pipeline);
    const hasMore = results.length > limit;
    const items = hasMore ? results.slice(0, limit) : results;

    let nextCursor: string | null = null;
    if (hasMore && items.length > 0) {
      const lastItem = items[items.length - 1];
      nextCursor = Buffer.from(`${new Date(lastItem.createdAt).toISOString()}::${lastItem._id.toString()}`).toString("base64url");
    }

    const stores = items.map((item) => ({
      followId: item._id.toString(),
      followedAt: item.createdAt,
      store: {
        ...item.store,
        _id: item.store._id.toString(),
      },
    }));

    return NextResponse.json(
      {
        success: true,
        count: stores.length,
        hasMore,
        nextCursor,
        stores,
        data: stores,
      },
      { headers: PRIVATE_CACHE_HEADERS }
    );
  } catch (error: any) {
    console.error("[GET /api/follows/stores] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to retrieve followed stores." },
      { status: 500, headers: PRIVATE_CACHE_HEADERS }
    );
  }
}
