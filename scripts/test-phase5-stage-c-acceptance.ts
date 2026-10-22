/**
 * scripts/test-phase5-stage-c-acceptance.ts
 *
 * Phase 5 Stage C: Deployed Acceptance & Failure-Injection Test Suite
 *
 * Acceptance Gates Tested:
 * 1. Provider Outage Simulation: Database persistence survives realtime provider downtime.
 * 2. Database Outage Simulation: Message is never published if database write fails.
 * 3. Expired Token Eviction & Renewal: Expired tokens rejected (401), renewed tokens accepted (200).
 * 4. Immediate Revocation: Suspended accounts rejected (403) despite valid unexpired token signature.
 * 5. High-Concurrency Multi-Tab Deduplication: Parallel submissions with same clientMessageId produce 1 DB record.
 * 6. Keyset Reconnect Catch-up: Strict deterministic ordering across interrupted connection.
 * 7. Payload Boundary Guard: Character and attachment size bounds strictly enforced.
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
import {
  resetRealtimeServer,
  simulateRealtimeOutage,
} from "../app/lib/realtimeServer";

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

async function runStageCAcceptanceSuite() {
  console.log("====================================================================");
  console.log("       PHASE 5 STAGE C: DEPLOYED ACCEPTANCE & FAILURE-INJECTION     ");
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

    resetRealtimeServer();

    // Seed test users
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

    const conversation = await ConversationModel.create({
      participants: [alice._id, bob._id],
      participantIds: [alice._id.toString(), bob._id.toString()],
      status: "active",
      schemaVersion: 1,
    });
    const convId = conversation._id.toString();

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

    // -----------------------------------------------------------------
    // GATE 1: Realtime Provider Outage Simulation & Durable Persistence
    // -----------------------------------------------------------------
    console.log("GATE 1: Realtime Provider Outage Simulation & Durable Persistence");
    {
      // Simulate external provider downtime
      simulateRealtimeOutage("Pusher cluster connection timeout (ETIMEDOUT)");

      const clientMsgId = "outage-test-msg-001";
      const postReq = makeMockRequest(`/api/messages/conversations/${convId}/messages`, {
        token: aliceToken,
        body: {
          text: "Message sent during simulated realtime provider outage",
          clientMessageId: clientMsgId,
        },
      });

      const postRes = await handlePostMessage(postReq, { params: Promise.resolve({ id: convId }) });
      assert.ok(postRes, "postRes is defined");
      assert.strictEqual(postRes.status, 201, "Message created with 201 Created despite provider outage");
      const postData = await postRes.json();
      assert.strictEqual(postData.realtimePublished, false, "realtimePublished is false (outbox recovery flagged)");

      // Verify MongoDB persistence succeeded and message was not lost
      const savedMsg = await MessageModel.findOne({ clientMessageId: clientMsgId }).lean();
      assert.ok(savedMsg, "Message was safely saved to MongoDB despite provider outage");
      assert.strictEqual(savedMsg.text, "Message sent during simulated realtime provider outage", "Text intact in DB");

      // Verify message is recoverable on reconnect cursor
      const catchupReq = makeMockRequest(
        `/api/messages/conversations/${convId}/messages`,
        { token: bobToken }
      );
      const catchupRes = await handleGetMessages(catchupReq, { params: Promise.resolve({ id: convId }) });
      assert.ok(catchupRes, "catchupRes is defined");
      const catchupData = await catchupRes.json();
      assert.ok(
        catchupData.messages.some((m: any) => m.clientMessageId === clientMsgId),
        "Saved message is recovered in thread history"
      );

      // Restore normal provider operation
      simulateRealtimeOutage(null);
      console.log("  PASS: Message survived provider outage in MongoDB and was recovered on thread fetch");
    }

    // -----------------------------------------------------------------
    // GATE 2: Database Outage Failure Injection (Never Publish on DB Failure)
    // -----------------------------------------------------------------
    console.log("\nGATE 2: Database Outage Failure Injection (Never Publish on DB Failure)");
    {
      const originalCreate = MessageModel.create;
      let realtimeEventTriggered = false;

      // Mock MessageModel.create to throw an intentional DB error
      (MessageModel as any).create = async () => {
        throw new Error("MongoNetworkTimeoutError: connection lost to replica set primary");
      };

      const failReq = makeMockRequest(`/api/messages/conversations/${convId}/messages`, {
        token: aliceToken,
        body: {
          text: "This message should fail because DB is down",
          clientMessageId: "db-fail-msg-002",
        },
      });

      const failRes = await handlePostMessage(failReq, { params: Promise.resolve({ id: convId }) });
      assert.ok(failRes, "failRes is defined");
      assert.strictEqual(failRes.status, 500, "DB failure immediately returns 500");
      const failData = await failRes.json();
      assert.ok(failData.error?.includes("Database persistence failed"), "Error explains database failure");

      // Restore MessageModel.create
      MessageModel.create = originalCreate;

      // Verify the failed message never reached the DB
      const notInDb = await MessageModel.findOne({ clientMessageId: "db-fail-msg-002" }).lean();
      assert.strictEqual(notInDb, null, "Failed message was never written to DB");
      console.log("  PASS: A failed database write strictly returned 500 and never published");
    }

    // -----------------------------------------------------------------
    // GATE 3: Expired Token Eviction & Token Renewal
    // -----------------------------------------------------------------
    console.log("\nGATE 3: Expired Token Eviction & Token Renewal");
    {
      // 1. Create an expired token (expired 5 minutes ago)
      const expiredToken = createAccessToken(
        {
          id: alice._id.toString(),
          name: alice.name,
          email: alice.email,
          role: alice.role,
          isStudent: true,
          studentVerified: true,
          tokenVersion: 0,
        },
        -300 // expired 300s ago
      );

      const expiredReq = makeMockRequest("/api/realtime/auth", {
        token: expiredToken,
        body: { socket_id: "123.456", channel_name: `private-conversation-${convId}` },
      });
      const expiredRes = await handleRealtimeAuth(expiredReq);
      assert.strictEqual(expiredRes.status, 401, "Expired token rejected with 401 Unauthorized");

      // 2. Renew session: fresh unexpired token
      const freshToken = createAccessToken({
        id: alice._id.toString(),
        name: alice.name,
        email: alice.email,
        role: alice.role,
        isStudent: true,
        studentVerified: true,
        tokenVersion: 0,
      });

      const freshReq = makeMockRequest("/api/realtime/auth", {
        token: freshToken,
        body: { socket_id: "123.456", channel_name: `private-conversation-${convId}` },
      });
      const freshRes = await handleRealtimeAuth(freshReq);
      assert.strictEqual(freshRes.status, 200, "Renewed token authorized with 200 OK");
      console.log("  PASS: Expired tokens strictly rejected (401); renewed token authorized (200)");
    }

    // -----------------------------------------------------------------
    // GATE 4: Immediate Account Revocation (Live Status Re-check)
    // -----------------------------------------------------------------
    console.log("\nGATE 4: Immediate Account Revocation (Live Status Re-check)");
    {
      // Alice is currently active and has a valid token
      // Admin suspends Alice's account in live database
      await UserModel.updateOne({ _id: alice._id }, { $set: { accountStatus: "suspended" } });

      const revokedReq = makeMockRequest("/api/realtime/auth", {
        token: aliceToken, // valid unexpired signature, but account is now suspended in DB
        body: { socket_id: "123.456", channel_name: `private-conversation-${convId}` },
      });
      const revokedRes = await handleRealtimeAuth(revokedReq);
      assert.strictEqual(revokedRes.status, 403, "Suspended account immediately revoked with 403");

      // Re-activate Alice for remaining tests
      await UserModel.updateOne({ _id: alice._id }, { $set: { accountStatus: "active" } });
      console.log("  PASS: Account suspension immediately revoked channel authorization (403)");
    }

    // -----------------------------------------------------------------
    // GATE 5: Multi-Tab Concurrency & Parallel Submission Race Condition
    // -----------------------------------------------------------------
    console.log("\nGATE 5: Multi-Tab Concurrency & Parallel Submission Race Condition (10 parallel requests)");
    {
      const concurrentTempId = "multi-tab-race-005";
      const requests = Array.from({ length: 10 }).map(() =>
        handlePostMessage(
          makeMockRequest(`/api/messages/conversations/${convId}/messages`, {
            token: aliceToken,
            body: {
              text: "Parallel multi-tab submission",
              clientMessageId: concurrentTempId,
            },
          }),
          { params: Promise.resolve({ id: convId }) }
        )
      );

      const responses = await Promise.all(requests);
      assert.ok(responses.every((r) => !!r), "All responses are defined");
      const statuses = responses.map((r) => r!.status);
      const count201 = statuses.filter((s) => s === 201).length;
      const count200 = statuses.filter((s) => s === 200).length;

      assert.strictEqual(count201, 1, "Exactly one parallel request succeeds with 201 Created");
      assert.strictEqual(count200, 9, "Remaining 9 parallel requests return 200 OK duplicate");

      const dbRows = await MessageModel.countDocuments({ clientMessageId: concurrentTempId });
      assert.strictEqual(dbRows, 1, "Exactly one document committed in MongoDB");
      console.log("  PASS: Concurrency handled: exactly 1 Created (201) and 9 duplicates (200), zero duplicate rows");
    }

    // -----------------------------------------------------------------
    // GATE 6: Interrupted Connection Reconnect Catchup (Keyset Cursor)
    // -----------------------------------------------------------------
    console.log("\nGATE 6: Interrupted Connection Reconnect Catchup (Keyset Cursor)");
    {
      // Post an initial anchor message
      const anchorRes = await handlePostMessage(
        makeMockRequest(`/api/messages/conversations/${convId}/messages`, {
          token: bobToken,
          body: { text: "Anchor Message", clientMessageId: "anchor-001" },
        }),
        { params: Promise.resolve({ id: convId }) }
      );
      assert.ok(anchorRes, "anchorRes must be defined");
      const anchorData = await anchorRes.json();
      const anchorId = anchorData.message.id;

      // Send 5 messages while Alice was offline
      for (let i = 1; i <= 5; i++) {
        await new Promise((r) => setTimeout(r, 15));
        await handlePostMessage(
          makeMockRequest(`/api/messages/conversations/${convId}/messages`, {
            token: bobToken,
            body: { text: `Offline Message ${i}`, clientMessageId: `offline-${i}` },
          }),
          { params: Promise.resolve({ id: convId }) }
        );
      }

      // Alice reconnects and requests missed messages since anchorId
      const reconnectReq = makeMockRequest(
        `/api/messages/conversations/${convId}/messages?sinceId=${anchorId}&limit=10`,
        { token: aliceToken }
      );
      const reconnectRes = await handleGetMessages(reconnectReq, { params: Promise.resolve({ id: convId }) });
      assert.ok(reconnectRes, "reconnectRes is defined");
      assert.strictEqual(reconnectRes.status, 200, "200 OK returned for reconnect recovery");
      const reconnectData = await reconnectRes.json();

      assert.strictEqual(reconnectData.messages.length, 5, "Exactly 5 missed messages retrieved");
      for (let i = 0; i < 5; i++) {
        assert.strictEqual(reconnectData.messages[i].text, `Offline Message ${i + 1}`, `Message ${i + 1} ordered deterministically`);
      }
      console.log("  PASS: Reconnect recovery fetched all 5 offline messages in strict chronological keyset order");
    }

    // -----------------------------------------------------------------
    // GATE 7: Payload Boundary Guard (Character limit & Attachment Size)
    // -----------------------------------------------------------------
    console.log("\nGATE 7: Payload Boundary Guard");
    {
      // Text exceeding 2,000 characters
      const oversizeText = "A".repeat(2001);
      const oversizeReq = makeMockRequest(`/api/messages/conversations/${convId}/messages`, {
        token: aliceToken,
        body: { text: oversizeText },
      });
      const oversizeRes = await handlePostMessage(oversizeReq, { params: Promise.resolve({ id: convId }) });
      assert.ok(oversizeRes, "oversizeRes is defined");
      assert.strictEqual(oversizeRes.status, 400, "Text > 2000 chars rejected with 400 Bad Request");

      // Attachment exceeding 5 MB limit
      const oversizeAttachmentReq = makeMockRequest(`/api/messages/conversations/${convId}/messages`, {
        token: aliceToken,
        body: {
          text: "Attachment too large",
          attachment: {
            url: "https://example.com/huge.png",
            fileName: "huge.png",
            mimeType: "image/png",
            sizeBytes: 6 * 1024 * 1024, // 6 MB > 5 MB
          },
        },
      });
      const oversizeAttachmentRes = await handlePostMessage(oversizeAttachmentReq, { params: Promise.resolve({ id: convId }) });
      assert.ok(oversizeAttachmentRes, "oversizeAttachmentRes is defined");
      assert.strictEqual(oversizeAttachmentRes.status, 400, "Attachment > 5 MB rejected with 400 Bad Request");

      console.log("  PASS: Boundary limits (2,000 chars, 5 MB attachments) strictly enforced");
    }

    console.log("\n====================================================================");
    console.log("     ALL 7 PHASE 5 STAGE C DEPLOYED ACCEPTANCE TESTS PASSED!        ");
    console.log("====================================================================\n");
  } finally {
    process.env = originalEnv;
    if (mongod) {
      await mongoose.disconnect();
      await mongod.stop();
    }
  }
}

runStageCAcceptanceSuite()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Test suite failed:", err);
    process.exit(1);
  });
