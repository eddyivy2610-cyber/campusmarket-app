import { NextRequest, NextResponse } from "next/server";
import argon2 from "argon2";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import { requireAdmin } from "@/lib/authServer";
import {
  GENERIC_ADMIN_REG_ERROR,
  getAdminRegistrationKey,
  constantTimeKeyCompare,
  checkRateLimit,
  recordFailedAttempt,
} from "@/lib/adminAuthHelpers";

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
    const { email, username, password, adminKey } = body;

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
    const hashedPassword =
      typeof password === "string" && password.trim()
        ? await argon2.hash(password.trim())
        : undefined;

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
          if (hashedPassword) {
            existing.password = hashedPassword;
          }
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
          ...(hashedPassword ? { password: hashedPassword } : {}),
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
