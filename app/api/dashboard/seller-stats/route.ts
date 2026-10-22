import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import { requireAuth, requireAdmin } from "@/lib/authServer";
import { ListingModel } from "@/models/Listing";
import { OrderModel } from "@/models/Order";
import { StoreModel } from "@/models/Store";
import { FollowerModel } from "@/models/Follower";
import UserModel from "@/models/User";
import { ORDER_STATUSES, OrderStatus } from "@/constants/enums";

export const dynamic = "force-dynamic";

/**
 * GET /api/dashboard/seller-stats
 * Canonical seller dashboard statistics endpoint.
 *
 * Security & Ownership:
 * - Requires authenticated session (HTTP 401 if missing).
 * - Enforces live account-status check (HTTP 403 if suspended/inactive).
 * - Queries session user by default. Cross-seller querying strictly requires admin role.
 * - Enforces Cache-Control: private, no-store.
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    await dbConnect();

    // 1. Authenticate session & enforce live account status
    const { user, errorResponse } = await requireAuth(req);
    if (!user || errorResponse) {
      return (
        errorResponse ||
        NextResponse.json(
          { success: false, error: "Authentication required to perform this action." },
          { status: 401 }
        )
      );
    }

    const { searchParams } = new URL(req.url);
    const requestedSellerId = searchParams.get("sellerId");

    let targetSellerId = user.id;

    // 2. Cross-seller inspection authorization check
    if (requestedSellerId && requestedSellerId !== user.id) {
      const { admin, errorResponse: adminErr } = await requireAdmin(req);
      if (!admin || adminErr) {
        return NextResponse.json(
          {
            success: false,
            error: "Forbidden: You do not have permission to access another seller's statistics.",
          },
          { status: 403 }
        );
      }
      targetSellerId = requestedSellerId;
    }

    // 3. Listings Aggregation (single pipeline with zero COLLSCAN)
    const [listingSummary] = await ListingModel.aggregate([
      { $match: { sellerId: targetSellerId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] } },
          inactive: { $sum: { $cond: [{ $ne: ["$status", "active"] }, 1, 0] } },
          products: { $sum: { $cond: [{ $eq: ["$listingType", "product"] }, 1, 0] } },
          services: { $sum: { $cond: [{ $eq: ["$listingType", "service"] }, 1, 0] } },
          totalViews: { $sum: { $ifNull: ["$views", 0] } },
        },
      },
    ]);

    const categoryBreakdown = await ListingModel.aggregate([
      { $match: { sellerId: targetSellerId } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $project: { category: "$_id", count: 1, _id: 0 } },
      { $sort: { count: -1 } },
    ]);

    const listings = {
      total: listingSummary?.total ?? 0,
      active: listingSummary?.active ?? 0,
      inactive: listingSummary?.inactive ?? 0,
      products: listingSummary?.products ?? 0,
      services: listingSummary?.services ?? 0,
      categories: categoryBreakdown,
    };

    // 4. Orders Aggregation (by canonical status state machine)
    const sellerObjectId = mongoose.isValidObjectId(targetSellerId)
      ? new mongoose.Types.ObjectId(targetSellerId)
      : targetSellerId;
    const sellerMatchQuery = mongoose.isValidObjectId(targetSellerId)
      ? { $in: [targetSellerId, sellerObjectId] }
      : targetSellerId;

    const orderGroups: Array<{ _id: string; count: number; totalAmount: number }> =
      await OrderModel.aggregate([
        { $match: { sellerId: sellerMatchQuery } },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            totalAmount: { $sum: "$totalAmount" },
          },
        },
      ]);

    // Initialize all 7 status buckets strictly to 0
    const byStatus: Record<OrderStatus, number> = {
      pending: 0,
      confirmed: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      disputed: 0,
    };

    let totalOrders = 0;
    let completedOrderValue = 0;
    let activeOrderValue = 0;

    orderGroups.forEach((group) => {
      const statusKey = group._id as OrderStatus;
      if (statusKey in byStatus) {
        byStatus[statusKey] = group.count;
      }
      totalOrders += group.count;

      if (statusKey === "delivered") {
        completedOrderValue += group.totalAmount || 0;
      } else if (
        statusKey === "pending" ||
        statusKey === "confirmed" ||
        statusKey === "processing" ||
        statusKey === "shipped"
      ) {
        activeOrderValue += group.totalAmount || 0;
      }
    });

    const activeOrdersCount =
      byStatus.pending + byStatus.confirmed + byStatus.processing + byStatus.shipped;
    const completedOrdersCount = byStatus.delivered;
    const cancelledOrdersCount = byStatus.cancelled;
    const disputedOrdersCount = byStatus.disputed;

    // 5. Store Association & Stored Counters Reconciliation
    const store = await StoreModel.findOne({ ownerId: targetSellerId }).lean();
    let storeInfo = {
      hasStore: false,
      storeId: null as string | null,
      storeName: null as string | null,
      storeRating: 5.0,
      storedListingsCount: 0,
      driftDetected: false,
    };

    const followingIds = [targetSellerId];

    if (store) {
      const storedCount = store.metrics?.listingsCount ?? 0;
      storeInfo = {
        hasStore: true,
        storeId: store._id.toString(),
        storeName: store.name,
        storeRating: store.metrics?.rating ?? 5.0,
        storedListingsCount: storedCount,
        driftDetected: storedCount !== listings.active,
      };
      followingIds.push(store._id.toString());
    }

    // 6. Audience & Impressions
    const followersCount = await FollowerModel.countDocuments({
      followingId: { $in: followingIds },
    });

    const audience = {
      followersCount,
      impressions: listingSummary?.totalViews ?? 0,
    };

    // 7. Recent Order Activity (Bounded to 10 records, strict privacy)
    const recentOrders = await OrderModel.find(
      { sellerId: sellerMatchQuery },
      { orderId: 1, status: 1, totalAmount: 1, items: 1, createdAt: 1, buyerId: 1 }
    )
      .sort({ createdAt: -1, _id: -1 })
      .limit(10)
      .lean();

    // Populate buyer display name securely without exposing email or phone numbers
    const buyerIds = Array.from(new Set(recentOrders.map((o: any) => o.buyerId).filter(Boolean)));
    const buyers = await UserModel.find(
      { _id: { $in: buyerIds } },
      { name: 1, "profile.displayName": 1 }
    ).lean();

    const buyerNameMap = new Map<string, string>();
    buyers.forEach((b: any) => {
      buyerNameMap.set(b._id.toString(), b.profile?.displayName || b.name || "Campus Buyer");
    });

    const recentActivity = recentOrders.map((o: any) => {
      const firstItemTitle = o.items?.[0]?.title || "Campus Item";
      const extraItems = (o.items?.length || 1) - 1;
      const itemSummary = extraItems > 0 ? `${firstItemTitle} +${extraItems} more` : firstItemTitle;

      return {
        id: o._id.toString(),
        orderId: o.orderId,
        status: o.status,
        totalAmount: o.totalAmount,
        priceFormatted: `₦${Number(o.totalAmount || 0).toLocaleString()}`,
        itemSummary,
        buyerDisplayName: buyerNameMap.get(o.buyerId?.toString()) || "Campus Buyer",
        createdAt: o.createdAt,
      };
    });

    // 8. Top Performing Items
    const topItemsDocs = await ListingModel.find({ sellerId: targetSellerId })
      .sort({ views: -1, _id: -1 })
      .limit(4)
      .select("title views price priceFormatted images category status")
      .lean();

    const topItems = topItemsDocs.map((item: any) => ({
      id: item._id.toString(),
      title: item.title,
      views: item.views || 0,
      price: item.price,
      priceFormatted: item.priceFormatted || `₦${Number(item.price || 0).toLocaleString()}`,
      image: item.images?.[0] || "",
      category: item.category,
      status: item.status,
    }));

    const responsePayload = {
      success: true,
      data: {
        sellerId: targetSellerId,
        generatedAt: new Date().toISOString(),
        listings,
        orders: {
          totalOrders,
          byStatus,
          activeOrdersCount,
          completedOrdersCount,
          cancelledOrdersCount,
          disputedOrdersCount,
        },
        orderValue: {
          completedOrderValue,
          completedOrderValueFormatted: `₦${completedOrderValue.toLocaleString()}`,
          activeOrderValue,
          activeOrderValueFormatted: `₦${activeOrderValue.toLocaleString()}`,
          currency: "NGN",
        },
        audience,
        store: storeInfo,
        recentActivity,
        topItems,
      },
    };

    const res = NextResponse.json(responsePayload);
    // Personalized seller statistics: strictly private, zero public caching
    res.headers.set(
      "Cache-Control",
      "private, no-cache, no-store, max-age=0, must-revalidate"
    );
    return res;
  } catch (error: any) {
    console.error("[GET /api/dashboard/seller-stats] Internal error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load seller statistics." },
      { status: 500 }
    );
  }
}
