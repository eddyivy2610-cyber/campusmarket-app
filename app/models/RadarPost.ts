import mongoose, { Schema, Model, Document } from "mongoose";

export interface IRadarReply {
  id: string;
  userId: string;
  authorName: string;
  authorHandle: string;
  authorDept: string;
  authorAvatar?: string;
  isVerified: boolean;
  message: string;
  createdAt: string | Date;
}

export interface IRadarPost {
  id: string;
  publicId?: string; // RFC 9562 UUIDv7
  slug?: string; // Canonical slug with suffix
  slugSuffix?: string; // Stable entropy suffix
  userId: string;
  requesterName: string;
  requesterHandle: string;
  requesterLocation: string;
  requesterAvatar: string;
  isVerified: boolean;
  requestText: string;
  category: "all" | "urgent" | "course_packs" | "tech_cables" | string;
  budget?: string;
  campus?: string;
  status: "active" | "fulfilled" | "closed";
  replies: IRadarReply[];
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface IRadarPostDocument extends Omit<IRadarPost, "id">, Document {}

const RadarReplySchema = new Schema<IRadarReply>(
  {
    id: { type: String, required: true },
    userId: { type: String, required: true, index: true },
    authorName: { type: String, required: true },
    authorHandle: { type: String, default: "student" },
    authorDept: { type: String, default: "Main Campus" },
    authorAvatar: { type: String },
    isVerified: { type: Boolean, default: false },
    message: { type: String, required: true, trim: true },
    createdAt: { type: Schema.Types.Mixed, default: () => new Date() },
  },
  { _id: false }
);

const RadarPostSchema = new Schema<IRadarPostDocument>(
  {
    publicId: { type: String, required: false },
    slug: { type: String, required: false },
    slugSuffix: { type: String, required: false },
    userId: { type: String, required: true, index: true },
    requesterName: { type: String, required: true },
    requesterHandle: { type: String, default: "student" },
    requesterLocation: { type: String, default: "Main Campus" },
    requesterAvatar: { type: String },
    isVerified: { type: Boolean, default: false },
    requestText: { type: String, required: true, trim: true },
    category: { type: String, default: "all", index: true },
    budget: { type: String, default: "" },
    campus: { type: String, default: "Main Campus", index: true },
    status: {
      type: String,
      enum: ["active", "fulfilled", "closed"],
      default: "active",
      index: true,
    },
    replies: { type: [RadarReplySchema], default: [] },
  },
  {
    timestamps: true,
    collection: "radar_posts",
  }
);

RadarPostSchema.index({ createdAt: -1, status: 1 });
RadarPostSchema.index(
  { publicId: 1 },
  { unique: true, partialFilterExpression: { publicId: { $type: "string" } } }
);
RadarPostSchema.index(
  { slug: 1 },
  { unique: true, partialFilterExpression: { slug: { $type: "string" } } }
);
RadarPostSchema.index(
  { slugSuffix: 1 },
  { partialFilterExpression: { slugSuffix: { $type: "string" } } }
);

const RadarPostModel: Model<IRadarPostDocument> =
  mongoose.models.RadarPost || mongoose.model<IRadarPostDocument>("RadarPost", RadarPostSchema);

export default RadarPostModel;
