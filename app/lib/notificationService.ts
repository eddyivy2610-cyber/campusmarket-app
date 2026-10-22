import mongoose from "mongoose";
import NotificationModel, {
  NotificationCategory,
  NotificationPriority,
} from "@/models/Notification";
import UserModel, { DEFAULT_USER_PREFERENCES } from "@/models/User";

const PREFERENCE_BY_CATEGORY: Partial<Record<NotificationCategory, string>> = {
  messages: "messages",
  orders: "orderUpdates",
  wishlist: "wishlistAlerts",
  followed_stores: "followedStores",
  announcements: "promotions",
  reviews: "reviews",
};

function safeDestination(link?: string): string {
  if (!link) return "";
  if (!link.startsWith("/") || link.startsWith("//") || link.includes("\\")) return "";
  return link.slice(0, 500);
}

export interface CreateNotificationInput {
  recipient: string;
  sender?: string;
  type: string;
  category: NotificationCategory;
  priority?: NotificationPriority;
  title: string;
  message: string;
  link?: string;
  dedupeKey?: string;
  session?: mongoose.ClientSession;
}

export async function createNotification(input: CreateNotificationInput) {
  if (!mongoose.Types.ObjectId.isValid(input.recipient)) {
    throw new Error("Invalid notification recipient");
  }
  const preferenceKey = PREFERENCE_BY_CATEGORY[input.category];
  const isEssential = input.category === "account_security";

  if (!isEssential && preferenceKey) {
    const user = await UserModel.findById(input.recipient).select("preferences").lean();
    const preferences = {
      ...DEFAULT_USER_PREFERENCES.notifications,
      ...(user?.preferences?.notifications || {}),
    };
    if ((preferences as any)[preferenceKey] === false) return null;
  }

  const doc = {
    recipient: new mongoose.Types.ObjectId(input.recipient),
    sender: input.sender && mongoose.Types.ObjectId.isValid(input.sender)
      ? new mongoose.Types.ObjectId(input.sender)
      : undefined,
    type: input.type.slice(0, 80),
    category: input.category,
    priority: input.priority || "normal",
    title: input.title.slice(0, 160),
    message: input.message.slice(0, 500),
    link: safeDestination(input.link),
    dedupeKey: input.dedupeKey?.slice(0, 180),
  };

  try {
    const [created] = await NotificationModel.create([doc], {
      session: input.session || undefined,
    });
    return created;
  } catch (error: any) {
    if (error?.code === 11000 && input.dedupeKey) {
      return NotificationModel.findOne({ dedupeKey: input.dedupeKey });
    }
    throw error;
  }
}

export function isSafeNotificationDestination(link: string): boolean {
  return !link || safeDestination(link) === link;
}
