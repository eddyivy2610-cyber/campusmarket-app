import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/follow/followers/[targetId]
 * Follower lists are private and are never returned publicly.
 * Only aggregate follower counts on stores (metrics.followersCount / GET /api/follow/counts/[targetId]) are exposed.
 */
export async function GET() {
  return NextResponse.json(
    {
      success: false,
      error: "Follower lists are private and cannot be enumerated.",
    },
    {
      status: 403,
      headers: {
        "Cache-Control": "private, no-store, must-revalidate",
      },
    }
  );
}
