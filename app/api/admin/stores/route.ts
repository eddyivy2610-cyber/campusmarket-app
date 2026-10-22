import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import StoreModel from "@/models/Store";
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

    const filter: Record<string, any> = {};

    if (status && status !== "all") {
      filter.status = status;
    }
    if (storeType && storeType !== "all") {
      filter.storeType = storeType;
    }
    if (campus && campus !== "all") {
      filter.campus = { $regex: new RegExp(campus, "i") };
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { ownerId: { $regex: search, $options: "i" } },
      ];
    }

    const stores = await StoreModel.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: stores,
      count: stores.length,
    });
  } catch (error: any) {
    console.error("[GET /api/admin/stores] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve stores." },
      { status: 500 }
    );
  }
}
