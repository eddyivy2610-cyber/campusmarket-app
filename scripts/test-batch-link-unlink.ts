/**
 * Test Suite: Batch Link and Unlink with single updateMany and recount via $set
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
  console.log(" BATCH LINK & UNLINK: SINGLE updateMany & RECOUNT via $set SUITE");
  console.log("==================================================================\n");

  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  process.env.MONGODB_URI = uri;

  await mongoose.connect(uri);

  const { default: StoreModel, ensureStoreIndexes } = await import("../app/models/Store");
  const { default: UserModel } = await import("../app/models/User");
  const { default: ListingModel } = await import("../app/models/Listing");
  const { createAuthToken } = await import("../app/lib/authTokens");
  const { POST: postStoreListings, DELETE: deleteStoreListings } = await import(
    "../app/api/stores/[id]/listings/route"
  );

  let passed = 0;
  function pass(msg: string) {
    passed++;
    console.log(`[PASS] ${msg}`);
  }

  try {
    await ensureStoreIndexes();
    await StoreModel.init();
    await UserModel.init();
    await ListingModel.init();

    // ---------------- 1. Seed Seller User and Store ----------------
    console.log("--- 1. Seed Seller and Store ---");
    const seller = await UserModel.create({
      name: "Amina Merchant",
      email: "amina.vendor@futa.edu.ng",
      role: "seller",
      accountStatus: "active",
      isStudent: true,
      studentVerified: true,
      campus: "Federal University of Technology, Akure",
    });

    const otherUser = await UserModel.create({
      name: "Other User",
      email: "other@futa.edu.ng",
      role: "seller",
      accountStatus: "active",
      isStudent: true,
      studentVerified: true,
    });

    const store = await StoreModel.create({
      ownerId: seller._id.toString(),
      name: "Amina Tech Hub",
      slug: "amina-tech-hub",
      description: "Laptops, phones and campus accessories.",
      storeType: "student_store",
      category: "Tech",
      campus: "Federal University of Technology, Akure",
      operatingLocation: "Obakekere Hostel Block C",
      logo: "https://example.com/logo.jpg",
      status: "active",
      isVerified: true,
      verificationType: "student",
      metrics: { rating: 5, reviewsCount: 0, completedDeals: 0, listingsCount: 0 },
    });
    const storeId = store._id.toString();

    const sellerToken = createAuthToken({
      id: seller._id.toString(),
      name: seller.name,
      email: seller.email,
      role: "seller",
      isStudent: true,
      studentVerified: true,
      campus: seller.campus,
    });

    pass("Seller, other user, and store seeded successfully");

    // ---------------- 2. Seed Listings (Owned and Other) ----------------
    console.log("\n--- 2. Seed Listings ---");
    const item1 = await ListingModel.create({
      sellerId: seller._id.toString(),
      title: "MacBook Pro M1 16GB",
      price: 650000,
      priceFormatted: "₦650,000",
      description: "Clean laptop with original charger.",
      category: "Tech",
      campus: "FUTA",
      location: "Obakekere",
      status: "active",
    });

    const item2 = await ListingModel.create({
      sellerId: seller._id.toString(),
      title: "Dell XPS 13 9305",
      price: 450000,
      priceFormatted: "₦450,000",
      description: "Compact ultrabook.",
      category: "Tech",
      campus: "FUTA",
      location: "Obakekere",
      status: "active",
    });

    const item3 = await ListingModel.create({
      sellerId: seller._id.toString(),
      title: "Logitech MX Master 3",
      price: 65000,
      priceFormatted: "₦65,000",
      description: "Ergonomic wireless mouse.",
      category: "Tech",
      campus: "FUTA",
      location: "Obakekere",
      status: "active",
    });

    const foreignItem = await ListingModel.create({
      sellerId: otherUser._id.toString(),
      title: "Foreign Unowned Item",
      price: 20000,
      priceFormatted: "₦20,000",
      description: "Item owned by someone else.",
      category: "Tech",
      campus: "FUTA",
      location: "Hostel",
      status: "active",
    });

    pass("Seeded 3 owned listings and 1 foreign listing");

    // ---------------- 3. Batch Link via single updateMany & recount via $set ----------------
    console.log("\n--- 3. Batch Link Listings to Store ---");
    const linkReq = new NextRequest(`http://localhost:3000/api/stores/${storeId}/listings`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${sellerToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        listingIds: [
          item1._id.toString(),
          item2._id.toString(),
          item3._id.toString(),
          foreignItem._id.toString(), // foreign: must fail gracefully
        ],
      }),
    });

    const linkRes = await postStoreListings(linkReq, {
      params: Promise.resolve({ id: storeId }),
    });
    assert(linkRes !== undefined, "Link route returned response");
    assert(linkRes.status === 200, `Batch link returned status 200, got ${linkRes.status}`);

    const linkJson = await linkRes.json();
    assert(linkJson.success === true, "Link response success is true");
    assert(linkJson.associatedCount === 3, `Expected 3 associated, got ${linkJson.associatedCount}`);
    assert(linkJson.failed.length === 1, "Foreign item flagged in failed list");
    assert(linkJson.failed[0].id === foreignItem._id.toString(), "Foreign item rejected from linking");

    // Verify database listings updated with storeId
    const check1 = await ListingModel.findById(item1._id);
    const check2 = await ListingModel.findById(item2._id);
    const check3 = await ListingModel.findById(item3._id);
    assert(check1?.storeId === storeId, "Item 1 storeId linked");
    assert(check2?.storeId === storeId, "Item 2 storeId linked");
    assert(check3?.storeId === storeId, "Item 3 storeId linked");

    const foreignCheck = await ListingModel.findById(foreignItem._id);
    assert(!foreignCheck?.storeId, "Foreign item storeId remains empty");

    // Verify store recount via $set
    const dbStoreAfterLink = await StoreModel.findById(storeId).lean();
    assert(dbStoreAfterLink?.metrics?.listingsCount === 3, `Store recount via $set is 3, got ${dbStoreAfterLink?.metrics?.listingsCount}`);
    pass("Batch link successfully executed via single updateMany and recount via $set (count: 3)");

    // ---------------- 4. Batch Unlink via single updateMany & recount via $set ----------------
    console.log("\n--- 4. Batch Unlink Listings from Store ---");
    const unlinkBatchReq = new NextRequest(
      `http://localhost:3000/api/stores/${storeId}/listings?listingIds=${item1._id},${item2._id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${sellerToken}`,
        },
      }
    );

    const unlinkBatchRes = await deleteStoreListings(unlinkBatchReq, {
      params: Promise.resolve({ id: storeId }),
    });
    assert(unlinkBatchRes !== undefined, "Unlink batch route returned response");
    assert(unlinkBatchRes.status === 200, `Batch unlink returned 200, got ${unlinkBatchRes.status}`);

    const unlinkBatchJson = await unlinkBatchRes.json();
    assert(unlinkBatchJson.success === true, "Unlink batch success is true");
    assert(unlinkBatchJson.disassociatedCount === 2, `Expected 2 disassociated, got ${unlinkBatchJson.disassociatedCount}`);

    // Verify database listings unlinked
    const check1After = await ListingModel.findById(item1._id);
    const check2After = await ListingModel.findById(item2._id);
    const check3After = await ListingModel.findById(item3._id);
    assert(!check1After?.storeId, "Item 1 storeId unlinked");
    assert(!check2After?.storeId, "Item 2 storeId unlinked");
    assert(check3After?.storeId === storeId, "Item 3 remains linked");

    // Verify store recount via $set
    const dbStoreAfterUnlinkBatch = await StoreModel.findById(storeId).lean();
    assert(dbStoreAfterUnlinkBatch?.metrics?.listingsCount === 1, `Store recount via $set is 1, got ${dbStoreAfterUnlinkBatch?.metrics?.listingsCount}`);
    pass("Batch unlink successfully executed via single updateMany and recount via $set (count: 1)");

    // ---------------- 5. Single Unlink via query param listingId ----------------
    console.log("\n--- 5. Single Unlink via listingId Query Parameter ---");
    const singleUnlinkReq = new NextRequest(
      `http://localhost:3000/api/stores/${storeId}/listings?listingId=${item3._id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${sellerToken}`,
        },
      }
    );

    const singleUnlinkRes = await deleteStoreListings(singleUnlinkReq, {
      params: Promise.resolve({ id: storeId }),
    });
    assert(singleUnlinkRes !== undefined, "Single unlink returned response");
    assert(singleUnlinkRes.status === 200, `Single unlink returned 200, got ${singleUnlinkRes.status}`);

    const check3Final = await ListingModel.findById(item3._id);
    assert(!check3Final?.storeId, "Item 3 storeId unlinked");

    const dbStoreFinal = await StoreModel.findById(storeId).lean();
    assert(dbStoreFinal?.metrics?.listingsCount === 0, `Store recount via $set is 0, got ${dbStoreFinal?.metrics?.listingsCount}`);
    pass("Single unlink executed via updateMany and recount via $set (count: 0)");

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
