import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import { requireAuth, requireAdmin } from "@/lib/authServer";
import { ListingModel } from "@/models/Listing";
import { OrderModel } from "@/models/Order";
import { StoreModel } from "@/models/Store";
import { FollowerModel } from "@/models/Follower";
import UserModel, { formatMinimalBuyerIdentity } from "@/models/User";
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
 * - Optional ?storeId= parameter scopes stats to a single store owned by targetSellerId.
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
    const requestedStoreId = searchParams.get("storeId")?.trim() || null;

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

    // 3. Store Association & Multi-Store Ownership Verification
    const ownedStores = await StoreModel.find({
      ownerId: targetSellerId,
      status: { $ne: "deleted" },
    })
      .sort({ createdAt: 1 })
      .lean();

    let selectedStore: any = null;
    if (requestedStoreId) {
      selectedStore = ownedStores.find(
        (s: any) => s._id.toString() === requestedStoreId || s.slug === requestedStoreId
      );
      if (!selectedStore) {
        return NextResponse.json(
          {
            success: false,
            error: "Forbidden: Store not found or does not belong to this seller.",
          },
          { status: 403 }
        );
      }
    } else if (ownedStores.length > 0) {
      selectedStore =
        ownedStores.find((s: any) => s.status === "active") || ownedStores[0];
    }

    const scopedStoreId = requestedStoreId && selectedStore ? selectedStore._id.toString() : null;
    const listingMatchQuery: Record<string, any> = { sellerId: targetSellerId };
    if (scopedStoreId) {
      listingMatchQuery.storeId = scopedStoreId;
    }

    // 4. Listings Aggregation (single pipeline with zero COLLSCAN)
    const [listingSummary] = await ListingModel.aggregate([
      { $match: listingMatchQuery },
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
      { $match: listingMatchQuery },
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

    // 5. Orders Aggregation (by canonical status state machine)
    const sellerObjectId = mongoose.isValidObjectId(targetSellerId)
      ? new mongoose.Types.ObjectId(targetSellerId)
      : targetSellerId;
    const sellerMatchQuery = mongoose.isValidObjectId(targetSellerId)
      ? { $in: [targetSellerId, sellerObjectId] }
      : targetSellerId;

    const orderMatchFilter: Record<string, any> = { sellerId: sellerMatchQuery };
    if (scopedStoreId) {
      orderMatchFilter.storeId = mongoose.isValidObjectId(scopedStoreId)
        ? { $in: [scopedStoreId, new mongoose.Types.ObjectId(scopedStoreId)] }
        : scopedStoreId;
    }

    const orderGroups: Array<{ _id: string; count: number; totalAmount: number }> =
      await OrderModel.aggregate([
        { $match: orderMatchFilter },
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

    // 6. Stored Counters Reconciliation
    let storeInfo = {
      hasStore: false,
      storeId: null as string | null,
      storeName: null as string | null,
      storeRating: 5.0,
      storedListingsCount: 0,
      driftDetected: false,
    };

    const followingIds: string[] = scopedStoreId
      ? [scopedStoreId]
      : [targetSellerId, ...ownedStores.map((s: any) => s._id.toString())];

    if (selectedStore) {
      const storedCount = selectedStore.metrics?.listingsCount ?? 0;
      const selectedStoreActiveCount = scopedStoreId
        ? listings.active
        : await ListingModel.countDocuments({
            storeId: selectedStore._id.toString(),
            status: "active",
          });
      storeInfo = {
        hasStore: true,
        storeId: selectedStore._id.toString(),
        storeName: selectedStore.name,
        storeRating: selectedStore.metrics?.rating ?? 5.0,
        storedListingsCount: storedCount,
        driftDetected: storedCount !== selectedStoreActiveCount,
      };
    }

    // 7. Audience & Impressions
    const followersCount = await FollowerModel.countDocuments({
      followingId: { $in: followingIds },
    });

    const audience = {
      followersCount,
      impressions: listingSummary?.totalViews ?? 0,
    };

    // 8. Recent Order Activity (Bounded to 10 records, strict privacy)
    const recentOrders = await OrderModel.find(
      orderMatchFilter,
      { orderId: 1, storeId: 1, status: 1, totalAmount: 1, items: 1, createdAt: 1, buyerId: 1 }
    )
      .sort({ createdAt: -1, _id: -1 })
      .limit(10)
      .lean();

    // Populate buyer minimal identity without exposing email, phone, or full last name
    const buyerIds = Array.from(new Set(recentOrders.map((o: any) => o.buyerId).filter(Boolean)));
    const buyers = await UserModel.find(
      { _id: { $in: buyerIds } },
      { name: 1, "profile.displayName": 1, "profile.avatar": 1 }
    ).lean();

    const buyerNameMap = new Map<string, string>();
    buyers.forEach((b: any) => {
      const minimal = formatMinimalBuyerIdentity(b);
      buyerNameMap.set(b._id.toString(), minimal.displayName);
    });

    const recentActivity = recentOrders.map((o: any) => {
      const firstItemTitle = o.items?.[0]?.title || "Campus Item";
      const extraItems = (o.items?.length || 1) - 1;
      const itemSummary = extraItems > 0 ? `${firstItemTitle} +${extraItems} more` : firstItemTitle;

      return {
        id: o._id.toString(),
        orderId: o.orderId,
        storeId: o.storeId || null,
        status: o.status,
        totalAmount: o.totalAmount,
        priceFormatted: `₦${Number(o.totalAmount || 0).toLocaleString()}`,
        itemSummary,
        buyerDisplayName: buyerNameMap.get(o.buyerId?.toString()) || "Campus Buyer",
        createdAt: o.createdAt,
      };
    });

    // 9. Top Performing Items
    const topItemsDocs = await ListingModel.find(listingMatchQuery)
      .sort({ views: -1, _id: -1 })
      .limit(4)
      .select("title views price priceFormatted images category status storeId")
      .lean();

    const topItems = topItemsDocs.map((item: any) => ({
      id: item._id.toString(),
      storeId: item.storeId,
      title: item.title,
      views: item.views || 0,
      price: item.price,
      priceFormatted: item.priceFormatted || `₦${Number(item.price || 0).toLocaleString()}`,
      image: item.images?.[0] || "",
      category: item.category,
      status: item.status,
    }));

    const storesList = ownedStores.map((s: any) => ({
      id: s._id.toString(),
      name: s.name,
      slug: s.slug,
      storeType: s.storeType,
      status: s.status,
      rating: s.metrics?.rating ?? 5.0,
      listingsCount: s.metrics?.listingsCount ?? 0,
    }));

    const responsePayload = {
      success: true,
      data: {
        sellerId: targetSellerId,
        scopedStoreId,
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
        stores: storesList,
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
