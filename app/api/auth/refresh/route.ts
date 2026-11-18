import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import {
  createAccessToken,
  isRequestHttps,
  setRefreshTokenCookie,
  setAccessTokenCookie,
  clearRefreshTokenCookie,
  getRefreshTokenFromRequest,
  ServerAuthUser,
} from "@/lib/authTokens";
import {
  hashOpaqueRefreshToken,
  isRefreshTokenFamilyRevoked,
  issueTrackedRefreshToken,
  revokeRefreshTokenFamily,
} from "@/lib/refreshTokens";
import { User } from "@/models/User";
import RefreshTokenModel from "@/models/RefreshToken";
import dbConnect from "@/lib/dbConnect";

export async function POST(req: NextRequest) {
  try {
    // 1. Extract opaque refresh token strictly from httpOnly cookie
    const rawRefreshToken = getRefreshTokenFromRequest(req);
    if (!rawRefreshToken) {
      return NextResponse.json(
        { success: false, error: "No active session." },
        { status: 401 }
      );
    }

    let dbConnection;
    try {
      dbConnection = await dbConnect();
    } catch {
      return NextResponse.json(
        { success: false, error: "Authentication service temporarily unavailable." },
        { status: 503 }
      );
    }

    if (!dbConnection || mongoose.connection.readyState !== 1) {
      return NextResponse.json(
        { success: false, error: "Authentication service temporarily unavailable." },
        { status: 503 }
      );
    }

    const now = new Date();
    const tokenHash = hashOpaqueRefreshToken(rawRefreshToken);
    const stored = await RefreshTokenModel.findOne({ tokenHash }).lean();

    if (!stored) {
      const res = NextResponse.json(
        { success: false, error: "Invalid or expired refresh token." },
        { status: 401 }
      );
      clearRefreshTokenCookie(res);
      return res;
    }

    if (
      stored.usedAt !== null ||
      stored.revokedAt !== null ||
      (await isRefreshTokenFamilyRevoked(stored.familyId))
    ) {
      await revokeRefreshTokenFamily(stored.familyId, now);
      const res = NextResponse.json(
        { success: false, error: "Session expired or was revoked (refresh token reuse detected)." },
        { status: 401 }
      );
      clearRefreshTokenCookie(res);
      return res;
    }

    if (new Date(stored.expiresAt) <= now) {
      await RefreshTokenModel.deleteOne({ _id: stored._id });
      const res = NextResponse.json(
        { success: false, error: "Invalid or expired refresh token." },
        { status: 401 }
      );
      clearRefreshTokenCookie(res);
      return res;
    }

    // 2. Atomically mark this refresh token as used; concurrent reuse revokes family
    const consumed = await RefreshTokenModel.findOneAndUpdate(
      { _id: stored._id, usedAt: null, revokedAt: null, expiresAt: { $gt: now } },
      { $set: { usedAt: now } },
      { new: true }
    );
    if (!consumed) {
      await revokeRefreshTokenFamily(stored.familyId, now);
      const res = NextResponse.json(
        { success: false, error: "Refresh token reuse detected; session family revoked." },
        { status: 401 }
      );
      clearRefreshTokenCookie(res);
      return res;
    }

    const selectFields =
      "role accountStatus emailVerified tokenVersion name email isStudent studentVerified campus sellerStatus onboardingStep profile";
    const dbUser: any = await User.findById(stored.userId).select(selectFields).lean();

    if (!dbUser || dbUser.accountStatus === "suspended" || dbUser.accountStatus === "banned") {
      await revokeRefreshTokenFamily(stored.familyId, now);
      const res = NextResponse.json(
        { success: false, error: "Account is suspended or inactive." },
        { status: 403 }
      );
      clearRefreshTokenCookie(res);
      return res;
    }

    if (
      typeof stored.tokenVersion === "number" &&
      stored.tokenVersion !== (dbUser.tokenVersion ?? 0)
    ) {
      await revokeRefreshTokenFamily(stored.familyId, now);
      const res = NextResponse.json(
        { success: false, error: "Session expired or was revoked." },
        { status: 401 }
      );
      clearRefreshTokenCookie(res);
      return res;
    }

    if (dbUser.emailVerified === false || dbUser.accountStatus !== "active") {
      const res = NextResponse.json(
        { success: false, error: "Email verification is required." },
        { status: 403 }
      );
      clearRefreshTokenCookie(res);
      return res;
    }

    const userPayload: ServerAuthUser = {
      id: dbUser._id.toString(),
      name: dbUser.name || dbUser.profile?.displayName || "User",
      email: dbUser.email,
      role: (dbUser.role || "buyer") as "buyer" | "seller" | "admin",
      isStudent: Boolean(dbUser.isStudent),
      studentVerified: Boolean(dbUser.studentVerified),
      emailVerified: dbUser.emailVerified !== false,
      campus: dbUser.campus,
      tokenVersion: typeof dbUser.tokenVersion === "number" ? dbUser.tokenVersion : 0,
    };

    const resolvedHandle = dbUser.profile?.handle || dbUser._id.toString();
    const newAccessToken = createAccessToken(userPayload);
    const { token: newRefreshToken } = await issueTrackedRefreshToken(
      dbUser._id.toString(),
      stored.familyId,
      userPayload.tokenVersion
    );
    const secureCookie = isRequestHttps(req);

    const res = NextResponse.json(
      {
        success: true,
        token: newAccessToken,
        user: {
          id: userPayload.id,
          name: userPayload.name,
          email: userPayload.email,
          handle: resolvedHandle,
          role: userPayload.role,
          sellerStatus: dbUser.sellerStatus || "none",
          onboardingStep: dbUser.onboardingStep || "completed",
          isStudent: userPayload.isStudent,
          studentVerified: userPayload.studentVerified,
          emailVerified: userPayload.emailVerified,
          campus: userPayload.campus,
          profile: {
            handle: resolvedHandle,
            displayName: dbUser.profile?.displayName || userPayload.name,
            avatar: dbUser.profile?.avatar,
          },
        },
      },
      { status: 200 }
    );

    setAccessTokenCookie(res, newAccessToken, { secure: secureCookie });
    setRefreshTokenCookie(res, newRefreshToken, { secure: secureCookie });

    return res;
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to refresh token." },
      { status: 500 }
    );
  }
}
