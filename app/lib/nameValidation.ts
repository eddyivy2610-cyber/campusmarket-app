/**
 * Shared display-name, reserved-name, and safe-redirect validation utilities.
 */

export const DISPLAY_NAME_MIN_LENGTH = 2;
export const DISPLAY_NAME_MAX_LENGTH = 40;

const EXACT_RESERVED_NAMES = new Set([
  "admin",
  "administrator",
  "admins",
  "moderator",
  "mod",
  "mods",
  "support",
  "help",
  "helpdesk",
  "campushive",
  "campusmarket",
  "hive",
  "hiveadmin",
  "hiveteam",
  "official",
  "system",
  "staff",
  "team",
  "security",
  "verified",
  "verification",
  "trustandsafety",
  "billing",
  "payments",
  "escrow",
  "root",
  "superuser",
  "owner",
  "founder",
  "ceo",
  "bot",
  "automod",
  "null",
  "undefined",
  "anonymous",
  "guest",
  "user",
  "me",
  "api",
  "auth",
  "login",
  "signin",
  "signup",
  "register",
  "logout",
  "settings",
  "profile",
  "stores",
  "explore",
  "wanted",
  "radar",
  "messages",
  "notifications",
]);

const RESERVED_SUBSTRINGS = [
  "campushive",
  "campusmarket",
  "hiveadmin",
  "hivesupport",
  "hivestaff",
  "hivemoderator",
  "officialsupport",
  "customercare",
  "customersupport",
  "helpdesk",
  "trustandsafety",
];

const RESERVED_WORD_TOKENS = new Set([
  "admin",
  "administrator",
  "moderator",
  "support",
  "helpdesk",
  "official",
  "staff",
  "system",
  "verified",
]);

export function normalizeDisplayNameWhitespace(raw: string): string {
  return raw.replace(/\s+/g, " ").trim();
}

function foldForReservedCheck(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/0/g, "o")
    .replace(/1/g, "i")
    .replace(/3/g, "e")
    .replace(/4/g, "a")
    .replace(/5/g, "s")
    .replace(/[^a-z0-9]/g, "");
}

export function isReservedIdentityName(raw: string): boolean {
  const trimmed = normalizeDisplayNameWhitespace(raw);
  if (!trimmed) return false;

  const compactLower = trimmed.toLowerCase().replace(/[^a-z0-9]/g, "");
  const folded = foldForReservedCheck(trimmed);

  if (EXACT_RESERVED_NAMES.has(compactLower) || EXACT_RESERVED_NAMES.has(folded)) {
    return true;
  }

  for (const sub of RESERVED_SUBSTRINGS) {
    if (compactLower.includes(sub) || folded.includes(sub)) {
      return true;
    }
  }

  const words = trimmed
    .toLowerCase()
    .split(/[\s._'-]+/)
    .filter(Boolean);
  for (const w of words) {
    const foldedWord = foldForReservedCheck(w);
    if (RESERVED_WORD_TOKENS.has(w) || RESERVED_WORD_TOKENS.has(foldedWord)) {
      return true;
    }
  }

  return false;
}

export interface NameValidationResult {
  valid: boolean;
  normalized: string;
  error?: string;
}

export function validateDisplayName(raw: unknown): NameValidationResult {
  if (typeof raw !== "string") {
    return { valid: false, normalized: "", error: "Full name is required." };
  }

  const normalized = normalizeDisplayNameWhitespace(raw);
  if (!normalized) {
    return { valid: false, normalized: "", error: "Full name is required." };
  }

  if (normalized.length < DISPLAY_NAME_MIN_LENGTH) {
    return {
      valid: false,
      normalized,
      error: `Name must be at least ${DISPLAY_NAME_MIN_LENGTH} characters.`,
    };
  }

  if (normalized.length > DISPLAY_NAME_MAX_LENGTH) {
    return {
      valid: false,
      normalized,
      error: `Name must be ${DISPLAY_NAME_MAX_LENGTH} characters or fewer.`,
    };
  }

  if (!/^[\p{L}][\p{L}\p{M} .'-]*$/u.test(normalized)) {
    return {
      valid: false,
      normalized,
      error: "Name must start with a letter and only use letters, spaces, hyphens, apostrophes, or periods.",
    };
  }

  if (/[.'-]{2,}/.test(normalized)) {
    return {
      valid: false,
      normalized,
      error: "Name cannot contain repeated punctuation.",
    };
  }

  const letterCount = (normalized.match(/\p{L}/gu) || []).length;
  if (letterCount < 2) {
    return {
      valid: false,
      normalized,
      error: "Name must include at least 2 letters.",
    };
  }

  if (isReservedIdentityName(normalized)) {
    return {
      valid: false,
      normalized,
      error: "This name is reserved and cannot be used.",
    };
  }

  return { valid: true, normalized };
}

/**
 * Ensures a post-login redirect parameter is strictly an internal relative path
 * (blocks https://evil.com, //evil.com, /\evil.com, javascript:, etc.).
 */
export function sanitizeInternalRedirect(
  raw: string | null | undefined,
  fallback = "/home"
): string {
  if (!raw || typeof raw !== "string") return fallback;
  const trimmed = raw.trim();
  if (
    !trimmed.startsWith("/") ||
    trimmed.startsWith("//") ||
    trimmed.startsWith("/\\") ||
    /[\u0000-\u001f\u007f]/.test(trimmed)
  ) {
    return fallback;
  }
  return trimmed;
}
