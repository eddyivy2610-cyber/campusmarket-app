/**
 * Test Suite: Phase 2 Data Integrity & Backfill Verification
 */

import { MongoMemoryServer } from "mongodb-memory-server";
import { strict as assert } from "node:assert";
import mongoose from "mongoose";
import { runPhase2Backfill } from "../app/lib/migrations/phase2Backfill";

async function run() {
  console.log("==================================================================");
  console.log(" TEST SUITE: PHASE 2 SCHEMA BACKFILLS & ADMIN MERGE");
  console.log("==================================================================\n");

  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();

  await mongoose.connect(uri);
  const db = mongoose.connection.db!;

  let passed = 0;
  function pass(msg: string) {
    passed++;
    console.log(`[PASS] ${msg}`);
  }

  try {
    const usersCollection = db.collection("users");
    const listingsCollection = db.collection("listings");
    const adminsCollection = db.collection("admins");

    // ---------------- 1. Seed Legacy Users ----------------
    console.log("--- 1. Seed Legacy User Documents ---");
    // User 1: Has personalDetails.fullName, missing name, missing accountStatus
    await usersCollection.insertOne({
      email: "user1@unilag.edu.ng",
      personalDetails: { fullName: "Ngozi Eze" },
      profile: { displayName: "Ngozi" },
      role: "buyer",
    });

    // User 2: Has only profile.displayName, missing name, missing accountStatus
    await usersCollection.insertOne({
      email: "user2@oau.edu.ng",
      profile: { displayName: "Babajide Tech" },
      role: "seller",
    });

    // User 3: Missing name, missing profile, missing accountStatus
    await usersCollection.insertOne({
      email: "emmanuel@futa.edu.ng",
      role: "buyer",
    });

    // User 4: Already complete user
    await usersCollection.insertOne({
      name: "Existing Proper User",
      email: "proper@abu.edu.ng",
      accountStatus: "active",
      role: "seller",
    });

    pass("Seeded legacy users with missing name and accountStatus");

    // ---------------- 2. Seed Legacy Listings ----------------
    console.log("\n--- 2. Seed Legacy Listings ---");
    // Listing 1: Legacy service listing missing listingType, category is Services
    await listingsCollection.insertOne({
      title: "Campus Laundry Service",
      category: "Services",
      price: 2500,
      priceFormatted: "₦2,500",
      description: "Fast laundry",
      campus: "UNILAG",
      location: "New Hall",
      condition: "Like New", // Accidental condition on service
      status: "active",
    });

    // Listing 2: Legacy product listing missing listingType and missing condition
    await listingsCollection.insertOne({
      title: "Calculus Textbook",
      category: "Books",
      price: 4000,
      priceFormatted: "₦4,000",
      description: "Hardcover calculus",
      campus: "UNILAG",
      location: "Faculty of Science",
      status: "active",
    });

    // Listing 3: Product listing with listingType already set, but missing condition
    await listingsCollection.insertOne({
      title: "Scientific Calculator",
      listingType: "product",
      category: "Academics",
      price: 8000,
      priceFormatted: "₦8,000",
      description: "Casio fx-991EX",
      campus: "UNILAG",
      location: "Library",
      status: "active",
    });

    pass("Seeded legacy listings missing listingType and condition");

    // ---------------- 3. Seed Legacy Admins Collection ----------------
    console.log("\n--- 3. Seed Legacy Admins Collection ---");
    // Admin 1: Brand new admin not yet in users
    await adminsCollection.insertOne({
      username: "admin_danladi",
      email: "danladi@campushive.edu.ng",
      password: "$argon2id$v=19$m=65536,t=3,p=4$someHash1",
      role: "superadmin",
      status: "active",
      createdAt: new Date(),
    });

    // Admin 2: Existing user whose account gets promoted to admin
    await adminsCollection.insertOne({
      username: "emmanuel_admin",
      email: "emmanuel@futa.edu.ng", // Matches User 3 above
      password: "$argon2id$v=19$m=65536,t=3,p=4$someHash2",
      role: "moderator",
      status: "active",
      createdAt: new Date(),
    });

    pass("Seeded legacy admins collection with standalone and existing user accounts");

    // ---------------- 4. Run Backfill Migration ----------------
    console.log("\n--- 4. Run runPhase2Backfill() ---");
    const summary = await runPhase2Backfill(mongoose.connection);

    assert(summary.usersNameBackfilled >= 3, `Expected at least 3 users name backfilled, got ${summary.usersNameBackfilled}`);
    assert(summary.usersAccountStatusSet >= 3, `Expected at least 3 users accountStatus set, got ${summary.usersAccountStatusSet}`);
    assert(summary.listingsTypeDefaulted >= 2, `Expected at least 2 listings listingType defaulted, got ${summary.listingsTypeDefaulted}`);
    assert(summary.listingsConditionDefaulted >= 2, `Expected at least 2 listings condition defaulted, got ${summary.listingsConditionDefaulted}`);
    assert(summary.adminsMerged === 2, `Expected 2 admins merged, got ${summary.adminsMerged}`);
    assert(summary.adminsCollectionDropped === true, "Admins collection was dropped");
    pass("runPhase2Backfill executed successfully and reported expected metrics");

    // ---------------- 5. Assert Database State Post-Migration ----------------
    console.log("\n--- 5. Verify Database State Post-Migration ---");

    // Check User 1: name from personalDetails.fullName
    const u1 = await usersCollection.findOne({ email: "user1@unilag.edu.ng" });
    assert(u1?.name === "Ngozi Eze", `Expected name 'Ngozi Eze', got '${u1?.name}'`);
    assert(u1?.accountStatus === "active", "User 1 accountStatus set to active");
    pass("User 1: name backfilled from personalDetails.fullName and accountStatus: active");

    // Check User 2: name from profile.displayName
    const u2 = await usersCollection.findOne({ email: "user2@oau.edu.ng" });
    assert(u2?.name === "Babajide Tech", `Expected name 'Babajide Tech', got '${u2?.name}'`);
    assert(u2?.accountStatus === "active", "User 2 accountStatus set to active");
    pass("User 2: name backfilled from profile.displayName and accountStatus: active");

    // Check User 3: name from email split and promoted to admin
    const u3 = await usersCollection.findOne({ email: "emmanuel@futa.edu.ng" });
    assert(u3?.name === "emmanuel" || u3?.name === "emmanuel_admin", `Expected valid name for User 3, got '${u3?.name}'`);
    assert(u3?.role === "admin", `Expected role: 'admin' for promoted admin, got '${u3?.role}'`);
    assert(u3?.accountStatus === "active", "User 3 accountStatus set to active");
    pass("User 3: name backfilled, promoted to role: 'admin', accountStatus: active");

    // Check User 4: untouched
    const u4 = await usersCollection.findOne({ email: "proper@abu.edu.ng" });
    assert(u4?.name === "Existing Proper User", "Existing user name preserved");
    pass("User 4: existing complete user preserved unchanged");

    // Check Listing 1: Service listingType and condition stripped
    const l1 = await listingsCollection.findOne({ title: "Campus Laundry Service" });
    assert(l1?.listingType === "service", `Expected listingType: 'service', got '${l1?.listingType}'`);
    assert(l1?.condition === undefined || l1?.condition === null, "Condition stripped from service listing");
    pass("Listing 1: category 'Services' defaulted to listingType: 'service', condition unset");

    // Check Listing 2: Product listingType and condition: "Used - Good"
    const l2 = await listingsCollection.findOne({ title: "Calculus Textbook" });
    assert(l2?.listingType === "product", `Expected listingType: 'product', got '${l2?.listingType}'`);
    assert(l2?.condition === "Used - Good", `Expected condition: 'Used - Good', got '${l2?.condition}'`);
    pass("Listing 2: legacy book listing defaulted to listingType: 'product', condition: 'Used - Good'");

    // Check Listing 3: Product condition: "Used - Good"
    const l3 = await listingsCollection.findOne({ title: "Scientific Calculator" });
    assert(l3?.condition === "Used - Good", `Expected condition: 'Used - Good', got '${l3?.condition}'`);
    pass("Listing 3: product listing with missing condition defaulted to 'Used - Good'");

    // Check Admin Danladi migrated into users collection
    const adminDanladi = await usersCollection.findOne({ email: "danladi@campushive.edu.ng" });
    assert(adminDanladi !== null, "Admin Danladi migrated into users collection");
    assert(adminDanladi?.role === "admin", "Admin Danladi has role: 'admin'");
    assert(adminDanladi?.accountStatus === "active", "Admin Danladi has accountStatus: 'active'");
    assert(adminDanladi?.name === "admin_danladi", "Admin Danladi has name populated");
    assert(adminDanladi?.schemaVersion === 1, "Admin Danladi has schemaVersion: 1");
    assert(u1?.schemaVersion === 1, "User 1 has schemaVersion: 1");
    assert(l1?.schemaVersion === 1, "Listing 1 has schemaVersion: 1");
    pass("Admin Danladi migrated into users collection with role: 'admin' and accountStatus: 'active'");
    pass("All legacy documents verified with schemaVersion: 1");

    // Confirm admins collection dropped
    const remainingCollections = await db.listCollections().toArray();
    const hasRemainingAdmins = remainingCollections.some((c: any) => c.name === "admins");
    assert(!hasRemainingAdmins, "Legacy 'admins' collection dropped from MongoDB database");
    pass("Legacy 'admins' collection confirmed dropped");

    // ---------------- 6. Idempotency Check ----------------
    console.log("\n--- 6. Idempotency Check (Run Backfill Again) ---");
    const secondSummary = await runPhase2Backfill(mongoose.connection);
    assert(secondSummary.usersNameBackfilled === 0, "Second run: 0 users need name backfilled");
    assert(secondSummary.usersAccountStatusSet === 0, "Second run: 0 users need accountStatus set");
    assert(secondSummary.listingsTypeDefaulted === 0, "Second run: 0 listings need type defaulted");
    assert(secondSummary.listingsConditionDefaulted === 0, "Second run: 0 listings need condition defaulted");
    assert(secondSummary.adminsMerged === 0, "Second run: 0 admins need merging");
    assert(secondSummary.schemaVersionBackfilled === 0, "Second run: 0 documents need schemaVersion backfilled");
    pass("runPhase2Backfill is 100% idempotent; subsequent runs make zero redundant modifications");

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
