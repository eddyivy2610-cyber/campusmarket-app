/**
 * scripts/migrate-legacy-reviews.ts
 *
 * Idempotent migration script that normalizes legacy Express reviews into the
 * canonical Review schema, dedupes on (reviewerId, orderId), skips unmappable
 * records, and recomputes seller and store rating aggregates.
 *
 * Usage:
 *   npx tsx scripts/migrate-legacy-reviews.ts --dry-run
 *   npx tsx scripts/migrate-legacy-reviews.ts --apply
 */

import mongoose from "mongoose";
import dbConnect from "../app/lib/dbConnect";
import ReviewModel from "../app/models/Review";
import UserModel from "../app/models/User";
import StoreModel from "../app/models/Store";
import {
  recomputeSellerRating,
  recomputeStoreRating,
  checkReviewAggregateDrift,
} from "../app/lib/reviewService";

export interface MigrationSummary {
  totalRead: number;
  migrated: number;
  skipped: number;
  duplicates: number;
  unchanged: number;
  sellersUpdated: number;
  storesUpdated: number;
  driftClean: boolean;
}

export async function runReviewMigration(options: { dryRun?: boolean } = {}): Promise<MigrationSummary> {
  const isDryRun = options.dryRun ?? true;
  console.log(`\n======================================================`);
  console.log(`  REVIEWS MIGRATION (${isDryRun ? "DRY-RUN MODE" : "APPLY MODE"})`);
  console.log(`======================================================\n`);

  await dbConnect();
  const rawReviewsColl = mongoose.connection.collection("reviews");

  const cursor = rawReviewsColl.find({});
  let totalRead = 0;
  let migrated = 0;
  let skipped = 0;
  let duplicates = 0;
  let unchanged = 0;

  const affectedSellers = new Set<string>();
  const affectedStores = new Set<string>();
  const seenPairs = new Set<string>();

  while (await cursor.hasNext()) {
    const doc = await cursor.next();
    if (!doc) break;
    totalRead++;

    // Validate minimum required fields
    if (!doc.sellerId || !doc.reviewerId || !doc.rating || !doc.comment) {
      console.warn(`[SKIP] Missing core fields on review ${doc._id}`);
      skipped++;
      continue;
    }

    const sellerIdStr = doc.sellerId.toString();
    const reviewerIdStr = doc.reviewerId.toString();
    // Detect unsets for null, empty or malformed optional reference fields
    const unsets: Record<string, string> = {};
    const isValidOrderId =
      doc.orderId &&
      (mongoose.isValidObjectId(doc.orderId) ||
        (typeof doc.orderId === "string" && doc.orderId.trim() !== ""));
    const orderIdStr = isValidOrderId ? doc.orderId.toString().trim() : null;
    if (doc.orderId !== undefined && !isValidOrderId) {
      unsets.orderId = "";
    }

    const isValidDealId =
      doc.dealId && typeof doc.dealId === "string" && doc.dealId.trim() !== "";
    const dealIdStr = isValidDealId ? doc.dealId.trim() : null;
    if (doc.dealId !== undefined && !isValidDealId) {
      unsets.dealId = "";
    }

    if (doc.conversationId !== undefined && (!doc.conversationId || typeof doc.conversationId !== "string" || doc.conversationId.trim() === "")) {
      unsets.conversationId = "";
    }
    if (doc.storeId !== undefined && (!doc.storeId || (!mongoose.isValidObjectId(doc.storeId) && typeof doc.storeId !== "string") || doc.storeId === "")) {
      unsets.storeId = "";
    }
    if (doc.listingId !== undefined && (!doc.listingId || (!mongoose.isValidObjectId(doc.listingId) && typeof doc.listingId !== "string") || doc.listingId === "")) {
      unsets.listingId = "";
    }

    // Check for duplicate transaction review
    const pairKey = orderIdStr
      ? `${reviewerIdStr}___order___${orderIdStr}`
      : dealIdStr
      ? `${reviewerIdStr}___deal___${dealIdStr}`
      : null;

    if (pairKey) {
      if (seenPairs.has(pairKey)) {
        console.warn(`[DUPLICATE] Dropping redundant review ${doc._id} for transaction`);
        duplicates++;
        if (!isDryRun) {
          await rawReviewsColl.deleteOne({ _id: doc._id });
        }
        continue;
      }
      seenPairs.add(pairKey);
    }

    // Check if review already conforms to schemaVersion 1
    const hasUnsets = Object.keys(unsets).length > 0;
    const isCanonical =
      !hasUnsets &&
      doc.schemaVersion === 1 &&
      ["published", "hidden", "flagged"].includes(doc.status) &&
      Number.isInteger(doc.rating) &&
      doc.rating >= 1 &&
      doc.rating <= 5;

    if (isCanonical) {
      unchanged++;
      affectedSellers.add(sellerIdStr);
      if (doc.storeId) affectedStores.add(doc.storeId.toString());
      continue;
    }

    // Normalize document
    const normalizedRating = Math.min(Math.max(Math.round(Number(doc.rating) || 5), 1), 5);
    const normalizedStatus = ["published", "hidden", "flagged"].includes(doc.status)
      ? doc.status
      : "published";

    if (!isDryRun) {
      const updateOp: any = {
        $set: {
          rating: normalizedRating,
          status: normalizedStatus,
          schemaVersion: 1,
          updatedAt: new Date(),
        },
      };
      if (hasUnsets) {
        updateOp.$unset = unsets;
      }
      await rawReviewsColl.updateOne({ _id: doc._id }, updateOp);
    }

    migrated++;
    affectedSellers.add(sellerIdStr);
    if (doc.storeId) affectedStores.add(doc.storeId.toString());
  }

  // Recompute aggregates for affected entities
  let sellersUpdated = 0;
  let storesUpdated = 0;

  if (!isDryRun) {
    for (const sId of affectedSellers) {
      await recomputeSellerRating(sId);
      sellersUpdated++;
    }

    for (const stId of affectedStores) {
      await recomputeStoreRating(stId);
      storesUpdated++;
    }
  }

  // Ensure database indexes exist in the actual MongoDB collection
  if (!isDryRun) {
    console.log("Synchronizing canonical ReviewModel indexes on live database...");
    await ReviewModel.syncIndexes();
    console.log("Indexes synchronized successfully.");
  }

  // Drift check
  const driftResult = await checkReviewAggregateDrift();

  const summary: MigrationSummary = {
    totalRead,
    migrated,
    skipped,
    duplicates,
    unchanged,
    sellersUpdated,
    storesUpdated,
    driftClean: driftResult.clean,
  };

  console.log(`\nMigration Summary:`);
  console.log(`  - Total Read:    ${totalRead}`);
  console.log(`  - Migrated:      ${migrated}`);
  console.log(`  - Unchanged:     ${unchanged}`);
  console.log(`  - Skipped:       ${skipped}`);
  console.log(`  - Duplicates:    ${duplicates}`);
  console.log(`  - Sellers Recomputed: ${sellersUpdated}`);
  console.log(`  - Stores Recomputed:  ${storesUpdated}`);
  console.log(`  - Aggregate Drift:    ${driftResult.clean ? "CLEAN (0 mismatches)" : "DRIFT DETECTED"}`);

  return summary;
}

if (process.argv[1]?.includes("migrate-legacy-reviews")) {
  const isApply = process.argv.includes("--apply");
  runReviewMigration({ dryRun: !isApply })
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Migration failed:", err);
      process.exit(1);
    });
}
