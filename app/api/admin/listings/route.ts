import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { ListingModel } from "@/models/Listing";
import { requireAdmin } from "@/lib/authServer";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/listings
 * Admin queue endpoint to view listings awaiting moderation or filter by status.
 */
export async function GET(req: NextRequest) {
  try {
    const { admin, errorResponse } = await requireAdmin(req);
    if (!admin || errorResponse) return errorResponse;

    await dbConnect();
    if (ListingModel.db?.readyState !== 1) {
      return NextResponse.json({
        success: true,
        data: [],
        count: 0,
      });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const listingType = searchParams.get("listingType");
    const campus = searchParams.get("campus");
    const search = searchParams.get("search");

    const filter: Record<string, any> = {};

    if (status && status !== "all") {
      filter.status = status;
    }
    if (listingType && listingType !== "all") {
      filter.listingType = listingType;
    }
    if (campus && campus !== "all") {
      filter.campus = { $regex: new RegExp(campus, "i") };
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    const listings = await ListingModel.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: listings,
      count: listings.length,
    });
  } catch (error: any) {
    console.error("[GET /api/admin/listings] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve listings for moderation." },
      { status: 500 }
    );
  }
}
