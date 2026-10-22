import assert from "node:assert";
import crypto from "node:crypto";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import mongoose from "mongoose";
import { NextRequest } from "next/server";
import { POST as handleSignUpload } from "../app/api/upload/sign/route";
import { POST as handleDirectUpload } from "../app/api/upload/route";
import { POST as handleCreateListing } from "../app/api/listings/route";
import { PATCH as handlePatchListing } from "../app/api/listings/[id]/route";
import { PATCH as handleUpdateProfile } from "../app/api/users/profile/route";
import { POST as handleSignDocumentAccess } from "../app/api/documents/sign-access/route";
import {
  UPLOAD_POLICIES,
  generateAssetVerificationToken,
  verifyAssetOwnership,
  parseAndValidateCloudinaryUrl,
  verifyAndInspectAsset,
  generatePrivateDocumentSignedDeliveryUrl,
} from "../app/lib/uploadPolicy";
import { createAccessToken } from "../app/lib/authTokens";
import dbConnect from "../app/lib/dbConnect";
import ListingModel from "../app/models/Listing";
import UserModel from "../app/models/User";
import legacyUploadRouter from "../campus-hive-backend/routes/upload.routes.js";

function makeMockRequest(
  url: string,
  options?: {
    method?: string;
    headers?: Record<string, string>;
    body?: any;
    formData?: FormData;
  },
  token?: string
): NextRequest {
  const headers = new Headers(options?.headers || {});
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let requestBody: any = undefined;
  if (options?.formData) {
    requestBody = options.formData;
  } else if (options?.body !== undefined) {
    headers.set("Content-Type", "application/json");
    requestBody = JSON.stringify(options.body);
  }

  return new NextRequest(new URL(url, "http://localhost:3000"), {
    method: options?.method || "GET",
    headers,
    body: requestBody,
  });
}

async function runUploadSecurityTests() {
  console.log("====================================================================");
  console.log("        PHASE 4.2: SECURE UPLOAD MIGRATION SECURITY SUITE           ");
  console.log("====================================================================\n");

  let mongod: MongoMemoryReplSet | null = null;
  const originalEnv = { ...process.env };
  process.env.AUTH_SECRET = "test_super_secret_jwt_key_with_at_least_32_characters_for_hmac!";
  process.env.CLOUDINARY_CLOUD_NAME = "campushive_cloud_prod";
  process.env.CLOUDINARY_API_KEY = "test_api_key_12345";
  process.env.CLOUDINARY_API_SECRET = "test_api_secret_abcdef98765";

  try {
    mongod = await MongoMemoryReplSet.create({
      replSet: { count: 1, storageEngine: "wiredTiger" },
    });
    const uri = mongod.getUri();
    process.env.MONGODB_URI = uri;

    await mongoose.connect(uri);
    await dbConnect();

    const testUserAId = new mongoose.Types.ObjectId().toHexString();
    const testUserBId = new mongoose.Types.ObjectId().toHexString();
    const adminUserId = new mongoose.Types.ObjectId().toHexString();

    const tokenUserA = createAccessToken({
      id: testUserAId,
      name: "User Alice",
      email: "alice@campushive.edu.ng",
      role: "buyer" as any,
      isStudent: true,
      studentVerified: true,
    });

    const tokenUserB = createAccessToken({
      id: testUserBId,
      name: "User Bob",
      email: "bob@campushive.edu.ng",
      role: "buyer" as any,
      isStudent: true,
      studentVerified: true,
    });

    const tokenAdmin = createAccessToken({
      id: adminUserId,
      name: "Admin Superuser",
      email: "admin@campushive.edu.ng",
      role: "admin" as any,
      isStudent: false,
      studentVerified: true,
    });

    // -------------------------------------------------------------------------
    // TEST 1: Unauthenticated request to /api/upload/sign -> 401
    // -------------------------------------------------------------------------
    console.log("TEST 1: /api/upload/sign rejects unauthenticated requests with 401");
    const unauthReq = makeMockRequest("/api/upload/sign", {
      method: "POST",
      body: { purpose: "avatar" },
    });
    const unauthRes = await handleSignUpload(unauthReq);
    assert.ok(unauthRes, "Response must be defined");
    assert.strictEqual(unauthRes.status, 401, "Expected 401 for unauthenticated request");
    console.log("  PASS: Unauthenticated access blocked");

    // -------------------------------------------------------------------------
    // TEST 2: Validate Purpose and Format Policy
    // -------------------------------------------------------------------------
    console.log("\nTEST 2: Policy rejects invalid purposes and disallowed MIME/extensions");
    
    // Invalid purpose
    const badPurposeReq = makeMockRequest(
      "/api/upload/sign",
      { method: "POST", body: { purpose: "malicious_script" } },
      tokenUserA
    );
    const badPurposeRes = await handleSignUpload(badPurposeReq);
    assert.ok(badPurposeRes, "Response must be defined");
    assert.strictEqual(badPurposeRes.status, 400, "Invalid purpose must return 400");

    // Disallowed executable extension for avatar
    const exeReq = makeMockRequest(
      "/api/upload/sign",
      {
        method: "POST",
        body: {
          purpose: "avatar",
          filename: "exploit.exe",
          mimeType: "application/x-msdownload",
        },
      },
      tokenUserA
    );
    const exeRes = await handleSignUpload(exeReq);
    assert.ok(exeRes, "Response must be defined");
    assert.strictEqual(exeRes.status, 400, "Disallowed executable must return 400");
    const exeJson = await exeRes.json();
    assert.ok(
      exeJson.error.includes("Invalid file format") || exeJson.error.includes(".exe"),
      "Error should mention invalid file format"
    );

    // PDF not allowed for avatar
    const pdfAvatarReq = makeMockRequest(
      "/api/upload/sign",
      {
        method: "POST",
        body: {
          purpose: "avatar",
          filename: "document.pdf",
          mimeType: "application/pdf",
        },
      },
      tokenUserA
    );
    const pdfAvatarRes = await handleSignUpload(pdfAvatarReq);
    assert.ok(pdfAvatarRes, "Response must be defined");
    assert.strictEqual(pdfAvatarRes.status, 400, "PDF cannot be uploaded as avatar");

    // PDF IS allowed for business_document
    const pdfDocReq = makeMockRequest(
      "/api/upload/sign",
      {
        method: "POST",
        body: {
          purpose: "business_document",
          filename: "student_id.pdf",
          mimeType: "application/pdf",
          fileSize: 1024 * 500, // 500KB
        },
      },
      tokenUserA
    );
    const pdfDocRes = await handleSignUpload(pdfDocReq);
    assert.ok(pdfDocRes, "Response must be defined");
    assert.strictEqual(pdfDocRes.status, 200, "PDF should be accepted for business_document");

    console.log("  PASS: Format and purpose policies strictly enforced");

    // -------------------------------------------------------------------------
    // TEST 3: File size limit enforcement
    // -------------------------------------------------------------------------
    console.log("\nTEST 3: File size enforcement rejects oversized uploads");
    const avatarMax = UPLOAD_POLICIES.avatar.maxSizeBytes;
    const oversizedAvatarReq = makeMockRequest(
      "/api/upload/sign",
      {
        method: "POST",
        body: {
          purpose: "avatar",
          filename: "large_avatar.png",
          mimeType: "image/png",
          fileSize: avatarMax + 1024, // 1KB over limit
        },
      },
      tokenUserA
    );
    const oversizedRes = await handleSignUpload(oversizedAvatarReq);
    assert.ok(oversizedRes, "Response must be defined");
    assert.strictEqual(oversizedRes.status, 400, "Oversized upload must return 400");
    const oversizedJson = await oversizedRes.json();
    assert.ok(oversizedJson.error.includes("exceeds the maximum allowed limit"));
    console.log("  PASS: Oversized uploads rejected before signing");

    // -------------------------------------------------------------------------
    // TEST 4: Folder Isolation & Signature Calculation (including allowed_formats)
    // -------------------------------------------------------------------------
    console.log("\nTEST 4: Folder isolation and cryptographic signature correctness with allowed_formats");
    const signDocReq = makeMockRequest(
      "/api/upload/sign",
      {
        method: "POST",
        body: {
          purpose: "business_document",
          filename: "business_permit.pdf",
          mimeType: "application/pdf",
          fileSize: 204800,
        },
      },
      tokenUserA
    );
    const signRes = await handleSignUpload(signDocReq);
    assert.ok(signRes, "Response must be defined");
    assert.strictEqual(signRes.status, 200);
    const signData = await signRes.json();

    assert.strictEqual(signData.success, true);
    assert.strictEqual(signData.type, "authenticated", "Private documents must have type 'authenticated'");
    assert.strictEqual(signData.folder, `campushive/private_docs/${testUserAId}`, "Folder must be scoped to user ID");
    assert.strictEqual(signData.apiKey, process.env.CLOUDINARY_API_KEY);
    assert.ok(signData.allowedFormats, "allowedFormats must be signed into parameters");
    assert.ok(signData.signature, "Signature must be present");
    assert.ok(
      signData.assetVerificationToken || signData.verificationToken,
      "Verification token must be present"
    );

    // Verify signature math: SHA-1 of sorted params + API secret
    const sigMap: Record<string, string> = {
      allowed_formats: signData.allowedFormats,
      folder: signData.folder,
      max_file_size: String(signData.maxFileSize),
      public_id: signData.publicId,
      timestamp: String(signData.timestamp),
      type: signData.type,
    };
    const expectedParams = Object.keys(sigMap)
      .sort()
      .map((k) => `${k}=${sigMap[k]}`)
      .join("&");
    const expectedSig = crypto
      .createHash("sha1")
      .update(expectedParams + process.env.CLOUDINARY_API_SECRET)
      .digest("hex");
    assert.strictEqual(signData.signature, expectedSig, "Cloudinary signature must match canonical SHA-1 spec");
    console.log("  PASS: Folder is isolated to user and Cloudinary signature matches canonical spec");

    // -------------------------------------------------------------------------
    // TEST 5: Rate Limiting on Sign Endpoint
    // -------------------------------------------------------------------------
    console.log("\nTEST 5: Rate limiting protects /api/upload/sign");
    const rateLimitUserId = new mongoose.Types.ObjectId().toHexString();
    const rateLimitToken = createAccessToken({
      id: rateLimitUserId,
      name: "Spam Bot",
      email: "bot@campushive.edu.ng",
      role: "buyer" as any,
      isStudent: true,
      studentVerified: true,
    });

    let hit429 = false;
    for (let i = 0; i < 35; i++) {
      const req = makeMockRequest(
        "/api/upload/sign",
        {
          method: "POST",
          headers: { "x-forwarded-for": "198.51.100.99" },
          body: { purpose: "avatar" },
        },
        rateLimitToken
      );
      const res = await handleSignUpload(req);
      if (res && res.status === 429) {
        hit429 = true;
        break;
      }
    }
    assert.ok(hit429, "Rate limiter must return 429 after exceeding quota");
    console.log("  PASS: 429 Too Many Requests triggered under burst traffic");

    // -------------------------------------------------------------------------
    // TEST 6: Structural URL Parsing & Attack Vectors (Check 2)
    // -------------------------------------------------------------------------
    console.log("\nTEST 6: Structural URL parsing rejects lookalikes, cross-tenant, traversal & manipulated IDs");
    
    // 6a. Valid structured URL
    const validUuid = crypto.randomUUID();
    const aliceAvatarUrl = `https://res.cloudinary.com/campushive_cloud_prod/image/upload/v1234567/campushive/users/${testUserAId}/avatar_${validUuid}.jpg`;
    const aliceValid = parseAndValidateCloudinaryUrl(aliceAvatarUrl, testUserAId, "avatar");
    assert.strictEqual(aliceValid.valid, true, "Valid Cloudinary URL must pass structural validation");
    assert.strictEqual(aliceValid.asset?.userId, testUserAId);
    assert.strictEqual(aliceValid.asset?.extension, ".jpg");

    // 6b. Lookalike domain (e.g. evil.com/res.cloudinary.com)
    const lookalikeDomain = `https://evil.com/res.cloudinary.com/campushive_cloud_prod/image/upload/v1/campushive/users/${testUserAId}/avatar_${validUuid}.jpg`;
    assert.strictEqual(parseAndValidateCloudinaryUrl(lookalikeDomain, testUserAId, "avatar").valid, false);

    // 6c. Phishing subdomain (e.g. res.cloudinary.com.attacker.com)
    const phishingSubdomain = `https://res.cloudinary.com.attacker.com/campushive_cloud_prod/image/upload/v1/campushive/users/${testUserAId}/avatar_${validUuid}.jpg`;
    assert.strictEqual(parseAndValidateCloudinaryUrl(phishingSubdomain, testUserAId, "avatar").valid, false);

    // 6d. Cross-tenant Cloudinary account (attacker_cloud instead of campushive_cloud_prod)
    const crossTenantUrl = `https://res.cloudinary.com/attacker_cloud/image/upload/v1/campushive/users/${testUserAId}/avatar_${validUuid}.jpg`;
    assert.strictEqual(parseAndValidateCloudinaryUrl(crossTenantUrl, testUserAId, "avatar").valid, false);

    // 6e. Path traversal (attempting to jump user boundary)
    const traversalUrl = `https://res.cloudinary.com/campushive_cloud_prod/image/upload/v1/campushive/users/${testUserAId}/../../${testUserBId}/avatar_${validUuid}.jpg`;
    assert.strictEqual(parseAndValidateCloudinaryUrl(traversalUrl, testUserAId, "avatar").valid, false);

    // 6f. Cross-account asset assignment (Bob claiming Alice's valid URL)
    const crossAccountResult = parseAndValidateCloudinaryUrl(aliceAvatarUrl, testUserBId, "avatar");
    assert.strictEqual(crossAccountResult.valid, false, "Bob claiming Alice's asset must fail");
    assert.ok(crossAccountResult.error?.includes("Asset does not belong to user"));

    // 6g. Delivery type manipulation: attempt to pass private authenticated document as public avatar
    const wrongDeliveryType = `https://res.cloudinary.com/campushive_cloud_prod/image/authenticated/v1/campushive/users/${testUserAId}/avatar_${validUuid}.jpg`;
    assert.strictEqual(parseAndValidateCloudinaryUrl(wrongDeliveryType, testUserAId, "avatar").valid, false);

    // 6h. Manipulated public ID (e.g. missing avatar_ prefix)
    const manipulatedIdUrl = `https://res.cloudinary.com/campushive_cloud_prod/image/upload/v1/campushive/users/${testUserAId}/malicious_id_${validUuid}.jpg`;
    assert.strictEqual(parseAndValidateCloudinaryUrl(manipulatedIdUrl, testUserAId, "avatar").valid, false);

    console.log("  PASS: All 7 URL attack vectors structurally parsed and strictly blocked");

    // -------------------------------------------------------------------------
    // TEST 7: Private Document Access Control & Isolation (Check 3)
    // -------------------------------------------------------------------------
    console.log("\nTEST 7: Private document access control & signed delivery enforcement");
    
    const docUuid = crypto.randomUUID();
    const privateDocUrl = `https://res.cloudinary.com/campushive_cloud_prod/image/authenticated/v12345/campushive/private_docs/${testUserAId}/business_document_${docUuid}.pdf`;

    // 7a. Unauthorized user (Bob) requests signed delivery URL for Alice's document -> 403
    const bobAccessReq = makeMockRequest(
      "/api/documents/sign-access",
      {
        method: "POST",
        body: { documentUrl: privateDocUrl },
      },
      tokenUserB
    );
    const bobAccessRes = await handleSignDocumentAccess(bobAccessReq);
    assert.ok(bobAccessRes);
    assert.strictEqual(bobAccessRes.status, 403, "Bob cannot access Alice's private document");

    // 7b. Legitimate document owner (Alice) requests signed delivery URL -> 200 with time-limited signed URL
    const aliceAccessReq = makeMockRequest(
      "/api/documents/sign-access",
      {
        method: "POST",
        body: { documentUrl: privateDocUrl },
      },
      tokenUserA
    );
    const aliceAccessRes = await handleSignDocumentAccess(aliceAccessReq);
    assert.ok(aliceAccessRes);
    assert.strictEqual(aliceAccessRes.status, 200, "Alice can access her own private document");
    const aliceAccessData = await aliceAccessRes.json();
    assert.strictEqual(aliceAccessData.success, true);
    assert.ok(aliceAccessData.signedUrl.includes("/authenticated/s--"), "Must include Cloudinary HMAC delivery signature");

    // 7c. Platform Administrator requests signed delivery URL for Alice's document -> 200
    const adminAccessReq = makeMockRequest(
      "/api/documents/sign-access",
      {
        method: "POST",
        body: { documentUrl: privateDocUrl },
      },
      tokenAdmin
    );
    const adminAccessRes = await handleSignDocumentAccess(adminAccessReq);
    assert.ok(adminAccessRes);
    assert.strictEqual(adminAccessRes.status, 200, "Admin can authorize private document view for review");

    // 7d. Public listing endpoints strictly reject private documents
    const createListingReq = makeMockRequest(
      "/api/listings",
      {
        method: "POST",
        body: {
          title: "Calculus Textbook 9th Edition",
          description: "Excellent condition textbook for MTH 101",
          price: 5000,
          category: "Textbooks",
          campus: "ABU Zaria",
          location: "Main Campus",
          condition: "Used - Fair",
          listingType: "product",
          images: [privateDocUrl], // Infiltrating private doc!
        },
      },
      tokenUserA
    );
    const createListingRes = await handleCreateListing(createListingReq);
    assert.ok(createListingRes, "Response must be defined");
    assert.strictEqual(createListingRes.status, 400, "Listing creation with private document must return 400");
    const createListingJson = await createListingRes.json();
    assert.ok(
      createListingJson.error.toLowerCase().includes("private business documents") ||
      createListingJson.error.toLowerCase().includes("private document")
    );

    console.log("  PASS: Private document access strictly gated; public APIs leak zero private URLs");

    // -------------------------------------------------------------------------
    // TEST 8: Actual Asset Verification Before Attachment (Check 1)
    // -------------------------------------------------------------------------
    console.log("\nTEST 8: Actual asset verification before listing / profile attachment");

    // 8a. Legitimate listing creation with properly scoped listing image
    const listingImgUuid = crypto.randomUUID();
    const legitimateImg = `https://res.cloudinary.com/campushive_cloud_prod/image/upload/v12345/campushive/listings/${testUserAId}/listing_image_${listingImgUuid}.jpg`;
    const legitListingReq = makeMockRequest(
      "/api/listings",
      {
        method: "POST",
        body: {
          title: "Calculus Textbook 9th Edition",
          description: "Excellent condition textbook for MTH 101",
          price: 5000,
          category: "Textbooks",
          campus: "ABU Zaria",
          location: "Main Campus",
          condition: "Used - Fair",
          listingType: "product",
          images: [legitimateImg],
        },
      },
      tokenUserA
    );
    const legitListingRes = await handleCreateListing(legitListingReq);
    assert.ok(legitListingRes, "Response must be defined");
    assert.strictEqual(legitListingRes.status, 201, "Legitimate listing creation should succeed");
    const legitListingData = await legitListingRes.json();
    const listingId = legitListingData.data._id || legitListingData.data.id;

    // 8b. Attempt to PATCH listing with Bob's listing image -> rejected 403
    const bobImgUuid = crypto.randomUUID();
    const bobsListingImg = `https://res.cloudinary.com/campushive_cloud_prod/image/upload/v12345/campushive/listings/${testUserBId}/listing_image_${bobImgUuid}.jpg`;
    const patchListingReq = makeMockRequest(
      `/api/listings/${listingId}`,
      {
        method: "PATCH",
        body: {
          images: [bobsListingImg],
        },
      },
      tokenUserA
    );
    const patchRes = await handlePatchListing(patchListingReq, {
      params: Promise.resolve({ id: listingId.toString() }),
    });
    assert.ok(patchRes, "Response must be defined");
    assert.strictEqual(patchRes.status, 403, "PATCH with another user's image must return 403");

    // 8c. Profile update enforces avatar ownership
    await UserModel.findOneAndUpdate(
      { _id: testUserAId },
      {
        _id: testUserAId,
        name: "Alice Real",
        email: "alice_real@campushive.edu.ng",
        role: "buyer",
        accountStatus: "active",
      },
      { upsert: true, returnDocument: "after" }
    );

    const updateAliceAvatarReq = makeMockRequest(
      "/api/users/profile",
      {
        method: "PATCH",
        body: {
          avatar: aliceAvatarUrl,
        },
      },
      tokenUserA
    );
    const updateAliceAvatarRes = await handleUpdateProfile(updateAliceAvatarReq);
    assert.ok(updateAliceAvatarRes, "Response must be defined");
    assert.strictEqual(updateAliceAvatarRes.status, 200, "Updating avatar with own valid path must succeed");
    const updatedUser = await UserModel.findById(testUserAId);
    assert.strictEqual(updatedUser?.profile?.avatar, aliceAvatarUrl);

    console.log("  PASS: Server verifies asset ownership before attaching to listings and profiles");

    // -------------------------------------------------------------------------
    // TEST 9: Permanently Closed Legacy Express Endpoint (Check 4)
    // -------------------------------------------------------------------------
    console.log("\nTEST 9: Closed legacy Express upload endpoint returns 410 Gone");
    
    // Simulate Express request to legacy upload router
    let expressStatus = 0;
    let expressBody: any = null;
    const mockExpressReq = { method: "POST", url: "/" } as any;
    const mockExpressRes = {
      status(code: number) {
        expressStatus = code;
        return this;
      },
      json(data: any) {
        expressBody = data;
        return this;
      },
    } as any;

    legacyUploadRouter.handle(mockExpressReq, mockExpressRes, () => {});
    assert.strictEqual(expressStatus, 410, "Legacy Express upload route must return 410 Gone");
    assert.strictEqual(expressBody.success, false);
    assert.ok(expressBody.error.includes("Gone"));
    console.log("  PASS: Legacy Express upload route is permanently closed with 410 Gone");

    // Clean up test listing
    if (listingId) {
      await ListingModel.deleteOne({ _id: listingId });
    }
    await UserModel.deleteOne({ _id: testUserAId });

    console.log("\n====================================================================");
    console.log(" ALL 9 PHASE 4.2 ACCEPTANCE & SECURITY CHECKS PASSED! ");
    console.log("====================================================================\n");
  } finally {
    if (mongod) {
      await mongoose.disconnect();
      await mongod.stop();
    }
    process.env = originalEnv;
  }
}

runUploadSecurityTests().catch((err) => {
  console.error("FATAL: Upload security test suite failed:", err);
  process.exit(1);
});
