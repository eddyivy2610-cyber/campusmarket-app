import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import ListingModel, { sanitizeListingInput } from "@/models/Listing";
import StoreModel from "@/models/Store";
import { requireAuth } from "@/lib/authServer";
import { verifyAssetOwnership } from "@/lib/uploadPolicy";

/**
 * GET /api/listings/[id]
 * Fetch a single listing by ID.
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await dbConnect();

    const listing = await ListingModel.findById(id).lean();
    if (!listing) {
      return NextResponse.json(
        { success: false, error: "Listing not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: listing,
    });
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
    const sanitized = sanitizeListingInput(body);

    // Apply allowed updates
    if (sanitized.title !== undefined) listing.title = sanitized.title;
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

    // If store-linked and status changed, refresh store metrics
    if (listing.storeId && previousStatus !== listing.status) {
      const activeCount = await ListingModel.countDocuments({
        storeId: listing.storeId,
        status: "active",
      });
      await StoreModel.findByIdAndUpdate(listing.storeId, {
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
