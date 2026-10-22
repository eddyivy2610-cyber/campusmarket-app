import { NextResponse } from "next/server";
import { clearRefreshTokenCookie } from "@/lib/authTokens";

export async function POST() {
  const res = NextResponse.json(
    { success: true, message: "Admin logged out successfully." },
    { status: 200 }
  );
  clearRefreshTokenCookie(res);
  return res;
}
