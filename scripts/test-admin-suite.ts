import { NextRequest } from "next/server";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import mongoose from "mongoose";
import UserModel from "../app/models/User";
import StoreModel from "../app/models/Store";
import { createAuthToken } from "../app/lib/authTokens";
import { GET as getOverview } from "../app/api/admin/overview/route";
import { GET as getBusinessApps } from "../app/api/admin/business-applications/route";
import { PATCH as patchBusinessApp } from "../app/api/admin/business-applications/[id]/route";
import { GET as getListings } from "../app/api/admin/listings/route";
import { GET as getStores } from "../app/api/admin/stores/route";
import { PATCH as patchStore } from "../app/api/admin/stores/[id]/route";
import { GET as getUsers } from "../app/api/admin/users/route";
import { PATCH as patchUser } from "../app/api/admin/users/[id]/route";
import { GET as getLogs } from "../app/api/admin/logs/route";
import { POST as createReport } from "../app/api/reports/route";
import { GET as getAdminReports } from "../app/api/admin/reports/route";
import { PATCH as patchAdminReport } from "../app/api/admin/reports/[id]/route";
import { GET as getAdminReviews } from "../app/api/admin/reviews/route";
import { GET as getAdminAnalytics } from "../app/api/admin/analytics/route";

let adminId = "";
let buyerId = "";
let testStoreId = "";

function makeAdminRequest(url: string, method: string = "GET", body?: any): NextRequest {
  const token = createAuthToken({
    id: adminId,
    name: "System Admin",
    email: "admin@campushive.edu.ng",
    role: "admin",
    isStudent: false,
    studentVerified: false,
    tokenVersion: 0,
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
    id: buyerId,
    name: "Regular Student",
    email: "student@abu.edu.ng",
    role: "buyer",
    isStudent: true,
    studentVerified: true,
    tokenVersion: 0,
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
  console.log("=== STARTING ADMIN CONTROL PLANE SUITE VALIDATION ===");
  const repl = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  const uri = repl.getUri();
  process.env.MONGODB_URI = uri;
  await mongoose.connect(uri);

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, msg: string) {
    if (condition) {
      console.log(`  ✅ [PASS] ${msg}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${msg}`);
      failed++;
    }
  }

  // Seed admin, student buyer, and a store
  const [adminDoc, buyerDoc] = await Promise.all([
    UserModel.create({
      name: "System Admin",
      fullName: "System Admin",
      email: "admin@campushive.edu.ng",
      passwordHash: "hashed",
      role: "admin",
      accountStatus: "active",
      emailVerified: true,
      onboardingStep: "completed",
      tokenVersion: 0,
    }),
    UserModel.create({
      name: "Regular Student",
      fullName: "Regular Student",
      email: "student@abu.edu.ng",
      passwordHash: "hashed",
      role: "seller",
      accountStatus: "active",
      emailVerified: true,
      studentVerified: true,
      onboardingStep: "completed",
      storesCount: 1,
      studentStoresCount: 1,
      tokenVersion: 0,
    }),
  ]);
  adminId = String(adminDoc._id);
  buyerId = String(buyerDoc._id);

  const storeDoc = await StoreModel.create({
    ownerId: buyerId,
    name: "Student Gadgets",
    slug: "student-gadgets",
    slugLower: "student-gadgets",
    description: "Campus electronics store",
    storeType: "student_store",
    category: "Electronics",
    campus: "ABU",
    operatingLocation: "Main Campus",
    logo: "https://example.com/logo.png",
    status: "active",
    isVerified: false,
    verificationType: "student",
  });
  testStoreId = String(storeDoc._id);

  // 1. Overview Security & Aggregations
  console.log("\n--- Testing 1. Overview Dashboard API ---");
  const unauthOverview = (await getOverview(makeNonAdminRequest("/api/admin/overview")))!;
  assert(unauthOverview.status === 403, "Overview blocks non-admin with 403");

  const authOverview = (await getOverview(makeAdminRequest("/api/admin/overview")))!;
  assert(authOverview.status === 200, "Overview permits admin with 200");
  const overviewData: any = await authOverview.json();
  assert(overviewData.success === true, "Overview returns success: true");
  assert(typeof overviewData.data.stats.pendingApplications === "number", "Overview returns real pendingApplications count");
  assert(typeof overviewData.data.stats.activeStores === "number", "Overview returns real activeStores count");
  assert(overviewData.data.stats.registeredUsers >= 2, "Overview returns real registeredUsers count");

  // 2. Business Applications Security & Decision Handling
  console.log("\n--- Testing 2. Business Applications Queue & Decisions ---");
  const unauthApps = (await getBusinessApps(makeNonAdminRequest("/api/admin/business-applications")))!;
  assert(unauthApps.status === 403, "Business applications blocks non-admin with 403");

  const authApps = (await getBusinessApps(makeAdminRequest("/api/admin/business-applications")))!;
  assert(authApps.status === 200, "Business applications permits admin with 200");
  const appsData: any = await authApps.json();
  assert(Array.isArray(appsData.data), "Returns array of business applications");

  const patchNoReason = (await patchBusinessApp(
    makeAdminRequest("/api/admin/business-applications/fake-id-123", "PATCH", { action: "reject" }),
    { params: Promise.resolve({ id: "fake-id-123" }) }
  ))!;
  assert(patchNoReason.status === 400 || patchNoReason.status === 404, "Invalid business decision handled safely");

  // 3. Listing Moderation Security
  console.log("\n--- Testing 3. Listing Moderation Queue ---");
  const unauthListings = (await getListings(makeNonAdminRequest("/api/admin/listings")))!;
  assert(unauthListings.status === 403, "Listing moderation blocks non-admin with 403");

  const authListings = (await getListings(makeAdminRequest("/api/admin/listings")))!;
  assert(authListings.status === 200, "Listing moderation permits admin with 200");

  // 4. Stores Oversight & Store Badge/Cooldown Actions
  console.log("\n--- Testing 4. Stores Oversight & Multi-Store Admin Privileges ---");
  const unauthStores = (await getStores(makeNonAdminRequest("/api/admin/stores")))!;
  assert(unauthStores.status === 403, "Stores oversight blocks non-admin with 403");

  const authStores = (await getStores(makeAdminRequest("/api/admin/stores")))!;
  assert(authStores.status === 200, "Stores oversight permits admin with 200");
  const storesData: any = await authStores.json();
  assert(Array.isArray(storesData.data) && storesData.data.length === 1, "Returns enriched stores list");
  assert(storesData.data[0].owner?.email === "student@abu.edu.ng", "Enriches store with owner summary for admin");

  const verifyStoreRes = (await patchStore(
    makeAdminRequest(`/api/admin/stores/${testStoreId}`, "PATCH", { action: "toggle_verify" }),
    { params: Promise.resolve({ id: testStoreId }) }
  ))!;
  assert(verifyStoreRes.status === 200, "Admin can toggle store verification badge");
  const verifyStoreJson: any = await verifyStoreRes.json();
  assert(verifyStoreJson.data.isVerified === true, "Store isVerified toggled to true");

  // 5. Users Oversight, Self-Lockout Protection, Warning & Student Verification
  console.log("\n--- Testing 5. Users Oversight & Private Identity Controls ---");
  const unauthUsers = (await getUsers(makeNonAdminRequest("/api/admin/users")))!;
  assert(unauthUsers.status === 403, "Users oversight blocks non-admin with 403");

  const authUsers = (await getUsers(makeAdminRequest("/api/admin/users")))!;
  assert(authUsers.status === 200, "Users oversight permits admin with 200");
  const usersData: any = await authUsers.json();
  const studentRecord = usersData.data.find((u: any) => String(u._id) === buyerId);
  assert(Array.isArray(studentRecord?.ownedStores) && studentRecord.ownedStores.length === 1, "User record includes ownedStores list");

  // Self-suspension protection
  const selfSuspendRes = (await patchUser(
    makeAdminRequest(`/api/admin/users/${adminId}`, "PATCH", { action: "suspend", reason: "Self test" }),
    { params: Promise.resolve({ id: adminId }) }
  ))!;
  assert(selfSuspendRes.status === 400, "Admin self-suspension is blocked with 400");

  // Official warning notification
  const warnRes = (await patchUser(
    makeAdminRequest(`/api/admin/users/${buyerId}`, "PATCH", { action: "warn", reason: "Test policy warning" }),
    { params: Promise.resolve({ id: buyerId }) }
  ))!;
  assert(warnRes.status === 200, "Admin can send official warning notification to user");

  // 6. Reports Queue & 1-Click Enforcement
  console.log("\n--- Testing 6. Reports Submission & Admin 1-Click Resolution ---");
  const createRepRes = (await createReport(
    makeNonAdminRequest("/api/reports", "POST", {
      targetType: "store",
      targetId: testStoreId,
      reason: "misleading",
      details: "Store description is misleading",
    })
  ))!;
  assert(createRepRes.status === 201, "Authenticated user can submit a report");
  const createdRepJson: any = await createRepRes.json();
  const reportId = createdRepJson.data.id;

  const listRepRes = (await getAdminReports(makeAdminRequest("/api/admin/reports")))!;
  assert(listRepRes.status === 200, "Admin can list reports queue");
  const listRepJson: any = await listRepRes.json();
  assert(listRepJson.data.length === 1, "Reports queue returns the newly submitted report");

  const resolveRepRes = (await patchAdminReport(
    makeAdminRequest(`/api/admin/reports/${reportId}`, "PATCH", {
      resolution: "warning",
      notes: "Warned store owner regarding description",
    }),
    { params: Promise.resolve({ id: reportId }) }
  ))!;
  assert(resolveRepRes.status === 200, "Admin can resolve report with 1-click warning enforcement");

  // 7. Immutable Audit Logs Explorer, Reviews & Analytics
  console.log("\n--- Testing 7. Audit Logs, Reviews & Analytics Endpoints ---");
  const logsRes = (await getLogs(makeAdminRequest("/api/admin/logs?limit=50")))!;
  assert(logsRes.status === 200, "Admin can query /api/admin/logs");
  const logsJson: any = await logsRes.json();
  assert(Array.isArray(logsJson.data) && logsJson.data.length >= 3, "Audit logs contain recorded admin actions");

  const reviewsRes = (await getAdminReviews(makeAdminRequest("/api/admin/reviews")))!;
  assert(reviewsRes.status === 200, "Admin can query /api/admin/reviews");

  const analyticsRes = (await getAdminAnalytics(makeAdminRequest("/api/admin/analytics")))!;
  assert(analyticsRes.status === 200, "Admin can query /api/admin/analytics");
  const analyticsJson: any = await analyticsRes.json();
  assert(analyticsJson.data.stores.studentStores === 1, "Analytics accurately aggregates student stores");

  console.log(`\n========================================`);
  console.log(`TEST RESULTS: ${passed} passed, ${failed} failed`);
  console.log(`========================================`);

  await mongoose.disconnect();
  await repl.stop();

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
