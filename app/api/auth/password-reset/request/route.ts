import { after } from "next/server";
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import PasswordResetTokenModel from "@/models/PasswordResetToken";
import { createPasswordResetToken, PASSWORD_RESET_TTL_MS } from "@/lib/passwordReset";
import { checkPasswordResetRateLimit } from "@/lib/upstashRateLimit";
import { sendPasswordResetEmail } from "@/lib/email";

const GENERIC_RESPONSE = { success: true, message: "If an account exists for that email, a reset link has been sent." };

function ip(req: NextRequest) { return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown"; }

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json(GENERIC_RESPONSE, { status: 202 });
  const startedAt = Date.now();
  try {
    const limit = await checkPasswordResetRateLimit(email, ip(req));
    if (!limit.allowed) return NextResponse.json(GENERIC_RESPONSE, { status: 202 });
    await dbConnect();
    const user = await UserModel.findOne({ email }).select("_id email accountStatus").lean();
    if (user && user.accountStatus === "active") {
      const { token, tokenHash } = createPasswordResetToken();
      await PasswordResetTokenModel.deleteMany({ userId: user._id });
      await PasswordResetTokenModel.create({ userId: user._id, tokenHash, expiresAt: new Date(Date.now() + PASSWORD_RESET_TTL_MS) });
      const origin = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;
      after(async () => {
        try { await sendPasswordResetEmail(email, `${origin}/forgot-password#token=${encodeURIComponent(token)}`); }
        catch (error: any) { console.error("[POST /api/auth/password-reset/request] email delivery failed:", error?.message || error); }
      });
    }
  } catch (error: any) {
    console.error("[POST /api/auth/password-reset/request] failed:", error?.message || error);
    if (String(error?.message || "").toLowerCase().includes("upstash")) {
      return NextResponse.json({ success: false, message: "Password reset is temporarily unavailable." }, { status: 503 });
    }
  }
  // Equalize the quick paths enough to avoid an existence oracle while keeping
  // provider delivery outside the response latency.
  const remaining = 150 - (Date.now() - startedAt);
  if (remaining > 0) await new Promise((resolve) => setTimeout(resolve, remaining));
  return NextResponse.json(GENERIC_RESPONSE, { status: 202 });
}
