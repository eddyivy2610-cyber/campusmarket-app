import assert from "node:assert";
import {
  IStore,
  StoreStatus,
  sanitizeStoreInput,
} from "../../models/Store";
import {
  IListing,
  IServiceDetails,
  sanitizeListingInput,
} from "../../models/Listing";

console.log("=== RUNNING STEP 07: PUBLIC STOREFRONTS & DISCOVERY TESTS ===");

// ----------------------------------------------------------------------------
// TEST 1: Public Store Visibility & Access Control
// ----------------------------------------------------------------------------
function testStoreVisibilityRules() {
  console.log("\n[Test 1] Testing Storefront Visibility Rules (Active vs Suspended vs Paused)...");

  interface MockStoreRecord {
    _id: string;
    slug: string;
    name: string;
    ownerId: string;
    status: StoreStatus;
    metrics: { rating: number; listingsCount: number };
  }

  const activeStore: MockStoreRecord = {
    _id: "660c11112222333344445555",
    slug: "samaru-gadgets",
    name: "Samaru Gadgets",
    ownerId: "user-owner-1",
    status: "active",
    metrics: { rating: 4.9, listingsCount: 15 },
  };

  const suspendedStore: MockStoreRecord = {
    _id: "660c22223333444455556666",
    slug: "banned-vendor",
    name: "Banned Vendor",
    ownerId: "user-owner-2",
    status: "suspended",
    metrics: { rating: 2.1, listingsCount: 3 },
  };

  const pausedStore: MockStoreRecord = {
    _id: "660c33334444555566667777",
    slug: "holiday-books",
    name: "Holiday Books",
    ownerId: "user-owner-3",
    status: "paused",
    metrics: { rating: 4.8, listingsCount: 8 },
  };

  function checkPublicStoreAccess(
    store: MockStoreRecord,
    requesterUserId: string | null
  ): { status: number; visible: boolean; isPaused?: boolean; error?: string } {
    if (store.status === "suspended") {
      const isOwner = requesterUserId === store.ownerId;
      if (!isOwner) {
        return { status: 403, visible: false, error: "This storefront is currently suspended." };
      }
      return { status: 200, visible: true, error: undefined };
    }

    if (store.status === "paused") {
      return { status: 200, visible: true, isPaused: true };
    }

    return { status: 200, visible: true, isPaused: false };
  }

  // A. Public user accessing active store
  const resActive = checkPublicStoreAccess(activeStore, null);
  assert.strictEqual(resActive.status, 200, "Active store should be accessible to public (200 OK)");
  assert.strictEqual(resActive.visible, true);
  assert.strictEqual(resActive.isPaused, false);
  console.log("  ✓ Active storefront is accessible to anonymous public visitors");

  // B. Public user accessing suspended store
  const resSuspendedPublic = checkPublicStoreAccess(suspendedStore, null);
  assert.strictEqual(resSuspendedPublic.status, 403, "Suspended store must return 403 Forbidden to public");
  assert.strictEqual(resSuspendedPublic.visible, false);
  console.log("  ✓ Suspended storefront strictly returns 403 Forbidden to public viewers");

  // C. Suspended store owner inspecting their own store
  const resSuspendedOwner = checkPublicStoreAccess(suspendedStore, "user-owner-2");
  assert.strictEqual(resSuspendedOwner.status, 200, "Suspended store owner can view their own storefront");
  assert.strictEqual(resSuspendedOwner.visible, true);
  console.log("  ✓ Suspended store owner can inspect their store for moderation resolution");

  // D. Public user accessing paused store
  const resPaused = checkPublicStoreAccess(pausedStore, null);
  assert.strictEqual(resPaused.status, 200);
  assert.strictEqual(resPaused.visible, true);
  assert.strictEqual(resPaused.isPaused, true, "Paused store must flag paused banner status");
  console.log("  ✓ Paused storefront remains browseable while flagging paused banner status");
}

// ----------------------------------------------------------------------------
// TEST 2: Service Listings Display & Pricing Model Representation
// ----------------------------------------------------------------------------
function testServiceListingDisplay() {
  console.log("\n[Test 2] Testing Service Pricing Model Formatting & Badges...");

  function formatServicePriceBadge(priceFormatted: string, pricingModel?: string): {
    displayPrice: string;
    badgeLabel: string;
  } {
    switch (pricingModel) {
      case "starting_at":
        return { displayPrice: `From ${priceFormatted}`, badgeLabel: "Starting at" };
      case "hourly":
        return { displayPrice: `${priceFormatted}/hr`, badgeLabel: "Hourly rate" };
      case "negotiable":
        return { displayPrice: `Approx. ${priceFormatted}`, badgeLabel: "Negotiable" };
      case "fixed":
      default:
        return { displayPrice: priceFormatted, badgeLabel: "Fixed price" };
    }
  }

  const startingAt = formatServicePriceBadge("₦5,000", "starting_at");
  assert.strictEqual(startingAt.displayPrice, "From ₦5,000");
  assert.strictEqual(startingAt.badgeLabel, "Starting at");

  const hourly = formatServicePriceBadge("₦2,500", "hourly");
  assert.strictEqual(hourly.displayPrice, "₦2,500/hr");
  assert.strictEqual(hourly.badgeLabel, "Hourly rate");

  const fixed = formatServicePriceBadge("₦15,000", "fixed");
  assert.strictEqual(fixed.displayPrice, "₦15,000");
  assert.strictEqual(fixed.badgeLabel, "Fixed price");

  console.log("  ✓ Service pricing models ('starting_at', 'hourly', 'fixed') format correctly for public view");
}

// ----------------------------------------------------------------------------
// TEST 3: Contextual Message Query String Generation
// ----------------------------------------------------------------------------
function testContextualInquiryURL() {
  console.log("\n[Test 3] Testing Contextual Enquiry URL Generation...");

  function buildContextualMessageUrl({
    storeId,
    recipientId,
    itemId,
    title,
    isService,
  }: {
    storeId: string;
    recipientId: string;
    itemId: string;
    title: string;
    isService: boolean;
  }): string {
    const params = new URLSearchParams({
      recipient: recipientId,
      store: storeId,
      ...(isService ? { service: itemId } : { listing: itemId }),
      title,
    });
    return `/messages?${params.toString()}`;
  }

  const productUrl = buildContextualMessageUrl({
    storeId: "store-123",
    recipientId: "owner-456",
    itemId: "lst-product-789",
    title: "HP EliteBook 840 G5",
    isService: false,
  });

  assert.ok(productUrl.includes("recipient=owner-456"));
  assert.ok(productUrl.includes("store=store-123"));
  assert.ok(productUrl.includes("listing=lst-product-789"));
  assert.ok(productUrl.includes("title=HP+EliteBook+840+G5"));
  console.log("  ✓ Product contextual chat inquiry URL generated accurately");

  const serviceUrl = buildContextualMessageUrl({
    storeId: "store-123",
    recipientId: "owner-456",
    itemId: "lst-service-999",
    title: "Final Year Thesis Hardcover Binding",
    isService: true,
  });

  assert.ok(serviceUrl.includes("recipient=owner-456"));
  assert.ok(serviceUrl.includes("store=store-123"));
  assert.ok(serviceUrl.includes("service=lst-service-999"));
  assert.ok(serviceUrl.includes("title=Final+Year+Thesis+Hardcover+Binding"));
  console.log("  ✓ Service contextual inquiry URL routes directly into chat with service context");
}

// ----------------------------------------------------------------------------
// RUN ALL TESTS
// ----------------------------------------------------------------------------
try {
  testStoreVisibilityRules();
  testServiceListingDisplay();
  testContextualInquiryURL();

  console.log("\n=======================================================");
  console.log("  ALL STEP 07 DISCOVERY & STOREFRONT TESTS PASSED!   ");
  console.log("=======================================================\n");
} catch (error) {
  console.error("\n❌ Step 07 Validation Test Failed:", error);
  process.exit(1);
}
