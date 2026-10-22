import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { processNextJobBatch } from "@/lib/jobQueue";
import { getServerAuthUser } from "@/lib/authServer";

export const dynamic = "force-dynamic";

/**
 * POST /api/jobs/process
 * Worker endpoint for QStash, Inngest, or cron-triggered background job execution.
 *
 * Security:
 * - Accepts Bearer token matching CRON_SECRET or QSTASH_CURRENT_SIGNING_KEY / AUTH_SECRET.
 * - Or authenticated platform administrator.
 */
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    const cronSecret = process.env.CRON_SECRET || process.env.AUTH_SECRET;
    const isCronAuthorized =
      cronSecret && authHeader === `Bearer ${cronSecret}`;

    if (!isCronAuthorized) {
      // Check if caller is authenticated admin
      const user = getServerAuthUser(req);
      if (!user || user.role !== "admin") {
        return NextResponse.json(
          { success: false, error: "Unauthorized: Invalid worker credentials or insufficient admin permissions." },
          { status: 401 }
        );
      }
    }

    await dbConnect();

    const url = new URL(req.url);
    const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get("limit") || "10", 10)));

    const summary = await processNextJobBatch(limit);

    return NextResponse.json(
      {
        success: true,
        summary,
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-cache, no-store, max-age=0, must-revalidate",
        },
      }
    );
  } catch (error: any) {
    console.error("[POST /api/jobs/process] Worker error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Job processing failed." },
      { status: 500 }
    );
  }
}
