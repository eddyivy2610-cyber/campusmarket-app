import http from "node:http";
import { MongoMemoryServer } from "mongodb-memory-server";
import { io as Client } from "socket.io-client";

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

async function main() {
  console.log("==================================================================");
  console.log(" EXPRESS SOCKET.IO HANDSHAKE & USER ROOM TEST SUITE");
  console.log("==================================================================\n");

  const mongod = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongod.getUri();

  const backendMongoose = (await import("../campus-hive-backend/node_modules/mongoose/index.js" as any)).default;
  await backendMongoose.connect(mongod.getUri());

  const User = (await import("../campus-hive-backend/models/User.js" as any)).default;
  const Conversation = (await import("../campus-hive-backend/models/Conversation.js" as any)).default;
  const Message = (await import("../campus-hive-backend/models/Message.js" as any)).default;
  const { initSocket, checkSocketMessageRateLimit, SOCKET_MESSAGE_LIMIT, SOCKET_MESSAGE_WINDOW_MS } = await import("../campus-hive-backend/socket/index.js" as any);
  const { generateToken } = await import("../campus-hive-backend/utils/auth.js" as any);
  const { createRefreshToken } = await import("../app/lib/authTokens");
  const jwt = (await import("../campus-hive-backend/node_modules/jsonwebtoken/index.js" as any)).default;

  // 1. Seed users (via raw collection to simulate Next.js user creation)
  const usersColl = backendMongoose.connection.db.collection("users");
  const aliceRes = await usersColl.insertOne({
    email: "alice.socket@campushive.edu.ng",
    password: "Password123!",
    role: "buyer",
    accountStatus: "active",
    agreedToTerms: true,
    profile: { displayName: "Alice Socket" },
    schemaVersion: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  const aliceId = aliceRes.insertedId.toString();
  const activeUserAlice = { _id: aliceRes.insertedId, email: "alice.socket@campushive.edu.ng", role: "buyer" };
  const aliceToken = generateToken(activeUserAlice);

  const bobRes = await usersColl.insertOne({
    email: "bob.socket@campushive.edu.ng",
    password: "Password123!",
    role: "seller",
    accountStatus: "active",
    agreedToTerms: true,
    profile: { displayName: "Bob Socket" },
    schemaVersion: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  const bobId = bobRes.insertedId.toString();
  const activeUserBob = { _id: bobRes.insertedId, email: "bob.socket@campushive.edu.ng", role: "seller" };
  const bobToken = generateToken(activeUserBob);

  const suspendedRes = await usersColl.insertOne({
    email: "suspended.socket@campushive.edu.ng",
    password: "Password123!",
    role: "buyer",
    accountStatus: "suspended",
    agreedToTerms: true,
    profile: { displayName: "Suspended User" },
    schemaVersion: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  const suspendedUser = { _id: suspendedRes.insertedId, email: "suspended.socket@campushive.edu.ng", role: "buyer" };
  const suspendedToken = generateToken(suspendedUser);

  // Seed conversation between Alice and Bob
  const conversation = await Conversation.create({
    participants: [activeUserAlice._id, activeUserBob._id],
    status: "active",
  });
  const conversationId = conversation._id.toString();

  // 2. Start HTTP & Socket server
  const server = http.createServer();
  const ioServer = initSocket(server, ["*"]);

  await new Promise<void>((resolve) => {
    server.listen(0, () => resolve());
  });
  const address = server.address() as any;
  const socketUrl = `http://127.0.0.1:${address.port}`;

  try {
    // -------------------------------------------------------------
    // TEST 1: Handshake with NO token is rejected
    // -------------------------------------------------------------
    console.log("--- TEST 1: Handshake Token Requirement ---");
    {
      const errMessage = await new Promise<string>((resolve) => {
        const client = Client(socketUrl, {
          transports: ["websocket"],
          reconnection: false,
        });
        client.on("connect_error", (err) => {
          client.close();
          resolve(err.message);
        });
      });
      assert(
        errMessage.includes("No token provided"),
        "Socket handshake rejects connection with no token ('No token provided')"
      );
    }

    // -------------------------------------------------------------
    // TEST 2: Handshake with INVALID token signature is rejected
    // -------------------------------------------------------------
    console.log("\n--- TEST 2: Handshake Cryptographic Verification ---");
    {
      const forgedToken = jwt.sign(
        { sub: aliceId, id: aliceId, role: "buyer" },
        "wrong-secret-0000000000000000000000000000",
        { algorithm: "HS256" }
      );
      const errMessage = await new Promise<string>((resolve) => {
        const client = Client(socketUrl, {
          auth: { token: forgedToken },
          transports: ["websocket"],
          reconnection: false,
        });
        client.on("connect_error", (err) => {
          client.close();
          resolve(err.message);
        });
      });
      assert(
        errMessage.toLowerCase().includes("authentication error") || errMessage.toLowerCase().includes("signature"),
        "Socket handshake verifies token signature and rejects forged token"
      );
    }

    // -------------------------------------------------------------
    // TEST 3: Handshake with REFRESH token is rejected (Cross-type)
    // -------------------------------------------------------------
    console.log("\n--- TEST 3: Token Type Enforcement (Access Only) ---");
    {
      const refreshTok = createRefreshToken({
        id: aliceId,
        name: "Alice",
        email: "alice@campushive.edu.ng",
        role: "buyer",
        isStudent: true,
        studentVerified: true,
      });
      const errMessage = await new Promise<string>((resolve) => {
        const client = Client(socketUrl, {
          auth: { token: refreshTok },
          transports: ["websocket"],
          reconnection: false,
        });
        client.on("connect_error", (err) => {
          client.close();
          resolve(err.message);
        });
      });
      assert(
        errMessage.includes("Invalid token type"),
        "Socket handshake strictly rejects refresh tokens (cross-type isolation)"
      );
    }

    // -------------------------------------------------------------
    // TEST 4: Handshake with SUSPENDED account is rejected
    // -------------------------------------------------------------
    console.log("\n--- TEST 4: Database Account Status Check ---");
    {
      const errMessage = await new Promise<string>((resolve) => {
        const client = Client(socketUrl, {
          auth: { token: suspendedToken },
          transports: ["websocket"],
          reconnection: false,
        });
        client.on("connect_error", (err) => {
          client.close();
          resolve(err.message);
        });
      });
      assert(
        errMessage.includes("Account is suspended"),
        "Socket handshake queries DB and rejects suspended user account"
      );
    }

    // -------------------------------------------------------------
    // TEST 5: Handshake with VALID user token succeeds
    // -------------------------------------------------------------
    console.log("\n--- TEST 5: Legitimate Token Handshake ---");
    let aliceSocketClient: any;
    let bobSocketClient: any;
    {
      const connectResult = await new Promise<boolean>((resolve) => {
        aliceSocketClient = Client(socketUrl, {
          auth: { token: aliceToken },
          transports: ["websocket"],
          reconnection: false,
        });
        aliceSocketClient.on("connect", () => resolve(true));
        aliceSocketClient.on("connect_error", () => resolve(false));
      });
      assert(connectResult === true, "Valid user token successfully connects to socket server");
    }

    // -------------------------------------------------------------
    // TEST 6: Server-side room user:<id> joining verification
    // -------------------------------------------------------------
    console.log("\n--- TEST 6: Server-Side Room user:<id> Joining ---");
    {
      // Inspect rooms for Alice's socket on the server
      const socketsMap = await ioServer.fetchSockets();
      const aliceServerSocket = socketsMap.find((s: any) => s.data?.user?._id?.toString() === aliceId || s.id === aliceSocketClient.id);
      
      const aliceRooms = aliceServerSocket ? Array.from(aliceServerSocket.rooms) : [];
      assert(
        aliceRooms.includes(`user:${aliceId}`),
        `Socket server automatically joined room 'user:${aliceId}' server-side`
      );
      assert(
        aliceRooms.includes(aliceId),
        `Socket server also joined legacy room '${aliceId}' for compatibility`
      );
    }

    // -------------------------------------------------------------
    // TEST 7: Socket send_message (Membership, Recipient from conv, Persist first, Emit, Ack callback)
    // -------------------------------------------------------------
    console.log("\n--- TEST 7: Socket send_message Hardening ---");
    let eveSocketClient: any;
    {
      // 1. Connect Bob
      await new Promise<boolean>((resolve) => {
        bobSocketClient = Client(socketUrl, {
          auth: { token: bobToken },
          transports: ["websocket"],
          reconnection: false,
        });
        bobSocketClient.on("connect", () => resolve(true));
      });

      // 2. Connect Eve (non-member / intruder)
      const eveRes = await usersColl.insertOne({
        email: "eve.socket@campushive.edu.ng",
        password: "Password123!",
        role: "buyer",
        accountStatus: "active",
        agreedToTerms: true,
        profile: { displayName: "Eve Intruder" },
        schemaVersion: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      const eveUser = { _id: eveRes.insertedId, email: "eve.socket@campushive.edu.ng", role: "buyer" };
      const eveToken = generateToken(eveUser);
      await new Promise<boolean>((resolve) => {
        eveSocketClient = Client(socketUrl, {
          auth: { token: eveToken },
          transports: ["websocket"],
          reconnection: false,
        });
        eveSocketClient.on("connect", () => resolve(true));
      });

      // 7a. Non-member Eve attempts to send message in Alice & Bob's conversation -> rejected via ack
      const eveAck = await new Promise<any>((resolve) => {
        eveSocketClient.emit(
          "send_message",
          {
            conversationId,
            text: "Intruder message",
          },
          (res: any) => resolve(res)
        );
      });
      assert(
        eveAck?.error?.includes("Forbidden") || eveAck?.error?.includes("participant"),
        "send_message verifies membership: Non-member rejected with ack error"
      );

      // Verify no message was persisted by intruder Eve
      const eveMessagesCount = await Message.countDocuments({ senderId: eveUser._id });
      assert(
        eveMessagesCount === 0,
        "Zero messages persisted in database for rejected non-member"
      );

      // 7b. Missing required fields -> rejected via ack
      const missingFieldAck = await new Promise<any>((resolve) => {
        aliceSocketClient.emit(
          "send_message",
          {
            conversationId,
            // text missing
          },
          (res: any) => resolve(res)
        );
      });
      assert(
        Boolean(missingFieldAck?.error),
        "send_message rejects missing message text via ack callback"
      );

      // 7c. Legitimate member Alice sends message with ack callback:
      //     - recipient taken from conversation (even if body has spoofed receiverId)
      //     - persisted first in MongoDB
      //     - then emitted to Bob's room
      //     - ack callback receives success confirmation
      const bobReceivedPromise = new Promise<any>((resolve) => {
        bobSocketClient.on("receive_message", (msg: any) => {
          resolve(msg);
        });
      });

      const spoofedReceiverId = "attacker-fake-recipient-id";
      const aliceAck = await new Promise<any>((resolve) => {
        aliceSocketClient.emit(
          "send_message",
          {
            conversationId,
            receiverId: spoofedReceiverId, // Spoofed receiverId in payload!
            text: "Hello Bob, verified and persisted first!",
          },
          (res: any) => resolve(res)
        );
      });

      assert(
        aliceAck?.success === true && Boolean(aliceAck?.data?._id),
        "send_message invokes ack callback with success: true and message data"
      );

      // Verify PERSIST FIRST: Message is persisted in MongoDB
      const savedMessage = await Message.findById(aliceAck.data._id);
      assert(
        savedMessage !== null && savedMessage.text === "Hello Bob, verified and persisted first!",
        "send_message persisted message in MongoDB Message collection before ack"
      );
      assert(
        savedMessage.senderId.toString() === aliceId,
        "Persisted message senderId strictly matches authenticated socket user"
      );

      // Verify conversation.lastMessage updated
      const updatedConv = await Conversation.findById(conversationId);
      assert(
        updatedConv?.lastMessage?.text === "Hello Bob, verified and persisted first!" &&
          updatedConv?.lastMessage?.senderId?.toString() === aliceId,
        "Conversation.lastMessage metadata successfully updated with persisted message"
      );

      // Verify RECIPIENT TAKEN FROM CONVERSATION and THEN EMITTED:
      // Bob receives the message despite Alice's spoofed receiverId
      const bobReceived = await bobReceivedPromise;
      assert(
        bobReceived?.text === "Hello Bob, verified and persisted first!" &&
          bobReceived?.senderId === aliceId &&
          bobReceived?.receiverId === bobId,
        "Recipient taken directly from conversation and message emitted to recipient room"
      );
      // -------------------------------------------------------------
      // TEST 8: Per-Socket Message Rate Limiting
      // -------------------------------------------------------------
      console.log("\n--- TEST 8: Per-Socket Message Rate Limiting ---");

      // 8a. Unit behavior of checkSocketMessageRateLimit helper
      const mockSocket: any = { id: "test-socket-01" };
      for (let i = 0; i < 5; i++) {
        const res = checkSocketMessageRateLimit(mockSocket, 5, 2000);
        assert(res.allowed === true, `Rate limiter allows message ${i + 1} of 5 within window`);
      }
      const burstRes = checkSocketMessageRateLimit(mockSocket, 5, 2000);
      assert(
        burstRes.allowed === false && burstRes.retryAfter >= 1,
        "Rate limiter blocks message exceeding threshold with retryAfter"
      );
      assert(
        burstRes.error.includes("Rate limit exceeded"),
        "Rate limiter returns descriptive slow down error message"
      );

      // 8b. End-to-end socket client rate limiting on send_message
      // Connect a dedicated client for burst testing
      const burstSocketClient: any = Client(socketUrl, {
        auth: { token: aliceToken },
        transports: ["websocket"],
        reconnection: false,
      });
      await new Promise<boolean>((resolve) => {
        burstSocketClient.on("connect", () => resolve(true));
      });

      let rateLimitHit = false;
      let rateLimitEventReceived: any = null;
      burstSocketClient.on("rate_limit_exceeded", (evt: any) => {
        rateLimitEventReceived = evt;
      });

      let blockedAckResponse: any = null;
      let successfulCount = 0;

      for (let i = 0; i < 15; i++) {
        const ack: any = await new Promise((resolve) => {
          burstSocketClient.emit(
            "send_message",
            {
              conversationId,
              text: `Burst message ${i}`,
            },
            (res: any) => resolve(res)
          );
        });

        if (ack?.success) {
          successfulCount++;
        } else if (ack?.error?.includes("Rate limit exceeded")) {
          rateLimitHit = true;
          blockedAckResponse = ack;
          break;
        }
      }

      assert(
        rateLimitHit === true,
        "Server-side per-socket rate limiter triggered on rapid message flood"
      );
      assert(
        successfulCount === SOCKET_MESSAGE_LIMIT,
        `Per-socket rate limiter allowed exactly ${SOCKET_MESSAGE_LIMIT} messages before throttling`
      );
      assert(
        blockedAckResponse?.retryAfter >= 1,
        "Throttled response includes retryAfter seconds in ack callback"
      );
      assert(
        Boolean(rateLimitEventReceived?.error),
        "Throttled socket client receives 'rate_limit_exceeded' socket event"
      );

      // Verify blocked message was NOT saved in database
      const blockedMsgInDb = await Message.findOne({ text: `Burst message ${successfulCount}` });
      assert(
        blockedMsgInDb === null,
        "Throttled message was not persisted to MongoDB"
      );

      burstSocketClient.close();

      // 8c. Bob's socket is NOT throttled (rate limiting is strictly per-socket)
      const bobAck: any = await new Promise((resolve) => {
        bobSocketClient.emit(
          "send_message",
          {
            conversationId,
            text: "Bob message from a different socket",
          },
          (res: any) => resolve(res)
        );
      });
      assert(
        bobAck?.success === true,
        "Different socket connection (Bob) is not affected by Alice's socket rate limit"
      );
    }

    // Clean up clients
    if (aliceSocketClient) aliceSocketClient.close();
    if (bobSocketClient) bobSocketClient.close();
    if (eveSocketClient) eveSocketClient.close();
  } finally {
    ioServer.close();
    server.close();
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
