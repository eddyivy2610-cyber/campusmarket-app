/**
 * Test Suite: Admins Collection Merged into Users Collection
 * - Deletion of Admin model confirmed
 * - Admin users saved in `users` collection with role: "admin"
 * - Single Argon2id hash format across users and admins
 * - adminSignUp, adminSignIn, adminProtect, unifiedAuth verification
 * - Next.js admin signin Argon2 verification
 */

import { MongoMemoryServer } from "mongodb-memory-server";
import { strict as assert } from "node:assert";

process.env.AUTH_SECRET = "super-secret-test-key-at-least-32-chars-long";
process.env.JWT_SECRET = process.env.AUTH_SECRET;
process.env.ADMIN_REGISTRATION_KEY = "test-admin-reg-key-12345";
process.env.ADMIN_EMAIL = "master.admin@campushive.edu.ng";
process.env.ADMIN_PASSWORD = "masterAdminSecret!";
process.env.SMTP_USER = "test@example.com";
process.env.SMTP_PASSWORD = "test-smtp-password";

function mockRes() {
  const out = { status: 200, body: null as any };
  const res = {
    status(code: number) {
      out.status = code;
      return res;
    },
    json(payload: any) {
      out.body = payload;
      return res;
    },
  };
  return { res, out };
}

async function run() {
  console.log("==================================================================");
  console.log(" MERGE ADMINS INTO USERS COLLECTION - VERIFICATION SUITE");
  console.log("==================================================================\n");

  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  process.env.MONGODB_URI = uri;

  const backendMongoose = (await import("../campus-hive-backend/node_modules/mongoose/index.js" as any)).default;
  await backendMongoose.connect(uri);

  const argon2 = (await import("../campus-hive-backend/node_modules/argon2/argon2.cjs" as any)).default;
  const BackendUser = (await import("../campus-hive-backend/models/User.js" as any)).default;
  const { adminSignUp, adminSignIn } = await import("../campus-hive-backend/controllers/adminAuth.controller.js" as any);
  const { adminProtect, unifiedAuth } = await import("../campus-hive-backend/utils/auth.js" as any);
  const UserModel = (await import("../app/models/User")).default;
  const dbConnect = (await import("../app/lib/dbConnect")).default;

  let passed = 0;
  function pass(msg: string) {
    passed++;
    console.log(`[PASS] ${msg}`);
  }

  try {
    // ---------------- 1. Verify Admin model is deleted ----------------
    console.log("--- 1. Admin model deletion verification ---");
    let adminModelFound = false;
    try {
      await import("../campus-hive-backend/models/Admin.js" as any);
      adminModelFound = true;
    } catch (err: any) {
      adminModelFound = false;
    }
    assert(!adminModelFound, "campus-hive-backend/models/Admin.js does not exist");
    pass("Admin model successfully deleted from codebase");

    // ---------------- 2. Admin Signup in users collection with Argon2 ----------------
    console.log("\n--- 2. Admin Signup (POST /api/admin/auth/signup) ---");
    const adminPassword = "MySecureAdminPassword123!";
    const { res: regRes, out: regOut } = mockRes();

    await adminSignUp(
      {
        body: {
          username: "superadmin_alice",
          email: "alice.admin@campushive.edu.ng",
          password: adminPassword,
          adminKey: "test-admin-reg-key-12345",
        },
      },
      regRes
    );

    assert(regOut.status === 201, `adminSignUp returned status 201, got ${regOut.status}: ${JSON.stringify(regOut.body)}`);
    assert(regOut.body?.admin?.email === "alice.admin@campushive.edu.ng", "Admin signup returns registered admin email");
    pass("adminSignUp created admin successfully with 201 Created");

    // Verify record in MongoDB users collection directly
    const rawUser = await backendMongoose.connection.collection("users").findOne({
      email: "alice.admin@campushive.edu.ng",
    });
    assert(rawUser !== null, "Admin record exists directly in 'users' collection");
    assert(rawUser.role === "admin", "Admin record in 'users' has role: 'admin'");
    assert(typeof rawUser.password === "string" && rawUser.password.startsWith("$argon2id$"), "Admin password hash is in standard Argon2id format ($argon2id$...)");
    pass("Admin document verified in 'users' collection with role: 'admin' and Argon2id hash");

    // Verify no 'admins' collection exists or was used
    const collections = await backendMongoose.connection.db.listCollections().toArray();
    const adminCollection = collections.find((c: any) => c.name === "admins");
    assert(!adminCollection, "No 'admins' collection exists in the database");
    pass("Confirmed: 'admins' collection is NOT created or used");

    // ---------------- 3. Admin SignIn & Password Comparison ----------------
    console.log("\n--- 3. Admin SignIn (POST /api/admin/auth/signin) ---");
    const { res: signinRes, out: signinOut } = mockRes();

    // Sign in using handle/username
    await adminSignIn(
      {
        body: {
          identity: "superadmin_alice",
          password: adminPassword,
        },
      },
      signinRes
    );

    assert(signinOut.status === 200, `adminSignIn returned 200, got ${signinOut.status}`);
    assert(typeof signinOut.body?.token === "string", "adminSignIn returned signed JWT token");
    assert(signinOut.body?.user?.role === "admin", "adminSignIn returned user object with role: 'admin'");
    const adminToken = signinOut.body?.token;
    pass("adminSignIn authenticated with username/handle against users collection");

    // Sign in using email
    const { res: emailRes, out: emailOut } = mockRes();
    await adminSignIn(
      {
        body: {
          identity: "alice.admin@campushive.edu.ng",
          password: adminPassword,
        },
      },
      emailRes
    );
    assert(emailOut.status === 200, "adminSignIn authenticated with email against users collection");
    pass("adminSignIn supports email identity against users collection");

    // Incorrect password rejected
    const { res: badPwRes, out: badPwOut } = mockRes();
    await adminSignIn(
      {
        body: {
          identity: "alice.admin@campushive.edu.ng",
          password: "WrongPassword!",
        },
      },
      badPwRes
    );
    assert(badPwOut.status === 401, "adminSignIn rejects incorrect password with 401");
    pass("adminSignIn rejects invalid password via Argon2 verification");

    // Regular buyer/seller rejected by adminSignIn
    const regularUser = await BackendUser.create({
      email: "buyer.bob@campushive.edu.ng",
      password: "BuyerPassword123!",
      role: "buyer",
      accountStatus: "active",
      agreedToTerms: true,
      profile: { displayName: "Buyer Bob", handle: "buyerbob" },
    });
    const { res: nonAdminRes, out: nonAdminOut } = mockRes();
    await adminSignIn(
      {
        body: {
          identity: "buyer.bob@campushive.edu.ng",
          password: "BuyerPassword123!",
        },
      },
      nonAdminRes
    );
    assert(nonAdminOut.status === 401, "adminSignIn rejects non-admin users even with valid password");
    pass("adminSignIn strictly rejects non-admin users (buyer/seller)");

    // ---------------- 4. adminProtect Middleware ----------------
    console.log("\n--- 4. adminProtect Middleware Verification ---");
    let nextCalled = false;
    const adminReq: any = {
      headers: { authorization: `Bearer ${adminToken}` },
    };
    await adminProtect(adminReq, {} as any, () => {
      nextCalled = true;
    });
    assert(nextCalled, "adminProtect allowed authenticated admin user");
    assert(adminReq.admin && adminReq.admin.role === "admin", "adminProtect populated req.admin from User collection");
    assert(adminReq.user && adminReq.user.role === "admin", "adminProtect populated req.user");
    pass("adminProtect successfully verifies admin user against User collection");

    // Generate token for buyer Bob and test adminProtect rejection
    const { generateToken } = await import("../campus-hive-backend/utils/auth.js" as any);
    const buyerToken = generateToken(regularUser);
    let buyerRejected = false;
    const buyerReq: any = {
      headers: { authorization: `Bearer ${buyerToken}` },
    };
    const { res: rejectRes, out: rejectOut } = mockRes();
    await adminProtect(buyerReq, rejectRes as any, () => {
      buyerRejected = false;
    });
    assert(rejectOut.status === 401, "adminProtect rejects non-admin user token");
    pass("adminProtect rejects non-admin token from accessing admin routes");

    // ---------------- 5. unifiedAuth Middleware ----------------
    console.log("\n--- 5. unifiedAuth Middleware Verification ---");
    let unifiedAdminNext = false;
    const uAdminReq: any = { headers: { authorization: `Bearer ${adminToken}` } };
    await unifiedAuth(uAdminReq, {} as any, () => {
      unifiedAdminNext = true;
    });
    assert(unifiedAdminNext, "unifiedAuth allowed admin user");
    assert(uAdminReq.authType === "admin", "unifiedAuth set req.authType = 'admin'");
    pass("unifiedAuth seamlessly authenticates admin user with authType: 'admin'");

    let unifiedBuyerNext = false;
    const uBuyerReq: any = { headers: { authorization: `Bearer ${buyerToken}` } };
    await unifiedAuth(uBuyerReq, {} as any, () => {
      unifiedBuyerNext = true;
    });
    assert(unifiedBuyerNext, "unifiedAuth allowed buyer user");
    assert(uBuyerReq.authType === "user", "unifiedAuth set req.authType = 'user'");
    pass("unifiedAuth seamlessly authenticates regular user with authType: 'user'");

    // ---------------- 6. Next.js Admin Signin with DB Argon2 ----------------
    console.log("\n--- 6. Next.js Admin Signin Argon2 Verification ---");
    const { POST: nextAdminSignin } = await import("../app/api/admin/auth/signin/route");
    const { NextRequest } = await import("next/server");

    // Authenticate with DB admin alice via Next.js signin route
    const nextReq = new NextRequest("http://localhost:3000/api/admin/auth/signin", {
      method: "POST",
      body: JSON.stringify({
        identity: "alice.admin@campushive.edu.ng",
        password: adminPassword,
      }),
      headers: { "Content-Type": "application/json" },
    });
    const nextRes = await nextAdminSignin(nextReq);
    const nextData = await nextRes.json();

    assert(nextRes.status === 200, `Next.js admin signin returned 200, got ${nextRes.status}`);
    assert(nextData.success === true, "Next.js admin signin succeeded");
    assert(nextData.user?.role === "admin", "Next.js admin user payload has role: 'admin'");
    assert(typeof nextData.token === "string", "Next.js admin signin issued short-lived access token");
    pass("Next.js admin signin successfully verified DB admin password via Argon2");

    console.log("\n==================================================================");
    console.log(` RESULTS: ${passed} PASSED | 0 FAILED`);
    console.log("==================================================================");
  } finally {
    try {
      const nextMongoose = (await import("mongoose")).default;
      await nextMongoose.disconnect();
    } catch {}
    await backendMongoose.disconnect();
    await mongod.stop();
  }
}

run()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error("Test failed with error:", err);
    process.exit(1);
  });
