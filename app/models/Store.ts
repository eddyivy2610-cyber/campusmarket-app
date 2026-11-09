import mongoose, { Schema, Model, Document } from "mongoose";
import {
  STORE_STATUSES,
  STORE_SUSPENDED_BY_REASONS,
  StoreStatus,
  StoreSuspendedBy,
} from "@/constants/enums";

export type StoreType = "student_store" | "local_business";
export type { StoreStatus, StoreSuspendedBy };
export type StoreVerificationType = "student" | "business";

export interface IStoreContact {
  phone?: string;
  whatsapp?: string;
  email?: string;
}

export interface IStoreMetrics {
  rating: number;
  reviewsCount: number;
  completedDeals: number;
  listingsCount: number;
  followersCount: number;
}

export interface IStore {
  id: string;
  publicId?: string; // RFC 9562 UUIDv7
  ownerId: string; // User can own up to MAX_STORES_PER_USER stores
  ownerFullName?: string;
  showOwnerName?: boolean;
  name: string;
  slug: string;
  slugLower: string;
  slugUpdatedAt?: string;
  description: string;
  storeType: StoreType;
  category: string;
  categoryTags?: string[];
  campus: string;
  campusCity?: string;
  operatingLocation: string; // e.g. "Ribadu Hall, Room 42" or "Off-campus: Samaru Market"
  logo: string;
  coverImage?: string;
  status: StoreStatus;
  isVerified: boolean;
  verificationType: StoreVerificationType;
  studentIdImage?: string;
  studentIdExpiryDate?: string;
  locationProofDocument?: string;
  businessApplicationId?: string; // Links to BusinessApplication if local_business
  contact?: IStoreContact;
  suspensionReason?: string;
  suspendedBy?: StoreSuspendedBy;
  pausedBy?: "seller" | "admin";
  deletedAt?: string;
  metrics: IStoreMetrics;
  schemaVersion?: number;
  createdAt: string;
  updatedAt: string;
}

export interface IStoreDocument extends Omit<IStore, "id">, Document {}

const StoreSchema = new Schema<IStoreDocument>(
  {
    publicId: {
      type: String,
      required: false,
    },
    ownerId: {
      type: String,
      required: true,
      index: true, // Non-unique: up to MAX_STORES_PER_USER stores per user
    },
    ownerFullName: {
      type: String,
      required: false,
      trim: true,
    },
    showOwnerName: {
      type: Boolean,
      default: false,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    slugLower: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    slugUpdatedAt: {
      type: String,
      required: false,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    storeType: {
      type: String,
      enum: ["student_store", "local_business"],
      required: true,
      default: "student_store",
    },
    category: {
      type: String,
      required: true,
      index: true,
    },
    categoryTags: {
      type: [String],
      default: [],
    },
    campus: {
      type: String,
      required: true,
      index: true,
    },
    campusCity: {
      type: String,
      required: false,
    },
    operatingLocation: {
      type: String,
      required: true,
      trim: true,
    },
    logo: {
      type: String,
      required: true,
    },
    coverImage: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      enum: STORE_STATUSES,
      default: "active",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationType: {
      type: String,
      enum: ["student", "business"],
      default: "student",
    },
    studentIdImage: {
      type: String,
      required: false,
    },
    studentIdExpiryDate: {
      type: String,
      required: false,
    },
    locationProofDocument: {
      type: String,
      required: false,
    },
    businessApplicationId: {
      type: String,
      required: false,
      index: true,
    },
    contact: {
      phone: { type: String, required: false },
      whatsapp: { type: String, required: false },
      email: { type: String, required: false },
    },
    suspensionReason: {
      type: String,
      required: false,
    },
    suspendedBy: {
      type: String,
      enum: STORE_SUSPENDED_BY_REASONS,
      required: false,
    },
    pausedBy: {
      type: String,
      enum: ["seller", "admin"],
      required: false,
    },
    deletedAt: {
      type: String,
      required: false,
    },
    metrics: {
      rating: { type: Number, default: 5.0 },
      reviewsCount: { type: Number, default: 0 },
      completedDeals: { type: Number, default: 0 },
      listingsCount: { type: Number, default: 0 },
      followersCount: { type: Number, default: 0 },
    },
    schemaVersion: {
      type: Number,
      default: 1,
      required: true,
      index: true,
    },
    createdAt: {
      type: String,
      default: () => new Date().toISOString(),
    },
    updatedAt: {
      type: String,
      default: () => new Date().toISOString(),
    },
  },
  {
    timestamps: false,
    strict: true,
    collection: "stores",
    autoIndex: process.env.NODE_ENV !== "production",
  }
);

// Keep slug and slugLower synchronized on validation and updates
StoreSchema.pre("validate", function () {
  if (this.slug) {
    this.slug = String(this.slug).toLowerCase().trim();
    this.slugLower = this.slug;
  } else if (this.slugLower) {
    this.slugLower = String(this.slugLower).toLowerCase().trim();
    this.slug = this.slugLower;
  }
});

// Enforce required validators on all update operations and sync slugLower
(StoreSchema as any).pre(["updateOne", "updateMany", "findOneAndUpdate", "findByIdAndUpdate"], function (this: any) {
  this.setOptions({ runValidators: true });
  const update = this.getUpdate?.();
  if (update) {
    if (typeof update.slug === "string") {
      update.slug = update.slug.toLowerCase().trim();
      update.slugLower = update.slug;
    }
    if (update.$set && typeof update.$set.slug === "string") {
      update.$set.slug = update.$set.slug.toLowerCase().trim();
      update.$set.slugLower = update.$set.slug;
    }
  }
});

// Compound ESR indexes for store directory queries sorted by rating and recency
StoreSchema.index(
  { publicId: 1 },
  { unique: true, partialFilterExpression: { publicId: { $type: "string" } } }
);
StoreSchema.index({ ownerId: 1, status: 1 });
StoreSchema.index({ status: 1, campus: 1, "metrics.rating": -1, createdAt: -1 });
StoreSchema.index({ status: 1, "metrics.rating": -1, createdAt: -1 });
StoreSchema.index({ storeType: 1, status: 1 });

export const StoreModel: Model<IStoreDocument> =
  mongoose.models.CampusStore ||
  mongoose.model<IStoreDocument>("CampusStore", StoreSchema, "stores");

// Ensure MongoDB creates and synchronizes indexes in dev/test (no-op in production)
export async function ensureStoreIndexes() {
  if (process.env.NODE_ENV === "production") return;
  if (typeof window === "undefined" && mongoose.connection.readyState === 1) {
    try {
      // Drop legacy unique ownerId_1 index if present before initializing non-unique index
      try {
        const indexes = await StoreModel.collection.indexes();
        const ownerIdx = indexes.find((idx: any) => idx.name === "ownerId_1" && idx.unique === true);
        if (ownerIdx) {
          await StoreModel.collection.dropIndex("ownerId_1");
        }
      } catch {
        // Collection may not exist yet
      }
      await StoreModel.init();
    } catch (err: any) {
      console.warn("[StoreModel] Index initialization notice:", err?.message);
    }
  }
}

if (typeof window === "undefined" && mongoose.connection.readyState === 1) {
  ensureStoreIndexes();
}

export const RESERVED_STORE_SLUGS = new Set([
  "admin",
  "api",
  "auth",
  "login",
  "register",
  "signup",
  "logout",
  "stores",
  "store",
  "listings",
  "listing",
  "dashboard",
  "settings",
  "explore",
  "search",
  "radar",
  "messages",
  "orders",
  "me",
  "account",
  "profile",
  "users",
  "user",
  "help",
  "support",
  "onboarding",
  "terms",
  "privacy",
  "verify",
  "reset-password",
  "forgot-password",
  "campushive",
  "official",
  "system",
  "moderator",
  "staff",
  "root",
  "null",
  "undefined",
]);

export function validateStoreSlugFormat(rawSlug: string): {
  valid: boolean;
  slug: string;
  error?: string;
} {
  const slug = String(rawSlug || "").toLowerCase().trim();
  if (slug.length < 3 || slug.length > 60) {
    return {
      valid: false,
      slug,
      error: "Store slug must be between 3 and 60 characters long.",
    };
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return {
      valid: false,
      slug,
      error:
        "Store slug may only contain lowercase letters, numbers, and single hyphens (no leading or trailing hyphens).",
    };
  }
  if (RESERVED_STORE_SLUGS.has(slug)) {
    return {
      valid: false,
      slug,
      error: `The slug "${slug}" is reserved and cannot be used for a store.`,
    };
  }
  return { valid: true, slug };
}

export function generateSlug(name: string): string {
  let candidate =
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "store";
  if (candidate.length < 3) {
    candidate = `${candidate}-store`;
  }
  if (candidate.length > 52) {
    candidate = candidate.slice(0, 52).replace(/-+$/g, "");
  }
  if (RESERVED_STORE_SLUGS.has(candidate)) {
    candidate = `${candidate}-shop`;
  }
  return candidate;
}

/**
 * Generates up to 3 available slug suggestions when a requested slug collides.
 */
export async function generateSlugSuggestions(baseSlug: string): Promise<string[]> {
  const cleanBase = generateSlug(baseSlug).slice(0, 48).replace(/-+$/g, "");
  const candidates = [
    `${cleanBase}-hub`,
    `${cleanBase}-campus`,
    `${cleanBase}-${Math.floor(100 + Math.random() * 900)}`,
    `${cleanBase}-official`,
    `${cleanBase}-${Math.floor(1000 + Math.random() * 9000)}`,
  ];

  const existing = await StoreModel.find({
    slugLower: { $in: candidates },
  })
    .select("slugLower")
    .lean();
  const taken = new Set(existing.map((s: any) => s.slugLower));
  return candidates.filter((c) => !taken.has(c) && !RESERVED_STORE_SLUGS.has(c)).slice(0, 3);
}

/**
 * Saves a store document with automatic retry if slug/slugLower encounters an E11000 collision.
 */
export async function saveStoreWithSlugRetry<T extends Document>(
  storeDoc: T,
  maxRetries = 5,
  session?: mongoose.ClientSession
): Promise<T> {
  let attempt = 0;
  const storeObj = storeDoc as any;
  const baseSlug = generateSlug(storeObj.slug || storeObj.name || "store");
  storeObj.slug = baseSlug;
  storeObj.slugLower = baseSlug;

  while (attempt <= maxRetries) {
    try {
      if (session) {
        return (await storeDoc.save({ session })) as T;
      }
      return (await storeDoc.save()) as T;
    } catch (err: any) {
      const isSlugConflict =
        (err?.code === 11000 || err?.code === 11001) &&
        (err?.keyPattern?.slug ||
          err?.keyPattern?.slugLower ||
          (typeof err?.message === "string" &&
            (err.message.includes("slug") || err.message.includes("slugLower"))));

      if (isSlugConflict && attempt < maxRetries) {
        attempt += 1;
        const nextSlug = `${baseSlug}-${Math.floor(100 + Math.random() * 900)}`;
        storeObj.slug = nextSlug;
        storeObj.slugLower = nextSlug;
      } else {
        throw err;
      }
    }
  }
  return session ? ((await storeDoc.save({ session })) as T) : ((await storeDoc.save()) as T);
}

export function isDuplicateSlugError(error: any): boolean {
  if (!error) return false;
  return (
    (error?.code === 11000 || error?.code === 11001 || String(error?.message || "").includes("E11000")) &&
    Boolean(
      error?.keyPattern?.slug ||
        error?.keyPattern?.slugLower ||
        (typeof error?.message === "string" &&
          (error.message.includes("slug_1") || error.message.includes("slugLower_1")))
    )
  );
}

/**
 * Helper to gracefully identify MongoDB duplicate key violations for ownerId (error code 11000)
 */
export function isDuplicateOwnerError(error: any): boolean {
  if (!error) return false;
  if (isDuplicateSlugError(error)) {
    return false;
  }
  if (
    error?.keyPattern?.ownerId ||
    (typeof error?.message === "string" && error.message.includes("ownerId_1"))
  ) {
    return true;
  }
  return false;
}

/**
 * Sanitizes client store inputs to guarantee metrics and verification signals
 * remain strictly server-controlled.
 */
export function sanitizeStoreInput(input: Record<string, any>) {
  const allowed = [
    "name",
    "description",
    "category",
    "categoryTags",
    "campus",
    "campusCity",
    "operatingLocation",
    "logo",
    "coverImage",
    "contact",
    "showOwnerName",
  ];
  const sanitized: Record<string, any> = {};
  for (const key of allowed) {
    if (input[key] !== undefined) {
      sanitized[key] = input[key];
    }
  }
  return sanitized;
}

/**
 * Explicit allowlist serializer for public Store responses.
 * Identical for anonymous and authenticated visitors (cache-safe).
 * Never exposes ownerId, studentIdImage, locationProofDocument, businessApplicationId,
 * user email/phone/handle, or viewer-specific flags like isFollowing.
 * Owner name is hidden unless store.showOwnerName === true.
 */
export function toPublicStoreDTO(store: any, followersCountOverride?: number) {
  if (!store) return null;
  const id = String(store._id || store.id || "");
  const followersCount =
    typeof followersCountOverride === "number"
      ? followersCountOverride
      : Number(store.metrics?.followersCount || 0);

  const showOwnerName = Boolean(store.showOwnerName);
  const dto: Record<string, any> = {
    _id: id,
    id,
    publicId: store.publicId || id,
    name: store.name,
    slug: store.slug,
    description: store.description,
    storeType: store.storeType,
    category: store.category,
    categoryTags: Array.isArray(store.categoryTags) ? store.categoryTags : [],
    campus: store.campus,
    campusCity: store.campusCity || "",
    operatingLocation: store.operatingLocation || "",
    logo: store.logo || "",
    coverImage: store.coverImage || "",
    status: store.status,
    isVerified: Boolean(store.isVerified),
    verificationType: store.verificationType,
    contact: store.contact
      ? {
          phone: store.contact.phone || undefined,
          whatsapp: store.contact.whatsapp || undefined,
          email: store.contact.email || undefined,
        }
      : {},
    showOwnerName,
    metrics: {
      rating: Number(store.metrics?.rating ?? 5.0),
      reviewsCount: Number(store.metrics?.reviewsCount ?? 0),
      completedDeals: Number(store.metrics?.completedDeals ?? 0),
      listingsCount: Number(store.metrics?.listingsCount ?? 0),
      followersCount,
    },
    createdAt: store.createdAt,
    updatedAt: store.updatedAt,
  };

  if (showOwnerName && store.ownerFullName) {
    dto.ownerDisplayName = store.ownerFullName;
  }

  return dto;
}

/**
 * Compares User.storesCount and User.studentStoresCount against the live count
 * of non-deleted stores in the stores collection.
 */
export async function checkStoresCountDrift(userId?: string): Promise<{
  driftedUsers: Array<{
    userId: string;
    recordedStoresCount: number;
    liveStoresCount: number;
    recordedStudentStoresCount: number;
    liveStudentStoresCount: number;
  }>;
  totalChecked: number;
}> {
  const UserModel =
    mongoose.models.CampusUser || (await import("@/models/User")).default;

  const userFilter = userId ? { _id: userId } : {};
  const users = await UserModel.find(userFilter)
    .select("_id storesCount studentStoresCount")
    .lean();

  const driftedUsers: Array<{
    userId: string;
    recordedStoresCount: number;
    liveStoresCount: number;
    recordedStudentStoresCount: number;
    liveStudentStoresCount: number;
  }> = [];

  for (const u of users as any[]) {
    const uid = String(u._id);
    const [liveStoresCount, liveStudentStoresCount] = await Promise.all([
      StoreModel.countDocuments({ ownerId: uid, status: { $ne: "deleted" } }),
      StoreModel.countDocuments({
        ownerId: uid,
        status: { $ne: "deleted" },
        storeType: "student_store",
      }),
    ]);

    const recordedStoresCount = Number(u.storesCount ?? 0);
    const recordedStudentStoresCount = Number(u.studentStoresCount ?? 0);

    if (
      recordedStoresCount !== liveStoresCount ||
      recordedStudentStoresCount !== liveStudentStoresCount
    ) {
      driftedUsers.push({
        userId: uid,
        recordedStoresCount,
        liveStoresCount,
        recordedStudentStoresCount,
        liveStudentStoresCount,
      });
    }
  }

  return {
    driftedUsers,
    totalChecked: users.length,
  };
}

export default StoreModel;
