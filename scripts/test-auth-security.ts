import { NextRequest } from "next/server";
import {
  createAuthToken,
  createAccessToken,
  createRefreshToken,
  verifyAuthToken,
  verifyRefreshToken,
  ACCESS_TOKEN_EXPIRY_SECONDS,
  REFRESH_TOKEN_EXPIRY_SECONDS,
  REFRESH_TOKEN_COOKIE_NAME,
  getRefreshTokenCookieOptions,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
  getRefreshTokenFromRequest,
  AUTH_ISSUER,
  AUTH_AUDIENCE,
  getAuthSecret,
} from "../app/lib/authTokens";
import { getServerAuthUser, requireAuth, requireAdmin, requireParticipant } from "../app/lib/authServer";
import { GET as getAdminOverview } from "../app/api/admin/overview/route";
import { POST as adminSignIn } from "../app/api/admin/auth/signin/route";
import { POST as adminSignUp, constantTimeKeyCompare, _resetRateLimitForTesting, GENERIC_ADMIN_REG_ERROR } from "../app/api/admin/auth/signup/route";
import { GET as adminMe } from "../app/api/admin/auth/me/route";
import { POST as authRefresh } from "../app/api/auth/refresh/route";
import { POST as adminAuthRefresh } from "../app/api/admin/auth/refresh/route";
import { POST as authLogout } from "../app/api/auth/logout/route";
import { GET as getConversations } from "../app/api/messages/conversations/route";
import { GET as getConversationDetail } from "../app/api/messages/conversations/[id]/route";
import { POST as postMessage } from "../app/api/messages/conversations/[id]/messages/route";
import { PATCH as patchOffers } from "../app/api/messages/conversations/[id]/offers/route";
import { PATCH as patchDeal } from "../app/api/messages/conversations/[id]/deal/route";
import { POST as postReview } from "../app/api/messages/conversations/[id]/reviews/route";
import { PATCH as patchListing, DELETE as deleteListing } from "../app/api/listings/[id]/route";
import { PATCH as patchStore, DELETE as deleteStore } from "../app/api/stores/[id]/route";
import { POST as postStoreListing, DELETE as deleteStoreListing } from "../app/api/stores/[id]/listings/route";
import { assertUserOwnsStore } from "../app/lib/authServer";
import StoreModel from "../app/models/Store";
import { createStructuredOffer } from "../app/lib/chatRepository";
import ListingModel from "../app/models/Listing";
import UserModel from "../app/models/User";
import { verifyAuthClaims, generateToken as generateExpressToken } from "../campus-hive-backend/utils/auth.js";
import crypto from "node:crypto";

function toBase64Url(str: string): string {
  return Buffer.from(str)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

async function runAuthSecurityTests() {
  console.log("==================================================================");
  console.log(" CAMPUS HIVE 2.0 — AUTHENTICATION & ADMIN AUTHORIZATION TEST SUITE");
  console.log("==================================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, msg: string) {
    if (condition) {
      console.log(`[PASS] ${msg}`);
      passed++;
    } else {
      console.error(`[FAIL] ${msg}`);
      failed++;
    }
  }

  // 1. Unauthenticated Request
  console.log("--- TEST GROUP 1: Unauthenticated Requests ---");
  {
    const req = new NextRequest("http://localhost:3000/api/admin/overview", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const user = getServerAuthUser(req);
    assert(user === null, "getServerAuthUser returns null when no token provided");

    const authCheck = await requireAuth(req);
    assert(authCheck.user === null, "requireAuth returns null user for unauthenticated request");
    assert(
      authCheck.errorResponse?.status === 401,
      "requireAuth returns 401 Unauthorized response"
    );

    const adminCheck = await requireAdmin(req);
    assert(adminCheck.admin === null, "requireAdmin returns null admin for unauthenticated request");
    assert(
      adminCheck.errorResponse?.status === 401,
      "requireAdmin returns 401 Unauthorized for unauthenticated request"
    );

    const overviewRes = await getAdminOverview(req);
    assert(overviewRes?.status === 401, "Admin overview endpoint responds with 401 Unauthorized");
  }

  // 2. Spoofed Header Attacks
  console.log("\n--- TEST GROUP 2: Spoofed Identity Headers Attack ---");
  {
    const req = new NextRequest("http://localhost:3000/api/admin/overview", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-campus-user-id": "attacker-id",
        "x-campus-user-role": "admin",
        "x-campus-user-email": "attacker@evil.com",
        "x-campus-student-verified": "true",
      },
    });

    const user = getServerAuthUser(req);
    assert(
      user === null,
      "getServerAuthUser strictly ignores spoofed x-campus-user-role/id headers"
    );

    const adminCheck = await requireAdmin(req);
    assert(
      adminCheck.admin === null && adminCheck.errorResponse?.status === 401,
      "requireAdmin rejects spoofed headers with 401 Unauthorized"
    );

    const overviewRes = await getAdminOverview(req);
    assert(
      overviewRes?.status === 401,
      "Admin overview rejects spoofed headers with 401 Unauthorized"
    );
  }

  // 3. Forged Token (Tampered Payload / Invalid Signature)
  console.log("\n--- TEST GROUP 3: Forged Tokens & Tampered Payload ---");
  {
    const legitimateAdminToken = createAuthToken({
      id: "admin-1",
      name: "Real Admin",
      email: "admin@campushive.edu.ng",
      role: "admin",
      isStudent: false,
      studentVerified: false,
    });

    // Attacker modifies the payload to give themselves admin role or changes subject
    const [header, payload, sig] = legitimateAdminToken.split(".");
    const decodedPayload = JSON.parse(Buffer.from(payload, "base64").toString());
    decodedPayload.sub = "attacker-hijacked-id";
    const forgedPayload = toBase64Url(JSON.stringify(decodedPayload));
    const forgedToken = `${header}.${forgedPayload}.${sig}`; // Keep original signature

    const verified = verifyAuthToken(forgedToken);
    assert(verified === null, "verifyAuthToken detects tampered payload and returns null");

    const req = new NextRequest("http://localhost:3000/api/admin/overview", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${forgedToken}`,
        "Content-Type": "application/json",
      },
    });

    const overviewRes = await getAdminOverview(req);
    assert(overviewRes?.status === 401, "API endpoint rejects forged token with 401 Unauthorized");
  }

  // 4. Expired Token
  console.log("\n--- TEST GROUP 4: Expired Tokens ---");
  {
    // Create token that expired 10 seconds ago
    const expiredToken = createAuthToken(
      {
        id: "admin-1",
        name: "Admin",
        email: "admin@campushive.edu.ng",
        role: "admin",
        isStudent: false,
        studentVerified: false,
      },
      -10 // expired in the past
    );

    const verified = verifyAuthToken(expiredToken);
    assert(verified === null, "verifyAuthToken strictly rejects expired token");

    const req = new NextRequest("http://localhost:3000/api/admin/overview", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${expiredToken}`,
        "Content-Type": "application/json",
      },
    });

    const overviewRes = await getAdminOverview(req);
    assert(overviewRes?.status === 401, "Admin overview rejects expired token with 401 Unauthorized");
  }

  // 5. Wrong Issuer & Wrong Audience
  console.log("\n--- TEST GROUP 5: Invalid Issuer / Audience ---");
  {
    const secret = getAuthSecret();
    const now = Math.floor(Date.now() / 1000);

    // Wrong issuer
    const headerStr = toBase64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const badIssPayloadStr = toBase64Url(
      JSON.stringify({
        iss: "evil.rogue-domain.com",
        aud: AUTH_AUDIENCE,
        sub: "admin-1",
        role: "admin",
        iat: now,
        exp: now + 3600,
      })
    );
    const badIssSig = crypto
      .createHmac("sha256", secret)
      .update(`${headerStr}.${badIssPayloadStr}`)
      .digest("base64")
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");
    const badIssToken = `${headerStr}.${badIssPayloadStr}.${badIssSig}`;

    assert(
      verifyAuthToken(badIssToken) === null,
      "verifyAuthToken rejects token with wrong issuer (iss)"
    );

    // Wrong audience
    const badAudPayloadStr = toBase64Url(
      JSON.stringify({
        iss: AUTH_ISSUER,
        aud: "unauthorized-audience",
        sub: "admin-1",
        role: "admin",
        iat: now,
        exp: now + 3600,
      })
    );
    const badAudSig = crypto
      .createHmac("sha256", secret)
      .update(`${headerStr}.${badAudPayloadStr}`)
      .digest("base64")
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");
    const badAudToken = `${headerStr}.${badAudPayloadStr}.${badAudSig}`;

    assert(
      verifyAuthToken(badAudToken) === null,
      "verifyAuthToken rejects token with wrong audience (aud)"
    );
  }

  // 6. Algorithm "None" attack
  console.log("\n--- TEST GROUP 6: Algorithm 'none' Attack ---");
  {
    const headerNone = toBase64Url(JSON.stringify({ alg: "none", typ: "JWT" }));
    const payloadStr = toBase64Url(
      JSON.stringify({
        iss: AUTH_ISSUER,
        aud: AUTH_AUDIENCE,
        sub: "admin-1",
        role: "admin",
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      })
    );
    const algNoneToken = `${headerNone}.${payloadStr}.`;

    assert(
      verifyAuthToken(algNoneToken) === null,
      "verifyAuthToken strictly prevents alg: none bypass attack"
    );

    // Missing sub claim test
    const headerValid = toBase64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const payloadNoSub = toBase64Url(
      JSON.stringify({
        iss: AUTH_ISSUER,
        aud: AUTH_AUDIENCE,
        // sub omitted!
        role: "admin",
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      })
    );
    const secret = getAuthSecret();
    const sigNoSub = crypto
      .createHmac("sha256", secret)
      .update(`${headerValid}.${payloadNoSub}`)
      .digest("base64")
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");
    const noSubToken = `${headerValid}.${payloadNoSub}.${sigNoSub}`;
    assert(
      verifyAuthToken(noSubToken) === null,
      "verifyAuthToken strictly rejects tokens missing the sub claim"
    );
  }

  // 7. Non-Admin User Role Elevation Attempt
  console.log("\n--- TEST GROUP 7: Non-Admin Role Elevation Attempt ---");
  {
    const buyerToken = createAuthToken({
      id: "student-buyer-01",
      name: "Tunde Bello",
      email: "tunde@abu.edu.ng",
      role: "buyer",
      isStudent: true,
      studentVerified: true,
    });

    const req = new NextRequest("http://localhost:3000/api/admin/overview", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${buyerToken}`,
        "Content-Type": "application/json",
      },
    });

    const user = getServerAuthUser(req);
    assert(user !== null && user.role === "buyer", "Authenticated user identity resolves to buyer");

    const authCheck = await requireAuth(req);
    assert(authCheck.user !== null, "requireAuth succeeds for authenticated buyer");

    const adminCheck = await requireAdmin(req);
    assert(
      adminCheck.admin === null && adminCheck.errorResponse?.status === 403,
      "requireAdmin strictly returns 403 Forbidden for non-admin user"
    );

    const overviewRes = await getAdminOverview(req);
    assert(
      overviewRes?.status === 403,
      "Admin overview endpoint returns 403 Forbidden to non-admin user"
    );
  }

  // 8. Legitimate Admin Access
  console.log("\n--- TEST GROUP 8: Valid Cryptographically Signed Admin Token ---");
  {
    const validAdminToken = createAuthToken({
      id: "admin-master-01",
      name: "System Administrator",
      email: "admin@campushive.edu.ng",
      role: "admin",
      isStudent: false,
      studentVerified: false,
    });

    const req = new NextRequest("http://localhost:3000/api/admin/overview", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${validAdminToken}`,
        "Content-Type": "application/json",
      },
    });

    const user = getServerAuthUser(req);
    assert(user !== null && user.role === "admin", "Admin identity resolves successfully");

    const adminCheck = await requireAdmin(req);
    assert(adminCheck.admin?.role === "admin", "requireAdmin allows valid admin");

    const overviewRes = await getAdminOverview(req);
    assert(overviewRes?.status === 200, "Admin overview endpoint responds with 200 OK");
    const data = await overviewRes!.json();
    assert(data.success === true, "Admin overview payload contains success: true");
    assert(typeof data.data?.stats?.registeredUsers === "number", "Registered users metric present in stats");
  }

  // 9. Admin Sign In API
  console.log("\n--- TEST GROUP 9: Dedicated Admin Sign In API Endpoint ---");
  {
    // Test invalid password
    const badLoginReq = new NextRequest("http://localhost:3000/api/admin/auth/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identity: "admin@campushive.edu.ng",
        password: "wrong-password",
      }),
    });
    const badLoginRes = await adminSignIn(badLoginReq);
    assert(
      badLoginRes.status === 401,
      "Admin sign-in rejects incorrect password with 401 Unauthorized"
    );

    // Test valid credentials
    const validPassword = process.env.ADMIN_PASSWORD || "aspireelevation2026";
    const goodLoginReq = new NextRequest("http://localhost:3000/api/admin/auth/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identity: "admin@campushive.edu.ng",
        password: validPassword,
      }),
    });
    const goodLoginRes = await adminSignIn(goodLoginReq);
    assert(goodLoginRes.status === 200, "Admin sign-in accepts valid credentials with 200 OK");
    const loginData = await goodLoginRes.json();
    assert(loginData.success === true, "Sign-in returns success: true");
    assert(typeof loginData.token === "string", "Sign-in issues signed JWT token");

    // Verify issued token
    const verifiedIssuedUser = verifyAuthToken(loginData.token);
    assert(
      verifiedIssuedUser !== null && verifiedIssuedUser.role === "admin",
      "Issued token is verified as authentic admin token"
    );

    // Verify /api/admin/auth/me accepts this token
    const meReq = new NextRequest("http://localhost:3000/api/admin/auth/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${loginData.token}`,
      },
    });
    const meRes = await adminMe(meReq);
    assert(meRes?.status === 200, "/api/admin/auth/me verifies valid admin token");
  }

  // 10. Admin Registration Key Hardening (timingSafeEqual, rate limiting, generic errors, existing admin requirement)
  console.log("\n--- TEST GROUP 10: Admin Registration Key Hardening & Security ---");
  {
    _resetRateLimitForTesting();

    // 1. Constant-time key comparison unit checks
    const keyRef = "8d5d7b74307df7e49fa1f5958b0a7297a8560e547ba6432d";
    assert(
      constantTimeKeyCompare(keyRef, keyRef) === true,
      "constantTimeKeyCompare returns true for matching keys"
    );
    assert(
      constantTimeKeyCompare("different-length-key", keyRef) === false,
      "constantTimeKeyCompare returns false for keys of differing length"
    );
    assert(
      constantTimeKeyCompare(
        "8d5d7b74307df7e49fa1f5958b0a7297a8560e547ba6432e", // last char 'e' vs 'd'
        keyRef
      ) === false,
      "constantTimeKeyCompare returns false for same-length mismatched keys"
    );

    // 2. Generic error message on invalid key
    const badKeyReq = new NextRequest("http://localhost:3000/api/admin/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": "192.168.1.10",
      },
      body: JSON.stringify({
        email: "attacker@campushive.edu.ng",
        username: "attacker",
        adminKey: "wrong-admin-key",
      }),
    });
    const badKeyRes = await adminSignUp(badKeyReq);
    const badKeyData = await badKeyRes.json();
    assert(
      badKeyRes.status === 403,
      "Admin signup rejects invalid adminKey with 403 Forbidden"
    );
    assert(
      badKeyData.error === GENERIC_ADMIN_REG_ERROR,
      "Admin signup returns generic error message on invalid key"
    );

    // 3. Generic error message on missing fields
    const missingFieldReq = new NextRequest("http://localhost:3000/api/admin/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": "192.168.1.10",
      },
      body: JSON.stringify({
        email: "missingkey@campushive.edu.ng",
      }),
    });
    const missingFieldRes = await adminSignUp(missingFieldReq);
    const missingFieldData = await missingFieldRes.json();
    assert(
      missingFieldRes.status === 400 && missingFieldData.error === GENERIC_ADMIN_REG_ERROR,
      "Admin signup returns generic error message on missing fields"
    );

    // 4. Rate limiting enforcement (5 failed attempts maximum per window)
    const rateLimitIp = "192.168.1.99";
    _resetRateLimitForTesting(rateLimitIp);
    for (let i = 0; i < 5; i++) {
      const probeReq = new NextRequest("http://localhost:3000/api/admin/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-forwarded-for": rateLimitIp,
        },
        body: JSON.stringify({
          email: `probe${i}@campushive.edu.ng`,
          username: `probe${i}`,
          adminKey: "bad-key",
        }),
      });
      await adminSignUp(probeReq);
    }

    // 6th attempt should be blocked by rate limiter
    const blockedReq = new NextRequest("http://localhost:3000/api/admin/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": rateLimitIp,
      },
      body: JSON.stringify({
        email: "blocked@campushive.edu.ng",
        username: "blocked",
        adminKey: "bad-key",
      }),
    });
    const blockedRes = await adminSignUp(blockedReq);
    const blockedData = await blockedRes.json();
    assert(
      blockedRes.status === 429,
      "Admin signup returns 429 Too Many Requests after 5 consecutive failures"
    );
    assert(
      blockedData.error === GENERIC_ADMIN_REG_ERROR,
      "Rate limiter returns generic error message"
    );
    _resetRateLimitForTesting(rateLimitIp);

    // 5. Explicit route disabling via DISABLE_ADMIN_SIGNUP
    const originalDisableEnv = process.env.DISABLE_ADMIN_SIGNUP;
    process.env.DISABLE_ADMIN_SIGNUP = "true";
    const disabledReq = new NextRequest("http://localhost:3000/api/admin/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": "10.0.0.1",
      },
      body: JSON.stringify({
        email: "disabled@campushive.edu.ng",
        username: "disabled",
        adminKey: keyRef,
      }),
    });
    const disabledRes = await adminSignUp(disabledReq);
    const disabledData = await disabledRes.json();
    assert(
      disabledRes.status === 403 && disabledData.error === GENERIC_ADMIN_REG_ERROR,
      "Admin signup returns 403 Forbidden with generic error when DISABLE_ADMIN_SIGNUP=true"
    );
    if (originalDisableEnv !== undefined) {
      process.env.DISABLE_ADMIN_SIGNUP = originalDisableEnv;
    } else {
      delete process.env.DISABLE_ADMIN_SIGNUP;
    }
    _resetRateLimitForTesting("10.0.0.1");

    // 6. Existing Admin Session Requirement: Once active admins exist, key-only signup is blocked
    const validKey =
      process.env.ADMIN_REGISTRATION_KEY ||
      "8d5d7b74307df7e49fa1f5958b0a7297a8560e547ba6432d";

    const originalCountDocuments = (UserModel as any).countDocuments;
    const originalFindById = (UserModel as any).findById;
    const originalFindOne = (UserModel as any).findOne;
    const originalCreate = (UserModel as any).create;
    const originalReadyState = UserModel.db?.readyState;

    try {
      // Simulate active DB connection with existing active admins
      (UserModel as any).db = { readyState: 1 };
      (UserModel as any).countDocuments = async () => 1; // 1 active admin already exists
      (UserModel as any).findOne = async () => null;
      (UserModel as any).create = async (doc: any) => ({
        _id: "new-admin-db-01",
        ...doc,
      });

      // 6a. Attempt unauthenticated signup with valid key when admins exist -> blocked
      const unauthWithKeyReq = new NextRequest("http://localhost:3000/api/admin/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-forwarded-for": "10.0.0.2",
        },
        body: JSON.stringify({
          email: "unauth.candidate@campushive.edu.ng",
          username: "unauthcandidate",
          adminKey: validKey,
        }),
      });
      const unauthWithKeyRes = await adminSignUp(unauthWithKeyReq);
      const unauthWithKeyData = await unauthWithKeyRes.json();
      assert(
        unauthWithKeyRes.status === 403,
        "Admin signup blocks unauthenticated key-only signup once existing active admins exist"
      );
      assert(
        unauthWithKeyData.error === GENERIC_ADMIN_REG_ERROR,
        "Blocked signup returns generic error message"
      );

      // 6b. Attempt signup authenticated as regular student/buyer -> blocked
      const studentToken = createAuthToken({
        id: "student-user-01",
        name: "Student",
        email: "student@campushive.edu.ng",
        role: "buyer",
        isStudent: true,
        studentVerified: true,
      });
      (UserModel as any).findById = (id: any) => ({
        select: () => ({
          lean: async () => ({
            _id: id,
            role: "buyer",
            accountStatus: "active",
          }),
        }),
      });
      const studentAttemptReq = new NextRequest("http://localhost:3000/api/admin/auth/signup", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${studentToken}`,
          "Content-Type": "application/json",
          "x-forwarded-for": "10.0.0.3",
        },
        body: JSON.stringify({
          email: "escalation@campushive.edu.ng",
          username: "escalation",
          adminKey: validKey,
        }),
      });
      const studentAttemptRes = await adminSignUp(studentAttemptReq);
      assert(
        studentAttemptRes.status === 403,
        "Admin signup rejects non-admin user attempt even with valid adminKey"
      );

      // 6c. Legitimate authenticated active admin onboard new admin -> succeeds
      const adminToken = createAuthToken({
        id: "active-admin-01",
        name: "Lead Administrator",
        email: "admin@campushive.edu.ng",
        role: "admin",
        isStudent: false,
        studentVerified: false,
      });
      (UserModel as any).findById = (id: any) => ({
        select: () => ({
          lean: async () => ({
            _id: id,
            role: "admin",
            accountStatus: "active",
          }),
        }),
      });
      const adminAuthorizedReq = new NextRequest("http://localhost:3000/api/admin/auth/signup", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${adminToken}`,
          "Content-Type": "application/json",
          "x-forwarded-for": "10.0.0.4",
        },
        body: JSON.stringify({
          email: "newonboarded.admin@campushive.edu.ng",
          username: "newonboardedadmin",
          adminKey: validKey,
        }),
      });
      const adminAuthorizedRes = await adminSignUp(adminAuthorizedReq);
      assert(
        adminAuthorizedRes.status === 201,
        "Admin signup succeeds when authenticated as an active existing administrator"
      );
    } finally {
      (UserModel as any).countDocuments = originalCountDocuments;
      (UserModel as any).findById = originalFindById;
      (UserModel as any).findOne = originalFindOne;
      (UserModel as any).create = originalCreate;
      if (originalReadyState !== undefined) {
        (UserModel as any).db = { readyState: originalReadyState };
      } else {
        delete (UserModel as any).db;
      }
      _resetRateLimitForTesting();
    }

    // 7. Initial Bootstrap Mode (existingAdminCount === 0) allows valid admin key
    const initialKeyReq = new NextRequest("http://localhost:3000/api/admin/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": "10.0.0.5",
      },
      body: JSON.stringify({
        email: "initial.admin@campushive.edu.ng",
        username: "initialadmin",
        adminKey: validKey,
      }),
    });
    const initialKeyRes = await adminSignUp(initialKeyReq);
    assert(
      initialKeyRes.status === 201 || initialKeyRes.status === 200,
      "Initial bootstrap admin creation succeeds with valid key when no admins exist"
    );
  }

  // 11. Chat & Messaging Route Authentication (Zero x-campus-* header trust)
  console.log("\n--- TEST GROUP 11: Chat & Messaging Cryptographic Auth ---");
  {
    const chatUserToken = createAuthToken({
      id: "student-chat-user-01",
      name: "Tunde Bello",
      email: "tunde@abu.edu.ng",
      role: "buyer",
      isStudent: true,
      studentVerified: true,
      campus: "ABU Zaria",
    });

    // Unauthenticated request to conversations
    const unauthReq = new NextRequest("http://localhost:3000/api/messages/conversations");
    const unauthRes = await getConversations(unauthReq);
    assert(
      unauthRes?.status === 401,
      "GET /api/messages/conversations returns 401 Unauthorized when unauthenticated"
    );

    // Spoofed x-campus-user-id header without cryptographic JWT
    const spoofReq = new NextRequest("http://localhost:3000/api/messages/conversations", {
      headers: {
        "x-campus-user-id": "spoofed-user-id",
        "x-campus-user-name": "Spoofed Attacker",
      },
    });
    const spoofRes = await getConversations(spoofReq);
    assert(
      spoofRes?.status === 401,
      "GET /api/messages/conversations rejects spoofed x-campus-user-id with 401"
    );

    // Valid authenticated token resolves genuine user identity
    const validReq = new NextRequest("http://localhost:3000/api/messages/conversations", {
      headers: {
        Authorization: `Bearer ${chatUserToken}`,
        "x-campus-user-id": "attacker-overridden",
      },
    });
    const validRes = await getConversations(validReq);
    assert(
      validRes?.status === 200,
      "GET /api/messages/conversations succeeds with 200 for authenticated user"
    );
    const validData = validRes ? await validRes.json() : {};
    assert(
      validData.currentUser?.id === "student-chat-user-01",
      "currentUser identity strictly resolved from JWT and ignored spoofed header"
    );

    // Unauthenticated detail request
    const unauthDetailReq = new NextRequest("http://localhost:3000/api/messages/conversations/conv-123");
    const unauthDetailRes = await getConversationDetail(unauthDetailReq, {
      params: Promise.resolve({ id: "conv-123" }),
    });
    assert(
      unauthDetailRes?.status === 401,
      "GET /api/messages/conversations/[id] rejects unauthenticated request with 401"
    );

    // Spoofed detail request
    const spoofDetailReq = new NextRequest("http://localhost:3000/api/messages/conversations/conv-123", {
      headers: { "x-campus-user-id": "attacker-id" },
    });
    const spoofDetailRes = await getConversationDetail(spoofDetailReq, {
      params: Promise.resolve({ id: "conv-123" }),
    });
    assert(
      spoofDetailRes?.status === 401,
      "GET /api/messages/conversations/[id] rejects spoofed x-campus-user-id with 401"
    );
  }

  // 12. Express Backend JWT Claims & Transition Window (iss, aud, sub/id)
  console.log("\n--- TEST GROUP 12: Express Backend utils/auth.js Claims ---");
  {
    // Generate token in Express
    const expressUser = {
      _id: "6710abcd1234567890ef0001",
      email: "express-user@campushive.edu.ng",
      role: "student",
    };
    const expressToken = generateExpressToken(expressUser);

    // Verify token using verifyAuthClaims
    const verified = verifyAuthClaims(expressToken);
    assert(
      verified.sub === "6710abcd1234567890ef0001" && verified.id === "6710abcd1234567890ef0001",
      "Express verifyAuthClaims parses sub and id correctly"
    );
    assert(
      verified.iss === AUTH_ISSUER,
      "Express token includes and verifies standard issuer (iss)"
    );
    assert(
      verified.aud === AUTH_AUDIENCE,
      "Express token includes and verifies standard audience (aud)"
    );

    // Cross-Service: Token issued by Next.js verified by Express backend
    const nextToken = createAuthToken({
      id: "6710abcd1234567890ef0002",
      name: "Nextjs User",
      email: "next-user@campushive.edu.ng",
      role: "buyer",
      isStudent: true,
      studentVerified: true,
    });
    const verifiedNextInExpress = verifyAuthClaims(nextToken);
    assert(
      verifiedNextInExpress.sub === "6710abcd1234567890ef0002",
      "Express verifyAuthClaims successfully verifies token generated by Next.js"
    );

    // Transition Window: Legacy token with id only and no sub/iss/aud
    const rawSecret = getAuthSecret();
    const legacyPayload = toBase64Url(JSON.stringify({
      id: "legacy-user-12345",
      role: "buyer",
      exp: Math.floor(Date.now() / 1000) + 3600,
    }));
    const legacyHeader = toBase64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const legacySig = crypto
      .createHmac("sha256", rawSecret)
      .update(`${legacyHeader}.${legacyPayload}`)
      .digest("base64")
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");
    const legacyToken = `${legacyHeader}.${legacyPayload}.${legacySig}`;

    const verifiedLegacy = verifyAuthClaims(legacyToken);
    assert(
      verifiedLegacy.sub === "legacy-user-12345" && verifiedLegacy.id === "legacy-user-12345",
      "Transition window: Express verifyAuthClaims accepts legacy tokens with id only"
    );

    // Invalid Issuer rejection
    const badIssPayload = toBase64Url(JSON.stringify({
      sub: "user-123",
      iss: "malicious-issuer.com",
      aud: AUTH_AUDIENCE,
      exp: Math.floor(Date.now() / 1000) + 3600,
    }));
    const badIssSig = crypto
      .createHmac("sha256", rawSecret)
      .update(`${legacyHeader}.${badIssPayload}`)
      .digest("base64")
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");
    const badIssToken = `${legacyHeader}.${badIssPayload}.${badIssSig}`;
    try {
      verifyAuthClaims(badIssToken);
      assert(false, "Should have rejected token with mismatched issuer");
    } catch (err: any) {
      assert(
        err.message.includes("Invalid token issuer"),
        "Express verifyAuthClaims strictly rejects tokens with invalid iss"
      );
    }

    // Invalid Audience rejection
    const badAudPayload = toBase64Url(JSON.stringify({
      sub: "user-123",
      iss: AUTH_ISSUER,
      aud: "wrong-audience",
      exp: Math.floor(Date.now() / 1000) + 3600,
    }));
    const badAudSig = crypto
      .createHmac("sha256", rawSecret)
      .update(`${legacyHeader}.${badAudPayload}`)
      .digest("base64")
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");
    const badAudToken = `${legacyHeader}.${badAudPayload}.${badAudSig}`;
    try {
      verifyAuthClaims(badAudToken);
      assert(false, "Should have rejected token with mismatched audience");
    } catch (err: any) {
      assert(
        err.message.includes("Invalid token audience"),
        "Express verifyAuthClaims strictly rejects tokens with invalid aud"
      );
    }
  }

  // 15. Real Token from Express Signer Verified in Next.js
  console.log("\n--- TEST GROUP 15: Express Login Token Verified by Next.js ---");
  {
    const expressUser = {
      _id: "6710abcd1234567890ef0001",
      email: "express.student@campushive.edu.ng",
      role: "buyer",
    };
    const realExpressToken = generateExpressToken(expressUser);

    const verifiedInNext = verifyAuthToken(realExpressToken);
    assert(verifiedInNext !== null, "Real token from Express generateToken passes verifyAuthToken");
    assert(
      verifiedInNext?.id === "6710abcd1234567890ef0001",
      "Next.js verifyAuthToken extracts correct user ID from Express token"
    );
    assert(
      verifiedInNext?.email === "express.student@campushive.edu.ng",
      "Next.js verifyAuthToken extracts correct email from Express token"
    );
    assert(
      verifiedInNext?.role === "buyer",
      "Next.js verifyAuthToken extracts correct role from Express token"
    );
  }

  // 16. Live MongoDB Suspended & Banned Account Revocation
  console.log("\n--- TEST GROUP 16: Suspended & Banned Account Immediate Revocation ---");
  {
    try {
      // Simulate suspended account in database
      (UserModel as any).findOne = () => ({
        select: () => ({
          lean: async () => ({
            role: "buyer",
            accountStatus: "suspended",
          }),
        }),
      });

      const suspendedUserToken = createAuthToken({
        id: "suspended-user-99",
        name: "Suspended Student",
        email: "suspended@campushive.edu.ng",
        role: "buyer",
        isStudent: true,
        studentVerified: true,
      });

      const suspendedReq = new NextRequest("http://localhost:3000/api/messages/conversations", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${suspendedUserToken}`,
          "Content-Type": "application/json",
        },
      });

      const suspendedAuth = await requireAuth(suspendedReq);
      assert(
        suspendedAuth.user === null && suspendedAuth.errorResponse?.status === 403,
        "requireAuth immediately rejects suspended user with 403 Forbidden"
      );

      // Simulate banned account in database
      (UserModel as any).findOne = () => ({
        select: () => ({
          lean: async () => ({
            role: "buyer",
            accountStatus: "banned",
          }),
        }),
      });

      const bannedAuth = await requireAuth(suspendedReq);
      assert(
        bannedAuth.user === null && bannedAuth.errorResponse?.status === 403,
        "requireAuth immediately rejects banned user with 403 Forbidden"
      );

      // Simulate inactive/pending account in database
      (UserModel as any).findOne = () => ({
        select: () => ({
          lean: async () => ({
            role: "buyer",
            accountStatus: "pending",
          }),
        }),
      });

      const pendingAuth = await requireAuth(suspendedReq);
      assert(
        pendingAuth.user === null && pendingAuth.errorResponse?.status === 403,
        "requireAuth immediately rejects inactive/pending user with 403 Forbidden"
      );

      // Simulate active account in database
      (UserModel as any).findOne = () => ({
        select: () => ({
          lean: async () => ({
            role: "buyer",
            accountStatus: "active",
          }),
        }),
      });

      const activeAuth = await requireAuth(suspendedReq);
      assert(
        activeAuth.user !== null && activeAuth.errorResponse === undefined,
        "requireAuth accepts user with active accountStatus"
      );
    } finally {
      delete (UserModel as any).findOne;
    }
  }

  // 17. Live MongoDB Demoted Admin Immediate Revocation
  console.log("\n--- TEST GROUP 17: Demoted Admin Immediate Revocation ---");
  {
    try {
      const mockDemotedResult = () => ({
        select: () => ({
          lean: async () => ({
            role: "buyer", // demoted in DB
            accountStatus: "active",
          }),
        }),
      });

      // Token has role: "admin", but database was updated to role: "buyer"
      (UserModel as any).findOne = mockDemotedResult;
      (UserModel as any).findById = mockDemotedResult;

      // Test with valid 24-hex MongoDB ObjectId (triggers findById)
      const demotedAdminTokenObjectId = createAuthToken({
        id: "6710abcd1234567890ef0088",
        name: "Former Administrator",
        email: "former-admin@campushive.edu.ng",
        role: "admin", // Token still has admin claim
        isStudent: false,
        studentVerified: false,
      });

      const demotedReqObjectId = new NextRequest("http://localhost:3000/api/admin/overview", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${demotedAdminTokenObjectId}`,
          "Content-Type": "application/json",
        },
      });

      const demotedAdminCheck = await requireAdmin(demotedReqObjectId);
      assert(
        demotedAdminCheck.admin === null && demotedAdminCheck.errorResponse?.status === 403,
        "requireAdmin immediately revokes access for demoted admin via findById with 403 Forbidden"
      );

      // Test with alphanumeric ID string (triggers findOne by email)
      const demotedAdminTokenString = createAuthToken({
        id: "demoted-admin-88",
        name: "Former Administrator String",
        email: "former-admin-string@campushive.edu.ng",
        role: "admin",
        isStudent: false,
        studentVerified: false,
      });

      const demotedReqString = new NextRequest("http://localhost:3000/api/admin/overview", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${demotedAdminTokenString}`,
          "Content-Type": "application/json",
        },
      });

      const demotedAdminStringCheck = await requireAdmin(demotedReqString);
      assert(
        demotedAdminStringCheck.admin === null && demotedAdminStringCheck.errorResponse?.status === 403,
        "requireAdmin immediately revokes access for demoted admin via findOne with 403 Forbidden"
      );

      // Also verify when admin account is suspended
      const mockSuspendedAdmin = () => ({
        select: () => ({
          lean: async () => ({
            role: "admin",
            accountStatus: "suspended",
          }),
        }),
      });
      (UserModel as any).findOne = mockSuspendedAdmin;
      (UserModel as any).findById = mockSuspendedAdmin;

      const suspendedAdminCheck = await requireAdmin(demotedReqObjectId);
      assert(
        suspendedAdminCheck.admin === null && suspendedAdminCheck.errorResponse?.status === 403,
        "requireAdmin rejects suspended admin with 403 Forbidden"
      );
    } finally {
      delete (UserModel as any).findOne;
      delete (UserModel as any).findById;
    }
  }

  // 18. Conversation Membership Authorization (requireParticipant)
  console.log("\n--- TEST GROUP 18: Conversation Membership Authorization ---");
  {
    // Intruder attempts to access conv-tunde-calculator (participants: seller-tunde-bello & user-current-student)
    const intruderToken = createAuthToken({
      id: "intruder-user-999",
      name: "Malicious Snooper",
      email: "intruder@evil.com",
      role: "buyer",
      isStudent: true,
      studentVerified: true,
    });

    const intruderReq = new NextRequest(
      "http://localhost:3000/api/messages/conversations/conv-tunde-calculator",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${intruderToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const participantCheck = await requireParticipant(intruderReq, "conv-tunde-calculator");
    assert(
      participantCheck.errorResponse?.status === 404,
      "requireParticipant rejects non-participant with 404 to prevent ID enumeration"
    );

    const intruderDetailRes = await getConversationDetail(intruderReq, {
      params: Promise.resolve({ id: "conv-tunde-calculator" }),
    });
    assert(
      intruderDetailRes?.status === 404,
      "Conversation GET endpoint returns 404 to non-participant"
    );

    // Intruder attempts to POST message to conversation they do not belong to
    const intruderPostReq = new NextRequest(
      "http://localhost:3000/api/messages/conversations/conv-tunde-calculator/messages",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${intruderToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: "Malicious intruder message",
          senderId: "intruder-user-999",
        }),
      }
    );
    const intruderPostRes = await postMessage(intruderPostReq, {
      params: Promise.resolve({ id: "conv-tunde-calculator" }),
    });
    assert(
      intruderPostRes?.status === 404,
      "Conversation message POST endpoint returns 404 to non-participant"
    );

    // Legitimate participant access
    const legitimateParticipantToken = createAuthToken({
      id: "user-current-student",
      name: "Usman Ibrahim",
      email: "usman@campushive.edu.ng",
      role: "buyer",
      isStudent: true,
      studentVerified: true,
    });

    const legitimateReq = new NextRequest(
      "http://localhost:3000/api/messages/conversations/conv-tunde-calculator",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${legitimateParticipantToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const validCheck = await requireParticipant(legitimateReq, "conv-tunde-calculator");
    assert(
      validCheck.user !== null && validCheck.errorResponse === undefined,
      "requireParticipant grants access to legitimate conversation participant"
    );

    const legitDetailRes = await getConversationDetail(legitimateReq, {
      params: Promise.resolve({ id: "conv-tunde-calculator" }),
    });
    assert(
      legitDetailRes?.status === 200,
      "Conversation GET endpoint responds 200 OK for authorized participant"
    );

    // Legitimate participant posts a message while attempting to spoof senderId in body
    const spoofedBodyMsgReq = new NextRequest(
      "http://localhost:3000/api/messages/conversations/conv-tunde-calculator/messages",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${legitimateParticipantToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: "Legitimate student inquiry",
          senderId: "spoofed-victim-id-in-body", // Malicious body spoof attempt
        }),
      }
    );
    const postRes = await postMessage(spoofedBodyMsgReq, {
      params: Promise.resolve({ id: "conv-tunde-calculator" }),
    });
    assert(
      postRes?.status === 201 || postRes?.status === 200,
      "Participant can send message successfully"
    );
    const postData = await postRes!.json();
    assert(
      postData.message?.senderId === "user-current-student",
      "senderId strictly derived from authenticated JWT token ('user-current-student'), ignoring body spoof attempt"
    );
  }

  // 19. Structured Offer Role Rules: Proposer Cannot Accept Own Offer
  console.log("\n--- TEST GROUP 19: Structured Offer Self-Acceptance Forbidden ---");
  {
    // Buyer proposes an offer
    const offerResult = createStructuredOffer({
      conversationId: "conv-tunde-calculator",
      proposerId: "user-current-student",
      amount: 6500,
      explanation: "Cash on delivery at library",
    });

    const buyerToken = createAuthToken({
      id: "user-current-student",
      name: "Usman Ibrahim",
      email: "usman@campushive.edu.ng",
      role: "buyer",
      isStudent: true,
      studentVerified: true,
    });

    // Proposer attempts to accept their own offer
    const selfAcceptReq = new NextRequest(
      "http://localhost:3000/api/messages/conversations/conv-tunde-calculator/offers",
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${buyerToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          offerId: offerResult.offer.id,
          action: "accept",
        }),
      }
    );

    const selfAcceptRes = await patchOffers(selfAcceptReq, {
      params: Promise.resolve({ id: "conv-tunde-calculator" }),
    });
    assert(
      selfAcceptRes?.status === 403,
      "patchOffers prevents proposer from accepting their own offer with 403 Forbidden"
    );

    // Counterparty (seller) accepts the offer
    const sellerToken = createAuthToken({
      id: "seller-tunde-bello",
      name: "Tunde Bello",
      email: "tunde@abu.edu.ng",
      role: "seller",
      isStudent: true,
      studentVerified: true,
    });

    const sellerAcceptReq = new NextRequest(
      "http://localhost:3000/api/messages/conversations/conv-tunde-calculator/offers",
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${sellerToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          offerId: offerResult.offer.id,
          action: "accept",
        }),
      }
    );

    const sellerAcceptRes = await patchOffers(sellerAcceptReq, {
      params: Promise.resolve({ id: "conv-tunde-calculator" }),
    });
    assert(
      sellerAcceptRes?.status === 200,
      "Counterparty (seller) can legitimately accept the structured offer"
    );

    // Deal Role Rules: Only buyer or seller can confirm exchange
    // Intruder attempting to confirm deal gets 404 (non-member)
    const intruderDealToken = createAuthToken({
      id: "intruder-user-999",
      name: "Malicious Snooper",
      email: "intruder@evil.com",
      role: "buyer",
      isStudent: true,
      studentVerified: true,
    });
    const intruderDealReq = new NextRequest(
      "http://localhost:3000/api/messages/conversations/conv-tunde-calculator/deal",
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${intruderDealToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ choice: "Completed" }),
      }
    );
    const intruderDealRes = await patchDeal(intruderDealReq, {
      params: Promise.resolve({ id: "conv-tunde-calculator" }),
    });
    assert(
      intruderDealRes?.status === 404,
      "patchDeal rejects non-member with 404 Not Found"
    );

    // Reviews Role Rules: Review before deal confirmation is rejected with 400
    const earlyReviewReq = new NextRequest(
      "http://localhost:3000/api/messages/conversations/conv-tunde-calculator/reviews",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${buyerToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rating: 5, comment: "Premature review" }),
      }
    );
    const earlyReviewRes = await postReview(earlyReviewReq, {
      params: Promise.resolve({ id: "conv-tunde-calculator" }),
    });
    assert(
      earlyReviewRes?.status === 400,
      "postReview rejects review before deal confirmation with 400"
    );

    // Buyer confirms deal
    const buyerConfirmReq = new NextRequest(
      "http://localhost:3000/api/messages/conversations/conv-tunde-calculator/deal",
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${buyerToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ choice: "Completed" }),
      }
    );
    const buyerConfirmRes = await patchDeal(buyerConfirmReq, {
      params: Promise.resolve({ id: "conv-tunde-calculator" }),
    });
    assert(
      buyerConfirmRes?.status === 200,
      "Buyer can confirm deal exchange as 'Completed'"
    );

    // Seller confirms deal
    const sellerConfirmReq = new NextRequest(
      "http://localhost:3000/api/messages/conversations/conv-tunde-calculator/deal",
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${sellerToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ choice: "Completed" }),
      }
    );
    const sellerConfirmRes = await patchDeal(sellerConfirmReq, {
      params: Promise.resolve({ id: "conv-tunde-calculator" }),
    });
    assert(
      sellerConfirmRes?.status === 200,
      "Seller can confirm deal exchange as 'Completed'"
    );

    // Reviews Role Rules: Valid review after completion by party to deal
    const validReviewReq = new NextRequest(
      "http://localhost:3000/api/messages/conversations/conv-tunde-calculator/reviews",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${buyerToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rating: 5, comment: "Excellent calculator, fast handoff!" }),
      }
    );
    const validReviewRes = await postReview(validReviewReq, {
      params: Promise.resolve({ id: "conv-tunde-calculator" }),
    });
    assert(
      validReviewRes?.status === 201,
      "Party to completed deal can submit a review with 201 Created"
    );

    // Reviews Role Rules: Duplicate review by same user rejected with 409
    const duplicateReviewReq = new NextRequest(
      "http://localhost:3000/api/messages/conversations/conv-tunde-calculator/reviews",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${buyerToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rating: 5, comment: "Attempting duplicate review!" }),
      }
    );
    const duplicateReviewRes = await postReview(duplicateReviewReq, {
      params: Promise.resolve({ id: "conv-tunde-calculator" }),
    });
    assert(
      duplicateReviewRes?.status === 409,
      "postReview strictly prevents duplicate reviews per exchange with 409 Conflict"
    );
  }

  // 20. Resource Ownership: Listing PATCH & DELETE IDOR Protection
  console.log("\n--- TEST GROUP 20: Listing Ownership IDOR Protection ---");
  {
    try {
      // Mock listing owned by seller-alpha-01
      (ListingModel as any).findById = (id: any) =>
        Promise.resolve({
          _id: id,
          sellerId: "seller-alpha-01",
          title: "Biology Textbook",
          price: 5000,
          status: "active",
          save: async () => {},
        });

      // Attacker seller-bravo-02 attempts to modify listing owned by seller-alpha-01
      const attackerToken = createAuthToken({
        id: "seller-bravo-02",
        name: "Bravo Attacker",
        email: "bravo@campushive.edu.ng",
        role: "seller",
        isStudent: true,
        studentVerified: true,
      });

      const editReq = new NextRequest("http://localhost:3000/api/listings/102", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${attackerToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: "Hacked Listing", price: 1 }),
      });

      const editRes = await patchListing(editReq, {
        params: Promise.resolve({ id: "102" }),
      });
      assert(
        editRes?.status === 403,
        "PATCH /api/listings/[id] prevents IDOR: Non-owner edit rejected with 403 Forbidden"
      );

      const deleteReq = new NextRequest("http://localhost:3000/api/listings/102", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${attackerToken}`,
          "Content-Type": "application/json",
        },
      });

      const deleteRes = await deleteListing(deleteReq, {
        params: Promise.resolve({ id: "102" }),
      });
      assert(
        deleteRes?.status === 403,
        "DELETE /api/listings/[id] prevents IDOR: Non-owner delete rejected with 403 Forbidden"
      );

      // Legitimate owner seller-alpha-01 can edit their own listing
      const ownerToken = createAuthToken({
        id: "seller-alpha-01",
        name: "Alpha Owner",
        email: "alpha@campushive.edu.ng",
        role: "seller",
        isStudent: true,
        studentVerified: true,
      });

      const ownerEditReq = new NextRequest("http://localhost:3000/api/listings/102", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${ownerToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ price: 6000 }),
      });

      const ownerEditRes = await patchListing(ownerEditReq, {
        params: Promise.resolve({ id: "102" }),
      });
      assert(
        ownerEditRes?.status === 200,
        "PATCH /api/listings/[id] allows legitimate owner to update their listing"
      );
    } finally {
      delete (ListingModel as any).findById;
    }
  }

  // 21. Store & Store Listings Ownership (assertUserOwnsStore)
  console.log("\n--- TEST GROUP 21: Store & Store Listings Ownership (assertUserOwnsStore) ---");
  {
    try {
      // Mock store owned by vendor-owner-01
      const mockStoreDoc = {
        _id: "store-alpha-01",
        ownerId: "vendor-owner-01",
        name: "Campus Tech Hub",
        status: "active",
        save: async () => {},
      };
      (StoreModel as any).findById = (id: any) => Promise.resolve(mockStoreDoc);
      (StoreModel as any).findOne = (query: any) => Promise.resolve(mockStoreDoc);

      const attackerToken = createAuthToken({
        id: "attacker-vendor-02",
        name: "Attacker Vendor",
        email: "attacker.vendor@campushive.edu.ng",
        role: "seller",
        isStudent: true,
        studentVerified: true,
      });

      // 1. PATCH /api/stores/[id] - non-owner rejected
      const patchStoreReq = new NextRequest("http://localhost:3000/api/stores/store-alpha-01", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${attackerToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: "Hacked Store" }),
      });
      const patchStoreRes = await patchStore(patchStoreReq, {
        params: Promise.resolve({ id: "store-alpha-01" }),
      });
      assert(
        patchStoreRes?.status === 403,
        "PATCH /api/stores/[id] enforces assertUserOwnsStore: Non-owner rejected with 403 Forbidden"
      );

      // 2. DELETE /api/stores/[id] - non-owner rejected
      const deleteStoreReq = new NextRequest("http://localhost:3000/api/stores/store-alpha-01", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${attackerToken}`,
          "Content-Type": "application/json",
        },
      });
      const deleteStoreRes = await deleteStore(deleteStoreReq, {
        params: Promise.resolve({ id: "store-alpha-01" }),
      });
      assert(
        deleteStoreRes?.status === 403,
        "DELETE /api/stores/[id] enforces assertUserOwnsStore: Non-owner rejected with 403 Forbidden"
      );

      // 3. POST /api/stores/[id]/listings - non-owner rejected
      const postStoreListingsReq = new NextRequest(
        "http://localhost:3000/api/stores/store-alpha-01/listings",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${attackerToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ listingId: "listing-101" }),
        }
      );
      const postStoreListingsRes = await postStoreListing(postStoreListingsReq, {
        params: Promise.resolve({ id: "store-alpha-01" }),
      });
      assert(
        postStoreListingsRes?.status === 403,
        "POST /api/stores/[id]/listings enforces assertUserOwnsStore: Non-owner rejected with 403 Forbidden"
      );

      // 4. DELETE /api/stores/[id]/listings - non-owner rejected
      const deleteStoreListingsReq = new NextRequest(
        "http://localhost:3000/api/stores/store-alpha-01/listings?listingId=listing-101",
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${attackerToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      const deleteStoreListingsRes = await deleteStoreListing(deleteStoreListingsReq, {
        params: Promise.resolve({ id: "store-alpha-01" }),
      });
      assert(
        deleteStoreListingsRes?.status === 403,
        "DELETE /api/stores/[id]/listings enforces assertUserOwnsStore: Non-owner rejected with 403 Forbidden"
      );

      // 5. Direct helper verification for legitimate owner
      const legitimateCheck = await assertUserOwnsStore("vendor-owner-01", "store-alpha-01");
      assert(
        legitimateCheck.ok === true && legitimateCheck.store?.ownerId === "vendor-owner-01",
        "assertUserOwnsStore successfully validates legitimate storefront owner"
      );
    } finally {
      delete (StoreModel as any).findById;
      delete (StoreModel as any).findOne;
    }
  }

  // 22. Short-Lived Access Tokens (15 min) & Refresh Token Cookies (httpOnly, Secure, SameSite)
  console.log("\n--- TEST GROUP 22: Short-Lived Access Tokens (15 min) & Refresh Cookies ---");
  {
    const sampleUser = {
      id: "student-user-15min",
      name: "Chukwudi Okafor",
      email: "chukwudi@unilag.edu.ng",
      role: "buyer" as const,
      isStudent: true,
      studentVerified: true,
      campus: "UNILAG",
    };

    // 1. Verify access token constant and lifetime
    assert(
      ACCESS_TOKEN_EXPIRY_SECONDS === 15 * 60,
      "ACCESS_TOKEN_EXPIRY_SECONDS is configured to 900 seconds (15 minutes)"
    );

    const accessToken = createAccessToken(sampleUser);
    const [, accessPayloadBase64] = accessToken.split(".");
    const accessPayload = JSON.parse(
      Buffer.from(accessPayloadBase64.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8")
    );
    assert(
      accessPayload.exp - accessPayload.iat === 15 * 60,
      "Access token lifetime is exactly 15 minutes (900 seconds)"
    );
    assert(
      accessPayload.tokenType === "access",
      "Access token is tagged with tokenType: 'access'"
    );

    // 2. Verify refresh token creation and lifetime
    const refreshToken = createRefreshToken(sampleUser);
    const [, refreshPayloadBase64] = refreshToken.split(".");
    const refreshPayload = JSON.parse(
      Buffer.from(refreshPayloadBase64.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8")
    );
    assert(
      refreshPayload.exp - refreshPayload.iat === REFRESH_TOKEN_EXPIRY_SECONDS,
      "Refresh token lifetime is 7 days (604,800 seconds)"
    );
    assert(
      refreshPayload.tokenType === "refresh",
      "Refresh token is tagged with tokenType: 'refresh'"
    );

    // 3. Strict token type separation (Cross-type misuse protection)
    const verifiedAccessAsAccess = verifyAuthToken(accessToken);
    assert(
      verifiedAccessAsAccess !== null && verifiedAccessAsAccess.id === sampleUser.id,
      "verifyAuthToken validates authentic short-lived access token"
    );

    const verifiedRefreshAsAccess = verifyAuthToken(refreshToken);
    assert(
      verifiedRefreshAsAccess === null,
      "verifyAuthToken strictly rejects refresh tokens from being used on protected API routes"
    );

    const verifiedRefreshAsRefresh = verifyRefreshToken(refreshToken);
    assert(
      verifiedRefreshAsRefresh !== null && verifiedRefreshAsRefresh.id === sampleUser.id,
      "verifyRefreshToken validates authentic refresh token"
    );

    const verifiedAccessAsRefresh = verifyRefreshToken(accessToken);
    assert(
      verifiedAccessAsRefresh === null,
      "verifyRefreshToken strictly rejects access tokens from being used to refresh sessions"
    );

    // 4. Refresh token cookie options (httpOnly, Secure, SameSite)
    const cookieOpts = getRefreshTokenCookieOptions();
    assert(
      cookieOpts.httpOnly === true,
      "Refresh token cookie option specifies httpOnly: true (mitigates XSS extraction)"
    );
    assert(
      cookieOpts.sameSite === "lax" || cookieOpts.sameSite === "strict",
      "Refresh token cookie option specifies SameSite: lax/strict (mitigates CSRF)"
    );
    assert(
      cookieOpts.path === "/",
      "Refresh token cookie option specifies path: '/'"
    );
    assert(
      cookieOpts.maxAge === REFRESH_TOKEN_EXPIRY_SECONDS,
      "Refresh token cookie option maxAge matches 7-day token expiry"
    );

    const prodCookieOpts = getRefreshTokenCookieOptions(REFRESH_TOKEN_EXPIRY_SECONDS, true);
    assert(
      prodCookieOpts.secure === true,
      "Refresh token cookie enforces Secure flag for encrypted transport"
    );

    // 5. POST /api/admin/auth/signin sets httpOnly refresh token cookie
    const adminSignInReq = new NextRequest("http://localhost:3000/api/admin/auth/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identity: "admin@campushive.edu.ng",
        password: process.env.ADMIN_PASSWORD || "admin",
      }),
    });
    const adminSignInRes = await adminSignIn(adminSignInReq);
    assert(
      adminSignInRes.status === 200,
      "POST /api/admin/auth/signin responds with 200 OK"
    );
    const adminSignInData = await adminSignInRes.json();
    assert(
      Boolean(adminSignInData.token),
      "Admin signin response contains short-lived access token"
    );
    const setCookieHeader = adminSignInRes.headers.get("set-cookie") || "";
    assert(
      setCookieHeader.includes(REFRESH_TOKEN_COOKIE_NAME),
      "Admin signin response includes Set-Cookie for refresh token"
    );
    assert(
      setCookieHeader.toLowerCase().includes("httponly"),
      "Admin signin Set-Cookie header contains HttpOnly directive"
    );
    assert(
      setCookieHeader.toLowerCase().includes("samesite"),
      "Admin signin Set-Cookie header contains SameSite directive"
    );

    // 6. POST /api/auth/refresh with valid cookie generates new access token & rotates cookie
    const refreshReqWithCookie = new NextRequest("http://localhost:3000/api/auth/refresh", {
      method: "POST",
      headers: {
        cookie: `${REFRESH_TOKEN_COOKIE_NAME}=${refreshToken}`,
        "Content-Type": "application/json",
      },
    });
    const refreshRes = await authRefresh(refreshReqWithCookie);
    assert(
      refreshRes.status === 200,
      "POST /api/auth/refresh successfully exchanges valid cookie for new access token"
    );
    const refreshData = await refreshRes.json();
    assert(
      Boolean(refreshData.token),
      "Refresh response contains new access token"
    );
    const newAccessDecoded = verifyAuthToken(refreshData.token);
    assert(
      newAccessDecoded?.id === sampleUser.id,
      "New access token from refresh endpoint verifies for expected user"
    );
    const rotatedCookieHeader = refreshRes.headers.get("set-cookie") || "";
    assert(
      rotatedCookieHeader.includes(REFRESH_TOKEN_COOKIE_NAME),
      "POST /api/auth/refresh rotates the httpOnly refresh token cookie in response"
    );

    // 7. POST /api/auth/refresh rejects missing token with 401
    const unauthRefreshReq = new NextRequest("http://localhost:3000/api/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    const unauthRefreshRes = await authRefresh(unauthRefreshReq);
    assert(
      unauthRefreshRes.status === 401,
      "POST /api/auth/refresh rejects request with missing refresh token with 401"
    );

    // 8. POST /api/auth/refresh rejects invalid / tampered token with 401
    const tamperedRefreshReq = new NextRequest("http://localhost:3000/api/auth/refresh", {
      method: "POST",
      headers: {
        cookie: `${REFRESH_TOKEN_COOKIE_NAME}=forged.tampered.token`,
        "Content-Type": "application/json",
      },
    });
    const tamperedRefreshRes = await authRefresh(tamperedRefreshReq);
    assert(
      tamperedRefreshRes.status === 401,
      "POST /api/auth/refresh rejects tampered refresh token with 401"
    );

    // 9. POST /api/auth/refresh rejects access token used as refresh token
    const wrongTypeReq = new NextRequest("http://localhost:3000/api/auth/refresh", {
      method: "POST",
      headers: {
        cookie: `${REFRESH_TOKEN_COOKIE_NAME}=${accessToken}`,
        "Content-Type": "application/json",
      },
    });
    const wrongTypeRes = await authRefresh(wrongTypeReq);
    assert(
      wrongTypeRes.status === 401,
      "POST /api/auth/refresh rejects access token attempted as refresh token with 401"
    );

    // 10. POST /api/auth/refresh rejects suspended user with 403 Forbidden
    const origFindById = (UserModel as any).findById;
    const origFindOne = (UserModel as any).findOne;
    const origDb = (UserModel as any).db;
    try {
      (UserModel as any).db = { readyState: 1 };
      (UserModel as any).findById = (id: any) => ({
        select: () => ({
          lean: async () => ({
            _id: id,
            role: "buyer",
            accountStatus: "suspended", // Account suspended!
          }),
        }),
      });
      (UserModel as any).findOne = (query: any) => ({
        select: () => ({
          lean: async () => ({
            _id: sampleUser.id,
            role: "buyer",
            accountStatus: "suspended",
          }),
        }),
      });

      const suspendedRefreshReq = new NextRequest("http://localhost:3000/api/auth/refresh", {
        method: "POST",
        headers: {
          cookie: `${REFRESH_TOKEN_COOKIE_NAME}=${refreshToken}`,
          "Content-Type": "application/json",
        },
      });
      const suspendedRefreshRes = await authRefresh(suspendedRefreshReq);
      assert(
        suspendedRefreshRes.status === 403,
        "POST /api/auth/refresh checks DB and strictly rejects suspended account with 403 Forbidden"
      );
    } finally {
      (UserModel as any).findById = origFindById;
      (UserModel as any).findOne = origFindOne;
      (UserModel as any).db = origDb;
    }

    // 11. POST /api/admin/auth/refresh rejects demoted admin with 403 Forbidden
    const adminUser = {
      id: "admin-user-01",
      name: "Admin User",
      email: "admin@campushive.edu.ng",
      role: "admin" as const,
      isStudent: false,
      studentVerified: false,
    };
    const adminRefreshToken = createRefreshToken(adminUser);

    try {
      (UserModel as any).db = { readyState: 1 };
      // Demoted in DB to "buyer"
      (UserModel as any).findById = (id: any) => ({
        select: () => ({
          lean: async () => ({
            _id: id,
            role: "buyer",
            accountStatus: "active",
          }),
        }),
      });
      (UserModel as any).findOne = (query: any) => ({
        select: () => ({
          lean: async () => ({
            _id: adminUser.id,
            role: "buyer",
            accountStatus: "active",
          }),
        }),
      });

      const demotedAdminReq = new NextRequest("http://localhost:3000/api/admin/auth/refresh", {
        method: "POST",
        headers: {
          cookie: `${REFRESH_TOKEN_COOKIE_NAME}=${adminRefreshToken}`,
          "Content-Type": "application/json",
        },
      });
      const demotedAdminRes = await adminAuthRefresh(demotedAdminReq);
      assert(
        demotedAdminRes.status === 403,
        "POST /api/admin/auth/refresh strictly rejects demoted admin with 403 Forbidden"
      );
    } finally {
      (UserModel as any).findById = origFindById;
      (UserModel as any).findOne = origFindOne;
      (UserModel as any).db = origDb;
    }

    // 12. POST /api/auth/logout clears refresh token cookie
    const logoutRes = await authLogout();
    assert(
      logoutRes.status === 200,
      "POST /api/auth/logout responds with 200 OK"
    );
    const logoutCookieHeader = logoutRes.headers.get("set-cookie") || "";
    assert(
      logoutCookieHeader.includes(REFRESH_TOKEN_COOKIE_NAME) &&
        (logoutCookieHeader.includes("Max-Age=0") || logoutCookieHeader.includes("max-age=0")),
      "POST /api/auth/logout clears the refresh token cookie (Max-Age=0)"
    );
  }

  console.log("\n==================================================================");
  console.log(` RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log("==================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runAuthSecurityTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
