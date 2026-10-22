import { MongoMemoryServer } from "mongodb-memory-server";

process.env.AUTH_SECRET = process.env.AUTH_SECRET || "e2e-shared-secret-0123456789abcdef0123456789abcdef";
process.env.SMTP_USER = process.env.SMTP_USER || "e2e@example.com";
process.env.SMTP_PASSWORD = process.env.SMTP_PASSWORD || "e2e-password";
process.env.ADMIN_REGISTRATION_KEY = process.env.ADMIN_REGISTRATION_KEY || "e2e-admin-key";

let passed = 0;
let failed = 0;

function assert(cond: boolean, msg: string) {
  if (cond) {
    console.log(`[PASS] ${msg}`);
    passed++;
  } else {
    console.error(`[FAIL] ${msg}`);
    failed++;
  }
}

function mockRes() {
  const out: { status: number; body: any } = { status: 200, body: undefined };
  const res: any = {
    status(code: number) {
      out.status = code;
      return res;
    },
    json(body: any) {
      out.body = body;
      return res;
    },
  };
  return { res, out };
}

async function main() {
  console.log("==================================================================");
  console.log(" EXPRESS CHAT REST AUTHORIZATION & MEMBERSHIP TEST SUITE");
  console.log("==================================================================\n");

  const mongod = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongod.getUri();

  const backendMongoose = (await import("../campus-hive-backend/node_modules/mongoose/index.js" as any)).default;
  await backendMongoose.connect(mongod.getUri());

  // Register referenced schemas for population
  await import("../campus-hive-backend/models/User.js" as any);
  await import("../campus-hive-backend/models/Listing.js" as any);
  const Conversation = (await import("../campus-hive-backend/models/Conversation.js" as any)).default;
  const Message = (await import("../campus-hive-backend/models/Message.js" as any)).default;
  const { getUserConversations, getMessages, sendMessage } = await import(
    "../campus-hive-backend/controllers/chat.controller.js" as any
  );

  try {
    const userAliceId = new backendMongoose.Types.ObjectId();
    const userBobId = new backendMongoose.Types.ObjectId();
    const userEveId = new backendMongoose.Types.ObjectId(); // Attacker / Outsider

    const reqAlice = {
      user: {
        _id: userAliceId,
        id: userAliceId.toString(),
        email: "alice@campushive.edu.ng",
        role: "buyer",
      },
    };

    const reqEve = {
      user: {
        _id: userEveId,
        id: userEveId.toString(),
        email: "eve@campushive.edu.ng",
        role: "buyer",
      },
    };

    // Create a conversation between Alice and Bob
    const conversation = await Conversation.create({
      participants: [userAliceId, userBobId],
      status: "active",
    });
    const conversationId = conversation._id.toString();

    // -------------------------------------------------------------
    // TEST 1: GET /user/:userId must equal req.user.id
    // -------------------------------------------------------------
    console.log("--- TEST 1: GET /user/:userId Identity Enforcement ---");

    // Eve attempts to read Alice's conversation list -> 403 Forbidden
    {
      const { res, out } = mockRes();
      await getUserConversations(
        {
          ...reqEve,
          params: { userId: userAliceId.toString() },
        },
        res
      );
      assert(
        out.status === 403,
        "GET /user/:userId rejects request when :userId does not match req.user.id (403 Forbidden)"
      );
    }

    // Alice reads her own conversation list -> 200 OK
    {
      const { res, out } = mockRes();
      await getUserConversations(
        {
          ...reqAlice,
          params: { userId: userAliceId.toString() },
        },
        res
      );
      assert(
        out.status === 200 && Array.isArray(out.body?.data),
        "GET /user/:userId succeeds when :userId matches req.user.id (200 OK)"
      );
      assert(
        out.body?.data?.length === 1 && out.body?.data[0]?._id?.toString() === conversationId,
        "Returned conversations belong to authenticated user"
      );
    }

    // -------------------------------------------------------------
    // TEST 2: GET /:conversationId/messages checks membership
    // -------------------------------------------------------------
    console.log("\n--- TEST 2: GET /:conversationId/messages Membership Check ---");

    // Non-existent conversation -> 404
    {
      const { res, out } = mockRes();
      const fakeId = new backendMongoose.Types.ObjectId().toString();
      await getMessages(
        {
          ...reqAlice,
          params: { conversationId: fakeId },
        },
        res
      );
      assert(
        out.status === 404,
        "GET /:conversationId/messages returns 404 Not Found for non-existent conversation"
      );
    }

    // Non-member Eve attempts to read Alice & Bob's conversation -> 404 Not Found
    {
      const { res, out } = mockRes();
      await getMessages(
        {
          ...reqEve,
          params: { conversationId },
        },
        res
      );
      assert(
        out.status === 404,
        "GET /:conversationId/messages returns 404 Not Found to non-member (prevents ID enumeration)"
      );
    }

    // Legitimate participant Alice reads conversation -> 200 OK
    {
      const { res, out } = mockRes();
      await getMessages(
        {
          ...reqAlice,
          params: { conversationId },
        },
        res
      );
      assert(
        out.status === 200 && Array.isArray(out.body?.data),
        "GET /:conversationId/messages allows legitimate participant with 200 OK"
      );
    }

    // -------------------------------------------------------------
    // TEST 3: sendMessage uses req.user.id, ignores body senderId
    // -------------------------------------------------------------
    console.log("\n--- TEST 3: sendMessage Identity & Membership Enforcement ---");

    // Non-member Eve attempts to send message in Alice & Bob's conversation -> 404
    {
      const { res, out } = mockRes();
      await sendMessage(
        {
          ...reqEve,
          body: {
            conversationId,
            text: "Hello from intruder",
          },
        },
        res
      );
      assert(
        out.status === 404,
        "sendMessage rejects non-member attempt to post in conversation with 404 Not Found"
      );
    }

    // Alice sends message with SPOOFED senderId in body -> strictly uses req.user._id
    {
      const { res, out } = mockRes();
      const spoofedSenderId = userBobId.toString(); // Alice claims she is Bob in body!
      await sendMessage(
        {
          ...reqAlice,
          body: {
            conversationId,
            senderId: spoofedSenderId,
            text: "Hello, this is a legitimate message from Alice",
          },
        },
        res
      );

      assert(
        out.status === 201,
        "sendMessage responds with 201 Created for legitimate participant"
      );

      const savedMessageId = out.body?.data?._id;
      const storedMsg = await Message.findById(savedMessageId);
      assert(
        storedMsg?.senderId?.toString() === userAliceId.toString(),
        "sendMessage strictly derived senderId from req.user.id and ignored spoofed body.senderId"
      );

      // Verify conversation lastMessage also records Alice as sender
      const updatedConv = await Conversation.findById(conversationId);
      assert(
        updatedConv?.lastMessage?.senderId?.toString() === userAliceId.toString(),
        "Conversation.lastMessage accurately reflects authenticated caller as senderId"
      );
    }

    // Missing required fields (text missing)
    {
      const { res, out } = mockRes();
      await sendMessage(
        {
          ...reqAlice,
          body: {
            conversationId,
          },
        },
        res
      );
      assert(
        out.status === 400,
        "sendMessage returns 400 Bad Request when required message text is missing"
      );
    }
  } finally {
    await backendMongoose.disconnect();
    await mongod.stop();
  }

  console.log("\n==================================================================");
  console.log(` RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log("==================================================================");
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
