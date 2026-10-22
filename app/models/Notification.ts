import mongoose, { Schema, Model, Document, Types } from "mongoose";

export const NOTIFICATION_CATEGORIES = [
  "messages",
  "orders",
  "wishlist",
  "followed_stores",
  "reviews",
  "account_security",
  "announcements",
] as const;
export type NotificationCategory = (typeof NOTIFICATION_CATEGORIES)[number];
export type NotificationPriority = "high" | "normal";

export interface INotification {
  id: string;
  recipient: Types.ObjectId | string;
  sender?: Types.ObjectId | string;
  type: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  title: string;
  message: string;
  link?: string;
  dedupeKey?: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface INotificationDocument extends Omit<INotification, "id">, Document {}

const NotificationSchema = new Schema<INotificationDocument>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "CampusUser",
      required: true,
      index: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "CampusUser",
      default: null,
    },
    type: {
      type: String,
      default: "system",
      index: true,
    },
    category: {
      type: String,
      enum: NOTIFICATION_CATEGORIES,
      required: true,
      index: true,
    },
    priority: {
      type: String,
      enum: ["high", "normal"],
      default: "normal",
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      default: "",
    },
    dedupeKey: {
      type: String,
      default: undefined,
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    strict: true,
    collection: "notifications",
  }
);

NotificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });
NotificationSchema.index({ recipient: 1, category: 1, createdAt: -1 });
NotificationSchema.index({ dedupeKey: 1 }, { unique: true, sparse: true });

export const NotificationModel: Model<INotificationDocument> =
  mongoose.models.Notification ||
  mongoose.model<INotificationDocument>("Notification", NotificationSchema, "notifications");

export default NotificationModel;
