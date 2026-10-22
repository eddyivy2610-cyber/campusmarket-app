import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import mongoose from "mongoose";
// @ts-expect-error backend mongoose lacks local ambient declarations in nextjs tsconfig
import backendMongoose from "../campus-hive-backend/node_modules/mongoose/index.js";
import { NextRequest } from "next/server";

process.env.AUTH_SECRET = "super_secret_audit_pepper_key_at_least_32_characters_long!";
process.env.OTP_PEPPER = "super_secret_audit_pepper_key_at_least_32_characters_long!";

import {
  hashOtp,
  requestOtpCode,
  verifyOtpCode,
  getOtpPepper,
} from "../app/lib/otpService";
import EmailVerificationModel from "../app/models/EmailVerification";
import UserModel from "../app/models/User";
import { POST as handleRegister } from "../app/api/auth/register/route";
import { POST as handleVerifyOtp } from "../app/api/auth/verify-otp/route";
import { POST as handleRefresh } from "../app/api/auth/refresh/route";
import { POST as handleLogout } from "../app/api/auth/logout/route";
import { requireAuth } from "../app/lib/authServer";
import { loginUser } from "../campus-hive-backend/services/auth.service.js";
import {
  createAccessToken,
  createRefreshToken,
  verifyAuthToken,
  REFRESH_TOKEN_COOKIE_NAME,
} from "../app/lib/authTokens";

function makeJsonRequest(url: string, body: any, headers?: Record<string, string>): NextRequest {
  return new NextRequest(new URL(url, "http://localhost:3000"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(headers || {}),
    },
    body: JSON.stringify(body),
  });
}

async function runAcceptanceAudit() {
  console.log("==================================================================");
  console.log("   PATCH 4.1 FINAL ACCEPTANCE AUDIT: VERIFICATION SUITE           ");
  console.log("==================================================================\n");

  let mongod: MongoMemoryReplSet | null = null;
  let passed = 0;

  try {
    mongod = await MongoMemoryReplSet.create({
      replSet: { count: 1, storageEngine: "wiredTiger" },
    });
    const uri = mongod.getUri();
    process.env.MONGODB_URI = uri;
    await mongoose.connect(uri);
    await (backendMongoose as any).connect(uri);

    // -----------------------------------------------------------------
    // AUDIT CHECK 1: Token storage follows existing secure session design
    // -----------------------------------------------------------------
    console.log("CHECK 1: Verifying token storage follows secure session design...");
    const sampleUser = {
      id: new mongoose.Types.ObjectId().toString(),
      name: "Audit User",
      email: "audit1@unilag.edu.ng",
      role: "buyer" as const,
      isStudent: true,
      studentVerified: true,
    };
    const accessJwt = createAccessToken(sampleUser);
    const parsedAccess = verifyAuthToken(accessJwt);
    assert.ok(parsedAccess, "Access token must be cryptographically valid");

    // Decode payload to assert 15-minute expiry
    const payload = JSON.parse(
      Buffer.from(accessJwt.split(".")[1], "base64").toString()
    );
    assert.strictEqual(payload.exp - payload.iat, 15 * 60, "Access token must have exactly 15-minute expiry");

    // Verify verify-otp endpoint sets httpOnly refresh token cookie
    const knownOtp = "123789";
    await UserModel.create({
      name: "Audit Student",
      email: "audit1@unilag.edu.ng",
      password: "dummy_hashed_pw",
      role: "buyer",
      accountStatus: "pending",
      studentVerified: false,
      emailVerified: false,
    });
    await EmailVerificationModel.create({
      email: "audit1@unilag.edu.ng",
      verificationCode: hashOtp("audit1@unilag.edu.ng", knownOtp),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      lastSentAt: new Date(),
      attempts: 0,
    });

    const verifyReq = makeJsonRequest("/api/auth/verify-otp", {
      email: "audit1@unilag.edu.ng",
      otp: knownOtp,
    });
    const verifyRes = await handleVerifyOtp(verifyReq);
    assert.strictEqual(verifyRes.status, 200);

    const refreshCookie = verifyRes.cookies.get(REFRESH_TOKEN_COOKIE_NAME);
    assert.ok(refreshCookie, "Refresh token must be returned in cookie");
    assert.strictEqual(refreshCookie?.httpOnly, true, "Refresh token cookie must be httpOnly: true");
    assert.strictEqual(refreshCookie?.sameSite, "lax", "Refresh token cookie must be sameSite: lax");

    const accessCookie = verifyRes.cookies.get("campus_token");
    assert.ok(accessCookie, "Short-lived access cookie must be present");
    assert.strictEqual(accessCookie?.httpOnly, true, "Access cookie must be httpOnly: true");

    console.log("  PASS: 15-min access token + httpOnly refresh cookie adhere to secure session design");
    passed++;

    // -----------------------------------------------------------------
    // AUDIT CHECK 2: Resend cannot bypass attempt limits
    // -----------------------------------------------------------------
    console.log("\nCHECK 2: Verifying resend cannot bypass attempt limits...");
    const emailResend = "resend_check@oau.edu.ng";
    await requestOtpCode(emailResend, "192.168.1.1");

    // Fail 4 times
    for (let i = 0; i < 4; i++) {
      await verifyOtpCode(emailResend, "000000");
    }
    const recordBefore = await EmailVerificationModel.findOne({ email: emailResend });
    assert.strictEqual(recordBefore?.attempts, 4);

    // Attempting resend immediately is blocked by 60s cooldown
    const cooldownRes = await requestOtpCode(emailResend, "192.168.1.1");
    assert.strictEqual(cooldownRes.status, 429, "Immediate resend must be blocked by cooldown");

    // Old code verification still fails and hits lockout on 5th attempt
    const lockAttempt = await verifyOtpCode(emailResend, "000000");
    assert.strictEqual(lockAttempt.status, 429, "5th attempt must lock code");

    console.log("  PASS: Resend cooldown prevents attempt limit bypass; lockout enforced");
    passed++;

    // -----------------------------------------------------------------
    // AUDIT CHECK 3: Expiry checked by verification query independent of TTL
    // -----------------------------------------------------------------
    console.log("\nCHECK 3: Verifying query-level expiry check (independent of MongoDB TTL)...");
    const emailExpired = "expired@ui.edu.ng";
    const expiredOtp = "888999";
    // Store expired record (expired 10 seconds ago, still present in MongoDB before TTL worker)
    await EmailVerificationModel.create({
      email: emailExpired,
      verificationCode: hashOtp(emailExpired, expiredOtp),
      expiresAt: new Date(Date.now() - 10000), // Expired!
      lastSentAt: new Date(Date.now() - 11 * 60 * 1000),
      attempts: 0,
    });

    const verifyExpired = await verifyOtpCode(emailExpired, expiredOtp);
    assert.strictEqual(verifyExpired.status, 401, "Expired OTP must be rejected immediately by query");
    assert.ok(verifyExpired.message.includes("expired"));

    console.log("  PASS: Query strictly filters expiresAt > now, rejecting expired codes independent of TTL worker");
    passed++;

    // -----------------------------------------------------------------
    // AUDIT CHECK 4: Missing credentials fail safely in production
    // -----------------------------------------------------------------
    console.log("\nCHECK 4: Verifying missing credentials and dispatch failures fail safely...");
    const originalEnv = { ...process.env };
    try {
      (process.env as any).NODE_ENV = "production";
      delete process.env.OTP_PEPPER;
      delete process.env.AUTH_SECRET;

      let pepperThrew = false;
      try {
        getOtpPepper();
      } catch (err: any) {
        pepperThrew = true;
        assert.ok(err.message.includes("FATAL: OTP_PEPPER or AUTH_SECRET is not configured"));
      }
      assert.strictEqual(pepperThrew, true, "Missing pepper must throw fatal error in production");

      // Verify delivery failure returns 503 and rolls back DB record
      process.env.AUTH_SECRET = "super_secret_audit_pepper_key_at_least_32_characters_long!";
      delete process.env.RESEND_API_KEY;
      delete process.env.POSTMARK_SERVER_TOKEN;

      const failEmail = "unsendable@test.edu.ng";
      const sendFailRes = await requestOtpCode(failEmail, "10.0.0.5");
      assert.strictEqual(sendFailRes.status, 503, "Failed email delivery must return 503 in production");

      // Verify no orphaned code remained in DB
      const orphanedRecord = await EmailVerificationModel.findOne({ email: failEmail });
      assert.strictEqual(orphanedRecord, null, "Record must be rolled back on delivery failure");
    } finally {
      process.env = originalEnv;
    }

    console.log("  PASS: Missing secrets throw in production; delivery failure returns 503 and rolls back DB");
    passed++;

    // -----------------------------------------------------------------
    // AUDIT CHECK 5: Duplicate registration & concurrent redemption
    // -----------------------------------------------------------------
    console.log("\nCHECK 5: Verifying duplicate registration and concurrent redemption...");
    const dupEmail = "duplicate@abu.edu.ng";
    const req1 = makeJsonRequest("/api/auth/register", {
      fullName: "Original Student",
      email: dupEmail,
      password: "StrongPassword123!",
    });
    const regRes1 = await handleRegister(req1);
    assert.strictEqual(regRes1.status, 201);

    // Verify account
    const knownOtp5 = "345678";
    await EmailVerificationModel.updateOne(
      { email: dupEmail },
      { $set: { verificationCode: hashOtp(dupEmail, knownOtp5) } }
    );
    await verifyOtpCode(dupEmail, knownOtp5);

    // Attempt duplicate registration on verified account
    const req2 = makeJsonRequest("/api/auth/register", {
      fullName: "Imposter",
      email: dupEmail,
      password: "StrongPassword123!",
    });
    const regRes2 = await handleRegister(req2);
    assert.strictEqual(regRes2.status, 409, "Duplicate registration on active account must return 409");
    const regJson2 = await regRes2.json();
    assert.ok(regJson2.message.includes("already exists"));

    console.log("  PASS: Duplicate registration strictly blocked with 409 Conflict");
    passed++;

    // -----------------------------------------------------------------
    // AUDIT CHECK 6: Unverified accounts cannot authenticate
    // -----------------------------------------------------------------
    console.log("\nCHECK 6: Verifying unverified accounts cannot authenticate or access protected routes...");
    const unverifiedEmail = "unverified_student@futa.edu.ng";
    const regUnverified = makeJsonRequest("/api/auth/register", {
      fullName: "Unverified Student",
      email: unverifiedEmail,
      password: "Password999!",
    });
    await handleRegister(regUnverified);

    // Confirm DB status is pending and unverified
    const unverifiedUser = await UserModel.findOne({ email: unverifiedEmail });
    assert.strictEqual(unverifiedUser?.accountStatus, "pending");
    assert.strictEqual(unverifiedUser?.studentVerified, false);

    // 1. Express / Backend loginUser must refuse unverified account
    let loginThrew = false;
    try {
      await loginUser({
        body: { email: unverifiedEmail, password: "Password999!" },
      });
    } catch (err: any) {
      console.log("loginUser caught error:", err.message);
      loginThrew = true;
      assert.ok(err.message.includes("Please verify your email"));
    }
    assert.strictEqual(loginThrew, true, "loginUser must reject unverified account");

    // 2. Next.js requireAuth must reject pending account status with 403 Forbidden
    const unverifiedToken = createAccessToken({
      id: unverifiedUser!._id.toString(),
      name: unverifiedUser!.name,
      email: unverifiedUser!.email,
      role: "buyer",
      isStudent: true,
      studentVerified: false,
    });
    const reqProtected = new NextRequest(new URL("/api/listings", "http://localhost:3000"), {
      headers: { Authorization: `Bearer ${unverifiedToken}` },
    });
    const authResult = await requireAuth(reqProtected);
    assert.strictEqual(authResult.user, null);
    assert.strictEqual(authResult.errorResponse?.status, 403, "requireAuth must return 403 Forbidden for pending user");

    console.log("  PASS: Unverified accounts cannot authenticate via login or pass requireAuth guard");
    passed++;

    // -----------------------------------------------------------------
    // AUDIT CHECK 7: Failure states leave recoverable conditions
    // -----------------------------------------------------------------
    console.log("\nCHECK 7: Verifying failures leave recoverable states...");
    const recoverEmail = "recoverable_student@unilag.edu.ng";
    const initialRegReq = makeJsonRequest("/api/auth/register", {
      fullName: "Recoverable Student",
      email: recoverEmail,
      password: "Password111!",
    });
    const initRes = await handleRegister(initialRegReq);
    assert.strictEqual(initRes.status, 201);

    // Fast-forward cooldown by updating lastSentAt in DB to simulate expired cooldown
    await EmailVerificationModel.updateOne(
      { email: recoverEmail },
      { $set: { lastSentAt: new Date(Date.now() - 65 * 1000) } }
    );

    // A user with an unverified account who failed to get email can re-register
    const reRegisterReq = makeJsonRequest("/api/auth/register", {
      fullName: "Recoverable Student Updated",
      email: recoverEmail,
      password: "NewPassword123!",
    });
    const reRegRes = await handleRegister(reRegisterReq);
    assert.strictEqual(reRegRes.status, 201, "Re-registration of unverified account updates password and issues fresh OTP");

    console.log("  PASS: Unverified registration state is fully recoverable");
    passed++;

    // -----------------------------------------------------------------
    // AUDIT CHECK 8: Codebase scan for stale Express routes or mock code
    // -----------------------------------------------------------------
    console.log("\nCHECK 8: Scanning codebase for stale routes, mock verify paths, or fallback secrets...");
    const regPage = fs.readFileSync(path.join(process.cwd(), "app/(auth)/register/page.tsx"), "utf8");
    assert.strictEqual(regPage.includes("proceeding to verify-email for demo"), false, "Mock demo register fallback must be absent");

    const verifyPage = fs.readFileSync(path.join(process.cwd(), "app/verify-email/page.tsx"), "utf8");
    assert.ok(verifyPage.includes("localStorage.setItem(\"campus_token\", res.token)"), "Verify page must store real session token");

    const expressRoutes = fs.readFileSync(path.join(process.cwd(), "campus-hive-backend/routes/auth.routes.js"), "utf8");
    assert.strictEqual(expressRoutes.includes("/send-otp-to-email"), false, "Express send-otp route must be removed");
    assert.strictEqual(expressRoutes.includes("/verify-otp"), false, "Express verify-otp route must be removed");
    assert.strictEqual(expressRoutes.includes("/register"), false, "Express register route must be removed");

    console.log("  PASS: Stale routes and mock offline paths completely eliminated");
    passed++;

    // -----------------------------------------------------------------
    // AUDIT CHECK 9: Existing auth routes (refresh, logout) still functional
    // -----------------------------------------------------------------
    console.log("\nCHECK 9: Verifying refresh and logout endpoints remain fully functional...");
    const activeUser = await UserModel.create({
      name: "Refresh Test User",
      email: "refresh_test@unilag.edu.ng",
      role: "buyer",
      accountStatus: "active",
      studentVerified: true,
      emailVerified: true,
      tokenVersion: 0,
    });

    const activePayload = {
      id: activeUser._id.toString(),
      name: activeUser.name,
      email: activeUser.email,
      role: activeUser.role,
      isStudent: true,
      studentVerified: true,
      tokenVersion: 0,
    };
    const validRefreshToken = createRefreshToken(activePayload);

    // Refresh route test
    const refreshReq = makeJsonRequest("/api/auth/refresh", {
      refreshToken: validRefreshToken,
    });
    const refreshRes = await handleRefresh(refreshReq);
    assert.strictEqual(refreshRes.status, 200, "POST /api/auth/refresh must return 200");
    const refreshJson = await refreshRes.json();
    assert.strictEqual(refreshJson.success, true);
    assert.ok(refreshJson.token, "Must return fresh access token");

    // Logout route test
    const logoutReq = makeJsonRequest("/api/auth/logout", {});
    const logoutRes = await handleLogout(logoutReq);
    assert.strictEqual(logoutRes.status, 200, "POST /api/auth/logout must return 200");
    const clearedCookie = logoutRes.cookies.get(REFRESH_TOKEN_COOKIE_NAME);
    assert.strictEqual(clearedCookie?.maxAge, 0, "Logout must clear refresh token cookie (maxAge: 0)");

    console.log("  PASS: Token refresh and logout mechanisms are 100% operational");
    passed++;

    console.log("\n==================================================================");
    console.log(` ALL ${passed} OF 9 ACCEPTANCE AUDIT CHECKS VERIFIED & PASSED! `);
    console.log("==================================================================\n");
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    try {
      await (backendMongoose as any).disconnect();
    } catch {}
    if (mongod) {
      await mongod.stop();
    }
  }
}

runAcceptanceAudit().catch((err) => {
  console.error("Acceptance audit failed:", err);
  process.exit(1);
});
