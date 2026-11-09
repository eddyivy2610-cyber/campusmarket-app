/**
 * Idempotent Data Migration: Multi-Store Accounts, Private User Profiles, Store-Owned Listings
 *
 * Modes:
 *   npx tsx scripts/migrate-multi-store-privacy.ts --dry-run   (default: read-only report)
 *   npx tsx scripts/migrate-multi-store-privacy.ts --apply     (executes idempotent updates)
 */

import mongoose from "mongoose";
import UserModel from "../app/models/User";
import { StoreModel, checkStoresCountDrift, syncStoreListingCount } from "../app/models/Store";
import { ListingModel } from "../app/models/Listing";
import { ReviewModel } from "../app/models/ChatModels";
import { OrderModel } from "../app/models/Order";
import { FollowerModel } from "../app/models/Follower";

export interface MigrationReport {
  dryRun: boolean;
  storesSlugLowerBackfilled: number;
  usersCountersSynced: number;
  orphanListingsAttachedToOwnerStore: number;
  orphanListingsPausedNoOwnerStore: number;
  deletedStoreListingsRemoved: number;
  reviewsStoreIdBackfilled: number;
  ordersStoreIdBackfilled: number;
  storesMetricsRecomputed: number;
  postMigrationDriftCount: number;
}

export async function runMultiStorePrivacyMigration(options: {
  dryRun?: boolean;
} = {}): Promise<MigrationReport> {
  const dryRun = options.dryRun ?? true;

  const report: MigrationReport = {
    dryRun,
    storesSlugLowerBackfilled: 0,
    usersCountersSynced: 0,
    orphanListingsAttachedToOwnerStore: 0,
    orphanListingsPausedNoOwnerStore: 0,
    deletedStoreListingsRemoved: 0,
    reviewsStoreIdBackfilled: 0,
    ordersStoreIdBackfilled: 0,
    storesMetricsRecomputed: 0,
    postMigrationDriftCount: 0,
  };

  // 1. Backfill stores.slugLower & showOwnerName
  const allStores = await StoreModel.find({}).lean();
  const storeMap = new Map<string, any>();
  const ownerStoresMap = new Map<string, any[]>();

  for (const st of allStores) {
    const sid = st._id.toString();
    storeMap.set(sid, st);
    if (st.status !== "deleted") {
      const list = ownerStoresMap.get(st.ownerId) || [];
      list.push(st);
      ownerStoresMap.set(st.ownerId, list);
    }

    const expectedSlugLower = String(st.slug || "").trim().toLowerCase();
    const needsSlugLower = st.slugLower !== expectedSlugLower;
    const needsShowOwner = typeof st.showOwnerName !== "boolean";

    if (needsSlugLower || needsShowOwner) {
      report.storesSlugLowerBackfilled++;
      if (!dryRun) {
        await StoreModel.updateOne(
          { _id: st._id },
          {
            $set: {
              slugLower: expectedSlugLower,
              ...(needsShowOwner ? { showOwnerName: false } : {}),
            },
          }
        );
      }
    }
  }

  // 2. Backfill users.storesCount, users.studentStoresCount, and derived role
  const allUsers = await UserModel.find({}).lean();
  for (const u of allUsers) {
    const uid = u._id.toString();
    const owned = ownerStoresMap.get(uid) || [];
    const liveStoresCount = owned.length;
    const liveStudentCount = owned.filter((s) => s.storeType === "student_store").length;
    const expectedRole =
      u.role === "admin" ? "admin" : liveStoresCount > 0 ? "seller" : "buyer";

    if (
      (u.storesCount ?? 0) !== liveStoresCount ||
      (u.studentStoresCount ?? 0) !== liveStudentCount ||
      u.role !== expectedRole
    ) {
      report.usersCountersSynced++;
      if (!dryRun) {
        await UserModel.updateOne(
          { _id: u._id },
          {
            $set: {
              storesCount: liveStoresCount,
              studentStoresCount: liveStudentCount,
              role: expectedRole,
            },
          }
        );
      }
    }
  }

  // 3. Reconcile listings without a store or referencing a missing/deleted store
  const rawListings = await mongoose.connection.db!
    .collection("listings")
    .find({})
    .toArray();

  for (const l of rawListings) {
    const rawStoreId = l.storeId ? String(l.storeId).trim() : "";
    const sellerId = l.sellerId ? String(l.sellerId).trim() : "";

    if (!rawStoreId) {
      const ownerStores = ownerStoresMap.get(sellerId) || [];
      const primaryStore =
        ownerStores.find((s) => s.status === "active") || ownerStores[0];

      if (primaryStore) {
        report.orphanListingsAttachedToOwnerStore++;
        if (!dryRun) {
          await mongoose.connection.db!.collection("listings").updateOne(
            { _id: l._id },
            {
              $set: {
                storeId: primaryStore._id.toString(),
              },
            }
          );
        }
      } else {
        if (l.status !== "paused" || l.pausedBy !== "system_migration") {
          report.orphanListingsPausedNoOwnerStore++;
          if (!dryRun) {
            await mongoose.connection.db!.collection("listings").updateOne(
              { _id: l._id },
              {
                $set: {
                  status: "paused",
                  pausedBy: "system_migration",
                },
              }
            );
          }
        }
      }
    } else {
      const targetStore = storeMap.get(rawStoreId);
      if (!targetStore || targetStore.status === "deleted") {
        if (l.status !== "removed" || l.removedBy !== "store_deletion") {
          report.deletedStoreListingsRemoved++;
          if (!dryRun) {
            await mongoose.connection.db!.collection("listings").updateOne(
              { _id: l._id },
              {
                $set: {
                  status: "removed",
                  removedBy: "store_deletion",
                },
              }
            );
          }
        }
      }
    }
  }

  // 4. Backfill storeId on reviews
  const reviewsMissingStore = await ReviewModel.find({
    $or: [{ storeId: { $exists: false } }, { storeId: null }],
  }).lean();

  for (const rev of reviewsMissingStore) {
    let resolvedStoreId: string | null = null;
    if (rev.listingId && mongoose.isValidObjectId(rev.listingId)) {
      const listingDoc: any = await ListingModel.findById(rev.listingId)
        .select("storeId")
        .lean();
      if (listingDoc?.storeId) {
        resolvedStoreId = String(listingDoc.storeId);
      }
    }
    if (!resolvedStoreId && rev.sellerId) {
      const ownerStores = ownerStoresMap.get(String(rev.sellerId)) || [];
      if (ownerStores.length > 0) {
        resolvedStoreId = ownerStores[0]._id.toString();
      }
    }
    if (resolvedStoreId) {
      report.reviewsStoreIdBackfilled++;
      if (!dryRun) {
        await ReviewModel.updateOne(
          { _id: rev._id },
          { $set: { storeId: resolvedStoreId } }
        );
      }
    }
  }

  // 5. Backfill storeId on orders
  const ordersMissingStore = await OrderModel.find({
    $or: [{ storeId: { $exists: false } }, { storeId: null }],
  }).lean();

  for (const ord of ordersMissingStore) {
    let resolvedStoreId: string | null = null;
    const firstListingId = ord.items?.[0]?.listingId;
    if (firstListingId && mongoose.isValidObjectId(firstListingId)) {
      const listingDoc: any = await ListingModel.findById(firstListingId)
        .select("storeId")
        .lean();
      if (listingDoc?.storeId) {
        resolvedStoreId = String(listingDoc.storeId);
      }
    }
    if (!resolvedStoreId && ord.sellerId) {
      const ownerStores = ownerStoresMap.get(String(ord.sellerId)) || [];
      if (ownerStores.length > 0) {
        resolvedStoreId = ownerStores[0]._id.toString();
      }
    }
    if (resolvedStoreId) {
      report.ordersStoreIdBackfilled++;
      if (!dryRun) {
        await OrderModel.updateOne(
          { _id: ord._id },
          { $set: { storeId: resolvedStoreId } }
        );
      }
    }
  }

  // 6. Recompute metrics per store (listingsCount, rating, reviewsCount, followersCount)
  for (const st of allStores) {
    if (st.status === "deleted") continue;
    const sid = st._id.toString();

    const activeListingsCount = await ListingModel.countDocuments({
      storeId: sid,
      status: "active",
    });
    const followersCount = await FollowerModel.countDocuments({
      followingId: sid,
      targetType: "store",
    });
    const reviewAgg = await ReviewModel.aggregate([
      { $match: { storeId: sid } },
      {
        $group: {
          _id: "$storeId",
          avgRating: { $avg: "$rating" },
          count: { $sum: 1 },
        },
      },
    ]);
    const reviewsCount = reviewAgg[0]?.count ?? st.metrics?.reviewsCount ?? 0;
    const rating =
      reviewAgg[0]?.count > 0
        ? Math.round(reviewAgg[0].avgRating * 10) / 10
        : st.metrics?.rating ?? 5.0;

    const currentMetrics = st.metrics || {};
    if (
      currentMetrics.listingsCount !== activeListingsCount ||
      currentMetrics.followersCount !== followersCount ||
      currentMetrics.reviewsCount !== reviewsCount ||
      currentMetrics.rating !== rating
    ) {
      report.storesMetricsRecomputed++;
      if (!dryRun) {
        await StoreModel.updateOne(
          { _id: st._id },
          {
            $set: {
              "metrics.listingsCount": activeListingsCount,
              "metrics.followersCount": followersCount,
              "metrics.reviewsCount": reviewsCount,
              "metrics.rating": rating,
            },
          }
        );
      }
    }
  }

  const drift = await checkStoresCountDrift();
  report.postMigrationDriftCount = drift.driftedUsers.length;

  return report;
}

if (process.argv[1]?.includes("migrate-multi-store-privacy")) {
  const applyFlag = process.argv.includes("--apply");
  const dryRun = !applyFlag;
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("❌ MONGODB_URI is required.");
    process.exit(1);
  }
  mongoose
    .connect(uri)
    .then(async () => {
      console.log(
        `Running Multi-Store & Privacy Migration (${dryRun ? "DRY RUN" : "APPLY"})...`
      );
      const res = await runMultiStorePrivacyMigration({ dryRun });
      console.log(JSON.stringify(res, null, 2));
      await mongoose.disconnect();
      process.exit(0);
    })
    .catch((err) => {
      console.error("Migration error:", err);
      process.exit(1);
    });
}
