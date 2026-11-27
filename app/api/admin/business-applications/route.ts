import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import BusinessApplicationModel from "@/models/BusinessApplication";
import UserModel from "@/models/User";
import { requireAdmin } from "@/lib/authServer";
import { computeCampusDistanceKm } from "@/lib/marketplaceValidation";

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

    const applicantObjectIds = Array.from(
      new Set(
        applications
          .map((a: any) => String(a.applicantId || ""))
          .filter((id) => mongoose.Types.ObjectId.isValid(id))
      )
    );
    const users = applicantObjectIds.length
      ? await UserModel.find({ _id: { $in: applicantObjectIds } })
          .select("+safetyLocation")
          .lean()
      : [];
    const safetyMap = new Map<string, any>();
    for (const u of users as any[]) {
      if (u?.safetyLocation) {
        safetyMap.set(String(u._id), u.safetyLocation);
      }
    }

    const enriched = applications.map((app: any) => {
      const safetyLocation = safetyMap.get(String(app.applicantId)) || null;
      const distanceToCampusKm = computeCampusDistanceKm(app.campus, safetyLocation);
      return {
        ...app,
        safetyLocation,
        distanceToCampusKm,
      };
    });

    return NextResponse.json({
      success: true,
      data: enriched,
      count: enriched.length,
    });
  } catch (error: any) {
    console.error("[GET /api/admin/business-applications] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve business applications." },
      { status: 500 }
    );
  }
}
