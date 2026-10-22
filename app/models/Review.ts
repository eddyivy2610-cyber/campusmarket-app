import mongoose, { Schema, Model, Document, Types } from "mongoose";
import "./User";
import "./Order";
import "./Store";
import "./Listing";

export type ReviewStatus = "published" | "hidden" | "flagged";

export interface IReview {
  id: string;
  sellerId: Types.ObjectId | string;
  reviewerId: Types.ObjectId | string;
  orderId?: Types.ObjectId | string;
  dealId?: string;
  conversationId?: string;
  storeId?: Types.ObjectId | string;
  listingId?: Types.ObjectId | string;
  rating: number; // 1 - 5 integer
  comment: string;
  images?: string[];
  status: ReviewStatus;
  schemaVersion: number;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface IReviewDocument extends Omit<IReview, "id">, Document {}

const ReviewSchema = new Schema<IReviewDocument>(
  {
    sellerId: {
      type: Schema.Types.Mixed,
      ref: "CampusUser",
      required: true,
      index: true,
    },
    reviewerId: {
      type: Schema.Types.Mixed,
      ref: "CampusUser",
      required: true,
      index: true,
    },
    orderId: {
      type: Schema.Types.Mixed,
      ref: "Order",
      required: false,
      sparse: true,
      index: true,
    },
    dealId: {
      type: String,
      required: false,
      trim: true,
      sparse: true,
      index: true,
    },
    conversationId: {
      type: String,
      required: false,
      trim: true,
      sparse: true,
      index: true,
    },
    storeId: {
      type: Schema.Types.Mixed,
      ref: "CampusStore",
      required: false,
      sparse: true,
      index: true,
    },
    listingId: {
      type: Schema.Types.Mixed,
      ref: "CampusListing",
      required: false,
      sparse: true,
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      validate: {
        validator: Number.isInteger,
        message: "Rating must be an integer between 1 and 5.",
      },
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    images: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["published", "hidden", "flagged"],
      default: "published",
      index: true,
    },
    schemaVersion: {
      type: Number,
      default: 1,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    strict: true,
    collection: "reviews",
    autoIndex: process.env.NODE_ENV !== "production",
  }
);

// ----------------------------------------------------------------------------
// Compound Indexes
// ----------------------------------------------------------------------------

// Uniqueness backstop: 1 review per (reviewer, order)
ReviewSchema.index(
  { reviewerId: 1, orderId: 1 },
  {
    unique: true,
    partialFilterExpression: { orderId: { $exists: true } },
  }
);

// Uniqueness backstop: 1 review per (reviewer, deal)
ReviewSchema.index(
  { reviewerId: 1, dealId: 1 },
  {
    unique: true,
    partialFilterExpression: { dealId: { $exists: true } },
  }
);

// Efficient public list retrieval with keyset pagination
ReviewSchema.index({ sellerId: 1, status: 1, createdAt: -1, _id: -1 });
ReviewSchema.index({ storeId: 1, status: 1, createdAt: -1, _id: -1 });
ReviewSchema.index({ listingId: 1, status: 1, createdAt: -1, _id: -1 });

// Middleware: Cleanse null/empty references before saving to prevent index pollution
ReviewSchema.pre("save", function () {
  if (this.orderId === null || this.orderId === "" || this.orderId === undefined) {
    this.orderId = undefined;
  }
  if (this.dealId === null || this.dealId === "" || this.dealId === undefined) {
    this.dealId = undefined;
  }
  if (this.conversationId === null || this.conversationId === "" || this.conversationId === undefined) {
    this.conversationId = undefined;
  }
  if (this.storeId === null || this.storeId === "" || this.storeId === undefined) {
    this.storeId = undefined;
  }
  if (this.listingId === null || this.listingId === "" || this.listingId === undefined) {
    this.listingId = undefined;
  }
});

// Middleware: Enforce schema validators on updates
(ReviewSchema as any).pre(
  ["updateOne", "updateMany", "findOneAndUpdate", "findByIdAndUpdate"],
  function (this: any) {
    this.setOptions({ runValidators: true });
  }
);

export const ReviewModel: Model<IReviewDocument> =
  (mongoose.models.Review as Model<IReviewDocument>) ||
  mongoose.model<IReviewDocument>("Review", ReviewSchema, "reviews");

export default ReviewModel;
