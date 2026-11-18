import mongoose, { Schema, Document } from "mongoose";

export interface IRefreshToken extends Document {
  tokenHash: string;
  userId: mongoose.Types.ObjectId;
  familyId: string;
  tokenVersion: number;
  usedAt: Date | null;
  revokedAt: Date | null;
  expiresAt: Date;
  createdAt: Date;
}

const RefreshTokenSchema = new Schema<IRefreshToken>(
  {
    tokenHash: { type: String, required: true, unique: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    familyId: { type: String, required: true, index: true },
    tokenVersion: { type: Number, default: 0 },
    usedAt: { type: Date, default: null },
    revokedAt: { type: Date, default: null },
    expiresAt: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RefreshToken =
  mongoose.models.RefreshToken ||
  mongoose.model<IRefreshToken>("RefreshToken", RefreshTokenSchema);

export interface IRefreshTokenFamily extends Document {
  familyId: string;
  userId: mongoose.Types.ObjectId;
  revokedAt: Date | null;
  createdAt: Date;
}

const RefreshTokenFamilySchema = new Schema<IRefreshTokenFamily>(
  {
    familyId: { type: String, required: true, unique: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    revokedAt: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

export const RefreshTokenFamily =
  mongoose.models.RefreshTokenFamily ||
  mongoose.model<IRefreshTokenFamily>("RefreshTokenFamily", RefreshTokenFamilySchema);

export default RefreshToken;
