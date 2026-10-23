import { NextRequest, NextResponse } from "next/server";
import argon2 from "argon2";
import dbConnect from "@/lib/dbConnect";
import UserModel, { saveUserWithHandleRetry } from "@/models/User";
import { requestOtpCode } from "@/lib/otpService";
import { sendExistingAccountNotice } from "@/lib/email";

export const dynamic = "force-dynamic";

/**
 * POST /api/auth/register
 * Step 1 of the signup flow:
 * - Validates full name, email, and password complexity.
 * - Securely hashes password using Argon2id.
 * - Creates/updates the unverified user document.
 * - Automatically generates a 6-digit OTP and dispatches it via Resend/Postmark/SES.
 * - Avoids user enumeration: Returns clean, generic responses.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { fullName, email, password } = body;

    // 1. Validation
    if (!fullName || typeof fullName !== "string" || !fullName.trim()) {
      return NextResponse.json(
        { success: false, message: "Full name is required." },
        { status: 400 }
      );
    }

    const cleanEmail = email?.toLowerCase()?.trim();
    if (!cleanEmail || !/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      return NextResponse.json(
        { success: false, message: "A valid email address is required." },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string" || password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must be at least 8 characters long.",
        },
        { status: 400 }
      );
    }

    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    if (!hasLetter || !hasNumber) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must contain both letters and numbers.",
        },
        { status: 400 }
      );
    }

    await dbConnect();

    // 2. Check existing user
    const existingUser = await UserModel.findOne({ email: cleanEmail });
    if (existingUser) {
      const isVerified =
        Boolean((existingUser as any).emailVerified) ||
        Boolean(existingUser.studentVerified);

      if (isVerified) {
        try {
          await sendExistingAccountNotice(cleanEmail);
        } catch (noticeError: any) {
          console.error("[POST /api/auth/register] Existing-account notice failed:", noticeError?.message);
        }
        return NextResponse.json(
          {
            success: true,
            message: "If this email is eligible, a verification message has been dispatched.",
          },
          { status: 202 }
        );
      }

      // Pending registrations are replaced only after a fresh OTP succeeds.
      const hashedPassword = await argon2.hash(password);
      const forwardedFor = req.headers.get("x-forwarded-for");
      const clientIp =
        forwardedFor?.split(",")[0]?.trim() ||
        req.headers.get("x-real-ip") ||
        "127.0.0.1";
      const otpResult = await requestOtpCode(cleanEmail, clientIp, {
        name: fullName.trim(),
        passwordHash: hashedPassword,
      });
      return NextResponse.json(
        {
          success: otpResult.success,
          email: cleanEmail,
          message: otpResult.message,
        },
        { status: otpResult.success ? 201 : otpResult.status }
      );
    } else {
      // 3. Create fresh user
      const hashedPassword = await argon2.hash(password);
      const rawHandle = fullName
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
      const handle = rawHandle
        ? `${rawHandle}${Math.floor(100 + Math.random() * 900)}`
        : `user${Math.floor(1000 + Math.random() * 9000)}`;

      const newUser = new UserModel({
        name: fullName.trim(),
        email: cleanEmail,
        password: hashedPassword,
        role: "buyer",
        accountStatus: "pending",
        isStudent: true,
        studentVerified: false,
        emailVerified: false,
        onboardingStep: "pending",
        profile: {
          displayName: fullName.trim(),
          handle,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${handle}`,
        },
        schemaVersion: 1,
        tokenVersion: 0,
      });

      await saveUserWithHandleRetry(newUser);
    }

    // 4. Dispatch 6-digit OTP
    const forwardedFor = req.headers.get("x-forwarded-for");
    const clientIp =
      forwardedFor?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    const otpResult = await requestOtpCode(cleanEmail, clientIp);

    if (!otpResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: otpResult.message,
        },
        { status: otpResult.status }
      );
    }

    return NextResponse.json(
      {
        success: true,
        email: cleanEmail,
        message:
          otpResult.message ||
          "Account created. A verification code has been dispatched to your email.",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[POST /api/auth/register] Error:", error);
    if (error?.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          message: "An account with this email already exists. Please log in.",
        },
        { status: 409 }
      );
    }
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create account. Please try again.",
      },
      { status: 500 }
    );
  }
}
