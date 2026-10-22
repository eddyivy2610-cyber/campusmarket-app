import { MongoMemoryReplSet } from "mongodb-memory-server";
import mongoose from "mongoose";
import { ListingModel } from "../app/models/Listing";
import { PRODUCT_CONDITIONS } from "../app/constants/enums";

async function run() {
  console.log("==================================================================");
  console.log(" PHASE 3: WRITE-THROUGHPUT & INDEX MEMORY FOOTPRINT BENCHMARK");
  console.log("==================================================================\n");

  const repl = await MongoMemoryReplSet.create({
    replSet: { count: 1, storageEngine: "wiredTiger" },
  });
  await mongoose.connect(repl.getUri());
  await ListingModel.init();

  const db = mongoose.connection.db!;
  const coll = db.collection("listings");

  // Measure bulk insert throughput across 5,000 documents with all 11 compound indexes active
  const BATCH_SIZE = 5000;
  console.log(`--- 1. Measuring Write Throughput (${BATCH_SIZE} Listing Inserts) ---`);
  const docs = [];
  for (let i = 0; i < BATCH_SIZE; i++) {
    docs.push({
      title: `Benchmark Item ${i} Wireless Earbuds`,
      price: 5000 + (i % 100) * 100,
      priceFormatted: `₦${5000 + (i % 100) * 100}`,
      description: `Detailed description for item ${i} with high quality sound, long battery life and noise cancellation`,
      category: i % 2 === 0 ? "Electronics" : "Gadgets",
      campus: i % 3 === 0 ? "ABU Zaria" : "University of Lagos",
      location: "Hostels Area",
      sellerId: new mongoose.Types.ObjectId().toString(),
      storeId: i % 4 === 0 ? new mongoose.Types.ObjectId().toString() : undefined,
      listingType: i % 5 === 0 ? "service" : "product",
      condition: PRODUCT_CONDITIONS[0],
      status: "active",
      views: 0,
      likes: 0,
      schemaVersion: 1,
      createdAt: new Date(Date.now() - (BATCH_SIZE - i) * 60000).toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  const startWrite = performance.now();
  await ListingModel.insertMany(docs, { ordered: false });
  const writeDuration = performance.now() - startWrite;
  const writesPerSec = Math.round((BATCH_SIZE / (writeDuration / 1000)) * 10) / 10;
  const avgPerDocMs = Math.round((writeDuration / BATCH_SIZE) * 100) / 100;

  console.log(`  ⏱️ Inserted ${BATCH_SIZE} documents in ${writeDuration.toFixed(2)} ms`);
  console.log(`  ⚡ Write Throughput: ${writesPerSec} docs/sec (avg ${avgPerDocMs} ms per document across 11 indexes)\n`);

  // Inspect index sizes via collStats
  console.log("--- 2. Index Memory Sizing Breakdown (db.listings.stats().indexSizes) ---");
  const stats: any = await db.command({ collStats: "listings" });
  const totalIndexBytes = stats.totalIndexSize || 0;
  const totalDataBytes = stats.size || 0;

  console.log(`  📦 Total Collection Data Size: ${(totalDataBytes / 1024).toFixed(2)} KB`);
  console.log(`  🧠 Total Index Memory Size:    ${(totalIndexBytes / 1024).toFixed(2)} KB\n`);
  console.log("  Individual Index Breakdown:");

  if (stats.indexSizes) {
    for (const [indexName, sizeBytes] of Object.entries(stats.indexSizes)) {
      const kb = ((sizeBytes as number) / 1024).toFixed(2);
      const pct = totalIndexBytes > 0 ? (((sizeBytes as number) / totalIndexBytes) * 100).toFixed(1) : "0";
      console.log(`    • ${indexName.padEnd(65)} : ${kb.padStart(8)} KB (${pct}%)`);
    }
  }

  // Compare against Atlas RAM tiers
  console.log("\n--- 3. Atlas Cluster RAM Capacity Assessment ---");
  const projected30kIndexBytes = (totalIndexBytes / BATCH_SIZE) * 30000;
  const projected30kMb = (projected30kIndexBytes / (1024 * 1024)).toFixed(2);

  console.log(`  📊 Projected 30,000 listing index working set: ~${projected30kMb} MB`);
  console.log("  Cluster Headroom:");
  console.log(`    - Atlas M0 Sandbox (512 MB RAM):   ${projected30kMb} MB index set fits entirely in wiredTiger cache (~${((parseFloat(projected30kMb) / 512) * 100).toFixed(1)}% RAM)`);
  console.log(`    - Atlas M10 Dedicated (2 GB RAM):  ${projected30kMb} MB index set occupies ~${((parseFloat(projected30kMb) / 2048) * 100).toFixed(1)}% RAM`);
  console.log(`    - Atlas M20 Dedicated (4 GB RAM):  ${projected30kMb} MB index set occupies ~${((parseFloat(projected30kMb) / 4096) * 100).toFixed(1)}% RAM`);

  console.log("\n==================================================================");
  console.log(" ✅ INDEX STATS & WRITE THROUGHPUT BENCHMARK COMPLETE");
  console.log("==================================================================");

  await mongoose.disconnect();
  await repl.stop();
}

run().catch((err) => {
  console.error("Index stats check failed:", err);
  process.exit(1);
});
