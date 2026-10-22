import mongoose, { Schema, Model, Document, Types } from "mongoose";

export interface INotification {
  id: string;
  recipient: Types.ObjectId | string;
  sender?: Types.ObjectId | string;
  type: string;
  title: string;
  message: string;
  link?: string;
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

export const NotificationModel: Model<INotificationDocument> =
  mongoose.models.Notification ||
  mongoose.model<INotificationDocument>("Notification", NotificationSchema, "notifications");

export default NotificationModel;
