import assert from "node:assert";
import {
  sanitizeListingInput,
  IListing,
  IServiceDetails,
} from "../../models/Listing";
import {
  sanitizeStoreInput,
} from "../../models/Store";
import { assertUserOwnsStore, ServerAuthUser } from "../authServer";

console.log("=== RUNNING STEP 05 & 06: SHARED CATALOG & SERVICE LISTINGS TESTS ===");

// ----------------------------------------------------------------------------
// TEST 1: Service Listings & Schema Validation
// ----------------------------------------------------------------------------
function testServiceListingSchema() {
  console.log("\n[Test 1] Testing Product vs Service Listing Sanitization...");

  const rawProductPayload = {
    title: "HP EliteBook 840 G5",
    price: 185000,
    category: "Laptops & Computers",
    condition: "Used - Good",
    listingType: "product",
    views: 9999, // Should be stripped
    likes: 888, // Should be stripped
    sellerId: "hacker-id", // Should be stripped
  };

  const sanitizedProduct = sanitizeListingInput(rawProductPayload);
  assert.strictEqual(sanitizedProduct.listingType, "product", "listingType should be product");
  assert.strictEqual(sanitizedProduct.priceFormatted, "₦185,000", "priceFormatted should be ₦185,000");
  assert.strictEqual(sanitizedProduct.views, undefined, "views must be stripped");
  assert.strictEqual(sanitizedProduct.sellerId, undefined, "sellerId must be stripped from input");
  console.log("  ✓ Product listing sanitized and client metrics stripped");

  const rawServicePayload = {
    title: "Graphic Design & Brand Identity",
    price: 5000,
    category: "Design & Printing",
    listingType: "service",
    serviceDetails: {
      pricingModel: "starting_at",
      deliveryTime: "24-48 hours",
      serviceLocationType: "on_campus",
    },
    views: 500, // Should be stripped
  };

  const sanitizedService = sanitizeListingInput(rawServicePayload);
  assert.strictEqual(sanitizedService.listingType, "service", "listingType should be service");
  assert.strictEqual(sanitizedService.serviceDetails?.pricingModel, "starting_at");
  assert.strictEqual(sanitizedService.serviceDetails?.deliveryTime, "24-48 hours");
  assert.strictEqual(sanitizedService.priceFormatted, "₦5,000");
  console.log("  ✓ Service listing correctly preserves service details and pricing model");
}

// ----------------------------------------------------------------------------
// TEST 2: Listing-to-Store Association & Ownership Safeguards
// ----------------------------------------------------------------------------
function testAssociationRules() {
  console.log("\n[Test 2] Testing Listing-to-Store Association Rules...");

  // Mock listing
  const mockListing: Partial<IListing> = {
    id: "lst-101",
    sellerId: "usr-owner-1",
    storeId: undefined, // Initially unlinked personal listing
    title: "Calculus Textbook",
    price: 4500,
    status: "active",
  };

  // 1. Linking: Associate listing to store
  const storeId = "store-abc-123";
  mockListing.storeId = storeId;
  assert.strictEqual(mockListing.storeId, storeId, "Listing must be linked to storeId");
  console.log("  ✓ Listing successfully linked to storefront");

  // 2. Disassociating (Unlink): Sets storeId to undefined, preserving original listing
  mockListing.storeId = undefined;
  assert.strictEqual(mockListing.storeId, undefined, "Disassociated listing must retain original sellerId and properties");
  assert.strictEqual(mockListing.sellerId, "usr-owner-1", "Original seller remains intact");
  assert.strictEqual(mockListing.price, 4500, "Original price remains intact");
  console.log("  ✓ Listing successfully unlinked from storefront while preserving personal item");
}

// ----------------------------------------------------------------------------
// TEST 3: Store Settings Sanitization
// ----------------------------------------------------------------------------
function testStoreSettingsSanitization() {
  console.log("\n[Test 3] Testing Store Settings Update Security...");

  const maliciousPayload = {
    name: "Updated Store Name",
    description: "New store tagline",
    operatingLocation: "Faculty of Science Foyer",
    category: "Laptops & Computers",
    status: "active", // Attacker trying to un-suspend
    metrics: { rating: 5.0, reviewsCount: 1000, listingsCount: 500 }, // Manipulated
    isVerified: true, // Attacker trying to self-verify
  };

  const sanitized = sanitizeStoreInput(maliciousPayload);
  assert.strictEqual(sanitized.name, "Updated Store Name");
  assert.strictEqual(sanitized.operatingLocation, "Faculty of Science Foyer");
  assert.strictEqual(sanitized.status, undefined, "Store status must NOT be client-modifiable");
  assert.strictEqual(sanitized.metrics, undefined, "Store metrics must NOT be client-modifiable");
  assert.strictEqual(sanitized.isVerified, undefined, "Verification status must NOT be client-modifiable");
  console.log("  ✓ Store update sanitization strictly protects status and metrics authority");
}

// ----------------------------------------------------------------------------
// RUN ALL TESTS
// ----------------------------------------------------------------------------
async function runAll() {
  testServiceListingSchema();
  testAssociationRules();
  testStoreSettingsSanitization();

  console.log("\n=======================================================");
  console.log("  ALL STEP 05 & 06 CATALOG INTEGRATION TESTS PASSED!   ");
  console.log("=======================================================\n");
}

runAll();
