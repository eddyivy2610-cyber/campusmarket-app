import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import ListingModel, { toPublicListingDTO } from "@/models/Listing";
import StoreModel from "@/models/Store";
import { requireAuth, assertUserOwnsStore, getServerAuthUser } from "@/lib/authServer";
import { applyCacheHeaders, isRequestSafeForPublicCache } from "@/lib/cacheHeaders";

/**
 * GET /api/stores/[id]/listings
 * Retrieve catalog items belonging to a specific storefront (by Store ID, PublicId, or Slug).
 * STRICT VISIBILITY RULES:
 * 1. Never resolves stores by user handle or ownerId.
 * 2. If store is deleted, returns 404. If suspended/non-active, returns 403 to public viewers.
 * 3. Public viewers can ONLY see status: "active" listings formatted with toPublicListingDTO.
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await dbConnect();

    const cleanId = id.trim();
    const lowerSlug = cleanId.toLowerCase();
    if (!cleanId || lowerSlug === "me") {
      return NextResponse.json(
        { success: false, error: "Storefront not found." },
        { status: 404 }
      );
    }

    let store: any = null;
    if (cleanId.match(/^[0-9a-fA-F]{24}$/)) {
      store = await StoreModel.findById(cleanId).lean();
    }
    if (!store) {
      store = await StoreModel.findOne({
        $or: [
          { publicId: cleanId },
          { slugLower: lowerSlug },
          { slug: lowerSlug },
        ],
      }).lean();
    }

    if (!store || store.status === "deleted") {
      return NextResponse.json(
        { success: false, error: "Storefront not found." },
        { status: 404 }
      );
    }

    const authUser = getServerAuthUser(req);
    const isOwner = Boolean(
      authUser &&
        (String(authUser.id) === String(store.ownerId) || authUser.role === "admin")
    );

    // Visibility: Non-active stores cannot be viewed publicly
    if (store.status !== "active" && !isOwner) {
      return NextResponse.json(
        {
          success: false,
          error:
            store.status === "suspended"
              ? "This storefront is currently suspended."
              : "This storefront is currently unavailable.",
        },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // "product" | "service"
    const requestedStatus = searchParams.get("status") || "active";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "30", 10)));

    const filter: Record<string, any> = {
      storeId: String(store._id),
    };

    // Public users strictly see active items only; owner can see requested status
    if (!isOwner) {
      filter.status = "active";
    } else if (requestedStatus && requestedStatus !== "all") {
      filter.status = requestedStatus;
    }

    if (type && (type === "product" || type === "service")) {
      filter.listingType = type;
    }

    const total = await ListingModel.countDocuments(filter);
    const rawListings = await ListingModel.find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const listings = isOwner
      ? rawListings
      : rawListings.map((l) => toPublicListingDTO(l, store));

    const res = NextResponse.json({
      success: true,
      data: listings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });

    const isPublicQuery = !isOwner && store.status === "active";
    const isPublic = isRequestSafeForPublicCache(req, { isPublicQuery });
    applyCacheHeaders(res, { isPublic, sMaxAge: 60, staleWhileRevalidate: 300 });
    return res;
  } catch (error: any) {
    console.error("[GET /api/stores/[id]/listings] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve store listings." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/stores/[id]/listings
 * Move listing(s) between the authenticated user's own stores.
 * STRICT SECURITY & INTEGRITY:
 * 1. Authenticated user must own the destination store (and it must be active).
 * 2. Every listing must be owned by user.id (and its source store must be owned by user.id).
 * 3. Recomputes metrics.listingsCount for both source store(s) and destination store.
 */
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { user, errorResponse } = await requireAuth(req);
    if (!user || errorResponse) return errorResponse;

    const { id: storeId } = await context.params;
    await dbConnect();

    // 1. Verify destination store ownership and active status
    const storeCheck = await assertUserOwnsStore(user.id, storeId, {
      checkSuspended: true,
      requireActive: true,
    });
    if (!storeCheck.ok) {
      return NextResponse.json(
        { success: false, error: storeCheck.error },
        { status: storeCheck.status || 403 }
      );
    }
    const store = storeCheck.store;
    const destStoreId = String(store._id);

    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON request body." },
        { status: 400 }
      );
    }

    const rawIds: string[] = Array.isArray(body.listingIds)
      ? body.listingIds
      : body.listingId
        ? [body.listingId]
        : [];

    if (rawIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "listingId or listingIds array is required.",
        },
        { status: 400 }
      );
    }

    const userStores = await StoreModel.find({
      ownerId: user.id,
      status: { $ne: "deleted" },
    })
      .select("_id")
      .lean();
    const ownedStoreIds = new Set(userStores.map((s: any) => String(s._id)));

    const foundListings = await ListingModel.find(
      { _id: { $in: rawIds } },
      "_id sellerId storeId"
    ).lean();

    const foundMap = new Map(foundListings.map((l: any) => [l._id.toString(), l]));
    const associatedIds: string[] = [];
    const alreadyLinkedIds: string[] = [];
    const sourceStoreIds = new Set<string>();
    const failedItems: { id: string; reason: string }[] = [];

    for (const lid of rawIds) {
      const l = foundMap.get(lid.toString());
      if (!l) {
        failedItems.push({ id: lid, reason: "Listing not found." });
      } else if (String(l.sellerId) !== String(user.id)) {
        failedItems.push({
          id: lid,
          reason: "Forbidden: You do not own this listing.",
        });
      } else if (l.storeId && !ownedStoreIds.has(String(l.storeId))) {
        failedItems.push({
          id: lid,
          reason: "Forbidden: Source store is not owned by your account.",
        });
      } else if (String(l.storeId) === destStoreId) {
        alreadyLinkedIds.push(lid);
      } else {
        if (l.storeId) sourceStoreIds.add(String(l.storeId));
        associatedIds.push(lid);
      }
    }

    if (failedItems.length > 0 && associatedIds.length === 0 && alreadyLinkedIds.length === 0) {
      const hasForbidden = failedItems.some((f) => f.reason.startsWith("Forbidden"));
      return NextResponse.json(
        {
          success: false,
          error: failedItems[0].reason,
          failed: failedItems,
        },
        { status: hasForbidden ? 403 : 404 }
      );
    }

    const now = new Date().toISOString();
    let updateResultCount = 0;

    if (associatedIds.length > 0) {
      const updateResult = await ListingModel.updateMany(
        {
          _id: { $in: associatedIds },
          sellerId: user.id,
        },
        {
          $set: {
            storeId: destStoreId,
            sellerId: String(store.ownerId),
            updatedAt: now,
          },
        }
      );
      updateResultCount = updateResult.modifiedCount;
    }

    // Recompute metrics.listingsCount for destination store and all affected source stores
    const storesToRecount = new Set<string>([destStoreId, ...Array.from(sourceStoreIds)]);
    let destActiveCount = 0;
    for (const sid of storesToRecount) {
      const count = await ListingModel.countDocuments({
        storeId: sid,
        status: "active",
      });
      if (sid === destStoreId) {
        destActiveCount = count;
      }
      await StoreModel.findByIdAndUpdate(sid, {
        $set: {
          "metrics.listingsCount": count,
          updatedAt: now,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: `Moved ${updateResultCount} listing(s) to storefront catalog.`,
      associatedCount: updateResultCount,
      associatedIds,
      alreadyLinkedIds,
      failed: failedItems,
      totalCatalogActiveCount: destActiveCount,
    });
  } catch (error: any) {
    console.error("[POST /api/stores/[id]/listings] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to move listings." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/stores/[id]/listings
 * Unlinking listings from a store so they have no store is prohibited.
 * Every listing must always belong to a store.
 */
export async function DELETE() {
  return NextResponse.json(
    {
      success: false,
      error:
        "Unlinking listings from a store is not permitted. Every listing must belong to a store.",
    },
    { status: 400 }
  );
}
