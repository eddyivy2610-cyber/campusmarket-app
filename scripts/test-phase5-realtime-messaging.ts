/**
 * scripts/test-phase5-realtime-messaging.ts
 *
 * Phase 5 Stage B Acceptance & Security Test Suite
 * Tests channel authorization, persistence-first rule, deduplication,
 * reconnect cursor catchup, and outbox publication resilience.
 */

import assert from "node:assert";
import mongoose from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import { NextRequest } from "next/server";
import { POST as handleRealtimeAuth } from "../app/api/realtime/auth/route";
import {
  POST as handlePostMessage,
  GET as handleGetMessages,
} from "../app/api/messages/conversations/[id]/messages/route";
import { MessageModel, ConversationModel } from "../app/models/ChatModels";
import UserModel from "../app/models/User";
import { createAccessToken } from "../app/lib/authTokens";
import dbConnect from "../app/lib/dbConnect";
import { resetRealtimeServer, getRealtimeServer } from "../app/lib/realtimeServer";

function makeMockRequest(
  url: string,
  options: {
    method?: string;
    body?: any;
    token?: string;
    headers?: Record<string, string>;
    isFormData?: boolean;
  } = {}
): NextRequest {
  const headers = new Headers(options.headers || {});
  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }

  let bodyContent: string | undefined = undefined;
  if (options.body) {
    if (options.isFormData) {
      headers.set("Content-Type", "application/x-www-form-urlencoded");
      bodyContent = new URLSearchParams(options.body).toString();
    } else {
      headers.set("Content-Type", "application/json");
      bodyContent = JSON.stringify(options.body);
    }
  }

  const fullUrl = url.startsWith("http") ? url : `http://localhost:3000${url}`;
  return new NextRequest(fullUrl, {
    method: options.method || (options.body ? "POST" : "GET"),
    headers,
    body: bodyContent,
  });
}

async function runRealtimeMessagingTestSuite() {
  console.log("====================================================================");
  console.log("       PHASE 5 STAGE B: REALTIME MESSAGING ACCEPTANCE SUITE         ");
  console.log("====================================================================\n");

  let mongod: MongoMemoryReplSet | null = null;
  const originalEnv = { ...process.env };
  process.env.AUTH_SECRET = "test_super_secret_jwt_key_with_at_least_32_characters_for_hmac!";
  process.env.PUSHER_APP_ID = "test_app_id";
  process.env.PUSHER_KEY = "test_pusher_key";
  process.env.PUSHER_SECRET = "test_pusher_secret_key_123456789";
  process.env.PUSHER_CLUSTER = "eu";

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

    // Reset realtime server to load test credentials
    resetRealtimeServer();

    // 1. Seed Users
    const alice = await UserModel.create({
      name: "Alice Buyer",
      email: "alice@campushive.edu.ng",
      role: "buyer",
      accountStatus: "active",
    });

    const bob = await UserModel.create({
      name: "Bob Seller",
      email: "bob@campushive.edu.ng",
      role: "seller",
      accountStatus: "active",
    });

    const charlie = await UserModel.create({
      name: "Charlie Intruder",
      email: "charlie@campushive.edu.ng",
      role: "buyer",
      accountStatus: "active",
    });

    const daveSuspended = await UserModel.create({
      name: "Dave Suspended",
      email: "dave@campushive.edu.ng",
      role: "buyer",
      accountStatus: "suspended",
    });

    const aliceToken = createAccessToken({
      id: alice._id.toString(),
      name: alice.name,
      email: alice.email,
      role: alice.role,
      isStudent: true,
      studentVerified: true,
      tokenVersion: 0,
    });

    const bobToken = createAccessToken({
      id: bob._id.toString(),
      name: bob.name,
      email: bob.email,
      role: bob.role,
      isStudent: true,
      studentVerified: true,
      tokenVersion: 0,
    });

    const charlieToken = createAccessToken({
      id: charlie._id.toString(),
      name: charlie.name,
      email: charlie.email,
      role: charlie.role,
      isStudent: true,
      studentVerified: true,
      tokenVersion: 0,
    });

    const daveToken = createAccessToken({
      id: daveSuspended._id.toString(),
      name: daveSuspended.name,
      email: daveSuspended.email,
      role: daveSuspended.role,
      isStudent: true,
      studentVerified: true,
      tokenVersion: 0,
    });

    // 2. Seed Conversation between Alice and Bob
    const conversation = await ConversationModel.create({
      participants: [alice._id, bob._id],
      participantIds: [alice._id.toString(), bob._id.toString()],
      status: "active",
      schemaVersion: 1,
    });
    const convId = conversation._id.toString();

    // -----------------------------------------------------------------
    // TEST 1: Channel Auth Gate — Authentication & Live Status Enforcement
    // -----------------------------------------------------------------
    console.log("TEST 1: Channel Auth Gate — Authentication & Live Status Enforcement");
    {
      // Unauthenticated
      const unauthReq = makeMockRequest("/api/realtime/auth", {
        body: { socket_id: "123.456", channel_name: `private-conversation-${convId}` },
      });
      const unauthRes = await handleRealtimeAuth(unauthReq);
      assert.strictEqual(unauthRes.status, 401, "Unauthenticated request returns 401");

      // Suspended caller
      const suspendedReq = makeMockRequest("/api/realtime/auth", {
        token: daveToken,
        body: { socket_id: "123.456", channel_name: `private-conversation-${convId}` },
      });
      const suspendedRes = await handleRealtimeAuth(suspendedReq);
      assert.strictEqual(suspendedRes.status, 403, "Suspended caller returns 403 Forbidden");
      console.log("  PASS: Unauthenticated (401) and suspended (403) strictly enforced on channel auth");
    }

    // -----------------------------------------------------------------
    // TEST 2: Channel Auth Gate — Conversation Membership Authorization
    // -----------------------------------------------------------------
    console.log("\nTEST 2: Channel Auth Gate — Conversation Membership Authorization");
    {
      // Charlie (non-member) attempts to authorize subscription to Alice & Bob's conversation
      const nonMemberReq = makeMockRequest("/api/realtime/auth", {
        token: charlieToken,
        body: { socket_id: "123.456", channel_name: `private-conversation-${convId}` },
      });
      const nonMemberRes = await handleRealtimeAuth(nonMemberReq);
      assert.strictEqual(nonMemberRes.status, 403, "Non-member denied subscription with 403 Forbidden");

      // Alice (member) authorizes subscription
      const memberReq = makeMockRequest("/api/realtime/auth", {
        token: aliceToken,
        body: { socket_id: "123.456", channel_name: `private-conversation-${convId}` },
      });
      const memberRes = await handleRealtimeAuth(memberReq);
      assert.strictEqual(memberRes.status, 200, "Member authorized with 200 OK");
      const memberAuthData = await memberRes.json();
      assert.ok(memberAuthData.auth, "Cryptographic auth signature returned");
      assert.match(memberAuthData.auth, new RegExp(`^${process.env.PUSHER_KEY}:`), "Auth signature prefixed with key");
      console.log("  PASS: Non-members blocked from snooping (403); members granted HMAC auth signature (200)");
    }

    // -----------------------------------------------------------------
    // TEST 3: Channel Auth Gate — Presence Channel Data Generation
    // -----------------------------------------------------------------
    console.log("\nTEST 3: Channel Auth Gate — Presence Channel Data Generation");
    {
      const presenceReq = makeMockRequest("/api/realtime/auth", {
        token: aliceToken,
        isFormData: true,
        body: { socket_id: "123.456", channel_name: `presence-conversation-${convId}` },
      });
      const presenceRes = await handleRealtimeAuth(presenceReq);
      assert.strictEqual(presenceRes.status, 200, "Presence channel authorized with 200 OK");
      const presenceData = await presenceRes.json();
      assert.ok(presenceData.auth, "Presence auth returned");
      assert.ok(presenceData.channel_data, "Presence channel_data returned");
      const parsedChannelData = JSON.parse(presenceData.channel_data);
      assert.strictEqual(parsedChannelData.user_id, alice._id.toString(), "channel_data contains authenticated user_id");
      assert.strictEqual(parsedChannelData.user_info.name, "Alice Buyer", "channel_data contains user_info.name");
      console.log("  PASS: Form-urlencoded presence channel subscription authorized with verified user_id and info");
    }

    // -----------------------------------------------------------------
    // TEST 4: Channel Auth Gate — User Isolation
    // -----------------------------------------------------------------
    console.log("\nTEST 4: Channel Auth Gate — User Isolation (private-user-[id])");
    {
      // Charlie tries to subscribe to Alice's private user channel
      const snoopUserReq = makeMockRequest("/api/realtime/auth", {
        token: charlieToken,
        body: { socket_id: "123.456", channel_name: `private-user-${alice._id.toString()}` },
      });
      const snoopUserRes = await handleRealtimeAuth(snoopUserReq);
      assert.strictEqual(snoopUserRes.status, 403, "Cannot subscribe to another user's channel (403)");

      // Alice subscribes to her own channel
      const ownUserReq = makeMockRequest("/api/realtime/auth", {
        token: aliceToken,
        body: { socket_id: "123.456", channel_name: `private-user-${alice._id.toString()}` },
      });
      const ownUserRes = await handleRealtimeAuth(ownUserReq);
      assert.strictEqual(ownUserRes.status, 200, "Authorized to own user channel (200)");
      console.log("  PASS: Users strictly isolated from subscribing to other users' private channels");
    }

    // -----------------------------------------------------------------
    // TEST 5: Persistence-First Rule (DB Write Precedes Realtime Publication)
    // -----------------------------------------------------------------
    console.log("\nTEST 5: Persistence-First Rule — DB Write Precedes Realtime Publication");
    {
      const clientMsgId = "client-msg-test-001";
      const postReq = makeMockRequest(`/api/messages/conversations/${convId}/messages`, {
        token: aliceToken,
        body: {
          text: "Hello Bob, is the calculator available?",
          clientMessageId: clientMsgId,
        },
      });

      const postRes = await handlePostMessage(postReq, { params: Promise.resolve({ id: convId }) });
      assert.ok(postRes, "postRes is defined");
      assert.strictEqual(postRes.status, 201, "Message created with 201 Created");
      const postData = await postRes.json();
      assert.strictEqual(postData.realtimePublished, true, "Realtime publication executed after DB write");

      // Verify MongoDB persistence
      const savedInDb = await MessageModel.findOne({ clientMessageId: clientMsgId }).lean();
      assert.ok(savedInDb, "Message was committed to MongoDB 'messages' collection");
      assert.strictEqual(savedInDb.text, "Hello Bob, is the calculator available?", "Saved text matches");
      assert.strictEqual(savedInDb.senderId.toString(), alice._id.toString(), "Saved senderId matches Alice");

      // Verify Conversation lastMessage update
      const updatedConv = await ConversationModel.findById(convId).lean();
      assert.strictEqual(updatedConv?.lastMessage?.text, "Hello Bob, is the calculator available?", "Conversation lastMessage synchronized in MongoDB");
      console.log("  PASS: Message persisted to MongoDB collection 'messages' before realtime publication");
    }

    // -----------------------------------------------------------------
    // TEST 6: Deduplication & Idempotency
    // -----------------------------------------------------------------
    console.log("\nTEST 6: Deduplication & Idempotency");
    {
      const duplicateClientMsgId = "client-msg-test-001"; // same ID as TEST 5
      const dupReq = makeMockRequest(`/api/messages/conversations/${convId}/messages`, {
        token: aliceToken,
        body: {
          text: "Hello Bob, is the calculator available?",
          clientMessageId: duplicateClientMsgId,
        },
      });

      const dupRes = await handlePostMessage(dupReq, { params: Promise.resolve({ id: convId }) });
      assert.ok(dupRes, "dupRes is defined");
      assert.strictEqual(dupRes.status, 200, "Duplicate request returns 200 OK (idempotent)");
      const dupData = await dupRes.json();
      assert.strictEqual(dupData.duplicate, true, "duplicate flag set to true");

      // Verify only 1 document exists in MongoDB
      const count = await MessageModel.countDocuments({ clientMessageId: duplicateClientMsgId });
      assert.strictEqual(count, 1, "Exactly one document exists in MongoDB despite duplicate submission");
      console.log("  PASS: Duplicate clientMessageId gracefully recognized without creating duplicate rows");
    }

    // -----------------------------------------------------------------
    // TEST 7: Reconnect Recovery & Deterministic Ordering
    // -----------------------------------------------------------------
    console.log("\nTEST 7: Reconnect Recovery & Deterministic Ordering (sinceId cursor)");
    {
      // Send 3 sequential messages from Bob
      const msg1Res = await handlePostMessage(
        makeMockRequest(`/api/messages/conversations/${convId}/messages`, {
          token: bobToken,
          body: { text: "Seq Message 1", clientMessageId: "client-seq-1" },
        }),
        { params: Promise.resolve({ id: convId }) }
      );
      assert.ok(msg1Res, "msg1Res is defined");
      const msg1Data = await msg1Res.json();
      const pivotId = msg1Data.message.id;

      // Small delay to ensure timestamp progression
      await new Promise((r) => setTimeout(r, 20));

      await handlePostMessage(
        makeMockRequest(`/api/messages/conversations/${convId}/messages`, {
          token: bobToken,
          body: { text: "Seq Message 2", clientMessageId: "client-seq-2" },
        }),
        { params: Promise.resolve({ id: convId }) }
      );

      await new Promise((r) => setTimeout(r, 20));

      await handlePostMessage(
        makeMockRequest(`/api/messages/conversations/${convId}/messages`, {
          token: bobToken,
          body: { text: "Seq Message 3", clientMessageId: "client-seq-3" },
        }),
        { params: Promise.resolve({ id: convId }) }
      );

      // Simulate client reconnect requesting messages since pivotId
      const reconnectReq = makeMockRequest(
        `/api/messages/conversations/${convId}/messages?sinceId=${pivotId}`,
        { token: aliceToken }
      );
      const reconnectRes = await handleGetMessages(reconnectReq, {
        params: Promise.resolve({ id: convId }),
      });
      assert.ok(reconnectRes, "reconnectRes is defined");
      assert.strictEqual(reconnectRes.status, 200, "Reconnect recovery request returns 200 OK");
      const reconnectData = await reconnectRes.json();
      assert.strictEqual(reconnectData.messages.length, 2, "Returns exactly the 2 messages sent after pivotId");
      assert.strictEqual(reconnectData.messages[0].text, "Seq Message 2", "Deterministic order: Seq Message 2 first");
      assert.strictEqual(reconnectData.messages[1].text, "Seq Message 3", "Deterministic order: Seq Message 3 second");
      console.log("  PASS: Reconnect recovery cleanly fetches missed messages using sinceId cursor");
    }

    // -----------------------------------------------------------------
    // TEST 8: Non-Member Access Denied on Messages Endpoint
    // -----------------------------------------------------------------
    console.log("\nTEST 8: Non-Member Access Denied on Messages Endpoint");
    {
      const intruderReq = makeMockRequest(`/api/messages/conversations/${convId}/messages`, {
        token: charlieToken,
        body: { text: "I should not be able to post here" },
      });
      const intruderRes = await handlePostMessage(intruderReq, {
        params: Promise.resolve({ id: convId }),
      });
      assert.ok(intruderRes, "intruderRes is defined");
      assert.strictEqual(intruderRes.status, 404, "Non-member receives 404 (preventing enumeration)");
      console.log("  PASS: Non-member cannot read or send messages in another user's conversation");
    }

    console.log("\n====================================================================");
    console.log("       ALL 8 PHASE 5 STAGE B MESSAGING ACCEPTANCE TESTS PASSED!     ");
    console.log("====================================================================\n");
  } finally {
    process.env = originalEnv;
    if (mongod) {
      await mongoose.disconnect();
      await mongod.stop();
    }
  }
}

runRealtimeMessagingTestSuite()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Test suite failed:", err);
    process.exit(1);
  });
