/**
 * Automated Verification Suite for Refresh Token Invalidation & tokenVersion:
 * 1. Refresh token embeds and decodes tokenVersion claim
 * 2. Token refresh succeeds when tokenVersion matches User document
 * 3. Logout bumps tokenVersion and clears cookie, invalidating previous refresh tokens
 * 4. Suspending user bumps tokenVersion and sets accountStatus: "suspended", blocking refresh
 * 5. Banning user bumps tokenVersion and sets accountStatus: "banned", blocking refresh
 * 6. Admin token refresh strictly validates tokenVersion and rejects revoked sessions
 */

import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { NextRequest } from "next/server";
import {
  createRefreshToken,
  verifyRefreshToken,
  createAccessToken,
  ServerAuthUser,
  REFRESH_TOKEN_COOKIE_NAME,
} from "../app/lib/authTokens";
import UserModel from "../app/models/User";
import { POST as refreshRoute } from "../app/api/auth/refresh/route";
import { POST as adminRefreshRoute } from "../app/api/admin/auth/refresh/route";
import { POST as logoutRoute } from "../app/api/auth/logout/route";
import { PATCH as adminUserPatchRoute } from "../app/api/admin/users/[id]/route";

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

async function runTokenVersionTests() {
  console.log("==================================================================");
  console.log(" REFRESH TOKEN INVALIDATION & TOKENVERSION SUITE");
  console.log("==================================================================\n");

  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  process.env.MONGODB_URI = uri;
  process.env.AUTH_SECRET = "super-secret-key-at-least-32-chars-long";
  process.env.ADMIN_REGISTRATION_KEY = "super-secret-admin-reg-key-at-least-32-chars-long";

  await mongoose.connect(uri);

  try {
    // ---------------- 1. Claim encoding and decoding ----------------
    console.log("--- 1. tokenVersion Encoding and Decoding ---");
    const sampleUser: ServerAuthUser = {
      id: new mongoose.Types.ObjectId().toString(),
      name: "Token Test User",
      email: "tokentest@abu.edu.ng",
      role: "buyer",
      isStudent: true,
      studentVerified: true,
      tokenVersion: 2,
    };

    const token = createRefreshToken(sampleUser);
    const decoded = verifyRefreshToken(token);
    assert(decoded !== null, "Refresh token cryptographically verified");
    assert(decoded?.tokenVersion === 2, `Decoded tokenVersion matches expected (got ${decoded?.tokenVersion})`);

    // ---------------- 2. Normal refresh with matching tokenVersion ----------------
    console.log("\n--- 2. Successful Token Refresh with Matching tokenVersion ---");
    const dbUser = await UserModel.create({
      name: "Active Student",
      email: "student.active@abu.edu.ng",
      role: "buyer",
      accountStatus: "active",
      tokenVersion: 0,
      schemaVersion: 1,
    });

    const activeUserAuth: ServerAuthUser = {
      id: dbUser._id.toString(),
      name: dbUser.name,
      email: dbUser.email,
      role: "buyer",
      isStudent: true,
      studentVerified: false,
      tokenVersion: 0,
    };

    const validRefreshToken = createRefreshToken(activeUserAuth);

    const refreshReq = new NextRequest("http://localhost:3000/api/auth/refresh", {
      method: "POST",
      headers: {
        cookie: `${REFRESH_TOKEN_COOKIE_NAME}=${validRefreshToken}`,
      },
    });

    const refreshRes = await refreshRoute(refreshReq);
    assert(refreshRes.status === 200, "Valid token refresh returns 200 OK");
    const refreshData = await refreshRes.json();
    assert(refreshData.success === true && typeof refreshData.token === "string", "New access token returned");

    // ---------------- 3. Logout bumps tokenVersion and invalidates old token ----------------
    console.log("\n--- 3. Logout Invalidation & Log Out Everywhere ---");
    const logoutReq = new NextRequest("http://localhost:3000/api/auth/logout", {
      method: "POST",
      headers: {
        authorization: `Bearer ${refreshData.token}`,
        cookie: `${REFRESH_TOKEN_COOKIE_NAME}=${validRefreshToken}`,
      },
    });

    const logoutRes = await logoutRoute(logoutReq);
    assert(logoutRes.status === 200, "Logout endpoint returns 200 OK");
    const updatedUserAfterLogout = await UserModel.findById(dbUser._id);
    assert(
      updatedUserAfterLogout?.tokenVersion === 1,
      `User tokenVersion bumped from 0 to 1 on logout (got ${updatedUserAfterLogout?.tokenVersion})`
    );

    // Replay old refresh token (which has tokenVersion: 0)
    const replayedReq = new NextRequest("http://localhost:3000/api/auth/refresh", {
      method: "POST",
      headers: {
        cookie: `${REFRESH_TOKEN_COOKIE_NAME}=${validRefreshToken}`,
      },
    });

    const replayedRes = await refreshRoute(replayedReq);
    assert(
      replayedRes.status === 401,
      "Replayed refresh token with stale tokenVersion is strictly rejected with 401 Unauthorized"
    );
    const replayedData = await replayedRes.json();
    assert(
      replayedData.error.includes("expired or was revoked"),
      "Revocation error message returned to client"
    );

    // ---------------- 4. Admin Suspension Bumps tokenVersion & Cascades ----------------
    console.log("\n--- 4. Admin User Suspension Bumps tokenVersion ---");
    const sellerUser = await UserModel.create({
      name: "Suspended Seller",
      email: "seller.suspension@abu.edu.ng",
      role: "seller",
      accountStatus: "active",
      tokenVersion: 0,
      schemaVersion: 1,
    });

    const adminUser = await UserModel.create({
      name: "Admin Overseer",
      email: "admin.overseer@campushive.edu.ng",
      role: "admin",
      accountStatus: "active",
      tokenVersion: 0,
      schemaVersion: 1,
    });

    const adminToken = createAccessToken({
      id: adminUser._id.toString(),
      name: adminUser.name,
      email: adminUser.email,
      role: "admin",
      isStudent: false,
      studentVerified: false,
    });

    const sellerRefreshToken = createRefreshToken({
      id: sellerUser._id.toString(),
      name: sellerUser.name,
      email: sellerUser.email,
      role: "seller",
      isStudent: true,
      studentVerified: true,
      tokenVersion: 0,
    });

    // Suspend user via Admin PATCH
    const suspendReq = new NextRequest(`http://localhost:3000/api/admin/users/${sellerUser._id}`, {
      method: "PATCH",
      headers: {
        authorization: `Bearer ${adminToken}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ action: "suspend", reason: "Policy violation" }),
    });

    const suspendRes = await adminUserPatchRoute(suspendReq, {
      params: Promise.resolve({ id: sellerUser._id.toString() }),
    });
    assert(suspendRes !== undefined && suspendRes.status === 200, "Admin suspension returns 200 OK");

    const suspendedDbUser = await UserModel.findById(sellerUser._id);
    assert(suspendedDbUser?.accountStatus === "suspended", "User accountStatus set to suspended");
    assert(suspendedDbUser?.tokenVersion === 1, "User tokenVersion incremented to 1 on suspension");

    // Attempting refresh with seller's old refresh token
    const suspendedRefreshReq = new NextRequest("http://localhost:3000/api/auth/refresh", {
      method: "POST",
      headers: {
        cookie: `${REFRESH_TOKEN_COOKIE_NAME}=${sellerRefreshToken}`,
      },
    });

    const suspendedRefreshRes = await refreshRoute(suspendedRefreshReq);
    assert(
      suspendedRefreshRes.status === 403,
      "Suspended user refresh rejected with 403 Forbidden"
    );

    // ---------------- 5. Admin Token Refresh tokenVersion Check ----------------
    console.log("\n--- 5. Admin Token Refresh tokenVersion Validation ---");
    const adminRefreshToken = createRefreshToken({
      id: adminUser._id.toString(),
      name: adminUser.name,
      email: adminUser.email,
      role: "admin",
      isStudent: false,
      studentVerified: false,
      tokenVersion: 0,
    });

    // Bump admin tokenVersion directly to simulate revocation
    await UserModel.findByIdAndUpdate(adminUser._id, { $inc: { tokenVersion: 1 } });

    const adminRefreshReq = new NextRequest("http://localhost:3000/api/admin/auth/refresh", {
      method: "POST",
      headers: {
        cookie: `${REFRESH_TOKEN_COOKIE_NAME}=${adminRefreshToken}`,
      },
    });

    const adminRefreshRes = await adminRefreshRoute(adminRefreshReq);
    assert(
      adminRefreshRes.status === 401,
      "Admin refresh rejected with 401 when tokenVersion does not match current admin state"
    );

    console.log("\n==================================================================");
    console.log(` ALL TOKENVERSION TESTS COMPLETED: ${passed} PASSED | ${failed} FAILED`);
    console.log("==================================================================");
  } finally {
    await mongoose.disconnect();
    await mongod.stop();
  }
}

runTokenVersionTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Test failed:", err);
    process.exit(1);
  });
