import mongoose, { Schema, Model, Document } from "mongoose";
import {
  LISTING_STATUSES,
  PRODUCT_CONDITIONS,
  LISTING_TYPES,
  SERVICE_PRICING_MODELS,
  SERVICE_LOCATION_TYPES,
  LISTING_PAUSED_BY_REASONS,
  LISTING_REMOVED_BY_REASONS,
  ListingStatus,
  ProductCondition,
  ListingType,
  ServicePricingModel,
  ServiceLocationType,
  ListingPausedBy,
  ListingRemovedBy,
} from "@/constants/enums";

export type {
  ListingStatus,
  ProductCondition,
  ListingType,
  ServicePricingModel,
  ServiceLocationType,
  ListingPausedBy,
  ListingRemovedBy,
};

export interface IServiceDetails {
  pricingModel: ServicePricingModel;
  deliveryTime?: string; // e.g. "Same day", "2-3 business days"
  serviceLocationType?: ServiceLocationType;
  portfolio?: string[]; // Links to past work images
  experienceYears?: number;
}

export interface IListing {
  id: string;
  sellerId: string; // The user ID who created the listing
  storeId?: string; // Nullable: null for personal listing; populated if associated with a store
  listingType: ListingType; // "product" or "service"
  title: string;
  price: number;
  priceFormatted: string; // e.g. "₦25,000"
  description: string;
  category: string; // e.g. "Electronics", "Fashion", "Academics", "Services"
  subcategory?: string;
  campus: string; // Target campus
  location: string; // e.g. "Samaru Main Campus, Ribadu Hall"
  images: string[];
  condition?: ProductCondition; // Used if product
  serviceDetails?: IServiceDetails; // Used if service
  categoryFields?: Record<string, any>; // Category-aware fields (e.g. laptop specs, clothing size)
  status: ListingStatus;
  moderationNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  views: number;
  likes: number;
  isPromoted?: boolean;
  slug?: string;
  listingCode?: string;
  pausedBy?: ListingPausedBy;
  removedBy?: ListingRemovedBy;
  schemaVersion?: number;
  createdAt: string;
  updatedAt: string;
}

export interface IListingDocument extends Omit<IListing, "id">, Document {}

const ListingSchema = new Schema<IListingDocument>(
  {
    sellerId: {
      type: String,
      required: true,
      index: true,
    },
    storeId: {
      type: String,
      required: false,
      index: true, // Crucial for querying all catalog items belonging to a store
      sparse: true,
    },
    listingType: {
      type: String,
      enum: ["product", "service"],
      required: true,
      default: "product",
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 140,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    priceFormatted: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 3000,
    },
    category: {
      type: String,
      required: true,
    },
    subcategory: {
      type: String,
      required: false,
    },
    campus: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    images: {
      type: [String],
      default: [],
    },
    condition: {
      type: String,
      enum: PRODUCT_CONDITIONS,
      required: false,
    },
    serviceDetails: {
      pricingModel: {
        type: String,
        enum: SERVICE_PRICING_MODELS,
        default: "fixed",
      },
      deliveryTime: { type: String, required: false },
      serviceLocationType: {
        type: String,
        enum: SERVICE_LOCATION_TYPES,
        default: "on_campus",
      },
      portfolio: { type: [String], default: [] },
      experienceYears: { type: Number, required: false },
    },
    categoryFields: {
      type: Schema.Types.Mixed,
      default: {},
    },
    status: {
      type: String,
      enum: LISTING_STATUSES,
      default: "active",
    },
    slug: {
      type: String,
      lowercase: true,
      trim: true,
    },
    listingCode: {
      type: String,
      trim: true,
    },
    pausedBy: {
      type: String,
      enum: LISTING_PAUSED_BY_REASONS,
      required: false,
    },
    removedBy: {
      type: String,
      enum: LISTING_REMOVED_BY_REASONS,
      required: false,
    },
    moderationNotes: {
      type: String,
      required: false,
    },
    reviewedBy: {
      type: String,
      required: false,
    },
    reviewedAt: {
      type: String,
      required: false,
    },
    views: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
    isPromoted: {
      type: Boolean,
      default: false,
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
    optimisticConcurrency: true,
    strict: true,
    collection: "listings",
    autoIndex: process.env.NODE_ENV !== "production",
  }
);

// Enforce required validators on all update operations
(ListingSchema as any).pre(["updateOne", "updateMany", "findOneAndUpdate", "findByIdAndUpdate"], function (this: any) {
  this.setOptions({ runValidators: true });
});

// High performance ESR compound indexes with (createdAt, _id) tie-breaker for deterministic cursor pagination
ListingSchema.index({ status: 1, createdAt: -1, _id: -1 });                                            // global feed
ListingSchema.index({ status: 1, campus: 1, createdAt: -1, _id: -1 });                                 // campus feed
ListingSchema.index({ status: 1, campus: 1, category: 1, createdAt: -1, _id: -1 });                   // campus + category feed
ListingSchema.index({ status: 1, campus: 1, category: 1, listingType: 1, createdAt: -1, _id: -1 });   // campus + category + type feed
ListingSchema.index({ status: 1, listingType: 1, createdAt: -1, _id: -1 });                            // global listingType feed

// Seller & Store catalog query indexes
ListingSchema.index({ storeId: 1, status: 1, createdAt: -1, _id: -1 });
ListingSchema.index({ sellerId: 1, status: 1, createdAt: -1, _id: -1 });
ListingSchema.index({ storeId: 1, status: 1 });
ListingSchema.index({ sellerId: 1, status: 1 });
ListingSchema.index({ sellerId: 1, storeId: 1, status: 1 });                                           // unlinked picker query

// Status-partitioned full text search
ListingSchema.index({ status: 1, title: "text", description: "text" });

// Collision-safe unique indexes with partialFilterExpression (ignores missing and null values)
ListingSchema.index(
  { slug: 1 },
  { unique: true, partialFilterExpression: { slug: { $type: "string" } } }
);
ListingSchema.index(
  { listingCode: 1 },
  { unique: true, partialFilterExpression: { listingCode: { $type: "string" } } }
);

export const ListingModel: Model<IListingDocument> =
  mongoose.models.CampusListing ||
  mongoose.model<IListingDocument>("CampusListing", ListingSchema, "listings");

/**
 * Sanitizes client listing inputs.
 * Strips client-supplied views, likes, sellerId, and isPromoted to protect server authority.
 */
export function sanitizeListingInput(input: Record<string, any>) {
  const allowed = [
    "title",
    "price",
    "description",
    "category",
    "subcategory",
    "campus",
    "location",
    "images",
    "condition",
    "serviceDetails",
    "categoryFields",
    "listingType",
    "storeId",
    "status",
  ];

  const sanitized: Record<string, any> = {};
  for (const key of allowed) {
    if (input[key] !== undefined) {
      sanitized[key] = input[key];
    }
  }

  // Ensure default listingType
  if (!sanitized.listingType) {
    sanitized.listingType = "product";
  }

  // Format price if price is numeric
  if (typeof sanitized.price === "number") {
    sanitized.priceFormatted = `₦${Math.round(sanitized.price).toLocaleString("en-NG")}`;
  }

  return sanitized;
}

export default ListingModel;
