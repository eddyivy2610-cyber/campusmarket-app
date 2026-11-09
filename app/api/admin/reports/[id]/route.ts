import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import ReportModel from "@/models/Report";
import UserModel from "@/models/User";
import StoreModel from "@/models/Store";
import { ListingModel } from "@/models/Listing";
import ReviewModel from "@/models/Review";
import { requireAdmin } from "@/lib/authServer";
import { logAdminAudit } from "@/lib/adminAudit";
import { getRequestId } from "@/lib/apiResponse";
import { createNotification } from "@/lib/notificationService";
import { recomputeStoreRating } from "@/lib/reviewService";

export const dynamic = "force-dynamic";

/**
 * PATCH /api/admin/reports/[id]
 * Resolves, dismisses, or updates a report, with optional 1-click target enforcement.
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

    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON request body." },
        { status: 400 }
      );
    }

    const query = mongoose.Types.ObjectId.isValid(id)
      ? { $or: [{ _id: id }, { publicId: id }] }
      : { publicId: id };

    const report = await ReportModel.findOne(query);
    if (!report) {
      return NextResponse.json(
        { success: false, error: "Report not found." },
        { status: 404 }
      );
    }

    const resolution = String(body.resolution || body.enforcementAction || "none").toLowerCase();
    const notes = String(body.notes || body.resolutionNotes || "").trim();
    const nextStatus =
      body.status && ["pending", "in_review", "resolved", "dismissed"].includes(body.status)
        ? body.status
        : resolution === "none" || resolution === "dismiss"
        ? "dismissed"
        : "resolved";

    const now = new Date().toISOString();
    const requestId = getRequestId(req);
    const previousStatus = report.status;
    let enforcementSummary = "No target mutation required.";

    // Execute optional 1-click enforcement on the reported entity
    const targetId = String(report.targetId);
    if (mongoose.Types.ObjectId.isValid(targetId)) {
      if (resolution === "remove" || resolution === "remove_listing") {
        let storeIdToSync: string | null = null;
        if (report.targetType === "listing") {
          const updated = await ListingModel.findByIdAndUpdate(
            targetId,
            {
              $set: {
                status: "removed",
                removedBy: "admin",
                moderationNotes: notes || "Removed following report investigation.",
                updatedAt: now,
              },
            },
            { returnDocument: "after" }
          );
          if (updated?.storeId) {
            storeIdToSync = String(updated.storeId);
          }
          enforcementSummary = "Target listing removed.";
        }
        if (storeIdToSync) {
          const activeCount = await ListingModel.countDocuments({
            storeId: storeIdToSync,
            status: "active",
          });
          await StoreModel.findByIdAndUpdate(storeIdToSync, {
            $set: { "metrics.listingsCount": activeCount, updatedAt: now },
          });
        }
      } else if (resolution === "suspend_store" || (resolution === "suspend" && report.targetType === "store")) {
        await StoreModel.findByIdAndUpdate(targetId, {
          $set: {
            status: "suspended",
            suspendedBy: "store_suspension",
            suspensionReason: notes || "Suspended following report investigation.",
            "metrics.listingsCount": 0,
            updatedAt: now,
          },
        });
        await ListingModel.updateMany(
          { storeId: targetId, status: "active" },
          { $set: { status: "paused", pausedBy: "store_suspension", updatedAt: now } }
        );
        enforcementSummary = "Target store suspended and active listings paused.";
      } else if (resolution === "suspend" || resolution === "suspend_user") {
        let userIdToSuspend: string | null = null;
        if (report.targetType === "user") {
          userIdToSuspend = targetId;
        } else if (report.targetType === "listing") {
          const l = await ListingModel.findById(targetId).select("sellerId").lean();
          if (l?.sellerId) userIdToSuspend = String(l.sellerId);
        } else if (report.targetType === "store") {
          const s = await StoreModel.findById(targetId).select("ownerId").lean();
          if (s?.ownerId) userIdToSuspend = String(s.ownerId);
        }

        if (userIdToSuspend && userIdToSuspend !== admin.id) {
          await UserModel.findByIdAndUpdate(userIdToSuspend, {
            $set: {
              accountStatus: "suspended",
              suspensionReason: notes || "Suspended following report investigation.",
              suspendedAt: now,
              updatedAt: now,
            },
            $inc: { tokenVersion: 1 },
          });
          await StoreModel.updateMany(
            { ownerId: userIdToSuspend, status: "active" },
            {
              $set: {
                status: "suspended",
                suspendedBy: "account_suspension",
                suspensionReason: notes || "Owner account suspended.",
                updatedAt: now,
              },
            }
          );
          await ListingModel.updateMany(
            { sellerId: userIdToSuspend, status: "active" },
            { $set: { status: "paused", pausedBy: "account_suspension", updatedAt: now } }
          );
          enforcementSummary = "Target user and their stores/listings suspended.";
        }
      } else if (resolution === "ban" || resolution === "ban_user") {
        let userIdToBan: string | null = null;
        if (report.targetType === "user") {
          userIdToBan = targetId;
        } else if (report.targetType === "listing") {
          const l = await ListingModel.findById(targetId).select("sellerId").lean();
          if (l?.sellerId) userIdToBan = String(l.sellerId);
        } else if (report.targetType === "store") {
          const s = await StoreModel.findById(targetId).select("ownerId").lean();
          if (s?.ownerId) userIdToBan = String(s.ownerId);
        }

        if (userIdToBan && userIdToBan !== admin.id) {
          await UserModel.findByIdAndUpdate(userIdToBan, {
            $set: {
              accountStatus: "banned",
              suspensionReason: notes || "Banned following report investigation.",
              suspendedAt: now,
              updatedAt: now,
            },
            $inc: { tokenVersion: 1 },
          });
          await StoreModel.updateMany(
            { ownerId: userIdToBan, status: { $in: ["active", "paused"] } },
            {
              $set: {
                status: "suspended",
                suspendedBy: "account_ban",
                suspensionReason: notes || "Owner account banned.",
                updatedAt: now,
              },
            }
          );
          await ListingModel.updateMany(
            { sellerId: userIdToBan, status: { $in: ["active", "paused", "pending_review"] } },
            { $set: { status: "removed", removedBy: "account_ban", updatedAt: now } }
          );
          enforcementSummary = "Target user permanently banned.";
        }
      } else if (resolution === "warning") {
        let userIdToWarn: string | null = null;
        if (report.targetType === "user") {
          userIdToWarn = targetId;
        } else if (report.targetType === "listing") {
          const l = await ListingModel.findById(targetId).select("sellerId").lean();
          if (l?.sellerId) userIdToWarn = String(l.sellerId);
        } else if (report.targetType === "store") {
          const s = await StoreModel.findById(targetId).select("ownerId").lean();
          if (s?.ownerId) userIdToWarn = String(s.ownerId);
        }

        if (userIdToWarn) {
          await createNotification({
            recipient: userIdToWarn,
            sender: admin.id,
            type: "admin_warning",
            category: "account_security",
            priority: "high",
            title: "Official Platform Moderation Warning",
            message:
              notes ||
              "Your account or content was flagged for violating Campus Hive community guidelines. Continued violations may lead to suspension.",
            link: "/profile",
          });
          enforcementSummary = "Official warning notification sent to user.";
        }
      } else if (resolution === "hide_review" && report.targetType === "review") {
        const rev = await ReviewModel.findByIdAndUpdate(
          targetId,
          { $set: { status: "hidden" } },
          { returnDocument: "after" }
        );
        if (rev?.storeId) {
          await recomputeStoreRating(String(rev.storeId));
        }
        enforcementSummary = "Reported review hidden and store rating recomputed.";
      }
    }

    report.status = nextStatus;
    report.assignedAdminId = admin.id;
    report.resolutionNotes = notes || enforcementSummary;
    report.auditLog.push({
      action: `status_${nextStatus}_${resolution}`,
      adminId: admin.id,
      note: notes || enforcementSummary,
      timestamp: new Date(),
    });
    await report.save();

    await logAdminAudit({
      actorId: admin.id,
      actorEmail: admin.email,
      targetType: "report",
      targetId: String(report._id),
      action: `report_${nextStatus}`,
      requestId,
      reason: notes || enforcementSummary,
      before: { status: previousStatus },
      after: { status: report.status, resolution },
      details: {
        reportPublicId: report.publicId,
        reportedTargetType: report.targetType,
        reportedTargetId: report.targetId,
        enforcementSummary,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Report ${nextStatus}. ${enforcementSummary}`,
      data: {
        id: report.publicId || String(report._id),
        status: report.status,
        resolutionNotes: report.resolutionNotes,
      },
    });
  } catch (error: any) {
    console.error("[PATCH /api/admin/reports/[id]] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update report." },
      { status: 500 }
    );
  }
}
