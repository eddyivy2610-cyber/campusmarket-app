import { NextRequest, NextResponse } from "next/server";
import {
  clearRefreshTokenCookie,
  getRefreshTokenFromRequest,
  verifyRefreshToken,
  clearAccessTokenCookie,
} from "@/lib/authTokens";
import { getServerAuthUser } from "@/lib/authServer";
import { hashOpaqueRefreshToken, revokeRefreshTokenFamily } from "@/lib/refreshTokens";
import RefreshTokenModel from "@/models/RefreshToken";
import UserModel from "@/models/User";
import dbConnect from "@/lib/dbConnect";

export async function POST(req: NextRequest) {
  try {
    const res = NextResponse.json(
      { success: true, message: "Logged out successfully." },
      { status: 200 }
    );
    clearRefreshTokenCookie(res);
    clearAccessTokenCookie(res);

    // Identify user from access token or refresh token to bump tokenVersion and revoke refresh family
    if (req) {
      const authUser = getServerAuthUser(req);
      let userId = authUser?.id;
      const rawRefresh = getRefreshTokenFromRequest(req);

      try {
        await dbConnect();
        if (rawRefresh) {
          const tokenHash = hashOpaqueRefreshToken(rawRefresh);
          const stored = await RefreshTokenModel.findOne({ tokenHash }).lean();
          if (stored) {
            await revokeRefreshTokenFamily(stored.familyId);
            if (!userId) userId = stored.userId.toString();
          }
        }
        if (!userId && rawRefresh) {
          const refreshUser = verifyRefreshToken(rawRefresh);
          if (refreshUser?.id) {
            userId = refreshUser.id;
          }
        }
        if (userId) {
          await UserModel.findByIdAndUpdate(userId, { $inc: { tokenVersion: 1 } });
        }
      } catch {
        // Continue even if offline or mock DB
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
