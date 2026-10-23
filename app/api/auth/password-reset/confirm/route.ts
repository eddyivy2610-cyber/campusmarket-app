import { NextRequest, NextResponse } from "next/server";
import argon2 from "argon2";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import PasswordResetTokenModel from "@/models/PasswordResetToken";
import { hashPasswordResetToken } from "@/lib/passwordReset";
import { sendPasswordResetNotice } from "@/lib/email";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const token = typeof body.token === "string" ? body.token : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!token || password.length < 8 || !/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return NextResponse.json({ success: false, message: "Invalid or expired reset link." }, { status: 400 });
  }
  await dbConnect();
  const record = await PasswordResetTokenModel.findOneAndUpdate(
    { tokenHash: hashPasswordResetToken(token), usedAt: null, expiresAt: { $gt: new Date() } },
    { $set: { usedAt: new Date() } },
    { new: true }
  );
  if (!record) return NextResponse.json({ success: false, message: "Invalid or expired reset link." }, { status: 400 });
  const passwordHash = await argon2.hash(password);
  const user = await UserModel.findOneAndUpdate({ _id: record.userId, accountStatus: "active" }, { $set: { password: passwordHash }, $inc: { tokenVersion: 1 } }, { new: true }).select("email").lean();
  if (!user) return NextResponse.json({ success: false, message: "Invalid or expired reset link." }, { status: 400 });
  try { await sendPasswordResetNotice(user.email); } catch (error: any) { console.error("[POST /api/auth/password-reset/confirm] notice failed:", error?.message || error); }
  return NextResponse.json({ success: true, message: "Your password has been reset. You can now sign in." });
}
