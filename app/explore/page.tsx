"use client";

import React, { Suspense, useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Search,
  X,
  SlidersHorizontal,
  ArrowUpDown,
  ArrowRight,
  Heart,
  MapPin,
  Check,
  BadgeCheck,
  Store,
  Sparkles,
  RotateCcw,
  Tag,
  Building2,
  ChevronDown,
  Plus,
} from "lucide-react";

import { RebrandHeader } from "../components/header/RebrandHeader";
import { RebrandFooter } from "../components/sections/RebrandFooter";
import { useAuth } from "../context/AuthContext";
import { followService } from "@/lib/followService";
import {
  EXPLORE_CATEGORIES,
  CAMPUS_LANDMARKS,
  EXPLORE_LISTINGS,
  ExploreCategory,
  ExploreListingItem,
} from "../data/exploreCatalog";
type ContentType = "all" | "products" | "services" | "following";
type SortOption = "recent" | "price_asc" | "price_desc";

function mapApiListingToExploreItem(item: any): ExploreListingItem {
  const isService = item.listingType === "service";
  const numPrice = typeof item.price === "number" ? item.price : 0;
  const sellerObj = typeof item.sellerId === "object" ? item.sellerId : null;
  const sellerName = sellerObj?.name || sellerObj?.profile?.displayName || "Campus Student";
  const sellerHandle = sellerObj?.handle || sellerObj?.profile?.handle || (item.sellerId ? String(item.sellerId).slice(-6) : "campus-seller");
  const sellerType = item.storeId ? "student_store" : "verified_student";

  let condition = item.condition || (isService ? undefined : "Used");
  let conditionTone: "neutral" | "green" = condition === "New" ? "green" : "neutral";

  const imageUrl = (Array.isArray(item.images) && item.images.length > 0 && item.images[0])
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
    keywords: [item.title, item.category, item.location, item.campus].filter(Boolean),
    serviceRateLabel: isService ? (item.serviceDetails?.pricingModel === "hourly" ? "₦ / hour" : "Per project") : undefined,
  };
}

export default function ExplorePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F7F8FA] dark:bg-[#0E1015]">
          <div className="w-8 h-8 rounded-full border-2 border-[#171717] dark:border-white border-t-transparent animate-spin" />
        </div>
      }
    >
      <ExploreContent />
    </Suspense>
  );
}

function ExploreContent() {
  const searchParams = useSearchParams();
  const initialCategoryParam = searchParams.get("category");
  const initialQueryParam = searchParams.get("q");

  // A. Search & Content Type state
  const [searchQuery, setSearchQuery] = useState(initialQueryParam || "");
  const [activeContentType, setActiveContentType] = useState<ContentType>("all");

  // F. Saved items state
  const [savedIds, setSavedIds] = useState<Record<string | number, boolean>>({});
  const [showSavedOnly, setShowSavedOnly] = useState(false);

  const { user } = useAuth();
  const [followingListings, setFollowingListings] = useState<ExploreListingItem[]>([]);
  const [isLoadingFollowing, setIsLoadingFollowing] = useState(false);
  const [hasFetchedFollowing, setHasFetchedFollowing] = useState(false);

  // Live database data state
  const [dbListings, setDbListings] = useState<ExploreListingItem[]>([]);
  const [isLoadingLive, setIsLoadingLive] = useState(true);

  // B. Category navigation state
  const [selectedCategory, setSelectedCategory] = useState<ExploreCategory>(
    (initialCategoryParam as ExploreCategory) || "All"
  );

  // C. Filters & Sorting state
  const [showDesktopFilters, setShowDesktopFilters] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [selectedLandmark, setSelectedLandmark] = useState<string>("All Landmarks");
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [selectedSellerType, setSelectedSellerType] = useState<string>("all");
  const [pricePreset, setPricePreset] = useState<string>("all");
  const [customMinPrice, setCustomMinPrice] = useState<string>("");
  const [customMaxPrice, setCustomMaxPrice] = useState<string>("");
  const [sortBy, setSortBy] = useState<SortOption>("recent");

  // Fetch live listings from canonical API
  useEffect(() => {
    let isCancelled = false;
    async function fetchLiveExplore() {
      try {
        setIsLoadingLive(true);
        const listingsRes = await fetch("/api/listings?limit=50&status=active");

        if (!isCancelled) {
          if (listingsRes.ok) {
            const listJson = await listingsRes.json();
            if (listJson.success && Array.isArray(listJson.data) && listJson.data.length > 0) {
              setDbListings(listJson.data.map(mapApiListingToExploreItem));
            }
          }
        }
      } catch (err) {
        console.warn("[ExplorePage] Could not fetch live listings:", err);
      } finally {
        if (!isCancelled) setIsLoadingLive(false);
      }
    }
    fetchLiveExplore();
    return () => {
      isCancelled = true;
    };
  }, []);

  // Fetch live following feed when Following tab is selected
  useEffect(() => {
    if (activeContentType === "following" && user?.id) {
      let isCancelled = false;
      setIsLoadingFollowing(true);
      followService
        .getFollowingFeed()
        .then((res: any) => {
          if (!isCancelled && res?.success && Array.isArray(res.listings || res.data)) {
            const feedItems = (res.listings || res.data).map(mapApiListingToExploreItem);
            setFollowingListings(feedItems);
            setHasFetchedFollowing(true);
          }
        })
        .catch((err) => {
          console.warn("[ExplorePage] Failed to fetch following feed:", err);
        })
        .finally(() => {
          if (!isCancelled) setIsLoadingFollowing(false);
        });
      return () => {
        isCancelled = true;
      };
    }
  }, [activeContentType, user?.id]);

  // Sync category parameter if changed in URL
  useEffect(() => {
    if (initialCategoryParam && EXPLORE_CATEGORIES.includes(initialCategoryParam as ExploreCategory)) {
      setSelectedCategory(initialCategoryParam as ExploreCategory);
    }
  }, [initialCategoryParam]);

  // Load saved items from localStorage if available
  useEffect(() => {
    try {
      const stored = localStorage.getItem("ch_saved_listings");
      if (stored) {
        setSavedIds(JSON.parse(stored));
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  const toggleSave = (id: string | number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSavedIds((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem("ch_saved_listings", JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const handleClearAllFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setSelectedLandmark("All Landmarks");
    setSelectedConditions([]);
    setSelectedSellerType("all");
    setPricePreset("all");
    setCustomMinPrice("");
    setCustomMaxPrice("");
    setShowSavedOnly(false);
    setActiveContentType("all");
  };

  // Primary source dataset: live DB with graceful fallback if empty
  const sourceListings = useMemo(() => {
    if (activeContentType === "following") {
      return followingListings;
    }
    if (dbListings.length > 0) return dbListings;
    return EXPLORE_LISTINGS;
  }, [activeContentType, followingListings, dbListings]);

  // Compute active filter count for badge indicator
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== "All") count++;
    if (selectedLandmark !== "All Landmarks") count++;
    if (selectedConditions.length > 0) count += selectedConditions.length;
    if (selectedSellerType !== "all") count++;
    if (pricePreset !== "all" || customMinPrice || customMaxPrice) count++;
    if (showSavedOnly) count++;
    return count;
  }, [
    selectedCategory,
    selectedLandmark,
    selectedConditions,
    selectedSellerType,
    pricePreset,
    customMinPrice,
    customMaxPrice,
    showSavedOnly,
  ]);

  // Filter listings based on all active criteria
  const filteredListings = useMemo(() => {
    return sourceListings.filter((item) => {
      // Content type filter
      if (activeContentType === "products" && item.itemType !== "product") return false;
      if (activeContentType === "services" && item.itemType !== "service") return false;

      // Saved items shortcut
      if (showSavedOnly && !savedIds[item.id]) return false;

      // Category filter
      if (selectedCategory !== "All" && item.category !== selectedCategory) return false;

      // Landmark filter
      if (selectedLandmark !== "All Landmarks" && item.landmark !== selectedLandmark) return false;

      // Condition filter
      if (selectedConditions.length > 0) {
        if (!item.condition || !selectedConditions.includes(item.condition)) return false;
      }

      // Seller type filter
      if (selectedSellerType === "verified") {
        const isVerified =
          item.sellerType === "verified_student" ||
          item.sellerType === "student_store" ||
          (item as any).sellerVerificationType === "verified_student" ||
          (item as any).sellerVerificationType === "verified_business";
        if (!isVerified) return false;
      } else if (selectedSellerType === "non_verified") {
        const isVerified =
          item.sellerType === "verified_student" ||
          item.sellerType === "student_store" ||
          (item as any).sellerVerificationType === "verified_student" ||
          (item as any).sellerVerificationType === "verified_business";
        if (isVerified) return false;
      }

      // Price filter
      const min = customMinPrice ? parseFloat(customMinPrice) : 0;
      const max = customMaxPrice ? parseFloat(customMaxPrice) : Infinity;

      if (pricePreset === "under_5k" && item.price >= 5000) return false;
      if (pricePreset === "5k_20k" && (item.price < 5000 || item.price > 20000)) return false;
      if (pricePreset === "20k_100k" && (item.price < 20000 || item.price > 100000)) return false;
      if (pricePreset === "above_100k" && item.price <= 100000) return false;

      if (customMinPrice && item.price < min) return false;
      if (customMaxPrice && item.price > max) return false;

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesCategory = item.category.toLowerCase().includes(q);
        const matchesLandmark = item.landmark.toLowerCase().includes(q);
        const matchesSeller = item.sellerName.toLowerCase().includes(q);
        const matchesKeywords = item.keywords.some((k) => k.toLowerCase().includes(q));

        if (!matchesTitle && !matchesCategory && !matchesLandmark && !matchesSeller && !matchesKeywords) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === "price_asc") return a.price - b.price;
      if (sortBy === "price_desc") return b.price - a.price;
      return b.createdAtTimestamp - a.createdAtTimestamp;
    });
  }, [
    sourceListings,
    activeContentType,
    showSavedOnly,
    savedIds,
    selectedCategory,
    selectedLandmark,
    selectedConditions,
    selectedSellerType,
    pricePreset,
    customMinPrice,
    customMaxPrice,
    searchQuery,
    sortBy,
  ]);

  const totalResultsCount = filteredListings.length;

  const savedCount = Object.values(savedIds).filter(Boolean).length;

  return (
    <div
      style={{ fontFamily: "var(--font-plus-jakarta), sans-serif" }}
      className="min-h-screen flex flex-col bg-[#F7F8FA] dark:bg-[#0E1015] text-[#171717] dark:text-white antialiased"
    >
      <RebrandHeader />

      <main className="flex-1 w-full max-w-[1380px] mx-auto px-5 sm:px-8 lg:px-12 pt-7 pb-16">
        {/* Section Header with Divider Line matching Stores / Home */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-[18px] sm:text-[20px] font-bold tracking-[-0.02em] text-[#14171A] dark:text-white shrink-0">
              Explore
            </h1>
            <p className="text-[12.5px] text-[#8C929C] dark:text-neutral-400 mt-0.5 font-normal">
              Discover products, student services, and businesses across your campus.
            </p>
          </div>

          <div
            className="hidden sm:block flex-1 h-[1px] bg-[#E8EAEE] dark:bg-white/10"
            aria-hidden="true"
          />

          <Link
            href="/dashboard/products/add"
            className="radius-native inline-flex items-center gap-1.5 rounded-lg border border-[#E4E7EC] dark:border-white/15 bg-white dark:bg-white/5 hover:bg-[#F7F8FA] dark:hover:bg-white/10 px-3 py-1.5 text-[12px] font-semibold text-[#171717] dark:text-white shrink-0 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>List your product</span>
          </Link>
        </div>

        {/* ========================================================= */}
        {/* STICKY FILTER BAR: Content Tabs + Toolbar                 */}
        {/* ========================================================= */}
        <div className="sticky top-[64px] sm:top-[68px] z-30 -mx-5 sm:-mx-8 lg:-mx-12 px-5 sm:px-8 lg:px-12 pt-2.5 pb-2.5 mb-5 sm:mb-6 bg-[#F7F8FA]/95 dark:bg-[#0E1015]/95 backdrop-blur-md border-b border-[#ECEEF2]/80 dark:border-white/10 transition-colors">
          {/* SECTION C & E: Content Type Tabs, Toolbar & Sorting */}
          <div className="flex items-center justify-between gap-2.5 overflow-x-auto scrollbar-none">
            {/* Content Type Tabs (All, Products, Services, Stores) */}
            <div className="radius-native flex items-center p-1 rounded-xl bg-white dark:bg-[#14161D] border border-[#ECEEF2] dark:border-white/10 text-[12px] sm:text-[12.5px] font-semibold shrink-0">
              {(
                [
                  { id: "all", label: "All Items" },
                  { id: "products", label: "Products" },
                  { id: "services", label: "Services" },
                  { id: "following", label: "Following" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveContentType(tab.id)}
                  className={`radius-native px-2.5 sm:px-3 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                    activeContentType === tab.id
                      ? "bg-[#FFE182] text-[#171717] shadow-xs"
                      : "text-[#5B636E] dark:text-neutral-400 hover:text-[#171717] dark:hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Right Toolbar: Saved Toggle + Desktop Filters Toggle + Results Count + Desktop Sort Dropdown */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Saved Items Toggle Button */}
              <button
                type="button"
                onClick={() => setShowSavedOnly((prev) => !prev)}
                className={`radius-native inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-[11.5px] sm:text-[12px] font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  showSavedOnly
                    ? "bg-[#171717] text-white dark:bg-white dark:text-[#171717] shadow-xs"
                    : "bg-white dark:bg-[#14161D] border border-[#ECEEF2] dark:border-white/10 text-[#4A5058] dark:text-neutral-300 hover:border-[#171717] dark:hover:border-white"
                }`}
              >
                <Heart
                  className={`w-3.5 h-3.5 ${showSavedOnly ? "fill-rose-500 text-rose-500" : ""}`}
                  strokeWidth={2}
                />
                <span className="hidden sm:inline">Saved</span>
                <span>({savedCount})</span>
              </button>

              {/* Desktop Filters Toggle Button */}
              <button
                type="button"
                onClick={() => setShowDesktopFilters((prev) => !prev)}
                className="hidden lg:inline-flex radius-native items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-[#14161D] border border-[#ECEEF2] dark:border-white/10 text-[12.5px] font-semibold text-[#171717] dark:text-white hover:border-[#171717] dark:hover:border-white transition-colors cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="radius-native w-4 h-4 rounded-full bg-[#171717] dark:bg-white text-white dark:text-[#171717] text-[10px] flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              {/* Results Count (Desktop) */}
              <span className="hidden md:inline text-[12.5px] font-medium text-[#68707A] dark:text-neutral-400">
                {totalResultsCount} {totalResultsCount === 1 ? "result" : "results"}
              </span>

              {/* Sort Dropdown (Desktop) */}
              <div className="hidden lg:block relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  aria-label="Sort listings"
                  className="radius-native appearance-none bg-white dark:bg-[#14161D] border border-[#ECEEF2] dark:border-white/10 text-[12px] font-semibold text-[#171717] dark:text-white pl-3 pr-7 py-1.5 rounded-xl focus:outline-none focus:border-[#171717] cursor-pointer"
                >
                  <option value="recent">Recently added</option>
                  <option value="price_asc">Price: Low to high</option>
                  <option value="price_desc">Price: High to low</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#68707A]" />
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* MAIN BODY: Collapsible Left Filter Panel + Listing Grid */}
        {/* ========================================================= */}
        <div className="flex items-start gap-7">
          {/* Desktop Filter Panel */}
          {showDesktopFilters && (
            <aside
              aria-label="Filter listings"
              className="hidden lg:block w-[260px] shrink-0 sticky top-[182px] max-h-[calc(100vh-200px)] overflow-y-auto pr-1 scrollbar-thin space-y-4"
            >
              <div className="radius-native rounded-2xl bg-white dark:bg-[#14161D] border border-[#ECEEF2] dark:border-white/10 p-4 shadow-[0_4px_20px_rgba(15,23,42,0.025)] space-y-4">
                <div className="flex items-center justify-between pb-2.5 border-b border-[#ECEEF2] dark:border-white/10">
                  <h2 className="text-[13.5px] font-bold text-[#171717] dark:text-white">
                    Refine Results
                  </h2>
                  {activeFiltersCount > 0 && (
                    <button
                      type="button"
                      onClick={handleClearAllFilters}
                      className="text-[11px] font-semibold text-[#8C929C] hover:text-[#171717] dark:hover:text-white transition-colors"
                    >
                      Reset all
                    </button>
                  )}
                </div>

                {/* Campus Landmark Filter */}
                <div>
                  <label
                    htmlFor="desktop-landmark-select"
                    className="block text-[12px] font-bold uppercase tracking-wider text-[#68707A] dark:text-neutral-400 mb-2"
                  >
                    Campus Landmark
                  </label>
                  <select
                    id="desktop-landmark-select"
                    value={selectedLandmark}
                    onChange={(e) => setSelectedLandmark(e.target.value)}
                    className="radius-native w-full bg-[#F7F8FA] dark:bg-white/5 border border-[#ECEEF2] dark:border-white/10 rounded-xl px-3 py-2 text-[13px] text-[#171717] dark:text-white focus:outline-none"
                  >
                    {CAMPUS_LANDMARKS.map((landmark) => (
                      <option key={landmark} value={landmark}>
                        {landmark}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Range Filter */}
                <div>
                  <p className="text-[12px] font-bold uppercase tracking-wider text-[#68707A] dark:text-neutral-400 mb-2">
                    Price Range
                  </p>
                  <div className="space-y-1.5 text-[13px]">
                    {[
                      { id: "all", label: "Any price" },
                      { id: "under_5k", label: "Under ₦5,000" },
                      { id: "5k_20k", label: "₦5,000 – ₦20,000" },
                      { id: "20k_100k", label: "₦20,000 – ₦100,000" },
                      { id: "above_100k", label: "Above ₦100,000" },
                    ].map((preset) => (
                      <label
                        key={preset.id}
                        className="flex items-center gap-2 cursor-pointer text-[#4A5058] dark:text-neutral-300 hover:text-[#171717]"
                      >
                        <input
                          type="radio"
                          name="price-preset"
                          checked={pricePreset === preset.id}
                          onChange={() => {
                            setPricePreset(preset.id);
                            setCustomMinPrice("");
                            setCustomMaxPrice("");
                          }}
                          className="accent-[#171717] dark:accent-[#FFE182]"
                        />
                        <span>{preset.label}</span>
                      </label>
                    ))}
                  </div>

                  {/* Custom Min/Max Inputs */}
                  <div className="mt-3 flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Min ₦"
                      value={customMinPrice}
                      onChange={(e) => {
                        setCustomMinPrice(e.target.value);
                        setPricePreset("custom");
                      }}
                      className="radius-native w-full bg-[#F7F8FA] dark:bg-white/5 border border-[#ECEEF2] dark:border-white/10 rounded-lg px-2.5 py-1.5 text-[12px] text-[#171717] dark:text-white placeholder:text-[#8C929C] focus:outline-none"
                    />
                    <span className="text-[#8C929C] text-[12px]">–</span>
                    <input
                      type="number"
                      placeholder="Max ₦"
                      value={customMaxPrice}
                      onChange={(e) => {
                        setCustomMaxPrice(e.target.value);
                        setPricePreset("custom");
                      }}
                      className="radius-native w-full bg-[#F7F8FA] dark:bg-white/5 border border-[#ECEEF2] dark:border-white/10 rounded-lg px-2.5 py-1.5 text-[12px] text-[#171717] dark:text-white placeholder:text-[#8C929C] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Condition Filter */}
                <div>
                  <p className="text-[12px] font-bold uppercase tracking-wider text-[#68707A] dark:text-neutral-400 mb-2">
                    Item Condition
                  </p>
                  <div className="space-y-1.5 text-[13px]">
                    {["New", "Like New", "Good", "Used"].map((cond) => (
                      <label
                        key={cond}
                        className="flex items-center gap-2 cursor-pointer text-[#4A5058] dark:text-neutral-300 hover:text-[#171717]"
                      >
                        <input
                          type="checkbox"
                          checked={selectedConditions.includes(cond)}
                          onChange={() => {
                            setSelectedConditions((prev) =>
                              prev.includes(cond) ? prev.filter((c) => c !== cond) : [...prev, cond]
                            );
                          }}
                          className="accent-[#171717] dark:accent-[#FFE182] rounded-xs"
                        />
                        <span>{cond}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Seller Type Filter */}
                <div>
                  <p className="text-[12px] font-bold uppercase tracking-wider text-[#68707A] dark:text-neutral-400 mb-2">
                    Seller Verification
                  </p>
                  <div className="space-y-1.5 text-[13px]">
                    {[
                      { id: "all", label: "All sellers" },
                      { id: "verified", label: "Verified", hasGreenTick: true },
                      { id: "non_verified", label: "Non-verified" },
                    ].map((opt) => (
                      <label
                        key={opt.id}
                        onClick={() => {
                          if (opt.id !== "all" && selectedSellerType === opt.id) {
                            setSelectedSellerType("all");
                          }
                        }}
                        className="flex items-center gap-2 cursor-pointer text-[#4A5058] dark:text-neutral-300 hover:text-[#171717]"
                      >
                        <input
                          type="radio"
                          name="seller-type"
                          checked={selectedSellerType === opt.id}
                          onChange={() => setSelectedSellerType(opt.id)}
                          className="accent-[#171717] dark:accent-[#FFE182]"
                        />
                        <span className="flex items-center gap-1.5">
                          {opt.label}
                          {opt.hasGreenTick && (
                            <span className="radius-native w-3.5 h-3.5 rounded-full bg-[#22C55E] flex items-center justify-center">
                              <Check className="w-2 h-2 text-white" strokeWidth={3} />
                            </span>
                          )}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </aside>
          )}

          {/* ========================================================= */}
          {/* SECTION D: Listing Grid (Products, Services, Stores) */}
          {/* ========================================================= */}
          <div className="flex-1 min-w-0">
            {activeContentType === "following" && !user ? (
              <div className="radius-native rounded-2xl bg-white dark:bg-[#14161D] border border-[#ECEEF2] dark:border-white/10 p-12 text-center max-w-md mx-auto my-8">
                <div className="radius-native w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 mx-auto flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-[16px] font-bold text-[#171717] dark:text-white">
                  Following Feed
                </h3>
                <p className="mt-1 text-[13px] text-[#5B636E] dark:text-neutral-400">
                  Sign in to see products and services from students and stores you follow.
                </p>
                <Link
                  href="/login"
                  className="mt-5 radius-native inline-flex items-center gap-1.5 rounded-xl bg-[#FFC928] hover:bg-[#F2BD24] text-[#171717] px-5 py-2 text-[12.5px] font-bold transition-all shadow-xs"
                >
                  Sign In
                </Link>
              </div>
            ) : isLoadingLive || (activeContentType === "following" && isLoadingFollowing) ? (
              <div
                className={`grid grid-cols-2 ${
                  showDesktopFilters
                    ? "sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3"
                    : "sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                } gap-3 sm:gap-4 lg:gap-5`}
              >
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="radius-native rounded-2xl bg-white dark:bg-[#14161D] border border-[#ECEEF2] dark:border-white/10 p-3 animate-pulse"
                  >
                    <div className="h-[140px] sm:h-[160px] rounded-xl bg-neutral-200 dark:bg-white/10 mb-3" />
                    <div className="h-4 bg-neutral-200 dark:bg-white/10 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-neutral-200 dark:bg-white/10 rounded w-1/2 mb-3" />
                    <div className="h-5 bg-neutral-200 dark:bg-white/10 rounded w-1/3" />
                  </div>
                ))}
              </div>
            ) : totalResultsCount === 0 ? (
              activeContentType === "following" ? (
                <div className="radius-native rounded-2xl bg-white dark:bg-[#14161D] border border-[#ECEEF2] dark:border-white/10 p-12 text-center max-w-md mx-auto my-8">
                  <div className="radius-native w-12 h-12 rounded-full bg-[#F5F6F8] dark:bg-white/5 mx-auto flex items-center justify-center text-[#8C929C] mb-4">
                    <Store className="w-6 h-6" />
                  </div>
                  <h3 className="text-[16px] font-bold text-[#171717] dark:text-white">
                    No items from followed sellers
                  </h3>
                  <p className="mt-1 text-[13px] text-[#5B636E] dark:text-neutral-400">
                    You aren&apos;t following any sellers yet, or they haven&apos;t posted any new items. Follow campus stores and sellers to see their newest listings here.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveContentType("all")}
                    className="mt-5 radius-native inline-flex items-center gap-1.5 rounded-xl bg-[#171717] dark:bg-white text-white dark:text-[#171717] px-4 py-2 text-[12.5px] font-semibold hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    <span>Browse All Items</span>
                  </button>
                </div>
              ) : (
                // Empty State
                <div className="radius-native rounded-2xl bg-white dark:bg-[#14161D] border border-[#ECEEF2] dark:border-white/10 p-12 text-center max-w-md mx-auto my-8">
                  <div className="radius-native w-12 h-12 rounded-full bg-[#F5F6F8] dark:bg-white/5 mx-auto flex items-center justify-center text-[#8C929C] mb-4">
                    <Search className="w-6 h-6" />
                  </div>
                  <h3 className="text-[16px] font-bold text-[#171717] dark:text-white">
                    No listings found
                  </h3>
                  <p className="mt-1 text-[13px] text-[#5B636E] dark:text-neutral-400">
                    Try adjusting your search terms, changing the category, or clearing active filters.
                  </p>
                  <button
                    type="button"
                    onClick={handleClearAllFilters}
                    className="mt-5 radius-native inline-flex items-center gap-1.5 rounded-xl bg-[#171717] dark:bg-white text-white dark:text-[#171717] px-4 py-2 text-[12.5px] font-semibold hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Clear all filters</span>
                  </button>
                </div>
              )
            ) : (
              <div
                className={`grid grid-cols-2 ${
                  showDesktopFilters
                    ? "sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3"
                    : "sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                } gap-3 sm:gap-4 lg:gap-5`}
              >
                {/* 1. Products & Services Cards */}
                {filteredListings.map((item) => {
                  const isSaved = Boolean(savedIds[item.id]);
                  const isService = item.itemType === "service";

                  return (
                    <div
                      key={item.id}
                      className="radius-native group rounded-2xl bg-white dark:bg-[#14161D] border border-[#ECEEF2] dark:border-white/10 p-3 shadow-[0_4px_20px_rgba(15,23,42,0.025)] hover:shadow-[0_8px_28px_rgba(15,23,42,0.06)] transition-all duration-200 flex flex-col justify-between"
                    >
                      <div>
                        {/* Image Container */}
                        <div className="radius-native relative h-[140px] sm:h-[160px] w-full rounded-xl bg-[#F6F7F9] dark:bg-white/5 overflow-hidden flex items-center justify-center">
                          <Link href={item.href} className="w-full h-full flex items-center justify-center">
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                            />
                          </Link>

                          {/* Top-Right Pill & Save Button */}
                          <div className="absolute top-2 right-2 flex flex-col items-end gap-1.5 z-10">
                            {isService ? (
                              <span className="radius-native inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FFE182] text-[#171717] shadow-xs">
                                Service
                              </span>
                            ) : item.condition ? (
                              <span
                                className={`radius-native inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold leading-tight shadow-xs ${
                                  item.conditionTone === "green"
                                    ? "bg-[#E6F8EC] text-[#15803D] dark:bg-emerald-500/20 dark:text-emerald-300"
                                    : "bg-[#EDEEF2]/95 text-[#4A5058] dark:bg-neutral-800/90 dark:text-neutral-300"
                                }`}
                              >
                                {item.condition}
                              </span>
                            ) : null}

                            <button
                              type="button"
                              onClick={(e) => toggleSave(item.id, e)}
                              aria-label={isSaved ? `Remove from saved` : `Save item`}
                              aria-pressed={isSaved}
                              className="radius-native w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/85 dark:bg-black/50 backdrop-blur-xs flex items-center justify-center text-[#5B636E] hover:text-[#171717] dark:text-neutral-300 transition-colors cursor-pointer"
                            >
                              <Heart
                                className={`w-3 h-3 sm:w-3.5 sm:h-3.5 transition-colors ${
                                  isSaved ? "fill-rose-500 text-rose-500" : ""
                                }`}
                                strokeWidth={1.8}
                              />
                            </button>
                          </div>
                        </div>

                        {/* Title, Landmark & Seller Identity */}
                        <div className="pt-2.5 px-0.5">
                          <Link href={item.href}>
                            <h3 className="text-[13px] sm:text-[13.5px] font-bold text-[#171717] dark:text-white leading-snug line-clamp-2 group-hover:text-[#14171A]">
                              {item.title}
                            </h3>
                          </Link>

                          <div className="mt-1 flex items-center gap-1 text-[11px] sm:text-[11.5px] font-medium text-[#68707A] dark:text-neutral-400">
                            <MapPin className="w-3 h-3 shrink-0" strokeWidth={2} />
                            <span className="truncate">{item.landmark}</span>
                          </div>

                          <Link
                            href={`/profile/${item.sellerHandle}`}
                            className="mt-0.5 block text-[11px] text-[#8C929C] dark:text-neutral-500 hover:text-[#171717] dark:hover:text-white hover:underline truncate"
                          >
                            {item.sellerName}
                          </Link>
                        </div>
                      </div>

                      {/* Bottom Row: Price + Verification + Action */}
                      <div className="mt-3 pt-1 px-0.5 flex items-center justify-between gap-1.5">
                        <div className="flex flex-col">
                          <span className="text-[14px] sm:text-[15px] font-extrabold text-[#14171A] dark:text-white tracking-[-0.015em]">
                            {item.priceFormatted}
                          </span>
                          {item.serviceRateLabel && (
                            <span className="text-[10px] text-[#8C929C]">{item.serviceRateLabel}</span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {(item.sellerType === "verified_student" ||
                            item.sellerType === "student_store") && (
                            <span
                              title="Verified student seller"
                              className="radius-native w-4 h-4 rounded-full bg-[#22C55E] flex items-center justify-center shrink-0"
                            >
                              <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                            </span>
                          )}

                          <Link
                            href={item.href}
                            className="radius-native inline-flex items-center gap-1 rounded-lg border border-[#E4E7EC] dark:border-white/15 bg-white dark:bg-white/5 hover:bg-[#F7F8FA] dark:hover:bg-white/10 px-2 sm:px-2.5 py-1 text-[11px] sm:text-[11.5px] font-semibold text-[#171717] dark:text-white transition-colors"
                          >
                            <span>{isService ? "Book" : "View"}</span>
                            <ArrowRight className="w-3 h-3" strokeWidth={2} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* FLOATING MOBILE PILL: Sort by ↑↓ | Filter ≡ (Matches Ref) */}
        {/* ========================================================= */}
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 lg:hidden">
          <div className="inline-flex items-center rounded-full bg-[#24262B]/95 dark:bg-[#1E212A]/95 text-white shadow-[0_8px_30px_rgba(0,0,0,0.3)] border border-white/10 backdrop-blur-md overflow-hidden">
            <button
              type="button"
              onClick={() => setShowMobileFilters(true)}
              className="inline-flex items-center gap-1.5 pl-4 pr-3.5 py-2.5 text-[12.5px] font-semibold hover:bg-white/10 transition-colors cursor-pointer"
            >
              <span>Sort by</span>
              <ArrowUpDown className="w-3.5 h-3.5 text-white/85" strokeWidth={2} />
            </button>

            <span className="h-4 w-[1px] bg-white/25" aria-hidden="true" />

            <button
              type="button"
              onClick={() => setShowMobileFilters(true)}
              className="inline-flex items-center gap-1.5 pl-3.5 pr-4 py-2.5 text-[12.5px] font-semibold hover:bg-white/10 transition-colors cursor-pointer"
            >
              <span>Filter</span>
              <SlidersHorizontal className="w-3.5 h-3.5 text-white/85" strokeWidth={2} />
              {activeFiltersCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#FFC928] text-[#171717] text-[10px] font-extrabold flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* MOBILE SORT & FILTERS BOTTOM SHEET                        */}
        {/* ========================================================= */}
        {showMobileFilters && (
          <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-xs"
              onClick={() => setShowMobileFilters(false)}
              aria-hidden="true"
            />
            <div className="radius-native relative z-10 w-full max-h-[85vh] overflow-y-auto rounded-t-3xl bg-white dark:bg-[#14161D] border-t border-[#ECEEF2] dark:border-white/10 p-6 shadow-2xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#ECEEF2] dark:border-white/10">
                <h2 className="text-[16px] font-bold text-[#171717] dark:text-white">
                  Sort & Filters
                </h2>
                <button
                  type="button"
                  onClick={() => setShowMobileFilters(false)}
                  className="p-1 rounded-full text-[#8C929C]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Sort By */}
              <div>
                <p className="text-[12px] font-bold uppercase tracking-wider text-[#68707A] dark:text-neutral-400 mb-2">
                  Sort By
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "recent", label: "Recent" },
                    { id: "price_asc", label: "Price: Low" },
                    { id: "price_desc", label: "Price: High" },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSortBy(opt.id as SortOption)}
                      className={`radius-native px-2.5 py-2 rounded-xl text-[12px] font-semibold border transition-colors ${
                        sortBy === opt.id
                          ? "bg-[#171717] text-white dark:bg-white dark:text-[#171717] border-transparent"
                          : "bg-[#F7F8FA] dark:bg-white/5 text-[#4A5058] dark:text-neutral-300 border-[#ECEEF2] dark:border-white/10"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Landmark */}
              <div>
                <label
                  htmlFor="mobile-landmark-select"
                  className="block text-[12px] font-bold uppercase tracking-wider text-[#68707A] dark:text-neutral-400 mb-2"
                >
                  Campus Landmark
                </label>
                <select
                  id="mobile-landmark-select"
                  value={selectedLandmark}
                  onChange={(e) => setSelectedLandmark(e.target.value)}
                  className="radius-native w-full bg-[#F7F8FA] dark:bg-white/5 border border-[#ECEEF2] dark:border-white/10 rounded-xl px-3 py-2 text-[13px] text-[#171717] dark:text-white"
                >
                  {CAMPUS_LANDMARKS.map((landmark) => (
                    <option key={landmark} value={landmark}>
                      {landmark}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mobile Price */}
              <div>
                <p className="text-[12px] font-bold uppercase tracking-wider text-[#68707A] dark:text-neutral-400 mb-2">
                  Price
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min ₦"
                    value={customMinPrice}
                    onChange={(e) => {
                      setCustomMinPrice(e.target.value);
                      setPricePreset("custom");
                    }}
                    className="radius-native bg-[#F7F8FA] dark:bg-white/5 border border-[#ECEEF2] dark:border-white/10 rounded-xl px-3 py-2 text-[13px] text-[#171717] dark:text-white"
                  />
                  <input
                    type="number"
                    placeholder="Max ₦"
                    value={customMaxPrice}
                    onChange={(e) => {
                      setCustomMaxPrice(e.target.value);
                      setPricePreset("custom");
                    }}
                    className="radius-native bg-[#F7F8FA] dark:bg-white/5 border border-[#ECEEF2] dark:border-white/10 rounded-xl px-3 py-2 text-[13px] text-[#171717] dark:text-white"
                  />
                </div>
              </div>

              {/* Mobile Condition */}
              <div>
                <p className="text-[12px] font-bold uppercase tracking-wider text-[#68707A] dark:text-neutral-400 mb-2">
                  Condition
                </p>
                <div className="flex flex-wrap gap-2">
                  {["New", "Like New", "Good", "Used"].map((cond) => {
                    const isChecked = selectedConditions.includes(cond);
                    return (
                      <button
                        key={cond}
                        type="button"
                        onClick={() => {
                          setSelectedConditions((prev) =>
                            prev.includes(cond) ? prev.filter((c) => c !== cond) : [...prev, cond]
                          );
                        }}
                        className={`radius-native px-3 py-1.5 rounded-lg text-[12px] font-semibold border ${
                          isChecked
                            ? "bg-[#171717] text-white dark:bg-white dark:text-[#171717] border-transparent"
                            : "bg-[#F7F8FA] dark:bg-white/5 text-[#4A5058] dark:text-neutral-300 border-[#ECEEF2] dark:border-white/10"
                        }`}
                      >
                        {cond}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Mobile Seller Verification */}
              <div>
                <p className="text-[12px] font-bold uppercase tracking-wider text-[#68707A] dark:text-neutral-400 mb-2">
                  Seller Verification
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "all", label: "All sellers" },
                    { id: "verified", label: "Verified", hasGreenTick: true },
                    { id: "non_verified", label: "Non-verified" },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSelectedSellerType(opt.id)}
                      className={`radius-native px-2 py-2 rounded-xl text-[12px] font-semibold border flex items-center justify-center gap-1 transition-colors ${
                        selectedSellerType === opt.id
                          ? "bg-[#171717] text-white dark:bg-white dark:text-[#171717] border-transparent"
                          : "bg-[#F7F8FA] dark:bg-white/5 text-[#4A5058] dark:text-neutral-300 border-[#ECEEF2] dark:border-white/10"
                      }`}
                    >
                      <span>{opt.label}</span>
                      {opt.hasGreenTick && (
                        <span className="w-3.5 h-3.5 rounded-full bg-[#22C55E] flex items-center justify-center shrink-0">
                          <Check className="w-2 h-2 text-white" strokeWidth={3} />
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Actions */}
              <div className="pt-3 border-t border-[#ECEEF2] dark:border-white/10 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleClearAllFilters}
                  className="radius-native flex-1 py-3 rounded-xl border border-[#ECEEF2] dark:border-white/10 text-[13px] font-semibold text-[#171717] dark:text-white"
                >
                  Reset All
                </button>
                <button
                  type="button"
                  onClick={() => setShowMobileFilters(false)}
                  className="radius-native flex-1 py-3 rounded-xl bg-[#171717] dark:bg-white text-white dark:text-[#171717] text-[13px] font-semibold"
                >
                  Show ({totalResultsCount})
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <RebrandFooter />
    </div>
  );
}
