import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import argon2 from "argon2";
import {
  createAuthToken,
  createRefreshToken,
  setRefreshTokenCookie,
  setAccessTokenCookie,
  ServerAuthUser,
} from "@/lib/authTokens";
import { checkRateLimit, recordFailedAttempt } from "@/lib/adminAuthHelpers";
import UserModel from "@/models/User";
import dbConnect from "@/lib/dbConnect";

const DUMMY_ADMIN_SEED = "campushive_admin_dummy_timing_seed_v1";
let dummyAdminHashPromise: Promise<string> | null = null;
function getDummyAdminHash(): Promise<string> {
  if (!dummyAdminHashPromise) {
    dummyAdminHashPromise = argon2.hash(DUMMY_ADMIN_SEED);
  }
  return dummyAdminHashPromise;
}

function safeCompareSecret(a: string, b: string): boolean {
  const digestA = crypto.createHash("sha256").update(a).digest();
  const digestB = crypto.createHash("sha256").update(b).digest();
  return a.length > 0 && b.length > 0 && crypto.timingSafeEqual(digestA, digestB);
}

export async function POST(req: NextRequest) {
  const forwarded = req.headers.get("x-forwarded-for");
  const clientIp = forwarded ? forwarded.split(",")[0].trim() : req.headers.get("x-real-ip") || "unknown-ip";

  if (!checkRateLimit(clientIp)) {
    return NextResponse.json(
      { success: false, error: "Too many sign-in attempts. Please try again later." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const { identity, password } = body;

    if (!identity || !password || typeof password !== "string" || password.length > 128) {
      recordFailedAttempt(clientIp);
      return NextResponse.json(
        { success: false, error: "Identity (email or username) and password are required." },
        { status: 400 }
      );
    }

    const cleanIdentity = String(identity).trim().toLowerCase();
    const cleanPassword = password;

    // 1. Optional explicitly configured env master admin (never fall back to hardcoded credentials)
    const envAdminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase() || "";
    const envAdminPassword = process.env.ADMIN_PASSWORD?.trim() || "";

    let authenticatedAdmin: ServerAuthUser | null = null;

    if (
      envAdminEmail &&
      envAdminPassword.length >= 12 &&
      cleanIdentity === envAdminEmail &&
      safeCompareSecret(cleanPassword, envAdminPassword)
    ) {
      authenticatedAdmin = {
        id: "admin-master-01",
        name: "Campus Hive Administrator",
        email: envAdminEmail,
        role: "admin",
        isStudent: false,
        studentVerified: false,
        emailVerified: true,
      };
    }

    // 2. Check DB admin user
    if (!authenticatedAdmin) {
      try {
        await dbConnect();
        const user = await UserModel.findOne({
          $or: [{ email: cleanIdentity }, { name: cleanIdentity }],
          role: "admin",
        }).select("+password");

        if (user?.password) {
          let passwordValid = false;
          try {
            passwordValid = await argon2.verify(user.password, cleanPassword);
          } catch {
            passwordValid = false;
          }

          if (passwordValid && user.accountStatus === "active") {
            authenticatedAdmin = {
              id: user._id.toString(),
              name: user.name,
              email: user.email,
              role: "admin",
              isStudent: Boolean(user.isStudent),
              studentVerified: Boolean(user.studentVerified),
              emailVerified: true,
              tokenVersion: typeof (user as any).tokenVersion === "number" ? (user as any).tokenVersion : 0,
            };
          }
        } else {
          const dummy = await getDummyAdminHash();
          await argon2.verify(dummy, cleanPassword).catch(() => false);
        }
      } catch {
        // Fall through
      }
    }

    if (!authenticatedAdmin) {
      recordFailedAttempt(clientIp);
      return NextResponse.json(
        { success: false, error: "Invalid admin credentials." },
        { status: 401 }
      );
    }

    // Generate cryptographically signed admin token (7-day expiry for admin suite continuity)
    const token = createAuthToken(authenticatedAdmin, 7 * 24 * 3600);

    // Generate long-lived refresh token (7 days)
    const refreshToken = createRefreshToken(authenticatedAdmin);

    const res = NextResponse.json(
      {
        success: true,
        token,
        user: {
          id: authenticatedAdmin.id,
          username: authenticatedAdmin.email.split("@")[0],
          name: authenticatedAdmin.name,
          email: authenticatedAdmin.email,
          role: authenticatedAdmin.role,
        },
      },
      { status: 200 }
    );

    // Set dedicated admin cookie + standard cookies
    res.cookies.set("campus_admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 3600,
    });
    setAccessTokenCookie(res, token);
    setRefreshTokenCookie(res, refreshToken);

    return res;
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Admin authentication error" },
      { status: 500 }
    );
  }
}
