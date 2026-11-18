import { NextResponse } from "next/server";

function notFoundJson() {
  return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
}

export const GET = notFoundJson;
export const POST = notFoundJson;
export const PUT = notFoundJson;
export const PATCH = notFoundJson;
export const DELETE = notFoundJson;
