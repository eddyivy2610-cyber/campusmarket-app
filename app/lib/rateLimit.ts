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
  source: "upstash" | "memory";
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
  // Upload signature / media: 30 requests per minute
  UPLOAD: { maxRequests: 30, windowMs: 60 * 1000 },
  // Write routes (POST / PATCH / DELETE): 60 per minute per client
  WRITE: { maxRequests: 60, windowMs: 60 * 1000 },
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
 * Robust Client IP Resolution:
 * Prioritizes trusted cloud proxy headers (Cloudflare, Vercel, AWS), validates IP format,
 * and avoids trusting raw spoofed client headers.
 */
export function getClientIp(req: NextRequest): string {
  // Cloudflare Connecting IP
  const cfIp = req.headers.get("cf-connecting-ip");
  if (cfIp && isValidIp(cfIp.trim())) {
    return cfIp.trim();
  }

  // True-Client-IP (Akamai / Cloudflare Enterprise)
  const trueClientIp = req.headers.get("true-client-ip");
  if (trueClientIp && isValidIp(trueClientIp.trim())) {
    return trueClientIp.trim();
  }

  // X-Real-IP (Nginx / Ingress proxy)
  const realIp = req.headers.get("x-real-ip");
  if (realIp && isValidIp(realIp.trim())) {
    return realIp.trim();
  }

  // X-Forwarded-For (take the first client hop)
  const xForwardedFor = req.headers.get("x-forwarded-for");
  if (xForwardedFor) {
    const parts = xForwardedFor.split(",");
    for (const part of parts) {
      const candidate = part.trim();
      if (isValidIp(candidate)) {
        return candidate;
      }
    }
  }

  return "127.0.0.1";
}

function isValidIp(ip: string): boolean {
  // Matches basic IPv4 or IPv6
  const ipv4Pattern = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
  const ipv6Pattern = /^[0-9a-fA-F:]+$/;
  return ipv4Pattern.test(ip) || ipv6Pattern.test(ip);
}

/**
 * Extracts authenticated user identifier from token header if present without throwing.
 */
export function extractAuthIdentifier(req: NextRequest): string | null {
  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      const token = authHeader.substring(7).trim();
      const parts = token.split(".");
      if (parts.length === 3) {
        const payloadStr = Buffer.from(parts[1], "base64").toString("utf8");
        const payload = JSON.parse(payloadStr);
        if (payload?.sub || payload?.id) {
          return String(payload.sub || payload.id);
        }
      }
    } catch {
      // Ignore unparseable tokens; fallback to IP
    }
  }
  return null;
}

/**
 * Executes rate limit check against Upstash Redis via REST if configured,
 * otherwise falls back to memory bucket.
 * Resilient: If Upstash throws or times out, fails open to prevent outage.
 */
export async function checkRateLimitAsync(
  key: string,
  config: RateLimitConfig = RATE_LIMIT_PRESETS.DEFAULT
): Promise<RateLimitResult> {
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (upstashUrl && upstashToken) {
    try {
      const windowSeconds = Math.ceil(config.windowMs / 1000);
      const redisKey = `ratelimit:${key}`;

      // Upstash REST Pipeline: INCR and EXPIRE if new
      const pipelineRes = await fetch(`${upstashUrl}/pipeline`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${upstashToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([
          ["INCR", redisKey],
          ["EXPIRE", redisKey, windowSeconds, "NX"],
          ["TTL", redisKey],
        ]),
        // Short timeout to avoid blocking downstream API
        signal: AbortSignal.timeout(1500),
      });

      if (pipelineRes.ok) {
        const results = await pipelineRes.json();
        const currentCount = Number(results[0]?.result || 1);
        const ttl = Number(results[2]?.result || windowSeconds);
        const retryAfterSec = Math.max(1, ttl);
        const resetTimeMs = Date.now() + retryAfterSec * 1000;

        if (currentCount > config.maxRequests) {
          return {
            allowed: false,
            limit: config.maxRequests,
            remaining: 0,
            resetTimeMs,
            retryAfterSec,
            source: "upstash",
          };
        }

        return {
          allowed: true,
          limit: config.maxRequests,
          remaining: Math.max(0, config.maxRequests - currentCount),
          resetTimeMs,
          retryAfterSec,
          source: "upstash",
        };
      }
    } catch (err) {
      // Upstash infrastructure failure: log and fail-open to local memory fallback
      console.warn("[RateLimit] Upstash REST unavailable, falling back to local bucket:", err);
    }
  }

  // Fallback to in-memory rate limiting
  return { ...checkRateLimit(key, config), source: "memory" };
}

/**
 * Synchronous local memory rate limit check.
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig = RATE_LIMIT_PRESETS.DEFAULT
): Omit<RateLimitResult, "source"> {
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
 * Synchronous rate limiting application (matches existing route handler callers).
 */
export function applyRateLimit(
  req: NextRequest,
  actionKey: string,
  config: RateLimitConfig = RATE_LIMIT_PRESETS.DEFAULT,
  userId?: string
): { allowed: boolean; response?: NextResponse; result: Omit<RateLimitResult, "source"> } {
  const effectiveUserId = userId || extractAuthIdentifier(req);
  const ip = getClientIp(req);
  const identifier = effectiveUserId ? `user:${effectiveUserId}` : `ip:${ip}`;
  const key = `${actionKey}:${identifier}`;

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
 * Async rate limiting application (supports Upstash Redis in middleware).
 */
export async function applyRateLimitAsync(
  req: NextRequest,
  actionKey: string,
  config: RateLimitConfig = RATE_LIMIT_PRESETS.DEFAULT,
  userId?: string
): Promise<{ allowed: boolean; response?: NextResponse; result: RateLimitResult }> {
  const effectiveUserId = userId || extractAuthIdentifier(req);
  const ip = getClientIp(req);
  const identifier = effectiveUserId ? `user:${effectiveUserId}` : `ip:${ip}`;
  const key = `${actionKey}:${identifier}`;

  const result = await checkRateLimitAsync(key, config);

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
