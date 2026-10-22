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
  ownerId: string; // Crucial: One user account can only own one storefront!
  name: string;
  slug: string;
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
  businessApplicationId?: string; // Links to BusinessApplication if local_business
  contact?: IStoreContact;
  suspensionReason?: string;
  suspendedBy?: StoreSuspendedBy;
  pausedBy?: "seller" | "admin";
  metrics: IStoreMetrics;
  schemaVersion?: number;
  createdAt: string;
  updatedAt: string;
}

export interface IStoreDocument extends Omit<IStore, "id">, Document {}

const StoreSchema = new Schema<IStoreDocument>(
  {
    ownerId: {
      type: String,
      required: true,
      unique: true, // STRICT CONSTRAINT: One storefront per account
      index: true,
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

// Enforce required validators on all update operations
(StoreSchema as any).pre(["updateOne", "updateMany", "findOneAndUpdate", "findByIdAndUpdate"], function (this: any) {
  this.setOptions({ runValidators: true });
});

// Compound ESR indexes for store directory queries sorted by rating and recency
StoreSchema.index({ status: 1, campus: 1, "metrics.rating": -1, createdAt: -1 });
StoreSchema.index({ status: 1, "metrics.rating": -1, createdAt: -1 });
StoreSchema.index({ storeType: 1, status: 1 });

export const StoreModel: Model<IStoreDocument> =
  mongoose.models.CampusStore ||
  mongoose.model<IStoreDocument>("CampusStore", StoreSchema, "stores");

// Ensure MongoDB creates and synchronizes unique indexes in dev/test (no-op in production)
export async function ensureStoreIndexes() {
  if (process.env.NODE_ENV === "production") return;
  if (typeof window === "undefined" && mongoose.connection.readyState === 1) {
    try {
      await StoreModel.init();
    } catch (err: any) {
      console.warn("[StoreModel] Index initialization notice:", err?.message);
    }
  }
}

if (typeof window === "undefined" && mongoose.connection.readyState === 1) {
  ensureStoreIndexes();
}

export function generateSlug(name: string): string {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "store"
  );
}

/**
 * Saves a store document with automatic retry if slug encounters an E11000 collision.
 */
export async function saveStoreWithSlugRetry<T extends Document>(
  storeDoc: T,
  maxRetries = 5,
  session?: mongoose.ClientSession
): Promise<T> {
  let attempt = 0;
  const storeObj = storeDoc as any;
  const baseSlug = storeObj.slug || generateSlug(storeObj.name || "store");

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
          (typeof err?.message === "string" && err.message.includes("slug")));

      if (isSlugConflict && attempt < maxRetries) {
        attempt += 1;
        storeObj.slug = `${baseSlug}-${Math.floor(100 + Math.random() * 900)}`;
      } else {
        throw err;
      }
    }
  }
  return (await storeDoc.save()) as T;
}

/**
 * Helper to gracefully identify MongoDB duplicate key violations for ownerId (error code 11000)
 */
export function isDuplicateOwnerError(error: any): boolean {
  if (!error) return false;
  // If the error was explicitly a slug error, it's NOT a duplicate owner error
  if (
    error?.keyPattern?.slug ||
    (typeof error?.message === "string" && error.message.includes("slug_1"))
  ) {
    return false;
  }
  if (
    error?.keyPattern?.ownerId ||
    (typeof error?.message === "string" && error.message.includes("ownerId_1"))
  ) {
    return true;
  }
  if (error.code === 11000 || error.code === 11001) return true;
  if (
    error.name === "MongoServerError" &&
    (error.code === 11000 || String(error.message || "").includes("E11000"))
  ) {
    return true;
  }
  if (
    String(error.message || "").includes("E11000") ||
    String(error.message || "").includes("duplicate key")
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
  ];
  const sanitized: Record<string, any> = {};
  for (const key of allowed) {
    if (input[key] !== undefined) {
      sanitized[key] = input[key];
    }
  }
  return sanitized;
}

export default StoreModel;
