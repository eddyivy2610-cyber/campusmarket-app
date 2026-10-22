import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import StoreModel from "@/models/Store";
import ListingModel from "@/models/Listing";
import { requireAdmin } from "@/lib/authServer";
import { executeInTransaction } from "@/lib/transactionHelper";
import { logAdminAudit } from "@/lib/adminAudit";
import { getRequestId } from "@/lib/apiResponse";

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

    const { action, reason, role: newRole } = body;

    if (!["suspend", "restore", "ban", "role_change", "approve"].includes(action)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid action. Supported actions are 'suspend', 'restore', 'ban', 'role_change', or 'approve'.",
        },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const requestId = getRequestId(req);

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
          requestId,
          reason: suspensionReason,
          before: {
            accountStatus: user.accountStatus,
            suspensionReason: user.suspensionReason || null,
          },
          after: {
            accountStatus: updatedUser?.accountStatus,
            suspensionReason: updatedUser?.suspensionReason || null,
          },
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
          requestId,
          before: {
            accountStatus: user.accountStatus,
            suspensionReason: user.suspensionReason || null,
          },
          after: {
            accountStatus: updatedUser?.accountStatus,
            suspensionReason: updatedUser?.suspensionReason || null,
          },
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
          requestId,
          reason: suspensionReason,
          before: {
            accountStatus: user.accountStatus,
            suspensionReason: user.suspensionReason || null,
          },
          after: {
            accountStatus: updatedUser?.accountStatus,
            suspensionReason: updatedUser?.suspensionReason || null,
          },
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

      if (action === "role_change") {
        if (!newRole || !["buyer", "seller", "admin"].includes(newRole)) {
          throw new Error("Invalid role specified. Role must be 'buyer', 'seller', or 'admin'.");
        }

        const existingUser = await UserModel.findById(id).session(session || null);
        if (!existingUser) {
          throw new Error("User record not found.");
        }

        const previousRole = existingUser.role;
        const updatedUser = await UserModel.findByIdAndUpdate(
          id,
          {
            $set: {
              role: newRole,
              updatedAt: now,
            },
            $inc: {
              tokenVersion: 1, // Invalidate old session claims immediately
            },
          },
          { returnDocument: "after", ...sessionOpts }
        );

        await logAdminAudit({
          actorId: admin.id,
          actorEmail: admin.email,
          targetType: "user",
          targetId: id,
          action: "role_change",
          requestId,
          reason: reason || `Administrative role change from ${previousRole} to ${newRole}`,
          before: { role: previousRole },
          after: { role: updatedUser?.role },
          details: {
            previousRole,
            newRole,
          },
          session: session || undefined,
        });

        return {
          user: updatedUser,
          message: `User role changed from ${previousRole} to ${newRole}.`,
          storesAffected: 0,
          listingsAffected: 0,
        };
      }

      if (action === "approve") {
        const updatedUser = await UserModel.findByIdAndUpdate(
          id,
          {
            $set: {
              studentVerified: true,
              isStudent: true,
              updatedAt: now,
            },
          },
          { returnDocument: "after", ...sessionOpts }
        );

        await logAdminAudit({
          actorId: admin.id,
          actorEmail: admin.email,
          targetType: "user",
          targetId: id,
          action: "approve",
          requestId,
          reason: reason || "User verified and approved by administrator.",
          before: {
            studentVerified: user.studentVerified,
            isStudent: user.isStudent,
          },
          after: {
            studentVerified: updatedUser?.studentVerified,
            isStudent: updatedUser?.isStudent,
          },
          details: {
            verifiedFields: ["studentVerified", "isStudent"],
          },
          session: session || undefined,
        });

        return {
          user: updatedUser,
          message: "User approved and student status verified successfully.",
          storesAffected: 0,
          listingsAffected: 0,
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
