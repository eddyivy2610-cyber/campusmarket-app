/**
 * Production Index Verification & Post-Deploy Health Check
 *
 * Verifies that all required Phase 3 compound ESR, partial unique, and text indexes
 * are physically present and active in the database.
 *
 * FAILS LOUDLY (exit code 1) if any expected index is missing, preventing deployments
 * from silently running without indexes when autoIndex is disabled.
 *
 * Usage:
 *   npx tsx scripts/verify-production-indexes.ts
 */

import mongoose from "mongoose";

interface ExpectedIndex {
  name?: string;
  key: Record<string, number | string>;
  unique?: boolean;
  partialFilterExpression?: Record<string, unknown>;
}

const EXPECTED_INDEXES: Record<string, ExpectedIndex[]> = {
  listings: [
    { key: { status: 1, createdAt: -1, _id: -1 } },
    { key: { status: 1, campus: 1, createdAt: -1, _id: -1 } },
    { key: { status: 1, campus: 1, category: 1, createdAt: -1, _id: -1 } },
    { key: { status: 1, campus: 1, category: 1, listingType: 1, createdAt: -1, _id: -1 } },
    { key: { status: 1, listingType: 1, createdAt: -1, _id: -1 } },
    { key: { storeId: 1, status: 1, createdAt: -1, _id: -1 } },
    { key: { sellerId: 1, status: 1, createdAt: -1, _id: -1 } },
    { key: { storeId: 1, status: 1 } },
    { key: { sellerId: 1, status: 1 } },
    { key: { sellerId: 1, storeId: 1, status: 1 } },
    { key: { status: 1, title: "text", description: "text" } },
    {
      key: { slug: 1 },
      unique: true,
      partialFilterExpression: { slug: { $type: "string" } },
    },
    {
      key: { listingCode: 1 },
      unique: true,
      partialFilterExpression: { listingCode: { $type: "string" } },
    },
  ],
  stores: [
    { key: { status: 1, campus: 1, "metrics.rating": -1, createdAt: -1 } },
    { key: { status: 1, "metrics.rating": -1, createdAt: -1 } },
    { key: { storeType: 1, status: 1 } },
    { key: { ownerId: 1 }, unique: true },
    { key: { slug: 1 }, unique: true },
  ],
  conversations: [
    { key: { participants: 1, status: 1, "lastMessage.time": -1, _id: -1 } },
    { key: { participantIds: 1, status: 1, updatedAt: -1, _id: -1 } },
  ],
  messages: [
    { key: { conversationId: 1, createdAt: 1, _id: 1 } },
  ],
  users: [
    { key: { email: 1 }, unique: true },
    {
      key: { "profile.handle": 1 },
      unique: true,
      partialFilterExpression: { "profile.handle": { $type: "string" } },
    },
  ],
};

function keysMatch(a: Record<string, any>, b: Record<string, any>): boolean {
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  return keysA.every((k) => a[k] === b[k]);
}

function valueMatches(actual: unknown, expected: unknown): boolean {
  return JSON.stringify(actual) === JSON.stringify(expected);
}

export async function verifyProductionIndexes(targetDb?: mongoose.mongo.Db) {
  const db = targetDb || mongoose.connection.db;
  if (!db) throw new Error("No database connection available");

  console.log("==================================================================");
  console.log(" PRODUCTION POST-DEPLOY INDEX HEALTH & VERIFICATION GUARD");
  console.log("==================================================================\n");

  let totalChecked = 0;
  let totalMissing = 0;

  for (const [collName, expectedList] of Object.entries(EXPECTED_INDEXES)) {
    console.log(`--- Checking Collection: '${collName}' ---`);
    const coll = db.collection(collName);
    let existingIndexes: any[] = [];
    try {
      existingIndexes = await coll.indexes();
    } catch (err: any) {
      console.error(`  ❌ Could not read indexes for '${collName}': ${err.message}`);
      totalMissing += expectedList.length;
      totalChecked += expectedList.length;
      console.log("");
      continue;
    }

    // Inspect index memory stats if available
    try {
      const stats: any = await db.command({ collStats: collName });
      if (stats.indexSizes) {
        const totalIndexKb = Math.round((stats.totalIndexSize || 0) / 1024);
        console.log(`  📊 Total Index Size: ${totalIndexKb} KB across ${existingIndexes.length} indexes`);
      }
    } catch {
      // stats command may require elevated roles or replica set engine
    }

    for (const exp of expectedList) {
      totalChecked++;
      const found = existingIndexes.find((idx) => {
        if (exp.name && idx.name === exp.name) return true;
        return keysMatch(idx.key, exp.key);
      });

      if (!found) {
        console.error(`  ❌ MISSING INDEX: Collection '${collName}' missing key:`, JSON.stringify(exp.key));
        totalMissing++;
      } else {
        const uniqueMismatch = Boolean(exp.unique) !== Boolean(found.unique);
        const partialMismatch =
          exp.partialFilterExpression !== undefined &&
          !valueMatches(found.partialFilterExpression, exp.partialFilterExpression);

        if (uniqueMismatch) {
          console.error(
            `  ❌ CONSTRAINT MISMATCH: Index '${found.name}' on '${collName}' expected unique=${Boolean(exp.unique)}, found unique=${Boolean(found.unique)}`
          );
          totalMissing++;
        } else if (partialMismatch) {
          console.error(
            `  ❌ FILTER MISMATCH: Index '${found.name}' on '${collName}' expected partialFilterExpression=${JSON.stringify(exp.partialFilterExpression)}, found ${JSON.stringify(found.partialFilterExpression)}`
          );
          totalMissing++;
        } else {
          console.log(`  ✅ ACTIVE: '${found.name}' on '${collName}' (${JSON.stringify(found.key)})`);
        }
      }
    }
    console.log("");
  }

  console.log("==================================================================");
  if (totalMissing > 0) {
    console.error(` ❌ POST-DEPLOY INDEX VERIFICATION FAILED: ${totalMissing} of ${totalChecked} indexes are missing or invalid!`);
    console.error(" No indexes were dropped, rebuilt, or modified by this read-only verification.");
    console.error(" Review the reported discrepancy and apply an approved production migration separately.");
    console.log("==================================================================");
    throw new Error(`Index Verification Failed: ${totalMissing} indexes missing.`);
  }

  console.log(` ✅ ALL ${totalChecked} REQUIRED PRODUCTION INDEXES VERIFIED ACTIVE & HEALTHY`);
  console.log(" ℹ️ Query-plan usage is checked separately; this command only verifies index presence and constraints.");
  console.log("==================================================================");
  return { totalChecked, totalMissing: 0 };
}

if (process.argv[1]?.includes("verify-production-indexes")) {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("❌ MONGODB_URI required");
    process.exit(1);
  }
  mongoose
    .connect(uri)
    .then(() => verifyProductionIndexes())
    .then(() => {
      process.exit(0);
    })
    .catch((err) => {
      console.error("\n❌ Verification check failed:", err.message);
      process.exit(1);
    });
}
