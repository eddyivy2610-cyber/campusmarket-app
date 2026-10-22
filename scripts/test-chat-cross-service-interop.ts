import { MongoMemoryReplSet } from "mongodb-memory-server";
import mongoose from "mongoose";
// @ts-ignore
import backendMongoose from "../campus-hive-backend/node_modules/mongoose/index.js";
import { ConversationModel as NextConversationModel } from "../app/models/ChatModels";
import ExpressConversation from "../campus-hive-backend/models/Conversation.js";
import UserModel from "../app/models/User";
import "../campus-hive-backend/models/User.js";
import { runConversationMigration } from "./migrate-conversations-phase3";

let passed = 0;
let failed = 0;

function assert(condition: boolean, msg: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${msg}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${msg}`);
    failed++;
  }
}

async function run() {
  console.log("==================================================================");
  console.log(" CROSS-SERVICE CONVERSATION INTEROPERABILITY & MIGRATION TEST");
  console.log("==================================================================\n");

  const repl = await MongoMemoryReplSet.create({ replSet: { count: 1, storageEngine: "wiredTiger" } });
  console.log("  ⚡ MongoMemoryReplSet running at:", repl.getUri());
  await mongoose.connect(repl.getUri());
  await (backendMongoose as any).connect(repl.getUri());
  console.log("  ⚡ Connected both Next.js and Express Mongoose instances to test DB");

  const userA = await UserModel.create({
    name: "User Alice",
    email: "alice@campushive.edu.ng",
    role: "buyer",
  });
  const userB = await UserModel.create({
    name: "User Bob",
    email: "bob@campushive.edu.ng",
    role: "seller",
  });
  const userC = await UserModel.create({
    name: "User Charlie",
    email: "charlie@campushive.edu.ng",
    role: "buyer",
  });

  // ---------------- SCENARIO 1: Next.js writes -> Express reads ----------------
  console.log("--- 1. Next.js creates conversation -> Express lists it ---");
  {
    const nextConv = await NextConversationModel.create({
      conversationId: "conv-next-1",
      participants: [
        { id: userA._id.toString(), name: "Alice", isVerified: true, accountType: "student" },
        { id: userB._id.toString(), name: "Bob", isVerified: true, accountType: "student" },
      ],
      lastMessage: {
        text: "Hi Bob, interested in the calculator!",
        senderId: userA._id.toString(),
        createdAt: new Date().toISOString(),
        time: new Date(),
        type: "text",
      },
      status: "active",
      schemaVersion: 1,
    });

    assert(Boolean(nextConv), "Next.js successfully persisted conversation in 'conversations'");
    assert(
      Array.isArray(nextConv.participantIds) && nextConv.participantIds.includes(userA._id.toString()),
      "participantIds automatically synchronized by pre-validate hook in Next.js"
    );

    // Express executes its exact inbox query:
    const expressFound = await ExpressConversation.find({
      participants: userA._id,
      status: "active",
    })
      .populate("participants", "name email")
      .sort({ "lastMessage.time": -1 })
      .lean();

    assert(expressFound.length === 1, "Express finds conversation created by Next.js");
    assert(
      (expressFound[0] as any).lastMessage?.text === "Hi Bob, interested in the calculator!",
      "Express accurately reads lastMessage text created by Next.js"
    );
  }

  // ---------------- SCENARIO 2: Express writes -> Next.js reads ----------------
  console.log("\n--- 2. Express creates conversation -> Next.js lists it ---");
  {
    const expressConv = await ExpressConversation.create({
      participants: [userB._id, userC._id],
      lastMessage: {
        text: "Hey Charlie, order confirmed!",
        senderId: userB._id,
        time: new Date(),
      },
      status: "active",
      schemaVersion: 1,
    });

    assert(Boolean(expressConv), "Express successfully persisted conversation");
    assert(
      Array.isArray(expressConv.participantIds) && expressConv.participantIds.includes(userC._id.toString()),
      "Express pre-validate hook synchronized participantIds automatically"
    );

    // Next.js executes its exact inbox query:
    const nextFound = await NextConversationModel.find({
      participantIds: userC._id.toString(),
      status: "active",
    })
      .sort({ updatedAt: -1 })
      .lean();

    assert(nextFound.length === 1, "Next.js finds conversation created by Express");
    assert(
      (nextFound[0] as any).lastMessage?.text === "Hey Charlie, order confirmed!",
      "Next.js accurately reads lastMessage metadata created by Express"
    );
  }

  // ---------------- SCENARIO 3: Update query bypass prevention ----------------
  console.log("\n--- 3. Query Update Hook (updateOne / findOneAndUpdate) Sync ---");
  {
    // Update participants via findOneAndUpdate
    const newUserD = new mongoose.Types.ObjectId();
    const updated = await ExpressConversation.findOneAndUpdate(
      { participants: userA._id },
      { $set: { participants: [userA._id, newUserD] } },
      { new: true, runValidators: true }
    );

    assert(
      Boolean(updated?.participantIds?.includes(newUserD.toString())),
      "findOneAndUpdate with $set.participants automatically synchronized participantIds"
    );
  }

  // ---------------- SCENARIO 4: Legacy Collection Migration & Drift Check ----------------
  console.log("\n--- 4. Legacy campusconversations & campusmessages Migration ---");
  {
    const rawDb = mongoose.connection.db!;
    // Seed legacy collections
    await rawDb.collection("campusconversations").insertOne({
      conversationId: "legacy-conv-999",
      participantIds: [userA._id.toString(), userC._id.toString()],
      participants: [
        { id: userA._id.toString(), name: "Alice" },
        { id: userC._id.toString(), name: "Charlie" },
      ],
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    await rawDb.collection("campusmessages").insertOne({
      id: "legacy-msg-999",
      conversationId: "legacy-conv-999",
      senderId: userA._id.toString(),
      text: "Legacy chat historical message",
      createdAt: new Date().toISOString(),
    });

    // Run migration runner
    const result = await runConversationMigration(rawDb);
    assert(result.migratedConversations >= 1, `Migrated ${result.migratedConversations} legacy conversations`);
    assert(result.migratedMessages >= 1, `Migrated ${result.migratedMessages} legacy messages`);
    assert(result.driftCount === 0, "Drift check passed with 0 participant desynchronizations");

    // Verify migrated conversation is queryable by both Express and Next.js
    const expCheck = await ExpressConversation.findOne({
      participants: userC._id,
      conversationId: "legacy-conv-999",
    });
    assert(Boolean(expCheck), "Migrated conversation is queryable via Express (participants: [ObjectId])");

    const nextCheck = await NextConversationModel.findOne({
      participantIds: userC._id.toString(),
      conversationId: "legacy-conv-999",
    });
    assert(Boolean(nextCheck), "Migrated conversation is queryable via Next.js (participantIds: [String])");
  }

  console.log("\n==================================================================");
  console.log(` ALL CROSS-SERVICE INTEROP TESTS COMPLETE: ${passed} PASSED | ${failed} FAILED`);
  console.log("==================================================================");

  await mongoose.disconnect();
  await (backendMongoose as any).disconnect();
  await repl.stop();
  if (failed > 0) process.exit(1);
  process.exit(0);
}

run().catch((err) => {
  console.error("Interop test error:", err);
  process.exit(1);
});
