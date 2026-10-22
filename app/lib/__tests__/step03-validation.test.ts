import assert from "node:assert";
import {
  checkStudentVendorEligibility,
  assertUserOwnsStore,
  ServerAuthUser,
} from "../authServer";
import {
  isDuplicateOwnerError,
  sanitizeStoreInput,
} from "../../models/Store";
import { sanitizeListingInput } from "../../models/Listing";

console.log("=== RUNNING STEP 03: OWNERSHIP & ELIGIBILITY VALIDATION TESTS ===");

// ----------------------------------------------------------------------------
// TEST 1: Student Vendor Eligibility
// ----------------------------------------------------------------------------
async function testStudentEligibility() {
  console.log("\n[Test 1] Testing Student Vendor Eligibility Rules...");

  const unverifiedStudent: ServerAuthUser = {
    id: "usr-unverified",
    name: "Unverified Student",
    email: "unverified@abu.edu.ng",
    role: "buyer",
    isStudent: true,
    studentVerified: false,
  };

  const res1 = await checkStudentVendorEligibility(unverifiedStudent);
  assert.strictEqual(res1.eligible, false, "Unverified student must NOT be eligible");
  assert.strictEqual(res1.status, 403, "Status must be 403 Forbidden");
  console.log("  ✓ Unverified student is correctly rejected with 403 Forbidden");

  const nonStudent: ServerAuthUser = {
    id: "usr-nonstudent",
    name: "Non Student",
    email: "nonstudent@gmail.com",
    role: "buyer",
    isStudent: false,
    studentVerified: false,
  };

  const res2 = await checkStudentVendorEligibility(nonStudent);
  assert.strictEqual(res2.eligible, false, "Non-student must NOT be eligible for student store");
  console.log("  ✓ Non-student is correctly rejected");

  const verifiedStudent: ServerAuthUser = {
    id: "usr-verified-" + Date.now(),
    name: "Verified Student",
    email: "verified@abu.edu.ng",
    role: "buyer",
    isStudent: true,
    studentVerified: true,
  };

  const res3 = await checkStudentVendorEligibility(verifiedStudent);
  assert.strictEqual(res3.eligible, true, "Verified student without existing store must be eligible");
  console.log("  ✓ Verified student without existing store is eligible");
}

// ----------------------------------------------------------------------------
// TEST 2: Metrics and Privileged Field Sanitization
// ----------------------------------------------------------------------------
function testInputSanitization() {
  console.log("\n[Test 2] Testing Server Authority & Metric Stripping...");

  const maliciousStoreInput = {
    name: "Hacker Gadgets",
    description: "Quality electronics",
    category: "Electronics",
    campus: "ABU Zaria",
    operatingLocation: "Suleiman Hall",
    logo: "https://example.com/logo.png",
    // Privileged fields that MUST be stripped:
    ownerId: "victim-user-id",
    status: "active",
    isVerified: true,
    metrics: { rating: 5.0, reviewsCount: 9999, completedDeals: 1500 },
    rating: 5.0,
    completedDeals: 1000,
  };

  const sanitizedStore = sanitizeStoreInput(maliciousStoreInput);
  assert.strictEqual(sanitizedStore.ownerId, undefined, "ownerId must be stripped from store payload");
  assert.strictEqual(sanitizedStore.status, undefined, "status must be stripped from store payload");
  assert.strictEqual(sanitizedStore.isVerified, undefined, "isVerified must be stripped from store payload");
  assert.strictEqual(sanitizedStore.metrics, undefined, "metrics must be stripped from store payload");
  assert.strictEqual(sanitizedStore.rating, undefined, "rating must be stripped from store payload");
  assert.strictEqual(sanitizedStore.name, "Hacker Gadgets", "name must be preserved");
  console.log("  ✓ Store metrics, ownerId, and verification flags are stripped from client payloads");

  const maliciousListingInput = {
    title: "Brand New iPhone 15",
    price: 950000,
    description: "Factory sealed",
    category: "Electronics",
    campus: "ABU Zaria",
    location: "Samaru Main Gate",
    // Privileged fields that MUST be stripped:
    sellerId: "another-seller-id",
    views: 84920,
    likes: 1240,
    isPromoted: true,
  };

  const sanitizedListing = sanitizeListingInput(maliciousListingInput);
  assert.strictEqual(sanitizedListing.sellerId, undefined, "sellerId must be stripped from listing payload");
  assert.strictEqual(sanitizedListing.views, undefined, "views must be stripped from listing payload");
  assert.strictEqual(sanitizedListing.likes, undefined, "likes must be stripped from listing payload");
  assert.strictEqual(sanitizedListing.isPromoted, undefined, "isPromoted must be stripped from listing payload");
  assert.strictEqual(sanitizedListing.priceFormatted, "₦950,000", "priceFormatted must be generated server-side");
  console.log("  ✓ Listing metrics, sellerId, views, and likes are stripped from client payloads");
}

// ----------------------------------------------------------------------------
// TEST 3: Duplicate Owner Error Detection
// ----------------------------------------------------------------------------
function testDuplicateOwnerDetection() {
  console.log("\n[Test 3] Testing Duplicate Owner Error Detector...");

  const mongoDuplicateError = {
    code: 11000,
    name: "MongoServerError",
    keyPattern: { ownerId: 1 },
    keyValue: { ownerId: "usr-already-owns-store" },
    message: "E11000 duplicate key error collection: campushive.campusstores index: ownerId_1 dup key",
  };

  assert.strictEqual(isDuplicateOwnerError(mongoDuplicateError), true, "Must detect MongoDB duplicate owner error");

  const otherError = {
    code: 11000,
    name: "MongoServerError",
    keyPattern: { slug: 1 },
    message: "E11000 duplicate key error collection: campushive.campusstores index: slug_1 dup key",
  };

  assert.strictEqual(isDuplicateOwnerError(otherError), false, "Must not mistake slug collision for owner duplicate error");
  console.log("  ✓ Duplicate owner error detector functions accurately");
}

// ----------------------------------------------------------------------------
// RUN ALL TESTS
// ----------------------------------------------------------------------------
async function run() {
  try {
    await testStudentEligibility();
    testInputSanitization();
    testDuplicateOwnerDetection();

    console.log("\n=======================================================");
    console.log("  ALL STEP 03 OWNERSHIP & ELIGIBILITY TESTS PASSED!   ");
    console.log("=======================================================\n");
    process.exit(0);
  } catch (err: any) {
    console.error("\n❌ TEST FAILED:", err.message);
    console.error(err.stack);
    process.exit(1);
  }
}

run();
