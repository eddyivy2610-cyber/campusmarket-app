/**
 * Phase 3: Conversation & Message Collection Migration and Drift Check
 *
 * Idempotent, rehearsal-ready script that:
 * 1. Migrates legacy documents from `campusconversations` into canonical `conversations`.
 * 2. Migrates legacy messages from `campusmessages` into canonical `messages`.
 * 3. Backfills both `participants` (ObjectId) and `participantIds` (String) on all documents.
 * 4. Runs an automated drift check asserting zero desynchronization between participants and participantIds.
 *
 * Usage:
 *   npx tsx scripts/migrate-conversations-phase3.ts
 */

import mongoose from "mongoose";

export function extractParticipantId(p: any): string {
  if (!p) return "";
  if (typeof p === "string") return p;
  if (typeof p.toHexString === "function") return p.toHexString();
  if (p._id) {
    if (typeof p._id.toHexString === "function") return p._id.toHexString();
    return String(p._id);
  }
  if (typeof p.id === "string") return p.id;
  if (typeof p.toString === "function" && p.toString() !== "[object Object]") return p.toString();
  return String(p);
}

export async function runConversationMigration(targetDb?: mongoose.mongo.Db) {
  const db = targetDb || mongoose.connection.db;
  if (!db) throw new Error("No database connection available");

  console.log("==================================================================");
  console.log(" PHASE 3: CONVERSATION & MESSAGE DATA MIGRATION");
  console.log("==================================================================\n");

  const existingColls = (await db.listCollections().toArray()).map((c) => c.name);

  // --- Step 1: Migrate campusconversations -> conversations ---
  let migratedConversations = 0;
  if (existingColls.includes("campusconversations")) {
    console.log("--- 1. Migrating from legacy 'campusconversations' to 'conversations' ---");
    const legacyConvColl = db.collection("campusconversations");
    const targetConvColl = db.collection("conversations");
    const legacyCursor = legacyConvColl.find({});

    while (await legacyCursor.hasNext()) {
      const doc = await legacyCursor.next();
      if (!doc) break;

      // Extract string IDs
      let participantIds: string[] = [];
      if (Array.isArray(doc.participantIds) && doc.participantIds.length > 0) {
        participantIds = doc.participantIds.map(extractParticipantId).filter(Boolean);
      } else if (Array.isArray(doc.participants)) {
        participantIds = doc.participants.map(extractParticipantId).filter(Boolean);
      }

      // Convert to ObjectIds for Express compatibility
      const participants = participantIds
        .filter((id) => mongoose.Types.ObjectId.isValid(id))
        .map((id) => new mongoose.Types.ObjectId(id));

      const unifiedDoc = {
        ...doc,
        participants,
        participantIds,
        status: doc.status || "active",
        schemaVersion: doc.schemaVersion || 1,
        updatedAt: doc.updatedAt ? new Date(doc.updatedAt) : new Date(),
        createdAt: doc.createdAt ? new Date(doc.createdAt) : new Date(),
      };

      // Upsert by _id or conversationId
      const query = doc.conversationId
        ? { $or: [{ _id: doc._id }, { conversationId: doc.conversationId }] }
        : { _id: doc._id };

      await targetConvColl.updateOne(query, { $set: unifiedDoc }, { upsert: true });
      migratedConversations++;
    }
    console.log(`  ✅ Migrated/merged ${migratedConversations} conversation documents.`);
  } else {
    console.log("  ℹ️ No legacy 'campusconversations' collection found to migrate.");
  }

  // --- Step 2: Migrate campusmessages -> messages ---
  let migratedMessages = 0;
  if (existingColls.includes("campusmessages")) {
    console.log("\n--- 2. Migrating from legacy 'campusmessages' to 'messages' ---");
    const legacyMsgColl = db.collection("campusmessages");
    const targetMsgColl = db.collection("messages");
    const legacyMsgCursor = legacyMsgColl.find({});

    while (await legacyMsgCursor.hasNext()) {
      const msg = await legacyMsgCursor.next();
      if (!msg) break;

      const unifiedMsg = {
        ...msg,
        conversationId: mongoose.Types.ObjectId.isValid(msg.conversationId)
          ? new mongoose.Types.ObjectId(msg.conversationId)
          : msg.conversationId,
        senderId: mongoose.Types.ObjectId.isValid(msg.senderId)
          ? new mongoose.Types.ObjectId(msg.senderId)
          : msg.senderId,
        schemaVersion: msg.schemaVersion || 1,
        createdAt: msg.createdAt ? new Date(msg.createdAt) : new Date(),
      };

      const query = msg.id
        ? { $or: [{ _id: msg._id }, { id: msg.id }] }
        : { _id: msg._id };

      await targetMsgColl.updateOne(query, { $set: unifiedMsg }, { upsert: true });
      migratedMessages++;
    }
    console.log(`  ✅ Migrated/merged ${migratedMessages} message documents.`);
  } else {
    console.log("  ℹ️ No legacy 'campusmessages' collection found to migrate.");
  }

  // --- Step 3: Backfill and synchronize existing conversations ---
  console.log("\n--- 3. Backfilling & Synchronizing Canonical 'conversations' Collection ---");
  const convColl = db.collection("conversations");
  const allConversations = await convColl.find({}).toArray();
  let backfilledCount = 0;

  for (const conv of allConversations) {
    let needsUpdate = false;
    const updateFields: Record<string, any> = {};

    // Check participantIds
    let pIds: string[] = Array.isArray(conv.participantIds) ? conv.participantIds : [];
    if (pIds.length === 0 && Array.isArray(conv.participants)) {
      pIds = conv.participants.map(extractParticipantId).filter(Boolean);
      updateFields.participantIds = pIds;
      needsUpdate = true;
    }

    // Check participants (ObjectIds)
    let pObjects: any[] = Array.isArray(conv.participants) ? conv.participants : [];
    if (pObjects.length === 0 && pIds.length > 0) {
      pObjects = pIds
        .filter((id) => mongoose.Types.ObjectId.isValid(id))
        .map((id) => new mongoose.Types.ObjectId(id));
      updateFields.participants = pObjects;
      needsUpdate = true;
    }

    // Check status
    if (!conv.status) {
      updateFields.status = "active";
      needsUpdate = true;
    }

    if (needsUpdate) {
      await convColl.updateOne({ _id: conv._id }, { $set: updateFields });
      backfilledCount++;
    }
  }
  console.log(`  ✅ Backfilled/synchronized ${backfilledCount} conversation documents.`);

  // --- Step 4: Automated Drift Check ---
  console.log("\n--- 4. Running Automated Participant Drift Check ---");
  const verifiedConversations = await convColl.find({}).toArray();
  let driftCount = 0;

  for (const conv of verifiedConversations) {
    const pCount = Array.isArray(conv.participants) ? conv.participants.length : 0;
    const pidCount = Array.isArray(conv.participantIds) ? conv.participantIds.length : 0;

    if (pCount !== pidCount) {
      console.error(
        `  ❌ DRIFT DETECTED on Conv ${conv._id}: participants count (${pCount}) !== participantIds count (${pidCount})`
      );
      driftCount++;
      continue;
    }

    // Verify all participant string IDs match
    const pIdStrings = (conv.participants || []).map(extractParticipantId);
    for (const pid of conv.participantIds || []) {
      if (!pIdStrings.includes(pid)) {
        console.error(`  ❌ DRIFT DETECTED on Conv ${conv._id}: ID ${pid} missing in participants array`);
        driftCount++;
      }
    }
  }

  if (driftCount > 0) {
    throw new Error(`Migration Failed: Found ${driftCount} conversations with participant drift.`);
  }

  console.log(
    `  ✅ DRIFT CHECK PASSED: All ${verifiedConversations.length} conversations have perfectly synchronized participants and participantIds (0 drift).`
  );

  return {
    migratedConversations,
    migratedMessages,
    backfilledCount,
    totalVerified: verifiedConversations.length,
    driftCount,
  };
}

if (process.argv[1]?.includes("migrate-conversations-phase3")) {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("❌ MONGODB_URI required");
    process.exit(1);
  }
  mongoose
    .connect(uri)
    .then(() => runConversationMigration())
    .then(() => {
      console.log("\n✅ Migration completed successfully.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("\n❌ Migration failed:", err);
      process.exit(1);
    });
}
