export interface Profile {
    id: string;
    name: string;
    handle: string;
    description: string;
    avatar: string;
    rating: number;
    followers: number;
    tags: string[];
}

export const PROFILES: Profile[] = [
    {
        id: "1",
        name: "Emma's Ceramics",
        handle: "@emmacreates",
        description: "Handmade pottery & home decor meant for students.",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80",
        rating: 4.8,
        followers: 120,
        tags: ["art", "pottery", "decor", "handmade"]
    },
    {
        id: "2",
        name: "Vintage Treasures",
        handle: "@vintage_hunter",
        description: "Curated antiques & collectibles from around campus.",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80",
        rating: 4.5,
        followers: 350,
        tags: ["vintage", "antiques", "fashion", "clothes"]
    },
    {
        id: "3",
        name: "Digital Art Studio",
        handle: "@pixel_art",
        description: "Modern digital prints & designs for your dorm.",
        avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=100&q=80",
        rating: 5.0,
        followers: 89,
        tags: ["art", "digital", "design", "prints"]
    },
    {
        id: "4",
        name: "Woodwork Wonders",
        handle: "@woodworks",
        description: "Custom wooden furniture & decor.",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80",
        rating: 4.2,
        followers: 45,
        tags: ["furniture", "wood", "custom", "decor"]
    },
    {
        id: "5",
        name: "Silver & Stone",
        handle: "@silverstone",
        description: "Handcrafted jewelry & accessories.",
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=100&q=80",
        rating: 4.9,
        followers: 210,
        tags: ["jewelry", "fashion", "accessories", "silver"]
    },
    {
        id: "6",
        name: "Organic Essentials",
        handle: "@organic_life",
        description: "Natural skincare & wellness products.",
        avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=100&q=80",
        rating: 4.6,
        followers: 150,
        tags: ["skincare", "wellness", "organic", "beauty"]
    },
    {
        id: "7",
        name: "Sweet Creations",
        handle: "@sweet_treats",
        description: "Artisanal baked goods & treats.",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80",
        rating: 5.0,
        followers: 500,
        tags: ["food", "bakery", "sweets", "cakes"]
    },
    {
        id: "8",
        name: "Tech Innovations",
        handle: "@tech_geek",
        description: "Unique tech gadgets & accessories.",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80",
        rating: 4.4,
        followers: 300,
        tags: ["tech", "gadgets", "electronics", "accessories"]
    },
    {
        id: "9",
        name: "Sustainable Living",
        handle: "@eco_friendly",
        description: "Eco-friendly products & zero waste alternatives.",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80",
        rating: 4.7,
        followers: 180,
        tags: ["eco", "sustainable", "green", "zero waste"]
    }
];
