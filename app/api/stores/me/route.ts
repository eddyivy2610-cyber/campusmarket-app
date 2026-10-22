import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import StoreModel from "@/models/Store";
import BusinessApplicationModel from "@/models/BusinessApplication";
import {
  requireAuth,
  checkStudentVendorEligibility,
} from "@/lib/authServer";

/**
 * GET /api/stores/me
 * Returns current user's storefront, vendor eligibility, and application status.
 */
export async function GET(req: NextRequest) {
  try {
    const { user, errorResponse } = await requireAuth(req);
    if (!user || errorResponse) return errorResponse;

    await dbConnect();

    // 1. Find store owned by user
    const store = await StoreModel.findOne({ ownerId: user.id }).lean();

    // 2. Check student eligibility
    const studentEligibility = await checkStudentVendorEligibility(user);

    // 3. Find any business application submitted by user
    const application = await BusinessApplicationModel.findOne({
      applicantId: user.id,
    })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: {
        hasStore: Boolean(store),
        store: store || null,
        studentEligibility: {
          eligible: studentEligibility.eligible,
          reason: studentEligibility.reason || null,
        },
        businessApplication: application || null,
      },
    });
  } catch (error: any) {
    console.error("[GET /api/stores/me] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve store profile." },
      { status: 500 }
    );
  }
}
