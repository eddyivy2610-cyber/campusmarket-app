import { NextRequest, NextResponse } from "next/server";

const STATE_CHANGING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function configuredOrigins(): string[] {
  return [
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.APP_ALLOWED_ORIGINS,
  ]
    .flatMap((value) => String(value || "").split(","))
    .map((value) => value.trim().replace(/\/$/, ""))
    .filter(Boolean);
}

export function validateSameOrigin(request: NextRequest): NextResponse | null {
  if (!STATE_CHANGING_METHODS.has(request.method)) return null;
  const origin = request.headers.get("origin");
  if (!origin) {
    // Non-browser callers may omit Origin. Cookie-authenticated browser writes
    // must prove same-site context through Fetch Metadata instead.
    if (request.cookies.get("campus_token") || request.cookies.get("refreshToken") || request.cookies.get("campus_refresh_token")) {
      const fetchSite = request.headers.get("sec-fetch-site");
      if (fetchSite !== "same-origin") {
        return NextResponse.json({ success: false, error: "Origin is required for cookie-authenticated requests." }, { status: 403 });
      }
    }
    return null;
  }
  if (origin === "null") {
    return NextResponse.json({ success: false, error: "Invalid request origin." }, { status: 403 });
  }

  const requestOrigin = new URL(request.url).origin;
  const allowed = new Set([requestOrigin, ...configuredOrigins()]);
  if (!allowed.has(origin.replace(/\/$/, ""))) {
    return NextResponse.json({ success: false, error: "Invalid request origin." }, { status: 403 });
  }
  return null;
}
