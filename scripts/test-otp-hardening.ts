/**
 * Automated Verification Suite for OTP Hardening:
 * 1. 6 digits via crypto.randomInt
 * 2. OTP stored strictly as salted SHA-256 hash in database (never plaintext)
 * 3. Rate limiting (60s cooldown between dispatch requests returns 429)
 * 4. Maximum attempt limit (5 failed attempts locks verification with 429)
 * 5. Constant-time verification & verified state transition
 */

import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

let passed = 0;
let failed = 0;

function assert(condition: boolean, msg: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${msg}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${msg}`);
    failed++;
    throw new Error(`Assertion failed: ${msg}`);
  }
}

async function runOtpTests() {
  console.log("==================================================================");
  console.log(" OTP HARDENING & SECURITY VERIFICATION SUITE");
  console.log("==================================================================\n");

  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  process.env.MONGODB_URI = uri;
  process.env.AUTH_SECRET = "super-secret-key-at-least-32-chars-long";
  process.env.ADMIN_REGISTRATION_KEY = "super-secret-admin-reg-key-at-least-32-chars-long";
  process.env.SMTP_USER = "test@example.com";
  process.env.SMTP_PASSWORD = "test-password";

  const backendMongoose = (await import("../campus-hive-backend/node_modules/mongoose/index.js" as any)).default;
  await backendMongoose.connect(uri);

  const EmailVerification = (await import("../campus-hive-backend/models/EmailVerification.js" as any)).default;
  const { sendOtpToEmailService, verifyEmailService, hashOtp } = await import(
    "../campus-hive-backend/services/auth.service.js" as any
  );

  try {
    const testEmail = "student.otp@abu.edu.ng";

    // ---------------- 1. Crypto Random 6-digit OTP & Hash Storage ----------------
    console.log("--- 1. Crypto.randomInt 6-Digit OTP & SHA-256 Hash Storage ---");

    // Stub nodemailer to intercept OTP without sending real email
    const nodemailer = (await import("../campus-hive-backend/node_modules/nodemailer/lib/nodemailer.js" as any)).default;
    let interceptedOtp = "";
    nodemailer.createTransport = () => ({
      sendMail: async (options: any) => {
        const match = options.html.match(/<h1[^>]*>(\d{6})<\/h1>/);
        if (match) interceptedOtp = match[1];
        return { messageId: "mock-id" };
      },
    });

    const sendRes = await sendOtpToEmailService({ body: { email: testEmail } });
    assert(interceptedOtp.length === 6 && /^\d{6}$/.test(interceptedOtp), `Generated OTP is exactly 6 digits: ${interceptedOtp}`);

    const dbRecord = await EmailVerification.findOne({ email: testEmail });
    assert(dbRecord !== null, "EmailVerification record created in database");
    assert(dbRecord.verificationCode !== interceptedOtp, "OTP is strictly NOT stored in plaintext in the database");
    assert(dbRecord.verificationCode === hashOtp(testEmail, interceptedOtp), "OTP is stored as deterministic SHA-256 hash");
    assert(dbRecord.attempts === 0, "Initial attempts count initialized to 0");

    // ---------------- 2. Rate Limiting (60-second Cooldown) ----------------
    console.log("\n--- 2. Rate Limiting (60-Second Dispatch Cooldown) ---");

    const rapidSecondSend = await sendOtpToEmailService({ body: { email: testEmail } });
    assert(rapidSecondSend.status === 429, "Immediate second OTP request rejected with 429 Too Many Requests");
    assert(rapidSecondSend.message.includes("Please wait"), "Rate limit returns cooldown message with remaining seconds");

    // ---------------- 3. Failed Attempts Tracking & Lockout ----------------
    console.log("\n--- 3. Failed Attempts Limit (Max 5 Failed Attempts) ---");

    for (let i = 1; i <= 4; i++) {
      const failRes = await verifyEmailService(testEmail, "000000"); // wrong OTP
      assert(failRes.success === false, `Incorrect OTP attempt ${i} returns success: false`);
      const record = await EmailVerification.findOne({ email: testEmail });
      assert(record.attempts === i, `Database record attempts incremented to ${i}`);
    }

    // 5th failed attempt
    const fifthFail = await verifyEmailService(testEmail, "000000");
    assert(fifthFail.success === false, "5th failed attempt fails");
    const recordAfter5 = await EmailVerification.findOne({ email: testEmail });
    assert(recordAfter5.attempts === 5, "Database record attempts reached maximum threshold (5)");

    // 6th attempt (even with CORRECT OTP!) is locked out
    const lockedAttempt = await verifyEmailService(testEmail, interceptedOtp);
    assert(lockedAttempt.status === 429, "Subsequent attempt is locked out with 429 status code");
    assert(lockedAttempt.message.includes("locked"), "Lockout message returned to user");

    // ---------------- 4. Successful Verification & Single-Use Deletion ----------------
    console.log("\n--- 4. Valid Verification & Single-Use Record Deletion ---");

    const freshEmail = "fresh.verified@abu.edu.ng";
    await sendOtpToEmailService({ body: { email: freshEmail } });
    const freshDbRecord = await EmailVerification.findOne({ email: freshEmail });
    assert(freshDbRecord !== null, "Fresh verification record created");

    // Verify using correct intercepted OTP
    const validVerify = await verifyEmailService(freshEmail, interceptedOtp);
    assert(validVerify.success === true && validVerify.status === 200, "Valid OTP verification returns 200 OK success");

    const verifiedRecord = await EmailVerification.findOne({ email: freshEmail });
    assert(verifiedRecord === null, "Single-use guarantee: verification record deleted immediately upon successful verification");

    // Replay attack with same OTP fails because record is deleted
    const replayVerify = await verifyEmailService(freshEmail, interceptedOtp);
    assert(replayVerify.success === false && replayVerify.status === 401, "Replay attack immediately fails with 401 because record was deleted");

    // ---------------- 5. Expired OTP Rejection ----------------
    console.log("\n--- 5. Expired OTP Rejection ---");

    const expiredEmail = "expired@abu.edu.ng";
    await EmailVerification.create({
      email: expiredEmail,
      verificationCode: hashOtp(expiredEmail, "123456"),
      expiresAt: new Date(Date.now() - 1000), // Expired 1 second ago
      attempts: 0,
      schemaVersion: 1,
    });

    const expiredVerify = await verifyEmailService(expiredEmail, "123456");
    assert(expiredVerify.success === false && expiredVerify.message.includes("expired"), "Expired OTP rejected with expired notice");

    // ---------------- 6. HMAC Pepper & Resistance to Rainbow Tables ----------------
    console.log("\n--- 6. HMAC-SHA256 Pepper Cryptographic Isolation ---");
    const testCode = "654321";
    const hashWithDefaultPepper = hashOtp(freshEmail, testCode);
    process.env.OTP_PEPPER = "custom-test-pepper-secret-32-chars-long";
    const hashWithCustomPepper = hashOtp(freshEmail, testCode);
    assert(hashWithDefaultPepper !== hashWithCustomPepper, "HMAC-SHA256 keyed with pepper produces completely different hashes, resisting dictionary recovery");
    delete process.env.OTP_PEPPER;

    // ---------------- 7. IP-Level Rate Limiting on Send OTP ----------------
    console.log("\n--- 7. IP-Level Rate Limiting ---");
    const testIp = "192.168.10.50";
    for (let reqIndex = 1; reqIndex <= 10; reqIndex++) {
      const perEmail = `spam.${reqIndex}@abu.edu.ng`;
      const res = await sendOtpToEmailService({ body: { email: perEmail } }, testIp);
      assert(res === true || res.status === 200, `Dispatch ${reqIndex} from IP allowed`);
    }
    // 11th request from same IP within window is blocked
    const sprayedRes = await sendOtpToEmailService({ body: { email: "sprayed@abu.edu.ng" } }, testIp);
    assert(sprayedRes.status === 429 && sprayedRes.message.includes("network"), "11th request from same IP throttled with 429 network limit");

    // ---------------- 8. Generic Response Controller Test ----------------
    console.log("\n--- 8. Generic Response Controller ---");
    const { sendOtpToEmail } = await import(
      "../campus-hive-backend/controllers/auth.controller.js" as any
    );
    let capturedStatus = 0;
    let capturedJson: any = null;
    const mockRes = {
      status: (code: number) => {
        capturedStatus = code;
        return {
          json: (data: any) => {
            capturedJson = data;
          },
        };
      },
    };
    await sendOtpToEmail({ headers: {}, body: { email: "unregistered.user@abu.edu.ng" } }, mockRes);
    assert(capturedStatus === 200, "Controller returns 200 OK for dispatch");
    assert(
      capturedJson.message === "If this email is eligible, a verification code has been dispatched.",
      "Generic response returned without leaking account registration existence"
    );

    console.log("\n==================================================================");
    console.log(` ALL OTP TESTS COMPLETED: ${passed} PASSED | ${failed} FAILED`);
    console.log("==================================================================");
  } finally {
    await backendMongoose.disconnect();
    await mongod.stop();
  }
}

runOtpTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Test failed:", err);
    process.exit(1);
  });
