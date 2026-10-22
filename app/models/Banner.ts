import mongoose, { Schema, Model, Document } from "mongoose";

export type BannerPlacement = "homepage_hero" | "promo_strip" | "category_promo";
export type BannerStatus = "draft" | "scheduled" | "published" | "archived";

export interface IBanner {
  id: string;
  name: string;
  headline: string;
  description?: string;
  imageUrl: string;
  mobileImageUrl?: string;
  imageAlt: string;
  ctaLabel: string;
  ctaUrl: string;
  placement: BannerPlacement;
  targetCategory?: string;
  status: BannerStatus;
  startAt: Date;
  endAt?: Date | null;
  priority: number;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBannerDocument extends Omit<IBanner, "id">, Document {
  id: string;
}

/**
 * Validates CTA destination URLs to block dangerous schemes.
 * Permits relative paths starting with / or absolute URLs with http/https.
 */
export function isValidCtaUrl(url: string): boolean {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  if (trimmed.length === 0 || trimmed.length > 2048) return false;

  // Block dangerous pseudo-protocols
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("data:") ||
    lower.startsWith("vbscript:") ||
    lower.startsWith("file:")
  ) {
    return false;
  }

  // Relative campus links e.g. /explore, /listings/create
  if (trimmed.startsWith("/")) {
    // Prevent protocol-relative URLs like //evil.com
    return !trimmed.startsWith("//");
  }

  // Absolute URLs must be http or https
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

/**
 * Validates image URLs for web safety.
 */
export function isValidImageUrl(url: string): boolean {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  if (trimmed.length === 0 || trimmed.length > 2048) return false;

  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("data:") ||
    lower.startsWith("vbscript:")
  ) {
    return false;
  }

  if (trimmed.startsWith("/")) {
    return !trimmed.startsWith("//");
  }

  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

const BannerSchema = new Schema<IBannerDocument>(
  {
    name: {
      type: String,
      required: [true, "Internal banner name is required"],
      trim: true,
      minlength: [1, "Banner name cannot be empty"],
      maxlength: [120, "Banner name cannot exceed 120 characters"],
    },
    headline: {
      type: String,
      required: [true, "Banner headline is required"],
      trim: true,
      minlength: [1, "Headline cannot be empty"],
      maxlength: [150, "Headline cannot exceed 150 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [300, "Description cannot exceed 300 characters"],
      default: "",
    },
    imageUrl: {
      type: String,
      required: [true, "Desktop image URL is required"],
      trim: true,
      validate: {
        validator: isValidImageUrl,
        message: "Invalid desktop image URL",
      },
    },
    mobileImageUrl: {
      type: String,
      trim: true,
      validate: {
        validator: (v: string) => !v || isValidImageUrl(v),
        message: "Invalid mobile image URL",
      },
      default: "",
    },
    imageAlt: {
      type: String,
      required: [true, "Image alt text is required for accessibility"],
      trim: true,
      minlength: [1, "Image alt text cannot be empty"],
      maxlength: [150, "Image alt text cannot exceed 150 characters"],
    },
    ctaLabel: {
      type: String,
      required: [true, "CTA button label is required"],
      trim: true,
      minlength: [1, "CTA button label cannot be empty"],
      maxlength: [40, "CTA label cannot exceed 40 characters"],
    },
    ctaUrl: {
      type: String,
      required: [true, "CTA destination URL is required"],
      trim: true,
      validate: {
        validator: isValidCtaUrl,
        message: "Invalid or dangerous CTA URL. Relative paths must start with '/' and external URLs must use 'https://'.",
      },
    },
    placement: {
      type: String,
      enum: ["homepage_hero", "promo_strip", "category_promo"],
      required: [true, "Banner placement is required"],
      default: "homepage_hero",
    },
    targetCategory: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["draft", "scheduled", "published", "archived"],
      required: [true, "Banner status is required"],
      default: "draft",
    },
    startAt: {
      type: Date,
      required: [true, "Start date and time is required"],
      default: () => new Date(),
    },
    endAt: {
      type: Date,
      default: null,
    },
    priority: {
      type: Number,
      required: true,
      default: 0,
      min: [0, "Priority cannot be negative"],
      max: [1000, "Priority cannot exceed 1000"],
    },
    createdBy: {
      type: String,
      required: [true, "Creator admin ID is required"],
    },
    updatedBy: {
      type: String,
      required: [true, "Updater admin ID is required"],
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, any>) => {
        ret.id = ret._id?.toString();
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (_doc, ret: Record<string, any>) => {
        ret.id = ret._id?.toString();
        delete ret.__v;
        return ret;
      },
    },
  }
);

BannerSchema.pre("validate", function (this: any) {
  if (this.endAt && this.startAt && new Date(this.endAt).getTime() <= new Date(this.startAt).getTime()) {
    this.invalidate("endAt", "End date must be strictly after start date");
  }
});

// High-performance compound indexes for runtime queries and admin filtering
BannerSchema.index({ placement: 1, status: 1, startAt: 1, endAt: 1, priority: -1 });
BannerSchema.index({ placement: 1, targetCategory: 1, status: 1, startAt: 1, endAt: 1 });
BannerSchema.index({ status: 1, placement: 1, createdAt: -1 });
BannerSchema.index({ createdAt: -1 });

export const BannerModel: Model<IBannerDocument> =
  mongoose.models.CampusBanner ||
  mongoose.model<IBannerDocument>("CampusBanner", BannerSchema, "banners");

export default BannerModel;
