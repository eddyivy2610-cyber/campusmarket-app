"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  BadgeCheck,
  MessageSquare,
  UserPlus,
  UserCheck,
  MoreHorizontal,
  Flag,
  Share2,
  Heart,
  Eye,
  ArrowRight,
  Star,
  ShieldCheck,
  RefreshCw,
  ChevronRight,
  Lightbulb,
  MapPin,
  Check,
  X,
  Settings,
  Store,
  Calendar,
  Lock,
  GraduationCap,
  User,
} from "lucide-react";
import { RebrandHeader } from "../../components/header/RebrandHeader";
import { useAuth } from "../../context/AuthContext";
import { followService } from "@/lib/followService";
import { apiGet } from "@/lib/apiClient";

export function formatSalesMilestone(sales: number): string {
  if (sales >= 1000) return `${Math.floor(sales / 1000)}k+`;
  if (sales >= 500) return "500+";
  if (sales >= 250) return "250+";
  if (sales >= 100) return "100+";
  if (sales >= 50) return "50+";
  if (sales >= 25) return "25+";
  if (sales >= 10) return "10+";
  if (sales >= 5) return "5+";
  return sales > 0 ? "5+" : "New";
}

export function formatFollowers(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1).replace(/\.0$/, "")}m`;
  if (count >= 1000) return `${(count / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return count.toLocaleString();
}

interface ProfileListingItem {
  id: string;
  title: string;
  price: string;
  status: "Available" | "In deal" | "Sold";
  likes: number;
  views: number;
  image: string;
  href: string;
}

interface ProfileReviewItem {
  id: string;
  authorName: string;
  authorHandle: string;
  authorAvatar: string;
  dateLabel: string;
  rating: number;
  comment: string;
  contextBadge: string;
}

interface ProfilePreviewData {
  id: string;
  handle: string;
  name: string;
  username: string;
  isStudentSeller: boolean;
  isVerified: boolean;
  location: string;
  bio: string;
  avatar: string;
  coverImage: string;
  sales: number;
  rating: number;
  reviewsCount: number;
  joined: string;
  listingsCount: number;
  followersCount?: number;
  listings: ProfileListingItem[];
  reviews: ProfileReviewItem[];
  ratingBreakdown: { stars: number; count: number }[];
}

const PUBLIC_PROFILE_DATA: Record<string, ProfilePreviewData> = {};
/* Legacy mock profile data removed from runtime.
const LEGACY_PROFILE_DATA: Record<string, ProfilePreviewData> = {
  legacySeller: {
    id: "user-tunde-bello",
    handle: "legacy-seller",
    name: "Tunde Bello",
    username: "@legacy-seller",
    isStudentSeller: true,
    isVerified: true,
    location: "Samaru, Zaria · Main Campus",
    bio: "Tech enthusiast, problem solver and student entrepreneur. I sell quality gadgets and useful accessories. Always open to fair negotiations. Let's do business! ✌️",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=320&auto=format&fit=crop&q=80",
    coverImage:
      "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1400&auto=format&fit=crop&q=80",
    sales: 28,
    rating: 4.8,
    reviewsCount: 18,
    joined: "Oct 2026",
    followersCount: 1240,
    listingsCount: 12,
    listings: [
      {
        id: "lst-hp-elitebook",
        title: "HP EliteBook 840 G5",
        price: "₦185,000",
        status: "Available",
        likes: 12,
        views: 3,
        image:
          "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&auto=format&fit=crop&q=80",
        href: "/listings/lst-hp-elitebook",
      },
      {
        id: "lst-iphone-11",
        title: "iPhone 11 (128GB)",
        price: "₦160,000",
        status: "Available",
        likes: 8,
        views: 2,
        image:
          "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&auto=format&fit=crop&q=80",
        href: "/listings/lst-iphone-11",
      },
      {
        id: "lst-casio-991es",
        title: "Casio Scientific Calculator",
        price: "₦6,500",
        status: "Available",
        likes: 15,
        views: 4,
        image:
          "https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=600&auto=format&fit=crop&q=80",
        href: "/listings/lst-casio-991es",
      },
      {
        id: "lst-sony-whch520",
        title: "Sony WH-CH520",
        price: "₦32,000",
        status: "In deal",
        likes: 6,
        views: 1,
        image:
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
        href: "/listings/lst-sony-whch520",
      },
    ],
    reviews: [
      {
        id: "rev-1",
        authorName: "Campus Closet",
        authorHandle: "campus-closet",
        authorAvatar:
          "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
        dateLabel: "2 days ago",
        rating: 5,
        comment:
          "Laptop was in perfect condition. Easy to communicate with and met at the library as agreed.",
        contextBadge: "Product · Completed",
      },
      {
        id: "rev-2",
        authorName: "Tech Corner",
        authorHandle: "tech-corner",
        authorAvatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
        dateLabel: "1 week ago",
        rating: 5,
        comment:
          "Great seller! Very responsive and the item was exactly as described.",
        contextBadge: "Product · Completed",
      },
    ],
    ratingBreakdown: [
      { stars: 5, count: 14 },
      { stars: 4, count: 3 },
      { stars: 3, count: 1 },
      { stars: 2, count: 0 },
      { stars: 1, count: 0 },
    ],
  },

  "campus-closet": {
    id: "store-campus-closet",
    handle: "campus-closet",
    name: "Campus Closet",
    username: "@campuscloset",
    isStudentSeller: true,
    isVerified: true,
    location: "Suleiman Hall · Samaru Campus",
    bio: "Student-run vintage thrift and curated campus streetwear. Hand-picked quality denim, everyday sneakers, and essentials tailored for university life.",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=320&auto=format&fit=crop&q=80",
    coverImage:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1400&auto=format&fit=crop&q=80",
    sales: 42,
    rating: 4.9,
    reviewsCount: 24,
    joined: "Sep 2025",
    listingsCount: 8,
    listings: [
      {
        id: "prod-101",
        title: "Vintage Denim Trucker Jacket",
        price: "₦8,500",
        status: "Available",
        likes: 19,
        views: 7,
        image:
          "https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=600&auto=format&fit=crop&q=80",
        href: "/listings/prod-101",
      },
      {
        id: "prod-102",
        title: "Campus Oversized Fleece Hoodie",
        price: "₦7,200",
        status: "Available",
        likes: 14,
        views: 5,
        image:
          "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&auto=format&fit=crop&q=80",
        href: "/listings/prod-102",
      },
      {
        id: "prod-103",
        title: "Nike Air Pegasus '89 (Size 43)",
        price: "₦14,000",
        status: "Available",
        likes: 11,
        views: 4,
        image:
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80",
        href: "/listings/prod-103",
      },
      {
        id: "prod-104",
        title: "Heavyweight Canvas Tote Bag",
        price: "₦3,500",
        status: "Available",
        likes: 9,
        views: 3,
        image:
          "https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=80",
        href: "/listings/prod-104",
      },
    ],
    reviews: [
      {
        id: "rev-cc-1",
        authorName: "Tunde Bello",
        authorHandle: "legacy-seller",
        authorAvatar:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        dateLabel: "3 days ago",
        rating: 5,
        comment:
          "Clean denim jacket, exactly as pictured. Quick pickup near Suleiman Hall.",
        contextBadge: "Product · Completed",
      },
    ],
    ratingBreakdown: [
      { stars: 5, count: 21 },
      { stars: 4, count: 3 },
      { stars: 3, count: 0 },
      { stars: 2, count: 0 },
      { stars: 1, count: 0 },
    ],
  },

  "tech-corner": {
    id: "store-tech-corner",
    handle: "tech-corner",
    name: "Tech Corner",
    username: "@techcorner",
    isStudentSeller: true,
    isVerified: true,
    location: "Engineering Complex · Samaru",
    bio: "Reliable student tech hub near Engineering and Science faculties. Tested UK-used laptops, fast NVMe SSD upgrades, and original phone accessories.",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=320&auto=format&fit=crop&q=80",
    coverImage:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1400&auto=format&fit=crop&q=80",
    sales: 64,
    rating: 4.8,
    reviewsCount: 31,
    joined: "Jan 2026",
    listingsCount: 10,
    listings: [
      {
        id: "prod-201",
        title: "Apple 45W MagSafe 2 Adapter",
        price: "₦12,500",
        status: "Available",
        likes: 10,
        views: 4,
        image:
          "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&auto=format&fit=crop&q=80",
        href: "/listings/prod-201",
      },
      {
        id: "prod-202",
        title: "Anker 20,000mAh Power Bank",
        price: "₦18,000",
        status: "Available",
        likes: 16,
        views: 6,
        image:
          "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600&auto=format&fit=crop&q=80",
        href: "/listings/prod-202",
      },
      {
        id: "prod-203",
        title: "Kingston 512GB NVMe SSD",
        price: "₦24,000",
        status: "Available",
        likes: 14,
        views: 5,
        image:
          "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600&auto=format&fit=crop&q=80",
        href: "/listings/prod-203",
      },
      {
        id: "prod-204",
        title: "JBL Tune 510BT Headphones",
        price: "₦22,000",
        status: "In deal",
        likes: 11,
        views: 3,
        image:
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
        href: "/listings/prod-204",
      },
    ],
    reviews: [
      {
        id: "rev-tc-1",
        authorName: "Tunde Bello",
        authorHandle: "legacy-seller",
        authorAvatar:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        dateLabel: "5 days ago",
        rating: 5,
        comment:
          "Upgraded my laptop SSD in 20 minutes right at the Engineering complex.",
        contextBadge: "Service · Completed",
      },
    ],
    ratingBreakdown: [
      { stars: 5, count: 26 },
      { stars: 4, count: 4 },
      { stars: 3, count: 1 },
      { stars: 2, count: 0 },
      { stars: 1, count: 0 },
    ],
  },

  "the-print-hub": {
    id: "store-the-print-hub",
    handle: "the-print-hub",
    name: "The Print Hub",
    username: "@theprinthub",
    isStudentSeller: false,
    isVerified: false,
    location: "Student Social Centre (SUB)",
    bio: "Commercial printing & binding centre on Samaru campus. Fast turnarounds on undergraduate final year projects, A1/A2 architectural plotting, and colour prints.",
    avatar:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=320&auto=format&fit=crop&q=80",
    coverImage:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1400&auto=format&fit=crop&q=80",
    sales: 112,
    rating: 4.7,
    reviewsCount: 29,
    joined: "Mar 2025",
    listingsCount: 6,
    listings: [
      {
        id: "prod-301",
        title: "Spiral-Bound Lecture Compendiums",
        price: "₦1,800",
        status: "Available",
        likes: 9,
        views: 4,
        image:
          "https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=600&auto=format&fit=crop&q=80",
        href: "/listings/prod-301",
      },
      {
        id: "prod-302",
        title: "Hardcover Gold-Foil Thesis Binding",
        price: "₦5,500",
        status: "Available",
        likes: 18,
        views: 8,
        image:
          "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80",
        href: "/listings/prod-302",
      },
    ],
    reviews: [
      {
        id: "rev-ph-1",
        authorName: "Campus Closet",
        authorHandle: "campus-closet",
        authorAvatar:
          "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
        dateLabel: "1 week ago",
        rating: 5,
        comment:
          "Sharp A1 architectural prints and zero smudges. Ready in 15 minutes.",
        contextBadge: "Service · Completed",
      },
    ],
    ratingBreakdown: [
      { stars: 5, count: 22 },
      { stars: 4, count: 5 },
      { stars: 3, count: 2 },
      { stars: 2, count: 0 },
      { stars: 1, count: 0 },
    ],
  },

  "kongo-scholars": {
    id: "store-kongo-scholars",
    handle: "kongo-scholars",
    name: "Kongo Scholars Bookshop",
    username: "@kongoscholars",
    isStudentSeller: false,
    isVerified: false,
    location: "Faculty of Law · Kongo Campus",
    bio: "Academic bookshop for Law, Accounting & Administration texts. Complete case law compendiums, revised statute booklets, and ICAN study packs.",
    avatar:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=320&auto=format&fit=crop&q=80",
    coverImage:
      "https://images.unsplash.com/photo-1507842229356-51c61504d3ab?w=1400&auto=format&fit=crop&q=80",
    sales: 79,
    rating: 4.8,
    reviewsCount: 21,
    joined: "Nov 2025",
    listingsCount: 9,
    listings: [
      {
        id: "prod-501",
        title: "Nigerian Constitutional Law",
        price: "₦6,500",
        status: "Available",
        likes: 14,
        views: 5,
        image:
          "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=600&auto=format&fit=crop&q=80",
        href: "/listings/prod-501",
      },
      {
        id: "prod-502",
        title: "ICAN Accounting Study Pack",
        price: "₦8,000",
        status: "Available",
        likes: 11,
        views: 4,
        image:
          "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80",
        href: "/listings/prod-502",
      },
    ],
    reviews: [
      {
        id: "rev-ks-1",
        authorName: "Tech Corner",
        authorHandle: "tech-corner",
        authorAvatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
        dateLabel: "4 days ago",
        rating: 5,
        comment:
          "Had all the 300L Constitutional Law materials in stock at fair prices.",
        contextBadge: "Product · Completed",
      },
    ],
    ratingBreakdown: [
      { stars: 5, count: 17 },
      { stars: 4, count: 3 },
      { stars: 3, count: 1 },
      { stars: 2, count: 0 },
      { stars: 1, count: 0 },
    ],
  },
}; */

type ProfileTab = "overview" | "listings" | "reviews" | "about";

export default function ProfilePage() {
  const params = useParams();
  const rawHandle = ((params?.handle as string) || "me")
    .replace(/^@/, "")
    .toLowerCase();

  const { user, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<ProfileTab>("overview");
  const [isFollowing, setIsFollowing] = useState(false);
  const [showSalesMilestone, setShowSalesMilestone] = useState<boolean>(true);
  const [followersCount, setFollowersCount] = useState<number>(0);
  const [liveUserListings, setLiveUserListings] = useState<ProfileListingItem[]>([]);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState(
    "Suspicious or misleading activity"
  );
  const [reportNote, setReportNote] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [savedOwnProfile, setSavedOwnProfile] = useState<{
    name?: string;
    username?: string;
    bio?: string;
    location?: string;
    avatar?: string;
    coverImage?: string;
  } | null>(null);
  const [liveUserProfile, setLiveUserProfile] = useState<any>(null);
  const [liveProfileError, setLiveProfileError] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  const moreMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("ch_profile_identity_v1");
      if (raw) {
        setSavedOwnProfile(JSON.parse(raw));
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  const customSavedHandle = !user && savedOwnProfile?.username
    ? savedOwnProfile.username.replace(/^@/, "").toLowerCase()
    : "";

  const isOwnProfile = Boolean(
    rawHandle === "me" ||
    (user?.handle && rawHandle === user.handle.replace(/^@/, "").toLowerCase()) ||
    (user?.id && rawHandle === user.id.toLowerCase()) ||
    (user?.id && liveUserProfile && String(liveUserProfile._id || liveUserProfile.id).toLowerCase() === user.id.toLowerCase()) ||
    (customSavedHandle && rawHandle === customSavedHandle)
  );

  const isKnownProfile =
    isOwnProfile || Boolean(liveUserProfile) || Boolean(PUBLIC_PROFILE_DATA[rawHandle]);

  useEffect(() => {
    if (authLoading) return;
    let isCancelled = false;
    setIsProfileLoading(true);
    setLiveProfileError(false);

    const endpoint =
      isOwnProfile && user?.id
        ? "/api/users/profile"
        : rawHandle && rawHandle !== "me"
          ? `/api/users/profile?handle=${encodeURIComponent(rawHandle)}`
          : null;

    if (!endpoint) {
      setIsProfileLoading(false);
      return;
    }

    apiGet<any>(endpoint)
      .then((response) => {
        if (!isCancelled) {
          const loaded = response?.data || response?.user || null;
          setLiveUserProfile(loaded);
          if (isOwnProfile && !loaded) {
            setLiveProfileError(true);
          }
        }
      })
      .catch(() => {
        if (!isCancelled && isOwnProfile && !user) {
          setLiveProfileError(true);
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsProfileLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [authLoading, isOwnProfile, rawHandle, user?.id]);

  // Fetch live listings for the resolved profile (own or public)
  useEffect(() => {
    let isCancelled = false;
    const sellerId =
      liveUserProfile?._id ||
      liveUserProfile?.id ||
      (isOwnProfile ? user?.id : null);
    if (sellerId) {
      fetch(`/api/listings?sellerId=${encodeURIComponent(sellerId)}&limit=50`, {
        credentials: "include",
      })
        .then((res) => res.json())
        .then((json) => {
          if (!isCancelled && json.success && Array.isArray(json.data)) {
            const mapped: ProfileListingItem[] = json.data.map((item: any) => ({
              id: item._id || item.id,
              title: item.title,
              price: typeof item.price === "number" ? `₦${item.price.toLocaleString()}` : String(item.price || "0"),
              status: item.status === "in_deal" ? "In deal" : item.status === "sold" ? "Sold" : "Available",
              likes: 0,
              views: item.views || 0,
              image: item.images?.[0] || "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80",
              href: `/listings/${item._id || item.id}`,
            }));
            setLiveUserListings(mapped);
          }
        })
        .catch(() => {});
    }
    return () => {
      isCancelled = true;
    };
  }, [isOwnProfile, liveUserProfile?._id, liveUserProfile?.id, user?.id]);

  const ownBaseProfile: ProfilePreviewData = {
    id: liveUserProfile?._id || liveUserProfile?.id || user?.id || "my-profile",
    handle: liveUserProfile?.profile?.handle || user?.handle || customSavedHandle || "me",
    name: liveUserProfile?.name || liveUserProfile?.profile?.displayName || user?.name || savedOwnProfile?.name || "Campus Student",
    username: `@${(liveUserProfile?.profile?.handle || user?.handle || customSavedHandle || "student").replace(/^@/, "")}`,
    isStudentSeller: Boolean(liveUserProfile?.isStudent ?? user?.isStudent),
    isVerified: Boolean(liveUserProfile?.studentVerified ?? user?.studentVerified),
    location: liveUserProfile?.campus || (!user ? savedOwnProfile?.location : "") || "Campus",
    bio: liveUserProfile?.profile?.bio || (!user ? savedOwnProfile?.bio : "") || "Campus student on Campus Hive.",
    avatar: liveUserProfile?.profile?.avatar || (!user ? savedOwnProfile?.avatar : "") || user?.avatar || user?.image || "",
    coverImage: liveUserProfile?.profile?.coverImage || (!user ? savedOwnProfile?.coverImage : "") || "",
    sales: 0,
    rating: 5.0,
    reviewsCount: 0,
    joined: liveUserProfile?.createdAt
      ? new Date(liveUserProfile.createdAt).toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        })
      : "Recent",
    followersCount: 0,
    listingsCount: liveUserListings.length,
    listings: liveUserListings,
    reviews: [],
    ratingBreakdown: [
      { stars: 5, count: 0 },
      { stars: 4, count: 0 },
      { stars: 3, count: 0 },
      { stars: 2, count: 0 },
      { stars: 1, count: 0 },
    ],
  };

  const baseProfile: ProfilePreviewData = isOwnProfile
    ? ownBaseProfile
    : PUBLIC_PROFILE_DATA[rawHandle] || ownBaseProfile;

  // Merge user-editable profile fields for own profile while strictly keeping verification status read-only
  const profile: ProfilePreviewData =
    isOwnProfile && savedOwnProfile && !user
      ? {
          ...baseProfile,
          name: savedOwnProfile.name || baseProfile.name,
          handle: customSavedHandle || baseProfile.handle,
          username: savedOwnProfile.username
            ? `@${savedOwnProfile.username.replace(/^@/, "")}`
            : baseProfile.username,
          bio: savedOwnProfile.bio ?? baseProfile.bio,
          location: savedOwnProfile.location || baseProfile.location,
          avatar: savedOwnProfile.avatar || baseProfile.avatar,
          coverImage: savedOwnProfile.coverImage || baseProfile.coverImage,
          // Never allow profile edits to silently alter verified student status
          isStudentSeller: baseProfile.isStudentSeller,
          isVerified: baseProfile.isVerified,
        }
      : baseProfile;

  useEffect(() => {
    if (baseProfile?.followersCount) {
      setFollowersCount(baseProfile.followersCount);
    }
    try {
      const storedPrivacy = localStorage.getItem("ch_privacy_show_sales_milestones");
      if (storedPrivacy !== null) {
        setShowSalesMilestone(storedPrivacy !== "false");
      }
    } catch {
      // ignore storage errors
    }

    const handlePrivacySync = () => {
      try {
        const storedPrivacy = localStorage.getItem("ch_privacy_show_sales_milestones");
        if (storedPrivacy !== null) {
          setShowSalesMilestone(storedPrivacy !== "false");
        }
      } catch {}
    };

    window.addEventListener("ch_privacy_update", handlePrivacySync);
    return () => window.removeEventListener("ch_privacy_update", handlePrivacySync);
  }, [baseProfile?.followersCount]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        moreMenuRef.current &&
        !moreMenuRef.current.contains(e.target as Node)
      ) {
        setIsMoreMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isSellerAccount = Boolean(
    liveUserProfile?.role === "seller" ||
      liveUserProfile?.sellerStatus === "approved" ||
      liveUserProfile?.sellerStatus === "verified" ||
      (isOwnProfile &&
        (user?.role === "seller" ||
          user?.sellerStatus === "approved" ||
          user?.sellerStatus === "verified")) ||
      PUBLIC_PROFILE_DATA[rawHandle]
  );

  const isFollowableSeller = isSellerAccount;

  useEffect(() => {
    if (!isOwnProfile && isFollowableSeller && profile?.id) {
      followService
        .checkFollowingStatus(profile.id)
        .then((res) => {
          if (res?.success) setIsFollowing(res.isFollowing);
        })
        .catch(() => {});
    }
  }, [isOwnProfile, isFollowableSeller, profile?.id]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsReportModalOpen(false);
    setReportNote("");
    showToast(`Report submitted for ${profile.name}`);
  };

  if (!isKnownProfile && (authLoading || isProfileLoading)) {
    return (
      <div
        style={{ fontFamily: "var(--font-plus-jakarta), sans-serif" }}
        className="min-h-screen bg-[#F7F8FA] dark:bg-[#0E1015] text-[#171717] dark:text-white antialiased"
      >
        <RebrandHeader />
        <main className="max-w-[1380px] mx-auto px-5 sm:px-8 lg:px-12 py-6 sm:py-8 space-y-5">
          <div className="radius-native rounded-2xl bg-white dark:bg-[#14161D] border border-[#E8E8E8] dark:border-white/10 overflow-hidden">
            <div className="hive-skeleton h-28 sm:h-32 w-full" />
            <div className="px-5 sm:px-7 pb-6 pt-4 flex flex-col sm:flex-row items-start gap-4 sm:gap-5">
              <div className="-mt-14 sm:-mt-16 w-24 h-24 sm:w-[120px] sm:h-[120px] rounded-full border-4 border-white dark:border-[#14161D] hive-skeleton shrink-0" />
              <div className="space-y-2 flex-1 pt-2">
                <div className="hive-skeleton h-6 w-48 rounded-lg" />
                <div className="hive-skeleton h-4 w-72 rounded-md" />
                <div className="hive-skeleton h-3.5 w-40 rounded-md" />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!isKnownProfile) {
    return (
      <div
        style={{ fontFamily: "var(--font-plus-jakarta), sans-serif" }}
        className="min-h-screen bg-[#F7F8FA] dark:bg-[#0E1015] text-[#171717] dark:text-white antialiased"
      >
        <RebrandHeader />
        <main className="max-w-[1240px] mx-auto px-4 sm:px-6 pt-24 pb-32 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white dark:bg-[#14161D] border border-[#E8E8E8] dark:border-white/10 flex items-center justify-center mx-auto mb-4 text-[#8C929C]">
            <User className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold">Profile not found</h1>
          <p className="text-[13px] text-[#8C929C] mt-1 mb-6">
            The campus profile @{rawHandle} could not be found or has not been created yet.
          </p>
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FFC928] text-[#171717] font-bold text-[13px] hover:bg-[#E5B524] transition-colors"
          >
            Back to Explore
          </Link>
        </main>
      </div>
    );
  }

  if (isOwnProfile && liveProfileError) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] dark:bg-[#0E1015] text-[#171717] dark:text-white antialiased">
        <RebrandHeader />
        <main className="max-w-[1240px] mx-auto px-4 sm:px-6 pt-24 pb-32 text-center">
          <h1 className="text-xl font-bold">Profile temporarily unavailable</h1>
          <p className="text-[13px] text-[#8C929C] mt-2">We could not load your live profile. Please try again shortly.</p>
        </main>
      </div>
    );
  }

  return (
    <div
      style={{ fontFamily: "var(--font-plus-jakarta), sans-serif" }}
      className="min-h-screen bg-[#F7F8FA] dark:bg-[#0E1015] text-[#171717] dark:text-white antialiased"
    >
      {/* Global Top Navigation */}
      <RebrandHeader />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#171717] text-white px-4 py-2.5 rounded-xl shadow-lg text-xs font-semibold flex items-center gap-2 border border-white/10">
          <Check className="w-4 h-4 text-[#FFC928] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container matching Explore, Stores, Radar, and Messages */}
      <main className="max-w-[1380px] mx-auto px-5 sm:px-8 lg:px-12 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_340px] gap-6 items-start">
          {/* =============================================================== */}
          {/* LEFT COLUMN: PROFILE HEADER + TABS + LISTINGS + REVIEWS         */}
          {/* =============================================================== */}
          <div className="min-w-0 space-y-5">
            {/* 1. PROFILE HEADER CARD (Wireframe Layout) */}
            <section className="radius-native relative rounded-2xl bg-white dark:bg-[#14161D] border border-[#E8E8E8] dark:border-white/10 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              {/* Banner / Cover Image */}
              <div className="relative h-28 sm:h-32 w-full bg-[#E8ECF2] dark:bg-white/5 rounded-t-2xl overflow-hidden">
                {profile.coverImage ? (
                  <img src={profile.coverImage} alt={`${profile.name} cover`} className="w-full h-full object-cover" />
                ) : null}
              </div>

              {/* Profile Header Body matching wireframe:
                  Left: Avatar overlapping cover
                  Middle: Name + Tick + @username inline -> Bio -> Location
                  Right: 3 Milestones (Sales · Rating · Joined) -> Follow + Message + Settings (own) / 3-dots (others) */}
              <div className="px-5 sm:px-7 pb-6 pt-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  {/* Left + Middle Identity Block */}
                  <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-5 min-w-0 flex-1">
                    {/* Avatar overlapping cover */}
                    <div className="-mt-14 sm:-mt-16 shrink-0 relative z-10">
                      {profile.avatar ? (
                        <img src={profile.avatar} alt={profile.name} className="w-24 h-24 sm:w-[120px] sm:h-[120px] rounded-full object-cover border-4 border-white dark:border-[#14161D] shadow-md bg-white" />
                      ) : (
                        <div className="w-24 h-24 sm:w-[120px] sm:h-[120px] rounded-full border-4 border-white dark:border-[#14161D] shadow-md bg-[#E8ECF2] dark:bg-white/10" aria-label="Profile image unavailable" />
                      )}
                    </div>

                    {/* Middle Info: Row 1 (Name + Tick + @username) -> Row 2 (Bio for sellers) -> Row 3 (Location + Join Date) */}
                    <div className="min-w-0 flex-1 space-y-2">
                      {/* Row 1: Name + Single Tick + @username inline */}
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <div className="inline-flex items-center gap-1.5">
                          <h1 className="text-[20px] sm:text-[22px] font-extrabold tracking-[-0.02em] text-[#171717] dark:text-white leading-tight">
                            {profile.name}
                          </h1>
                          {isSellerAccount && profile.isStudentSeller && profile.isVerified && (
                            <BadgeCheck
                              className="w-5 h-5 text-[#171717] fill-[#FFC928] shrink-0 translate-y-[1px]"
                              aria-label="Verified student seller"
                            />
                          )}
                        </div>

                        <span className="text-[13.5px] font-medium text-[#7A818C] dark:text-neutral-400">
                          {profile.username}
                        </span>
                      </div>

                      {/* Row 2: Bio (Only for seller accounts) */}
                      {isSellerAccount && (
                        <p className="text-[13px] text-[#3F454D] dark:text-neutral-300 leading-[1.55] max-w-[490px]">
                          {profile.bio}
                        </p>
                      )}

                      {/* Row 3: Location with Pin Icon + Joined with Calendar */}
                      <div className="flex flex-wrap items-center gap-y-1 gap-x-4 pt-0.5 text-[12.5px] font-medium text-[#68707A] dark:text-neutral-400">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#8C929C] shrink-0" />
                          <span>{profile.location}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#8C929C] shrink-0" />
                          <span>Joined {profile.joined}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Block: Stats (Sellers Only) + Action Buttons */}
                  <div className="md:w-[320px] lg:w-[360px] shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-[#ECEEF2] dark:border-white/10 flex flex-col items-stretch gap-3">
                    {/* Stat Card Box (Only for seller accounts): 3 stats (Followers · Reviews · Rating) */}
                    {isSellerAccount && (
                      <div className="rounded-2xl border border-[#ECEEF2] dark:border-white/10 bg-[#F9FAFB] dark:bg-white/[0.03] p-3 sm:p-3.5 shadow-2xs">
                        <div className="grid grid-cols-3 divide-x divide-[#ECEEF2] dark:divide-white/10 text-center">
                          {/* 1. Followers */}
                          <div className="px-1 sm:px-2">
                            <div className="text-[15px] sm:text-[16.5px] font-extrabold text-[#171717] dark:text-white leading-tight">
                              {formatFollowers(followersCount)}
                            </div>
                            <div className="text-[11px] sm:text-[11.5px] font-medium text-[#7A818C] dark:text-neutral-400 mt-0.5">
                              Followers
                            </div>
                          </div>

                          {/* 2. Review count */}
                          <div className="px-1 sm:px-2">
                            <div className="text-[15px] sm:text-[16.5px] font-extrabold text-[#171717] dark:text-white leading-tight">
                              {profile.reviewsCount}
                            </div>
                            <div className="text-[11px] sm:text-[11.5px] font-medium text-[#7A818C] dark:text-neutral-400 mt-0.5">
                              Reviews
                            </div>
                          </div>

                          {/* 3. Rating */}
                          <div className="px-1 sm:px-2">
                            <div className="inline-flex items-center justify-center gap-1 text-[15px] sm:text-[16.5px] font-extrabold text-[#171717] dark:text-white leading-tight">
                              <span>{profile.rating}</span>
                              <Star className="w-3.5 h-3.5 fill-[#FFC928] text-[#FFC928] shrink-0 -translate-y-0.5" />
                            </div>
                            <div className="text-[11px] sm:text-[11.5px] font-medium text-[#7A818C] dark:text-neutral-400 mt-0.5">
                              Rating
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons Row */}
                    <div className="flex items-center gap-2 w-full">
                      {isOwnProfile ? (
                        <>
                          <Link
                            href="/stores?view=storefront"
                            className="radius-native flex-1 h-9 px-3.5 rounded-lg bg-[#FFC928] hover:bg-[#F2BD1E] text-[#171717] text-[12.5px] font-bold inline-flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
                          >
                            <Store className="w-3.5 h-3.5 stroke-[2.2]" />
                            <span>Storefront</span>
                          </Link>

                          <Link
                            href="/settings"
                            aria-label="Account and profile settings"
                            title="Settings"
                            className="radius-native flex-1 h-9 px-3.5 rounded-lg border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-white/5 hover:border-[#171717] dark:hover:border-white text-[#171717] dark:text-white text-[12.5px] font-bold inline-flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <Settings className="w-4 h-4 stroke-[2]" />
                            <span>Settings</span>
                          </Link>
                        </>
                      ) : (
                        <>
                          {isFollowableSeller && (
                            <button
                              type="button"
                              onClick={async () => {
                                try {
                                  const res = await followService.toggleFollow(profile.id);
                                  if (res?.success) {
                                    setIsFollowing(res.isFollowing);
                                    setFollowersCount((prev) =>
                                      res.isFollowing ? prev + 1 : Math.max(0, prev - 1)
                                    );
                                    showToast(
                                      res.isFollowing
                                        ? `Following ${profile.name}`
                                        : `Unfollowed ${profile.name}`
                                    );
                                  }
                                } catch (err: any) {
                                  showToast(err.message || "Failed to update follow status");
                                }
                              }}
                              className={`radius-native flex-1 h-9 px-3.5 rounded-lg border text-[12.5px] font-bold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                                isFollowing
                                  ? "bg-[#171717] border-[#171717] text-white dark:bg-white dark:border-white dark:text-[#171717]"
                                  : "bg-white dark:bg-white/5 border-[#DCE0E6] dark:border-white/15 text-[#171717] dark:text-white hover:border-[#171717]"
                              }`}
                            >
                              {isFollowing ? (
                                <>
                                  <UserCheck className="w-3.5 h-3.5 stroke-[2.2]" />
                                  <span>Following</span>
                                </>
                              ) : (
                                <>
                                  <UserPlus className="w-3.5 h-3.5 stroke-[2.2]" />
                                  <span>Follow</span>
                                </>
                              )}
                            </button>
                          )}

                          <Link
                            href={`/messages?user=${encodeURIComponent(
                              profile.id
                            )}&name=${encodeURIComponent(profile.name)}`}
                            className="radius-native flex-1 h-9 px-3.5 rounded-lg bg-[#FFC928] hover:bg-[#F2BD1E] text-[#171717] text-[12.5px] font-bold inline-flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
                          >
                            <MessageSquare className="w-3.5 h-3.5 stroke-[2.2]" />
                            <span>Message</span>
                          </Link>

                          <div className="relative shrink-0" ref={moreMenuRef}>
                            <button
                              type="button"
                              onClick={() => setIsMoreMenuOpen((prev) => !prev)}
                              aria-label="More profile options"
                              title="More options"
                              className="radius-native w-9 h-9 rounded-lg border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-white/5 hover:border-[#171717] flex items-center justify-center text-[#5B636E] hover:text-[#171717] dark:text-neutral-300 dark:hover:text-white transition-colors cursor-pointer"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </button>

                            {isMoreMenuOpen && (
                              <div className="radius-native absolute right-0 mt-2 w-48 rounded-xl bg-white dark:bg-[#181B24] border border-[#E8E8E8] dark:border-white/10 shadow-lg py-1.5 z-30">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setIsMoreMenuOpen(false);
                                    if (typeof window !== "undefined") {
                                      navigator.clipboard?.writeText(
                                        window.location.href
                                      );
                                    }
                                    showToast("Profile link copied");
                                  }}
                                  className="w-full px-3.5 py-2 text-left text-[12.5px] font-semibold text-[#171717] dark:text-white hover:bg-[#F7F8FA] dark:hover:bg-white/5 flex items-center gap-2.5 cursor-pointer"
                                >
                                  <Share2 className="w-3.5 h-3.5 text-[#68707A]" />
                                  <span>Share profile</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setIsMoreMenuOpen(false);
                                    setIsReportModalOpen(true);
                                  }}
                                  className="w-full px-3.5 py-2 text-left text-[12.5px] font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2.5 cursor-pointer"
                                >
                                  <Flag className="w-3.5 h-3.5" />
                                  <span>Report user</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 2. PROFILE TABS BAR (Seller Accounts Only) */}
            {isSellerAccount && (
              <div className="border-b border-[#E5E8EE] dark:border-white/10 flex items-center gap-6 sm:gap-8 px-1">
                {(
                  [
                    { id: "overview", label: "Overview" },
                    {
                      id: "listings",
                      label: `Listings (${profile.listings.length})`,
                    },
                    {
                      id: "reviews",
                      label: `Reviews (${profile.reviewsCount})`,
                    },
                    { id: "about", label: "About" },
                  ] as { id: ProfileTab; label: string }[]
                ).map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`relative pb-3 text-[13.5px] transition-colors cursor-pointer ${
                        isActive
                          ? "font-bold text-[#171717] dark:text-white"
                          : "font-medium text-[#68707A] dark:text-neutral-400 hover:text-[#171717] dark:hover:text-white"
                      }`}
                    >
                      {tab.label}
                      {isActive && (
                        <span className="absolute left-0 right-0 bottom-0 h-[3px] rounded-full bg-[#FFC928]" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* 3. RECENT LISTINGS (Seller) / PROMOTIONS (Non-Seller) SECTION */}
            {(!isSellerAccount || activeTab === "overview" || activeTab === "listings") && (
              <section className="radius-native rounded-2xl bg-white dark:bg-[#14161D] border border-[#E8E8E8] dark:border-white/10 p-5 sm:p-6 space-y-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                <div className="flex items-center justify-between">
                  <h2 className="text-[16px] font-extrabold text-[#171717] dark:text-white tracking-[-0.01em]">
                    {!isSellerAccount
                      ? "Promotions"
                      : activeTab === "listings"
                        ? "All Listings"
                        : "Recent Listings"}
                  </h2>
                  {isSellerAccount && activeTab === "overview" && (
                    <button
                      type="button"
                      onClick={() => setActiveTab("listings")}
                      className="text-[12.5px] font-bold text-[#5B636E] hover:text-[#171717] dark:text-neutral-400 dark:hover:text-white inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>View all</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div
                  className={
                    isSellerAccount && activeTab === "overview"
                      ? "flex sm:grid sm:grid-cols-2 xl:grid-cols-4 overflow-x-auto sm:overflow-visible snap-x snap-mandatory gap-3 sm:gap-4 pb-1 sm:pb-0 -mx-1 px-1 sm:mx-0 sm:px-0 scrollbar-none"
                      : "grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4"
                  }
                >
                  {profile.listings.length === 0 ? (
                    <div className="col-span-full py-10 text-center text-[13px] text-[#8C929C] w-full">
                      {!isSellerAccount
                        ? "No active promotions posted yet."
                        : "No active listings posted yet."}
                    </div>
                  ) : (
                    profile.listings.map((item) => (
                    <div
                      key={item.id}
                      className={`radius-native rounded-xl border border-[#ECEEF2] dark:border-white/10 bg-white dark:bg-[#181B24] overflow-hidden flex flex-col hover:border-[#D5D9E0] transition-colors ${
                        isSellerAccount && activeTab === "overview"
                          ? "w-[41vw] min-w-[148px] max-w-[180px] sm:w-auto sm:min-w-0 sm:max-w-none shrink-0 snap-start"
                          : ""
                      }`}
                    >
                      <div className="relative h-28 sm:h-36 w-full bg-[#F3F4F6] dark:bg-white/5 overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          aria-label="Listing options"
                          className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-white/85 backdrop-blur-xs flex items-center justify-center text-[#4A5058] hover:text-[#171717]"
                        >
                          <MoreHorizontal className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2.5">
                        <div className="space-y-1">
                          <Link
                            href={`/messages?user=${encodeURIComponent(
                              profile.id
                            )}&name=${encodeURIComponent(
                              profile.name
                            )}&contextType=product&contextId=${encodeURIComponent(
                              item.id
                            )}&contextTitle=${encodeURIComponent(
                              item.title
                            )}&contextPrice=${encodeURIComponent(
                              item.price
                            )}&contextImage=${encodeURIComponent(item.image)}`}
                            className="block text-[13px] font-bold text-[#171717] dark:text-white hover:underline truncate"
                          >
                            {item.title}
                          </Link>
                          <div className="flex items-center justify-between gap-1.5">
                            <p className="text-[14px] font-extrabold text-[#171717] dark:text-white">
                              {item.price}
                            </p>
                            {profile.isStudentSeller && profile.isVerified && (
                              <span
                                title="Verified student seller"
                                className="radius-native w-3.5 h-3.5 rounded-full bg-[#22C55E] flex items-center justify-center shrink-0"
                              >
                                <Check className="w-2.2 h-2.2 text-white stroke-[3.2]" />
                              </span>
                            )}
                          </div>
                          <div className="pt-0.5">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-bold ${
                                item.status === "Available"
                                  ? "bg-[#E8F8F0] text-[#15803D]"
                                  : "bg-[#FFF4D6] text-[#B45309]"
                              }`}
                            >
                              {item.status}
                            </span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-[#F1F3F6] dark:border-white/10 flex items-center gap-3 text-[11px] font-semibold text-[#8C929C]">
                          <span className="inline-flex items-center gap-1">
                            <Heart className="w-3.2 h-3.2" />
                            {item.likes}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Eye className="w-3.2 h-3.2" />
                            {item.views}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                  )}
                </div>
              </section>
            )}

            {/* 4. REVIEWS SECTION (Seller Accounts Only) */}
            {isSellerAccount && (activeTab === "overview" || activeTab === "reviews") && (
              <section className="radius-native rounded-2xl bg-white dark:bg-[#14161D] border border-[#E8E8E8] dark:border-white/10 p-5 sm:p-6 space-y-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                <div className="flex items-center justify-between">
                  <h2 className="text-[16px] font-extrabold text-[#171717] dark:text-white tracking-[-0.01em]">
                    Reviews
                  </h2>
                  {activeTab === "overview" && (
                    <button
                      type="button"
                      onClick={() => setActiveTab("reviews")}
                      className="text-[12.5px] font-bold text-[#5B636E] hover:text-[#171717] dark:text-neutral-400 dark:hover:text-white inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>View all</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-[270px_1fr] gap-4 items-stretch">
                  {/* Rating Summary Box */}
                  <div className="radius-native rounded-xl border border-[#ECEEF2] dark:border-white/10 bg-[#FAFBFD] dark:bg-white/[0.02] p-4 flex items-center gap-4">
                    <div className="text-center pr-3 border-r border-[#ECEEF2] dark:border-white/10 shrink-0">
                      <div className="flex items-center justify-center gap-1.5">
                        <div className="w-7 h-7 rounded-full bg-[#FFF4CC] flex items-center justify-center">
                          <Star className="w-4 h-4 fill-[#F5B800] text-[#F5B800]" />
                        </div>
                        <span className="text-[24px] font-extrabold text-[#171717] dark:text-white">
                          {profile.rating}
                        </span>
                      </div>
                      <p className="text-[11px] font-medium text-[#7A818C] mt-1">
                        ({profile.reviewsCount} reviews)
                      </p>
                    </div>

                    <div className="flex-1 space-y-1.5">
                      {profile.ratingBreakdown.map((row) => {
                        const pct =
                          profile.reviewsCount > 0
                            ? Math.round(
                                (row.count / profile.reviewsCount) * 100
                              )
                            : 0;
                        return (
                          <div
                            key={row.stars}
                            className="flex items-center gap-2 text-[11px] font-bold text-[#5B636E]"
                          >
                            <span className="w-5 inline-flex items-center gap-0.5">
                              {row.stars}
                              <Star className="w-2.5 h-2.5 fill-[#171717] text-[#171717] dark:fill-white dark:text-white" />
                            </span>
                            <div className="flex-1 h-1.5 rounded-full bg-[#ECEEF2] dark:bg-white/10 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-[#F5B800]"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="w-4 text-right text-[#7A818C]">
                              {row.count}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Individual Review Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profile.reviews.map((rev) => (
                      <div
                        key={rev.id}
                        className="radius-native rounded-xl border border-[#ECEEF2] dark:border-white/10 p-4 flex flex-col justify-between space-y-2.5"
                      >
                        <div className="space-y-2">
                          <Link
                            href={`/profile/${rev.authorHandle}`}
                            className="flex items-center gap-2.5 group"
                          >
                            <img
                              src={rev.authorAvatar}
                              alt={rev.authorName}
                              className="w-9 h-9 rounded-full object-cover border border-[#E8E8E8]"
                            />
                            <div>
                              <h3 className="text-[13px] font-bold text-[#171717] dark:text-white group-hover:underline leading-tight">
                                {rev.authorName}
                              </h3>
                              <p className="text-[11px] text-[#8C929C]">
                                {rev.dateLabel}
                              </p>
                            </div>
                          </Link>

                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`w-3.5 h-3.5 ${
                                  s <= rev.rating
                                    ? "fill-[#F5B800] text-[#F5B800]"
                                    : "text-[#E2E6EC]"
                                }`}
                              />
                            ))}
                          </div>

                          <p className="text-[12.5px] text-[#4A5058] dark:text-neutral-300 leading-relaxed">
                            {rev.comment}
                          </p>
                        </div>

                        <div>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-[#E8F8F0] text-[#15803D]">
                            {rev.contextBadge}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* 5. ABOUT TAB VIEW (Seller Accounts Only) */}
            {isSellerAccount && activeTab === "about" && (
              <section className="radius-native rounded-2xl bg-white dark:bg-[#14161D] border border-[#E8E8E8] dark:border-white/10 p-5 sm:p-6 space-y-3 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                <h2 className="text-[16px] font-extrabold text-[#171717] dark:text-white">
                  About {profile.name}
                </h2>
                <p className="text-[13.5px] text-[#4A5058] dark:text-neutral-300 leading-relaxed">
                  {profile.bio}
                </p>
                <div className="pt-2 flex flex-wrap gap-6 text-[12.5px] text-[#68707A]">
                  <div>
                    <span className="font-bold text-[#171717] dark:text-white">
                      Location:{" "}
                    </span>
                    {profile.location}
                  </div>
                  <div>
                    <span className="font-bold text-[#171717] dark:text-white">
                      Joined:{" "}
                    </span>
                    {profile.joined}
                  </div>
                  <div>
                    <span className="font-bold text-[#171717] dark:text-white">
                      Sales:{" "}
                    </span>
                    {showSalesMilestone ? formatSalesMilestone(profile.sales) : "Private"}
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* =============================================================== */}
          {/* RIGHT COLUMN: TRUST AT A GLANCE + MARKETPLACE PROMO             */}
          {/* =============================================================== */}
          <aside className="space-y-5 lg:sticky lg:top-[88px] lg:self-start">
            {/* Trust at a glance Card (Seller Accounts Only) */}
            {isSellerAccount && (
              <div className="radius-native rounded-2xl bg-white dark:bg-[#14161D] border border-[#E8E8E8] dark:border-white/10 p-5 space-y-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                <h2 className="text-[15px] font-extrabold text-[#171717] dark:text-white tracking-[-0.01em]">
                  Trust at a glance
                </h2>

                <div className="divide-y divide-[#F1F3F6] dark:divide-white/10">
                  {profile.isStudentSeller && profile.isVerified ? (
                    <div className="py-3 first:pt-0 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-[#FFF4CC] flex items-center justify-center shrink-0">
                          <BadgeCheck className="w-5 h-5 text-[#171717] fill-[#FFC928]" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[13px] font-bold text-[#171717] dark:text-white truncate">
                            Campus verified
                          </p>
                          <p className="text-[11.5px] text-[#7A818C] truncate">
                            Verified student seller at ABU Zaria
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#9AA1AC] shrink-0" />
                    </div>
                  ) : (
                    <div className="py-3 first:pt-0 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-[#F1F3F6] dark:bg-white/10 flex items-center justify-center shrink-0">
                          <ShieldCheck className="w-4.5 h-4.5 text-[#5B636E]" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[13px] font-bold text-[#171717] dark:text-white truncate">
                            Non-student seller
                          </p>
                          <p className="text-[11.5px] text-[#7A818C] truncate">
                            Unverified · Active campus vendor
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#9AA1AC] shrink-0" />
                    </div>
                  )}

                  <div className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-[#EFF6FF] flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-4.5 h-4.5 text-[#2563EB]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-bold text-[#171717] dark:text-white truncate">
                          Reliable seller
                        </p>
                        <p className="text-[11.5px] text-[#7A818C] truncate">
                          Consistently positive feedback
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#9AA1AC] shrink-0" />
                  </div>

                  <div className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-[#F1F3F6] dark:bg-white/10 flex items-center justify-center shrink-0">
                        {showSalesMilestone ? (
                          <RefreshCw className="w-4 h-4 text-[#171717] dark:text-white" />
                        ) : (
                          <Lock className="w-4 h-4 text-[#8C929C]" />
                        )}
                      </div>
                      <div className="min-w-0">
                        {showSalesMilestone ? (
                          <>
                            <p className="text-[13px] font-bold text-[#171717] dark:text-white truncate">
                              {formatSalesMilestone(profile.sales)} confirmed exchanges
                            </p>
                            <p className="text-[11.5px] text-[#7A818C] truncate">
                              Campus verified exchange milestone
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="text-[13px] font-bold text-[#7A818C] dark:text-neutral-400 truncate">
                              Exchange milestone private
                            </p>
                            <p className="text-[11.5px] text-[#9AA1AC] truncate">
                              Seller chose to keep milestone private
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                    {isOwnProfile ? (
                      <Link
                        href="/dashboard/settings"
                        title="Manage milestone privacy in Dashboard"
                        className="text-[11.5px] font-semibold text-[#8C929C] hover:text-[#171717] dark:hover:text-white flex items-center gap-1 shrink-0"
                      >
                        <span className="hidden sm:inline">Privacy</span>
                        <ChevronRight className="w-4 h-4 text-[#9AA1AC] shrink-0" />
                      </Link>
                    ) : (
                      <ChevronRight className="w-4 h-4 text-[#9AA1AC] shrink-0" />
                    )}
                  </div>

                  <div className="py-3 last:pb-0 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-[#FFF4CC] flex items-center justify-center shrink-0">
                        <Star className="w-4 h-4 fill-[#F5B800] text-[#F5B800]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-bold text-[#171717] dark:text-white truncate">
                          {profile.rating} · {profile.reviewsCount} reviews
                        </p>
                        <p className="text-[11.5px] text-[#7A818C] truncate">
                          From eligible transactions
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#9AA1AC] shrink-0" />
                  </div>
                </div>
              </div>
            )}

            {/* Seller / Non-Seller Right Promo Card */}
            {isSellerAccount ? (
              <div className="radius-native rounded-2xl bg-[#FDF6DF] dark:bg-[#FFC928]/10 border border-[#F5E6B8] dark:border-[#FFC928]/25 p-5 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#FFF0B8] flex items-center justify-center shrink-0">
                    <Lightbulb className="w-4 h-4 text-[#B45309]" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-[13.5px] font-extrabold text-[#171717] dark:text-white">
                      Looking for something else?
                    </h3>
                    <p className="text-[12px] text-[#5B636E] dark:text-neutral-300 leading-relaxed">
                      Check out more listings from {profile.name} or browse
                      similar sellers.
                    </p>
                  </div>
                </div>

                <div className="pl-11">
                  <Link
                    href="/explore"
                    className="radius-native h-9 px-4 rounded-full bg-white dark:bg-[#14161D] border border-[#171717]/20 dark:border-white/20 hover:border-[#171717] text-[12px] font-bold text-[#171717] dark:text-white inline-flex items-center gap-1.5 transition-colors"
                  >
                    <span>Explore marketplace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="radius-native rounded-2xl bg-[#FDF6DF] dark:bg-[#FFC928]/10 border border-[#F5E6B8] dark:border-[#FFC928]/25 p-5 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#FFF0B8] flex items-center justify-center shrink-0">
                    <Store className="w-4 h-4 text-[#B45309]" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-[13.5px] font-extrabold text-[#171717] dark:text-white">
                      Register as a seller for more features
                    </h3>
                    <p className="text-[12px] text-[#5B636E] dark:text-neutral-300 leading-relaxed">
                      Open a campus storefront to unlock full catalog management, verified trust badges, customer reviews, and followers.
                    </p>
                  </div>
                </div>

                <div className="pl-11">
                  <Link
                    href="/onboarding/seller"
                    className="radius-native h-9 px-4 rounded-full bg-white dark:bg-[#14161D] border border-[#171717]/20 dark:border-white/20 hover:border-[#171717] text-[12px] font-bold text-[#171717] dark:text-white inline-flex items-center gap-1.5 transition-colors"
                  >
                    <span>Register as a seller</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </aside>
        </div>
      </main>

      {/* Report Modal triggered from the 3-Dots Menu next to Follow */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="radius-native w-full max-w-md rounded-2xl bg-white dark:bg-[#14161D] border border-[#E8E8E8] dark:border-white/10 p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flag className="w-4 h-4 text-rose-600" />
                <h3 className="text-[15px] font-extrabold text-[#171717] dark:text-white">
                  Report {profile.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsReportModalOpen(false)}
                className="p-1 rounded-full text-[#8C929C] hover:text-[#171717] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleReportSubmit} className="space-y-3">
              <div>
                <label className="block text-[11.5px] font-bold text-[#5B636E] mb-1">
                  Reason
                </label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-[#181B24] text-[12.5px] font-medium text-[#171717] dark:text-white focus:outline-none focus:border-[#171717]"
                >
                  <option value="Suspicious or misleading activity">
                    Suspicious or misleading activity
                  </option>
                  <option value="Item not as described">
                    Item not as described
                  </option>
                  <option value="Inappropriate behavior">
                    Inappropriate behavior
                  </option>
                  <option value="Spam or fake listing">
                    Spam or fake listing
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-[11.5px] font-bold text-[#5B636E] mb-1">
                  Additional details (optional)
                </label>
                <textarea
                  rows={3}
                  value={reportNote}
                  onChange={(e) => setReportNote(e.target.value)}
                  placeholder="Share any context that can help our campus moderation team..."
                  className="w-full p-3 rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-[#181B24] text-[12.5px] text-[#171717] dark:text-white focus:outline-none focus:border-[#171717] resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  className="h-9 px-4 rounded-full border border-[#DCE0E6] text-[12px] font-bold text-[#5B636E] hover:text-[#171717] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-9 px-4 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-[12px] font-bold cursor-pointer"
                >
                  Submit report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
