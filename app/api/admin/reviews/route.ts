import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import ReviewModel from "@/models/Review";
import StoreModel from "@/models/Store";
import UserModel from "@/models/User";
import { requireAdmin } from "@/lib/authServer";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/reviews
 * Lists and filters customer reviews across all stores for admin moderation.
 */
export async function GET(req: NextRequest) {
  try {
    const { admin, errorResponse } = await requireAdmin(req);
    if (!admin || errorResponse) return errorResponse;

    await dbConnect();
    if (ReviewModel.db?.readyState !== 1) {
      return NextResponse.json({ success: true, data: [], count: 0 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const storeId = searchParams.get("storeId");
    const rating = searchParams.get("rating");
    const search = searchParams.get("search");

    const filter: Record<string, any> = {};
    if (status && status !== "all") {
      filter.status = status;
    }
    if (storeId && mongoose.Types.ObjectId.isValid(storeId)) {
      filter.storeId = storeId;
    }
    if (rating && rating !== "all") {
      const rNum = Number(rating);
      if (Number.isFinite(rNum)) filter.rating = rNum;
    }
    if (search && search.trim()) {
      filter.comment = { $regex: search.trim(), $options: "i" };
    }

    const reviews = await ReviewModel.find(filter)
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    const storeIds = Array.from(
      new Set(
        reviews
          .map((r: any) => String(r.storeId || ""))
          .filter((id) => mongoose.Types.ObjectId.isValid(id))
      )
    );
    const reviewerIds = Array.from(
      new Set(
        reviews
          .map((r: any) => String(r.reviewerId || ""))
          .filter((id) => mongoose.Types.ObjectId.isValid(id))
      )
    );

    const [stores, reviewers] = await Promise.all([
      storeIds.length > 0
        ? StoreModel.find({ _id: { $in: storeIds } })
            .select("_id storeName name slug")
            .lean()
        : [],
      reviewerIds.length > 0
        ? UserModel.find({ _id: { $in: reviewerIds } })
            .select("_id email fullName name profile studentVerified")
            .lean()
        : [],
    ]);

    const storeMap = new Map(stores.map((s: any) => [String(s._id), s]));
    const reviewerMap = new Map(reviewers.map((u: any) => [String(u._id), u]));

    const enriched = reviews.map((r: any) => {
      const store: any = storeMap.get(String(r.storeId));
      const reviewer: any = reviewerMap.get(String(r.reviewerId));
      return {
        _id: String(r._id),
        id: String(r._id),
        rating: r.rating,
        comment: r.comment,
        status: r.status,
        storeId: r.storeId ? String(r.storeId) : null,
        storeName: store?.storeName || store?.name || "Store",
        storeSlug: store?.slug || null,
        reviewer: reviewer
          ? {
              _id: String(reviewer._id),
              name:
                reviewer.fullName ||
                reviewer.profile?.displayName ||
                reviewer.name ||
                reviewer.email,
              email: reviewer.email,
              studentVerified: Boolean(reviewer.studentVerified),
            }
          : { _id: String(r.reviewerId), name: "Buyer", email: "" },
        createdAt: r.createdAt,
      };
    });

    return NextResponse.json({
      success: true,
      data: enriched,
      count: enriched.length,
    });
  } catch (error: any) {
    console.error("[GET /api/admin/reviews] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve reviews." },
      { status: 500 }
    );
  }
}
