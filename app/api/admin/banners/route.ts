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
  getEligibleBanners,
  invalidateBannerCaches,
} from "@/lib/bannerService";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/banners
 * Admin listing with filtering, search, pagination, and active hero indicators.
 */
export async function GET(req: NextRequest) {
  try {
    const { admin, errorResponse } = await requireAdmin(req);
    if (!admin || errorResponse) return errorResponse;

    await dbConnect();

    const searchParams = req.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const status = searchParams.get("status") || "all";
    const placement = searchParams.get("placement") || "all";
    const search = searchParams.get("search")?.trim() || "";
    const category = searchParams.get("category")?.trim() || "";

    const query: Record<string, any> = {};

    if (status !== "all") {
      query.status = status;
    }

    if (placement !== "all") {
      query.placement = placement;
    }

    if (category) {
      query.targetCategory = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { headline: { $regex: search, $options: "i" } },
      ];
    }

    const total = await BannerModel.countDocuments(query);
    const banners = await BannerModel.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()
      .exec();

    // Determine which banner is currently actively displayed as the homepage hero
    let activeHomepageHeroId: string | null = null;
    try {
      const activeHeroes = await getEligibleBanners({
        placement: "homepage_hero",
        now: new Date(),
      });
      if (activeHeroes.length > 0) {
        activeHomepageHeroId = activeHeroes[0]._id.toString();
      }
    } catch {
      // Non-fatal
    }

    const res = NextResponse.json({
      success: true,
      data: banners.map((b: any) => ({
        ...b,
        id: b._id.toString(),
        isCurrentActiveHero: b._id.toString() === activeHomepageHeroId,
      })),
      activeHomepageHeroId,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });

    return applyCacheHeaders(res, { isPublic: false });
  } catch (error: any) {
    console.error("[AdminBannersAPI] GET error:", error);
    const res = NextResponse.json(
      { success: false, error: "Failed to fetch banners." },
      { status: 500 }
    );
    return applyCacheHeaders(res, { isPublic: false });
  }
}

/**
 * POST /api/admin/banners
 * Create a new promotional banner (draft or published).
 */
export async function POST(req: NextRequest) {
  try {
    const { admin, errorResponse } = await requireAdmin(req);
    if (!admin || errorResponse) return errorResponse;

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

    const {
      name,
      headline,
      description,
      imageUrl,
      mobileImageUrl,
      imageAlt,
      ctaLabel,
      ctaUrl,
      placement,
      targetCategory,
      status,
      startAt,
      endAt,
      priority,
    } = body;

    // Server-side input validation
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "Internal banner name is required." },
        { status: 400 }
      );
    }

    if (!headline || typeof headline !== "string" || !headline.trim()) {
      return NextResponse.json(
        { success: false, error: "Headline is required." },
        { status: 400 }
      );
    }

    if (!imageUrl || !isValidImageUrl(imageUrl)) {
      return NextResponse.json(
        { success: false, error: "Valid desktop image URL is required." },
        { status: 400 }
      );
    }

    if (mobileImageUrl && !isValidImageUrl(mobileImageUrl)) {
      return NextResponse.json(
        { success: false, error: "Mobile image URL is invalid." },
        { status: 400 }
      );
    }

    if (!imageAlt || typeof imageAlt !== "string" || !imageAlt.trim()) {
      return NextResponse.json(
        { success: false, error: "Image alt text is required for accessibility." },
        { status: 400 }
      );
    }

    if (!ctaLabel || typeof ctaLabel !== "string" || !ctaLabel.trim()) {
      return NextResponse.json(
        { success: false, error: "CTA button label is required." },
        { status: 400 }
      );
    }

    if (!ctaUrl || !isValidCtaUrl(ctaUrl)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid or dangerous CTA URL. Relative paths must start with '/' and external URLs must use 'https://'.",
        },
        { status: 400 }
      );
    }

    const validPlacements: BannerPlacement[] = [
      "homepage_hero",
      "promo_strip",
      "category_promo",
    ];
    if (!validPlacements.includes(placement)) {
      return NextResponse.json(
        {
          success: false,
          error: `Placement must be one of: ${validPlacements.join(", ")}`,
        },
        { status: 400 }
      );
    }

    if (placement === "category_promo" && (!targetCategory || !targetCategory.trim())) {
      return NextResponse.json(
        {
          success: false,
          error: "Target category is required for category promotions.",
        },
        { status: 400 }
      );
    }

    const validStatuses: BannerStatus[] = [
      "draft",
      "scheduled",
      "published",
      "archived",
    ];
    const bannerStatus: BannerStatus = validStatuses.includes(status)
      ? status
      : "draft";

    const startDate = startAt ? new Date(startAt) : new Date();
    if (isNaN(startDate.getTime())) {
      return NextResponse.json(
        { success: false, error: "Invalid start date format." },
        { status: 400 }
      );
    }

    let endDate: Date | null = null;
    if (endAt) {
      endDate = new Date(endAt);
      if (isNaN(endDate.getTime())) {
        return NextResponse.json(
          { success: false, error: "Invalid end date format." },
          { status: 400 }
        );
      }
      if (endDate.getTime() <= startDate.getTime()) {
        return NextResponse.json(
          { success: false, error: "End date must be strictly after start date." },
          { status: 400 }
        );
      }
    }

    const numPriority =
      typeof priority === "number" ? Math.max(0, Math.min(1000, priority)) : 0;

    // Homepage hero conflict detection
    let conflictWarning: string | undefined;
    if (bannerStatus === "published" && placement === "homepage_hero") {
      const conflictResult = await detectHomepageHeroConflict({
        startAt: startDate,
        endAt: endDate,
        priority: numPriority,
      });
      if (conflictResult.hasConflict) {
        conflictWarning = conflictResult.message;
      }
    }

    const newBanner = await BannerModel.create({
      name: name.trim(),
      headline: headline.trim(),
      description: description ? description.trim() : "",
      imageUrl: imageUrl.trim(),
      mobileImageUrl: mobileImageUrl ? mobileImageUrl.trim() : "",
      imageAlt: imageAlt.trim(),
      ctaLabel: ctaLabel.trim(),
      ctaUrl: ctaUrl.trim(),
      placement,
      targetCategory: targetCategory ? targetCategory.trim() : "",
      status: bannerStatus,
      startAt: startDate,
      endAt: endDate,
      priority: numPriority,
      createdBy: admin.id,
      updatedBy: admin.id,
    });

    const requestId = getRequestId(req);
    await logAdminAudit({
      actorId: admin.id,
      actorEmail: admin.email,
      targetType: "banner",
      targetId: newBanner._id.toString(),
      action: "create_banner",
      requestId,
      details: {
        name: newBanner.name,
        placement: newBanner.placement,
        status: newBanner.status,
        priority: newBanner.priority,
      },
      after: newBanner.toObject(),
    });

    invalidateBannerCaches();

    const res = NextResponse.json(
      {
        success: true,
        data: {
          ...newBanner.toObject(),
          id: newBanner._id.toString(),
        },
        conflictWarning,
      },
      { status: 201 }
    );

    return applyCacheHeaders(res, { isPublic: false });
  } catch (error: any) {
    console.error("[AdminBannersAPI] POST error:", error);
    const res = NextResponse.json(
      { success: false, error: error.message || "Failed to create banner." },
      { status: 500 }
    );
    return applyCacheHeaders(res, { isPublic: false });
  }
}
