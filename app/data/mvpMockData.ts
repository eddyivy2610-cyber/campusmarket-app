import type { SellerVerificationType } from "./listings";

export interface WantedRequestItem {
  id: string;
  title: string;
  description: string;
  budgetMin: number;
  budgetMax: number;
  category: string;
  campusSlug: string;
  campusShortName: string;
  preferredLandmark: string;
  urgency: "Urgent" | "This Week" | "Flexible";
  status: "Open" | "Matched" | "Fulfilled";
  requesterName: string;
  requesterHandle: string;
  requesterDepartment: string;
  responsesCount: number;
  postedAt: string;
}

export interface StorefrontItem {
  id: string;
  slug: string;
  handle: string;
  name: string;
  tagline: string;
  category: string;
  verificationType: SellerVerificationType;
  campusSlug: string;
  campusShortName: string;
  pickupLandmark: string;
  responseTime: string;
  activeListingsCount: number;
  avatar: string;
  featuredProducts: string[];
}

export const WANTED_REQUESTS_DB: WantedRequestItem[] = [
  {
    id: "want-101",
    title: "Looking for a Casio fx-991EX or fx-991ES Plus scientific calculator",
    description:
      "Need a clean non-programmable Casio scientific calculator before next week's Engineering test. Ready to meet at Engineering Complex or KIL.",
    budgetMin: 9000,
    budgetMax: 14000,
    category: "Academics",
    campusSlug: "abu-zaria-samaru",
    campusShortName: "ABU Samaru",
    preferredLandmark: "Faculty of Engineering Complex",
    urgency: "Urgent",
    status: "Open",
    requesterName: "Faruk Bello",
    requesterHandle: "faruk_engr",
    requesterDepartment: "200L Chemical Engineering",
    responsesCount: 3,
    postedAt: "45 mins ago",
  },
  {
    id: "want-102",
    title: "Need a fairly used standing fan around ₦12,000–₦18,000",
    description:
      "Looking for a working 16-inch or 18-inch standing fan near Suleiman or Ribadu Hostel common area this week.",
    budgetMin: 12000,
    budgetMax: 18000,
    category: "Accomodation",
    campusSlug: "abu-zaria-samaru",
    campusShortName: "ABU Samaru",
    preferredLandmark: "Suleiman & Ribadu Hostel Common Area",
    urgency: "This Week",
    status: "Open",
    requesterName: "Tolu Adeyemi",
    requesterHandle: "tolu_biochem",
    requesterDepartment: "300L Biochemistry",
    responsesCount: 5,
    postedAt: "3 hours ago",
  },
  {
    id: "want-103",
    title: "Searching for CSC 200L Data Structures & C++ course textbooks",
    description:
      "Anyone selling clean secondhand CSC 201 / CSC 203 recommended textbooks or printed lecture compendiums?",
    budgetMin: 3500,
    budgetMax: 7000,
    category: "Academics",
    campusSlug: "abu-zaria-samaru",
    campusShortName: "ABU Samaru",
    preferredLandmark: "Phase II Lecture Theatre Concourse",
    urgency: "This Week",
    status: "Open",
    requesterName: "Khalid Musa",
    requesterHandle: "khalid_cs",
    requesterDepartment: "200L Computer Science",
    responsesCount: 2,
    postedAt: "6 hours ago",
  },
  {
    id: "want-104",
    title: "Looking for an A2 Drawing Board & T-Square in good condition",
    description:
      "Need an A2 technical drawing board with parallel ruler for studio practicals. Can inspect at Samaru Main Gate or Engineering foyer.",
    budgetMin: 8000,
    budgetMax: 12000,
    category: "Academics",
    campusSlug: "abu-zaria-samaru",
    campusShortName: "ABU Samaru",
    preferredLandmark: "Samaru Main Gate",
    urgency: "Flexible",
    status: "Open",
    requesterName: "Hauwa Ibrahim",
    requesterHandle: "hauwa_arch",
    requesterDepartment: "100L Architecture",
    responsesCount: 4,
    postedAt: "1 day ago",
  },
];

export const STOREFRONTS_DB: StorefrontItem[] = [
  {
    id: "store-tunde-bello",
    slug: "tundebello",
    handle: "tundebello",
    name: "Tunde Bello",
    tagline: "Clean student laptops, scientific calculators & study electronics",
    category: "Electronics",
    verificationType: "verified_student",
    campusSlug: "abu-zaria-samaru",
    campusShortName: "ABU Samaru",
    pickupLandmark: "Suleiman Hall",
    responseTime: "~10 mins",
    activeListingsCount: 4,
    avatar: "/category-tech.png",
    featuredProducts: ["HP EliteBook 840 G5", "Casio fx-991EX", "Study Desk Lamp"],
  },
  {
    id: "store-campus-closet",
    slug: "campus-closet",
    handle: "campus-closet",
    name: "Campus Closet",
    tagline: "Affordable fashion finds, vintage denim & sneakers curated for campus life",
    category: "Fashion",
    verificationType: "verified_student",
    campusSlug: "abu-zaria-samaru",
    campusShortName: "ABU Samaru",
    pickupLandmark: "Student Social Centre (SUB)",
    responseTime: "~15 mins",
    activeListingsCount: 5,
    avatar: "/category-fashion.png",
    featuredProducts: ["Vintage Denim Jacket", "Nike Air Pegasus", "Canvas Tote Bag"],
  },
  {
    id: "store-tech-corner",
    slug: "tech-corner",
    handle: "tech-corner",
    name: "Tech Corner",
    tagline: "Tested UK-used laptops, fast NVMe SSD upgrades & genuine phone gear",
    category: "Electronics",
    verificationType: "verified_student",
    campusSlug: "abu-zaria-samaru",
    campusShortName: "ABU Samaru",
    pickupLandmark: "Faculty of Engineering Complex",
    responseTime: "~10 mins",
    activeListingsCount: 4,
    avatar: "/category-tech.png",
    featuredProducts: ["MagSafe 2 Charger", "Anker 20,000mAh", "512GB NVMe SSD"],
  },
  {
    id: "store-the-print-hub",
    slug: "the-print-hub",
    handle: "the-print-hub",
    name: "The Print Hub",
    tagline: "High-speed thesis binding, architectural plotting & student printing",
    category: "Printing & Services",
    verificationType: "verified_business",
    campusSlug: "abu-zaria-samaru",
    campusShortName: "ABU Samaru",
    pickupLandmark: "Student Social Centre (SUB)",
    responseTime: "~5 mins",
    activeListingsCount: 4,
    avatar: "/Frame 560.png",
    featuredProducts: ["Hardcover Thesis Binding", "A1/A2 Plotting", "Event Flyers"],
  },
  {
    id: "store-kongo-scholars",
    slug: "kongo-scholars",
    handle: "kongo-scholars",
    name: "Kongo Scholars Bookshop",
    tagline: "Academic bookshop for Law, Accounting & Administration texts",
    category: "Academics",
    verificationType: "verified_business",
    campusSlug: "abu-zaria-kongo",
    campusShortName: "ABU Kongo",
    pickupLandmark: "Faculty of Law Quadrangle",
    responseTime: "~15 mins",
    activeListingsCount: 4,
    avatar: "/category-furniture.png",
    featuredProducts: ["Constitutional Law Pack", "ICAN Study Packs", "Legal Pads"],
  },
];
