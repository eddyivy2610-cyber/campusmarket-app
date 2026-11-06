import { NextRequest, NextResponse } from "next/server";
import argon2 from "argon2";
import {
  createAuthToken,
  createRefreshToken,
  setRefreshTokenCookie,
  setAccessTokenCookie,
  ACCESS_TOKEN_EXPIRY_SECONDS,
  ServerAuthUser,
} from "@/lib/authTokens";
import UserModel from "@/models/User";
import dbConnect from "@/lib/dbConnect";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { identity, password } = body;

    if (!identity || !password) {
      return NextResponse.json(
        { success: false, error: "Identity (email or username) and password are required." },
        { status: 400 }
      );
    }

    const cleanIdentity = String(identity).trim().toLowerCase();
    const cleanPassword = String(password).trim();

    // 1. Check configured environment admin credentials
    const envAdminEmail = (process.env.ADMIN_EMAIL || "admin@campushive.edu.ng").toLowerCase();
    const envAdminPassword = process.env.ADMIN_PASSWORD || "aspireelevation2026";

    let authenticatedAdmin: ServerAuthUser | null = null;

    if (
      (cleanIdentity === envAdminEmail || cleanIdentity === "admin") &&
      (cleanPassword === envAdminPassword ||
        (process.env.NODE_ENV !== "production" && cleanPassword === "admin"))
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

    // 2. If not matched env credentials, check DB admin user if connected
    if (!authenticatedAdmin) {
      try {
        await dbConnect();
        const user = await UserModel.findOne({
          $or: [{ email: cleanIdentity }, { name: cleanIdentity }],
          role: "admin",
          accountStatus: "active",
        }).select("+password");

        if (user) {
          let passwordValid = false;
          if (user.password) {
            try {
              passwordValid = await argon2.verify(user.password, cleanPassword);
            } catch {
              passwordValid = user.password === cleanPassword;
            }
          } else if (envAdminPassword && cleanPassword === envAdminPassword) {
            passwordValid = true;
          }

          if (passwordValid) {
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
        }
      } catch {
        // Fall through
      }
    }

    if (!authenticatedAdmin) {
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
