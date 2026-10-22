import mongoose, { ClientSession } from "mongoose";
import ReviewModel from "@/models/Review";
import UserModel from "@/models/User";
import StoreModel from "@/models/Store";

export interface RatingStats {
  average: number;
  count: number;
}

function toMatchFilter(id: string) {
  if (mongoose.isValidObjectId(id)) {
    return { $in: [id, new mongoose.Types.ObjectId(id)] };
  }
  return id;
}

/**
 * Recomputes seller's rating average and count strictly from published reviews.
 * Updates UserModel atomically with $set.
 */
export async function recomputeSellerRating(
  sellerId: string,
  session?: ClientSession
): Promise<RatingStats> {
  const sellerMatch = toMatchFilter(sellerId);

  const stats = await ReviewModel.aggregate(
    [
      { $match: { sellerId: sellerMatch, status: "published" } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$rating" },
          count: { $sum: 1 },
        },
      },
    ],
    { session }
  );

  const rawAvg = stats[0]?.avgRating ?? 0;
  const count = stats[0]?.count ?? 0;
  const average = count > 0 ? Math.round(rawAvg * 10) / 10 : 0;

  const updateQuery = UserModel.updateOne(
    { _id: sellerId },
    { $set: { "rating.average": average, "rating.count": count } }
  );

  if (session) {
    updateQuery.session(session);
  }

  await updateQuery;

  return { average, count };
}

/**
 * Recomputes store's metrics.rating and metrics.reviewsCount strictly from published reviews.
 * Updates StoreModel atomically with $set.
 */
export async function recomputeStoreRating(
  storeId: string,
  session?: ClientSession
): Promise<RatingStats> {
  const storeMatch = toMatchFilter(storeId);

  const stats = await ReviewModel.aggregate(
    [
      { $match: { storeId: storeMatch, status: "published" } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$rating" },
          count: { $sum: 1 },
        },
      },
    ],
    { session }
  );

  const rawAvg = stats[0]?.avgRating ?? 0;
  const count = stats[0]?.count ?? 0;
  const average = count > 0 ? Math.round(rawAvg * 10) / 10 : 0;

  const updateQuery = StoreModel.updateOne(
    { _id: storeId },
    {
      $set: {
        "metrics.rating": average,
        "metrics.reviewsCount": count,
      },
    }
  );

  if (session) {
    updateQuery.session(session);
  }

  await updateQuery;

  return { average, count };
}

/**
 * Verifies and detects any drift between stored counters and live published reviews.
 */
export async function checkReviewAggregateDrift(): Promise<{
  clean: boolean;
  userMismatches: Array<{ id: string; stored: any; computed: any }>;
  storeMismatches: Array<{ id: string; stored: any; computed: any }>;
}> {
  const userMismatches: Array<{ id: string; stored: any; computed: any }> = [];
  const storeMismatches: Array<{ id: string; stored: any; computed: any }> = [];

  // Group all published reviews by sellerId
  const userStats = await ReviewModel.aggregate([
    { $match: { status: "published" } },
    {
      $group: {
        _id: "$sellerId",
        avg: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);

  for (const stat of userStats) {
    const sellerId = stat._id.toString();
    const user = await UserModel.findById(sellerId).select("rating").lean();
    if (user) {
      const computedAvg = Math.round(stat.avg * 10) / 10;
      const storedAvg = user.rating?.average ?? 0;
      const storedCount = user.rating?.count ?? 0;

      if (storedAvg !== computedAvg || storedCount !== stat.count) {
        userMismatches.push({
          id: sellerId,
          stored: { average: storedAvg, count: storedCount },
          computed: { average: computedAvg, count: stat.count },
        });
      }
    }
  }

  // Check users with stored rating.count > 0 but 0 published reviews
  const visitedUserIds = userStats.map((s) => s._id.toString());
  const danglingUsers = await UserModel.find({
    "rating.count": { $gt: 0 },
    _id: { $nin: visitedUserIds },
  })
    .select("rating")
    .lean();

  for (const u of danglingUsers) {
    userMismatches.push({
      id: (u as any)._id.toString(),
      stored: { average: (u as any).rating?.average ?? 0, count: (u as any).rating?.count ?? 0 },
      computed: { average: 0, count: 0 },
    });
  }

  // Group all published reviews by storeId
  const storeStats = await ReviewModel.aggregate([
    { $match: { status: "published", storeId: { $exists: true, $ne: null } } },
    {
      $group: {
        _id: "$storeId",
        avg: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);

  for (const stat of storeStats) {
    const storeId = stat._id.toString();
    const store = await StoreModel.findById(storeId).select("metrics").lean();
    if (store) {
      const computedAvg = Math.round(stat.avg * 10) / 10;
      const storedAvg = store.metrics?.rating ?? 0;
      const storedCount = store.metrics?.reviewsCount ?? 0;

      if (storedAvg !== computedAvg || storedCount !== stat.count) {
        storeMismatches.push({
          id: storeId,
          stored: { rating: storedAvg, reviewsCount: storedCount },
          computed: { rating: computedAvg, reviewsCount: stat.count },
        });
      }
    }
  }

  // Check stores with stored metrics.reviewsCount > 0 but 0 published reviews
  const visitedStoreIds = storeStats.map((s) => s._id.toString());
  const danglingStores = await StoreModel.find({
    "metrics.reviewsCount": { $gt: 0 },
    _id: { $nin: visitedStoreIds },
  })
    .select("metrics")
    .lean();

  for (const st of danglingStores) {
    storeMismatches.push({
      id: (st as any)._id.toString(),
      stored: { rating: (st as any).metrics?.rating ?? 0, reviewsCount: (st as any).metrics?.reviewsCount ?? 0 },
      computed: { rating: 0, reviewsCount: 0 },
    });
  }

  return {
    clean: userMismatches.length === 0 && storeMismatches.length === 0,
    userMismatches,
    storeMismatches,
  };
}

/**
 * Repairs detected review aggregate drift by executing recompute operations
 * for all affected seller and store records.
 */
export async function repairReviewAggregateDrift(): Promise<{
  repairedUsers: number;
  repairedStores: number;
  cleanAfterRepair: boolean;
}> {
  const drift = await checkReviewAggregateDrift();
  let repairedUsers = 0;
  let repairedStores = 0;

  for (const u of drift.userMismatches) {
    await recomputeSellerRating(u.id);
    repairedUsers++;
  }

  for (const s of drift.storeMismatches) {
    await recomputeStoreRating(s.id);
    repairedStores++;
  }

  const postCheck = await checkReviewAggregateDrift();
  return {
    repairedUsers,
    repairedStores,
    cleanAfterRepair: postCheck.clean,
  };
}
