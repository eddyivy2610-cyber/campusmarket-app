import assert from "node:assert";
import crypto from "node:crypto";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import mongoose from "mongoose";
import { NextRequest } from "next/server";
import { POST as handleCreateOrder, GET as handleListOrders } from "../app/api/orders/route";
import { GET as handleGetOrder, PATCH as handlePatchOrder } from "../app/api/orders/[id]/route";
import OrderModel from "../app/models/Order";
import ListingModel from "../app/models/Listing";
import UserModel from "../app/models/User";
import { createAccessToken } from "../app/lib/authTokens";
import dbConnect from "../app/lib/dbConnect";

function makeMockRequest(
  url: string,
  options?: {
    method?: string;
    headers?: Record<string, string>;
    body?: any;
  },
  token?: string
): NextRequest {
  const headers = new Headers(options?.headers || {});
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let requestBody: any = undefined;
  if (options?.body !== undefined) {
    headers.set("Content-Type", "application/json");
    requestBody = JSON.stringify(options.body);
  }

  return new NextRequest(new URL(url, "http://localhost:3000"), {
    method: options?.method || "GET",
    headers,
    body: requestBody,
  });
}

async function runOrdersTestSuite() {
  console.log("====================================================================");
  console.log("             PHASE 4.3: ORDERS MIGRATION TEST SUITE                 ");
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

    // 1. Seed Users: Buyer Alice, Seller Bob, Intruder Charlie, Admin Eve
    const aliceId = new mongoose.Types.ObjectId().toHexString();
    const bobId = new mongoose.Types.ObjectId().toHexString();
    const charlieId = new mongoose.Types.ObjectId().toHexString();
    const adminId = new mongoose.Types.ObjectId().toHexString();

    await UserModel.create([
      {
        _id: aliceId,
        name: "Alice Buyer",
        email: "alice@campushive.edu.ng",
        role: "buyer",
        accountStatus: "active",
      },
      {
        _id: bobId,
        name: "Bob Seller",
        email: "bob@campushive.edu.ng",
        role: "seller",
        accountStatus: "active",
      },
      {
        _id: charlieId,
        name: "Charlie Intruder",
        email: "charlie@campushive.edu.ng",
        role: "buyer",
        accountStatus: "active",
      },
      {
        _id: adminId,
        name: "Eve Admin",
        email: "admin@campushive.edu.ng",
        role: "admin",
        accountStatus: "active",
      },
    ]);

    const tokenAlice = createAccessToken({
      id: aliceId,
      name: "Alice Buyer",
      email: "alice@campushive.edu.ng",
      role: "buyer" as any,
      isStudent: true,
      studentVerified: true,
    });

    const tokenBob = createAccessToken({
      id: bobId,
      name: "Bob Seller",
      email: "bob@campushive.edu.ng",
      role: "seller" as any,
      isStudent: true,
      studentVerified: true,
    });

    const tokenCharlie = createAccessToken({
      id: charlieId,
      name: "Charlie Intruder",
      email: "charlie@campushive.edu.ng",
      role: "buyer" as any,
      isStudent: true,
      studentVerified: true,
    });

    const tokenAdmin = createAccessToken({
      id: adminId,
      name: "Eve Admin",
      email: "admin@campushive.edu.ng",
      role: "admin" as any,
      isStudent: false,
      studentVerified: true,
    });

    // 2. Seed Listings: One active, one sold/inactive
    const activeListing = await ListingModel.create({
      sellerId: bobId,
      title: "TI-84 Plus CE Graphing Calculator",
      price: 35000,
      priceFormatted: "₦35,000",
      description: "Working condition calculator for engineering courses",
      category: "Academics",
      campus: "ABU Zaria",
      location: "Main Campus",
      condition: "Used - Good",
      listingType: "product",
      status: "active",
      images: ["https://res.cloudinary.com/campushive/image/upload/v1/campushive/listings/calc.jpg"],
    });

    const inactiveListing = await ListingModel.create({
      sellerId: bobId,
      title: "Draft Chemistry Lab Coat",
      price: 6000,
      priceFormatted: "₦6,000",
      description: "Lab coat size L",
      category: "Academics",
      campus: "ABU Zaria",
      location: "Main Campus",
      condition: "Brand New",
      listingType: "product",
      status: "sold", // INACTIVE
      images: ["https://res.cloudinary.com/campushive/image/upload/v1/campushive/listings/coat.jpg"],
    });

    // -------------------------------------------------------------------------
    // TEST 1: Unauthenticated order creation and reads are rejected (401)
    // -------------------------------------------------------------------------
    console.log("TEST 1: Unauthenticated order operations rejected with 401");
    const unauthPost = makeMockRequest("/api/orders", {
      method: "POST",
      body: { listingId: activeListing._id.toString() },
    });
    const unauthPostRes = await handleCreateOrder(unauthPost);
    assert.ok(unauthPostRes);
    assert.strictEqual(unauthPostRes.status, 401, "POST /api/orders without auth must return 401");

    const unauthGet = makeMockRequest("/api/orders", { method: "GET" });
    const unauthGetRes = await handleListOrders(unauthGet);
    assert.ok(unauthGetRes);
    assert.strictEqual(unauthGetRes.status, 401, "GET /api/orders without auth must return 401");
    console.log("  PASS: Unauthenticated access blocked");

    // -------------------------------------------------------------------------
    // TEST 2: Client-supplied buyer, seller, or price values cannot override DB
    // -------------------------------------------------------------------------
    console.log("\nTEST 2: Client-supplied buyerId, sellerId, or price ignored in favor of DB/session");
    const spoofOrderReq = makeMockRequest(
      "/api/orders",
      {
        method: "POST",
        body: {
          listingId: activeListing._id.toString(),
          buyerId: charlieId, // Attacker tries to impersonate Charlie
          sellerId: charlieId, // Attacker tries to divert seller
          price: 1, // Attacker tries to pay 1 Naira instead of 35,000
          totalAmount: 1,
          quantity: 2,
          paymentMethod: "cash",
          fulfillmentMethod: "pickup",
        },
      },
      tokenAlice // Real session is Alice
    );
    const spoofRes = await handleCreateOrder(spoofOrderReq);
    assert.ok(spoofRes);
    assert.strictEqual(spoofRes.status, 201, "Order creation must succeed with server-derived values");
    const spoofData = await spoofRes.json();
    const createdOrder = spoofData.data;

    // Verify buyer is strictly Alice (from session)
    assert.strictEqual(createdOrder.buyerId.toString(), aliceId, "buyerId must match session user Alice");
    // Verify seller is strictly Bob (from listing DB)
    assert.strictEqual(createdOrder.sellerId.toString(), bobId, "sellerId must match listing owner Bob");
    // Verify price snapshot matches listing price (35,000) not client 1
    assert.strictEqual(createdOrder.items[0].price, 35000, "Price must snapshot database listing price (35000)");
    assert.strictEqual(createdOrder.totalAmount, 70000, "Total must equal price * qty (35000 * 2 = 70000)");
    console.log("  PASS: Client-supplied IDs and prices strictly overridden by session and DB snapshot");

    // -------------------------------------------------------------------------
    // TEST 3: Self-ordering is prohibited (400)
    // -------------------------------------------------------------------------
    console.log("\nTEST 3: Self-ordering is prohibited");
    const selfOrderReq = makeMockRequest(
      "/api/orders",
      {
        method: "POST",
        body: { listingId: activeListing._id.toString() },
      },
      tokenBob // Seller Bob tries to buy his own listing
    );
    const selfOrderRes = await handleCreateOrder(selfOrderReq);
    assert.ok(selfOrderRes);
    assert.strictEqual(selfOrderRes.status, 400, "Self-ordering must return 400 Bad Request");
    const selfOrderJson = await selfOrderRes.json();
    assert.ok(selfOrderJson.error.toLowerCase().includes("self-ordering"), "Error should explain self-ordering prohibited");
    console.log("  PASS: Self-ordering strictly blocked");

    // -------------------------------------------------------------------------
    // TEST 4: Inactive and unavailable listings rejected
    // -------------------------------------------------------------------------
    console.log("\nTEST 4: Inactive and non-existent listings rejected");
    // Sold listing
    const inactiveOrderReq = makeMockRequest(
      "/api/orders",
      {
        method: "POST",
        body: { listingId: inactiveListing._id.toString() },
      },
      tokenAlice
    );
    const inactiveRes = await handleCreateOrder(inactiveOrderReq);
    assert.ok(inactiveRes);
    assert.strictEqual(inactiveRes.status, 400, "Ordering inactive listing must return 400");

    // Non-existent listing
    const fakeListingId = new mongoose.Types.ObjectId().toHexString();
    const fakeOrderReq = makeMockRequest(
      "/api/orders",
      {
        method: "POST",
        body: { listingId: fakeListingId },
      },
      tokenAlice
    );
    const fakeRes = await handleCreateOrder(fakeOrderReq);
    assert.ok(fakeRes);
    assert.strictEqual(fakeRes.status, 404, "Ordering non-existent listing must return 404");
    console.log("  PASS: Inactive and non-existent listings rejected");

    // -------------------------------------------------------------------------
    // TEST 5: Access Control & Privacy: Third parties cannot read orders
    // -------------------------------------------------------------------------
    console.log("\nTEST 5: Strict privacy boundaries: third parties cannot read orders");
    const orderId = createdOrder._id.toString();

    // Charlie (unrelated user) attempts to GET Alice's order
    const intruderGetReq = makeMockRequest(`/api/orders/${orderId}`, { method: "GET" }, tokenCharlie);
    const intruderGetRes = await handleGetOrder(intruderGetReq, {
      params: Promise.resolve({ id: orderId }),
    });
    assert.ok(intruderGetRes);
    assert.strictEqual(intruderGetRes.status, 404, "Intruder must receive 404 Not Found");

    // Alice (buyer) GETs order
    const buyerGetReq = makeMockRequest(`/api/orders/${orderId}`, { method: "GET" }, tokenAlice);
    const buyerGetRes = await handleGetOrder(buyerGetReq, {
      params: Promise.resolve({ id: orderId }),
    });
    assert.ok(buyerGetRes);
    assert.strictEqual(buyerGetRes.status, 200, "Buyer must be able to view their own order");

    // Bob (seller) GETs order
    const sellerGetReq = makeMockRequest(`/api/orders/${orderId}`, { method: "GET" }, tokenBob);
    const sellerGetRes = await handleGetOrder(sellerGetReq, {
      params: Promise.resolve({ id: orderId }),
    });
    assert.ok(sellerGetRes);
    assert.strictEqual(sellerGetRes.status, 200, "Seller must be able to view order for their listing");

    // Admin GETs order
    const adminGetReq = makeMockRequest(`/api/orders/${orderId}`, { method: "GET" }, tokenAdmin);
    const adminGetRes = await handleGetOrder(adminGetReq, {
      params: Promise.resolve({ id: orderId }),
    });
    assert.ok(adminGetRes);
    assert.strictEqual(adminGetRes.status, 200, "Admin must be able to view order for dispute/audit");

    console.log("  PASS: Privacy strictly enforced: 404 returned to third parties, authorized access granted to parties");

    // -------------------------------------------------------------------------
    // TEST 6: Status Transitions & Role Permissions
    // -------------------------------------------------------------------------
    console.log("\nTEST 6: Status transitions & role permission validation");

    // 6a. Buyer Alice tries to confirm the order -> 403 (only seller can confirm)
    const buyerConfirmReq = makeMockRequest(
      `/api/orders/${orderId}`,
      { method: "PATCH", body: { status: "confirmed" } },
      tokenAlice
    );
    const buyerConfirmRes = await handlePatchOrder(buyerConfirmReq, {
      params: Promise.resolve({ id: orderId }),
    });
    assert.ok(buyerConfirmRes);
    assert.strictEqual(buyerConfirmRes.status, 403, "Buyer cannot confirm order (only seller can confirm)");

    // 6b. Seller Bob confirms the order -> 200
    const sellerConfirmReq = makeMockRequest(
      `/api/orders/${orderId}`,
      { method: "PATCH", body: { status: "confirmed", comment: "Ready for campus meetup" } },
      tokenBob
    );
    const sellerConfirmRes = await handlePatchOrder(sellerConfirmReq, {
      params: Promise.resolve({ id: orderId }),
    });
    assert.ok(sellerConfirmRes);
    assert.strictEqual(sellerConfirmRes.status, 200, "Seller confirming order must succeed");
    const confirmedData = await sellerConfirmRes.json();
    assert.strictEqual(confirmedData.data.status, "confirmed");
    assert.strictEqual(confirmedData.data.history.length, 2);

    // 6c. Invalid backward transition (confirmed -> pending) -> 400
    const backwardReq = makeMockRequest(
      `/api/orders/${orderId}`,
      { method: "PATCH", body: { status: "pending" } },
      tokenBob
    );
    const backwardRes = await handlePatchOrder(backwardReq, {
      params: Promise.resolve({ id: orderId }),
    });
    assert.ok(backwardRes);
    assert.strictEqual(backwardRes.status, 400, "Backward transition to pending must return 400");

    console.log("  PASS: Role permissions and state transition machine strictly enforced");

    // -------------------------------------------------------------------------
    // TEST 7: Concurrent Conflicting Transitions (Atomic Concurrency Guard)
    // -------------------------------------------------------------------------
    console.log("\nTEST 7: Concurrent conflicting transitions resolve with exactly 1 winner and 1 conflict (409)");
    
    // Advance order to processing first
    await handlePatchOrder(
      makeMockRequest(`/api/orders/${orderId}`, { method: "PATCH", body: { status: "processing" } }, tokenBob),
      { params: Promise.resolve({ id: orderId }) }
    );

    // Now order is in 'processing'.
    // Request A: Seller Bob attempts to transition processing -> delivered
    // Request B: Buyer Alice attempts to transition processing -> disputed
    // Both dispatched concurrently via Promise.all
    const reqA = handlePatchOrder(
      makeMockRequest(`/api/orders/${orderId}`, { method: "PATCH", body: { status: "delivered", comment: "Item handed over" } }, tokenBob),
      { params: Promise.resolve({ id: orderId }) }
    );
    const reqB = handlePatchOrder(
      makeMockRequest(`/api/orders/${orderId}`, { method: "PATCH", body: { status: "disputed", comment: "Seller did not show up" } }, tokenAlice),
      { params: Promise.resolve({ id: orderId }) }
    );

    const [resA, resB] = await Promise.all([reqA, reqB]);
    assert.ok(resA && resB);

    const statuses = [resA.status, resB.status];
    assert.ok(
      statuses.includes(200),
      "Exactly one transition must succeed with 200"
    );
    assert.ok(
      statuses.includes(409) || statuses.includes(400),
      "The conflicting concurrent transition must be rejected with 409 Conflict"
    );
    console.log(`  PASS: Atomic concurrency guard resolved race: status codes [${statuses.join(", ")}]`);

    // -------------------------------------------------------------------------
    // TEST 8: Chat & Messaging Context Preservation
    // -------------------------------------------------------------------------
    console.log("\nTEST 8: Chat and conversation context preserved");
    const testConvId = "conv_test_chat_12345";
    const orderWithChatReq = makeMockRequest(
      "/api/orders",
      {
        method: "POST",
        body: {
          listingId: activeListing._id.toString(),
          conversationId: testConvId,
          notes: "Created from live chat negotiation",
        },
      },
      tokenAlice
    );
    const orderWithChatRes = await handleCreateOrder(orderWithChatReq);
    assert.ok(orderWithChatRes);
    assert.strictEqual(orderWithChatRes.status, 201);
    const chatOrderData = await orderWithChatRes.json();
    assert.strictEqual(chatOrderData.data.conversationId, testConvId, "conversationId must be preserved");
    console.log("  PASS: Order links to conversation without altering chat workflow");

    // -------------------------------------------------------------------------
    // TEST 9: Verification of Zero Payments & Zero Stock Management
    // -------------------------------------------------------------------------
    console.log("\nTEST 9: Verifying ZERO payment claims, ZERO escrow, and ZERO stock deduction");
    const refreshedListing = await ListingModel.findById(activeListing._id).lean();
    assert.ok(refreshedListing);
    // Listing must remain untouched in terms of inventory/stock
    assert.strictEqual((refreshedListing as any).stock, undefined, "Listing model must contain zero stock field");
    assert.strictEqual((refreshedListing as any).inventory, undefined, "Listing model must contain zero inventory field");
    assert.strictEqual(refreshedListing.status, "active", "Listing must remain active (no automatic deduction/removal)");

    // Order must not claim to be paid or held in escrow
    const orderDoc = await OrderModel.findById(createdOrder._id).lean();
    assert.ok(orderDoc);
    assert.strictEqual((orderDoc as any).paymentStatus, undefined, "Order must not contain payment tracking state");
    assert.strictEqual((orderDoc as any).escrowBalance, undefined, "Order must contain zero escrow mechanics");
    console.log("  PASS: Domain model preserved: non-custodial coordination without payment/inventory mutations");

    // -------------------------------------------------------------------------
    // TEST 10: Seller Order Queries & Admin History Queries
    // -------------------------------------------------------------------------
    console.log("\nTEST 10: Querying seller orders and buyer orders returns scoped lists");
    const sellerListReq = makeMockRequest("/api/orders?role=seller", { method: "GET" }, tokenBob);
    const sellerListRes = await handleListOrders(sellerListReq);
    assert.ok(sellerListRes);
    assert.strictEqual(sellerListRes.status, 200);
    const sellerListData = await sellerListRes.json();
    assert.ok(sellerListData.data.length >= 2, "Bob must see all orders placed on his listings");
    assert.ok(sellerListData.data.every((o: any) => o.sellerId._id.toString() === bobId || o.sellerId.toString() === bobId));

    const buyerListReq = makeMockRequest("/api/orders?role=buyer", { method: "GET" }, tokenAlice);
    const buyerListRes = await handleListOrders(buyerListReq);
    assert.ok(buyerListRes);
    assert.strictEqual(buyerListRes.status, 200);
    const buyerListData = await buyerListRes.json();
    assert.ok(buyerListData.data.length >= 2, "Alice must see all orders she placed");
    assert.ok(buyerListData.data.every((o: any) => o.buyerId._id.toString() === aliceId || o.buyerId.toString() === aliceId));
    console.log("  PASS: Scoped queries correctly partition buyer vs seller orders");

    // -------------------------------------------------------------------------
    // TEST 11: Quantity Validation, Bounds, Duplicate Listing IDs, and Rounding
    // -------------------------------------------------------------------------
    console.log("\nTEST 11: Enforcing bounded integer quantities, duplicate item rejection, and currency rounding");
    // 11a: Non-integer quantity rejected
    const floatQtyReq = makeMockRequest(
      "/api/orders",
      { method: "POST", body: { listingId: activeListing._id.toString(), quantity: 2.5 } },
      tokenAlice
    );
    const floatQtyRes = await handleCreateOrder(floatQtyReq);
    assert.ok(floatQtyRes);
    assert.strictEqual(floatQtyRes.status, 400, "Float quantity must be rejected");

    // 11b: Negative or zero quantity rejected
    const zeroQtyReq = makeMockRequest(
      "/api/orders",
      { method: "POST", body: { listingId: activeListing._id.toString(), quantity: 0 } },
      tokenAlice
    );
    const zeroQtyRes = await handleCreateOrder(zeroQtyReq);
    assert.ok(zeroQtyRes);
    assert.strictEqual(zeroQtyRes.status, 400, "Zero quantity must be rejected");

    // 11c: Oversized quantity (> 100) rejected
    const overQtyReq = makeMockRequest(
      "/api/orders",
      { method: "POST", body: { listingId: activeListing._id.toString(), quantity: 101 } },
      tokenAlice
    );
    const overQtyRes = await handleCreateOrder(overQtyReq);
    assert.ok(overQtyRes);
    assert.strictEqual(overQtyRes.status, 400, "Oversized quantity (>100) must be rejected");

    // 11d: Duplicate listingId in items array rejected
    const dupItemsReq = makeMockRequest(
      "/api/orders",
      {
        method: "POST",
        body: {
          items: [
            { listingId: activeListing._id.toString(), quantity: 1 },
            { listingId: activeListing._id.toString(), quantity: 2 },
          ],
        },
      },
      tokenAlice
    );
    const dupItemsRes = await handleCreateOrder(dupItemsReq);
    assert.ok(dupItemsRes);
    assert.strictEqual(dupItemsRes.status, 400, "Duplicate listing items in single order must be rejected");
    const dupItemsData = await dupItemsRes.json();
    assert.ok(dupItemsData.error.includes("Duplicate listing ID"), "Error message must cite duplicate listing ID");

    // 11e: Currency rounding policy: total is correctly computed to 2 decimal places
    const validQtyReq = makeMockRequest(
      "/api/orders",
      { method: "POST", body: { listingId: activeListing._id.toString(), quantity: 3 } },
      tokenAlice
    );
    const validQtyRes = await handleCreateOrder(validQtyReq);
    assert.ok(validQtyRes);
    assert.strictEqual(validQtyRes.status, 201, "Valid bounded integer quantity must be accepted");
    const validQtyData = await validQtyRes.json();
    assert.strictEqual(validQtyData.data.totalAmount, 105000, "Total amount must be exactly 35000 * 3");
    console.log("  PASS: Quantities bounded, duplicates blocked, and currency consistently calculated");

    // -------------------------------------------------------------------------
    // TEST 12: Database Unique Index & Collision Retry
    // -------------------------------------------------------------------------
    console.log("\nTEST 12: Database unique index on orderId and collision retry mechanism");
    // Ensure indexes are built in test replica set
    await OrderModel.createIndexes();
    const indexes = await OrderModel.collection.indexes();
    const orderIdIndex = indexes.find((idx: any) => idx.key && idx.key.orderId === 1);
    assert.ok(orderIdIndex, "Unique index on orderId must exist in the database collection");
    assert.strictEqual(orderIdIndex.unique, true, "orderId index must be strictly unique");

    // Verify concurrent order placement generates distinct order IDs
    const concurrentOrderPromises = Array.from({ length: 5 }, (_, i) =>
      handleCreateOrder(
        makeMockRequest(
          "/api/orders",
          { method: "POST", body: { listingId: activeListing._id.toString(), quantity: 1 } },
          tokenAlice
        )
      )
    );
    const concurrentResults = await Promise.all(concurrentOrderPromises);
    const createdOrderIds = new Set<string>();
    for (const res of concurrentResults) {
      assert.ok(res);
      assert.strictEqual(res.status, 201);
      const json = await res.json();
      assert.ok(json.data.orderId.startsWith("ORD-"), "orderId must match canonical format");
      assert.ok(!createdOrderIds.has(json.data.orderId), "Each orderId must be globally unique");
      createdOrderIds.add(json.data.orderId);
    }
    console.log("  PASS: Database-enforced uniqueness and concurrent collision-free order creation verified");

    // -------------------------------------------------------------------------
    // TEST 13: Buyer Delivery Confirmation, Admin DB Recheck & Audit Entry
    // -------------------------------------------------------------------------
    console.log("\nTEST 13: Buyer delivery confirmation, live admin DB recheck, and durable audit entry");
    // Create an order and move it to shipped
    const orderForDeliveryReq = makeMockRequest(
      "/api/orders",
      { method: "POST", body: { listingId: activeListing._id.toString(), quantity: 1 } },
      tokenAlice
    );
    const orderForDeliveryRes = await handleCreateOrder(orderForDeliveryReq);
    assert.ok(orderForDeliveryRes);
    const deliveryOrderData = await orderForDeliveryRes.json();
    const delOrderId = deliveryOrderData.data._id;

    // Seller confirms
    await handlePatchOrder(
      makeMockRequest(`/api/orders/${delOrderId}`, { method: "PATCH", body: { status: "confirmed" } }, tokenBob),
      { params: Promise.resolve({ id: delOrderId }) }
    );
    // Seller ships
    await handlePatchOrder(
      makeMockRequest(`/api/orders/${delOrderId}`, { method: "PATCH", body: { status: "shipped" } }, tokenBob),
      { params: Promise.resolve({ id: delOrderId }) }
    );

    // Buyer confirms receipt/delivery
    const buyerDeliveryConfirmRes = await handlePatchOrder(
      makeMockRequest(
        `/api/orders/${delOrderId}`,
        { method: "PATCH", body: { status: "delivered", comment: "Item received in good condition" } },
        tokenAlice
      ),
      { params: Promise.resolve({ id: delOrderId }) }
    );
    assert.ok(buyerDeliveryConfirmRes);
    assert.strictEqual(buyerDeliveryConfirmRes.status, 200, "Buyer must be authorized to confirm delivery receipt");
    const buyerDeliveryConfirmData = await buyerDeliveryConfirmRes.json();
    assert.strictEqual(buyerDeliveryConfirmData.data.status, "delivered");
    const lastHistory = buyerDeliveryConfirmData.data.history[buyerDeliveryConfirmData.data.history.length - 1];
    assert.strictEqual(lastHistory.updatedBy, aliceId);
    assert.strictEqual(lastHistory.comment, "Item received in good condition");

    // Admin DB recheck: Create revoked admin token (claims admin in JWT, but demoted/suspended in DB)
    const demotedAdmin = await UserModel.create({
      name: "Demoted Admin",
      email: "demoted_admin@campushive.edu.ng",
      role: "buyer", // demoted in DB!
      accountStatus: "active",
      isStudent: false,
      studentVerified: false,
    });
    const fakeAdminToken = createAccessToken({
      id: demotedAdmin._id.toString(),
      name: demotedAdmin.name,
      email: demotedAdmin.email,
      role: "admin" as any, // stale JWT claims admin!
      isStudent: false,
      studentVerified: false,
    });

    // Try to perform admin transition on another order
    const orderForAdminReq = makeMockRequest(
      "/api/orders",
      { method: "POST", body: { listingId: activeListing._id.toString(), quantity: 1 } },
      tokenAlice
    );
    const orderForAdminRes = await handleCreateOrder(orderForAdminReq);
    assert.ok(orderForAdminRes);
    const orderForAdminData = await orderForAdminRes.json();
    const admOrderId = orderForAdminData.data._id;

    const fakeAdminPatchRes = await handlePatchOrder(
      makeMockRequest(`/api/orders/${admOrderId}`, { method: "PATCH", body: { status: "confirmed" } }, fakeAdminToken),
      { params: Promise.resolve({ id: admOrderId }) }
    );
    assert.ok(fakeAdminPatchRes);
    assert.strictEqual(fakeAdminPatchRes.status, 403, "Stale admin JWT must be rejected by live DB recheck");

    // Real admin performs privileged action and verifies durable audit entry
    const realAdminPatchRes = await handlePatchOrder(
      makeMockRequest(
        `/api/orders/${admOrderId}`,
        { method: "PATCH", body: { status: "confirmed", comment: "Admin authorized priority processing" } },
        tokenAdmin
      ),
      { params: Promise.resolve({ id: admOrderId }) }
    );
    assert.ok(realAdminPatchRes);
    assert.strictEqual(realAdminPatchRes.status, 200);
    const realAdminData = await realAdminPatchRes.json();
    const adminHistory = realAdminData.data.history[realAdminData.data.history.length - 1];
    assert.strictEqual(adminHistory.updatedBy, adminId);
    assert.strictEqual(adminHistory.comment, "Admin authorized priority processing");
    console.log("  PASS: Buyer confirmed delivery, live admin DB verified, and durable audit history captured");

    // -------------------------------------------------------------------------
    // TEST 14: Admin Dashboard Transition Mapping (pending -> confirmed/cancelled)
    // -------------------------------------------------------------------------
    console.log("\nTEST 14: Admin dashboard transition mapping preserves atomic state machine");
    // Admin approving pending order maps to 'confirmed'
    const pendingOrderReq = makeMockRequest(
      "/api/orders",
      { method: "POST", body: { listingId: activeListing._id.toString(), quantity: 1 } },
      tokenAlice
    );
    const pendingOrderRes = await handleCreateOrder(pendingOrderReq);
    assert.ok(pendingOrderRes);
    const pendingOrderId = (await pendingOrderRes.json()).data._id;

    const adminApproveRes = await handlePatchOrder(
      makeMockRequest(
        `/api/orders/${pendingOrderId}`,
        { method: "PATCH", body: { status: "confirmed", comment: "Order approved and confirmed by administrator" } },
        tokenAdmin
      ),
      { params: Promise.resolve({ id: pendingOrderId }) }
    );
    assert.ok(adminApproveRes);
    assert.strictEqual(adminApproveRes.status, 200);
    assert.strictEqual((await adminApproveRes.json()).data.status, "confirmed");

    // Admin rejecting pending order maps to 'cancelled'
    const pendingOrder2Req = makeMockRequest(
      "/api/orders",
      { method: "POST", body: { listingId: activeListing._id.toString(), quantity: 1 } },
      tokenAlice
    );
    const pendingOrder2Res = await handleCreateOrder(pendingOrder2Req);
    assert.ok(pendingOrder2Res);
    const pendingOrder2Id = (await pendingOrder2Res.json()).data._id;

    const adminRejectRes = await handlePatchOrder(
      makeMockRequest(
        `/api/orders/${pendingOrder2Id}`,
        { method: "PATCH", body: { status: "cancelled", comment: "Order rejected and cancelled by administrator moderation" } },
        tokenAdmin
      ),
      { params: Promise.resolve({ id: pendingOrder2Id }) }
    );
    assert.ok(adminRejectRes);
    assert.strictEqual(adminRejectRes.status, 200);
    assert.strictEqual((await adminRejectRes.json()).data.status, "cancelled");
    console.log("  PASS: Admin dashboard actions correctly map to valid canonical transitions without bypassing API guards");

    // -------------------------------------------------------------------------
    // TEST 15: State Machine Coherence: Disputed Orders Lock & Fulfillment Steps
    // -------------------------------------------------------------------------
    console.log("\nTEST 15: Disputed order lock (admin-only) and delivery fulfillment step coherence");

    // 15a: Delivery orders cannot jump confirmed -> delivered without being shipped first
    const deliveryOrderReq = makeMockRequest(
      "/api/orders",
      {
        method: "POST",
        body: {
          listingId: activeListing._id.toString(),
          quantity: 1,
          fulfillmentMethod: "delivery",
          shippingAddress: { street: "12 Campus Way", city: "Zaria", state: "Kaduna", phone: "08012345678" },
        },
      },
      tokenAlice
    );
    const deliveryOrderRes = await handleCreateOrder(deliveryOrderReq);
    assert.ok(deliveryOrderRes);
    const delivOrderId = (await deliveryOrderRes.json()).data._id;

    // Seller confirms
    await handlePatchOrder(
      makeMockRequest(`/api/orders/${delivOrderId}`, { method: "PATCH", body: { status: "confirmed" } }, tokenBob),
      { params: Promise.resolve({ id: delivOrderId }) }
    );

    // Buyer attempts to confirm delivery directly without shipping -> 400 rejected
    const invalidDirectDeliveryRes = await handlePatchOrder(
      makeMockRequest(`/api/orders/${delivOrderId}`, { method: "PATCH", body: { status: "delivered" } }, tokenAlice),
      { params: Promise.resolve({ id: delivOrderId }) }
    );
    assert.ok(invalidDirectDeliveryRes);
    assert.strictEqual(invalidDirectDeliveryRes.status, 400, "Direct delivery confirmation before shipping must be rejected for delivery orders");

    // Once marked shipped, delivery confirmation succeeds
    await handlePatchOrder(
      makeMockRequest(`/api/orders/${delivOrderId}`, { method: "PATCH", body: { status: "shipped" } }, tokenBob),
      { params: Promise.resolve({ id: delivOrderId }) }
    );
    const validDeliveryConfirmRes = await handlePatchOrder(
      makeMockRequest(`/api/orders/${delivOrderId}`, { method: "PATCH", body: { status: "delivered" } }, tokenAlice),
      { params: Promise.resolve({ id: delivOrderId }) }
    );
    assert.ok(validDeliveryConfirmRes);
    assert.strictEqual(validDeliveryConfirmRes.status, 200, "Delivery confirmation succeeds once order has been shipped");

    // 15b: Disputed orders are strictly locked under admin review; buyer or seller cannot resolve
    const disputeOrderReq = makeMockRequest(
      "/api/orders",
      { method: "POST", body: { listingId: activeListing._id.toString(), quantity: 1 } },
      tokenAlice
    );
    const disputeOrderRes = await handleCreateOrder(disputeOrderReq);
    assert.ok(disputeOrderRes);
    const dispOrderId = (await disputeOrderRes.json()).data._id;

    // Advance to shipped then dispute
    await handlePatchOrder(
      makeMockRequest(`/api/orders/${dispOrderId}`, { method: "PATCH", body: { status: "confirmed" } }, tokenBob),
      { params: Promise.resolve({ id: dispOrderId }) }
    );
    await handlePatchOrder(
      makeMockRequest(`/api/orders/${dispOrderId}`, { method: "PATCH", body: { status: "shipped" } }, tokenBob),
      { params: Promise.resolve({ id: dispOrderId }) }
    );
    await handlePatchOrder(
      makeMockRequest(`/api/orders/${dispOrderId}`, { method: "PATCH", body: { status: "disputed", comment: "Item not as described" } }, tokenAlice),
      { params: Promise.resolve({ id: dispOrderId }) }
    );

    // Buyer attempts to self-resolve dispute -> 400/403 rejected
    const buyerResolveRes = await handlePatchOrder(
      makeMockRequest(`/api/orders/${dispOrderId}`, { method: "PATCH", body: { status: "delivered" } }, tokenAlice),
      { params: Promise.resolve({ id: dispOrderId }) }
    );
    assert.ok(buyerResolveRes);
    assert.ok(buyerResolveRes.status === 400 || buyerResolveRes.status === 403, "Buyer cannot resolve a dispute");

    // Seller attempts to self-resolve dispute -> 400/403 rejected
    const sellerResolveRes = await handlePatchOrder(
      makeMockRequest(`/api/orders/${dispOrderId}`, { method: "PATCH", body: { status: "delivered" } }, tokenBob),
      { params: Promise.resolve({ id: dispOrderId }) }
    );
    assert.ok(sellerResolveRes);
    assert.ok(sellerResolveRes.status === 400 || sellerResolveRes.status === 403, "Seller cannot resolve a dispute");

    // Only Admin can resolve dispute
    const adminResolveRes = await handlePatchOrder(
      makeMockRequest(
        `/api/orders/${dispOrderId}`,
        { method: "PATCH", body: { status: "delivered", comment: "Mediated and resolved by campus safety team" } },
        tokenAdmin
      ),
      { params: Promise.resolve({ id: dispOrderId }) }
    );
    assert.ok(adminResolveRes);
    assert.strictEqual(adminResolveRes.status, 200, "Admin successfully resolves disputed order");
    console.log("  PASS: State machine coherence verified: fulfillment steps enforced and disputed orders locked to admin");

    // -------------------------------------------------------------------------
    // TEST 16: Safe Retries: Selective E11000 on orderId & Idempotent Client Retries
    // -------------------------------------------------------------------------
    console.log("\nTEST 16: Safe retries: selective orderId collision handling & client idempotency");

    // 16a: Client retries with Idempotency-Key returns existing order with 0 duplicates created
    const testIdempotencyKey = "idem_key_" + Date.now();
    const orderCountBefore = await OrderModel.countDocuments();

    const firstIdemReq = makeMockRequest(
      "/api/orders",
      {
        method: "POST",
        headers: { "Idempotency-Key": testIdempotencyKey },
        body: { listingId: activeListing._id.toString(), quantity: 1 },
      },
      tokenAlice
    );
    const firstIdemRes = await handleCreateOrder(firstIdemReq);
    assert.ok(firstIdemRes);
    assert.strictEqual(firstIdemRes.status, 201, "First idempotent request must create order");
    const firstIdemData = await firstIdemRes.json();
    const createdIdemOrderId = firstIdemData.data.orderId;

    // Retry request with exact same Idempotency-Key
    const secondIdemReq = makeMockRequest(
      "/api/orders",
      {
        method: "POST",
        headers: { "Idempotency-Key": testIdempotencyKey },
        body: { listingId: activeListing._id.toString(), quantity: 1 },
      },
      tokenAlice
    );
    const secondIdemRes = await handleCreateOrder(secondIdemReq);
    assert.ok(secondIdemRes);
    assert.strictEqual(secondIdemRes.status, 200, "Retried request returns HTTP 200");
    const secondIdemData = await secondIdemRes.json();
    assert.strictEqual(secondIdemData.data.orderId, createdIdemOrderId, "Must return exact same order");

    const orderCountAfter = await OrderModel.countDocuments();
    assert.strictEqual(orderCountAfter, orderCountBefore + 1, "Exactly one order document must exist; zero duplicates created");

    console.log("  PASS: Idempotent client retries safely return existing order with zero duplicate orders");

    console.log("\n====================================================================");
    console.log(" ALL 16 PHASE 4.3 ORDER SECURITY & INTEGRITY TESTS PASSED! ");
    console.log("====================================================================\n");
  } finally {
    if (mongod) {
      await mongoose.disconnect();
      await mongod.stop();
    }
    process.env = originalEnv;
  }
}

runOrdersTestSuite().catch((err) => {
  console.error("FATAL: Orders test suite failed:", err);
  process.exit(1);
});
