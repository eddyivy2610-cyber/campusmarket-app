/**
 * Test Suite: Listing Moderation ($set) & Seller Edits (optimisticConcurrency -> 409)
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
  console.log(" LISTING MODERATION ($set) & OPTIMISTIC CONCURRENCY (409) SUITE");
  console.log("==================================================================\n");

  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  process.env.MONGODB_URI = uri;

  await mongoose.connect(uri);

  const { default: ListingModel } = await import("../app/models/Listing");
  const { default: UserModel } = await import("../app/models/User");
  const { createAuthToken } = await import("../app/lib/authTokens");
  const { PATCH: patchAdminListing } = await import("../app/api/admin/listings/[id]/route");
  const { PATCH: patchSellerListing } = await import("../app/api/listings/[id]/route");

  let passed = 0;
  function pass(msg: string) {
    passed++;
    console.log(`[PASS] ${msg}`);
  }

  try {
    await ListingModel.init();
    await UserModel.init();

    // ---------------- 1. Seed Seller and Admin ----------------
    console.log("--- 1. Seed Seller and Admin Accounts ---");
    const seller = await UserModel.create({
      name: "Emeka Seller",
      email: "emeka.seller@unn.edu.ng",
      role: "seller",
      accountStatus: "active",
      isStudent: true,
      studentVerified: true,
      campus: "University of Nigeria, Nsukka",
    });

    const admin = await UserModel.create({
      name: "Listing Moderator",
      email: "moderator@campushive.edu.ng",
      role: "admin",
      accountStatus: "active",
      isStudent: false,
      studentVerified: false,
    });

    const sellerToken = createAuthToken({
      id: seller._id.toString(),
      name: seller.name,
      email: seller.email,
      role: "seller",
      isStudent: true,
      studentVerified: true,
      campus: seller.campus,
    });

    const adminToken = createAuthToken({
      id: admin._id.toString(),
      name: admin.name,
      email: admin.email,
      role: "admin",
      isStudent: false,
      studentVerified: false,
    });

    pass("Seller and Admin seeded successfully");

    // ---------------- 2. Create Listing ----------------
    console.log("\n--- 2. Create Listing Document ---");
    const listing = await ListingModel.create({
      sellerId: seller._id.toString(),
      listingType: "product",
      title: "TI-84 Plus CE Graphing Calculator",
      price: 35000,
      priceFormatted: "₦35,000",
      description: "Clean graphing calculator with charging cable, perfectly working.",
      category: "Academics",
      campus: "University of Nigeria, Nsukka",
      location: "Franco Hostel",
      images: ["https://example.com/ti84.jpg"],
      condition: "Like New",
      status: "pending_review",
    });

    const listingId = listing._id.toString();
    assert(listing.__v === 0, "Initial listing document version __v is 0");
    pass("Listing created with status: 'pending_review' and __v: 0");

    // ---------------- 3. Admin Moderation via Targeted $set ----------------
    console.log("\n--- 3. Admin Moderation via Targeted $set ---");
    const adminReq = new NextRequest(`http://localhost:3000/api/admin/listings/${listingId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${adminToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "approve",
        notes: "Approved after verifying image clarity and item guidelines",
      }),
    });

    const adminRes = await patchAdminListing(adminReq, {
      params: Promise.resolve({ id: listingId }),
    });
    assert(adminRes !== undefined, "Admin route returned response");
    assert(adminRes.status === 200, `Admin moderation returned status 200, got ${adminRes.status}`);

    const adminJson = await adminRes.json();
    assert(adminJson.success === true, "Admin moderation succeeded");
    assert(adminJson.data.status === "active", "Listing status targeted to 'active'");
    assert(adminJson.data.reviewedBy === admin._id.toString(), "Admin ID saved in reviewedBy");
    assert(adminJson.data.moderationNotes.includes("Approved"), "moderationNotes saved");

    // Re-query database to verify targeted update
    const dbListing = await ListingModel.findById(listingId);
    assert(dbListing?.status === "active", "Database status updated to active");
    assert(dbListing?.title === "TI-84 Plus CE Graphing Calculator", "Unrelated fields preserved");
    pass("Admin moderation successfully executed via targeted $set (status: active)");

    // ---------------- 4. Sequential Seller Edit (Succeeds) ----------------
    console.log("\n--- 4. Sequential Seller Edit ---");
    const editReq1 = new NextRequest(`http://localhost:3000/api/listings/${listingId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${sellerToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        price: 32000,
        description: "Price dropped! Clean graphing calculator with cable.",
      }),
    });

    const editRes1 = await patchSellerListing(editReq1, {
      params: Promise.resolve({ id: listingId }),
    });
    assert(editRes1 !== undefined, "Seller route returned response");
    assert(editRes1.status === 200, `Sequential edit returned 200, got ${editRes1.status}`);

    const afterEdit1 = await ListingModel.findById(listingId);
    assert(afterEdit1?.price === 32000, "Price updated to 32000");
    assert(afterEdit1?.__v === 1, "optimisticConcurrency incremented version __v to 1");
    pass("Sequential seller edit succeeded and incremented document version to 1");

    // ---------------- 5. Concurrent Seller Edits -> 409 on VersionError ----------------
    console.log("\n--- 5. Concurrent Seller Edits (optimisticConcurrency -> 409) ---");
    
    // Simulate Tab A and Tab B reading the same document at version 1 concurrently
    const tabA_doc = await ListingModel.findById(listingId);
    const tabB_doc = await ListingModel.findById(listingId);
    assert(tabA_doc?.__v === 1 && tabB_doc?.__v === 1, "Both tabs read version 1 concurrently");

    // Tab A saves price change first -> increments __v to 2
    tabA_doc!.price = 30000;
    await tabA_doc!.save();

    const afterTabA = await ListingModel.findById(listingId);
    assert(afterTabA?.__v === 2, "Tab A saved successfully, bumping version __v to 2");

    // Tab B now calls seller route with outdated version or tries to save stale doc
    // Tab B's save will throw VersionError because its local __v is 1, but DB has __v: 2
    let versionErrorCaught = false;
    try {
      tabB_doc!.price = 28000;
      await tabB_doc!.save();
    } catch (err: any) {
      if (err.name === "VersionError" || err instanceof mongoose.Error.VersionError) {
        versionErrorCaught = true;
      }
    }
    assert(versionErrorCaught, "Mongoose threw VersionError on stale document save");
    pass("Mongoose optimisticConcurrency strictly detected concurrent edit and threw VersionError");

    // Now test that the seller PATCH endpoint catches VersionError and returns 409 Conflict
    // We mock/simulate a concurrent race during route execution:
    const raceListing = await ListingModel.create({
      sellerId: seller._id.toString(),
      listingType: "product",
      title: "Chemistry Lab Coat Size M",
      price: 8000,
      priceFormatted: "₦8,000",
      description: "White lab coat for chemistry practicals.",
      category: "Academics",
      campus: "University of Nigeria, Nsukka",
      location: "Science Complex",
      status: "active",
    });
    const raceId = raceListing._id.toString();

    // Trigger VersionError directly inside the seller route's save execution
    // by altering the DB version right before save
    const originalSave = ListingModel.prototype.save;
    let injectedRace = true;
    ListingModel.prototype.save = async function (this: any, ...args: any[]) {
      if (this._id.toString() === raceId && injectedRace) {
        injectedRace = false;
        // Bump version directly in database to simulate concurrent background update
        await ListingModel.collection.updateOne(
          { _id: this._id },
          { $inc: { __v: 1 }, $set: { description: "Concurrent update by another process" } }
        );
      }
      return originalSave.apply(this, args as any);
    };

    try {
      const raceReq = new NextRequest(`http://localhost:3000/api/listings/${raceId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${sellerToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          price: 7500,
        }),
      });

      const raceRes = await patchSellerListing(raceReq, {
        params: Promise.resolve({ id: raceId }),
      });

      assert(raceRes !== undefined, "Route returned response");
      assert(raceRes.status === 409, `Seller PATCH returned 409 Conflict on VersionError, got ${raceRes.status}`);

      const raceJson = await raceRes.json();
      assert(raceJson.success === false, "409 response has success: false");
      assert(raceJson.error.includes("Conflict"), "409 response explains concurrency conflict");
      pass("Seller PATCH route caught VersionError and successfully returned 409 Conflict");
    } finally {
      ListingModel.prototype.save = originalSave;
    }

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
