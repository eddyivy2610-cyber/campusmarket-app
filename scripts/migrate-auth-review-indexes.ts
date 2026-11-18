/**
 * Idempotent Index Migration for Auth Refresh Tokens & Reviews
 * Ensures RefreshToken (tokenHash unique, familyId, userId, expiresAt TTL=0),
 * RefreshTokenFamily (familyId unique, userId), and Review (reviewerId_1_orderId_1 unique)
 * indexes exist, then runs verifyProductionIndexes() as a post-deploy check.
 */
import dbConnect from "../app/lib/dbConnect";
import { RefreshToken, RefreshTokenFamily } from "../app/models/RefreshToken";
import ReviewModel from "../app/models/Review";
import { verifyProductionIndexes } from "./verify-production-indexes";

async function main() {
  await dbConnect();
  console.log("[IndexMigration] Syncing RefreshToken, RefreshTokenFamily, and Review indexes...");
  await RefreshToken.syncIndexes();
  await RefreshTokenFamily.syncIndexes();
  await ReviewModel.syncIndexes();
  console.log("[IndexMigration] Index sync complete. Running post-deploy verification...\n");
  await verifyProductionIndexes();
  process.exit(0);
}

main().catch((err) => {
  console.error("[IndexMigration] FAILED:", err);
  process.exit(1);
});
