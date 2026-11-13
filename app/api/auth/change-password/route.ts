import { NextRequest, NextResponse } from "next/server";
import argon2 from "argon2";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import { requireAuth } from "@/lib/authServer";
import {
  createAccessToken,
  createRefreshToken,
  setAccessTokenCookie,
  setRefreshTokenCookie,
} from "@/lib/authTokens";
import {
  isDatabaseUnavailable,
  databaseUnavailableResponse,
} from "@/lib/databaseErrors";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { user, errorResponse } = await requireAuth(req);
  if (!user || errorResponse) return errorResponse;

  const body = await req.json().catch(() => ({}));
  const currentPassword =
    typeof body.currentPassword === "string" ? body.currentPassword : "";
  const newPassword =
    typeof body.newPassword === "string" ? body.newPassword : "";

  if (!currentPassword || !newPassword) {
    return NextResponse.json(
      {
        success: false,
        error: "Current password and new password are required.",
      },
      { status: 400 }
    );
  }

  if (
    newPassword.length < 8 ||
    !/[a-zA-Z]/.test(newPassword) ||
    !/[0-9]/.test(newPassword)
  ) {
    return NextResponse.json(
      {
        success: false,
        error:
          "New password must be at least 8 characters and include a letter and a number.",
      },
      { status: 400 }
    );
  }

  if (newPassword === currentPassword) {
    return NextResponse.json(
      {
        success: false,
        error: "New password must be different from your current password.",
      },
      { status: 400 }
    );
  }

  try {
    await dbConnect();
  } catch (error) {
    if (isDatabaseUnavailable(error)) return databaseUnavailableResponse();
    throw error;
  }

  const dbUser = await UserModel.findById(user.id).select(
    "+password name email role isStudent studentVerified emailVerified campus accountStatus tokenVersion"
  );

  if (!dbUser || dbUser.accountStatus !== "active") {
    return NextResponse.json(
      { success: false, error: "Account not found or inactive." },
      { status: 404 }
    );
  }

  if (!dbUser.password) {
    return NextResponse.json(
      {
        success: false,
        error:
          "This account does not have a password set. Use password reset to set one.",
      },
      { status: 400 }
    );
  }

  let matches = false;
  try {
    matches = await argon2.verify(dbUser.password, currentPassword);
  } catch {
    matches = false;
  }

  if (!matches) {
    return NextResponse.json(
      { success: false, error: "Current password is incorrect." },
      { status: 401 }
    );
  }

  const passwordHash = await argon2.hash(newPassword);
  const nextTokenVersion = (dbUser.tokenVersion || 0) + 1;

  await UserModel.updateOne(
    { _id: dbUser._id },
    {
      $set: {
        password: passwordHash,
        tokenVersion: nextTokenVersion,
        updatedAt: new Date().toISOString(),
      },
    }
  );

  const tokenPayload = {
    id: dbUser._id.toString(),
    name: dbUser.name || "User",
    email: dbUser.email,
    role: dbUser.role || "buyer",
    isStudent: Boolean(dbUser.isStudent),
    studentVerified: Boolean(dbUser.studentVerified),
    emailVerified: Boolean(dbUser.emailVerified),
    campus: dbUser.campus,
    tokenVersion: nextTokenVersion,
  } as const;

  const accessToken = createAccessToken(tokenPayload);
  const refreshToken = createRefreshToken(tokenPayload);

  const res = NextResponse.json({
    success: true,
    message: "Password updated successfully.",
  });
  setAccessTokenCookie(res, accessToken);
  setRefreshTokenCookie(res, refreshToken);
  return res;
}
