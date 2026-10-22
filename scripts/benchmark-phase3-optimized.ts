/**
 * Phase 3: Optimized Performance Benchmark & Before/After Comparison
 *
 * Runs the exact same query workload on 5,000 stores, 30,000 listings, 10,000 conversations,
 * and 50,000 messages with the new ESR compound indexes, cursor pagination, and text index.
 */

import { MongoMemoryReplSet } from "mongodb-memory-server";
import mongoose from "mongoose";
import { PRODUCT_CONDITIONS } from "../app/constants/enums";
import { ExplainMetrics, LoadTestMetrics } from "./benchmark-phase3-baseline";

const CAMPUSES = [
  "ABU Zaria",
  "University of Lagos",
  "University of Ibadan",
  "University of Nigeria, Nsukka",
  "Obafemi Awolowo University",
];

const CATEGORIES = [
  "Electronics",
  "Fashion",
  "Books & Academic Supplies",
  "Hostel Essentials",
  "Food",
  "Services",
];

const STORE_CATEGORIES = [
  "Gadgets & Electronics",
  "Fashion & Wears",
  "Groceries & Provisions",
  "Printing & Stationery",
  "Hair & Beauty",
];

const LISTING_TITLES = [
  "HP EliteBook 840 G5 16GB RAM Core i5 Laptop",
  "Dell Latitude 7490 Core i7 SSD Laptop",
  "MacBook Pro 13-inch 2020 Touch Bar Laptop",
  "Casio fx-991ES Plus Scientific Calculator",
  "Rechargeable LED Desk Study Lamp",
  "Electric Kettle 1.8 Litres Fast Boil",
  "Standing Fan with Remote Control 16 Inch",
  "Mini Hostel Refrigerator Double Door",
  "Mattress 4.5 by 6 High Density Foam",
  "Engineering Thermodynamics 8th Edition",
  "Halliday & Resnick Fundamentals of Physics",
  "Nike Air Force 1 Low Sneaker Unisex",
  "Custom Campus Graphic T-Shirt Cotton",
  "Wireless Noise Cancelling Earbuds Bluetooth 5.3",
  "Heavy Duty Extension Box 6 Way 3 Metres",
];

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1);
  return Number(sorted[Math.max(0, idx)].toFixed(2));
}

function extractStageInfo(stage: any): {
  winningStage: string;
  hasSortStage: boolean;
  indexUsed: string | null;
} {
  let winningStage = stage?.stage || "UNKNOWN";
  let hasSortStage = false;
  let indexUsed: string | null = null;
  let hasCollScan = false;

  function traverse(s: any) {
    if (!s) return;
    if (s.stage === "SORT" || s.stage === "SORT_KEY_GENERATOR") hasSortStage = true;
    if (s.stage === "COLLSCAN") hasCollScan = true;
    if (s.indexName) indexUsed = s.indexName;
    if (s.inputStage) traverse(s.inputStage);
    if (Array.isArray(s.inputStages)) s.inputStages.forEach(traverse);
  }

  traverse(stage);
  if (hasCollScan && !indexUsed) {
    winningStage = hasSortStage ? "SORT (COLLSCAN)" : "COLLSCAN";
  } else if (hasSortStage && indexUsed) {
    winningStage = "SORT (IXSCAN)";
  } else if (indexUsed) {
    winningStage = stage?.stage === "TEXT_MATCH" ? "TEXT_MATCH (IXSCAN)" : "IXSCAN";
  }
  return { winningStage, hasSortStage, indexUsed };
}

async function measureQueryExplain(
  name: string,
  queryDesc: string,
  sortDesc: string,
  buildQuery: () => any,
  iterations = 10
): Promise<ExplainMetrics> {
  // Warm-up pass (2 runs)
  await buildQuery().explain("executionStats");
  await buildQuery().explain("executionStats");

  const times: number[] = [];
  let lastStats: any = null;

  for (let i = 0; i < iterations; i++) {
    const t0 = performance.now();
    const explainRes = (await buildQuery().explain("executionStats")) as any;
    const elapsed = performance.now() - t0;
    lastStats = explainRes.executionStats;
    times.push(Math.max(lastStats.executionTimeMillis, Number(elapsed.toFixed(2))));
  }

  times.sort((a, b) => a - b);
  const stageInfo = extractStageInfo(lastStats.executionStages);

  return {
    name,
    queryDesc,
    sortDesc,
    winningStage: stageInfo.winningStage,
    hasSortStage: stageInfo.hasSortStage,
    indexUsed: stageInfo.indexUsed,
    totalDocsExamined: lastStats.totalDocsExamined,
    totalKeysExamined: lastStats.totalKeysExamined,
    nReturned: lastStats.nReturned,
    medianMs: percentile(times, 50),
    p95Ms: percentile(times, 95),
  };
}

async function runConcurrentTrafficMix(
  queries: Array<() => Promise<any>>,
  concurrency = 20,
  totalOps = 200
): Promise<LoadTestMetrics> {
  const latencies: number[] = [];
  let errorCount = 0;
  let nextIdx = 0;

  const startWall = performance.now();

  async function worker() {
    while (true) {
      const i = nextIdx++;
      if (i >= totalOps) break;
      const qFn = queries[i % queries.length];
      const t0 = performance.now();
      try {
        await qFn();
        latencies.push(performance.now() - t0);
      } catch {
        errorCount++;
        latencies.push(performance.now() - t0);
      }
    }
  }

  await Promise.all(Array.from({ length: concurrency }, () => worker()));
  const totalWallSec = (performance.now() - startWall) / 1000;

  latencies.sort((a, b) => a - b);

  let connectionsCurrent = 0;
  let connectionsAvailable = 0;
  let connectionsActive = 0;
  try {
    const serverStatus = await mongoose.connection.db!.admin().serverStatus();
    connectionsCurrent = serverStatus.connections?.current ?? 0;
    connectionsAvailable = serverStatus.connections?.available ?? 0;
    connectionsActive = serverStatus.connections?.active ?? 0;
  } catch {
    // ignore
  }

  return {
    totalRequests: totalOps,
    errorCount,
    errorRatePct: Number(((errorCount / totalOps) * 100).toFixed(2)),
    p50Ms: percentile(latencies, 50),
    p95Ms: percentile(latencies, 95),
    p99Ms: percentile(latencies, 99),
    throughputRps: Number((totalOps / totalWallSec).toFixed(1)),
    connectionsCurrent,
    connectionsAvailable,
    connectionsActive,
  };
}

async function runOptimizedBenchmark() {
  console.log("==================================================================");
  console.log(" PHASE 3: OPTIMIZED BENCHMARK & BEFORE/AFTER EVALUATION");
  console.log("==================================================================\n");

  const replSet = await MongoMemoryReplSet.create({
    replSet: { count: 1, storageEngine: "wiredTiger" },
  });
  const uri = replSet.getUri();
  await mongoose.connect(uri, { maxPoolSize: 25 });

  const { ListingModel } = await import("../app/models/Listing");
  const { StoreModel } = await import("../app/models/Store");
  const UserModel = (await import("../app/models/User")).default;

  const ConversationSchema = new mongoose.Schema(
    {
      participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
      listingId: { type: mongoose.Schema.Types.ObjectId, ref: "CampusListing", index: true },
      lastMessage: {
        text: String,
        senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        time: { type: Date, default: Date.now },
      },
      status: { type: String, enum: ["active", "archived", "deleted"], default: "active" },
      schemaVersion: { type: Number, default: 1, index: true },
    },
    { timestamps: true }
  );

  // Apply new ESR index for Conversation list
  ConversationSchema.index({ participants: 1, status: 1, "lastMessage.time": -1 });

  const MessageSchema = new mongoose.Schema(
    {
      conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Conversation",
        required: true,
      },
      senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      type: { type: String, enum: ["text", "listing-card", "system", "image"], default: "text" },
      text: String,
      read: { type: Boolean, default: false },
      schemaVersion: { type: Number, default: 1, index: true },
    },
    { timestamps: true }
  );

  // Apply new compound index for Messages
  MessageSchema.index({ conversationId: 1, createdAt: 1 });

  const ConversationModel =
    mongoose.models.Conversation || mongoose.model("Conversation", ConversationSchema);
  const MessageModel = mongoose.models.Message || mongoose.model("Message", MessageSchema);

  await ListingModel.init();
  await StoreModel.init();
  await ConversationModel.init();
  await MessageModel.init();

  console.log("🌱 Seeding realistic volume (30,000 Listings, 5,000 Stores, 10,000 Conversations)...");
  console.time("⏱️ Seeding Time");

  const userDocs = [];
  for (let i = 0; i < 500; i++) {
    userDocs.push({
      name: `Student Seller ${i}`,
      email: `seller${i}@campushive.edu.ng`,
      role: i % 5 === 0 ? "seller" : "buyer",
      accountStatus: "active",
      tokenVersion: 0,
      schemaVersion: 1,
    });
  }
  const createdUsers = await UserModel.insertMany(userDocs);
  const targetUserId = createdUsers[0]._id;

  const storeDocs = [];
  for (let i = 0; i < 5000; i++) {
    const campus = CAMPUSES[i % CAMPUSES.length];
    const category = STORE_CATEGORIES[(i * 3) % STORE_CATEGORIES.length];
    const rating = parseFloat((3.5 + (i % 15) * 0.1).toFixed(1));
    storeDocs.push({
      name: `Campus Store ${i} - ${category}`,
      slug: `store-${i}-${Math.random().toString(36).substring(2, 6)}`,
      ownerId: new mongoose.Types.ObjectId().toString(),
      campus,
      operatingLocation: `${campus} Commercial Center`,
      category,
      description: `Authentic student vendor offering top quality ${category} on ${campus}.`,
      logo: `https://images.unsplash.com/photo-${1500000000000 + i}?w=200`,
      status: i % 29 === 0 ? "suspended" : "active",
      isVerified: i % 2 === 0,
      metrics: {
        rating,
        reviewsCount: (i * 3) % 150,
        completedDeals: (i * 5) % 200,
        listingsCount: (i % 20) + 1,
      },
      schemaVersion: 1,
      createdAt: new Date(Date.now() - (5000 - i) * 60000).toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
  await StoreModel.insertMany(storeDocs);

  const BATCH_SIZE = 5000;
  for (let b = 0; b < 6; b++) {
    const chunk = [];
    for (let i = 0; i < BATCH_SIZE; i++) {
      const idx = b * BATCH_SIZE + i;
      const seller = createdUsers[idx % createdUsers.length];
      const campus = CAMPUSES[idx % CAMPUSES.length];
      const category = CATEGORIES[Math.floor(idx / 5) % CATEGORIES.length];
      const title = `${LISTING_TITLES[idx % LISTING_TITLES.length]} (#${idx})`;
      const price = 2500 + (idx % 80) * 1500;
      chunk.push({
        title,
        price,
        priceFormatted: `₦${price.toLocaleString()}`,
        description: `Clean and fully functional item located at ${campus}. Urgent student moving sale, price slightly negotiable.`,
        category,
        campus,
        location: `${campus} Hostels`,
        sellerId: seller._id.toString(),
        listingType: idx % 11 === 0 ? "service" : "product",
        condition: PRODUCT_CONDITIONS[idx % PRODUCT_CONDITIONS.length],
        status: idx % 37 === 0 ? "paused" : "active",
        images: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600"],
        views: idx % 100,
        likes: idx % 25,
        schemaVersion: 1,
        createdAt: new Date(Date.now() - (30000 - idx) * 30000).toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    await ListingModel.insertMany(chunk);
  }

  const convDocs = [];
  for (let i = 0; i < 10000; i++) {
    const p1 = i < 150 ? targetUserId : createdUsers[(i % (createdUsers.length - 1)) + 1]._id;
    const p2 = createdUsers[((i + 7) % (createdUsers.length - 1)) + 1]._id;
    convDocs.push({
      participants: [p1, p2],
      lastMessage: {
        text: `Negotiation chat message #${i}`,
        senderId: p1,
        time: new Date(Date.now() - (10000 - i) * 60000),
      },
      status: "active",
      schemaVersion: 1,
    });
  }
  const createdConvs = await ConversationModel.insertMany(convDocs);
  const targetConvId = createdConvs[0]._id;

  const msgDocs = [];
  for (let i = 0; i < 50000; i++) {
    const conv = createdConvs[i % 250];
    const ts = new Date(Date.now() - (50000 - i) * 5000);
    msgDocs.push({
      conversationId: conv._id,
      senderId: conv.participants[i % 2],
      type: "text",
      text: `Thread message content ${i}: Is this item still available for inspection?`,
      createdAt: ts,
      updatedAt: ts,
      schemaVersion: 1,
    });
  }
  await MessageModel.insertMany(msgDocs);
  console.timeEnd("⏱️ Seeding Time");

  // Pick a realistic cursor value for deep pagination test (page 20 equivalent)
  const page20Probe = await ListingModel.find({ status: "active" })
    .sort({ createdAt: -1 })
    .skip(600)
    .limit(1)
    .lean();
  const cursorTimestamp = page20Probe[0]?.createdAt;

  console.log("\n==================================================================");
  console.log(" EXECUTING OPTIMIZED EXPLAIN('executionStats')");
  console.log("==================================================================");

  const afterResults: ExplainMetrics[] = [];

  // 1. Global Feed (ESR: { status: 1, createdAt: -1 })
  afterResults.push(
    await measureQueryExplain(
      "1. Feed (Global)",
      '{ status: "active" }',
      "{ createdAt: -1 }",
      () => ListingModel.find({ status: "active" }).sort({ createdAt: -1 }).limit(30)
    )
  );

  // 2. Feed Page 20 with Cursor Pagination ({ status: 1, createdAt: { $lt: cursor } })
  afterResults.push(
    await measureQueryExplain(
      "2. Feed (Deep Page Cursor)",
      `{ status: "active", createdAt: { $lt: cursor } }`,
      "{ createdAt: -1 }",
      () =>
        ListingModel.find({
          status: "active",
          createdAt: { $lt: cursorTimestamp },
        })
          .sort({ createdAt: -1 })
          .limit(30)
    )
  );

  // 3. Feed Campus + Category (ESR: { status: 1, campus: 1, category: 1, createdAt: -1 })
  afterResults.push(
    await measureQueryExplain(
      "3. Feed (Campus + Category)",
      '{ status: "active", campus: "ABU Zaria", category: "Electronics" }',
      "{ createdAt: -1 }",
      () =>
        ListingModel.find({
          status: "active",
          campus: "ABU Zaria",
          category: "Electronics",
        })
          .sort({ createdAt: -1 })
          .limit(30)
    )
  );

  // 4. Partitioned Text Search ({ status: "active", $text: { $search: "laptop" } })
  afterResults.push(
    await measureQueryExplain(
      "4. Search (Partitioned $text)",
      '{ status: "active", $text: { $search: "laptop" } }',
      '{ score: { $meta: "textScore" } }',
      () =>
        ListingModel.find(
          { status: "active", $text: { $search: "laptop" } },
          { score: { $meta: "textScore" } }
        )
          .sort({ score: { $meta: "textScore" } })
          .limit(30)
    )
  );

  // 5. Store Directory ({ status: 1, campus: 1, "metrics.rating": -1, createdAt: -1 })
  afterResults.push(
    await measureQueryExplain(
      "5. Store Directory",
      '{ status: "active", campus: "ABU Zaria" }',
      '{ "metrics.rating": -1, createdAt: -1 }',
      () =>
        StoreModel.find({ status: "active", campus: "ABU Zaria" })
          .sort({ "metrics.rating": -1, createdAt: -1 })
          .limit(20)
    )
  );

  // 6. Conversation List ({ participants: 1, status: 1, "lastMessage.time": -1 })
  afterResults.push(
    await measureQueryExplain(
      "6. Conversation List",
      '{ participants: targetUserId, status: "active" }',
      '{ "lastMessage.time": -1 }',
      () =>
        ConversationModel.find({ participants: targetUserId, status: "active" })
          .sort({ "lastMessage.time": -1 })
          .limit(30)
    )
  );

  // 7. Messages Thread ({ conversationId: 1, createdAt: 1 })
  afterResults.push(
    await measureQueryExplain(
      "7. Messages Thread",
      "{ conversationId: targetConvId }",
      "{ createdAt: -1 }",
      () => MessageModel.find({ conversationId: targetConvId }).sort({ createdAt: -1 }).limit(50)
    )
  );

  // Run optimized concurrent load test
  const optimizedLoad = await runConcurrentTrafficMix([
    () => ListingModel.find({ status: "active" }).sort({ createdAt: -1 }).limit(30).lean(),
    () =>
      ListingModel.find({
        status: "active",
        createdAt: { $lt: cursorTimestamp },
      })
        .sort({ createdAt: -1 })
        .limit(30)
        .lean(),
    () =>
      ListingModel.find({ status: "active", campus: "ABU Zaria", category: "Electronics" })
        .sort({ createdAt: -1 })
        .limit(30)
        .lean(),
    () =>
      ListingModel.find(
        { status: "active", $text: { $search: "laptop" } },
        { score: { $meta: "textScore" } }
      )
        .sort({ score: { $meta: "textScore" } })
        .limit(30)
        .lean(),
    () =>
      StoreModel.find({ status: "active", campus: "ABU Zaria" })
        .sort({ "metrics.rating": -1, createdAt: -1 })
        .limit(20)
        .lean(),
    () =>
      ConversationModel.find({ participants: targetUserId, status: "active" })
        .sort({ "lastMessage.time": -1 })
        .limit(30)
        .lean(),
    () =>
      MessageModel.find({ conversationId: targetConvId }).sort({ createdAt: -1 }).limit(50).lean(),
  ]);

  console.log("\n==================================================================");
  console.log(" OPTIMIZED (AFTER INDEXES & CURSORS) — 10 WARM RUNS");
  console.log("==================================================================\n");
  console.log(
    "| Operation | Median (p50) | p95 | Docs Examined | Keys Examined | Returned | Examined/Returned | Stage | In-Memory SORT? | Index Used |"
  );
  console.log(
    "| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |"
  );
  for (const r of afterResults) {
    const ratio = r.nReturned > 0 ? `${(r.totalDocsExamined / r.nReturned).toFixed(1)}x` : "1.0x";
    console.log(
      `| **${r.name}** | **${r.medianMs} ms** | **${r.p95Ms} ms** | ${r.totalDocsExamined.toLocaleString()} | ${r.totalKeysExamined.toLocaleString()} | ${r.nReturned} | ${ratio} | \`${r.winningStage}\` | ${r.hasSortStage ? "⚠️ YES" : "✅ NO"} | \`${r.indexUsed}\` |`
    );
  }

  console.log(`\n📊 Optimized Concurrent Traffic Mix Load Test (20 VUs, 200 requests):`);
  console.log(
    `  • Latency: p50 = ${optimizedLoad.p50Ms} ms | p95 = ${optimizedLoad.p95Ms} ms | p99 = ${optimizedLoad.p99Ms} ms`
  );
  console.log(
    `  • Throughput: ${optimizedLoad.throughputRps} req/s | Error Rate: ${optimizedLoad.errorRatePct}% (${optimizedLoad.errorCount}/${optimizedLoad.totalRequests})`
  );
  console.log(
    `  • MongoDB Connections: current = ${optimizedLoad.connectionsCurrent}, active = ${optimizedLoad.connectionsActive}, available = ${optimizedLoad.connectionsAvailable}`
  );

  await mongoose.disconnect();
  await replSet.stop();
}

runOptimizedBenchmark()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Optimized benchmark failed:", err);
    process.exit(1);
  });
