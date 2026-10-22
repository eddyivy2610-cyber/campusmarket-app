import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import ListingModel from "@/models/Listing";
import StoreModel from "@/models/Store";
import { requireAuth, assertUserOwnsStore, getServerAuthUser } from "@/lib/authServer";

/**
 * GET /api/stores/[id]/listings
 * Retrieve catalog items belonging to a storefront.
 * STRICT VISIBILITY RULES:
 * 1. Store must exist.
 * 2. If store is suspended, public viewers receive 403 Forbidden (only authenticated owner can inspect).
 * 3. Public viewers can ONLY see status: "active" listings. Store owner can see all (or filter by status).
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await dbConnect();

    // 1. Resolve store by ObjectId or slug
    let store = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      store = await StoreModel.findById(id).lean();
    }
    if (!store) {
      store = await StoreModel.findOne({ slug: id }).lean();
    }

    if (!store) {
      return NextResponse.json(
        { success: false, error: "Storefront not found." },
        { status: 404 }
      );
    }

    const authUser = getServerAuthUser(req);
    const isOwner = authUser && authUser.id === store.ownerId;

    // Visibility: Suspended stores cannot be viewed publicly
    if (store.status === "suspended" && !isOwner) {
      return NextResponse.json(
        { success: false, error: "This storefront is currently suspended." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // "product" | "service"
    const requestedStatus = searchParams.get("status") || "active";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "30", 10)));

    const filter: Record<string, any> = { storeId: store._id.toString() };

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
    const listings = await ListingModel.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      data: listings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
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
 * Associate existing user listing(s) with this storefront.
 * STRICT SECURITY & INTEGRITY:
 * 1. Authenticated user must own the store.
 * 2. Store must NOT be suspended.
 * 3. Supports single { listingId } and batch { listingIds: [...] }.
 * 4. Checks ownership (sellerId === user.id) on EVERY listing.
 * 5. Idempotent: Prevents duplicate associations.
 * 6. Consistently recalculates store metrics.listingsCount via countDocuments.
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

    // 1. Verify store ownership and permitted status (suspended check)
    const storeCheck = await assertUserOwnsStore(user.id, storeId, {
      checkSuspended: true,
    });
    if (!storeCheck.ok) {
      return NextResponse.json(
        { success: false, error: storeCheck.error },
        { status: storeCheck.status || 403 }
      );
    }
    const store = storeCheck.store;

    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON request body." },
        { status: 400 }
      );
    }

    // Normalize inputs to support single listingId or array of listingIds
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

    const foundListings = await ListingModel.find(
      { _id: { $in: rawIds } },
      "_id sellerId storeId"
    ).lean();

    const foundMap = new Map(foundListings.map((l: any) => [l._id.toString(), l]));
    const associatedIds: string[] = [];
    const alreadyLinkedIds: string[] = [];
    const failedItems: { id: string; reason: string }[] = [];

    for (const lid of rawIds) {
      const l = foundMap.get(lid.toString());
      if (!l) {
        failedItems.push({ id: lid, reason: "Listing not found." });
      } else if (l.sellerId !== user.id) {
        failedItems.push({
          id: lid,
          reason: "Forbidden: You do not own this listing.",
        });
      } else if (l.storeId === store._id.toString()) {
        alreadyLinkedIds.push(lid);
      } else {
        associatedIds.push(lid);
      }
    }

    // 2. Single updateMany on owned, unlinked listings
    const now = new Date().toISOString();
    let updateResultCount = 0;

    if (associatedIds.length > 0) {
      const updateResult = await ListingModel.updateMany(
        {
          _id: { $in: associatedIds },
          sellerId: user.id,
          $or: [
            { storeId: null },
            { storeId: { $exists: false } },
            { storeId: "" },
          ],
        },
        {
          $set: {
            storeId: store._id.toString(),
            updatedAt: now,
          },
        }
      );
      updateResultCount = updateResult.modifiedCount;
    }

    // 3. Recount via $set
    const activeCount = await ListingModel.countDocuments({
      storeId: store._id.toString(),
      status: "active",
    });

    await StoreModel.findByIdAndUpdate(store._id, {
      $set: {
        "metrics.listingsCount": activeCount,
        updatedAt: now,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Associated ${updateResultCount} listing(s) with storefront catalog.`,
      associatedCount: updateResultCount,
      associatedIds,
      alreadyLinkedIds,
      failed: failedItems,
      totalCatalogActiveCount: activeCount,
    });
  } catch (error: any) {
    console.error("[POST /api/stores/[id]/listings] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to associate listings." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/stores/[id]/listings
 * Disassociate a listing from this storefront.
 * STRICT SECURITY:
 * Removes store association while preserving the original listing history and properties.
 */
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { user, errorResponse } = await requireAuth(req);
    if (!user || errorResponse) return errorResponse;

    const { id: storeId } = await context.params;
    await dbConnect();

    // 1. Verify store ownership
    const storeCheck = await assertUserOwnsStore(user.id, storeId, {
      checkSuspended: false,
    });
    if (!storeCheck.ok) {
      return NextResponse.json(
        { success: false, error: storeCheck.error },
        { status: storeCheck.status || 403 }
      );
    }
    const store = storeCheck.store;

    const { searchParams } = new URL(req.url);
    const paramId = searchParams.get("listingId");
    const paramIds = searchParams.get("listingIds");
    let rawIds: string[] = [];

    if (paramIds) {
      rawIds = paramIds.split(",").map((s) => s.trim()).filter(Boolean);
    } else if (paramId) {
      rawIds = [paramId.trim()];
    } else {
      try {
        const body = await req.json();
        if (Array.isArray(body.listingIds)) rawIds = body.listingIds;
        else if (body.listingId) rawIds = [body.listingId];
      } catch {}
    }

    if (rawIds.length === 0) {
      return NextResponse.json(
        { success: false, error: "listingId or listingIds parameter is required." },
        { status: 400 }
      );
    }

    // If single listing provided, check ownership & existence for precise error feedback
    if (rawIds.length === 1) {
      const singleListing = await ListingModel.findById(rawIds[0]).lean();
      if (!singleListing) {
        return NextResponse.json(
          { success: false, error: "Listing not found." },
          { status: 404 }
        );
      }
      if (singleListing.sellerId !== user.id) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Forbidden: You can only manage listings that you personally own.",
          },
          { status: 403 }
        );
      }
    }

    // 2. Single updateMany (owned, linked listings) for unlink
    const now = new Date().toISOString();
    const unlinkResult = await ListingModel.updateMany(
      {
        _id: { $in: rawIds },
        sellerId: user.id,
        storeId: store._id.toString(),
      },
      {
        $unset: { storeId: "" },
        $set: { updatedAt: now },
      }
    );

    // 3. Recount via $set
    const activeCount = await ListingModel.countDocuments({
      storeId: store._id.toString(),
      status: "active",
    });

    await StoreModel.findByIdAndUpdate(store._id, {
      $set: {
        "metrics.listingsCount": activeCount,
        updatedAt: now,
      },
    });

    return NextResponse.json({
      success: true,
      message:
        "Listing disassociated from storefront. It remains accessible in your personal listings.",
      disassociatedCount: unlinkResult.modifiedCount,
      totalCatalogActiveCount: activeCount,
    });
  } catch (error: any) {
    console.error("[DELETE /api/stores/[id]/listings] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to remove listing." },
      { status: 500 }
    );
  }
}
