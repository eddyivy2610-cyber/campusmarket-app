import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/authServer";
import { PATCH as updateProfile } from "../../profile/route";

export const dynamic = "force-dynamic";

/**
 * PATCH /api/users/update/[id]
 * Backward-compatible endpoint matching legacy client calls.
 * STRICT SECURITY:
 * - Checks that the requested ID matches the authenticated session user ID.
 * - Rejects attempts to modify another user's profile with 403 Forbidden.
 */
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { user, errorResponse } = await requireAuth(req);
  if (!user || errorResponse) return errorResponse;

  const { id } = await context.params;
  if (id !== user.id) {
    return NextResponse.json(
      {
        success: false,
        error: "Forbidden: You cannot modify another user's account.",
      },
      { status: 403 }
    );
  }

  return updateProfile(req);
}
