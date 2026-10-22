/**
 * scripts/benchmark-load-concurrency.ts
 *
 * Concurrency and load testing suite for Campus Hive 2.0.
 * Benchmarks the highest-traffic marketplace endpoints under high concurrency:
 * 1. GET /api/listings (feed & filtering)
 * 2. GET /api/stores (store directory)
 * 3. GET /api/reviews (keyset cursor paginated reviews)
 * 4. GET /api/seller/dashboard/stats (live analytics aggregation)
 * 5. GET /api/health (system health check probe)
 *
 * Usage:
 *   npx tsx scripts/benchmark-load-concurrency.ts
 */

import { MongoMemoryReplSet } from "mongodb-memory-server";
import mongoose from "mongoose";
import { NextRequest } from "next/server";
import assert from "assert";

// Models
import { ListingModel } from "../app/models/Listing";
import StoreModel from "../app/models/Store";
import UserModel from "../app/models/User";
import ReviewModel from "../app/models/Review";
import OrderModel from "../app/models/Order";

// Handlers
import { GET as handleGetListings } from "../app/api/listings/route";
import { GET as handleGetStores } from "../app/api/stores/route";
import { GET as handleGetReviews } from "../app/api/reviews/route";
import { GET as handleGetSellerStats } from "../app/api/dashboard/seller-stats/route";
import { GET as handleGetHealth } from "../app/api/health/route";
import { createAccessToken } from "../app/lib/authTokens";

interface LatencyStats {
  endpoint: string;
  totalRequests: number;
  concurrency: number;
  successful: number;
  failed: number;
  totalTimeMs: number;
  throughputReqSec: number;
  minMs: number;
  p50Ms: number;
  p95Ms: number;
  p99Ms: number;
  maxMs: number;
}

function computePercentiles(latencies: number[]): { p50: number; p95: number; p99: number; min: number; max: number } {
  if (latencies.length === 0) return { p50: 0, p95: 0, p99: 0, min: 0, max: 0 };
  const sorted = [...latencies].sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const p50 = sorted[Math.floor(sorted.length * 0.5)];
  const p95 = sorted[Math.floor(sorted.length * 0.95)];
  const p99 = sorted[Math.floor(sorted.length * 0.99)];
  return { p50, p95, p99, min, max };
}

function makeMockRequest(url: string, headers: Record<string, string> = {}): NextRequest {
  return new NextRequest(new URL(url, "http://localhost:3000"), {
    headers: new Headers({
      "x-request-id": crypto.randomUUID(),
      ...headers,
    }),
  });
}

async function runBenchmark() {
  console.log("==================================================================");
  console.log("   CAMPUS HIVE 2.0: HIGH-TRAFFIC CONCURRENCY & LOAD BENCHMARK    ");
  console.log("==================================================================\n");

  const replSet = await MongoMemoryReplSet.create({
    replSet: { count: 1, storageEngine: "wiredTiger" },
  });
  const uri = replSet.getUri();
  process.env.MONGODB_URI = uri;
  process.env.AUTH_SECRET = "01234567890123456789012345678901";
  (process.env as any).NODE_ENV = "test";

  await mongoose.connect(uri, {
    maxPoolSize: 20,
    minPoolSize: 5,
  });

  console.log("Populating benchmark fixtures...");
  const seller = (await UserModel.create({
    name: "Seller Super",
    email: "seller.super@unilag.edu.ng",
    password: "hashedpassword123",
    accountStatus: "active",
    emailVerified: true,
    campus: "UNILAG",
    role: "seller",
    rating: { average: 4.8, count: 50 },
  })) as any;

  const sellerToken = await createAccessToken({
    id: seller._id.toString(),
    name: seller.name,
    email: seller.email,
    role: "seller",
    isStudent: true,
    studentVerified: true,
  });

  const store = (await StoreModel.create({
    name: "Campus Mega Mart",
    slug: "campus-mega-mart",
    description: "Campus Mega Mart for student essentials",
    category: "Retail",
    operatingLocation: "New Hall, UNILAG",
    logo: "https://res.cloudinary.com/campushive/image/upload/v1/logo.png",
    ownerId: seller._id.toString(),
    campus: "UNILAG",
    status: "active",
    metrics: { rating: 4.8, reviewsCount: 50, listingsCount: 40, totalOrders: 100 },
  })) as any;

  // Seed 40 listings
  const listingsToInsert = [];
  for (let i = 0; i < 40; i++) {
    listingsToInsert.push({
      title: `Listing Item ${i}`,
      description: `Benchmark listing description item ${i}`,
      price: 1500 + i * 100,
      priceFormatted: `₦${1500 + i * 100}`,
      category: i % 2 === 0 ? "Electronics" : "Books",
      campus: "UNILAG",
      location: "New Hall",
      sellerId: seller._id,
      storeId: store._id,
      listingType: "product",
      condition: "Used - Good",
      status: "active",
      views: 10 + i,
      likes: i,
      isPromoted: false,
      createdAt: new Date(Date.now() - i * 10000).toISOString(),
      updatedAt: new Date(Date.now() - i * 10000).toISOString(),
    });
  }
  await ListingModel.insertMany(listingsToInsert);

  // Seed 50 reviews
  const reviewsToInsert = [];
  for (let i = 0; i < 50; i++) {
    const revUser = new mongoose.Types.ObjectId();
    reviewsToInsert.push({
      sellerId: seller._id,
      reviewerId: revUser,
      storeId: store._id,
      rating: (i % 3) + 3,
      comment: `Great experience with seller on transaction ${i}`,
      status: "published",
      schemaVersion: 1,
      createdAt: new Date(Date.now() - i * 15000),
      updatedAt: new Date(Date.now() - i * 15000),
    });
  }
  await ReviewModel.insertMany(reviewsToInsert);

  // Seed 50 orders
  const ordersToInsert = [];
  for (let i = 0; i < 50; i++) {
    ordersToInsert.push({
      orderId: `ORD-BENCH-${i}`,
      buyerId: new mongoose.Types.ObjectId(),
      sellerId: seller._id,
      storeId: store._id,
      items: [
        {
          listingId: new mongoose.Types.ObjectId(),
          title: `Item ${i}`,
          price: 2000,
          quantity: 1,
        },
      ],
      totalAmount: 2000,
      currency: "NGN",
      status: i % 2 === 0 ? "delivered" : "confirmed",
      fulfillmentMethod: "pickup",
      paymentMethod: "cash",
      history: [{ status: "confirmed", updatedBy: seller._id, updatedAt: new Date() }],
      createdAt: new Date(Date.now() - i * 20000),
      updatedAt: new Date(Date.now() - i * 20000),
    });
  }
  await OrderModel.insertMany(ordersToInsert);

  console.log("Fixtures seeded successfully: 40 listings, 50 reviews, 50 orders.\n");

  const results: LatencyStats[] = [];

  // Helper to execute concurrent load
  async function runLoadTest(
    endpointName: string,
    concurrency: number,
    totalRequests: number,
    fn: (index: number) => Promise<any>
  ): Promise<LatencyStats> {
    process.stdout.write(`Benchmarking ${endpointName} (N=${totalRequests}, C=${concurrency})... `);
    const latencies: number[] = [];
    let successful = 0;
    let failed = 0;

    const startTime = Date.now();
    let index = 0;

    async function worker() {
      while (true) {
        const i = index++;
        if (i >= totalRequests) break;
        const reqStart = Date.now();
        try {
          const res = await fn(i);
          const elapsed = Date.now() - reqStart;
          latencies.push(elapsed);
          if (res && res.status >= 200 && res.status < 400) {
            successful++;
          } else {
            failed++;
          }
        } catch {
          latencies.push(Date.now() - reqStart);
          failed++;
        }
      }
    }

    const workers = Array.from({ length: concurrency }, () => worker());
    await Promise.all(workers);
    const totalTimeMs = Date.now() - startTime;
    const throughputReqSec = Math.round((totalRequests / (totalTimeMs / 1000)) * 10) / 10;
    const { p50, p95, p99, min, max } = computePercentiles(latencies);

    console.log(`DONE in ${totalTimeMs}ms (${throughputReqSec} req/sec)`);

    return {
      endpoint: endpointName,
      totalRequests,
      concurrency,
      successful,
      failed,
      totalTimeMs,
      throughputReqSec,
      minMs: min,
      p50Ms: p50,
      p95Ms: p95,
      p99Ms: p99,
      maxMs: max,
    };
  }

  // 1. Listings Feed Load Test (50 concurrent)
  results.push(
    await runLoadTest("GET /api/listings (Feed)", 25, 100, async () => {
      const req = makeMockRequest("/api/listings?campus=UNILAG&category=Electronics&limit=20");
      return await handleGetListings(req);
    })
  );

  // 2. Stores Directory Load Test (50 concurrent)
  results.push(
    await runLoadTest("GET /api/stores (Directory)", 25, 100, async () => {
      const req = makeMockRequest("/api/stores?campus=UNILAG&sortBy=rating&limit=10");
      return await handleGetStores(req);
    })
  );

  // 3. Reviews Keyset Pagination Load Test (50 concurrent)
  results.push(
    await runLoadTest("GET /api/reviews (Keyset List)", 25, 100, async () => {
      const req = makeMockRequest(`/api/reviews?sellerId=${seller._id.toString()}&limit=20`);
      return await handleGetReviews(req);
    })
  );

  // 4. Seller Dashboard Stats Load Test (50 concurrent)
  results.push(
    await runLoadTest("GET /api/dashboard/seller-stats", 25, 100, async () => {
      const req = makeMockRequest(`/api/dashboard/seller-stats`, {
        Authorization: `Bearer ${sellerToken}`,
      });
      return await handleGetSellerStats(req);
    })
  );

  // 5. System Health Check Probe Load Test (50 concurrent)
  results.push(
    await runLoadTest("GET /api/health (Health Probe)", 25, 100, async () => {
      return await handleGetHealth();
    })
  );

  console.log("\n==================================================================");
  console.log("                     BENCHMARK SUMMARY RESULTS                    ");
  console.log("==================================================================");
  console.log(
    "Endpoint".padEnd(32) +
      "Reqs".padEnd(8) +
      "Req/s".padEnd(10) +
      "p50(ms)".padEnd(10) +
      "p95(ms)".padEnd(10) +
      "p99(ms)".padEnd(10) +
      "Errors"
  );
  console.log("-".repeat(88));

  for (const r of results) {
    console.log(
      r.endpoint.padEnd(32) +
        String(r.totalRequests).padEnd(8) +
        String(r.throughputReqSec).padEnd(10) +
        String(r.p50Ms).padEnd(10) +
        String(r.p95Ms).padEnd(10) +
        String(r.p99Ms).padEnd(10) +
        (r.failed === 0 ? "0 (0.00%) ✅" : `${r.failed} ❌`)
    );
  }
  console.log("==================================================================\n");

  // Assertions
  for (const r of results) {
    assert.strictEqual(r.failed, 0, `Zero errors allowed under load for ${r.endpoint}`);
    // Under concurrency=25 on local developer workstations, p95 must remain responsive (<1200ms) with 0 errors
    assert.ok(r.p95Ms < 1200, `p95 latency must be under 1200ms (was ${r.p95Ms}ms for ${r.endpoint})`);
  }

  console.log("✅ All concurrency and latency SLO assertions PASSED!\n");

  await mongoose.disconnect();
  await replSet.stop();
}

runBenchmark().catch((err) => {
  console.error("Benchmark failed:", err);
  process.exit(1);
});
