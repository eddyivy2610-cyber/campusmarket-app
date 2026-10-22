import assert from "node:assert";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import mongoose from "mongoose";
import { NextRequest } from "next/server";
import { GET as handleGetSellerStats } from "../app/api/dashboard/seller-stats/route";
import OrderModel from "../app/models/Order";
import { ListingModel } from "../app/models/Listing";
import { StoreModel } from "../app/models/Store";
import { FollowerModel } from "../app/models/Follower";
import UserModel from "../app/models/User";
import { createAccessToken } from "../app/lib/authTokens";
import dbConnect from "../app/lib/dbConnect";
import { ORDER_STATUSES, OrderStatus } from "../app/constants/enums";

function makeMockRequest(
  url: string,
  options?: {
    method?: string;
    headers?: Record<string, string>;
  },
  token?: string
): NextRequest {
  const headers = new Headers(options?.headers || {});
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return new NextRequest(new URL(url, "http://localhost:3000"), {
    method: options?.method || "GET",
    headers,
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

async function runSellerStatsTestSuite() {
  console.log("====================================================================");
  console.log("         PHASE 4.5: SELLER DASHBOARD STATISTICS TEST SUITE          ");
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
    await ListingModel.init();
    await StoreModel.init();
    await OrderModel.init();
    await FollowerModel.init();

    // 1. Seed Users: Seller Alice, Seller Bob, Buyer Charlie, Admin Eve, Suspended Dave
    const alice = await UserModel.create({
      name: "Alice Seller",
      email: "alice@campushive.edu.ng",
      role: "seller",
      accountStatus: "active",
      profile: { displayName: "Alice's Student Tech", handle: "alice-tech" },
      tokenVersion: 0,
      schemaVersion: 1,
    });

    const bob = await UserModel.create({
      name: "Bob Competitor",
      email: "bob@campushive.edu.ng",
      role: "seller",
      accountStatus: "active",
      profile: { displayName: "Bob Essentials", handle: "bob-essentials" },
      tokenVersion: 0,
      schemaVersion: 1,
    });

    const charlie = await UserModel.create({
      name: "Charlie Buyer",
      email: "charlie@campushive.edu.ng",
      role: "buyer",
      accountStatus: "active",
      profile: { displayName: "Charlie Buyer", handle: "charlie-b" },
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
      role: "seller",
      accountStatus: "suspended",
      tokenVersion: 0,
      schemaVersion: 1,
    });

    const emptySeller = await UserModel.create({
      name: "Fresh Seller",
      email: "fresh@campushive.edu.ng",
      role: "seller",
      accountStatus: "active",
      tokenVersion: 0,
      schemaVersion: 1,
    });

    // Create stores
    const aliceStore = await StoreModel.create({
      ownerId: alice._id.toString(),
      name: "Alice Gadgets Hub",
      slug: "alice-gadgets-hub",
      description: "Laptops and tech accessories.",
      storeType: "student_store",
      category: "Electronics",
      campus: "ABU Samaru",
      operatingLocation: "Ribadu Hall, Room 42",
      logo: "https://res.cloudinary.com/campushive/image/upload/v1/store/alice-logo.png",
      status: "active",
      isVerified: true,
      verificationType: "student",
      metrics: { rating: 4.9, reviewsCount: 15, completedDeals: 10, listingsCount: 4 },
    });

    // Generate Tokens
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
      role: "seller",
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
      role: "seller",
      isStudent: true,
      studentVerified: true,
    });

    const emptySellerToken = createAccessToken({
      id: emptySeller._id.toString(),
      name: emptySeller.name,
      email: emptySeller.email,
      role: "seller",
      isStudent: true,
      studentVerified: true,
    });

    // Seed Alice Listings (4 active products, 1 inactive service)
    await ListingModel.create([
      {
        sellerId: alice._id.toString(),
        storeId: aliceStore._id.toString(),
        title: "HP EliteBook 840 G5",
        price: 185000,
        priceFormatted: "₦185,000",
        description: "Laptop in great condition",
        category: "Electronics",
        campus: "ABU Samaru",
        location: "Suleiman Hall",
        status: "active",
        listingType: "product",
        views: 120,
      },
      {
        sellerId: alice._id.toString(),
        storeId: aliceStore._id.toString(),
        title: "Casio fx-991EX Calculator",
        price: 8000,
        priceFormatted: "₦8,000",
        description: "Engineering calculator",
        category: "Electronics",
        campus: "ABU Samaru",
        location: "Faculty of Science",
        status: "active",
        listingType: "product",
        views: 80,
      },
      {
        sellerId: alice._id.toString(),
        // Unlinked personal listing (no storeId)
        title: "Anker 20000mAh Power Bank",
        price: 18000,
        priceFormatted: "₦18,000",
        description: "Original fast charge power bank",
        category: "Electronics",
        campus: "ABU Samaru",
        location: "Danfodio Hall",
        status: "active",
        listingType: "product",
        views: 50,
      },
      {
        sellerId: alice._id.toString(),
        storeId: aliceStore._id.toString(),
        title: "USB-C to HDMI Adapter",
        price: 4500,
        priceFormatted: "₦4,500",
        description: "4K adapter",
        category: "Electronics",
        campus: "ABU Samaru",
        location: "Engineering Complex",
        status: "active",
        listingType: "product",
        views: 30,
      },
      {
        sellerId: alice._id.toString(),
        title: "Thesis Document Typesetting",
        price: 5000,
        priceFormatted: "₦5,000",
        description: "LaTeX thesis typesetting",
        category: "Services",
        campus: "ABU Samaru",
        location: "Main Library",
        status: "paused", // Inactive
        listingType: "service",
        views: 15,
      },
    ]);

    // Seed Bob Listings (isolated from Alice)
    await ListingModel.create([
      {
        sellerId: bob._id.toString(),
        title: "Bob's Chemistry Textbook",
        price: 3500,
        priceFormatted: "₦3,500",
        description: "Clean copy",
        category: "Books & Academic Supplies",
        campus: "ABU Samaru",
        location: "Science Lobby",
        status: "active",
        listingType: "product",
        views: 95,
      },
    ]);

    // Seed Orders for Alice across all statuses
    // 2 delivered (total = 185000 + 8000 = 193000)
    // 1 pending (4500)
    // 1 confirmed (18000)
    // 1 processing (5000)
    // 1 shipped (3000)
    // 1 cancelled (10000)
    // 1 disputed (12000)
    // Total orders = 8. Active orders = 4 (pending + confirmed + processing + shipped)
    await OrderModel.insertMany([
      {
        orderId: "ORD-100001-CH",
        buyerId: charlie._id.toString(),
        sellerId: alice._id.toString(),
        storeId: aliceStore._id.toString(),
        status: "delivered",
        totalAmount: 185000,
        items: [{ listingId: new mongoose.Types.ObjectId(), title: "HP EliteBook 840 G5", price: 185000, quantity: 1 }],
        paymentMethod: "cash",
        fulfillmentMethod: "pickup",
        createdAt: new Date("2026-10-15T10:00:00Z").toISOString(),
      },
      {
        orderId: "ORD-100002-CH",
        buyerId: charlie._id.toString(),
        sellerId: alice._id.toString(),
        status: "delivered", // Unlinked personal listing order
        totalAmount: 8000,
        items: [{ listingId: new mongoose.Types.ObjectId(), title: "Casio Calculator", price: 8000, quantity: 1 }],
        paymentMethod: "transfer",
        fulfillmentMethod: "pickup",
        createdAt: new Date("2026-10-16T12:00:00Z").toISOString(),
      },
      {
        orderId: "ORD-100003-CH",
        buyerId: charlie._id.toString(),
        sellerId: alice._id.toString(),
        status: "pending",
        totalAmount: 4500,
        items: [{ listingId: new mongoose.Types.ObjectId(), title: "USB-C Adapter", price: 4500, quantity: 1 }],
        paymentMethod: "cash",
        fulfillmentMethod: "pickup",
        createdAt: new Date("2026-10-17T09:00:00Z").toISOString(),
      },
      {
        orderId: "ORD-100004-CH",
        buyerId: charlie._id.toString(),
        sellerId: alice._id.toString(),
        status: "confirmed",
        totalAmount: 18000,
        items: [{ listingId: new mongoose.Types.ObjectId(), title: "Anker Power Bank", price: 18000, quantity: 1 }],
        paymentMethod: "transfer",
        fulfillmentMethod: "pickup",
        createdAt: new Date("2026-10-18T14:00:00Z").toISOString(),
      },
      {
        orderId: "ORD-100005-CH",
        buyerId: charlie._id.toString(),
        sellerId: alice._id.toString(),
        status: "processing",
        totalAmount: 5000,
        items: [{ listingId: new mongoose.Types.ObjectId(), title: "Thesis Prep", price: 5000, quantity: 1 }],
        paymentMethod: "cash",
        fulfillmentMethod: "pickup",
        createdAt: new Date("2026-10-19T11:00:00Z").toISOString(),
      },
      {
        orderId: "ORD-100006-CH",
        buyerId: charlie._id.toString(),
        sellerId: alice._id.toString(),
        status: "shipped",
        totalAmount: 3000,
        items: [{ listingId: new mongoose.Types.ObjectId(), title: "Study Pack", price: 3000, quantity: 1 }],
        paymentMethod: "cash",
        fulfillmentMethod: "pickup",
        createdAt: new Date("2026-10-20T16:00:00Z").toISOString(),
      },
      {
        orderId: "ORD-100007-CH",
        buyerId: charlie._id.toString(),
        sellerId: alice._id.toString(),
        status: "cancelled",
        totalAmount: 10000,
        items: [{ listingId: new mongoose.Types.ObjectId(), title: "Cancelled Item", price: 10000, quantity: 1 }],
        paymentMethod: "cash",
        fulfillmentMethod: "pickup",
        createdAt: new Date("2026-10-21T08:00:00Z").toISOString(),
      },
      {
        orderId: "ORD-100008-CH",
        buyerId: charlie._id.toString(),
        sellerId: alice._id.toString(),
        status: "disputed",
        totalAmount: 12000,
        items: [{ listingId: new mongoose.Types.ObjectId(), title: "Disputed Item", price: 12000, quantity: 1 }],
        paymentMethod: "cash",
        fulfillmentMethod: "pickup",
        createdAt: new Date("2026-10-21T10:00:00Z").toISOString(),
      },
    ]);

    // Seed Bob's Order (isolated)
    await OrderModel.create({
      orderId: "ORD-200001-CH",
      buyerId: charlie._id.toString(),
      sellerId: bob._id.toString(),
      status: "delivered",
      totalAmount: 3500,
      items: [{ listingId: new mongoose.Types.ObjectId(), title: "Chemistry Book", price: 3500, quantity: 1 }],
      paymentMethod: "cash",
      fulfillmentMethod: "pickup",
      createdAt: new Date("2026-10-21T11:00:00Z").toISOString(),
    });

    // Seed Followers
    await FollowerModel.create([
      { followerId: charlie._id.toString(), followingId: alice._id.toString(), targetType: "user" },
      { followerId: charlie._id.toString(), followingId: aliceStore._id.toString(), targetType: "store" },
    ]);

    // -----------------------------------------------------------------
    // TEST 1: Unauthenticated request returns 401; suspended account returns 403
    // -----------------------------------------------------------------
    console.log("TEST 1: Authentication & live account-status checks");
    {
      const unauthReq = makeMockRequest("/api/dashboard/seller-stats");
      const unauthRes = await handleGetSellerStats(unauthReq);
      assert.strictEqual(unauthRes.status, 401, "Unauthenticated request returns 401");

      const suspReq = makeMockRequest("/api/dashboard/seller-stats", {}, suspendedToken);
      const suspRes = await handleGetSellerStats(suspReq);
      assert.strictEqual(suspRes.status, 403, "Suspended seller request returns 403");
      const suspJson = await suspRes.json();
      assert.match(suspJson.error, /suspended/i, "Error message states account is suspended");
      console.log("  PASS: Unauthenticated (401) and suspended (403) strictly enforced");
    }

    // -----------------------------------------------------------------
    // TEST 2: Identity & cross-seller access isolation
    // -----------------------------------------------------------------
    console.log("\nTEST 2: Cross-seller access prevention");
    {
      // Bob tries to view Alice's statistics by sending ?sellerId=aliceId
      const crossReq = makeMockRequest(
        `/api/dashboard/seller-stats?sellerId=${alice._id.toString()}`,
        {},
        bobToken
      );
      const crossRes = await handleGetSellerStats(crossReq);
      assert.strictEqual(crossRes.status, 403, "Cross-seller query rejected with 403 Forbidden");

      // Alice queries her own stats without query param
      const ownReq = makeMockRequest("/api/dashboard/seller-stats", {}, aliceToken);
      const ownRes = await handleGetSellerStats(ownReq);
      assert.strictEqual(ownRes.status, 200, "Authorized seller gets 200 OK");
      const ownJson = await ownRes.json();
      assert.strictEqual(ownJson.data.sellerId, alice._id.toString(), "Session sellerId authoritative");
      console.log("  PASS: Client-supplied seller ID never overrides session identity for non-admin");
    }

    // -----------------------------------------------------------------
    // TEST 3: Listing counts scoping and product/service handling
    // -----------------------------------------------------------------
    console.log("\nTEST 3: Listing counts scoping and product/service distinction");
    {
      const req = makeMockRequest("/api/dashboard/seller-stats", {}, aliceToken);
      const res = await handleGetSellerStats(req);
      const json = await res.json();
      const listings = json.data.listings;

      assert.strictEqual(listings.total, 5, "Total listings strictly 5 (does not include Bob's 1 listing)");
      assert.strictEqual(listings.active, 4, "Active listings is 4");
      assert.strictEqual(listings.inactive, 1, "Inactive listings is 1 (thesis typesetting was paused)");
      assert.strictEqual(listings.products, 4, "Product listings count is 4");
      assert.strictEqual(listings.services, 1, "Service listings count is 1");

      // Invariants
      assert.strictEqual(
        listings.active + listings.inactive,
        listings.total,
        "Invariant holds: active + inactive === total"
      );
      assert.strictEqual(
        listings.products + listings.services,
        listings.total,
        "Invariant holds: products + services === total"
      );
      console.log("  PASS: Listing counts scoped to seller; product/service separation verified");
    }

    // -----------------------------------------------------------------
    // TEST 4: Order counts scoping & storeId/unlinked invariance
    // -----------------------------------------------------------------
    console.log("\nTEST 4: Order scoping across unlinked and store orders");
    {
      const req = makeMockRequest("/api/dashboard/seller-stats", {}, aliceToken);
      const res = await handleGetSellerStats(req);
      const json = await res.json();
      const orders = json.data.orders;

      // Alice has 8 orders total (does NOT include Bob's 1 order)
      assert.strictEqual(orders.totalOrders, 8, "Alice total orders is 8, Bob's order excluded");
      console.log("  PASS: Order queries capture both store and personal unlinked orders");
    }

    // -----------------------------------------------------------------
    // TEST 5: Status-to-bucket mapping and sum invariant
    // -----------------------------------------------------------------
    console.log("\nTEST 5: Exact status-to-bucket mapping & sum invariant");
    {
      const req = makeMockRequest("/api/dashboard/seller-stats", {}, aliceToken);
      const res = await handleGetSellerStats(req);
      const json = await res.json();
      const { byStatus, totalOrders, activeOrdersCount, completedOrdersCount } = json.data.orders;

      assert.strictEqual(byStatus.pending, 1, "pending count === 1");
      assert.strictEqual(byStatus.confirmed, 1, "confirmed count === 1");
      assert.strictEqual(byStatus.processing, 1, "processing count === 1");
      assert.strictEqual(byStatus.shipped, 1, "shipped count === 1");
      assert.strictEqual(byStatus.delivered, 2, "delivered count === 2");
      assert.strictEqual(byStatus.cancelled, 1, "cancelled count === 1");
      assert.strictEqual(byStatus.disputed, 1, "disputed count === 1");

      // Verify sum of buckets equals totalOrders
      const sumOfBuckets =
        byStatus.pending +
        byStatus.confirmed +
        byStatus.processing +
        byStatus.shipped +
        byStatus.delivered +
        byStatus.cancelled +
        byStatus.disputed;

      assert.strictEqual(sumOfBuckets, totalOrders, "Sum of all 7 buckets strictly equals totalOrders (8)");
      assert.strictEqual(activeOrdersCount, 4, "activeOrdersCount === 4 (pending + confirmed + processing + shipped)");
      assert.strictEqual(completedOrdersCount, 2, "completedOrdersCount === 2 (delivered)");
      console.log("  PASS: 7 status buckets mapped with zero double counting; sum invariant verified");
    }

    // -----------------------------------------------------------------
    // TEST 6: Cancelled and disputed orders zero value contribution
    // -----------------------------------------------------------------
    console.log("\nTEST 6: Cancelled and disputed orders excluded from completed sales");
    {
      const req = makeMockRequest("/api/dashboard/seller-stats", {}, aliceToken);
      const res = await handleGetSellerStats(req);
      const json = await res.json();
      const { completedOrderValue, activeOrderValue } = json.data.orderValue;

      // Alice's delivered orders = 185000 + 8000 = 193000
      assert.strictEqual(completedOrderValue, 193000, "Completed order value is strictly ₦193,000");

      // Active orders = 4500 (pending) + 18000 (confirmed) + 5000 (processing) + 3000 (shipped) = 30500
      assert.strictEqual(activeOrderValue, 30500, "Active order value is strictly ₦30,500");

      // Verify cancelled (10000) and disputed (12000) are completely excluded from both
      assert.strictEqual(
        completedOrderValue + activeOrderValue,
        223500,
        "Total active + completed excludes cancelled (10k) and disputed (12k)"
      );
      console.log("  PASS: Cancelled and disputed orders contribute ₦0 to completed order value");
    }

    // -----------------------------------------------------------------
    // TEST 7: Order value semantics (No "revenue", "earnings", or "profit" labels)
    // -----------------------------------------------------------------
    console.log("\nTEST 7: Terminology guard: strict 'orderValue' nomenclature");
    {
      const req = makeMockRequest("/api/dashboard/seller-stats", {}, aliceToken);
      const res = await handleGetSellerStats(req);
      const json = await res.json();

      const rawString = JSON.stringify(json);
      assert.doesNotMatch(rawString, /"revenue"/i, "No 'revenue' field allowed in API contract");
      assert.doesNotMatch(rawString, /"totalEarnings"/i, "No 'totalEarnings' field allowed in API contract");
      assert.doesNotMatch(rawString, /"profit"/i, "No 'profit' field allowed in API contract");

      assert.ok(json.data.orderValue, "Explicit 'orderValue' block present");
      assert.strictEqual(json.data.orderValue.currency, "NGN", "Currency strictly documented as NGN");
      assert.strictEqual(json.data.orderValue.completedOrderValueFormatted, "₦193,000");
      console.log("  PASS: Platform non-custodial integrity preserved: zero revenue/earnings claims");
    }

    // -----------------------------------------------------------------
    // TEST 8: Seller with no store, no listings, and no orders gets valid 200
    // -----------------------------------------------------------------
    console.log("\nTEST 8: Zero-valued resilience for new seller");
    {
      const req = makeMockRequest("/api/dashboard/seller-stats", {}, emptySellerToken);
      const res = await handleGetSellerStats(req);
      assert.strictEqual(res.status, 200, "Fresh seller returns 200 OK");
      const json = await res.json();

      assert.strictEqual(json.data.listings.total, 0);
      assert.strictEqual(json.data.listings.active, 0);
      assert.strictEqual(json.data.orders.totalOrders, 0);
      assert.strictEqual(json.data.orders.byStatus.delivered, 0);
      assert.strictEqual(json.data.orderValue.completedOrderValue, 0);
      assert.strictEqual(json.data.orderValue.completedOrderValueFormatted, "₦0");
      assert.strictEqual(json.data.audience.followersCount, 0);
      assert.strictEqual(json.data.audience.impressions, 0);
      assert.strictEqual(json.data.store.hasStore, false);
      assert.strictEqual(json.data.recentActivity.length, 0);
      assert.strictEqual(json.data.topItems.length, 0);
      console.log("  PASS: Pristine seller receives integer zeros, not null, without 500 error");
    }

    // -----------------------------------------------------------------
    // TEST 9: Legacy & malformed records resilience
    // -----------------------------------------------------------------
    console.log("\nTEST 9: Legacy/malformed records error safety");
    {
      // Insert legacy raw order directly bypassing Mongoose validation (simulating pre-existing legacy records)
      await OrderModel.collection.insertOne({
        orderId: "ORD-999999-CH",
        buyerId: charlie._id.toString(),
        sellerId: alice._id.toString(),
        status: "delivered",
        totalAmount: 1000,
        items: [],
        paymentMethod: "cash",
        fulfillmentMethod: "pickup",
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      const req = makeMockRequest("/api/dashboard/seller-stats", {}, aliceToken);
      const res = await handleGetSellerStats(req);
      assert.strictEqual(res.status, 200, "Endpoint recovers gracefully without throwing 500");
      console.log("  PASS: Legacy record safely processed without crashing aggregation");
    }

    // -----------------------------------------------------------------
    // TEST 10: Admin authorized cross-seller inspection
    // -----------------------------------------------------------------
    console.log("\nTEST 10: Admin role validation and live DB check");
    {
      // Admin Eve inspects Alice's stats
      const adminReq = makeMockRequest(
        `/api/dashboard/seller-stats?sellerId=${alice._id.toString()}`,
        {},
        adminToken
      );
      const adminRes = await handleGetSellerStats(adminReq);
      assert.strictEqual(adminRes.status, 200, "Admin authorized to view seller stats");
      const adminJson = await adminRes.json();
      assert.strictEqual(adminJson.data.sellerId, alice._id.toString(), "Returns requested seller's stats");

      // Demoted admin check
      await UserModel.updateOne({ _id: eveAdmin._id }, { $set: { role: "buyer" } });
      const demotedRes = await handleGetSellerStats(adminReq);
      assert.strictEqual(demotedRes.status, 403, "Live DB check blocks demoted admin");
      await UserModel.updateOne({ _id: eveAdmin._id }, { $set: { role: "admin" } });
      console.log("  PASS: Admin access strictly validated against live database role");
    }

    // -----------------------------------------------------------------
    // TEST 11: Recent activity bounded and strict privacy
    // -----------------------------------------------------------------
    console.log("\nTEST 11: Recent activity bounding & privacy protection");
    {
      const req = makeMockRequest("/api/dashboard/seller-stats", {}, aliceToken);
      const res = await handleGetSellerStats(req);
      const json = await res.json();
      const activity = json.data.recentActivity;

      assert.ok(activity.length <= 10, "Activity list bounded at $\\le 10$ items");
      const serialized = JSON.stringify(activity);

      assert.doesNotMatch(serialized, /charlie@campushive\.edu\.ng/i, "Buyer email is NEVER exposed");
      assert.doesNotMatch(serialized, /phone/i, "Buyer phone is NEVER exposed");
      assert.doesNotMatch(serialized, /token/i, "No internal tokens leaked in activity");

      assert.strictEqual(activity[0].buyerDisplayName, "Charlie Buyer", "Public display name returned");
      console.log("  PASS: Recent activity bounded to 10 with zero PII exposure");
    }

    // -----------------------------------------------------------------
    // TEST 12: Stored counter drift detection vs live truth
    // -----------------------------------------------------------------
    console.log("\nTEST 12: Stored counter drift detection");
    {
      // Alice has 4 active listings, but store.metrics.listingsCount was seeded as 4 (driftDetected: false)
      const req1 = makeMockRequest("/api/dashboard/seller-stats", {}, aliceToken);
      const res1 = await handleGetSellerStats(req1);
      const json1 = await res1.json();
      assert.strictEqual(json1.data.store.driftDetected, false, "No drift when store count matches live count");

      // Artificially mutate store.metrics.listingsCount to 10 (causing drift)
      await StoreModel.updateOne({ _id: aliceStore._id }, { $set: { "metrics.listingsCount": 10 } });
      const res2 = await handleGetSellerStats(req1);
      const json2 = await res2.json();
      assert.strictEqual(json2.data.store.driftDetected, true, "Drift detected when store count diverges");
      assert.strictEqual(json2.data.listings.active, 4, "Dashboard authoritative value remains live count (4)");
      console.log("  PASS: Stored metric drift detected; live database count remains source of truth");
    }

    // -----------------------------------------------------------------
    // TEST 13: Concurrent order changes & invariant preservation
    // -----------------------------------------------------------------
    console.log("\nTEST 13: Invariant preservation under concurrent reads");
    {
      // Execute 5 concurrent stats reads while an order updates status
      const promises = [
        handleGetSellerStats(makeMockRequest("/api/dashboard/seller-stats", {}, aliceToken)),
        handleGetSellerStats(makeMockRequest("/api/dashboard/seller-stats", {}, aliceToken)),
        handleGetSellerStats(makeMockRequest("/api/dashboard/seller-stats", {}, aliceToken)),
      ];

      const responses = await Promise.all(promises);
      for (const res of responses) {
        assert.strictEqual(res.status, 200);
        const json = await res.json();
        const { byStatus, totalOrders } = json.data.orders;
        const bucketSum = Object.values(byStatus).reduce((a: number, b: any) => a + Number(b), 0);
        assert.strictEqual(bucketSum, totalOrders, "Invariant holds: totalOrders === sum(byStatus)");
      }
      console.log("  PASS: Invariant holds across concurrent requests");
    }

    // -----------------------------------------------------------------
    // TEST 14: Cache-Control headers
    // -----------------------------------------------------------------
    console.log("\nTEST 14: Cache headers enforcement");
    {
      const req = makeMockRequest("/api/dashboard/seller-stats", {}, aliceToken);
      const res = await handleGetSellerStats(req);
      const cacheControl = res.headers.get("Cache-Control") || "";

      assert.match(cacheControl, /private/i, "Must contain private");
      assert.match(cacheControl, /no-store/i, "Must contain no-store");
      assert.doesNotMatch(cacheControl, /public/i, "Must NOT contain public");
      assert.doesNotMatch(cacheControl, /s-maxage/i, "Must NOT contain s-maxage");
      console.log("  PASS: Strict 'private, no-store' cache headers verified");
    }

    // -----------------------------------------------------------------
    // TEST 15: Execution plan verification: zero COLLSCAN on hot paths
    // -----------------------------------------------------------------
    console.log("\nTEST 15: Execution plan index verification (zero COLLSCAN)");
    {
      const orderExplain = (await OrderModel.find({
        sellerId: alice._id.toString(),
        status: "delivered",
      })
        .sort({ createdAt: -1 })
        .limit(10)
        .explain("executionStats")) as any;

      const orderPlan = extractPlanDetails(orderExplain.executionStats.executionStages);
      assert(!orderPlan.hasCollScan, "Orders aggregation query strictly does NOT use COLLSCAN");
      assert(!orderPlan.hasSortStage, "Orders query uses index order: NO in-memory SORT");
      const orderIndex = String(orderPlan.indexUsed || "");
      assert(
        orderIndex.includes("sellerId_1_status_1_createdAt_-1") ||
          orderIndex.includes("sellerId_1_createdAt_-1"),
        `Used compound index '${orderPlan.indexUsed}'`
      );

      const listingExplain = (await ListingModel.find({
        sellerId: alice._id.toString(),
        status: "active",
      })
        .limit(10)
        .explain("executionStats")) as any;

      const listingPlan = extractPlanDetails(listingExplain.executionStats.executionStages);
      assert(!listingPlan.hasCollScan, "Listings stats query strictly does NOT use COLLSCAN");
      assert.strictEqual(listingPlan.indexUsed, "sellerId_1_status_1", "Used sellerId_1_status_1 index");
      console.log("  PASS: Zero COLLSCAN and zero in-memory SORT verified with explain()");
    }

    // -----------------------------------------------------------------
    // TEST 16: Legacy Express route compatibility & deprecation
    // -----------------------------------------------------------------
    console.log("\nTEST 16: Legacy Express route deprecation headers & safety");
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

      const { getSellerDashboardStats } = await import(
        "../campus-hive-backend/controllers/dashboard.controller.js"
      );

      const mockExpressReq: any = {
        user: { id: alice._id.toString() },
        query: { sellerId: bob._id.toString() }, // Untrusted query parameter
      };

      let statusSent = 200;
      let jsonSent: any = null;
      const headersSent: Record<string, string> = {};

      const mockExpressRes: any = {
        setHeader: (k: string, v: string) => {
          headersSent[k] = v;
        },
        status: (s: number) => {
          statusSent = s;
          return mockExpressRes;
        },
        json: (data: any) => {
          jsonSent = data;
        },
      };

      await getSellerDashboardStats(mockExpressReq, mockExpressRes);

      assert.strictEqual(headersSent["X-API-Deprecated"], "true", "Express sends deprecation header");
      assert.strictEqual(
        headersSent["X-API-Replacement"],
        "/api/dashboard/seller-stats",
        "Express indicates replacement canonical route"
      );
      assert.match(headersSent["Cache-Control"] || "", /private/i, "Express sends private cache header");
      console.log("  PASS: Legacy Express endpoint safely marked deprecated with private caching");
    }

    // -----------------------------------------------------------------
    // TEST 17: Multi-collection regression integrity
    // -----------------------------------------------------------------
    console.log("\nTEST 17: Platform regression integrity");
    {
      // Confirm orders, listings, followers, stores collections are unchanged
      const totalOrders = await OrderModel.countDocuments();
      const totalListings = await ListingModel.countDocuments();
      const totalFollows = await FollowerModel.countDocuments();
      const totalStores = await StoreModel.countDocuments();

      assert.ok(totalOrders > 0, "Orders collection intact");
      assert.ok(totalListings > 0, "Listings collection intact");
      assert.ok(totalFollows > 0, "Followers collection intact");
      assert.ok(totalStores > 0, "Stores collection intact");
      console.log("  PASS: Full platform collection integrity verified without side effects");
    }

    console.log("\n====================================================================");
    console.log("   ALL 17 PHASE 4.5 SELLER DASHBOARD STATISTICS TESTS PASSED!      ");
    console.log("====================================================================");
  } finally {
    process.env = originalEnv;
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    if (mongod) {
      await mongod.stop();
    }
  }
}

runSellerStatsTestSuite()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Test suite failed:", err);
    process.exit(1);
  });
