/**
 * scripts/test-phase4-reviews.ts
 *
 * Phase 4.6: Comprehensive Reviews System Security, Integrity & Audit Test Suite
 */

import assert from "node:assert";
import mongoose from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import { NextRequest, NextResponse } from "next/server";
import { POST as handlePostReview, GET as handleGetReviews } from "../app/api/reviews/route";
import { PATCH as handlePatchAdminReview } from "../app/api/admin/reviews/[id]/route";
import ReviewModel from "../app/models/Review";
import UserModel from "../app/models/User";
import StoreModel from "../app/models/Store";
import { OrderModel } from "../app/models/Order";
import { ListingModel } from "../app/models/Listing";
import { createAccessToken } from "../app/lib/authTokens";
import dbConnect from "../app/lib/dbConnect";
import {
  recomputeSellerRating,
  recomputeStoreRating,
  checkReviewAggregateDrift,
} from "../app/lib/reviewService";
import { runReviewMigration } from "./migrate-legacy-reviews";

function makeMockRequest(
  url: string,
  options: {
    method?: string;
    body?: any;
    headers?: Record<string, string>;
    token?: string;
  } = {}
): NextRequest {
  const headers = new Headers(options.headers || {});
  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
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

function extractPlanDetails(executionStages: any) {
  let hasCollScan = false;
  let hasSortStage = false;
  let indexUsed: string | null = null;

  function traverse(s: any) {
    if (!s) return;
    if (s.stage === "COLLSCAN") hasCollScan = true;
    if (s.stage === "SORT" || s.stage === "SORT_KEY_GENERATOR") hasSortStage = true;
    if (s.indexName) indexUsed = s.indexName;
    if (s.inputStage) traverse(s.inputStage);
    if (Array.isArray(s.inputStages)) s.inputStages.forEach(traverse);
  }

  traverse(executionStages);
  return { hasCollScan, hasSortStage, indexUsed };
}

async function runReviewTestSuite() {
  console.log("====================================================================");
  console.log("             PHASE 4.6: REVIEWS MIGRATION TEST SUITE                ");
  console.log("====================================================================\n");

  let mongod: MongoMemoryReplSet | null = null;
  const originalEnv = { ...process.env };
  process.env.AUTH_SECRET = "test_super_secret_jwt_key_with_at_least_32_characters_for_hmac!";

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
    await ListingModel.init();
    await OrderModel.init();
    await ReviewModel.init();

    // 1. Seed Users: Alice (Seller), Bob (Buyer), Charlie (Intruder), Eve (Admin), Dave (Suspended)
    const alice = await UserModel.create({
      name: "Alice Seller",
      email: "alice@campushive.edu.ng",
      role: "seller",
      accountStatus: "active",
      profile: { displayName: "Alice's Tech", handle: "alice-tech" },
      tokenVersion: 0,
      schemaVersion: 1,
    });

    const bob = await UserModel.create({
      name: "Bob Buyer",
      email: "bob@campushive.edu.ng",
      role: "buyer",
      accountStatus: "active",
      profile: { displayName: "Bob Student", handle: "bob-student" },
      tokenVersion: 0,
      schemaVersion: 1,
    });

    const charlie = await UserModel.create({
      name: "Charlie Intruder",
      email: "charlie@campushive.edu.ng",
      role: "buyer",
      accountStatus: "active",
      tokenVersion: 0,
      schemaVersion: 1,
    });

    const eveAdmin = await UserModel.create({
      name: "Eve Admin",
      email: "eve@campushive.edu.ng",
      role: "admin",
      accountStatus: "active",
      tokenVersion: 0,
      schemaVersion: 1,
    });

    const daveSuspended = await UserModel.create({
      name: "Dave Suspended",
      email: "dave@campushive.edu.ng",
      role: "buyer",
      accountStatus: "suspended",
      tokenVersion: 0,
      schemaVersion: 1,
    });

    // Seed Alice Store
    const aliceStore = await StoreModel.create({
      ownerId: alice._id.toString(),
      name: "Alice Tech Hub",
      slug: "alice-tech-hub",
      description: "Laptops and tech accessories.",
      storeType: "student_store",
      category: "Electronics",
      campus: "ABU Samaru",
      operatingLocation: "Ribadu Hall",
      logo: "https://res.cloudinary.com/campushive/image/upload/v1/alice.png",
      status: "active",
      isVerified: true,
      verificationType: "student",
      metrics: { rating: 0, reviewsCount: 0, completedDeals: 0, listingsCount: 1 },
    });

    // Seed Listing
    const laptopListing = await ListingModel.create({
      sellerId: alice._id.toString(),
      storeId: aliceStore._id.toString(),
      title: "MacBook Pro M1",
      price: 650000,
      priceFormatted: "₦650,000",
      description: "Clean laptop",
      category: "Electronics",
      campus: "ABU Samaru",
      location: "Ribadu Hall",
      status: "active",
      listingType: "product",
      views: 10,
    });

    // Seed Orders:
    // Order 1: Delivered (eligible for Bob's review)
    const deliveredOrder = await OrderModel.create({
      orderId: "ORD-DELIV-001",
      buyerId: bob._id.toString(),
      sellerId: alice._id.toString(),
      storeId: aliceStore._id.toString(),
      status: "delivered",
      totalAmount: 650000,
      items: [{ listingId: laptopListing._id, title: "MacBook Pro M1", price: 650000, quantity: 1 }],
      paymentMethod: "cash",
      fulfillmentMethod: "pickup",
      createdAt: new Date().toISOString(),
    });

    // Order 2: Processing (ineligible for review)
    const processingOrder = await OrderModel.create({
      orderId: "ORD-PROC-002",
      buyerId: bob._id.toString(),
      sellerId: alice._id.toString(),
      status: "processing",
      totalAmount: 10000,
      items: [{ listingId: laptopListing._id, title: "Mouse", price: 10000, quantity: 1 }],
      paymentMethod: "cash",
      fulfillmentMethod: "pickup",
      createdAt: new Date().toISOString(),
    });

    // Order 3: Cancelled (ineligible for review)
    const cancelledOrder = await OrderModel.create({
      orderId: "ORD-CANC-003",
      buyerId: bob._id.toString(),
      sellerId: alice._id.toString(),
      status: "cancelled",
      totalAmount: 15000,
      items: [{ listingId: laptopListing._id, title: "Adapter", price: 15000, quantity: 1 }],
      paymentMethod: "cash",
      fulfillmentMethod: "pickup",
      createdAt: new Date().toISOString(),
    });

    // Order 4: Disputed (ineligible for review)
    const disputedOrder = await OrderModel.create({
      orderId: "ORD-DISP-004",
      buyerId: bob._id.toString(),
      sellerId: alice._id.toString(),
      status: "disputed",
      totalAmount: 20000,
      items: [{ listingId: laptopListing._id, title: "Cable", price: 20000, quantity: 1 }],
      paymentMethod: "cash",
      fulfillmentMethod: "pickup",
      createdAt: new Date().toISOString(),
    });

    // Tokens
    const aliceToken = createAccessToken({
      id: alice._id.toString(),
      name: alice.name,
      email: alice.email,
      role: "seller",
      isStudent: true,
      studentVerified: true,
    });

    const bobToken = createAccessToken({
      id: bob._id.toString(),
      name: bob.name,
      email: bob.email,
      role: "buyer",
      isStudent: true,
      studentVerified: true,
    });

    const charlieToken = createAccessToken({
      id: charlie._id.toString(),
      name: charlie.name,
      email: charlie.email,
      role: "buyer",
      isStudent: true,
      studentVerified: true,
    });

    const adminToken = createAccessToken({
      id: eveAdmin._id.toString(),
      name: eveAdmin.name,
      email: eveAdmin.email,
      role: "admin",
      isStudent: false,
      studentVerified: false,
    });

    const suspendedToken = createAccessToken({
      id: daveSuspended._id.toString(),
      name: daveSuspended.name,
      email: daveSuspended.email,
      role: "buyer",
      isStudent: true,
      studentVerified: true,
    });

    // -----------------------------------------------------------------
    // TEST 1: Unauthenticated create returns 401; suspended reviewer returns 403
    // -----------------------------------------------------------------
    console.log("TEST 1: Authentication & live account-status checks");
    {
      const unauthReq = makeMockRequest("/api/reviews", {
        body: { orderId: deliveredOrder._id.toString(), rating: 5, comment: "Great!" },
      });
      const unauthRes = await handlePostReview(unauthReq);
      assert.strictEqual(unauthRes.status, 401, "Unauthenticated request returns 401");

      const suspReq = makeMockRequest("/api/reviews", {
        token: suspendedToken,
        body: { orderId: deliveredOrder._id.toString(), rating: 5, comment: "Suspended attempt" },
      });
      const suspRes = await handlePostReview(suspReq);
      assert.strictEqual(suspRes.status, 403, "Suspended user returns 403");
      console.log("  PASS: Unauthenticated (401) and suspended (403) strictly enforced");
    }

    // -----------------------------------------------------------------
    // TEST 2: reviewerId in body/headers cannot override session identity
    // -----------------------------------------------------------------
    console.log("\nTEST 2: Identity spoofing prevention");
    {
      const spoofReq = makeMockRequest("/api/reviews", {
        token: charlieToken,
        body: {
          reviewerId: bob._id.toString(), // Client tries to impersonate Bob
          orderId: deliveredOrder._id.toString(),
          rating: 5,
          comment: "Spoofed review",
        },
      });
      const spoofRes = await handlePostReview(spoofReq);
      // Charlie is not the buyer of deliveredOrder, so it must reject with 403
      assert.strictEqual(spoofRes.status, 403, "Client-supplied reviewerId ignored; Charlie rejected");
      console.log("  PASS: reviewerId derived strictly from session user token");
    }

    // -----------------------------------------------------------------
    // TEST 3: Non-party to transaction cannot create a review (403)
    // -----------------------------------------------------------------
    console.log("\nTEST 3: Non-party transaction review rejection");
    {
      const intruderReq = makeMockRequest("/api/reviews", {
        token: charlieToken,
        body: {
          orderId: deliveredOrder._id.toString(),
          rating: 5,
          comment: "I didn't buy this but I'm reviewing it",
        },
      });
      const intruderRes = await handlePostReview(intruderReq);
      assert.strictEqual(intruderRes.status, 403, "Non-party rejected with 403 Forbidden");
      console.log("  PASS: Non-party to transaction strictly rejected");
    }

    // -----------------------------------------------------------------
    // TEST 4: Eligibility: Review before delivered is rejected; cancelled/disputed rejected
    // -----------------------------------------------------------------
    console.log("\nTEST 4: Transaction status eligibility checks");
    {
      // Review on processing order
      const procReq = makeMockRequest("/api/reviews", {
        token: bobToken,
        body: {
          orderId: processingOrder._id.toString(),
          rating: 5,
          comment: "Premature review",
        },
      });
      const procRes = await handlePostReview(procReq);
      assert.strictEqual(procRes.status, 400, "Processing order review rejected with 400");

      // Review on cancelled order
      const cancReq = makeMockRequest("/api/reviews", {
        token: bobToken,
        body: {
          orderId: cancelledOrder._id.toString(),
          rating: 1,
          comment: "Cancelled order review",
        },
      });
      const cancRes = await handlePostReview(cancReq);
      assert.strictEqual(cancRes.status, 400, "Cancelled order review rejected with 400");

      // Review on disputed order
      const dispReq = makeMockRequest("/api/reviews", {
        token: bobToken,
        body: {
          orderId: disputedOrder._id.toString(),
          rating: 1,
          comment: "Disputed order review",
        },
      });
      const dispRes = await handlePostReview(dispReq);
      assert.strictEqual(dispRes.status, 400, "Disputed order review rejected with 400");
      console.log("  PASS: Only 'delivered' status allows review submission");
    }

    // -----------------------------------------------------------------
    // TEST 5: Self-review prevention
    // -----------------------------------------------------------------
    console.log("\nTEST 5: Self-review prohibited");
    {
      // Alice creates an order where she is seller, and attempts to review it
      const selfOrder = await OrderModel.create({
        orderId: "ORD-SELF-005",
        buyerId: alice._id.toString(),
        sellerId: alice._id.toString(),
        status: "delivered",
        totalAmount: 5000,
        items: [{ listingId: laptopListing._id, title: "Test", price: 5000, quantity: 1 }],
        paymentMethod: "cash",
        fulfillmentMethod: "pickup",
        createdAt: new Date().toISOString(),
      });

      const selfReq = makeMockRequest("/api/reviews", {
        token: aliceToken,
        body: {
          orderId: selfOrder._id.toString(),
          rating: 5,
          comment: "Reviewing myself!",
        },
      });
      const selfRes = await handlePostReview(selfReq);
      assert.strictEqual(selfRes.status, 400, "Self-review rejected with 400");
      console.log("  PASS: Self-review strictly blocked");
    }

    // -----------------------------------------------------------------
    // TEST 6: Rating validation: 0, 6, 3.5, "5", null rejected; 1-5 accepted
    // -----------------------------------------------------------------
    console.log("\nTEST 6: Integer star rating boundary validation");
    {
      const invalidRatings = [0, 6, 3.5, -1, "5", null, undefined, NaN];
      for (const badRating of invalidRatings) {
        const req = makeMockRequest("/api/reviews", {
          token: bobToken,
          body: {
            orderId: deliveredOrder._id.toString(),
            rating: badRating,
            comment: "Invalid rating test",
          },
        });
        const res = await handlePostReview(req);
        assert.strictEqual(
          res.status,
          400,
          `Rating '${badRating}' must be rejected with 400`
        );
      }
      console.log("  PASS: Only integer ratings 1 through 5 permitted");
    }

    // -----------------------------------------------------------------
    // TEST 7: Comment length validation and HTML escaping
    // -----------------------------------------------------------------
    console.log("\nTEST 7: Comment validation & inert text storage");
    {
      // Over-length comment (>1000 characters)
      const hugeComment = "a".repeat(1005);
      const hugeReq = makeMockRequest("/api/reviews", {
        token: bobToken,
        body: {
          orderId: deliveredOrder._id.toString(),
          rating: 5,
          comment: hugeComment,
        },
      });
      const hugeRes = await handlePostReview(hugeReq);
      assert.strictEqual(hugeRes.status, 400, "Over-length comment rejected with 400");

      // Empty comment
      const emptyReq = makeMockRequest("/api/reviews", {
        token: bobToken,
        body: {
          orderId: deliveredOrder._id.toString(),
          rating: 5,
          comment: "    ",
        },
      });
      const emptyRes = await handlePostReview(emptyReq);
      assert.strictEqual(emptyRes.status, 400, "Whitespace-only comment rejected with 400");
      console.log("  PASS: Comment length and empty constraints enforced");
    }

    // -----------------------------------------------------------------
    // TEST 8: Successful review creation & cardinality backstop (409 on duplicate)
    // -----------------------------------------------------------------
    console.log("\nTEST 8: One review per transaction & duplicate prevention");
    {
      const xssComment = `<script>alert('xss')</script> Laptop works great! <img src="x" onerror="alert(1)">`;
      const validReq = makeMockRequest("/api/reviews", {
        token: bobToken,
        body: {
          orderId: deliveredOrder._id.toString(),
          rating: 5,
          comment: xssComment,
        },
      });
      const validRes = await handlePostReview(validReq);
      assert.strictEqual(validRes.status, 201, "Valid review created with 201 Created");
      const validJson = await validRes.json();
      assert.strictEqual(validJson.data.rating, 5);
      assert(validJson.data.comment.includes("alert"), "Stored as literal text");

      // Sequential duplicate review on same order returns 409
      const dupReq = makeMockRequest("/api/reviews", {
        token: bobToken,
        body: {
          orderId: deliveredOrder._id.toString(),
          rating: 4,
          comment: "Trying to review again",
        },
      });
      const dupRes = await handlePostReview(dupReq);
      assert.strictEqual(dupRes.status, 409, "Duplicate review returns 409 Conflict");
      console.log("  PASS: Review created successfully; sequential duplicate returns 409");
    }

    // -----------------------------------------------------------------
    // TEST 9: Concurrent submissions of duplicate reviews (exactly 1 winner, rest 409)
    // -----------------------------------------------------------------
    console.log("\nTEST 9: Concurrency safety (10 simultaneous submissions)");
    {
      // Create new delivered order for Bob
      const concurrentOrder = await OrderModel.create({
        orderId: "ORD-CONCUR-006",
        buyerId: bob._id.toString(),
        sellerId: alice._id.toString(),
        storeId: aliceStore._id.toString(),
        status: "delivered",
        totalAmount: 50000,
        items: [{ listingId: laptopListing._id, title: "Monitor", price: 50000, quantity: 1 }],
        paymentMethod: "cash",
        fulfillmentMethod: "pickup",
        createdAt: new Date().toISOString(),
      });

      const promises = Array.from({ length: 10 }).map(() =>
        handlePostReview(
          makeMockRequest("/api/reviews", {
            token: bobToken,
            body: {
              orderId: concurrentOrder._id.toString(),
              rating: 4,
              comment: "Parallel review submission test",
            },
          })
        )
      );

      const responses = await Promise.all(promises);
      const statuses = responses.map((r) => r.status);
      const count201 = statuses.filter((s) => s === 201).length;
      const count409 = statuses.filter((s) => s === 409).length;

      assert.strictEqual(count201, 1, "Exactly one parallel request succeeds with 201 Created");
      assert.strictEqual(count409, 9, "Remaining 9 parallel requests return 409 Conflict");
      console.log("  PASS: Atomic race condition handled: exactly 1 winner (201) and 9 conflicts (409)");
    }

    // -----------------------------------------------------------------
    // TEST 10: Atomic aggregate recomputation & zero drift
    // -----------------------------------------------------------------
    console.log("\nTEST 10: Atomic aggregate rating and review count updates");
    {
      // We have 2 reviews submitted for Alice and AliceStore:
      // Review 1: 5 stars
      // Review 2: 4 stars
      // Average: (5 + 4) / 2 = 4.5. Count: 2
      const updatedUser = await UserModel.findById(alice._id).lean();
      assert(updatedUser, "Updated user exists");
      assert.strictEqual(updatedUser.rating?.average, 4.5, "User average rating is 4.5");
      assert.strictEqual(updatedUser.rating?.count, 2, "User review count is 2");

      const updatedStore = await StoreModel.findById(aliceStore._id).lean();
      assert(updatedStore, "Updated store exists");
      assert.strictEqual(updatedStore.metrics?.rating, 4.5, "Store rating is 4.5");
      assert.strictEqual(updatedStore.metrics?.reviewsCount, 2, "Store reviewsCount is 2");

      // Verify zero drift
      const drift = await checkReviewAggregateDrift();
      assert.strictEqual(drift.clean, true, "checkReviewAggregateDrift reports clean (0 mismatches)");
      console.log("  PASS: Aggregates computed accurately with 0 drift");
    }

    // -----------------------------------------------------------------
    // TEST 11: Public review list filtering, status gating & PII protection
    // -----------------------------------------------------------------
    console.log("\nTEST 11: Public review list visibility & PII protection");
    {
      // Insert a hidden review
      await ReviewModel.create({
        sellerId: alice._id,
        reviewerId: charlie._id,
        orderId: new mongoose.Types.ObjectId(),
        rating: 1,
        comment: "Hidden review",
        status: "hidden",
        schemaVersion: 1,
      });

      const getReq = makeMockRequest(`/api/reviews?sellerId=${alice._id.toString()}`);
      const getRes = await handleGetReviews(getReq);
      assert.strictEqual(getRes.status, 200, "Public review list returns 200 OK");
      const getJson = await getRes.json();

      // Only published reviews returned (2 published, 1 hidden excluded)
      assert.strictEqual(getJson.data.length, 2, "Hidden reviews strictly excluded from public list");

      // PII inspection: reviewer object must only contain name and avatar
      for (const rev of getJson.data) {
        assert(rev.reviewer, "Reviewer profile exists");
        assert(typeof rev.reviewer.name === "string", "Reviewer display name present");
        assert(!("email" in rev.reviewer), "Reviewer email NEVER exposed");
        assert(!("phone" in rev.reviewer), "Reviewer phone NEVER exposed");
        assert(!("token" in rev.reviewer), "Reviewer token NEVER exposed");
      }
      console.log("  PASS: Only published reviews returned; zero PII exposed");
    }

    // -----------------------------------------------------------------
    // TEST 12: Keyset cursor pagination (100 identical timestamps)
    // -----------------------------------------------------------------
    console.log("\nTEST 12: Keyset cursor pagination with tie-breaker");
    {
      const bulkSeller = await UserModel.create({
        name: "Bulk Review Seller",
        email: "bulk_reviews@campushive.edu.ng",
        role: "seller",
        accountStatus: "active",
        tokenVersion: 0,
        schemaVersion: 1,
      });
      const sellerIdent = bulkSeller._id;
      const identicalTime = new Date("2026-10-21T12:00:00Z");

      const bulkReviews = Array.from({ length: 50 }).map((_, idx) => ({
        sellerId: sellerIdent,
        reviewerId: new mongoose.Types.ObjectId(),
        orderId: new mongoose.Types.ObjectId(),
        rating: 5,
        comment: `Tie breaker review ${idx}`,
        status: "published",
        schemaVersion: 1,
        createdAt: identicalTime,
        updatedAt: identicalTime,
      }));

      await ReviewModel.insertMany(bulkReviews);

      // Paginate page 1 (limit 20)
      const page1Req = makeMockRequest(`/api/reviews?sellerId=${sellerIdent.toString()}&limit=20`);
      const page1Res = await handleGetReviews(page1Req);
      const page1Json = await page1Res.json();
      assert.strictEqual(page1Json.data.length, 20);
      assert(page1Json.hasMore, "Page 1 hasMore is true");
      assert(page1Json.nextCursor, "Page 1 has nextCursor");

      // Paginate page 2 using nextCursor
      const page2Req = makeMockRequest(
        `/api/reviews?sellerId=${sellerIdent.toString()}&limit=20&cursor=${page1Json.nextCursor}`
      );
      const page2Res = await handleGetReviews(page2Req);
      const page2Json = await page2Res.json();
      assert.strictEqual(page2Json.data.length, 20);

      // Verify page 1 and page 2 have completely disjoint IDs
      const p1Ids = new Set(page1Json.data.map((r: any) => r.id));
      for (const p2 of page2Json.data) {
        assert(!p1Ids.has(p2.id), "Cursor pagination strictly avoids duplicate records");
      }

      // Malformed cursor returns 400
      const malformedReq = makeMockRequest(
        `/api/reviews?sellerId=${sellerIdent.toString()}&cursor=bad_base64_string!!!`
      );
      const malformedRes = await handleGetReviews(malformedReq);
      assert.strictEqual(malformedRes.status, 400, "Malformed cursor returns 400 Bad Request");
      console.log("  PASS: Keyset cursor pagination exact across identical timestamps");
    }

    // -----------------------------------------------------------------
    // TEST 13: Suspended/banned subject: reviews hidden from public
    // -----------------------------------------------------------------
    console.log("\nTEST 13: Suspended seller privacy protection");
    {
      const suspendedSeller = await UserModel.create({
        name: "Suspended Seller",
        email: "susp_seller@campushive.edu.ng",
        role: "seller",
        accountStatus: "suspended",
        tokenVersion: 0,
        schemaVersion: 1,
      });

      await ReviewModel.create({
        sellerId: suspendedSeller._id,
        reviewerId: bob._id,
        orderId: new mongoose.Types.ObjectId(),
        rating: 5,
        comment: "Great seller before suspension",
        status: "published",
        schemaVersion: 1,
      });

      const req = makeMockRequest(`/api/reviews?sellerId=${suspendedSeller._id.toString()}`);
      const res = await handleGetReviews(req);
      const json = await res.json();
      assert.strictEqual(json.data.length, 0, "Suspended seller reviews not publicly accessible");
      console.log("  PASS: Suspended subject reviews cleanly concealed from public queries");
    }

    // -----------------------------------------------------------------
    // TEST 14: Admin moderation & audit logging
    // -----------------------------------------------------------------
    console.log("\nTEST 14: Admin moderation and audit logging");
    {
      const targetReview = await ReviewModel.findOne({ status: "published", sellerId: alice._id });
      assert(targetReview, "Target review found");

      // Non-admin attempt returns 403
      const nonAdminReq = makeMockRequest(`/api/admin/reviews/${targetReview._id.toString()}`, {
        method: "PATCH",
        token: bobToken,
        body: { status: "hidden", reason: "Spam content" },
      });
      const nonAdminRes = await handlePatchAdminReview(nonAdminReq, {
        params: Promise.resolve({ id: targetReview._id.toString() }),
      });
      assert.strictEqual(nonAdminRes.status, 403, "Non-admin rejected with 403");

      // Admin hides review
      const adminReq = makeMockRequest(`/api/admin/reviews/${targetReview._id.toString()}`, {
        method: "PATCH",
        token: adminToken,
        body: { status: "hidden", reason: "Policy violation" },
      });
      const adminRes = await handlePatchAdminReview(adminReq, {
        params: Promise.resolve({ id: targetReview._id.toString() }),
      });
      assert.strictEqual(adminRes.status, 200, "Admin can update review status");

      const refreshed = await ReviewModel.findById(targetReview._id);
      assert.strictEqual(refreshed?.status, "hidden");

      // Verify aggregate automatically adjusted after hiding review!
      const userAfterHide = await UserModel.findById(alice._id).lean();
      assert(userAfterHide, "User after hide exists");
      assert.strictEqual(userAfterHide.rating?.count, 1, "Review count decremented to 1");

      // Verify audit log entry
      const auditLog = await mongoose.connection
        .collection("admin_audit_logs")
        .findOne({ targetId: targetReview._id.toString() });
      assert(auditLog, "Audit log persisted in admin_audit_logs");
      assert.strictEqual(auditLog.action, "review_hidden");
      console.log("  PASS: Admin moderation recomputed aggregates and recorded audit log");
    }

    // -----------------------------------------------------------------
    // TEST 15: Cache-Control boundary tests
    // -----------------------------------------------------------------
    console.log("\nTEST 15: Cache-Control header isolation");
    {
      // Anonymous public GET
      const pubReq = makeMockRequest(`/api/reviews?sellerId=${alice._id.toString()}`);
      const pubRes = await handleGetReviews(pubReq);
      const pubCache = pubRes.headers.get("Cache-Control") || "";
      assert.match(pubCache, /public/i, "Anonymous request gets public cache");
      assert.match(pubCache, /s-maxage=60/i, "Anonymous request has s-maxage=60");

      // Authenticated GET (with Authorization header)
      const authReq = makeMockRequest(`/api/reviews?sellerId=${alice._id.toString()}`, {
        token: bobToken,
      });
      const authRes = await handleGetReviews(authReq);
      const authCache = authRes.headers.get("Cache-Control") || "";
      assert.match(authCache, /private/i, "Authenticated request gets private");
      assert.match(authCache, /no-store/i, "Authenticated request gets no-store");
      assert.doesNotMatch(authCache, /public/i, "Authenticated request must NOT be public");
      console.log("  PASS: Cache isolation strictly verified");
    }

    // -----------------------------------------------------------------
    // TEST 16: Execution plans index verification (zero COLLSCAN)
    // -----------------------------------------------------------------
    console.log("\nTEST 16: Execution plan index verification (zero COLLSCAN)");
    {
      const publicExplain = (await ReviewModel.find({
        sellerId: alice._id,
        status: "published",
      })
        .sort({ createdAt: -1, _id: -1 })
        .limit(20)
        .explain("executionStats")) as any;

      const publicPlan = extractPlanDetails(publicExplain.executionStats.executionStages);
      assert(!publicPlan.hasCollScan, "Public review list strictly does NOT use COLLSCAN");
      assert(!publicPlan.hasSortStage, "Public review list uses index order: NO in-memory SORT");
      assert(
        publicPlan.indexUsed === "sellerId_1_status_1_createdAt_-1__id_-1",
        `Used compound index '${publicPlan.indexUsed}'`
      );

      const uniqueExplain = (await ReviewModel.findOne({
        reviewerId: bob._id,
        orderId: deliveredOrder._id,
      }).explain("executionStats")) as any;

      const uniquePlan = extractPlanDetails(uniqueExplain.executionStats.executionStages);
      assert(!uniquePlan.hasCollScan, "Uniqueness lookup strictly does NOT use COLLSCAN");
      assert(
        uniquePlan.indexUsed === "reviewerId_1_orderId_1",
        `Used compound unique index '${uniquePlan.indexUsed}'`
      );
      console.log("  PASS: Zero COLLSCAN and zero in-memory SORT verified with explain()");
    }

    // -----------------------------------------------------------------
    // TEST 17: Legacy reviews migration script (dry run & apply idempotency)
    // -----------------------------------------------------------------
    console.log("\nTEST 17: Legacy data migration idempotency & drift check");
    {
      const rawColl = mongoose.connection.collection("reviews");
      const legacySeller = new mongoose.Types.ObjectId();
      const legacyReviewer = new mongoose.Types.ObjectId();
      const legacyOrder = new mongoose.Types.ObjectId();

      // Temporarily drop unique index to simulate pre-migration state where duplicates existed in MongoDB
      try {
        await rawColl.dropIndex("reviewerId_1_orderId_1");
      } catch {}

      // Seed un-normalized legacy reviews:
      // Doc 1: valid legacy
      await rawColl.insertOne({
        sellerId: legacySeller,
        reviewerId: legacyReviewer,
        orderId: legacyOrder,
        rating: 4.2, // unrounded float
        comment: "Legacy review text",
        status: "published",
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      // Doc 2: duplicate on same order
      await rawColl.insertOne({
        sellerId: legacySeller,
        reviewerId: legacyReviewer,
        orderId: legacyOrder,
        rating: 5,
        comment: "Duplicate review",
        status: "published",
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      // Doc 3: malformed missing comment
      await rawColl.insertOne({
        sellerId: legacySeller,
        reviewerId: legacyReviewer,
        rating: 5,
        status: "published",
      } as any);

      // Run dry-run migration
      const dryRunSummary = await runReviewMigration({ dryRun: true });
      assert(dryRunSummary.migrated > 0, "Dry run identified items to migrate");
      assert(dryRunSummary.duplicates > 0, "Dry run identified duplicates");

      // Run real apply migration
      const applySummary = await runReviewMigration({ dryRun: false });
      assert(applySummary.migrated > 0, "Real migration updated documents");

      // Re-initialize index on the cleaned collection
      await ReviewModel.init();

      // Run second apply migration (Idempotency check: 0 migrated, 0 duplicates)
      const secondRunSummary = await runReviewMigration({ dryRun: false });
      assert.strictEqual(secondRunSummary.migrated, 0, "Idempotent: second run modifies 0 documents");
      assert.strictEqual(secondRunSummary.duplicates, 0, "Idempotent: 0 duplicates on second run");
      assert.strictEqual(secondRunSummary.driftClean, true, "Drift check clean after migration");
      console.log("  PASS: Migration script is strictly idempotent with zero aggregate drift");
    }

    // -----------------------------------------------------------------
    // TEST 18: Legacy Express route deprecation & safety
    // -----------------------------------------------------------------
    console.log("\nTEST 18: Legacy Express endpoint deprecation & hardening");
    {
      try {
        // @ts-ignore
        const expressMongooseModule = await import("../campus-hive-backend/node_modules/mongoose/index.js");
        const expMg = (expressMongooseModule as any).default?.default || (expressMongooseModule as any).default || expressMongooseModule;
        if (expMg.connection?.readyState === 0) {
          await expMg.connect(uri);
        }
      } catch {
        // Express mongoose not separated or already connected
      }

      const { createReview: expressCreateReview, getSellerReviews: expressGetReviews } = await import(
        "../campus-hive-backend/controllers/review.controller.js"
      );

      const makeExpressRes = () => {
        const headers: Record<string, string> = {};
        let status = 200;
        let json: any = null;
        const res: any = {
          setHeader: (k: string, v: string) => {
            headers[k] = v;
          },
          status: (s: number) => {
            status = s;
            return res;
          },
          json: (data: any) => {
            json = data;
          },
        };
        return { res, getHeaders: () => headers, getStatus: () => status, getJson: () => json };
      };

      // 1. Test GET /api/reviews/seller/:sellerId in Express
      const getRes = makeExpressRes();
      await expressGetReviews(
        { params: { sellerId: alice._id.toString() } } as any,
        getRes.res
      );

      assert.strictEqual(getRes.getHeaders()["X-API-Deprecated"], "true", "Express sends deprecation header");
      assert.strictEqual(getRes.getHeaders()["X-API-Replacement"], "/api/reviews", "Express points to /api/reviews");
      assert.match(getRes.getHeaders()["Cache-Control"], /private/i, "Express sets private caching");

      // 2. Test POST /api/reviews without orderId -> 400 rejection
      const postNoOrderRes = makeExpressRes();
      await expressCreateReview(
        {
          user: { id: bob._id.toString() },
          body: {
            sellerId: alice._id.toString(),
            rating: 5,
            comment: "Direct review without orderId",
          },
        } as any,
        postNoOrderRes.res
      );
      assert.strictEqual(postNoOrderRes.getStatus(), 400, "Express rejects review without orderId with 400");
      assert.ok(
        postNoOrderRes.getJson()?.message?.includes("A valid orderId is required"),
        "Express error explains orderId is required"
      );

      // 3. Test POST /api/reviews with undelivered order -> 400 rejection
      const pendingOrder = await OrderModel.create({
        orderId: "ORD-EXP-PENDING-001",
        buyerId: bob._id.toString(),
        sellerId: alice._id.toString(),
        storeId: aliceStore._id.toString(),
        status: "pending",
        totalAmount: 10000,
        items: [{ listingId: laptopListing._id, title: "Phone", price: 10000, quantity: 1 }],
        paymentMethod: "cash",
        fulfillmentMethod: "pickup",
        createdAt: new Date().toISOString(),
      });

      const postPendingOrderRes = makeExpressRes();
      await expressCreateReview(
        {
          user: { id: bob._id.toString() },
          body: {
            orderId: pendingOrder._id.toString(),
            rating: 5,
            comment: "Review on pending order",
          },
        } as any,
        postPendingOrderRes.res
      );
      assert.strictEqual(postPendingOrderRes.getStatus(), 400, "Express rejects review for non-delivered order with 400");
      assert.strictEqual(postPendingOrderRes.getJson()?.message, "Order must be delivered before review");

      // 4. Test POST /api/reviews with valid delivered order -> 201 Created and sets deprecation header
      const deliveredOrder = await OrderModel.create({
        orderId: "ORD-EXP-DELIV-002",
        buyerId: bob._id.toString(),
        sellerId: alice._id.toString(),
        storeId: aliceStore._id.toString(),
        status: "delivered",
        totalAmount: 12000,
        items: [{ listingId: laptopListing._id, title: "Charger", price: 12000, quantity: 1 }],
        paymentMethod: "cash",
        fulfillmentMethod: "pickup",
        createdAt: new Date().toISOString(),
      });

      const postDeliveredRes = makeExpressRes();
      await expressCreateReview(
        {
          user: { id: bob._id.toString() },
          body: {
            orderId: deliveredOrder._id.toString(),
            rating: 5,
            comment: "Delivered order review via Express",
          },
        } as any,
        postDeliveredRes.res
      );
      assert.strictEqual(postDeliveredRes.getStatus(), 201, "Express creates review for delivered order with 201");
      assert.strictEqual(postDeliveredRes.getHeaders()["X-API-Deprecated"], "true", "Express sends deprecation header on POST");

      // 5. Test duplicate submission via Express -> 409 Conflict
      const postDuplicateRes = makeExpressRes();
      await expressCreateReview(
        {
          user: { id: bob._id.toString() },
          body: {
            orderId: deliveredOrder._id.toString(),
            rating: 4,
            comment: "Duplicate review attempt",
          },
        } as any,
        postDuplicateRes.res
      );
      assert.strictEqual(postDuplicateRes.getStatus(), 409, "Express rejects duplicate review on same order with 409");

      console.log("  PASS: Legacy Express review endpoint strictly enforces orderId, delivery status, and idempotency");
    }

    // -----------------------------------------------------------------
    // TEST 19: Missing, null, and empty orderId records coexist safely without unique collision
    // -----------------------------------------------------------------
    console.log("\nTEST 19: Missing, null, and empty orderId records coexist safely");
    {
      const rawColl = mongoose.connection.collection("reviews");

      // Insert legacy reviews with null, empty, or missing orderIds
      const leg1 = await rawColl.insertOne({
        sellerId: alice._id,
        reviewerId: bob._id,
        orderId: null,
        rating: 5,
        comment: "Legacy review 1 with null orderId",
        status: "published",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const leg2 = await rawColl.insertOne({
        sellerId: alice._id,
        reviewerId: bob._id,
        orderId: "",
        rating: 4,
        comment: "Legacy review 2 with empty orderId",
        status: "published",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const leg3 = await rawColl.insertOne({
        sellerId: alice._id,
        reviewerId: bob._id,
        rating: 5,
        comment: "Legacy review 3 without orderId",
        status: "published",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      assert.ok(leg1.insertedId && leg2.insertedId && leg3.insertedId, "All legacy reviews inserted");

      // Execute migration in apply mode to sanitize null/empty fields before index creation
      const { runReviewMigration } = await import("../scripts/migrate-legacy-reviews");
      await runReviewMigration({ dryRun: false });

      // Verify that multiple reviews from the same reviewer without orderId can now coexist
      await ReviewModel.create({
        sellerId: alice._id,
        reviewerId: bob._id,
        rating: 5,
        comment: "New distinct review without orderId 1",
        status: "published",
        schemaVersion: 1,
      });

      await ReviewModel.create({
        sellerId: alice._id,
        reviewerId: bob._id,
        rating: 4,
        comment: "New distinct review without orderId 2",
        status: "published",
        schemaVersion: 1,
      });

      // Ensure that actual duplicate on valid orderId is strictly rejected by compound unique index
      const sampleOid = new mongoose.Types.ObjectId();
      await ReviewModel.create({
        sellerId: alice._id,
        reviewerId: bob._id,
        orderId: sampleOid,
        rating: 5,
        comment: "Valid order review 1",
        status: "published",
        schemaVersion: 1,
      });

      let duplicateCaught = false;
      try {
        await ReviewModel.create({
          sellerId: alice._id,
          reviewerId: bob._id,
          orderId: sampleOid,
          rating: 4,
          comment: "Duplicate order review 2",
          status: "published",
          schemaVersion: 1,
        });
      } catch (e: any) {
        if (e.code === 11000) duplicateCaught = true;
      }
      assert.ok(duplicateCaught, "Duplicate (reviewerId, orderId) strictly throws E11000");

      console.log("  PASS: Null and empty orderIds sanitized and coexist without collision; unique compound index remains strict");
    }

    // -----------------------------------------------------------------
    // TEST 20: Rating aggregate drift detection and automated repair
    // -----------------------------------------------------------------
    console.log("\nTEST 20: Rating aggregate drift detection and automated repair");
    {
      const { checkReviewAggregateDrift, repairReviewAggregateDrift } = await import("../app/lib/reviewService");

      // Artificially corrupt Alice's stored rating
      await UserModel.updateOne(
        { _id: alice._id },
        { $set: { "rating.average": 1.0, "rating.count": 999 } }
      );

      // Verify drift check flags the discrepancy
      const driftBefore = await checkReviewAggregateDrift();
      assert.strictEqual(driftBefore.clean, false, "Drift check successfully flags corrupted rating");
      assert.ok(driftBefore.userMismatches.some((m) => m.id === alice._id.toString()), "Alice identified in drift report");

      // Run automated repair
      const repairResult = await repairReviewAggregateDrift();
      assert.ok(repairResult.repairedUsers >= 1, "At least 1 user repaired");
      assert.strictEqual(repairResult.cleanAfterRepair, true, "System is 100% clean after automated repair");

      // Verify Alice's DB values match live published reviews
      const aliceRestored = await UserModel.findById(alice._id).select("rating").lean();
      assert.strictEqual(aliceRestored?.rating?.count !== 999, true, "Alice's count restored from 999");
      console.log("  PASS: Drift detection and automated repair successfully verified with 0 residual mismatches");
    }

    console.log("\n====================================================================");
    console.log("       ALL 20 PHASE 4.6 REVIEWS MIGRATION TESTS PASSED!             ");
    console.log("====================================================================\n");
  } finally {
    process.env = originalEnv;
    if (mongod) {
      await mongoose.disconnect();
      await mongod.stop();
    }
  }
}

runReviewTestSuite()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Test suite failed:", err);
    process.exit(1);
  });
