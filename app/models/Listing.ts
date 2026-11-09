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
  sellerId: string; // The user ID who owns the store
  storeId: string; // Required: every listing must belong to a store
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
  publicId?: string; // RFC 9562 UUIDv7
  slug?: string; // Canonical human-readable slug with stable suffix
  slugSuffix?: string; // Stable 8-char entropy suffix (never changes on title edits)
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
      required: true,
      index: true, // Required: every listing belongs to a store
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
    publicId: {
      type: String,
      required: false,
    },
    slugSuffix: {
      type: String,
      required: false,
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
  { publicId: 1 },
  { unique: true, partialFilterExpression: { publicId: { $type: "string" } } }
);
ListingSchema.index(
  { slugSuffix: 1 },
  { partialFilterExpression: { slugSuffix: { $type: "string" } } }
);
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

/**
 * Explicit allowlist serializer for public Listing responses.
 * Never includes sellerId, user email, phone, handle, or moderationNotes.
 * Embeds only public store summary fields if a store object is provided.
 */
export function toPublicListingDTO(listing: any, store?: any) {
  if (!listing) return null;
  const id = String(listing._id || listing.id || "");
  const dto: Record<string, any> = {
    _id: id,
    id,
    publicId: listing.publicId || id,
    storeId: String(listing.storeId || ""),
    listingType: listing.listingType || "product",
    title: listing.title,
    price: Number(listing.price ?? 0),
    priceFormatted: listing.priceFormatted,
    description: listing.description,
    category: listing.category,
    subcategory: listing.subcategory || undefined,
    campus: listing.campus,
    location: listing.location,
    images: Array.isArray(listing.images) ? listing.images : [],
    condition: listing.condition || undefined,
    serviceDetails: listing.serviceDetails || undefined,
    categoryFields: listing.categoryFields || {},
    status: listing.status,
    slug: listing.slug,
    slugSuffix: listing.slugSuffix,
    listingCode: listing.listingCode,
    views: Number(listing.views ?? 0),
    likes: Number(listing.likes ?? 0),
    isPromoted: Boolean(listing.isPromoted),
    createdAt: listing.createdAt,
    updatedAt: listing.updatedAt,
  };

  if (store) {
    dto.storeName = store.name;
    dto.storeSlug = store.slug;
    dto.storeLogo = store.logo || "";
    dto.storeCategory = store.category;
    dto.storeCampus = store.campus;
    dto.storeOperatingLocation = store.operatingLocation;
    dto.storeType = store.storeType;
    dto.storeVerified = Boolean(store.isVerified);
    dto.storeRating = Number(store.metrics?.rating ?? 5.0);
    dto.storeReviewsCount = Number(store.metrics?.reviewsCount ?? 0);
    dto.store = {
      id: String(store._id || store.id || listing.storeId || ""),
      publicId: store.publicId || String(store._id || store.id || ""),
      name: store.name,
      slug: store.slug,
      logo: store.logo || "",
      campus: store.campus,
      storeType: store.storeType,
      isVerified: Boolean(store.isVerified),
      verificationType: store.verificationType,
      metrics: store.metrics
        ? {
            rating: Number(store.metrics.rating ?? 5.0),
            reviewsCount: Number(store.metrics.reviewsCount ?? 0),
            completedDeals: Number(store.metrics.completedDeals ?? 0),
            listingsCount: Number(store.metrics.listingsCount ?? 0),
            followersCount: Number(store.metrics.followersCount ?? 0),
          }
        : undefined,
    };
  }

  return dto;
}

export default ListingModel;
