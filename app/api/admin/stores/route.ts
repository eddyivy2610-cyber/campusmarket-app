import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import StoreModel from "@/models/Store";
import UserModel from "@/models/User";
import { requireAdmin } from "@/lib/authServer";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/stores
 * Admin endpoint to list, search, and monitor all student storefronts and local businesses.
 */
export async function GET(req: NextRequest) {
  try {
    const { admin, errorResponse } = await requireAdmin(req);
    if (!admin || errorResponse) return errorResponse;

    await dbConnect();
    if (StoreModel.db?.readyState !== 1) {
      return NextResponse.json({
        success: true,
        data: [],
        count: 0,
      });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const storeType = searchParams.get("storeType");
    const campus = searchParams.get("campus");
    const search = searchParams.get("search");
    const ownerId = searchParams.get("ownerId");

    const filter: Record<string, any> = {};

    if (status && status !== "all") {
      filter.status = status;
    } else {
      filter.status = { $ne: "deleted" };
    }
    if (storeType && storeType !== "all") {
      filter.storeType = storeType;
    }
    if (campus && campus !== "all") {
      filter.campus = { $regex: new RegExp(campus, "i") };
    }
    if (ownerId && mongoose.Types.ObjectId.isValid(ownerId)) {
      filter.ownerId = ownerId;
    }
    if (search && search.trim()) {
      const q = search.trim();
      const orConditions: any[] = [
        { storeName: { $regex: q, $options: "i" } },
        { name: { $regex: q, $options: "i" } },
        { slug: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ];
      if (mongoose.Types.ObjectId.isValid(q)) {
        orConditions.push({ ownerId: q });
      }
      filter.$or = orConditions;
    }

    const stores = await StoreModel.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    const ownerIds = Array.from(
      new Set(
        stores
          .map((s: any) => String(s.ownerId || ""))
          .filter((id) => mongoose.Types.ObjectId.isValid(id))
      )
    );

    const owners =
      ownerIds.length > 0
        ? await UserModel.find({ _id: { $in: ownerIds } })
            .select("_id email fullName name profile accountStatus studentVerified storesCount")
            .lean()
        : [];
    const ownerMap = new Map(owners.map((u: any) => [String(u._id), u]));

    const enrichedStores = stores.map((s: any) => {
      const owner: any = ownerMap.get(String(s.ownerId));
      return {
        ...s,
        name: s.storeName || s.name || "Unnamed Store",
        storeName: s.storeName || s.name || "Unnamed Store",
        logo: s.logoUrl || s.logo || "",
        logoUrl: s.logoUrl || s.logo || "",
        owner: owner
          ? {
              _id: String(owner._id),
              email: owner.email,
              fullName: owner.fullName || owner.profile?.displayName || owner.name || owner.email,
              accountStatus: owner.accountStatus,
              studentVerified: Boolean(owner.studentVerified),
              storesCount: owner.storesCount ?? 1,
            }
          : null,
      };
    });

    return NextResponse.json({
      success: true,
      data: enrichedStores,
      count: enrichedStores.length,
    });
  } catch (error: any) {
    console.error("[GET /api/admin/stores] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve stores." },
      { status: 500 }
    );
  }
}
