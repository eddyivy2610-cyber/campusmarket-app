import mongoose, { Schema, Model, Document, Types } from "mongoose";

export interface IUsernameHistory {
  id: string;
  username: string; // Lowercase normalized handle
  userId: Types.ObjectId | string;
  userPublicId?: string;
  replacedAt: Date;
  reason?: string;
}

export interface IUsernameHistoryDocument extends Omit<IUsernameHistory, "id">, Document {}

const UsernameHistorySchema = new Schema<IUsernameHistoryDocument>(
  {
    username: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    userId: {
      type: Schema.Types.Mixed,
      required: true,
      index: true,
    },
    userPublicId: {
      type: String,
      index: true,
    },
    replacedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    reason: {
      type: String,
      default: "username_change",
    },
  },
  {
    timestamps: true,
    collection: "username_history",
  }
);

UsernameHistorySchema.index({ username: 1, replacedAt: -1 });

const UsernameHistoryModel: Model<IUsernameHistoryDocument> =
  mongoose.models.UsernameHistory ||
  mongoose.model<IUsernameHistoryDocument>("UsernameHistory", UsernameHistorySchema);

export default UsernameHistoryModel;
