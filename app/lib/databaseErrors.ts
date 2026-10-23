import { NextResponse } from "next/server";
import { DatabaseUnavailableError } from "./dbConnect";

export function isDatabaseUnavailable(error: unknown): boolean {
  const candidate = error as { statusCode?: number; name?: string; message?: string };
  return error instanceof DatabaseUnavailableError || candidate?.statusCode === 503 ||
    ["MongoServerSelectionError", "MongoNetworkError", "MongoNotConnectedError"].includes(String(candidate?.name)) ||
    /server selection|topology was destroyed|not connected|connection.*closed/i.test(String(candidate?.message || ""));
}

export function databaseUnavailableResponse() {
  return NextResponse.json(
    { success: false, error: "Database temporarily unavailable. Please try again shortly." },
    { status: 503 }
  );
}
