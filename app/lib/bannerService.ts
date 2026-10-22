import { revalidatePath } from "next/cache";
import BannerModel, {
  BannerPlacement,
  BannerStatus,
  IBannerDocument,
  isValidCtaUrl,
} from "../models/Banner";
import dbConnect from "./dbConnect";

export interface PublicBannerDTO {
  id: string;
  headline: string;
  description?: string;
  imageUrl: string;
  mobileImageUrl?: string;
  imageAlt: string;
  ctaLabel: string;
  ctaUrl: string;
  placement: BannerPlacement;
  targetCategory?: string;
  priority: number;
}

export interface BannerConflictCheckResult {
  hasConflict: boolean;
  message?: string;
  conflictingBannerIds: string[];
}

/**
 * Public serializer: Exposes only presentation fields needed for rendering.
 * Never leaks administrative metadata (createdBy, updatedBy, internal notes).
 */
export function serializePublicBanner(doc: IBannerDocument): PublicBannerDTO {
  return {
    id: doc._id.toString(),
    headline: doc.headline,
    description: doc.description || "",
    imageUrl: doc.imageUrl,
    mobileImageUrl: doc.mobileImageUrl || "",
    imageAlt: doc.imageAlt,
    ctaLabel: doc.ctaLabel,
    ctaUrl: doc.ctaUrl,
    placement: doc.placement,
    targetCategory: doc.targetCategory || "",
    priority: doc.priority,
  };
}

/**
 * Deterministic in-memory comparator implementing the tie-breaking rules:
 * 1. Highest numeric priority first (descending)
 * 2. Earliest startAt first (ascending)
 * 3. Earliest createdAt first (ascending)
 * 4. Lexicographically smallest immutable banner ID as final tie-breaker (ascending)
 */
export function compareBannersDeterministic(
  a: { priority: number; startAt: Date; createdAt: Date; _id: any },
  b: { priority: number; startAt: Date; createdAt: Date; _id: any }
): number {
  // 1. Priority descending
  if (b.priority !== a.priority) {
    return b.priority - a.priority;
  }

  // 2. Earliest startAt ascending
  const startDiff =
    new Date(a.startAt).getTime() - new Date(b.startAt).getTime();
  if (startDiff !== 0) {
    return startDiff;
  }

  // 3. Earliest createdAt ascending
  const createdDiff =
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  if (createdDiff !== 0) {
    return createdDiff;
  }

  // 4. Lexicographically smallest immutable banner ID ascending
  const idA = a._id ? a._id.toString() : "";
  const idB = b._id ? b._id.toString() : "";
  return idA.localeCompare(idB);
}

/**
 * Evaluates whether a banner document is eligible for display at a given reference time.
 * Condition interval: startAt <= now < endAt (half-open).
 */
export function isBannerEligible(
  banner: {
    status: string;
    startAt: Date;
    endAt?: Date | null;
    headline?: string;
    ctaLabel?: string;
    ctaUrl?: string;
    imageUrl?: string;
    imageAlt?: string;
  },
  now: Date = new Date()
): boolean {
  if (banner.status !== "published") return false;

  const refTime = now.getTime();
  const startTime = new Date(banner.startAt).getTime();
  if (isNaN(startTime) || startTime > refTime) return false;

  if (banner.endAt) {
    const endTime = new Date(banner.endAt).getTime();
    if (isNaN(endTime) || endTime <= refTime) return false;
  }

  // Verify display fields
  if (
    !banner.headline ||
    !banner.ctaLabel ||
    !banner.ctaUrl ||
    !banner.imageUrl ||
    !banner.imageAlt
  ) {
    return false;
  }

  if (!isValidCtaUrl(banner.ctaUrl)) {
    return false;
  }

  return true;
}

export interface GetEligibleBannersOptions {
  placement: BannerPlacement;
  category?: string;
  now?: Date;
  limit?: number;
}

/**
 * Fetches eligible banners from the database using deterministic sorting & tie-breaking.
 */
export async function getEligibleBanners(
  options: GetEligibleBannersOptions
): Promise<IBannerDocument[]> {
  await dbConnect();
  const now = options.now || new Date();

  // Strict date query: startAt <= now AND (endAt is null OR endAt > now)
  const query: Record<string, any> = {
    placement: options.placement,
    status: "published",
    startAt: { $lte: now },
    $or: [{ endAt: null }, { endAt: { $gt: now } }],
  };

  if (options.placement === "category_promo") {
    if (!options.category || !options.category.trim()) {
      return [];
    }
    query.targetCategory = {
      $regex: new RegExp(`^${escapeRegex(options.category.trim())}$`, "i"),
    };
  }

  const rawDocs = await BannerModel.find(query).lean().exec();

  // In-memory post-filter to enforce all schema & safety invariants
  const eligible = (rawDocs as unknown as IBannerDocument[]).filter((doc) =>
    isBannerEligible(doc, now)
  );

  // Sort deterministically
  eligible.sort(compareBannersDeterministic);

  // Apply placement limits
  if (options.placement === "homepage_hero") {
    return eligible.slice(0, 1);
  }

  const defaultLimit = options.placement === "promo_strip" ? 3 : 4;
  const maxLimit = options.limit ? Math.max(1, options.limit) : defaultLimit;
  return eligible.slice(0, maxLimit);
}

/**
 * Calculates the exact Cache-Control s-maxage duration in seconds.
 * Guarantees that public edge caches never serve a banner beyond its endAt or delay an upcoming startAt.
 */
export async function calculateNextScheduleTtl(
  placement: BannerPlacement,
  selectedBanners: IBannerDocument[],
  now: Date = new Date(),
  maxTtlSeconds = 60
): Promise<number> {
  const refTime = now.getTime();
  let candidateTtl = maxTtlSeconds;

  // 1. Clamped to nearest endAt among currently selected banners
  for (const banner of selectedBanners) {
    if (banner.endAt) {
      const remainingSeconds = Math.floor(
        (new Date(banner.endAt).getTime() - refTime) / 1000
      );
      if (remainingSeconds > 0 && remainingSeconds < candidateTtl) {
        candidateTtl = remainingSeconds;
      }
    }
  }

  // 2. Clamped to next upcoming startAt for published banners that could become eligible
  try {
    const nextStartingBanner = await BannerModel.findOne({
      placement,
      status: "published",
      startAt: { $gt: now },
    })
      .sort({ startAt: 1 })
      .select("startAt")
      .lean()
      .exec();

    if (nextStartingBanner?.startAt) {
      const secondsUntilStart = Math.floor(
        (new Date(nextStartingBanner.startAt).getTime() - refTime) / 1000
      );
      if (secondsUntilStart > 0 && secondsUntilStart < candidateTtl) {
        candidateTtl = secondsUntilStart;
      }
    }
  } catch {
    // Non-fatal, fallback to candidateTtl
  }

  return Math.max(1, candidateTtl);
}

/**
 * Checks for potential homepage hero conflicts during banner creation/publishing.
 * Returns a warning if another published banner overlaps the requested schedule at the same priority.
 */
export async function detectHomepageHeroConflict(params: {
  bannerId?: string;
  startAt: Date;
  endAt?: Date | null;
  priority: number;
}): Promise<BannerConflictCheckResult> {
  await dbConnect();

  const query: Record<string, any> = {
    placement: "homepage_hero",
    status: "published",
    priority: params.priority,
  };

  if (params.bannerId) {
    query._id = { $ne: params.bannerId };
  }

  // Overlap condition:
  // (existing.startAt < new.endAt OR new.endAt is null) AND (existing.endAt > new.startAt OR existing.endAt is null)
  const overlapConditions: any[] = [];

  if (params.endAt) {
    overlapConditions.push({ startAt: { $lt: params.endAt } });
  }

  const newStart = params.startAt;
  overlapConditions.push({
    $or: [{ endAt: null }, { endAt: { $gt: newStart } }],
  });

  if (overlapConditions.length > 0) {
    query.$and = overlapConditions;
  }

  const conflictingDocs = await BannerModel.find(query)
    .select("_id name priority startAt endAt")
    .lean()
    .exec();

  if (conflictingDocs.length > 0) {
    const names = conflictingDocs.map((d: any) => `"${d.name}"`).join(", ");
    return {
      hasConflict: true,
      message: `Warning: This homepage hero overlaps with existing campaign(s) ${names} at the same priority (${params.priority}). The earliest scheduled campaign will take precedence based on tie-breaking rules.`,
      conflictingBannerIds: conflictingDocs.map((d: any) => d._id.toString()),
    };
  }

  return { hasConflict: false, conflictingBannerIds: [] };
}

/**
 * Invalidates cached banner views across the application.
 */
export function invalidateBannerCaches(): void {
  try {
    revalidatePath("/");
    revalidatePath("/api/banners/active");
    revalidatePath("/explore");
  } catch (err) {
    // Non-fatal if invoked outside of Next.js server request context (e.g. tests)
  }
}

function escapeRegex(text: string): string {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}
