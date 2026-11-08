/**
 * app/lib/usernameUtils.ts
 *
 * Utilities for username generation and validation according to Campus Hive specifications:
 * - Default assigned username: max 8 characters, mixture of firstname (lowercase letters) and up to 3 digits.
 * - Editable username format: 3–8 characters, alphanumeric lowercase only.
 */

export function generateDefaultUsername(name?: string, email?: string): string {
  const rawFirst = (name || "").trim().split(/\s+/)[0] || (email || "").split("@")[0] || "user";
  const lettersOnly = rawFirst.toLowerCase().replace(/[^a-z]/g, "");
  // Use at most 5 characters of the first name so base + 3 digits <= 8 characters total
  const base = (lettersOnly || "user").slice(0, 5);
  // Generate a random 3-digit number (100–999)
  const digits = Math.floor(100 + Math.random() * 900);
  const candidate = `${base}${digits}`;
  return candidate.slice(0, 8);
}

export function isValidUsernameFormat(username: string): boolean {
  return /^[a-z0-9]{3,8}$/.test(username);
}
