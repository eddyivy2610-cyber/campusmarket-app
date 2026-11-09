import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import ListingModel, { sanitizeListingInput, toPublicListingDTO } from "@/models/Listing";
import StoreModel, { toPublicStoreDTO } from "@/models/Store";
import SlugRedirectModel from "@/models/SlugRedirect";
import { isValidUUIDv7, deriveSlugSuffix, generateUUIDv7 } from "@/lib/uuidv7";
import { updateSlugPreservingSuffix } from "@/lib/slugUtils";
import { requireAuth, assertUserOwnsStore, getServerAuthUser } from "@/lib/authServer";
import { applyCacheHeaders, isRequestSafeForPublicCache } from "@/lib/cacheHeaders";
import { verifyAssetOwnership } from "@/lib/uploadPolicy";

/**
 * GET /api/listings/[id]
 * Fetch a single listing by ID, PublicId, or Slug.
 * Public responses use explicit store & listing allowlists (never exposing sellerId or owner user fields).
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await dbConnect();

    const cleanId = (id || "").trim();
    let listing: any = null;

    if (isValidUUIDv7(cleanId)) {
      listing = await ListingModel.findOne({ publicId: cleanId }).lean();
    }
    if (!listing && cleanId.match(/^[0-9a-fA-F]{24}$/)) {
      listing = await ListingModel.findById(cleanId).lean();
    }
    if (!listing) {
      listing = await ListingModel.findOne({ slug: cleanId.toLowerCase() }).lean();
    }
    if (!listing) {
      const redirectDoc = await SlugRedirectModel.findOne({
        entityType: { $in: ["listing", "service"] },
        oldSlug: cleanId.toLowerCase(),
      }).lean();
      if (redirectDoc) {
        listing = await ListingModel.findOne({ publicId: redirectDoc.targetPublicId }).lean();
      }
    }

    if (!listing) {
      return NextResponse.json(
        { success: false, error: "Listing not found." },
        { status: 404 }
      );
    }

    let store: any = null;
    if (listing.storeId && mongoose.Types.ObjectId.isValid(String(listing.storeId))) {
      store = await StoreModel.findById(listing.storeId).lean();
    }

    const authUser = getServerAuthUser(req);
    const isOwnerOrAdmin = Boolean(
      authUser &&
        (String(authUser.id) === String(listing.sellerId) ||
          (store && String(authUser.id) === String(store.ownerId)) ||
          authUser.role === "admin")
    );

    if (!store || store.status === "deleted") {
      if (!isOwnerOrAdmin) {
        return NextResponse.json(
          { success: false, error: "Listing not found." },
          { status: 404 }
        );
      }
    } else if (store.status !== "active" && !isOwnerOrAdmin) {
      return NextResponse.json(
        { success: false, error: "This listing's storefront is currently unavailable." },
        { status: 403 }
      );
    }

    if (listing.status !== "active" && !isOwnerOrAdmin) {
      return NextResponse.json(
        { success: false, error: "Listing not found." },
        { status: 404 }
      );
    }

    const publicStore = store ? toPublicStoreDTO(store) : null;
    const dto = toPublicListingDTO(listing, publicStore);

    const res = NextResponse.json({
      success: true,
      data: {
        ...dto,
        store: publicStore,
      },
    });

    const isPublicQuery = listing.status === "active" && store?.status === "active";
    const isPublic = isRequestSafeForPublicCache(req, { isPublicQuery });
    applyCacheHeaders(res, { isPublic, sMaxAge: 60, staleWhileRevalidate: 300 });
    return res;
  } catch (error: any) {
    console.error("[GET /api/listings/[id]] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve listing." },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/listings/[id]
 * Update a listing (e.g. price, status, description, specs, service details).
 * STRICT SECURITY:
 * 1. Authenticated user must be the listing owner (sellerId).
 * 2. If status changes to/from active and listing has storeId, updates store listingsCount.
 * 3. Strips client metrics (views, likes, isPromoted).
 */
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { user, errorResponse } = await requireAuth(req);
    if (!user || errorResponse) return errorResponse;

    const { id } = await context.params;
    await dbConnect();

    const listing = await ListingModel.findById(id);
    if (!listing) {
      return NextResponse.json(
        { success: false, error: "Listing not found." },
        { status: 404 }
      );
    }

    // STRICT OWNER CHECK
    if (listing.sellerId !== user.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Forbidden: You can only edit listings you personally own.",
        },
        { status: 403 }
      );
    }

    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON request body." },
        { status: 400 }
      );
    }

    const previousStatus = listing.status;
    const previousStoreId = String(listing.storeId || "");

    // Verify ownership of current store
    if (previousStoreId) {
      const currentStoreCheck = await assertUserOwnsStore(user.id, previousStoreId, {
        checkSuspended: true,
      });
      if (!currentStoreCheck.ok) {
        return NextResponse.json(
          { success: false, error: currentStoreCheck.error },
          { status: currentStoreCheck.status || 403 }
        );
      }
    }

    // Handle storeId in update payload: cannot be nulled/cleared; moving requires owning both stores
    if (body.storeId !== undefined) {
      if (body.storeId === null || String(body.storeId).trim() === "") {
        return NextResponse.json(
          {
            success: false,
            error: "storeId is required. Every listing must belong to an active store.",
          },
          { status: 400 }
        );
      }
      const nextStoreIdCandidate = String(body.storeId).trim();
      if (nextStoreIdCandidate !== previousStoreId) {
        const targetStoreCheck = await assertUserOwnsStore(user.id, nextStoreIdCandidate, {
          checkSuspended: true,
          requireActive: true,
        });
        if (!targetStoreCheck.ok) {
          return NextResponse.json(
            { success: false, error: targetStoreCheck.error },
            { status: targetStoreCheck.status || 403 }
          );
        }
        listing.storeId = String(targetStoreCheck.store._id);
        listing.sellerId = String(targetStoreCheck.store.ownerId);
      }
    }

    const sanitized = sanitizeListingInput(body);

    // Apply allowed updates
    if (sanitized.title !== undefined) {
      if (sanitized.title !== listing.title) {
        const oldSlug = listing.slug;
        const suffix = listing.slugSuffix || deriveSlugSuffix(listing.publicId || generateUUIDv7(), 8);
        listing.title = sanitized.title;
        listing.slugSuffix = suffix;
        const newSlug = updateSlugPreservingSuffix(sanitized.title, suffix);
        listing.slug = newSlug;

        if (oldSlug && oldSlug !== newSlug && listing.publicId) {
          try {
            await (SlugRedirectModel as any).findOneAndUpdate(
              { entityType: listing.listingType || "listing", oldSlug },
              {
                $set: {
                  targetPublicId: listing.publicId,
                  canonicalSlug: newSlug,
                },
              },
              { upsert: true }
            );
          } catch (redErr) {
            console.warn("Could not record slug redirect:", redErr);
          }
        }
      }
    }
    if (sanitized.description !== undefined) listing.description = sanitized.description;
    if (sanitized.category !== undefined) listing.category = sanitized.category;
    if (sanitized.subcategory !== undefined) listing.subcategory = sanitized.subcategory;
    if (sanitized.campus !== undefined) listing.campus = sanitized.campus;
    if (sanitized.location !== undefined) listing.location = sanitized.location;
    if (sanitized.images !== undefined) {
      if (!Array.isArray(sanitized.images)) {
        return NextResponse.json(
          { success: false, error: "Images must be an array of URLs." },
          { status: 400 }
        );
      }
      for (const imgUrl of sanitized.images) {
        if (
          typeof imgUrl !== "string" ||
          imgUrl.includes("/authenticated/") ||
          imgUrl.includes("campushive/private_docs")
        ) {
          return NextResponse.json(
            { success: false, error: "Invalid image URL or private document provided as listing image." },
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
      listing.images = sanitized.images;
    }
    if (sanitized.condition !== undefined) listing.condition = sanitized.condition;
    if (sanitized.serviceDetails !== undefined) listing.serviceDetails = sanitized.serviceDetails;
    if (sanitized.categoryFields !== undefined) listing.categoryFields = sanitized.categoryFields;

    if (body.price !== undefined) {
      const numPrice = Number(body.price);
      if (isNaN(numPrice) || numPrice < 0) {
        return NextResponse.json(
          { success: false, error: "Price must be a non-negative number." },
          { status: 400 }
        );
      }
      listing.price = numPrice;
      listing.priceFormatted = `₦${Math.round(numPrice).toLocaleString("en-NG")}`;
    }

    if (body.status !== undefined) {
      const targetStatus = body.status.toLowerCase();
      // CRITICAL CHECK B: Seller cannot self-activate a rejected, pending_review, or removed listing
      if (
        (previousStatus === "rejected" ||
          previousStatus === "pending_review" ||
          previousStatus === "removed") &&
        targetStatus === "active"
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Forbidden: Cannot self-activate a listing that is rejected, under pending review, or removed by moderation.",
          },
          { status: 403 }
        );
      }

      const allowedStatuses = ["active", "paused", "sold", "draft", "removed"];
      if (allowedStatuses.includes(targetStatus)) {
        listing.status = targetStatus as any;
      }
    }

    listing.updatedAt = new Date().toISOString();
    await listing.save();

    // Refresh store metrics if status or storeId changed
    const currentStoreId = String(listing.storeId || "");
    const storesToRefresh = new Set<string>();
    if (previousStatus !== listing.status && currentStoreId) {
      storesToRefresh.add(currentStoreId);
    }
    if (previousStoreId && previousStoreId !== currentStoreId) {
      storesToRefresh.add(previousStoreId);
      if (currentStoreId) storesToRefresh.add(currentStoreId);
    }

    for (const sid of storesToRefresh) {
      const activeCount = await ListingModel.countDocuments({
        storeId: sid,
        status: "active",
      });
      await StoreModel.findByIdAndUpdate(sid, {
        "metrics.listingsCount": activeCount,
        updatedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      data: listing,
      message: "Listing updated successfully.",
    });
  } catch (error: any) {
    if (error?.name === "VersionError" || error instanceof mongoose.Error.VersionError) {
      return NextResponse.json(
        {
          success: false,
          error: "Conflict: This listing was updated by another process. Please reload and try again.",
        },
        { status: 409 }
      );
    }
    console.error("[PATCH /api/listings/[id]] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update listing." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/listings/[id]
 * Permanently delete a listing.
 * STRICT SECURITY:
 * Authenticated user must own the listing.
 */
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { user, errorResponse } = await requireAuth(req);
    if (!user || errorResponse) return errorResponse;

    const { id } = await context.params;
    await dbConnect();

    const listing = await ListingModel.findById(id);
    if (!listing) {
      return NextResponse.json(
        { success: false, error: "Listing not found." },
        { status: 404 }
      );
    }

    // STRICT OWNER CHECK
    if (listing.sellerId !== user.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Forbidden: You can only delete listings you personally own.",
        },
        { status: 403 }
      );
    }

    const linkedStoreId = listing.storeId;
    await ListingModel.findByIdAndDelete(id);

    // Refresh store listings count if it was linked
    if (linkedStoreId) {
      const activeCount = await ListingModel.countDocuments({
        storeId: linkedStoreId,
        status: "active",
      });
      await StoreModel.findByIdAndUpdate(linkedStoreId, {
        "metrics.listingsCount": activeCount,
        updatedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      message: "Listing deleted permanently.",
    });
  } catch (error: any) {
    console.error("[DELETE /api/listings/[id]] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete listing." },
      { status: 500 }
    );
  }
}
