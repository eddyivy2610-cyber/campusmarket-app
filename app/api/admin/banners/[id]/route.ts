import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import BannerModel, {
  BannerPlacement,
  BannerStatus,
  isValidCtaUrl,
  isValidImageUrl,
} from "@/models/Banner";
import { requireAdmin } from "@/lib/authServer";
import { logAdminAudit } from "@/lib/adminAudit";
import { getRequestId } from "@/lib/apiResponse";
import { applyCacheHeaders } from "@/lib/cacheHeaders";
import {
  detectHomepageHeroConflict,
  invalidateBannerCaches,
} from "@/lib/bannerService";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/banners/[id]
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { admin, errorResponse } = await requireAdmin(req);
    if (!admin || errorResponse) return errorResponse;

    const { id } = await context.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid banner ID format." },
        { status: 400 }
      );
    }

    await dbConnect();
    const banner = await BannerModel.findById(id).lean().exec();

    if (!banner) {
      return NextResponse.json(
        { success: false, error: "Banner not found." },
        { status: 404 }
      );
    }

    const res = NextResponse.json({
      success: true,
      data: {
        ...banner,
        id: (banner as any)._id.toString(),
      },
    });

    return applyCacheHeaders(res, { isPublic: false });
  } catch (error: any) {
    console.error("[AdminBannersAPI] GET [id] error:", error);
    const res = NextResponse.json(
      { success: false, error: "Failed to fetch banner." },
      { status: 500 }
    );
    return applyCacheHeaders(res, { isPublic: false });
  }
}

/**
 * PATCH /api/admin/banners/[id]
 * Updates banner fields with validation, audit logging, and cache invalidation.
 */
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { admin, errorResponse } = await requireAdmin(req);
    if (!admin || errorResponse) return errorResponse;

    const { id } = await context.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid banner ID format." },
        { status: 400 }
      );
    }

    await dbConnect();
    const existing = await BannerModel.findById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Banner not found." },
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

    const beforeState = existing.toObject();
    const updateFields: Record<string, any> = {
      updatedBy: admin.id,
    };

    if (body.name !== undefined) {
      if (typeof body.name !== "string" || !body.name.trim()) {
        return NextResponse.json(
          { success: false, error: "Banner name cannot be empty." },
          { status: 400 }
        );
      }
      updateFields.name = body.name.trim();
    }

    if (body.headline !== undefined) {
      if (typeof body.headline !== "string" || !body.headline.trim()) {
        return NextResponse.json(
          { success: false, error: "Headline cannot be empty." },
          { status: 400 }
        );
      }
      updateFields.headline = body.headline.trim();
    }

    if (body.description !== undefined) {
      updateFields.description =
        typeof body.description === "string" ? body.description.trim() : "";
    }

    if (body.imageUrl !== undefined) {
      if (!isValidImageUrl(body.imageUrl)) {
        return NextResponse.json(
          { success: false, error: "Desktop image URL is invalid." },
          { status: 400 }
        );
      }
      updateFields.imageUrl = body.imageUrl.trim();
    }

    if (body.mobileImageUrl !== undefined) {
      if (body.mobileImageUrl && !isValidImageUrl(body.mobileImageUrl)) {
        return NextResponse.json(
          { success: false, error: "Mobile image URL is invalid." },
          { status: 400 }
        );
      }
      updateFields.mobileImageUrl = body.mobileImageUrl
        ? body.mobileImageUrl.trim()
        : "";
    }

    if (body.imageAlt !== undefined) {
      if (typeof body.imageAlt !== "string" || !body.imageAlt.trim()) {
        return NextResponse.json(
          { success: false, error: "Image alt text cannot be empty." },
          { status: 400 }
        );
      }
      updateFields.imageAlt = body.imageAlt.trim();
    }

    if (body.ctaLabel !== undefined) {
      if (typeof body.ctaLabel !== "string" || !body.ctaLabel.trim()) {
        return NextResponse.json(
          { success: false, error: "CTA button label cannot be empty." },
          { status: 400 }
        );
      }
      updateFields.ctaLabel = body.ctaLabel.trim();
    }

    if (body.ctaUrl !== undefined) {
      if (!isValidCtaUrl(body.ctaUrl)) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Invalid or dangerous CTA URL. Relative paths must start with '/' and external URLs must use 'https://'.",
          },
          { status: 400 }
        );
      }
      updateFields.ctaUrl = body.ctaUrl.trim();
    }

    if (body.placement !== undefined) {
      const validPlacements: BannerPlacement[] = [
        "homepage_hero",
        "promo_strip",
        "category_promo",
      ];
      if (!validPlacements.includes(body.placement)) {
        return NextResponse.json(
          {
            success: false,
            error: `Placement must be one of: ${validPlacements.join(", ")}`,
          },
          { status: 400 }
        );
      }
      updateFields.placement = body.placement;
    }

    if (body.targetCategory !== undefined) {
      updateFields.targetCategory =
        typeof body.targetCategory === "string" ? body.targetCategory.trim() : "";
    }

    const effectivePlacement = updateFields.placement || existing.placement;
    if (
      effectivePlacement === "category_promo" &&
      body.targetCategory !== undefined &&
      !updateFields.targetCategory
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Target category is required for category promotions.",
        },
        { status: 400 }
      );
    }

    if (body.status !== undefined) {
      const validStatuses: BannerStatus[] = [
        "draft",
        "scheduled",
        "published",
        "archived",
      ];
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json(
          { success: false, error: `Invalid status "${body.status}".` },
          { status: 400 }
        );
      }
      updateFields.status = body.status;
    }

    let startAt = existing.startAt;
    if (body.startAt !== undefined) {
      startAt = new Date(body.startAt);
      if (isNaN(startAt.getTime())) {
        return NextResponse.json(
          { success: false, error: "Invalid start date format." },
          { status: 400 }
        );
      }
      updateFields.startAt = startAt;
    }

    let endAt = existing.endAt;
    if (body.endAt !== undefined) {
      if (body.endAt === null || body.endAt === "") {
        endAt = null;
        updateFields.endAt = null;
      } else {
        endAt = new Date(body.endAt);
        if (isNaN(endAt.getTime())) {
          return NextResponse.json(
            { success: false, error: "Invalid end date format." },
            { status: 400 }
          );
        }
        if (endAt.getTime() <= startAt.getTime()) {
          return NextResponse.json(
            {
              success: false,
              error: "End date must be strictly after start date.",
            },
            { status: 400 }
          );
        }
        updateFields.endAt = endAt;
      }
    }

    if (body.priority !== undefined) {
      if (typeof body.priority !== "number" || isNaN(body.priority)) {
        return NextResponse.json(
          { success: false, error: "Priority must be a valid number." },
          { status: 400 }
        );
      }
      updateFields.priority = Math.max(0, Math.min(1000, body.priority));
    }

    // Homepage hero conflict warning
    let conflictWarning: string | undefined;
    const finalStatus = updateFields.status || existing.status;
    const finalPlacement = updateFields.placement || existing.placement;
    const finalPriority =
      updateFields.priority !== undefined
        ? updateFields.priority
        : existing.priority;

    if (finalStatus === "published" && finalPlacement === "homepage_hero") {
      const conflictResult = await detectHomepageHeroConflict({
        bannerId: id,
        startAt,
        endAt,
        priority: finalPriority,
      });
      if (conflictResult.hasConflict) {
        conflictWarning = conflictResult.message;
      }
    }

    const updated = await BannerModel.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { returnDocument: "after", runValidators: true }
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Banner not found." },
        { status: 404 }
      );
    }

    const requestId = getRequestId(req);
    await logAdminAudit({
      actorId: admin.id,
      actorEmail: admin.email,
      targetType: "banner",
      targetId: id,
      action: "update_banner",
      requestId,
      before: beforeState,
      after: updated.toObject(),
    });

    invalidateBannerCaches();

    const res = NextResponse.json({
      success: true,
      data: {
        ...updated.toObject(),
        id: updated._id.toString(),
      },
      conflictWarning,
    });

    return applyCacheHeaders(res, { isPublic: false });
  } catch (error: any) {
    console.error("[AdminBannersAPI] PATCH [id] error:", error);
    const res = NextResponse.json(
      { success: false, error: error.message || "Failed to update banner." },
      { status: 500 }
    );
    return applyCacheHeaders(res, { isPublic: false });
  }
}
