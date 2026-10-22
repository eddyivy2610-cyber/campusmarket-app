import { NextRequest, NextResponse } from "next/server";

export interface CacheOptions {
  isPublicEligible: boolean;
  sMaxAge?: number;
  staleWhileRevalidate?: number;
}

/**
 * Determines whether an incoming NextRequest is safe for public edge caching.
 * Public caching is strictly prohibited if:
 * 1. An Authorization header is present
 * 2. Any authentication cookie is present
 * 3. The request is not a GET or HEAD
 * 4. The caller requested unlinked/private resources
 */
export function isRequestSafeForPublicCache(
  req: NextRequest,
  additionalChecks: { isPublicQuery: boolean }
): boolean {
  if (req.method !== "GET" && req.method !== "HEAD") {
    return false;
  }

  // Any Authorization header disqualifies public caching
  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.trim().length > 0) {
    return false;
  }

  // Any auth cookie disqualifies public caching
  const hasAuthCookie =
    Boolean(req.cookies.get("auth_token")) ||
    Boolean(req.cookies.get("campushive_token")) ||
    Boolean(req.cookies.get("campus_token")) ||
    Boolean(req.cookies.get("token")) ||
    Boolean(req.cookies.get("refreshToken")) ||
    Boolean(req.cookies.get("next-auth.session-token")) ||
    Boolean(req.cookies.get("__Secure-next-auth.session-token"));

  if (hasAuthCookie) {
    return false;
  }

  return additionalChecks.isPublicQuery;
}

/**
 * Applies strict, leak-proof Cache-Control headers to a NextResponse.
 * - Public: `public, s-maxage=60, stale-while-revalidate=300, max-age=0` + `Vary: Accept-Encoding, Authorization, Cookie`
 * - Private: `private, no-cache, no-store, max-age=0, must-revalidate` + `Pragma: no-cache` + `Vary: Authorization, Cookie`
 */
export function applyCacheHeaders(
  res: NextResponse,
  options: {
    isPublic: boolean;
    sMaxAge?: number;
    staleWhileRevalidate?: number;
  }
): NextResponse {
  if (options.isPublic) {
    const sMax = options.sMaxAge ?? 60;
    const swr = options.staleWhileRevalidate ?? 300;
    res.headers.set(
      "Cache-Control",
      `public, s-maxage=${sMax}, stale-while-revalidate=${swr}`
    );
    res.headers.set("Vary", "Accept-Encoding, Authorization, Cookie");
  } else {
    res.headers.set(
      "Cache-Control",
      "private, no-cache, no-store, max-age=0, must-revalidate"
    );
    res.headers.set("Pragma", "no-cache");
    res.headers.set("Vary", "Authorization, Cookie");
  }
  return res;
}
