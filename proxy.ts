import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  applyRateLimitAsync,
  RATE_LIMIT_PRESETS,
} from "@/lib/rateLimit";
import { validateSameOrigin } from "@/lib/csrf";

// ---------------------------------------------------------------------------
// Edge-safe JWT helpers (Web Crypto – no node:crypto)
// ---------------------------------------------------------------------------

function b64urlToUint8(b64: string): Uint8Array {
  let s = b64.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  const bin = atob(s);
  const buf = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
  return buf;
}

async function edgeVerifyAdminToken(token: string): Promise<boolean> {
  try {
    const secret = process.env.AUTH_SECRET;
    if (!secret) return false;
    const parts = token.trim().split(".");
    if (parts.length !== 3) return false;
    const [hdr, pay, sig] = parts;

    // Verify HMAC-SHA256 signature
    const keyMaterial = new TextEncoder().encode(secret);
    const cryptoKey = await crypto.subtle.importKey(
      "raw", keyMaterial, { name: "HMAC", hash: "SHA-256" }, false, ["verify"]
    );
    const data = new TextEncoder().encode(`${hdr}.${pay}`);
    const sigBytes = b64urlToUint8(sig);
    const valid = await crypto.subtle.verify("HMAC", cryptoKey, sigBytes.buffer as ArrayBuffer, data);
    if (!valid) return false;

    // Decode payload and check claims
    const payload = JSON.parse(new TextDecoder().decode(b64urlToUint8(pay)));
    const now = Math.floor(Date.now() / 1000);
    if (payload.iss !== "campushive.edu.ng") return false;
    if (payload.aud !== "campushive-api") return false;
    if (typeof payload.exp !== "number" || payload.exp <= now) return false;
    if (payload.tokenType !== "access") return false;
    if (payload.role !== "admin") return false;
    return true;
  } catch {
    return false;
  }
}

/** Returns true if the request carries a verified admin JWT (cookie or Bearer). */
async function isAdminRequest(request: NextRequest): Promise<boolean> {
  // 1. httpOnly cookie set by admin sign-in route
  const cookieToken =
    request.cookies.get("hive_admin_token")?.value ||
    request.cookies.get("campus_token")?.value;
  if (cookieToken && await edgeVerifyAdminToken(cookieToken)) return true;

  // 2. Authorization header (SPA / fetch with credentials)
  const authHeader = request.headers.get("authorization") ?? "";
  if (authHeader.startsWith("Bearer ")) {
    const bearer = authHeader.slice(7);
    if (bearer && await edgeVerifyAdminToken(bearer)) return true;
  }
  return false;
}

export async function proxy(request: NextRequest) {
  // Extract or generate a unique request ID
  const incomingRequestId = request.headers.get("x-request-id");
  const requestId =
    incomingRequestId && incomingRequestId.trim() !== ""
      ? incomingRequestId.trim()
      : crypto.randomUUID();

  const pathname = request.nextUrl.pathname;
  const method = request.method;

  // -------------------------------------------------------------------------
  // ADMIN ROUTE STEALTH PROTECTION
  // Any request to /admin/* or /api/admin/* that is NOT from a verified admin
  // gets a 404 response — the route must not be discoverable by non-admins.
  // Sign-in and sign-up pages are allowed through (they handle their own auth).
  // -------------------------------------------------------------------------
  const isAdminUiPath = pathname === "/admin" || pathname.startsWith("/admin/");
  const isAdminApiPath = pathname.startsWith("/api/admin/");

  if (isAdminUiPath || isAdminApiPath) {
    // Always attach no-index headers regardless of auth outcome
    const robotsHeaders = new Headers();
    robotsHeaders.set("X-Robots-Tag", "noindex, nofollow, noarchive");

    // Allow admin sign-in through (unauthenticated entry point)
    const isSignInPage = pathname.startsWith("/admin/auth/sign-in");
    // Allow admin sign-up only when explicitly enabled via env flag
    const isSignUpPage = pathname.startsWith("/admin/auth/sign-up");
    const signupEnabled = process.env.ADMIN_SIGNUP_ENABLED === "true";

    // Block sign-up unless explicitly enabled
    if (isSignUpPage && !signupEnabled) {
      return new NextResponse(null, { status: 404 });
    }

    // Let sign-in through without further checks
    if (isSignInPage) {
      const response = NextResponse.next({
        request: { headers: new Headers(request.headers) },
      });
      response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
      return response;
    }

    // For every other /admin/* or /api/admin/* path, require a valid admin JWT
    const adminOk = await isAdminRequest(request);
    if (!adminOk) {
      // Return a plain 404 — do NOT redirect to the admin sign-in page, which
      // would reveal that an admin portal exists at this URL.
      return new NextResponse(null, { status: 404 });
    }

    // Authenticated admin — continue to the actual handler with no-index header
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-request-id", requestId);
    const response = NextResponse.next({ request: { headers: requestHeaders } });
    response.headers.set("x-request-id", requestId);
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("Referrer-Policy", "no-referrer");
    return response;
  }

  // 1. Public Identity & URL Architecture Canonical Redirects
  // Public user handles (/@username) and public user profiles are disabled; only stores have public URLs.

  // 1b. Canonical 308 Redirect for /stores/[slug] -> /store/[slug] (exclude exact /stores catalog)
  if (pathname.startsWith("/stores/") && pathname !== "/stores/") {
    const slug = pathname.slice("/stores/".length).replace(/\/+$/, "");
    if (slug) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = `/store/${slug}`;
      return NextResponse.redirect(redirectUrl, 308);
    }
  }

  // 1c. Canonical 308 Redirect for /listings/[id] -> /listing/[id] (exclude /listings/create)
  if (pathname.startsWith("/listings/") && !pathname.startsWith("/listings/create")) {
    const id = pathname.slice("/listings/".length).replace(/\/+$/, "");
    if (id) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = `/listing/${id}`;
      return NextResponse.redirect(redirectUrl, 308);
    }
  }

  // 2. Rate Limiting Enforcement in Proxy for APIs
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
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(self)");

  return response;
}

export { proxy as middleware };
export default proxy;

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
