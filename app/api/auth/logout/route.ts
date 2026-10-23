import { NextRequest, NextResponse } from "next/server";
import {
  clearRefreshTokenCookie,
  getRefreshTokenFromRequest,
  verifyRefreshToken,
  clearAccessTokenCookie,
} from "@/lib/authTokens";
import { getServerAuthUser } from "@/lib/authServer";
import UserModel from "@/models/User";
import dbConnect from "@/lib/dbConnect";

export async function POST(req?: NextRequest) {
  try {
    const res = NextResponse.json(
      { success: true, message: "Logged out successfully." },
      { status: 200 }
    );
    clearRefreshTokenCookie(res);
    clearAccessTokenCookie(res);

    // Identify user from access token or refresh token to bump tokenVersion (revokes all active refresh tokens)
    if (req) {
      const authUser = getServerAuthUser(req);
      let userId = authUser?.id;

      if (!userId) {
        const refreshToken = getRefreshTokenFromRequest(req);
        if (refreshToken) {
          const refreshUser = verifyRefreshToken(refreshToken);
          if (refreshUser?.id) {
            userId = refreshUser.id;
          }
        }
      }

      if (userId) {
        try {
          await dbConnect();
          await UserModel.findByIdAndUpdate(userId, { $inc: { tokenVersion: 1 } });
        } catch {
          // Continue even if offline or mock DB
        }
      }
    }

    return res;
  } catch {
    const res = NextResponse.json(
      { success: true, message: "Logged out successfully." },
      { status: 200 }
    );
    clearRefreshTokenCookie(res);
    clearAccessTokenCookie(res);
    return res;
  }
}
