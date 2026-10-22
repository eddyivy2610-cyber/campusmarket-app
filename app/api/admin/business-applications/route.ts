import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import BusinessApplicationModel from "@/models/BusinessApplication";
import { requireAdmin } from "@/lib/authServer";

/**
 * GET /api/admin/business-applications
 * Admin queue endpoint to view all submitted business applications.
 */
export async function GET(req: NextRequest) {
  try {
    const { admin, errorResponse } = await requireAdmin(req);
    if (!admin || errorResponse) return errorResponse;

    await dbConnect();
    if (BusinessApplicationModel.db?.readyState !== 1) {
      return NextResponse.json({
        success: true,
        data: [],
        count: 0,
      });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const campus = searchParams.get("campus");

    const filter: Record<string, any> = {};
    if (status && status !== "all") {
      filter.status = status;
    }
    if (campus && campus !== "all") {
      filter.campus = { $regex: new RegExp(campus, "i") };
    }

    const applications = await BusinessApplicationModel.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: applications,
      count: applications.length,
    });
  } catch (error: any) {
    console.error("[GET /api/admin/business-applications] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve business applications." },
      { status: 500 }
    );
  }
}
