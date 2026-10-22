export interface IUserPreferences {
  appearance?: {
    theme?: "system" | "light" | "dark";
    accentColor?: "amber" | "emerald" | "indigo" | "rose" | "sky" | "violet";
    textSize?: "normal" | "compact" | "large";
    displayDensity?: "comfortable" | "compact";
  };
  discovery?: {
    defaultLanding?: "explore" | "feed" | "radar";
    preferredCampus?: string;
    preferredCategories?: string[];
    defaultSort?: "recent" | "price_asc" | "price_desc" | "popular";
    priceRange?: {
      min?: number;
      max?: number;
    };
  };
  notifications?: {
    messages?: boolean;
    orderUpdates?: boolean;
    followedStores?: boolean;
    wishlistAlerts?: boolean;
    reviews?: boolean;
    accountSecurity?: boolean;
    promotions?: boolean;
    inApp?: boolean;
    push?: boolean;
    email?: boolean;
    frequency?: "instant" | "daily" | "weekly";
    quietHoursEnabled?: boolean;
    quietHoursStart?: string;
    quietHoursEnd?: string;
  };
  privacy?: {
    profileVisibility?: "public" | "campus_only";
    showOnlineStatus?: boolean;
    showSalesMilestones?: boolean;
    messagePermission?: "everyone" | "verified" | "listings";
  };
  messaging?: {
    messagePreviews?: boolean;
    readReceipts?: boolean;
    contactChannel?: "in_app" | "whatsapp";
  };
  accessibility?: {
    reduceMotion?: boolean;
    highContrast?: boolean;
    dataSaver?: boolean;
  };
  seller?: {
    vacationMode?: boolean;
    inquiryAlerts?: boolean;
    autoReply?: string;
  };
}

export const DEFAULT_USER_PREFERENCES: Required<{
  appearance: Required<NonNullable<IUserPreferences["appearance"]>>;
  discovery: Required<NonNullable<IUserPreferences["discovery"]>>;
  notifications: Required<NonNullable<IUserPreferences["notifications"]>>;
  privacy: Required<NonNullable<IUserPreferences["privacy"]>>;
  messaging: Required<NonNullable<IUserPreferences["messaging"]>>;
  accessibility: Required<NonNullable<IUserPreferences["accessibility"]>>;
  seller: Required<NonNullable<IUserPreferences["seller"]>>;
}> = {
  appearance: {
    theme: "system",
    accentColor: "amber",
    textSize: "normal",
    displayDensity: "comfortable",
  },
  discovery: {
    defaultLanding: "explore",
    preferredCampus: "",
    preferredCategories: [],
    defaultSort: "recent",
    priceRange: { min: 0, max: 0 },
  },
  notifications: {
    messages: true,
    orderUpdates: true,
    followedStores: true,
    wishlistAlerts: true,
    reviews: true,
    accountSecurity: true,
    promotions: false,
    inApp: true,
    push: true,
    email: false,
    frequency: "instant",
    quietHoursEnabled: false,
    quietHoursStart: "22:00",
    quietHoursEnd: "07:00",
  },
  privacy: {
    profileVisibility: "public",
    showOnlineStatus: true,
    showSalesMilestones: true,
    messagePermission: "everyone",
  },
  messaging: {
    messagePreviews: true,
    readReceipts: true,
    contactChannel: "in_app",
  },
  accessibility: {
    reduceMotion: false,
    highContrast: false,
    dataSaver: false,
  },
  seller: {
    vacationMode: false,
    inquiryAlerts: true,
    autoReply: "",
  },
};
