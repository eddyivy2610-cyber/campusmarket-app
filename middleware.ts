import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  applyRateLimitAsync,
  RATE_LIMIT_PRESETS,
} from "@/lib/rateLimit";
import { validateSameOrigin } from "@/lib/csrf";

export async function middleware(request: NextRequest) {
  // Extract or generate a unique request ID
  const incomingRequestId = request.headers.get("x-request-id");
  const requestId =
    incomingRequestId && incomingRequestId.trim() !== ""
      ? incomingRequestId.trim()
      : crypto.randomUUID();

  const pathname = request.nextUrl.pathname;
  const method = request.method;

  // 1. Rate Limiting Enforcement in Middleware for APIs
  if (pathname.startsWith("/api/")) {
    const csrfResponse = validateSameOrigin(request);
    if (csrfResponse) {
      csrfResponse.headers.set("x-request-id", requestId);
      return csrfResponse;
    }
    // Health probe and static internal routes bypass rate limiting
    if (pathname === "/api/health") {
      // Allow health probes unimpeded
    } else if (
      pathname === "/api/auth/refresh" ||
      pathname === "/api/auth/logout" ||
      pathname === "/api/admin/auth/refresh" ||
      pathname === "/api/admin/auth/me"
    ) {
      const rateLimit = await applyRateLimitAsync(request, "session", RATE_LIMIT_PRESETS.DEFAULT);
      if (!rateLimit.allowed && rateLimit.response) {
        rateLimit.response.headers.set("x-request-id", requestId);
        return rateLimit.response;
      }
    } else if (
      pathname.startsWith("/api/auth/") ||
      pathname.startsWith("/api/admin/auth/")
    ) {
      // Auth routes: strict brute-force prevention
      const rateLimit = await applyRateLimitAsync(request, "auth", RATE_LIMIT_PRESETS.AUTH);
      if (!rateLimit.allowed && rateLimit.response) {
        rateLimit.response.headers.set("x-request-id", requestId);
        return rateLimit.response;
      }
    } else if (
      pathname.startsWith("/api/upload") ||
      pathname.startsWith("/api/documents/")
    ) {
      // Upload routes: upload resource protection
      const rateLimit = await applyRateLimitAsync(request, "upload", RATE_LIMIT_PRESETS.UPLOAD);
      if (!rateLimit.allowed && rateLimit.response) {
        rateLimit.response.headers.set("x-request-id", requestId);
        return rateLimit.response;
      }
    } else if (["POST", "PATCH", "DELETE", "PUT"].includes(method)) {
      // General write routes: mutations protection
      const rateLimit = await applyRateLimitAsync(request, "write", RATE_LIMIT_PRESETS.WRITE);
      if (!rateLimit.allowed && rateLimit.response) {
        rateLimit.response.headers.set("x-request-id", requestId);
        return rateLimit.response;
      }
    }
  }

  // Clone the request headers and inject x-request-id for downstream handlers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-request-id", requestId);

  // Create response with modified request headers
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Attach traceable request ID and security headers to outgoing response
  response.headers.set("x-request-id", requestId);
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", pathname === "/forgot-password" ? "no-referrer" : "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - public assets
     */
    "/((?!_next/static|_next/image|favicon.ico|freepik__|placeholder).*)",
  ],
};
