import { NextRequest, NextResponse } from "next/server";
import {
  getEligibleBanners,
  calculateNextScheduleTtl,
  serializePublicBanner,
} from "@/lib/bannerService";
import {
  applyCacheHeaders,
  isRequestSafeForPublicCache,
} from "@/lib/cacheHeaders";
import { BannerPlacement } from "@/models/Banner";

export const dynamic = "force-dynamic";

/**
 * GET /api/banners/active
 * Public endpoint to fetch active, eligible promotional banners.
 *
 * Supported query parameters:
 * - placement: "homepage_hero" | "promo_strip" | "category_promo" | "all" (defaults to "homepage_hero")
 * - category: required when placement is "category_promo"
 */
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const placementParam = searchParams.get("placement") || "homepage_hero";
  const categoryParam = searchParams.get("category") || undefined;

  const validPlacements: BannerPlacement[] = [
    "homepage_hero",
    "promo_strip",
    "category_promo",
  ];

  try {
    const now = new Date();

    if (placementParam === "all") {
      // Return eligible banners for all placements
      const [heroBanners, promoBanners, categoryBanners] = await Promise.all([
        getEligibleBanners({ placement: "homepage_hero", now }),
        getEligibleBanners({ placement: "promo_strip", now }),
        categoryParam
          ? getEligibleBanners({
              placement: "category_promo",
              category: categoryParam,
              now,
            })
          : Promise.resolve([]),
      ]);

      const allSelected = [
        ...heroBanners,
        ...promoBanners,
        ...categoryBanners,
      ];
      const ttl = await calculateNextScheduleTtl(
        "homepage_hero",
        allSelected,
        now,
        60
      );

      const responseData = {
        success: true,
        data: {
          homepage_hero: heroBanners[0]
            ? serializePublicBanner(heroBanners[0])
            : null,
          promo_strip: promoBanners.map(serializePublicBanner),
          category_promo: categoryBanners.map(serializePublicBanner),
        },
      };

      const res = NextResponse.json(responseData);
      const isPublic = isRequestSafeForPublicCache(req, { isPublicQuery: true });
      return applyCacheHeaders(res, {
        isPublic,
        sMaxAge: ttl,
        staleWhileRevalidate: Math.min(30, ttl),
      });
    }

    if (!validPlacements.includes(placementParam as BannerPlacement)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid placement "${placementParam}". Must be one of: ${validPlacements.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const placement = placementParam as BannerPlacement;
    const eligibleBanners = await getEligibleBanners({
      placement,
      category: categoryParam,
      now,
    });

    const ttl = await calculateNextScheduleTtl(
      placement,
      eligibleBanners,
      now,
      60
    );

    const payload =
      placement === "homepage_hero"
        ? eligibleBanners[0]
          ? serializePublicBanner(eligibleBanners[0])
          : null
        : eligibleBanners.map(serializePublicBanner);

    const res = NextResponse.json({
      success: true,
      data: payload,
    });

    const isPublic = isRequestSafeForPublicCache(req, { isPublicQuery: true });
    return applyCacheHeaders(res, {
      isPublic,
      sMaxAge: ttl,
      staleWhileRevalidate: Math.min(30, ttl),
    });
  } catch (error) {
    console.error("[BannersActiveAPI] Error fetching eligible banners:", error);

    // Deterministic fallback: never throw or break public pages on transient DB issues
    const fallbackPayload = placementParam === "homepage_hero" ? null : [];
    const fallbackRes = NextResponse.json({
      success: true,
      data: fallbackPayload,
      fallback: true,
    });

    return applyCacheHeaders(fallbackRes, {
      isPublic: false,
    });
  }
}
