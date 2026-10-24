import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import BusinessApplicationModel from "@/models/BusinessApplication";
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
import { evaluateStudentIdVerification } from "@/lib/studentIdVerification";

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
 * Unified Seller Onboarding & Storefront Creation Endpoint:
 * Supports both:
 * 1. Unified Seller Onboarding (`sellerType: "student" | "non_student"`):
 *    - Student: Verifies uploaded Student ID card (extracts & matches name against Fullname + checks card validation date) to approve or decline.
 *    - Non-Student: Collects primary operating location + proof document of that location, opens active storefront immediately so seller can post listings, and records location verification application.
 * 2. Legacy Student Storefront creation (`storeType: "student"` without `sellerType`).
 */
export async function POST(req: NextRequest) {
  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON request body." },
        { status: 400 }
      );
    }

    const isUnifiedOnboarding =
      body.sellerType === "student" || body.sellerType === "non_student";

    const authResult = isUnifiedOnboarding
      ? await requireAuth(req)
      : await requireCompletedOnboarding(req);
    const { user, errorResponse } = authResult;
    if (!user || errorResponse) return errorResponse;

    await dbConnect();
    await ensureStoreIndexes();

    // ------------------------------------------------------------------------
    // UNIFIED SELLER ONBOARDING FLOW (Student / Non-Student Radio)
    // ------------------------------------------------------------------------
    if (isUnifiedOnboarding) {
      // 1. Ensure user does not already own a storefront
      const existingStore = await StoreModel.findOne({ ownerId: user.id });
      if (existingStore) {
        return NextResponse.json(
          {
            success: false,
            error:
              "An active storefront is already registered to this account. Each account can only manage one storefront.",
          },
          { status: 409 }
        );
      }

      const fullName = String(body.fullName || user.name || "").trim();
      const name = String(body.name || "").trim();
      const description = String(body.description || "").trim();
      const category = String(body.category || "").trim();
      const campus = String(body.campus || "").trim();
      const logo = String(body.logo || "").trim();
      const contactRaw = body.contact;
      const contact =
        typeof contactRaw === "string"
          ? {
              phone: contactRaw.trim(),
              whatsapp: contactRaw.trim(),
              email: user.email,
            }
          : {
              phone: String(contactRaw?.phone || contactRaw?.whatsapp || "").trim(),
              whatsapp: String(contactRaw?.whatsapp || contactRaw?.phone || "").trim(),
              email: String(contactRaw?.email || user.email || "").trim(),
            };

      if (!fullName || !name || !description || !category || !campus || !logo || !contact.phone) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Missing required fields: Fullname, Avatar, Storefront Name, Primary Category, Target Campus, About, and Contact are required.",
          },
          { status: 400 }
        );
      }

      // PATH A: STUDENT SELLER ONBOARDING (Verify ID card name & validation date)
      if (body.sellerType === "student") {
        const studentIdImage = String(body.studentIdImage || "").trim();
        const extractedIdName = String(body.extractedIdName || "").trim();
        const cardValidationDate = String(body.cardValidationDate || "").trim();

        if (!studentIdImage) {
          return NextResponse.json(
            {
              success: false,
              error: "Student ID card image is required for student verification.",
            },
            { status: 400 }
          );
        }

        const evaluation = evaluateStudentIdVerification({
          enteredFullName: fullName,
          extractedIdName,
          cardValidationDate,
        });

        if (evaluation.decision === "declined") {
          return NextResponse.json(
            {
              success: false,
              verificationStatus: "declined",
              error: evaluation.summary,
              evaluation,
            },
            { status: 422 }
          );
        }

        const operatingLocation =
          String(body.operatingLocation || "").trim() || `${campus} (Student Store)`;

        const sanitized = sanitizeStoreInput({
          ...body,
          name,
          description,
          category,
          campus,
          operatingLocation,
          logo,
          contact,
        });

        const newStore = new StoreModel({
          ...sanitized,
          ownerId: user.id,
          ownerFullName: fullName,
          slug: generateSlug(name),
          storeType: "student_store",
          status: "active",
          isVerified: true,
          verificationType: "student",
          studentIdImage,
          studentIdExpiryDate: evaluation.dateCheck.parsedDate,
          metrics: {
            rating: 5.0,
            reviewsCount: 0,
            completedDeals: 0,
            listingsCount: 0,
            followersCount: 0,
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

        await executeInTransaction(async (session) => {
          await saveStoreWithSlugRetry(newStore, 5, session || undefined);
          await UserModel.findByIdAndUpdate(
            user.id,
            {
              $set: {
                name: fullName,
                campus,
                isStudent: true,
                studentVerified: true,
                role: "seller",
                sellerStatus: "approved",
                onboardingStep: "completed",
                "profile.displayName": fullName,
                "profile.avatar": logo,
                "profile.phone": contact.phone,
                "profile.whatsapp": contact.whatsapp,
              },
            },
            session ? { session } : undefined
          );
        });

        return NextResponse.json(
          {
            success: true,
            verificationStatus: "approved",
            data: newStore,
            message: "Student ID verified and storefront opened successfully.",
          },
          { status: 201 }
        );
      }

      // PATH B: NON-STUDENT BUSINESS ONBOARDING (Collect operating location + proof document, allow posting listings)
      const operatingLocation = String(body.operatingLocation || "").trim();
      const locationProofDocument = String(body.locationProofDocument || "").trim();

      if (!operatingLocation || !locationProofDocument) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Non-student sellers must provide their primary operating location and a proof document of that location.",
          },
          { status: 400 }
        );
      }

      const sanitized = sanitizeStoreInput({
        ...body,
        name,
        description,
        category,
        campus,
        operatingLocation,
        logo,
        contact,
      });

      const now = new Date().toISOString();
      const newStore = new StoreModel({
        ...sanitized,
        ownerId: user.id,
        ownerFullName: fullName,
        slug: generateSlug(name),
        storeType: "local_business",
        status: "active", // Allow posting listings immediately while location document is recorded
        isVerified: false,
        verificationType: "business",
        locationProofDocument,
        metrics: {
          rating: 5.0,
          reviewsCount: 0,
          completedDeals: 0,
          listingsCount: 0,
          followersCount: 0,
        },
        createdAt: now,
        updatedAt: now,
      });

      await executeInTransaction(async (session) => {
        await saveStoreWithSlugRetry(newStore, 5, session || undefined);

        const businessApp = new BusinessApplicationModel({
          applicantId: user.id,
          businessName: name,
          businessCategory: category,
          campus,
          operatingLocation,
          contactPhone: contact.phone,
          contactEmail: contact.email || user.email,
          registeredBusinessName: fullName,
          supportingDocuments: [locationProofDocument],
          notes: description,
          status: "pending_review",
          storeId: newStore._id.toString(),
          createdAt: now,
          updatedAt: now,
        });
        await (session ? businessApp.save({ session }) : businessApp.save());

        newStore.businessApplicationId = businessApp._id.toString();
        await (session ? newStore.save({ session }) : newStore.save());

        await UserModel.findByIdAndUpdate(
          user.id,
          {
            $set: {
              name: fullName,
              campus,
              isStudent: false,
              role: "seller",
              sellerStatus: "approved",
              onboardingStep: "completed",
              "profile.displayName": fullName,
              "profile.avatar": logo,
              "profile.phone": contact.phone,
              "profile.whatsapp": contact.whatsapp,
            },
          },
          session ? { session } : undefined
        );
      });

      return NextResponse.json(
        {
          success: true,
          data: newStore,
          message:
            "Storefront opened! You can now post listings while your operating location document is verified.",
        },
        { status: 201 }
      );
    }

    // ------------------------------------------------------------------------
    // LEGACY FLOW (Backwards compatibility for direct API callers & test suite)
    // ------------------------------------------------------------------------
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
