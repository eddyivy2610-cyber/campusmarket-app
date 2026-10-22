import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import StoreModel, { sanitizeStoreInput } from "@/models/Store";
import { requireAuth, assertUserOwnsStore } from "@/lib/authServer";

/**
 * GET /api/stores/[id]
 * Public store profile query by ID or Slug.
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await dbConnect();

    // Query by MongoDB ObjectId or Slug
    let store = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      store = await StoreModel.findById(id).select("-businessApplicationId").lean();
    }
    if (!store) {
      store = await StoreModel.findOne({ slug: id }).select("-businessApplicationId").lean();
    }

    if (!store) {
      return NextResponse.json(
        { success: false, error: "Storefront not found." },
        { status: 404 }
      );
    }

    // Visibility: If suspended or pending_review, allow only the authenticated owner to inspect
    if (store.status === "suspended" || store.status === "pending_review") {
      const { getServerAuthUser } = await import("@/lib/authServer");
      const authUser = getServerAuthUser(req);
      if (!authUser || authUser.id !== store.ownerId) {
        return NextResponse.json(
          {
            success: false,
            error:
              store.status === "suspended"
                ? "This storefront is currently suspended."
                : "This storefront is awaiting administrator review.",
          },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      data: store,
    });
  } catch (error: any) {
    console.error("[GET /api/stores/[id]] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch storefront profile." },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/stores/[id]
 * Update store settings (name, description, category, operatingLocation, contact, logo, coverImage).
 * STRICT SECURITY:
 * 1. Authenticated user must own the store.
 * 2. Store must not be suspended.
 * 3. Prevents client manipulation of status, verification flags, and metrics.
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

    // 1. Verify store ownership and active status
    const storeCheck = await assertUserOwnsStore(user.id, id, {
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

    // 2. Sanitize inputs (strictly strips status, metrics, isVerified)
    const sanitized = sanitizeStoreInput(body);

    // Apply allowed updates
    if (sanitized.name) store.name = sanitized.name;
    if (sanitized.description !== undefined) store.description = sanitized.description;
    if (sanitized.category) store.category = sanitized.category;
    if (sanitized.categoryTags) store.categoryTags = sanitized.categoryTags;
    if (sanitized.operatingLocation) store.operatingLocation = sanitized.operatingLocation;
    if (sanitized.campusCity !== undefined) store.campusCity = sanitized.campusCity;
    if (sanitized.logo) store.logo = sanitized.logo;
    if (sanitized.coverImage !== undefined) store.coverImage = sanitized.coverImage;
    if (sanitized.contact) {
      store.contact = {
        ...store.contact,
        ...sanitized.contact,
      };
    }

    // 3. Status transitions permitted for storefront owner:
    // Vendor can toggle vacation/pause mode, but cannot bypass suspension or pending review
    if (body.status !== undefined) {
      const targetStatus = String(body.status).toLowerCase();
      if (targetStatus === "paused" && store.status === "active") {
        store.status = "paused";
      } else if (targetStatus === "active" && store.status === "paused") {
        store.status = "active";
      }
    }

    store.updatedAt = new Date().toISOString();
    await store.save();

    return NextResponse.json({
      success: true,
      data: store,
      message: "Storefront settings updated successfully.",
    });
  } catch (error: any) {
    console.error("[PATCH /api/stores/[id]] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update storefront settings." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/stores/[id]
 * Delete storefront and dissociate linked catalog items.
 * STRICT SECURITY:
 * Authenticated user must own the store (assertUserOwnsStore).
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

    // Verify store ownership
    const storeCheck = await assertUserOwnsStore(user.id, id, {
      checkSuspended: false,
    });
    if (!storeCheck.ok) {
      return NextResponse.json(
        { success: false, error: storeCheck.error },
        { status: storeCheck.status || 403 }
      );
    }

    // Unlink any associated catalog listings
    const ListingModel = (await import("@/models/Listing")).default;
    await ListingModel.updateMany({ storeId: id }, { $unset: { storeId: "" } });

    // Delete storefront
    await StoreModel.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Storefront deleted successfully.",
    });
  } catch (error: any) {
    console.error("[DELETE /api/stores/[id]] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete storefront." },
      { status: 500 }
    );
  }
}
