export interface Review {
    id: string;
    userName: string;
    recommended: boolean;
    date: string;
    comment: string;
    isVerifiedBuyer: boolean;
    vendorResponse?: string;
}

export interface Product {
    id: number;
    title: string;
    price: number;
    image: string;
    images: string[];
    category: "Electronics" | "Academics" | "Accomodation" | "Fashion" | "Personal Care" | "Sports & Fitness" | "Entertainment" | "Transport" | "Events" | "Urgent" | "Services" | "Food & Provisions";
    recommendedCount: number;
    notRecommendedCount: number;
    location: string;
    condition: "New" | "Used - Like New" | "Used - Good" | "Used - Fair";
    tags: string[];
    description: string;
    specs: Record<string, string>;
    sellerId: string;
    postedDate: string;
    views: number;
    reviews: Review[];
    offer?: {
        salesPeriod: string;
        promoPeriod: string;
    };
}

export const CATEGORIES = [
    { name: "Electronics", icon: "📱", lucideIcon: "MonitorSmartphone" },
    { name: "Academics", icon: "📚", lucideIcon: "BookOpen" },
    { name: "Accomodation", icon: "🏠", lucideIcon: "Home" },
    { name: "Food & Provisions", icon: "🍔", lucideIcon: "UtensilsCrossed" },
    { name: "Fashion", icon: "👕", lucideIcon: "Shirt" },
    { name: "Personal Care", icon: "✨", lucideIcon: "Sparkles" },
    { name: "Sports & Fitness", icon: "🏋️‍♂️", lucideIcon: "Dumbbell" },
    { name: "Entertainment", icon: "🎸", lucideIcon: "Music" },

    { name: "Transport", icon: "🚲", lucideIcon: "Bike" },
    { name: "Events", icon: "📅", lucideIcon: "Calendar" },
    { name: "Urgent", icon: "🚨", lucideIcon: "AlertCircle" },
    { name: "Services", icon: "🛠️", lucideIcon: "Wrench" }
];

export const PRODUCTS: Product[] = [
    {
        id: 1,
        title: "MacBook Pro 2021 - M1 Pro",
        price: 450000,
        image: "https://images.unsplash.com/photo-1517336715481-d1ad7eaf1c9c?auto=format&fit=crop&w=800&q=80",
        images: [
            "https://images.unsplash.com/photo-1517336715481-d1ad7eaf1c9c?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80"
        ],
        category: "Electronics",
        recommendedCount: 22,
        notRecommendedCount: 1,
        location: "Zaria, Nigeria",
        condition: "Used - Like New",
        tags: ["apple", "macbook", "laptop", "m1"],
        description: "MacBook Pro 14-inch with M1 Pro chip, 16GB RAM, and 512GB SSD. Purchased in September 2024, used for 6 months. Still in excellent condition with no scratches or dents. Battery health at 98%. Includes original charger, box, and a free laptop sleeve.\n\nReason for selling: Upgraded to MacBook Pro M3.",
        specs: {
            "Condition": "Like New",
            "Brand": "Apple",
            "Model": "MacBook Pro 14\"",
            "Storage": "512GB SSD",
            "RAM": "16GB",
            "Color": "Space Gray",
            "Battery": "45 cycles",
            "Includes": "Charger, Box"
        },
        sellerId: "S1",
        postedDate: "2 days ago",
        views: 124,
        offer: {
            salesPeriod: "Dec 1 - Dec 24",
            promoPeriod: "Christmas Special"
        },
        reviews: [
            {
                id: "r1",
                userName: "Michael O.",
                recommended: true,
                date: "2 days ago",
                isVerifiedBuyer: true,
                comment: "Laptop arrived exactly as described. Battery life is amazing. Vendor was responsive and delivery was quick. Highly recommend!"
            },
            {
                id: "r2",
                userName: "Amina K.",
                recommended: true,
                date: "1 week ago",
                isVerifiedBuyer: true,
                comment: "Great laptop, but took longer to deliver than expected. Condition is perfect though and vendor communicated well. 4 stars!",
                vendorResponse: "Sorry for the delay, Amina! Glad you love the laptop. Next time I'll ensure faster shipping."
            }
        ]
    },
    {
        id: 2,
        title: "Calculus Early Transcendentals",
        price: 4500,
        image: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=400&q=80",
        images: ["https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=400&q=80"],
        category: "Academics",
        recommendedCount: 12,
        notRecommendedCount: 0,
        location: "Moremi Hall, Unilag",
        condition: "Used - Good",
        tags: ["math", "book", "course", "study"],
        description: "Clean copy of Calculus: Early Transcendentals. No highlights or markings.",
        specs: {
            "Condition": "Used - Good",
            "Subject": "Mathematics",
            "Level": "100/200 Level"
        },
        sellerId: "S1",
        postedDate: "5 days ago",
        views: 45,
        reviews: []
    }
];
