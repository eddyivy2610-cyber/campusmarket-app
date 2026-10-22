import { NextRequest, NextResponse } from "next/server";

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetTimeMs: number;
  retryAfterSec: number;
}

interface Bucket {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, Bucket>();

// Periodic garbage collection every 60 seconds
let lastGc = Date.now();
function cleanupExpiredBuckets() {
  const now = Date.now();
  if (now - lastGc < 60000) return;
  lastGc = now;
  for (const [key, bucket] of rateLimitStore.entries()) {
    if (bucket.resetAt <= now) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Predefined rate limit presets for different endpoint classes
 */
export const RATE_LIMIT_PRESETS: Record<string, RateLimitConfig> = {
  // Auth: 10 attempts per minute (prevents brute-force)
  AUTH: { maxRequests: 10, windowMs: 60 * 1000 },
  // Upload signature: 30 requests per minute
  UPLOAD: { maxRequests: 30, windowMs: 60 * 1000 },
  // Reviews creation: 10 submissions per minute per user/IP
  REVIEWS: { maxRequests: 10, windowMs: 60 * 1000 },
  // Orders creation: 15 orders per minute per user
  ORDERS: { maxRequests: 15, windowMs: 60 * 1000 },
  // Follow/unfollow toggle: 20 per minute
  FOLLOW: { maxRequests: 20, windowMs: 60 * 1000 },
  // General API: 120 per minute
  DEFAULT: { maxRequests: 120, windowMs: 60 * 1000 },
};

/**
 * Checks and decrements rate limit allowance for a given key.
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig = RATE_LIMIT_PRESETS.DEFAULT
): RateLimitResult {
  // Enforce rate limits strictly in production or when explicitly enabled in test
  if (process.env.NODE_ENV !== "production" && !process.env.TEST_RATE_LIMIT) {
    return {
      allowed: true,
      limit: 10000,
      remaining: 9999,
      resetTimeMs: Date.now() + 60000,
      retryAfterSec: 0,
    };
  }

  cleanupExpiredBuckets();

  const now = Date.now();
  const bucket = rateLimitStore.get(key);

  if (!bucket || bucket.resetAt <= now) {
    // New or expired window
    const newBucket: Bucket = {
      count: 1,
      resetAt: now + config.windowMs,
    };
    rateLimitStore.set(key, newBucket);
    return {
      allowed: true,
      limit: config.maxRequests,
      remaining: config.maxRequests - 1,
      resetTimeMs: newBucket.resetAt,
      retryAfterSec: Math.ceil(config.windowMs / 1000),
    };
  }

  // Active window
  if (bucket.count >= config.maxRequests) {
    const retryAfterSec = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
    return {
      allowed: false,
      limit: config.maxRequests,
      remaining: 0,
      resetTimeMs: bucket.resetAt,
      retryAfterSec,
    };
  }

  bucket.count++;
  return {
    allowed: true,
    limit: config.maxRequests,
    remaining: config.maxRequests - bucket.count,
    resetTimeMs: bucket.resetAt,
    retryAfterSec: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
  };
}

/**
 * Helper to derive client IP from NextRequest.
 */
export function getClientIp(req: NextRequest): string {
  const xForwardedFor = req.headers.get("x-forwarded-for");
  if (xForwardedFor) {
    const first = xForwardedFor.split(",")[0].trim();
    if (first) return first;
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "127.0.0.1";
}

/**
 * Applies rate limiting to a NextRequest and returns an error NextResponse if exceeded.
 */
export function applyRateLimit(
  req: NextRequest,
  actionKey: string,
  config: RateLimitConfig = RATE_LIMIT_PRESETS.DEFAULT,
  userId?: string
): { allowed: boolean; response?: NextResponse; result: RateLimitResult } {
  const ip = getClientIp(req);
  const identifier = userId ? `user:${userId}` : `ip:${ip}`;
  const key = `ratelimit:${actionKey}:${identifier}`;

  const result = checkRateLimit(key, config);

  if (!result.allowed) {
    const response = NextResponse.json(
      {
        success: false,
        error: "Too many requests. Please slow down and try again later.",
        code: "RATE_LIMIT_EXCEEDED",
        retryAfter: result.retryAfterSec,
      },
      {
        status: 429,
        headers: {
          "Retry-After": result.retryAfterSec.toString(),
          "X-RateLimit-Limit": result.limit.toString(),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": Math.ceil(result.resetTimeMs / 1000).toString(),
        },
      }
    );
    return { allowed: false, response, result };
  }

  return { allowed: true, result };
}

/**
 * Resets the in-memory rate limit store (for test suites).
 */
export function resetRateLimits(): void {
  rateLimitStore.clear();
}
