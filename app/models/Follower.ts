import mongoose, { Schema, Model, Document, Types } from "mongoose";
import "./User";
import "./Store";

export type FollowTargetType = "user" | "store";

export interface IFollower {
  id: string;
  followerId: Types.ObjectId | string;
  followingId: Types.ObjectId | string;
  targetType: FollowTargetType;
  schemaVersion: number;
  createdAt: string;
  updatedAt: string;
}

export interface IFollowerDocument extends Omit<IFollower, "id">, Document {}

const FollowerSchema = new Schema<IFollowerDocument>(
  {
    followerId: {
      type: Schema.Types.ObjectId,
      ref: "CampusUser",
      required: true,
      index: true,
    },
    followingId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    targetType: {
      type: String,
      enum: ["user", "store"],
      default: "user",
      required: true,
      index: true,
    },
    schemaVersion: {
      type: Number,
      default: 1,
      required: true,
    },
  },
  {
    timestamps: true,
    strict: true,
    collection: "followers",
    autoIndex: process.env.NODE_ENV !== "production",
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
    },
  }
);

// Enforce required validators on all update operations
(FollowerSchema as any).pre(
  ["updateOne", "updateMany", "findOneAndUpdate", "findByIdAndUpdate"],
  function (this: any) {
    this.setOptions({ runValidators: true });
  }
);

// Database-enforced unique compound index to strictly prevent duplicate follow relationships
FollowerSchema.index(
  { followerId: 1, followingId: 1, targetType: 1 },
  { unique: true }
);

// High-performance query indexes for deterministic scoped follower and following listings
FollowerSchema.index({ followingId: 1, targetType: 1, createdAt: -1, _id: -1 });
FollowerSchema.index({ followerId: 1, targetType: 1, createdAt: -1, _id: -1 });

export const FollowerModel: Model<IFollowerDocument> =
  mongoose.models.Follower ||
  mongoose.model<IFollowerDocument>("Follower", FollowerSchema, "followers");

export const Follower = FollowerModel;
export default FollowerModel;
