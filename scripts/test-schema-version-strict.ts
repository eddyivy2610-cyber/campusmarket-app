/**
 * Test Suite: schemaVersion, strict: true & Required Validators
 * [BOTH] Add schemaVersion to documents. Then enforce required validators and strict: true.
 */

import { MongoMemoryServer } from "mongodb-memory-server";
import { strict as assert } from "node:assert";
import mongoose from "mongoose";

process.env.AUTH_SECRET = "super-secret-test-key-at-least-32-chars-long";
process.env.JWT_SECRET = process.env.AUTH_SECRET;
process.env.ADMIN_REGISTRATION_KEY = "test-admin-reg-key-at-least-32-chars-long";
process.env.SMTP_USER = "test@example.com";
process.env.SMTP_PASSWORD = "test-password";

async function run() {
  console.log("==================================================================");
  console.log(" SCHEMA VERSION, STRICT: TRUE & REQUIRED VALIDATORS SUITE");
  console.log("==================================================================\n");

  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  process.env.MONGODB_URI = uri;

  await mongoose.connect(uri);

  let passed = 0;
  function pass(msg: string) {
    passed++;
    console.log(`[PASS] ${msg}`);
  }

  try {
    // Import Next.js Models
    const { default: UserModel } = await import("../app/models/User");
    const { default: ListingModel } = await import("../app/models/Listing");
    const { default: StoreModel } = await import("../app/models/Store");
    const { default: BusinessApplicationModel } = await import("../app/models/BusinessApplication");
    const {
      ConversationModel,
      MessageModel,
      DealModel,
      ReviewModel,
    } = await import("../app/models/ChatModels");

    // ------------------------------------------------------------------------
    // Group 1: Next.js Models Default schemaVersion: 1
    // ------------------------------------------------------------------------
    console.log("--- 1. Default schemaVersion: 1 on Created Documents ---");

    const user = await UserModel.create({
      name: "Amina Yusuf",
      email: "amina.yusuf@abu.edu.ng",
      role: "seller",
      campus: "Ahmadu Bello University, Zaria",
    });
    assert.strictEqual(user.schemaVersion, 1, "UserModel document has schemaVersion: 1");
    pass("UserModel created with default schemaVersion: 1");

    const store = await StoreModel.create({
      ownerId: user._id.toString(),
      name: "Amina Campus Crafts",
      slug: "amina-campus-crafts",
      description: "Handcrafted bags and accessories.",
      storeType: "student_store",
      category: "Fashion",
      campus: "Ahmadu Bello University, Zaria",
      operatingLocation: "Alexander Hall",
      logo: "https://example.com/logo.png",
      metrics: { rating: 5, reviewsCount: 0, completedDeals: 0, listingsCount: 0 },
    });
    assert.strictEqual(store.schemaVersion, 1, "StoreModel document has schemaVersion: 1");
    pass("StoreModel created with default schemaVersion: 1");

    const listing = await ListingModel.create({
      sellerId: user._id.toString(),
      storeId: store._id.toString(),
      listingType: "product",
      title: "Handmade Leather Tote Bag",
      price: 15000,
      priceFormatted: "₦15,000",
      description: "Genuine brown leather tote bag with zip closure.",
      category: "Fashion",
      campus: "Ahmadu Bello University, Zaria",
      location: "Alexander Hall",
      condition: "Brand New",
      status: "active",
    });
    assert.strictEqual(listing.schemaVersion, 1, "ListingModel document has schemaVersion: 1");
    pass("ListingModel created with default schemaVersion: 1");

    const bizApp = await BusinessApplicationModel.create({
      applicantId: user._id.toString(),
      businessName: "Amina Crafts Limited",
      businessCategory: "Fashion",
      campus: "Ahmadu Bello University, Zaria",
      operatingLocation: "Samaru Main Market",
      contactPhone: "+2348011223344",
      contactEmail: "biz@amina.ng",
      status: "pending_review",
    });
    assert.strictEqual(bizApp.schemaVersion, 1, "BusinessApplicationModel document has schemaVersion: 1");
    pass("BusinessApplicationModel created with default schemaVersion: 1");

    const conv = await ConversationModel.create({
      conversationId: "conv-test-schema-001",
      participantIds: [user._id.toString(), "user-buyer-456"],
      participants: [
        {
          id: user._id.toString(),
          name: "Amina Yusuf",
          subtitle: "Vendor",
          isVerified: true,
          accountType: "student",
        },
        {
          id: "user-buyer-456",
          name: "Buyer Student",
          subtitle: "Buyer",
          isVerified: false,
          accountType: "student",
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    assert.strictEqual((conv as any).schemaVersion, 1, "ConversationModel document has schemaVersion: 1");
    pass("ConversationModel created with default schemaVersion: 1");

    const msg = await MessageModel.create({
      id: "msg-test-001",
      conversationId: "conv-test-schema-001",
      senderId: user._id.toString(),
      text: "Hello! Is this bag still available?",
      createdAt: new Date().toISOString(),
    });
    assert.strictEqual((msg as any).schemaVersion, 1, "MessageModel document has schemaVersion: 1");
    pass("MessageModel created with default schemaVersion: 1");

    const deal = await DealModel.create({
      id: "deal-test-001",
      conversationId: "conv-test-schema-001",
      resourceTitle: "Handmade Leather Tote Bag",
      buyerId: "user-buyer-456",
      sellerId: user._id.toString(),
      initiatedById: "user-buyer-456",
      agreedPriceFormatted: "₦15,000",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    assert.strictEqual((deal as any).schemaVersion, 1, "DealModel document has schemaVersion: 1");
    pass("DealModel created with default schemaVersion: 1");

    const review = await ReviewModel.create({
      id: "rev-test-001",
      dealId: "deal-test-001",
      conversationId: "conv-test-schema-001",
      reviewerId: "user-buyer-456",
      reviewerName: "Buyer Student",
      revieweeId: user._id.toString(),
      rating: 5,
      comment: "Excellent quality and fast delivery!",
      createdAt: new Date().toISOString(),
    });
    assert.strictEqual((review as any).schemaVersion, 1, "ReviewModel document has schemaVersion: 1");
    pass("ReviewModel created with default schemaVersion: 1");

    // ------------------------------------------------------------------------
    // Group 2: strict: true strips unmodeled fields
    // ------------------------------------------------------------------------
    console.log("\n--- 2. strict: true Enforcement (Strips Unmodeled Fields) ---");

    // Attempt to pass arbitrary unmodeled properties
    const strictUserDoc = await UserModel.create({
      name: "Strict Mode Tester",
      email: "strict.tester@abu.edu.ng",
      role: "buyer",
      // @ts-ignore
      maliciousField: "injection_payload",
      arbitraryData: 12345,
    });

    const rawUserDoc = await UserModel.collection.findOne({ _id: (strictUserDoc as any)._id });
    assert.strictEqual((rawUserDoc as any)?.maliciousField, undefined, "strict: true stripped 'maliciousField' on save");
    assert.strictEqual((rawUserDoc as any)?.arbitraryData, undefined, "strict: true stripped 'arbitraryData' on save");
    pass("UserModel enforced strict: true (unmodeled properties stripped from MongoDB)");

    const strictListingDoc = await ListingModel.create({
      sellerId: user._id.toString(),
      listingType: "product",
      title: "Scientific Calculator FX-991EX",
      price: 12000,
      priceFormatted: "₦12,000",
      description: "Original Casio calculator with natural textbook display.",
      category: "Academics",
      campus: "Ahmadu Bello University, Zaria",
      location: "Faculty of Science",
      condition: "Like New",
      // @ts-ignore
      injectedField: "should_be_stripped",
      shadowPrice: 0,
    });

    const rawListingDoc = await ListingModel.collection.findOne({ _id: (strictListingDoc as any)._id });
    assert.strictEqual((rawListingDoc as any)?.injectedField, undefined, "strict: true stripped 'injectedField' on listing");
    assert.strictEqual((rawListingDoc as any)?.shadowPrice, undefined, "strict: true stripped 'shadowPrice' on listing");
    pass("ListingModel enforced strict: true (unmodeled properties stripped from MongoDB)");

    const strictStoreDoc = await StoreModel.create({
      ownerId: "user-strict-store-owner",
      name: "Strict Electronics",
      slug: "strict-electronics",
      description: "Tested electronics and gadgets.",
      storeType: "student_store",
      category: "Electronics",
      campus: "Ahmadu Bello University, Zaria",
      operatingLocation: "Samaru",
      logo: "https://example.com/logo.png",
      metrics: { rating: 5, reviewsCount: 0, completedDeals: 0, listingsCount: 0 },
      // @ts-ignore
      bypassedAudit: true,
      fakeBadge: "gold",
    });

    const rawStoreDoc = await StoreModel.collection.findOne({ _id: (strictStoreDoc as any)._id });
    assert.strictEqual((rawStoreDoc as any)?.bypassedAudit, undefined, "strict: true stripped 'bypassedAudit' on store");
    assert.strictEqual((rawStoreDoc as any)?.fakeBadge, undefined, "strict: true stripped 'fakeBadge' on store");
    pass("StoreModel enforced strict: true (unmodeled properties stripped from MongoDB)");

    // ------------------------------------------------------------------------
    // Group 3: Required Validators Enforced on Writes
    // ------------------------------------------------------------------------
    console.log("\n--- 3. Required Validators Enforcement ---");

    // Document creation without required fields throws ValidationError
    let missingNameError = false;
    try {
      // @ts-ignore
      await UserModel.create({
        email: "missing.name@abu.edu.ng",
        // name is required
      });
    } catch (err: any) {
      if (err.name === "ValidationError" && err.errors?.name) {
        missingNameError = true;
      }
    }
    // Note: UserModel has a pre-save hook that defaults name from email if missing, which is expected.
    // Let's test a field that has no default hook: email is required!
    let missingEmailError = false;
    try {
      // @ts-ignore
      await UserModel.create({
        name: "Missing Email User",
        // email is required
      });
    } catch (err: any) {
      if (err.name === "ValidationError" && err.errors?.email) {
        missingEmailError = true;
      }
    }
    assert(missingEmailError, "UserModel enforced required validator on missing email");
    pass("UserModel: Missing required field strictly rejected with ValidationError");

    let missingListingPriceError = false;
    try {
      // @ts-ignore
      await ListingModel.create({
        sellerId: user._id.toString(),
        title: "Missing Price Listing",
        // price and description are required
      });
    } catch (err: any) {
      if (err.name === "ValidationError") {
        missingListingPriceError = true;
      }
    }
    assert(missingListingPriceError, "ListingModel enforced required validator on missing price/description");
    pass("ListingModel: Missing required fields strictly rejected with ValidationError");

    // Update query validator enforcement (runValidators: true)
    let invalidRoleUpdateError = false;
    try {
      await UserModel.findByIdAndUpdate(
        user._id,
        // @ts-ignore
        { role: "super_hacker_role" }
      );
    } catch (err: any) {
      if (err.name === "ValidationError" && err.errors?.role) {
        invalidRoleUpdateError = true;
      }
    }
    assert(invalidRoleUpdateError, "UserModel enforced enum validator on update via runValidators: true");
    pass("UserModel: findByIdAndUpdate strictly validates enum constraints (runValidators: true)");

    let invalidListingStatusUpdateError = false;
    try {
      await ListingModel.findByIdAndUpdate(
        listing._id,
        // @ts-ignore
        { status: "illegal_listing_status" }
      );
    } catch (err: any) {
      if (err.name === "ValidationError" && err.errors?.status) {
        invalidListingStatusUpdateError = true;
      }
    }
    assert(invalidListingStatusUpdateError, "ListingModel enforced enum validator on update via runValidators: true");
    pass("ListingModel: findByIdAndUpdate strictly validates enum constraints (runValidators: true)");

    let invalidStoreTypeUpdateError = false;
    try {
      await StoreModel.findByIdAndUpdate(
        store._id,
        // @ts-ignore
        { storeType: "unsupported_store_type" }
      );
    } catch (err: any) {
      if (err.name === "ValidationError" && err.errors?.storeType) {
        invalidStoreTypeUpdateError = true;
      }
    }
    assert(invalidStoreTypeUpdateError, "StoreModel enforced enum validator on update via runValidators: true");
    pass("StoreModel: findByIdAndUpdate strictly validates enum constraints (runValidators: true)");

    // ------------------------------------------------------------------------
    // Group 4: Express Backend Models schemaVersion & strict: true
    // ------------------------------------------------------------------------
    console.log("\n--- 4. Express Backend Models schemaVersion & strict: true ---");

    // Connect Express internal mongoose if separate
    try {
      // @ts-ignore
      const expressMongoose = (await import("../campus-hive-backend/node_modules/mongoose/index.js")).default;
      if (expressMongoose !== mongoose) {
        await expressMongoose.connect(uri);
      }
    } catch {}

    const { default: ExpressConvModel } = await import("../campus-hive-backend/models/Conversation.js");
    const { default: ExpressMsgModel } = await import("../campus-hive-backend/models/Message.js");
    const { default: ExpressNotificationModel } = await import("../campus-hive-backend/models/Notification.js");

    const expressNotification = await ExpressNotificationModel.create({
      recipient: user._id,
      type: "system",
      title: "Strict Mode Verified",
      message: "Your system has enforced strict: true and schemaVersion: 1.",
    });
    assert.strictEqual(expressNotification.schemaVersion, 1, "Express Notification has schemaVersion: 1");
    pass("Express NotificationModel: created with default schemaVersion: 1");

    const expressConv = await ExpressConvModel.create({
      participants: [user._id, new mongoose.Types.ObjectId()],
      status: "active",
    });
    assert.strictEqual(expressConv.schemaVersion, 1, "Express Conversation has schemaVersion: 1");
    pass("Express ConversationModel: created with default schemaVersion: 1");

    const expressMsg = await ExpressMsgModel.create({
      conversationId: expressConv._id,
      senderId: user._id,
      type: "text",
      text: "Test message from Express",
    });
    assert.strictEqual(expressMsg.schemaVersion, 1, "Express Message has schemaVersion: 1");
    pass("Express MessageModel: created with default schemaVersion: 1");

    console.log("\n==================================================================");
    console.log(` RESULTS: ${passed} PASSED | 0 FAILED`);
    console.log("==================================================================");
  } finally {
    try {
      // @ts-ignore
      const expressMongoose = (await import("../campus-hive-backend/node_modules/mongoose/index.js")).default;
      await expressMongoose.disconnect();
    } catch {}
    await mongoose.disconnect();
    await mongod.stop();
  }
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Test failed with error:", err);
    process.exit(1);
  });
