import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import dbConnect from "@/lib/dbConnect";
import FollowerModel from "@/models/Follower";
import { requireAuth } from "@/lib/authServer";
import { resolveAndValidateTarget, executeToggle } from "@/lib/followHelpers";

export const dynamic = "force-dynamic";

/**
 * POST /api/follow/toggle/[targetId]
 * Toggle follow status for a user or store.
 * STRICT SECURITY & PRODUCT RULES:
 * 1. Follower identity is derived strictly from the authenticated session (never from request body/headers).
 * 2. Self-following is prevented when the target is a user (or own store).
 * 3. Atomic toggle: safe under concurrent requests without throwing duplicate key errors.
 */
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ targetId: string }> }
) {
  try {
    const { user, errorResponse } = await requireAuth(req);
    if (!user || errorResponse) return errorResponse;

    const { targetId } = await context.params;
    if (!targetId || typeof targetId !== "string") {
      return NextResponse.json(
        { success: false, error: "Target ID is required." },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(req.url);
    let targetTypeHint = searchParams.get("targetType") || "user";

    // Also support targetType in JSON body if provided
    try {
      const body = await req.json();
      if (body?.targetType) targetTypeHint = body.targetType;
    } catch {
      // Body is optional for toggle
    }

    await dbConnect();

    // Resolve and validate target entity
    const target = await resolveAndValidateTarget(targetId, targetTypeHint, user.id);
    if (!target.valid || !target.targetId) {
      return NextResponse.json(
        { success: false, error: target.error || "Target entity not found." },
        { status: target.statusCode || 404 }
      );
    }

    const resolvedTargetIdStr = target.targetId.toString();
    const currentUserIdStr = user.id.toString();

    // Rule: Prevent self-following where the target is a user
    if (target.targetType === "user" && resolvedTargetIdStr === currentUserIdStr) {
      return NextResponse.json(
        { success: false, error: "You cannot follow yourself." },
        { status: 400 }
      );
    }

    // Rule: Prevent self-following own store
    if (target.targetType === "store" && target.entity?.ownerId?.toString() === currentUserIdStr) {
      return NextResponse.json(
        { success: false, error: "You cannot follow your own store." },
        { status: 400 }
      );
    }

    // Perform atomic toggle operation
    const toggleResult = await executeToggle(
      user.id,
      target.targetId,
      target.targetType,
      { name: user.name, handle: user.email?.split("@")[0] }
    );

    return NextResponse.json({
      success: true,
      message: toggleResult.isFollowing
        ? `Successfully followed ${target.targetType}.`
        : `Successfully unfollowed ${target.targetType}.`,
      isFollowing: toggleResult.isFollowing,
      targetId: target.targetId.toString(),
      targetType: target.targetType,
    });
  } catch (error: any) {
    console.error("[POST /api/follow/toggle] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to toggle follow status." },
      { status: 500 }
    );
  }
}
