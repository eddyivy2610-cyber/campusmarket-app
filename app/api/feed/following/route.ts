import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import dbConnect from "@/lib/dbConnect";
import FollowerModel from "@/models/Follower";
import { StoreModel } from "@/models/Store";
import { ListingModel } from "@/models/Listing";
import UserModel from "@/models/User";
import { requireAuth } from "@/lib/authServer";

export const dynamic = "force-dynamic";

const PRIVATE_CACHE_HEADERS = {
  "Cache-Control": "private, no-store, must-revalidate",
};

/**
 * Decodes base64url cursor into { createdAt: Date, id: ObjectId }
 */
function decodeCursor(cursorStr: string): { createdAt: Date; id: Types.ObjectId } | null {
  try {
    const raw = Buffer.from(cursorStr, "base64url").toString("utf-8");
    const [timeStr, idStr] = raw.split("::");
    if (!timeStr || !idStr) return null;
    const date = new Date(timeStr);
    if (isNaN(date.getTime())) return null;
    if (!Types.ObjectId.isValid(idStr)) return null;
    return { createdAt: date, id: new Types.ObjectId(idStr) };
  } catch {
    return null;
  }
}

/**
 * GET /api/feed/following
 * Paginated feed of active listings from followed stores and sellers.
 * Uses strict compound cursor pagination { createdAt: -1, _id: -1 }.
 * Filters out listings from suspended stores before pagination.
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

    // 1. Fetch followed stores and users
    const follows = await FollowerModel.find({ followerId: followerObjectId })
      .select("followingId targetType")
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

    const followedStoreIds = follows
      .filter((f) => f.targetType === "store")
      .map((f) => f.followingId);

    const followedUserIds = follows
      .filter((f) => f.targetType === "user")
      .map((f) => f.followingId);

    // 2. Validate stores: only include active stores (not suspended, paused, or removed)
    let validStoreIds: string[] = [];
    if (followedStoreIds.length > 0) {
      const activeStores = await StoreModel.find({
        _id: { $in: followedStoreIds },
        status: "active",
      })
        .select("_id")
        .lean();
      validStoreIds = activeStores.map((s) => s._id.toString());
    }

    // Also find any stores owned by followed sellers
    let validSellerIds: string[] = [];
    if (followedUserIds.length > 0) {
      const activeUsers = await UserModel.find({
        _id: { $in: followedUserIds },
        accountStatus: { $ne: "suspended" },
      })
        .select("_id")
        .lean();
      validSellerIds = activeUsers.map((u) => u._id.toString());
    }

    // Target match conditions
    const targetConditions: any[] = [];
    if (validStoreIds.length > 0) {
      targetConditions.push({ storeId: { $in: validStoreIds } });
    }
    if (validSellerIds.length > 0) {
      targetConditions.push({ sellerId: { $in: validSellerIds } });
    }

    if (targetConditions.length === 0) {
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

    // 3. Build listing query
    const listingQuery: Record<string, any> = {
      status: "active",
      $or: targetConditions,
    };

    if (listingType && (listingType === "product" || listingType === "service")) {
      listingQuery.listingType = listingType;
    }

    // Cursor pagination keyset seek
    if (cursor) {
      const decoded = decodeCursor(cursor);
      if (!decoded) {
        return NextResponse.json(
          { success: false, error: "Invalid pagination cursor." },
          { status: 400, headers: PRIVATE_CACHE_HEADERS }
        );
      }
      listingQuery.$and = [
        {
          $or: [
            { createdAt: { $lt: decoded.createdAt } },
            {
              createdAt: decoded.createdAt,
              _id: { $lt: decoded.id },
            },
          ],
        },
      ];
    }

    // Fetch limit + 1 to determine hasMore
    const rawListings = await ListingModel.find(listingQuery)
      .sort({ createdAt: -1, _id: -1 })
      .limit(limit + 1)
      .populate({
        path: "storeId",
        select: "name slug logo campus isVerified status",
      })
      .populate({
        path: "sellerId",
        select: "name profile.displayName profile.avatar profile.handle",
      })
      .lean();

    const hasMore = rawListings.length > limit;
    const items = hasMore ? rawListings.slice(0, limit) : rawListings;

    let nextCursor: string | null = null;
    if (hasMore && items.length > 0) {
      const last = items[items.length - 1];
      nextCursor = Buffer.from(`${new Date(last.createdAt).toISOString()}::${last._id.toString()}`).toString("base64url");
    }

    const listings = items.map((l: any) => ({
      _id: l._id.toString(),
      id: l._id.toString(),
      title: l.title,
      price: l.price,
      currency: l.currency || "NGN",
      category: l.category,
      listingType: l.listingType,
      images: l.images,
      location: l.location,
      campus: l.campus,
      status: l.status,
      condition: l.condition,
      sellerId: l.sellerId?._id ? l.sellerId._id.toString() : l.sellerId,
      sellerName: l.sellerId?.profile?.displayName || l.sellerId?.name || "Campus Seller",
      sellerHandle: l.sellerId?.profile?.handle,
      storeId: l.storeId?._id ? l.storeId._id.toString() : l.storeId,
      store: l.storeId?._id
        ? {
            _id: l.storeId._id.toString(),
            name: l.storeId.name,
            slug: l.storeId.slug,
            logo: l.storeId.logo,
            campus: l.storeId.campus,
            isVerified: l.storeId.isVerified,
          }
        : null,
      createdAt: l.createdAt,
    }));

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
