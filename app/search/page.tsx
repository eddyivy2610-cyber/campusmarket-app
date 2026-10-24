"use client";

import React, { Suspense, useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Search,
  X,
  ArrowRight,
  Heart,
  MapPin,
  Check,
  BadgeCheck,
  Store,
  User,
} from "lucide-react";

import { RebrandHeader } from "../components/header/RebrandHeader";
import { RebrandFooter } from "../components/sections/RebrandFooter";
import { PageSkeleton } from "../components/common/LoadingSystem";
import { ExploreListingItem } from "../data/exploreCatalog";
import type { StorefrontItem, WantedRequestItem } from "../data/mvpMockData";

type SearchFeatureTab =
  | "all"
  | "products"
  | "services"
  | "stores"
  | "profiles"
  | "wanted";

interface SearchProfileItem {
  id: string;
  name: string;
  handle: string;
  role: string;
  sellerStatus: string;
  campus: string;
  isStudent: boolean;
  studentVerified: boolean;
  avatar: string;
  bio: string;
}

function mapApiListingToExploreItem(item: any): ExploreListingItem {
  const isService = item.listingType === "service";
  const numPrice = typeof item.price === "number" ? item.price : 0;
  const sellerObj = typeof item.sellerId === "object" ? item.sellerId : null;
  const sellerName =
    sellerObj?.name || sellerObj?.profile?.displayName || "Campus Student";
  const sellerHandle =
    sellerObj?.handle ||
    sellerObj?.profile?.handle ||
    (item.sellerId ? String(item.sellerId).slice(-6) : "campus-seller");
  const sellerType = item.storeId ? "student_store" : "verified_student";

  const condition = item.condition || (isService ? undefined : "Used");
  const conditionTone: "neutral" | "green" =
    condition === "New" ? "green" : "neutral";

  const imageUrl =
    Array.isArray(item.images) && item.images.length > 0 && item.images[0]
      ? item.images[0]
      : "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80";

  return {
    id: item._id || item.id,
    title: item.title || "Untitled Listing",
    price: numPrice,
    priceFormatted: item.priceFormatted || `₦${numPrice.toLocaleString()}`,
    category: (item.category || "Electronics") as any,
    itemType: isService ? "service" : "product",
    condition,
    conditionTone,
    landmark: item.location || item.campus || "ABU Samaru Main Campus",
    sellerName,
    sellerHandle,
    sellerType,
    imageUrl,
    href: `/listings/${item._id || item.id}`,
    createdAtTimestamp: new Date(item.createdAt || Date.now()).getTime(),
    keywords: [item.title, item.category, item.location, item.campus].filter(
      Boolean
    ),
    serviceRateLabel: isService
      ? item.serviceDetails?.pricingModel === "hourly"
        ? "₦ / hour"
        : "Per project"
      : undefined,
  };
}

function mapApiStoreToStorefrontItem(store: any): StorefrontItem {
  const isStudent =
    store.storeType === "student_store" || store.storeType === "student_owned";
  return {
    id: store._id || store.id,
    slug: store.slug || store._id,
    handle: store.slug || store._id,
    name: store.name,
    tagline: store.description?.slice(0, 100) || "Campus seller storefront.",
    category: store.category || "General",
    verificationType: isStudent ? "verified_student" : "verified_business",
    campusSlug: store.campus || "abu-samaru",
    campusShortName: store.campus || "ABU Samaru",
    pickupLandmark: store.operatingLocation || store.campus || "Samaru Campus",
    responseTime: "Replies in ~15 mins",
    activeListingsCount: store.metrics?.listingsCount || 0,
    avatar: store.logo || "",
    featuredProducts: store.categoryTags || [],
  };
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F7F8FA] dark:bg-[#0E1015] transition-colors">
          <RebrandHeader />
          <PageSkeleton title={true} cards={8} />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<SearchFeatureTab>("all");
  const [savedIds, setSavedIds] = useState<Record<string, boolean>>({});

  const [dbListings, setDbListings] = useState<ExploreListingItem[]>([]);
  const [dbStores, setDbStores] = useState<StorefrontItem[]>([]);
  const [dbProfiles, setDbProfiles] = useState<SearchProfileItem[]>([]);
  const [, setIsSearching] = useState(false);

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
    }
  }, [initialQuery]);

  // Live search from canonical Next.js APIs (Products, Services, Stores, Profiles)
  useEffect(() => {
    let isCancelled = false;
    async function executeLiveSearch() {
      if (!query.trim()) {
        setDbListings([]);
        setDbStores([]);
        setDbProfiles([]);
        return;
      }
      try {
        setIsSearching(true);
        const encoded = encodeURIComponent(query.trim());
        const [listingsRes, storesRes, profilesRes] = await Promise.all([
          fetch(`/api/listings?q=${encoded}&status=active&limit=30`),
          fetch(`/api/stores?q=${encoded}&status=active&limit=20`),
          fetch(`/api/users/profile?q=${encoded}&limit=20`),
        ]);

        if (!isCancelled) {
          if (listingsRes.ok) {
            const listJson = await listingsRes.json();
            if (listJson.success && Array.isArray(listJson.data)) {
              setDbListings(listJson.data.map(mapApiListingToExploreItem));
            }
          }
          if (storesRes.ok) {
            const storeJson = await storesRes.json();
            if (storeJson.success && Array.isArray(storeJson.data)) {
              setDbStores(storeJson.data.map(mapApiStoreToStorefrontItem));
            }
          }
          if (profilesRes.ok) {
            const profileJson = await profilesRes.json();
            if (profileJson.success && Array.isArray(profileJson.data)) {
              setDbProfiles(profileJson.data);
            }
          }
        }
      } catch (err) {
        console.warn("[SearchPage] Live search failed:", err);
      } finally {
        if (!isCancelled) setIsSearching(false);
      }
    }

    const timer = setTimeout(executeLiveSearch, 200);
    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  const toggleSave = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSavedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Filtered Products & Services
  const matchingListings = useMemo(() => {
    if (
      activeTab === "stores" ||
      activeTab === "profiles" ||
      activeTab === "wanted"
    ) {
      return [];
    }
    const q = query.toLowerCase().trim();

    return dbListings.filter((item) => {
      if (activeTab === "products" && item.itemType !== "product") return false;
      if (activeTab === "services" && item.itemType !== "service") return false;

      if (q) {
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesCat = item.category.toLowerCase().includes(q);
        const matchesLoc = item.landmark.toLowerCase().includes(q);
        const matchesKw = item.keywords.some((k) =>
          k.toLowerCase().includes(q)
        );
        if (!matchesTitle && !matchesCat && !matchesLoc && !matchesKw)
          return false;
      }
      return true;
    });
  }, [dbListings, query, activeTab]);

  // Filtered Stores
  const matchingStores = useMemo(() => {
    if (
      activeTab === "products" ||
      activeTab === "services" ||
      activeTab === "profiles" ||
      activeTab === "wanted"
    ) {
      return [];
    }
    const q = query.toLowerCase().trim();

    return dbStores.filter((store) => {
      if (q) {
        const matchesName = store.name.toLowerCase().includes(q);
        const matchesTagline = store.tagline.toLowerCase().includes(q);
        const matchesCat = store.category.toLowerCase().includes(q);
        const matchesProd = store.featuredProducts.some((p) =>
          p.toLowerCase().includes(q)
        );
        if (!matchesName && !matchesTagline && !matchesCat && !matchesProd)
          return false;
      }
      return true;
    });
  }, [dbStores, query, activeTab]);

  // Filtered Profiles
  const matchingProfiles = useMemo(() => {
    if (
      activeTab === "products" ||
      activeTab === "services" ||
      activeTab === "stores" ||
      activeTab === "wanted"
    ) {
      return [];
    }
    return dbProfiles;
  }, [dbProfiles, activeTab]);

  // Filtered Wanted Requests from local radar requests
  const matchingWanted = useMemo(() => {
    if (
      activeTab === "products" ||
      activeTab === "services" ||
      activeTab === "stores" ||
      activeTab === "profiles"
    ) {
      return [];
    }
    const q = query.toLowerCase().trim();
    let localPosts: any[] = [];
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("ch_radar_posts");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) localPosts = parsed;
        }
      } catch {}
    }

    return localPosts
      .map(
        (post: any): WantedRequestItem => ({
          id: post.id,
          title: post.requestText || "Wanted request",
          description: post.requestText || "",
          budgetMin: typeof post.budgetMin === "number" ? post.budgetMin : 5000,
          budgetMax:
            typeof post.budgetMax === "number" ? post.budgetMax : 10000,
          category: post.category || "Academics",
          campusSlug: "abu-zaria-samaru",
          campusShortName: "ABU Samaru",
          preferredLandmark: post.requesterLocation || "Campus",
          urgency: "Urgent",
          status: "Open",
          requesterName: post.requesterName || "Campus Student",
          requesterHandle: post.requesterHandle || "student",
          requesterDepartment: post.requesterDept || "Student",
          responsesCount: Array.isArray(post.replies) ? post.replies.length : 0,
          postedAt: post.timeAgo || "Recently",
        })
      )
      .filter((req) => {
        if (q) {
          const matchesTitle = req.title.toLowerCase().includes(q);
          const matchesCat = req.category.toLowerCase().includes(q);
          const matchesLoc = req.preferredLandmark.toLowerCase().includes(q);
          if (!matchesTitle && !matchesCat && !matchesLoc) return false;
        }
        return true;
      });
  }, [query, activeTab]);

  const totalCount =
    matchingListings.length +
    matchingStores.length +
    matchingProfiles.length +
    matchingWanted.length;

  return (
    <div
      style={{ fontFamily: "var(--font-plus-jakarta), sans-serif" }}
      className="min-h-screen flex flex-col bg-[#F7F8FA] dark:bg-[#0E1015] text-[#171717] dark:text-white antialiased"
    >
      <RebrandHeader />

      <main className="flex-1 w-full max-w-[1380px] mx-auto px-5 sm:px-8 lg:px-12 py-7 space-y-6">
        {/* Search Header & Input */}
        <section className="max-w-[760px] mx-auto text-center space-y-3">
          <h1 className="text-[22px] sm:text-[26px] font-extrabold text-[#14171A] dark:text-white tracking-[-0.02em]">
            Search Campus Hive
          </h1>
          <p className="text-[13px] text-[#68707A] dark:text-neutral-400">
            One search across all products, services, stores, profiles, and wanted requests.
          </p>

          {/* Clean Focused Search Input */}
          <div className="relative mt-2">
            <div className="radius-native relative flex items-center w-full rounded-2xl bg-white dark:bg-[#14161D] border border-[#ECEEF2] dark:border-white/10 px-4 py-3 shadow-[0_4px_24px_rgba(15,23,42,0.04)] focus-within:border-[#171717] dark:focus-within:border-white transition-all">
              <Search className="w-4 h-4 text-[#8C929C] mr-3 shrink-0" />
              <input
                type="text"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by item, service, store name, or @profile..."
                className="w-full bg-transparent text-[13.5px] text-[#171717] dark:text-white placeholder:text-[#8C929C] focus:outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="p-1 text-[#8C929C] hover:text-[#171717] dark:hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Quick Trending Suggestions */}
          <div className="flex items-center justify-center gap-2 flex-wrap text-[11.5px] text-[#8C929C] pt-1">
            <span>Popular:</span>
            {[
              "Calculator",
              "Standing fan",
              "MacBook",
              "Graphics",
              "Course packs",
            ].map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => setQuery(term)}
                className="hover:text-[#171717] dark:hover:text-white underline cursor-pointer"
              >
                {term}
              </button>
            ))}
          </div>
        </section>

        {/* Feature Tabs & Result Count */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-[#ECEEF2] dark:border-white/10">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none w-full sm:w-auto">
            {[
              { id: "all", label: `All (${totalCount})` },
              {
                id: "products",
                label: `Products (${dbListings.filter((i) => i.itemType === "product").length})`,
              },
              {
                id: "services",
                label: `Services (${dbListings.filter((i) => i.itemType === "service").length})`,
              },
              { id: "stores", label: `Stores (${dbStores.length})` },
              { id: "profiles", label: `Profiles (${dbProfiles.length})` },
              { id: "wanted", label: `Wanted (${matchingWanted.length})` },
            ].map((tab) => {
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as SearchFeatureTab)}
                  className={`radius-native px-3 py-1.5 rounded-xl text-[12px] font-semibold transition-all cursor-pointer shrink-0 ${
                    isSelected
                      ? "bg-[#171717] text-white dark:bg-white dark:text-[#171717] shadow-xs"
                      : "bg-white dark:bg-[#14161D] border border-[#ECEEF2] dark:border-white/10 text-[#5B636E] dark:text-neutral-300 hover:border-[#171717]"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <span className="text-[12px] font-medium text-[#8C929C]">
            {totalCount} total {totalCount === 1 ? "match" : "matches"}
          </span>
        </div>

        {/* Unified Results Grid */}
        {totalCount === 0 ? (
          <div className="radius-native rounded-2xl bg-white dark:bg-[#14161D] border border-[#ECEEF2] dark:border-white/10 p-12 text-center max-w-md mx-auto">
            <Search className="w-8 h-8 text-[#8C929C] mx-auto mb-2 opacity-60" />
            <h3 className="text-[15px] font-bold text-[#171717] dark:text-white">
              No matches found
            </h3>
            <p className="text-[12.5px] text-[#8C929C] mt-1">
              Try searching with different keywords, or switch tabs to explore other campus features.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            {/* 1. Products & Services Cards */}
            {matchingListings.map((item) => {
              const isSaved = Boolean(savedIds[`prod-${item.id}`]);
              const isService = item.itemType === "service";

              return (
                <div
                  key={`prod-${item.id}`}
                  className="radius-native group rounded-2xl bg-white dark:bg-[#14161D] border border-[#ECEEF2] dark:border-white/10 p-2.5 sm:p-3 shadow-[0_4px_20px_rgba(15,23,42,0.025)] hover:shadow-[0_8px_28px_rgba(15,23,42,0.06)] transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="radius-native relative h-[135px] sm:h-[160px] w-full rounded-xl bg-[#F6F7F9] dark:bg-white/5 overflow-hidden flex items-center justify-center">
                      <Link
                        href={item.href}
                        className="w-full h-full flex items-center justify-center"
                      >
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      </Link>

                      <div className="absolute top-2.5 right-2.5 flex flex-col items-end gap-1.5 z-10">
                        <span className="radius-native inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/90 dark:bg-black/60 shadow-xs">
                          {isService ? "Service" : item.condition || "Item"}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => toggleSave(`prod-${item.id}`, e)}
                          className="radius-native w-7 h-7 rounded-full bg-white/85 dark:bg-black/40 backdrop-blur-xs flex items-center justify-center text-[#5B636E]"
                        >
                          <Heart
                            className={`w-3.5 h-3.5 ${
                              isSaved ? "fill-rose-500 text-rose-500" : ""
                            }`}
                            strokeWidth={1.8}
                          />
                        </button>
                      </div>
                    </div>

                    <div className="pt-3 px-0.5">
                      <Link href={item.href}>
                        <h3 className="text-[13.5px] font-bold text-[#171717] dark:text-white leading-snug truncate group-hover:underline">
                          {item.title}
                        </h3>
                      </Link>
                      <div className="mt-1 flex items-center gap-1 text-[11.5px] font-medium text-[#68707A] dark:text-neutral-400">
                        <MapPin className="w-3 h-3 shrink-0" strokeWidth={2} />
                        <span className="truncate">{item.landmark}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 px-0.5 border-t border-[#F2F4F7] dark:border-white/5 flex items-center justify-between gap-2">
                    <span className="text-[14.5px] font-extrabold text-[#14171A] dark:text-white">
                      {item.priceFormatted}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {(item.sellerType === "verified_student" ||
                        item.sellerType === "student_store") && (
                        <span
                          title="Verified student seller"
                          className="radius-native w-4 h-4 rounded-full bg-[#22C55E] flex items-center justify-center shrink-0"
                        >
                          <Check
                            className="w-2.5 h-2.5 text-white"
                            strokeWidth={3}
                          />
                        </span>
                      )}
                      <Link
                        href={item.href}
                        className="radius-native inline-flex items-center gap-1 rounded-lg border border-[#E4E7EC] dark:border-white/15 bg-white dark:bg-white/5 hover:bg-[#F7F8FA] px-2.5 py-1 text-[11.5px] font-semibold text-[#171717] dark:text-white transition-colors"
                      >
                        <span>{isService ? "Book" : "View"}</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* 2. Stores Cards */}
            {matchingStores.map((store) => {
              return (
                <div
                  key={`store-${store.id}`}
                  className="radius-native group rounded-2xl bg-white dark:bg-[#14161D] border border-[#ECEEF2] dark:border-white/10 p-3 shadow-[0_4px_20px_rgba(15,23,42,0.025)] hover:shadow-[0_8px_28px_rgba(15,23,42,0.06)] transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    <Link
                      href={`/stores/${store.slug || store.id}`}
                      className="radius-native relative h-[150px] sm:h-[160px] w-full rounded-xl bg-[#F6F7F9] dark:bg-white/5 overflow-hidden flex items-center justify-center"
                    >
                      {store.avatar ? (
                        <img
                          src={store.avatar}
                          alt={store.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <Store className="w-10 h-10 text-[#8C929C] opacity-70" />
                      )}
                      <div className="absolute top-2.5 right-2.5 flex flex-col items-end gap-1.5 z-10">
                        <span className="radius-native inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/90 dark:bg-black/60 shadow-xs">
                          Store
                        </span>
                      </div>
                    </Link>

                    <div className="pt-3 px-0.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Link
                          href={`/stores/${store.slug || store.id}`}
                          className="min-w-0 truncate"
                        >
                          <h3 className="text-[13.5px] font-bold text-[#171717] dark:text-white leading-snug truncate group-hover:underline">
                            {store.name}
                          </h3>
                        </Link>
                        {store.verificationType === "verified_student" && (
                          <BadgeCheck
                            className="w-4 h-4 text-[#171717] fill-[#FFC928] shrink-0"
                            aria-label="Verified student seller"
                          />
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-1 text-[11.5px] font-medium text-[#68707A] dark:text-neutral-400">
                        <MapPin className="w-3 h-3 shrink-0" strokeWidth={2} />
                        <span className="truncate">{store.pickupLandmark}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 px-0.5 border-t border-[#F2F4F7] dark:border-white/5 flex items-center justify-between gap-2">
                    <span className="text-[12px] font-bold text-[#14171A] dark:text-white">
                      {store.activeListingsCount} listings
                    </span>
                    <Link
                      href={`/stores/${store.slug || store.id}`}
                      className="radius-native inline-flex items-center gap-1 rounded-lg border border-[#E4E7EC] dark:border-white/15 bg-white dark:bg-white/5 hover:bg-[#F7F8FA] px-2.5 py-1 text-[11.5px] font-semibold text-[#171717] dark:text-white transition-colors"
                    >
                      <span>Visit</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              );
            })}

            {/* 3. Profiles Cards */}
            {matchingProfiles.map((profile) => {
              const isSeller =
                profile.role === "seller" || profile.sellerStatus === "approved";
              return (
                <div
                  key={`profile-${profile.id}`}
                  className="radius-native group rounded-2xl bg-white dark:bg-[#14161D] border border-[#ECEEF2] dark:border-white/10 p-3 shadow-[0_4px_20px_rgba(15,23,42,0.025)] hover:shadow-[0_8px_28px_rgba(15,23,42,0.06)] transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    <Link
                      href={`/profile/${profile.handle}`}
                      className="radius-native relative h-[150px] sm:h-[160px] w-full rounded-xl bg-[#F6F7F9] dark:bg-white/5 overflow-hidden flex items-center justify-center"
                    >
                      {profile.avatar ? (
                        <img
                          src={profile.avatar}
                          alt={profile.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <User className="w-10 h-10 text-[#8C929C] opacity-70" />
                      )}
                      <div className="absolute top-2.5 right-2.5 flex flex-col items-end gap-1.5 z-10">
                        <span className="radius-native inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/90 dark:bg-black/60 shadow-xs">
                          {isSeller ? "Seller Profile" : "Profile"}
                        </span>
                      </div>
                    </Link>

                    <div className="pt-3 px-0.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Link
                          href={`/profile/${profile.handle}`}
                          className="min-w-0 truncate"
                        >
                          <h3 className="text-[13.5px] font-bold text-[#171717] dark:text-white leading-snug truncate group-hover:underline">
                            {profile.name}
                          </h3>
                        </Link>
                        {profile.studentVerified && (
                          <BadgeCheck
                            className="w-4 h-4 text-[#171717] fill-[#FFC928] shrink-0"
                            aria-label="Verified student"
                          />
                        )}
                      </div>
                      <div className="text-[11.5px] font-medium text-[#8C929C] truncate">
                        @{profile.handle}
                      </div>
                      <div className="mt-1 flex items-center gap-1 text-[11.5px] font-medium text-[#68707A] dark:text-neutral-400">
                        <MapPin className="w-3 h-3 shrink-0" strokeWidth={2} />
                        <span className="truncate">{profile.campus}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 px-0.5 border-t border-[#F2F4F7] dark:border-white/5 flex items-center justify-between gap-2">
                    <span className="text-[11.5px] font-bold text-[#68707A] dark:text-neutral-400">
                      {profile.isStudent ? "Student" : "Member"}
                    </span>
                    <Link
                      href={`/profile/${profile.handle}`}
                      className="radius-native inline-flex items-center gap-1 rounded-lg border border-[#E4E7EC] dark:border-white/15 bg-white dark:bg-white/5 hover:bg-[#F7F8FA] px-2.5 py-1 text-[11.5px] font-semibold text-[#171717] dark:text-white transition-colors"
                    >
                      <span>Profile</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              );
            })}

            {/* 4. Wanted Cards */}
            {matchingWanted.map((req) => (
              <div
                key={`wanted-${req.id}`}
                className="radius-native group rounded-2xl bg-white dark:bg-[#14161D] border border-[#ECEEF2] dark:border-white/10 p-3 shadow-[0_4px_20px_rgba(15,23,42,0.025)] hover:shadow-[0_8px_28px_rgba(15,23,42,0.06)] transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="radius-native relative h-[150px] sm:h-[160px] w-full rounded-xl bg-[#F6F7F9] dark:bg-white/5 overflow-hidden flex flex-col items-center justify-center p-3 text-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C929C] mb-1">
                      Wanted Need
                    </span>
                    <p className="text-[12.5px] font-bold text-[#171717] dark:text-white line-clamp-2 px-2">
                      {req.title}
                    </p>
                    <div className="absolute top-2.5 right-2.5">
                      <span className="radius-native inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FFF3DC] text-[#B45309]">
                        {req.urgency}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 px-0.5">
                    <Link href="/wanted">
                      <h3 className="text-[13.5px] font-bold text-[#171717] dark:text-white leading-snug truncate group-hover:underline">
                        {req.title}
                      </h3>
                    </Link>
                    <div className="mt-1 flex items-center gap-1 text-[11.5px] font-medium text-[#68707A] dark:text-neutral-400">
                      <MapPin className="w-3 h-3 shrink-0" strokeWidth={2} />
                      <span className="truncate">{req.preferredLandmark}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2 px-0.5 border-t border-[#F2F4F7] dark:border-white/5 flex items-center justify-between gap-2">
                  <span className="text-[14px] font-extrabold text-[#14171A] dark:text-white">
                    ₦{req.budgetMin.toLocaleString()}–₦
                    {req.budgetMax.toLocaleString()}
                  </span>
                  <Link
                    href="/wanted"
                    className="radius-native inline-flex items-center gap-1 rounded-lg border border-[#E4E7EC] dark:border-white/15 bg-white dark:bg-white/5 hover:bg-[#FFE182] hover:text-[#171717] px-2.5 py-1 text-[11.5px] font-semibold text-[#171717] dark:text-white transition-colors"
                  >
                    <span>Offer</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <RebrandFooter />
    </div>
  );
}
