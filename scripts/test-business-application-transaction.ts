/**
 * Test Suite: Business Application Approval with Transactions & 409 Conflict Mapping
 */

import { MongoMemoryReplSet } from "mongodb-memory-server";
import { strict as assert } from "node:assert";
import mongoose from "mongoose";
import { NextRequest } from "next/server";

process.env.AUTH_SECRET = "super-secret-test-key-at-least-32-chars-long";
process.env.JWT_SECRET = process.env.AUTH_SECRET;
process.env.SMTP_USER = "test@example.com";
process.env.SMTP_PASSWORD = "test-password";
process.env.ADMIN_REGISTRATION_KEY = "test-admin-reg-key-at-least-32-chars-long";

async function run() {
  console.log("==================================================================");
  console.log(" BUSINESS APPLICATION APPROVAL: TRANSACTION & 409 CONFLICT SUITE");
  console.log("==================================================================\n");

  const replset = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  const uri = replset.getUri();
  process.env.MONGODB_URI = uri;

  await mongoose.connect(uri);

  const { default: StoreModel, ensureStoreIndexes } = await import("../app/models/Store");
  const { default: UserModel } = await import("../app/models/User");
  const { default: BusinessApplicationModel } = await import("../app/models/BusinessApplication");
  const { createAuthToken } = await import("../app/lib/authTokens");
  const { PATCH: patchAdminApp } = await import("../app/api/admin/business-applications/[id]/route");

  let passed = 0;
  function pass(msg: string) {
    passed++;
    console.log(`[PASS] ${msg}`);
  }

  try {
    await ensureStoreIndexes();
    await StoreModel.init();
    await BusinessApplicationModel.init();

    // ---------------- 1. Seed Admin and Applicant ----------------
    console.log("--- 1. Seed Admin and Applicant Accounts ---");
    const adminUser = await UserModel.create({
      name: "Admin Moderator",
      email: "moderator@campushive.edu.ng",
      role: "admin",
      accountStatus: "active",
      isStudent: false,
      studentVerified: false,
    });

    const applicantUser = await UserModel.create({
      name: "Tunde Business Owner",
      email: "tunde.biz@abu.edu.ng",
      role: "seller",
      accountStatus: "active",
      isStudent: true,
      studentVerified: true,
      campus: "Ahmadu Bello University (ABU)",
    });

    const adminToken = createAuthToken({
      id: adminUser._id.toString(),
      name: adminUser.name,
      email: adminUser.email,
      role: "admin",
      isStudent: false,
      studentVerified: false,
    });

    pass("Admin and applicant accounts seeded successfully");

    // ---------------- 2. Seed Pending Business Application ----------------
    console.log("\n--- 2. Seed Pending Business Application ---");
    const application = await BusinessApplicationModel.create({
      applicantId: applicantUser._id.toString(),
      businessName: "Tunde Campus Press",
      businessCategory: "Services & Printing",
      campus: "Ahmadu Bello University (ABU)",
      operatingLocation: "Samaru Campus Gate",
      contactPhone: "08098765432",
      contactEmail: "tunde.biz@abu.edu.ng",
      status: "pending_review",
      notes: "Official campus printing press application",
    });

    const appId = application._id.toString();
    pass("Business application created with status: 'pending_review'");

    // ---------------- 3. Approve in session.withTransaction ----------------
    console.log("\n--- 3. Approve application within atomic transaction ---");
    const approveReq = new NextRequest(`http://localhost:3000/api/admin/business-applications/${appId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${adminToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "approve",
        reason: "Valid registration documents verified",
        adminNotes: "Approved for full campus trade",
      }),
    });

    const approveRes = await patchAdminApp(approveReq, {
      params: Promise.resolve({ id: appId }),
    });
    assert(approveRes !== undefined, "Route returned a response");
    assert(approveRes.status === 200, `Approval returned 200, got ${approveRes.status}`);

    const approveJson = await approveRes.json();
    assert(approveJson.success === true, "Approval response success is true");
    assert(approveJson.data?.application?.status === "approved", "Application status updated to 'approved'");
    assert(typeof approveJson.data?.store?._id === "string", "Storefront created and returned");

    // Verify DB state
    const dbApp = await BusinessApplicationModel.findById(appId);
    assert(dbApp?.status === "approved", "MongoDB application document is 'approved'");
    assert(dbApp?.storeId === approveJson.data.store._id, "Application storeId matches created store");

    const dbStore = await StoreModel.findById(approveJson.data.store._id);
    assert(dbStore !== null, "Store document committed to database");
    assert(dbStore?.ownerId === applicantUser._id.toString(), "Store ownerId matches applicant");
    assert(dbStore?.storeType === "local_business", "Store type is local_business");
    pass("Application approved and storefront created atomically in transaction (200 OK)");

    // ---------------- 4. Second Approval Matches Nothing -> 409 Conflict ----------------
    console.log("\n--- 4. Second approval attempt returns 409 Conflict ---");
    const repeatReq = new NextRequest(`http://localhost:3000/api/admin/business-applications/${appId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${adminToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "approve",
        reason: "Duplicate approval attempt",
      }),
    });

    const repeatRes = await patchAdminApp(repeatReq, {
      params: Promise.resolve({ id: appId }),
    });
    assert(repeatRes !== undefined, "Route returned a response");
    assert(repeatRes.status === 409, `Second approval attempt returned 409 Conflict, got ${repeatRes.status}`);

    const repeatJson = await repeatRes.json();
    assert(repeatJson.success === false, "Duplicate approval success is false");
    pass("Conditional findOneAndUpdate matched nothing (already approved) -> returned 409 Conflict");

    // ---------------- 5. Non-Pending Application Status Returns 409 ----------------
    console.log("\n--- 5. Non-pending application returns 409 Conflict ---");
    const rejectedApp = await BusinessApplicationModel.create({
      applicantId: new mongoose.Types.ObjectId().toString(),
      businessName: "Rejected Biz",
      businessCategory: "Food",
      campus: "ABU",
      operatingLocation: "Off Campus",
      contactPhone: "08000000000",
      contactEmail: "rejected@example.com",
      status: "rejected",
    });

    const rejectedReq = new NextRequest(`http://localhost:3000/api/admin/business-applications/${rejectedApp._id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${adminToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "approve",
        reason: "Trying to approve already rejected app",
      }),
    });

    const rejectedRes = await patchAdminApp(rejectedReq, {
      params: Promise.resolve({ id: rejectedApp._id.toString() }),
    });
    assert(rejectedRes !== undefined, "Route returned a response");
    assert(rejectedRes.status === 409, `Approving non-pending app returned 409 Conflict, got ${rejectedRes.status}`);
    pass("Attempting to approve a rejected/non-pending application returns 409 Conflict");

    // ---------------- 6. 10 Concurrent Approvals Race Condition ----------------
    console.log("\n--- 6. 10 Concurrent Approvals Race-Condition Test ---");
    const raceApplicant = await UserModel.create({
      name: "Race Applicant",
      email: "race.applicant@abu.edu.ng",
      role: "seller",
      accountStatus: "active",
      isStudent: true,
      studentVerified: true,
      campus: "ABU",
    });

    const raceApp = await BusinessApplicationModel.create({
      applicantId: raceApplicant._id.toString(),
      businessName: "Race Campus Services",
      businessCategory: "Services",
      campus: "ABU",
      operatingLocation: "Gate 1",
      contactPhone: "08111222333",
      contactEmail: "race.applicant@abu.edu.ng",
      status: "pending_review",
    });
    const raceAppId = raceApp._id.toString();

    const concurrentRequests = Array.from({ length: 10 }, (_, i) => {
      const req = new NextRequest(`http://localhost:3000/api/admin/business-applications/${raceAppId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${adminToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "approve",
          reason: `Concurrent approval thread ${i + 1}`,
        }),
      });
      return patchAdminApp(req, { params: Promise.resolve({ id: raceAppId }) });
    });

    const responses = await Promise.all(concurrentRequests);
    const statuses = responses.map((r) => r?.status || 500);
    const successCount = statuses.filter((s) => s === 200).length;
    const conflictCount = statuses.filter((s) => s === 409).length;

    assert(successCount === 1, `Exactly 1 concurrent request succeeded with 200 OK (got ${successCount})`);
    assert(conflictCount === 9, `Exactly 9 concurrent requests failed with 409 Conflict (got ${conflictCount})`);

    const storesCreated = await StoreModel.find({ ownerId: raceApplicant._id.toString() });
    assert(storesCreated.length === 1, "Exactly 1 storefront was created in MongoDB (no duplicate stores)");
    pass("10 concurrent approvals race condition: exactly 1 succeeded (200), 9 returned 409, 1 store created");

    console.log("\n==================================================================");
    console.log(` RESULTS: ${passed} PASSED | 0 FAILED`);
    console.log("==================================================================");
  } finally {
    await mongoose.disconnect();
    await replset.stop();
  }
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Test failed with error:", err);
    process.exit(1);
  });
