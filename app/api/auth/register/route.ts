import { NextRequest, NextResponse } from "next/server";
import argon2 from "argon2";
import dbConnect from "@/lib/dbConnect";
import UserModel, { saveUserWithHandleRetry } from "@/models/User";
import { requestOtpCode } from "@/lib/otpService";
import { sendExistingAccountNotice } from "@/lib/email";
import { isDatabaseUnavailable, databaseUnavailableResponse } from "@/lib/databaseErrors";
import { generateDefaultUsername } from "@/lib/usernameUtils";
import { isReservedIdentityName, validateDisplayName } from "@/lib/nameValidation";
import { getDefaultAvatarUrl } from "@/lib/avatarUtils";

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
    const { fullName, email, password, campus, safetyLocation } = body;

    // 1. Validation
    const nameCheck = validateDisplayName(fullName);
    if (!nameCheck.valid) {
      return NextResponse.json(
        { success: false, message: nameCheck.error || "Please enter a valid display name." },
        { status: 400 }
      );
    }
    const cleanFullName = nameCheck.normalized;

    const cleanEmail = email?.toLowerCase()?.trim();
    if (!cleanEmail || cleanEmail.length > 254 || !/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      return NextResponse.json(
        { success: false, message: "A valid email address is required." },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string" || password.length < 8 || password.length > 128) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must be between 8 and 128 characters long.",
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
        name: cleanFullName,
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
      const rawHandle = generateDefaultUsername(cleanFullName, cleanEmail);
      const handle = isReservedIdentityName(rawHandle)
        ? generateDefaultUsername("member", "member")
        : rawHandle;

      const rawCampus = typeof campus === "string" ? campus.trim().slice(0, 120) : undefined;
      const parsedSafetyLoc =
        safetyLocation &&
        typeof safetyLocation === "object" &&
        Number.isFinite(Number(safetyLocation.lat)) &&
        Number.isFinite(Number(safetyLocation.lng))
          ? {
              lat: Number(Number(safetyLocation.lat).toFixed(6)),
              lng: Number(Number(safetyLocation.lng).toFixed(6)),
              accuracyMeters: Number.isFinite(Number(safetyLocation.accuracyMeters))
                ? Math.round(Number(safetyLocation.accuracyMeters))
                : null,
              source: "signup",
              capturedAt: new Date().toISOString(),
            }
          : undefined;

      const newUser = new UserModel({
        name: cleanFullName,
        email: cleanEmail,
        password: hashedPassword,
        role: "buyer",
        accountStatus: "pending",
        ...(rawCampus ? { campus: rawCampus } : {}),
        ...(parsedSafetyLoc ? { safetyLocation: parsedSafetyLoc } : {}),
        isStudent: true,
        studentVerified: false,
        emailVerified: false,
        onboardingStep: "pending",
        profile: {
          displayName: cleanFullName,
          handle,
          avatar: getDefaultAvatarUrl(handle),
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
    if (isDatabaseUnavailable(error)) return databaseUnavailableResponse();
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
