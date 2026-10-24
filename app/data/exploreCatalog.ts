export type ExploreCategory =
  | "All"
  | "Electronics"
  | "Fashion"
  | "Books & Academic Supplies"
  | "Hostel Essentials"
  | "Food"
  | "Beauty"
  | "Sports"
  | "Accessories"
  | "Services";

export const EXPLORE_CATEGORIES: ExploreCategory[] = [
  "All",
  "Electronics",
  "Fashion",
  "Books & Academic Supplies",
  "Hostel Essentials",
  "Food",
  "Beauty",
  "Sports",
  "Accessories",
  "Services",
];

export const CAMPUS_LANDMARKS = [
  "All Landmarks",
  "Main Gate",
  "University Main Library",
  "Faculty of Engineering",
  "Student Centre",
  "Hostel Area",
  "Faculty of Science",
  "Phase II Lecture Theatre",
  "Annex Campus",
] as const;

export type ExploreItemType = "product" | "service";
export type ExploreSellerType =
  | "verified_student"
  | "student_store"
  | "approved_business";

export type ExploreCondition = "New" | "Like New" | "Good" | "Used";

export interface ExploreListingItem {
  id: number | string;
  title: string;
  price: number;
  priceFormatted: string;
  category: Exclude<ExploreCategory, "All">;
  itemType: ExploreItemType;
  condition?: ExploreCondition;
  conditionTone?: "neutral" | "green";
  landmark: string;
  sellerName: string;
  sellerHandle: string;
  sellerType: ExploreSellerType;
  imageUrl: string;
  href: string;
  createdAtTimestamp: number;
  keywords: string[];
  serviceRateLabel?: string;
}

export const EXPLORE_LISTINGS: ExploreListingItem[] = [
  {
    id: 101,
    title: "HP EliteBook 840 G5",
    price: 185000,
    priceFormatted: "₦185,000",
    category: "Electronics",
    itemType: "product",
    condition: "Used",
    conditionTone: "neutral",
    landmark: "Suleiman Hall",
    sellerName: "Tunde Bello",
    sellerHandle: "legacy-seller",
    sellerType: "verified_student",
    imageUrl:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80",
    href: "/listings/101",
    createdAtTimestamp: 1760630000000,
    keywords: ["laptop", "hp", "elitebook", "coding", "computer"],
  },
  {
    id: 102,
    title: "Casio fx-991EX Scientific Calculator",
    price: 8500,
    priceFormatted: "₦8,500",
    category: "Books & Academic Supplies",
    itemType: "product",
    condition: "Like New",
    conditionTone: "green",
    landmark: "Suleiman Hall",
    sellerName: "Tunde Bello",
    sellerHandle: "legacy-seller",
    sellerType: "verified_student",
    imageUrl:
      "https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=600&auto=format&fit=crop&q=80",
    href: "/listings/102",
    createdAtTimestamp: 1760629000000,
    keywords: ["calculator", "casio", "engineering", "math", "exam"],
  },
  {
    id: 105,
    title: "JBL Tune 510BT Wireless Headphones",
    price: 12000,
    priceFormatted: "₦12,000",
    category: "Electronics",
    itemType: "product",
    condition: "New",
    conditionTone: "neutral",
    landmark: "Faculty of Engineering",
    sellerName: "Tech Corner",
    sellerHandle: "tech-corner",
    sellerType: "student_store",
    imageUrl:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
    href: "/listings/105",
    createdAtTimestamp: 1760628000000,
    keywords: ["jbl", "headphones", "audio", "bluetooth", "earpods"],
  },
  {
    id: 104,
    title: "18-Inch Rechargeable Standing Fan",
    price: 15000,
    priceFormatted: "₦15,000",
    category: "Hostel Essentials",
    itemType: "product",
    condition: "Good",
    conditionTone: "neutral",
    landmark: "Hostel Area",
    sellerName: "Tunde Bello",
    sellerHandle: "legacy-seller",
    sellerType: "verified_student",
    imageUrl:
      "https://images.unsplash.com/photo-1618941716939-553df3c6c278?w=600&auto=format&fit=crop&q=80",
    href: "/listings/104",
    createdAtTimestamp: 1760627000000,
    keywords: ["fan", "standing fan", "hostel", "cooling", "rechargeable"],
  },
  {
    id: 103,
    title: "Engineering Thermodynamics & Fluid Mechanics Pack",
    price: 4000,
    priceFormatted: "₦4,000",
    category: "Books & Academic Supplies",
    itemType: "product",
    condition: "Good",
    conditionTone: "neutral",
    landmark: "Kongo Campus",
    sellerName: "Kongo Scholars Bookshop",
    sellerHandle: "kongo-scholars",
    sellerType: "approved_business",
    imageUrl:
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80",
    href: "/listings/103",
    createdAtTimestamp: 1760626000000,
    keywords: ["textbook", "thermodynamics", "books", "engineering", "200L"],
  },
  {
    id: 106,
    title: "Rechargeable LED Study Desk Lamp",
    price: 6500,
    priceFormatted: "₦6,500",
    category: "Hostel Essentials",
    itemType: "product",
    condition: "Like New",
    conditionTone: "green",
    landmark: "Hostel Area",
    sellerName: "Tunde Bello",
    sellerHandle: "legacy-seller",
    sellerType: "verified_student",
    imageUrl:
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop&q=80",
    href: "/listings/106",
    createdAtTimestamp: 1760625000000,
    keywords: ["lamp", "reading lamp", "night class", "hostel", "led"],
  },
  {
    id: 107,
    title: "6kg Camping Gas Cylinder + Stainless Burner",
    price: 19500,
    priceFormatted: "₦19,500",
    category: "Hostel Essentials",
    itemType: "product",
    condition: "Used",
    conditionTone: "neutral",
    landmark: "Main Gate",
    sellerName: "Tech Corner",
    sellerHandle: "tech-corner",
    sellerType: "student_store",
    imageUrl:
      "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80",
    href: "/listings/107",
    createdAtTimestamp: 1760624000000,
    keywords: ["gas", "cylinder", "cooking", "hostel", "burner"],
  },
  {
    id: 108,
    title: "Nike Air Force 1 Low White (EUR 42)",
    price: 24000,
    priceFormatted: "₦24,000",
    category: "Fashion",
    itemType: "product",
    condition: "New",
    conditionTone: "neutral",
    landmark: "Student Centre",
    sellerName: "Campus Closet",
    sellerHandle: "campus-closet",
    sellerType: "student_store",
    imageUrl:
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&auto=format&fit=crop&q=80",
    href: "/listings/108",
    createdAtTimestamp: 1760623000000,
    keywords: ["sneakers", "shoes", "nike", "fashion", "footwear"],
  },
  {
    id: 109,
    title: "Graphic Design & Event Flyer Studio",
    price: 2500,
    priceFormatted: "from ₦2,500",
    serviceRateLabel: "Per design",
    category: "Services",
    itemType: "service",
    landmark: "Student Centre",
    sellerName: "The Print Hub",
    sellerHandle: "the-print-hub",
    sellerType: "approved_business",
    imageUrl:
      "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=600&auto=format&fit=crop&q=80",
    href: "/listings/109",
    createdAtTimestamp: 1760622000000,
    keywords: ["graphic design", "flyer", "logo", "poster", "service"],
  },
  {
    id: 110,
    title: "Laptop OS Install & Engineering CAD Setup",
    price: 3500,
    priceFormatted: "from ₦3,500",
    serviceRateLabel: "Same-day setup",
    category: "Services",
    itemType: "service",
    landmark: "Faculty of Engineering",
    sellerName: "Tech Corner",
    sellerHandle: "tech-corner",
    sellerType: "student_store",
    imageUrl:
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop&q=80",
    href: "/listings/110",
    createdAtTimestamp: 1760621000000,
    keywords: ["software", "autocad", "matlab", "windows", "setup"],
  },
  {
    id: 111,
    title: "Thesis Printing, Spiral Binding & CAD Plotting",
    price: 1500,
    priceFormatted: "from ₦1,500",
    serviceRateLabel: "Same-day turnaround",
    category: "Services",
    itemType: "service",
    landmark: "Student Centre",
    sellerName: "The Print Hub",
    sellerHandle: "the-print-hub",
    sellerType: "approved_business",
    imageUrl:
      "https://images.unsplash.com/photo-1562654501-a0ccc0fc3fb1?w=600&auto=format&fit=crop&q=80",
    href: "/listings/111",
    createdAtTimestamp: 1760620000000,
    keywords: ["printing", "binding", "project", "thesis", "cad"],
  },
  {
    id: 112,
    title: "Heavyweight ABU Department Varsity Hoodie",
    price: 11500,
    priceFormatted: "₦11,500",
    category: "Fashion",
    itemType: "product",
    condition: "New",
    conditionTone: "neutral",
    landmark: "Phase II Lecture Theatre",
    sellerName: "Campus Closet",
    sellerHandle: "campus-closet",
    sellerType: "student_store",
    imageUrl:
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&auto=format&fit=crop&q=80",
    href: "/listings/112",
    createdAtTimestamp: 1760619000000,
    keywords: ["hoodie", "jacket", "sweater", "fashion", "varsity"],
  },
  {
    id: 113,
    title: "ICAN Foundation Stage Study Pack & Past Questions",
    price: 8000,
    priceFormatted: "₦8,000",
    category: "Books & Academic Supplies",
    itemType: "product",
    condition: "New",
    conditionTone: "neutral",
    landmark: "Kongo Campus",
    sellerName: "Kongo Scholars Bookshop",
    sellerHandle: "kongo-scholars",
    sellerType: "approved_business",
    imageUrl:
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80",
    href: "/listings/113",
    createdAtTimestamp: 1760618000000,
    keywords: ["ican", "accounting", "books", "kongo", "past questions"],
  },
  {
    id: 114,
    title: "Minimalist Waterproof 15.6-Inch Laptop Backpack",
    price: 9500,
    priceFormatted: "₦9,500",
    category: "Accessories",
    itemType: "product",
    condition: "Like New",
    conditionTone: "green",
    landmark: "Student Centre",
    sellerName: "Campus Closet",
    sellerHandle: "campus-closet",
    sellerType: "student_store",
    imageUrl:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80",
    href: "/listings/114",
    createdAtTimestamp: 1760617000000,
    keywords: ["bag", "backpack", "laptop bag", "accessories"],
  },
  {
    id: 115,
    title: "Anker PowerCore 20,000mAh Fast Power Bank",
    price: 18000,
    priceFormatted: "₦18,000",
    category: "Electronics",
    itemType: "product",
    condition: "New",
    conditionTone: "neutral",
    landmark: "Faculty of Engineering",
    sellerName: "Tech Corner",
    sellerHandle: "tech-corner",
    sellerType: "student_store",
    imageUrl:
      "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600&auto=format&fit=crop&q=80",
    href: "/listings/115",
    createdAtTimestamp: 1760616000000,
    keywords: ["powerbank", "anker", "charging", "battery", "electronics"],
  },
  {
    id: 116,
    title: "Vintage Denim Trucker Jacket (Medium)",
    price: 8500,
    priceFormatted: "₦8,500",
    category: "Fashion",
    itemType: "product",
    condition: "Good",
    conditionTone: "neutral",
    landmark: "Student Centre",
    sellerName: "Campus Closet",
    sellerHandle: "campus-closet",
    sellerType: "student_store",
    imageUrl:
      "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&auto=format&fit=crop&q=80",
    href: "/listings/116",
    createdAtTimestamp: 1760615000000,
    keywords: ["denim", "jacket", "fashion", "thrift", "campus closet"],
  },
];
