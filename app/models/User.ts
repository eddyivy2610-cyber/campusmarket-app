import mongoose, { Schema, Model, Document } from "mongoose";
import { USER_ROLES, USER_ACCOUNT_STATUSES, UserRole, UserAccountStatus } from "@/constants/enums";

export type { UserRole, UserAccountStatus };

export interface IUserProfile {
  displayName?: string;
  handle?: string;
  avatar?: string;
  coverImage?: string;
  bio?: string;
  phone?: string;
  whatsapp?: string;
}

export interface IUser {
  id: string;
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
  profile?: IUserProfile;
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
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password: { type: String, select: false },
    role: { type: String, enum: USER_ROLES, default: "buyer", index: true },
    accountStatus: {
      type: String,
      enum: USER_ACCOUNT_STATUSES,
      default: "active",
      index: true,
    },
    campus: { type: String, required: false, index: true },
    isStudent: { type: Boolean, default: true },
    studentVerified: { type: Boolean, default: false, index: true },
    emailVerified: { type: Boolean, default: false, index: true },
    onboardingStep: { type: String, default: "pending" },
    profile: {
      displayName: { type: String },
      handle: { type: String, lowercase: true, trim: true },
      avatar: { type: String },
      coverImage: { type: String },
      bio: { type: String },
      phone: { type: String },
      whatsapp: { type: String },
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
  { "profile.handle": 1 },
  { unique: true, partialFilterExpression: { "profile.handle": { $type: "string" } } }
);

// Enforce required validators on all update operations
(UserSchema as any).pre(["updateOne", "updateMany", "findOneAndUpdate", "findByIdAndUpdate"], function (this: any) {
  this.setOptions({ runValidators: true });
});

UserSchema.pre("save", function () {
  if (!this.name && (this.profile?.displayName || this.email)) {
    this.name = this.profile?.displayName || this.email.split("@")[0] || "User";
  }
  if (!this.profile) {
    this.profile = {};
  }
  if (!this.profile.handle) {
    const rawHandle = this.profile.displayName || this.name || this.email.split("@")[0] || "user";
    this.profile.handle = rawHandle.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (!this.profile.handle) {
      this.profile.handle = `user${Math.floor(1000 + Math.random() * 9000)}`;
    }
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
  const baseHandle = userObj.profile?.handle || "user";

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
        userObj.profile.handle = `${baseHandle}${Math.floor(100 + Math.random() * 900)}`;
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

export const User = UserModel;
export default UserModel;
