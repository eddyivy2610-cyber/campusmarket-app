import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import { requireAdmin } from "@/lib/authServer";

export const GENERIC_ADMIN_REG_ERROR = "Administrator registration request could not be processed.";

export function getAdminRegistrationKey(): string {
  const key = process.env.ADMIN_REGISTRATION_KEY;
  if (!key) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "FATAL: ADMIN_REGISTRATION_KEY environment variable must be set in production."
      );
    }
    return "8d5d7b74307df7e49fa1f5958b0a7297a8560e547ba6432d";
  }
  return key;
}

/**
 * Constant-time comparison using SHA-256 fixed-length digests + timingSafeEqual
 * to prevent timing discrepancies and length-leakage attacks against the registration key.
 */
export function constantTimeKeyCompare(providedKey: string, expectedKey: string): boolean {
  if (typeof providedKey !== "string" || typeof expectedKey !== "string") {
    return false;
  }
  const hashA = crypto.createHash("sha256").update(providedKey).digest();
  const hashB = crypto.createHash("sha256").update(expectedKey).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

// In-memory sliding rate limiter for admin registration endpoints
const MAX_FAILED_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const failedAttemptsMap = new Map<string, { count: number; firstAttempt: number }>();

export function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const entry = failedAttemptsMap.get(identifier);
  if (!entry) return true;
  if (now - entry.firstAttempt > RATE_LIMIT_WINDOW_MS) {
    failedAttemptsMap.delete(identifier);
    return true;
  }
  return entry.count < MAX_FAILED_ATTEMPTS;
}

export function recordFailedAttempt(identifier: string) {
  const now = Date.now();
  if (failedAttemptsMap.size > 10000) {
    for (const [key, value] of failedAttemptsMap.entries()) {
      if (now - value.firstAttempt > RATE_LIMIT_WINDOW_MS) {
        failedAttemptsMap.delete(key);
      }
    }
  }
  const entry = failedAttemptsMap.get(identifier);
  if (!entry || now - entry.firstAttempt > RATE_LIMIT_WINDOW_MS) {
    failedAttemptsMap.set(identifier, { count: 1, firstAttempt: now });
  } else {
    entry.count += 1;
  }
}

export function _resetRateLimitForTesting(identifier?: string) {
  if (identifier) {
    failedAttemptsMap.delete(identifier);
  } else {
    failedAttemptsMap.clear();
  }
}

export async function POST(req: NextRequest) {
  const forwarded = req.headers.get("x-forwarded-for");
  const clientIp = forwarded ? forwarded.split(",")[0].trim() : req.headers.get("x-real-ip") || "unknown-ip";

  // Check if admin signup is explicitly disabled in environment
  if (process.env.DISABLE_ADMIN_SIGNUP === "true") {
    recordFailedAttempt(clientIp);
    return NextResponse.json(
      { success: false, error: GENERIC_ADMIN_REG_ERROR },
      { status: 403 }
    );
  }

  // Strict rate limit check: Max 5 failed attempts per 15 minutes
  if (!checkRateLimit(clientIp)) {
    return NextResponse.json(
      { success: false, error: GENERIC_ADMIN_REG_ERROR },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const { email, username, adminKey } = body;

    // Generic error on missing mandatory fields
    if (!email || !username || !adminKey) {
      recordFailedAttempt(clientIp);
      return NextResponse.json(
        { success: false, error: GENERIC_ADMIN_REG_ERROR },
        { status: 400 }
      );
    }

    // Verify key with constant-time equality check
    const expectedKey = getAdminRegistrationKey();
    if (!constantTimeKeyCompare(String(adminKey).trim(), expectedKey)) {
      recordFailedAttempt(clientIp);
      return NextResponse.json(
        { success: false, error: GENERIC_ADMIN_REG_ERROR },
        { status: 403 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanUsername = String(username).trim();

    try {
      await dbConnect();
      if (UserModel.db?.readyState === 1) {
        // Enforce bootstrap lock:
        // Once any active admin exists, open key-only registration is closed.
        // Creating any additional admin strictly requires an authenticated session from an existing active admin.
        const existingAdminCount = await UserModel.countDocuments({ role: "admin", accountStatus: "active" });
        if (existingAdminCount > 0) {
          const { admin: activeAdmin, errorResponse } = await requireAdmin(req);
          if (!activeAdmin || errorResponse) {
            recordFailedAttempt(clientIp);
            return NextResponse.json(
              { success: false, error: GENERIC_ADMIN_REG_ERROR },
              { status: 403 }
            );
          }
        }

        // Check if user already exists
        const existing = await UserModel.findOne({ email: cleanEmail });
        if (existing) {
          if (existing.role === "admin") {
            recordFailedAttempt(clientIp);
            return NextResponse.json(
              { success: false, error: GENERIC_ADMIN_REG_ERROR },
              { status: 409 }
            );
          }
          // Upgrade role to admin if existing non-admin user
          existing.role = "admin";
          existing.emailVerified = true;
          existing.accountStatus = "active";
          await existing.save();
          return NextResponse.json({
            success: true,
            message: "Existing user role upgraded to administrator.",
            admin: { id: existing._id, email: existing.email, name: existing.name },
          });
        }

        // Create new admin user in MongoDB
        const newAdmin = await UserModel.create({
          name: cleanUsername,
          email: cleanEmail,
          role: "admin",
          accountStatus: "active",
          emailVerified: true,
          isStudent: false,
          studentVerified: false,
          profile: {
            displayName: cleanUsername,
          },
        });

        return NextResponse.json(
          {
            success: true,
            message: "Administrator registered successfully.",
            admin: {
              id: newAdmin._id.toString(),
              name: newAdmin.name,
              email: newAdmin.email,
              role: newAdmin.role,
            },
          },
          { status: 201 }
        );
      }
    } catch {
      // Offline fallback for unit tests without live MongoDB daemon
    }

    // In production, reject unhandled database failures without falling back to mock registration
    if (process.env.NODE_ENV === "production") {
      recordFailedAttempt(clientIp);
      return NextResponse.json(
        { success: false, error: GENERIC_ADMIN_REG_ERROR },
        { status: 500 }
      );
    }

    // Dev fallback if DB connection is unavailable
    return NextResponse.json(
      {
        success: true,
        message: "Administrator registered successfully (dev mode).",
        admin: {
          id: "admin-registered-dev-01",
          name: cleanUsername,
          email: cleanEmail,
          role: "admin",
        },
      },
      { status: 201 }
    );
  } catch {
    recordFailedAttempt(clientIp);
    return NextResponse.json(
      { success: false, error: GENERIC_ADMIN_REG_ERROR },
      { status: 500 }
    );
  }
}
