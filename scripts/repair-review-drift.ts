/**
 * scripts/repair-review-drift.ts
 *
 * Scans MongoDB collections for review aggregate drift across sellers and stores
 * and repairs all out-of-sync counters to match live published reviews.
 *
 * Usage:
 *   npx tsx scripts/repair-review-drift.ts
 */

import mongoose from "mongoose";
import dbConnect from "../app/lib/dbConnect";
import { checkReviewAggregateDrift, repairReviewAggregateDrift } from "../app/lib/reviewService";

async function main() {
  console.log("======================================================");
  console.log("   CAMPUS HIVE: REVIEW AGGREGATE DRIFT REPAIR CLI    ");
  console.log("======================================================\n");

  const conn = await dbConnect();
  if (!conn || mongoose.connection.readyState !== 1) {
    console.error("❌ Failed to connect to MongoDB at " + (process.env.MONGODB_URI || "mongodb://localhost:27017/campushive"));
    console.error("Please provide a valid MONGODB_URI environment variable (e.g. MONGODB_URI=mongodb+srv://... npx tsx scripts/repair-review-drift.ts).");
    process.exit(1);
  }

  console.log("Checking current drift status...");
  const initial = await checkReviewAggregateDrift();

  if (initial.clean) {
    console.log("✅ All seller and store aggregates are perfectly in sync. No repair needed.\n");
    process.exit(0);
  }

  console.log(`⚠️  Drift detected:`);
  console.log(`   - Seller mismatches: ${initial.userMismatches.length}`);
  console.log(`   - Store mismatches:  ${initial.storeMismatches.length}`);

  for (const u of initial.userMismatches) {
    console.log(`     User ${u.id}: Stored=${JSON.stringify(u.stored)} -> Computed=${JSON.stringify(u.computed)}`);
  }
  for (const s of initial.storeMismatches) {
    console.log(`     Store ${s.id}: Stored=${JSON.stringify(s.stored)} -> Computed=${JSON.stringify(s.computed)}`);
  }

  console.log("\nRepairing aggregates...");
  const report = await repairReviewAggregateDrift();

  console.log("\nRepair Results:");
  console.log(`   - Users repaired:  ${report.repairedUsers}`);
  console.log(`   - Stores repaired: ${report.repairedStores}`);
  console.log(`   - Clean after repair: ${report.cleanAfterRepair ? "YES ✅" : "NO ❌"}`);

  if (!report.cleanAfterRepair) {
    console.error("\n❌ Repair was unable to resolve all discrepancies!");
    process.exit(1);
  }

  console.log("\n✅ All aggregate drift has been successfully repaired!\n");
  process.exit(0);
}

main().catch((err) => {
  console.error("Drift repair script failed:", err);
  process.exit(1);
});
