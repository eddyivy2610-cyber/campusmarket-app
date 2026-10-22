import { MongoMemoryReplSet } from "mongodb-memory-server";
import mongoose from "mongoose";
import { ListingModel } from "../app/models/Listing";
import { encodeListingCursor, decodeListingCursor } from "../app/api/listings/route";
import { PRODUCT_CONDITIONS } from "../app/constants/enums";

let passed = 0;
let failed = 0;

function assert(condition: boolean, desc: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${desc}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${desc}`);
    failed++;
  }
}

async function run() {
  console.log("==================================================================");
  console.log(" KEYSET CURSOR TIE-BREAKER (createdAt, _id) VERIFICATION");
  console.log("==================================================================\n");

  const repl = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  await mongoose.connect(repl.getUri());
  await ListingModel.init();

  const identicalTimestamp = new Date("2026-10-21T12:00:00.000Z").toISOString();
  const totalCount = 100;
  const docs = [];

  for (let i = 0; i < totalCount; i++) {
    docs.push({
      title: `Item Identical Timestamp ${i}`,
      price: 1000 + i,
      priceFormatted: `₦${1000 + i}`,
      description: `Description ${i}`,
      category: "Electronics",
      campus: "ABU Zaria",
      location: "Hostels",
      sellerId: new mongoose.Types.ObjectId().toString(),
      listingType: "product",
      condition: PRODUCT_CONDITIONS[0],
      status: "active",
      schemaVersion: 1,
      createdAt: identicalTimestamp, // EXACT SAME TIMESTAMP FOR ALL 100 DOCUMENTS
      updatedAt: identicalTimestamp,
    });
  }

  await ListingModel.insertMany(docs);

  // Paginate through all documents using the composite keyset cursor in pages of 15
  const pageSize = 15;
  const retrievedIds = new Set<string>();
  let currentCursor: string | null = null;
  let pageCount = 0;

  while (true) {
    pageCount++;
    const filter: Record<string, any> = { status: "active" };

    if (currentCursor) {
      const decoded = decodeListingCursor(currentCursor);
      assert(decoded !== null, `Cursor for page ${pageCount} successfully decoded`);
      if (decoded) {
        filter.$or = [
          { createdAt: { $lt: decoded.createdAt } },
          { createdAt: decoded.createdAt, _id: { $lt: decoded.id } },
        ];
      }
    }

    const pageDocs = (await ListingModel.find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .limit(pageSize)
      .lean()) as any[];

    if (pageDocs.length === 0) break;

    for (const doc of pageDocs) {
      const idStr = doc._id.toString();
      assert(!retrievedIds.has(idStr), `Document ${idStr} is unique on page ${pageCount} (no duplicates)`);
      retrievedIds.add(idStr);
    }

    const lastDoc = pageDocs[pageDocs.length - 1];
    currentCursor = encodeListingCursor(lastDoc.createdAt, lastDoc._id.toString());

    if (pageDocs.length < pageSize) break;
  }

  assert(
    retrievedIds.size === totalCount,
    `Composite cursor retrieved all ${totalCount} items with zero missing items despite identical timestamps (retrieved: ${retrievedIds.size})`
  );
  assert(pageCount === 7, `Expected 7 pages (6 x 15 + 1 x 10 = 100), got ${pageCount} pages`);

  console.log("\n==================================================================");
  console.log(` ALL CURSOR TIE-BREAKER TESTS COMPLETE: ${passed} PASSED | ${failed} FAILED`);
  console.log("==================================================================");

  await mongoose.disconnect();
  await repl.stop();
  if (failed > 0) process.exit(1);
  process.exit(0);
}

run().catch((err) => {
  console.error("Cursor test failed:", err);
  process.exit(1);
});
