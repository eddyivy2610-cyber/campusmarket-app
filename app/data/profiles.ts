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
    businessInfo?: {
        extendedBio: string;
        policies: string;
        hours: string;
    };
    achievements?: Array<{
        name: string;
        icon: string; // Store icon name as string to avoid serialization issues if needed, or use any
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

export const PROFILES: Profile[] = [
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
        lastSeen: "Engaged in conversation, 3 minutes ago",
        coverPhoto: "https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=1200&q=80",
        responseRate: "95%",
        responseTime: "2 hours",
        tags: ["official", "trusted", "essentials"],
        businessInfo: {
            extendedBio: "Campus Market is the premier platform for student-to-student commerce at Ahmadu Bello University. We curate the best deals and ensure a safe trading environment for everyone.",
            policies: "7-day return policy for faulty electronics. Meetups only in public campus areas.",
            hours: "Mon - Sat: 9:00 AM - 6:00 PM"
        },
        achievements: [
            { name: 'Top Seller', icon: 'Trophy', color: 'text-yellow-600 bg-yellow-500/10', description: 'completed 100 negotiations', type: 'Achievement' },
            { name: 'Verified Student', icon: 'Shield', color: 'text-blue-600 bg-blue-500/10', description: 'verified with id', type: 'System' },
            { name: 'Early Adopter', icon: 'Zap', color: 'text-purple-600 bg-purple-500/10', description: 'joined during beta phase', type: 'Legacy' },
            { name: 'Trusted Buyer', icon: 'Star', color: 'text-green-600 bg-green-500/10', description: '50+ positive feedback', type: 'Achievement' },
        ],
        socialLinks: {
            whatsapp: "https://wa.me/1234567890",
            instagram: "https://instagram.com/campusmarket",
            twitter: "https://twitter.com/campusmarket",
            linkedin: "https://linkedin.com/company/campusmarket"
        }
    },
    {
        id: "lucky-john-1",
        name: "Lucky John",
        handle: "luckyjohn",
        bio: "Just a regular student making the most out of campus life. Lover of books, tech, and good music.",
        rating: 4.5,
        avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80",
        type: 'vendor',
        isStudent: true,
        isVerified: false,
        transactions: 12,
        recommendedCount: 8,
        notRecommendedCount: 0,
        totalSales: 0,
        joinedDate: "Feb 2025",
        joinedDateFull: "February 5, 2025",
        location: "University of Lagos",
        department: "Computer Science",
        lastSeen: "Active 5 mins ago",
        tags: ["student", "books", "tech"],
        savedListings: []
    }
];
