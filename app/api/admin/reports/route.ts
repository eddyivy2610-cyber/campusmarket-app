import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import ReportModel from "@/models/Report";
import UserModel from "@/models/User";
import StoreModel from "@/models/Store";
import { ListingModel } from "@/models/Listing";
import { requireAdmin } from "@/lib/authServer";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/reports
 * Lists and filters platform reports for admin investigation.
 */
export async function GET(req: NextRequest) {
  try {
    const { admin, errorResponse } = await requireAdmin(req);
    if (!admin || errorResponse) return errorResponse;

    await dbConnect();
    if (ReportModel.db?.readyState !== 1) {
      return NextResponse.json({ success: true, data: [], count: 0 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const targetType = searchParams.get("targetType");
    const reason = searchParams.get("reason");
    const search = searchParams.get("search");

    const filter: Record<string, any> = {};
    if (status && status !== "all") {
      filter.status = status.toLowerCase().replace(/\s+/g, "_");
    }
    if (targetType && targetType !== "all") {
      filter.targetType = targetType.toLowerCase();
    }
    if (reason && reason !== "all") {
      filter.reason = reason.toLowerCase();
    }
    if (search && search.trim()) {
      const q = search.trim();
      filter.$or = [
        { publicId: { $regex: q, $options: "i" } },
        { details: { $regex: q, $options: "i" } },
        { targetId: { $regex: q, $options: "i" } },
        { reason: { $regex: q, $options: "i" } },
      ];
    }

    const reports = await ReportModel.find(filter)
      .sort({ createdAt: -1 })
      .limit(250)
      .lean();

    // Hydrate reporter and target summaries in batch
    const reporterIds = Array.from(
      new Set(
        reports
          .map((r: any) => String(r.reporterId || ""))
          .filter((id) => mongoose.Types.ObjectId.isValid(id))
      )
    );

    const listingIds = Array.from(
      new Set(
        reports
          .filter((r: any) => r.targetType === "listing" && mongoose.Types.ObjectId.isValid(String(r.targetId)))
          .map((r: any) => String(r.targetId))
      )
    );

    const storeIds = Array.from(
      new Set(
        reports
          .filter((r: any) => r.targetType === "store" && mongoose.Types.ObjectId.isValid(String(r.targetId)))
          .map((r: any) => String(r.targetId))
      )
    );

    const targetUserIds = Array.from(
      new Set(
        reports
          .filter((r: any) => r.targetType === "user" && mongoose.Types.ObjectId.isValid(String(r.targetId)))
          .map((r: any) => String(r.targetId))
      )
    );

    const allUserIds = Array.from(new Set([...reporterIds, ...targetUserIds]));

    const [users, listings, stores] = await Promise.all([
      allUserIds.length > 0
        ? UserModel.find({ _id: { $in: allUserIds } })
            .select("_id email fullName name profile accountStatus campus")
            .lean()
        : [],
      listingIds.length > 0
        ? ListingModel.find({ _id: { $in: listingIds } })
            .select("_id title slug status sellerId storeId price")
            .lean()
        : [],
      storeIds.length > 0
        ? StoreModel.find({ _id: { $in: storeIds } })
            .select("_id storeName name slug status ownerId campus")
            .lean()
        : [],
    ]);

    const userMap = new Map(users.map((u: any) => [String(u._id), u]));
    const listingMap = new Map(listings.map((l: any) => [String(l._id), l]));
    const storeMap = new Map(stores.map((s: any) => [String(s._id), s]));

    const priorityFromReason = (r: string) => {
      if (r === "scam" || r === "counterfeit" || r === "harassment" || r === "prohibited_item") {
        return "High";
      }
      if (r === "misleading") return "Medium";
      return "Low";
    };

    const statusLabel = (s: string) => {
      switch (s) {
        case "pending":
          return "Pending";
        case "in_review":
          return "In Review";
        case "resolved":
          return "Resolved";
        case "dismissed":
          return "Dismissed";
        default:
          return "Pending";
      }
    };

    const enriched = reports.map((r: any) => {
      const reporter: any = userMap.get(String(r.reporterId));
      const reporterName =
        reporter?.profile?.displayName ||
        reporter?.fullName ||
        reporter?.name ||
        reporter?.email ||
        "Campus User";

      let againstName = `${r.targetType.toUpperCase()} #${String(r.targetId).slice(-6)}`;
      let againstRole = r.targetType;
      let targetEntity: any = null;

      if (r.targetType === "listing") {
        const l: any = listingMap.get(String(r.targetId));
        if (l) {
          againstName = l.title || againstName;
          targetEntity = l;
        }
      } else if (r.targetType === "store") {
        const s: any = storeMap.get(String(r.targetId));
        if (s) {
          againstName = s.storeName || s.name || againstName;
          targetEntity = s;
        }
      } else if (r.targetType === "user") {
        const u: any = userMap.get(String(r.targetId));
        if (u) {
          againstName = u.profile?.displayName || u.fullName || u.name || u.email || againstName;
          targetEntity = u;
        }
      }

      return {
        _id: String(r._id),
        id: r.publicId || String(r._id),
        publicId: r.publicId,
        targetType: r.targetType,
        targetId: String(r.targetId),
        targetSlug: r.targetSlug || targetEntity?.slug || null,
        reason: r.reason,
        category: String(r.reason || "other").replace(/_/g, " "),
        details: r.details || "",
        description: r.details || `Reported for ${String(r.reason || "other").replace(/_/g, " ")}`,
        status: statusLabel(r.status),
        rawStatus: r.status,
        priority: priorityFromReason(r.reason),
        resolutionNotes: r.resolutionNotes || "",
        reporter: {
          id: String(r.reporterId),
          name: reporterName,
          email: reporter?.email || "",
          avatar: reporter?.profile?.avatar || reporterName.charAt(0).toUpperCase(),
        },
        against: {
          id: String(r.targetId),
          name: againstName,
          type: againstRole,
          avatar: againstName.charAt(0).toUpperCase(),
          status: targetEntity?.status || targetEntity?.accountStatus || "active",
        },
        auditLog: r.auditLog || [],
        createdAt: r.createdAt,
        submittedAt: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "Recent",
      };
    });

    return NextResponse.json({
      success: true,
      data: enriched,
      count: enriched.length,
    });
  } catch (error: any) {
    console.error("[GET /api/admin/reports] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve reports." },
      { status: 500 }
    );
  }
}
