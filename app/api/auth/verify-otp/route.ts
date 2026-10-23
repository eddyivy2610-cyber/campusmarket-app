import { NextRequest, NextResponse } from "next/server";
import { verifyOtpCode } from "@/lib/otpService";
import UserModel from "@/models/User";
import {
  createAccessToken,
  createRefreshToken,
  setRefreshTokenCookie,
} from "@/lib/authTokens";
import dbConnect from "@/lib/dbConnect";

export const dynamic = "force-dynamic";

/**
 * POST /api/auth/verify-otp
 * Verifies the 6-digit OTP code:
 * - Atomic reservation enforces a hard limit of 5 failed attempts.
 * - Single-use deletion immediately eliminates the code upon success, preventing replay & double-spend.
 * - Timing-safe comparison prevents timing oracle side channels.
 * - On success: activates account, marks emailVerified: true, issues access & refresh tokens.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, otp } = body;

    const result = await verifyOtpCode(email, otp);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.message,
        },
        { status: result.status }
      );
    }

    // Connect DB and look up user
    await dbConnect();
    const user = await UserModel.findOne({
      email: result.email?.toLowerCase().trim(),
    });

    if (!user) {
      return NextResponse.json({
        success: true,
        verified: true,
        email: result.email,
        message: "Email verified successfully. Please complete your registration.",
      });
    }

    // Generate authenticated session tokens
    const userPayload = {
      id: user._id.toString(),
      name: user.name || user.profile?.displayName || "User",
      email: user.email,
      role: user.role || "buyer",
      isStudent: Boolean(user.isStudent),
      studentVerified: Boolean(user.studentVerified),
      campus: user.campus,
      tokenVersion: user.tokenVersion || 0,
    };

    const accessToken = createAccessToken(userPayload);
    const refreshToken = createRefreshToken(userPayload);

    const res = NextResponse.json({
      success: true,
      message: "Email verified successfully.",
      token: accessToken,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        isStudent: user.isStudent,
        studentVerified: user.studentVerified,
        campus: user.campus,
        onboardingStep: user.onboardingStep,
        profile: {
          handle: user.profile?.handle,
          avatar: user.profile?.avatar,
          displayName: user.profile?.displayName,
        },
      },
    });

    setRefreshTokenCookie(res, refreshToken);
    res.cookies.set("campus_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 15 * 60, // 15 minutes short-lived
    });
    return res;
  } catch (error: any) {
    console.error("[POST /api/auth/verify-otp] Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to verify code. Please try again.",
      },
      { status: 500 }
    );
  }
}
