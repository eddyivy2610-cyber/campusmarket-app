/**
Data Source: Real Database
 */

export interface Profile {
    id: string;
    name: string;
    handle: string;
    bio: string;
    rating: number;
    avatar: string;
    accountType: "Buyer" | "Pro";
    type: 'buyer' | 'vendor';
    isStudent: boolean;
    userStatus: 'student' | 'alumni' | 'community';
    isVerified: boolean;
    verifiedTier?: 'bronze' | 'silver' | 'gold';
    transactions: number;
    recommendedCount: number;
    notRecommendedCount: number;
    totalSales: number;
    joinedDate: string;
    joinedDateFull: string;
    location: string;
    department?: string;
    lastSeen?: string;
    coverPhoto?: string;
    tags: string[];
    // Buyer specific
    recentlyViewed?: any[];
    savedListings?: string[];
    // Vendor specific
    category?: string;
    activeListingsCount?: number;
    soldItems?: number;
    responseRate?: string;
    responseTime?: string;
    followers?: number;
    businessInfo?: {
        extendedBio: string;
        policies: string;
        hours: string;
    };
    achievements?: Array<{
        name: string;
        icon: string;
        color: string;
        type: string;
        description: string;
    }>;
    socialLinks?: {
        whatsapp?: string;
        instagram?: string;
        twitter?: string;
        linkedin?: string;
    };
}

/**
 Profile Mapping
 */
export const mapUserToProfile = (userData: any): Profile => {
    const profile = userData?.profile || {};
    const personal = userData?.personalDetails || {};
    const student = userData?.studentStatus || {};
    const business = userData?.businessProfile || {};
    const rating = userData?.rating || { average: 0, count: 0 };
    const social = userData?.socialLinks || {};

    const name = 
        profile.displayName || 
        personal.fullName || 
        userData?.name || 
        userData?.email?.split('@')[0] || 
        "Unknown User";

    const handle = 
        profile.handle || 
        (typeof name === 'string' ? name.toLowerCase().replace(/[^a-z0-9]/g, "") : "user");

    return {
        id: userData?._id || userData?.id || "unknown",
        name,
        handle,
        bio: profile.bio || "Hey I'm using Campus Hive!",
        rating: rating.average || 0,
        avatar: (profile.avatar && profile.avatar !== "image") ? profile.avatar : "/placeholder.png",
        accountType: userData?.role === "seller" ? "Pro" : "Buyer",
        type: userData?.role === "seller" ? "vendor" : "buyer",
        isStudent: student.isStudent || false,
        userStatus: student.status || (student.isStudent ? "student" : "community"),
        isVerified: student.isVerified || false,
        verifiedTier: student.isVerified ? "bronze" : undefined,
        transactions: userData?.loginCount || 0,
        recommendedCount: rating.count || 0,
        notRecommendedCount: 0,
        totalSales: business.totalSalesAmount || 0,
        joinedDate: userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString("en-US", { month: 'short', year: 'numeric' }) : "Recently",
        joinedDateFull: userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString("en-US", { month: 'long', day: 'numeric', year: 'numeric' }) : "Recently joined",
        location: student.status === "community" ? "" : (personal.stateOfOrigin || student.schoolName || "Campus"),
        department: personal.department || "",
        tags: business.tags || [],
        coverPhoto: profile.coverImage || "",
        category: business.category || "General",
        activeListingsCount: business.activeListingsCount || 0,
        soldItems: business.soldItemsCount || 0,
        responseRate: business.responseRate || "100%",
        responseTime: business.responseTime || "within hours",
        followers: business.followersCount || 0,
        businessInfo: {
            extendedBio: business.description || profile.bio || "",
            policies: business.policies || "Standard campus trading policies apply.",
            hours: business.workingHours || "Always open",
        },
        achievements: userData?.achievements || [],
        socialLinks: {
            whatsapp: social.whatsapp || "",
            instagram: social.instagram || "",
            twitter: social.twitter || "",
            linkedin: social.linkedin || "",
        },
    };
};

export const PROFILES: Profile[] = [];
