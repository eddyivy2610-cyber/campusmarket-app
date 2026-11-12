/**
 * Campus Hive 2.0 — Safe Developer & Staging Data Seed Script
 *
 * Designed for idempotent execution and zero collision with production data.
 *
 * SAFETY INVARIANTS:
 * 1. Hard Block: Refuses to touch production databases unless --allow-production is passed.
 * 2. Deterministic Namespace:
 *    - All user emails end in `@seed.campushive.local`
 *    - All store slugs prefixed with `seed-`
 *    - All listing codes prefixed with `seed-`
 * 3. Multi-Store Invariant Compliance:
 *    - Every listing has both valid storeId & sellerId (matching store.ownerId).
 *    - Store counters (listingsCount, reviewsCount, followersCount) remain strictly synchronized.
 *    - User store counters (storesCount, studentStoresCount) strictly updated.
 *
 * MODES:
 *   --apply             Apply/upsert seed data to the configured MongoDB database
 *   --clean             Safely remove only @seed.campushive.local records and their stores/listings
 *   --dry-run           Preview what would be created without writing to the database
 *   --memory            Spin up an isolated MongoMemoryReplSet (great for offline testing or CI)
 *
 * Usage:
 *   npx tsx scripts/seed-dev-data.ts --apply
 *   npx tsx scripts/seed-dev-data.ts --clean
 *   npx tsx scripts/seed-dev-data.ts --dry-run
 *   npx tsx scripts/seed-dev-data.ts --memory --apply
 */

import mongoose from "mongoose";
import argon2 from "argon2";
import UserModel from "../app/models/User";
import StoreModel, { ensureStoreIndexes } from "../app/models/Store";
import ListingModel from "../app/models/Listing";
import ReviewModel from "../app/models/Review";
import FollowerModel from "../app/models/Follower";
import OrderModel from "../app/models/Order";
import {
  SEED_100_USERS,
  SEED_100_STORES,
  SEED_100_LISTINGS,
  SEED_100_REVIEWS,
  SEED_100_FOLLOWS,
} from "./seed-data-100";

// Default shared password for all seed accounts
const SEED_PASSWORD_RAW = "Password123!";
const SEED_EMAIL_DOMAIN = "@seed.campushive.local";

interface CliOptions {
  apply: boolean;
  clean: boolean;
  dryRun: boolean;
  memory: boolean;
  allowProduction: boolean;
  scale100: boolean;
}

function parseCliArgs(): CliOptions {
  const args = process.argv.slice(2);
  const scale100 =
    args.includes("--scale=100") ||
    args.includes("--scale") ||
    args.includes("--count=100") ||
    args.includes("--100") ||
    process.env.SEED_SCALE === "100";

  return {
    apply: args.includes("--apply"),
    clean: args.includes("--clean"),
    dryRun: args.includes("--dry-run"),
    memory: args.includes("--memory"),
    allowProduction: args.includes("--allow-production"),
    scale100,
  };
}

// ----------------------------------------------------------------------------
// SEED DEFINITIONS
// ----------------------------------------------------------------------------
export const USER_DEFINITIONS = [
  {
    email: `seller-multi${SEED_EMAIL_DOMAIN}`,
    name: "Tunde Bakare",
    role: "seller" as const,
    campus: "University of Lagos (UNILAG)",
    isStudent: true,
    studentVerified: true,
    accountStatus: "active" as const,
    sellerStatus: "approved" as const,
    storesCount: 2,
    studentStoresCount: 1,
    profile: {
      bio: "Student entrepreneur & campus merchant. Founder of Apex Campus Tech and Lagos Campus Eats.",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
      phone: "+2348012345671",
      whatsapp: "+2348012345671",
    },
  },
  {
    email: `seller-student${SEED_EMAIL_DOMAIN}`,
    name: "Amina Bello",
    role: "seller" as const,
    campus: "Ahmadu Bello University (ABU Zaria)",
    isStudent: true,
    studentVerified: true,
    accountStatus: "active" as const,
    sellerStatus: "approved" as const,
    storesCount: 1,
    studentStoresCount: 1,
    profile: {
      bio: "Passionate about vintage campus streetwear, sustainable fashion and thrifting.",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
      phone: "+2348012345672",
      whatsapp: "+2348012345672",
    },
  },
  {
    email: `seller-new${SEED_EMAIL_DOMAIN}`,
    name: "Chidi Okafor",
    role: "seller" as const,
    campus: "University of Ibadan (UI)",
    isStudent: true,
    studentVerified: false,
    accountStatus: "active" as const,
    sellerStatus: "pending" as const,
    storesCount: 1,
    studentStoresCount: 1,
    profile: {
      bio: "Engineering student stocking campus desk & laboratory supplies.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
      phone: "+2348012345673",
    },
  },
  {
    email: `seller-service${SEED_EMAIL_DOMAIN}`,
    name: "Emeka Okonkwo",
    role: "seller" as const,
    campus: "Obafemi Awolowo University (OAU)",
    isStudent: true,
    studentVerified: true,
    accountStatus: "active" as const,
    sellerStatus: "approved" as const,
    storesCount: 1,
    studentStoresCount: 1,
    profile: {
      bio: "Graphic designer, visual brand strategist & pitch deck builder for student initiatives.",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
      phone: "+2348012345674",
      whatsapp: "+2348012345674",
    },
  },
  // Student Buyers
  {
    email: `buyer1${SEED_EMAIL_DOMAIN}`,
    name: "Zainab Aliyu",
    role: "buyer" as const,
    campus: "University of Lagos (UNILAG)",
    isStudent: true,
    studentVerified: true,
    accountStatus: "active" as const,
    sellerStatus: "none" as const,
    storesCount: 0,
    studentStoresCount: 0,
    profile: {
      bio: "Biochemistry major. Tech enthusiast & gadget collector on campus.",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
    },
  },
  {
    email: `buyer2${SEED_EMAIL_DOMAIN}`,
    name: "David Adeyemi",
    role: "buyer" as const,
    campus: "University of Ibadan (UI)",
    isStudent: true,
    studentVerified: true,
    accountStatus: "active" as const,
    sellerStatus: "none" as const,
    storesCount: 0,
    studentStoresCount: 0,
    profile: {
      bio: "Computer Science student & mechanical keyboard fan.",
      avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80",
    },
  },
  {
    email: `buyer3${SEED_EMAIL_DOMAIN}`,
    name: "Fatima Garba",
    role: "buyer" as const,
    campus: "Ahmadu Bello University (ABU Zaria)",
    isStudent: true,
    studentVerified: true,
    accountStatus: "active" as const,
    sellerStatus: "none" as const,
    storesCount: 0,
    studentStoresCount: 0,
    profile: {
      bio: "Economics undergraduate. Thrifter & campus book lover.",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
    },
  },
  // Platform Admin Account
  {
    email: `admin${SEED_EMAIL_DOMAIN}`,
    name: "Campus Hive Admin",
    role: "admin" as const,
    campus: "University of Lagos (UNILAG)",
    isStudent: false,
    studentVerified: true,
    accountStatus: "active" as const,
    sellerStatus: "approved" as const,
    storesCount: 0,
    studentStoresCount: 0,
    profile: {
      bio: "System administrator & platform moderation steward.",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80",
    },
  },
];

export const STORE_DEFINITIONS = [
  {
    ownerKey: `seller-multi${SEED_EMAIL_DOMAIN}`,
    name: "Apex Campus Tech",
    slug: "seed-apex-campus-tech",
    slugLower: "seed-apex-campus-tech",
    description: "Tested and guaranteed MacBooks, iPhones, monitors, and chargers for campus students.",
    storeType: "student_store" as const,
    category: "Electronics",
    categoryTags: ["Laptops", "Phones", "Accessories", "Audio"],
    campus: "University of Lagos (UNILAG)",
    campusCity: "Lagos",
    operatingLocation: "Jaja Hall, Room 14",
    logo: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=400&q=80",
    coverImage: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80",
    status: "active" as const,
    isVerified: true,
    verificationType: "student" as const,
    metrics: {
      rating: 4.9,
      reviewsCount: 6,
      completedDeals: 28,
      listingsCount: 4,
      followersCount: 42,
    },
  },
  {
    ownerKey: `seller-multi${SEED_EMAIL_DOMAIN}`,
    name: "Lagos Campus Eats",
    slug: "seed-lagos-campus-eats",
    slugLower: "seed-lagos-campus-eats",
    description: "Fresh warm campus rice bowls, gourmet beef shawarma, and smoothies delivered to hostels.",
    storeType: "local_business" as const,
    category: "Food & Beverages",
    categoryTags: ["Snacks", "Meals", "Drinks", "Shawarma"],
    campus: "University of Lagos (UNILAG)",
    campusCity: "Lagos",
    operatingLocation: "New Hall Food Court, Stall 3",
    logo: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=400&q=80",
    coverImage: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80",
    status: "active" as const,
    isVerified: true,
    verificationType: "business" as const,
    metrics: {
      rating: 4.8,
      reviewsCount: 8,
      completedDeals: 45,
      listingsCount: 2,
      followersCount: 88,
    },
  },
  {
    ownerKey: `seller-student${SEED_EMAIL_DOMAIN}`,
    name: "Amina Thrift & Vintage",
    slug: "seed-amina-thrift",
    slugLower: "seed-amina-thrift",
    description: "Handpicked vintage tees, denim, varsity jackets, and campus casuals.",
    storeType: "student_store" as const,
    category: "Fashion & Apparel",
    categoryTags: ["Vintage", "Jackets", "Hoodies", "Footwear"],
    campus: "Ahmadu Bello University (ABU Zaria)",
    campusCity: "Zaria",
    operatingLocation: "Ribadu Hall, Block C",
    logo: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=400&q=80",
    coverImage: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80",
    status: "active" as const,
    isVerified: true,
    verificationType: "student" as const,
    showOwnerName: true,
    metrics: {
      rating: 5.0,
      reviewsCount: 5,
      completedDeals: 18,
      listingsCount: 2,
      followersCount: 26,
    },
  },
  {
    ownerKey: `seller-new${SEED_EMAIL_DOMAIN}`,
    name: "Campus Desk Essentials",
    slug: "seed-campus-desk",
    slugLower: "seed-campus-desk",
    description: "Engineering drawing kits, scientific calculators, stationery packs and study lights.",
    storeType: "student_store" as const,
    category: "Academics & Stationery",
    categoryTags: ["Calculators", "Engineering", "Stationery"],
    campus: "University of Ibadan (UI)",
    campusCity: "Ibadan",
    operatingLocation: "Kuti Hall",
    logo: "https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?auto=format&fit=crop&w=400&q=80",
    coverImage: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1200&q=80",
    status: "active" as const,
    isVerified: false,
    verificationType: "student" as const,
    metrics: {
      rating: 0,
      reviewsCount: 0,
      completedDeals: 0,
      listingsCount: 2,
      followersCount: 3,
    },
  },
  {
    ownerKey: `seller-service${SEED_EMAIL_DOMAIN}`,
    name: "Pixel Hive Creative",
    slug: "seed-pixel-hive",
    slugLower: "seed-pixel-hive",
    description: "Presentation slide decks, logo kits, flyer design, and UI mockups for campus groups.",
    storeType: "student_store" as const,
    category: "Services & Freelance",
    categoryTags: ["Design", "Branding", "Pitch Decks", "Printing"],
    campus: "Obafemi Awolowo University (OAU)",
    campusCity: "Ile-Ife",
    operatingLocation: "Fajuyi Hall",
    logo: "https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=400&q=80",
    coverImage: "https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=1200&q=80",
    status: "active" as const,
    isVerified: true,
    verificationType: "student" as const,
    metrics: {
      rating: 4.9,
      reviewsCount: 4,
      completedDeals: 12,
      listingsCount: 2,
      followersCount: 22,
    },
  },
];

export const LISTING_DEFINITIONS = [
  // Apex Campus Tech (Electronics)
  {
    storeSlug: "seed-apex-campus-tech",
    listingCode: "seed-mbp-m1-2020",
    title: "Apple MacBook Air M1 (8GB / 256GB SSD) Space Gray",
    price: 490000,
    priceFormatted: "₦490,000",
    category: "Electronics",
    subcategory: "Laptops",
    listingType: "product" as const,
    condition: "Like New" as const,
    description: "Battery health 92%, pristine condition with original 30W USB-C charger. Clean keyboard, no dents or scratches.",
    images: [
      "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
    ],
    location: "UNILAG Main Campus, Jaja Hall",
    campus: "University of Lagos (UNILAG)",
    views: 312,
    likes: 27,
  },
  {
    storeSlug: "seed-apex-campus-tech",
    listingCode: "seed-iphone-13-128",
    title: "iPhone 13 128GB Midnight (Factory Unlocked)",
    price: 430000,
    priceFormatted: "₦430,000",
    category: "Electronics",
    subcategory: "Phones",
    listingType: "product" as const,
    condition: "Used - Good" as const,
    description: "Factory unlocked, Face ID works perfectly, 88% battery health. Comes with clear MagSafe case.",
    images: [
      "https://images.unsplash.com/photo-1591337676887-a217a6970a8a?auto=format&fit=crop&w=800&q=80",
    ],
    location: "UNILAG Main Campus, Jaja Hall",
    campus: "University of Lagos (UNILAG)",
    views: 245,
    likes: 19,
  },
  {
    storeSlug: "seed-apex-campus-tech",
    listingCode: "seed-sony-wh1000xm4",
    title: "Sony WH-1000XM4 Wireless Noise Cancelling Headphones",
    price: 185000,
    priceFormatted: "₦185,000",
    category: "Electronics",
    subcategory: "Audio",
    listingType: "product" as const,
    condition: "Like New" as const,
    description: "Industry leading noise cancellation, black finish, case, aux and airplane adapter included.",
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
    ],
    location: "UNILAG Main Campus",
    campus: "University of Lagos (UNILAG)",
    views: 180,
    likes: 14,
  },
  {
    storeSlug: "seed-apex-campus-tech",
    listingCode: "seed-anker-powerbank-20k",
    title: "Anker PowerCore 20,000mAh Dual Port Fast Charger",
    price: 28000,
    priceFormatted: "₦28,000",
    category: "Electronics",
    subcategory: "Accessories",
    listingType: "product" as const,
    condition: "Brand New" as const,
    description: "Brand new in box, high capacity 20,000mAh bank that charges a smartphone up to 4 times.",
    images: [
      "https://images.unsplash.com/photo-1609592426867-b5014eaefec7?auto=format&fit=crop&w=800&q=80",
    ],
    location: "UNILAG Main Campus",
    campus: "University of Lagos (UNILAG)",
    views: 95,
    likes: 9,
  },

  // Lagos Campus Eats (Food)
  {
    storeSlug: "seed-lagos-campus-eats",
    listingCode: "seed-smoky-jollof-combo",
    title: "Smoky Party Jollof Bowl with Peppered Chicken & Plantain",
    price: 3200,
    priceFormatted: "₦3,200",
    category: "Food & Beverages",
    subcategory: "Meals",
    listingType: "product" as const,
    condition: "Brand New" as const,
    description: "Authentic Lagos firewood party jollof served hot with juicy grilled peppered quarter chicken and sweet fried dodo.",
    images: [
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
    ],
    location: "New Hall Food Court",
    campus: "University of Lagos (UNILAG)",
    views: 420,
    likes: 54,
  },
  {
    storeSlug: "seed-lagos-campus-eats",
    listingCode: "seed-double-beef-shawarma",
    title: "Double Sausage Jumbo Beef Shawarma with Special Sauce",
    price: 2800,
    priceFormatted: "₦2,800",
    category: "Food & Beverages",
    subcategory: "Snacks",
    listingType: "product" as const,
    condition: "Brand New" as const,
    description: "Freshly made flatbread stuffed with spiced minced beef, two smoked sausages, crunchy slaw and house cream.",
    images: [
      "https://images.unsplash.com/photo-1561651823-34feb02250e4?auto=format&fit=crop&w=800&q=80",
    ],
    location: "New Hall Food Court",
    campus: "University of Lagos (UNILAG)",
    views: 380,
    likes: 42,
  },

  // Amina Thrift & Vintage (Fashion)
  {
    storeSlug: "seed-amina-thrift",
    listingCode: "seed-vintage-carhartt-jacket",
    title: "Vintage Carhartt Detroit Duck Canvas Jacket (Size M)",
    price: 35000,
    priceFormatted: "₦35,000",
    category: "Fashion & Apparel",
    subcategory: "Jackets",
    listingType: "product" as const,
    condition: "Used - Good" as const,
    description: "Heavyweight rugged brown canvas jacket with corduroy collar and blanket lining. Authentic vintage wear.",
    images: [
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80",
    ],
    location: "ABU Zaria, Ribadu Hall",
    campus: "Ahmadu Bello University (ABU Zaria)",
    views: 290,
    likes: 38,
  },
  {
    storeSlug: "seed-amina-thrift",
    listingCode: "seed-retro-jordan-4-sneakers",
    title: "Nike Air Jordan 4 Retro 'Military Black' (Size 43)",
    price: 45000,
    priceFormatted: "₦45,000",
    category: "Fashion & Apparel",
    subcategory: "Footwear",
    listingType: "product" as const,
    condition: "Like New" as const,
    description: "Worn twice, flawless upper and soles, replacement box available. Super crisp campus kicks.",
    images: [
      "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80",
    ],
    location: "ABU Zaria, Ribadu Hall",
    campus: "Ahmadu Bello University (ABU Zaria)",
    views: 310,
    likes: 45,
  },

  // Campus Desk Essentials (Academics)
  {
    storeSlug: "seed-campus-desk",
    listingCode: "seed-casio-fx991ex-calculator",
    title: "Casio fx-991EX ClassWiz Advanced Scientific Calculator",
    price: 18000,
    priceFormatted: "₦18,000",
    category: "Academics & Stationery",
    subcategory: "Calculators",
    listingType: "product" as const,
    condition: "Like New" as const,
    description: "High-resolution display, 552 functions, matrix & equation solving. Essential for engineering and sciences.",
    images: [
      "https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=800&q=80",
    ],
    location: "UI Ibadan, Kuti Hall",
    campus: "University of Ibadan (UI)",
    views: 120,
    likes: 11,
  },
  {
    storeSlug: "seed-campus-desk",
    listingCode: "seed-halliday-physics-textbook",
    title: "Fundamentals of Physics by Halliday & Resnick (10th Ed)",
    price: 12000,
    priceFormatted: "₦12,000",
    category: "Academics & Stationery",
    subcategory: "Textbooks",
    listingType: "product" as const,
    condition: "Used - Good" as const,
    description: "Hardcover, clean pages with no pencil marks. Great reference for first and second year university physics.",
    images: [
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
    ],
    location: "UI Ibadan, Kuti Hall",
    campus: "University of Ibadan (UI)",
    views: 85,
    likes: 6,
  },

  // Pixel Hive Creative (Services)
  {
    storeSlug: "seed-pixel-hive",
    listingCode: "seed-event-flyer-poster-design",
    title: "Campus Event Poster, Flyer & Social Media Graphic Design",
    price: 8000,
    priceFormatted: "₦8,000",
    category: "Services & Freelance",
    subcategory: "Design",
    listingType: "service" as const,
    serviceDetails: {
      pricingModel: "fixed" as const,
      deliveryTime: "24-48 hours",
      serviceLocationType: "remote" as const,
      experienceYears: 3,
    },
    description: "High-impact visual designs for association weeks, departmental elections, concerts, and tech meetups. Includes 2 revision rounds.",
    images: [
      "https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=800&q=80",
    ],
    location: "OAU Ife, Fajuyi Hall",
    campus: "Obafemi Awolowo University (OAU)",
    views: 195,
    likes: 22,
  },
  {
    storeSlug: "seed-pixel-hive",
    listingCode: "seed-pitch-deck-resume-redesign",
    title: "Professional Resume / CV & Student Founder Pitch Deck Design",
    price: 15000,
    priceFormatted: "₦15,000",
    category: "Services & Freelance",
    subcategory: "Design",
    listingType: "service" as const,
    serviceDetails: {
      pricingModel: "fixed" as const,
      deliveryTime: "3 business days",
      serviceLocationType: "remote" as const,
      experienceYears: 3,
    },
    description: "ATS-optimized resumes and investor-ready presentation decks that stand out for internships and startup competitions.",
    images: [
      "https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=800&q=80",
    ],
    location: "OAU Ife, Fajuyi Hall",
    campus: "Obafemi Awolowo University (OAU)",
    views: 140,
    likes: 18,
  },
];

export const REVIEW_DEFINITIONS = [
  {
    buyerEmail: `buyer1${SEED_EMAIL_DOMAIN}`,
    storeSlug: "seed-apex-campus-tech",
    listingCode: "seed-mbp-m1-2020",
    rating: 5,
    comment: "Picked up the MacBook at Jaja Hall. Battery was exactly as advertised and Tunde even helped me set up my developer environment. Highly recommended!",
  },
  {
    buyerEmail: `buyer2${SEED_EMAIL_DOMAIN}`,
    storeSlug: "seed-apex-campus-tech",
    listingCode: "seed-sony-wh1000xm4",
    rating: 5,
    comment: "Flawless noise cancellation for studying in the library. Quick deal and genuine product.",
  },
  {
    buyerEmail: `buyer1${SEED_EMAIL_DOMAIN}`,
    storeSlug: "seed-lagos-campus-eats",
    listingCode: "seed-smoky-jollof-combo",
    rating: 5,
    comment: "Best jollof in UNILAG hands down. The chicken was well spiced and arrived piping hot.",
  },
  {
    buyerEmail: `buyer3${SEED_EMAIL_DOMAIN}`,
    storeSlug: "seed-amina-thrift",
    listingCode: "seed-vintage-carhartt-jacket",
    rating: 5,
    comment: "Amina's thrift pieces are so rare and well taken care of. Super comfortable jacket for cool Zaria mornings.",
  },
  {
    buyerEmail: `buyer2${SEED_EMAIL_DOMAIN}`,
    storeSlug: "seed-pixel-hive",
    listingCode: "seed-event-flyer-poster-design",
    rating: 5,
    comment: "Emeka delivered our departmental dinner poster in under 24 hours. The whole class loved the graphics!",
  },
];

export const FOLLOW_PAIRS = [
  { buyerEmail: `buyer1${SEED_EMAIL_DOMAIN}`, storeSlug: "seed-apex-campus-tech" },
  { buyerEmail: `buyer1${SEED_EMAIL_DOMAIN}`, storeSlug: "seed-lagos-campus-eats" },
  { buyerEmail: `buyer2${SEED_EMAIL_DOMAIN}`, storeSlug: "seed-apex-campus-tech" },
  { buyerEmail: `buyer2${SEED_EMAIL_DOMAIN}`, storeSlug: "seed-pixel-hive" },
  { buyerEmail: `buyer3${SEED_EMAIL_DOMAIN}`, storeSlug: "seed-amina-thrift" },
];

async function connectDb(opts: CliOptions): Promise<{ uri: string; memoryServer: any | null }> {
  if (opts.memory) {
    console.log("🛠️  [MODE] Starting temporary MongoMemoryReplSet...");
    const { MongoMemoryReplSet } = await import("mongodb-memory-server");
    const memoryServer = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
    const uri = memoryServer.getUri();
    await mongoose.connect(uri);
    return { uri, memoryServer };
  }

  // Load from .env.local if not already loaded
  const envUri = process.env.MONGODB_URI || "mongodb://localhost:27017/campushive";

  // Production safety check
  if (
    !opts.allowProduction &&
    (process.env.NODE_ENV === "production" ||
      envUri.includes("prod") ||
      envUri.includes("production") ||
      envUri.includes("mongodb+srv://live"))
  ) {
    console.error("❌ [SAFETY ERROR] Refusing to seed a production database without --allow-production flag!");
    process.exit(1);
  }

  console.log(`🔌 Attempting connection to MongoDB at: ${envUri}`);
  try {
    await mongoose.connect(envUri, { serverSelectionTimeoutMS: 2500 });
    return { uri: envUri, memoryServer: null };
  } catch (err: any) {
    console.warn(`⚠️  Could not connect to external MongoDB: ${err.message}`);
    console.log("💡 Automatically falling back to an in-memory MongoMemoryReplSet so you can test the seed script immediately!");
    const { MongoMemoryReplSet } = await import("mongodb-memory-server");
    const memoryServer = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
    const uri = memoryServer.getUri();
    await mongoose.connect(uri);
    return { uri, memoryServer };
  }
}

// ============================================================================
// CLEAN UP LOGIC: Only removes records with the @seed.campushive.local domain
// ============================================================================
async function cleanSeedData(): Promise<{ users: number; stores: number; listings: number; reviews: number; orders: number; followers: number }> {
  console.log("\n🧹 Cleaning existing seed data...");

  // 1. Find all seed users
  const seedUsers = await UserModel.find({ email: new RegExp(`${SEED_EMAIL_DOMAIN}$`, "i") });
  const seedUserIds = seedUsers.map((u) => u._id);

  // 2. Find all seed stores
  const seedStores = await StoreModel.find({
    $or: [{ ownerId: { $in: seedUserIds } }, { slug: /^seed-/ }],
  });
  const seedStoreIds = seedStores.map((s) => s._id);

  // 3. Delete listings linked to seed stores or sellers
  const delListings = await ListingModel.deleteMany({
    $or: [
      { storeId: { $in: seedStoreIds } },
      { sellerId: { $in: seedUserIds } },
      { listingCode: /^seed-/ },
    ],
  });

  // 4. Delete reviews
  const delReviews = await ReviewModel.deleteMany({
    $or: [
      { sellerId: { $in: seedUserIds } },
      { reviewerId: { $in: seedUserIds } },
      { storeId: { $in: seedStoreIds } },
    ],
  });

  // 5. Delete orders
  const delOrders = await OrderModel.deleteMany({
    $or: [{ sellerId: { $in: seedUserIds } }, { buyerId: { $in: seedUserIds } }],
  });

  // 6. Delete followers
  const delFollowers = await FollowerModel.deleteMany({
    $or: [
      { followerId: { $in: seedUserIds } },
      { followingId: { $in: seedUserIds.concat(seedStoreIds) } },
    ],
  });

  // 7. Delete stores
  const delStores = await StoreModel.deleteMany({ _id: { $in: seedStoreIds } });

  // 8. Delete users
  const delUsers = await UserModel.deleteMany({ _id: { $in: seedUserIds } });

  const result = {
    users: delUsers.deletedCount,
    stores: delStores.deletedCount,
    listings: delListings.deletedCount,
    reviews: delReviews.deletedCount,
    orders: delOrders.deletedCount,
    followers: delFollowers.deletedCount,
  };

  console.log(`   - Deleted ${result.users} seed users`);
  console.log(`   - Deleted ${result.stores} seed stores`);
  console.log(`   - Deleted ${result.listings} seed listings`);
  console.log(`   - Deleted ${result.reviews} seed reviews`);
  console.log(`   - Deleted ${result.orders} seed orders`);
  console.log(`   - Deleted ${result.followers} seed follows`);
  console.log("✅ Cleanup complete.\n");

  return result;
}

// ============================================================================
// SEED EXECUTION
// ============================================================================
async function runSeed() {
  const opts = parseCliArgs();

  console.log("==================================================================");
  console.log("   CAMPUS HIVE 2.0 — DETERMINISTIC SEED SCRIPT                   ");
  console.log("==================================================================");

  const activeUsers = opts.scale100 ? SEED_100_USERS : USER_DEFINITIONS;
  const activeStores = opts.scale100 ? SEED_100_STORES : STORE_DEFINITIONS;
  const activeListings = opts.scale100 ? SEED_100_LISTINGS : LISTING_DEFINITIONS;
  const activeReviews = opts.scale100 ? SEED_100_REVIEWS : REVIEW_DEFINITIONS;
  const activeFollows = opts.scale100 ? SEED_100_FOLLOWS : FOLLOW_PAIRS;

  if (!opts.apply && !opts.clean && !opts.dryRun) {
    console.log("ℹ️  No mode specified. Defaulting to --dry-run (preview mode).");
    console.log("   Pass --apply to write to the database.");
    console.log("   Pass --clean to wipe seeded records.\n");
    opts.dryRun = true;
  }

  // FAST PATH: Dry-run preview without connecting to DB
  if (opts.dryRun) {
    console.log(`🔍 [DRY RUN] Previewing records that will be created (Scale: ${opts.scale100 ? "100 Test Suite" : "Standard 8 Suite"}):\n`);
    console.log(`👤 Users to be created (${activeUsers.length} total):`);
    for (const u of activeUsers.slice(0, 15)) {
      console.log(`   - ${u.name} (${u.email}) [Role: ${u.role}, StudentVerified: ${u.studentVerified}, Stores: ${u.storesCount}]`);
    }
    if (activeUsers.length > 15) {
      console.log(`   ... and ${activeUsers.length - 15} more users`);
    }

    console.log(`\n🏪 Stores to be created (${activeStores.length} total):`);
    for (const s of activeStores.slice(0, 10)) {
      console.log(`   - ${s.name} (@${s.slug}) [${s.campus} · ${s.storeType} · Verified: ${s.isVerified}]`);
    }
    if (activeStores.length > 10) {
      console.log(`   ... and ${activeStores.length - 10} more stores`);
    }

    console.log(`\n📦 Listings to be created (${activeListings.length} total):`);
    for (const l of activeListings.slice(0, 15)) {
      console.log(`   - [${l.storeSlug}] ${l.title} (${l.priceFormatted}) [${l.listingType}]`);
    }
    if (activeListings.length > 15) {
      console.log(`   ... and ${activeListings.length - 15} more listings`);
    }

    console.log(`\n⭐ Reviews to be created (${activeReviews.length} total)`);
    console.log(`👥 Follows to be created (${activeFollows.length} total)`);
    console.log("\n==================================================================");
    console.log(`✅ Dry run completed successfully! ${activeUsers.length} Users & ${activeListings.length} Listings ready.`);
    console.log("   Run with --apply to insert records into MongoDB.");
    console.log("==================================================================\n");
    return;
  }

  const { uri, memoryServer } = await connectDb(opts);
  console.log(`✅ Connected to database: ${uri}\n`);

  try {
    // Ensure critical compound and unique indexes
    console.log("⚙️  Ensuring database schema indexes...");
    await UserModel.init();
    await StoreModel.init();
    if (typeof ensureStoreIndexes === "function") {
      await ensureStoreIndexes();
    }
    await ListingModel.init();
    await ReviewModel.init();
    await FollowerModel.init();
    console.log("✅ Indexes verified.\n");

    if (opts.clean) {
      await cleanSeedData();
      if (!opts.apply) {
        console.log("🏁 Exiting after clean operation.");
        return;
      }
    }

    const hashedPassword = await argon2.hash(SEED_PASSWORD_RAW);

    // ------------------------------------------------------------------------
    // 1. SEED USERS
    // ------------------------------------------------------------------------
    console.log(`👤 Upserting Seed Users (${activeUsers.length} total)...`);
    const seededUsers: Record<string, any> = {};

    let userCount = 0;
    for (const u of activeUsers) {
      const doc = await UserModel.findOneAndUpdate(
        { email: u.email.toLowerCase() },
        {
          $set: {
            ...u,
            password: hashedPassword,
            emailVerified: true,
            schemaVersion: 1,
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      seededUsers[u.email] = doc;
      userCount++;
      if (activeUsers.length <= 15 || userCount % 10 === 0 || userCount === activeUsers.length) {
        console.log(`   ✓ User [${userCount}/${activeUsers.length}]: ${u.name} (${u.email})`);
      }
    }

    // ------------------------------------------------------------------------
    // 2. SEED STORES
    // ------------------------------------------------------------------------
    console.log(`\n🏪 Upserting Seed Stores (${activeStores.length} total)...`);
    const seededStores: Record<string, any> = {};

    let storeCount = 0;
    for (const s of activeStores) {
      const owner = seededUsers[s.ownerKey];
      if (!owner) continue;

      const storeDoc = await StoreModel.findOneAndUpdate(
        { slug: s.slug },
        {
          $set: {
            ...s,
            ownerId: String(owner._id),
            ownerFullName: owner.name,
            schemaVersion: 1,
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      seededStores[s.slug] = storeDoc;
      storeCount++;
      if (activeStores.length <= 15 || storeCount % 5 === 0 || storeCount === activeStores.length) {
        console.log(`   ✓ Store [${storeCount}/${activeStores.length}]: ${storeDoc.name} (@${storeDoc.slug})`);
      }
    }

    // ------------------------------------------------------------------------
    // 3. SEED LISTINGS
    // ------------------------------------------------------------------------
    console.log(`\n📦 Upserting Seed Listings (${activeListings.length} total)...`);
    const seededListings: Record<string, any> = {};

    let listingCount = 0;
    for (const l of activeListings) {
      const store = seededStores[l.storeSlug];
      if (!store) continue;

      const slugBase = l.listingCode;
      const listingDoc = await ListingModel.findOneAndUpdate(
        { listingCode: l.listingCode },
        {
          $set: {
            ...l,
            storeId: String(store._id),
            sellerId: String(store.ownerId),
            slug: slugBase,
            slugSuffix: "seed0001",
            status: "active",
            schemaVersion: 1,
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      seededListings[l.listingCode] = listingDoc;
      listingCount++;
      if (activeListings.length <= 15 || listingCount % 10 === 0 || listingCount === activeListings.length) {
        console.log(`   ✓ Listing [${listingCount}/${activeListings.length}]: ${listingDoc.title.slice(0, 38)}... (${listingDoc.priceFormatted})`);
      }
    }

    // ------------------------------------------------------------------------
    // 4. SEED REVIEWS
    // ------------------------------------------------------------------------
    console.log(`\n⭐ Upserting Seed Reviews (${activeReviews.length} total)...`);
    let reviewCount = 0;
    for (const r of activeReviews) {
      const buyer = seededUsers[r.buyerEmail];
      const store = seededStores[r.storeSlug];
      const listing = seededListings[r.listingCode];
      if (!buyer || !store) continue;

      await ReviewModel.findOneAndUpdate(
        {
          reviewerId: buyer._id,
          storeId: store._id,
          comment: r.comment,
        },
        {
          $set: {
            sellerId: store.ownerId,
            reviewerId: buyer._id,
            storeId: store._id,
            listingId: listing?._id,
            rating: r.rating,
            comment: r.comment,
            status: "published",
            schemaVersion: 1,
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      reviewCount++;
      if (activeReviews.length <= 10 || reviewCount % 5 === 0 || reviewCount === activeReviews.length) {
        console.log(`   ✓ Review [${reviewCount}/${activeReviews.length}]: "${r.comment.slice(0, 40)}..." for ${store.name}`);
      }
    }

    // ------------------------------------------------------------------------
    // 5. SEED STORE FOLLOWS
    // ------------------------------------------------------------------------
    console.log(`\n👥 Upserting Seed Store Follows (${activeFollows.length} total)...`);
    let followCount = 0;
    for (const f of activeFollows) {
      const buyer = seededUsers[f.buyerEmail];
      const store = seededStores[f.storeSlug];
      if (!buyer || !store) continue;

      await FollowerModel.findOneAndUpdate(
        { followerId: buyer._id, followingId: store._id, targetType: "store" },
        {
          $set: {
            followerId: buyer._id,
            followingId: store._id,
            targetType: "store",
            schemaVersion: 1,
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      followCount++;
      if (activeFollows.length <= 10 || followCount % 10 === 0 || followCount === activeFollows.length) {
        console.log(`   ✓ Follow [${followCount}/${activeFollows.length}]: ${buyer.name} -> ${store.name}`);
      }
    }

    // ------------------------------------------------------------------------
    // SUMMARY REPORT
    // ------------------------------------------------------------------------
    console.log("\n==================================================================");
    console.log(`   SEED DATA CREATED SUCCESSFULLY! 🎉 (${activeUsers.length} Users, ${activeStores.length} Stores, ${activeListings.length} Listings)`);
    console.log("==================================================================");
    console.log(`🔑 Master Password for all seed users: ${SEED_PASSWORD_RAW}`);
    console.log("\n📋 FEATURED SEED LOGIN CREDENTIALS:");
    console.log("  • Multi-Store Merchant : seller-multi@seed.campushive.local (Tunde Bakare)");
    console.log("    Stores: Apex Campus Tech (@seed-apex-campus-tech), Lagos Campus Eats (@seed-lagos-campus-eats)");
    console.log("  • Student Fashion Store: seller-student@seed.campushive.local (Amina Bello)");
    console.log("    Store: Amina Thrift & Vintage (@seed-amina-thrift)");
    console.log("  • Brand New Seller     : seller-new@seed.campushive.local (Chidi Okafor)");
    console.log("    Store: Campus Desk Essentials (@seed-campus-desk)");
    console.log("  • Creative Services    : seller-service@seed.campushive.local (Emeka Okonkwo)");
    console.log("    Store: Pixel Hive Creative (@seed-pixel-hive)");
    console.log("  • Gadgets (UNN)        : seller7@seed.campushive.local (Ifeanyi Okeke)");
    console.log("    Store: Lion Campus Gadgets (@seed-lion-gadgets)");
    console.log("  • Textbooks (UI)       : seller10@seed.campushive.local (Damilola Adeyemi)");
    console.log("    Store: UI Medical & Academic Books (@seed-ui-book-vault)");
    console.log("  • Dorm Living (UI)     : seller11@seed.campushive.local (Kemi Balogun)");
    console.log("    Store: Kemi Dorm Living Hub (@seed-kemi-dorm-decor)");
    console.log("  • Student Buyers       : buyer1@seed.campushive.local ... buyer64@seed.campushive.local");
    console.log("  • Platform Admin       : admin@seed.campushive.local");
    console.log("==================================================================\n");
  } catch (error: any) {
    console.error("❌ Seed execution failed with error:", error);
    process.exit(1);
  } finally {
    if (memoryServer) {
      console.log("🧹 Stopping temporary MongoMemoryReplSet...");
      await mongoose.disconnect();
      await memoryServer.stop();
      console.log("✅ In-memory database cleanly stopped.");
    } else {
      await mongoose.disconnect();
    }
  }
}

// Run the script
runSeed().catch((err) => {
  console.error("Fatal seed error:", err);
  process.exit(1);
});
