import mongoose, { Schema, Model, Document } from "mongoose";

export interface IEmailVerification {
  id: string;
  email: string;
  verificationCode: string; // Cryptographic HMAC-SHA256 hash (never plain text)
  attempts: number;
  lastSentAt: Date;
  expiresAt: Date;
  verifiedAt?: Date;
  schemaVersion: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IEmailVerificationDocument extends Omit<IEmailVerification, "id">, Document {}

const EmailVerificationSchema = new Schema<IEmailVerificationDocument>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    verificationCode: {
      type: String,
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    lastSentAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    verifiedAt: {
      type: Date,
    },
    schemaVersion: {
      type: Number,
      default: 1,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    strict: true,
    collection: "emailverifications",
    autoIndex: process.env.NODE_ENV !== "production",
  }
);

// TTL index to automatically prune expired records from MongoDB after 24 hours
EmailVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 86400 });

(EmailVerificationSchema as any).pre(
  ["updateOne", "updateMany", "findOneAndUpdate", "findByIdAndUpdate"],
  function (this: any) {
    this.setOptions({ runValidators: true });
  }
);

export const EmailVerificationModel: Model<IEmailVerificationDocument> =
  mongoose.models.EmailVerification ||
  mongoose.model<IEmailVerificationDocument>(
    "EmailVerification",
    EmailVerificationSchema,
    "emailverifications"
  );

export default EmailVerificationModel;
