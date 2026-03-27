import { Product } from "./types";

export type ListingStatus = "active" | "sold" | "paused" | "pending";

export interface ListingRecord extends Product {
    listingCode: string;
    slug: string;
    status: ListingStatus;
    route: string;
    sellerName: string;
    sellerHandle: string;
    createdAt: string;
    updatedAt: string;
    inventory: number;
    fulfillment: {
        delivery: boolean;
        pickup: boolean;
        pickupLocation?: string;
    };
    paymentMethods: Array<"cash" | "transfer" | "card">;
    visibility: "public" | "campus-only";
    isFeatured: boolean;
}

const campusHiveSeller = {
    sellerId: "vendor-1",
    sellerName: "Campus Hive Official",
    sellerHandle: "campus-market",
};

export const LISTINGS_DB: ListingRecord[] = [
    {
        id: 1,
        listingCode: "LST-1001-CH",
        slug: "macbook-pro-2021-m1-pro",
        status: "active",
        route: "/listings/1",
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
        postedDate: "2 days ago",
        views: 124,
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
        ],
        negotiable: true,
        minPrice: 420000,
        createdAt: "2025-12-14T09:15:00Z",
        updatedAt: "2026-02-18T14:25:00Z",
        inventory: 1,
        fulfillment: {
            delivery: true,
            pickup: true,
            pickupLocation: "ABU Main Gate"
        },
        paymentMethods: ["transfer", "cash"],
        visibility: "campus-only",
        isFeatured: true,
        ...campusHiveSeller
    },
    {
        id: 2,
        listingCode: "LST-1002-CH",
        slug: "calculus-early-transcendentals",
        status: "active",
        route: "/listings/2",
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
        postedDate: "5 days ago",
        views: 45,
        reviews: [],
        negotiable: false,
        createdAt: "2026-01-03T10:45:00Z",
        updatedAt: "2026-02-01T08:10:00Z",
        inventory: 2,
        fulfillment: {
            delivery: false,
            pickup: true,
            pickupLocation: "Moremi Hall Lobby"
        },
        paymentMethods: ["cash", "transfer"],
        visibility: "campus-only",
        isFeatured: false,
        ...campusHiveSeller
    },
    {
        id: 3,
        listingCode: "LST-1003-CH",
        slug: "iphone-13-pro-256gb",
        status: "active",
        route: "/listings/3",
        title: "iPhone 13 Pro - 256GB",
        price: 350000,
        image: "https://images.unsplash.com/photo-1632661674596-df8be070a5c5?auto=format&fit=crop&w=800&q=80",
        images: ["https://images.unsplash.com/photo-1632661674596-df8be070a5c5?auto=format&fit=crop&w=800&q=80"],
        category: "Electronics",
        recommendedCount: 15,
        notRecommendedCount: 0,
        location: "University of Lagos",
        condition: "Used - Like New",
        tags: ["iphone", "apple", "phone"],
        description: "iPhone 13 Pro in Graphite. 256GB storage. 92% Battery health. Screen protector and case included.",
        specs: {
            "Condition": "Like New",
            "Storage": "256GB",
            "Battery": "92%"
        },
        postedDate: "1 day ago",
        views: 89,
        reviews: [],
        negotiable: true,
        minPrice: 330000,
        createdAt: "2026-02-20T13:20:00Z",
        updatedAt: "2026-02-24T09:05:00Z",
        inventory: 1,
        fulfillment: {
            delivery: true,
            pickup: true,
            pickupLocation: "Faculty of Engineering"
        },
        paymentMethods: ["transfer"],
        visibility: "public",
        isFeatured: true,
        ...campusHiveSeller
    },
    {
        id: 4,
        listingCode: "LST-1004-CH",
        slug: "campus-hive-starter-hoodie",
        status: "active",
        route: "/listings/4",
        title: "Campus Hive Starter Hoodie",
        price: 12000,
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80",
        images: [
            "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80"
        ],
        category: "Fashion",
        recommendedCount: 9,
        notRecommendedCount: 0,
        location: "Zaria, Nigeria",
        condition: "New",
        tags: ["hoodie", "campus", "fashion", "essentials"],
        description: "Soft, heavyweight cotton hoodie with embroidered Campus Hive crest. Available in M, L, XL. Perfect for late-night study sessions and rainy days.",
        specs: {
            "Condition": "New",
            "Material": "100% Cotton",
            "Sizes": "M, L, XL",
            "Color": "Deep Black",
            "Fit": "Relaxed"
        },
        postedDate: "3 days ago",
        views: 62,
        reviews: [],
        negotiable: true,
        minPrice: 10000,
        createdAt: "2026-01-22T11:00:00Z",
        updatedAt: "2026-02-10T16:40:00Z",
        inventory: 24,
        fulfillment: {
            delivery: true,
            pickup: true,
            pickupLocation: "Campus Hive Storefront"
        },
        paymentMethods: ["cash", "transfer", "card"],
        visibility: "public",
        isFeatured: false,
        ...campusHiveSeller
    },
    {
        id: 5,
        listingCode: "LST-1005-CH",
        slug: "meal-prep-combo-pack-5-days",
        status: "active",
        route: "/listings/5",
        title: "Meal Prep Combo Pack (5 Days)",
        price: 15000,
        image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80",
        images: [
            "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80"
        ],
        category: "Food & Provisions",
        recommendedCount: 18,
        notRecommendedCount: 1,
        location: "ABU Main Campus",
        condition: "New",
        tags: ["meal prep", "food", "weekly", "combo"],
        description: "Five-day meal prep combo with balanced portions. Includes rice, protein, veggies, and a rotating weekly menu. Freshly prepared each morning.",
        specs: {
            "Condition": "New",
            "Servings": "5 days",
            "Diet": "Balanced",
            "Pickup": "Daily 7am - 9am",
            "Packaging": "Sealed containers"
        },
        postedDate: "1 day ago",
        views: 140,
        reviews: [],
        negotiable: false,
        createdAt: "2026-02-26T06:30:00Z",
        updatedAt: "2026-03-01T07:05:00Z",
        inventory: 40,
        fulfillment: {
            delivery: false,
            pickup: true,
            pickupLocation: "Cafe Pickup Point"
        },
        paymentMethods: ["cash", "transfer"],
        visibility: "campus-only",
        isFeatured: true,
        ...campusHiveSeller
    }
];

export const getAllListings = () => LISTINGS_DB;
export const getListingById = (id: number) => LISTINGS_DB.find((listing) => listing.id === id);
export const getListingsBySellerId = (sellerId: string) => LISTINGS_DB.filter((listing) => listing.sellerId === sellerId);
