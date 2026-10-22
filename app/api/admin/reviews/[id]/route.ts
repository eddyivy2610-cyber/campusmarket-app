import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import { requireAdmin } from "@/lib/authServer";
import ReviewModel from "@/models/Review";
import { logAdminAudit } from "@/lib/adminAudit";
import { getRequestId } from "@/lib/apiResponse";
import { recomputeSellerRating, recomputeStoreRating } from "@/lib/reviewService";

export const dynamic = "force-dynamic";

/**
 * PATCH /api/admin/reviews/[id]
 * Moderates a review: hide, flag, or restore to published.
 */
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { admin, errorResponse } = await requireAdmin(req);
    if (!admin || errorResponse) {
      return (
        errorResponse ||
        NextResponse.json(
          { success: false, error: "Admin authorization required." },
          { status: 403 }
        )
      );
    }

    const { id } = await context.params;
    const requestId = getRequestId(req);
    await dbConnect();

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Review not found." },
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

    const { status, reason } = body;
    if (!["published", "hidden", "flagged"].includes(status)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid status. Allowed values: 'published', 'hidden', 'flagged'.",
        },
        { status: 400 }
      );
    }

    const review = await ReviewModel.findById(id);
    if (!review) {
      return NextResponse.json(
        { success: false, error: "Review not found." },
        { status: 404 }
      );
    }

    const previousStatus = review.status;
    review.status = status;
    await review.save();

    // Recompute aggregates when status changes
    if (review.sellerId) {
      await recomputeSellerRating(review.sellerId.toString());
    }
    if (review.storeId) {
      await recomputeStoreRating(review.storeId.toString());
    }

    // Log admin audit event
    await logAdminAudit({
      actorId: admin.id,
      actorEmail: admin.email,
      targetType: "review",
      targetId: id,
      action: `review_${status}`,
      requestId,
      reason: reason || `Review status changed from ${previousStatus} to ${status}`,
      details: {
        previousStatus,
        newStatus: status,
        sellerId: review.sellerId?.toString(),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Review successfully updated to ${status}.`,
      data: {
        id: review._id.toString(),
        status: review.status,
      },
    });
  } catch (error: any) {
    console.error("[PATCH /api/admin/reviews/[id]] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to moderate review." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/reviews/[id]
 * Permanently removes a review, recomputes seller/store ratings, and logs admin audit.
 */
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { admin, errorResponse } = await requireAdmin(req);
    if (!admin || errorResponse) {
      return (
        errorResponse ||
        NextResponse.json(
          { success: false, error: "Admin authorization required." },
          { status: 403 }
        )
      );
    }

    const { id } = await context.params;
    await dbConnect();

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Review not found." },
        { status: 404 }
      );
    }

    const review = await ReviewModel.findById(id);
    if (!review) {
      return NextResponse.json(
        { success: false, error: "Review not found." },
        { status: 404 }
      );
    }

    const sellerId = review.sellerId?.toString();
    const storeId = review.storeId?.toString();

    await ReviewModel.deleteOne({ _id: id });

    // Recompute aggregates
    if (sellerId) {
      await recomputeSellerRating(sellerId);
    }
    if (storeId) {
      await recomputeStoreRating(storeId);
    }

    // Log admin audit
    await logAdminAudit({
      actorId: admin.id,
      actorEmail: admin.email,
      targetType: "review",
      targetId: id,
      action: "review_delete",
      requestId: getRequestId(req),
      reason: "Administrative permanent deletion of review",
      details: {
        sellerId,
        storeId,
        rating: review.rating,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Review successfully deleted and rating aggregates recomputed.",
      data: { id },
    });
  } catch (error: any) {
    console.error("[DELETE /api/admin/reviews/[id]] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete review." },
      { status: 500 }
    );
  }
}
