import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import {
  verifyRefreshToken,
  createAccessToken,
  createRefreshToken,
  setRefreshTokenCookie,
  setAccessTokenCookie,
  clearRefreshTokenCookie,
  getRefreshTokenFromRequest,
} from "@/lib/authTokens";
import UserModel, { User } from "@/models/User";
import dbConnect from "@/lib/dbConnect";

export async function POST(req: NextRequest) {
  try {
    // 1. Extract refresh token from httpOnly cookie or fallback to request body
    let refreshToken = getRefreshTokenFromRequest(req);
    if (!refreshToken) {
      try {
        const body = await req.json();
        if (body?.refreshToken && typeof body.refreshToken === "string") {
          refreshToken = body.refreshToken.trim();
        }
      } catch {
        // No body
      }
    }

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, error: "No active session." },
        { status: 401 }
      );
    }

    // 2. Cryptographically verify the refresh token
    const user = verifyRefreshToken(refreshToken);
    if (!user) {
      const res = NextResponse.json(
        { success: false, error: "Invalid or expired refresh token." },
        { status: 401 }
      );
      clearRefreshTokenCookie(res);
      return res;
    }

    if (user.emailVerified === false) {
      const res = NextResponse.json(
        { success: false, error: "Email verification is required." },
        { status: 403 }
      );
      clearRefreshTokenCookie(res);
      return res;
    }

    // 3. Database status re-check: Account suspension or revocation stops refresh immediately.
    // Do NOT clear the refresh cookie on transient 503 DB connectivity issues so client retries succeed.
    let dbConnection;
    try {
      dbConnection = await dbConnect();
    } catch {
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json(
          { success: false, error: "Authentication service temporarily unavailable." },
          { status: 503 }
        );
      }
    }

    if (process.env.NODE_ENV === "production" && (!dbConnection || mongoose.connection.readyState !== 1)) {
      return NextResponse.json(
        { success: false, error: "Authentication service temporarily unavailable." },
        { status: 503 }
      );
    }

    const isUserDbAvailable =
      typeof window === "undefined" &&
      (UserModel.db?.readyState === 1 ||
        Object.prototype.hasOwnProperty.call(UserModel, "findOne") ||
        Object.prototype.hasOwnProperty.call(UserModel, "findById"));

    if (isUserDbAvailable) {
      try {
        const selectFields =
          "role accountStatus emailVerified tokenVersion name email isStudent studentVerified campus sellerStatus onboardingStep profile";
        let dbUser = mongoose.isValidObjectId(user.id)
          ? await User.findById(user.id).select(selectFields).lean()
          : null;
        if (!dbUser && user.email) {
          dbUser = await User.findOne({ email: user.email.toLowerCase() }).select(selectFields).lean();
        }

        if (dbUser) {
          if (dbUser.emailVerified === false) {
            const res = NextResponse.json(
              { success: false, error: "Email verification is required." },
              { status: 403 }
            );
            clearRefreshTokenCookie(res);
            return res;
          }
          if (dbUser.accountStatus !== "active") {
            const res = NextResponse.json(
              {
                success: false,
                error: `Account is ${dbUser.accountStatus || "inactive"}. Token refresh rejected.`,
              },
              { status: 403 }
            );
            clearRefreshTokenCookie(res);
            return res;
          }

          // Invalidation check: Compare tokenVersion to detect revoked/replayed tokens
          const currentVersion = typeof (dbUser as any).tokenVersion === "number" ? (dbUser as any).tokenVersion : 0;
          const tokenVersion = typeof user.tokenVersion === "number" ? user.tokenVersion : 0;
          if (currentVersion !== tokenVersion) {
            const res = NextResponse.json(
              {
                success: false,
                error: "Session has expired or was revoked. Please log in again.",
              },
              { status: 401 }
            );
            clearRefreshTokenCookie(res);
            return res;
          }

          user.id = String(dbUser._id || user.id);
          user.tokenVersion = currentVersion;
          user.role = (dbUser.role as any) || user.role;
          user.name = dbUser.name || dbUser.profile?.displayName || user.name;
          user.email = dbUser.email || user.email;
          user.isStudent = Boolean(dbUser.isStudent);
          user.studentVerified = Boolean(dbUser.studentVerified);
          user.campus = dbUser.campus;
          (user as any).sellerStatus = (dbUser as any).sellerStatus || "none";
          (user as any).onboardingStep = (dbUser as any).onboardingStep || "completed";
          (user as any).handle =
            dbUser.profile?.handle ||
            (dbUser.name || user.email.split("@")[0] || "")
              .toLowerCase()
              .replace(/[^a-z0-9]/g, "") ||
            user.id;
          (user as any).avatar = dbUser.profile?.avatar;
          (user as any).displayName = dbUser.profile?.displayName || user.name;
        }
      } catch {
        if (process.env.NODE_ENV === "production") {
          return NextResponse.json(
            { success: false, error: "Authentication service temporarily unavailable." },
            { status: 503 }
          );
        }
      }
    }

    // 4. Issue new 15-minute access token and rotated refresh token
    const newAccessToken = createAccessToken(user);
    const newRefreshToken = createRefreshToken(user);

    const res = NextResponse.json(
      {
        success: true,
        token: newAccessToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          handle: (user as any).handle || user.id,
          role: user.role,
          sellerStatus: (user as any).sellerStatus || "none",
          onboardingStep: (user as any).onboardingStep || "completed",
          isStudent: user.isStudent,
          studentVerified: user.studentVerified,
          emailVerified: user.emailVerified,
          campus: user.campus,
          profile: {
            handle: (user as any).handle || user.id,
            displayName: (user as any).displayName || user.name,
            avatar: (user as any).avatar,
          },
        },
      },
      { status: 200 }
    );

    // 5. Update httpOnly, Secure, SameSite access and refresh token cookies
    setAccessTokenCookie(res, newAccessToken);
    setRefreshTokenCookie(res, newRefreshToken);

    return res;
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to refresh token." },
      { status: 500 }
    );
  }
}
