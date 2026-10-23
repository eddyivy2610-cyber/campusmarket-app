import { NextRequest, NextResponse } from "next/server";
import argon2 from "argon2";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import { createAccessToken, createRefreshToken, setAccessTokenCookie, setRefreshTokenCookie } from "@/lib/authTokens";
import { checkLoginRateLimit } from "@/lib/upstashRateLimit";
import { isDatabaseUnavailable, databaseUnavailableResponse } from "@/lib/databaseErrors";

const GENERIC_LOGIN_ERROR = "Invalid email or password.";

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const email = String(body.email || "").trim().toLowerCase();
  const password = typeof body.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json({ success: false, message: GENERIC_LOGIN_ERROR }, { status: 401 });
  }

  let rateLimit: Awaited<ReturnType<typeof checkLoginRateLimit>>;
  try {
    rateLimit = await checkLoginRateLimit(email, getClientIp(req));
  } catch (error: any) {
    console.error("[ALERT] [POST /api/auth/login] Rate limiter unavailable; proceeding fail-open:", error?.message);
    rateLimit = { allowed: true, count: 0, retryAfterSeconds: 900 };
  }
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { success: false, message: "Too many login attempts. Please try again later." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
    );
  }

  try {
    await dbConnect();
  } catch (error) {
    if (isDatabaseUnavailable(error)) return databaseUnavailableResponse();
    throw error;
  }
  const user = await UserModel.findOne({ email }).select("+password");

  if (user?.accountStatus === "suspended" || user?.accountStatus === "banned") {
    return NextResponse.json({ success: false, message: "Your account is suspended." }, { status: 403 });
  }

  let passwordMatches = false;
  if (user?.password) {
    try {
      passwordMatches = await argon2.verify(user.password, password);
    } catch {
      passwordMatches = false;
    }
  }
  if (!user || !passwordMatches) {
    return NextResponse.json({ success: false, message: GENERIC_LOGIN_ERROR }, { status: 401 });
  }

  if (!user.emailVerified) {
    return NextResponse.json(
      { success: false, message: "Please verify your email before signing in.", canResendVerification: true },
      { status: 403 }
    );
  }

  if (user.accountStatus !== "active") {
    return NextResponse.json({ success: false, message: "Your account is not active." }, { status: 403 });
  }

  const payload = {
    id: user._id.toString(),
    name: user.name || user.profile?.displayName || "User",
    email: user.email,
    role: user.role || "buyer",
    isStudent: Boolean(user.isStudent),
    studentVerified: Boolean(user.studentVerified),
    emailVerified: Boolean(user.emailVerified),
    campus: user.campus,
    tokenVersion: user.tokenVersion || 0,
  } as const;
  const accessToken = createAccessToken(payload);
  const refreshToken = createRefreshToken(payload);
  const response = NextResponse.json({
    success: true,
    token: accessToken,
    user: {
      id: user._id.toString(),
      name: payload.name,
      email: user.email,
      role: user.role,
      sellerStatus: (user as any).sellerStatus || "none",
      isStudent: user.isStudent,
      studentVerified: user.studentVerified,
      onboardingStep: user.onboardingStep,
      campus: user.campus,
      profile: {
        handle: user.profile?.handle,
        displayName: user.profile?.displayName,
        avatar: user.profile?.avatar,
      },
    },
  });
  setAccessTokenCookie(response, accessToken);
  setRefreshTokenCookie(response, refreshToken);
  return response;
}
