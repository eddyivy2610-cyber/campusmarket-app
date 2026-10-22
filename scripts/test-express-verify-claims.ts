/**
 * campus-hive-backend/utils/auth.js -> verifyAuthClaims
 * iss/aud verification, sub vs id transition window, shared secret, token type.
 * Tokens are signed with the backend's real jsonwebtoken + generateToken, or Next.js createAuthToken.
 */
process.env.AUTH_SECRET = process.env.AUTH_SECRET || "e2e-shared-secret-0123456789abcdef0123456789abcdef";
process.env.SMTP_USER = process.env.SMTP_USER || "e2e@example.com";
process.env.SMTP_PASSWORD = process.env.SMTP_PASSWORD || "e2e-password";
process.env.ADMIN_REGISTRATION_KEY = process.env.ADMIN_REGISTRATION_KEY || "e2e-admin-key";
process.env.MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:1/unused";

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

async function main() {
  const jwt = (await import("../campus-hive-backend/node_modules/jsonwebtoken/index.js" as any)).default;
  const auth = await import("../campus-hive-backend/utils/auth.js" as any);
  const { verifyAuthClaims, generateToken, generateAdminToken, getAuthSecret, AUTH_ISSUER, AUTH_AUDIENCE, protect } = auth;
  const { createAuthToken, createRefreshToken, getAuthSecret: nextSecret } = await import("../app/lib/authTokens");

  const SECRET = getAuthSecret();
  const ID = "6710abcd1234567890ef0001";
  const OPEN = "2999-01-01T00:00:00Z"; // window open
  const CLOSED = "2000-01-01T00:00:00Z"; // window closed (sunset passed)

  const sign = (payload: object, opts: object = {}, secret = SECRET) =>
    jwt.sign(payload, secret, { algorithm: "HS256", expiresIn: "1h", ...opts });
  const std = { issuer: AUTH_ISSUER, audience: AUTH_AUDIENCE };

  const accepts = (t: string) => {
    try {
      return verifyAuthClaims(t);
    } catch {
      return null;
    }
  };
  const rejects = (t: string) => {
    try {
      verifyAuthClaims(t);
      return null;
    } catch (e: any) {
      return e.message as string;
    }
  };
  const withWindow = <T>(until: string, fn: () => T): T => {
    const prev = process.env.AUTH_LEGACY_TOKENS_UNTIL;
    process.env.AUTH_LEGACY_TOKENS_UNTIL = until;
    try {
      return fn();
    } finally {
      if (prev === undefined) delete process.env.AUTH_LEGACY_TOKENS_UNTIL;
      else process.env.AUTH_LEGACY_TOKENS_UNTIL = prev;
    }
  };

  console.log("==================================================================");
  console.log(" EXPRESS utils/auth.js verifyAuthClaims");
  console.log("==================================================================\n");

  // ---- Shared secret ----
  console.log("--- Shared secret ---");
  assert(SECRET === nextSecret(), "Express getAuthSecret() === Next.js getAuthSecret() (same AUTH_SECRET)");
  assert(SECRET.length >= 32, "Shared secret is >= 32 characters");
  const realUser = generateToken({ _id: ID, email: "u@unilag.edu.ng", role: "buyer" });
  assert(accepts(realUser)?.sub === ID, "Real Express generateToken token accepted, sub read");
  const realAdmin = generateAdminToken({ _id: ID, email: "a@campushive.edu.ng", username: "a", role: "moderator" });
  assert(accepts(realAdmin)?.sub === ID, "Real Express generateAdminToken token accepted");
  const nextTok = createAuthToken({ id: ID, name: "N", email: "n@x.ng", role: "seller", isStudent: true, studentVerified: true });
  assert(accepts(nextTok)?.sub === ID, "Next.js createAuthToken token accepted by Express (shared secret)");
  assert(
    /signature/i.test(rejects(sign({ sub: ID }, std, "a-completely-different-secret-xxxxxxxxxxxxxxxx")) || ""),
    "Token signed with a different secret rejected (invalid signature)"
  );

  // ---- Algorithm / exp ----
  console.log("\n--- Algorithm & expiry ---");
  const header = Buffer.from(JSON.stringify({ alg: "none", typ: "JWT" })).toString("base64url");
  const body = Buffer.from(JSON.stringify({ sub: ID, iss: AUTH_ISSUER, aud: AUTH_AUDIENCE, exp: 9999999999 })).toString("base64url");
  assert(rejects(`${header}.${body}.`) !== null, "alg: none rejected");
  assert(rejects(jwt.sign({ sub: ID }, SECRET, { algorithm: "HS512", expiresIn: "1h", ...std })) !== null, "HS512 (non-allow-listed alg) rejected");
  assert(/exp/i.test(rejects(jwt.sign({ sub: ID }, SECRET, { algorithm: "HS256", ...std })) || ""), "Token without exp rejected");
  assert(/expired/i.test(rejects(sign({ sub: ID }, { ...std, expiresIn: -10 })) || ""), "Expired token rejected");

  // ---- iss / aud: wrong values always rejected ----
  console.log("\n--- iss / aud verification ---");
  for (const [label, until] of [["window open", OPEN], ["window closed", CLOSED]] as const) {
    withWindow(until, () => {
      assert(/issuer/i.test(rejects(sign({ sub: ID }, { issuer: "evil.com", audience: AUTH_AUDIENCE })) || ""), `Wrong iss rejected (${label})`);
      assert(/audience/i.test(rejects(sign({ sub: ID }, { issuer: AUTH_ISSUER, audience: "other-api" })) || ""), `Wrong aud rejected (${label})`);
      assert(accepts(sign({ sub: ID }, std))?.sub === ID, `Correct iss + aud + sub accepted (${label})`);
    });
  }
  assert(accepts(sign({ sub: ID }, { issuer: AUTH_ISSUER, audience: ["other", AUTH_AUDIENCE] }))?.sub === ID, "aud array containing campushive-api accepted");
  assert(rejects(sign({ sub: ID }, { issuer: AUTH_ISSUER, audience: ["other", "another"] })) !== null, "aud array without campushive-api rejected");

  // ---- Transition window: missing iss / aud / sub ----
  console.log("\n--- Transition window (legacy tokens) ---");
  const legacyIdOnly = sign({ id: ID, email: "u@x.ng", role: "buyer" }); // audit-2 Express shape
  const legacyAdmin = sign({ id: ID, sub: ID, role: "superadmin", isAdmin: true }); // old adminSignIn shape
  const missingIss = sign({ sub: ID }, { audience: AUTH_AUDIENCE });
  const missingAud = sign({ sub: ID }, { issuer: AUTH_ISSUER });
  const idOnlyStd = sign({ id: ID }, std);

  withWindow(OPEN, () => {
    const r = accepts(legacyIdOnly);
    assert(r?.sub === ID && r?.id === ID, "OPEN: legacy {id,email,role} token accepted, id mapped to sub");
    assert(accepts(legacyAdmin)?.sub === ID, "OPEN: old adminSignIn token (sub, no iss/aud) accepted");
    assert(accepts(missingIss)?.sub === ID, "OPEN: token missing iss accepted");
    assert(accepts(missingAud)?.sub === ID, "OPEN: token missing aud accepted");
    assert(accepts(idOnlyStd)?.sub === ID, "OPEN: iss+aud but id-only subject accepted");
  });
  withWindow(CLOSED, () => {
    assert(/missing (iss|sub)/i.test(rejects(legacyIdOnly) || ""), "CLOSED: legacy {id,email,role} token rejected");
    assert(/missing iss/i.test(rejects(legacyAdmin) || ""), "CLOSED: old adminSignIn token rejected");
    assert(/missing iss/i.test(rejects(missingIss) || ""), "CLOSED: token missing iss rejected");
    assert(/missing aud/i.test(rejects(missingAud) || ""), "CLOSED: token missing aud rejected");
    assert(/missing sub/i.test(rejects(idOnlyStd) || ""), "CLOSED: id-only subject rejected (sub required)");
    assert(accepts(realUser)?.sub === ID, "CLOSED: current Express login token still accepted");
    assert(accepts(nextTok)?.sub === ID, "CLOSED: current Next.js token still accepted");
  });
  withWindow("not-a-date", () => {
    assert(rejects(legacyIdOnly) !== null, "Unparsable AUTH_LEGACY_TOKENS_UNTIL fails safe (window closed)");
  });

  // ---- sub / id consistency, token type ----
  console.log("\n--- Subject consistency & token type ---");
  assert(/mismatch/i.test(rejects(sign({ sub: ID, id: "attacker-id" }, std)) || ""), "sub/id mismatch rejected");
  assert(rejects(sign({}, std)) !== null, "Token with neither sub nor id rejected");
  const nextRefresh = createRefreshToken({ id: ID, name: "N", email: "n@x.ng", role: "seller", isStudent: true, studentVerified: true });
  assert(/token type/i.test(rejects(nextRefresh) || ""), "Next.js refresh token rejected as an access token");

  // ---- Middleware wiring: protect() uses verifyAuthClaims ----
  console.log("\n--- protect() middleware wiring ---");
  await withWindow(CLOSED, async () => {
    let status = 0;
    let nextCalled = false;
    const res: any = {
      status(c: number) {
        status = c;
        return res;
      },
      json() {
        return res;
      },
    };
    await protect({ headers: { authorization: `Bearer ${legacyIdOnly}` } }, res, () => {
      nextCalled = true;
    });
    assert(status === 401 && !nextCalled, "protect() returns 401 for a legacy token after the sunset");
  });

  console.log("\n==================================================================");
  console.log(` RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log("==================================================================");
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
