import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import SearchQueryModel from "@/models/SearchQuery";

export const dynamic = "force-dynamic";

/**
 * GET /api/search/popular
 * Returns trending search terms that have been queried at least 10 times.
 * If no queries have reached 10, returns empty array so UI stays completely hidden.
 */
export async function GET() {
  try {
    await dbConnect();

    const MIN_SEARCH_COUNT = 10;
    const popularDocs = await SearchQueryModel.find({ count: { $gte: MIN_SEARCH_COUNT } })
      .sort({ count: -1, lastSearchedAt: -1 })
      .limit(8)
      .lean();

    const terms = popularDocs.map((doc) => doc.originalTerm || doc.term);

    return NextResponse.json({
      success: true,
      data: terms,
    });
  } catch (error) {
    console.error("[GET /api/search/popular] Error:", error);
    return NextResponse.json({ success: true, data: [] });
  }
}

/**
 * POST /api/search/popular
 * Logs and tracks an organic user search query.
 */
export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
    }

    const rawTerm = typeof body?.term === "string" ? body.term.trim() : "";
    if (!rawTerm || rawTerm.length < 2 || rawTerm.length > 60) {
      return NextResponse.json({ success: false, error: "Term must be 2-60 characters." }, { status: 400 });
    }

    // Filter out common non-search punctuation or single characters
    const normalized = rawTerm.toLowerCase();

    const updated = await SearchQueryModel.findOneAndUpdate(
      { term: normalized },
      {
        $inc: { count: 1 },
        $setOnInsert: { originalTerm: rawTerm },
        $set: { lastSearchedAt: new Date() },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json({
      success: true,
      data: {
        term: updated.originalTerm,
        count: updated.count,
        isPopular: updated.count >= 10,
      },
    });
  } catch (error) {
    console.error("[POST /api/search/popular] Error tracking search:", error);
    return NextResponse.json({ success: false, error: "Tracking failed" }, { status: 500 });
  }
}
