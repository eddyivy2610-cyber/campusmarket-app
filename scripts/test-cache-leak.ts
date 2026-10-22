import { NextRequest } from "next/server";
import { isRequestSafeForPublicCache, applyCacheHeaders } from "../app/lib/cacheHeaders";
import { GET as getListings } from "../app/api/listings/route";
import { GET as getStores } from "../app/api/stores/route";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import mongoose from "mongoose";

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
  await mongoose.connect(repl.getUri());

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

    // C: Request with auth cookie
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
