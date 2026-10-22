import { NextRequest, NextResponse } from "next/server";
import { requestOtpCode } from "@/lib/otpService";

export const dynamic = "force-dynamic";

/**
 * POST /api/auth/send-otp-to-email
 * Dispatches a 6-digit OTP to the requested email.
 * - Enforces IP sliding-window rate limit (max 10 requests / 10 minutes).
 * - Enforces per-email cooldown (60 seconds).
 * - Generates 6-digit OTP using crypto.randomInt().
 * - Stores only an HMAC-SHA256 hash with 10-minute validity.
 * - Sends email via Resend, Postmark, or SES.
 * - Always returns a generic response to prevent account enumeration.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = body.email || body.emailAddress;

    const forwardedFor = req.headers.get("x-forwarded-for");
    const clientIp =
      forwardedFor?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    const result = await requestOtpCode(email, clientIp);

    return NextResponse.json(
      {
        success: result.success,
        message: result.message,
        remainingCooldownSeconds: result.remainingCooldownSeconds,
      },
      { status: result.status }
    );
  } catch (error: any) {
    console.error("[POST /api/auth/send-otp-to-email] Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to dispatch verification code. Please try again.",
      },
      { status: 500 }
    );
  }
}
