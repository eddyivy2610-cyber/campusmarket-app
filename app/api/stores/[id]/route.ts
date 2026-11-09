import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import StoreModel, { sanitizeStoreInput } from "@/models/Store";
import UserModel from "@/models/User";
import { requireAuth, assertUserOwnsStore } from "@/lib/authServer";
import { executeInTransaction } from "@/lib/transactionHelper";

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

    // Query by MongoDB ObjectId, OwnerId, Slug, or Owner Handle
    let store = null;
    const cleanId = id.trim();
    const isMe = cleanId.toLowerCase() === "me";

    if (isMe) {
      const { getServerAuthUser } = await import("@/lib/authServer");
      const authUser = getServerAuthUser(req);
      if (authUser?.id) {
        store = await StoreModel.findOne({ ownerId: authUser.id })
          .select("-businessApplicationId")
          .lean();
      }
    } else if (cleanId.match(/^[0-9a-fA-F]{24}$/)) {
      store = await StoreModel.findById(cleanId).select("-businessApplicationId").lean();
      if (!store) {
        store = await StoreModel.findOne({ ownerId: cleanId }).select("-businessApplicationId").lean();
      }
    }

    if (!store && !isMe) {
      const escapedSlug = cleanId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      store = await StoreModel.findOne({
        slug: { $regex: new RegExp(`^${escapedSlug}$`, "i") },
      })
        .select("-businessApplicationId")
        .lean();
    }

    if (!store) {
      const normalizedHandle = cleanId.replace(/^@/, "").trim().toLowerCase();
      let matchedUser: any = null;

      if (isMe) {
        const { getServerAuthUser } = await import("@/lib/authServer");
        const authUser = getServerAuthUser(req);
        if (authUser?.id) {
          matchedUser = await UserModel.findById(authUser.id).select("-password").lean();
        }
      } else {
        const userOrConditions: any[] = [{ "profile.handle": normalizedHandle }];
        if (cleanId.match(/^[0-9a-fA-F]{24}$/)) {
          userOrConditions.push({ _id: cleanId });
        }
        matchedUser = await UserModel.findOne({ $or: userOrConditions })
          .select("-password")
          .lean();

        if (!matchedUser) {
          // Case-insensitive name/handle search fallback
          matchedUser = await UserModel.findOne({
            $or: [
              { name: { $regex: new RegExp(`^${normalizedHandle.replace(/-/g, " ")}$`, "i") } },
              { "profile.displayName": { $regex: new RegExp(`^${normalizedHandle.replace(/-/g, " ")}$`, "i") } },
            ],
          })
            .select("-password")
            .lean();
        }
      }

      if (matchedUser) {
        store = await StoreModel.findOne({ ownerId: String(matchedUser._id) })
          .select("-businessApplicationId")
          .lean();

        // If user does not have a separate store document, synthesize a user profile storefront
        if (!store) {
          const userHandle =
            matchedUser.profile?.handle ||
            String(matchedUser.name || "user")
              .toLowerCase()
              .replace(/[^a-z0-9]/g, "");

          store = {
            _id: String(matchedUser._id),
            id: String(matchedUser._id),
            ownerId: String(matchedUser._id),
            name: matchedUser.profile?.displayName || matchedUser.name || "Campus Member",
            slug: userHandle,
            description: matchedUser.profile?.bio || `Campus profile for ${matchedUser.name || "Member"}.`,
            storeType: matchedUser.isStudent ? "student_store" : "approved_business",
            category: "Campus Member",
            campus: matchedUser.campus || "Main Campus",
            operatingLocation: matchedUser.campus || "Main Campus",
            logo: matchedUser.profile?.avatar || "",
            coverImage: matchedUser.profile?.coverImage || "",
            status: "active",
            isVerified: Boolean(matchedUser.studentVerified || matchedUser.isStudent),
            verificationType: "student",
            contact: {
              phone: matchedUser.profile?.phone,
              whatsapp: matchedUser.profile?.whatsapp,
              email: matchedUser.email,
            },
            metrics: {
              rating: matchedUser.rating?.average || 5.0,
              reviewsCount: matchedUser.rating?.count || 0,
              completedDeals: 0,
              listingsCount: 0,
            },
          };
        }
      }
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

    // Query authoritative follower count from FollowerModel
    const { default: FollowerModel } = await import("@/models/Follower");
    const targetObjectId = store._id;
    const actualFollowersCount = await FollowerModel.countDocuments({
      followingId: targetObjectId,
    });

    // Check if current viewing user follows this store
    let isViewerFollowing = false;
    try {
      const { getServerAuthUser } = await import("@/lib/authServer");
      const viewer = getServerAuthUser(req);
      if (viewer?.id) {
        const followDoc = await FollowerModel.exists({
          followerId: viewer.id,
          followingId: targetObjectId,
        });
        isViewerFollowing = Boolean(followDoc);
      }
    } catch {}

    const payload = {
      ...store,
      isFollowing: isViewerFollowing,
      metrics: {
        ...(store.metrics || {}),
        followersCount: actualFollowersCount,
      },
    };

    return NextResponse.json({
      success: true,
      data: payload,
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

    const ListingModel = (await import("@/models/Listing")).default;
    await executeInTransaction(async (session) => {
      const sessionOptions = session ? { session } : undefined;
      await ListingModel.updateMany({ storeId: id }, { $unset: { storeId: "" } }, sessionOptions);
      await StoreModel.findByIdAndDelete(id, sessionOptions);
      await UserModel.findByIdAndUpdate(
        user.id,
        { $set: { role: "buyer", sellerStatus: "none" }, $inc: { tokenVersion: 1 } },
        sessionOptions
      );
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
