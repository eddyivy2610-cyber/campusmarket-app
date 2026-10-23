import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { requireAdmin } from "@/lib/authServer";
import BusinessApplicationModel from "@/models/BusinessApplication";
import { ListingModel } from "@/models/Listing";
import StoreModel from "@/models/Store";
import UserModel from "@/models/User";
import { isDatabaseUnavailable, databaseUnavailableResponse } from "@/lib/databaseErrors";

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
      BusinessApplicationModel.countDocuments({ status: "pending_review" }),
      BusinessApplicationModel.countDocuments({ status: "approved" }),
      ListingModel.countDocuments({ status: "pending_review" }),
      ListingModel.countDocuments({ status: "active" }),
      ListingModel.countDocuments(),
      StoreModel.countDocuments({ status: "active" }),
      StoreModel.countDocuments(),
      UserModel.countDocuments(),
      BusinessApplicationModel.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      ListingModel.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
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
    if (isDatabaseUnavailable(error)) return databaseUnavailableResponse();
    return NextResponse.json(
      { success: false, error: "Failed to load admin overview metrics." },
      { status: 500 }
    );
  }
}
