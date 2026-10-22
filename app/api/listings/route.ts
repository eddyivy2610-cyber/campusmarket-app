import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import ListingModel, {
  sanitizeListingInput,
} from "@/models/Listing";
import StoreModel from "@/models/Store";
import { requireAuth, assertUserOwnsStore, getServerAuthUser } from "@/lib/authServer";
import { applyCacheHeaders, isRequestSafeForPublicCache } from "@/lib/cacheHeaders";
import { verifyAssetOwnership } from "@/lib/uploadPolicy";

/**
 * Encodes compound cursor (createdAt, _id) as URL-safe string.
 */
export function encodeListingCursor(createdAt: string, id: string): string {
  return Buffer.from(`${createdAt}::${id}`).toString("base64url");
}

export interface DecodedListingCursor {
  createdAt: string;
  id: mongoose.Types.ObjectId;
}

/**
 * Decodes compound cursor into { createdAt, id: ObjectId }.
 * Validates base64 encoding, timestamp validity, and ObjectId formatting defensively.
 */
export function decodeListingCursor(cursor: string): DecodedListingCursor | null {
  try {
    const raw = Buffer.from(cursor, "base64url").toString("utf-8");
    const parts = raw.split("::");
    if (parts.length !== 2) return null;
    const [createdAt, idStr] = parts;
    const date = new Date(createdAt);
    if (isNaN(date.getTime())) return null;
    if (!mongoose.Types.ObjectId.isValid(idStr)) return null;
    return { createdAt, id: new mongoose.Types.ObjectId(idStr) };
  } catch {
    return null;
  }
}

/**
 * GET /api/listings
 * Discovery query for marketplace listings:
 * Returns both personal and storefront active listings with category and campus filtering.
 */
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);

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

    if (status && status !== "all") {
      filter.status = status;
    }

    const unlinked = searchParams.get("unlinked");
    if (unlinked === "true") {
      // STRICT AUTHORIZATION (Critical Check A): Derive seller from auth session
      const { user, errorResponse } = await requireAuth(req);
      if (!user || errorResponse) return errorResponse;

      filter.sellerId = user.id; // Server-derived, ignores any client sellerId
      filter.storeId = { $in: [null, undefined] };
    } else if (sellerId) {
      if (sellerId === "me") {
        const { user, errorResponse } = await requireAuth(req);
        if (!user || errorResponse) return errorResponse;
        filter.sellerId = user.id;
      } else {
        // Public seller profile queries only return active listings unless requester is the seller
        const authUser = getServerAuthUser(req);
        const isOwner = authUser && authUser.id === sellerId;
        filter.sellerId = sellerId;
        if (!isOwner) {
          filter.status = "active";
        }
      }
    }

    if (storeId) {
      // If store is requested, confirm store exists and is not suspended/paused
      const store = await StoreModel.findById(storeId).lean();
      if (!store || store.status !== "active") {
        return NextResponse.json({
          success: true,
          data: [],
          pagination: { page, limit, total: 0, totalPages: 0 },
        });
      }
      filter.storeId = storeId;
    } else if (unlinked !== "true") {
      // In general public discovery, exclude listings from suspended, pending, or paused stores
      const nonActiveStores = await StoreModel.find({
        status: { $in: ["suspended", "pending_review", "paused"] },
      })
        .select("_id")
        .lean();
      if (nonActiveStores.length > 0) {
        const nonActiveIds = nonActiveStores.map((s: any) => s._id.toString());
        filter.storeId = { $nin: nonActiveIds };
      }
    }

    if (listingType && (listingType === "product" || listingType === "service")) {
      filter.listingType = listingType;
    }

    // Exact equality filters enabling ESR compound B-Tree index traversal
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

    // High performance partitioned text index search or compound cursor keyset seek
    let sort: any = { createdAt: -1, _id: -1 };
    let projection: any = null;

    if (query) {
      filter.$text = { $search: query };
      sort = { score: { $meta: "textScore" } };
      projection = { score: { $meta: "textScore" } };
    } else if (cursor) {
      // Compound keyset cursor (createdAt, _id) eliminating duplicate/skipped items on timestamp collision
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
    const nextCursor =
      listings.length === limit && !query
        ? encodeListingCursor(
            (listings[listings.length - 1] as any).createdAt,
            (listings[listings.length - 1] as any)._id.toString()
          )
        : null;

    const res = NextResponse.json({
      success: true,
      data: listings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        nextCursor,
      },
    });

    // Public / Private Cache-Control split: strictly private if session, unlinked, sellerId, or non-active
    const isPublicQuery =
      status === "active" &&
      unlinked !== "true" &&
      !sellerId;

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
 * Create a new product or service listing:
 * STRICT SECURITY:
 * 1. Authenticated user identity strictly enforced as sellerId.
 * 2. If storeId provided: verifies store ownership and confirms store is not suspended.
 * 3. Strips client metrics (views, likes, isPromoted).
 */
export async function POST(req: NextRequest) {
  try {
    const { user, errorResponse } = await requireAuth(req);
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

    // 1. Validate required fields
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

    // 2. Security validation for listing image assets
    if (Array.isArray(body.images)) {
      for (const imgUrl of body.images) {
        if (typeof imgUrl === "string") {
          // Strictly reject private verification documents from being attached to public listings
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
          // Enforce structural ownership on all Cloudinary listing assets
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

    // 3. If storeId provided, verify store ownership & active status
    let linkedStore: any = null;
    if (body.storeId) {
      const storeCheck = await assertUserOwnsStore(user.id, body.storeId, {
        checkSuspended: true,
      });
      if (!storeCheck.ok) {
        return NextResponse.json(
          { success: false, error: storeCheck.error },
          { status: storeCheck.status || 403 }
        );
      }
      linkedStore = storeCheck.store;
    }

    // 3. Sanitize inputs
    const sanitized = sanitizeListingInput(body);

    // 4. Create listing with strictly server-enforced values
    const newListing = new ListingModel({
      ...sanitized,
      sellerId: user.id, // Strictly server-enforced sellerId
      storeId: body.storeId || undefined,
      price: numericPrice,
      priceFormatted: `₦${Math.round(numericPrice).toLocaleString("en-NG")}`,
      views: 0,
      likes: 0,
      isPromoted: false,
      status: body.status === "draft" ? "draft" : "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    await newListing.save();

    // 5. Update store catalog metrics if associated with a store
    if (linkedStore) {
      const activeCount = await ListingModel.countDocuments({
        storeId: linkedStore._id.toString(),
        status: "active",
      });
      linkedStore.metrics.listingsCount = activeCount;
      await linkedStore.save();
    }

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
