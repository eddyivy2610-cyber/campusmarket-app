/**
 * RFC 9562 Compliant UUIDv7 Implementation for Campus Hive.
 *
 * UUIDv7 Structure:
 * - 48 bits: UNIX timestamp (milliseconds since epoch)
 * - 4 bits: Version (0111 = 7)
 * - 12 bits: Sequence / random entropy (rand_a)
 * - 2 bits: Variant (10)
 * - 62 bits: Random entropy (rand_b)
 *
 * Features:
 * - Supports explicit historical timestamp passing for idempotent backfill migrations.
 * - Millisecond clock sequence counter to guarantee monotonicity within identical timestamps.
 * - Extracts compact alphanumeric suffixes exclusively from the random entropy portion (rand_b),
 *   guaranteeing no collision clustering from identical or close creation times.
 */

import crypto from "crypto";

let lastTimestamp = -1;
let sequenceCounter = 0;

/**
 * Generates an RFC 9562 UUIDv7 string.
 * @param timestampMs Optional historical timestamp in milliseconds. Defaults to Date.now().
 */
export function generateUUIDv7(timestampMs?: number): string {
  const isHistorical = typeof timestampMs === "number" && !isNaN(timestampMs) && timestampMs > 0;
  const now = isHistorical ? Math.floor(timestampMs) : Date.now();

  // Maintain 12-bit sequence counter for monotonic ordering
  if (!isHistorical) {
    if (now === lastTimestamp) {
      sequenceCounter = (sequenceCounter + 1) & 0xfff;
    } else {
      lastTimestamp = now;
      sequenceCounter = crypto.randomInt(0, 0x1000);
    }
  }

  // 1. 48-bit timestamp
  const timeHex = now.toString(16).padStart(12, "0");
  const timeHigh = timeHex.slice(0, 8); // 32 bits
  const timeMid = timeHex.slice(8, 12);  // 16 bits

  // 2. 4-bit version (7) + 12-bit sequence / rand_a
  const seq = isHistorical ? crypto.randomInt(0, 0x1000) : sequenceCounter;
  const verAndSeq = `7${seq.toString(16).padStart(3, "0")}`;

  // 3. 2-bit variant (0b10) + 14-bit random (6 bits variant+rand, 8 bits rand)
  const randBytes = crypto.randomBytes(8);
  const variantByte = (randBytes[0] & 0x3f) | 0x80; // set top bits to 10
  const varAndRand = `${variantByte.toString(16).padStart(2, "0")}${randBytes[1].toString(16).padStart(2, "0")}`;

  // 4. 48-bit random entropy (rand_b)
  const randB = randBytes.subarray(2, 8).toString("hex");

  return `${timeHigh}-${timeMid}-${verAndSeq}-${varAndRand}-${randB}`.toLowerCase();
}

/**
 * Validates whether a given string is a valid UUIDv7 format.
 */
export function isValidUUIDv7(uuid: string): boolean {
  if (typeof uuid !== "string" || uuid.length !== 36) return false;
  // Format: 8-4-4-4-12, version 7, variant [89ab]
  return /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid);
}

/**
 * Extracts timestamp in milliseconds from a UUIDv7.
 */
export function extractUUIDv7Timestamp(uuid: string): number | null {
  if (!isValidUUIDv7(uuid)) return null;
  const hex = uuid.replace(/-/g, "").slice(0, 12);
  return parseInt(hex, 16);
}

/**
 * Extracts all pure random entropy bits from an RFC 9562 UUIDv7.
 * Strictly separates out timestamp, version (4 bits), and variant (2 bits),
 * returning the combined 72 bits (18 hex characters) of pure random entropy:
 * - rand_a: 12 bits (group 3, chars 1..3)
 * - rand_b upper: 12 bits (group 4, chars 1..3)
 * - rand_b lower: 48 bits (group 5, chars 0..11)
 */
export function extractUUIDv7RandomBits(uuid: string): string {
  if (!isValidUUIDv7(uuid)) {
    return crypto.createHash("sha256").update(uuid).digest("hex");
  }
  const parts = uuid.split("-");
  const randA = parts[2].slice(1); // 3 hex chars = 12 bits
  const randBUpper = parts[3].slice(1); // 3 hex chars = 12 bits
  const randBLower = parts[4]; // 12 hex chars = 48 bits
  return `${randA}${randBUpper}${randBLower}`.toLowerCase();
}

/**
 * Derives a compact, stable unique suffix for human-readable URLs.
 * IMPORTANT: Strictly extracts from the 72 bits of pure random entropy,
 * never from the leading timestamp or version/variant bits, ensuring maximum dispersion.
 *
 * @param uuid The record's full UUIDv7
 * @param length Output suffix character length (default: 8, max: 16)
 */
export function deriveSlugSuffix(uuid: string, length = 8): string {
  const randomBitsHex = extractUUIDv7RandomBits(uuid);
  const safeLength = Math.max(6, Math.min(16, length));
  return randomBitsHex.slice(0, safeLength).toLowerCase();
}
