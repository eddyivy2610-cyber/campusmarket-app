import { NextResponse } from "next/server";

/**
 * GET /api/users/check-username
 * Public user handles are disabled; user profiles are private.
 */
export async function GET() {
  return NextResponse.json(
    {
      available: false,
      error: "Public user handles are disabled. Only storefronts have public slugs.",
    },
    {
      status: 404,
      headers: { "Cache-Control": "private, no-store, must-revalidate" },
    }
  );
}
