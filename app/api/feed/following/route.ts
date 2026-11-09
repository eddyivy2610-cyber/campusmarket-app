import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import dbConnect from "@/lib/dbConnect";
import FollowerModel from "@/models/Follower";
import { StoreModel, toPublicStoreDTO } from "@/models/Store";
import { ListingModel, toPublicListingDTO } from "@/models/Listing";
import { requireAuth } from "@/lib/authServer";

export const dynamic = "force-dynamic";

const PRIVATE_CACHE_HEADERS = {
  "Cache-Control": "private, no-store, must-revalidate",
};

/**
 * Decodes base64url cursor into { createdAt: string, id: ObjectId }
 */
function decodeCursor(cursorStr: string): { createdAt: string; id: Types.ObjectId } | null {
  try {
    const raw = Buffer.from(cursorStr, "base64url").toString("utf-8");
    const [timeStr, idStr] = raw.split("::");
    if (!timeStr || !idStr) return null;
    const date = new Date(timeStr);
    if (isNaN(date.getTime())) return null;
    if (!Types.ObjectId.isValid(idStr)) return null;
    return { createdAt: date.toISOString(), id: new Types.ObjectId(idStr) };
  } catch {
    return null;
  }
}

/**
 * GET /api/feed/following
 * Paginated feed of active listings from followed stores.
 * Uses strict compound cursor pagination { createdAt: -1, _id: -1 }.
 * Never exposes seller personal user fields (sellerId, sellerName, sellerHandle).
 */
export async function GET(req: NextRequest) {
  try {
    const { user, errorResponse } = await requireAuth(req);
    if (!user || errorResponse) return errorResponse;

    const { searchParams } = new URL(req.url);
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10) || 20));
    const cursor = searchParams.get("cursor");
    const listingType = searchParams.get("type"); // optional: "product" | "service"

    await dbConnect();

    const followerObjectId = new Types.ObjectId(user.id);

    // 1. Fetch followed stores
    const follows = await FollowerModel.find({
      followerId: followerObjectId,
      targetType: "store",
    })
      .select("followingId")
      .lean();

    if (follows.length === 0) {
      return NextResponse.json(
        {
          success: true,
          count: 0,
          hasMore: false,
          nextCursor: null,
          data: [],
          listings: [],
        },
        { headers: PRIVATE_CACHE_HEADERS }
      );
    }

    const followedStoreIds = follows.map((f) => f.followingId);

    // 2. Validate stores: only include active stores
    const activeStores = await StoreModel.find({
      _id: { $in: followedStoreIds },
      status: "active",
    }).lean();

    if (activeStores.length === 0) {
      return NextResponse.json(
        {
          success: true,
          count: 0,
          hasMore: false,
          nextCursor: null,
          data: [],
          listings: [],
        },
        { headers: PRIVATE_CACHE_HEADERS }
      );
    }

    const storeMap = new Map<string, any>();
    const validStoreIds: string[] = [];
    for (const s of activeStores as any[]) {
      const sid = s._id.toString();
      validStoreIds.push(sid);
      storeMap.set(sid, toPublicStoreDTO(s));
    }

    // 3. Build listing query using { storeId: 1, status: 1, createdAt: -1, _id: -1 } index
    const listingQuery: Record<string, any> = {
      storeId: { $in: validStoreIds },
      status: "active",
    };

    if (listingType && (listingType === "product" || listingType === "service")) {
      listingQuery.listingType = listingType;
    }

    if (cursor) {
      const decoded = decodeCursor(cursor);
      if (!decoded) {
        return NextResponse.json(
          { success: false, error: "Invalid pagination cursor." },
          { status: 400, headers: PRIVATE_CACHE_HEADERS }
        );
      }
      listingQuery.$or = [
        { createdAt: { $lt: decoded.createdAt } },
        {
          createdAt: decoded.createdAt,
          _id: { $lt: decoded.id },
        },
      ];
    }

    const rawListings = await ListingModel.find(listingQuery)
      .sort({ createdAt: -1, _id: -1 })
      .limit(limit + 1)
      .lean();

    const hasMore = rawListings.length > limit;
    const items = hasMore ? rawListings.slice(0, limit) : rawListings;

    let nextCursor: string | null = null;
    if (hasMore && items.length > 0) {
      const last = items[items.length - 1];
      nextCursor = Buffer.from(`${new Date(last.createdAt).toISOString()}::${last._id.toString()}`).toString("base64url");
    }

    const listings = items.map((l: any) => {
      const storeDto = storeMap.get(String(l.storeId)) || null;
      return toPublicListingDTO(l, storeDto);
    });

    return NextResponse.json(
      {
        success: true,
        count: listings.length,
        hasMore,
        nextCursor,
        data: listings,
        listings,
      },
      { headers: PRIVATE_CACHE_HEADERS }
    );
  } catch (error: any) {
    console.error("[GET /api/feed/following] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to retrieve following feed." },
      { status: 500, headers: PRIVATE_CACHE_HEADERS }
    );
  }
}
