import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { requireAdmin } from "@/lib/authServer";
import BusinessApplicationModel from "@/models/BusinessApplication";
import { ListingModel } from "@/models/Listing";
import StoreModel from "@/models/Store";
import UserModel from "@/models/User";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/overview
 * Real-time database metrics for the admin overview dashboard.
 */
export async function GET(req: NextRequest) {
  try {
    const { admin, errorResponse } = await requireAdmin(req);
    if (!admin || errorResponse) return errorResponse;

    await dbConnect();

    // Fetch counts in parallel from real MongoDB collections
    const [
      pendingApplications,
      approvedApplications,
      pendingListings,
      activeListings,
      totalListings,
      activeStores,
      totalStores,
      registeredUsers,
      recentApplications,
      recentListings,
    ] = await Promise.all([
      BusinessApplicationModel.countDocuments({ status: "pending_review" }).catch(() => 0),
      BusinessApplicationModel.countDocuments({ status: "approved" }).catch(() => 0),
      ListingModel.countDocuments({ status: "pending_review" }).catch(() => 0),
      ListingModel.countDocuments({ status: "active" }).catch(() => 0),
      ListingModel.countDocuments().catch(() => 0),
      StoreModel.countDocuments({ status: "active" }).catch(() => 0),
      StoreModel.countDocuments().catch(() => 0),
      UserModel.countDocuments().catch(() => 0),
      BusinessApplicationModel.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .lean()
        .catch(() => []),
      ListingModel.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .lean()
        .catch(() => []),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          pendingApplications,
          approvedApplications,
          pendingListings,
          activeListings,
          totalListings,
          activeStores,
          totalStores,
          registeredUsers,
        },
        recentApplications,
        recentListings,
      },
    });
  } catch (error: any) {
    console.error("[GET /api/admin/overview] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load admin overview metrics." },
      { status: 500 }
    );
  }
}
