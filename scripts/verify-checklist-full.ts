import { NextRequest } from "next/server";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import UserModel from "../app/models/User";
import StoreModel from "../app/models/Store";
import ListingModel from "../app/models/Listing";
import BusinessApplicationModel from "../app/models/BusinessApplication";

// API Handlers
import { GET as getListings, POST as postListings } from "../app/api/listings/route";
import { GET as getListingDetail, PATCH as patchListingDetail, DELETE as deleteListingDetail } from "../app/api/listings/[id]/route";
import { GET as getStores, POST as postStore } from "../app/api/stores/route";
import { GET as getStoreDetail, PATCH as patchStoreDetail } from "../app/api/stores/[id]/route";
import { GET as getStoreListings, POST as postStoreListings, DELETE as deleteStoreListing } from "../app/api/stores/[id]/listings/route";
import { POST as postBusinessApp } from "../app/api/stores/business-application/route";
import { GET as getAdminOverview } from "../app/api/admin/overview/route";
import { PATCH as patchAdminApp } from "../app/api/admin/business-applications/[id]/route";
import { PATCH as patchAdminListing } from "../app/api/admin/listings/[id]/route";
import { PATCH as patchAdminStore } from "../app/api/admin/stores/[id]/route";
import { PATCH as patchAdminUser } from "../app/api/admin/users/[id]/route";
import { createAuthToken } from "../app/lib/authTokens";

function makeReq(
  url: string,
  user?: { id: string; name: string; email: string; role?: string; isStudent?: boolean; studentVerified?: boolean },
  method: string = "GET",
  body?: any
): NextRequest {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (user) {
    const role = (user.role === "admin" ? "admin" : (user.role === "seller" ? "seller" : "buyer")) as "buyer" | "seller" | "admin";
    const token = createAuthToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: role,
      isStudent: user.isStudent ?? true,
      studentVerified: user.studentVerified ?? true,
    });
    headers["Authorization"] = `Bearer ${token}`;
  }

  return new NextRequest(new URL(url, "http://localhost:3000"), {
    method,
    headers,
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
}

async function runFullVerification() {
  console.log("==========================================================");
  console.log(" CAMPUS HIVE 2.0 — FULL END-TO-END CHECKLIST AUDIT & VERIFICATION");
  console.log("==========================================================\n");

  console.log("[Setup] Starting in-memory MongoDB server...");
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  process.env.MONGODB_URI = uri;

  if ((global as any).mongooseCache) {
    (global as any).mongooseCache.conn = null;
    (global as any).mongooseCache.promise = null;
  }
  await mongoose.disconnect();
  await mongoose.connect(uri);
  console.log("[Setup] In-memory MongoDB connected successfully at:", uri);

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, msg: string) {
    if (condition) {
      console.log(`  [PASS] ${msg}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${msg}`);
      failed++;
    }
  }

  // Generate valid 24-hex ObjectIds
  const runId = Date.now().toString().slice(-6);
  const studentUserA = {
    id: new mongoose.Types.ObjectId().toString(),
    name: "Amina Bello",
    email: `amina.${runId}@abu.edu.ng`,
    role: "buyer",
    isStudent: true,
    studentVerified: true,
  };
  const studentUserB = {
    id: new mongoose.Types.ObjectId().toString(),
    name: "Chidi Okafor",
    email: `chidi.${runId}@abu.edu.ng`,
    role: "buyer",
    isStudent: true,
    studentVerified: true,
  };
  const unverifiedStudent = {
    id: new mongoose.Types.ObjectId().toString(),
    name: "New Student",
    email: `unverified.${runId}@abu.edu.ng`,
    role: "buyer",
    isStudent: true,
    studentVerified: false,
  };
  const adminUser = {
    id: new mongoose.Types.ObjectId().toString(),
    name: "Campus Hive Admin",
    email: `admin.${runId}@campushive.edu.ng`,
    role: "admin",
  };

  // Upsert users in DB for eligibility checks
  await UserModel.deleteMany({
    _id: { $in: [studentUserA.id, studentUserB.id, unverifiedStudent.id, adminUser.id] },
  });
  await UserModel.create([
    {
      _id: studentUserA.id,
      email: studentUserA.email,
      name: studentUserA.name,
      role: "buyer",
      isStudent: true,
      studentVerified: true,
      accountStatus: "active",
      campus: "Ahmadu Bello University (ABU)",
    },
    {
      _id: studentUserB.id,
      email: studentUserB.email,
      name: studentUserB.name,
      role: "buyer",
      isStudent: true,
      studentVerified: true,
      accountStatus: "active",
      campus: "Ahmadu Bello University (ABU)",
    },
    {
      _id: unverifiedStudent.id,
      email: unverifiedStudent.email,
      name: unverifiedStudent.name,
      role: "buyer",
      isStudent: true,
      studentVerified: false,
      accountStatus: "active",
      campus: "Ahmadu Bello University (ABU)",
    },
    {
      _id: adminUser.id,
      email: adminUser.email,
      name: adminUser.name,
      role: "admin",
      accountStatus: "active",
      campus: "Ahmadu Bello University (ABU)",
    },
  ]);

  try {
    // -------------------------------------------------------------
    // SECTION A: Core Marketplace
    // -------------------------------------------------------------
    console.log("\n--- SECTION A: Core Marketplace ---");

    // 1. Create a product listing
    const prodRes = (await postListings(
      makeReq("/api/listings", studentUserA, "POST", {
        title: `HP EliteBook ${runId}`,
        description: "Excellent laptop for computer science students",
        category: "Laptops & Computers",
        price: 185000,
        campus: "Ahmadu Bello University (ABU)",
        location: "Suleiman Hall",
        listingType: "product",
        condition: "Like New",
        images: ["https://images.unsplash.com/photo-laptop"],
      })
    ))!;
    assert(prodRes.status === 201, "Product listing created successfully (201)");
    const prodData: any = await prodRes.json();
    const productListingId = prodData.data?._id || prodData.data?.id;
    assert(!!productListingId, "Product listing returned valid ID");
    assert(prodData.data.priceFormatted.includes("185,000"), "Product price formatted in NGN with commas");
    assert(prodData.data.condition === "Like New", "Product retains condition field");

    // 2. Create a service listing
    const servRes = (await postListings(
      makeReq("/api/listings", studentUserA, "POST", {
        title: `Professional Graphic Design ${runId}`,
        description: "Flyers, logos and academic project slide branding",
        category: "Services",
        price: 5000,
        campus: "Ahmadu Bello University (ABU)",
        location: "Ribadu Hall Gate",
        listingType: "service",
        serviceDetails: {
          pricingModel: "starting_at",
          deliveryTime: "24-48 hours",
          serviceLocationType: "remote",
        },
        images: ["https://images.unsplash.com/photo-design"],
      })
    ))!;
    assert(servRes.status === 201, "Service listing created successfully (201)");
    const servData: any = await servRes.json();
    const serviceListingId = servData.data?._id || servData.data?.id;
    assert(servData.data.listingType === "service", "Service listing saved with listingType: service");
    assert(servData.data.condition === undefined, "Service listing omits product condition field");
    assert(servData.data.serviceDetails?.pricingModel === "starting_at", "Service listing includes serviceDetails");

    // 3. Discovery query filters (search, category, campus, price)
    const searchRes = (await getListings(
      makeReq(`/api/listings?q=EliteBook%20${runId}&campus=Ahmadu&category=Laptops%20%26%20Computers`)
    ))!;
    const searchJson: any = await searchRes.json();
    assert(searchRes.status === 200, "Discovery query returns 200");
    assert(searchJson.data.some((l: any) => l.title.includes(runId)), "Discovery search finds newly created product");

    // 4. Moderation / Status protection: Seller CANNOT self-activate a rejected or pending listing
    // Set listing to rejected via admin
    const adminRejectRes = (await patchAdminListing(
      makeReq(`/api/admin/listings/${productListingId}`, adminUser, "PATCH", {
        action: "reject",
        reason: "Prohibited trade item rule violation test",
      }),
      { params: Promise.resolve({ id: productListingId }) }
    ))!;
    assert(adminRejectRes.status === 200, "Admin can reject listing with moderationNotes");

    // Seller tries to bypass moderation by patching status: active
    const bypassRes = (await patchListingDetail(
      makeReq(`/api/listings/${productListingId}`, studentUserA, "PATCH", {
        status: "active",
      }),
      { params: Promise.resolve({ id: productListingId }) }
    ))!;
    assert(bypassRes.status === 403, "Seller is blocked (403) from self-activating a rejected listing");

    // Excluded from public discovery when rejected
    const publicDiscAfterReject = (await getListings(makeReq(`/api/listings?q=${runId}`)))!;
    const rejectCheckJson: any = await publicDiscAfterReject.json();
    assert(
      !rejectCheckJson.data.some((l: any) => (l._id || l.id) === productListingId),
      "Rejected listing is excluded from public discovery"
    );

    // Restore listing to active for downstream tests
    await patchAdminListing(
      makeReq(`/api/admin/listings/${productListingId}`, adminUser, "PATCH", {
        action: "approve",
      }),
      { params: Promise.resolve({ id: productListingId }) }
    );

    // -------------------------------------------------------------
    // SECTION B: Stores & Services
    // -------------------------------------------------------------
    console.log("\n--- SECTION B: Stores & Services ---");

    // 1. Unverified student blocked from creating student store
    const unverifiedStoreRes = (await postStore(
      makeReq("/api/stores", unverifiedStudent, "POST", {
        name: `Illegal Store ${runId}`,
        description: "Should fail student verification",
        category: "Electronics",
        operatingLocation: "Hostel A",
        storeType: "student",
      })
    ))!;
    assert(unverifiedStoreRes.status === 403, "Unverified student is blocked (403) from creating student store");

    // 2. Verified student creates student store
    const validStoreRes = (await postStore(
      makeReq("/api/stores", studentUserA, "POST", {
        name: `Amina Tech Hub ${runId}`,
        description: "Laptops, gadgets and fast repairs",
        category: "Phones & Tablets",
        operatingLocation: "Suleiman Hall Common Area",
        storeType: "student",
        campus: "Ahmadu Bello University (ABU)",
        campusCity: "Zaria",
        logo: "https://images.unsplash.com/photo-store-logo",
      })
    ))!;
    assert(validStoreRes.status === 201, "Verified student successfully creates student store (201)");
    const storeData: any = await validStoreRes.json();
    const storeId = storeData.data?._id || storeData.data?.id;
    assert(!!storeId, "Store creation returned valid storeId");

    // 3. One storefront per account constraint: Duplicate store creation blocked
    const duplicateStoreRes = (await postStore(
      makeReq("/api/stores", studentUserA, "POST", {
        name: `Second Store Attempt ${runId}`,
        description: "Should fail duplicate constraint",
        category: "Fashion",
        operatingLocation: "Samaru",
        storeType: "student",
      })
    ))!;
    assert(duplicateStoreRes.status === 409, "Duplicate store creation blocked with 409 Conflict");

    // 4. Local Business flow: Must submit application and receive admin approval
    const busAppRes = (await postBusinessApp(
      makeReq("/api/stores/business-application", studentUserB, "POST", {
        businessName: `Campus Print & Stationary ${runId}`,
        ownerFullName: studentUserB.name,
        contactEmail: studentUserB.email,
        contactPhone: "08012345678",
        businessCategory: "Services",
        operatingLocation: "Off Campus Main Gate, Samaru",
        campus: "Ahmadu Bello University (ABU)",
        registrationNumber: `RC-${runId}`,
        supportingDocuments: ["https://campushive.edu.ng/uploads/cac.pdf"],
      })
    ))!;
    assert(busAppRes.status === 201, "Local business application submitted successfully (201)");
    const appJson: any = await busAppRes.json();
    const appId = appJson.data?._id || appJson.data?.id;

    // Admin approves business application -> activates storefront
    const approveAppRes = (await patchAdminApp(
      makeReq(`/api/admin/business-applications/${appId}`, adminUser, "PATCH", {
        action: "approve",
        adminNotes: "CAC and campus business license verified",
      }),
      { params: Promise.resolve({ id: appId }) }
    ))!;
    assert(approveAppRes.status === 200, "Admin approval activates local business storefront (200)");
    const approveJson: any = await approveAppRes.json();
    assert(approveJson.data?.application?.status === "approved", "Application status updated to approved");
    const createdBusinessStoreId = approveJson.data?.store?._id || approveJson.data?.store?.id;
    assert(!!createdBusinessStoreId, "Storefront auto-generated for approved business");

    // 5. Associating listings with storefront
    // User B tries to associate User A's listing to User B's store -> 403 Forbidden
    const unauthAssoc = (await postStoreListings(
      makeReq(`/api/stores/${createdBusinessStoreId}/listings`, studentUserB, "POST", {
        listingIds: [productListingId], // Owned by User A
      }),
      { params: Promise.resolve({ id: createdBusinessStoreId }) }
    ))!;
    const unauthAssocJson: any = await unauthAssoc.json();
    assert(
      unauthAssocJson.associatedCount === 0 && unauthAssocJson.failed?.length > 0,
      "Associating listing owned by another seller is rejected"
    );

    // User A associates both product and service to their own store
    const authAssoc = (await postStoreListings(
      makeReq(`/api/stores/${storeId}/listings`, studentUserA, "POST", {
        listingIds: [productListingId, serviceListingId],
      }),
      { params: Promise.resolve({ id: storeId }) }
    ))!;
    const authAssocJson: any = await authAssoc.json();
    assert(authAssocJson.associatedCount === 2, "User can associate multiple owned listings with their store");

    // Store metrics listingsCount updated consistently
    const updatedStore = await StoreModel.findById(storeId).lean();
    assert(updatedStore?.metrics?.listingsCount === 2, "Store metrics.listingsCount accurately matches active catalog (2)");

    // 6. Dissociating / unlinking a listing without deleting it
    const unlinkRes = (await deleteStoreListing(
      makeReq(`/api/stores/${storeId}/listings?listingId=${productListingId}`, studentUserA, "DELETE"),
      { params: Promise.resolve({ id: storeId }) }
    ))!;
    assert(unlinkRes.status === 200, "Listing dissociated from storefront successfully (200)");
    const unlinkedListing = await ListingModel.findById(productListingId).lean();
    assert(!!unlinkedListing, "Listing document STILL EXISTS after dissociation");
    assert(unlinkedListing?.storeId == null, "Listing storeId is cleared");

    // 7. Paused and Suspended Store Discovery Rules
    // Pause store
    await patchStoreDetail(
      makeReq(`/api/stores/${storeId}`, studentUserA, "PATCH", { status: "paused" }),
      { params: Promise.resolve({ id: storeId }) }
    );
    const publicStoresList = (await getStores(makeReq("/api/stores")))!;
    const publicStoresJson: any = await publicStoresList.json();
    assert(
      !publicStoresJson.data.some((s: any) => (s._id || s.id) === storeId),
      "Paused store is EXCLUDED from public directory"
    );

    // Unpause
    await patchStoreDetail(
      makeReq(`/api/stores/${storeId}`, studentUserA, "PATCH", { status: "active" }),
      { params: Promise.resolve({ id: storeId }) }
    );

    // -------------------------------------------------------------
    // SECTION C: Accounts, Messaging, Trust & Security
    // -------------------------------------------------------------
    console.log("\n--- SECTION C: Accounts, Messaging & Trust ---");

    // 1. Strict seller authorization on unlinked listings query
    // User tries to query someone else's unlinked items with spoofed sellerId param
    const unlinkedSpoofRes = (await getListings(
      makeReq(`/api/listings?unlinked=true&sellerId=${studentUserB.id}`, studentUserA, "GET")
    ))!;
    const spoofJson: any = await unlinkedSpoofRes.json();
    // Server must ignore spoofed sellerId and return User A's unlinked listings
    assert(
      spoofJson.data.every((l: any) => l.sellerId === studentUserA.id),
      "Unlinked listings query enforces server session identity and ignores spoofed sellerId"
    );

    // 2. Non-owner blocked from modifying another user's store
    const storeTamperRes = (await patchStoreDetail(
      makeReq(`/api/stores/${storeId}`, studentUserB, "PATCH", { name: "Hacked Store Name" }),
      { params: Promise.resolve({ id: storeId }) }
    ))!;
    assert(storeTamperRes.status === 403, "Non-owner blocked (403) from updating another user's storefront");

    // -------------------------------------------------------------
    // SECTION D: Admin and Moderation Suite
    // -------------------------------------------------------------
    console.log("\n--- SECTION D: Admin and Moderation Suite ---");

    // 1. Admin Overview
    const adminOverviewRes = (await getAdminOverview(makeReq("/api/admin/overview", adminUser)))!;
    assert(adminOverviewRes.status === 200, "Admin overview returns 200 with live DB metrics");

    // 2. Admin can suspend store with audited reason
    const suspendStoreRes = (await patchAdminStore(
      makeReq(`/api/admin/stores/${storeId}`, adminUser, "PATCH", {
        action: "suspend",
        suspensionReason: "Terms of service audit inspection",
      }),
      { params: Promise.resolve({ id: storeId }) }
    ))!;
    assert(suspendStoreRes.status === 200, "Admin can suspend store with recorded reason");
    const suspendedStore = await StoreModel.findById(storeId).lean();
    assert(suspendedStore?.status === "suspended", "Store status updated to suspended");
    assert(suspendedStore?.suspensionReason === "Terms of service audit inspection", "Audited suspensionReason saved");

    // Restore store
    const restoreStoreRes = (await patchAdminStore(
      makeReq(`/api/admin/stores/${storeId}`, adminUser, "PATCH", {
        action: "restore",
      }),
      { params: Promise.resolve({ id: storeId }) }
    ))!;
    assert(restoreStoreRes.status === 200, "Admin can restore suspended store");

    // 3. Admin can suspend user with audited reason
    const suspendUserRes = (await patchAdminUser(
      makeReq(`/api/admin/users/${studentUserB.id}`, adminUser, "PATCH", {
        action: "suspend",
        suspensionReason: "Identity verification failure",
      }),
      { params: Promise.resolve({ id: studentUserB.id }) }
    ))!;
    assert(suspendUserRes.status === 200, "Admin can suspend user with recorded reason");
    const suspendedUser = await UserModel.findById(studentUserB.id).lean();
    assert(suspendedUser?.accountStatus === "suspended", "User accountStatus updated to suspended");

    // Clean up test data
    await UserModel.deleteMany({
      _id: { $in: [studentUserA.id, studentUserB.id, unverifiedStudent.id, adminUser.id] },
    });
    await StoreModel.deleteMany({
      ownerId: { $in: [studentUserA.id, studentUserB.id, unverifiedStudent.id] },
    });
    await ListingModel.deleteMany({
      sellerId: { $in: [studentUserA.id, studentUserB.id, unverifiedStudent.id] },
    });
    await BusinessApplicationModel.deleteMany({
      applicantId: { $in: [studentUserA.id, studentUserB.id, unverifiedStudent.id] },
    });

    console.log("\n==========================================================");
    console.log(` RESULTS: ${passed} PASSED | ${failed} FAILED`);
    console.log("==========================================================");

    await mongoose.disconnect();
    await mongod.stop();

    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error("Verification execution error:", err);
    try {
      await mongoose.disconnect();
      await mongod.stop();
    } catch {}
    process.exit(1);
  }
}

runFullVerification().catch((err) => {
  console.error("Fatal test runner error:", err);
  process.exit(1);
});
