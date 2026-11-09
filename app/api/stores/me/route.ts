import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import StoreModel from "@/models/Store";
import UserModel from "@/models/User";
import BusinessApplicationModel from "@/models/BusinessApplication";
import { MAX_STORES_PER_USER, MAX_STUDENT_STORES_PER_USER } from "@/constants/enums";
import {
  requireAuth,
  checkStudentVendorEligibility,
} from "@/lib/authServer";

/**
 * GET /api/stores/me
 * Returns current user's owned storefronts (up to MAX_STORES_PER_USER),
 * vendor eligibility, and business applications.
 */
export async function GET(req: NextRequest) {
  try {
    const { user, errorResponse } = await requireAuth(req);
    if (!user || errorResponse) return errorResponse;

    await dbConnect();

    // 1. Find all non-deleted stores owned by user
    const rawStores: any[] = await StoreModel.find({
      ownerId: user.id,
      status: { $ne: "deleted" },
    })
      .sort({ createdAt: 1 })
      .lean();

    // 2. Resolve store avatar from user profile if store logo is not set
    const userDoc = await UserModel.findById(user.id).select("profile avatar image").lean();
    const fallbackAvatar =
      userDoc?.profile?.avatar || (userDoc as any)?.avatar || (userDoc as any)?.image || "";

    const stores = rawStores.map((s) => ({
      ...s,
      id: String(s._id || s.id),
      logo: s.logo && s.logo.trim() !== "" ? s.logo : fallbackAvatar,
    }));

    const primaryStore = stores[0] || null;
    const studentStoresCount = stores.filter((s) => s.storeType === "student_store").length;

    // 3. Check student eligibility
    const studentEligibility = await checkStudentVendorEligibility(user);

    // 4. Find business applications submitted by user
    const applications = await BusinessApplicationModel.find({
      applicantId: user.id,
    })
      .sort({ createdAt: -1 })
      .lean();

    const res = NextResponse.json({
      success: true,
      data: {
        hasStore: stores.length > 0,
        store: primaryStore,
        stores,
        storesCount: stores.length,
        studentStoresCount,
        maxStores: MAX_STORES_PER_USER,
        maxStudentStores: MAX_STUDENT_STORES_PER_USER,
        canCreateMore: stores.length < MAX_STORES_PER_USER,
        hasStudentStore: studentStoresCount >= MAX_STUDENT_STORES_PER_USER,
        userAvatar: fallbackAvatar,
        studentEligibility: {
          eligible: studentEligibility.eligible,
          reason: studentEligibility.reason || null,
        },
        businessApplication: applications[0] || null,
        applications,
      },
    });
    res.headers.set("Cache-Control", "private, no-store, must-revalidate");
    return res;
  } catch (error: any) {
    console.error("[GET /api/stores/me] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve store profile." },
      { status: 500 }
    );
  }
}
