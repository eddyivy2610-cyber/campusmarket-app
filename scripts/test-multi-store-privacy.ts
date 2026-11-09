/**
 * scripts/test-multi-store-privacy.ts
 *
 * Phase 5: Comprehensive Multi-Store Accounts, Private User Profiles,
 * and Store-Owned Listings Security & Concurrency Test Suite.
 */

import assert from "node:assert";
import mongoose from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import { NextRequest } from "next/server";
import dbConnect from "../app/lib/dbConnect";
import { createAccessToken } from "../app/lib/authTokens";
import UserModel from "../app/models/User";
import StoreModel, { checkStoresCountDrift } from "../app/models/Store";
import SlugRedirectModel from "../app/models/SlugRedirect";
import { ListingModel } from "../app/models/Listing";
import { OrderModel } from "../app/models/Order";
import ReviewModel from "../app/models/Review";
import { FollowerModel } from "../app/models/Follower";
import { BusinessApplicationModel } from "../app/models/BusinessApplication";
import { ConversationModel, MessageModel } from "../app/models/ChatModels";

import { GET as handleGetMyStores } from "../app/api/stores/me/route";
import { POST as handleCreateStore, GET as handleGetStores } from "../app/api/stores/route";
import {
  GET as handleGetStoreById,
  PATCH as handleUpdateStore,
  DELETE as handleDeleteStore,
} from "../app/api/stores/[id]/route";
import { POST as handleSubmitBusinessApp } from "../app/api/stores/business-application/route";
import { PATCH as handleAdminBusinessApp } from "../app/api/admin/business-applications/[id]/route";
import { PATCH as handleAdminStore } from "../app/api/admin/stores/[id]/route";
import { GET as handleGetListings, POST as handleCreateListing } from "../app/api/listings/route";
import {
  GET as handleGetListingById,
  PATCH as handleUpdateListing,
  DELETE as handleDeleteListing,
} from "../app/api/listings/[id]/route";
import {
  POST as handleBatchMoveListings,
  DELETE as handleBatchUnlinkListings,
} from "../app/api/stores/[id]/listings/route";
import { GET as handleGetUserProfile } from "../app/api/users/profile/route";
import { GET as handleCheckUsername } from "../app/api/users/check-username/route";
import { GET as handleGetFollowers } from "../app/api/follow/followers/[targetId]/route";
import { GET as handleGetFollowing } from "../app/api/follow/following/[targetId]/route";
import { POST as handleExplicitFollow } from "../app/api/follow/[targetId]/route";
import { GET as handleGetReviews, POST as handlePostReview } from "../app/api/reviews/route";
import { GET as handleGetOrders, POST as handleCreateOrder } from "../app/api/orders/route";
import { GET as handleGetConversations, POST as handleCreateConversation } from "../app/api/messages/conversations/route";
import { GET as handleGetSellerStats } from "../app/api/dashboard/seller-stats/route";
import { runMultiStorePrivacyMigration } from "./migrate-multi-store-privacy";

function makeReq(
  url: string,
  options: {
    method?: string;
    body?: any;
    token?: string;
    ip?: string;
  } = {}
): NextRequest {
  const headers = new Headers();
  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }
  if (options.ip) {
    headers.set("x-forwarded-for", options.ip);
  }
  if (options.body && typeof options.body === "object") {
    headers.set("Content-Type", "application/json");
  }
  const fullUrl = url.startsWith("http") ? url : `http://localhost:3000${url}`;
  return new NextRequest(fullUrl, {
    method: options.method || (options.body ? "POST" : "GET"),
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
}

async function runMultiStorePrivacyTests() {
  console.log("====================================================================");
  console.log("  PHASE 5: MULTI-STORE, PRIVATE PROFILES & STORE LISTINGS TEST SUITE ");
  console.log("====================================================================\n");

  let mongod: MongoMemoryReplSet | null = null;
  const originalEnv = { ...process.env };
  process.env.AUTH_SECRET = "test_multi_store_secret_key_with_at_least_32_characters_for_hmac!";

  try {
    mongod = await MongoMemoryReplSet.create({
      replSet: { count: 1, storageEngine: "wiredTiger" },
    });
    const uri = mongod.getUri();
    process.env.MONGODB_URI = uri;

    await mongoose.connect(uri);
    await dbConnect();

    await UserModel.init();
    await StoreModel.init();
    await SlugRedirectModel.init();
    await ListingModel.init();
    await OrderModel.init();
    await ReviewModel.init();
    await FollowerModel.init();
    await BusinessApplicationModel.init();
    await ConversationModel.init();
    await MessageModel.init();

    // Seed Users
    const alice = await UserModel.create({
      name: "Alice Adebayo",
      email: "alice@campushive.edu.ng",
      phone: "+2348011112222",
      role: "buyer",
      accountStatus: "active",
      emailVerified: true,
      isStudent: true,
      studentVerified: true,
      onboardingStep: "completed",
      storesCount: 0,
      studentStoresCount: 0,
      profile: {
        displayName: "Alice A.",
        avatar: "https://res.cloudinary.com/campushive/image/upload/v1/alice-avatar.jpg",
      },
      tokenVersion: 0,
    });

    const bob = await UserModel.create({
      name: "Bob Ibrahim",
      email: "bob@campushive.edu.ng",
      phone: "+2348033334444",
      role: "buyer",
      accountStatus: "active",
      emailVerified: true,
      isStudent: true,
      studentVerified: true,
      onboardingStep: "completed",
      storesCount: 0,
      studentStoresCount: 0,
      profile: {
        displayName: "Bob I.",
        avatar: "https://res.cloudinary.com/campushive/image/upload/v1/bob-avatar.jpg",
      },
      tokenVersion: 0,
    });

    const admin = await UserModel.create({
      name: "Eve Admin",
      email: "admin@campushive.edu.ng",
      role: "admin",
      accountStatus: "active",
      emailVerified: true,
      isStudent: false,
      studentVerified: true,
      onboardingStep: "completed",
      tokenVersion: 0,
    });

    const aliceId = alice._id.toString();
    const bobId = bob._id.toString();
    const adminId = admin._id.toString();

    const tokenAlice = createAccessToken({
      id: aliceId,
      name: alice.name,
      email: alice.email,
      role: alice.role as any,
      isStudent: true,
      studentVerified: true,
      tokenVersion: 0,
    });

    const tokenBob = createAccessToken({
      id: bobId,
      name: bob.name,
      email: bob.email,
      role: bob.role as any,
      isStudent: true,
      studentVerified: true,
      tokenVersion: 0,
    });

    const tokenAdmin = createAccessToken({
      id: adminId,
      name: admin.name,
      email: admin.email,
      role: "admin" as any,
      isStudent: false,
      studentVerified: true,
      tokenVersion: 0,
    });

    // -------------------------------------------------------------------------
    // TEST 1: Student Store Limit (Max 1 Student Store per User, Atomic Race Guard)
    // -------------------------------------------------------------------------
    console.log("TEST 1: Student Store Limit (Max 1 Student Store per User & Concurrency)");
    {
      const raceReqs = [1, 2, 3].map((i) =>
        handleCreateStore(
          makeReq("/api/stores", {
            method: "POST",
            token: tokenAlice,
            ip: `10.0.1.${i}`,
            body: {
              name: `Alice Campus Shop ${i}`,
              slug: `alice-campus-shop-${i}`,
              description: "Verified student gadgets and textbooks store on campus.",
              category: "Electronics",
              campus: "ABU Zaria",
              operatingLocation: "Samaru Main Gate",
              logo: "https://res.cloudinary.com/campushive/image/upload/v1/logo1.png",
            },
          })
        )
      );

      const raceRes = await Promise.all(raceReqs);
      const statuses = raceRes.map((r) => r.status);
      const count201 = statuses.filter((s) => s === 201).length;
      const count409 = statuses.filter((s) => s === 409).length;

      assert.strictEqual(count201, 1, `Expected exactly 1 student store creation to succeed (201), got ${statuses}`);
      assert.strictEqual(count409, 2, "Expected 2 concurrent student store creations to fail with 409 Conflict");

      const aliceDoc = await UserModel.findById(aliceId).lean();
      assert.strictEqual(aliceDoc?.studentStoresCount, 1, "studentStoresCount must be 1");
      assert.strictEqual(aliceDoc?.storesCount, 1, "storesCount must be 1");
      assert.strictEqual(aliceDoc?.role, "seller", "Opening a store derives role=seller");
      assert.strictEqual(aliceDoc?.email, "alice@campushive.edu.ng", "Personal identity email unchanged");
      assert.strictEqual(aliceDoc?.isStudent, true, "Student verification state unchanged");
      console.log("  PASS: Student store capped at 1 under concurrent requests; personal identity preserved");
    }

    // -------------------------------------------------------------------------
    // TEST 2: Business Store Approval Idempotency & 3-Store Cap Enforcement
    // -------------------------------------------------------------------------
    console.log("\nTEST 2: Business Store Approval Idempotency & Max 3 Stores Cap Enforcement");
    {
      // Submit 3 business applications for Alice (who already owns 1 student store)
      const appIds: string[] = [];
      for (let i = 1; i <= 3; i++) {
        const res = await handleSubmitBusinessApp(
          makeReq("/api/stores/business-application", {
            method: "POST",
            token: tokenAlice,
            ip: `10.0.2.${i}`,
            body: {
              businessName: `Alice Enterprise ${i}`,
              slug: `alice-enterprise-${i}`,
              businessCategory: "Electronics",
              campus: "ABU Zaria",
              operatingLocation: "No 12 Sokoto Road, Samaru, Zaria",
              contactPhone: "+2348011112222",
              contactEmail: "alice@campushive.edu.ng",
              notes: `Official CAC registered business store #${i} for campus delivery.`,
              cacNumber: `RC10000${i}`,
              supportingDocuments: [`https://res.cloudinary.com/campushive/image/upload/v1/cac-${i}.pdf`],
            },
          })
        );
        assert.strictEqual(res.status, 201, `Business app ${i} submission should return 201`);
        const json = await res.json();
        appIds.push(json.data._id.toString());
      }

      // Test concurrent approval of App #1 by 2 admins simultaneously -> idempotency guard!
      const [approve1A, approve1B] = await Promise.all([
        handleAdminBusinessApp(
          makeReq(`/api/admin/business-applications/${appIds[0]}`, {
            method: "PATCH",
            token: tokenAdmin,
            body: { action: "approve" },
          }),
          { params: Promise.resolve({ id: appIds[0] }) }
        ),
        handleAdminBusinessApp(
          makeReq(`/api/admin/business-applications/${appIds[0]}`, {
            method: "PATCH",
            token: tokenAdmin,
            body: { action: "approve" },
          }),
          { params: Promise.resolve({ id: appIds[0] }) }
        ),
      ]);

      const app1Statuses = [approve1A.status, approve1B.status].sort();
      assert.deepStrictEqual(
        app1Statuses,
        [200, 409],
        `Concurrent admin approvals of same application must return [200, 409], got ${app1Statuses}`
      );

      // Approve App #2 (brings Alice to 3 stores total: 1 student + 2 business)
      const approve2 = await handleAdminBusinessApp(
        makeReq(`/api/admin/business-applications/${appIds[1]}`, {
          method: "PATCH",
          token: tokenAdmin,
          body: { action: "approve" },
        }),
        { params: Promise.resolve({ id: appIds[1] }) }
      );
      assert.strictEqual(approve2.status, 200, "Second business store approval succeeds (total 3 stores)");

      // Approve App #3 -> MUST FAIL with 409 because Alice is at MAX_STORES_PER_USER = 3!
      const approve3 = await handleAdminBusinessApp(
        makeReq(`/api/admin/business-applications/${appIds[2]}`, {
          method: "PATCH",
          token: tokenAdmin,
          body: { action: "approve" },
        }),
        { params: Promise.resolve({ id: appIds[2] }) }
      );
      assert.strictEqual(approve3.status, 409, "4th store approval must fail with 409 Conflict (cap = 3)");

      // Also verify submitting a new business application while at cap fails with 409
      const overCapApp = await handleSubmitBusinessApp(
        makeReq("/api/stores/business-application", {
          method: "POST",
          token: tokenAlice,
          ip: "10.0.2.99",
          body: {
            businessName: "Alice OverCap Store",
            slug: "alice-overcap-store",
            businessCategory: "Electronics",
            campus: "ABU Zaria",
            operatingLocation: "Samaru Zaria",
            contactPhone: "+2348011112222",
            contactEmail: "alice@campushive.edu.ng",
            cacNumber: "RC999999",
            supportingDocuments: ["https://res.cloudinary.com/campushive/image/upload/v1/cac-99.pdf"],
          },
        })
      );
      assert.strictEqual(overCapApp.status, 409, "Submitting business app at 3-store cap must return 409");

      // Check GET /api/stores/me returns all 3 stores
      const meRes = await handleGetMyStores(makeReq("/api/stores/me", { token: tokenAlice }));
      assert.strictEqual(meRes.status, 200);
      const meJson = await meRes.json();
      assert.strictEqual(meJson.data.stores.length, 3, "GET /api/stores/me must return list of 3 stores");
      assert.strictEqual(meJson.data.storesCount, 3);
      assert.strictEqual(meJson.data.maxStores, 3);

      // Verify zero counter drift
      const drift = await checkStoresCountDrift();
      assert.strictEqual(drift.driftedUsers.length, 0, "checkStoresCountDrift must report 0 drift");
      console.log("  PASS: Business approval idempotency and 3-store cap verified with 0 counter drift");
    }

    const aliceStores = await StoreModel.find({ ownerId: aliceId, status: { $ne: "deleted" } }).lean();
    assert.strictEqual(aliceStores.length, 3);
    const aliceStudentStore = aliceStores.find((s) => s.storeType === "student_store")!;
    const aliceBizStore1 = aliceStores.find((s) => s.slug === "alice-enterprise-1")!;
    const aliceBizStore2 = aliceStores.find((s) => s.slug === "alice-enterprise-2")!;

    // Create 1 student store for Bob
    const bobStoreRes = await handleCreateStore(
      makeReq("/api/stores", {
        method: "POST",
        token: tokenBob,
        ip: "10.0.3.1",
        body: {
          name: "Bob Bookshop",
          slug: "bob-bookshop",
          description: "Textbooks and past questions for engineering students.",
          category: "Academics",
          campus: "ABU Zaria",
          operatingLocation: "Main Library",
          logo: "https://res.cloudinary.com/campushive/image/upload/v1/bob-logo.png",
        },
      })
    );
    assert.strictEqual(bobStoreRes.status, 201);
    const bobStore = (await bobStoreRes.json()).data;

    // -------------------------------------------------------------------------
    // TEST 3: Store-Owned Listings Enforcement & Batch Move Between Own Stores
    // -------------------------------------------------------------------------
    console.log("\nTEST 3: Store-Owned Listings Enforcement & Moving Listings Between Own Stores");
    let aliceListingId = "";
    {
      // 3a: Creating a listing without storeId fails with 400
      const noStoreRes = await handleCreateListing(
        makeReq("/api/listings", {
          method: "POST",
          token: tokenAlice,
          ip: "10.0.4.1",
          body: {
            title: "Storeless Listing",
            description: "Should fail validation",
            price: 5000,
            category: "Electronics",
            campus: "ABU Zaria",
            location: "Samaru",
            condition: "Used - Good",
            images: ["https://res.cloudinary.com/campushive/image/upload/v1/item1.jpg"],
          },
        })
      );
      assert.strictEqual(noStoreRes.status, 400, "Listing without storeId must be rejected with 400");

      // 3b: Creating a listing for another user's store fails with 403
      const idorCreateRes = await handleCreateListing(
        makeReq("/api/listings", {
          method: "POST",
          token: tokenAlice,
          ip: "10.0.4.2",
          body: {
            storeId: bobStore._id.toString(),
            title: "IDOR Listing Into Bob Store",
            description: "Should fail ownership check",
            price: 5000,
            category: "Electronics",
            campus: "ABU Zaria",
            location: "Samaru",
            condition: "Used - Good",
            images: ["https://res.cloudinary.com/campushive/image/upload/v1/item1.jpg"],
          },
        })
      );
      assert.strictEqual(idorCreateRes.status, 403, "Creating listing in another user's store must return 403");

      // 3c: Creating a valid listing in Alice's student store succeeds
      const validCreateRes = await handleCreateListing(
        makeReq("/api/listings", {
          method: "POST",
          token: tokenAlice,
          ip: "10.0.4.3",
          body: {
            storeId: aliceStudentStore._id.toString(),
            title: "HP Pavilion 15 Gaming Laptop",
            description: "16GB RAM, 512GB SSD, GTX 1650 in great condition.",
            price: 320000,
            category: "Electronics",
            campus: "ABU Zaria",
            location: "Samaru",
            condition: "Used - Good",
            images: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800"],
          },
        })
      );
      assert.strictEqual(validCreateRes.status, 201, "Valid store-owned listing creation succeeds with 201");
      const createdListing = (await validCreateRes.json()).data;
      aliceListingId = String(createdListing._id || createdListing.id);

      // Verify store metrics.listingsCount incremented to 1
      const s1AfterCreate = await StoreModel.findById(aliceStudentStore._id).lean();
      assert.strictEqual(s1AfterCreate?.metrics?.listingsCount, 1, "Student store listingsCount must be 1");

      // 3d: Unlinked query parameter is rejected with 400
      const unlinkedQueryRes = await handleGetListings(
        makeReq(`/api/listings?sellerId=${aliceId}&unlinked=true`)
      );
      assert.strictEqual(unlinkedQueryRes.status, 400, "GET /api/listings?unlinked=true must be rejected with 400");

      // 3e: Unlinking listings from a store (DELETE /api/stores/[id]/listings) is rejected with 400
      const unlinkRes = await handleBatchUnlinkListings(
        makeReq(`/api/stores/${aliceStudentStore._id}/listings`, {
          method: "DELETE",
          token: tokenAlice,
          body: { listingIds: [aliceListingId] },
        }),
        { params: Promise.resolve({ id: aliceStudentStore._id.toString() }) }
      );
      assert.strictEqual(unlinkRes.status, 400, "DELETE /api/stores/[id]/listings must return 400");

      // 3f: Moving listing from Alice's Student Store to Alice's Business Store #1 updates both stores' counts
      const moveRes = await handleBatchMoveListings(
        makeReq(`/api/stores/${aliceBizStore1._id}/listings`, {
          method: "POST",
          token: tokenAlice,
          body: { listingIds: [aliceListingId] },
        }),
        { params: Promise.resolve({ id: aliceBizStore1._id.toString() }) }
      );
      assert.strictEqual(moveRes.status, 200, "Moving listing between user's own active stores succeeds");

      const s1AfterMove = await StoreModel.findById(aliceStudentStore._id).lean();
      const s2AfterMove = await StoreModel.findById(aliceBizStore1._id).lean();
      assert.strictEqual(s1AfterMove?.metrics?.listingsCount, 0, "Source store listingsCount decremented to 0");
      assert.strictEqual(s2AfterMove?.metrics?.listingsCount, 1, "Target store listingsCount incremented to 1");
      console.log("  PASS: Store-owned listing rules and inter-store transfers verified");
    }

    // -------------------------------------------------------------------------
    // TEST 4: Store Suspension, Deletion, Cap Accounting & Role Derivation
    // -------------------------------------------------------------------------
    console.log("\nTEST 4: Store Suspension, Deletion, Cap Accounting & Role Derivation");
    {
      // 4a: Admin suspends Alice's Business Store #1 -> pauses its listings, still counts toward 3-store cap
      const suspendRes = await handleAdminStore(
        makeReq(`/api/admin/stores/${aliceBizStore1._id}`, {
          method: "PATCH",
          token: tokenAdmin,
          body: { action: "suspend", reason: "Compliance check" },
        }),
        { params: Promise.resolve({ id: aliceBizStore1._id.toString() }) }
      );
      assert.strictEqual(suspendRes.status, 200);

      const pausedListing = await ListingModel.findById(aliceListingId).lean();
      assert.strictEqual(pausedListing?.status, "paused", "Store suspension cascades to pause store listings");
      assert.strictEqual(pausedListing?.pausedBy, "store_suspension");

      // Creating a listing in suspended store fails
      const createInSuspendedRes = await handleCreateListing(
        makeReq("/api/listings", {
          method: "POST",
          token: tokenAlice,
          ip: "10.0.5.1",
          body: {
            storeId: aliceBizStore1._id.toString(),
            title: "Blocked Listing",
            description: "Suspended store test",
            price: 10000,
            category: "Electronics",
            campus: "ABU Zaria",
            location: "Samaru",
            condition: "Used - Good",
            images: ["https://res.cloudinary.com/campushive/image/upload/v1/item.jpg"],
          },
        })
      );
      assert.strictEqual(createInSuspendedRes.status, 403, "Cannot create listing in suspended store");

      // Suspended store STILL counts toward the 3-store cap
      const aliceWhileSuspended = await UserModel.findById(aliceId).lean();
      assert.strictEqual(aliceWhileSuspended?.storesCount, 3, "Suspended store still counts toward cap");

      // Admin reactivates Alice's Business Store #1 -> restores its listings
      const restoreRes = await handleAdminStore(
        makeReq(`/api/admin/stores/${aliceBizStore1._id}`, {
          method: "PATCH",
          token: tokenAdmin,
          body: { action: "restore", reason: "Compliance verified" },
        }),
        { params: Promise.resolve({ id: aliceBizStore1._id.toString() }) }
      );
      assert.strictEqual(restoreRes.status, 200);
      const restoredListing = await ListingModel.findById(aliceListingId).lean();
      assert.strictEqual(restoredListing?.status, "active", "Reactivating store restores listings paused by store_suspension");

      // 4b: Deleting 1 store (Business Store #2) decrements storesCount to 2 and keeps Alice's role as "seller"
      const delStore2Res = await handleDeleteStore(
        makeReq(`/api/stores/${aliceBizStore2._id}`, {
          method: "DELETE",
          token: tokenAlice,
        }),
        { params: Promise.resolve({ id: aliceBizStore2._id.toString() }) }
      );
      assert.strictEqual(delStore2Res.status, 200);

      const aliceAfterDel1 = await UserModel.findById(aliceId).lean();
      assert.strictEqual(aliceAfterDel1?.storesCount, 2, "Deleting 1 store decrements storesCount to 2");
      assert.strictEqual(aliceAfterDel1?.role, "seller", "User owning remaining stores stays role=seller");

      const driftAfterDel = await checkStoresCountDrift();
      assert.strictEqual(driftAfterDel.driftedUsers.length, 0, "Zero drift after store deletion");
      console.log("  PASS: Suspension cascade, cap accounting, and multi-store role preservation verified");
    }

    // -------------------------------------------------------------------------
    // TEST 5: Slug Rules, 30-Day Reservation, Redirects & 7-Day Rename Cooldown
    // -------------------------------------------------------------------------
    console.log("\nTEST 5: Slug Rules, Reservation, Old-Slug Redirects & Rename Cooldown");
    {
      // 5a: Deleted store slug ("alice-enterprise-2") is reserved for 30 days -> Bob cannot claim it
      const bobStealDeletedSlug = await handleSubmitBusinessApp(
        makeReq("/api/stores/business-application", {
          method: "POST",
          token: tokenBob,
          ip: "10.0.6.1",
          body: {
            businessName: "Bob Steal Slug",
            slug: "alice-enterprise-2",
            businessCategory: "Electronics",
            campus: "ABU Zaria",
            operatingLocation: "Samaru",
            contactPhone: "+2348033334444",
            contactEmail: "bob@campushive.edu.ng",
            cacNumber: "RC555555",
            supportingDocuments: ["https://res.cloudinary.com/campushive/image/upload/v1/cac.pdf"],
          },
        })
      );
      assert.strictEqual(bobStealDeletedSlug.status, 409, "Recently deleted store slug must be reserved for 30 days");

      // 5b: Reserved system word slug ("admin") is rejected with 400
      const reservedWordRes = await handleUpdateStore(
        makeReq(`/api/stores/${aliceBizStore1._id}`, {
          method: "PATCH",
          token: tokenAlice,
          body: { slug: "admin" },
        }),
        { params: Promise.resolve({ id: aliceBizStore1._id.toString() }) }
      );
      assert.strictEqual(reservedWordRes.status, 400, "Reserved word slug 'admin' must be rejected with 400");

      // 5c: Case-insensitive duplicate slug ("BOB-BOOKSHOP") is rejected with 409 + suggestions
      const dupSlugRes = await handleUpdateStore(
        makeReq(`/api/stores/${aliceBizStore1._id}`, {
          method: "PATCH",
          token: tokenAlice,
          body: { slug: "BOB-BOOKSHOP" },
        }),
        { params: Promise.resolve({ id: aliceBizStore1._id.toString() }) }
      );
      assert.strictEqual(dupSlugRes.status, 409, "Case-insensitive duplicate slug must return 409");
      const dupSlugJson = await dupSlugRes.json();
      assert.ok(Array.isArray(dupSlugJson.suggestions) && dupSlugJson.suggestions.length > 0, "409 response includes slug suggestions");

      // 5d: Valid slug rename ("alice-enterprise-1" -> "alice-prime-gadgets") creates SlugRedirect
      const renameRes = await handleUpdateStore(
        makeReq(`/api/stores/${aliceBizStore1._id}`, {
          method: "PATCH",
          token: tokenAlice,
          body: { slug: "alice-prime-gadgets" },
        }),
        { params: Promise.resolve({ id: aliceBizStore1._id.toString() }) }
      );
      assert.strictEqual(renameRes.status, 200, "First slug rename succeeds");

      // Fetching by old slug ("alice-enterprise-1") resolves the store with redirect metadata
      const oldSlugGetRes = await handleGetStoreById(
        makeReq("/api/stores/alice-enterprise-1"),
        { params: Promise.resolve({ id: "alice-enterprise-1" }) }
      );
      assert.strictEqual(oldSlugGetRes.status, 200, "Old slug resolves via SlugRedirect");
      const oldSlugJson = await oldSlugGetRes.json();
      assert.strictEqual(oldSlugJson.data.slug, "alice-prime-gadgets");
      assert.strictEqual(oldSlugJson.oldSlug, "alice-enterprise-1");
      assert.strictEqual(oldSlugJson.redirect, true);

      // 5e: Second rename within 7 days fails with 429 (cooldown)
      const cooldownRes = await handleUpdateStore(
        makeReq(`/api/stores/${aliceBizStore1._id}`, {
          method: "PATCH",
          token: tokenAlice,
          body: { slug: "alice-prime-gadgets-v2" },
        }),
        { params: Promise.resolve({ id: aliceBizStore1._id.toString() }) }
      );
      assert.strictEqual(cooldownRes.status, 429, "Second slug rename within 7 days must fail with 429");
      console.log("  PASS: Slug validation, 30-day reservation, old-slug redirect, and 7-day cooldown verified");
    }

    // -------------------------------------------------------------------------
    // TEST 6: Privacy, Public Allowlists & Byte-for-Byte Visitor Cache Safety
    // -------------------------------------------------------------------------
    console.log("\nTEST 6: Private User Profiles, Public Allowlists & Visitor Cache Safety");
    {
      // 6a: Public user lookup by handle, id, or search query returns 404
      const handleLookupRes = await handleGetUserProfile(makeReq("/api/users/profile?handle=alice"));
      assert.strictEqual(handleLookupRes.status, 404, "Public user lookup by handle must return 404");

      const searchLookupRes = await handleGetUserProfile(makeReq("/api/users/profile?q=Alice"));
      assert.strictEqual(searchLookupRes.status, 404, "Public user search must return 404");

      const idLookupRes = await handleGetUserProfile(
        makeReq(`/api/users/profile?id=${aliceId}`, { token: tokenBob })
      );
      assert.strictEqual(idLookupRes.status, 404, "Looking up another user's profile by id must return 404");

      // Owner can read their own private profile
      const ownProfileRes = await handleGetUserProfile(
        makeReq("/api/users/profile", { token: tokenAlice })
      );
      assert.strictEqual(ownProfileRes.status, 200, "Authenticated owner can read own private profile");
      const ownProfileJson = await ownProfileRes.json();
      assert.strictEqual(ownProfileJson.data.email, "alice@campushive.edu.ng");

      // 6b: Public username check is retired (404 Not Found)
      const checkUserRes = await handleCheckUsername(makeReq("/api/users/check-username?username=alice"));
      assert.strictEqual(checkUserRes.status, 404, "Public username availability endpoint must return 404");

      // 6c: Follower lists are strictly private (403 Forbidden even for store owner)
      await handleExplicitFollow(
        makeReq(`/api/follow/${aliceBizStore1._id}?targetType=store`, { method: "POST", token: tokenBob }),
        { params: Promise.resolve({ targetId: aliceBizStore1._id.toString() }) }
      );
      const followersRes = await handleGetFollowers(
        makeReq(`/api/follow/followers/${aliceBizStore1._id}?targetType=store`, { token: tokenAlice }),
        { params: Promise.resolve({ id: aliceBizStore1._id.toString(), targetId: aliceBizStore1._id.toString() } as any) }
      );
      assert.strictEqual(followersRes.status, 403, "Follower lists are never returned");

      // 6d: Public Store response hides ownerFullName by default and is identical for anonymous vs authenticated visitor
      const anonStoreRes = await handleGetStoreById(
        makeReq(`/api/stores/${aliceBizStore1._id}`),
        { params: Promise.resolve({ id: aliceBizStore1._id.toString() }) }
      );
      const authStoreRes = await handleGetStoreById(
        makeReq(`/api/stores/${aliceBizStore1._id}`, { token: tokenBob }),
        { params: Promise.resolve({ id: aliceBizStore1._id.toString() }) }
      );
      const anonStoreText = await anonStoreRes.text();
      const authStoreText = await authStoreRes.text();
      assert.strictEqual(
        anonStoreText,
        authStoreText,
        "Public store response must be byte-for-byte identical for anonymous and authenticated visitors"
      );

      const pubStoreObj = JSON.parse(anonStoreText).data;
      assert.strictEqual(pubStoreObj.ownerFullName, undefined, "ownerFullName hidden by default (showOwnerName=false)");
      assert.strictEqual(pubStoreObj.email, undefined, "User email never present on public store");
      assert.strictEqual(pubStoreObj.cacDocumentUrl, undefined, "Private CAC document never present on public store");
      assert.strictEqual(pubStoreObj.metrics.followersCount, 1, "Public store includes followersCount aggregate");

      // 6e: Public Listing detail response uses store identity and leaks zero user PII
      const anonListingRes = await handleGetListingById(
        makeReq(`/api/listings/${aliceListingId}`),
        { params: Promise.resolve({ id: aliceListingId }) }
      );
      const authListingRes = await handleGetListingById(
        makeReq(`/api/listings/${aliceListingId}`, { token: tokenBob }),
        { params: Promise.resolve({ id: aliceListingId }) }
      );
      const anonListingText = await anonListingRes.text();
      const authListingText = await authListingRes.text();
      assert.strictEqual(
        anonListingText,
        authListingText,
        "Public listing response must be byte-for-byte identical for anonymous and authenticated visitors"
      );
      const pubListingObj = JSON.parse(anonListingText).data;
      assert.strictEqual(pubListingObj.store.name, "Alice Enterprise 1", "Public listing store name is the Store name, not the user's real name");
      assert.strictEqual(pubListingObj.store.slug, "alice-prime-gadgets", "Public listing links to store slug");
      assert.strictEqual(pubListingObj.store.email, undefined, "Zero user email leaked on listing");
      assert.strictEqual(pubListingObj.sellerId, undefined, "Raw user sellerId is stripped from public listing DTO");
      console.log("  PASS: Private user profiles, public allowlists, and byte-for-byte cache safety verified");
    }

    // -------------------------------------------------------------------------
    // TEST 7: Store-Scoped Interactions (Orders, Reviews, Conversations, Seller Stats)
    // -------------------------------------------------------------------------
    console.log("\nTEST 7: Store-Scoped Interactions & Minimal Visible Identity");
    {
      // 7a: Bob creates an order on Alice's listing in Business Store #1
      const createOrderRes = await handleCreateOrder(
        makeReq("/api/orders", {
          method: "POST",
          token: tokenBob,
          ip: "10.0.7.1",
          body: {
            listingId: aliceListingId,
            quantity: 1,
            paymentMethod: "cash",
            fulfillmentMethod: "pickup",
          },
        })
      );
      assert.strictEqual(createOrderRes.status, 201, "Order creation succeeds");
      const orderData = (await createOrderRes.json()).data;
      assert.strictEqual(orderData.storeId, aliceBizStore1._id.toString(), "Order records storeId from listing");

      // Check seller orders list filtered by storeId and minimal buyer identity
      const sellerOrdersRes = await handleGetOrders(
        makeReq(`/api/orders?role=seller&storeId=${aliceBizStore1._id}`, { token: tokenAlice })
      );
      assert.strictEqual(sellerOrdersRes.status, 200);
      const sellerOrdersJson = await sellerOrdersRes.json();
      assert.strictEqual(sellerOrdersJson.data.length, 1);
      const orderBuyer = sellerOrdersJson.data[0].buyer;
      assert.strictEqual(orderBuyer.displayName, "Bob I.", "Buyer shown to seller with minimal display identity");
      assert.strictEqual(orderBuyer.email, undefined, "Buyer email never exposed to seller");
      assert.strictEqual(orderBuyer.phone, undefined, "Buyer phone never exposed to seller");

      // Check buyer orders list shows Store identity as seller store
      const buyerOrdersRes = await handleGetOrders(
        makeReq("/api/orders?role=buyer", { token: tokenBob })
      );
      const buyerOrdersJson = await buyerOrdersRes.json();
      assert.strictEqual(
        buyerOrdersJson.data[0].store.name,
        "Alice Enterprise 1",
        "Seller shown to buyer in orders as the Store name"
      );

      // 7b: Mark order delivered and submit a review -> verify Reviewer minimal identity ("Bob I.") + Store rating
      const orderMongoId = String(orderData._id || orderData.id);
      await OrderModel.findByIdAndUpdate(orderMongoId, { $set: { status: "delivered" } });
      const reviewRes = await handlePostReview(
        makeReq("/api/reviews", {
          method: "POST",
          token: tokenBob,
          ip: "10.0.7.2",
          body: {
            orderId: orderMongoId,
            rating: 5,
            comment: "Fast pickup at Samaru and laptop works great!",
          },
        })
      );
      assert.strictEqual(reviewRes.status, 201);

      const storeReviewsRes = await handleGetReviews(
        makeReq(`/api/reviews?storeId=${aliceBizStore1._id}`)
      );
      assert.strictEqual(storeReviewsRes.status, 200);
      const storeReviewsJson = await storeReviewsRes.json();
      assert.strictEqual(storeReviewsJson.data.length, 1);
      assert.strictEqual(
        storeReviewsJson.data[0].reviewer.name,
        "Bob I.",
        "Reviewer publicly shown strictly as First Name + Initial ('Bob I.')"
      );
      assert.strictEqual(
        storeReviewsJson.data[0].reviewer.isVerifiedStudent,
        true,
        "Reviewer includes verified student badge"
      );
      assert.strictEqual(storeReviewsJson.data[0].reviewer.email, undefined, "Reviewer email not exposed");
      assert.strictEqual(storeReviewsJson.data[0].reviewer.id, undefined, "Reviewer internal ID not exposed");

      // 7c: Conversation creation records storeId and displays Store identity to buyer, minimal identity to seller
      const convRes = await handleCreateConversation(
        makeReq("/api/messages/conversations", {
          method: "POST",
          token: tokenBob,
          ip: "10.0.7.3",
          body: {
            participantId: aliceId,
            participantName: "Alice Enterprise 1",
            storeId: aliceBizStore1._id.toString(),
            accountType: "approved_business",
            context: {
              contextType: "product",
              contextId: aliceListingId,
              storeId: aliceBizStore1._id.toString(),
              title: "HP Pavilion 15 Gaming Laptop",
              priceFormatted: "₦320,000",
            },
          },
        })
      );
      assert.strictEqual(convRes.status, 201);
      const convJson = await convRes.json();
      assert.strictEqual(convJson.conversation.storeId, aliceBizStore1._id.toString());
      assert.strictEqual(
        convJson.conversation.otherParticipant.name,
        "Alice Enterprise 1",
        "Buyer sees Store name in conversation header"
      );

      const aliceConvsRes = await handleGetConversations(
        makeReq(`/api/messages/conversations?storeId=${aliceBizStore1._id}`, { token: tokenAlice })
      );
      const aliceConvsJson = await aliceConvsRes.json();
      assert.strictEqual(aliceConvsJson.conversations.length, 1);
      assert.strictEqual(
        aliceConvsJson.conversations[0].otherParticipant.name,
        "Bob I.",
        "Seller sees buyer's minimal display name ('Bob I.') in conversation inbox"
      );

      // 7d: Seller Dashboard Stats scoped per storeId
      const statsStore1Res = await handleGetSellerStats(
        makeReq(`/api/dashboard/seller-stats?storeId=${aliceBizStore1._id}`, { token: tokenAlice })
      );
      assert.strictEqual(statsStore1Res.status, 200);
      const statsStore1 = (await statsStore1Res.json()).data;
      assert.strictEqual(statsStore1.listings.active, 1, "Business Store #1 has 1 active listing");
      assert.strictEqual(statsStore1.orders.totalOrders, 1, "Business Store #1 has 1 order");

      const statsStudentStoreRes = await handleGetSellerStats(
        makeReq(`/api/dashboard/seller-stats?storeId=${aliceStudentStore._id}`, { token: tokenAlice })
      );
      assert.strictEqual(statsStudentStoreRes.status, 200);
      const statsStudentStore = (await statsStudentStoreRes.json()).data;
      assert.strictEqual(statsStudentStore.listings.active, 0, "Student Store has 0 active listings");
      assert.strictEqual(statsStudentStore.orders.totalOrders, 0, "Student Store has 0 orders");
      console.log("  PASS: Store-scoped orders, reviews, conversations, and dashboard stats verified");
    }

    // -------------------------------------------------------------------------
    // TEST 8: Deleting All Stores Demotes Seller Capability Without Touching Identity
    // -------------------------------------------------------------------------
    console.log("\nTEST 8: Deleting All Remaining Stores Reverts Derived Seller Capability");
    {
      await handleDeleteStore(
        makeReq(`/api/stores/${aliceStudentStore._id}`, { method: "DELETE", token: tokenAlice }),
        { params: Promise.resolve({ id: aliceStudentStore._id.toString() }) }
      );
      await handleDeleteStore(
        makeReq(`/api/stores/${aliceBizStore1._id}`, { method: "DELETE", token: tokenAlice }),
        { params: Promise.resolve({ id: aliceBizStore1._id.toString() }) }
      );

      const aliceAfterAllDeleted = await UserModel.findById(aliceId).lean();
      assert.strictEqual(aliceAfterAllDeleted?.storesCount, 0);
      assert.strictEqual(aliceAfterAllDeleted?.studentStoresCount, 0);
      assert.strictEqual(aliceAfterAllDeleted?.role, "buyer", "Owning 0 non-deleted stores reverts role to buyer");
      assert.strictEqual(aliceAfterAllDeleted?.isStudent, true, "User student status untouched");
      assert.strictEqual(aliceAfterAllDeleted?.studentVerified, true, "User verification state untouched");
      console.log("  PASS: Deleting last store cleanly updates derived role to buyer while preserving user identity");
    }

    // -------------------------------------------------------------------------
    // TEST 9: Idempotent Migration Script Verification
    // -------------------------------------------------------------------------
    console.log("\nTEST 9: Idempotent Data Migration & Drift Verification");
    {
      const drySummary = await runMultiStorePrivacyMigration({ dryRun: true });
      assert.strictEqual(drySummary.dryRun, true);

      const run1 = await runMultiStorePrivacyMigration({ dryRun: false });
      assert.strictEqual(run1.postMigrationDriftCount, 0, "Zero storesCount drift after migration run 1");

      const run2 = await runMultiStorePrivacyMigration({ dryRun: false });
      assert.strictEqual(run2.postMigrationDriftCount, 0, "Zero storesCount drift after migration run 2");
      assert.strictEqual(run2.storesSlugLowerBackfilled, 0, "Second migration run is a no-op on slugLower");
      assert.strictEqual(run2.orphanListingsAttachedToOwnerStore, 0, "Second migration run is a no-op on orphan listings");
      console.log("  PASS: Migration script is strictly idempotent with 0 drift");
    }

    console.log("\n====================================================================");
    console.log(" ALL 9 PHASE 5 MULTI-STORE & PRIVACY TEST SUITES PASSED! ");
    console.log("====================================================================\n");
  } finally {
    if (mongod) {
      await mongoose.disconnect();
      await mongod.stop();
    }
    process.env = originalEnv;
  }
}

runMultiStorePrivacyTests().catch((err) => {
  console.error("FATAL: Multi-store privacy test suite failed:", err);
  process.exit(1);
});
