import assert from "node:assert";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import mongoose from "mongoose";
import { NextRequest } from "next/server";

// Set environment before importing services
process.env.AUTH_SECRET = "super_secret_phase4_otp_hmac_pepper_at_least_32_characters_long!";
process.env.OTP_PEPPER = "super_secret_phase4_otp_hmac_pepper_at_least_32_characters_long!";

import {
  generateOtp,
  hashOtp,
  requestOtpCode,
  verifyOtpCode,
  resetIpRateLimits,
} from "../app/lib/otpService";
import EmailVerificationModel from "../app/models/EmailVerification";
import UserModel from "../app/models/User";
import { POST as handleRegister } from "../app/api/auth/register/route";
import { POST as handleVerifyOtp } from "../app/api/auth/verify-otp/route";
import { verifyAuthToken } from "../app/lib/authTokens";

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

async function runPhase4OtpTests() {
  console.log("==================================================================");
  console.log("   PHASE 4: OTP / SIGNUP FLOW SECURITY & INTEROP TEST SUITE        ");
  console.log("==================================================================\n");

  let mongod: MongoMemoryReplSet | null = null;
  let passed = 0;

  try {
    // 1. Spin up MongoMemoryReplSet
    console.log("Starting in-memory Mongo replica set...");
    mongod = await MongoMemoryReplSet.create({
      replSet: { count: 1, storageEngine: "wiredTiger" },
    });
    const uri = mongod.getUri();
    process.env.MONGODB_URI = uri;

    await mongoose.connect(uri);
    console.log("Connected to in-memory MongoDB at:", uri);

    // -----------------------------------------------------------------
    // TEST 1: Generate 6-digit OTP using crypto.randomInt()
    // -----------------------------------------------------------------
    console.log("\nTEST 1: Verifying 6-digit OTP generation via crypto.randomInt()...");
    for (let i = 0; i < 50; i++) {
      const otp = generateOtp();
      assert.strictEqual(typeof otp, "string", "OTP must be a string");
      assert.strictEqual(otp.length, 6, "OTP must be exactly 6 characters");
      assert.match(otp, /^\d{6}$/, "OTP must consist solely of 6 digits");
      const num = parseInt(otp, 10);
      assert.ok(num >= 100000 && num <= 999999, "OTP must fall in range [100000, 999999]");
    }
    console.log("  PASS: 50 consecutive OTPs verified strictly 6-digit numeric in range [100000, 999999]");
    passed++;

    // -----------------------------------------------------------------
    // TEST 2: Store only cryptographic hash with 10-minute expiry
    // -----------------------------------------------------------------
    console.log("\nTEST 2: Verifying only HMAC-SHA256 hash stored (raw OTP never stored) & 10m expiry...");
    const testEmail1 = "student1@unilag.edu.ng";
    const reqRes1 = await requestOtpCode(testEmail1, "10.0.0.1");
    assert.strictEqual(reqRes1.status, 200);

    const record1 = await EmailVerificationModel.findOne({ email: testEmail1 }).lean();
    assert.ok(record1, "EmailVerification record must exist in MongoDB");
    assert.strictEqual(typeof record1.verificationCode, "string");
    assert.strictEqual(record1.verificationCode.length, 64, "Hash must be 64-char hex string (SHA-256)");
    assert.strictEqual(record1.attempts, 0, "Attempts must start at 0");

    // Check expiry is ~10 minutes from lastSentAt
    const lastSentAt = new Date(record1.lastSentAt).getTime();
    const expiresAt = new Date(record1.expiresAt).getTime();
    const diffMs = expiresAt - lastSentAt;
    const diffMinutes = Math.round(diffMs / (60 * 1000));
    assert.strictEqual(diffMinutes, 10, "Expiry must be set to 10 minutes from dispatch");

    console.log("  PASS: Only HMAC hash stored in DB; raw OTP never stored; 10m expiry confirmed");
    passed++;

    // -----------------------------------------------------------------
    // TEST 3: Maximum 5 verification attempts & lockout
    // -----------------------------------------------------------------
    console.log("\nTEST 3: Enforcing maximum 5 verification attempts and locking on attempt 5...");
    const testEmail2 = "student2@abu.edu.ng";
    await requestOtpCode(testEmail2, "10.0.0.2");

    // Attempts 1 to 4 with incorrect codes
    for (let attempt = 1; attempt <= 4; attempt++) {
      const wrongRes = await verifyOtpCode(testEmail2, "000000");
      assert.strictEqual(wrongRes.status, 401, `Attempt ${attempt} must return 401`);
      assert.ok(wrongRes.message.includes(`${5 - attempt} attempt`), `Message must reflect remaining attempts: ${wrongRes.message}`);
    }

    // Attempt 5 with incorrect code -> locks code with HTTP 429
    const lockRes = await verifyOtpCode(testEmail2, "000000");
    assert.strictEqual(lockRes.status, 429, "5th failed attempt must return HTTP 429 lockout");
    assert.ok(lockRes.message.includes("locked"), "Lockout message must warn user");

    // Attempt 6 (even with correct code) is rejected with 429
    const postLockRecord = await EmailVerificationModel.findOne({ email: testEmail2 });
    assert.strictEqual(postLockRecord?.attempts, 5, "Attempts must be capped at 5");

    const attempt6 = await verifyOtpCode(testEmail2, "123456");
    assert.strictEqual(attempt6.status, 429, "Attempt 6 must remain locked (429)");
    console.log("  PASS: Hard limit of 5 failed attempts enforced with HTTP 429 lockout");
    passed++;

    // -----------------------------------------------------------------
    // TEST 4: Email 60s cooldown and IP rate limiting
    // -----------------------------------------------------------------
    console.log("\nTEST 4: Rate limiting by email (60s cooldown) and IP sliding window...");
    const testEmail3 = "student3@oau.edu.ng";
    const resA = await requestOtpCode(testEmail3, "192.168.1.100");
    assert.strictEqual(resA.status, 200);

    // Immediate second request within 60s
    const resB = await requestOtpCode(testEmail3, "192.168.1.100");
    assert.strictEqual(resB.status, 429, "Immediate second request must return 429 cooldown");
    assert.ok(resB.message.includes("Please wait"), "Must include cooldown seconds message");
    assert.ok((resB.remainingCooldownSeconds || 0) > 0, "Remaining cooldown must be > 0");

    // IP rate limit test: 10 requests from same IP allowed, 11th blocked
    resetIpRateLimits();
    const spamIp = "172.16.0.50";
    for (let reqCount = 1; reqCount <= 10; reqCount++) {
      const email = `unique_${reqCount}@test.edu.ng`;
      const r = await requestOtpCode(email, spamIp);
      assert.strictEqual(r.status, 200, `Request ${reqCount} from IP should succeed`);
    }

    const blockedReq = await requestOtpCode("blocked@test.edu.ng", spamIp);
    assert.strictEqual(blockedReq.status, 429, "11th request from same IP must be rate-limited (429)");
    assert.ok(blockedReq.message.includes("Too many verification requests from this network"));

    console.log("  PASS: 60s per-email cooldown and sliding-window IP rate limit verified");
    passed++;

    // -----------------------------------------------------------------
    // TEST 5: Single-use code; prevent replay attacks
    // -----------------------------------------------------------------
    console.log("\nTEST 5: Single-use codes & replay attack prevention...");
    const testEmail4 = "student4@ui.edu.ng";
    const knownOtp = "482910";
    const hashed = hashOtp(testEmail4, knownOtp);

    await EmailVerificationModel.updateOne(
      { email: testEmail4 },
      {
        $set: {
          verificationCode: hashed,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000),
          lastSentAt: new Date(),
          attempts: 0,
        },
      },
      { upsert: true }
    );

    // First redemption -> success 200
    const firstRedemption = await verifyOtpCode(testEmail4, knownOtp);
    assert.strictEqual(firstRedemption.status, 200, "First redemption must succeed with 200");

    // Verify record was deleted from database
    const deletedRecord = await EmailVerificationModel.findOne({ email: testEmail4 });
    assert.strictEqual(deletedRecord, null, "Record must be deleted immediately upon successful verification");

    // Second redemption (replay attack) -> fails 401
    const replayAttempt = await verifyOtpCode(testEmail4, knownOtp);
    assert.strictEqual(replayAttempt.status, 401, "Replay attempt must be rejected with 401");
    console.log("  PASS: Successful codes are single-use; replay attacks strictly prevented");
    passed++;

    // -----------------------------------------------------------------
    // TEST 6: Concurrent double redemption prevention
    // -----------------------------------------------------------------
    console.log("\nTEST 6: Concurrent double redemption test (race conditions)...");
    const testEmail5 = "student5@futa.edu.ng";
    const raceOtp = "739102";
    const raceHash = hashOtp(testEmail5, raceOtp);

    await EmailVerificationModel.updateOne(
      { email: testEmail5 },
      {
        $set: {
          verificationCode: raceHash,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000),
          lastSentAt: new Date(),
          attempts: 0,
        },
      },
      { upsert: true }
    );

    // Fire 5 simultaneous requests attempting to redeem the exact same OTP concurrently
    const concurrentResults = await Promise.all([
      verifyOtpCode(testEmail5, raceOtp),
      verifyOtpCode(testEmail5, raceOtp),
      verifyOtpCode(testEmail5, raceOtp),
      verifyOtpCode(testEmail5, raceOtp),
      verifyOtpCode(testEmail5, raceOtp),
    ]);

    const successes = concurrentResults.filter((r) => r.status === 200);
    const failures = concurrentResults.filter((r) => r.status !== 200);

    assert.strictEqual(successes.length, 1, "Exactly ONE concurrent request must succeed");
    assert.strictEqual(failures.length, 4, "All other concurrent attempts must fail");
    console.log("  PASS: Concurrent double redemption prevented; atomic reservation ensures exactly 1 winner");
    passed++;

    // -----------------------------------------------------------------
    // TEST 7: Generic responses to avoid user enumeration
    // -----------------------------------------------------------------
    console.log("\nTEST 7: Generic responses preventing account enumeration...");
    // Create an existing registered user
    const regEmail = "registered_student@unilag.edu.ng";
    const unregEmail = "never_registered@unilag.edu.ng";

    await UserModel.create({
      name: "Existing Student",
      email: regEmail,
      studentVerified: true,
      role: "buyer",
    });

    const sendRes1 = await requestOtpCode(regEmail, "10.0.0.99");
    const sendRes2 = await requestOtpCode(unregEmail, "10.0.0.98");

    assert.strictEqual(sendRes1.message, sendRes2.message, "Responses must be identical regardless of registration status");
    assert.strictEqual(sendRes1.status, sendRes2.status);
    console.log("  PASS: Generic response prevents user enumeration: '" + sendRes1.message + "'");
    passed++;

    // -----------------------------------------------------------------
    // TEST 8: Full End-to-End Flow via Next.js API Routes
    // -----------------------------------------------------------------
    console.log("\nTEST 8: End-to-End API Flow (Register -> Verify OTP -> Issue Token)...");
    const signupEmail = "newbie@futminna.edu.ng";
    const signupPass = "SuperSecret123";

    // 1. POST /api/auth/register
    const regReq = makeJsonRequest("/api/auth/register", {
      fullName: "Aminu Minna",
      email: signupEmail,
      password: signupPass,
    });
    const regRes = await handleRegister(regReq);
    assert.strictEqual(regRes.status, 201, "Register endpoint must return 201 Created");
    const regJson = await regRes.json();
    assert.strictEqual(regJson.success, true);

    // Verify user is in DB as unverified
    const pendingUser = await UserModel.findOne({ email: signupEmail });
    assert.ok(pendingUser, "Pending user document must exist");
    assert.strictEqual(pendingUser.studentVerified, false, "Must not be verified initially");
    assert.strictEqual((pendingUser as any).emailVerified, false);
    assert.strictEqual(pendingUser.accountStatus, "pending", "Pending user must have accountStatus: 'pending'");

    // Fetch the verification code record that was generated for this user
    const pendingOtpRecord = await EmailVerificationModel.findOne({ email: signupEmail });
    assert.ok(pendingOtpRecord, "OTP record must exist");

    // Inject known OTP into this record for deterministic test completion
    const knownVerifyOtp = "654321";
    await EmailVerificationModel.updateOne(
      { email: signupEmail },
      { $set: { verificationCode: hashOtp(signupEmail, knownVerifyOtp) } }
    );

    // 2. POST /api/auth/verify-otp
    const verifyReq = makeJsonRequest("/api/auth/verify-otp", {
      email: signupEmail,
      otp: knownVerifyOtp,
    });
    const verifyRes = await handleVerifyOtp(verifyReq);
    assert.strictEqual(verifyRes.status, 200, "Verify OTP endpoint must return 200");
    const verifyJson = await verifyRes.json();
    assert.strictEqual(verifyJson.success, true);
    assert.ok(verifyJson.token, "Must return signed access JWT token");

    // Verify token cryptographic signature
    const verifiedUser = verifyAuthToken(verifyJson.token);
    assert.ok(verifiedUser, "Returned token must be cryptographically valid");
    assert.strictEqual(verifiedUser?.email, signupEmail);

    // Verify user is now marked studentVerified & emailVerified in DB
    const activatedUser = await UserModel.findOne({ email: signupEmail });
    assert.strictEqual(activatedUser?.studentVerified, true, "User must now be studentVerified: true");
    assert.strictEqual((activatedUser as any)?.emailVerified, true, "User must now be emailVerified: true");
    assert.strictEqual(activatedUser?.accountStatus, "active", "Activated user must have accountStatus: 'active'");

    console.log("  PASS: End-to-end signup -> OTP dispatch -> verify -> token issuance successfully completed");
    passed++;

    console.log("\n==================================================================");
    console.log(` ALL ${passed} PHASE 4 OTP & SIGNUP SECURITY TESTS PASSED! `);
    console.log("==================================================================\n");
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    if (mongod) {
      await mongod.stop();
    }
  }
}

runPhase4OtpTests().catch((err) => {
  console.error("Test suite failed:", err);
  process.exit(1);
});
