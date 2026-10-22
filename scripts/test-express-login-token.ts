/**
 * End-to-end check: tokens issued by the REAL Express login controllers
 * (POST /api/auth/login -> auth.controller.login, POST /api/admin/auth/signin -> adminAuth.controller.adminSignIn)
 * must pass Next.js verifyAuthToken. No hand-built tokens.
 *
 * Flow: in-memory MongoDB -> seed User/Admin via the backend's own mongoose models (argon2-hashed passwords)
 *       -> invoke the controller with a real req/res pair -> verify res.json().token in Next.js.
 */
import { MongoMemoryServer } from "mongodb-memory-server";

// Shared secret for BOTH services, set before either env module is loaded.
process.env.AUTH_SECRET = process.env.AUTH_SECRET || "e2e-shared-secret-0123456789abcdef0123456789abcdef";
process.env.SMTP_USER = process.env.SMTP_USER || "e2e@example.com";
process.env.SMTP_PASSWORD = process.env.SMTP_PASSWORD || "e2e-password";
process.env.ADMIN_REGISTRATION_KEY = process.env.ADMIN_REGISTRATION_KEY || "e2e-admin-key";

let passed = 0;
let failed = 0;
function assert(cond: boolean, msg: string) {
  if (cond) {
    console.log(`[PASS] ${msg}`);
    passed++;
  } else {
    console.error(`[FAIL] ${msg}`);
    failed++;
  }
}

function decode(token: string) {
  const [h, p] = token.split(".");
  const d = (s: string) => JSON.parse(Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8"));
  return { header: d(h), payload: d(p) };
}

/** Minimal Express-compatible res object capturing status + json body. */
function mockRes() {
  const out: { status: number; body: any } = { status: 200, body: undefined };
  const res: any = {
    status(code: number) {
      out.status = code;
      return res;
    },
    json(body: any) {
      out.body = body;
      return res;
    },
  };
  return { res, out };
}

async function main() {
  console.log("==================================================================");
  console.log(" EXPRESS LOGIN TOKEN -> NEXT.JS verifyAuthToken (END-TO-END)");
  console.log("==================================================================\n");

  const mongod = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongod.getUri();

  // Backend has its own mongoose install; connect THAT instance so its models work.
  const backendMongoose = (await import("../campus-hive-backend/node_modules/mongoose/index.js" as any)).default;
  await backendMongoose.connect(mongod.getUri());

  const argon2 = (await import("../campus-hive-backend/node_modules/argon2/argon2.cjs" as any)).default;
  const BackendUser = (await import("../campus-hive-backend/models/User.js" as any)).default;
  const { login } = await import("../campus-hive-backend/controllers/auth.controller.js" as any);
  const { adminSignIn } = await import("../campus-hive-backend/controllers/adminAuth.controller.js" as any);
  const { verifyAuthClaims } = await import("../campus-hive-backend/utils/auth.js" as any);
  const { verifyAuthToken, AUTH_ISSUER, AUTH_AUDIENCE } = await import("../app/lib/authTokens");
  const { getServerAuthUser } = await import("../app/lib/authServer");
  const { NextRequest } = await import("next/server");

  try {
    // ---------------- 1. User login (POST /api/auth/login) ----------------
    console.log("--- 1. Express user login: auth.controller.login ---");
    const password = "Str0ng!Passw0rd";
    const seeded = await BackendUser.collection.insertOne({
      email: "e2e.student@unilag.edu.ng",
      password: await argon2.hash(password),
      role: "seller",
      accountStatus: "active",
      agreedToTerms: true,
      profile: { displayName: "E2E Student" },
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const userId = String(seeded.insertedId);

    const { res: userRes, out: userOut } = mockRes();
    await login({ body: { email: "e2e.student@unilag.edu.ng", password } }, userRes);
    assert(userOut.status === 200 && typeof userOut.body?.token === "string", "Express login returns 200 with a token");
    if (typeof userOut.body?.token !== "string") {
      throw new Error(`Express login did not issue a token: ${userOut.status} ${JSON.stringify(userOut.body)}`);
    }

    const userToken: string = userOut.body?.token || "";
    const { header: uh, payload: up } = decode(userToken);
    console.log("     issued header :", JSON.stringify(uh));
    console.log("     issued payload:", JSON.stringify(up));
    assert(uh.alg === "HS256", "Express user token alg is HS256");
    assert(up.iss === AUTH_ISSUER, `Express user token carries iss=${AUTH_ISSUER}`);
    assert(up.aud === AUTH_AUDIENCE, `Express user token carries aud=${AUTH_AUDIENCE}`);
    assert(up.sub === userId, "Express user token carries sub = Mongo _id");
    assert(up.tokenType === "access", "Express user token is tagged tokenType: 'access'");

    const nextUser = verifyAuthToken(userToken);
    assert(nextUser !== null, "Next.js verifyAuthToken ACCEPTS the real Express login token");
    assert(nextUser?.id === userId, "Next.js resolves id from Express sub");
    assert(nextUser?.email === "e2e.student@unilag.edu.ng", "Next.js resolves email from Express token");
    assert(nextUser?.role === "seller", "Next.js resolves role from Express token");

    const viaRequest = getServerAuthUser(
      new NextRequest("http://localhost:3000/api/messages/conversations", {
        headers: { Authorization: `Bearer ${userToken}` },
      })
    );
    assert(viaRequest?.id === userId, "getServerAuthUser accepts the Express token via Authorization header");

    // ---------------- 2. Admin signin (POST /api/admin/auth/signin) ----------------
    console.log("\n--- 2. Express admin signin: adminAuth.controller.adminSignIn ---");
    const adminPassword = "Adm1n!Passw0rd";
    const adminInsertRes = await BackendUser.collection.insertOne({
      email: "e2e.admin@campushive.edu.ng",
      password: await argon2.hash(adminPassword, { type: argon2.argon2id }),
      role: "admin",
      accountStatus: "active",
      agreedToTerms: true,
      profile: {
        displayName: "E2E Admin",
        handle: "e2e-admin",
      },
      schemaVersion: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const adminId = String(adminInsertRes.insertedId);

    const { res: adminRes, out: adminOut } = mockRes();
    await adminSignIn({ body: { identity: "e2e.admin@campushive.edu.ng", password: adminPassword } }, adminRes);
    assert(adminOut.status === 200 && typeof adminOut.body?.token === "string", "Express adminSignIn returns 200 with a token");
    if (typeof adminOut.body?.token !== "string") {
      throw new Error(`Express adminSignIn did not issue a token: ${adminOut.status} ${JSON.stringify(adminOut.body)}`);
    }

    const adminToken: string = adminOut.body?.token || "";
    const { header: ah, payload: ap } = decode(adminToken);
    console.log("     issued header :", JSON.stringify(ah));
    console.log("     issued payload:", JSON.stringify(ap));
    assert(ah.alg === "HS256", "Express admin token alg is explicitly HS256");
    assert(ap.iss === AUTH_ISSUER, `Express admin token carries iss=${AUTH_ISSUER}`);
    assert(ap.aud === AUTH_AUDIENCE, `Express admin token carries aud=${AUTH_AUDIENCE}`);
    assert(ap.sub === adminId && typeof ap.sub === "string", "Express admin token carries string sub = Admin _id");
    assert(ap.tokenType === "access", "Express admin token is tagged tokenType: 'access'");

    const nextAdmin = verifyAuthToken(adminToken);
    assert(nextAdmin !== null, "Next.js verifyAuthToken ACCEPTS the real Express admin token");
    assert(nextAdmin?.id === adminId, "Next.js resolves admin id from Express sub");
    assert(nextAdmin?.role === "admin", "Next.js resolves role 'admin' (not silently downgraded to 'buyer')");

    // ---------------- 3. Cross-service token-type isolation ----------------
    console.log("\n--- 3. Token-type isolation across services ---");
    const { createRefreshToken } = await import("../app/lib/authTokens");
    const nextRefresh = createRefreshToken({
      id: userId,
      name: "E2E",
      email: "e2e.student@unilag.edu.ng",
      role: "seller",
      isStudent: true,
      studentVerified: true,
    });
    let expressRejectedRefresh = false;
    try {
      verifyAuthClaims(nextRefresh);
    } catch {
      expressRejectedRefresh = true;
    }
    assert(expressRejectedRefresh, "Express verifyAuthClaims rejects a Next.js refresh token used as an access token");

    let expressAcceptsOwn = false;
    try {
      expressAcceptsOwn = verifyAuthClaims(userToken).sub === userId;
    } catch {
      expressAcceptsOwn = false;
    }
    assert(expressAcceptsOwn, "Express verifyAuthClaims still accepts its own login token");
  } finally {
    await backendMongoose.disconnect();
    await mongod.stop();
  }

  console.log("\n==================================================================");
  console.log(` RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log("==================================================================");
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
