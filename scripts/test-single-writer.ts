/**
 * Test Suite: Single Writer Architecture Verification
 * [BOTH] Single writer per collection:
 * - Next.js owns stores, business_applications, listings.
 * - Express is strictly read-only on users and listings.
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
  console.log(" SINGLE WRITER ARCHITECTURE: NEXT.JS WRITER & EXPRESS READ-ONLY");
  console.log("==================================================================\n");

  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  process.env.MONGODB_URI = uri;

  await mongoose.connect(uri);

  // Connect Express's internal mongoose instance if it's separate from root mongoose
  try {
    // @ts-ignore
    const expressMongoose = (await import("../campus-hive-backend/node_modules/mongoose/index.js")).default;
    if (expressMongoose !== mongoose) {
      await expressMongoose.connect(uri);
    }
  } catch {
    // If not separate, ignore
  }

  let passed = 0;
  function pass(msg: string) {
    passed++;
    console.log(`[PASS] ${msg}`);
  }

  try {
    // Import Next.js Models
    const { default: NextListingModel } = await import("../app/models/Listing");
    const { default: NextStoreModel } = await import("../app/models/Store");
    const { default: NextBusinessAppModel } = await import("../app/models/BusinessApplication");
    const { default: NextUserModel } = await import("../app/models/User");

    // Import Express Models & Controllers
    const { default: ExpressListingModel } = await import("../campus-hive-backend/models/Listing.js");
    const { default: ExpressUserModel } = await import("../campus-hive-backend/models/User.js");
    const {
      createListing: expressCreateListing,
      updateListing: expressUpdateListing,
      adminApproveListing: expressAdminApprove,
      adminRejectListing: expressAdminReject,
    } = await import("../campus-hive-backend/controllers/listing.controller.js");
    const {
      register: expressRegisterUser,
      updateUser: expressUpdateUser,
    } = await import("../campus-hive-backend/controllers/user.controller.js");
    const {
      adminSignUp: expressAdminSignUp,
    } = await import("../campus-hive-backend/controllers/adminAuth.controller.js");

    // ------------------------------------------------------------------------
    // Group 1: Next.js Single Writer Ownership (stores, business_apps, listings)
    // ------------------------------------------------------------------------
    console.log("--- 1. Next.js Single Writer Ownership ---");

    // Next.js can write to users (seeding test user)
    const seedUser = await NextUserModel.create({
      name: "Tariq Danladi",
      email: "tariq.danladi@abu.edu.ng",
      role: "seller",
      accountStatus: "active",
      campus: "Ahmadu Bello University, Zaria",
    });
    assert(seedUser._id, "Next.js successfully wrote to users collection");
    pass("Next.js: User write operations verified");

    // Next.js owns stores
    const nextStore = await NextStoreModel.create({
      ownerId: seedUser._id.toString(),
      name: "Zaria Campus Tech Hub",
      slug: "zaria-campus-tech-hub",
      description: "Laptops, phones and accessories for ABU students.",
      storeType: "student_store",
      category: "Electronics",
      campus: "Ahmadu Bello University, Zaria",
      operatingLocation: "Samaru Main Campus, Block C",
      logo: "https://example.com/logo.png",
      status: "active",
      metrics: { rating: 5, reviewsCount: 0, completedDeals: 0, listingsCount: 0 },
    });
    assert(nextStore._id, "Next.js successfully created store document in 'stores'");
    pass("Next.js: Exclusively owns stores writes (StoreModel)");

    // Next.js owns business_applications
    const nextBizApp = await NextBusinessAppModel.create({
      applicantId: seedUser._id.toString(),
      businessName: "Zaria Campus Tech Ventures",
      businessCategory: "Electronics",
      campus: "Ahmadu Bello University, Zaria",
      operatingLocation: "Samaru Market",
      contactPhone: "+2348011223344",
      contactEmail: "biz@abu.edu.ng",
      status: "pending_review",
    });
    assert(nextBizApp._id, "Next.js successfully created business application");
    pass("Next.js: Exclusively owns business_applications writes (BusinessApplicationModel)");

    // Next.js owns listings
    const nextListing = await NextListingModel.create({
      sellerId: seedUser._id.toString(),
      listingType: "product",
      title: "MacBook Air M2 2022",
      price: 650000,
      priceFormatted: "₦650,000",
      description: "Midnight blue MacBook Air M2, 8GB/256GB, pristine condition.",
      category: "Electronics",
      campus: "Ahmadu Bello University, Zaria",
      location: "Suleiman Hall",
      condition: "Like New",
      status: "active",
    });
    assert(nextListing._id, "Next.js successfully created listing document in 'listings'");
    pass("Next.js: Exclusively owns listings writes (ListingModel)");

    // ------------------------------------------------------------------------
    // Group 2: Express Read-Only on Listings (Schema Enforcement)
    // ------------------------------------------------------------------------
    console.log("\n--- 2. Express Read-Only Enforcement on Listings ---");

    // Read query from Express succeeds
    const foundExpressListing = await ExpressListingModel.findById(nextListing._id);
    assert(foundExpressListing !== null, "Express can read listings created by Next.js");
    assert(foundExpressListing.title === "MacBook Air M2 2022", "Listing title accurately read by Express");
    pass("Express: Read queries on listings succeed (Listing.find / findById)");

    // Write attempts in Express must be blocked by Mongoose hooks
    let saveBlocked = false;
    try {
      const illegalListingDoc = new ExpressListingModel({
        sellerId: seedUser._id,
        title: "Illegal Listing Document",
        slug: "illegal-listing-doc",
        description: "Should never save",
        price: 1000,
        category: "Electronics",
        condition: "Brand New",
        location: "Campus",
        images: ["test.png"],
      });
      await illegalListingDoc.save();
    } catch (err: any) {
      if (err.message && err.message.includes("READ_ONLY_COLLECTION")) {
        saveBlocked = true;
      }
    }
    assert(saveBlocked, "Express blocked new Listing(...).save() with READ_ONLY_COLLECTION error");
    pass("Express: Blocked Listing.save() via read-only schema hook");

    let updateBlocked = false;
    try {
      await ExpressListingModel.findByIdAndUpdate(nextListing._id, { price: 500000 });
    } catch (err: any) {
      if (err.message && err.message.includes("READ_ONLY_COLLECTION")) {
        updateBlocked = true;
      }
    }
    assert(updateBlocked, "Express blocked Listing.findByIdAndUpdate with READ_ONLY_COLLECTION error");
    pass("Express: Blocked Listing.findByIdAndUpdate via read-only query hook");

    let deleteBlocked = false;
    try {
      await ExpressListingModel.findByIdAndDelete(nextListing._id);
    } catch (err: any) {
      if (err.message && err.message.includes("READ_ONLY_COLLECTION")) {
        deleteBlocked = true;
      }
    }
    assert(deleteBlocked, "Express blocked Listing.findByIdAndDelete with READ_ONLY_COLLECTION error");
    pass("Express: Blocked Listing.findByIdAndDelete via read-only query hook");

    let insertManyBlocked = false;
    try {
      await ExpressListingModel.insertMany([{
        sellerId: seedUser._id,
        title: "Bulk Listing",
        slug: "bulk-listing",
        description: "Bulk test",
        price: 2000,
        category: "Academics",
        condition: "Brand New",
        location: "Campus",
        images: ["img.png"],
      }]);
    } catch (err: any) {
      if (err.message && err.message.includes("READ_ONLY_COLLECTION")) {
        insertManyBlocked = true;
      }
    }
    assert(insertManyBlocked, "Express blocked Listing.insertMany with READ_ONLY_COLLECTION error");
    pass("Express: Blocked Listing.insertMany via read-only model hook");

    // ------------------------------------------------------------------------
    // Group 3: Express Read-Only on Users (Schema Enforcement)
    // ------------------------------------------------------------------------
    console.log("\n--- 3. Express Read-Only Enforcement on Users ---");

    // Read query from Express succeeds
    const foundExpressUser = await ExpressUserModel.findById(seedUser._id).select("-password");
    assert(foundExpressUser !== null, "Express can read user document");
    assert(foundExpressUser.email === "tariq.danladi@abu.edu.ng", "User email accurately read by Express");
    pass("Express: Read queries on users succeed (User.find / findById)");

    // Write attempts on User in Express must be blocked by Mongoose hooks
    let userSaveBlocked = false;
    try {
      const illegalUserDoc = new ExpressUserModel({
        name: "Unauthorized Express User",
        email: "unauthorized@express.test",
        password: "supersecurepassword123",
        role: "buyer",
      });
      await illegalUserDoc.save();
    } catch (err: any) {
      if (err.message && err.message.includes("READ_ONLY_COLLECTION")) {
        userSaveBlocked = true;
      }
    }
    assert(userSaveBlocked, "Express blocked new User(...).save() with READ_ONLY_COLLECTION error");
    pass("Express: Blocked User.save() via read-only schema hook");

    let userUpdateBlocked = false;
    try {
      await ExpressUserModel.findByIdAndUpdate(seedUser._id, { "personalDetails.fullName": "Hacked Name" });
    } catch (err: any) {
      if (err.message && err.message.includes("READ_ONLY_COLLECTION")) {
        userUpdateBlocked = true;
      }
    }
    assert(userUpdateBlocked, "Express blocked User.findByIdAndUpdate with READ_ONLY_COLLECTION error");
    pass("Express: Blocked User.findByIdAndUpdate via read-only query hook");

    let userDeleteBlocked = false;
    try {
      await ExpressUserModel.findByIdAndDelete(seedUser._id);
    } catch (err: any) {
      if (err.message && err.message.includes("READ_ONLY_COLLECTION")) {
        userDeleteBlocked = true;
      }
    }
    assert(userDeleteBlocked, "Express blocked User.findByIdAndDelete with READ_ONLY_COLLECTION error");
    pass("Express: Blocked User.findByIdAndDelete via read-only query hook");

    let userInsertManyBlocked = false;
    try {
      await ExpressUserModel.insertMany([{
        name: "Bulk User",
        email: "bulk@express.test",
        password: "supersecurepassword123",
        role: "buyer",
      }]);
    } catch (err: any) {
      if (err.message && err.message.includes("READ_ONLY_COLLECTION")) {
        userInsertManyBlocked = true;
      }
    }
    assert(userInsertManyBlocked, "Express blocked User.insertMany with READ_ONLY_COLLECTION error");
    pass("Express: Blocked User.insertMany via read-only model hook");

    // ------------------------------------------------------------------------
    // Group 4: Express Controller Write Endpoints Return 405 Method Not Allowed
    // ------------------------------------------------------------------------
    console.log("\n--- 4. Express Write Route Rejection (405 Method Not Allowed) ---");

    // Mock Express res helper
    function createMockRes() {
      let statusCode = 200;
      let body: any = null;
      return {
        status(code: number) {
          statusCode = code;
          return this;
        },
        json(data: any) {
          body = data;
          return this;
        },
        get statusCode() {
          return statusCode;
        },
        get body() {
          return body;
        },
      };
    }

    // Express Listing Write Endpoints
    const resCreate = createMockRes();
    await expressCreateListing({} as any, resCreate as any);
    assert(resCreate.statusCode === 405, `expressCreateListing returned ${resCreate.statusCode}`);
    assert(resCreate.body.error === "METHOD_NOT_ALLOWED", "Error code is METHOD_NOT_ALLOWED");
    pass("Express: POST /api/listing/create returns 405 (owned by Next.js)");

    const resUpdate = createMockRes();
    await expressUpdateListing({} as any, resUpdate as any);
    assert(resUpdate.statusCode === 405, `expressUpdateListing returned ${resUpdate.statusCode}`);
    assert(resUpdate.body.error === "METHOD_NOT_ALLOWED", "Error code is METHOD_NOT_ALLOWED");
    pass("Express: PUT /api/listing/update/:id returns 405 (owned by Next.js)");

    const resApprove = createMockRes();
    await expressAdminApprove({} as any, resApprove as any);
    assert(resApprove.statusCode === 405, `expressAdminApprove returned ${resApprove.statusCode}`);
    assert(resApprove.body.error === "METHOD_NOT_ALLOWED", "Error code is METHOD_NOT_ALLOWED");
    pass("Express: PUT /api/listing/admin/approve/:id returns 405 (owned by Next.js)");

    const resReject = createMockRes();
    await expressAdminReject({} as any, resReject as any);
    assert(resReject.statusCode === 405, `expressAdminReject returned ${resReject.statusCode}`);
    assert(resReject.body.error === "METHOD_NOT_ALLOWED", "Error code is METHOD_NOT_ALLOWED");
    pass("Express: PUT /api/listing/admin/reject/:id returns 405 (owned by Next.js)");

    // Express User Write Endpoints
    const resUserReg = createMockRes();
    await expressRegisterUser({} as any, resUserReg as any);
    assert(resUserReg.statusCode === 405, `expressRegisterUser returned ${resUserReg.statusCode}`);
    pass("Express: POST /api/users/register returns 405 (owned by Next.js)");

    const resUserUpdate = createMockRes();
    await expressUpdateUser({} as any, resUserUpdate as any);
    assert(resUserUpdate.statusCode === 405, `expressUpdateUser returned ${resUserUpdate.statusCode}`);
    pass("Express: PATCH /api/users/update/:userId returns 405 (owned by Next.js)");

    const resAdminSignUp = createMockRes();
    await expressAdminSignUp({} as any, resAdminSignUp as any);
    assert(resAdminSignUp.statusCode === 405, `expressAdminSignUp returned ${resAdminSignUp.statusCode}`);
    pass("Express: POST /api/admin/auth/signup returns 405 (owned by Next.js)");

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
