import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import StoreModel, {
  isDuplicateOwnerError,
  sanitizeStoreInput,
  ensureStoreIndexes,
  saveStoreWithSlugRetry,
} from "@/models/Store";
import {
  requireAuth,
  requireCompletedOnboarding,
  checkStudentVendorEligibility,
} from "@/lib/authServer";
import { applyCacheHeaders, isRequestSafeForPublicCache } from "@/lib/cacheHeaders";
import { executeInTransaction } from "@/lib/transactionHelper";
import { isDatabaseUnavailable, databaseUnavailableResponse } from "@/lib/databaseErrors";

function generateSlug(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const randomSuffix = Math.random().toString(36).substring(2, 6);
  return `${base || "store"}-${randomSuffix}`;
}

/**
 * GET /api/stores
 * Public discovery endpoint: list active stores with optional filters.
 */
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    await ensureStoreIndexes();
    const { searchParams } = new URL(req.url);

    const campus = searchParams.get("campus");
    const category = searchParams.get("category");
    const query = searchParams.get("q")?.trim();
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));

    const filter: Record<string, any> = { status: "active" };

    if (campus && campus !== "All Campuses") {
      filter.campus = campus;
    }

    if (category && category !== "All") {
      filter.category = category;
    }

    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ];
    }

    const total = await StoreModel.countDocuments(filter);
    const stores = await StoreModel.find(filter)
      .sort({ "metrics.rating": -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const res = NextResponse.json({
      success: true,
      data: stores,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });

    const isPublic = isRequestSafeForPublicCache(req, { isPublicQuery: true });
    applyCacheHeaders(res, { isPublic, sMaxAge: 60, staleWhileRevalidate: 300 });

    return res;
  } catch (error: any) {
    console.error("[GET /api/stores] Error:", error);
    if (isDatabaseUnavailable(error)) return databaseUnavailableResponse();
    return NextResponse.json(
      { success: false, error: "Failed to retrieve stores." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/stores
 * Student storefront creation endpoint:
 * Enforces one storefront per account, student verification eligibility,
 * and server-controlled status transitions.
 */
export async function POST(req: NextRequest) {
  try {
    const { user, errorResponse } = await requireCompletedOnboarding(req);
    if (!user || errorResponse) return errorResponse;

    await dbConnect();
    await ensureStoreIndexes();

    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON request body." },
        { status: 400 }
      );
    }

    // Security check: Local business storefronts CANNOT be directly activated here!
    if (body.storeType === "local_business") {
      return NextResponse.json(
        {
          success: false,
          error:
            "Local business storefronts must be submitted via the business application review workflow (/api/stores/business-application).",
        },
        { status: 400 }
      );
    }

    // 1. Check student vendor eligibility
    const eligibility = await checkStudentVendorEligibility(user);
    if (!eligibility.eligible) {
      return NextResponse.json(
        {
          success: false,
          error: eligibility.reason,
        },
        { status: eligibility.status || 403 }
      );
    }

    // 2. Validate required fields
    const { name, description, category, campus, operatingLocation, logo } = body;
    if (!name || !description || !category || !campus || !operatingLocation || !logo) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing required fields: name, description, category, campus, operatingLocation, and logo are required.",
        },
        { status: 400 }
      );
    }

    // 3. Sanitize inputs (ignoring client metrics or status overrides)
    const sanitized = sanitizeStoreInput(body);

    // 4. Build store document with strict server-enforced values
    const newStore = new StoreModel({
      ...sanitized,
      ownerId: user.id, // Strictly server-enforced ownerId
      slug: generateSlug(name),
      storeType: "student_store",
      status: "active", // Student stores activate directly upon verification
      isVerified: true,
      verificationType: "student",
      metrics: {
        rating: 5.0,
        reviewsCount: 0,
        completedDeals: 0,
        listingsCount: 0,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    await executeInTransaction(async (session) => {
      await saveStoreWithSlugRetry(newStore, 5, session || undefined);
      await UserModel.findByIdAndUpdate(
        user.id,
        { $set: { role: "seller", sellerStatus: "approved" } },
        session ? { session } : undefined
      );
    });

    return NextResponse.json(
      {
        success: true,
        data: newStore,
        message: "Student storefront created and activated successfully.",
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (
      error?.code === 11000 ||
      error?.code === 11001 ||
      String(error?.message || "").includes("E11000") ||
      isDuplicateOwnerError(error)
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "An active storefront is already registered to this account. Each account can only manage one storefront.",
        },
        { status: 409 }
      );
    }

    console.error("[POST /api/stores] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create storefront." },
      { status: 500 }
    );
  }
}
