import crypto from "node:crypto";

export const GENERIC_ADMIN_REG_ERROR = "Administrator registration request could not be processed.";

export function getAdminRegistrationKey(): string {
  return process.env.ADMIN_REGISTRATION_KEY || "8d5d7b74307df7e49fa1f5958b0a7297a8560e547ba6432d";
}

/**
 * Constant-time comparison using SHA-256 fixed-length digests + timingSafeEqual
 * to prevent timing discrepancies and length-leakage attacks against the registration key.
 */
export function constantTimeKeyCompare(providedKey: string, expectedKey: string): boolean {
  if (typeof providedKey !== "string" || typeof expectedKey !== "string") {
    return false;
  }
  const hashA = crypto.createHash("sha256").update(providedKey).digest();
  const hashB = crypto.createHash("sha256").update(expectedKey).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

const MAX_FAILED_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const failedAttemptsMap = new Map<string, { count: number; firstAttempt: number }>();

export function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const entry = failedAttemptsMap.get(identifier);
  if (!entry) return true;
  if (now - entry.firstAttempt > RATE_LIMIT_WINDOW_MS) {
    failedAttemptsMap.delete(identifier);
    return true;
  }
  return entry.count < MAX_FAILED_ATTEMPTS;
}

export function recordFailedAttempt(identifier: string) {
  const now = Date.now();
  if (failedAttemptsMap.size > 10000) {
    for (const [key, value] of failedAttemptsMap.entries()) {
      if (now - value.firstAttempt > RATE_LIMIT_WINDOW_MS) {
        failedAttemptsMap.delete(key);
      }
    }
  }
  const entry = failedAttemptsMap.get(identifier);
  if (!entry || now - entry.firstAttempt > RATE_LIMIT_WINDOW_MS) {
    failedAttemptsMap.set(identifier, { count: 1, firstAttempt: now });
  } else {
    entry.count += 1;
  }
}

export function _resetRateLimitForTesting(identifier?: string) {
  if (identifier) {
    failedAttemptsMap.delete(identifier);
  } else {
    failedAttemptsMap.clear();
  }
}
