import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import { requireAdmin } from "@/lib/authServer";
import { ensureAdminAuditIndexes } from "@/lib/adminAudit";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/logs
 * Read-only query endpoint for the append-only `admin_audit_logs` collection.
 */
export async function GET(req: NextRequest) {
  try {
    const { admin, errorResponse } = await requireAdmin(req);
    if (!admin || errorResponse) return errorResponse;

    await dbConnect();
    const conn = mongoose.connection;
    if (conn.readyState !== 1 || !conn.db) {
      return NextResponse.json({
        success: true,
        data: [],
        count: 0,
      });
    }

    await ensureAdminAuditIndexes();
    const auditCollection = conn.db.collection("admin_audit_logs");

    const { searchParams } = new URL(req.url);
    const targetType = searchParams.get("targetType") || searchParams.get("type");
    const action = searchParams.get("action");
    const actor = searchParams.get("actor");
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const limitParam = parseInt(searchParams.get("limit") || "100", 10);
    const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 500) : 100;

    const filter: Record<string, any> = {};

    if (targetType && targetType !== "all") {
      if (targetType === "admin_action") {
        // Matches all admin audit entries
      } else {
        filter.targetType = targetType;
      }
    }

    if (action && action !== "all") {
      filter.action = { $regex: action, $options: "i" };
    }

    if (actor && actor.trim()) {
      const q = actor.trim();
      filter.$or = [
        { actorEmail: { $regex: q, $options: "i" } },
        { actorId: { $regex: q, $options: "i" } },
        { targetId: { $regex: q, $options: "i" } },
        { reason: { $regex: q, $options: "i" } },
      ];
    }

    if (from || to) {
      filter.createdAt = {};
      if (from) {
        filter.createdAt.$gte = new Date(from).toISOString();
      }
      if (to) {
        const endDate = new Date(to);
        endDate.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = endDate.toISOString();
      }
    }

    const rawLogs = await auditCollection
      .find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .limit(limit)
      .toArray();

    const formatted = rawLogs.map((doc: any) => ({
      _id: doc._id.toString(),
      id: doc._id.toString(),
      actorId: doc.actorId,
      actorEmail: doc.actorEmail || "Admin",
      user: doc.actorEmail || doc.actorId || "Admin",
      targetType: doc.targetType || "system",
      type: doc.targetType
        ? `${String(doc.targetType).replace(/_/g, " ").toUpperCase()}`
        : "ADMIN ACTION",
      targetId: doc.targetId,
      action: doc.action,
      reason: doc.reason || "",
      message: `${doc.action || "admin_action"} on ${doc.targetType || "entity"} (${String(doc.targetId || "").slice(-8)})${doc.reason ? ` — ${doc.reason}` : ""}`,
      details: doc.details || {},
      before: doc.before || {},
      after: doc.after || {},
      requestId: doc.requestId || null,
      createdAt: doc.createdAt,
    }));

    return NextResponse.json({
      success: true,
      data: formatted,
      count: formatted.length,
    });
  } catch (error: any) {
    console.error("[GET /api/admin/logs] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve administrative audit logs." },
      { status: 500 }
    );
  }
}
