import { NextResponse } from "next/server";
import { checkDbHealth } from "@/lib/dbConnect";

export const dynamic = "force-dynamic";

const startTime = Date.now();

export async function GET() {
  const dbHealth = await checkDbHealth();
  const uptimeSec = Math.floor((Date.now() - startTime) / 1000);
  const mem = process.memoryUsage();

  const isHealthy = dbHealth.connected;
  const status = isHealthy ? "healthy" : "degraded";

  const payload = {
    status,
    timestamp: new Date().toISOString(),
    uptimeSec,
    version: "2.0.0",
    environment: process.env.NODE_ENV || "development",
    database: {
      status: dbHealth.connected ? "connected" : "disconnected",
      latencyMs: dbHealth.latencyMs,
      readyState: dbHealth.readyState,
      ...(dbHealth.error ? { error: dbHealth.error } : {}),
    },
    system: {
      memory: {
        rssMb: Math.round(mem.rss / 1024 / 1024),
        heapUsedMb: Math.round(mem.heapUsed / 1024 / 1024),
        heapTotalMb: Math.round(mem.heapTotal / 1024 / 1024),
      },
      nodeVersion: process.version,
    },
  };

  return NextResponse.json(payload, {
    status: isHealthy ? 200 : 503,
    headers: {
      "Cache-Control": "no-cache, no-store, max-age=0, must-revalidate",
      "Content-Type": "application/json",
    },
  });
}
