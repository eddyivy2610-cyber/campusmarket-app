import assert from "node:assert";
import { NextRequest } from "next/server";
import { POST as handleUpload } from "../app/api/upload/route";
import { POST as handleSignUpload } from "../app/api/upload/sign/route";
import { createAccessToken } from "../app/lib/authTokens";

// Mock auth token helper
function makeMockRequest(url: string, init?: { method?: string; headers?: Record<string, string>; body?: string }, token?: string): NextRequest {
  const headers = new Headers(init?.headers || {});
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  return new NextRequest(new URL(url, "http://localhost:3000"), {
    method: init?.method || "GET",
    headers,
    body: init?.body,
  });
}

async function runEndpointTests() {
  console.log("====================================================================");
  console.log("             TESTING UPLOAD & SIGN API ENDPOINTS                    ");
  console.log("====================================================================\n");

  const originalEnv = { ...process.env };
  process.env.AUTH_SECRET = "test_super_secret_jwt_key_with_at_least_32_characters_for_hmac!";

  const validToken = createAccessToken({
    id: "user_test_99",
    name: "Test User",
    email: "test@campushive.edu.ng",
    role: "student" as any,
    isStudent: true,
    studentVerified: true,
  });

  try {
    // 1. Unauthenticated request to /api/upload/sign -> 401
    console.log("TEST 1: Unauthenticated request to /api/upload/sign -> 401");
    const unauthReq = makeMockRequest("/api/upload/sign", { method: "POST" });
    const unauthRes = await handleSignUpload(unauthReq);
    assert.ok(unauthRes, "Response must exist");
    assert.strictEqual(unauthRes.status, 401, "Must return 401 when no auth provided");
    console.log("  PASS: 401 returned for unauthenticated client");

    // 2. Production unconfigured /api/upload/sign -> 503
    console.log("\nTEST 2: Production unconfigured Cloudinary -> 503");
    (process.env as any).NODE_ENV = "production";
    delete process.env.CLOUDINARY_CLOUD_NAME;
    delete process.env.CLOUDINARY_API_KEY;
    delete process.env.CLOUDINARY_API_SECRET;

    const authReq = makeMockRequest(
      "/api/upload/sign",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ purpose: "business_document" }),
      },
      validToken
    );
    const res503 = await handleSignUpload(authReq);
    assert.ok(res503, "Response must exist");
    assert.strictEqual(res503.status, 503, "Must return 503 when Cloudinary is unconfigured in production");
    const resJson = await res503.json();
    assert.strictEqual(resJson.success, false);
    assert.ok(resJson.error.includes("Cloud storage is unconfigured"));
    console.log("  PASS: 503 returned when storage is unconfigured in production");

    // 3. Configured /api/upload/sign -> 200 with signature
    console.log("\nTEST 3: Configured Cloudinary -> 200 with signature and authenticated type");
    process.env.CLOUDINARY_CLOUD_NAME = "campushive_cloud";
    process.env.CLOUDINARY_API_KEY = "key123";
    process.env.CLOUDINARY_API_SECRET = "secret456";

    const authReqSigned = makeMockRequest(
      "/api/upload/sign",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ purpose: "business_document" }),
      },
      validToken
    );
    const res200 = await handleSignUpload(authReqSigned);
    assert.ok(res200, "Response must exist");
    assert.strictEqual(res200.status, 200);
    const signData = await res200.json();
    assert.strictEqual(signData.success, true);
    assert.strictEqual(signData.folder, "campushive/private_docs/user_test_99");
    assert.strictEqual(signData.type, "authenticated");
    assert.strictEqual(signData.apiKey, "key123");
    assert.ok(signData.signature);
    console.log("  PASS: Signed upload parameters successfully returned");

    console.log("\n====================================================================");
    console.log(" ALL UPLOAD ENDPOINT TESTS PASSED! ");
    console.log("====================================================================\n");
  } finally {
    process.env = originalEnv;
  }
}

runEndpointTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
