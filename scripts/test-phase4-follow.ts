import assert from "node:assert";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import mongoose from "mongoose";
import { NextRequest } from "next/server";
import { POST as handleToggleFollow } from "../app/api/follow/toggle/[targetId]/route";
import { GET as handleGetFollowStatus } from "../app/api/follow/status/[targetId]/route";
import {
  POST as handleExplicitFollow,
  DELETE as handleExplicitUnfollow,
  GET as handleGetFollow,
} from "../app/api/follow/[targetId]/route";
import { GET as handleGetFollowers } from "../app/api/follow/followers/[targetId]/route";
import { GET as handleGetFollowing } from "../app/api/follow/following/[targetId]/route";
import { GET as handleGetCounts } from "../app/api/follow/counts/[targetId]/route";
import FollowerModel from "../app/models/Follower";
import UserModel from "../app/models/User";
import StoreModel from "../app/models/Store";
import { createAccessToken } from "../app/lib/authTokens";
import dbConnect from "../app/lib/dbConnect";

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

async function runFollowTestSuite() {
  console.log("====================================================================");
  console.log("            PHASE 4.4: FOLLOW SYSTEM SECURITY & AUDIT SUITE         ");
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

    // 1. Seed Users: Alice (student buyer), Bob (seller), Suspended Sam
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
        role: "seller",
        accountStatus: "suspended",
        isStudent: false,
        studentVerified: false,
        profile: { handle: "sam_susp", displayName: "Sam Suspended" },
      },
    ] as any);

    // 2. Seed Store owned by Bob
    const bobStore = await StoreModel.create({
      ownerId: bobId,
      name: "Bob's Tech Hub",
      slug: "bobs-tech-hub",
      description: "Laptops and tech accessories on campus",
      storeType: "student_store",
      category: "Electronics",
      campus: "ABU Zaria",
      operatingLocation: "Ribadu Hall Room 12",
      logo: "https://example.com/logo.jpg",
      status: "active",
      isVerified: true,
      verificationType: "student",
      metrics: { rating: 5, reviewsCount: 1, completedDeals: 10, listingsCount: 5, followersCount: 0 },
    });

    const tokenAlice = createAccessToken({
      id: aliceId,
      name: "Alice Follower",
      email: "alice@campushive.edu.ng",
      role: "buyer" as any,
      isStudent: true,
      studentVerified: true,
    });

    const tokenBob = createAccessToken({
      id: bobId,
      name: "Bob Merchant",
      email: "bob@campushive.edu.ng",
      role: "seller" as any,
      isStudent: true,
      studentVerified: true,
    });

    // -------------------------------------------------------------------------
    // TEST 1: Unauthenticated Requests Blocked
    // -------------------------------------------------------------------------
    console.log("TEST 1: Unauthenticated follow/toggle operations rejected with 401");
    const unauthToggleRes = await handleToggleFollow(
      makeMockRequest(`/api/follow/toggle/${bobId}`, { method: "POST" }),
      { params: Promise.resolve({ targetId: bobId }) }
    );
    assert.ok(unauthToggleRes);
    assert.strictEqual(unauthToggleRes.status, 401, "Unauthenticated toggle must return 401");

    const unauthFollowRes = await handleExplicitFollow(
      makeMockRequest(`/api/follow/${bobId}`, { method: "POST" }),
      { params: Promise.resolve({ targetId: bobId }) }
    );
    assert.ok(unauthFollowRes);
    assert.strictEqual(unauthFollowRes.status, 401, "Unauthenticated follow must return 401");
    console.log("  PASS: Unauthenticated operations strictly blocked");

    // -------------------------------------------------------------------------
    // TEST 2: Self-Following Prevention (User & Store)
    // -------------------------------------------------------------------------
    console.log("\nTEST 2: Preventing self-following (user following self or own store)");
    // 2a: Alice trying to follow herself
    const selfFollowRes = await handleToggleFollow(
      makeMockRequest(`/api/follow/toggle/${aliceId}`, { method: "POST" }, tokenAlice),
      { params: Promise.resolve({ targetId: aliceId }) }
    );
    assert.ok(selfFollowRes);
    assert.strictEqual(selfFollowRes.status, 400, "Self-following a user must be rejected with 400");
    const selfFollowData = await selfFollowRes.json();
    assert.ok(selfFollowData.error.includes("cannot follow yourself"), "Error must state self-following prohibited");

    // 2b: Bob trying to follow his own store
    const ownStoreFollowRes = await handleToggleFollow(
      makeMockRequest(`/api/follow/toggle/${bobStore._id.toString()}?targetType=store`, { method: "POST" }, tokenBob),
      { params: Promise.resolve({ targetId: bobStore._id.toString() }) }
    );
    assert.ok(ownStoreFollowRes);
    assert.strictEqual(ownStoreFollowRes.status, 400, "Following own store must be rejected with 400");
    console.log("  PASS: Self-following strictly prohibited for both users and store owners");

    // -------------------------------------------------------------------------
    // TEST 3: Database Unique Compound Index Enforcement
    // -------------------------------------------------------------------------
    console.log("\nTEST 3: Enforcing database unique compound index on follow relationships");
    await FollowerModel.createIndexes();
    const indexes = await FollowerModel.collection.indexes();
    const compoundIndex = indexes.find(
      (idx: any) => idx.key && idx.key.followerId === 1 && idx.key.followingId === 1 && idx.key.targetType === 1
    );
    assert.ok(compoundIndex, "Unique compound index { followerId, followingId, targetType } must exist");
    assert.strictEqual(compoundIndex.unique, true, "Compound index must be unique");

    const deterministicIndex = indexes.find(
      (idx: any) =>
        idx.key &&
        idx.key.followingId === 1 &&
        idx.key.targetType === 1 &&
        idx.key.createdAt === -1 &&
        idx.key._id === -1
    );
    assert.ok(deterministicIndex, "Deterministic compound index with _id tie breaker must exist in target database");

    // Attempt direct database insertion of duplicate relationship
    await FollowerModel.create({
      followerId: new mongoose.Types.ObjectId(aliceId),
      followingId: new mongoose.Types.ObjectId(bobId),
      targetType: "user",
    });

    let duplicateThrew = false;
    try {
      await FollowerModel.create({
        followerId: new mongoose.Types.ObjectId(aliceId),
        followingId: new mongoose.Types.ObjectId(bobId),
        targetType: "user",
      });
    } catch (err: any) {
      duplicateThrew = err.code === 11000;
    }
    assert.ok(duplicateThrew, "Database must throw E11000 on duplicate follow relationship");
    await FollowerModel.deleteMany({}); // Clean up test doc
    console.log("  PASS: Database-level unique compound constraint verified");

    // -------------------------------------------------------------------------
    // TEST 4: Idempotent Follow & Unfollow Operations
    // -------------------------------------------------------------------------
    console.log("\nTEST 4: Idempotent follow and unfollow operations");
    // 4a: First explicit follow
    const followRes1 = await handleExplicitFollow(
      makeMockRequest(`/api/follow/${bobId}`, { method: "POST" }, tokenAlice),
      { params: Promise.resolve({ targetId: bobId }) }
    );
    assert.ok(followRes1);
    assert.strictEqual(followRes1.status, 200);
    const followData1 = await followRes1.json();
    assert.strictEqual(followData1.isFollowing, true);
    assert.strictEqual(followData1.newlyFollowed, true);

    // 4b: Second explicit follow (idempotent repeat)
    const followRes2 = await handleExplicitFollow(
      makeMockRequest(`/api/follow/${bobId}`, { method: "POST" }, tokenAlice),
      { params: Promise.resolve({ targetId: bobId }) }
    );
    assert.ok(followRes2);
    assert.strictEqual(followRes2.status, 200);
    const followData2 = await followRes2.json();
    assert.strictEqual(followData2.isFollowing, true);
    assert.strictEqual(followData2.newlyFollowed, false, "Second follow must report newlyFollowed: false");

    // Verify exactly 1 document in database
    const followCount = await FollowerModel.countDocuments({
      followerId: new mongoose.Types.ObjectId(aliceId),
      followingId: new mongoose.Types.ObjectId(bobId),
    });
    assert.strictEqual(followCount, 1, "Exactly one follow relationship must exist in database");

    // 4c: First explicit unfollow
    const unfollowRes1 = await handleExplicitUnfollow(
      makeMockRequest(`/api/follow/${bobId}`, { method: "DELETE" }, tokenAlice),
      { params: Promise.resolve({ targetId: bobId }) }
    );
    assert.ok(unfollowRes1);
    assert.strictEqual(unfollowRes1.status, 200);
    const unfollowData1 = await unfollowRes1.json();
    assert.strictEqual(unfollowData1.isFollowing, false);
    assert.strictEqual(unfollowData1.newlyUnfollowed, true);

    // 4d: Second explicit unfollow (idempotent repeat)
    const unfollowRes2 = await handleExplicitUnfollow(
      makeMockRequest(`/api/follow/${bobId}`, { method: "DELETE" }, tokenAlice),
      { params: Promise.resolve({ targetId: bobId }) }
    );
    assert.ok(unfollowRes2);
    assert.strictEqual(unfollowRes2.status, 200);
    const unfollowData2 = await unfollowRes2.json();
    assert.strictEqual(unfollowData2.isFollowing, false);
    assert.strictEqual(unfollowData2.newlyUnfollowed, false);

    console.log("  PASS: Explicit follow and unfollow are strictly idempotent");

    // -------------------------------------------------------------------------
    // TEST 5: Toggle Follow Compatibility & Concurrency Safety
    // -------------------------------------------------------------------------
    console.log("\nTEST 5: Toggle follow operations and concurrent request safety");
    // Toggle follow ON
    const toggleOnRes = await handleToggleFollow(
      makeMockRequest(`/api/follow/toggle/${bobId}`, { method: "POST" }, tokenAlice),
      { params: Promise.resolve({ targetId: bobId }) }
    );
    assert.ok(toggleOnRes);
    assert.strictEqual(toggleOnRes.status, 200);
    assert.strictEqual((await toggleOnRes.json()).isFollowing, true);

    // Check status
    const statusRes = await handleGetFollowStatus(
      makeMockRequest(`/api/follow/status/${bobId}`, { method: "GET" }, tokenAlice),
      { params: Promise.resolve({ targetId: bobId }) }
    );
    assert.ok(statusRes);
    assert.strictEqual(statusRes.status, 200);
    assert.strictEqual((await statusRes.json()).isFollowing, true);

    // Toggle follow OFF
    const toggleOffRes = await handleToggleFollow(
      makeMockRequest(`/api/follow/toggle/${bobId}`, { method: "POST" }, tokenAlice),
      { params: Promise.resolve({ targetId: bobId }) }
    );
    assert.ok(toggleOffRes);
    assert.strictEqual(toggleOffRes.status, 200);
    assert.strictEqual((await toggleOffRes.json()).isFollowing, false);

    // Test simultaneous toggles canceling out
    await FollowerModel.deleteMany({
      followerId: new mongoose.Types.ObjectId(aliceId),
      followingId: new mongoose.Types.ObjectId(bobId),
    });

    const [toggleRace1, toggleRace2] = await Promise.all([
      handleToggleFollow(
        makeMockRequest(`/api/follow/toggle/${bobId}`, { method: "POST" }, tokenAlice),
        { params: Promise.resolve({ targetId: bobId }) }
      ),
      handleToggleFollow(
        makeMockRequest(`/api/follow/toggle/${bobId}`, { method: "POST" }, tokenAlice),
        { params: Promise.resolve({ targetId: bobId }) }
      ),
    ]);
    assert.ok(toggleRace1 && toggleRace2);
    assert.strictEqual(toggleRace1.status, 200);
    assert.strictEqual(toggleRace2.status, 200);

    const r1Json = await toggleRace1.json();
    const r2Json = await toggleRace2.json();
    const results = [r1Json.isFollowing, r2Json.isFollowing].sort();
    assert.deepStrictEqual(results, [false, true], "Two simultaneous toggles must legitimately cancel each other out");

    const finalRaceDbCount = await FollowerModel.countDocuments({
      followerId: new mongoose.Types.ObjectId(aliceId),
      followingId: new mongoose.Types.ObjectId(bobId),
    });
    assert.strictEqual(finalRaceDbCount, 0, "Net result of 2 concurrent toggles from unfollowed state must be 0 documents");

    // Concurrent Follow Dispatch (5 simultaneous follow requests)
    const concurrentFollows = Array.from({ length: 5 }, () =>
      handleExplicitFollow(
        makeMockRequest(`/api/follow/${bobId}`, { method: "POST" }, tokenAlice),
        { params: Promise.resolve({ targetId: bobId }) }
      )
    );
    const concurrentResults = await Promise.all(concurrentFollows);
    for (const res of concurrentResults) {
      assert.ok(res);
      assert.strictEqual(res.status, 200, "All concurrent requests must resolve cleanly with 200");
    }

    const concurrentDbCount = await FollowerModel.countDocuments({
      followerId: new mongoose.Types.ObjectId(aliceId),
      followingId: new mongoose.Types.ObjectId(bobId),
    });
    assert.strictEqual(concurrentDbCount, 1, "Concurrent requests must produce exactly 1 follow record");
    console.log("  PASS: Toggle and concurrent requests execute safely without race condition failures");

    // -------------------------------------------------------------------------
    // TEST 6: Store Follow Support & Polymorphic Scoping
    // -------------------------------------------------------------------------
    console.log("\nTEST 6: Polymorphic follow support for stores");
    const storeTargetId = bobStore._id.toString();

    // Alice follows Bob's store
    const followStoreRes = await handleExplicitFollow(
      makeMockRequest(`/api/follow/${storeTargetId}?targetType=store`, { method: "POST" }, tokenAlice),
      { params: Promise.resolve({ targetId: storeTargetId }) }
    );
    assert.ok(followStoreRes);
    assert.strictEqual(followStoreRes.status, 200);
    const followStoreData = await followStoreRes.json();
    assert.strictEqual(followStoreData.targetType, "store");
    assert.strictEqual(followStoreData.isFollowing, true);

    // Check store followers list
    const storeFollowersRes = await handleGetFollowers(
      makeMockRequest(`/api/follow/followers/${storeTargetId}?targetType=store`, { method: "GET" }),
      { params: Promise.resolve({ targetId: storeTargetId }) }
    );
    assert.ok(storeFollowersRes);
    assert.strictEqual(storeFollowersRes.status, 200);
    const storeFollowersData = await storeFollowersRes.json();
    assert.strictEqual(storeFollowersData.total, 1);
    assert.strictEqual(storeFollowersData.followers[0].follower.name, "Alice Follower");

    // Check store follow counts
    const storeCountsRes = await handleGetCounts(
      makeMockRequest(`/api/follow/counts/${storeTargetId}?targetType=store`, { method: "GET" }),
      { params: Promise.resolve({ targetId: storeTargetId }) }
    );
    assert.ok(storeCountsRes);
    assert.strictEqual(storeCountsRes.status, 200);
    const storeCountsData = await storeCountsRes.json();
    assert.strictEqual(storeCountsData.followersCount, 1);
    console.log("  PASS: Store following and scoped follower lists work seamlessly");

    // -------------------------------------------------------------------------
    // TEST 7: Scoped Followers and Following Listings
    // -------------------------------------------------------------------------
    console.log("\nTEST 7: Scoped followers and following lists for users");
    // Alice currently follows Bob (user) and Bob's store (store)
    const aliceFollowingRes = await handleGetFollowing(
      makeMockRequest(`/api/follow/following/${aliceId}`, { method: "GET" }),
      { params: Promise.resolve({ targetId: aliceId }) }
    );
    assert.ok(aliceFollowingRes);
    assert.strictEqual(aliceFollowingRes.status, 200);
    const aliceFollowingData = await aliceFollowingRes.json();
    assert.strictEqual(aliceFollowingData.total, 2, "Alice must have 2 following relationships (1 user + 1 store)");

    // User follower list for Bob
    const bobFollowersRes = await handleGetFollowers(
      makeMockRequest(`/api/follow/followers/${bobId}?targetType=user`, { method: "GET" }),
      { params: Promise.resolve({ targetId: bobId }) }
    );
    assert.ok(bobFollowersRes);
    assert.strictEqual(bobFollowersRes.status, 200);
    const bobFollowersData = await bobFollowersRes.json();
    assert.strictEqual(bobFollowersData.total, 1);
    assert.strictEqual(bobFollowersData.followers[0].follower.name, "Alice Follower");
    assert.strictEqual(bobFollowersData.followers[0].follower.email, undefined, "Email must NEVER be exposed in public follower listing");
    assert.ok(bobFollowersData.followers[0].follower.profile.handle, "Public handle must be present");
    assert.strictEqual(aliceFollowingData.following[0].target.email, undefined, "Email must NEVER be exposed in public following listing");
    console.log("  PASS: Scoped listings accurately separate users and stores with strict privacy (zero email exposure)");

    // -------------------------------------------------------------------------
    // TEST 8: Suspended Accounts & Non-Existent Target Validation
    // -------------------------------------------------------------------------
    console.log("\nTEST 8: Rejection of suspended accounts and non-existent targets");
    // Non-existent target
    const fakeId = new mongoose.Types.ObjectId().toString();
    const nonExistentRes = await handleExplicitFollow(
      makeMockRequest(`/api/follow/${fakeId}`, { method: "POST" }, tokenAlice),
      { params: Promise.resolve({ targetId: fakeId }) }
    );
    assert.ok(nonExistentRes);
    assert.strictEqual(nonExistentRes.status, 404, "Non-existent target must return 404");

    // Suspended user target
    const suspendedRes = await handleExplicitFollow(
      makeMockRequest(`/api/follow/${samId}`, { method: "POST" }, tokenAlice),
      { params: Promise.resolve({ targetId: samId }) }
    );
    assert.ok(suspendedRes);
    assert.strictEqual(suspendedRes.status, 403, "Suspended target must return 403");
    console.log("  PASS: Suspended and non-existent targets strictly blocked");

    console.log("\n====================================================================");
    console.log(" ALL 8 PHASE 4.4 FOLLOW SYSTEM TESTS PASSED! ");
    console.log("====================================================================\n");
  } finally {
    if (mongod) {
      await mongoose.disconnect();
      await mongod.stop();
    }
    process.env = originalEnv;
  }
}

runFollowTestSuite().catch((err) => {
  console.error("FATAL: Follow test suite failed:", err);
  process.exit(1);
});
