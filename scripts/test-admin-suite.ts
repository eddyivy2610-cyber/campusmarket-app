import { NextRequest } from "next/server";
import { createAuthToken } from "../app/lib/authTokens";
import { GET as getOverview } from "../app/api/admin/overview/route";
import { GET as getBusinessApps } from "../app/api/admin/business-applications/route";
import { PATCH as patchBusinessApp } from "../app/api/admin/business-applications/[id]/route";
import { GET as getListings } from "../app/api/admin/listings/route";
import { PATCH as patchListing } from "../app/api/admin/listings/[id]/route";
import { GET as getStores } from "../app/api/admin/stores/route";
import { PATCH as patchStore } from "../app/api/admin/stores/[id]/route";
import { GET as getUsers } from "../app/api/admin/users/route";
import { PATCH as patchUser } from "../app/api/admin/users/[id]/route";

function makeAdminRequest(url: string, method: string = "GET", body?: any): NextRequest {
  const token = createAuthToken({
    id: "admin-master-01",
    name: "System Admin",
    email: "admin@campushive.edu.ng",
    role: "admin",
    isStudent: false,
    studentVerified: false,
  });

  return new NextRequest(new URL(url, "http://localhost:3000"), {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
}

function makeNonAdminRequest(url: string, method: string = "GET", body?: any): NextRequest {
  const token = createAuthToken({
    id: "student-user-01",
    name: "Regular Student",
    email: "student@abu.edu.ng",
    role: "buyer",
    isStudent: true,
    studentVerified: true,
  });

  return new NextRequest(new URL(url, "http://localhost:3000"), {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
}

async function runAdminTestSuite() {
  console.log("=== STARTING ADMIN SUITE VALIDATION ===");
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, msg: string) {
    if (condition) {
      console.log(`[PASS] ${msg}`);
      passed++;
    } else {
      console.error(`[FAIL] ${msg}`);
      failed++;
    }
  }

  // 1. Overview Security & Aggregations
  console.log("\n--- Testing 1. Overview Dashboard API ---");
  const unauthOverview = (await getOverview(makeNonAdminRequest("/api/admin/overview")))!;
  assert(unauthOverview.status === 403, "Overview blocks non-admin with 403");

  const authOverview = (await getOverview(makeAdminRequest("/api/admin/overview")))!;
  assert(authOverview.status === 200, "Overview permits admin with 200");
  const overviewData: any = await authOverview.json();
  assert(overviewData.success === true, "Overview returns success: true");
  assert(typeof overviewData.data.stats.pendingApplications === "number", "Overview returns real pendingApplications count");
  assert(typeof overviewData.data.stats.pendingListings === "number", "Overview returns real pendingListings count");
  assert(typeof overviewData.data.stats.activeStores === "number", "Overview returns real activeStores count");
  assert(typeof overviewData.data.stats.registeredUsers === "number", "Overview returns real registeredUsers count");

  // 2. Business Applications Security & Decision Handling
  console.log("\n--- Testing 2. Business Applications Queue & Decisions ---");
  const unauthApps = (await getBusinessApps(makeNonAdminRequest("/api/admin/business-applications")))!;
  assert(unauthApps.status === 403, "Business applications blocks non-admin with 403");

  const authApps = (await getBusinessApps(makeAdminRequest("/api/admin/business-applications")))!;
  assert(authApps.status === 200, "Business applications permits admin with 200");
  const appsData: any = await authApps.json();
  assert(Array.isArray(appsData.data), "Returns array of business applications");

  // Test PATCH business application rejection reason requirement
  const patchNoReason = (await patchBusinessApp(
    makeAdminRequest("/api/admin/business-applications/fake-id-123", "PATCH", { action: "reject" }),
    { params: Promise.resolve({ id: "fake-id-123" }) }
  ))!;
  // Expect either 400 (missing reason) or 404 (if not found before validation check)
  assert(patchNoReason.status === 400 || patchNoReason.status === 404, "Invalid business decision handled safely");

  // 3. Listing Moderation Security
  console.log("\n--- Testing 3. Listing Moderation Queue & Decisions ---");
  const unauthListings = (await getListings(makeNonAdminRequest("/api/admin/listings")))!;
  assert(unauthListings.status === 403, "Listing moderation blocks non-admin with 403");

  const authListings = (await getListings(makeAdminRequest("/api/admin/listings")))!;
  assert(authListings.status === 200, "Listing moderation permits admin with 200");
  const listingsData: any = await authListings.json();
  assert(Array.isArray(listingsData.data), "Returns array of catalog listings");

  // 4. Stores Oversight Security
  console.log("\n--- Testing 4. Stores Oversight ---");
  const unauthStores = (await getStores(makeNonAdminRequest("/api/admin/stores")))!;
  assert(unauthStores.status === 403, "Stores oversight blocks non-admin with 403");

  const authStores = (await getStores(makeAdminRequest("/api/admin/stores")))!;
  assert(authStores.status === 200, "Stores oversight permits admin with 200");
  const storesData: any = await authStores.json();
  assert(Array.isArray(storesData.data), "Returns array of stores");

  // 5. Users Oversight Security
  console.log("\n--- Testing 5. Users Oversight ---");
  const unauthUsers = (await getUsers(makeNonAdminRequest("/api/admin/users")))!;
  assert(unauthUsers.status === 403, "Users oversight blocks non-admin with 403");

  const authUsers = (await getUsers(makeAdminRequest("/api/admin/users")))!;
  assert(authUsers.status === 200, "Users oversight permits admin with 200");
  const usersData: any = await authUsers.json();
  assert(Array.isArray(usersData.data), "Returns array of users");

  console.log(`\n========================================`);
  console.log(`TEST RESULTS: ${passed} passed, ${failed} failed`);
  console.log(`========================================`);

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runAdminTestSuite().catch((err) => {
  console.error("Test runner encountered error:", err);
  process.exit(1);
});
