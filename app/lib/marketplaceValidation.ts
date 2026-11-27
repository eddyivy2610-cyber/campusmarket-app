import { isReservedIdentityName, normalizeDisplayNameWhitespace } from "./nameValidation";
import { CAMPUS_COLLECTION } from "@/data/campuses";

export const LISTING_TITLE_MIN_LENGTH = 3;
export const LISTING_TITLE_MAX_LENGTH = 120;
export const LISTING_DESCRIPTION_MIN_LENGTH = 10;
export const LISTING_DESCRIPTION_MAX_LENGTH = 3000;
export const LISTING_MAX_PRICE_NGN = 50_000_000;
export const LISTING_MAX_IMAGES = 8;
export const MAX_ACTIVE_LISTINGS_PER_STORE = 200;

export const STORE_NAME_MIN_LENGTH = 3;
export const STORE_NAME_MAX_LENGTH = 60;

export const ALLOWED_LISTING_CATEGORIES = new Set([
  "Laptops & Computers",
  "Phones & Tablets",
  "Fashion & Clothing",
  "Books & Academics",
  "Hostel & Furniture",
  "Electronics & Audio",
  "Services",
  "Design & Printing",
  "Tech & Repairs",
  "Hair & Beauty",
  "Academic Tutoring & Writing",
  "Photography & Video",
  "Cleaning & Errand",
  "Electronics",
  "Fashion",
  "Academics",
  "Food & Pastries",
  "Beauty & Personal Care",
  "Sports & Fitness",
  "General",
  "Other",
]);

const PROHIBITED_CONTENT_PATTERNS: Array<{ pattern: RegExp; reason: string }> = [
  {
    pattern: /\b(ak-?47|assault\s+rifle|handgun|pistol|live\s+ammunition|firearms?|explosives?|grenade|switchblade|taser\s+gun)\b/i,
    reason: "Weapons, firearms, ammunition, and explosives are strictly prohibited on Campus Hive.",
  },
  {
    pattern: /\b(cocaine|heroin|methamphetamine|fentanyl|rohypnol|codeine\s+syrup|tramadol\s+\d*mg|thc\s+carts?|weed\s+plug|loud\s+plug)\b/i,
    reason: "Controlled substances, narcotics, and illicit drugs are strictly prohibited.",
  },
  {
    pattern: /\b(waec\s+runs|jamb\s+runs|neco\s+runs|expo\s+runs|leaked\s+exam\s+papers?|exam\s+malpractice|forged\s+transcript|fake\s+certificate|buy\s+grades?)\b/i,
    reason: "Exam malpractice materials, forged academic documents, and grade manipulation are prohibited.",
  },
  {
    pattern: /\b(cc\s+dumps?|cloned\s+cards?|bank\s+logs?|yahoo\s+format|hacked\s+accounts?|stolen\s+(iphone|laptop|phone))\b/i,
    reason: "Stolen goods, compromised accounts, and financial fraud items are prohibited.",
  },
];

export function checkListingContentSafety(
  title: string,
  description?: string | null
): { safe: boolean; reason?: string } {
  const combined = `${title || ""}\n${description || ""}`;
  if (/(?:javascript|vbscript|data:text\/html):/i.test(combined)) {
    return { safe: false, reason: "Unsafe link or script scheme detected in listing content." };
  }
  for (const rule of PROHIBITED_CONTENT_PATTERNS) {
    if (rule.pattern.test(combined)) {
      return { safe: false, reason: rule.reason };
    }
  }
  return { safe: true };
}

export function validateListingPrice(
  rawPrice: unknown,
  options?: { listingType?: string; pricingModel?: string }
): { valid: boolean; price: number; error?: string } {
  const num = Number(rawPrice);
  if (!Number.isFinite(num)) {
    return { valid: false, price: 0, error: "A valid numeric price is required." };
  }
  const allowZero =
    options?.listingType === "service" && options?.pricingModel === "negotiable";
  if (allowZero ? num < 0 : num <= 0) {
    return {
      valid: false,
      price: num,
      error: allowZero ? "Price cannot be negative." : "Price must be greater than ₦0.",
    };
  }
  if (num > LISTING_MAX_PRICE_NGN) {
    return {
      valid: false,
      price: num,
      error: `Price cannot exceed ₦${LISTING_MAX_PRICE_NGN.toLocaleString("en-NG")}.`,
    };
  }
  return { valid: true, price: Math.round(num * 100) / 100 };
}

export function validateStoreName(raw: unknown): {
  valid: boolean;
  normalized: string;
  error?: string;
} {
  if (typeof raw !== "string") {
    return { valid: false, normalized: "", error: "Store name is required." };
  }
  const normalized = normalizeDisplayNameWhitespace(raw);
  if (normalized.length < STORE_NAME_MIN_LENGTH || normalized.length > STORE_NAME_MAX_LENGTH) {
    return {
      valid: false,
      normalized,
      error: `Store name must be between ${STORE_NAME_MIN_LENGTH} and ${STORE_NAME_MAX_LENGTH} characters.`,
    };
  }
  if (!/^[\p{L}\p{N}][\p{L}\p{N}\p{M} &'.,()-]*$/u.test(normalized)) {
    return {
      valid: false,
      normalized,
      error: "Store name contains unsupported characters.",
    };
  }
  const letterCount = (normalized.match(/\p{L}/gu) || []).length;
  if (letterCount < 2) {
    return {
      valid: false,
      normalized,
      error: "Store name must include at least 2 letters.",
    };
  }
  if (isReservedIdentityName(normalized)) {
    return {
      valid: false,
      normalized,
      error: "This store name uses a reserved or official platform term and cannot be registered.",
    };
  }
  return { valid: true, normalized };
}

export function validatePhoneInput(raw: unknown): {
  valid: boolean;
  phone: string;
  error?: string;
} {
  if (typeof raw !== "string" || !raw.trim()) {
    return { valid: false, phone: "", error: "A valid contact phone or WhatsApp number is required." };
  }
  const trimmed = raw.trim();
  const digits = trimmed.replace(/\D/g, "");
  if (!/^\+?[0-9 ()-]{7,20}$/.test(trimmed) || digits.length < 7 || digits.length > 15) {
    return {
      valid: false,
      phone: trimmed,
      error: "Enter a valid phone number (7 to 15 digits).",
    };
  }
  return { valid: true, phone: trimmed };
}

export function detectFileMagicMime(
  buf: Buffer
): "image/jpeg" | "image/png" | "image/gif" | "image/webp" | "application/pdf" | null {
  if (!Buffer.isBuffer(buf) || buf.length < 8) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47 &&
    buf[4] === 0x0d &&
    buf[5] === 0x0a &&
    buf[6] === 0x1a &&
    buf[7] === 0x0a
  ) {
    return "image/png";
  }
  if (
    buf[0] === 0x47 &&
    buf[1] === 0x49 &&
    buf[2] === 0x46 &&
    buf[3] === 0x38 &&
    (buf[4] === 0x37 || buf[4] === 0x39) &&
    buf[5] === 0x61
  ) {
    return "image/gif";
  }
  if (
    buf.length >= 12 &&
    buf[0] === 0x52 &&
    buf[1] === 0x49 &&
    buf[2] === 0x46 &&
    buf[3] === 0x46 &&
    buf[8] === 0x57 &&
    buf[9] === 0x45 &&
    buf[10] === 0x42 &&
    buf[11] === 0x50
  ) {
    return "image/webp";
  }
  if (
    buf[0] === 0x25 &&
    buf[1] === 0x50 &&
    buf[2] === 0x44 &&
    buf[3] === 0x46 &&
    buf[4] === 0x2d
  ) {
    return "application/pdf";
  }
  return null;
}

export function computeCampusDistanceKm(
  campusName: string | null | undefined,
  safetyLocation: { lat?: number; lng?: number } | null | undefined
): number | null {
  if (!campusName || !safetyLocation) return null;
  const lat = Number(safetyLocation.lat);
  const lng = Number(safetyLocation.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  const normalized = campusName.trim().toLowerCase();
  const match = CAMPUS_COLLECTION.find(
    (c) =>
      c.name.toLowerCase() === normalized ||
      c.shortName.toLowerCase() === normalized ||
      c.slug === normalized
  );
  if (!match || !Number.isFinite(match.lat) || !Number.isFinite(match.lng)) {
    return null;
  }

  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(match.lat - lat);
  const dLng = toRad(match.lng - lng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat)) * Math.cos(toRad(match.lat)) * Math.sin(dLng / 2) ** 2;
  const dist = 2 * R * Math.asin(Math.min(1, Math.sqrt(a)));
  return Math.round(dist * 10) / 10;
}
