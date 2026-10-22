import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import {
  uploadFileSecurely,
  generateSignedUploadParams,
  StorageUnconfiguredError,
  verifyFileSignature,
} from "../app/lib/storage";
import { getMongooseConnectionOptions } from "../app/lib/dbConnect";

async function runTests() {
  console.log("====================================================================");
  console.log("   PHASE 3 HARDENING: STORAGE, CONNECTION POOL & REGIONAL CONFIG    ");
  console.log("====================================================================\n");

  let passed = 0;
  const originalEnv = { ...process.env };

  try {
    // -----------------------------------------------------------------
    // TEST 1: Storage file contains zero local disk write calls
    // -----------------------------------------------------------------
    console.log("TEST 1: Verifying storage.ts contains ZERO local disk writes...");
    const storageSource = fs.readFileSync(
      path.join(process.cwd(), "app/lib/storage.ts"),
      "utf8"
    );
    assert.strictEqual(
      storageSource.includes("fs.writeFile") || storageSource.includes("writeFile("),
      false,
      "storage.ts must not contain any writeFile calls"
    );
    assert.strictEqual(
      storageSource.includes("fs.mkdir") || storageSource.includes("mkdir("),
      false,
      "storage.ts must not contain any mkdir calls"
    );
    console.log("  PASS: Zero local fs write/mkdir calls found in storage.ts");
    passed++;

    // -----------------------------------------------------------------
    // TEST 2: Magic number binary verification
    // -----------------------------------------------------------------
    console.log("\nTEST 2: Verifying binary magic-number validation...");
    // Valid PNG header: 89 50 4E 47
    const validPngBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    const pngResult = verifyFileSignature(validPngBuffer);
    assert.strictEqual(pngResult.valid, true);
    assert.strictEqual(pngResult.detectedMime, "image/png");

    // Malicious shell script disguised as png
    const maliciousScript = Buffer.from("#!/bin/bash\nrm -rf /");
    const scriptResult = verifyFileSignature(maliciousScript);
    assert.strictEqual(scriptResult.valid, false);

    // SVG disguised (XSS vector)
    const svgBuffer = Buffer.from("<svg onload='alert(1)'>");
    const svgResult = verifyFileSignature(svgBuffer);
    assert.strictEqual(svgResult.valid, false);

    console.log("  PASS: Executables, SVG XSS, and non-image binaries are rejected");
    passed++;

    // -----------------------------------------------------------------
    // TEST 3: Production requires Cloudinary; returns 503 when missing
    // -----------------------------------------------------------------
    console.log("\nTEST 3: Enforcing Cloudinary requirement in production (HTTP 503)...");
    (process.env as any).NODE_ENV = "production";
    delete process.env.CLOUDINARY_CLOUD_NAME;
    delete process.env.CLOUDINARY_API_KEY;
    delete process.env.CLOUDINARY_API_SECRET;

    let threw503 = false;
    try {
      await uploadFileSecurely({
        buffer: validPngBuffer,
        originalName: "avatar.png",
        declaredMimeType: "image/png",
        userId: "user_123",
      });
    } catch (err: any) {
      if (err instanceof StorageUnconfiguredError && err.statusCode === 503) {
        threw503 = true;
      }
    }
    assert.strictEqual(threw503, true, "uploadFileSecurely must throw StorageUnconfiguredError (503) in production without Cloudinary");

    let signThrew503 = false;
    try {
      generateSignedUploadParams();
    } catch (err: any) {
      if (err instanceof StorageUnconfiguredError && err.statusCode === 503) {
        signThrew503 = true;
      }
    }
    assert.strictEqual(signThrew503, true, "generateSignedUploadParams must throw StorageUnconfiguredError (503) in production without Cloudinary");
    console.log("  PASS: StorageUnconfiguredError (503) thrown when Cloudinary is not configured in production");
    passed++;

    // -----------------------------------------------------------------
    // TEST 4: Signed Direct Uploads & Isolation of Private Documents
    // -----------------------------------------------------------------
    console.log("\nTEST 4: Signed direct upload parameter generation & private isolation...");
    process.env.CLOUDINARY_CLOUD_NAME = "campushive_test";
    process.env.CLOUDINARY_API_KEY = "test_api_key_123";
    process.env.CLOUDINARY_API_SECRET = "test_api_secret_456";

    // Public upload params
    const publicSigned = generateSignedUploadParams({ isPrivate: false });
    assert.strictEqual(publicSigned.cloudName, "campushive_test");
    assert.strictEqual(publicSigned.apiKey, "test_api_key_123");
    assert.strictEqual(publicSigned.folder, "campushive/uploads");
    assert.strictEqual(publicSigned.type, "upload");
    assert.strictEqual(typeof publicSigned.signature, "string");
    assert.strictEqual(publicSigned.signature.length, 40); // SHA-1 hex

    // Private business document params
    const privateSigned = generateSignedUploadParams({ isPrivate: true });
    assert.strictEqual(privateSigned.folder, "campushive/private_docs");
    assert.strictEqual(privateSigned.type, "authenticated");
    assert.strictEqual(typeof privateSigned.signature, "string");
    assert.notStrictEqual(privateSigned.signature, publicSigned.signature);

    console.log("  PASS: Signed upload parameters generated; private docs isolated with type: 'authenticated'");
    passed++;

    // -----------------------------------------------------------------
    // TEST 5: dbConnect pooling options (maxPoolSize: 5, maxIdleTimeMS: 30000)
    // -----------------------------------------------------------------
    console.log("\nTEST 5: Checking Mongoose connection pooling configuration...");
    delete process.env.MONGODB_MAX_POOL_SIZE;
    delete process.env.MONGODB_MAX_IDLE_TIME_MS;
    delete process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS;

    const defaultOpts = getMongooseConnectionOptions();
    assert.strictEqual(defaultOpts.maxPoolSize, 5, "Default maxPoolSize must be 5 for serverless safety");
    assert.strictEqual(defaultOpts.maxIdleTimeMS, 30000, "Default maxIdleTimeMS must be 30000 ms");
    assert.strictEqual(defaultOpts.serverSelectionTimeoutMS, 5000, "Default serverSelectionTimeoutMS must be 5000 ms");
    assert.strictEqual(defaultOpts.bufferCommands, false, "bufferCommands must be false");

    // Production autoIndex: false check
    (process.env as any).NODE_ENV = "production";
    const prodOpts = getMongooseConnectionOptions();
    assert.strictEqual(prodOpts.autoIndex, false, "autoIndex must be false in production");

    // Environment override check
    process.env.MONGODB_MAX_POOL_SIZE = "10";
    process.env.MONGODB_MAX_IDLE_TIME_MS = "45000";
    const tunedOpts = getMongooseConnectionOptions();
    assert.strictEqual(tunedOpts.maxPoolSize, 10);
    assert.strictEqual(tunedOpts.maxIdleTimeMS, 45000);

    console.log("  PASS: Connection pool limits (maxPoolSize=5, maxIdleTimeMS=30s, autoIndex=false in prod) verified");
    passed++;

    // -----------------------------------------------------------------
    // TEST 6: vercel.json colocation region
    // -----------------------------------------------------------------
    console.log("\nTEST 6: Validating vercel.json regional colocation...");
    const vercelConfigPath = path.join(process.cwd(), "vercel.json");
    assert.strictEqual(fs.existsSync(vercelConfigPath), true, "vercel.json must exist in project root");
    const vercelConfig = JSON.parse(fs.readFileSync(vercelConfigPath, "utf8"));
    assert.ok(Array.isArray(vercelConfig.regions), "vercel.json must define regions");
    assert.ok(vercelConfig.regions.length > 0, "vercel.json regions must not be empty");
    assert.strictEqual(vercelConfig.regions[0], "dub1", "Vercel region must match Atlas region (dub1 / eu-west-1)");

    console.log("  PASS: vercel.json colocates Serverless Functions in region: " + vercelConfig.regions.join(", "));
    passed++;

    console.log("\n====================================================================");
    console.log(` ALL ${passed} STORAGE & INFRASTRUCTURE TESTS PASSED! `);
    console.log("====================================================================\n");
  } finally {
    process.env = originalEnv;
  }
}

runTests().catch((err) => {
  console.error("Test failed with error:", err);
  process.exit(1);
});
