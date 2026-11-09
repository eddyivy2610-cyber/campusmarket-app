import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import dbConnect from "@/lib/dbConnect";
import FollowerModel from "@/models/Follower";
import StoreModel, { toPublicStoreDTO } from "@/models/Store";
import { requireAuth } from "@/lib/authServer";

export const dynamic = "force-dynamic";

/**
 * GET /api/follow/following/[targetId]
 * Private endpoint: lists active stores followed by the authenticated user.
 * Public enumeration of another user's following list or followed user accounts is prohibited.
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ targetId: string }> }
) {
  try {
    const { user, errorResponse } = await requireAuth(req);
    if (!user || errorResponse) return errorResponse;

    const { targetId } = await context.params;
    const cleanTargetId = (targetId || "").trim();

    if (!cleanTargetId || (cleanTargetId !== "me" && String(cleanTargetId) !== String(user.id))) {
      return NextResponse.json(
        {
          success: false,
          error: "Forbidden: You can only view your own followed stores.",
        },
        {
          status: 403,
          headers: { "Cache-Control": "private, no-store, must-revalidate" },
        }
      );
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10) || 20));
    const skip = (page - 1) * limit;

    await dbConnect();

    const query: Record<string, any> = {
      followerId: new Types.ObjectId(user.id),
      targetType: "store",
    };

    const total = await FollowerModel.countDocuments(query);
    const records = await FollowerModel.find(query)
      .sort({ createdAt: -1, _id: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const storeIds = records.map((r) => r.followingId);
    const stores =
      storeIds.length > 0
        ? await StoreModel.find({ _id: { $in: storeIds }, status: "active" }).lean()
        : [];

    const storeMap = new Map(
      stores.map((s: any) => [s._id.toString(), toPublicStoreDTO(s)])
    );

    const following = records
      .filter((r: any) => storeMap.has(r.followingId.toString()))
      .map((r: any) => ({
        followId: r._id.toString(),
        targetType: "store",
        targetId: r.followingId.toString(),
        target: storeMap.get(r.followingId.toString()),
        followedAt: r.createdAt,
      }));

    return NextResponse.json(
      {
        success: true,
        userId: user.id,
        total,
        page,
        pages: Math.ceil(total / limit),
        count: following.length,
        following,
        data: following,
      },
      {
        headers: {
          "Cache-Control": "private, no-store, must-revalidate",
        },
      }
    );
  } catch (error: any) {
    console.error("[GET /api/follow/following] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to list following." },
      { status: 500 }
    );
  }
}
