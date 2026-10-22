import { NextRequest } from "next/server";
import { isRequestSafeForPublicCache } from "../app/lib/cacheHeaders";
import { GET as getListings } from "../app/api/listings/route";
import { GET as getStores } from "../app/api/stores/route";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import mongoose from "mongoose";
import UserModel from "../app/models/User";
import ListingModel from "../app/models/Listing";
import { createAccessToken } from "../app/lib/authTokens";

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
  console.log(" CACHE-CONTROL LEAK & ISOLATION TEST SUITE");
  console.log("==================================================================\n");

  const repl = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  process.env.MONGODB_URI = repl.getUri();
  process.env.AUTH_SECRET = "cache-isolation-test-secret-at-least-32-characters";
  await mongoose.connect(repl.getUri());

  const privateUserA = await UserModel.create({
    name: "Private Cache User A",
    email: "private-cache-a@campushive.test",
    role: "buyer",
    accountStatus: "active",
    isStudent: true,
    studentVerified: true,
  });
  const privateUserB = await UserModel.create({
    name: "Private Cache User B",
    email: "private-cache-b@campushive.test",
    role: "buyer",
    accountStatus: "active",
    isStudent: true,
    studentVerified: true,
  });
  await ListingModel.create([
    {
      sellerId: privateUserA._id.toString(),
      listingType: "product",
      title: "PRIVATE-A-ONLY",
      price: 10,
      priceFormatted: "₦10",
      description: "Private cache isolation fixture A",
      category: "Test",
      campus: "Main Campus",
      location: "A",
      status: "active",
    },
    {
      sellerId: privateUserB._id.toString(),
      listingType: "product",
      title: "PRIVATE-B-ONLY",
      price: 20,
      priceFormatted: "₦20",
      description: "Private cache isolation fixture B",
      category: "Test",
      campus: "Main Campus",
      location: "B",
      status: "active",
    },
  ]);
  const privateTokenA = createAccessToken({
    id: privateUserA._id.toString(), name: privateUserA.name, email: privateUserA.email,
    role: privateUserA.role, isStudent: true, studentVerified: true,
  });
  const privateTokenB = createAccessToken({
    id: privateUserB._id.toString(), name: privateUserB.name, email: privateUserB.email,
    role: privateUserB.role, isStudent: true, studentVerified: true,
  });

  // Test 1: Helper unit verification
  console.log("--- 1. Cache Helper Security Boundary Tests ---");
  {
    const reqPublic = new NextRequest("http://localhost:3000/api/listings?status=active");
    assert(
      isRequestSafeForPublicCache(reqPublic, { isPublicQuery: true }) === true,
      "Clean public GET is eligible for public cache"
    );

    const reqAuthHeader = new NextRequest("http://localhost:3000/api/listings", {
      headers: { Authorization: "Bearer test-token" },
    });
    assert(
      isRequestSafeForPublicCache(reqAuthHeader, { isPublicQuery: true }) === false,
      "Request with Authorization header is disqualified from public cache"
    );

    const reqCookie = new NextRequest("http://localhost:3000/api/listings", {
      headers: { Cookie: "auth_token=secret_session" },
    });
    assert(
      isRequestSafeForPublicCache(reqCookie, { isPublicQuery: true }) === false,
      "Request with auth_token cookie is disqualified from public cache"
    );

    const reqCampushiveCookie = new NextRequest("http://localhost:3000/api/listings", {
      headers: { Cookie: "campushive_token=secret_session" },
    });
    assert(
      isRequestSafeForPublicCache(reqCampushiveCookie, { isPublicQuery: true }) === false,
      "Request with campushive_token cookie is disqualified from public cache"
    );

    const reqCampusTokenCookie = new NextRequest("http://localhost:3000/api/listings", {
      headers: { Cookie: "campus_token=secret_session" },
    });
    assert(
      isRequestSafeForPublicCache(reqCampusTokenCookie, { isPublicQuery: true }) === false,
      "Request with the server auth campus_token cookie is disqualified from public cache"
    );

    const reqNonPublicQuery = new NextRequest("http://localhost:3000/api/listings?unlinked=true");
    assert(
      isRequestSafeForPublicCache(reqNonPublicQuery, { isPublicQuery: false }) === false,
      "Request with isPublicQuery: false is disqualified from public cache"
    );
  }

  // Test 2: Endpoint Integration Tests on /api/listings
  console.log("\n--- 2. GET /api/listings Cache-Control Isolation ---");
  {
    // A: Anonymous public feed
    const reqClean = new NextRequest("http://localhost:3000/api/listings");
    const resClean = await getListings(reqClean);
    const ccClean = resClean?.headers.get("Cache-Control");
    assert(
      Boolean(ccClean?.includes("public") && ccClean?.includes("s-maxage=60") && ccClean?.includes("stale-while-revalidate=300")),
      `Anonymous public feed receives public edge cache: '${ccClean}'`
    );

    // B: Request with Authorization header
    const reqAuth = new NextRequest("http://localhost:3000/api/listings", {
      headers: { Authorization: "Bearer user_token_123" },
    });
    const resAuth = await getListings(reqAuth);
    const ccAuth = resAuth?.headers.get("Cache-Control");
    assert(
      Boolean(ccAuth?.includes("private") && ccAuth?.includes("no-store") && ccAuth?.includes("no-cache")),
      `Request with Authorization header is strictly private no-store: '${ccAuth}'`
    );

    // I: Two authenticated users must not share a personalized response or cache key.
    const privateReqA = new NextRequest("http://localhost:3000/api/listings?sellerId=me", {
      headers: { Authorization: `Bearer ${privateTokenA}`, "If-None-Match": '"shared-private-fixture"' },
    });
    const privateResA = await getListings(privateReqA);
    const privateJsonA = await privateResA!.json();
    const privateCacheA = privateResA!.headers.get("Cache-Control") || "";
    assert(
      privateCacheA.includes("private") && privateCacheA.includes("no-store") && !privateCacheA.includes("public"),
      `Authenticated user A is never publicly cacheable: '${privateCacheA}'`
    );
    assert(
      Number(privateResA!.status) === 200 && Number(privateResA!.status) !== 304 &&
        privateJsonA.data.some((item: any) => item.title === "PRIVATE-A-ONLY") &&
        !privateJsonA.data.some((item: any) => item.title === "PRIVATE-B-ONLY"),
      "Authenticated user A receives only user A private data despite an If-None-Match conditional request"
    );

    const privateReqB = new NextRequest("http://localhost:3000/api/listings?sellerId=me", {
      headers: {
        Authorization: `Bearer ${privateTokenB}`,
        "If-None-Match": '"shared-private-fixture"',
        "If-Modified-Since": new Date().toUTCString(),
      },
    });
    const privateResB = await getListings(privateReqB);
    const privateJsonB = await privateResB!.json();
    const privateCacheB = privateResB!.headers.get("Cache-Control") || "";
    assert(
      privateCacheB.includes("private") && privateCacheB.includes("no-store") && !privateCacheB.includes("public"),
      `Authenticated user B is never publicly cacheable: '${privateCacheB}'`
    );
    assert(
      Number(privateResB!.status) === 200 && Number(privateResB!.status) !== 304 &&
        privateJsonB.data.some((item: any) => item.title === "PRIVATE-B-ONLY") &&
        !privateJsonB.data.some((item: any) => item.title === "PRIVATE-A-ONLY"),
      "Authenticated user B cannot receive user A data through ETag or If-Modified-Since conditional requests"
    );

    // J: Request with auth cookie
    const reqCookie = new NextRequest("http://localhost:3000/api/listings", {
      headers: { Cookie: "auth_token=jwt_sample_cookie" },
    });
    const resCookie = await getListings(reqCookie);
    const ccCookie = resCookie?.headers.get("Cache-Control");
    assert(
      Boolean(ccCookie?.includes("private") && ccCookie?.includes("no-store")),
      `Request with auth cookie is strictly private no-store: '${ccCookie}'`
    );

    // D: Request for unlinked items
    const reqUnlinked = new NextRequest("http://localhost:3000/api/listings?unlinked=true");
    const resUnlinked = await getListings(reqUnlinked);
    const ccUnlinked = resUnlinked?.headers.get("Cache-Control");
    // Even if 401 Unauthorized or filtered, it must not be public
    assert(
      Boolean(!ccUnlinked?.includes("public")),
      `unlinked=true request is never marked public: '${ccUnlinked}'`
    );

    // E: Request for sellerId (potential private seller draft inspection)
    const reqSeller = new NextRequest("http://localhost:3000/api/listings?sellerId=seller_999");
    const resSeller = await getListings(reqSeller);
    const ccSeller = resSeller?.headers.get("Cache-Control");
    assert(
      Boolean(ccSeller?.includes("private") && ccSeller?.includes("no-store")),
      `sellerId query receives private no-store: '${ccSeller}'`
    );

    // F: Request for non-active status
    const reqPending = new NextRequest("http://localhost:3000/api/listings?status=pending_moderation");
    const resPending = await getListings(reqPending);
    const ccPending = resPending?.headers.get("Cache-Control");
    assert(
      Boolean(ccPending?.includes("private") && ccPending?.includes("no-store")),
      `status=pending_moderation receives private no-store: '${ccPending}'`
    );

    // G: Defensive cursor validation: bad base64/date returns 400, not 500
    const reqBadCursor = new NextRequest("http://localhost:3000/api/listings?cursor=malformed_cursor_value!!");
    const resBadCursor = await getListings(reqBadCursor);
    assert(
      resBadCursor?.status === 400,
      `Malformed cursor returns HTTP 400 Bad Request (got ${resBadCursor?.status})`
    );

    // H: Confirm public response body contains NO personalized fields (isOwner, isSaved, viewerIsSeller)
    const reqPublicBody = new NextRequest("http://localhost:3000/api/listings");
    const resPublicBody = await getListings(reqPublicBody);
    const publicJson = await resPublicBody!.json();
    const publicBodyStr = JSON.stringify(publicJson);
    assert(
      !publicBodyStr.includes("isOwner") &&
        !publicBodyStr.includes("isSaved") &&
        !publicBodyStr.includes("viewerIsSeller") &&
        !publicBodyStr.includes("currentUser"),
      "Public response body strictly contains zero personalized fields (no isOwner, isSaved, viewerIsSeller)"
    );

    // I: Confirm response body is deterministic & identical for all anonymous visitors
    const reqPublicBody2 = new NextRequest("http://localhost:3000/api/listings");
    const resPublicBody2 = await getListings(reqPublicBody2);
    const publicJson2 = await resPublicBody2!.json();
    assert(
      JSON.stringify(publicJson) === JSON.stringify(publicJson2),
      "Two consecutive public anonymous requests produce byte-for-byte identical response bodies"
    );
  }

  // Test 3: Endpoint Integration Tests on /api/stores
  console.log("\n--- 3. GET /api/stores Cache-Control Isolation ---");
  {
    // A: Anonymous public stores
    const reqClean = new NextRequest("http://localhost:3000/api/stores");
    const resClean = await getStores(reqClean);
    const ccClean = resClean?.headers.get("Cache-Control");
    assert(
      Boolean(ccClean?.includes("public") && ccClean?.includes("s-maxage=60")),
      `Anonymous stores request receives public edge cache: '${ccClean}'`
    );

    // B: Stores with Authorization header
    const reqAuth = new NextRequest("http://localhost:3000/api/stores", {
      headers: { Authorization: "Bearer admin_token_xyz" },
    });
    const resAuth = await getStores(reqAuth);
    const ccAuth = resAuth?.headers.get("Cache-Control");
    assert(
      Boolean(ccAuth?.includes("private") && ccAuth?.includes("no-store")),
      `Stores request with auth header receives private no-store: '${ccAuth}'`
    );
  }

  console.log("\n==================================================================");
  console.log(` ALL CACHE LEAK TESTS COMPLETE: ${passed} PASSED | ${failed} FAILED`);
  console.log("==================================================================");

  await repl.stop();
  if (failed > 0) process.exit(1);
  process.exit(0);
}

run().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
