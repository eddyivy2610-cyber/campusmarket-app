/**
 * CLI Migration Runner for Phase 2: Data Integrity & Schema Backfills
 */

import mongoose from "mongoose";
import { runPhase2Backfill } from "../app/lib/migrations/phase2Backfill";

async function main() {
  console.log("==================================================================");
  console.log(" PHASE 2: RUNNING DATA INTEGRITY & SCHEMA BACKFILLS");
  console.log("==================================================================\n");

  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/campushive";
  console.log(`[Database] Connecting to: ${uri.replace(/\/\/.*@/, "//***:***@")}`);

  await mongoose.connect(uri);

  try {
    const summary = await runPhase2Backfill(mongoose.connection);
    console.log("\n[Migration Completed Successfully]");
    console.log("------------------------------------------------------------------");
    console.log(` • User.name backfilled from profile/fullName : ${summary.usersNameBackfilled}`);
    console.log(` • User.accountStatus defaulted to 'active'    : ${summary.usersAccountStatusSet}`);
    console.log(` • Legacy listings listingType defaulted       : ${summary.listingsTypeDefaulted}`);
    console.log(` • Legacy product listings condition defaulted : ${summary.listingsConditionDefaulted}`);
    console.log(` • Legacy listing status values migrated       : ${summary.legacyStatusMigrated}`);
    console.log(` • Legacy listing conditions migrated          : ${summary.legacyConditionsMigrated}`);
    console.log(` • Unique partial indexes recreated            : ${summary.indexesRecreated}`);
    console.log(` • Legacy admins merged into users collection  : ${summary.adminsMerged}`);
    console.log(` • Legacy admins collection dropped            : ${summary.adminsCollectionDropped ? "YES" : "N/A (already dropped)"}`);
    console.log(` • Documents schemaVersion backfilled          : ${summary.schemaVersionBackfilled}`);
    console.log("==================================================================\n");
  } finally {
    await mongoose.disconnect();
  }
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Migration failed:", err);
      process.exit(1);
    });
}
