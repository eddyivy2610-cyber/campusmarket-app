import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import { ListingModel } from "@/models/Listing";
import StoreModel from "@/models/Store";
import { requireAdmin } from "@/lib/authServer";
import { logAdminAudit } from "@/lib/adminAudit";

export const dynamic = "force-dynamic";

/**
 * PATCH /api/admin/listings/[id]
 * Moderation actions for listings: approve, reject, pause, or remove.
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
      ListingModel.db?.readyState !== 1
    ) {
      return NextResponse.json(
        { success: false, error: "Listing not found." },
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

    const { action, reason, notes } = body;

    const now = new Date().toISOString();
    let updateFields: Record<string, any>;
    let successMessage: string;

    if (action === "approve") {
      updateFields = {
        status: "active",
        reviewedBy: admin.id,
        reviewedAt: now,
        moderationNotes: notes || "Approved by administrator.",
        updatedAt: now,
      };
      successMessage = "Listing successfully approved and published.";
    } else if (action === "reject") {
      if (!reason) {
        return NextResponse.json(
          { success: false, error: "A rejection reason is required for moderation audit." },
          { status: 400 }
        );
      }
      updateFields = {
        status: "rejected",
        reviewedBy: admin.id,
        reviewedAt: now,
        moderationNotes: String(reason).trim(),
        updatedAt: now,
      };
      successMessage = "Listing rejected and removed from public discovery.";
    } else if (action === "pause") {
      updateFields = {
        status: "paused",
        updatedAt: now,
      };
      successMessage = "Listing paused.";
    } else if (action === "remove") {
      updateFields = {
        status: "removed",
        updatedAt: now,
      };
      successMessage = "Listing removed.";
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid action. Supported actions are 'approve', 'reject', 'pause', or 'remove'.",
        },
        { status: 400 }
      );
    }

    // Targeted $set, not doc.save()
    const updatedListing = await ListingModel.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { returnDocument: "after" }
    );

    if (!updatedListing) {
      return NextResponse.json(
        { success: false, error: "Listing not found." },
        { status: 404 }
      );
    }

    // Keep store metrics consistent if associated
    if (updatedListing.storeId) {
      const count = await ListingModel.countDocuments({
        storeId: updatedListing.storeId,
        status: "active",
      });
      await StoreModel.findByIdAndUpdate(updatedListing.storeId, {
        "metrics.listingsCount": count,
        updatedAt: now,
      });
    }

    // Record administrative audit log
    await logAdminAudit({
      actorId: admin.id,
      actorEmail: admin.email,
      targetType: "listing",
      targetId: id,
      action: `listing_${action}`,
      reason: reason || `Admin performed action: ${action}`,
      details: {
        newStatus: updateFields.status,
        storeId: updatedListing.storeId?.toString(),
        sellerId: updatedListing.sellerId?.toString(),
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedListing,
      message: successMessage,
    });
  } catch (error: any) {
    console.error("[PATCH /api/admin/listings/[id]] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to moderate listing." },
      { status: 500 }
    );
  }
}
