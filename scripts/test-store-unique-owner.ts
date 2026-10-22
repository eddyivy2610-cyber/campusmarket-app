/**
 * Test Suite: Phase 2 - Unique index on stores.ownerId & Error 11000 -> 409 mapping
 */

import { MongoMemoryServer } from "mongodb-memory-server";
import { strict as assert } from "node:assert";
import mongoose from "mongoose";
import { NextRequest } from "next/server";

process.env.AUTH_SECRET = "super-secret-test-key-at-least-32-chars-long";
process.env.JWT_SECRET = process.env.AUTH_SECRET;
process.env.SMTP_USER = "test@example.com";
process.env.SMTP_PASSWORD = "test-password";
process.env.ADMIN_REGISTRATION_KEY = "test-admin-reg-key-at-least-32-chars-long";

async function run() {
  console.log("==================================================================");
  console.log(" PHASE 2: DATA INTEGRITY & SCHEMA — STORES.OWNERID UNIQUE INDEX");
  console.log("==================================================================\n");

  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  process.env.MONGODB_URI = uri;

  await mongoose.connect(uri);

  const { default: StoreModel, ensureStoreIndexes, isDuplicateOwnerError } = await import("../app/models/Store");
  const { default: UserModel } = await import("../app/models/User");
  const { createAuthToken } = await import("../app/lib/authTokens");
  const { POST: createStoreRoute } = await import("../app/api/stores/route");

  let passed = 0;
  function pass(msg: string) {
    passed++;
    console.log(`[PASS] ${msg}`);
  }

  try {
    // ---------------- 1. Ensure Index Initialization ----------------
    console.log("--- 1. Unique index creation verification ---");
    await ensureStoreIndexes();
    await StoreModel.init();

    const indexes = await StoreModel.collection.indexes();
    const ownerIndex = indexes.find((idx: any) => idx.key && idx.key.ownerId === 1);
    
    assert(ownerIndex !== undefined, "Index on stores.ownerId exists in MongoDB");
    assert(ownerIndex.unique === true, "Index on stores.ownerId has unique: true constraint");
    pass("stores.ownerId has an active unique index in MongoDB");

    // ---------------- 2. Seed Verified Student User ----------------
    console.log("\n--- 2. Create initial storefront ---");
    const testUser = await UserModel.create({
      name: "Chidi Storefront Owner",
      email: "chidi.vendor@unilag.edu.ng",
      role: "seller",
      accountStatus: "active",
      isStudent: true,
      studentVerified: true,
      campus: "University of Lagos",
    });

    const token = createAuthToken({
      id: testUser._id.toString(),
      name: testUser.name,
      email: testUser.email,
      role: testUser.role as any,
      isStudent: testUser.isStudent,
      studentVerified: testUser.studentVerified,
      campus: testUser.campus,
    });

    const storePayload = {
      name: "Chidi Campus Gadgets",
      description: "Fast campus delivery for chargers, laptops, and student tech accessories.",
      category: "Electronics & Tech",
      campus: "University of Lagos",
      operatingLocation: "Moremi Hall Room 14",
      logo: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=200",
    };

    const firstReq = new NextRequest("http://localhost:3000/api/stores", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(storePayload),
    });

    const firstRes = await createStoreRoute(firstReq);
    assert(firstRes !== undefined, "Route returned a response");
    const firstData = await firstRes.json();

    assert(firstRes.status === 201, `First store created with 201, got ${firstRes.status}`);
    assert(firstData.success === true, "Store creation succeeded");
    assert(firstData.data.ownerId === testUser._id.toString(), "Store assigned strictly to authenticated user.id");
    pass("First storefront created successfully with 201 Created");

    // ---------------- 3. Duplicate Store Creation via API returns 409 ----------------
    console.log("\n--- 3. Duplicate store creation blocked via API (409) ---");
    const secondReq = new NextRequest("http://localhost:3000/api/stores", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...storePayload,
        name: "Chidi Second Storefront",
      }),
    });

    const secondRes = await createStoreRoute(secondReq);
    assert(secondRes !== undefined, "Route returned a response");
    const secondData = await secondRes.json();

    assert(secondRes.status === 409, `Second store attempt returned status 409, got ${secondRes.status}`);
    assert(secondData.success === false, "Duplicate store response success is false");
    assert(typeof secondData.error === "string" && secondData.error.length > 0, "Error explanation provided");
    pass("API successfully rejected second store with 409 Conflict");

    // ---------------- 4. MongoDB Direct Duplicate Key Violation (Error 11000) ----------------
    console.log("\n--- 4. MongoDB direct unique index error 11000 verification ---");
    let duplicateErrorThrown = false;
    let rawError: any = null;

    try {
      await StoreModel.collection.insertOne({
        ownerId: testUser._id.toString(),
        name: "Direct DB Store Duplicate",
        slug: "direct-db-store-duplicate",
        description: "Bypassing API directly into collection",
        storeType: "student_store",
        category: "Tech",
        campus: "University of Lagos",
        operatingLocation: "Library",
        logo: "https://example.com/logo.png",
        status: "active",
        isVerified: true,
        verificationType: "student",
        metrics: { rating: 5, reviewsCount: 0, completedDeals: 0, listingsCount: 0 },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } catch (err: any) {
      duplicateErrorThrown = true;
      rawError = err;
    }

    assert(duplicateErrorThrown, "MongoDB rejected direct insertion with duplicate ownerId");
    assert(rawError && rawError.code === 11000, `MongoDB threw error code 11000, got ${rawError?.code}`);
    pass("MongoDB database strictly enforced unique index on stores.ownerId and threw error 11000");

    // ---------------- 5. isDuplicateOwnerError Helper ----------------
    console.log("\n--- 5. isDuplicateOwnerError mapping verification ---");
    assert(isDuplicateOwnerError(rawError) === true, "isDuplicateOwnerError recognizes MongoServerError code 11000");
    assert(isDuplicateOwnerError({ code: 11000 }) === true, "isDuplicateOwnerError recognizes { code: 11000 }");
    assert(isDuplicateOwnerError({ message: "E11000 duplicate key error collection: campushive.stores index: ownerId_1 dup key" }) === true, "isDuplicateOwnerError recognizes E11000 message string");
    assert(isDuplicateOwnerError({ name: "MongoServerError", code: 11000 }) === true, "isDuplicateOwnerError recognizes MongoServerError with code 11000");
    assert(isDuplicateOwnerError(null) === false, "isDuplicateOwnerError returns false for null");
    assert(isDuplicateOwnerError(new Error("Generic validation failed")) === false, "isDuplicateOwnerError returns false for non-11000 errors");
    pass("isDuplicateOwnerError correctly maps all variants of error 11000 to true");

    console.log("\n==================================================================");
    console.log(` RESULTS: ${passed} PASSED | 0 FAILED`);
    console.log("==================================================================");
  } finally {
    await mongoose.disconnect();
    await mongod.stop();
  }
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Test failed with error:", err);
    process.exit(1);
  });
