"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Bookmark,
  Check,
  CheckCircle2,
  Clock,
  Cpu,
  Edit3,
  ExternalLink,
  Flag,
  HardDrive,
  Heart,
  Laptop,
  MapPin,
  MemoryStick,
  MessageCircle,
  Monitor,
  Package,
  Send,
  Share2,
  Shield,
  Sparkles,
  Star,
  Tag,
  Trash2,
  UserCheck,
  X,
} from "lucide-react";

import { RebrandHeader } from "../../components/header/RebrandHeader";
import { RebrandFooter } from "../../components/sections/RebrandFooter";
import type { ExploreListingItem } from "../../data/exploreCatalog";

interface QuickHighlight {
  icon: "cpu" | "ram" | "storage" | "display" | "os" | "tag" | "package" | "clock" | "check";
  label: string;
}

interface SpecRow {
  label: string;
  value: string;
}

interface ReviewItem {
  id: string;
  reviewerName: string;
  reviewerDept: string;
  rating: number;
  date: string;
  comment: string;
  verifiedItem: string;
}

interface DetailedListingData {
  id: string;
  title: string;
  price: number;
  priceFormatted: string;
  category: string;
  subCategory: string;
  conditionLabel: string;
  conditionNote: string;
  location: string;
  postedAgo: string;
  shortSummary: string;
  aboutDescription: string;
  whySelling: string;
  pickupDetails: string;
  includedItems: string[];
  images: string[];
  quickHighlights: QuickHighlight[];
  specifications: SpecRow[];
  seller: {
    name: string;
    handle: string;
    avatar: string;
    department: string;
    badgeLabel: "Student seller" | "Approved business";
    isVerified: boolean;
    bio: string;
    listingsCount: number;
    rating: string;
    reviewsCount: number;
    memberSince: string;
    storeHref: string;
  };
  reviews: ReviewItem[];
}

const DEFAULT_REVIEWS: ReviewItem[] = [
  {
    id: "rev-1",
    reviewerName: "Musa Ibrahim",
    reviewerDept: "Mechanical Engineering · 400L",
    rating: 5,
    date: "3 days ago",
    comment:
      "Met up at Suleiman Hall lobby. Item was exactly as described, super clean and battery lasted through my 3-hour lecture. Honest seller!",
    verifiedItem: "Verified Campus Meetup",
  },
  {
    id: "rev-2",
    reviewerName: "Zainab Aliyu",
    reviewerDept: "Architecture · 300L",
    rating: 5,
    date: "1 week ago",
    comment:
      "Fast response in chat and very polite. Allowed me to test everything thoroughly before paying.",
    verifiedItem: "Verified Campus Meetup",
  },
  {
    id: "rev-3",
    reviewerName: "Chinedu Okafor",
    reviewerDept: "Computer Science · 200L",
    rating: 5,
    date: "2 weeks ago",
    comment:
      "Great price for a fellow student. Charger and accessories were all intact.",
    verifiedItem: "Verified Campus Meetup",
  },
];

// Flagship Showcase Item matching Screenshot (HP EliteBook 840 G5) + Rich Overrides
const DETAILED_CATALOG: Record<string, DetailedListingData> = {
  "101": {
    id: "101",
    title: "HP EliteBook 840 G5",
    price: 185000,
    priceFormatted: "₦185,000",
    category: "Electronics",
    subCategory: "Laptops",
    conditionLabel: "Used",
    conditionNote: "Good condition",
    location: "Suleiman Hall, ABU Zaria",
    postedAgo: "Posted 2 hours ago",
    shortSummary:
      "Reliable and powerful laptop, perfect for school work, research and everyday use. It's clean, runs smoothly, and comes with the charger.",
    aboutDescription:
      "This HP EliteBook 840 G5 is in great working condition. It's fast, lightweight, and ideal for students. Battery lasts around 4–6 hours (depending on usage). I've used it for my lectures and assignments but I'm upgrading, so I'm letting it go.",
    whySelling: "Upgraded to a newer model.",
    pickupDetails: "Meetup at Suleiman Hall (or nearby campus area)",
    includedItems: [
      "HP EliteBook 840 G5",
      "Original charger",
      "Laptop bag (optional)",
    ],
    images: [
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=900&auto=format&fit=crop&q=80",
    ],
    quickHighlights: [
      { icon: "cpu", label: "Intel Core i5 (7th Gen)" },
      { icon: "ram", label: "8GB RAM" },
      { icon: "storage", label: "256GB SSD" },
      { icon: "display", label: '14" Display' },
      { icon: "os", label: "Windows 11" },
    ],
    specifications: [
      { label: "Brand & Model", value: "HP EliteBook 840 G5" },
      { label: "Processor", value: "Intel Core i5-7300U (7th Gen, up to 3.5GHz)" },
      { label: "RAM", value: "8GB DDR4 (Upgradeable to 32GB)" },
      { label: "Storage", value: "256GB PCIe NVMe SSD" },
      { label: "Screen Size", value: '14.0" Full HD (1920 x 1080) Anti-Glare IPS' },
      { label: "Operating System", value: "Windows 11 Pro (Activated)" },
      { label: "Battery Life", value: "4 – 6 hours active campus use" },
      { label: "Keyboard", value: "Backlit spill-resistant keyboard" },
      { label: "Ports", value: "USB-C / Thunderbolt, 2x USB 3.1, HDMI, RJ-45" },
    ],
    seller: {
      name: "Tunde Bello",
      handle: "tundebello",
      avatar:
        "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=250&auto=format&fit=crop&q=80",
      department: "Suleiman Hall · ABU Samaru",
      badgeLabel: "Student seller",
      isVerified: true,
      bio: "Selling clean, tested student laptops, scientific calculators, and study electronics around Suleiman Hall and Faculty of Science.",
      listingsCount: 4,
      rating: "4.8",
      reviewsCount: 28,
      memberSince: "Oct 2026",
      storeHref: "/profile/tundebello",
    },
    reviews: DEFAULT_REVIEWS,
  },
  "102": {
    id: "102",
    title: "Casio fx-991EX Scientific Calculator",
    price: 8500,
    priceFormatted: "₦8,500",
    category: "Books & Academic Supplies",
    subCategory: "Calculators & Instruments",
    conditionLabel: "Like New",
    conditionNote: "Mint condition",
    location: "Suleiman Hall, ABU Zaria",
    postedAgo: "Posted 4 hours ago",
    shortSummary:
      "Original Casio fx-991EX ClassWiz calculator with 552 functions. High-resolution LCD display, solar + battery powered. Allowed in all engineering and science exams.",
    aboutDescription:
      "Bought this brand new last semester for my 200L Engineering Mathematics and Statistics courses. Screen has zero scratches and solar charging works flawlessly. Comes with the hard slide-on protective case.",
    whySelling: "Completed my general math courses.",
    pickupDetails: "Meetup at Suleiman Hall or Faculty of Science",
    includedItems: [
      "Casio fx-991EX ClassWiz Calculator",
      "Original hard slide cover",
      "Quick reference manual",
    ],
    images: [
      "https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1518133910546-b6c2fb7d79e3?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=900&auto=format&fit=crop&q=80",
    ],
    quickHighlights: [
      { icon: "check", label: "552 Functions" },
      { icon: "display", label: "Natural Textbook Display" },
      { icon: "clock", label: "Solar + Battery" },
      { icon: "tag", label: "Exam Approved" },
    ],
    specifications: [
      { label: "Brand & Model", value: "Casio fx-991EX ClassWiz" },
      { label: "Number of Functions", value: "552 Scientific & Statistical Functions" },
      { label: "Power Source", value: "Two-way power (Solar + LR44 Battery)" },
      { label: "Display", value: "High-resolution Natural Textbook Display" },
      { label: "Special Features", value: "Matrix, Vector, Complex, 4x4 Simultaneous Equations" },
      { label: "Exam Eligibility", value: "Non-programmable (Approved for all ABU exams)" },
    ],
    seller: {
      name: "Tunde Bello",
      handle: "tundebello",
      avatar:
        "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=250&auto=format&fit=crop&q=80",
      department: "Suleiman Hall · ABU Samaru",
      badgeLabel: "Student seller",
      isVerified: true,
      bio: "Selling clean, tested student laptops, scientific calculators, and study electronics around Suleiman Hall and Faculty of Science.",
      listingsCount: 4,
      rating: "4.8",
      reviewsCount: 28,
      memberSince: "Oct 2026",
      storeHref: "/profile/tundebello",
    },
    reviews: DEFAULT_REVIEWS,
  },
};

function buildFallbackListing(id: string): DetailedListingData {
  return DETAILED_CATALOG[id] || DETAILED_CATALOG["101"];
}

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = Array.isArray(params?.id) ? params.id[0] : params?.id || "101";

  const [liveListing, setLiveListing] = useState<DetailedListingData | null>(null);

  useEffect(() => {
    let isCancelled = false;
    async function fetchLiveListing() {
      if (!rawId) return;
      try {
        const res = await fetch(`/api/listings/${encodeURIComponent(rawId)}`);
        const json = await res.json();
        if (json.success && json.data && !isCancelled) {
          const item = json.data;
          const isService = item.listingType === "service";

          // If item belongs to a store, load store info
          let storeData: any = null;
          if (item.storeId) {
            try {
              const storeRes = await fetch(`/api/stores/${encodeURIComponent(item.storeId)}`);
              const storeJson = await storeRes.json();
              if (storeJson.success && storeJson.data) {
                storeData = storeJson.data;
              }
            } catch {}
          }

          const specRows: SpecRow[] = [];
          if (item.categoryFields && typeof item.categoryFields === "object") {
            Object.entries(item.categoryFields).forEach(([k, v]) => {
              if (v) specRows.push({ label: k.charAt(0).toUpperCase() + k.slice(1), value: String(v) });
            });
          }
          if (isService && item.serviceDetails) {
            specRows.push(
              { label: "Pricing Model", value: item.serviceDetails.pricingModel?.replace("_", " ") || "Fixed" },
              { label: "Delivery Turnaround", value: item.serviceDetails.deliveryTime || "24-48 hours" },
              { label: "Service Location", value: item.serviceDetails.serviceLocationType?.replace("_", " ") || "On campus" }
            );
          } else if (specRows.length === 0) {
            specRows.push(
              { label: "Category", value: item.category },
              { label: "Condition", value: item.condition || "Used - Good" },
              { label: "Campus Landmark", value: item.location || item.campus || "Samaru Campus" }
            );
          }

          const highlights: QuickHighlight[] = isService
            ? [
                { icon: "tag", label: item.serviceDetails?.pricingModel === "starting_at" ? `From ${item.priceFormatted}` : item.priceFormatted },
                { icon: "clock", label: item.serviceDetails?.deliveryTime || "24-48 hours" },
                { icon: "check", label: item.serviceDetails?.serviceLocationType === "remote" ? "Remote / Online" : "Campus Meetup" },
              ]
            : [
                { icon: "check", label: item.condition || "Used - Good" },
                { icon: "tag", label: item.priceFormatted || `₦${Number(item.price).toLocaleString()}` },
                { icon: "clock", label: "Campus pickup" },
              ];

          let liveReviews: ReviewItem[] = [];
          try {
            const revRes = await fetch(`/api/reviews?sellerId=${item.sellerId}`).then((r) => r.json());
            if (revRes?.success && Array.isArray(revRes.data)) {
              liveReviews = revRes.data.map((r: any) => ({
                id: r.id,
                reviewerName: r.reviewer?.name || "Campus Buyer",
                reviewerDept: "Verified Student Buyer",
                rating: r.rating,
                date: new Date(r.createdAt).toLocaleDateString(),
                comment: r.comment,
                verifiedItem: "Verified Campus Transaction",
              }));
            }
          } catch {
            liveReviews = [];
          }

          const mapped: DetailedListingData = {
            id: String(item._id || item.id),
            title: item.title,
            price: Number(item.price),
            priceFormatted: item.priceFormatted || `₦${Number(item.price).toLocaleString()}`,
            category: item.category,
            subCategory: item.subcategory || item.category,
            conditionLabel: item.condition || (isService ? "Service" : "Used - Good"),
            conditionNote: `${item.condition || "Standard"} condition`,
            location: item.location || item.campus || "Samaru Campus, ABU Zaria",
            postedAgo: "Recently",
            shortSummary: item.description,
            aboutDescription: item.description,
            whySelling: isService ? "Professional student campus service." : "Verified campus marketplace listing.",
            pickupDetails: `Meetup at ${item.location || item.campus || "Samaru Campus"}`,
            includedItems: [item.title, isService ? "Service delivery" : "Inspection before payment"],
            images: Array.isArray(item.images) && item.images.length > 0
              ? item.images
              : ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80"],
            quickHighlights: highlights,
            specifications: specRows,
            seller: {
              name: storeData ? storeData.name : "Campus Seller",
              handle: storeData ? storeData.slug : "seller",
              avatar: storeData?.logo || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=250&auto=format&fit=crop&q=80",
              department: storeData ? `${storeData.operatingLocation || storeData.campus}` : `${item.location || "Samaru"} · ABU Zaria`,
              badgeLabel: storeData?.storeType === "student_store" || storeData?.storeType === "student_owned" ? "Student seller" : "Approved business",
              isVerified: Boolean(storeData?.isVerified ?? true),
              bio: storeData?.description || "Active seller on Campus Hive.",
              listingsCount: storeData?.metrics?.listingsCount || 1,
              rating: String(storeData?.metrics?.rating ?? "4.8"),
              reviewsCount: storeData?.metrics?.reviewsCount ?? 12,
              memberSince: "2026",
              storeHref: storeData ? `/stores/${storeData.slug || storeData._id}` : `/profile/tundebello`,
            },
            reviews: liveReviews,
          };

          setLiveListing(mapped);
        }
      } catch (e) {
        console.warn("Could not fetch live listing from API:", e);
      }
    }
    fetchLiveListing();
    return () => {
      isCancelled = true;
    };
  }, [rawId]);

  const fallbackListing = useMemo<DetailedListingData>(() => {
    if (DETAILED_CATALOG[rawId]) return DETAILED_CATALOG[rawId];

    // Check user created listings from local storage
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("ch_user_created_listings");
        if (stored) {
          const list: any[] = JSON.parse(stored);
          const foundCreated = list.find((item) => String(item.id) === String(rawId));
          if (foundCreated) {
            const specRows: SpecRow[] = [];
            if (foundCreated.specs && typeof foundCreated.specs === "object") {
              Object.entries(foundCreated.specs).forEach(([k, v]) => {
                if (v) specRows.push({ label: k.charAt(0).toUpperCase() + k.slice(1), value: String(v) });
              });
            }
            if (specRows.length === 0) {
              specRows.push(
                { label: "Category", value: foundCreated.category },
                { label: "Condition", value: foundCreated.condition },
                { label: "Campus Landmark", value: foundCreated.landmark || "ABU Zaria" },
                { label: "Inspection Policy", value: "Test & inspect at public meetup" }
              );
            }

            return {
              id: String(foundCreated.id),
              title: foundCreated.title,
              price: Number(foundCreated.price),
              priceFormatted: foundCreated.priceFormatted || `₦${Number(foundCreated.price).toLocaleString()}`,
              category: foundCreated.category,
              subCategory: foundCreated.category,
              conditionLabel: foundCreated.condition,
              conditionNote: `${foundCreated.condition} condition`,
              location: foundCreated.location || `${foundCreated.landmark || "Samaru"}, ABU Zaria`,
              postedAgo: "Just now",
              shortSummary: foundCreated.description,
              aboutDescription: foundCreated.description,
              whySelling: "Student seller offering items on Campus Hive.",
              pickupDetails: `Meetup at ${foundCreated.landmark || "Kashim Ibrahim Library"}`,
              includedItems: [foundCreated.title, "Original accessories", "Testing before payment"],
              images: Array.isArray(foundCreated.images) && foundCreated.images.length > 0
                ? foundCreated.images
                : [foundCreated.imageUrl || "/placeholder.png"],
              quickHighlights: [
                { icon: "check", label: foundCreated.condition },
                { icon: "tag", label: `₦${Number(foundCreated.price).toLocaleString()}` },
                { icon: "clock", label: "Immediate campus pickup" },
              ],
              specifications: specRows,
              seller: {
                name: foundCreated.sellerName || "Tunde Bello",
                handle: foundCreated.sellerHandle || "tundebello",
                avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=250&auto=format&fit=crop&q=80",
                department: `${foundCreated.landmark || "Samaru"} · ABU Zaria`,
                badgeLabel: "Student seller",
                isVerified: true,
                bio: "Active student seller on Campus Hive.",
                listingsCount: 1,
                rating: "4.8",
                reviewsCount: 18,
                memberSince: "Oct 2026",
                storeHref: `/profile/${foundCreated.sellerHandle || "tundebello"}`,
              },
              reviews: [],
            };
          }
        }
      } catch {
        // Fallback below
      }
    }

    return buildFallbackListing(rawId);
  }, [rawId]);

  const listing = liveListing || fallbackListing;

  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [activeTab, setActiveTab] = useState<"details" | "specs" | "reviews">("details");
  const [isSaved, setIsSaved] = useState(false);
  const [relatedSaved, setRelatedSaved] = useState<Record<string | number, boolean>>({});

  // Listing Management (Owner Preview Mode vs Buyer Mode)
  const [isOwnerView, setIsOwnerView] = useState(false);
  const [isMarkedSold, setIsMarkedSold] = useState(false);

  // Modals: Contextual Chat & Report Listing
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [sentMessages, setSentMessages] = useState<
    { id: string; sender: "you" | "seller"; text: string; time: string }[]
  >([]);
  const [reportReason, setReportReason] = useState("Item already sold or unavailable");
  const [reportNote, setReportNote] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setSelectedImageIdx(0);
  }, [rawId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleSave = () => {
    const next = !isSaved;
    setIsSaved(next);
    showToast(next ? "Added to your saved wishlist" : "Removed from saved wishlist");
  };

  const handleShare = () => {
    if (typeof window !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href).catch(() => {});
    }
    showToast("Listing link copied to clipboard!");
  };

  const handleOpenChatWithContext = () => {
    const isService = listing.category === "Services" || listing.conditionLabel === "Service";
    const storeParam = listing.seller.storeHref.startsWith("/stores/")
      ? listing.seller.storeHref.replace("/stores/", "")
      : "";

    const params = new URLSearchParams({
      contextType: isService ? "service" : "product",
      contextId: String(listing.id),
      title: listing.title,
      price: listing.priceFormatted,
      numericPrice: String(listing.price),
      image: listing.images[0] || "",
      status: isMarkedSold ? "Sold" : "Available",
      href: `/listings/${listing.id}`,
      participantId: `seller-${listing.seller.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
      participantName: listing.seller.name,
      participantSubtitle: listing.seller.department,
      participantAvatar: listing.seller.avatar,
      participantVerified: listing.seller.isVerified ? "true" : "false",
      service: isService ? String(listing.id) : "",
      store: storeParam,
    });
    router.push(`/messages?${params.toString()}`);
  };

  const handleSendContextualMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    const userMsg = {
      id: `msg-${Date.now()}`,
      sender: "you" as const,
      text: chatMessage.trim(),
      time: "Just now",
    };
    setSentMessages((prev) => [...prev, userMsg]);
    setChatMessage("");

    setTimeout(() => {
      setSentMessages((prev) => [
        ...prev,
        {
          id: `msg-reply-${Date.now()}`,
          sender: "seller",
          text: `Hi! Yes, "${listing.title}" (${listing.priceFormatted}) is still available. We can meet at ${listing.location.split(",")[0]} whenever you're free.`,
          time: "Just now",
        },
      ]);
    }, 900);
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsReportModalOpen(false);
    setReportNote("");
    showToast("Report submitted. Campus Hive safety team will review this listing.");
  };

  const [relatedListings, setRelatedListings] = useState<ExploreListingItem[]>([]);

  useEffect(() => {
    let isCancelled = false;
    async function loadRelated() {
      try {
        const cat = listing?.category ? `category=${encodeURIComponent(listing.category)}&` : "";
        const res = await fetch(`/api/listings?${cat}limit=6&status=active`);
        const json = await res.json();
        if (!isCancelled && json.success && Array.isArray(json.data)) {
          const mapped: ExploreListingItem[] = json.data
            .filter((item: any) => String(item._id || item.id) !== String(listing?.id))
            .slice(0, 4)
            .map((item: any) => {
              const isService = item.listingType === "service";
              const sellerObj = typeof item.sellerId === "object" ? item.sellerId : null;
              return {
                id: item._id || item.id,
                title: item.title,
                price: typeof item.price === "number" ? item.price : 0,
                priceFormatted: `₦${Number(item.price || 0).toLocaleString()}`,
                category: item.category || "General",
                itemType: isService ? "service" : "product",
                landmark: item.location || item.campus || "Samaru",
                condition: item.condition || "Used",
                conditionTone: item.condition === "New" ? "green" : "neutral",
                imageUrl: item.images?.[0] || "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80",
                sellerName: sellerObj?.name || "Campus Student",
                sellerHandle: sellerObj?.handle || "campus-seller",
                sellerType: item.storeId ? "student_store" : "verified_student",
                isVerifiedStudent: true,
                engagementText: "Active listing",
                rating: "4.8",
                keywords: [item.title, item.category].filter(Boolean),
              };
            });
          setRelatedListings(mapped);
        }
      } catch {}
    }
    loadRelated();
    return () => {
      isCancelled = true;
    };
  }, [listing?.category, listing?.id]);

  const renderQuickIcon = (iconType: QuickHighlight["icon"]) => {
    const cls = "w-4 h-4 text-[#4A5058] dark:text-neutral-300 shrink-0";
    switch (iconType) {
      case "cpu":
        return <Cpu className={cls} strokeWidth={1.8} />;
      case "ram":
        return <MemoryStick className={cls} strokeWidth={1.8} />;
      case "storage":
        return <HardDrive className={cls} strokeWidth={1.8} />;
      case "display":
        return <Monitor className={cls} strokeWidth={1.8} />;
      case "os":
        return <Laptop className={cls} strokeWidth={1.8} />;
      case "clock":
        return <Clock className={cls} strokeWidth={1.8} />;
      case "package":
        return <Package className={cls} strokeWidth={1.8} />;
      case "check":
        return <CheckCircle2 className={cls} strokeWidth={1.8} />;
      default:
        return <Tag className={cls} strokeWidth={1.8} />;
    }
  };

  return (
    <div
      style={{ fontFamily: "var(--font-plus-jakarta), sans-serif" }}
      className="min-h-screen flex flex-col bg-[#F7F8FA] dark:bg-[#0E1015] text-[#171717] dark:text-white antialiased pb-20 md:pb-0"
    >
      <RebrandHeader />

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-20 md:bottom-6 right-6 z-50 radius-native bg-[#171717] text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2.5 text-[12.5px] font-semibold border border-white/10">
          <CheckCircle2 className="w-4 h-4 text-[#FFC928] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <main className="flex-1 w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-16">
        {/* Top Minimal Navigation & Owner Toggle Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[#5B636E] dark:text-neutral-400 hover:text-[#171717] dark:hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to listings</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="radius-native inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-medium text-[#5B636E] dark:text-neutral-400 hover:text-[#171717] dark:hover:text-white hover:bg-white dark:hover:bg-white/5 transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>

            <button
              type="button"
              onClick={() => setIsReportModalOpen(true)}
              className="radius-native inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-medium text-[#5B636E] dark:text-neutral-400 hover:text-rose-600 transition-colors cursor-pointer"
            >
              <Flag className="w-3.5 h-3.5" />
              <span>Report</span>
            </button>

            <span className="h-3.5 w-[1px] bg-[#E2E6EC] dark:bg-white/10 mx-0.5" />

            <button
              type="button"
              onClick={() => setIsOwnerView((prev) => !prev)}
              className={`radius-native px-2.5 py-1 rounded-lg text-[11.5px] font-semibold border transition-colors cursor-pointer ${
                isOwnerView
                  ? "bg-[#171717] text-white border-[#171717] dark:bg-white dark:text-[#171717]"
                  : "bg-white dark:bg-[#14161D] border-[#ECEEF2] dark:border-white/10 text-[#68707A] dark:text-neutral-400 hover:border-[#171717]"
              }`}
            >
              {isOwnerView ? "Viewing as Owner" : "Preview Owner View"}
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* MAIN TWO-COLUMN PRODUCT LAYOUT (Matches Reference Image)   */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
          {/* LEFT / MAIN AREA (8 Columns) */}
          <div className="lg:col-span-8 space-y-7">
            {/* TOP PRODUCT GALLERY + CORE INFO */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Product Gallery: Vertical Thumbnails + Main Image (6 cols) */}
              <div className="md:col-span-6 flex flex-col-reverse sm:flex-row gap-3">
                {/* 4 Thumbnails Strip */}
                <div className="flex sm:flex-col gap-2.5 shrink-0">
                  {listing.images.map((imgUrl, idx) => {
                    const isActive = idx === selectedImageIdx;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedImageIdx(idx)}
                        className={`radius-native w-14 h-14 sm:w-[60px] sm:h-[60px] rounded-xl overflow-hidden border-2 transition-all cursor-pointer bg-white dark:bg-[#14161D] ${
                          isActive
                            ? "border-[#FFC928] ring-2 ring-[#FFC928]/25 scale-[1.02]"
                            : "border-[#ECEEF2] dark:border-white/10 opacity-75 hover:opacity-100"
                        }`}
                      >
                        <img
                          src={imgUrl}
                          alt={`${listing.title} thumbnail ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    );
                  })}
                </div>

                {/* Main Product Image */}
                <div className="radius-native relative flex-1 aspect-[4/3] sm:h-[340px] rounded-2xl overflow-hidden bg-[#ECEFF3] dark:bg-[#14161D] border border-[#ECEEF2] dark:border-white/10">
                  <img
                    src={listing.images[selectedImageIdx] || listing.images[0]}
                    alt={listing.title}
                    className="w-full h-full object-cover transition-all duration-300"
                  />

                  {isMarkedSold && (
                    <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px] flex items-center justify-center">
                      <span className="radius-native px-4 py-1.5 rounded-full bg-white text-[#171717] font-extrabold text-[13px] uppercase tracking-wider shadow-lg">
                        Sold on Campus
                      </span>
                    </div>
                  )}

                  {/* Top-Right Floating Heart Button (Matches Screenshot) */}
                  <button
                    type="button"
                    onClick={handleToggleSave}
                    aria-label={isSaved ? "Remove from wishlist" : "Save to wishlist"}
                    className="radius-native absolute top-3 right-3 w-8 h-8 rounded-full bg-white/95 dark:bg-black/75 hover:bg-white text-[#171717] dark:text-white flex items-center justify-center shadow-sm transition-transform active:scale-90 cursor-pointer"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        isSaved ? "fill-rose-500 text-rose-500" : "text-[#22252A] dark:text-white"
                      }`}
                      strokeWidth={2}
                    />
                  </button>
                </div>
              </div>

              {/* Right of Gallery: Product Title, Price, Metadata, Quick Specs & Primary CTA (6 cols) */}
              <div className="md:col-span-6 flex flex-col">
                {/* Category Pill */}
                <div>
                  <span className="radius-native inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#EBF1F8] dark:bg-white/10 text-[#3B526B] dark:text-neutral-200">
                    {listing.category}
                  </span>
                </div>

                {/* Product Title */}
                <h1 className="mt-2 text-[22px] sm:text-[24px] font-extrabold tracking-[-0.02em] text-[#14171A] dark:text-white leading-tight">
                  {listing.title}
                </h1>

                {/* Price */}
                <div className="mt-1 flex items-center gap-2.5">
                  <span className="text-[21px] sm:text-[23px] font-extrabold text-[#14171A] dark:text-white tracking-[-0.02em]">
                    {listing.priceFormatted}
                  </span>
                  {isMarkedSold && (
                    <span className="radius-native text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300">
                      SOLD
                    </span>
                  )}
                </div>

                {/* 3 Metadata Rows: Condition, Campus Meetup, Posted Time */}
                <div className="mt-3 space-y-1.5 text-[12.5px] text-[#5B636E] dark:text-neutral-400">
                  <div className="flex items-center gap-2">
                    <Tag className="w-3.5 h-3.5 text-[#68707A] shrink-0" />
                    <span>
                      <strong className="font-bold text-[#171717] dark:text-white">
                        {listing.conditionLabel}
                      </strong>{" "}
                      · {listing.conditionNote}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#68707A] shrink-0" />
                    <span>{listing.location}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-[#68707A] shrink-0" />
                    <span>{listing.postedAgo}</span>
                  </div>
                </div>

                {/* Short Summary Description */}
                <p className="mt-3.5 text-[13px] text-[#4A5058] dark:text-neutral-300 leading-relaxed font-normal">
                  {listing.shortSummary}
                </p>

                {/* Quick Highlight Attributes Grid (Matches Screenshot) */}
                <div className="mt-4 pt-3.5 border-t border-[#ECEEF2] dark:border-white/10 grid grid-cols-2 sm:grid-cols-3 gap-y-2.5 gap-x-3">
                  {listing.quickHighlights.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-[12px] text-[#3A3F47] dark:text-neutral-300">
                      <div className="w-6 h-6 rounded-md bg-[#F1F3F6] dark:bg-white/5 flex items-center justify-center shrink-0">
                        {renderQuickIcon(item.icon)}
                      </div>
                      <span className="font-medium leading-tight">{item.label}</span>
                    </div>
                  ))}
                </div>

                {/* Primary Actions: Buyer vs Listing Owner */}
                {!isOwnerView ? (
                  <div className="mt-5 flex items-center gap-3">
                    <button
                      type="button"
                      disabled={isMarkedSold}
                      onClick={handleOpenChatWithContext}
                      className="radius-native flex-1 py-2.5 px-5 rounded-full bg-[#FFC928] hover:bg-[#F2BD1E] disabled:opacity-50 text-[#171717] font-bold text-[13px] shadow-xs flex items-center justify-center gap-2 transition-transform active:scale-98 cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4 stroke-[2.2]" />
                      <span>
                        {isMarkedSold
                          ? "Item Sold"
                          : listing.category === "Services"
                          ? "Contact provider"
                          : "Message seller"}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={handleToggleSave}
                      className={`radius-native py-2.5 px-5 rounded-full border text-[13px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                        isSaved
                          ? "bg-[#171717] text-white border-[#171717] dark:bg-white dark:text-[#171717]"
                          : "bg-white dark:bg-[#14161D] border-[#DCE0E6] dark:border-white/15 text-[#171717] dark:text-white hover:border-[#171717]"
                      }`}
                    >
                      <Bookmark
                        className={`w-3.5 h-3.5 ${
                          isSaved ? "fill-current" : ""
                        }`}
                      />
                      <span>{isSaved ? "Saved" : "Save"}</span>
                    </button>
                  </div>
                ) : (
                  /* Owner Management Controls */
                  <div className="mt-5 p-3 rounded-2xl bg-white dark:bg-[#14161D] border border-[#ECEEF2] dark:border-white/10 space-y-2">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#8C929C]">
                      Listing Owner Controls
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => showToast("Opening listing editor...")}
                        className="radius-native px-3 py-1.5 rounded-lg bg-[#F7F8FA] dark:bg-white/5 border border-[#ECEEF2] dark:border-white/10 text-[12px] font-semibold flex items-center gap-1.5 hover:border-[#171717] cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsMarkedSold((prev) => !prev);
                          showToast(
                            !isMarkedSold
                              ? "Listing marked as Sold!"
                              : "Listing reactivated as Available!"
                          );
                        }}
                        className="radius-native px-3 py-1.5 rounded-lg bg-[#FFC928] text-[#171717] text-[12px] font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>{isMarkedSold ? "Mark Available" : "Mark as Sold"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          showToast("Listing deleted.");
                          setTimeout(() => router.push("/explore"), 900);
                        }}
                        className="radius-native px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[12px] font-semibold flex items-center gap-1.5 hover:bg-rose-100 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ========================================================= */}
            {/* BELOW MAIN PRODUCT AREA: DETAILS | SPECS | REVIEWS CARD   */}
            {/* ========================================================= */}
            <div className="radius-native rounded-2xl bg-white dark:bg-[#14161D] border border-[#ECEEF2] dark:border-white/10 shadow-[0_2px_16px_rgba(15,23,42,0.02)] overflow-hidden">
              {/* Tabs Header */}
              <div className="flex items-center gap-6 px-5 sm:px-6 border-b border-[#ECEEF2] dark:border-white/10">
                {(
                  [
                    { id: "details", label: "Details" },
                    { id: "specs", label: "Specs" },
                    { id: "reviews", label: `Reviews (${listing.seller.reviewsCount})` },
                  ] as const
                ).map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`relative py-3.5 text-[13px] font-bold transition-colors cursor-pointer ${
                        isActive
                          ? "text-[#171717] dark:text-white"
                          : "text-[#68707A] dark:text-neutral-400 hover:text-[#171717] dark:hover:text-white"
                      }`}
                    >
                      {tab.label}
                      {isActive && (
                        <span className="absolute left-0 right-0 bottom-0 h-[2.5px] rounded-full bg-[#FFC928]" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Tab Body */}
              <div className="p-5 sm:p-6">
                {activeTab === "details" && (
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* Left Column: About, Why I'm Selling, Pickup/Delivery */}
                    <div className="md:col-span-7 space-y-5">
                      <div>
                        <h3 className="text-[13.5px] font-bold text-[#14171A] dark:text-white">
                          About this listing
                        </h3>
                        <p className="mt-1.5 text-[13px] text-[#4A5058] dark:text-neutral-300 leading-relaxed">
                          {listing.aboutDescription}
                        </p>
                      </div>

                      <div>
                        <h3 className="text-[13.5px] font-bold text-[#14171A] dark:text-white">
                          Why I&apos;m selling
                        </h3>
                        <p className="mt-1 text-[13px] text-[#4A5058] dark:text-neutral-300">
                          {listing.whySelling}
                        </p>
                      </div>

                      <div>
                        <h3 className="text-[13.5px] font-bold text-[#14171A] dark:text-white">
                          Pickup / Delivery
                        </h3>
                        <div className="mt-1.5 flex items-center gap-2 text-[13px] text-[#4A5058] dark:text-neutral-300">
                          <MapPin className="w-4 h-4 text-[#68707A] shrink-0" />
                          <span>{listing.pickupDetails}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Item Condition, Included Checklist, Category */}
                    <div className="md:col-span-5 space-y-5 md:border-l md:border-[#F1F3F6] dark:md:border-white/5 md:pl-6">
                      <div>
                        <div className="flex items-center gap-1.5 text-[12.5px] font-bold text-[#14171A] dark:text-white">
                          <Sparkles className="w-3.5 h-3.5 text-[#68707A]" />
                          <span>Item condition</span>
                        </div>
                        <div className="mt-1.5 flex items-center gap-2 text-[13px] text-[#4A5058] dark:text-neutral-300">
                          <Tag className="w-3.5 h-3.5 text-[#68707A] shrink-0" />
                          <span>
                            {listing.conditionLabel} - {listing.conditionNote}
                          </span>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-[13px] font-bold text-[#14171A] dark:text-white">
                          Included
                        </h3>
                        <ul className="mt-1.5 space-y-1.5">
                          {listing.includedItems.map((inc, i) => (
                            <li
                              key={i}
                              className="flex items-center gap-2 text-[13px] text-[#4A5058] dark:text-neutral-300"
                            >
                              <Check className="w-3.5 h-3.5 text-[#4A5058] dark:text-neutral-300 shrink-0 stroke-[2.3]" />
                              <span>{inc}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5 text-[12.5px] font-bold text-[#14171A] dark:text-white">
                          <Tag className="w-3.5 h-3.5 text-[#68707A]" />
                          <span>Category</span>
                        </div>
                        <p className="mt-1 text-[13px] text-[#4A5058] dark:text-neutral-300 pl-5">
                          {listing.subCategory}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "specs" && (
                  <div className="space-y-3">
                    <p className="text-[12.5px] text-[#68707A] dark:text-neutral-400">
                      Category-specific attributes for <strong>{listing.category}</strong>:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {listing.specifications.map((spec, idx) => (
                        <div
                          key={idx}
                          className="radius-native p-3 rounded-xl bg-[#F7F8FA] dark:bg-white/5 border border-[#ECEEF2] dark:border-white/5 flex flex-col justify-between"
                        >
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8C929C]">
                            {spec.label}
                          </span>
                          <span className="text-[13px] font-bold text-[#14171A] dark:text-white mt-0.5">
                            {spec.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "reviews" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-[#ECEEF2] dark:border-white/10">
                      <div className="flex items-center gap-2">
                        <span className="text-[18px] font-extrabold text-[#171717] dark:text-white">
                          {listing.seller.rating}
                        </span>
                        <div className="flex items-center text-[#FFC928]">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-current" />
                          ))}
                        </div>
                        <span className="text-[12.5px] text-[#68707A] dark:text-neutral-400">
                          Based on {listing.seller.reviewsCount} verified campus transactions
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {listing.reviews.map((rev) => (
                        <div
                          key={rev.id}
                          className="radius-native p-3.5 rounded-xl bg-[#F7F8FA] dark:bg-white/5 border border-[#ECEEF2] dark:border-white/5 space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-[13px] font-bold text-[#14171A] dark:text-white">
                                {rev.reviewerName}
                              </span>
                              <span className="text-[11.5px] text-[#8C929C] ml-2">
                                {rev.reviewerDept}
                              </span>
                            </div>
                            <span className="text-[11px] text-[#8C929C]">{rev.date}</span>
                          </div>
                          <p className="text-[12.5px] text-[#4A5058] dark:text-neutral-300 leading-relaxed">
                            {rev.comment}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT SIDEBAR: SELLER CREDIBILITY + SAFETY TIPS (4 Cols)  */}
          {/* ========================================================= */}
          <aside className="lg:col-span-4 space-y-4">
            {/* Seller Credibility Card (Matches Reference Image) */}
            <div className="radius-native rounded-2xl bg-white dark:bg-[#14161D] border border-[#ECEEF2] dark:border-white/10 p-5 shadow-[0_2px_16px_rgba(15,23,42,0.02)] space-y-4">
              <div className="flex items-start gap-3.5">
                <Link href={listing.seller.storeHref} className="shrink-0">
                  <img
                    src={listing.seller.avatar}
                    alt={listing.seller.name}
                    className="w-12 h-12 rounded-full object-cover border border-[#ECEEF2] dark:border-white/10"
                  />
                </Link>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <Link
                      href={listing.seller.storeHref}
                      className="text-[15px] font-bold text-[#14171A] dark:text-white hover:underline truncate"
                    >
                      {listing.seller.name}
                    </Link>
                    {listing.seller.isVerified && (
                      <BadgeCheck
                        className="w-4 h-4 text-[#171717] fill-[#FFC928] shrink-0"
                        aria-label="Verified student seller"
                      />
                    )}
                  </div>

                  <p className="text-[12px] text-[#68707A] dark:text-neutral-400 mt-0.5">
                    {listing.seller.department}
                  </p>
                </div>
              </div>

              <p className="text-[12.5px] text-[#4A5058] dark:text-neutral-300 leading-relaxed">
                {listing.seller.bio}
              </p>

              {/* 3-Column Seller Metrics */}
              <div className="grid grid-cols-3 divide-x divide-[#ECEEF2] dark:divide-white/10 pt-2 pb-1">
                <div className="pr-2">
                  <span className="block text-[14px] font-extrabold text-[#14171A] dark:text-white">
                    {listing.seller.reviewsCount}
                  </span>
                  <span className="text-[11px] text-[#68707A] dark:text-neutral-400">
                    Sales
                  </span>
                </div>

                <div className="px-3">
                  <span className="block text-[14px] font-extrabold text-[#14171A] dark:text-white">
                    {listing.seller.rating}
                  </span>
                  <span className="text-[11px] text-[#68707A] dark:text-neutral-400">
                    Rating
                  </span>
                </div>

                <div className="pl-3">
                  <span className="block text-[13px] font-extrabold text-[#14171A] dark:text-white">
                    {listing.seller.memberSince}
                  </span>
                  <span className="text-[11px] text-[#68707A] dark:text-neutral-400">
                    Joined
                  </span>
                </div>
              </div>

              <Link
                href={listing.seller.storeHref}
                className="radius-native w-full py-2.5 px-4 rounded-xl border border-[#E4E7EC] dark:border-white/15 hover:border-[#171717] dark:hover:border-white text-[12.5px] font-bold text-[#171717] dark:text-white flex items-center justify-between transition-colors"
              >
                <span>
                  {listing.seller.storeHref.startsWith("/stores")
                    ? "Visit storefront"
                    : "View seller profile"}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-[#68707A]" />
              </Link>
            </div>

            {/* Safety Tips Card (Matches Reference Image) */}
            <div className="radius-native rounded-2xl bg-white dark:bg-[#14161D] border border-[#ECEEF2] dark:border-white/10 p-5 shadow-[0_2px_16px_rgba(15,23,42,0.02)] space-y-3">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#171717] dark:text-white" strokeWidth={2} />
                <h3 className="text-[13.5px] font-bold text-[#14171A] dark:text-white">
                  Safety tips
                </h3>
              </div>

              <ul className="space-y-2.5 text-[12.5px] text-[#4A5058] dark:text-neutral-300">
                {[
                  "Meet in a public place on campus",
                  "Check the item before payment",
                  "Use in-app messaging",
                  "Report any suspicious activity",
                ].map((tip, i) => (
                  <li key={i} className="flex items-center gap-2.5">
                    <span className="w-4 h-4 rounded-full bg-[#FFC928] flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5 text-[#171717] stroke-[3]" />
                    </span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>

        {/* ========================================================= */}
        {/* RELATED LISTINGS SECTION (Uniform Calm Cards)             */}
        {/* ========================================================= */}
        <section aria-labelledby="related-listings-heading" className="mt-12 pt-8 border-t border-[#ECEEF2] dark:border-white/10">
          <div className="flex items-center justify-between gap-4 mb-5">
            <div>
              <h2
                id="related-listings-heading"
                className="text-[18px] sm:text-[20px] font-bold tracking-[-0.02em] text-[#14171A] dark:text-white"
              >
                Similar listings on campus
              </h2>
              <p className="text-[12.5px] text-[#8C929C] dark:text-neutral-400 mt-0.5">
                More items and services in {listing.category} and nearby campus landmarks.
              </p>
            </div>

            <div
              className="hidden sm:block flex-1 h-[1px] bg-[#E8EAEE] dark:bg-white/10"
              aria-hidden="true"
            />

            <Link
              href={`/explore?category=${encodeURIComponent(listing.category)}`}
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#22252A] dark:text-neutral-300 hover:text-[#171717] dark:hover:text-white shrink-0"
            >
              <span>Browse all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {relatedListings.map((item) => {
              const isItemSaved = Boolean(relatedSaved[item.id]);
              return (
                <div
                  key={item.id}
                  className="radius-native group rounded-2xl bg-white dark:bg-[#14161D] border border-[#ECEEF2] dark:border-white/10 p-3 shadow-[0_4px_20px_rgba(15,23,42,0.025)] hover:shadow-[0_8px_28px_rgba(15,23,42,0.06)] transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="radius-native relative h-[150px] sm:h-[160px] w-full rounded-xl bg-[#F6F7F9] dark:bg-white/5 overflow-hidden flex items-center justify-center">
                      <Link
                        href={item.href}
                        className="w-full h-full flex items-center justify-center focus:outline-none"
                      >
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                        />
                      </Link>

                      <div className="absolute top-2.5 right-2.5 flex flex-col items-end gap-1.5 z-10">
                        <span className="radius-native inline-flex items-center px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold bg-white/90 dark:bg-black/60 text-[#4A5058] dark:text-neutral-300 backdrop-blur-xs shadow-xs">
                          {item.condition || "Service"}
                        </span>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setRelatedSaved((prev) => ({
                              ...prev,
                              [item.id]: !prev[item.id],
                            }));
                          }}
                          className="radius-native w-7 h-7 rounded-full bg-white/90 dark:bg-black/60 hover:bg-white text-[#22252A] dark:text-neutral-200 flex items-center justify-center shadow-xs transition-transform active:scale-90 cursor-pointer"
                        >
                          <Heart
                            className={`w-3.5 h-3.5 ${
                              isItemSaved ? "fill-rose-500 text-rose-500" : ""
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 px-0.5">
                      <Link href={item.href} className="block focus:outline-none">
                        <h3 className="text-[14px] font-bold text-[#14171A] dark:text-white leading-snug truncate group-hover:underline">
                          {item.title}
                        </h3>
                      </Link>

                      <p className="mt-1 flex items-center gap-1 text-[12px] text-[#8C929C] dark:text-neutral-400">
                        <MapPin className="w-3 h-3 shrink-0 text-[#A0A6B0]" />
                        <span className="truncate">{item.landmark}</span>
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-[#F2F4F7] dark:border-white/5 flex items-center justify-between px-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[14.5px] font-extrabold text-[#171717] dark:text-white">
                        {item.priceFormatted}
                      </span>
                      {(item.sellerType === "verified_student" ||
                        item.sellerType === "student_store") && (
                        <span className="w-3.5 h-3.5 rounded-full bg-[#22C55E] flex items-center justify-center">
                          <Check className="w-2.2 h-2.2 text-white stroke-[3.5]" />
                        </span>
                      )}
                    </div>

                    <Link
                      href={item.href}
                      className="radius-native inline-flex items-center gap-1 rounded-lg border border-[#E4E7EC] dark:border-white/15 bg-white dark:bg-white/5 hover:bg-[#F7F8FA] px-2.5 py-1 text-[11.5px] font-semibold text-[#171717] dark:text-white transition-colors"
                    >
                      <span>View</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* ========================================================= */}
      {/* MOBILE STICKY ACTION BAR                                  */}
      {/* ========================================================= */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-[#14161D]/95 backdrop-blur-md border-t border-[#ECEEF2] dark:border-white/10 px-4 py-3 flex items-center justify-between gap-4">
        <div>
          <span className="block text-[16px] font-extrabold text-[#14171A] dark:text-white leading-tight">
            {listing.priceFormatted}
          </span>
          <span className="text-[11px] text-[#68707A] dark:text-neutral-400">
            {listing.conditionLabel} · {listing.location.split(",")[0]}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToggleSave}
            className="radius-native p-2.5 rounded-full border border-[#DCE0E6] dark:border-white/15 text-[#171717] dark:text-white"
            aria-label="Save listing"
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} />
          </button>

          <button
            type="button"
            disabled={isMarkedSold}
            onClick={handleOpenChatWithContext}
            className="radius-native py-2.5 px-5 rounded-full bg-[#FFC928] hover:bg-[#F2BD1E] text-[#171717] font-bold text-[13px] flex items-center gap-1.5 shadow-xs"
          >
            <MessageCircle className="w-4 h-4" />
            <span>
              {listing.category === "Services" ? "Contact provider" : "Message seller"}
            </span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* CONTEXTUAL CHAT MODAL (Automatically Attaches Listing)    */}
      {/* ========================================================= */}
      {isChatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="radius-native w-full max-w-md rounded-2xl bg-white dark:bg-[#14161D] border border-[#ECEEF2] dark:border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            {/* Modal Header: Seller Info */}
            <div className="px-4 py-3.5 border-b border-[#ECEEF2] dark:border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img
                  src={listing.seller.avatar}
                  alt={listing.seller.name}
                  className="w-9 h-9 rounded-full object-cover"
                />
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-[13.5px] font-bold text-[#14171A] dark:text-white">
                      {listing.seller.name}
                    </span>
                    {listing.seller.isVerified && (
                      <BadgeCheck
                        className="w-4 h-4 text-[#171717] fill-[#FFC928] shrink-0"
                        aria-label="Verified student seller"
                      />
                    )}
                  </div>
                  <p className="text-[11px] text-[#68707A] dark:text-neutral-400">
                    Typically replies within 10 mins
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsChatModalOpen(false)}
                className="p-1 rounded-full text-[#8C929C] hover:text-[#171717] dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Attached Listing Context Banner */}
            <div className="px-4 py-2.5 bg-[#F7F8FA] dark:bg-white/5 border-b border-[#ECEEF2] dark:border-white/10 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={listing.images[0]}
                  alt={listing.title}
                  className="w-10 h-10 rounded-lg object-cover shrink-0 border border-[#ECEEF2]"
                />
                <div className="min-w-0">
                  <p className="text-[12px] font-bold text-[#14171A] dark:text-white truncate">
                    {listing.title}
                  </p>
                  <p className="text-[11.5px] font-extrabold text-[#171717] dark:text-[#FFC928]">
                    {listing.priceFormatted} · {listing.location.split(",")[0]}
                  </p>
                </div>
              </div>
              <span className="radius-native text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFF9E6] text-[#A16207]">
                Attached
              </span>
            </div>

            {/* Chat Messages Body */}
            <div className="p-4 space-y-3 overflow-y-auto flex-1 min-h-[200px]">
              {sentMessages.length === 0 ? (
                <div className="text-center py-6 space-y-3">
                  <p className="text-[12px] text-[#68707A] dark:text-neutral-400">
                    Start a conversation with {listing.seller.name.split(" ")[0]} to arrange a campus meetup.
                  </p>
                  <div className="flex flex-wrap justify-center gap-1.5">
                    {[
                      "Is this still available?",
                      `Can we meet at ${listing.location.split(",")[0]} today?`,
                      "Is the price slightly negotiable?",
                    ].map((promptText, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setChatMessage(promptText)}
                        className="radius-native px-2.5 py-1 rounded-full bg-[#F7F8FA] dark:bg-white/5 border border-[#ECEEF2] dark:border-white/10 text-[11.5px] font-medium text-[#171717] dark:text-white hover:border-[#FFC928] cursor-pointer"
                      >
                        {promptText}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                sentMessages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex flex-col ${
                      m.sender === "you" ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`radius-native max-w-[82%] px-3.5 py-2 rounded-2xl text-[12.5px] leading-relaxed ${
                        m.sender === "you"
                          ? "bg-[#171717] text-white dark:bg-[#FFC928] dark:text-[#171717]"
                          : "bg-[#F1F3F6] dark:bg-white/10 text-[#171717] dark:text-white"
                      }`}
                    >
                      {m.text}
                    </div>
                    <span className="text-[10px] text-[#8C929C] mt-0.5 px-1">
                      {m.time}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Message Input Form */}
            <form
              onSubmit={handleSendContextualMessage}
              className="p-3 border-t border-[#ECEEF2] dark:border-white/10 space-y-2"
            >
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder={`Message ${listing.seller.name}...`}
                  className="radius-native flex-1 bg-[#F7F8FA] dark:bg-white/5 border border-[#ECEEF2] dark:border-white/10 rounded-xl px-3.5 py-2 text-[12.5px] text-[#171717] dark:text-white focus:outline-none focus:border-[#FFC928]"
                />
                <button
                  type="submit"
                  className="radius-native px-3.5 py-2 rounded-xl bg-[#FFC928] hover:bg-[#F2BD1E] text-[#171717] font-bold text-[12.5px] flex items-center gap-1 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#8C929C] px-1">
                <span>Protected by Campus Hive safety rules</span>
                <Link
                  href="/messages"
                  className="font-semibold text-[#171717] dark:text-white hover:underline inline-flex items-center gap-1"
                >
                  <span>Open full chat</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* REPORT LISTING MODAL                                      */}
      {/* ========================================================= */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="radius-native w-full max-w-md rounded-2xl bg-white dark:bg-[#14161D] border border-[#ECEEF2] dark:border-white/10 shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-2.5 border-b border-[#ECEEF2] dark:border-white/10">
              <div className="flex items-center gap-2">
                <Flag className="w-4 h-4 text-rose-600" />
                <h3 className="text-[15px] font-extrabold text-[#171717] dark:text-white">
                  Report Listing
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsReportModalOpen(false)}
                className="p-1 text-[#8C929C] hover:text-[#171717]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleReportSubmit} className="space-y-3 text-[12.5px]">
              <div>
                <label className="block font-bold text-[#171717] dark:text-white mb-1">
                  Reason for reporting
                </label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="radius-native w-full bg-[#F7F8FA] dark:bg-white/5 border border-[#ECEEF2] dark:border-white/10 rounded-xl px-3 py-2 text-[#171717] dark:text-white focus:outline-none"
                >
                  <option>Item already sold or unavailable</option>
                  <option>Suspicious pricing or off-campus prepayment request</option>
                  <option>Inaccurate photos or misleading condition</option>
                  <option>Prohibited campus item</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#171717] dark:text-white mb-1">
                  Additional details (optional)
                </label>
                <textarea
                  rows={3}
                  value={reportNote}
                  onChange={(e) => setReportNote(e.target.value)}
                  placeholder="Provide any context to help our campus moderators..."
                  className="radius-native w-full bg-[#F7F8FA] dark:bg-white/5 border border-[#ECEEF2] dark:border-white/10 rounded-xl px-3 py-2 text-[#171717] dark:text-white focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  className="px-3 py-1.5 text-[12px] font-medium text-[#68707A]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="radius-native px-4 py-2 rounded-xl bg-[#171717] dark:bg-white text-white dark:text-[#171717] font-bold text-[12px] cursor-pointer"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <RebrandFooter />
    </div>
  );
}
