export interface Profile {
    id: string;
    name: string;
    handle: string;
    bio: string;
    rating: number;
    avatar: string;
    type: 'buyer' | 'vendor';
    isStudent: boolean;
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
    businessInfo?: {
        extendedBio: string;
        policies: string;
        hours: string;
    };
}

export const PROFILES: Profile[] = [
    {
        id: "buyer-1",
        name: "Praveen Juge",
        handle: "praveen",
        bio: "Architecture student at Unilag. Lover of clean design and tech gadgets.",
        rating: 4.8,
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
        type: 'buyer',
        isStudent: true,
        isVerified: true,
        transactions: 25,
        recommendedCount: 12,
        notRecommendedCount: 0,
        totalSales: 25,
        joinedDate: "Jan 2024",
        joinedDateFull: "January 15, 2024",
        location: "University of Lagos",
        department: "Architecture",
        tags: ["tech", "design", "campus life"],
        savedListings: ["L1", "L2", "L5"]
    },
    {
        id: "vendor-1",
        name: "Campus Market Official",
        handle: "campus-market",
        bio: "Your one-stop shop for all campus essentials. High quality, student prices.",
        rating: 4.9,
        avatar: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=200&q=80",
        type: 'vendor',
        isStudent: false,
        isVerified: true,
        verifiedTier: 'gold',
        transactions: 156,
        recommendedCount: 48,
        notRecommendedCount: 2,
        totalSales: 156,
        joinedDate: "Jan 2025",
        joinedDateFull: "January 10, 2025",
        location: "Zaria, Nigeria",
        category: "Gadgets & Services",
        activeListingsCount: 24,
        soldItems: 156,
        responseRate: "95%",
        responseTime: "2 hours",
        tags: ["official", "trusted", "essentials"],
        businessInfo: {
            extendedBio: "Campus Market is the premier platform for student-to-student commerce at Ahmadu Bello University. We curate the best deals and ensure a safe trading environment for everyone.",
            policies: "7-day return policy for faulty electronics. Meetups only in public campus areas.",
            hours: "Mon - Sat: 9:00 AM - 6:00 PM"
        }
    }
];
