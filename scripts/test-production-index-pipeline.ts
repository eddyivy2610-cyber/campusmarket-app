import { MongoMemoryReplSet } from "mongodb-memory-server";
import mongoose from "mongoose";
import { verifyProductionIndexes } from "./verify-production-indexes";
import { runConversationMigration } from "./migrate-conversations-phase3";

let passed = 0;
let failed = 0;

function assert(condition: boolean, desc: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${desc}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${desc}`);
    failed++;
  }
}

async function run() {
  console.log("==================================================================");
  console.log(" PRODUCTION DEPLOY PIPELINE & INDEX INTEGRITY TEST");
  console.log("==================================================================\n");

  const repl = await MongoMemoryReplSet.create({ replSet: { count: 1, storageEngine: "wiredTiger" } });
  await mongoose.connect(repl.getUri());
  const db = mongoose.connection.db!;

  // 1. Assert pre-check fails loudly on unindexed empty database
  console.log("--- 1. Verification Pre-Check Fails Loudly on Missing Indexes ---");
  let failedAsExpected = false;
  try {
    await verifyProductionIndexes(db);
  } catch {
    failedAsExpected = true;
  }
  assert(failedAsExpected, "Pre-check strictly throws and fails loudly when required indexes are missing");

  // 2. Run the Phase 3 Index Migration runner
  console.log("\n--- 2. Executing Idempotent Index Migration Runner ---");
  // Set env URI so script can run or invoke directly
  process.env.MONGODB_URI = repl.getUri();
  const { execSync } = await import("child_process");
  execSync("npx tsx scripts/run-phase3-indexes.ts", {
    env: { ...process.env, MONGODB_URI: repl.getUri() },
    stdio: "inherit",
  });

  // Ensure unique indexes on users collection for complete verification
  await db.collection("users").createIndex({ email: 1 }, { unique: true });
  await db.collection("users").createIndex({ "profile.handle": 1 }, { unique: true });
  await db.collection("stores").createIndex({ ownerId: 1 }, { unique: true });
  await db.collection("stores").createIndex({ slug: 1 }, { unique: true });

  // 3. Assert post-migration verification succeeds with 100% active indexes
  console.log("\n--- 3. Post-Migration Verification Asserts All Indexes Active ---");
  const report = await verifyProductionIndexes(db);
  assert(report.totalMissing === 0, "Zero missing indexes after migration");
  assert(report.totalChecked >= 20, `Verified all ${report.totalChecked} production indexes active`);

  // 4. Assert conversation & message data migration passes drift check
  console.log("\n--- 4. Conversation Data Migration & Zero-Drift Verification ---");
  const convReport = await runConversationMigration(db);
  assert(convReport.driftCount === 0, "Zero participant drift verified");

  console.log("\n==================================================================");
  console.log(` ALL DEPLOY PIPELINE TESTS COMPLETE: ${passed} PASSED | ${failed} FAILED`);
  console.log("==================================================================");

  await mongoose.disconnect();
  await repl.stop();
  if (failed > 0) process.exit(1);
  process.exit(0);
}

run().catch((err) => {
  console.error("Pipeline test failed:", err);
  process.exit(1);
});
