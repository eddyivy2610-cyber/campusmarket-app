import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { requireAdmin } from "@/lib/authServer";
import UserModel from "@/models/User";
import StoreModel from "@/models/Store";
import { ListingModel } from "@/models/Listing";
import OrderModel from "@/models/Order";
import ReportModel from "@/models/Report";
import ReviewModel from "@/models/Review";
import BusinessApplicationModel from "@/models/BusinessApplication";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/analytics
 * Real-time platform-wide aggregations across users, multi-stores, listings, orders, disputes, and trust queues.
 */
export async function GET(req: NextRequest) {
  try {
    const { admin, errorResponse } = await requireAdmin(req);
    if (!admin || errorResponse) return errorResponse;

    await dbConnect();

    const [
      totalUsers,
      verifiedStudents,
      sellerUsers,
      suspendedUsers,
      multiStoreUsers,
      totalStores,
      activeStores,
      studentStores,
      businessStores,
      suspendedStores,
      totalListings,
      activeListings,
      pendingListings,
      listingsByCategory,
      listingsByCampus,
      totalOrders,
      deliveredOrdersAgg,
      disputedOrders,
      pendingOrders,
      pendingReports,
      resolvedReports,
      pendingApplications,
      totalReviews,
      flaggedReviews,
      topStores,
    ] = await Promise.all([
      UserModel.countDocuments(),
      UserModel.countDocuments({ studentVerified: true }),
      UserModel.countDocuments({ $or: [{ role: "seller" }, { storesCount: { $gt: 0 } }] }),
      UserModel.countDocuments({ accountStatus: { $in: ["suspended", "banned"] } }),
      UserModel.countDocuments({ storesCount: { $gt: 1 } }),
      StoreModel.countDocuments({ status: { $ne: "deleted" } }),
      StoreModel.countDocuments({ status: "active" }),
      StoreModel.countDocuments({ storeType: "student_store", status: { $ne: "deleted" } }),
      StoreModel.countDocuments({ storeType: "local_business", status: { $ne: "deleted" } }),
      StoreModel.countDocuments({ status: { $in: ["suspended", "paused"] } }),
      ListingModel.countDocuments(),
      ListingModel.countDocuments({ status: "active" }),
      ListingModel.countDocuments({ status: "pending_review" }),
      ListingModel.aggregate([
        { $match: { status: "active" } },
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 },
      ]),
      ListingModel.aggregate([
        { $match: { status: "active" } },
        { $group: { _id: "$campus", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 },
      ]),
      OrderModel.countDocuments(),
      OrderModel.aggregate([
        { $match: { status: "delivered" } },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            gmv: { $sum: "$totalAmount" },
          },
        },
      ]),
      OrderModel.countDocuments({ status: "disputed" }),
      OrderModel.countDocuments({ status: { $in: ["pending", "confirmed", "processing", "shipped"] } }),
      ReportModel.countDocuments({ status: { $in: ["pending", "in_review"] } }),
      ReportModel.countDocuments({ status: "resolved" }),
      BusinessApplicationModel.countDocuments({ status: "pending_review" }),
      ReviewModel.countDocuments({ status: "published" }),
      ReviewModel.countDocuments({ status: "flagged" }),
      StoreModel.find({ status: "active" })
        .sort({ "metrics.rating": -1, "metrics.listingsCount": -1 })
        .limit(5)
        .select("_id storeName name slug storeType campus isVerified metrics")
        .lean(),
    ]);

    const deliveredStats = deliveredOrdersAgg?.[0] || { count: 0, gmv: 0 };

    return NextResponse.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          verifiedStudents,
          sellers: sellerUsers,
          multiStoreOwners: multiStoreUsers,
          suspendedOrBanned: suspendedUsers,
        },
        stores: {
          total: totalStores,
          active: activeStores,
          studentStores,
          businessStores,
          suspendedOrBanned: suspendedStores,
        },
        listings: {
          total: totalListings,
          active: activeListings,
          pendingReview: pendingListings,
          byCategory: listingsByCategory.map((c: any) => ({
            category: c._id || "Uncategorized",
            count: c.count,
          })),
          byCampus: listingsByCampus.map((c: any) => ({
            campus: c._id || "General",
            count: c.count,
          })),
        },
        orders: {
          total: totalOrders,
          delivered: deliveredStats.count,
          completedGmv: deliveredStats.gmv,
          inProgress: pendingOrders,
          disputed: disputedOrders,
        },
        moderation: {
          pendingReports,
          resolvedReports,
          pendingBusinessApplications: pendingApplications,
          pendingListings,
          publishedReviews: totalReviews,
          flaggedReviews,
        },
        topStores: topStores.map((s: any) => ({
          _id: String(s._id),
          storeName: s.storeName || s.name || "Store",
          slug: s.slug,
          storeType: s.storeType,
          campus: s.campus,
          isVerified: Boolean(s.isVerified),
          metrics: s.metrics || { rating: 0, reviewsCount: 0, listingsCount: 0 },
        })),
      },
    });
  } catch (error: any) {
    console.error("[GET /api/admin/analytics] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load platform analytics." },
      { status: 500 }
    );
  }
}
