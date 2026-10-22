import mongoose from "mongoose";

export interface MigrationSummary {
  usersNameBackfilled: number;
  usersAccountStatusSet: number;
  listingsTypeDefaulted: number;
  listingsConditionDefaulted: number;
  adminsMerged: number;
  adminsCollectionDropped: boolean;
  schemaVersionBackfilled: number;
  indexesRecreated: number;
  legacyStatusMigrated: number;
  legacyConditionsMigrated: number;
}

/**
 * Idempotent Phase 2 Database Backfill and Migration:
 * 1. Backfills User.name from personalDetails.fullName or profile.displayName.
 * 2. Sets accountStatus: "active" for legacy users missing account status.
 * 3. Defaults listingType and condition on legacy listings.
 * 4. Migrates legacy enum values (pending -> pending_review, deleted -> removed, New -> Brand New, Used - Like New -> Like New).
 * 5. Recreates unique indexes with partialFilterExpression (slug, listingCode, profile.handle).
 * 6. Merges legacy admins collection into users (role: "admin") and drops old admins collection.
 * 7. Backfills schemaVersion: 1 across all core collections.
 */
export async function runPhase2Backfill(connection?: mongoose.Connection): Promise<MigrationSummary> {
  const conn = connection || mongoose.connection;
  const db = conn.db;
  if (!db) {
    throw new Error("MongoDB database instance not available on connection.");
  }

  const summary: MigrationSummary = {
    usersNameBackfilled: 0,
    usersAccountStatusSet: 0,
    listingsTypeDefaulted: 0,
    listingsConditionDefaulted: 0,
    adminsMerged: 0,
    adminsCollectionDropped: false,
    schemaVersionBackfilled: 0,
    indexesRecreated: 0,
    legacyStatusMigrated: 0,
    legacyConditionsMigrated: 0,
  };

  const usersCollection = db.collection("users");
  const listingsCollection = db.collection("listings");

  // ------------------------------------------------------------------------
  // 1. Backfill User.name from personalDetails.fullName / profile.displayName
  // ------------------------------------------------------------------------
  const usersNeedingName = await usersCollection
    .find({
      $or: [
        { name: { $exists: false } },
        { name: null },
        { name: "" },
      ],
    })
    .toArray();

  if (usersNeedingName.length > 0) {
    const bulkOps = usersNeedingName.map((userDoc: any) => {
      const computedName =
        (typeof userDoc.personalDetails?.fullName === "string" && userDoc.personalDetails.fullName.trim()) ||
        (typeof userDoc.profile?.displayName === "string" && userDoc.profile.displayName.trim()) ||
        (typeof userDoc.profile?.handle === "string" && userDoc.profile.handle.trim()) ||
        (typeof userDoc.email === "string" && userDoc.email.split("@")[0].trim()) ||
        "Campus User";

      return {
        updateOne: {
          filter: { _id: userDoc._id },
          update: { $set: { name: computedName } },
        },
      };
    });

    const result = await usersCollection.bulkWrite(bulkOps);
    summary.usersNameBackfilled = result.modifiedCount || usersNeedingName.length;
  }

  // ------------------------------------------------------------------------
  // 2. Set accountStatus: "active" for legacy users
  // ------------------------------------------------------------------------
  const statusResult = await usersCollection.updateMany(
    {
      $or: [
        { accountStatus: { $exists: false } },
        { accountStatus: null },
        { accountStatus: "" },
      ],
    },
    {
      $set: { accountStatus: "active" },
    }
  );
  summary.usersAccountStatusSet = statusResult.modifiedCount;

  // ------------------------------------------------------------------------
  // 3. Default condition and listingType on legacy listings
  // ------------------------------------------------------------------------
  // 3a. Default listingType for service categories
  const serviceTypeResult = await listingsCollection.updateMany(
    {
      $or: [
        { listingType: { $exists: false } },
        { listingType: null },
        { listingType: "" },
      ],
      category: { $regex: /service/i },
    },
    {
      $set: { listingType: "service" },
    }
  );

  // 3b. Default listingType to "product" for all other legacy listings
  const productTypeResult = await listingsCollection.updateMany(
    {
      $or: [
        { listingType: { $exists: false } },
        { listingType: null },
        { listingType: "" },
      ],
    },
    {
      $set: { listingType: "product" },
    }
  );
  summary.listingsTypeDefaulted = serviceTypeResult.modifiedCount + productTypeResult.modifiedCount;

  // 3c. Default condition: "Used - Good" on product listings missing condition
  const conditionResult = await listingsCollection.updateMany(
    {
      listingType: "product",
      $or: [
        { condition: { $exists: false } },
        { condition: null },
        { condition: "" },
      ],
    },
    {
      $set: { condition: "Used - Good" },
    }
  );
  summary.listingsConditionDefaulted = conditionResult.modifiedCount;

  // 3d. Unset condition on service listings if accidentally present
  await listingsCollection.updateMany(
    {
      listingType: "service",
      condition: { $exists: true, $ne: null },
    },
    {
      $unset: { condition: "" },
    }
  );

  // ------------------------------------------------------------------------
  // 4. Migrate Legacy Enum Values in Listings
  // ------------------------------------------------------------------------
  // 4a. Status: "pending" -> "pending_review", "deleted" -> "removed"
  const pendingRes = await listingsCollection.updateMany(
    { status: "pending" },
    { $set: { status: "pending_review" } }
  );
  const deletedRes = await listingsCollection.updateMany(
    { status: "deleted" },
    { $set: { status: "removed" } }
  );
  summary.legacyStatusMigrated = pendingRes.modifiedCount + deletedRes.modifiedCount;

  // 4b. Condition: "New" -> "Brand New", "Used - Like New" -> "Like New"
  const newCondRes = await listingsCollection.updateMany(
    { condition: "New" },
    { $set: { condition: "Brand New" } }
  );
  const likeNewCondRes = await listingsCollection.updateMany(
    { condition: "Used - Like New" },
    { $set: { condition: "Like New" } }
  );
  summary.legacyConditionsMigrated = newCondRes.modifiedCount + likeNewCondRes.modifiedCount;

  // ------------------------------------------------------------------------
  // 5. Drop & Recreate Unique Indexes with partialFilterExpression
  // ------------------------------------------------------------------------
  try {
    // 5a. listings: slug and listingCode
    const listingIndexes = await listingsCollection.indexes();
    const hasSlugIndex = listingIndexes.some((idx: any) => idx.name === "slug_1");
    if (hasSlugIndex) {
      await listingsCollection.dropIndex("slug_1");
    }
    await listingsCollection.createIndex(
      { slug: 1 },
      {
        name: "slug_1",
        unique: true,
        partialFilterExpression: { slug: { $type: "string" } },
        background: true,
      }
    );
    summary.indexesRecreated += 1;

    const hasListingCodeIndex = listingIndexes.some((idx: any) => idx.name === "listingCode_1");
    if (hasListingCodeIndex) {
      await listingsCollection.dropIndex("listingCode_1");
    }
    await listingsCollection.createIndex(
      { listingCode: 1 },
      {
        name: "listingCode_1",
        unique: true,
        partialFilterExpression: { listingCode: { $type: "string" } },
        background: true,
      }
    );
    summary.indexesRecreated += 1;

    // 5b. users: profile.handle
    const userIndexes = await usersCollection.indexes();
    const hasHandleIndex = userIndexes.some((idx: any) => idx.name === "profile.handle_1");
    if (hasHandleIndex) {
      await usersCollection.dropIndex("profile.handle_1");
    }
    await usersCollection.createIndex(
      { "profile.handle": 1 },
      {
        name: "profile.handle_1",
        unique: true,
        partialFilterExpression: { "profile.handle": { $type: "string" } },
        background: true,
      }
    );
    summary.indexesRecreated += 1;
  } catch (idxErr) {
    console.warn("[Migration Index Warning] Could not migrate index:", idxErr);
  }

  // ------------------------------------------------------------------------
  // 6. Merge admins collection into users (role: "admin")
  // ------------------------------------------------------------------------
  const collections = await db.listCollections().toArray();
  const hasAdminsCollection = collections.some((c: any) => c.name === "admins");

  if (hasAdminsCollection) {
    const adminsCollection = db.collection("admins");
    const adminDocs = await adminsCollection.find({}).toArray();

    for (const adminDoc of adminDocs) {
      const cleanEmail = String(adminDoc.email || "").toLowerCase().trim();
      const username = String(adminDoc.username || adminDoc.name || cleanEmail.split("@")[0] || "admin").trim();
      const status = adminDoc.status === "suspended" ? "suspended" : "active";
      const now = new Date().toISOString();

      const existingUser = await usersCollection.findOne({
        $or: [{ email: cleanEmail }, { "profile.handle": username.toLowerCase() }],
      });

      if (existingUser) {
        // Upgrade existing user document to role: "admin"
        await usersCollection.updateOne(
          { _id: existingUser._id },
          {
            $set: {
              role: "admin",
              accountStatus: status,
              updatedAt: now,
            },
          }
        );
      } else {
        // Insert new admin record into users collection
        await usersCollection.insertOne({
          name: username,
          email: cleanEmail,
          password: adminDoc.password,
          role: "admin",
          accountStatus: status,
          isStudent: false,
          studentVerified: false,
          profile: {
            displayName: username,
            handle: username.toLowerCase().replace(/[^a-z0-9]/g, ""),
          },
          personalDetails: {
            fullName: username,
          },
          agreedToTerms: true,
          createdAt: adminDoc.createdAt ? new Date(adminDoc.createdAt).toISOString() : now,
          updatedAt: now,
        });
      }
      summary.adminsMerged += 1;
    }

    // Drop legacy admins collection
    try {
      await db.dropCollection("admins");
      summary.adminsCollectionDropped = true;
    } catch {
      summary.adminsCollectionDropped = false;
    }
  }

  // ------------------------------------------------------------------------
  // 7. Backfill schemaVersion: 1 across documents missing schemaVersion
  // ------------------------------------------------------------------------
  const allCurrentCollections = await db.listCollections().toArray();
  const coreCollections = [
    "users",
    "listings",
    "stores",
    "business_applications",
    "conversations",
    "messages",
  ];

  for (const collName of coreCollections) {
    const isPresent = allCurrentCollections.some((c: any) => c.name === collName);
    if (isPresent) {
      const coll = db.collection(collName);
      const res = await coll.updateMany(
        {
          $or: [
            { schemaVersion: { $exists: false } },
            { schemaVersion: null },
          ],
        },
        {
          $set: { schemaVersion: 1 },
        }
      );
      summary.schemaVersionBackfilled += res.modifiedCount;
    }
  }

  return summary;
}
