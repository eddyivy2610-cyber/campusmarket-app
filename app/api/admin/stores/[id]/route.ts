import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import StoreModel from "@/models/Store";
import ListingModel from "@/models/Listing";
import { requireAdmin } from "@/lib/authServer";
import { executeInTransaction } from "@/lib/transactionHelper";
import { logAdminAudit } from "@/lib/adminAudit";
import { getRequestId } from "@/lib/apiResponse";

export const dynamic = "force-dynamic";

/**
 * PATCH /api/admin/stores/[id]
 * Oversight actions: suspend, restore, or pause a store with atomic, reversible listing cascades.
 */
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { admin, errorResponse } = await requireAdmin(req);
    if (!admin || errorResponse) return errorResponse;

    const { id } = await context.params;
    await dbConnect();

    if (
      !id ||
      !mongoose.Types.ObjectId.isValid(id) ||
      StoreModel.db?.readyState !== 1
    ) {
      return NextResponse.json(
        { success: false, error: "Store not found." },
        { status: 404 }
      );
    }

    const store = await StoreModel.findById(id);
    if (!store) {
      return NextResponse.json(
        { success: false, error: "Store not found." },
        { status: 404 }
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

    const { action, reason } = body;
    const effectiveReason = String(reason || body.suspensionReason || "").trim();

    if (
      ![
        "suspend",
        "restore",
        "pause",
        "approve",
        "ban",
        "toggle_verify",
        "reset_slug_cooldown",
      ].includes(action)
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid action. Supported actions are 'suspend', 'restore', 'pause', 'approve', 'ban', 'toggle_verify', or 'reset_slug_cooldown'.",
        },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const requestId = getRequestId(req);

    const result = await executeInTransaction(async (session) => {
      const sessionOpts = session ? { session } : {};

      if (action === "suspend") {
        if (!effectiveReason) {
          throw new Error("A suspension reason is required for administrative audit.");
        }

        const updatedStore = await StoreModel.findByIdAndUpdate(
          id,
          {
            $set: {
              status: "suspended",
              suspendedBy: "store_suspension",
              suspensionReason: effectiveReason,
              updatedAt: now,
            },
          },
          { returnDocument: "after", ...sessionOpts }
        );

        // Cascade to active listings belonging to this store
        // Mark pausedBy: "store_suspension" (preserves seller-paused listings)
        const listingRes = await ListingModel.updateMany(
          { storeId: id, status: "active" },
          {
            $set: {
              status: "paused",
              pausedBy: "store_suspension",
              updatedAt: now,
            },
          },
          sessionOpts
        );

        await StoreModel.findByIdAndUpdate(
          id,
          { $set: { "metrics.listingsCount": 0 } },
          sessionOpts
        );

        await logAdminAudit({
          actorId: admin.id,
          actorEmail: admin.email,
          targetType: "store",
          targetId: id,
          action: "suspend",
          requestId,
          reason: effectiveReason,
          before: { status: store.status, isVerified: store.isVerified },
          after: { status: updatedStore?.status, isVerified: updatedStore?.isVerified },
          details: {
            listingsPaused: listingRes.modifiedCount,
          },
          session: session || undefined,
        });

        return {
          store: updatedStore,
          message: "Store suspended.",
          listingsAffected: listingRes.modifiedCount,
        };
      }

      if (action === "restore") {
        const updatedStore = await StoreModel.findByIdAndUpdate(
          id,
          {
            $set: {
              status: "active",
              updatedAt: now,
            },
            $unset: {
              suspendedBy: "",
              suspensionReason: "",
            },
          },
          { returnDocument: "after", ...sessionOpts }
        );

        // Reversible restore for listings: only restore listings paused by store suspension
        const listingRes = await ListingModel.updateMany(
          {
            storeId: id,
            status: "paused",
            pausedBy: "store_suspension",
          },
          {
            $set: {
              status: "active",
              updatedAt: now,
            },
            $unset: {
              pausedBy: "",
            },
          },
          sessionOpts
        );

        const activeListingsCount = await ListingModel.countDocuments(
          { storeId: id, status: "active" },
          sessionOpts
        );
        await StoreModel.findByIdAndUpdate(
          id,
          { $set: { "metrics.listingsCount": activeListingsCount } },
          sessionOpts
        );

        await logAdminAudit({
          actorId: admin.id,
          actorEmail: admin.email,
          targetType: "store",
          targetId: id,
          action: "restore",
          requestId,
          before: { status: store.status, isVerified: store.isVerified },
          after: { status: updatedStore?.status, isVerified: updatedStore?.isVerified },
          details: {
            listingsRestored: listingRes.modifiedCount,
          },
          session: session || undefined,
        });

        return {
          store: updatedStore,
          message: "Store restored to active status.",
          listingsAffected: listingRes.modifiedCount,
        };
      }

      if (action === "pause") {
        const updatedStore = await StoreModel.findByIdAndUpdate(
          id,
          {
            $set: {
              status: "paused",
              pausedBy: "admin",
              updatedAt: now,
            },
          },
          { returnDocument: "after", ...sessionOpts }
        );

        await logAdminAudit({
          actorId: admin.id,
          actorEmail: admin.email,
          targetType: "store",
          targetId: id,
          action: "pause",
          requestId,
          before: { status: store.status, isVerified: store.isVerified },
          after: { status: updatedStore?.status, isVerified: updatedStore?.isVerified },
          details: {},
          session: session || undefined,
        });

        return {
          store: updatedStore,
          message: "Store paused.",
          listingsAffected: 0,
        };
      }

      if (action === "approve") {
        const updatedStore = await StoreModel.findByIdAndUpdate(
          id,
          {
            $set: {
              status: "active",
              isVerified: true,
              updatedAt: now,
            },
            $unset: {
              suspendedBy: "",
              suspensionReason: "",
            },
          },
          { returnDocument: "after", ...sessionOpts }
        );

        await logAdminAudit({
          actorId: admin.id,
          actorEmail: admin.email,
          targetType: "store",
          targetId: id,
          action: "approve",
          requestId,
          reason: effectiveReason || "Storefront approved by administrator.",
          before: { status: store.status, isVerified: store.isVerified },
          after: { status: updatedStore?.status, isVerified: updatedStore?.isVerified },
          details: {},
          session: session || undefined,
        });

        return {
          store: updatedStore,
          message: "Store approved and activated successfully.",
          listingsAffected: 0,
        };
      }

      if (action === "ban") {
        const banReason =
          effectiveReason || "Store permanently banned by platform administrator.";
        const updatedStore = await StoreModel.findByIdAndUpdate(
          id,
          {
            $set: {
              status: "banned",
              suspendedBy: "admin",
              suspensionReason: banReason,
              "metrics.listingsCount": 0,
              updatedAt: now,
            },
          },
          { returnDocument: "after", ...sessionOpts }
        );

        const listingRes = await ListingModel.updateMany(
          { storeId: id, status: { $in: ["active", "paused", "pending_review"] } },
          {
            $set: {
              status: "removed",
              removedBy: "admin",
              updatedAt: now,
            },
          },
          sessionOpts
        );

        await logAdminAudit({
          actorId: admin.id,
          actorEmail: admin.email,
          targetType: "store",
          targetId: id,
          action: "ban",
          requestId,
          reason: banReason,
          before: { status: store.status, isVerified: store.isVerified },
          after: { status: updatedStore?.status, isVerified: updatedStore?.isVerified },
          details: { listingsRemoved: listingRes.modifiedCount },
          session: session || undefined,
        });

        return {
          store: updatedStore,
          message: "Store permanently banned and listings removed.",
          listingsAffected: listingRes.modifiedCount,
        };
      }

      if (action === "toggle_verify") {
        const nextVerified = !store.isVerified;
        const updatedStore = await StoreModel.findByIdAndUpdate(
          id,
          {
            $set: {
              isVerified: nextVerified,
              updatedAt: now,
            },
          },
          { returnDocument: "after", ...sessionOpts }
        );

        await logAdminAudit({
          actorId: admin.id,
          actorEmail: admin.email,
          targetType: "store",
          targetId: id,
          action: nextVerified ? "verify_store" : "unverify_store",
          requestId,
          reason:
            effectiveReason ||
            `Store verification badge set to ${nextVerified} by administrator.`,
          before: { isVerified: store.isVerified },
          after: { isVerified: updatedStore?.isVerified },
          details: {},
          session: session || undefined,
        });

        return {
          store: updatedStore,
          message: nextVerified
            ? "Store verification badge granted."
            : "Store verification badge revoked.",
          listingsAffected: 0,
        };
      }

      if (action === "reset_slug_cooldown") {
        const updatedStore = await StoreModel.findByIdAndUpdate(
          id,
          {
            $unset: {
              slugUpdatedAt: "",
            },
            $set: {
              updatedAt: now,
            },
          },
          { returnDocument: "after", ...sessionOpts }
        );

        await logAdminAudit({
          actorId: admin.id,
          actorEmail: admin.email,
          targetType: "store",
          targetId: id,
          action: "reset_slug_cooldown",
          requestId,
          reason: effectiveReason || "Store rename cooldown cleared by administrator.",
          before: { slugUpdatedAt: store.slugUpdatedAt || null },
          after: { slugUpdatedAt: null },
          details: {},
          session: session || undefined,
        });

        return {
          store: updatedStore,
          message: "Store rename cooldown cleared.",
          listingsAffected: 0,
        };
      }

      throw new Error("Invalid action");
    });

    return NextResponse.json({
      success: true,
      data: result.store,
      message: result.message,
      listingsAffected: result.listingsAffected,
    });
  } catch (error: any) {
    console.error("[PATCH /api/admin/stores/[id]] Error:", error);
    const status = error.message?.includes("reason is required") ? 400 : 500;
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update store." },
      { status }
    );
  }
}
