import { NextRequest, NextResponse } from "next/server";
import { checkDbHealth } from "@/lib/dbConnect";

export const dynamic = "force-dynamic";

const startTime = Date.now();

/**
 * GET /api/health
 *
 * Distinguishes basic Liveness from Readiness:
 * - ?probe=liveness: Validates process is running and responding. Does not query database.
 * - ?probe=readiness (or default): Probes database ping and readiness. Returns 200 if connected, 503 if degraded.
 *   Prevents leaking sensitive infrastructure details to unauthenticated callers.
 */
export async function GET(req: NextRequest) {
  const probe = req.nextUrl.searchParams.get("probe") || req.nextUrl.searchParams.get("type");
  const uptimeSec = Math.floor((Date.now() - startTime) / 1000);

  // 1. LIVENESS PROBE (Basic process health, no external dependency check)
  if (probe === "liveness") {
    return NextResponse.json(
      {
        status: "ok",
        probe: "liveness",
        uptimeSec,
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-cache, no-store, max-age=0, must-revalidate",
          "Content-Type": "application/json",
        },
      }
    );
  }

  // 2. READINESS PROBE (Lightweight database ping and connectivity check)
  const dbHealth = await checkDbHealth();
  const isReady = dbHealth.connected;

  const payload = {
    status: isReady ? "ok" : "degraded",
    probe: "readiness",
    uptimeSec,
    database: {
      status: isReady ? "connected" : "disconnected",
      latencyMs: dbHealth.latencyMs,
    },
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(payload, {
    status: isReady ? 200 : 503,
    headers: {
      "Cache-Control": "no-cache, no-store, max-age=0, must-revalidate",
      "Content-Type": "application/json",
    },
  });
}
