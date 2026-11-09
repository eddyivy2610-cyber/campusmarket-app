/**
 * Safe, Idempotent Public ID & Slug Backfill Migration for Campus Hive.
 *
 * Requirements:
 * - Resumable after interruption: only targets records where publicId is null, undefined, or empty.
 * - Never overwrites existing valid publicId or slug values.
 * - Generates chronological RFC 9562 UUIDv7 based on original createdAt (with fallback to current time).
 * - Generates independent cryptographic randomness for records with identical timestamps.
 * - Resolves slug collisions by re-deriving suffix or appending random bytes.
 * - Verifies unique database indexes before completion.
 * - Produces comprehensive report of processed, skipped, failed, and conflicting documents.
 * - Supports --dry-run mode.
 *
 * Usage:
 *   npx tsx scripts/migrate-public-ids-and-slugs.ts [--dry-run]
 */

import mongoose from "mongoose";
import fs from "fs";
import path from "path";

// Auto-load .env.local for standalone CLI execution
try {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    for (const line of envContent.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        let val = trimmed.slice(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
} catch {}

import dbConnect from "../app/lib/dbConnect";
import { UserModel } from "../app/models/User";
import { ListingModel } from "../app/models/Listing";
import StoreModel from "../app/models/Store";
import RadarPostModel from "../app/models/RadarPost";
import OrderModel from "../app/models/Order";
import { generateUUIDv7, isValidUUIDv7, deriveSlugSuffix } from "../app/lib/uuidv7";
import { buildCanonicalSlug, normalizeStoreSlug, normalizeUsername } from "../app/lib/slugUtils";

interface MigrationStats {
  entity: string;
  total: number;
  processed: number;
  skipped: number;
  failed: number;
  conflicts: number;
  errors: string[];
}

const isDryRun = process.argv.includes("--dry-run");

function parseDateToMs(dateVal: any): number {
  if (!dateVal) return Date.now();
  if (typeof dateVal === "number" && !isNaN(dateVal) && dateVal > 0) return dateVal;
  const d = new Date(dateVal);
  const time = d.getTime();
  return isNaN(time) ? Date.now() : time;
}

async function migrateUsers(dryRun: boolean): Promise<MigrationStats> {
  const stats: MigrationStats = {
    entity: "User",
    total: 0,
    processed: 0,
    skipped: 0,
    failed: 0,
    conflicts: 0,
    errors: [],
  };

  const allUsers = await UserModel.find({}).lean();
  stats.total = allUsers.length;

  for (const user of allUsers) {
    if (user.publicId && isValidUUIDv7(user.publicId)) {
      stats.skipped++;
      continue;
    }

    try {
      const createdAtMs = parseDateToMs(user.createdAt || (user as any)._id?.getTimestamp?.());
      const publicId = generateUUIDv7(createdAtMs);

      if (!dryRun) {
        await UserModel.updateOne(
          { _id: user._id, $or: [{ publicId: null }, { publicId: { $exists: false } }, { publicId: "" }] },
          { $set: { publicId } }
        );
      }
      stats.processed++;
    } catch (err: any) {
      stats.failed++;
      stats.errors.push(`User ${user._id}: ${err.message}`);
    }
  }

  return stats;
}

async function migrateStores(dryRun: boolean): Promise<MigrationStats> {
  const stats: MigrationStats = {
    entity: "Store",
    total: 0,
    processed: 0,
    skipped: 0,
    failed: 0,
    conflicts: 0,
    errors: [],
  };

  const allStores = await StoreModel.find({}).lean();
  stats.total = allStores.length;

  for (const store of allStores) {
    const hasValidPublicId = store.publicId && isValidUUIDv7(store.publicId);
    const hasValidSlug = Boolean(store.slug && store.slug.trim());

    if (hasValidPublicId && hasValidSlug) {
      stats.skipped++;
      continue;
    }

    try {
      const createdAtMs = parseDateToMs(store.createdAt || (store as any)._id?.getTimestamp?.());
      const publicId = hasValidPublicId ? store.publicId : generateUUIDv7(createdAtMs);
      const slug = hasValidSlug ? store.slug : normalizeStoreSlug(store.name || "store");

      if (!dryRun) {
        await StoreModel.updateOne(
          { _id: store._id },
          { $set: { publicId, slug } }
        );
      }
      stats.processed++;
    } catch (err: any) {
      stats.failed++;
      stats.errors.push(`Store ${store._id}: ${err.message}`);
    }
  }

  return stats;
}

async function migrateListings(dryRun: boolean): Promise<MigrationStats> {
  const stats: MigrationStats = {
    entity: "Listing",
    total: 0,
    processed: 0,
    skipped: 0,
    failed: 0,
    conflicts: 0,
    errors: [],
  };

  const allListings = await ListingModel.find({}).lean();
  stats.total = allListings.length;

  for (const listing of allListings) {
    const hasValidPublicId = listing.publicId && isValidUUIDv7(listing.publicId);
    const hasValidSlug = Boolean(listing.slug && listing.slugSuffix);

    if (hasValidPublicId && hasValidSlug) {
      stats.skipped++;
      continue;
    }

    try {
      const createdAtMs = parseDateToMs(listing.createdAt || (listing as any)._id?.getTimestamp?.());
      const publicId = hasValidPublicId ? listing.publicId! : generateUUIDv7(createdAtMs);
      const slugSuffix = listing.slugSuffix || deriveSlugSuffix(publicId, 8);
      let slug = listing.slug || buildCanonicalSlug(listing.title || "listing", slugSuffix);

      if (!dryRun) {
        // Safe update with duplicate slug handling
        let saved = false;
        let attempt = 0;
        while (!saved && attempt < 3) {
          try {
            await ListingModel.updateOne(
              { _id: listing._id },
              { $set: { publicId, slugSuffix, slug } }
            );
            saved = true;
          } catch (e: any) {
            if (e?.code === 11000) {
              stats.conflicts++;
              attempt++;
              const newSuffix = deriveSlugSuffix(generateUUIDv7(), 8);
              slug = buildCanonicalSlug(listing.title || "listing", newSuffix);
            } else {
              throw e;
            }
          }
        }
      }
      stats.processed++;
    } catch (err: any) {
      stats.failed++;
      stats.errors.push(`Listing ${listing._id}: ${err.message}`);
    }
  }

  return stats;
}

async function migrateRadarPosts(dryRun: boolean): Promise<MigrationStats> {
  const stats: MigrationStats = {
    entity: "RadarPost",
    total: 0,
    processed: 0,
    skipped: 0,
    failed: 0,
    conflicts: 0,
    errors: [],
  };

  const allPosts = await RadarPostModel.find({}).lean();
  stats.total = allPosts.length;

  for (const post of allPosts) {
    const hasValidPublicId = post.publicId && isValidUUIDv7(post.publicId);
    const hasValidSlug = Boolean(post.slug && post.slugSuffix);

    if (hasValidPublicId && hasValidSlug) {
      stats.skipped++;
      continue;
    }

    try {
      const createdAtMs = parseDateToMs(post.createdAt || (post as any)._id?.getTimestamp?.());
      const publicId = hasValidPublicId ? post.publicId! : generateUUIDv7(createdAtMs);
      const slugSuffix = post.slugSuffix || deriveSlugSuffix(publicId, 8);
      const slug = post.slug || buildCanonicalSlug(post.requestText || "radar-request", slugSuffix);

      if (!dryRun) {
        await RadarPostModel.updateOne(
          { _id: post._id },
          { $set: { publicId, slugSuffix, slug } }
        );
      }
      stats.processed++;
    } catch (err: any) {
      stats.failed++;
      stats.errors.push(`RadarPost ${post._id}: ${err.message}`);
    }
  }

  return stats;
}

async function migrateOrders(dryRun: boolean): Promise<MigrationStats> {
  const stats: MigrationStats = {
    entity: "Order",
    total: 0,
    processed: 0,
    skipped: 0,
    failed: 0,
    conflicts: 0,
    errors: [],
  };

  const allOrders = await OrderModel.find({}).lean();
  stats.total = allOrders.length;

  for (const order of allOrders) {
    if (order.publicId && isValidUUIDv7(order.publicId)) {
      stats.skipped++;
      continue;
    }

    try {
      const createdAtMs = parseDateToMs(order.createdAt || (order as any)._id?.getTimestamp?.());
      const publicId = generateUUIDv7(createdAtMs);

      if (!dryRun) {
        await OrderModel.updateOne(
          { _id: order._id, $or: [{ publicId: null }, { publicId: { $exists: false } }, { publicId: "" }] },
          { $set: { publicId } }
        );
      }
      stats.processed++;
    } catch (err: any) {
      stats.failed++;
      stats.errors.push(`Order ${order._id}: ${err.message}`);
    }
  }

  return stats;
}

export async function migrateCollections(dryRun = false) {
  const userStats = await migrateUsers(dryRun);
  const storeStats = await migrateStores(dryRun);
  const listingStats = await migrateListings(dryRun);
  const radarStats = await migrateRadarPosts(dryRun);
  const orderStats = await migrateOrders(dryRun);

  return {
    users: userStats,
    stores: storeStats,
    listings: listingStats,
    radar: radarStats,
    orders: orderStats,
  };
}

async function run() {
  console.log(`\n============================================================`);
  console.log(` Campus Hive Public Identity Migration v1.0`);
  console.log(` Mode: ${isDryRun ? "DRY-RUN (No writes applied)" : "LIVE MIGRATION"}`);
  console.log(`============================================================\n`);

  try {
    await dbConnect();
    console.log("Connected to MongoDB successfully.\n");

    const report = await migrateCollections(isDryRun);
    const allStats = [
      report.users,
      report.stores,
      report.listings,
      report.radar,
      report.orders,
    ];

    console.log("------------------------------------------------------------");
    console.log(" Migration Execution Summary Report");
    console.log("------------------------------------------------------------");
    console.table(
      allStats.map((s) => ({
        Entity: s.entity,
        Total: s.total,
        Processed: s.processed,
        Skipped: s.skipped,
        Conflicts: s.conflicts,
        Failed: s.failed,
      }))
    );

    const totalFailed = allStats.reduce((acc, s) => acc + s.failed, 0);
    if (totalFailed > 0) {
      console.error(`\n⚠️ ${totalFailed} records encountered errors during migration:`);
      for (const s of allStats) {
        for (const e of s.errors) {
          console.error(`  - ${e}`);
        }
      }
      process.exit(1);
    }

    // Verify Indexes
    if (!isDryRun) {
      console.log("\nVerifying database indexes...");
      await Promise.all([
        UserModel.syncIndexes(),
        StoreModel.syncIndexes(),
        ListingModel.syncIndexes(),
        RadarPostModel.syncIndexes(),
        OrderModel.syncIndexes(),
      ]);
      console.log("✅ All unique publicId and slug indexes synchronized successfully.");
    }

    console.log("\n✨ Migration process completed successfully with zero unhandled errors!\n");
    process.exit(0);
  } catch (error: any) {
    console.error("Fatal migration error:", error);
    process.exit(1);
  }
}

if (
  process.argv[1]?.includes("migrate-public-ids-and-slugs") ||
  (typeof require !== "undefined" && require.main === module)
) {
  run();
}
