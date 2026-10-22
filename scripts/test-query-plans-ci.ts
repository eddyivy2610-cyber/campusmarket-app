/**
 * CI Guard: Query Plan & Index Regression Suite
 *
 * Runs explain("executionStats") on all hot production query paths and asserts:
 * 1. Zero full table scans (NO COLLSCAN permitted)
 * 2. Zero in-memory sorting on feed, store directory, conversations, and messages (NO SORT stage permitted)
 * 3. Perfect or near-perfect index efficiency: docsExamined === nReturned
 * 4. Dual-ecosystem conversation query coverage (both Express and Next.js paths)
 * 5. Composite keyset cursor pagination with (createdAt, _id) tie-breaker
 *
 * FAILS LOUDLY (exit code 1) in CI if any schema change or unindexed query regresses performance.
 */

import { MongoMemoryReplSet } from "mongodb-memory-server";
import mongoose from "mongoose";
import { ListingModel } from "../app/models/Listing";
import { StoreModel } from "../app/models/Store";
import UserModel from "../app/models/User";
import { ConversationModel } from "../app/models/ChatModels";
import { OrderModel } from "../app/models/Order";
import ReviewModel from "../app/models/Review";
import { PRODUCT_CONDITIONS } from "../app/constants/enums";

let passed = 0;
let failed = 0;

function assert(condition: boolean, msg: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${msg}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${msg}`);
    failed++;
    throw new Error(`CI Index Assertion Failed: ${msg}`);
  }
}

function extractPlanDetails(executionStages: any) {
  let hasCollScan = false;
  let hasSortStage = false;
  let indexUsed: string | null = null;

  function traverse(s: any) {
    if (!s) return;
    if (s.stage === "COLLSCAN") hasCollScan = true;
    if (s.stage === "SORT" || s.stage === "SORT_KEY_GENERATOR") hasSortStage = true;
    if (s.indexName) indexUsed = s.indexName;
    if (s.inputStage) traverse(s.inputStage);
    if (Array.isArray(s.inputStages)) s.inputStages.forEach(traverse);
  }

  traverse(executionStages);
  return { hasCollScan, hasSortStage, indexUsed };
}

async function runCiQueryPlanCheck() {
  console.log("==================================================================");
  console.log(" CI QUERY PLAN & INDEX REGRESSION GUARD");
  console.log("==================================================================\n");

  const replSet = await MongoMemoryReplSet.create({
    replSet: { count: 1, storageEngine: "wiredTiger" },
  });
  const uri = replSet.getUri();
  await mongoose.connect(uri);

  const MessageSchema = new mongoose.Schema(
    {
      conversationId: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation", required: true },
      senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      text: String,
    },
    { timestamps: true, collection: "messages" }
  );
  MessageSchema.index({ conversationId: 1, createdAt: 1, _id: 1 });

  const MessageModel = mongoose.models.Message || mongoose.model("Message", MessageSchema, "messages");

  await ListingModel.init();
  await StoreModel.init();
  await ConversationModel.init();
  await MessageModel.init();
  await OrderModel.init();
  await ReviewModel.init();

  try {
    // Seed test fixtures
    const user = await UserModel.create({
      name: "CI User",
      email: "ci@campushive.edu.ng",
      role: "buyer",
      tokenVersion: 0,
      schemaVersion: 1,
    });

    const listingDocs = [];
    for (let i = 0; i < 200; i++) {
      listingDocs.push({
        title: `Item ${i}`,
        price: 1000 + i * 100,
        priceFormatted: `₦${1000 + i * 100}`,
        description: `Description ${i}`,
        category: i % 2 === 0 ? "Electronics" : "Fashion",
        campus: i % 2 === 0 ? "ABU Zaria" : "University of Lagos",
        location: "Campus Hostels",
        sellerId: user._id.toString(),
        listingType: i % 4 === 0 ? "service" : "product",
        condition: PRODUCT_CONDITIONS[0],
        status: "active",
        schemaVersion: 1,
        createdAt: new Date(Date.now() - (200 - i) * 60000).toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    await ListingModel.insertMany(listingDocs);

    const storeDocs = [];
    for (let i = 0; i < 50; i++) {
      storeDocs.push({
        name: `Store ${i}`,
        slug: `store-${i}-${Math.random().toString(36).substring(2, 6)}`,
        ownerId: new mongoose.Types.ObjectId().toString(),
        campus: "ABU Zaria",
        operatingLocation: "ABU Zaria Commercial Center",
        category: "Gadgets & Electronics",
        description: "Store description",
        logo: "https://example.com/logo.png",
        status: "active",
        metrics: { rating: 4.8, reviewsCount: 10, completedDeals: 10, listingsCount: 5 },
        schemaVersion: 1,
        createdAt: new Date(Date.now() - (50 - i) * 60000).toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    await StoreModel.insertMany(storeDocs);

    const otherUser = new mongoose.Types.ObjectId();
    const conv: any = await ConversationModel.create({
      conversationId: "ci-conv-1",
      participants: [user._id as any, otherUser as any],
      participantIds: [user._id.toString(), otherUser.toString()],
      status: "active",
      lastMessage: {
        text: "Latest message",
        senderId: user._id.toString(),
        createdAt: new Date().toISOString(),
        time: new Date(),
        type: "text",
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      schemaVersion: 1,
    });

    const msgDocs = [];
    for (let i = 0; i < 60; i++) {
      msgDocs.push({
        conversationId: conv._id,
        senderId: user._id,
        text: `Message ${i}`,
        createdAt: new Date(Date.now() - (60 - i) * 1000),
      });
    }
    await MessageModel.insertMany(msgDocs);

    // ---------------- 1. Global Feed Plan Guard (with _id tie-breaker) ----------------
    console.log("--- 1. Guard: Global Feed Query Plan (createdAt, _id) ---");
    const feedExplain = (await ListingModel.find({ status: "active" })
      .sort({ createdAt: -1, _id: -1 })
      .limit(30)
      .explain("executionStats")) as any;
    const feedStats = feedExplain.executionStats;
    const feedPlan = extractPlanDetails(feedStats.executionStages);

    assert(!feedPlan.hasCollScan, "Global feed strictly does NOT use COLLSCAN");
    assert(!feedPlan.hasSortStage, "Global feed index provides sorted order: NO in-memory SORT stage");
    assert(
      feedStats.totalDocsExamined === feedStats.nReturned,
      `Docs examined (${feedStats.totalDocsExamined}) strictly equals returned (${feedStats.nReturned})`
    );
    assert(
      feedPlan.indexUsed === "status_1_createdAt_-1__id_-1",
      `Used correct tie-breaker index '${feedPlan.indexUsed}'`
    );

    // ---------------- 2. Campus + Category + ListingType Feed Plan Guard ----------------
    console.log("\n--- 2. Guard: Campus + Category + ListingType Feed Query Plan ---");
    const filteredFeedExplain = (await ListingModel.find({
      status: "active",
      campus: "ABU Zaria",
      category: "Electronics",
      listingType: "product",
    })
      .sort({ createdAt: -1, _id: -1 })
      .limit(30)
      .explain("executionStats")) as any;
    const filteredStats = filteredFeedExplain.executionStats;
    const filteredPlan = extractPlanDetails(filteredStats.executionStages);

    assert(!filteredPlan.hasCollScan, "Filtered feed strictly does NOT use COLLSCAN");
    assert(!filteredPlan.hasSortStage, "Filtered feed index provides sorted order: NO in-memory SORT stage");
    assert(
      filteredStats.totalDocsExamined === filteredStats.nReturned,
      `Docs examined (${filteredStats.totalDocsExamined}) strictly equals returned (${filteredStats.nReturned})`
    );
    assert(
      filteredPlan.indexUsed === "status_1_campus_1_category_1_listingType_1_createdAt_-1__id_-1",
      `Used correct compound ESR index '${filteredPlan.indexUsed}'`
    );

    // ---------------- 3. Store Directory Plan Guard ----------------
    console.log("\n--- 3. Guard: Store Directory Query Plan ---");
    const storeExplain = (await StoreModel.find({ status: "active", campus: "ABU Zaria" })
      .sort({ "metrics.rating": -1, createdAt: -1 })
      .limit(20)
      .explain("executionStats")) as any;
    const storeStats = storeExplain.executionStats;
    const storePlan = extractPlanDetails(storeStats.executionStages);

    assert(!storePlan.hasCollScan, "Store directory strictly does NOT use COLLSCAN");
    assert(!storePlan.hasSortStage, "Store directory index matches rating sort: NO in-memory SORT stage");
    assert(
      storeStats.totalDocsExamined === storeStats.nReturned,
      `Docs examined (${storeStats.totalDocsExamined}) strictly equals returned (${storeStats.nReturned})`
    );
    assert(
      storePlan.indexUsed === "status_1_campus_1_metrics.rating_-1_createdAt_-1",
      `Used correct compound ESR index '${storePlan.indexUsed}'`
    );

    // ---------------- 4. Conversation Inbox List (Express Path) ----------------
    console.log("\n--- 4. Guard: Conversation List (Express Path) ---");
    const convExpressExplain = (await ConversationModel.find({
      participants: user._id as any,
      status: "active",
    })
      .sort({ "lastMessage.time": -1, _id: -1 })
      .limit(30)
      .explain("executionStats")) as any;
    const convExpressStats = convExpressExplain.executionStats;
    const convExpressPlan = extractPlanDetails(convExpressStats.executionStages);

    assert(!convExpressPlan.hasCollScan, "Express inbox query strictly does NOT use COLLSCAN");
    assert(!convExpressPlan.hasSortStage, "Express inbox index provides sorted order: NO in-memory SORT stage");
    assert(
      convExpressStats.totalDocsExamined === convExpressStats.nReturned,
      `Docs examined (${convExpressStats.totalDocsExamined}) strictly equals returned (${convExpressStats.nReturned})`
    );
    assert(
      convExpressPlan.indexUsed === "participants_1_status_1_lastMessage.time_-1__id_-1",
      `Used correct multikey index '${convExpressPlan.indexUsed}'`
    );

    // ---------------- 5. Conversation Inbox List (Next.js Path) ----------------
    console.log("\n--- 5. Guard: Conversation List (Next.js Path) ---");
    const convNextExplain = (await ConversationModel.find({
      participantIds: user._id.toString(),
      status: "active",
    })
      .sort({ updatedAt: -1, _id: -1 })
      .limit(30)
      .explain("executionStats")) as any;
    const convNextStats = convNextExplain.executionStats;
    const convNextPlan = extractPlanDetails(convNextStats.executionStages);

    assert(!convNextPlan.hasCollScan, "Next.js inbox query strictly does NOT use COLLSCAN");
    assert(!convNextPlan.hasSortStage, "Next.js inbox index provides sorted order: NO in-memory SORT stage");
    assert(
      convNextStats.totalDocsExamined === convNextStats.nReturned,
      `Docs examined (${convNextStats.totalDocsExamined}) strictly equals returned (${convNextStats.nReturned})`
    );
    assert(
      convNextPlan.indexUsed === "participantIds_1_status_1_updatedAt_-1__id_-1",
      `Used correct unified index '${convNextPlan.indexUsed}'`
    );

    // ---------------- 6. Unlinked Listings Picker Guard ----------------
    console.log("\n--- 6. Guard: Unlinked Listings Picker Query ---");
    const unlinkedExplain = (await ListingModel.find({
      sellerId: user._id.toString(),
      storeId: { $in: [null, undefined] } as any,
      status: "active",
    })
      .limit(30)
      .explain("executionStats")) as any;
    const unlinkedStats = unlinkedExplain.executionStats;
    const unlinkedPlan = extractPlanDetails(unlinkedStats.executionStages);

    assert(!unlinkedPlan.hasCollScan, "Unlinked listings query strictly does NOT use COLLSCAN");
    assert(
      unlinkedPlan.indexUsed === "sellerId_1_storeId_1_status_1" ||
        unlinkedPlan.indexUsed === "sellerId_1_status_1",
      `Used seller index '${unlinkedPlan.indexUsed}'`
    );

    // ---------------- 7. Composite Keyset Cursor Pagination Guard ----------------
    console.log("\n--- 7. Guard: Keyset Cursor Pagination (createdAt, _id) ---");
    const cursorProbe = await ListingModel.find({ status: "active" })
      .sort({ createdAt: -1, _id: -1 })
      .skip(20)
      .limit(1)
      .lean();
    const probe = cursorProbe[0] as any;

    const cursorExplain = (await ListingModel.find({
      status: "active",
      $or: [
        { createdAt: { $lt: probe.createdAt } },
        { createdAt: probe.createdAt, _id: { $lt: probe._id } },
      ],
    })
      .sort({ createdAt: -1, _id: -1 })
      .limit(30)
      .explain("executionStats")) as any;
    const cursorStats = cursorExplain.executionStats;
    const cursorPlan = extractPlanDetails(cursorStats.executionStages);

    assert(!cursorPlan.hasCollScan, "Keyset cursor pagination strictly does NOT use COLLSCAN");
    assert(!cursorPlan.hasSortStage, "Keyset cursor pagination strictly does NOT use in-memory SORT");
    assert(
      cursorPlan.indexUsed === "status_1_createdAt_-1__id_-1",
      `Used correct compound cursor index '${cursorPlan.indexUsed}'`
    );

    // ---------------- 8. Message Thread History Plan Guard ----------------
    console.log("\n--- 8. Guard: Messages History Query Plan ---");
    const msgExplain = (await MessageModel.find({ conversationId: (conv as any)._id })
      .sort({ createdAt: -1, _id: -1 })
      .limit(50)
      .explain("executionStats")) as any;
    const msgStats = msgExplain.executionStats;
    const msgPlan = extractPlanDetails(msgStats.executionStages);

    assert(!msgPlan.hasCollScan, "Messages thread strictly does NOT use COLLSCAN");
    assert(!msgPlan.hasSortStage, "Messages index provides sorted order: NO in-memory SORT stage");
    assert(
      msgStats.totalDocsExamined === msgStats.nReturned,
      `Docs examined (${msgStats.totalDocsExamined}) strictly equals returned (${msgStats.nReturned})`
    );
    assert(
      msgPlan.indexUsed === "conversationId_1_createdAt_1__id_1",
      `Used compound index '${msgPlan.indexUsed}'`
    );

    // ---------------- 9. Seller Orders & Recent Activity Plan Guard ----------------
    console.log("\n--- 9. Guard: Seller Orders Index & Recent Activity Query Plan ---");
    const sellerIdSample = new mongoose.Types.ObjectId().toString();
    const orderExplain = (await OrderModel.find({ sellerId: sellerIdSample })
      .sort({ createdAt: -1 })
      .limit(10)
      .explain("executionStats")) as any;
    const orderStats = orderExplain.executionStats;
    const orderPlan = extractPlanDetails(orderStats.executionStages);

    assert(!orderPlan.hasCollScan, "Seller orders index query strictly does NOT use COLLSCAN");
    assert(!orderPlan.hasSortStage, "Seller orders index provides sorted order: NO in-memory SORT stage");
    const indexName = String(orderPlan.indexUsed || "");
    assert(
      indexName.includes("sellerId_1_createdAt_-1") ||
        indexName.includes("sellerId_1_status_1_createdAt_-1"),
      `Used seller orders compound index '${orderPlan.indexUsed}'`
    );

    // ---------------- 10. Seller Listings Stats Plan Guard ----------------
    console.log("\n--- 10. Guard: Seller Listings Status Stats Query Plan ---");
    const listingStatsExplain = (await ListingModel.find({
      sellerId: sellerIdSample,
      status: "active",
    })
      .limit(10)
      .explain("executionStats")) as any;
    const listingStatsStats = listingStatsExplain.executionStats;
    const listingStatsPlan = extractPlanDetails(listingStatsStats.executionStages);

    assert(!listingStatsPlan.hasCollScan, "Seller listing stats query strictly does NOT use COLLSCAN");
    assert(
      listingStatsPlan.indexUsed === "sellerId_1_status_1",
      `Used seller listing status compound index '${listingStatsPlan.indexUsed}'`
    );

    // ---------------- 11. Seller Reviews Public List Plan Guard ----------------
    console.log("\n--- 11. Guard: Seller Reviews Public List Query Plan ---");
    const reviewExplain = (await ReviewModel.find({
      sellerId: sellerIdSample,
      status: "published",
    })
      .sort({ createdAt: -1, _id: -1 })
      .limit(20)
      .explain("executionStats")) as any;
    const reviewStats = reviewExplain.executionStats;
    const reviewPlan = extractPlanDetails(reviewStats.executionStages);

    assert(!reviewPlan.hasCollScan, "Seller reviews public query strictly does NOT use COLLSCAN");
    assert(!reviewPlan.hasSortStage, "Seller reviews public query uses index order: NO in-memory SORT");
    assert(
      reviewPlan.indexUsed === "sellerId_1_status_1_createdAt_-1__id_-1",
      `Used seller reviews compound index '${reviewPlan.indexUsed}'`
    );

    // ---------------- 12. Review Uniqueness Backstop Plan Guard ----------------
    console.log("\n--- 12. Guard: Review Transaction Uniqueness Lookup Plan ---");
    const sampleOrderId = new mongoose.Types.ObjectId().toString();
    const uniqueReviewExplain = (await ReviewModel.findOne({
      reviewerId: sellerIdSample,
      orderId: sampleOrderId,
    }).explain("executionStats")) as any;
    const uniqueReviewStats = uniqueReviewExplain.executionStats;
    const uniqueReviewPlan = extractPlanDetails(uniqueReviewStats.executionStages);

    assert(!uniqueReviewPlan.hasCollScan, "Review uniqueness lookup strictly does NOT use COLLSCAN");
    assert(
      uniqueReviewPlan.indexUsed === "reviewerId_1_orderId_1",
      `Used reviewer-order compound unique index '${uniqueReviewPlan.indexUsed}'`
    );

    console.log("\n==================================================================");
    console.log(` ALL CI QUERY PLAN GUARDS PASSED: ${passed} PASSED | ${failed} FAILED`);
    console.log("==================================================================");
  } finally {
    await mongoose.disconnect();
    await replSet.stop();
  }
}

runCiQueryPlanCheck()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("CI Query Plan Check failed:", err);
    process.exit(1);
  });
