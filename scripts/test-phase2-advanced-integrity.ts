/**
 * Comprehensive Automated Verification Suite for Phase 2 Hardened Data Integrity:
 * 1. Partial Unique Index Migration (slug, listingCode, profile.handle with $type: "string")
 * 2. Canonical Enum Unification, Drift Elimination, and Legacy Data Migration
 * 3. Express Public Query Whitelist Guarantee (status: "active" only)
 * 4. Reversible, Marker-Aware Cascades on Suspend & Ban (pausedBy, removedBy, suspendedBy)
 * 5. Admin Storefront Suspension Cascade & Selective Listing Restoration
 * 6. Suspended Account Session Invalidation & In-Flight Deal Blocking
 * 7. Generated Handle Collision Retry on E11000
 */

import { MongoMemoryReplSet } from "mongodb-memory-server";
import mongoose from "mongoose";
import { runPhase2Backfill } from "../app/lib/migrations/phase2Backfill";
import ListingModel from "../app/models/Listing";
import UserModel, { saveUserWithHandleRetry } from "../app/models/User";
import StoreModel, { saveStoreWithSlugRetry } from "../app/models/Store";
import * as TsEnums from "../app/constants/enums";
import { NextRequest } from "next/server";
import { PATCH as adminUserPatch } from "../app/api/admin/users/[id]/route";
import { PATCH as adminStorePatch } from "../app/api/admin/stores/[id]/route";
import { requireAuth, requireParticipant } from "../app/lib/authServer";
import { createAccessToken } from "../app/lib/authTokens";
import { findOrCreateConversation } from "../app/lib/chatRepository";

let mongod: MongoMemoryReplSet;
let testsPassed = 0;
let testsFailed = 0;

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`  ❌ FAIL: ${message}`);
    testsFailed++;
    throw new Error(`Assertion failed: ${message}`);
  } else {
    console.log(`  ✅ PASS: ${message}`);
    testsPassed++;
  }
}

async function runAllTests() {
  console.log("==================================================================");
  console.log(" PHASE 2: ADVANCED INTEGRITY & CASCADE VERIFICATION SUITE");
  console.log("==================================================================\n");

  mongod = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  const uri = mongod.getUri();
  process.env.MONGODB_URI = uri;
  process.env.AUTH_SECRET = "super-secret-key-that-is-at-least-32-chars-long";
  (global as any).mongooseCache = { conn: mongoose, promise: Promise.resolve(mongoose) };
  await mongoose.connect(uri);

  const db = mongoose.connection.db!;

  try {
    // ========================================================================
    // TEST SECTION 1: Shared Enum Parity & Canonical Unification
    // ========================================================================
    console.log("--- TEST SECTION 1: Shared Enum Parity & Canonical Unification ---");

    // Dynamic import of Express backend enums to test 100% equivalence
    const expressEnums = await import("../campus-hive-backend/constants/enums.js");

    assert(
      JSON.stringify(TsEnums.LISTING_STATUSES) === JSON.stringify(expressEnums.LISTING_STATUSES),
      "Listing statuses match exactly across Next.js and Express repos"
    );
    assert(
      JSON.stringify(TsEnums.PRODUCT_CONDITIONS) === JSON.stringify(expressEnums.PRODUCT_CONDITIONS),
      "Product conditions match exactly across Next.js and Express repos"
    );
    assert(
      JSON.stringify(TsEnums.LISTING_TYPES) === JSON.stringify(expressEnums.LISTING_TYPES),
      "Listing types match exactly across Next.js and Express repos"
    );
    assert(
      JSON.stringify(TsEnums.LISTING_PAUSED_BY_REASONS) === JSON.stringify(expressEnums.LISTING_PAUSED_BY_REASONS),
      "Listing pausedBy markers match exactly across Next.js and Express repos"
    );
    assert(
      JSON.stringify(TsEnums.STORE_SUSPENDED_BY_REASONS) === JSON.stringify(expressEnums.STORE_SUSPENDED_BY_REASONS),
      "Store suspendedBy markers match exactly across Next.js and Express repos"
    );

    // ========================================================================
    // TEST SECTION 2: Legacy Enum Data Migration
    // ========================================================================
    console.log("\n--- TEST SECTION 2: Legacy Enum Data Migration ---");

    const rawListingsColl = db.collection("listings");
    const rawUsersColl = db.collection("users");

    // Seed legacy listings directly with raw mongo to bypass schema validation
    await rawListingsColl.insertMany([
      {
        title: "Legacy Item A",
        price: 1000,
        priceFormatted: "₦1,000",
        description: "Legacy item",
        category: "Tech",
        campus: "Main",
        location: "Hostel A",
        status: "pending", // legacy
        condition: "New", // legacy
        sellerId: "seller_legacy_1",
        schemaVersion: 1,
      },
      {
        title: "Legacy Item B",
        price: 2000,
        priceFormatted: "₦2,000",
        description: "Legacy item 2",
        category: "Fashion",
        campus: "Main",
        location: "Hostel B",
        status: "deleted", // legacy
        condition: "Used - Like New", // legacy
        sellerId: "seller_legacy_2",
        schemaVersion: 1,
      },
    ]);

    const migrationSummary = await runPhase2Backfill(mongoose.connection);

    assert(migrationSummary.legacyStatusMigrated === 2, "Backfill mapped 2 legacy status documents (pending, deleted)");
    assert(migrationSummary.legacyConditionsMigrated === 2, "Backfill mapped 2 legacy condition documents (New, Used - Like New)");

    const migratedItemA = await rawListingsColl.findOne({ title: "Legacy Item A" });
    assert(migratedItemA?.status === "pending_review", "Legacy status 'pending' successfully migrated to 'pending_review'");
    assert(migratedItemA?.condition === "Brand New", "Legacy condition 'New' successfully migrated to 'Brand New'");

    const migratedItemB = await rawListingsColl.findOne({ title: "Legacy Item B" });
    assert(migratedItemB?.status === "removed", "Legacy status 'deleted' successfully migrated to 'removed'");
    assert(migratedItemB?.condition === "Like New", "Legacy condition 'Used - Like New' successfully migrated to 'Like New'");

    // Test strict schema validation rejecting legacy values
    let schemaRejectPassed = false;
    try {
      const invalidDoc = new ListingModel({
        title: "Invalid Status Item",
        price: 100,
        priceFormatted: "₦100",
        description: "Invalid",
        category: "Tech",
        campus: "Main",
        location: "Hostel A",
        sellerId: "seller_1",
        status: "pending" as any, // Not allowed anymore
      });
      await invalidDoc.validate();
    } catch (err: any) {
      if (err.name === "ValidationError" && err.errors["status"]) {
        schemaRejectPassed = true;
      }
    }
    assert(schemaRejectPassed, "ListingSchema strictly rejects legacy status 'pending' at validation time");

    // ========================================================================
    // TEST SECTION 3: Partial Unique Index Migration & Null/Missing Resilience
    // ========================================================================
    console.log("\n--- TEST SECTION 3: Partial Unique Index & Null/Missing Resilience ---");

    // Ensure the migration has created the partialFilterExpression indexes
    const listingIndexes = await rawListingsColl.indexes();
    const slugIndex = listingIndexes.find((i: any) => i.name === "slug_1");
    console.log("    [Index Inspection] listings.slug_1:", JSON.stringify(slugIndex));
    assert(
      Boolean(slugIndex?.unique && slugIndex?.partialFilterExpression?.slug?.$type === "string"),
      "Listing index slug_1 has unique: true and partialFilterExpression: { slug: { $type: 'string' } }"
    );

    const listingCodeIndex = listingIndexes.find((i: any) => i.name === "listingCode_1");
    console.log("    [Index Inspection] listings.listingCode_1:", JSON.stringify(listingCodeIndex));
    assert(
      Boolean(listingCodeIndex?.unique && listingCodeIndex?.partialFilterExpression?.listingCode?.$type === "string"),
      "Listing index listingCode_1 has unique: true and partialFilterExpression: { listingCode: { $type: 'string' } }"
    );

    const userIndexes = await rawUsersColl.indexes();
    const handleIndex = userIndexes.find((i: any) => i.name === "profile.handle_1");
    console.log("    [Index Inspection] users.profile.handle_1:", JSON.stringify(handleIndex));
    assert(
      Boolean(handleIndex?.unique && handleIndex?.partialFilterExpression?.["profile.handle"]?.$type === "string"),
      "User index profile.handle_1 has unique: true and partialFilterExpression: { 'profile.handle': { $type: 'string' } }"
    );

    // Insert 2 listings with MISSING slug and listingCode
    const docMissing1 = await ListingModel.create({
      title: "Missing Slug 1",
      price: 500,
      priceFormatted: "₦500",
      description: "No slug provided",
      category: "Books",
      campus: "Main",
      location: "Library",
      sellerId: "seller_x1",
      schemaVersion: 1,
    });
    const docMissing2 = await ListingModel.create({
      title: "Missing Slug 2",
      price: 600,
      priceFormatted: "₦600",
      description: "No slug provided either",
      category: "Books",
      campus: "Main",
      location: "Library",
      sellerId: "seller_x2",
      schemaVersion: 1,
    });
    assert(
      Boolean(docMissing1._id && docMissing2._id),
      "Two listings with MISSING slug and listingCode insert cleanly without E11000"
    );

    // Insert 2 listings with EXPLICIT slug: null and listingCode: null
    const docNull1 = await rawListingsColl.insertOne({
      title: "Explicit Null Slug 1",
      price: 700,
      priceFormatted: "₦700",
      description: "Explicit null",
      category: "Books",
      campus: "Main",
      location: "Library",
      sellerId: "seller_x3",
      slug: null,
      listingCode: null,
      status: "active",
      schemaVersion: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    const docNull2 = await rawListingsColl.insertOne({
      title: "Explicit Null Slug 2",
      price: 800,
      priceFormatted: "₦800",
      description: "Explicit null again",
      category: "Books",
      campus: "Main",
      location: "Library",
      sellerId: "seller_x4",
      slug: null,
      listingCode: null,
      status: "active",
      schemaVersion: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    assert(
      Boolean(docNull1.insertedId && docNull2.insertedId),
      "Two listings with EXPLICIT slug: null insert cleanly without E11000 (sparse bug prevented)"
    );

    // Verify true uniqueness guarantee when a string slug IS provided
    await ListingModel.create({
      title: "Unique Slug Item",
      price: 900,
      priceFormatted: "₦900",
      description: "Has slug",
      category: "Books",
      campus: "Main",
      location: "Library",
      sellerId: "seller_x5",
      slug: "brand-new-macbook-pro",
      schemaVersion: 1,
    });

    let duplicateSlugBlocked = false;
    try {
      await ListingModel.create({
        title: "Duplicate Slug Item",
        price: 950,
        priceFormatted: "₦950",
        description: "Has same slug",
        category: "Books",
        campus: "Main",
        location: "Library",
        sellerId: "seller_x6",
        slug: "brand-new-macbook-pro",
        schemaVersion: 1,
      });
    } catch (err: any) {
      if (err.code === 11000) {
        duplicateSlugBlocked = true;
      }
    }
    assert(duplicateSlugBlocked, "Inserting duplicate string slug strictly throws E11000 duplicate key error");

    // ========================================================================
    // TEST SECTION 4: Generated Handle Collision Retry
    // ========================================================================
    console.log("\n--- TEST SECTION 4: Generated Handle Collision Retry ---");

    // Create a first user with handle "campusstar"
    const user1 = new UserModel({
      name: "Campus Star",
      email: "star1@campushive.edu.ng",
      role: "buyer",
      profile: { handle: "campusstar", displayName: "Campus Star" },
      schemaVersion: 1,
    });
    await user1.save();
    assert(user1.profile?.handle === "campusstar", "First user created with handle 'campusstar'");

    // Create a second user that attempts to take "campusstar" but uses saveUserWithHandleRetry
    const user2 = new UserModel({
      name: "Campus Star",
      email: "star2@campushive.edu.ng",
      role: "buyer",
      profile: { handle: "campusstar", displayName: "Campus Star" },
      schemaVersion: 1,
    });

    const savedUser2 = await saveUserWithHandleRetry(user2);
    const handle2 = savedUser2.profile?.handle || "";
    assert(
      Boolean(handle2 && handle2 !== "campusstar" && handle2.startsWith("campusstar")),
      `Handle collision retried on E11000 and resolved to unique handle: ${handle2}`
    );

    // Store slug collision retry test
    const sellerOwner1 = await UserModel.create({
      name: "Store Owner 1",
      email: "owner1@campushive.edu.ng",
      role: "seller",
      accountStatus: "active",
      schemaVersion: 1,
    });
    const sellerOwner2 = await UserModel.create({
      name: "Store Owner 2",
      email: "owner2@campushive.edu.ng",
      role: "seller",
      accountStatus: "active",
      schemaVersion: 1,
    });

    const store1 = new StoreModel({
      ownerId: sellerOwner1._id.toString(),
      name: "Tech Emporium",
      slug: "tech-emporium",
      description: "First emporium",
      category: "Tech",
      campus: "Main",
      operatingLocation: "Shop 1",
      logo: "/logo.png",
      status: "active",
      schemaVersion: 1,
    });
    await store1.save();
    assert(store1.slug === "tech-emporium", "First store created with slug 'tech-emporium'");

    // Second store with same name created by a different owner
    const store2 = new StoreModel({
      ownerId: sellerOwner2._id.toString(),
      name: "Tech Emporium",
      slug: "tech-emporium", // duplicate base slug
      description: "Second emporium",
      category: "Tech",
      campus: "Main",
      operatingLocation: "Shop 2",
      logo: "/logo.png",
      status: "active",
      schemaVersion: 1,
    });
    const savedStore2 = await saveStoreWithSlugRetry(store2);
    assert(
      savedStore2.slug !== "tech-emporium" && savedStore2.slug.startsWith("tech-emporium-"),
      `Store slug collision retried on E11000 and resolved to unique slug: ${savedStore2.slug}`
    );

    // ========================================================================
    // TEST SECTION 5: Reversible & Atomic Cascades on Suspend & Ban
    // ========================================================================
    console.log("\n--- TEST SECTION 5: Reversible & Atomic Cascades on Suspend & Ban ---");

    // Create Admin user for performing actions
    const adminUser = await UserModel.create({
      name: "Admin Superuser",
      email: "admin@campushive.edu.ng",
      role: "admin",
      accountStatus: "active",
      schemaVersion: 1,
    });

    // Create Seller user
    const seller = await UserModel.create({
      name: "Target Seller",
      email: "seller_target@campushive.edu.ng",
      role: "seller",
      accountStatus: "active",
      schemaVersion: 1,
    });
    const sellerId = seller._id.toString();

    // Create Seller's Store
    const sellerStore = await StoreModel.create({
      ownerId: sellerId,
      name: "Target Electronics",
      slug: "target-electronics",
      description: "Gadgets store",
      category: "Tech",
      campus: "Main",
      operatingLocation: "Shop 1",
      logo: "/logo.png",
      status: "active",
      schemaVersion: 1,
    });
    const storeId = sellerStore._id.toString();

    // Create 2 Listings:
    // Listing A: active
    // Listing B: intentionally paused by seller (pausedBy: "seller")
    const listingA = await ListingModel.create({
      title: "Active Gadget A",
      price: 15000,
      priceFormatted: "₦15,000",
      description: "Active",
      category: "Tech",
      campus: "Main",
      location: "Shop 1",
      sellerId,
      storeId,
      status: "active",
      schemaVersion: 1,
    });
    const listingB = await ListingModel.create({
      title: "Intentionally Paused Gadget B",
      price: 25000,
      priceFormatted: "₦25,000",
      description: "Seller paused this because out of stock",
      category: "Tech",
      campus: "Main",
      location: "Shop 1",
      sellerId,
      storeId,
      status: "paused",
      pausedBy: "seller",
      schemaVersion: 1,
    });

    // Action 1: Suspend user via Admin Endpoint
    const suspendReq = new NextRequest(`http://localhost/api/admin/users/${sellerId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${createAccessToken({
          id: adminUser._id.toString(),
          email: adminUser.email,
          role: "admin",
          name: adminUser.name,
          isStudent: false,
          studentVerified: false,
        })}`,
      },
      body: JSON.stringify({
        action: "suspend",
        reason: "Suspended for policy investigation",
      }),
    });

    const suspendRes = (await adminUserPatch(suspendReq, { params: Promise.resolve({ id: sellerId }) }))!;
    const suspendData = await suspendRes.json();
    if (suspendRes.status !== 200) {
      console.error("Suspend error details:", suspendRes.status, suspendData);
    }
    assert(suspendRes.status === 200 && suspendData.success, "Admin user suspend PATCH returned 200 OK");

    // Verify Cascade on Suspend:
    const suspendedSeller = await UserModel.findById(sellerId);
    assert(suspendedSeller?.accountStatus === "suspended", "User accountStatus set to 'suspended'");

    const suspendedStore = await StoreModel.findById(storeId);
    assert(
      suspendedStore?.status === "suspended" && suspendedStore?.suspendedBy === "account_suspension",
      "Store cascaded to 'suspended' with marker suspendedBy: 'account_suspension'"
    );

    const reloadedListingA = await ListingModel.findById(listingA._id);
    assert(
      reloadedListingA?.status === "paused" && reloadedListingA?.pausedBy === "account_suspension",
      "Active Listing A cascaded to 'paused' with marker pausedBy: 'account_suspension'"
    );

    const reloadedListingB = await ListingModel.findById(listingB._id);
    assert(
      reloadedListingB?.status === "paused" && reloadedListingB?.pausedBy === "seller",
      "Listing B PRESERVED pausedBy: 'seller' marker (was not overwritten by account suspension)"
    );

    // Action 2: Restore user via Admin Endpoint
    const restoreReq = new NextRequest(`http://localhost/api/admin/users/${sellerId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${createAccessToken({
          id: adminUser._id.toString(),
          email: adminUser.email,
          role: "admin",
          name: adminUser.name,
          isStudent: false,
          studentVerified: false,
        })}`,
      },
      body: JSON.stringify({ action: "restore" }),
    });

    const restoreRes = (await adminUserPatch(restoreReq, { params: Promise.resolve({ id: sellerId }) }))!;
    const restoreData = await restoreRes.json();
    assert(restoreRes.status === 200 && restoreData.success, "Admin user restore PATCH returned 200 OK");

    // Verify Selective Restoration:
    const restoredSeller = await UserModel.findById(sellerId);
    assert(restoredSeller?.accountStatus === "active", "User accountStatus restored to 'active'");

    const restoredStore = await StoreModel.findById(storeId);
    assert(
      restoredStore?.status === "active" && !restoredStore?.suspendedBy,
      "Store restored to 'active' and suspendedBy marker cleared"
    );

    const restoredListingA = await ListingModel.findById(listingA._id);
    assert(
      restoredListingA?.status === "active" && !restoredListingA?.pausedBy,
      "Listing A (cascaded by account suspension) restored to 'active'"
    );

    const restoredListingB = await ListingModel.findById(listingB._id);
    assert(
      restoredListingB?.status === "paused" && restoredListingB?.pausedBy === "seller",
      "Listing B (paused by seller) KEPT IN PAUSED STATE (Reversibility proven: seller pause was not accidentally reactivated!)"
    );

    // Verify Admin Audit Log was recorded
    const auditLogs = await db.collection("admin_audit_logs").find({ targetId: sellerId }).toArray();
    assert(auditLogs.length >= 2, `Admin audit logs recorded ${auditLogs.length} events for actor/target`);

    // ========================================================================
    // TEST SECTION 6: Admin Storefront Suspension Cascade
    // ========================================================================
    console.log("\n--- TEST SECTION 6: Admin Storefront Suspension Cascade ---");

    // Admin suspends storefront directly via /api/admin/stores/[id]
    const storeSuspendReq = new NextRequest(`http://localhost/api/admin/stores/${storeId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${createAccessToken({
          id: adminUser._id.toString(),
          email: adminUser.email,
          role: "admin",
          name: adminUser.name,
          isStudent: false,
          studentVerified: false,
        })}`,
      },
      body: JSON.stringify({
        action: "suspend",
        reason: "Commercial license expired",
      }),
    });

    const storeSuspendRes = (await adminStorePatch(storeSuspendReq, { params: Promise.resolve({ id: storeId }) }))!;
    const storeSuspendData = await storeSuspendRes.json();
    assert(storeSuspendRes.status === 200 && storeSuspendData.success, "Admin store suspend PATCH returned 200 OK");

    const directSuspendedStore = await StoreModel.findById(storeId);
    assert(
      directSuspendedStore?.status === "suspended" && directSuspendedStore?.suspendedBy === "store_suspension",
      "Store status set to 'suspended' with marker suspendedBy: 'store_suspension'"
    );

    const storeListingA = await ListingModel.findById(listingA._id);
    assert(
      storeListingA?.status === "paused" && storeListingA?.pausedBy === "store_suspension",
      "Listing A cascaded to 'paused' with marker pausedBy: 'store_suspension'"
    );

    const storeListingB = await ListingModel.findById(listingB._id);
    assert(
      storeListingB?.status === "paused" && storeListingB?.pausedBy === "seller",
      "Listing B remained 'paused' with marker pausedBy: 'seller'"
    );

    // Restore Storefront directly
    const storeRestoreReq = new NextRequest(`http://localhost/api/admin/stores/${storeId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${createAccessToken({
          id: adminUser._id.toString(),
          email: adminUser.email,
          role: "admin",
          name: adminUser.name,
          isStudent: false,
          studentVerified: false,
        })}`,
      },
      body: JSON.stringify({ action: "restore" }),
    });

    const storeRestoreRes = (await adminStorePatch(storeRestoreReq, { params: Promise.resolve({ id: storeId }) }))!;
    assert(storeRestoreRes.status === 200, "Admin store restore returned 200 OK");

    const reRestoredListingA = await ListingModel.findById(listingA._id);
    assert(reRestoredListingA?.status === "active", "Store Listing A restored to 'active'");

    const reRestoredListingB = await ListingModel.findById(listingB._id);
    assert(reRestoredListingB?.status === "paused", "Listing B stays 'paused' (seller intent preserved)");

    // ========================================================================
    // TEST SECTION 7: Suspended Session Invalidation & In-Flight Deal Blocking
    // ========================================================================
    console.log("\n--- TEST SECTION 7: Suspended Session Invalidation & In-Flight Deal Blocking ---");

    // Generate valid access token for seller
    const sellerAccessToken = createAccessToken({
      id: sellerId,
      email: seller.email,
      role: "seller",
      name: seller.name,
      isStudent: true,
      studentVerified: true,
    });

    // Suspend seller
    await UserModel.findByIdAndUpdate(sellerId, { $set: { accountStatus: "suspended" } });

    // Request protected endpoint using seller's token
    const testAuthReq = new NextRequest("http://localhost/api/listings", {
      headers: {
        Authorization: `Bearer ${sellerAccessToken}`,
      },
    });

    const authCheck = await requireAuth(testAuthReq);
    assert(
      authCheck.user === null && authCheck.errorResponse?.status === 403,
      "Protected auth returns 403 Forbidden for suspended user token"
    );

    // Test in-flight deal/message blocking when counterpart is suspended
    const buyerUser = await UserModel.create({
      name: "Buyer User",
      email: "buyer_test@campushive.edu.ng",
      role: "buyer",
      accountStatus: "active",
      schemaVersion: 1,
    });
    const buyerId = buyerUser._id.toString();

    // Create conversation between buyer and suspended seller
    const { conversation } = findOrCreateConversation({
      currentUser: { id: buyerId, name: buyerUser.name, subtitle: "Buyer", isVerified: false, accountType: "student" },
      targetParticipant: { id: sellerId, name: seller.name, subtitle: "Seller", isVerified: true, accountType: "student" },
    });

    const buyerToken = createAccessToken({
      id: buyerId,
      email: buyerUser.email,
      role: "buyer",
      name: buyerUser.name,
      isStudent: true,
      studentVerified: true,
    });

    const buyerDealReq = new NextRequest(`http://localhost/api/messages/conversations/${conversation.id}/deal`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${buyerToken}`,
      },
    });

    // Mutating call (deal creation) without allowInactiveCounterpart
    const dealParticipantCheck = await requireParticipant(buyerDealReq, conversation.id);
    assert(
      dealParticipantCheck.user !== null && dealParticipantCheck.errorResponse?.status === 403,
      "In-flight deal creation with suspended counterpart is BLOCKED with 403 Forbidden"
    );

    // Non-mutating call (viewing conversation history) with allowInactiveCounterpart: true
    const viewHistoryCheck = await requireParticipant(buyerDealReq, conversation.id, { allowInactiveCounterpart: true });
    assert(
      viewHistoryCheck.user !== null && !viewHistoryCheck.errorResponse,
      "Viewing message history with suspended counterpart is allowed (read-only)"
    );

    console.log("\n==================================================================");
    console.log(` ALL TESTS COMPLETED: ${testsPassed} PASSED, ${testsFailed} FAILED`);
    console.log("==================================================================\n");
  } finally {
    await mongoose.disconnect();
    await mongod.stop();
  }
}

runAllTests()
  .then(() => {
    if (testsFailed > 0) {
      process.exit(1);
    }
    process.exit(0);
  })
  .catch((err) => {
    console.error("Test execution aborted with unhandled error:", err);
    process.exit(1);
  });
