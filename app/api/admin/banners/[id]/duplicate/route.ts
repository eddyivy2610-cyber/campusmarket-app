import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import BannerModel from "@/models/Banner";
import { requireAdmin } from "@/lib/authServer";
import { logAdminAudit } from "@/lib/adminAudit";
import { getRequestId } from "@/lib/apiResponse";
import { applyCacheHeaders } from "@/lib/cacheHeaders";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/banners/[id]/duplicate
 * Clones an existing banner into a new draft.
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
    const source = await BannerModel.findById(id).lean();
    if (!source) {
      return NextResponse.json(
        { success: false, error: "Source banner not found." },
        { status: 404 }
      );
    }

    const cloned = await BannerModel.create({
      name: `Copy of ${(source as any).name}`,
      headline: (source as any).headline,
      description: (source as any).description,
      imageUrl: (source as any).imageUrl,
      mobileImageUrl: (source as any).mobileImageUrl,
      imageAlt: (source as any).imageAlt,
      ctaLabel: (source as any).ctaLabel,
      ctaUrl: (source as any).ctaUrl,
      placement: (source as any).placement,
      targetCategory: (source as any).targetCategory,
      status: "draft",
      startAt: new Date(),
      endAt: (source as any).endAt,
      priority: (source as any).priority,
      createdBy: admin.id,
      updatedBy: admin.id,
    });

    const requestId = getRequestId(req);
    await logAdminAudit({
      actorId: admin.id,
      actorEmail: admin.email,
      targetType: "banner",
      targetId: cloned._id.toString(),
      action: "duplicate_banner",
      requestId,
      details: {
        sourceBannerId: id,
        newBannerId: cloned._id.toString(),
      },
      after: cloned.toObject(),
    });

    const res = NextResponse.json(
      {
        success: true,
        data: {
          ...cloned.toObject(),
          id: cloned._id.toString(),
        },
        message: "Banner duplicated as draft.",
      },
      { status: 201 }
    );

    return applyCacheHeaders(res, { isPublic: false });
  } catch (error: any) {
    console.error("[AdminBannersAPI] Duplicate error:", error);
    const res = NextResponse.json(
      { success: false, error: error.message || "Failed to duplicate banner." },
      { status: 500 }
    );
    return applyCacheHeaders(res, { isPublic: false });
  }
}
