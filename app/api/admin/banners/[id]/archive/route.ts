import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import BannerModel from "@/models/Banner";
import { requireAdmin } from "@/lib/authServer";
import { logAdminAudit } from "@/lib/adminAudit";
import { getRequestId } from "@/lib/apiResponse";
import { applyCacheHeaders } from "@/lib/cacheHeaders";
import { invalidateBannerCaches } from "@/lib/bannerService";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/banners/[id]/archive
 * Archives banner without destroying audit history.
 */
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { admin, errorResponse } = await requireAdmin(req);
    if (!admin || errorResponse) return errorResponse;

    const { id } = await context.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid banner ID format." },
        { status: 400 }
      );
    }

    await dbConnect();
    const banner = await BannerModel.findById(id);
    if (!banner) {
      return NextResponse.json(
        { success: false, error: "Banner not found." },
        { status: 404 }
      );
    }

    const beforeState = banner.toObject();
    banner.status = "archived";
    banner.updatedBy = admin.id;
    await banner.save();

    const requestId = getRequestId(req);
    await logAdminAudit({
      actorId: admin.id,
      actorEmail: admin.email,
      targetType: "banner",
      targetId: id,
      action: "archive_banner",
      requestId,
      before: beforeState,
      after: banner.toObject(),
    });

    invalidateBannerCaches();

    const res = NextResponse.json({
      success: true,
      data: {
        ...banner.toObject(),
        id: banner._id.toString(),
      },
      message: "Banner archived successfully.",
    });

    return applyCacheHeaders(res, { isPublic: false });
  } catch (error: any) {
    console.error("[AdminBannersAPI] Archive error:", error);
    const res = NextResponse.json(
      { success: false, error: error.message || "Failed to archive banner." },
      { status: 500 }
    );
    return applyCacheHeaders(res, { isPublic: false });
  }
}
