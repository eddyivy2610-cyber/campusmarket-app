import { NextResponse } from "next/server";
import { z } from "zod";
import { withApi } from "@/lib/withApi";
import UserModel, { DEFAULT_USER_PREFERENCES } from "@/models/User";
import StoreModel from "@/models/Store";

export const dynamic = "force-dynamic";

/**
 * Strict schema for user preference updates.
 * Any non-allowlisted field (such as role, accountStatus, tokenVersion, _id)
 * is rejected at validation time with 400 Bad Request to prevent mass assignment.
 */
export const updatePreferencesSchema = z
  .object({
    appearance: z
      .object({
        theme: z.enum(["system", "light", "dark"]).optional(),
        accentColor: z
          .enum(["amber", "emerald", "indigo", "rose", "sky", "violet"])
          .optional(),
        textSize: z.enum(["normal", "compact", "large"]).optional(),
        displayDensity: z.enum(["comfortable", "compact"]).optional(),
      })
      .strict()
      .optional(),
    discovery: z
      .object({
        defaultLanding: z.enum(["explore", "feed", "radar"]).optional(),
        preferredCampus: z.string().max(120).optional(),
        preferredCategories: z.array(z.string().max(60)).max(20).optional(),
        defaultSort: z
          .enum(["recent", "price_asc", "price_desc", "popular"])
          .optional(),
        priceRange: z
          .object({
            min: z.number().min(0).max(100_000_000).optional(),
            max: z.number().min(0).max(100_000_000).optional(),
          })
          .strict()
          .optional(),
      })
      .strict()
      .optional(),
    notifications: z
      .object({
        inApp: z.boolean().optional(),
        push: z.boolean().optional(),
        email: z.boolean().optional(),
        messages: z.boolean().optional(),
        orderUpdates: z.boolean().optional(),
        followedStores: z.boolean().optional(),
        wishlistAlerts: z.boolean().optional(),
        reviews: z.boolean().optional(),
        accountSecurity: z.boolean().optional(),
        promotions: z.boolean().optional(),
        frequency: z.enum(["instant", "daily", "weekly"]).optional(),
        quietHoursEnabled: z.boolean().optional(),
        quietHoursStart: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).optional(),
        quietHoursEnd: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).optional(),
      })
      .strict()
      .optional(),
    privacy: z
      .object({
        profileVisibility: z.enum(["public", "campus_only"]).optional(),
        showOnlineStatus: z.boolean().optional(),
        showSalesMilestones: z.boolean().optional(),
        messagePermission: z
          .enum(["everyone", "verified", "listings"])
          .optional(),
      })
      .strict()
      .optional(),
    messaging: z
      .object({
        messagePreviews: z.boolean().optional(),
        readReceipts: z.boolean().optional(),
        contactChannel: z.enum(["in_app", "whatsapp"]).optional(),
      })
      .strict()
      .optional(),
    accessibility: z
      .object({
        reduceMotion: z.boolean().optional(),
        highContrast: z.boolean().optional(),
        dataSaver: z.boolean().optional(),
      })
      .strict()
      .optional(),
    seller: z
      .object({
        vacationMode: z.boolean().optional(),
        inquiryAlerts: z.boolean().optional(),
        autoReply: z.string().max(300).optional(),
      })
      .strict()
      .optional(),
  })
  .strict();

export type UpdatePreferencesPayload = z.infer<typeof updatePreferencesSchema>;

/**
 * Helper to deep-merge database preferences with default MVP preferences.
 */
function mergeWithDefaults(userPrefs: any) {
  const p = userPrefs || {};
  return {
    appearance: {
      ...DEFAULT_USER_PREFERENCES.appearance,
      ...(p.appearance || {}),
    },
    discovery: {
      ...DEFAULT_USER_PREFERENCES.discovery,
      ...(p.discovery || {}),
      priceRange: {
        ...DEFAULT_USER_PREFERENCES.discovery.priceRange,
        ...(p.discovery?.priceRange || {}),
      },
      preferredCategories: Array.isArray(p.discovery?.preferredCategories)
        ? p.discovery.preferredCategories
        : DEFAULT_USER_PREFERENCES.discovery.preferredCategories,
    },
    notifications: {
      ...DEFAULT_USER_PREFERENCES.notifications,
      ...(p.notifications || {}),
    },
    privacy: {
      ...DEFAULT_USER_PREFERENCES.privacy,
      ...(p.privacy || {}),
    },
    messaging: {
      ...DEFAULT_USER_PREFERENCES.messaging,
      ...(p.messaging || {}),
    },
    accessibility: {
      ...DEFAULT_USER_PREFERENCES.accessibility,
      ...(p.accessibility || {}),
    },
    seller: {
      ...DEFAULT_USER_PREFERENCES.seller,
      ...(p.seller || {}),
    },
  };
}

/**
 * Determine if user account has storefront / seller permissions.
 */
async function checkSellerEligibility(userId: string, role?: string): Promise<boolean> {
  if (role === "seller") return true;
  const storeExists = await StoreModel.exists({ ownerId: userId });
  return Boolean(storeExists);
}

/**
 * GET /api/users/preferences
 * Returns the authenticated user's app preferences merged with defaults.
 */
export const GET = withApi(
  {
    auth: "user",
    cache: "no-store",
  },
  async ({ user }) => {
    const userDoc: any = await UserModel.findById(user.id)
      .select("preferences role campus")
      .lean();

    if (!userDoc) {
      return NextResponse.json(
        { success: false, error: "User account not found." },
        { status: 404 }
      );
    }

    const isSeller = await checkSellerEligibility(user.id, userDoc.role || user.role);
    const preferences = mergeWithDefaults(userDoc.preferences);

    return NextResponse.json({
      success: true,
      data: preferences,
      preferences,
      isSeller,
      campus: userDoc.campus || "",
    });
  }
);

/**
 * PATCH /api/users/preferences
 * Atomically updates user preference settings with server validation.
 */
export const PATCH = withApi(
  {
    auth: "user",
    cache: "no-store",
    schema: {
      body: updatePreferencesSchema,
    },
  },
  async ({ user, body }) => {
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized." },
        { status: 401 }
      );
    }

    const userDoc: any = await UserModel.findById(user.id)
      .select("preferences role campus")
      .lean();

    if (!userDoc) {
      return NextResponse.json(
        { success: false, error: "User account not found." },
        { status: 404 }
      );
    }

    const isSeller = await checkSellerEligibility(user.id, userDoc.role || user.role);

    // If caller attempted to set seller preferences without seller privileges, reject with 403
    if (body.seller && !isSeller) {
      return NextResponse.json(
        {
          success: false,
          error: "Storefront preferences are only available to eligible sellers.",
        },
        { status: 403 }
      );
    }

    // Flatten updates to dot-notation so untouched subdocument keys are preserved
    const updateFields: Record<string, any> = {
      updatedAt: new Date().toISOString(),
    };

    if (body.appearance) {
      if (body.appearance.theme !== undefined) {
        updateFields["preferences.appearance.theme"] = body.appearance.theme;
      }
      if (body.appearance.accentColor !== undefined) {
        updateFields["preferences.appearance.accentColor"] = body.appearance.accentColor;
      }
      if (body.appearance.textSize !== undefined) {
        updateFields["preferences.appearance.textSize"] = body.appearance.textSize;
      }
      if (body.appearance.displayDensity !== undefined) {
        updateFields["preferences.appearance.displayDensity"] = body.appearance.displayDensity;
      }
    }

    if (body.discovery) {
      if (body.discovery.defaultLanding !== undefined) {
        updateFields["preferences.discovery.defaultLanding"] = body.discovery.defaultLanding;
      }
      if (body.discovery.preferredCampus !== undefined) {
        updateFields["preferences.discovery.preferredCampus"] = body.discovery.preferredCampus;
        if (body.discovery.preferredCampus && !userDoc.campus) {
          updateFields["campus"] = body.discovery.preferredCampus.trim();
        }
      }
      if (body.discovery.preferredCategories !== undefined) {
        updateFields["preferences.discovery.preferredCategories"] = body.discovery.preferredCategories;
      }
      if (body.discovery.defaultSort !== undefined) {
        updateFields["preferences.discovery.defaultSort"] = body.discovery.defaultSort;
      }
      if (body.discovery.priceRange) {
        if (body.discovery.priceRange.min !== undefined) {
          updateFields["preferences.discovery.priceRange.min"] = body.discovery.priceRange.min;
        }
        if (body.discovery.priceRange.max !== undefined) {
          updateFields["preferences.discovery.priceRange.max"] = body.discovery.priceRange.max;
        }
      }
    }

    if (body.notifications) {
      if (body.notifications.inApp !== undefined) {
        updateFields["preferences.notifications.inApp"] = true;
      }
      if (body.notifications.push !== undefined) {
        updateFields["preferences.notifications.push"] = body.notifications.push;
      }
      if (body.notifications.email !== undefined) {
        updateFields["preferences.notifications.email"] = body.notifications.email;
      }
      if (body.notifications.messages !== undefined) {
        updateFields["preferences.notifications.messages"] = body.notifications.messages;
      }
      if (body.notifications.orderUpdates !== undefined) {
        updateFields["preferences.notifications.orderUpdates"] = body.notifications.orderUpdates;
      }
      if (body.notifications.followedStores !== undefined) {
        updateFields["preferences.notifications.followedStores"] = body.notifications.followedStores;
      }
      if (body.notifications.wishlistAlerts !== undefined) {
        updateFields["preferences.notifications.wishlistAlerts"] = body.notifications.wishlistAlerts;
      }
      if (body.notifications.reviews !== undefined) {
        updateFields["preferences.notifications.reviews"] = body.notifications.reviews;
      }
      updateFields["preferences.notifications.accountSecurity"] = true;
      if (body.notifications.promotions !== undefined) {
        updateFields["preferences.notifications.promotions"] = body.notifications.promotions;
      }
      if (body.notifications.frequency !== undefined) {
        updateFields["preferences.notifications.frequency"] = body.notifications.frequency;
      }
      if (body.notifications.quietHoursEnabled !== undefined) {
        updateFields["preferences.notifications.quietHoursEnabled"] = body.notifications.quietHoursEnabled;
      }
      if (body.notifications.quietHoursStart !== undefined) {
        updateFields["preferences.notifications.quietHoursStart"] = body.notifications.quietHoursStart;
      }
      if (body.notifications.quietHoursEnd !== undefined) {
        updateFields["preferences.notifications.quietHoursEnd"] = body.notifications.quietHoursEnd;
      }
    }

    if (body.privacy) {
      if (body.privacy.profileVisibility !== undefined) {
        updateFields["preferences.privacy.profileVisibility"] = body.privacy.profileVisibility;
      }
      if (body.privacy.showOnlineStatus !== undefined) {
        updateFields["preferences.privacy.showOnlineStatus"] = body.privacy.showOnlineStatus;
      }
      if (body.privacy.showSalesMilestones !== undefined) {
        updateFields["preferences.privacy.showSalesMilestones"] = body.privacy.showSalesMilestones;
      }
      if (body.privacy.messagePermission !== undefined) {
        updateFields["preferences.privacy.messagePermission"] = body.privacy.messagePermission;
      }
    }

    if (body.messaging) {
      if (body.messaging.messagePreviews !== undefined) {
        updateFields["preferences.messaging.messagePreviews"] = body.messaging.messagePreviews;
      }
      if (body.messaging.readReceipts !== undefined) {
        updateFields["preferences.messaging.readReceipts"] = body.messaging.readReceipts;
      }
      if (body.messaging.contactChannel !== undefined) {
        updateFields["preferences.messaging.contactChannel"] = body.messaging.contactChannel;
      }
    }

    if (body.accessibility) {
      if (body.accessibility.reduceMotion !== undefined) {
        updateFields["preferences.accessibility.reduceMotion"] = body.accessibility.reduceMotion;
      }
      if (body.accessibility.highContrast !== undefined) {
        updateFields["preferences.accessibility.highContrast"] = body.accessibility.highContrast;
      }
      if (body.accessibility.dataSaver !== undefined) {
        updateFields["preferences.accessibility.dataSaver"] = body.accessibility.dataSaver;
      }
    }

    if (body.seller && isSeller) {
      if (body.seller.vacationMode !== undefined) {
        updateFields["preferences.seller.vacationMode"] = body.seller.vacationMode;
      }
      if (body.seller.inquiryAlerts !== undefined) {
        updateFields["preferences.seller.inquiryAlerts"] = body.seller.inquiryAlerts;
      }
      if (body.seller.autoReply !== undefined) {
        updateFields["preferences.seller.autoReply"] = body.seller.autoReply;
      }
    }

    const updatedUser: any = await UserModel.findByIdAndUpdate(
      user.id,
      { $set: updateFields },
      { returnDocument: "after", runValidators: true }
    )
      .select("preferences role campus")
      .lean();

    const merged = mergeWithDefaults(updatedUser?.preferences);

    return NextResponse.json({
      success: true,
      data: merged,
      preferences: merged,
      isSeller,
      message: "Preferences updated successfully.",
    });
  }
);
