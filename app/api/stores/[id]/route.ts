import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import StoreModel, {
  sanitizeStoreInput,
  validateStoreSlugFormat,
  generateSlugSuggestions,
  toPublicStoreDTO,
  isDuplicateSlugError,
} from "@/models/Store";
import UserModel from "@/models/User";
import SlugRedirectModel from "@/models/SlugRedirect";
import {
  SLUG_RENAME_COOLDOWN_MS,
  SLUG_RESERVATION_DURATION_MS,
} from "@/constants/enums";
import {
  requireAuth,
  assertUserOwnsStore,
  getServerAuthUser,
  deriveAndSyncSellerRole,
} from "@/lib/authServer";
import { applyCacheHeaders, isRequestSafeForPublicCache } from "@/lib/cacheHeaders";
import { executeInTransaction } from "@/lib/transactionHelper";

/**
 * GET /api/stores/[id]
 * Public store profile query by Store ID, PublicId, or Slug.
 * - Never looks up stores by user handle, user name, or user ownerId.
 * - Resolves old renamed slugs via SlugRedirectModel.
 * - Builds response strictly from the public store allowlist (toPublicStoreDTO),
 *   identical for anonymous and authenticated visitors (no viewer-specific isFollowing).
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

    // Check slug redirect if store was renamed or deleted
    let redirectedFromSlug: string | null = null;
    if (!store) {
      const redirectDoc = await SlugRedirectModel.findOne({
        entityType: "store",
        oldSlug: lowerSlug,
      }).lean();

      if (redirectDoc) {
        if (redirectDoc.reason === "deletion") {
          return NextResponse.json(
            { success: false, error: "Storefront not found." },
            { status: 404 }
          );
        }
        if (redirectDoc.targetStoreId && redirectDoc.targetStoreId.match(/^[0-9a-fA-F]{24}$/)) {
          store = await StoreModel.findById(redirectDoc.targetStoreId).lean();
        }
        if (!store && redirectDoc.canonicalSlug) {
          store = await StoreModel.findOne({
            $or: [
              { slugLower: redirectDoc.canonicalSlug.toLowerCase() },
              { publicId: redirectDoc.targetPublicId },
            ],
          }).lean();
        }
        if (store) {
          redirectedFromSlug = lowerSlug;
        }
      }
    }

    if (!store || store.status === "deleted") {
      return NextResponse.json(
        { success: false, error: "Storefront not found." },
        { status: 404 }
      );
    }

    // Visibility: If not active (suspended, pending_review, paused, rejected), allow only owner or admin
    if (store.status !== "active") {
      const authUser = getServerAuthUser(req);
      const isOwnerOrAdmin =
        authUser &&
        (String(authUser.id) === String(store.ownerId) || authUser.role === "admin");

      if (!isOwnerOrAdmin) {
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

      const { default: FollowerModel } = await import("@/models/Follower");
      const actualFollowersCount = await FollowerModel.countDocuments({
        followingId: store._id,
      });

      const privateRes = NextResponse.json({
        success: true,
        data: toPublicStoreDTO(store, actualFollowersCount),
      });
      privateRes.headers.set("Cache-Control", "private, no-store, must-revalidate");
      return privateRes;
    }

    // Query authoritative follower count from FollowerModel
    const { default: FollowerModel } = await import("@/models/Follower");
    const targetObjectId = store._id;
    const actualFollowersCount = await FollowerModel.countDocuments({
      followingId: targetObjectId,
    });

    // Fall back to owner's avatar URL string only if store logo is empty
    if (!store.logo || store.logo.trim() === "") {
      try {
        const ownerDoc = await UserModel.findById(store.ownerId)
          .select("profile.avatar")
          .lean();
        if (ownerDoc?.profile?.avatar) {
          store.logo = ownerDoc.profile.avatar;
        }
      } catch {}
    }

    const dto = toPublicStoreDTO(store, actualFollowersCount);

    const responseBody: Record<string, any> = {
      success: true,
      data: dto,
    };

    if (redirectedFromSlug && dto) {
      responseBody.redirect = true;
      responseBody.oldSlug = redirectedFromSlug;
      responseBody.canonicalSlug = dto.slug;
      responseBody.redirectTo = `/store/${dto.slug}`;
    }

    const res = NextResponse.json(responseBody);
    const isPublic = isRequestSafeForPublicCache(req, { isPublicQuery: true });
    applyCacheHeaders(res, { isPublic, sMaxAge: 60, staleWhileRevalidate: 300 });
    return res;
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
 * Update store settings (name, slug, description, category, operatingLocation, contact, logo, coverImage, showOwnerName).
 * STRICT SECURITY:
 * 1. Authenticated user must own the store (resolved by path store ID, never implicit).
 * 2. Store must not be suspended or deleted.
 * 3. Enforces slug format, reserved words, reservation check, and 7-day rename cooldown.
 */
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  let requestedNewSlug = "";
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

    // 2. Handle slug rename if requested
    if (body.slug !== undefined) {
      const candidateSlug = String(body.slug || "").toLowerCase().trim();
      const currentSlug = String(store.slugLower || store.slug || "").toLowerCase().trim();

      if (candidateSlug !== currentSlug) {
        const formatCheck = validateStoreSlugFormat(candidateSlug);
        if (!formatCheck.valid) {
          return NextResponse.json(
            { success: false, error: formatCheck.error },
            { status: 400 }
          );
        }
        requestedNewSlug = formatCheck.slug;

        // Enforce rename cooldown (7 days)
        if (store.slugUpdatedAt) {
          const lastRenamedMs = new Date(store.slugUpdatedAt).getTime();
          if (!Number.isNaN(lastRenamedMs)) {
            const elapsedMs = Date.now() - lastRenamedMs;
            if (elapsedMs < SLUG_RENAME_COOLDOWN_MS) {
              const remainingDays = Math.ceil(
                (SLUG_RENAME_COOLDOWN_MS - elapsedMs) / (24 * 60 * 60 * 1000)
              );
              return NextResponse.json(
                {
                  success: false,
                  error: `Store slug was recently changed. You can rename this store again in ${remainingDays} day(s).`,
                },
                { status: 429 }
              );
            }
          }
        }

        // Check if slug is already used by another store or reserved in SlugRedirectModel
        const existingWithSlug = await StoreModel.findOne({
          slugLower: requestedNewSlug,
          _id: { $ne: store._id },
        }).lean();

        const reservedRedirect = await SlugRedirectModel.findOne({
          entityType: "store",
          oldSlug: requestedNewSlug,
        }).lean();

        const isReservedByOther =
          reservedRedirect &&
          (!reservedRedirect.reservedUntil ||
            new Date(reservedRedirect.reservedUntil) > new Date()) &&
          (reservedRedirect.reason === "deletion" ||
            String(reservedRedirect.targetStoreId || "") !== String(store._id));

        if (existingWithSlug || isReservedByOther) {
          const suggestions = await generateSlugSuggestions(requestedNewSlug);
          return NextResponse.json(
            {
              success: false,
              error: `The slug "${requestedNewSlug}" is unavailable.`,
              suggestions,
            },
            { status: 409 }
          );
        }

        const nowDate = new Date();
        const reservedUntil = new Date(nowDate.getTime() + SLUG_RESERVATION_DURATION_MS);

        // If renaming back to a slug previously owned by this same store, remove the old redirect entry
        await SlugRedirectModel.deleteOne({
          entityType: "store",
          oldSlug: requestedNewSlug,
          targetStoreId: String(store._id),
        });

        // Record redirect and 30-day reservation for the old slug
        await SlugRedirectModel.findOneAndUpdate(
          { entityType: "store", oldSlug: currentSlug },
          {
            $set: {
              entityType: "store",
              oldSlug: currentSlug,
              targetPublicId: store.publicId || String(store._id),
              targetStoreId: String(store._id),
              canonicalSlug: requestedNewSlug,
              previousOwnerId: user.id,
              reason: "rename",
              reservedUntil,
            },
          },
          { upsert: true }
        );

        // Update any older redirects pointing to this store to point to the new canonicalSlug
        await SlugRedirectModel.updateMany(
          {
            entityType: "store",
            targetStoreId: String(store._id),
            reason: "rename",
          },
          { $set: { canonicalSlug: requestedNewSlug } }
        );

        store.slug = requestedNewSlug;
        store.slugLower = requestedNewSlug;
        store.slugUpdatedAt = nowDate.toISOString();
      }
    }

    // 3. Sanitize inputs (strictly strips status, metrics, isVerified, ownerId)
    const sanitized = sanitizeStoreInput(body);

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
    if (typeof sanitized.showOwnerName === "boolean") {
      store.showOwnerName = sanitized.showOwnerName;
      if (sanitized.showOwnerName && !store.ownerFullName) {
        const ownerUser = await UserModel.findById(user.id).select("name").lean();
        if (ownerUser?.name) {
          store.ownerFullName = ownerUser.name;
        }
      }
    }

    // 4. Status transitions permitted for storefront owner:
    // Vendor can toggle vacation/pause mode, but cannot bypass suspension or pending review
    if (body.status !== undefined) {
      const targetStatus = String(body.status).toLowerCase();
      if (targetStatus === "paused" && store.status === "active") {
        store.status = "paused";
        store.pausedBy = "seller";
      } else if (targetStatus === "active" && store.status === "paused" && store.pausedBy !== "admin") {
        store.status = "active";
        store.pausedBy = undefined;
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
    if (isDuplicateSlugError(error)) {
      const suggestions = await generateSlugSuggestions(requestedNewSlug || "store");
      return NextResponse.json(
        {
          success: false,
          error: "That store slug is already taken.",
          suggestions,
        },
        { status: 409 }
      );
    }
    console.error("[PATCH /api/stores/[id]] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update storefront settings." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/stores/[id]
 * Soft-deletes a storefront, marks its listings as removed (removedBy: "store_deletion"),
 * reserves its slug for SLUG_RESERVATION_DURATION_MS, decrements user's storesCount,
 * and derives seller capability from remaining non-deleted stores.
 * Deleting one store NEVER demotes a user who still owns another non-deleted store.
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

    const store = storeCheck.store;
    const storeIdStr = String(store._id);
    const originalSlug = String(store.slugLower || store.slug).toLowerCase();
    const archivedSlug = `deleted-${storeIdStr.slice(-6)}-${Date.now()}-${originalSlug}`.slice(0, 80);
    const now = new Date();
    const nowIso = now.toISOString();
    const reservedUntil = new Date(now.getTime() + SLUG_RESERVATION_DURATION_MS);

    const ListingModel = (await import("@/models/Listing")).default;

    await executeInTransaction(async (session) => {
      const sessionOptions = session ? { session } : undefined;

      // 1. Mark store as deleted and free its unique slug while reserving it in SlugRedirectModel
      await StoreModel.updateOne(
        { _id: store._id, status: { $ne: "deleted" } },
        {
          $set: {
            status: "deleted",
            deletedAt: nowIso,
            updatedAt: nowIso,
            slug: archivedSlug,
            slugLower: archivedSlug,
            "metrics.listingsCount": 0,
          },
        },
        sessionOptions
      );

      // 2. Reserve the old slug so it cannot be immediately cycled/hijacked
      await SlugRedirectModel.findOneAndUpdate(
        { entityType: "store", oldSlug: originalSlug },
        {
          $set: {
            entityType: "store",
            oldSlug: originalSlug,
            targetPublicId: store.publicId || storeIdStr,
            targetStoreId: storeIdStr,
            canonicalSlug: archivedSlug,
            previousOwnerId: user.id,
            reason: "deletion",
            reservedUntil,
          },
        },
        { upsert: true, ...(sessionOptions || {}) }
      );

      // 3. Cascade listings belonging to this store to status: "removed", removedBy: "store_deletion"
      // (Never unset storeId; every listing always retains its storeId)
      await ListingModel.updateMany(
        { storeId: storeIdStr, status: { $ne: "removed" } },
        {
          $set: {
            status: "removed",
            removedBy: "store_deletion",
            updatedAt: nowIso,
          },
        },
        sessionOptions
      );

      // 4. Recompute storesCount, studentStoresCount, and seller role in the same transaction
      await deriveAndSyncSellerRole(user.id, session || undefined);
    });

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
