import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import StoreModel from "@/models/Store";
import ListingModel from "@/models/Listing";
import { requireAdmin } from "@/lib/authServer";
import { executeInTransaction } from "@/lib/transactionHelper";
import { logAdminAudit } from "@/lib/adminAudit";

export const dynamic = "force-dynamic";

/**
 * PATCH /api/admin/users/[id]
 * User oversight: suspend, restore, or ban user accounts with atomic, reversible cascades.
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
      UserModel.db?.readyState !== 1
    ) {
      return NextResponse.json(
        { success: false, error: "User not found." },
        { status: 404 }
      );
    }

    const user = await UserModel.findById(id);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found." },
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

    if (!["suspend", "restore", "ban"].includes(action)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid action. Supported actions are 'suspend', 'restore', or 'ban'.",
        },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    const result = await executeInTransaction(async (session) => {
      const sessionOpts = session ? { session } : {};

      if (action === "suspend") {
        const suspensionReason = reason || "Suspended by platform administrator.";
        const updatedUser = await UserModel.findByIdAndUpdate(
          id,
          {
            $set: {
              accountStatus: "suspended",
              suspensionReason,
              suspendedAt: now,
              updatedAt: now,
            },
            $inc: {
              tokenVersion: 1,
            },
          },
          { returnDocument: "after", ...sessionOpts }
        );

        // Cascade to active store: mark suspendedBy: "account_suspension"
        const storeRes = await StoreModel.updateMany(
          { ownerId: id, status: "active" },
          {
            $set: {
              status: "suspended",
              suspendedBy: "account_suspension",
              suspensionReason,
              updatedAt: now,
            },
          },
          sessionOpts
        );

        // Cascade to active listings: mark pausedBy: "account_suspension" (preserves seller-paused listings)
        const listingRes = await ListingModel.updateMany(
          { sellerId: id, status: "active" },
          {
            $set: {
              status: "paused",
              pausedBy: "account_suspension",
              updatedAt: now,
            },
          },
          sessionOpts
        );

        await logAdminAudit({
          actorId: admin.id,
          actorEmail: admin.email,
          targetType: "user",
          targetId: id,
          action: "suspend",
          reason: suspensionReason,
          details: {
            storesSuspended: storeRes.modifiedCount,
            listingsPaused: listingRes.modifiedCount,
          },
          session: session || undefined,
        });

        return {
          user: updatedUser,
          message: "User suspended successfully.",
          storesAffected: storeRes.modifiedCount,
          listingsAffected: listingRes.modifiedCount,
        };
      }

      if (action === "restore") {
        const updatedUser = await UserModel.findByIdAndUpdate(
          id,
          {
            $set: {
              accountStatus: "active",
              updatedAt: now,
            },
            $unset: {
              suspensionReason: "",
              suspendedAt: "",
            },
          },
          { returnDocument: "after", ...sessionOpts }
        );

        // Reversible restore for store: only restore stores suspended by account suspension or ban
        const storeRes = await StoreModel.updateMany(
          {
            ownerId: id,
            status: "suspended",
            suspendedBy: { $in: ["account_suspension", "account_ban"] },
          },
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
          sessionOpts
        );

        // Reversible restore for listings:
        // 1. Restore listings paused by account suspension
        const pausedListingsRes = await ListingModel.updateMany(
          {
            sellerId: id,
            status: "paused",
            pausedBy: "account_suspension",
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

        // 2. Restore listings removed by account ban
        const bannedListingsRes = await ListingModel.updateMany(
          {
            sellerId: id,
            status: "removed",
            removedBy: "account_ban",
          },
          {
            $set: {
              status: "active",
              updatedAt: now,
            },
            $unset: {
              removedBy: "",
            },
          },
          sessionOpts
        );

        const totalListingsRestored =
          pausedListingsRes.modifiedCount + bannedListingsRes.modifiedCount;

        await logAdminAudit({
          actorId: admin.id,
          actorEmail: admin.email,
          targetType: "user",
          targetId: id,
          action: "restore",
          details: {
            storesRestored: storeRes.modifiedCount,
            listingsRestored: totalListingsRestored,
          },
          session: session || undefined,
        });

        return {
          user: updatedUser,
          message: "User restored to active status.",
          storesAffected: storeRes.modifiedCount,
          listingsAffected: totalListingsRestored,
        };
      }

      if (action === "ban") {
        const suspensionReason =
          reason || "Banned for serious community policy violations.";

        const updatedUser = await UserModel.findByIdAndUpdate(
          id,
          {
            $set: {
              accountStatus: "banned",
              suspensionReason,
              suspendedAt: now,
              updatedAt: now,
            },
            $inc: {
              tokenVersion: 1,
            },
          },
          { returnDocument: "after", ...sessionOpts }
        );

        // Cascade store: mark suspendedBy: "account_ban"
        const storeRes = await StoreModel.updateMany(
          { ownerId: id, status: { $in: ["active", "paused"] } },
          {
            $set: {
              status: "suspended",
              suspendedBy: "account_ban",
              suspensionReason,
              updatedAt: now,
            },
          },
          sessionOpts
        );

        // Cascade listings: recoverable state marked removedBy: "account_ban"
        const listingRes = await ListingModel.updateMany(
          {
            sellerId: id,
            status: { $in: ["active", "paused", "pending_review"] },
          },
          {
            $set: {
              status: "removed",
              removedBy: "account_ban",
              updatedAt: now,
            },
          },
          sessionOpts
        );

        await logAdminAudit({
          actorId: admin.id,
          actorEmail: admin.email,
          targetType: "user",
          targetId: id,
          action: "ban",
          reason: suspensionReason,
          details: {
            storesSuspended: storeRes.modifiedCount,
            listingsRemoved: listingRes.modifiedCount,
          },
          session: session || undefined,
        });

        return {
          user: updatedUser,
          message: "User account banned.",
          storesAffected: storeRes.modifiedCount,
          listingsAffected: listingRes.modifiedCount,
        };
      }

      throw new Error("Invalid action");
    });

    return NextResponse.json({
      success: true,
      data: result.user,
      message: result.message,
      storesAffected: result.storesAffected,
      listingsAffected: result.listingsAffected,
    });
  } catch (error: any) {
    console.error("[PATCH /api/admin/users/[id]] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update user." },
      { status: 500 }
    );
  }
}
