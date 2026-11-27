import { NextRequest, NextResponse } from "next/server";

const BACKEND_BASE =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
  "http://localhost:3000";

function getToken(request: NextRequest): string | undefined {
  return (
    request.cookies.get("hive_admin_token")?.value ??
    request.cookies.get("campus_token")?.value ??
    request.headers.get("authorization")?.replace("Bearer ", "") ??
    undefined
  );
}

/**
 * GET /api/admin/settings
 * Public for the signup-gate check (backend returns only public-safe keys without auth).
 * Full list returned when a valid admin token is forwarded.
 */
export async function GET(request: NextRequest) {
  const token = getToken(request);
  const res = await fetch(`${BACKEND_BASE}/api/admin/settings`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: "no-store",
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

/**
 * PATCH /api/admin/settings
 * Body: { key: string; value: "true" | "false" }
 */
export async function PATCH(request: NextRequest) {
  const token = getToken(request);
  if (!token) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const res = await fetch(`${BACKEND_BASE}/api/admin/settings`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
