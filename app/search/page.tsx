"use client";

import React, { Suspense, useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { cardInViewProps } from "@/lib/motion";
import {
  Search,
  X,
  ArrowRight,
  Heart,
  MapPin,
  Store,
  User,
} from "lucide-react";

import { RebrandHeader } from "../components/header/RebrandHeader";
import { RebrandFooter } from "../components/sections/RebrandFooter";
import { PageSkeleton } from "../components/common/LoadingSystem";
import { ExploreListingItem } from "../data/exploreCatalog";
import type { StorefrontItem } from "../data/mvpMockData";
import { useAuth } from "@/context/AuthContext";

type SearchFeatureTab =
  | "all"
  | "products"
  | "services"
  | "stores"
  | "profiles";

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

function shuffleListings<T>(items: T[]): T[] {
  const array = [...items];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function mapApiListingToExploreItem(item: any): ExploreListingItem {
  const isService = item.listingType === "service";
  const numPrice = typeof item.price === "number" ? item.price : 0;
  const sellerObj = typeof item.sellerId === "object" ? item.sellerId : null;
  const sellerName =
    item.storeName || sellerObj?.name || sellerObj?.profile?.displayName || "Campus Store";
  const sellerHandle =
    item.storeSlug ||
    sellerObj?.handle ||
    sellerObj?.profile?.handle ||
    (item.sellerId ? String(item.sellerId).slice(-6) : "campus-seller");
  const sellerType =
    item.storeType === "local_business"
      ? "approved_business"
      : item.storeId
      ? "student_store"
      : "verified_student";

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
    landmark: item.location || item.campus || "Main Campus",
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
    campusSlug: store.campus || "main-campus",
    campusShortName: store.campus || "Main Campus",
    pickupLandmark: store.operatingLocation || store.campus || "Main Campus",
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
  const { user } = useAuth();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<SearchFeatureTab>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [savedIds, setSavedIds] = useState<Record<string, boolean>>({});

  const [dbListings, setDbListings] = useState<ExploreListingItem[]>([]);
  const [dbStores, setDbStores] = useState<StorefrontItem[]>([]);
  const [dbProfiles, setDbProfiles] = useState<SearchProfileItem[]>([]);
  const [popularSearches, setPopularSearches] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isRandomDefault, setIsRandomDefault] = useState(false);

  const trackedQueriesRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
    }
  }, [initialQuery]);

  // Load dynamically popular searches (strictly count >= 10, otherwise empty array)
  useEffect(() => {
    let isCancelled = false;
    async function fetchPopular() {
      try {
        const res = await fetch("/api/search/popular");
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data) && !isCancelled) {
            setPopularSearches(json.data);
          }
        }
      } catch (err) {
        console.warn("[SearchPage] Failed to fetch popular searches:", err);
      }
    }
    fetchPopular();
    return () => {
      isCancelled = true;
    };
  }, []);

  // Track user searches dynamically (debounced 1200ms for queries >= 2 characters)
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) return;

    const timer = setTimeout(async () => {
      const normalized = trimmed.toLowerCase();
      if (trackedQueriesRef.current.has(normalized)) return;
      trackedQueriesRef.current.add(normalized);

      try {
        await fetch("/api/search/popular", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ term: trimmed }),
        });
      } catch {
        // non-blocking tracking
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [query]);

  // Live search from canonical Next.js APIs or Random default products when no query
  useEffect(() => {
    let isCancelled = false;

    async function executeSearch() {
      const trimmed = query.trim();

      if (!trimmed) {
        setIsSearching(true);
        try {
          // Default when no input: fetch a small sample of listings
          const res = await fetch(
            "/api/listings?status=active&listingType=product&limit=8&sort=random",
            { cache: "no-store" }
          );
          if (res.ok && !isCancelled) {
            const listJson = await res.json();
            if (listJson.success && Array.isArray(listJson.data)) {
              const mapped = listJson.data.map(mapApiListingToExploreItem);
              setDbListings(shuffleListings(mapped));
              setIsRandomDefault(true);
            }
          }
        } catch (err) {
          console.warn("[SearchPage] Failed to fetch random products:", err);
        } finally {
          if (!isCancelled) {
            setDbStores([]);
            setDbProfiles([]);
            setIsSearching(false);
          }
        }
        return;
      }

      // Query present: perform matched search across listings and stores
      try {
        setIsSearching(true);
        setIsRandomDefault(false);
        const encoded = encodeURIComponent(trimmed);
        const [listingsRes, storesRes] = await Promise.all([
          fetch(`/api/listings?q=${encoded}&status=active&limit=40`),
          fetch(`/api/stores?q=${encoded}&status=active&limit=20`),
        ]);

        if (!isCancelled) {
          if (listingsRes.ok) {
            const listJson = await listingsRes.json();
            if (listJson.success && Array.isArray(listJson.data)) {
              setDbListings(listJson.data.map(mapApiListingToExploreItem));
            }
          } else {
            setDbListings([]);
          }

          if (storesRes.ok) {
            const storeJson = await storesRes.json();
            if (storeJson.success && Array.isArray(storeJson.data)) {
              setDbStores(storeJson.data.map(mapApiStoreToStorefrontItem));
            }
          } else {
            setDbStores([]);
          }

          setDbProfiles([]);
        }
      } catch (err) {
        console.warn("[SearchPage] Live search failed:", err);
      } finally {
        if (!isCancelled) setIsSearching(false);
      }
    }

    const hasQuery = Boolean(query.trim());
    const timer = setTimeout(executeSearch, hasQuery ? 250 : 0);
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
  const hasActiveSearch = Boolean(query.trim());

  const matchingListings = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) {
      return dbListings.slice(0, 8);
    }
    if (
      activeTab === "stores" ||
      activeTab === "profiles"
    ) {
      return [];
    }

    return dbListings.filter((item) => {
      if (activeTab === "products" && item.itemType !== "product") return false;
      if (activeTab === "services" && item.itemType !== "service") return false;
      if (selectedCategory && item.category !== selectedCategory) return false;

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
  }, [dbListings, query, activeTab, selectedCategory]);

  // Filtered Stores
  const matchingStores = useMemo(() => {
    if (
      activeTab === "products" ||
      activeTab === "services" ||
      activeTab === "profiles"
    ) {
      return [];
    }
    const q = query.toLowerCase().trim();

    return dbStores.filter((store: any) => {
      // Exclude current user's own store
      if (user) {
        const uid = String(user.id || (user as any)._id || "");
        const uhandle = String(user.handle || "").toLowerCase();
        const ownerId = String(store.ownerId || store.userId || "");
        const storeSlug = String(store.slug || "").toLowerCase();
        if (uid && (ownerId === uid || String(store.id || store._id) === uid)) return false;
        if (uhandle && storeSlug === uhandle) return false;
      }

      if (q) {
        const matchesName = store.name.toLowerCase().includes(q);
        const matchesTagline = store.tagline?.toLowerCase?.()?.includes(q);
        const matchesCat = store.category?.toLowerCase?.()?.includes(q);
        const matchesProd = Array.isArray(store.featuredProducts)
          ? store.featuredProducts.some((p: string) => p.toLowerCase().includes(q))
          : false;
        if (!matchesName && !matchesTagline && !matchesCat && !matchesProd)
          return false;
      }
      return true;
    });
  }, [dbStores, query, activeTab, user]);

  // Filtered Profiles
  const matchingProfiles = useMemo(() => {
    if (
      activeTab === "products" ||
      activeTab === "services" ||
      activeTab === "stores"
    ) {
      return [];
    }
    // Exclude current user's own profile
    return dbProfiles.filter((p) => {
      if (!user) return true;
      const uid = String(user.id || (user as any)._id || "");
      const pid = String(p.id || (p as any)._id || "");
      const phandle = String(p.handle || "").toLowerCase();
      const uhandle = String(user.handle || "").toLowerCase();
      const uname = String(user.name || "").toLowerCase();
      const pname = String(p.name || "").toLowerCase();
      if (uid && pid === uid) return false;
      if (uhandle && phandle === uhandle) return false;
      if (uname && pname === uname) return false;
      return true;
    });
  }, [dbProfiles, activeTab, user]);

  // Aggregate item counts
  const productsCount = useMemo(
    () => dbListings.filter((i) => i.itemType === "product").length,
    [dbListings]
  );
  const servicesCount = useMemo(
    () => dbListings.filter((i) => i.itemType === "service").length,
    [dbListings]
  );
  const storesCount = matchingStores.length;
  const profilesCount = matchingProfiles.length;

  const totalCount =
    matchingListings.length +
    matchingStores.length +
    matchingProfiles.length;

  // Compute category counts for listings (strictly hiding categories with 0 matches)
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const item of dbListings) {
      if (activeTab === "products" && item.itemType !== "product") continue;
      if (activeTab === "services" && item.itemType !== "service") continue;
      if (item.category) {
        counts[item.category] = (counts[item.category] || 0) + 1;
      }
    }
    return counts;
  }, [dbListings, activeTab]);

  const availableCategories = useMemo(() => {
    return Object.entries(categoryCounts)
      .filter(([_, count]) => count > 0)
      .sort((a, b) => b[1] - a[1]);
  }, [categoryCounts]);

  // Feature tabs candidate list
  const candidateTabs = useMemo(() => {
    return [
      { id: "all" as SearchFeatureTab, label: "All", count: totalCount },
      { id: "products" as SearchFeatureTab, label: "Products", count: productsCount },
      { id: "services" as SearchFeatureTab, label: "Services", count: servicesCount },
      { id: "stores" as SearchFeatureTab, label: "Stores", count: storesCount },
      { id: "profiles" as SearchFeatureTab, label: "Profiles", count: profilesCount },
    ];
  }, [totalCount, productsCount, servicesCount, storesCount, profilesCount]);

  // Filter tabs: strictly HIDE any filter with 0 count
  const visibleTabs = useMemo(() => {
    return candidateTabs.filter((tab) => tab.count > 0);
  }, [candidateTabs]);

  // Automatically reset active tab to "all" if current tab has 0 matches
  useEffect(() => {
    if (activeTab === "all") return;
    const currentTabObj = candidateTabs.find((t) => t.id === activeTab);
    if (!currentTabObj || currentTabObj.count === 0) {
      setActiveTab("all");
    }
  }, [candidateTabs, activeTab]);

  // Reset selected category if its count drops to 0
  useEffect(() => {
    if (!selectedCategory) return;
    const count = categoryCounts[selectedCategory] || 0;
    if (count === 0) {
      setSelectedCategory("");
    }
  }, [categoryCounts, selectedCategory]);

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
            One search across all products, services, stores, and profiles.
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

          {/* Dynamic Trending Searches (Only visible if 10 or more users searched for an item, otherwise completely hidden) */}
          {popularSearches.length > 0 && (
            <div className="flex items-center justify-center gap-2 flex-wrap text-[11.5px] text-[#8C929C] pt-1">
              <span className="font-semibold text-[#14171A] dark:text-neutral-300">Popular:</span>
              {popularSearches.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => setQuery(term)}
                  className="radius-native px-2.5 py-0.5 rounded-full bg-white dark:bg-white/5 border border-[#ECEEF2] dark:border-white/10 hover:border-[#171717] dark:hover:border-white text-[#5B636E] dark:text-neutral-300 hover:text-[#171717] dark:hover:text-white transition-all cursor-pointer font-medium"
                >
                  {term}
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Feature Tabs & Dynamic Filter Bar (Only shown after user enters a search query) */}
        {hasActiveSearch && visibleTabs.length > 0 && (
          <div className="space-y-3 pt-2 border-t border-[#ECEEF2] dark:border-white/10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none w-full sm:w-auto">
                {visibleTabs.map((tab) => {
                  const isSelected = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setActiveTab(tab.id);
                        setSelectedCategory("");
                      }}
                      className={`radius-native px-3 py-1.5 rounded-xl text-[12px] font-semibold transition-all cursor-pointer shrink-0 ${
                        isSelected
                          ? "bg-[#171717] text-white dark:bg-white dark:text-[#171717] shadow-xs"
                          : "bg-white dark:bg-[#14161D] border border-[#ECEEF2] dark:border-white/10 text-[#5B636E] dark:text-neutral-300 hover:border-[#171717]"
                      }`}
                    >
                      {tab.label} ({tab.count})
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2 text-[12px] font-medium text-[#8C929C] shrink-0">
                <span>
                  {totalCount} total {totalCount === 1 ? "match" : "matches"}
                </span>
              </div>
            </div>

            {/* Category Filter Chips (Only rendered if count > 0) */}
            {(activeTab === "all" || activeTab === "products" || activeTab === "services") &&
              availableCategories.length > 1 && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-0.5">
                  <span className="text-[11.5px] font-medium text-[#8C929C] mr-1 shrink-0">
                    Category:
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedCategory("")}
                    className={`radius-native px-2.5 py-1 rounded-lg text-[11.5px] font-medium transition-all cursor-pointer shrink-0 ${
                      !selectedCategory
                        ? "bg-[#EAEAEA] dark:bg-white/20 text-[#171717] dark:text-white font-bold"
                        : "bg-white dark:bg-[#14161D] border border-[#ECEEF2] dark:border-white/10 text-[#68707A] dark:text-neutral-400 hover:text-[#171717]"
                    }`}
                  >
                    All ({activeTab === "products" ? productsCount : activeTab === "services" ? servicesCount : (productsCount + servicesCount)})
                  </button>
                  {availableCategories.map(([cat, count]) => {
                    const isCatSelected = selectedCategory === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() =>
                          setSelectedCategory(isCatSelected ? "" : cat)
                        }
                        className={`radius-native px-2.5 py-1 rounded-lg text-[11.5px] font-medium transition-all cursor-pointer shrink-0 ${
                          isCatSelected
                            ? "bg-[#171717] text-white dark:bg-white dark:text-[#171717] font-bold"
                            : "bg-white dark:bg-[#14161D] border border-[#ECEEF2] dark:border-white/10 text-[#68707A] dark:text-neutral-400 hover:text-[#171717]"
                        }`}
                      >
                        {cat} ({count})
                      </button>
                    );
                  })}
                </div>
              )}
          </div>
        )}

        {/* Unified Results Grid */}
        {isSearching && totalCount === 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={`search-skel-${i}`}
                className="radius-native rounded-2xl bg-white dark:bg-[#14161D] border border-[#ECEEF2] dark:border-white/10 p-2.5 sm:p-3 space-y-3"
              >
                <div className="h-[135px] sm:h-[160px] w-full rounded-xl bg-neutral-200 dark:bg-white/5 animate-pulse" />
                <div className="space-y-2 px-0.5">
                  <div className="h-3.5 w-3/4 rounded bg-neutral-200 dark:bg-white/5 animate-pulse" />
                  <div className="h-3 w-1/2 rounded bg-neutral-200 dark:bg-white/5 animate-pulse" />
                </div>
                <div className="pt-2 border-t border-[#F2F4F7] dark:border-white/5 flex items-center justify-between">
                  <div className="h-4 w-16 rounded bg-neutral-200 dark:bg-white/5 animate-pulse" />
                  <div className="h-6 w-12 rounded-lg bg-neutral-200 dark:bg-white/5 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : totalCount === 0 && !isSearching ? (
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
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 26, mass: 0.9 }}
            className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5"
          >
            {/* 1. Products & Services Cards */}
            {matchingListings.map((item, idx) => {
              const isSaved = Boolean(savedIds[`prod-${item.id}`]);
              const isService = item.itemType === "service";

              return (
                <motion.div
                  key={`prod-${item.id}`}
                  initial={{ opacity: 0, y: 20, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 240,
                    damping: 25,
                    mass: 0.85,
                    delay: Math.min(idx * 0.045, 0.3),
                  }}
                  className="radius-native group rounded-2xl bg-white dark:bg-[#14161D] border border-[#ECEEF2] dark:border-white/10 p-2.5 sm:p-3 shadow-[0_4px_20px_rgba(15,23,42,0.025)] hover:shadow-[0_8px_28px_rgba(15,23,42,0.06)] transition-shadow duration-200 flex flex-col justify-between"
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
                      <Link
                        href={item.href}
                        className="radius-native inline-flex items-center gap-1 rounded-lg border border-[#E4E7EC] dark:border-white/15 bg-white dark:bg-white/5 hover:bg-[#F7F8FA] px-2.5 py-1 text-[11.5px] font-semibold text-[#171717] dark:text-white transition-colors"
                      >
                        <span>{isService ? "Book" : "View"}</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {/* 2. Stores Cards */}
            {matchingStores.map((store, idx) => {
              const isApproved =
                store.verificationType === "verified_student" ||
                store.verificationType === "verified_business";

              return (
                <motion.div
                  key={`store-${store.id}`}
                  {...cardInViewProps(idx)}
                  className="radius-native group rounded-2xl bg-white dark:bg-[#14161D] border border-[#ECEEF2] dark:border-white/10 p-3 shadow-[0_4px_20px_rgba(15,23,42,0.025)] hover:shadow-[0_8px_28px_rgba(15,23,42,0.06)] transition-shadow duration-200 flex flex-col justify-between"
                >
                  <div>
                    <Link
                      href={`/stores/${store.slug || store.id}`}
                      className={`radius-native relative h-[150px] sm:h-[160px] w-full rounded-xl bg-[#F6F7F9] dark:bg-white/5 overflow-hidden flex items-center justify-center transition-all ${
                        isApproved
                          ? "ring-2 ring-[#FFC928] ring-offset-1 ring-offset-white dark:ring-offset-[#14161D]"
                          : ""
                      }`}
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
                </motion.div>
              );
            })}

            {/* 3. Profiles Cards */}
            {matchingProfiles.map((profile, idx) => {
              const isSeller =
                profile.role === "seller" || profile.sellerStatus === "approved";
              const isApprovedStore =
                profile.studentVerified ||
                profile.role === "seller" ||
                profile.sellerStatus === "approved";

              return (
                <motion.div
                  key={`profile-${profile.id}`}
                  {...cardInViewProps(idx)}
                  className="radius-native group rounded-2xl bg-white dark:bg-[#14161D] border border-[#ECEEF2] dark:border-white/10 p-3 shadow-[0_4px_20px_rgba(15,23,42,0.025)] hover:shadow-[0_8px_28px_rgba(15,23,42,0.06)] transition-shadow duration-200 flex flex-col justify-between"
                >
                  <div>
                    <Link
                      href={`/profile/${profile.handle}`}
                      className={`radius-native relative h-[150px] sm:h-[160px] w-full rounded-xl bg-[#F6F7F9] dark:bg-white/5 overflow-hidden flex items-center justify-center ${
                        isApprovedStore
                          ? "ring-2 ring-[#FFC928] ring-offset-1 ring-offset-white dark:ring-offset-[#14161D]"
                          : ""
                      }`}
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
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </main>

      <RebrandFooter />
    </div>
  );
}
