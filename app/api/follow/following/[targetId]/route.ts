import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import dbConnect from "@/lib/dbConnect";
import FollowerModel from "@/models/Follower";
import UserModel from "@/models/User";
import StoreModel from "@/models/Store";
import { resolveAndValidateTarget } from "@/lib/followHelpers";

export const dynamic = "force-dynamic";

/**
 * GET /api/follow/following/[targetId]
 * Lists users or stores followed by a specific user.
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ targetId: string }> }
) {
  try {
    const { targetId } = await context.params;
    if (!targetId) {
      return NextResponse.json({ success: false, error: "User ID is required." }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const targetTypeFilter = searchParams.get("targetType"); // "user", "store", or all
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10) || 20));
    const skip = (page - 1) * limit;

    await dbConnect();

    // Verify user exists
    const userTarget = await resolveAndValidateTarget(targetId, "user");
    if (!userTarget.valid || !userTarget.targetId) {
      return NextResponse.json(
        { success: false, error: "User not found." },
        { status: 404 }
      );
    }

    const query: Record<string, any> = {
      followerId: userTarget.targetId,
    };
    if (targetTypeFilter === "user" || targetTypeFilter === "store") {
      query.targetType = targetTypeFilter;
    }

    const total = await FollowerModel.countDocuments(query);
    const records = await FollowerModel.find(query)
      .sort({ createdAt: -1, _id: -1 }) // Deterministic tie-breaker
      .skip(skip)
      .limit(limit)
      .lean();

    // Separate user vs store followingIds to populate efficiently
    const userIds = records.filter((r) => r.targetType === "user").map((r) => r.followingId);
    const storeIds = records.filter((r) => r.targetType === "store").map((r) => r.followingId);

    const [users, stores] = await Promise.all([
      userIds.length > 0
        ? UserModel.find({ _id: { $in: userIds }, accountStatus: { $ne: "suspended" } })
            .select("name profile.displayName profile.avatar profile.handle")
            .lean()
        : [],
      storeIds.length > 0
        ? StoreModel.find({ _id: { $in: storeIds }, status: { $ne: "suspended" } })
            .select("name slug logo campus")
            .lean()
        : [],
    ]);

    const userMap = new Map(
      users.map((u: any) => [
        u._id.toString(),
        {
          _id: u._id.toString(),
          name: u.name,
          profile: {
            displayName: u.profile?.displayName,
            avatar: u.profile?.avatar,
            handle: u.profile?.handle,
          },
        },
      ])
    );
    const storeMap = new Map(
      stores.map((s: any) => [
        s._id.toString(),
        {
          _id: s._id.toString(),
          name: s.name,
          slug: s.slug,
          logo: s.logo,
          campus: s.campus,
        },
      ])
    );

    const following = records
      .filter((r: any) =>
        r.targetType === "user" ? userMap.has(r.followingId.toString()) : storeMap.has(r.followingId.toString())
      )
      .map((r: any) => ({
        followId: r._id.toString(),
        targetType: r.targetType,
        targetId: r.followingId.toString(),
        target: r.targetType === "user" ? userMap.get(r.followingId.toString()) : storeMap.get(r.followingId.toString()),
        followedAt: r.createdAt,
      }));

    return NextResponse.json({
      success: true,
      userId: userTarget.targetId.toString(),
      total,
      page,
      pages: Math.ceil(total / limit),
      count: following.length,
      following,
      data: following,
    });
  } catch (error: any) {
    console.error("[GET /api/follow/following] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to list following." },
      { status: 500 }
    );
  }
}
