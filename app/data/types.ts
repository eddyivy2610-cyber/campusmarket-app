export interface Review {
    id: string;
    orderId?: string; // Links review to a specific order
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
    category: "Electronics" | "Academics" | "Accomodation" | "Fashion" | "Personal Care" | "Sports & Fitness" | "Entertainment" | "Transport" | "Services" | "Food & Provisions";
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
    negotiable?: boolean;
    minPrice?: number;
    offer?: {
        salesPeriod: string;
        promoPeriod: string;
    };
}
