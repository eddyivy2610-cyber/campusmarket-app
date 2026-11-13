import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import ListingModel from "@/models/Listing";
import { getServerAuthUser } from "@/lib/authServer";
import {
  isDatabaseUnavailable,
  databaseUnavailableResponse,
} from "@/lib/databaseErrors";

export const dynamic = "force-dynamic";

const VIEW_DEDUP_WINDOW_SECONDS = 24 * 60 * 60; // 24 hours
const devMemoryViewCache = new Map<string, number>();

async function acquireViewDedupLock(key: string): Promise<boolean> {
  const url = process.env.UPSTASH_REDIS_REST_URL?.replace(/\/$/, "");
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token) {
    try {
      const response = await fetch(`${url}/pipeline`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([
          ["SET", key, "1", "EX", String(VIEW_DEDUP_WINDOW_SECONDS), "NX"],
        ]),
        cache: "no-store",
      });
      if (response.ok) {
        const data = (await response.json()) as Array<{ result?: string | null }>;
        return data?.[0]?.result === "OK";
      }
    } catch (err) {
      console.warn("[ListingView] Upstash dedup failed; skipping increment:", err);
      return false;
    }
  }

  // Dev / local fallback when Upstash env vars are not set
  const now = Date.now();
  const expiresAt = devMemoryViewCache.get(key);
  if (expiresAt && expiresAt > now) {
    return false;
  }
  devMemoryViewCache.set(key, now + VIEW_DEDUP_WINDOW_SECONDS * 1000);
  if (devMemoryViewCache.size > 5000) {
    const firstKey = devMemoryViewCache.keys().next().value;
    if (firstKey) devMemoryViewCache.delete(firstKey);
  }
  return true;
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const cleanId = decodeURIComponent(id || "").trim();
    if (!cleanId) {
      return NextResponse.json(
        { success: false, error: "Invalid listing ID." },
        { status: 400 }
      );
    }

    await dbConnect();

    const listing: any = mongoose.isValidObjectId(cleanId)
      ? await ListingModel.findById(cleanId).select("_id sellerId views status").lean()
      : await ListingModel.findOne({ publicId: cleanId })
          .select("_id sellerId views status")
          .lean();

    if (!listing || listing.status === "deleted") {
      return NextResponse.json(
        { success: false, error: "Listing not found." },
        { status: 404 }
      );
    }

    const authUser = getServerAuthUser(req);
    if (authUser?.id && String(authUser.id) === String(listing.sellerId)) {
      return NextResponse.json({
        success: true,
        counted: false,
        views: Number(listing.views ?? 0),
      });
    }

    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";
    const ua = req.headers.get("user-agent") || "";
    const anonHash = crypto
      .createHash("sha256")
      .update(`${clientIp}:${ua}`)
      .digest("hex")
      .slice(0, 16);

    const viewerKey = authUser?.id ? `u:${authUser.id}` : `anon:${anonHash}`;
    const dedupKey = `listing:view:${String(listing._id)}:${viewerKey}`;

    const shouldCount = await acquireViewDedupLock(dedupKey);
    if (!shouldCount) {
      return NextResponse.json({
        success: true,
        counted: false,
        views: Number(listing.views ?? 0),
      });
    }

    const updated: any = await ListingModel.findByIdAndUpdate(
      listing._id,
      { $inc: { views: 1 } },
      { returnDocument: "after" }
    )
      .select("views")
      .lean();

    return NextResponse.json({
      success: true,
      counted: true,
      views: Number(updated?.views ?? Number(listing.views ?? 0) + 1),
    });
  } catch (error) {
    if (isDatabaseUnavailable(error)) return databaseUnavailableResponse();
    return NextResponse.json(
      { success: false, error: "Failed to record view." },
      { status: 500 }
    );
  }
}
