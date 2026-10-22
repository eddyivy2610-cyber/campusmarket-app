/**
 * Phase 3: Production Index Migration Script
 *
 * Idempotent, safe migration script that:
 * 1. Safely drops redundant / unindexed single-field prefixes
 * 2. Creates ESR compound indexes for feed with (createdAt, _id) tie-breakers
 * 3. Creates catalog indexes for unlinked queries and listingType filters
 * 4. Creates unified indexes on shared conversations and messages
 * 5. Builds indexes with background: true for minimal production lock impact
 *
 * Usage:
 *   npx tsx scripts/run-phase3-indexes.ts
 */

import mongoose from "mongoose";

async function runIndexMigration() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("❌ MONGODB_URI environment variable is required.");
    process.exit(1);
  }

  console.log("==================================================================");
  console.log(" PHASE 3: PRODUCTION ESR COMPOUND INDEX MIGRATION");
  console.log("==================================================================\n");

  await mongoose.connect(uri);
  const db = mongoose.connection.db!;

  async function safeDropIndex(collName: string, indexName: string) {
    try {
      const coll = db.collection(collName);
      const indexes = await coll.indexes();
      const exists = indexes.some((idx) => idx.name === indexName);
      if (exists) {
        console.log(`  🗑️  Dropping index '${indexName}' on collection '${collName}'...`);
        await coll.dropIndex(indexName);
        console.log(`  ✅ Dropped index '${indexName}'`);
      }
    } catch (err: any) {
      console.warn(`  ⚠️ Could not drop '${indexName}' on '${collName}': ${err.message}`);
    }
  }

  async function safeCreateIndex(
    collName: string,
    spec: Record<string, any>,
    options: Record<string, any> = {}
  ) {
    try {
      const coll = db.collection(collName);
      console.log(`  ⚡ Ensuring index on '${collName}':`, JSON.stringify(spec));
      const res = await coll.createIndex(spec, { background: true, ...options });
      console.log(`  ✅ Successfully ensured index '${res}' on '${collName}'`);
    } catch (err: any) {
      console.error(`  ❌ Failed to create index on '${collName}':`, err.message);
      throw err;
    }
  }

  // --- 1. LISTINGS COLLECTION ---
  console.log("\n--- 1. Migrating Listings Collection Indexes ---");
  await safeDropIndex("listings", "status_1");
  await safeDropIndex("listings", "campus_1_category_1_listingType_1_status_1");
  await safeDropIndex("listings", "status_1_createdAt_-1");
  await safeDropIndex("listings", "status_1_campus_1_createdAt_-1");
  await safeDropIndex("listings", "status_1_campus_1_category_1_createdAt_-1");

  // Create ESR compound indexes with (createdAt, _id) tie-breaker for deterministic keyset pagination
  await safeCreateIndex(
    "listings",
    { status: 1, createdAt: -1, _id: -1 },
    { name: "status_1_createdAt_-1__id_-1" }
  );
  await safeCreateIndex(
    "listings",
    { status: 1, campus: 1, createdAt: -1, _id: -1 },
    { name: "status_1_campus_1_createdAt_-1__id_-1" }
  );
  await safeCreateIndex(
    "listings",
    { status: 1, campus: 1, category: 1, createdAt: -1, _id: -1 },
    { name: "status_1_campus_1_category_1_createdAt_-1__id_-1" }
  );
  await safeCreateIndex(
    "listings",
    { status: 1, campus: 1, category: 1, listingType: 1, createdAt: -1, _id: -1 },
    { name: "status_1_campus_1_category_1_listingType_1_createdAt_-1__id_-1" }
  );
  await safeCreateIndex(
    "listings",
    { status: 1, listingType: 1, createdAt: -1, _id: -1 },
    { name: "status_1_listingType_1_createdAt_-1__id_-1" }
  );

  // Seller, store catalog, and unlinked picker queries
  await safeCreateIndex(
    "listings",
    { storeId: 1, status: 1, createdAt: -1, _id: -1 },
    { name: "storeId_1_status_1_createdAt_-1__id_-1" }
  );
  await safeCreateIndex(
    "listings",
    { sellerId: 1, status: 1, createdAt: -1, _id: -1 },
    { name: "sellerId_1_status_1_createdAt_-1__id_-1" }
  );
  await safeCreateIndex("listings", { storeId: 1, status: 1 }, { name: "storeId_1_status_1" });
  await safeCreateIndex("listings", { sellerId: 1, status: 1 }, { name: "sellerId_1_status_1" });
  await safeCreateIndex(
    "listings",
    { sellerId: 1, storeId: 1, status: 1 },
    { name: "sellerId_1_storeId_1_status_1" }
  );

  // Status-partitioned full text index
  await safeCreateIndex(
    "listings",
    { status: 1, title: "text", description: "text" },
    { name: "status_1_title_text_description_text" }
  );

  // Unique partial indexes
  await safeCreateIndex(
    "listings",
    { slug: 1 },
    {
      name: "slug_1",
      unique: true,
      partialFilterExpression: { slug: { $type: "string" } },
    }
  );
  await safeCreateIndex(
    "listings",
    { listingCode: 1 },
    {
      name: "listingCode_1",
      unique: true,
      partialFilterExpression: { listingCode: { $type: "string" } },
    }
  );

  // Account uniqueness is required in production because Mongoose autoIndex is disabled there.
  await safeCreateIndex("users", { email: 1 }, { name: "email_1", unique: true });
  await safeCreateIndex(
    "users",
    { "profile.handle": 1 },
    {
      name: "profile.handle_1",
      unique: true,
      partialFilterExpression: { "profile.handle": { $type: "string" } },
    }
  );

  // --- 2. STORES COLLECTION ---
  console.log("\n--- 2. Migrating Stores Collection Indexes ---");
  await safeDropIndex("stores", "status_1");
  await safeDropIndex("stores", "campus_1_status_1_category_1");

  await safeCreateIndex(
    "stores",
    { status: 1, campus: 1, "metrics.rating": -1, createdAt: -1 },
    { name: "status_1_campus_1_metrics.rating_-1_createdAt_-1" }
  );
  await safeCreateIndex(
    "stores",
    { status: 1, "metrics.rating": -1, createdAt: -1 },
    { name: "status_1_metrics.rating_-1_createdAt_-1" }
  );
  await safeCreateIndex(
    "stores",
    { storeType: 1, status: 1 },
    { name: "storeType_1_status_1" }
  );
  await safeCreateIndex("stores", { ownerId: 1 }, { name: "ownerId_1", unique: true });
  await safeCreateIndex("stores", { slug: 1 }, { name: "slug_1", unique: true });

  // --- 3. CONVERSATIONS COLLECTION (Unified across Express & Next.js) ---
  console.log("\n--- 3. Migrating Conversations Collection Indexes ---");
  await safeDropIndex("conversations", "participants_1_status_1_lastMessage.time_-1");
  await safeDropIndex("conversations", "participantIds_1_status_1_updatedAt_-1");

  await safeCreateIndex(
    "conversations",
    { participants: 1, status: 1, "lastMessage.time": -1, _id: -1 },
    { name: "participants_1_status_1_lastMessage.time_-1__id_-1" }
  );
  await safeCreateIndex(
    "conversations",
    { participantIds: 1, status: 1, updatedAt: -1, _id: -1 },
    { name: "participantIds_1_status_1_updatedAt_-1__id_-1" }
  );
  await safeCreateIndex(
    "conversations",
    { participants: 1, listingId: 1 },
    { name: "participants_1_listingId_1" }
  );

  // --- 4. MESSAGES COLLECTION ---
  console.log("\n--- 4. Migrating Messages Collection Indexes ---");
  await safeDropIndex("messages", "conversationId_1_createdAt_1");

  await safeCreateIndex(
    "messages",
    { conversationId: 1, createdAt: 1, _id: 1 },
    { name: "conversationId_1_createdAt_1__id_1" }
  );

  console.log("\n==================================================================");
  console.log(" ✅ ALL PHASE 3 INDEXES APPLIED & SYNCHRONIZED SUCCESSFULLY");
  console.log("==================================================================");

  await mongoose.disconnect();
}

runIndexMigration().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
