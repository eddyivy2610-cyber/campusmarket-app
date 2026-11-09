import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import BusinessApplicationModel from "@/models/BusinessApplication";
import SlugRedirectModel from "@/models/SlugRedirect";
import StoreModel, {
  isDuplicateOwnerError,
  isDuplicateSlugError,
  sanitizeStoreInput,
  ensureStoreIndexes,
  generateSlug,
  validateStoreSlugFormat,
  generateSlugSuggestions,
  toPublicStoreDTO,
} from "@/models/Store";
import {
  MAX_STORES_PER_USER,
  MAX_STUDENT_STORES_PER_USER,
} from "@/constants/enums";
import {
  requireAuth,
  requireCompletedOnboarding,
  checkStudentVendorEligibility,
} from "@/lib/authServer";
import { applyRateLimit, RATE_LIMIT_PRESETS } from "@/lib/rateLimit";
import { applyCacheHeaders, isRequestSafeForPublicCache } from "@/lib/cacheHeaders";
import { executeInTransaction } from "@/lib/transactionHelper";
import { isDatabaseUnavailable, databaseUnavailableResponse } from "@/lib/databaseErrors";
import { createNotification } from "@/lib/notificationService";
import { generateUUIDv7 } from "@/lib/uuidv7";

/**
 * Checks whether a candidate slug is currently reserved in SlugRedirectModel
 * by a deleted or renamed store.
 */
async function isSlugReserved(slugLower: string, callerUserId: string): Promise<boolean> {
  const redirect = await SlugRedirectModel.findOne({
    entityType: "store",
    oldSlug: slugLower,
  }).lean();
  if (!redirect) return false;
  if (redirect.reservedUntil && new Date(redirect.reservedUntil) <= new Date()) {
    return false;
  }
  if (redirect.reason === "deletion") {
    return true;
  }
  if (redirect.previousOwnerId && String(redirect.previousOwnerId) !== String(callerUserId)) {
    return true;
  }
  return true;
}

/**
 * Atomically syncs missing storesCount/studentStoresCount fields on legacy/seeded user documents
 * before running the atomic conditional cap increment inside the store-creation transaction.
 */
async function ensureUserStoreCountersInitialized(userId: string) {
  if (!mongoose.Types.ObjectId.isValid(userId)) return;
  const userDoc = await UserModel.findById(userId)
    .select("storesCount studentStoresCount")
    .lean();
  if (
    userDoc &&
    (typeof (userDoc as any).storesCount !== "number" ||
      typeof (userDoc as any).studentStoresCount !== "number")
  ) {
    const [liveTotal, liveStudent] = await Promise.all([
      StoreModel.countDocuments({ ownerId: userId, status: { $ne: "deleted" } }),
      StoreModel.countDocuments({
        ownerId: userId,
        status: { $ne: "deleted" },
        storeType: "student_store",
      }),
    ]);
    await UserModel.updateOne(
      { _id: userId, storesCount: { $exists: false } },
      { $set: { storesCount: liveTotal, studentStoresCount: liveStudent } }
    );
  }
}

/**
 * GET /api/stores
 * Public discovery endpoint: list active stores with optional filters.
 * Uses explicit public allowlist (toPublicStoreDTO) and never leaks owner private fields.
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

    const excludeOwner = searchParams.get("excludeOwner");
    if (excludeOwner) {
      filter.ownerId = { $ne: excludeOwner };
    }

    if (campus && campus !== "All Campuses") {
      filter.campus = campus;
    }

    if (category && category !== "All") {
      filter.category = category;
    }

    if (query) {
      const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { name: { $regex: escapedQuery, $options: "i" } },
        { description: { $regex: escapedQuery, $options: "i" } },
      ];
    }

    const total = await StoreModel.countDocuments(filter);
    const rawStores = await StoreModel.find(filter)
      .sort({ "metrics.rating": -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const stores = rawStores.map((s) => toPublicStoreDTO(s)).filter(Boolean);

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
 * Unified Seller Onboarding & Multi-Store Creation Endpoint.
 * Enforces:
 * - Rate limit on store creation (prevents slug/name cycling)
 * - Atomic cap of MAX_STORES_PER_USER (3) non-deleted stores per user
 * - Atomic cap of MAX_STUDENT_STORES_PER_USER (1) student store per user
 * - Case-insensitive unique slug (slugLower), format validation, reserved-word check,
 *   and 409 conflict suggestions on collision.
 * - Never mutates the user's personal identity (name, email, verification state, handle).
 */
export async function POST(req: NextRequest) {
  let targetSlug = "";
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

    // Rate limit store creation per user/IP
    const rl = applyRateLimit(req, "store_create", RATE_LIMIT_PRESETS.STORE_CREATE, user.id);
    if (!rl.allowed && rl.response) {
      return rl.response;
    }

    await dbConnect();
    await ensureStoreIndexes();
    await ensureUserStoreCountersInitialized(user.id);

    // Validate slug if explicitly provided, or derive deterministic slug from store name
    const rawName = String(body.name || "").trim();
    if (body.slug !== undefined && String(body.slug).trim() !== "") {
      const slugCheck = validateStoreSlugFormat(String(body.slug));
      if (!slugCheck.valid) {
        return NextResponse.json(
          { success: false, error: slugCheck.error },
          { status: 400 }
        );
      }
      targetSlug = slugCheck.slug;
    } else if (rawName) {
      targetSlug = generateSlug(rawName);
      const slugCheck = validateStoreSlugFormat(targetSlug);
      if (!slugCheck.valid) {
        return NextResponse.json(
          { success: false, error: slugCheck.error },
          { status: 400 }
        );
      }
    }

    if (targetSlug) {
      const reserved = await isSlugReserved(targetSlug, user.id);
      if (reserved) {
        const suggestions = await generateSlugSuggestions(targetSlug);
        return NextResponse.json(
          {
            success: false,
            error: `The store slug "${targetSlug}" is currently reserved and unavailable.`,
            suggestions,
          },
          { status: 409 }
        );
      }
    }

    // ------------------------------------------------------------------------
    // UNIFIED SELLER ONBOARDING FLOW (Student / Non-Student Radio)
    // ------------------------------------------------------------------------
    if (isUnifiedOnboarding) {
      const fullName = String(body.fullName || user.name || "").trim();
      const name = rawName;
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

      // Optional retry for a specific rejected/unverified store owned by user
      let retryStore: any = null;
      if (body.retryStoreId && mongoose.Types.ObjectId.isValid(String(body.retryStoreId))) {
        retryStore = await StoreModel.findOne({
          _id: body.retryStoreId,
          ownerId: user.id,
          status: { $ne: "deleted" },
          isVerified: false,
        });
      }

      // PATH A: STUDENT SELLER ONBOARDING
      if (body.sellerType === "student") {
        const studentIdImage = String(body.studentIdImage || "").trim();
        if (!studentIdImage) {
          return NextResponse.json(
            {
              success: false,
              error: "Student ID card image is required for student verification.",
            },
            { status: 400 }
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

        const now = new Date().toISOString();
        const newStore = retryStore
          ? Object.assign(retryStore, {
              ...sanitized,
              ownerFullName: fullName,
              storeType: "student_store",
              status: "active",
              isVerified: false,
              verificationType: "student",
              studentIdImage,
              updatedAt: now,
            })
          : new StoreModel({
              ...sanitized,
              publicId: generateUUIDv7(),
              ownerId: user.id,
              ownerFullName: fullName,
              slug: targetSlug,
              slugLower: targetSlug,
              storeType: "student_store",
              status: "active",
              isVerified: false,
              verificationType: "student",
              studentIdImage,
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
          if (!retryStore) {
            const capUpdate = await UserModel.updateOne(
              {
                _id: user.id,
                storesCount: { $lt: MAX_STORES_PER_USER },
                studentStoresCount: { $lt: MAX_STUDENT_STORES_PER_USER },
              },
              {
                $inc: { storesCount: 1, studentStoresCount: 1 },
                $set: {
                  role: user.role === "admin" ? "admin" : "seller",
                  sellerStatus: "pending",
                  onboardingStep: "completed",
                },
              },
              session ? { session } : undefined
            );

            if (capUpdate.modifiedCount !== 1) {
              const liveTotal = await StoreModel.countDocuments(
                { ownerId: user.id, status: { $ne: "deleted" } },
                session ? { session } : undefined
              );
              const capErr: any = new Error(
                liveTotal >= MAX_STORES_PER_USER
                  ? `Store limit reached. Each account can own a maximum of ${MAX_STORES_PER_USER} stores.`
                  : `Student store limit reached. Each account can own at most ${MAX_STUDENT_STORES_PER_USER} student store.`
              );
              capErr.statusCode = 409;
              throw capErr;
            }
          }

          await (session ? newStore.save({ session }) : newStore.save());

          const studentVerificationApp = new BusinessApplicationModel({
            applicantId: user.id,
            businessName: name,
            businessCategory: category,
            campus,
            operatingLocation,
            contactPhone: contact.phone,
            contactEmail: contact.email || user.email,
            registeredBusinessName: fullName,
            cacNumber: "Student ID Card",
            supportingDocuments: [studentIdImage],
            notes: description,
            status: "pending_review",
            storeId: newStore._id.toString(),
            createdAt: now,
            updatedAt: now,
          });
          await (session
            ? studentVerificationApp.save({ session })
            : studentVerificationApp.save());

          newStore.businessApplicationId = studentVerificationApp._id.toString();
          await (session ? newStore.save({ session }) : newStore.save());
        });

        try {
          if (mongoose.Types.ObjectId.isValid(user.id)) {
            await createNotification({
              recipient: user.id,
              type: "seller_verification_pending",
              category: "account_security",
              priority: "high",
              title: "Student ID Verification Submitted",
              message:
                "We received your Student ID card for storefront verification. Please wait a maximum of 24 hours for an admin to review and reply.",
              link: "/stores?view=storefront",
              dedupeKey: `student_id_submitted:${newStore._id.toString()}`,
            });
          }
        } catch (notifErr) {
          console.error("[POST /api/stores] Notification creation error:", notifErr);
        }

        return NextResponse.json(
          {
            success: true,
            verificationStatus: "pending_review",
            data: newStore,
            message:
              "Your Student ID card has been sent to our admin team for verification. Please wait a maximum of 24 hours for a reply.",
          },
          { status: 201 }
        );
      }

      // PATH B: NON-STUDENT BUSINESS ONBOARDING
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
      const newStore = retryStore
        ? Object.assign(retryStore, {
            ...sanitized,
            ownerFullName: fullName,
            storeType: "local_business",
            status: "active",
            isVerified: false,
            verificationType: "business",
            locationProofDocument,
            updatedAt: now,
          })
        : new StoreModel({
            ...sanitized,
            publicId: generateUUIDv7(),
            ownerId: user.id,
            ownerFullName: fullName,
            slug: targetSlug,
            slugLower: targetSlug,
            storeType: "local_business",
            status: "active",
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
        if (!retryStore) {
          const capUpdate = await UserModel.updateOne(
            {
              _id: user.id,
              storesCount: { $lt: MAX_STORES_PER_USER },
            },
            {
              $inc: { storesCount: 1 },
              $set: {
                role: user.role === "admin" ? "admin" : "seller",
                sellerStatus: "pending",
                onboardingStep: "completed",
              },
            },
            session ? { session } : undefined
          );

          if (capUpdate.modifiedCount !== 1) {
            const capErr: any = new Error(
              `Store limit reached. Each account can own a maximum of ${MAX_STORES_PER_USER} stores.`
            );
            capErr.statusCode = 409;
            throw capErr;
          }
        }

        await (session ? newStore.save({ session }) : newStore.save());

        const businessApp = new BusinessApplicationModel({
          applicantId: user.id,
          businessName: name,
          businessCategory: category,
          campus,
          operatingLocation,
          contactPhone: contact.phone,
          contactEmail: contact.email || user.email,
          registeredBusinessName: fullName,
          cacNumber: "Location Proof",
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
      });

      try {
        if (mongoose.Types.ObjectId.isValid(user.id)) {
          await createNotification({
            recipient: user.id,
            type: "seller_verification_pending",
            category: "account_security",
            priority: "high",
            title: "Seller Verification Submitted",
            message:
              "We received your operating location document for storefront verification. Please wait a maximum of 24 hours for an admin to review and reply.",
            link: "/stores?view=storefront",
            dedupeKey: `biz_doc_submitted:${newStore._id.toString()}`,
          });
        }
      } catch (notifErr) {
        console.error("[POST /api/stores] Notification creation error:", notifErr);
      }

      return NextResponse.json(
        {
          success: true,
          verificationStatus: "pending_review",
          data: newStore,
          message:
            "Storefront opened! Your verification document has been sent to admin — please wait a maximum of 24 hours for a reply.",
        },
        { status: 201 }
      );
    }

    // ------------------------------------------------------------------------
    // DIRECT STUDENT STORE CREATION FLOW
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

    // 1. Check student verification eligibility
    if (!user.isStudent || !user.studentVerified) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Student eligibility verification required. You must complete campus student verification before opening a student storefront.",
        },
        { status: 403 }
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

    // 3. Sanitize inputs (ignoring client ownerId, metrics, role, or status overrides)
    const sanitized = sanitizeStoreInput(body);
    const now = new Date().toISOString();

    // 4. Build store document with strict server-enforced values
    const newStore = new StoreModel({
      ...sanitized,
      publicId: generateUUIDv7(),
      ownerId: user.id, // Strictly server-enforced ownerId
      slug: targetSlug,
      slugLower: targetSlug,
      storeType: "student_store",
      status: "active",
      isVerified: true,
      verificationType: "student",
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
      const capUpdate = await UserModel.updateOne(
        {
          _id: user.id,
          storesCount: { $lt: MAX_STORES_PER_USER },
          studentStoresCount: { $lt: MAX_STUDENT_STORES_PER_USER },
        },
        {
          $inc: { storesCount: 1, studentStoresCount: 1 },
          $set: {
            role: user.role === "admin" ? "admin" : "seller",
            sellerStatus: "approved",
          },
        },
        session ? { session } : undefined
      );

      if (capUpdate.modifiedCount !== 1) {
        const liveTotal = await StoreModel.countDocuments(
          { ownerId: user.id, status: { $ne: "deleted" } },
          session ? { session } : undefined
        );
        const capErr: any = new Error(
          liveTotal >= MAX_STORES_PER_USER
            ? `Store limit reached. Each account can own a maximum of ${MAX_STORES_PER_USER} stores.`
            : `Student store limit reached. Each account can own at most ${MAX_STUDENT_STORES_PER_USER} student store.`
        );
        capErr.statusCode = 409;
        throw capErr;
      }

      await (session ? newStore.save({ session }) : newStore.save());
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
    if (error?.statusCode === 409) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 409 }
      );
    }

    if (isDuplicateSlugError(error)) {
      const suggestions = await generateSlugSuggestions(targetSlug || "store");
      return NextResponse.json(
        {
          success: false,
          error: "A storefront with this name or slug already exists. Please choose another.",
          suggestions,
        },
        { status: 409 }
      );
    }

    if (
      error?.code === 11000 ||
      error?.code === 11001 ||
      String(error?.message || "").includes("E11000") ||
      isDuplicateOwnerError(error)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Storefront creation conflict. Please try a different store name or check your store limit.",
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
