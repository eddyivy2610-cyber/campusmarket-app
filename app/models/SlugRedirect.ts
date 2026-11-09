import mongoose, { Schema, Model, Document } from "mongoose";

export type SlugEntityType = "listing" | "service" | "store" | "radar";

export interface ISlugRedirect {
  id: string;
  entityType: SlugEntityType;
  oldSlug: string;
  targetPublicId: string;
  targetStoreId?: string;
  canonicalSlug: string;
  previousOwnerId?: string;
  reason?: "rename" | "deletion";
  reservedUntil?: Date;
  createdAt: Date;
}

export interface ISlugRedirectDocument extends Omit<ISlugRedirect, "id">, Document {}

const SlugRedirectSchema = new Schema<ISlugRedirectDocument>(
  {
    entityType: {
      type: String,
      enum: ["listing", "service", "store", "radar"],
      required: true,
      index: true,
    },
    oldSlug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    targetPublicId: {
      type: String,
      required: true,
      index: true,
    },
    targetStoreId: {
      type: String,
      required: false,
      index: true,
    },
    canonicalSlug: {
      type: String,
      required: true,
    },
    previousOwnerId: {
      type: String,
      required: false,
      index: true,
    },
    reason: {
      type: String,
      enum: ["rename", "deletion"],
      default: "rename",
    },
    reservedUntil: {
      type: Date,
      required: false,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "slug_redirects",
  }
);

SlugRedirectSchema.index({ entityType: 1, oldSlug: 1 }, { unique: true });

const SlugRedirectModel: Model<ISlugRedirectDocument> =
  mongoose.models.SlugRedirect ||
  mongoose.model<ISlugRedirectDocument>("SlugRedirect", SlugRedirectSchema);

export default SlugRedirectModel;
