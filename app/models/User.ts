import mongoose, { Schema, Model, Document } from "mongoose";
import { USER_ROLES, USER_ACCOUNT_STATUSES, UserRole, UserAccountStatus } from "@/constants/enums";
import { IUserPreferences, DEFAULT_USER_PREFERENCES } from "@/constants/preferences";
import { generateDefaultUsername } from "@/lib/usernameUtils";
import { generateUUIDv7 } from "@/lib/uuidv7";

export type { UserRole, UserAccountStatus };
export type { IUserPreferences };
export { DEFAULT_USER_PREFERENCES };

export interface IUserProfile {
  displayName?: string;
  handle?: string;
  handleUpdatedAt?: string;
  avatar?: string;
  coverImage?: string;
  bio?: string;
  phone?: string;
  whatsapp?: string;
}

export interface IUser {
  id: string;
  publicId?: string; // RFC 9562 UUIDv7
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  accountStatus: UserAccountStatus;
  campus?: string;
  isStudent: boolean;
  studentVerified: boolean;
  emailVerified?: boolean;
  onboardingStep?: string;
  sellerStatus?: "none" | "pending" | "approved" | "rejected";
  storesCount?: number;
  studentStoresCount?: number;
  profile?: IUserProfile;
  preferences?: IUserPreferences;
  suspensionReason?: string;
  suspendedAt?: string;
  rating?: {
    average: number;
    count: number;
  };
  tokenVersion?: number;
  schemaVersion?: number;
  createdAt: string;
  updatedAt: string;
}

export interface IUserDocument extends Omit<IUser, "id">, Document {}

const UserSchema = new Schema<IUserDocument>(
  {
    publicId: {
      type: String,
      required: false,
    },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password: { type: String, select: false },
    role: { type: String, enum: USER_ROLES, default: "buyer", index: true },
    accountStatus: {
      type: String,
      enum: USER_ACCOUNT_STATUSES,
      default: "pending",
      index: true,
    },
    campus: { type: String, required: false, index: true },
    isStudent: { type: Boolean, default: true },
    studentVerified: { type: Boolean, default: false, index: true },
    emailVerified: { type: Boolean, default: false, index: true },
    onboardingStep: { type: String, default: "pending" },
    sellerStatus: {
      type: String,
      enum: ["none", "pending", "approved", "rejected"],
      default: "none",
      index: true,
    },
    storesCount: {
      type: Number,
      default: 0,
      min: 0,
      index: true,
    },
    studentStoresCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    profile: {
      displayName: { type: String },
      handle: { type: String, lowercase: true, trim: true },
      handleUpdatedAt: { type: String },
      avatar: { type: String },
      coverImage: { type: String },
      bio: { type: String },
      phone: { type: String },
      whatsapp: { type: String },
    },
    preferences: {
      appearance: {
        theme: { type: String, enum: ["system", "light", "dark"], default: "system" },
        accentColor: { type: String, enum: ["amber", "emerald", "indigo", "rose", "sky", "violet"], default: "amber" },
        textSize: { type: String, enum: ["normal", "compact", "large"], default: "normal" },
        displayDensity: { type: String, enum: ["comfortable", "compact"], default: "comfortable" },
      },
      discovery: {
        defaultLanding: { type: String, enum: ["explore", "feed", "radar"], default: "explore" },
        preferredCampus: { type: String, default: "" },
        preferredCategories: { type: [String], default: [] },
        defaultSort: { type: String, enum: ["recent", "price_asc", "price_desc", "popular"], default: "recent" },
        priceRange: {
          min: { type: Number, default: 0 },
          max: { type: Number, default: 0 },
        },
      },
      notifications: {
        inApp: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
        email: { type: Boolean, default: false },
        messages: { type: Boolean, default: true },
        orderUpdates: { type: Boolean, default: true },
        followedStores: { type: Boolean, default: true },
        wishlistAlerts: { type: Boolean, default: true },
        reviews: { type: Boolean, default: true },
        accountSecurity: { type: Boolean, default: true },
        promotions: { type: Boolean, default: false },
        frequency: { type: String, enum: ["instant", "daily", "weekly"], default: "instant" },
        quietHoursEnabled: { type: Boolean, default: false },
        quietHoursStart: { type: String, default: "22:00" },
        quietHoursEnd: { type: String, default: "07:00" },
      },
      privacy: {
        profileVisibility: { type: String, enum: ["public", "campus_only"], default: "public" },
        showOnlineStatus: { type: Boolean, default: true },
        showSalesMilestones: { type: Boolean, default: true },
        messagePermission: { type: String, enum: ["everyone", "verified", "listings"], default: "everyone" },
      },
      messaging: {
        messagePreviews: { type: Boolean, default: true },
        readReceipts: { type: Boolean, default: true },
        contactChannel: { type: String, enum: ["in_app", "whatsapp"], default: "in_app" },
      },
      accessibility: {
        reduceMotion: { type: Boolean, default: false },
        highContrast: { type: Boolean, default: false },
        dataSaver: { type: Boolean, default: false },
      },
      seller: {
        vacationMode: { type: Boolean, default: false },
        inquiryAlerts: { type: Boolean, default: true },
        autoReply: { type: String, default: "" },
      },
    },
    suspensionReason: { type: String, required: false },
    suspendedAt: { type: String, required: false },
    rating: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0, min: 0 },
    },
    tokenVersion: {
      type: Number,
      default: 0,
      required: true,
      index: true,
    },
    schemaVersion: {
      type: Number,
      default: 1,
      required: true,
      index: true,
    },
    createdAt: { type: String, default: () => new Date().toISOString() },
    updatedAt: { type: String, default: () => new Date().toISOString() },
  },
  {
    timestamps: false,
    strict: true,
    collection: "users",
    autoIndex: process.env.NODE_ENV !== "production",
  }
);

// Enforce partial unique index on profile.handle (ignores missing and null values)
UserSchema.index(
  { publicId: 1 },
  { unique: true, partialFilterExpression: { publicId: { $type: "string" } } }
);
UserSchema.index(
  { "profile.handle": 1 },
  { unique: true, partialFilterExpression: { "profile.handle": { $type: "string" } } }
);

// Enforce required validators on all update operations
(UserSchema as any).pre(["updateOne", "updateMany", "findOneAndUpdate", "findByIdAndUpdate"], function (this: any) {
  this.setOptions({ runValidators: true });
});

UserSchema.pre("save", function () {
  if (!this.publicId) {
    this.publicId = generateUUIDv7();
  }
  if (!this.name && (this.profile?.displayName || this.email)) {
    this.name = this.profile?.displayName || this.email.split("@")[0] || "User";
  }
  if (!this.profile) {
    this.profile = {};
  }
  if (!this.profile.handle) {
    this.profile.handle = generateDefaultUsername(
      this.profile?.displayName || this.name,
      this.email
    );
  }
});

/**
 * Saves a user document with automatic retry if profile.handle encounters an E11000 collision.
 */
export async function saveUserWithHandleRetry<T extends Document>(
  userDoc: T,
  maxRetries = 3
): Promise<T> {
  let attempt = 0;
  const userObj = userDoc as any;

  while (attempt <= maxRetries) {
    try {
      return (await userDoc.save()) as T;
    } catch (err: any) {
      const isHandleConflict =
        err?.code === 11000 &&
        (err?.keyPattern?.["profile.handle"] ||
          (typeof err?.message === "string" && err.message.includes("profile.handle")));

      if (isHandleConflict && attempt < maxRetries) {
        attempt += 1;
        if (!userObj.profile) userObj.profile = {};
        userObj.profile.handle = generateDefaultUsername(
          userObj.name || userObj.profile?.displayName,
          userObj.email
        );
      } else {
        throw err;
      }
    }
  }
  return (await userDoc.save()) as T;
}

export const UserModel: Model<IUserDocument> =
  mongoose.models.CampusUser ||
  mongoose.model<IUserDocument>("CampusUser", UserSchema, "users");

/**
 * Formats a user's name into "First L." (First name plus last initial if present).
 * Never exposes email, phone, handle, or full surname.
 */
export function formatFirstNameInitial(rawName?: string | null): string {
  const cleaned = String(rawName || "").trim();
  if (!cleaned) return "Campus Member";
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0];
  }
  const first = parts[0];
  const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase();
  return lastInitial ? `${first} ${lastInitial}.` : first;
}

/**
 * Minimal visible identity for a buyer interacting with a seller's store (orders, conversations).
 * Returns only id, displayName (or first name + initial), and avatar if present.
 * Never returns email, phone, handle, campus, or verification details.
 */
export function formatMinimalBuyerIdentity(user: any): {
  id: string;
  name: string;
  displayName: string;
  avatar: string | null;
} {
  if (!user) {
    return {
      id: "",
      name: "Buyer",
      displayName: "Buyer",
      avatar: null,
    };
  }
  const id = String(user._id || user.id || "");
  const display =
    (typeof user.profile?.displayName === "string" && user.profile.displayName.trim()) ||
    formatFirstNameInitial(user.name);
  const avatar =
    typeof user.profile?.avatar === "string" && user.profile.avatar.trim()
      ? user.profile.avatar.trim()
      : null;

  return {
    id,
    name: display,
    displayName: display,
    avatar,
  };
}

/**
 * Minimal visible identity for a reviewer on a public store/listing review.
 * Shown strictly as first name plus initial and optional verified student badge.
 * Never exposes user ID, email, phone, handle, or full surname.
 */
export function formatMinimalReviewerIdentity(user: any): {
  name: string;
  avatar?: string;
  isVerifiedStudent: boolean;
} {
  if (!user) {
    return {
      name: "Verified Buyer",
      isVerifiedStudent: false,
    };
  }
  const formattedName = formatFirstNameInitial(
    user.name || user.profile?.displayName || "Verified Buyer"
  );
  const result: { name: string; avatar?: string; isVerifiedStudent: boolean } = {
    name: formattedName,
    isVerifiedStudent: Boolean(user.studentVerified),
  };
  if (typeof user.profile?.avatar === "string" && user.profile.avatar.trim()) {
    result.avatar = user.profile.avatar.trim();
  }
  return result;
}

export const User = UserModel;
export default UserModel;
