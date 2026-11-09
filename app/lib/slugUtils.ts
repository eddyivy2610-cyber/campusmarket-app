/**
 * Shared Slug Generation & Canonical URL Resolution Utility for Campus Hive.
 *
 * Requirements:
 * - Normalizes text safely to lowercase.
 * - Converts spaces and special separators into single hyphens.
 * - Strips diacritics and handles Unicode safely.
 * - Enforces max descriptive length without chopping words awkwardly.
 * - Pairs descriptive slugs with entropy-derived stable suffixes.
 * - Suffix remains 100% immutable across title edits.
 */

import { deriveSlugSuffix, generateUUIDv7 } from "./uuidv7";

export interface SlugGenerationOptions {
  maxLength?: number;
  fallbackBase?: string;
}

/**
 * Normalizes any text into a clean URL-friendly kebab-case string.
 */
export function normalizeToKebabCase(text: string, maxLength = 50): string {
  if (!text || typeof text !== "string") return "item";

  const normalized = text
    .normalize("NFD") // separate base characters from accents
    .replace(/[\u0300-\u036f]/g, "") // remove accent marks
    .toLowerCase()
    .trim()
    .replace(/['’]/g, "") // remove apostrophes without adding hyphen (e.g. don't -> dont)
    .replace(/[^a-z0-9]+/g, "-") // replace non-alphanumeric with hyphen
    .replace(/^-+|-+$/g, ""); // remove leading and trailing hyphens

  if (!normalized) return "item";

  if (normalized.length <= maxLength) {
    return normalized;
  }

  // Trim to maxLength at word boundary
  const truncated = normalized.slice(0, maxLength);
  const lastHyphen = truncated.lastIndexOf("-");
  if (lastHyphen > maxLength * 0.5) {
    return truncated.slice(0, lastHyphen);
  }
  return truncated.replace(/-+$/, "");
}

/**
 * Creates a complete canonical slug with a stable unique suffix.
 * Example: "Vintage Denim Trucker Jacket" + "a1b2c3d4" -> "vintage-denim-trucker-jacket-a1b2c3d4"
 *
 * @param title Descriptive title or request description
 * @param suffix Stable unique suffix derived from UUIDv7 entropy
 * @param options Slug formatting options
 */
export function buildCanonicalSlug(
  title: string,
  suffix: string,
  options: SlugGenerationOptions = {}
): string {
  const maxLength = options.maxLength || 50;
  const descriptive = normalizeToKebabCase(title, maxLength) || (options.fallbackBase || "item");
  const cleanSuffix = (suffix || "").trim().toLowerCase();

  return cleanSuffix ? `${descriptive}-${cleanSuffix}` : descriptive;
}

/**
 * Generates an initial public identity stack for a new database entity.
 * Creates an immutable UUIDv7, extracts its stable entropy suffix, and builds the canonical slug.
 *
 * @param title Entity title/name
 * @param timestampMs Optional creation timestamp for backfill migrations
 */
export function createEntityIdentity(title: string, timestampMs?: number) {
  const publicId = generateUUIDv7(timestampMs);
  const slugSuffix = deriveSlugSuffix(publicId, 8);
  const slug = buildCanonicalSlug(title, slugSuffix);

  return {
    publicId,
    slugSuffix,
    slug,
  };
}

/**
 * Updates an entity's descriptive slug while strictly preserving its original stable suffix.
 * Ensures the suffix NEVER changes when titles are edited.
 *
 * @param newTitle The updated title
 * @param existingSuffix The entity's immutable slugSuffix
 * @param options Options
 */
export function updateSlugPreservingSuffix(
  newTitle: string,
  existingSuffix: string,
  options: SlugGenerationOptions = {}
): string {
  if (!existingSuffix) {
    throw new Error("Cannot update slug without existing stable suffix");
  }
  return buildCanonicalSlug(newTitle, existingSuffix, options);
}

/**
 * Parses a slug containing a stable suffix into its components.
 * Example: "iphone-15-pro-max-8f9b0c2e" -> { descriptive: "iphone-15-pro-max", suffix: "8f9b0c2e" }
 */
export function parseSlugWithSuffix(fullSlug: string): {
  descriptive: string;
  suffix: string;
  isSuffixed: boolean;
} {
  const clean = (fullSlug || "").trim().toLowerCase();
  const lastHyphen = clean.lastIndexOf("-");

  if (lastHyphen === -1) {
    return {
      descriptive: clean,
      suffix: "",
      isSuffixed: false,
    };
  }

  const suffixCandidate = clean.slice(lastHyphen + 1);
  const descriptive = clean.slice(0, lastHyphen);

  // Suffix is hexadecimal or alphanumeric between 6 and 12 chars
  const isSuffix = /^[0-9a-z]{6,12}$/i.test(suffixCandidate);

  return {
    descriptive,
    suffix: isSuffix ? suffixCandidate : "",
    isSuffixed: isSuffix,
  };
}

/**
 * Normalizes a store slug according to store-specific uniqueness rules.
 */
export function normalizeStoreSlug(name: string): string {
  return normalizeToKebabCase(name, 45);
}

/**
 * Normalizes a username according to user profile rules.
 */
export function normalizeUsername(username: string): string {
  return (username || "")
    .replace(/^@/, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 30);
}
