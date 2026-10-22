import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import BannerModel, { isValidCtaUrl, isValidImageUrl } from "@/models/Banner";
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
 * POST /api/admin/banners/[id]/publish
 * Validates completeness, checks schedule conflicts, sets status to "published",
 * creates audit trail, and invalidates public caches.
 */
export async function POST(
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
    const banner = await BannerModel.findById(id);
    if (!banner) {
      return NextResponse.json(
        { success: false, error: "Banner not found." },
        { status: 404 }
      );
    }

    if (banner.status === "archived") {
      return NextResponse.json(
        {
          success: false,
          error: "Archived banners cannot be published directly. Please duplicate or edit first.",
        },
        { status: 400 }
      );
    }

    // Verify all publication requirements
    if (!banner.headline || !banner.headline.trim()) {
      return NextResponse.json(
        { success: false, error: "Cannot publish: Headline is missing." },
        { status: 400 }
      );
    }

    if (!banner.imageUrl || !isValidImageUrl(banner.imageUrl)) {
      return NextResponse.json(
        { success: false, error: "Cannot publish: Desktop image URL is invalid or missing." },
        { status: 400 }
      );
    }

    if (!banner.imageAlt || !banner.imageAlt.trim()) {
      return NextResponse.json(
        { success: false, error: "Cannot publish: Accessibility image alt text is required." },
        { status: 400 }
      );
    }

    if (!banner.ctaLabel || !banner.ctaLabel.trim()) {
      return NextResponse.json(
        { success: false, error: "Cannot publish: CTA button label is missing." },
        { status: 400 }
      );
    }

    if (!banner.ctaUrl || !isValidCtaUrl(banner.ctaUrl)) {
      return NextResponse.json(
        { success: false, error: "Cannot publish: CTA destination URL is invalid or dangerous." },
        { status: 400 }
      );
    }

    if (
      banner.placement === "category_promo" &&
      (!banner.targetCategory || !banner.targetCategory.trim())
    ) {
      return NextResponse.json(
        { success: false, error: "Cannot publish: Category promotion requires a target category." },
        { status: 400 }
      );
    }

    if (banner.endAt && banner.endAt.getTime() <= banner.startAt.getTime()) {
      return NextResponse.json(
        { success: false, error: "Cannot publish: End date must be after start date." },
        { status: 400 }
      );
    }

    // Conflict detection for homepage hero
    let conflictWarning: string | undefined;
    if (banner.placement === "homepage_hero") {
      const conflictResult = await detectHomepageHeroConflict({
        bannerId: id,
        startAt: banner.startAt,
        endAt: banner.endAt,
        priority: banner.priority,
      });
      if (conflictResult.hasConflict) {
        conflictWarning = conflictResult.message;
      }
    }

    const beforeState = banner.toObject();
    banner.status = "published";
    banner.updatedBy = admin.id;
    await banner.save();

    const requestId = getRequestId(req);
    await logAdminAudit({
      actorId: admin.id,
      actorEmail: admin.email,
      targetType: "banner",
      targetId: id,
      action: "publish_banner",
      requestId,
      before: beforeState,
      after: banner.toObject(),
    });

    invalidateBannerCaches();

    const res = NextResponse.json({
      success: true,
      data: {
        ...banner.toObject(),
        id: banner._id.toString(),
      },
      conflictWarning,
      message: "Banner published successfully.",
    });

    return applyCacheHeaders(res, { isPublic: false });
  } catch (error: any) {
    console.error("[AdminBannersAPI] Publish error:", error);
    const res = NextResponse.json(
      { success: false, error: error.message || "Failed to publish banner." },
      { status: 500 }
    );
    return applyCacheHeaders(res, { isPublic: false });
  }
}
