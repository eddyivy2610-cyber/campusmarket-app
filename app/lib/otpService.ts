import crypto from "node:crypto";
import dbConnect from "./dbConnect";
import EmailVerificationModel from "../models/EmailVerification";
import UserModel from "../models/User";
import { sendOtpVerificationEmail } from "./email";

// -------------------------------------------------------------------
// CONFIGURATION & PEPPER
// -------------------------------------------------------------------

const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const EMAIL_COOLDOWN_MS = 60 * 1000; // 60 seconds
const MAX_VERIFICATION_ATTEMPTS = 5;

// In-memory sliding window rate limiter per IP for OTP dispatches
const ipRequestHistory = new Map<string, number[]>();
const IP_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS_PER_IP = 10; // max 10 requests per 10 minutes per IP

export function getOtpPepper(): string {
  const pepper = process.env.OTP_PEPPER || process.env.AUTH_SECRET;
  if (!pepper) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "FATAL: OTP_PEPPER or AUTH_SECRET is not configured in production environment."
      );
    }
    return "campushive-default-otp-hmac-pepper-32-chars-long";
  }
  return pepper;
}

/**
 * Checks sliding-window IP rate limit.
 */
export function checkIpRateLimit(ip: string): boolean {
  if (!ip) return true;
  const now = Date.now();
  const timestamps = (ipRequestHistory.get(ip) || []).filter(
    (t) => now - t < IP_WINDOW_MS
  );
  if (timestamps.length >= MAX_REQUESTS_PER_IP) {
    ipRequestHistory.set(ip, timestamps);
    return false;
  }
  timestamps.push(now);
  ipRequestHistory.set(ip, timestamps);
  return true;
}

/**
 * Resets IP rate limits (for testing purposes).
 */
export function resetIpRateLimits(): void {
  ipRequestHistory.clear();
}

/**
 * Generates a cryptographically secure 6-digit OTP using crypto.randomInt
 */
export function generateOtp(): string {
  return crypto.randomInt(100000, 1000000).toString();
}

/**
 * Computes an HMAC-SHA256 hash of the email and OTP with the server-side pepper.
 * The raw OTP is NEVER stored in the database.
 */
export function hashOtp(email: string, otp: string): string {
  const pepper = getOtpPepper();
  const cleanEmail = email.toLowerCase().trim();
  const cleanOtp = String(otp).trim();

  return crypto
    .createHmac("sha256", pepper)
    .update(`${cleanEmail}:${cleanOtp}`)
    .digest("hex");
}

export interface RequestOtpResult {
  success: boolean;
  status: number;
  message: string;
  remainingCooldownSeconds?: number;
}

export interface VerifyOtpResult {
  success: boolean;
  status: number;
  message: string;
  email?: string;
  userId?: string;
}

/**
 * Requests and dispatches an OTP code to the given email:
 * 1. Checks IP rate limits (max 10 / 10m).
 * 2. Checks email cooldown (60 seconds).
 * 3. Generates 6-digit OTP via crypto.randomInt().
 * 4. Stores HMAC-SHA256 hash with 10-minute expiry and attempts reset to 0.
 * 5. Dispatches email via cloud provider (Resend, Postmark, SES).
 * 6. Always returns a generic response to prevent email enumeration.
 */
export async function requestOtpCode(
  email: string,
  clientIp: string = "127.0.0.1"
): Promise<RequestOtpResult> {
  const cleanEmail = email?.toLowerCase().trim();
  if (!cleanEmail || !cleanEmail.includes("@")) {
    return {
      success: false,
      status: 400,
      message: "A valid email address is required.",
    };
  }

  // 1. IP Rate Limiting
  if (!checkIpRateLimit(clientIp)) {
    return {
      success: false,
      status: 429,
      message:
        "Too many verification requests from this network. Please try again later.",
    };
  }

  await dbConnect();

  // 2. Email Cooldown (60 seconds)
  const existing = await EmailVerificationModel.findOne({ email: cleanEmail });
  if (existing && existing.lastSentAt) {
    const elapsed = Date.now() - new Date(existing.lastSentAt).getTime();
    if (elapsed < EMAIL_COOLDOWN_MS) {
      const remainingSeconds = Math.ceil((EMAIL_COOLDOWN_MS - elapsed) / 1000);
      return {
        success: false,
        status: 429,
        remainingCooldownSeconds: remainingSeconds,
        message: `Please wait ${remainingSeconds} seconds before requesting another code.`,
      };
    }
  }

  // 3. Generate 6-digit OTP
  const rawOtp = generateOtp();
  const hashedOtp = hashOtp(cleanEmail, rawOtp);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + OTP_EXPIRY_MS);

  // 4. Upsert verification record with attempts reset to 0
  await EmailVerificationModel.updateOne(
    { email: cleanEmail },
    {
      $set: {
        verificationCode: hashedOtp,
        expiresAt,
        lastSentAt: now,
        attempts: 0,
      },
    },
    { upsert: true }
  );

  // 5. Dispatch email
  try {
    await sendOtpVerificationEmail(cleanEmail, rawOtp);
  } catch (emailErr: any) {
    console.error("[OTP] Failed to send verification email:", emailErr.message);
    // Roll back persisted OTP record so unsent code cannot linger
    try {
      await EmailVerificationModel.deleteOne({ email: cleanEmail });
    } catch {}

    if (process.env.NODE_ENV === "production") {
      return {
        success: false,
        status: 503,
        message: "Email service is temporarily unavailable. Please try again shortly.",
      };
    }
  }

  // 6. Generic response to prevent email enumeration
  return {
    success: true,
    status: 200,
    message: "If this email is eligible, a verification code has been dispatched.",
  };
}

/**
 * Verifies an OTP code:
 * 1. Atomically reserves an attempt (claims attempt ONLY if attempts < 5).
 * 2. Locks out with HTTP 429 if attempts reached maximum 5.
 * 3. Verifies 10-minute expiry window.
 * 4. Timing-safe cryptographic comparison prevents side-channel attacks.
 * 5. Single-use deletion: Deletes the verification record immediately upon success,
 *    preventing replay attacks and concurrent double redemption.
 */
export async function verifyOtpCode(
  email: string,
  otp: string
): Promise<VerifyOtpResult> {
  const cleanEmail = email?.toLowerCase().trim();
  const cleanOtp = String(otp || "").trim();

  if (!cleanEmail || !cleanOtp) {
    return {
      success: false,
      status: 400,
      message: "Email and 6-digit verification code are required.",
    };
  }

  if (cleanOtp.length !== 6 || !/^\d{6}$/.test(cleanOtp)) {
    return {
      success: false,
      status: 400,
      message: "Verification code must be exactly 6 digits.",
    };
  }

  await dbConnect();

  const candidateHash = hashOtp(cleanEmail, cleanOtp);

  // 1. Atomic single-use redemption:
  // If the hash matches, not expired, and attempts < MAX_VERIFICATION_ATTEMPTS,
  // findOneAndDelete atomically consumes the OTP in a single un-interruptible database operation.
  // This guarantees that in concurrent race conditions, exactly ONE request wins and redeems the code.
  const redeemed = await EmailVerificationModel.findOneAndDelete({
    email: cleanEmail,
    verificationCode: candidateHash,
    expiresAt: { $gt: new Date() },
    attempts: { $lt: MAX_VERIFICATION_ATTEMPTS },
  });

  if (redeemed) {
    // 2. Update live user account if exists
    const user = await UserModel.findOne({ email: cleanEmail });
    if (user) {
      user.studentVerified = true;
      (user as any).emailVerified = true;
      user.accountStatus = "active";
      if ((user as any).onboardingStep === "pending" || !(user as any).onboardingStep) {
        (user as any).onboardingStep = "otp_verified";
      }
      await user.save();
    }

    return {
      success: true,
      status: 200,
      message: "Email verified successfully.",
      email: cleanEmail,
      userId: user?._id?.toString(),
    };
  }

  // 3. If not redeemed, the code was either incorrect, expired, already redeemed, or locked.
  const existingRecord = await EmailVerificationModel.findOne({ email: cleanEmail });
  if (!existingRecord) {
    return {
      success: false,
      status: 401,
      message: "Invalid or expired verification code.",
    };
  }

  if (existingRecord.attempts >= MAX_VERIFICATION_ATTEMPTS) {
    return {
      success: false,
      status: 429,
      message:
        "Too many failed attempts. This code is locked. Please request a new verification code.",
    };
  }

  if (new Date(existingRecord.expiresAt).getTime() < Date.now()) {
    return {
      success: false,
      status: 401,
      message: "Verification code has expired. Please request a new code.",
    };
  }

  // Atomically increment failed attempts
  const updated = await EmailVerificationModel.findOneAndUpdate(
    { email: cleanEmail, attempts: { $lt: MAX_VERIFICATION_ATTEMPTS } },
    { $inc: { attempts: 1 } },
    { returnDocument: "after" }
  );

  const currentAttempts = updated?.attempts || existingRecord.attempts + 1;

  if (currentAttempts >= MAX_VERIFICATION_ATTEMPTS) {
    return {
      success: false,
      status: 429,
      message:
        "Too many failed attempts. This code is locked. Please request a new verification code.",
    };
  }

  const remaining = MAX_VERIFICATION_ATTEMPTS - currentAttempts;
  return {
    success: false,
    status: 401,
    message: `Invalid verification code. ${remaining} attempt${
      remaining === 1 ? "" : "s"
    } remaining.`,
  };
}
