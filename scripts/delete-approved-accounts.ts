import crypto from "node:crypto";
import fs from "node:fs/promises";
import mongoose from "mongoose";
import dbConnect from "../app/lib/dbConnect";
import UserModel from "../app/models/User";

const COLLECTIONS = [
  "emailverifications",
  "followers",
  "reviews",
  "orders",
  "messages",
  "conversations",
  "listings",
  "stores",
  "business_applications",
];

function argument(name: string) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function readIds() {
  const file = argument("--ids-file");
  if (!file) throw new Error("--ids-file is required");
  const ids = (await fs.readFile(file, "utf8"))
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (!ids.length) throw new Error("The approved ID list is empty.");
  return [...new Set(ids)];
}

async function assertSnapshot(ids: string[]) {
  const snapshot = argument("--snapshot-confirmation");
  if (!snapshot) throw new Error("--snapshot-confirmation is required");
  const text = await fs.readFile(snapshot, "utf8");
  const expected = crypto.createHash("sha256").update(ids.slice().sort().join("\n")).digest("hex");
  if (!text.includes(expected)) {
    throw new Error("Snapshot confirmation does not match the approved ID list.");
  }
}

function filters(ids: string[]) {
  const objectIds = ids.filter((id) => mongoose.isValidObjectId(id)).map((id) => new mongoose.Types.ObjectId(id));
  return {
    strings: ids,
    objects: objectIds,
    user: { _id: { $in: objectIds } },
    owner: { ownerId: { $in: ids } },
    seller: { sellerId: { $in: ids } },
    buyer: { buyerId: { $in: ids } },
    participant: { $or: [{ participantIds: { $in: ids } }, { participants: { $in: objectIds } }] },
  };
}

function cloudinaryPublicId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== "res.cloudinary.com") return null;
    const marker = "/upload/";
    const index = parsed.pathname.indexOf(marker);
    if (index < 0) return null;
    const path = parsed.pathname.slice(index + marker.length).replace(/^v\d+\//, "");
    return path.replace(/\.[a-z0-9]+$/i, "");
  } catch {
    return null;
  }
}

async function destroyCloudinaryAssets(urls: string[]) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!urls.length) return { attempted: 0, skipped: 0 };
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary credentials are required to clean approved-account assets.");
  }
  let attempted = 0;
  let skipped = 0;
  for (const url of urls) {
    const publicId = cloudinaryPublicId(url);
    if (!publicId) {
      skipped += 1;
      continue;
    }
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signature = crypto
      .createHash("sha1")
      .update(`public_id=${publicId}&timestamp=${timestamp}${apiSecret}`)
      .digest("hex");
    const form = new URLSearchParams({ public_id: publicId, timestamp, api_key: apiKey, signature });
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
      method: "POST",
      body: form,
    });
    if (!response.ok) throw new Error(`Cloudinary cleanup failed for an asset (HTTP ${response.status}).`);
    attempted += 1;
  }
  return { attempted, skipped };
}

async function checkCounterDrift() {
  const db = mongoose.connection;
  const stores = await db.collection("stores").find({}, { projection: { _id: 1, "metrics.listingsCount": 1, "metrics.followersCount": 1 } }).toArray();
  let listingDrift = 0;
  let followerDrift = 0;
  for (const store of stores) {
    const id = store._id;
    const listings = await db.collection("listings").countDocuments({ storeId: String(id) });
    const followers = await db.collection("followers").countDocuments({ followingId: id, targetType: "store" });
    if (Number(store.metrics?.listingsCount || 0) !== listings) listingDrift += 1;
    if (Number(store.metrics?.followersCount || 0) !== followers) followerDrift += 1;
  }
  return { listingDrift, followerDrift };
}

async function counts(ids: string[], emails: string[]) {
  const f = filters(ids);
  const db = mongoose.connection;
  return {
    users: await db.collection("users").countDocuments({ _id: { $in: f.user._id.$in } }),
    emailverifications: await db.collection("emailverifications").countDocuments({ email: { $in: emails } }),
    followers: await db.collection("followers").countDocuments({ $or: [{ followerId: { $in: f.objects } }, { followingId: { $in: f.objects } }] }),
    reviews: await db.collection("reviews").countDocuments({ $or: [{ sellerId: { $in: f.objects } }, { reviewerId: { $in: f.objects } }] }),
    orders: await db.collection("orders").countDocuments({ $or: [{ buyerId: { $in: f.objects } }, { sellerId: { $in: f.objects } }] }),
    messages: await db.collection("messages").countDocuments({ senderId: { $in: f.strings } }),
    conversations: await db.collection("conversations").countDocuments(f.participant),
    listings: await db.collection("listings").countDocuments(f.seller),
    stores: await db.collection("stores").countDocuments(f.owner),
    business_applications: await db.collection("business_applications").countDocuments({ applicantId: { $in: f.strings } }),
  };
}

async function main() {
  const ids = await readIds();
  const dryRun = process.argv.includes("--dry-run");
  const apply = process.argv.includes("--apply");
  if (dryRun === apply) throw new Error("Specify exactly one of --dry-run or --apply.");
  await assertSnapshot(ids);
  await dbConnect();

  const adminMatches = await UserModel.countDocuments({ _id: { $in: ids }, role: "admin" });
  if (adminMatches) throw new Error("Refusing to delete admin accounts.");
  const targetUsers = await UserModel.find({ _id: { $in: ids } }).select("email").lean();
  const emails = targetUsers.map((user) => String(user.email).toLowerCase());

  const before = await counts(ids, emails);
  console.log(JSON.stringify({ mode: apply ? "apply" : "dry-run", ids, before }, null, 2));
  if (dryRun) {
    await mongoose.disconnect();
    return;
  }

  const assetDocs = await Promise.all([
    mongoose.connection.collection("users").find({ _id: { $in: filters(ids).user._id.$in } }, { projection: { "profile.avatar": 1, "profile.coverImage": 1 } }).toArray(),
    mongoose.connection.collection("stores").find(filters(ids).owner, { projection: { logo: 1 } }).toArray(),
    mongoose.connection.collection("listings").find(filters(ids).seller, { projection: { images: 1 } }).toArray(),
  ]);
  const assetUrls = assetDocs.flatMap((docs: any[]) => docs.flatMap((doc: any) => [doc?.profile?.avatar, doc?.profile?.coverImage, doc?.logo, ...(Array.isArray(doc?.images) ? doc.images : [])].filter((value): value is string => typeof value === "string")));

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const f = filters(ids);
      await UserModel.updateMany({ _id: { $in: f.user._id.$in } }, { $inc: { tokenVersion: 1 } }, { session });
      await mongoose.connection.collection("emailverifications").deleteMany({ email: { $in: emails } }, { session });
      await mongoose.connection.collection("followers").deleteMany({ $or: [{ followerId: { $in: f.objects } }, { followingId: { $in: f.objects } }] }, { session });
      await mongoose.connection.collection("reviews").deleteMany({ $or: [{ sellerId: { $in: f.objects } }, { reviewerId: { $in: f.objects } }] }, { session });
      await mongoose.connection.collection("orders").deleteMany({ $or: [{ buyerId: { $in: f.objects } }, { sellerId: { $in: f.objects } }] }, { session });
      await mongoose.connection.collection("messages").deleteMany({ senderId: { $in: f.strings } }, { session });
      const conversations = await mongoose.connection.collection("conversations").find(f.participant, { session }).toArray();
      const allParticipants = conversations.every((doc) => {
        const participantIds = (doc.participantIds || []).map(String);
        return participantIds.length > 0 && participantIds.every((id: string) => ids.includes(id));
      });
      if (conversations.length && !allParticipants) throw new Error("Refusing to delete a conversation with unapproved participants.");
      await mongoose.connection.collection("conversations").deleteMany(f.participant, { session });
      await mongoose.connection.collection("listings").deleteMany(f.seller, { session });
      await mongoose.connection.collection("stores").deleteMany(f.owner, { session });
      await mongoose.connection.collection("business_applications").deleteMany({ applicantId: { $in: f.strings } }, { session });
      await UserModel.deleteMany({ _id: { $in: f.user._id.$in } }, { session });
    });
  } finally {
    await session.endSession();
  }
  const assetCleanup = await destroyCloudinaryAssets([...new Set(assetUrls)]);
  const integrity = await checkCounterDrift();
  if (integrity.listingDrift !== 0 || integrity.followerDrift !== 0) {
    throw new Error(`Counter drift remains: ${JSON.stringify(integrity)}`);
  }
  console.log(JSON.stringify({ after: await counts(ids, emails), cloudinary: assetCleanup, integrity }, null, 2));
  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error("Approved-account deletion failed:", error?.message || error);
  await mongoose.disconnect().catch(() => undefined);
  process.exitCode = 1;
});
