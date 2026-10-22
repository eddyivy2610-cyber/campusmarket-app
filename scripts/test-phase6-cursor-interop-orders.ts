/**
 * scripts/test-phase6-cursor-interop-orders.ts
 *
 * Dedicated Automated Test Suite for:
 * 1. Cursor tests for messages and conversation list (forward & backward keyset cursor).
 * 2. Conversation interop (Next.js to Express and back) with participants/participantIds drift = 0.
 * 3. Order status: Two simultaneous transitions result in exactly one winner (200) and one conflict (409).
 */

import assert from "node:assert";
import mongoose from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import { NextRequest } from "next/server";
import { ConversationModel, MessageModel } from "../app/models/ChatModels";
import OrderModel from "../app/models/Order";
import UserModel from "../app/models/User";
import ListingModel from "../app/models/Listing";
import dbConnect from "../app/lib/dbConnect";
import { createAccessToken } from "../app/lib/authTokens";
import { GET as handleGetMessages } from "../app/api/messages/conversations/[id]/messages/route";
import { GET as handleGetConversations } from "../app/api/messages/conversations/route";
import { PATCH as handleOrderTransition } from "../app/api/orders/[id]/route";

function makeMockRequest(
  url: string,
  options: {
    method?: string;
    body?: any;
    token?: string;
    headers?: Record<string, string>;
  } = {}
): NextRequest {
  const headers = new Headers(options.headers || {});
  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }
  let bodyContent: string | undefined = undefined;
  if (options.body) {
    headers.set("Content-Type", "application/json");
    bodyContent = JSON.stringify(options.body);
  }
  const fullUrl = url.startsWith("http") ? url : `http://localhost:3000${url}`;
  return new NextRequest(fullUrl, {
    method: options.method || (options.body ? "POST" : "GET"),
    headers,
    body: bodyContent,
  });
}

async function runCursorInteropOrdersTestSuite() {
  console.log("====================================================================");
  console.log("   CAMPUS HIVE 2.0 — CURSORS, INTEROP DRIFT & ORDER CONCURRENCY     ");
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
    await ConversationModel.init();
    await MessageModel.init();
    await OrderModel.init();

    // 1. Seed Alice (Buyer) and Bob (Seller)
    const aliceUser = await UserModel.create({
      name: "Alice Buyer",
      email: "alice@campushive.edu.ng",
      role: "buyer",
      accountStatus: "active",
      studentVerified: true,
      isStudent: true,
      campus: "Main Campus",
    });

    const bobUser = await UserModel.create({
      name: "Bob Seller",
      email: "bob@campushive.edu.ng",
      role: "seller",
      accountStatus: "active",
      studentVerified: true,
      isStudent: true,
      campus: "Main Campus",
    });

    const aliceToken = createAccessToken({
      id: aliceUser._id.toString(),
      email: aliceUser.email,
      name: aliceUser.name,
      role: "buyer",
      accountStatus: "active",
      studentVerified: true,
      isStudent: true,
    } as any);

    const bobToken = createAccessToken({
      id: bobUser._id.toString(),
      email: bobUser.email,
      name: bobUser.name,
      role: "seller",
      accountStatus: "active",
      studentVerified: true,
      isStudent: true,
    } as any);

    const aliceId = aliceUser._id.toString();
    const bobId = bobUser._id.toString();

    // =================================================================
    // SECTION 1: Cursor Tests for Messages & Conversation List
    // =================================================================
    console.log("SECTION 1: Cursor Tests for Messages and Conversation List");
    {
      const conv = await ConversationModel.create({
        participantIds: [aliceId, bobId],
        context: null,
        unreadCounts: { [aliceId]: 0, [bobId]: 0 },
        createdAt: new Date("2026-10-22T10:00:00Z"),
        updatedAt: new Date("2026-10-22T10:00:00Z"),
      });
      const convId = conv._id.toString();

      // Seed 15 sequential messages spaced 1 second apart
      const messageIds: string[] = [];
      for (let i = 1; i <= 15; i++) {
        const msg: any = await MessageModel.create({
          id: `msg-seq-${i.toString().padStart(3, "0")}`,
          clientMessageId: `temp-${i}`,
          conversationId: convId,
          senderId: i % 2 === 1 ? aliceId : bobId,
          text: `Message ${i}`,
          deliveryStatus: "delivered",
          createdAt: new Date(Date.parse("2026-10-22T10:00:00Z") + i * 1000).toISOString(),
        });
        messageIds.push(msg.id || msg._id.toString());
      }

      // 1.1: Forward Cursor (sinceId / Reconnect recovery)
      const pivotMidId = messageIds[7]; // Message 8
      const sinceReq = makeMockRequest(
        `/api/messages/conversations/${convId}/messages?sinceId=${pivotMidId}&limit=5`,
        { token: aliceToken }
      );
      const sinceRes = await handleGetMessages(sinceReq, {
        params: Promise.resolve({ id: convId }),
      });
      assert.ok(sinceRes, "sinceRes is defined");
      assert.strictEqual(sinceRes.status, 200, "sinceId query returns 200 OK");
      const sinceData = await sinceRes.json();
      assert.strictEqual(sinceData.messages.length, 5, "Returns exactly limit=5 messages");
      assert.strictEqual(sinceData.messages[0].text, "Message 9", "Ordered chronologically: Message 9 first");
      assert.strictEqual(sinceData.messages[4].text, "Message 13", "Ordered chronologically: Message 13 last");

      // 1.2: Backward Cursor (beforeId / Chat history scroll-up)
      const pivotEndId = messageIds[14]; // Message 15
      const beforeReq = makeMockRequest(
        `/api/messages/conversations/${convId}/messages?before=${pivotEndId}&limit=5`,
        { token: aliceToken }
      );
      const beforeRes = await handleGetMessages(beforeReq, {
        params: Promise.resolve({ id: convId }),
      });
      assert.ok(beforeRes, "beforeRes is defined");
      assert.strictEqual(beforeRes.status, 200, "before cursor query returns 200 OK");
      const beforeData = await beforeRes.json();
      assert.strictEqual(beforeData.messages.length, 5, "Returns limit=5 older messages");
      assert.strictEqual(beforeData.hasMore, true, "Indicates older messages exist");
      assert.strictEqual(beforeData.messages[beforeData.messages.length - 1].text, "Message 14", "Message 14 immediately precedes Message 15");
      assert.strictEqual(beforeData.messages[0].text, "Message 10", "Message 10 is the oldest in this window");

      // Follow nextCursor to page 2 of older history
      const nextCursor = beforeData.nextCursor;
      assert.ok(nextCursor, "nextCursor is present for pagination");
      const page2Req = makeMockRequest(
        `/api/messages/conversations/${convId}/messages?before=${nextCursor}&limit=5`,
        { token: aliceToken }
      );
      const page2Res = await handleGetMessages(page2Req, {
        params: Promise.resolve({ id: convId }),
      });
      assert.ok(page2Res, "page2Res is defined");
      const page2Data = await page2Res.json();
      assert.strictEqual(page2Data.messages.length, 5);
      assert.strictEqual(page2Data.messages[page2Data.messages.length - 1].text, "Message 9");
      assert.strictEqual(page2Data.messages[0].text, "Message 5");

      // 1.3: Conversation List Cursor Pagination
      // Seed 6 distinct conversations for Alice with distinct updated timestamps
      for (let c = 1; c <= 6; c++) {
        await ConversationModel.create({
          conversationId: `conv-test-${c}`,
          participantIds: [aliceId, new mongoose.Types.ObjectId().toString()],
          lastMessage: { text: `Last msg ${c}`, senderId: aliceId, createdAt: new Date() },
          unreadCounts: { [aliceId]: 0 },
          updatedAt: new Date(Date.parse("2026-10-22T12:00:00Z") + c * 60000),
          createdAt: new Date(Date.parse("2026-10-22T12:00:00Z") + c * 60000),
        });
      }

      // Query page 1 (limit 3)
      const convListReq1 = makeMockRequest(
        `/api/messages/conversations?limit=3`,
        { token: aliceToken }
      );
      const convListRes1 = await handleGetConversations(convListReq1);
      assert.ok(convListRes1, "convListRes1 is defined");
      assert.strictEqual(convListRes1.status, 200);
      const convListData1 = await convListRes1.json();
      assert.strictEqual(convListData1.conversations.length, 3, "Page 1 returns 3 conversations");
      assert.strictEqual(convListData1.hasMore, true, "Page 1 hasMore = true");
      assert.ok(convListData1.nextCursor, "Page 1 returns nextCursor");

      // Query page 2 with nextCursor
      const convListReq2 = makeMockRequest(
        `/api/messages/conversations?cursor=${convListData1.nextCursor}&limit=3`,
        { token: aliceToken }
      );
      const convListRes2 = await handleGetConversations(convListReq2);
      assert.ok(convListRes2, "convListRes2 is defined");
      assert.strictEqual(convListRes2.status, 200);
      const convListData2 = await convListRes2.json();
      assert.strictEqual(convListData2.conversations.length, 3, "Page 2 returns next 3 conversations");
      // Confirm no duplicate items between page 1 and page 2
      const idsPage1 = new Set(convListData1.conversations.map((c: any) => c.id));
      const hasOverlap = convListData2.conversations.some((c: any) => idsPage1.has(c.id));
      assert.strictEqual(hasOverlap, false, "Zero overlap between cursor pages in conversation list");

      console.log("  PASS: Deterministic keyset cursor pagination verified for both messages and conversation lists");
    }

    // =================================================================
    // SECTION 2: Conversation Interop & participants/participantIds Drift = 0
    // =================================================================
    console.log("\nSECTION 2: Conversation Interop & participants/participantIds Drift = 0");
    {
      const userAId = new mongoose.Types.ObjectId();
      const userBId = new mongoose.Types.ObjectId();

      // Test 2.1: Write via Next.js format (participantIds as strings)
      const nextFormatDoc = await ConversationModel.create({
        participantIds: [userAId.toString(), userBId.toString()],
        unreadCounts: {},
      });

      // Verify zero drift
      assert.strictEqual(nextFormatDoc.participantIds.length, 2);
      assert.strictEqual(nextFormatDoc.participants.length, 2);
      assert.ok(nextFormatDoc.participants[0] instanceof mongoose.Types.ObjectId, "participants[0] normalized to ObjectId");
      assert.ok(nextFormatDoc.participants[1] instanceof mongoose.Types.ObjectId, "participants[1] normalized to ObjectId");

      const driftCount1 =
        nextFormatDoc.participantIds.length !== nextFormatDoc.participants.length ||
        !nextFormatDoc.participantIds.every((id: string) =>
          nextFormatDoc.participants.some((p: any) => p.toString() === id)
        )
          ? 1
          : 0;
      assert.strictEqual(driftCount1, 0, "Drift = 0 when initialized via Next.js participantIds");

      // Test 2.2: Write via Express format (participants as ObjectIds)
      const userCId = new mongoose.Types.ObjectId();
      const userDId = new mongoose.Types.ObjectId();

      const expressFormatDoc = await ConversationModel.create({
        participants: [userCId, userDId],
        unreadCounts: {},
      });

      assert.strictEqual(expressFormatDoc.participants.length, 2);
      assert.strictEqual(expressFormatDoc.participantIds.length, 2);
      assert.strictEqual(typeof expressFormatDoc.participantIds[0], "string");
      assert.strictEqual(typeof expressFormatDoc.participantIds[1], "string");

      const driftCount2 =
        expressFormatDoc.participantIds.length !== expressFormatDoc.participants.length ||
        !expressFormatDoc.participantIds.every((id: string) =>
          expressFormatDoc.participants.some((p: any) => p.toString() === id)
        )
          ? 1
          : 0;
      assert.strictEqual(driftCount2, 0, "Drift = 0 when initialized via Express participants");

      // Test 2.3: Cross-Service Query Interoperability
      // A. Express-style query matching Next.js doc:
      const expressFound = await ConversationModel.findOne({
        participants: { $all: [userAId, userBId] },
      });
      assert.ok(expressFound, "Express $all ObjectIds query finds document created by Next.js");

      // B. Next.js-style query matching Express doc:
      const nextFound = await ConversationModel.findOne({
        participantIds: userCId.toString(),
      });
      assert.ok(nextFound, "Next.js participantIds string query finds document created by Express");

      // Test 2.4: Atomic update synchronizes both fields with 0 drift
      const userEId = new mongoose.Types.ObjectId();
      await ConversationModel.findByIdAndUpdate(
        nextFormatDoc._id,
        {
          $set: {
            participantIds: [userAId.toString(), userBId.toString(), userEId.toString()],
          },
        },
        { returnDocument: "after", runValidators: true }
      );

      const updated = await ConversationModel.findById(nextFormatDoc._id);
      assert.strictEqual(updated?.participantIds.length, 3);
      assert.strictEqual(updated?.participants.length, 3);
      const driftAfterUpdate =
        updated?.participantIds.length !== updated?.participants.length ||
        !updated?.participantIds.every((id: string) =>
          updated?.participants.some((p: any) => p.toString() === id)
        )
          ? 1
          : 0;
      assert.strictEqual(driftAfterUpdate, 0, "Drift = 0 after update");

      console.log("  PASS: Conversation interop validated in both directions; participants/participantIds drift = 0");
    }

    // =================================================================
    // SECTION 3: Order Status Concurrency (Two Simultaneous Transitions -> 1 Winner, 1 Loser 409)
    // =================================================================
    console.log("\nSECTION 3: Order Status Concurrency (Two Simultaneous Transitions -> 1 Winner, 1 Loser 409)");
    {
      const listing = await ListingModel.create({
        title: "Mechanical Keyboard",
        price: 25000,
        priceFormatted: "₦25,000",
        description: "RGB mechanical keyboard",
        category: "electronics",
        campus: "Main Campus",
        location: "Block B",
        sellerId: bobId,
        views: 0,
        likes: 0,
        status: "active",
      });

      const order = await OrderModel.create({
        orderId: "ORD-CONCUR-001",
        buyerId: aliceUser._id,
        sellerId: bobUser._id,
        items: [
          {
            listingId: listing._id,
            title: listing.title,
            price: 25000,
            quantity: 1,
          },
        ],
        totalAmount: 25000,
        status: "pending", // Initial state
        paymentMethod: "cash",
        fulfillmentMethod: "pickup",
        history: [{ status: "pending", updatedBy: aliceId, updatedAt: new Date(), comment: "Order initialized" }],
      });

      const orderIdStr = order._id.toString();

      // Launch TWO simultaneous conflicting transitions:
      // Request A (Bob - Seller): confirms order -> transitions from "pending" to "confirmed"
      // Request B (Alice - Buyer): cancels order -> transitions from "pending" to "cancelled"
      const reqSellerAccept = makeMockRequest(`/api/orders/${orderIdStr}`, {
        method: "PATCH",
        token: bobToken,
        body: { status: "confirmed", comment: "Seller confirmed order" },
      });

      const reqBuyerCancel = makeMockRequest(`/api/orders/${orderIdStr}`, {
        method: "PATCH",
        token: aliceToken,
        body: { status: "cancelled", comment: "Buyer decided to cancel" },
      });

      // Fire both requests simultaneously
      const [res1, res2] = await Promise.all([
        handleOrderTransition(reqSellerAccept, { params: Promise.resolve({ id: orderIdStr }) }),
        handleOrderTransition(reqBuyerCancel, { params: Promise.resolve({ id: orderIdStr }) }),
      ]);

      assert.ok(res1, "Response 1 is defined");
      assert.ok(res2, "Response 2 is defined");

      const statuses = [res1.status, res2.status];
      const count200 = statuses.filter((s) => s === 200).length;
      const countConflict = statuses.filter((s) => s === 409 || s === 400).length;

      assert.strictEqual(count200, 1, "Exactly one concurrent transition succeeds (200 OK)");
      assert.strictEqual(countConflict, 1, "Conflicting concurrent transition strictly fails (409 or 400)");

      // Verify the loser received conflict error
      const loserRes = res1.status === 200 ? res2 : res1;
      const loserData = await loserRes.json();
      assert.strictEqual(loserRes.status, 409, "Loser response strictly returns HTTP 409 Conflict");
      assert.ok(
        loserData.error?.includes("concurrently") ||
        loserData.error?.includes("Conflict") ||
        loserData.code === "ORDER_STATE_CONFLICT",
        "Loser response clearly indicates concurrency state conflict"
      );

      // Verify database integrity: only one transition recorded in history
      const finalOrder = await OrderModel.findById(order._id);
      assert.strictEqual(finalOrder?.history.length, 2, "History contains exactly [pending, winningStatus]");
      assert.ok(["confirmed", "cancelled"].includes(finalOrder?.status || ""), "Final status matches winning transition");

      console.log(`  PASS: Concurrency test passed: exactly 1 winner (${finalOrder?.status}), loser rejected with conflict; zero duplicate history`);
    }

    console.log("\n====================================================================");
    console.log("   ALL CURSOR, INTEROP DRIFT, AND ORDER CONCURRENCY TESTS PASSED!   ");
    console.log("====================================================================\n");
  } finally {
    process.env = originalEnv;
    if (mongod) {
      await mongoose.disconnect();
      await mongod.stop();
    }
  }
}

runCursorInteropOrdersTestSuite()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Test suite failed:", err);
    process.exit(1);
  });
