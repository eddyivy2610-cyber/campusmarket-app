import mongoose, { Schema, Model, Document } from "mongoose";

export type BusinessApplicationStatus =
  | "pending_review"
  | "approved"
  | "rejected"
  | "changes_requested"
  | "more_info_needed";

export interface IAdminDecision {
  reviewedBy?: string;
  reviewedAt?: string;
  reason?: string;
  adminNotes?: string;
}

export interface IBusinessApplication {
  id: string;
  applicantId: string; // The user requesting the business account
  businessName: string;
  businessCategory: string;
  campus: string; // Target primary campus market
  operatingLocation: string; // Physical business location (e.g. Samaru Main St, Zaria)
  contactPhone: string;
  contactEmail: string;
  registeredBusinessName?: string;
  cacNumber?: string; // Optional Corporate Affairs Commission reg number
  supportingDocuments?: string[]; // URLs of uploaded government ID / business docs
  notes?: string;
  status: BusinessApplicationStatus;
  adminDecision?: IAdminDecision;
  storeId?: string; // Populated once approved and storefront is provisioned
  schemaVersion?: number;
  createdAt: string;
  updatedAt: string;
}

export interface IBusinessApplicationDocument
  extends Omit<IBusinessApplication, "id">,
    Document {}

const BusinessApplicationSchema = new Schema<IBusinessApplicationDocument>(
  {
    applicantId: {
      type: String,
      required: true,
      index: true,
    },
    businessName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    businessCategory: {
      type: String,
      required: true,
      index: true,
    },
    campus: {
      type: String,
      required: true,
      index: true,
    },
    operatingLocation: {
      type: String,
      required: true,
      trim: true,
    },
    contactPhone: {
      type: String,
      required: true,
      trim: true,
    },
    contactEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    registeredBusinessName: {
      type: String,
      required: false,
      trim: true,
    },
    cacNumber: {
      type: String,
      required: false,
      trim: true,
    },
    supportingDocuments: {
      type: [String],
      default: [],
    },
    notes: {
      type: String,
      required: false,
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: [
        "pending_review",
        "approved",
        "rejected",
        "changes_requested",
        "more_info_needed",
      ],
      default: "pending_review",
      index: true,
    },
    adminDecision: {
      reviewedBy: { type: String, required: false },
      reviewedAt: { type: String, required: false },
      reason: { type: String, required: false },
      adminNotes: { type: String, required: false },
    },
    storeId: {
      type: String,
      required: false,
      index: true,
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
    collection: "business_applications",
  }
);

// Enforce required validators on all update operations
(BusinessApplicationSchema as any).pre(["updateOne", "updateMany", "findOneAndUpdate", "findByIdAndUpdate"], function (this: any) {
  this.setOptions({ runValidators: true });
});

// Indexes for admin dashboard queues
BusinessApplicationSchema.index({ status: 1, createdAt: -1 });
BusinessApplicationSchema.index({ applicantId: 1, status: 1 });

export const BusinessApplicationModel: Model<IBusinessApplicationDocument> =
  mongoose.models.CampusBusinessApplication ||
  mongoose.model<IBusinessApplicationDocument>(
    "CampusBusinessApplication",
    BusinessApplicationSchema,
    "business_applications"
  );

export default BusinessApplicationModel;
