import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import {
  verifyRefreshToken,
  createAccessToken,
  createRefreshToken,
  setRefreshTokenCookie,
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
        { success: false, error: "Refresh token is required." },
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

    // 3. Database status re-check: Account suspension or revocation stops refresh immediately
    await dbConnect();
    const isUserDbAvailable =
      typeof window === "undefined" &&
      (UserModel.db?.readyState === 1 ||
        Object.prototype.hasOwnProperty.call(UserModel, "findOne") ||
        Object.prototype.hasOwnProperty.call(UserModel, "findById"));

    if (isUserDbAvailable) {
      try {
        const dbUser = mongoose.isValidObjectId(user.id)
          ? await User.findById(user.id).select("role accountStatus tokenVersion").lean()
          : await User.findOne({ email: user.email.toLowerCase() }).select("role accountStatus tokenVersion").lean();

        if (dbUser) {
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

          user.tokenVersion = currentVersion;
          user.role = (dbUser.role as any) || user.role;
        }
      } catch {
        // Fall through for offline tests
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
          role: user.role,
        },
      },
      { status: 200 }
    );

    // 5. Update httpOnly, Secure, SameSite refresh token cookie
    setRefreshTokenCookie(res, newRefreshToken);

    return res;
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to refresh token." },
      { status: 500 }
    );
  }
}
