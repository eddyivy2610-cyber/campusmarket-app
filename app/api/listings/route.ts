import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import ListingModel, {
  sanitizeListingInput,
  toPublicListingDTO,
} from "@/models/Listing";
import StoreModel from "@/models/Store";
import { requireAuth, requireCompletedOnboarding, assertUserOwnsStore, getServerAuthUser } from "@/lib/authServer";
import { applyCacheHeaders, isRequestSafeForPublicCache } from "@/lib/cacheHeaders";
import { verifyAssetOwnership } from "@/lib/uploadPolicy";
import {
  encodeListingCursor,
  decodeListingCursor,
} from "@/lib/listingCursor";
import { createEntityIdentity } from "@/lib/slugUtils";

/**
 * GET /api/listings
 * Discovery query for store-owned marketplace listings.
 * Every listing belongs to a store; unlinked listings are rejected.
 * Public responses use toPublicListingDTO (never exposing user fields or sellerId).
 */
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);

    // Reject legacy unlinked=true queries immediately with private, no-store
    const unlinked = searchParams.get("unlinked");
    if (unlinked === "true") {
      const errRes = NextResponse.json(
        {
          success: false,
          error:
            "Unlinked listings are no longer supported. Every listing must belong to a store.",
        },
        { status: 400 }
      );
      errRes.headers.set("Cache-Control", "private, no-store, must-revalidate");
      return errRes;
    }

    const category = searchParams.get("category");
    const campus = searchParams.get("campus");
    const storeId = searchParams.get("storeId");
    const sellerId = searchParams.get("sellerId");
    const listingType = searchParams.get("type"); // "product" | "service"
    const query = searchParams.get("q")?.trim();
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const status = searchParams.get("status") || "active";
    const cursor = searchParams.get("cursor");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "30", 10)));

    const filter: Record<string, any> = {};
    let isOwnerContext = false;

    if (status && status !== "all") {
      filter.status = status;
    }

    if (sellerId) {
      const { user, errorResponse } = await requireAuth(req);
      if (!user || errorResponse) {
        if (errorResponse) {
          errorResponse.headers.set("Cache-Control", "private, no-store, must-revalidate");
        }
        return errorResponse;
      }

      const resolvedSellerId = sellerId === "me" ? user.id : sellerId;
      if (resolvedSellerId !== user.id && user.role !== "admin") {
        const forbiddenRes = NextResponse.json(
          {
            success: false,
            error: "Forbidden: Public queries must filter by storeId, not sellerId.",
          },
          { status: 403 }
        );
        forbiddenRes.headers.set("Cache-Control", "private, no-store, must-revalidate");
        return forbiddenRes;
      }
      filter.sellerId = resolvedSellerId;
      isOwnerContext = true;
    }

    if (storeId) {
      let store: any = null;
      if (mongoose.Types.ObjectId.isValid(storeId)) {
        store = await StoreModel.findById(storeId).lean();
      } else {
        store = await StoreModel.findOne({
          $or: [{ publicId: storeId }, { slugLower: storeId.toLowerCase() }],
        }).lean();
      }

      const authUser = getServerAuthUser(req);
      const isStoreOwner = Boolean(
        authUser && store && (String(authUser.id) === String(store.ownerId) || authUser.role === "admin")
      );
      if (isStoreOwner) {
        isOwnerContext = true;
      }

      if (!store || store.status === "deleted" || (store.status !== "active" && !isStoreOwner)) {
        return NextResponse.json({
          success: true,
          data: [],
          pagination: { page, limit, total: 0, totalPages: 0 },
        });
      }
      filter.storeId = String(store._id);
      if (!isStoreOwner) {
        filter.status = "active";
      }
    } else if (!isOwnerContext) {
      filter.status = "active";
      // In general public discovery, exclude listings from non-active stores or missing storeId
      const nonActiveStores = await StoreModel.find({
        status: { $in: ["suspended", "pending_review", "paused", "rejected", "deleted"] },
      })
        .select("_id")
        .lean();
      const excludedStoreIds: any[] = [null, ""];
      for (const s of nonActiveStores as any[]) {
        excludedStoreIds.push(String(s._id));
      }
      filter.storeId = { $nin: excludedStoreIds };
    }

    if (listingType && (listingType === "product" || listingType === "service")) {
      filter.listingType = listingType;
    }

    if (category && category !== "All") {
      filter.category = category;
    }

    if (campus && campus !== "All Campuses") {
      filter.campus = campus;
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    let sort: any = { createdAt: -1, _id: -1 };
    let projection: any = null;

    if (query) {
      filter.$text = { $search: query };
      sort = { score: { $meta: "textScore" } };
      projection = { score: { $meta: "textScore" } };
    } else if (cursor) {
      const decoded = decodeListingCursor(cursor);
      if (!decoded) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Invalid pagination cursor. Cursor must be a valid base64url encoded (createdAt::id) token.",
          },
          { status: 400 }
        );
      }
      filter.$or = [
        { createdAt: { $lt: decoded.createdAt } },
        { createdAt: decoded.createdAt, _id: { $lt: decoded.id } },
      ];
    }

    const total = await ListingModel.countDocuments(filter);
    const queryBuilder = ListingModel.find(filter, projection).sort(sort);

    if (!cursor && page > 1) {
      queryBuilder.skip((page - 1) * limit);
    }

    const listings = await queryBuilder.limit(limit).lean();

    // Enrich listings strictly by their storeId (never by ownerId)
    const storeIds = Array.from(
      new Set(
        listings
          .map((l: any) => l.storeId)
          .filter((id: any) => typeof id === "string" && mongoose.Types.ObjectId.isValid(id))
      )
    );

    const stores =
      storeIds.length > 0
        ? await StoreModel.find({ _id: { $in: storeIds }, status: { $ne: "deleted" } })
            .select("name slug publicId logo category campus operatingLocation storeType isVerified verificationType metrics")
            .lean()
        : [];

    const storeById = new Map<string, any>();
    for (const s of stores as any[]) {
      storeById.set(String(s._id), s);
    }

    const enrichedListings = listings.map((l: any) => {
      const store = l.storeId ? storeById.get(String(l.storeId)) || null : null;
      return toPublicListingDTO(l, store);
    });

    const nextCursor =
      listings.length === limit && !query
        ? encodeListingCursor(
            (listings[listings.length - 1] as any).createdAt,
            (listings[listings.length - 1] as any)._id.toString()
          )
        : null;

    const res = NextResponse.json({
      success: true,
      data: enrichedListings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        nextCursor,
      },
    });

    const isPublicQuery = status === "active" && !sellerId && !isOwnerContext;
    const isPublic = isRequestSafeForPublicCache(req, { isPublicQuery });
    applyCacheHeaders(res, { isPublic, sMaxAge: 60, staleWhileRevalidate: 300 });

    return res;
  } catch (error: any) {
    console.error("[GET /api/listings] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch listings." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/listings
 * Create a new product or service listing.
 * STRICT SECURITY:
 * 1. Explicit storeId is required on every listing creation.
 * 2. Store must be owned by the authenticated user and must be status === "active".
 * 3. Listing sellerId is strictly set to store.ownerId (=== user.id).
 * 4. Strips client metrics (views, likes, isPromoted).
 */
export async function POST(req: NextRequest) {
  try {
    const { user, errorResponse } = await requireCompletedOnboarding(req);
    if (!user || errorResponse) return errorResponse;

    await dbConnect();

    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON request body." },
        { status: 400 }
      );
    }

    // 1. Require storeId explicitly — no listings without a store, no implicit store selection
    const requestedStoreId = typeof body.storeId === "string" ? body.storeId.trim() : "";
    if (!requestedStoreId) {
      return NextResponse.json(
        {
          success: false,
          error: "storeId is required. Every listing must belong to an active store you own.",
        },
        { status: 400 }
      );
    }

    // 2. Verify store ownership and active state (blocks suspended, paused, pending_review, rejected, deleted stores)
    const storeCheck = await assertUserOwnsStore(user.id, requestedStoreId, {
      checkSuspended: true,
      requireActive: true,
    });
    if (!storeCheck.ok) {
      return NextResponse.json(
        { success: false, error: storeCheck.error },
        { status: storeCheck.status || 403 }
      );
    }
    const linkedStore = storeCheck.store;

    // 3. Validate required listing fields
    const { title, price, description, category, campus, location } = body;
    if (
      !title ||
      price === undefined ||
      price === null ||
      !description ||
      !category ||
      !campus ||
      !location
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing required fields: title, price, description, category, campus, and location are required.",
        },
        { status: 400 }
      );
    }

    const numericPrice = Number(price);
    if (isNaN(numericPrice) || numericPrice < 0) {
      return NextResponse.json(
        { success: false, error: "Price must be a valid non-negative number." },
        { status: 400 }
      );
    }

    // 4. Security validation for listing image assets
    if (Array.isArray(body.images)) {
      for (const imgUrl of body.images) {
        if (typeof imgUrl === "string") {
          if (imgUrl.includes("/authenticated/") || imgUrl.includes("campushive/private_docs")) {
            return NextResponse.json(
              {
                success: false,
                error:
                  "Security rejection: Private business documents cannot be attached to public marketplace listings.",
              },
              { status: 400 }
            );
          }
          if (imgUrl.includes("cloudinary.com")) {
            const isOwner = verifyAssetOwnership(imgUrl, user.id, "listing_image");
            if (!isOwner) {
              return NextResponse.json(
                {
                  success: false,
                  error:
                    "Security rejection: Listing image does not belong to your account or has an invalid structure.",
                },
                { status: 403 }
              );
            }
          }
        }
      }
    }

    // 5. Sanitize inputs
    const sanitized = sanitizeListingInput({
      ...body,
      categoryFields: body.categoryFields || body.specs || {},
    });

    // 6. Create listing with strictly server-enforced storeId and sellerId === store.ownerId
    const identity = createEntityIdentity(title);
    const canonicalStoreId = String(linkedStore._id);
    const newListing = new ListingModel({
      ...sanitized,
      publicId: identity.publicId,
      slugSuffix: identity.slugSuffix,
      slug: identity.slug,
      sellerId: String(linkedStore.ownerId), // Always equal to store.ownerId (=== user.id)
      storeId: canonicalStoreId,
      price: numericPrice,
      priceFormatted: `₦${Math.round(numericPrice).toLocaleString("en-NG")}`,
      views: 0,
      likes: 0,
      isPromoted: false,
      status: body.status === "draft" ? "draft" : "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    let saveAttempt = 0;
    while (saveAttempt < 3) {
      try {
        await newListing.save();
        break;
      } catch (err: any) {
        if (err?.code === 11000 && saveAttempt < 2) {
          saveAttempt++;
          const retryIdentity = createEntityIdentity(title);
          newListing.publicId = retryIdentity.publicId;
          newListing.slugSuffix = retryIdentity.slugSuffix;
          newListing.slug = retryIdentity.slug;
        } else {
          throw err;
        }
      }
    }

    // 7. Recompute store catalog metrics.listingsCount
    const activeCount = await ListingModel.countDocuments({
      storeId: canonicalStoreId,
      status: "active",
    });
    linkedStore.metrics.listingsCount = activeCount;
    await linkedStore.save();

    return NextResponse.json(
      {
        success: true,
        data: newListing,
        message: "Listing created successfully.",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[POST /api/listings] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create listing." },
      { status: 500 }
    );
  }
}
