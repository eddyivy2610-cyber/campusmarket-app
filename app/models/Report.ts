import mongoose, { Schema, Model, Document, Types } from "mongoose";

export type ReportTargetType = "listing" | "store" | "user" | "radar" | "review";
export type ReportStatus = "pending" | "in_review" | "resolved" | "dismissed";
export type ReportReason =
  | "misleading"
  | "counterfeit"
  | "harassment"
  | "prohibited_item"
  | "scam"
  | "spam"
  | "other";

export interface IReportAuditEntry {
  action: string;
  adminId: string;
  note?: string;
  timestamp: Date;
}

export interface IReport {
  id: string;
  publicId: string; // UUIDv7
  reporterId: Types.ObjectId | string;
  targetType: ReportTargetType;
  targetId: string; // publicId or ObjectId of target
  targetSlug?: string;
  reason: ReportReason;
  details?: string;
  status: ReportStatus;
  assignedAdminId?: string;
  resolutionNotes?: string;
  auditLog: IReportAuditEntry[];
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface IReportDocument extends Omit<IReport, "id">, Document {}

const ReportAuditSchema = new Schema<IReportAuditEntry>(
  {
    action: { type: String, required: true },
    adminId: { type: String, required: true },
    note: { type: String },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ReportSchema = new Schema<IReportDocument>(
  {
    publicId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    reporterId: {
      type: Schema.Types.Mixed,
      required: true,
      index: true,
    },
    targetType: {
      type: String,
      enum: ["listing", "store", "user", "radar", "review"],
      required: true,
      index: true,
    },
    targetId: {
      type: String,
      required: true,
      index: true,
    },
    targetSlug: {
      type: String,
    },
    reason: {
      type: String,
      enum: [
        "misleading",
        "counterfeit",
        "harassment",
        "prohibited_item",
        "scam",
        "spam",
        "other",
      ],
      required: true,
      index: true,
    },
    details: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "in_review", "resolved", "dismissed"],
      default: "pending",
      index: true,
    },
    assignedAdminId: {
      type: String,
      index: true,
    },
    resolutionNotes: {
      type: String,
      default: "",
    },
    auditLog: {
      type: [ReportAuditSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    collection: "reports",
  }
);

ReportSchema.index({ status: 1, createdAt: -1 });
ReportSchema.index({ targetType: 1, targetId: 1 });

const ReportModel: Model<IReportDocument> =
  mongoose.models.Report || mongoose.model<IReportDocument>("Report", ReportSchema);

export default ReportModel;
