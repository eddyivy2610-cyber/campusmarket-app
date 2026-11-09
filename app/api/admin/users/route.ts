import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import StoreModel from "@/models/Store";
import { requireAdmin } from "@/lib/authServer";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/users
 * Admin endpoint to list and search registered users with their multi-store ownership summary.
 */
export async function GET(req: NextRequest) {
  try {
    const { admin, errorResponse } = await requireAdmin(req);
    if (!admin || errorResponse) return errorResponse;

    await dbConnect();
    if (UserModel.db?.readyState !== 1) {
      return NextResponse.json({
        success: true,
        data: [],
        count: 0,
      });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const role = searchParams.get("role");
    const search = searchParams.get("search");
    const studentVerified = searchParams.get("studentVerified");

    const filter: Record<string, any> = {};

    if (status && status !== "all") {
      filter.accountStatus = status;
    }
    if (role && role !== "all") {
      filter.role = role;
    }
    if (studentVerified === "true") {
      filter.studentVerified = true;
    } else if (studentVerified === "false") {
      filter.studentVerified = { $ne: true };
    }
    if (search && search.trim()) {
      const q = search.trim();
      filter.$or = [
        { fullName: { $regex: q, $options: "i" } },
        { name: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
        { "profile.displayName": { $regex: q, $options: "i" } },
        { campus: { $regex: q, $options: "i" } },
      ];
    }

    const users = await UserModel.find(filter)
      .select("-passwordHash -password")
      .sort({ createdAt: -1 })
      .lean();

    const userIds = users.map((u: any) => u._id);
    const stores =
      userIds.length > 0
        ? await StoreModel.find({
            ownerId: { $in: userIds },
            status: { $ne: "deleted" },
          })
            .select(
              "_id ownerId storeName name slug storeType status isVerified campus metrics createdAt"
            )
            .lean()
        : [];

    const storesByOwner = new Map<string, any[]>();
    for (const s of stores as any[]) {
      const key = String(s.ownerId);
      const list = storesByOwner.get(key) || [];
      list.push({
        _id: String(s._id),
        storeName: s.storeName || s.name || "Unnamed Store",
        slug: s.slug,
        storeType: s.storeType,
        status: s.status,
        isVerified: Boolean(s.isVerified),
        campus: s.campus,
        metrics: s.metrics || { rating: 0, reviewsCount: 0, listingsCount: 0, followerCount: 0 },
      });
      storesByOwner.set(key, list);
    }

    const enrichedUsers = users.map((u: any) => {
      const ownedStores = storesByOwner.get(String(u._id)) || [];
      const totalListings = ownedStores.reduce(
        (acc, st) => acc + (Number(st.metrics?.listingsCount) || 0),
        0
      );
      return {
        ...u,
        storesCount: typeof u.storesCount === "number" ? u.storesCount : ownedStores.length,
        ownedStores,
        activeListingsCount: totalListings,
      };
    });

    return NextResponse.json({
      success: true,
      data: enrichedUsers,
      count: enrichedUsers.length,
    });
  } catch (error: any) {
    console.error("[GET /api/admin/users] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve users." },
      { status: 500 }
    );
  }
}
