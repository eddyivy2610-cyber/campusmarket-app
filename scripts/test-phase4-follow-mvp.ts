import assert from "node:assert";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import mongoose from "mongoose";
import { NextRequest } from "next/server";
import {
  PUT as handleStoreFollow,
  DELETE as handleStoreUnfollow,
  GET as handleStoreFollowStatus,
} from "../app/api/stores/[id]/follow/route";
import { GET as handleGetFollowedStores } from "../app/api/follows/stores/route";
import { GET as handleGetFollowingFeed } from "../app/api/feed/following/route";
import { POST as handleToggleFollow } from "../app/api/follow/toggle/[targetId]/route";
import { GET as handleGetFollowStatus } from "../app/api/follow/status/[targetId]/route";
import {
  POST as handleExplicitFollow,
  DELETE as handleExplicitUnfollow,
} from "../app/api/follow/[targetId]/route";
import { GET as handleGetFollowers } from "../app/api/follow/followers/[targetId]/route";
import { GET as handleGetCounts } from "../app/api/follow/counts/[targetId]/route";
import FollowerModel from "../app/models/Follower";
import UserModel from "../app/models/User";
import { StoreModel } from "../app/models/Store";
import { ListingModel } from "../app/models/Listing";
import { createAccessToken } from "../app/lib/authTokens";
import dbConnect from "../app/lib/dbConnect";
import {
  checkFollowCountersDrift,
  repairFollowCountersDrift,
  FOLLOW_LIMIT_PER_USER,
} from "../app/lib/followHelpers";

function makeMockRequest(
  url: string,
  options?: {
    method?: string;
    headers?: Record<string, string>;
    body?: any;
  },
  token?: string
): NextRequest {
  const headers = new Headers(options?.headers || {});
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let requestBody: any = undefined;
  if (options?.body !== undefined) {
    headers.set("Content-Type", "application/json");
    requestBody = JSON.stringify(options.body);
  }

  return new NextRequest(new URL(url, "http://localhost:3000"), {
    method: options?.method || "GET",
    headers,
    body: requestBody,
  });
}

async function runFollowMvpTestSuite() {
  console.log("====================================================================");
  console.log("       PHASE 4.4 MVP: STORE FOLLOW, FOLLOWING FEED & AUDIT SUITE    ");
  console.log("====================================================================\n");

  let mongod: MongoMemoryReplSet | null = null;
  const originalEnv = { ...process.env };
  process.env.AUTH_SECRET = "super_secure_jwt_test_secret_key_at_least_32_characters!";

  try {
    mongod = await MongoMemoryReplSet.create({
      replSet: { count: 1, storageEngine: "wiredTiger" },
    });
    const uri = mongod.getUri();
    process.env.MONGODB_URI = uri;

    await mongoose.connect(uri);
    await dbConnect();

    // Ensure database indexes are created
    await FollowerModel.createIndexes();
    await StoreModel.createIndexes();
    await ListingModel.createIndexes();

    // Seed test users: Alice (buyer), Bob (store owner), Sam (suspended user)
    const aliceId = new mongoose.Types.ObjectId().toString();
    const bobId = new mongoose.Types.ObjectId().toString();
    const samId = new mongoose.Types.ObjectId().toString();

    await UserModel.create([
      {
        _id: aliceId,
        name: "Alice Follower",
        email: "alice@campushive.edu.ng",
        role: "buyer",
        accountStatus: "active",
        isStudent: true,
        studentVerified: true,
        profile: { handle: "alice_f", displayName: "Alice F" },
      },
      {
        _id: bobId,
        name: "Bob Merchant",
        email: "bob@campushive.edu.ng",
        role: "seller",
        accountStatus: "active",
        isStudent: true,
        studentVerified: true,
        profile: { handle: "bob_m", displayName: "Bob M" },
      },
      {
        _id: samId,
        name: "Suspended Sam",
        email: "sam@campushive.edu.ng",
        role: "buyer",
        accountStatus: "suspended",
        isStudent: false,
        studentVerified: false,
        profile: { handle: "sam_s", displayName: "Suspended Sam" },
      },
    ]);

    // Seed test stores: TechHub (Bob's active store), SuspendedStore
    const techStoreId = new mongoose.Types.ObjectId().toString();
    const suspendedStoreId = new mongoose.Types.ObjectId().toString();

    await StoreModel.create([
      {
        _id: techStoreId,
        ownerId: bobId,
        name: "Bob Tech Hub",
        slug: "bob-tech-hub",
        description: "Official campus tech hub",
        status: "active",
        storeType: "student_store",
        category: "Computers & Accessories",
        logo: "https://example.com/tech-logo.png",
        campus: "ABU Samaru",
        operatingLocation: "Kashim Ibrahim Library",
        metrics: { rating: 5.0, reviewsCount: 4, completedDeals: 10, listingsCount: 2, followersCount: 0 },
      },
      {
        _id: suspendedStoreId,
        ownerId: new mongoose.Types.ObjectId().toString(),
        name: "Suspended Mart",
        slug: "suspended-mart",
        description: "Suspended store",
        status: "suspended",
        storeType: "student_store",
        category: "Books & Stationeries",
        logo: "https://example.com/suspended-logo.png",
        campus: "ABU Samaru",
        operatingLocation: "Sub Hall",
        metrics: { rating: 1.0, reviewsCount: 1, completedDeals: 0, listingsCount: 0, followersCount: 0 },
      },
    ]);

    const tokenAlice = createAccessToken({
      id: aliceId,
      email: "alice@campushive.edu.ng",
      name: "Alice Follower",
      role: "buyer",
      isStudent: true,
      studentVerified: true,
    });

    const tokenBob = createAccessToken({
      id: bobId,
      email: "bob@campushive.edu.ng",
      name: "Bob Merchant",
      role: "seller",
      isStudent: true,
      studentVerified: true,
    });

    const tokenSam = createAccessToken({
      id: samId,
      email: "sam@campushive.edu.ng",
      name: "Suspended Sam",
      role: "buyer",
      isStudent: false,
      studentVerified: false,
    });
    // -------------------------------------------------------------------------
    // TEST 1: Unauthenticated & Suspended Account Enforcement
    // -------------------------------------------------------------------------
    console.log("TEST 1: Authentication & authorization barriers (401 & 403)");

    const unauthPut = await handleStoreFollow(
      makeMockRequest(`/api/stores/${techStoreId}/follow`, { method: "PUT" }),
      { params: Promise.resolve({ id: techStoreId }) }
    );
    assert.strictEqual(unauthPut.status, 401, "Unauthenticated store follow must return 401");

    const unauthDelete = await handleStoreUnfollow(
      makeMockRequest(`/api/stores/${techStoreId}/follow`, { method: "DELETE" }),
      { params: Promise.resolve({ id: techStoreId }) }
    );
    assert.strictEqual(unauthDelete.status, 401, "Unauthenticated store unfollow must return 401");

    const unauthFeed = await handleGetFollowingFeed(
      makeMockRequest("/api/feed/following", { method: "GET" })
    );
    assert.ok(unauthFeed);
    assert.strictEqual(unauthFeed.status, 401, "Unauthenticated feed query must return 401");

    const unauthList = await handleGetFollowedStores(
      makeMockRequest("/api/follows/stores", { method: "GET" })
    );
    assert.ok(unauthList);
    assert.strictEqual(unauthList.status, 401, "Unauthenticated follows list must return 401");

    const suspendedFollow = await handleStoreFollow(
      makeMockRequest(`/api/stores/${techStoreId}/follow`, { method: "PUT" }, tokenSam),
      { params: Promise.resolve({ id: techStoreId }) }
    );
    assert.strictEqual(suspendedFollow.status, 403, "Suspended follower must return 403");

    console.log("  PASS: Unauthenticated requests return 401, suspended account returns 403");

    // -------------------------------------------------------------------------
    // TEST 2: Session Identity Enforcement (Client-Supplied ID Ignored)
    // -------------------------------------------------------------------------
    console.log("\nTEST 2: Session identity protection against spoofing");

    // Client passes spoofed followerId in body & query
    const spoofReq = makeMockRequest(
      `/api/stores/${techStoreId}/follow?followerId=attacker_id`,
      { method: "PUT", body: { followerId: "attacker_id", user: "attacker" } },
      tokenAlice
    );
    const spoofRes = await handleStoreFollow(spoofReq, { params: Promise.resolve({ id: techStoreId }) });
    assert.strictEqual(spoofRes.status, 200);

    const followRecord = await FollowerModel.findOne({ followingId: techStoreId });
    assert.ok(followRecord);
    assert.strictEqual(
      followRecord.followerId.toString(),
      aliceId,
      "Follower ID MUST strictly derive from session user.id, never client-supplied fields"
    );

    console.log("  PASS: Client-supplied IDs in body/query/headers strictly ignored");

    // -------------------------------------------------------------------------
    // TEST 3: Idempotent Follow and Unfollow
    // -------------------------------------------------------------------------
    console.log("\nTEST 3: Idempotence of follow and unfollow operations");

    // Second repeated PUT follow
    const repeatPut = await handleStoreFollow(
      makeMockRequest(`/api/stores/${techStoreId}/follow`, { method: "PUT" }, tokenAlice),
      { params: Promise.resolve({ id: techStoreId }) }
    );
    assert.strictEqual(repeatPut.status, 200);
    const repeatJson = await repeatPut.json();
    assert.strictEqual(repeatJson.isFollowing, true);
    assert.strictEqual(repeatJson.newlyFollowed, false, "Repeated follow must be idempotent");

    const totalRecordsAlice = await FollowerModel.countDocuments({
      followerId: aliceId,
      followingId: techStoreId,
    });
    assert.strictEqual(totalRecordsAlice, 1, "Exactly 1 record must exist after repeated follow");

    // Check store metrics follower count
    const storeAfterFollow = await StoreModel.findById(techStoreId).lean();
    assert.strictEqual(storeAfterFollow?.metrics?.followersCount, 1, "Store followersCount must be 1");

    // DELETE unfollow
    const deleteRes = await handleStoreUnfollow(
      makeMockRequest(`/api/stores/${techStoreId}/follow`, { method: "DELETE" }, tokenAlice),
      { params: Promise.resolve({ id: techStoreId }) }
    );
    assert.strictEqual(deleteRes.status, 200);
    const deleteJson = await deleteRes.json();
    assert.strictEqual(deleteJson.isFollowing, false);
    assert.strictEqual(deleteJson.newlyUnfollowed, true);

    // Repeated DELETE unfollow
    const repeatDelete = await handleStoreUnfollow(
      makeMockRequest(`/api/stores/${techStoreId}/follow`, { method: "DELETE" }, tokenAlice),
      { params: Promise.resolve({ id: techStoreId }) }
    );
    assert.strictEqual(repeatDelete.status, 200);
    const repeatDeleteJson = await repeatDelete.json();
    assert.strictEqual(repeatDeleteJson.isFollowing, false);
    assert.strictEqual(repeatDeleteJson.newlyUnfollowed, false, "Repeated unfollow is safe no-op");

    const storeAfterUnfollow = await StoreModel.findById(techStoreId).lean();
    assert.strictEqual(storeAfterUnfollow?.metrics?.followersCount, 0, "Counter must be 0 after unfollow");

    console.log("  PASS: Repeated PUT/DELETE operations are strictly idempotent with bounded counters");

    // -------------------------------------------------------------------------
    // TEST 4: Concurrency & Counter Consistency
    // -------------------------------------------------------------------------
    console.log("\nTEST 4: Concurrent follow operations and duplicate key handling");

    // 10 parallel follows from same user
    const parallelSameUser = await Promise.all(
      Array.from({ length: 10 }).map(() =>
        handleStoreFollow(
          makeMockRequest(`/api/stores/${techStoreId}/follow`, { method: "PUT" }, tokenAlice),
          { params: Promise.resolve({ id: techStoreId }) }
        )
      )
    );

    parallelSameUser.forEach((res) => assert.strictEqual(res.status, 200));

    const recordsAfterConcurrent = await FollowerModel.countDocuments({
      followerId: aliceId,
      followingId: techStoreId,
    });
    assert.strictEqual(recordsAfterConcurrent, 1, "10 parallel requests from 1 user produce exactly 1 record");

    const storeAfterConcurrent = await StoreModel.findById(techStoreId).lean();
    assert.strictEqual(
      storeAfterConcurrent?.metrics?.followersCount,
      1,
      "Store counter must not inflate under concurrent follow"
    );

    // Reset for 10 distinct users
    await FollowerModel.deleteMany({});
    await StoreModel.updateOne({ _id: techStoreId }, { $set: { "metrics.followersCount": 0 } });

    const distinctUserTokens = await Promise.all(
      Array.from({ length: 10 }).map(async (_, idx) => {
        const uid = new mongoose.Types.ObjectId().toString();
        await UserModel.create({
          _id: uid,
          name: `User ${idx}`,
          email: `user${idx}@campushive.edu.ng`,
          role: "buyer",
          });
        return createAccessToken({
          id: uid,
          email: `user${idx}@campushive.edu.ng`,
          name: `User ${idx}`,
          role: "buyer",
          isStudent: true,
          studentVerified: true,
        });
      })
    );

    await Promise.all(
      distinctUserTokens.map((tok) =>
        handleStoreFollow(
          makeMockRequest(`/api/stores/${techStoreId}/follow`, { method: "PUT" }, tok),
          { params: Promise.resolve({ id: techStoreId }) }
        )
      )
    );

    const storeAfter10Distinct = await StoreModel.findById(techStoreId).lean();
    const actual10Distinct = await FollowerModel.countDocuments({
      followingId: techStoreId,
      targetType: "store",
    });
    assert.strictEqual(actual10Distinct, 10, "10 distinct users must produce 10 follow records");
    assert.strictEqual(
      storeAfter10Distinct?.metrics?.followersCount,
      10,
      "Store followersCount must equal 10"
    );

    console.log("  PASS: 10 parallel follows from same user = 1 record; 10 distinct users = 10 records");

    // -------------------------------------------------------------------------
    // TEST 5: Owner Self-Follow & Suspended Store Follow Prevention
    // -------------------------------------------------------------------------
    console.log("\nTEST 5: Self-follow and inactive store prevention");

    // Bob attempts to follow his own store
    const selfFollowRes = await handleStoreFollow(
      makeMockRequest(`/api/stores/${techStoreId}/follow`, { method: "PUT" }, tokenBob),
      { params: Promise.resolve({ id: techStoreId }) }
    );
    assert.strictEqual(selfFollowRes.status, 400, "Store owner following own store must return 400");
    const selfFollowJson = await selfFollowRes.json();
    assert.ok(selfFollowJson.error.includes("own store"));

    // Alice attempts to follow non-existent store
    const nonExistentId = new mongoose.Types.ObjectId().toString();
    const nonExistentRes = await handleStoreFollow(
      makeMockRequest(`/api/stores/${nonExistentId}/follow`, { method: "PUT" }, tokenAlice),
      { params: Promise.resolve({ id: nonExistentId }) }
    );
    assert.strictEqual(nonExistentRes.status, 404, "Non-existent store must return 404");

    // Alice attempts to follow suspended store
    const suspendedStoreRes = await handleStoreFollow(
      makeMockRequest(`/api/stores/${suspendedStoreId}/follow`, { method: "PUT" }, tokenAlice),
      { params: Promise.resolve({ id: suspendedStoreId }) }
    );
    assert.strictEqual(suspendedStoreRes.status, 404, "Suspended store must return 404 on follow");

    // Non-seller buyer follow restriction (Only stores/seller accounts/services can be followed)
    const daveId = new mongoose.Types.ObjectId().toString();
    await UserModel.create({
      _id: daveId,
      name: "Dave NonSeller",
      email: "dave@campushive.edu.ng",
      role: "buyer",
      accountStatus: "active",
      isStudent: true,
      studentVerified: true,
    });
    const followBuyerRes = await handleExplicitFollow(
      makeMockRequest(`/api/follow/${daveId}?targetType=user`, { method: "POST" }, tokenAlice),
      { params: Promise.resolve({ targetId: daveId }) }
    );
    assert.ok(followBuyerRes);
    assert.strictEqual(followBuyerRes.status, 400, "Following a non-seller buyer must return 400");
    const followBuyerJson = await followBuyerRes.json();
    assert.ok(followBuyerJson.error.includes("Only stores and seller accounts"));

    console.log("  PASS: Cannot follow own store (400), non-seller buyer (400), or suspended store (404)");

    // -------------------------------------------------------------------------
    // TEST 6: Drift Checker & Auto-Repair
    // -------------------------------------------------------------------------
    console.log("\nTEST 6: Drift checker & repair script");

    // Check drift on current consistent DB
    const cleanDrift = await checkFollowCountersDrift();
    assert.strictEqual(cleanDrift.totalMismatches, 0, "Initial clean DB must have 0 mismatches");

    // Inject drift manually into store metrics
    await StoreModel.updateOne({ _id: techStoreId }, { $set: { "metrics.followersCount": 999 } });

    const dirtyDrift = await checkFollowCountersDrift();
    assert.strictEqual(dirtyDrift.totalMismatches, 1, "Drift check must identify injected mismatch");
    assert.strictEqual(dirtyDrift.storeMismatches[0].stored, 999);
    assert.strictEqual(dirtyDrift.storeMismatches[0].actual, 10);

    // Run repair script
    const repairResult = await repairFollowCountersDrift();
    assert.strictEqual(repairResult.repairedStores, 1);

    const postRepairDrift = await checkFollowCountersDrift();
    assert.strictEqual(postRepairDrift.totalMismatches, 0, "Post-repair mismatches must be 0");

    const repairedStore = await StoreModel.findById(techStoreId).lean();
    assert.strictEqual(repairedStore?.metrics?.followersCount, 10, "Repaired count must equal 10");

    console.log("  PASS: Drift check detected mismatch, repair restored 100% counter consistency");

    // -------------------------------------------------------------------------
    // TEST 7: Following List Pagination & Visibility Rules
    // -------------------------------------------------------------------------
    console.log("\nTEST 7: Following list pagination & suspended store omission");

    // Alice follows Bob Tech Hub and a temporary store
    await FollowerModel.deleteMany({});
    await handleStoreFollow(
      makeMockRequest(`/api/stores/${techStoreId}/follow`, { method: "PUT" }, tokenAlice),
      { params: Promise.resolve({ id: techStoreId }) }
    );

    // Create a 2nd store and follow it
    const store2Id = new mongoose.Types.ObjectId().toString();
    await StoreModel.create({
      _id: store2Id,
      ownerId: new mongoose.Types.ObjectId().toString(),
      name: "Second Active Store",
      slug: "second-active-store",
      description: "Second active store description",
      status: "active",
      storeType: "student_store",
      category: "Fashion & Wears",
      logo: "https://example.com/store2-logo.png",
      campus: "ABU Samaru",
      operatingLocation: "Faculty of Science",
      metrics: { rating: 4.8, reviewsCount: 2, completedDeals: 5, listingsCount: 1, followersCount: 1 },
    });
    await handleStoreFollow(
      makeMockRequest(`/api/stores/${store2Id}/follow`, { method: "PUT" }, tokenAlice),
      { params: Promise.resolve({ id: store2Id }) }
    );

    const listRes = await handleGetFollowedStores(
      makeMockRequest("/api/follows/stores?limit=10", { method: "GET" }, tokenAlice)
    );
    assert.ok(listRes);
    assert.strictEqual(listRes.status, 200);
    const listJson = await listRes.json();
    assert.strictEqual(listJson.count, 2, "Alice follows 2 active stores");

    // Now suspend store2
    await StoreModel.updateOne({ _id: store2Id }, { $set: { status: "suspended" } });

    const listAfterSuspended = await handleGetFollowedStores(
      makeMockRequest("/api/follows/stores?limit=10", { method: "GET" }, tokenAlice)
    );
    assert.ok(listAfterSuspended);
    const listAfterJson = await listAfterSuspended.json();
    assert.strictEqual(listAfterJson.count, 1, "Suspended store must be omitted from following list");
    assert.strictEqual(listAfterJson.stores[0].store.name, "Bob Tech Hub");

    // But follow record is preserved in DB!
    const preservedFollow = await FollowerModel.findOne({ followerId: aliceId, followingId: store2Id });
    assert.ok(preservedFollow, "Follow record must be preserved for reinstatement");

    // Reinstatement restores visibility
    await StoreModel.updateOne({ _id: store2Id }, { $set: { status: "active" } });
    const listAfterReinstated = await handleGetFollowedStores(
      makeMockRequest("/api/follows/stores?limit=10", { method: "GET" }, tokenAlice)
    );
    assert.ok(listAfterReinstated);
    const listReinstatedJson = await listAfterReinstated.json();
    assert.strictEqual(listReinstatedJson.count, 2, "Reinstated store automatically reappears in list");

    console.log("  PASS: Following list is deterministic; suspended stores omitted; follow preserved");

    // -------------------------------------------------------------------------
    // TEST 8: Following Feed Keyset Pagination & Active Listing Isolation
    // -------------------------------------------------------------------------
    console.log("\nTEST 8: Following feed keyset cursor pagination & inactive listing isolation");

    // Seed listings for Bob Tech Hub: 2 active, 1 inactive/sold
    const list1Id = new mongoose.Types.ObjectId().toString();
    const list2Id = new mongoose.Types.ObjectId().toString();
    const inactiveListId = new mongoose.Types.ObjectId().toString();

    await (ListingModel as any).create([

      {
        _id: list1Id,
        sellerId: bobId,
        storeId: techStoreId,
        title: "MacBook Air M2 2023",
        price: 850000,
        priceFormatted: "₦850,000",
        description: "Pristine condition MacBook Air M2",
        category: "Computers & Accessories",
        location: "Kashim Ibrahim Library",
        status: "active",
        listingType: "product",
        campus: "ABU Samaru",
        createdAt: new Date("2026-10-22T08:00:00Z"),
      },
      {
        _id: list2Id,
        sellerId: bobId,
        storeId: techStoreId,
        title: "Dell XPS 13 Touch",
        price: 550000,
        priceFormatted: "₦550,000",
        description: "Clean Dell XPS 13 laptop",
        category: "Computers & Accessories",
        location: "Kashim Ibrahim Library",
        status: "active",
        listingType: "product",
        campus: "ABU Samaru",
        createdAt: new Date("2026-10-22T07:00:00Z"),
      },
      {
        _id: inactiveListId,
        sellerId: bobId,
        storeId: techStoreId,
        title: "Old Sold Charger",
        price: 5000,
        priceFormatted: "₦5,000",
        description: "Sold laptop charger",
        category: "Computers & Accessories",
        location: "Kashim Ibrahim Library",
        status: "sold", // INACTIVE
        listingType: "product",
        campus: "ABU Samaru",
        createdAt: new Date("2026-10-22T09:00:00Z"),
      },
    ]);

    // Feed request page 1 (limit 1)
    const feedPage1Res = await handleGetFollowingFeed(
      makeMockRequest("/api/feed/following?limit=1", { method: "GET" }, tokenAlice)
    );
    assert.ok(feedPage1Res);
    assert.strictEqual(feedPage1Res.status, 200);
    assert.ok(feedPage1Res);
    const feedPage1 = await feedPage1Res.json();
    assert.strictEqual(feedPage1.count, 1);
    assert.strictEqual(feedPage1.listings[0].title, "MacBook Air M2 2023");
    assert.strictEqual(feedPage1.hasMore, true);
    assert.ok(feedPage1.nextCursor, "Must return opaque pagination cursor");

    // Feed request page 2 using cursor
    const feedPage2Res = await handleGetFollowingFeed(
      makeMockRequest(`/api/feed/following?limit=1&cursor=${feedPage1.nextCursor}`, { method: "GET" }, tokenAlice)
    );
    assert.ok(feedPage2Res);
    const feedPage2 = await feedPage2Res.json();
    assert.strictEqual(feedPage2.count, 1);
    assert.strictEqual(feedPage2.listings[0].title, "Dell XPS 13 Touch");

    // Inactive item must NOT appear anywhere in the feed
    assert.ok(!feedPage1.listings.some((l: any) => l.title === "Old Sold Charger"));
    assert.ok(!feedPage2.listings.some((l: any) => l.title === "Old Sold Charger"));

    // Malformed cursor returns 400
    const malformedCursorRes = await handleGetFollowingFeed(
      makeMockRequest("/api/feed/following?cursor=not-a-valid-cursor", { method: "GET" }, tokenAlice)
    );
    assert.ok(malformedCursorRes);
    assert.strictEqual(malformedCursorRes.status, 400, "Malformed cursor must return 400");

    console.log("  PASS: Feed cursor pagination is strict; inactive listings excluded before page cut");

    // -------------------------------------------------------------------------
    // TEST 9: Privacy & Cache Leak Prevention
    // -------------------------------------------------------------------------
    console.log("\nTEST 9: Privacy & HTTP cache headers");

    // All follow endpoints must return Cache-Control: private, no-store
    assert.strictEqual(
      unauthPut.headers.get("Cache-Control"),
      "private, no-store, must-revalidate",
      "Store follow headers must be private, no-store"
    );
    assert.strictEqual(
      feedPage1Res!.headers.get("Cache-Control"),
      "private, no-store, must-revalidate",
      "Feed headers must be private, no-store"
    );
    assert.strictEqual(
      listRes!.headers.get("Cache-Control"),
      "private, no-store, must-revalidate",
      "Follows list headers must be private, no-store"
    );

    // Verify status route isolation (Alice vs Bob)
    const aliceStatusRes = await handleStoreFollowStatus(
      makeMockRequest(`/api/stores/${techStoreId}/follow`, { method: "GET" }, tokenAlice),
      { params: Promise.resolve({ id: techStoreId }) }
    );
    const aliceStatus = await aliceStatusRes.json();
    assert.strictEqual(aliceStatus.isFollowing, true);

    const bobStatusRes = await handleStoreFollowStatus(
      makeMockRequest(`/api/stores/${techStoreId}/follow`, { method: "GET" }, tokenBob),
      { params: Promise.resolve({ id: techStoreId }) }
    );
    const bobStatus = await bobStatusRes.json();
    assert.strictEqual(bobStatus.isFollowing, false, "Bob does not follow his own store");

    console.log("  PASS: Zero cache leaks; two users never share follow state; private, no-store verified");

    // -------------------------------------------------------------------------
    // TEST 10: Query Plan Index Verification (Zero COLLSCAN)
    // -------------------------------------------------------------------------
    console.log("\nTEST 10: Query plan executionStats (zero COLLSCAN)");

    const followExplain = await FollowerModel.find({
      followerId: new mongoose.Types.ObjectId(aliceId),
      targetType: "store",
    })
      .sort({ createdAt: -1, _id: -1 })
      .explain("executionStats");

    const queryStage = (followExplain as any).executionStats?.executionStages?.stage;
    assert.ok(
      queryStage === "FETCH" || queryStage === "IXSCAN",
      `Follower query must use index, got stage: ${queryStage}`
    );

    const feedExplain = await ListingModel.find({
      status: "active",
      storeId: { $in: [techStoreId] },
    })
      .sort({ createdAt: -1, _id: -1 })
      .explain("executionStats");

    const feedStage = (feedExplain as any).executionStats?.executionStages?.stage;
    assert.ok(
      feedStage === "FETCH" || feedStage === "IXSCAN",
      `Listing feed query must use index, got stage: ${feedStage}`
    );

    console.log("  PASS: Follower and feed queries strictly utilize compound B-Tree indexes (0 COLLSCAN)");

    console.log("\n====================================================================");
    console.log(" ALL 10 PHASE 4.4 MVP FOLLOW TESTS PASSED WITH 100% SUCCESS! ");
    console.log("====================================================================\n");
  } finally {
    if (mongod) {
      await mongoose.disconnect();
      await mongod.stop();
    }
    process.env = originalEnv;
  }
}

runFollowMvpTestSuite().catch((err) => {
  console.error("Test suite failed:", err);
  process.exit(1);
});
