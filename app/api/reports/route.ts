import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import dbConnect from "@/lib/dbConnect";
import ReportModel, { ReportReason, ReportTargetType } from "@/models/Report";
import { requireAuth } from "@/lib/authServer";
import { applyRateLimit, RATE_LIMIT_PRESETS } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

const ALLOWED_TARGET_TYPES: ReportTargetType[] = [
  "listing",
  "store",
  "user",
  "radar",
  "review",
];

const ALLOWED_REASONS: ReportReason[] = [
  "misleading",
  "counterfeit",
  "harassment",
  "prohibited_item",
  "scam",
  "spam",
  "other",
];

/**
 * POST /api/reports
 * Authenticated endpoint for users to submit a report against a listing, store, user, review, or radar post.
 */
export async function POST(req: NextRequest) {
  try {
    const { user, errorResponse } = await requireAuth(req);
    if (!user || errorResponse) return errorResponse;

    await dbConnect();

    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON request body." },
        { status: 400 }
      );
    }

    const rawType = String(body.targetType || body.reportType || "listing").toLowerCase();
    const targetType: ReportTargetType =
      rawType === "profile"
        ? "store"
        : ALLOWED_TARGET_TYPES.includes(rawType as ReportTargetType)
        ? (rawType as ReportTargetType)
        : "listing";

    const targetId = String(body.targetId || "").trim();
    if (!targetId) {
      return NextResponse.json(
        { success: false, error: "targetId is required." },
        { status: 400 }
      );
    }

    const rawReason = String(body.reason || "other").toLowerCase();
    const reason: ReportReason = ALLOWED_REASONS.includes(rawReason as ReportReason)
      ? (rawReason as ReportReason)
      : "other";

    const details = String(body.details || body.reason || "").trim().slice(0, 1000);
    if (!details && reason === "other") {
      return NextResponse.json(
        { success: false, error: "Please provide details for the report." },
        { status: 400 }
      );
    }

    const rateCheck = applyRateLimit(
      req,
      "report:create",
      { maxRequests: 10, windowMs: 60 * 60 * 1000 },
      user.id
    );
    if (!rateCheck.allowed) {
      return rateCheck.response!;
    }

    const report = await ReportModel.create({
      publicId: crypto.randomUUID(),
      reporterId: user.id,
      targetType,
      targetId,
      targetSlug: body.targetSlug ? String(body.targetSlug).trim() : undefined,
      reason,
      details,
      status: "pending",
      auditLog: [
        {
          action: "created",
          adminId: user.id,
          note: "Report submitted by user.",
          timestamp: new Date(),
        },
      ],
    });

    return NextResponse.json(
      {
        success: true,
        message: "Report submitted successfully. Our moderation team will review it shortly.",
        data: {
          id: report._id.toString(),
          publicId: report.publicId,
          status: report.status,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[POST /api/reports] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit report." },
      { status: 500 }
    );
  }
}
