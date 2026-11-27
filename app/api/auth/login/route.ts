import { NextRequest, NextResponse } from "next/server";
import argon2 from "argon2";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import { createAccessToken, isRequestHttps, setAccessTokenCookie, setRefreshTokenCookie } from "@/lib/authTokens";
import { issueTrackedRefreshToken } from "@/lib/refreshTokens";
import { checkLoginRateLimit } from "@/lib/upstashRateLimit";
import { getClientIp } from "@/lib/rateLimit";
import { isDatabaseUnavailable, databaseUnavailableResponse } from "@/lib/databaseErrors";

const GENERIC_LOGIN_ERROR = "Invalid email or password.";
const DUMMY_PASSWORD_SEED = "campushive_dummy_timing_equalization_v1";
let dummyHashPromise: Promise<string> | null = null;

const localLoginBuckets = new Map<string, { count: number; expiresAt: number }>();
function checkLocalLoginFallback(email: string, ip: string): { allowed: boolean; count: number; retryAfterSeconds: number } {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  if (localLoginBuckets.size > 5000) {
    for (const [k, v] of localLoginBuckets) {
      if (v.expiresAt <= now) localLoginBuckets.delete(k);
    }
  }
  const bump = (key: string, max: number) => {
    const existing = localLoginBuckets.get(key);
    if (!existing || existing.expiresAt <= now) {
      localLoginBuckets.set(key, { count: 1, expiresAt: now + windowMs });
      return { allowed: true, count: 1, retryAfterSeconds: 900 };
    }
    existing.count += 1;
    const retryAfterSeconds = Math.max(1, Math.ceil((existing.expiresAt - now) / 1000));
    return { allowed: existing.count <= max, count: existing.count, retryAfterSeconds };
  };
  const ipRes = bump(`ip:${ip}`, 30);
  if (!ipRes.allowed) return ipRes;
  return bump(`email:${email}`, 15);
}

function getDummyPasswordHash(): Promise<string> {
  if (!dummyHashPromise) {
    dummyHashPromise = argon2.hash(DUMMY_PASSWORD_SEED);
  }
  return dummyHashPromise;
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const email = String(body.email || "").trim().toLowerCase();
  const password = typeof body.password === "string" ? body.password : "";

  if (!email || !password || password.length > 128) {
    return NextResponse.json({ success: false, message: GENERIC_LOGIN_ERROR }, { status: 401 });
  }

  const clientIp = getClientIp(req);
  let rateLimit: Awaited<ReturnType<typeof checkLoginRateLimit>>;
  try {
    rateLimit = await checkLoginRateLimit(email, clientIp);
  } catch (error: any) {
    console.error("[ALERT] [POST /api/auth/login] Rate limiter unavailable; enforcing local fallback:", error?.message);
    rateLimit = checkLocalLoginFallback(email, clientIp);
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

  let passwordMatches = false;
  if (user?.password) {
    try {
      passwordMatches = await argon2.verify(user.password, password);
    } catch {
      passwordMatches = false;
    }
  } else {
    try {
      const dummyHash = await getDummyPasswordHash();
      await argon2.verify(dummyHash, password);
    } catch {
      // Ignore dummy verification errors; still fail with 401
    }
  }
  if (!user || !passwordMatches) {
    return NextResponse.json({ success: false, message: GENERIC_LOGIN_ERROR }, { status: 401 });
  }

  if (user.accountStatus === "suspended" || user.accountStatus === "banned") {
    return NextResponse.json({ success: false, message: "Your account is suspended." }, { status: 403 });
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
  const resolvedHandle =
    user.profile?.handle ||
    (payload.name || user.email.split("@")[0] || "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "") ||
    user._id.toString();

  const accessToken = createAccessToken(payload);
  const { token: refreshToken } = await issueTrackedRefreshToken(
    user._id.toString(),
    undefined,
    payload.tokenVersion
  );
  const secureCookie = isRequestHttps(req);
  const response = NextResponse.json({
    success: true,
    token: accessToken,
    user: {
      id: user._id.toString(),
      name: payload.name,
      email: user.email,
      handle: resolvedHandle,
      role: user.role,
      sellerStatus: (user as any).sellerStatus || "none",
      isStudent: user.isStudent,
      studentVerified: user.studentVerified,
      onboardingStep: user.onboardingStep,
      campus: user.campus,
      profile: {
        handle: resolvedHandle,
        displayName: user.profile?.displayName || payload.name,
        avatar: user.profile?.avatar,
      },
    },
  });
  setAccessTokenCookie(response, accessToken, { secure: secureCookie });
  setRefreshTokenCookie(response, refreshToken, { secure: secureCookie });
  return response;
}
