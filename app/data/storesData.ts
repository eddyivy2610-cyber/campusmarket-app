export type StoreBusinessType = "student_owned" | "approved_business";
export type StoreCategory =
  | "All"
  | "Fashion"
  | "Electronics"
  | "Printing & design"
  | "Books & Academic Supplies"
  | "Services"
  | "Food & Catering"
  | "Beauty & Grooming";

export interface StoreListingProduct {
  id: string;
  title: string;
  price: number;
  priceFormatted: string;
  condition: string;
  category: string;
  imageIcon: string; // e.g. "jacket", "laptop", "book", "food"
  description: string;
  available: boolean;
}

export interface StoreListingService {
  id: string;
  title: string;
  rate: number;
  rateFormatted: string;
  turnaroundTime: string;
  category: string;
  description: string;
  available: boolean;
}

export interface StoreProfile {
  id: string;
  slug: string;
  name: string;
  businessType: StoreBusinessType;
  verificationBadgeText: string;
  categoryTags: string[];
  primaryCategory: StoreCategory;
  tagline: string;
  description: string;
  campusName: string;
  landmark: string;
  openingHours: string;
  responseTime: string;
  ratingScore: number;
  reviewsCount: number;
  isFeatured?: boolean;
  featuredPills?: string[];
  avatarBg: string;
  avatarIcon: string;
  coverGradient: string;
  contactHandle: string;
  products: StoreListingProduct[];
  services: StoreListingService[];
}

export const STORES_DATABASE: StoreProfile[] = [
  {
    id: "store-tunde-bello",
    slug: "legacy-seller",
    name: "Tunde Bello",
    businessType: "student_owned",
    verificationBadgeText: "Verified student seller",
    categoryTags: ["Electronics", "Laptops", "Calculators"],
    primaryCategory: "Electronics",
    tagline: "Clean student laptops, scientific calculators, and study electronics.",
    description:
      "Selling clean, tested student laptops, scientific calculators, and study electronics around Suleiman Hall and Faculty of Science. Always open to inspection before payment.",
    campusName: "ABU Samaru Main Campus",
    landmark: "Suleiman Hall",
    openingHours: "Mon – Sat: 9:00 AM – 7:00 PM",
    responseTime: "~10 mins",
    ratingScore: 4.8,
    reviewsCount: 28,
    isFeatured: true,
    featuredPills: ["Laptops", "Calculators", "Chargers"],
    avatarBg: "bg-[#FFF2D9] text-[#7A5210] dark:bg-amber-500/10 dark:text-amber-300",
    avatarIcon: "headphones",
    coverGradient: "from-amber-100/70 via-stone-100 to-amber-50 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900",
    contactHandle: "legacy-seller",
    products: [
      {
        id: "101",
        title: "HP EliteBook 840 G5 (16GB RAM, 256GB SSD)",
        price: 185000,
        priceFormatted: "₦185,000",
        condition: "Used",
        category: "Laptops",
        imageIcon: "laptop",
        description: "Clean UK-used HP EliteBook with backlit keyboard and 5-hour battery life.",
        available: true,
      },
      {
        id: "102",
        title: "Casio fx-991EX ClassWiz Scientific Calculator",
        price: 8500,
        priceFormatted: "₦8,500",
        condition: "Like New",
        category: "Calculators",
        imageIcon: "book",
        description: "Original 552-function ClassWiz scientific calculator with solar + battery.",
        available: true,
      },
      {
        id: "105",
        title: "Rechargeable LED Study Desk Lamp",
        price: 6000,
        priceFormatted: "₦6,000",
        condition: "Like New",
        category: "Hostel Gear",
        imageIcon: "zap",
        description: "Touch dimmer study lamp with 3 brightness modes and USB charging.",
        available: true,
      },
    ],
    services: [
      {
        id: "108",
        title: "1-on-1 Python, C++ & Engineering Math Tutoring",
        rate: 2500,
        rateFormatted: "₦2,500",
        turnaroundTime: "Per session",
        category: "Academic Tutoring",
        description: "Practical exam prep and coding sessions at Kashim Ibrahim Library.",
        available: true,
      },
    ],
  },
  {
    id: "store-campus-closet",
    slug: "campus-closet",
    name: "Campus Closet",
    businessType: "student_owned",
    verificationBadgeText: "Verified student seller",
    categoryTags: ["Fashion", "Thrift", "Accessories"],
    primaryCategory: "Fashion",
    tagline: "Affordable fashion finds, curated for campus life.",
    description:
      "Student-run vintage thrift and curated campus streetwear. Hand-picked quality denim, everyday sneakers, and essentials tailored for university students on a budget.",
    campusName: "ABU Samaru Main Campus",
    landmark: "Student Social Centre (SUB)",
    openingHours: "Mon – Sat: 10:00 AM – 7:00 PM",
    responseTime: "~15 mins",
    ratingScore: 4.9,
    reviewsCount: 42,
    isFeatured: true,
    featuredPills: ["Jackets", "Sneakers", "Bags"],
    avatarBg: "bg-[#EFE8DD] text-[#6B5841] dark:bg-white/10 dark:text-[#FFE182]",
    avatarIcon: "shirt",
    coverGradient: "from-amber-100/70 via-stone-100 to-amber-50 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900",
    contactHandle: "campuscloset",
    products: [
      {
        id: "106",
        title: "Vintage Denim Trucker Jacket (Medium)",
        price: 8500,
        priceFormatted: "₦8,500",
        condition: "Thrift (Mint)",
        category: "Jackets",
        imageIcon: "shirt",
        description: "Heavyweight 100% cotton washed blue denim. Clean buttons, zero tears.",
        available: true,
      },
      {
        id: "prod-102",
        title: "Campus Oversized Fleece Hoodie (Grey/Black)",
        price: 7200,
        priceFormatted: "₦7,200",
        condition: "New",
        category: "Hoodies",
        imageIcon: "shirt",
        description: "Soft brushed fleece cotton with ribbed cuffs and kangaroo pouch pocket.",
        available: true,
      },
      {
        id: "prod-103",
        title: "Nike Air Pegasus '89 (Size 43)",
        price: 14000,
        priceFormatted: "₦14,000",
        condition: "Like New",
        category: "Sneakers",
        imageIcon: "footprints",
        description: "Tested clean sole, fresh laces. Great everyday walking shoe on campus.",
        available: true,
      },
      {
        id: "prod-104",
        title: "Heavyweight Canvas Laptop Tote Bag",
        price: 3500,
        priceFormatted: "₦3,500",
        condition: "New",
        category: "Bags",
        imageIcon: "briefcase",
        description: "Fits up to 15-inch laptop and three lecture compendiums with inner zipper.",
        available: true,
      },
    ],
    services: [
      {
        id: "serv-101",
        title: "Custom Denim Embroidery & Patching",
        rate: 2000,
        rateFormatted: "₦2,000",
        turnaroundTime: "24 hours",
        category: "Tailoring",
        description: "Add personalized initials, crests, or custom distressed patches to your jackets.",
        available: true,
      },
    ],
  },
  {
    id: "store-tech-corner",
    slug: "tech-corner",
    name: "Tech Corner",
    businessType: "student_owned",
    verificationBadgeText: "Verified student seller",
    categoryTags: ["Electronics", "Accessories", "Gadgets"],
    primaryCategory: "Electronics",
    tagline: "Tested UK-used laptops, fast NVMe SSD upgrades, and genuine phone gear.",
    description:
      "Reliable student tech hub located near Engineering and Science faculties. We specialize in verified laptop hardware, battery swaps, and original accessories.",
    campusName: "ABU Samaru Main Campus",
    landmark: "Faculty of Engineering Complex",
    openingHours: "Mon – Fri: 9:00 AM – 6:00 PM",
    responseTime: "~10 mins",
    ratingScore: 4.8,
    reviewsCount: 64,
    avatarBg: "bg-[#E6ECF5] text-[#2C4A75] dark:bg-blue-500/10 dark:text-blue-300",
    avatarIcon: "headphones",
    coverGradient: "from-blue-100/70 via-slate-100 to-indigo-50 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900",
    contactHandle: "techcorner",
    products: [
      {
        id: "prod-201",
        title: "Apple 45W MagSafe 2 Power Adapter (T-Tip)",
        price: 12500,
        priceFormatted: "₦12,500",
        condition: "Original Tested",
        category: "Chargers",
        imageIcon: "zap",
        description: "Clean original Apple magnetic charger for MacBook Air 11/13-inch.",
        available: true,
      },
      {
        id: "110",
        title: "Anker PowerCore 20,000mAh Dual-Port Power Bank",
        price: 18000,
        priceFormatted: "₦18,000",
        condition: "New (Sealed)",
        category: "Power Banks",
        imageIcon: "battery-charging",
        description: "Charges your smartphone up to 5 full times. Essential for hostel power outages.",
        available: true,
      },
      {
        id: "prod-203",
        title: "Kingston 512GB NVMe M.2 High-Speed SSD",
        price: 24000,
        priceFormatted: "₦24,000",
        condition: "Brand New",
        category: "Storage",
        imageIcon: "hard-drive",
        description: "PCIe 3.0 NVMe, read speeds up to 2100MB/s. Includes free OS clone on campus.",
        available: true,
      },
    ],
    services: [
      {
        id: "serv-201",
        title: "Laptop OS Install & Engineering CAD Software Setup",
        rate: 3500,
        rateFormatted: "₦3,500",
        turnaroundTime: "Same day (2 hours)",
        category: "Software Setup",
        description: "Clean Windows 11 installation, driver updates, AutoCAD, MATLAB, and Revit setup.",
        available: true,
      },
    ],
  },
  {
    id: "store-the-print-hub",
    slug: "the-print-hub",
    name: "The Print Hub",
    businessType: "approved_business",
    verificationBadgeText: "Campus seller",
    categoryTags: ["Printing & design", "Services", "Academics"],
    primaryCategory: "Printing & design",
    tagline: "High-speed thesis binding, architectural plotting, and student printing.",
    description:
      "Commercial printing centre on Samaru campus. Fast turnarounds on undergraduate final year projects, A1/A2 architectural drawings, and colour prints.",
    campusName: "ABU Samaru Main Campus",
    landmark: "Student Social Centre (SUB)",
    openingHours: "Mon – Sat: 8:00 AM – 7:30 PM",
    responseTime: "~5 mins",
    ratingScore: 4.7,
    reviewsCount: 112,
    avatarBg: "bg-[#E2ECE4] text-[#295634] dark:bg-emerald-500/10 dark:text-emerald-300",
    avatarIcon: "printer",
    coverGradient: "from-emerald-100/70 via-teal-50 to-neutral-100 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900",
    contactHandle: "theprinthub",
    products: [
      {
        id: "prod-301",
        title: "Standard Spiral-Bound Lecture Compendiums",
        price: 1800,
        priceFormatted: "₦1,800",
        condition: "New",
        category: "Printing",
        imageIcon: "file-text",
        description: "High-contrast 80gsm paper with durable PVC clear protective covers.",
        available: true,
      },
      {
        id: "prod-302",
        title: "Hardcover Gold-Foil Embossed Thesis Binding (ABU Standard)",
        price: 5500,
        priceFormatted: "₦5,500",
        condition: "New",
        category: "Binding",
        imageIcon: "book-open",
        description: "Meets official ABU School of Postgraduate Studies and Faculty requirements.",
        available: true,
      },
    ],
    services: [
      {
        id: "serv-301",
        title: "A1 & A2 Architectural Blueprint Plotting",
        rate: 2500,
        rateFormatted: "₦2,500",
        turnaroundTime: "20 mins",
        category: "Plotting",
        description: "Colour and monochrome line drawing plots for architecture and engineering juries.",
        available: true,
      },
      {
        id: "107",
        title: "Departmental Event Banner & Flyer Graphic Design",
        rate: 4000,
        rateFormatted: "₦4,000",
        turnaroundTime: "Within 24 hours",
        category: "Graphic Design",
        description: "Clean modern flyer artwork optimized for social media and physical poster boards.",
        available: true,
      },
    ],
  },
  {
    id: "store-kongo-scholars",
    slug: "kongo-scholars",
    name: "Kongo Scholars Bookshop",
    businessType: "approved_business",
    verificationBadgeText: "Campus seller",
    categoryTags: ["Books & Academic Supplies", "Law", "Accounting"],
    primaryCategory: "Books & Academic Supplies",
    tagline: "Academic bookshop for Law, Accounting & Administration texts.",
    description:
      "Campus vendor for Faculty of Law and Institute of Administration texts. Complete case law compendiums, revised statute booklets, and ICAN preparation materials.",
    campusName: "ABU Kongo Campus",
    landmark: "Faculty of Law Quadrangle",
    openingHours: "Mon – Fri: 8:30 AM – 5:30 PM",
    responseTime: "~15 mins",
    ratingScore: 4.8,
    reviewsCount: 79,
    avatarBg: "bg-[#EFE9F5] text-[#472E68] dark:bg-purple-500/10 dark:text-purple-300",
    avatarIcon: "book",
    coverGradient: "from-purple-100/60 via-indigo-50 to-neutral-100 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900",
    contactHandle: "kongoscholars",
    products: [
      {
        id: "prod-501",
        title: "Nigerian Constitutional Law (Prof. B.O. Nwabueze)",
        price: 6500,
        priceFormatted: "₦6,500",
        condition: "New Edition",
        category: "Law Books",
        imageIcon: "book",
        description: "Required textbook for 200L & 300L Public Law students. Clear print.",
        available: true,
      },
      {
        id: "prod-502",
        title: "ICAN Foundation Stage Accounting Study Pack & Past Questions",
        price: 8000,
        priceFormatted: "₦8,000",
        condition: "Brand New",
        category: "Accounting",
        imageIcon: "book-open",
        description: "Official syllabus with worked examination solutions up to November diet.",
        available: true,
      },
      {
        id: "prod-503",
        title: "Pre-ruled Legal Drafting Pad (500 Sheets)",
        price: 3200,
        priceFormatted: "₦3,200",
        condition: "New",
        category: "Stationery",
        imageIcon: "file-text",
        description: "Numbered margins and heavy bleed-resistant sheets for court case summaries.",
        available: true,
      },
    ],
    services: [
      {
        id: "serv-501",
        title: "Special Law Compendium Bulk Ordering",
        rate: 5000,
        rateFormatted: "From ₦5,000",
        turnaroundTime: "2 days",
        category: "Book Sourcing",
        description: "Can order hard-to-find legal texts from Lagos and Abuja publishing houses.",
        available: true,
      },
    ],
  },
];
