import { NextRequest, NextResponse } from "next/server";
import argon2 from "argon2";
import UserModel from "@/models/User";
import dbConnect from "@/lib/dbConnect";
import { requestOtpCode } from "@/lib/otpService";
import { checkLoginRateLimit } from "@/lib/upstashRateLimit";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const email = String(body.email || "").trim().toLowerCase();
  const password = typeof body.password === "string" ? body.password : "";
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
  if (!email || !password) return NextResponse.json({ success: false, message: "Invalid email or password." }, { status: 401 });

  const limited = await checkLoginRateLimit(email, ip);
  if (!limited.allowed) return NextResponse.json({ success: false, message: "Too many attempts. Please try again later." }, { status: 429 });

  await dbConnect();
  const user = await UserModel.findOne({ email }).select("+password");
  let passwordMatches = false;
  if (user?.password) {
    try {
      passwordMatches = await argon2.verify(user.password, password);
    } catch {
      passwordMatches = false;
    }
  }
  if (!user || !passwordMatches) {
    return NextResponse.json({ success: false, message: "Invalid email or password." }, { status: 401 });
  }
  if (user.emailVerified) return NextResponse.json({ success: false, message: "Invalid request." }, { status: 400 });

  const result = await requestOtpCode(email, ip);
  return NextResponse.json({ success: result.success, message: result.message }, { status: result.status });
}
