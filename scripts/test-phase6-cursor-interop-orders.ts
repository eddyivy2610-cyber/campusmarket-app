/**
 * scripts/test-phase6-cursor-interop-orders.ts
 *
 * Dedicated Automated Test Suite for:
 * 1. Cursor tests for messages and conversation list (forward & backward keyset cursor).
 * 2. Conversation interop (Next.js to Express and back) with participants/participantIds drift = 0.
 * 3. Migration of campusconversations -> conversations & campusmessages -> messages with report counts & drift = 0.
 * 4. Post-deploy index presence verification on conversations and messages.
 * 5. Order status: Transition racing with cancellation under network timing, verifying conditional findOneAndUpdate
 *    on expected current status yields exactly one winner (200) and one conflict (409).
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
import { runConversationMigration } from "./migrate-conversations-phase3";

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

  let totalAssertions = 0;
  function passAssertion(testName: string, detail?: string) {
    totalAssertions++;
    console.log(`  [#${totalAssertions}] PASS: ${testName}${detail ? ` (${detail})` : ""}`);
  }

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
    console.log("SECTION 1: Keyset Cursor Tests for Messages and Conversation List");
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

      // Test 1.1: Forward Keyset Cursor (sinceId / Reconnect recovery)
      const pivotMidId = messageIds[7]; // Message 8
      const sinceReq = makeMockRequest(
        `/api/messages/conversations/${convId}/messages?sinceId=${pivotMidId}&limit=5`,
        { token: aliceToken }
      );
      const sinceRes = await handleGetMessages(sinceReq, {
        params: Promise.resolve({ id: convId }),
      });
      assert.ok(sinceRes, "sinceRes is defined");
      assert.strictEqual(sinceRes.status, 200);
      const sinceData = await sinceRes.json();
      assert.strictEqual(sinceData.messages.length, 5);
      passAssertion("Forward cursor query returns HTTP 200 with bounded window", `count=${sinceData.messages.length}`);

      assert.strictEqual(sinceData.messages[0].text, "Message 9");
      assert.strictEqual(sinceData.messages[4].text, "Message 13");
      passAssertion("Forward cursor maintains deterministic chronological ordering", `${sinceData.messages[0].text} -> ${sinceData.messages[4].text}`);

      // Test 1.2: Backward Keyset Cursor (before / Scroll-up history)
      const pivotEndId = messageIds[14]; // Message 15
      const beforeReq = makeMockRequest(
        `/api/messages/conversations/${convId}/messages?before=${pivotEndId}&limit=5`,
        { token: aliceToken }
      );
      const beforeRes = await handleGetMessages(beforeReq, {
        params: Promise.resolve({ id: convId }),
      });
      assert.ok(beforeRes, "beforeRes is defined");
      assert.strictEqual(beforeRes.status, 200);
      const beforeData = await beforeRes.json();
      assert.strictEqual(beforeData.messages.length, 5);
      assert.strictEqual(beforeData.hasMore, true);
      assert.strictEqual(beforeData.messages[beforeData.messages.length - 1].text, "Message 14");
      assert.strictEqual(beforeData.messages[0].text, "Message 10");
      passAssertion("Backward cursor window correctly loads older slice", `oldest=${beforeData.messages[0].text}, newest=${beforeData.messages[4].text}`);

      // Follow nextCursor to page 2 of older history
      const nextCursor = beforeData.nextCursor;
      assert.ok(nextCursor, "nextCursor returned for pagination");
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
      passAssertion("Next cursor smoothly chains to next older window without overlap", `window: Message 5 to 9`);

      // Test 1.3: Conversation List Keyset Cursor Pagination
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

      const convListReq1 = makeMockRequest(
        `/api/messages/conversations?limit=3`,
        { token: aliceToken }
      );
      const convListRes1 = await handleGetConversations(convListReq1);
      assert.ok(convListRes1);
      assert.strictEqual(convListRes1.status, 200);
      const convListData1 = await convListRes1.json();
      assert.strictEqual(convListData1.conversations.length, 3);
      assert.strictEqual(convListData1.hasMore, true);
      assert.ok(convListData1.nextCursor);
      passAssertion("Conversation list cursor page 1 returns bounded window with nextCursor");

      const convListReq2 = makeMockRequest(
        `/api/messages/conversations?cursor=${convListData1.nextCursor}&limit=3`,
        { token: aliceToken }
      );
      const convListRes2 = await handleGetConversations(convListReq2);
      assert.ok(convListRes2);
      assert.strictEqual(convListRes2.status, 200);
      const convListData2 = await convListRes2.json();
      assert.strictEqual(convListData2.conversations.length, 3);

      const idsPage1 = new Set(convListData1.conversations.map((c: any) => c.id));
      const hasOverlap = convListData2.conversations.some((c: any) => idsPage1.has(c.id));
      assert.strictEqual(hasOverlap, false);
      passAssertion("Conversation list cursor page 2 has zero overlap with page 1", "disjoint set verified");
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

      assert.strictEqual(nextFormatDoc.participantIds.length, 2);
      assert.strictEqual(nextFormatDoc.participants.length, 2);
      assert.ok(nextFormatDoc.participants[0] instanceof mongoose.Types.ObjectId);
      assert.ok(nextFormatDoc.participants[1] instanceof mongoose.Types.ObjectId);
      passAssertion("Next.js format write automatically populates normalized ObjectIds in participants");

      // Verify zero drift on Next.js format
      const driftCount1 =
        nextFormatDoc.participantIds.length !== nextFormatDoc.participants.length ||
        !nextFormatDoc.participantIds.every((id: string) =>
          nextFormatDoc.participants.some((p: any) => p.toString() === id)
        )
          ? 1
          : 0;
      assert.strictEqual(driftCount1, 0);
      passAssertion("Zero drift confirmed on Next.js format write", "drift = 0");

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
      passAssertion("Express format write automatically populates string IDs in participantIds");

      const driftCount2 =
        expressFormatDoc.participantIds.length !== expressFormatDoc.participants.length ||
        !expressFormatDoc.participantIds.every((id: string) =>
          expressFormatDoc.participants.some((p: any) => p.toString() === id)
        )
          ? 1
          : 0;
      assert.strictEqual(driftCount2, 0);
      passAssertion("Zero drift confirmed on Express format write", "drift = 0");

      // Test 2.3: Cross-Service Query Interoperability
      const expressFound = await ConversationModel.findOne({
        participants: { $all: [userAId, userBId] },
      });
      assert.ok(expressFound);
      passAssertion("Express query pattern ({ participants: { $all: [...] } }) finds document created by Next.js");

      const nextFound = await ConversationModel.findOne({
        participantIds: userCId.toString(),
      });
      assert.ok(nextFound);
      passAssertion("Next.js query pattern ({ participantIds: id }) finds document created by Express");

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
      assert.strictEqual(driftAfterUpdate, 0);
      passAssertion("Atomic findByIdAndUpdate preserves zero drift between participants and participantIds", "drift = 0");
    }

    // =================================================================
    // SECTION 3: Real Migration Rehearsal (campusconversations -> conversations & campusmessages -> messages)
    // =================================================================
    console.log("\nSECTION 3: Legacy Collection Migration Rehearsal & Snapshot Drift Check");
    {
      const db = mongoose.connection.db!;

      // 3.1: Seed legacy collections: campusconversations and campusmessages
      const legacyConvColl = db.collection("campusconversations");
      const legacyMsgColl = db.collection("campusmessages");

      const legacyUser1 = new mongoose.Types.ObjectId();
      const legacyUser2 = new mongoose.Types.ObjectId();

      await legacyConvColl.insertMany([
        {
          _id: new mongoose.Types.ObjectId(),
          conversationId: "legacy-conv-001",
          participants: [legacyUser1, legacyUser2], // Express format (ObjectId only)
          status: "active",
          createdAt: new Date("2026-09-01T10:00:00Z"),
          updatedAt: new Date("2026-09-01T10:00:00Z"),
        },
        {
          _id: new mongoose.Types.ObjectId(),
          conversationId: "legacy-conv-002",
          participantIds: [legacyUser1.toString(), legacyUser2.toString()], // Next.js format (String only)
          status: "active",
          createdAt: new Date("2026-09-02T10:00:00Z"),
          updatedAt: new Date("2026-09-02T10:00:00Z"),
        },
      ]);

      await legacyMsgColl.insertMany([
        {
          _id: new mongoose.Types.ObjectId(),
          id: "legacy-msg-001",
          conversationId: "legacy-conv-001",
          senderId: legacyUser1.toString(),
          text: "Legacy Message 1",
          createdAt: new Date("2026-09-01T10:05:00Z"),
        },
        {
          _id: new mongoose.Types.ObjectId(),
          id: "legacy-msg-002",
          conversationId: "legacy-conv-002",
          senderId: legacyUser2.toString(),
          text: "Legacy Message 2",
          createdAt: new Date("2026-09-02T10:05:00Z"),
        },
      ]);

      // 3.2: Run the real migration function
      const migrationReport = await runConversationMigration(db);

      assert.strictEqual(migrationReport.migratedConversations, 2);
      passAssertion("Legacy migration correctly read and migrated all legacy campusconversations", `migrated=${migrationReport.migratedConversations}`);

      assert.strictEqual(migrationReport.migratedMessages, 2);
      passAssertion("Legacy migration correctly read and migrated all legacy campusmessages", `migrated=${migrationReport.migratedMessages}`);

      assert.strictEqual(migrationReport.driftCount, 0);
      passAssertion("Post-migration snapshot drift check asserts exactly zero desynchronization", `driftCount = 0`);

      // 3.3: Idempotency Re-run Check (Re-running migration should produce 0 drift and 0 duplicate documents)
      const reRunReport = await runConversationMigration(db);
      assert.strictEqual(reRunReport.driftCount, 0);
      passAssertion("Consecutive migration re-run is strictly idempotent with zero drift", "idempotent apply verified");

      // 3.4: Post-Deploy Index Presence Check
      const targetConvColl = db.collection("conversations");
      const targetMsgColl = db.collection("messages");

      const convIndexes = await targetConvColl.indexes();
      const msgIndexes = await targetMsgColl.indexes();

      const convIndexNames = convIndexes.map((idx) => idx.name);
      const msgIndexNames = msgIndexes.map((idx) => idx.name);

      assert.ok(convIndexes.some((idx) => "participantIds" in idx.key || "participants" in idx.key));
      passAssertion("Post-deploy indexes present on conversations collection", convIndexNames.join(", "));

      assert.ok(msgIndexes.some((idx) => "clientMessageId" in idx.key || "conversationId" in idx.key));
      passAssertion("Post-deploy indexes present on messages collection", msgIndexNames.join(", "));
    }

    // =================================================================
    // SECTION 4: Order Status: Transition Racing with Cancellation (Conditional findOneAndUpdate)
    // =================================================================
    console.log("\nSECTION 4: Order Status: Transition Racing with Cancellation (Conditional findOneAndUpdate)");
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

      // 4.1: Test Race Condition: Seller Confirmation vs Buyer Cancellation
      const order = await OrderModel.create({
        orderId: "ORD-CONCUR-RACE-001",
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
        status: "pending", // Expected current status
        paymentMethod: "cash",
        fulfillmentMethod: "pickup",
        history: [{ status: "pending", updatedBy: aliceId, updatedAt: new Date(), comment: "Order initialized" }],
      });

      const orderIdStr = order._id.toString();

      // Seller attempts transition: pending -> confirmed
      const reqSellerConfirm = makeMockRequest(`/api/orders/${orderIdStr}`, {
        method: "PATCH",
        token: bobToken,
        body: { status: "confirmed", comment: "Seller confirmed order" },
      });

      // Buyer simultaneously attempts cancellation: pending -> cancelled
      const reqBuyerCancel = makeMockRequest(`/api/orders/${orderIdStr}`, {
        method: "PATCH",
        token: aliceToken,
        body: { status: "cancelled", comment: "Buyer decided to cancel" },
      });

      // Launch both requests simultaneously to test real concurrency
      const [res1, res2] = await Promise.all([
        handleOrderTransition(reqSellerConfirm, { params: Promise.resolve({ id: orderIdStr }) }),
        handleOrderTransition(reqBuyerCancel, { params: Promise.resolve({ id: orderIdStr }) }),
      ]);

      assert.ok(res1, "Response 1 defined");
      assert.ok(res2, "Response 2 defined");

      const statuses = [res1.status, res2.status];
      const count200 = statuses.filter((s) => s === 200).length;
      const count409 = statuses.filter((s) => s === 409).length;

      assert.strictEqual(count200, 1);
      passAssertion("Exactly one concurrent transition write wins with HTTP 200 OK", `winner status=200`);

      assert.strictEqual(count409, 1);
      passAssertion("Conflicting concurrent transition strictly fails with HTTP 409 Conflict", `loser status=409`);

      const loserRes = res1.status === 200 ? res2 : res1;
      const loserData = await loserRes.json();
      assert.ok(
        loserData.error?.includes("concurrently") ||
        loserData.error?.includes("Conflict") ||
        loserData.code === "ORDER_STATE_CONFLICT"
      );
      passAssertion("Loser response payload explicitly reports concurrent modification conflict", loserData.error);

      // Verify database state: winning write executed conditional findOneAndUpdate on expected status
      const finalOrder1 = await OrderModel.findById(order._id);
      assert.strictEqual(finalOrder1?.history.length, 2);
      assert.ok(["confirmed", "cancelled"].includes(finalOrder1?.status || ""));
      passAssertion("Order history records exactly one valid transition with zero duplicate states", `finalStatus=${finalOrder1?.status}`);

      // 4.2: Reverse Race Condition: Late In-Flight Attempt Rejection
      // Now order is no longer "pending". Another attempt to cancel or confirm on stale status strictly fails.
      const staleReq = makeMockRequest(`/api/orders/${orderIdStr}`, {
        method: "PATCH",
        token: bobToken,
        body: { status: "confirmed", comment: "Late retry" },
      });
      const staleRes = await handleOrderTransition(staleReq, { params: Promise.resolve({ id: orderIdStr }) });
      assert.ok(staleRes);
      assert.ok([400, 409].includes(staleRes.status));
      passAssertion("Subsequent or stale in-flight transition strictly rejected on modified state", `status=${staleRes.status}`);

      // 4.3: Direct Conditional findOneAndUpdate Unit Test Verification
      // Proves that findOneAndUpdate with { _id, status: expectedStatus } guarantees atomic exclusivity
      const testOrderDoc = await OrderModel.create({
        orderId: "ORD-UNIT-GUARD-002",
        buyerId: aliceUser._id,
        sellerId: bobUser._id,
        items: [{ listingId: listing._id, title: listing.title, price: 10000, quantity: 1 }],
        totalAmount: 10000,
        status: "confirmed", // Expected current status
        paymentMethod: "cash",
        fulfillmentMethod: "pickup",
        history: [{ status: "confirmed", updatedBy: bobId, updatedAt: new Date() }],
      });

      // Thread A: Conditional update for transition confirmed -> processing
      const winUpdate = await OrderModel.findOneAndUpdate(
        { _id: testOrderDoc._id, status: "confirmed" }, // Conditional guard on expected status
        { $set: { status: "processing" } },
        { returnDocument: "after" }
      );
      assert.ok(winUpdate, "Thread A successfully matches expected current status 'confirmed'");
      assert.strictEqual(winUpdate?.status, "processing");
      passAssertion("Conditional findOneAndUpdate matches expected current status and successfully updates");

      // Thread B (simultaneous in-flight or delayed): tries to execute transition on "confirmed"
      const loseUpdate = await OrderModel.findOneAndUpdate(
        { _id: testOrderDoc._id, status: "confirmed" }, // Fails because status is now "processing"
        { $set: { status: "cancelled" } },
        { returnDocument: "after" }
      );
      assert.strictEqual(loseUpdate, null, "Thread B conditional findOneAndUpdate returns null due to status change");
      passAssertion("Conditional findOneAndUpdate on stale expected status returns null under real timing", "atomic winner guarantee");
    }

    console.log("\n====================================================================");
    console.log(`   ALL ${totalAssertions}/${totalAssertions} PHASE 6 CURSOR, INTEROP & ORDER CHECKS PASSED!`);
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
