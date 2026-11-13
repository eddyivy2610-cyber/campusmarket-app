"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Heart,
  MapPin,
  ChevronDown,
  ChevronRight,
  Store,
  Star,
  Users,
} from "lucide-react";

export type HomeFeedPreference = "popular" | "recent" | "both";

interface HomeListingItem {
  id: string;
  title: string;
  price: number;
  priceFormatted: string;
  landmark: string;
  condition: string;
  conditionTone: "neutral" | "green";
  hasMorePhotos?: boolean;
  href: string;
  imageUrl: string;
  imageAlt: string;
  views: number;
  likes: number;
  createdAt: string;
  sellerName?: string;
  sellerHandle?: string;
  storeVerified?: boolean;
  engagementScore: number;
}

interface HomeStoreItem {
  id: string;
  name: string;
  handle: string;
  slug: string;
  category: string;
  campus: string;
  tagline?: string;
  logo?: string;
  isVerified: boolean;
  ratingFormatted: string;
  reviewsCount: number;
  completedDeals: number;
  followersCount: number;
  activeListingsCount: number;
  engagementScore: number;
}

/**
 * Calculates a deterministic engagement score for listings:
 * Engagement = (likes * 3) + (views * 1) + recency bonus for popular sorting
 */
function calculateListingEngagement(l: any): number {
  const likes = Number(l.likes ?? 0);
  const views = Number(l.views ?? 0);
  const isPromoted = Boolean(l.isPromoted);
  return likes * 3 + views * 1 + (isPromoted ? 10 : 0);
}

/**
 * Calculates a deterministic engagement score for campus stores:
 * Engagement = (followers * 3) + (deals * 5) + (reviews * 4) + (rating * 10) + listings
 */
function calculateStoreEngagement(s: any): number {
  const metrics = s.metrics || {};
  const followers = Number(metrics.followersCount ?? 0);
  const deals = Number(metrics.completedDeals ?? 0);
  const reviews = Number(metrics.reviewsCount ?? metrics.reviewCount ?? 0);
  const rating = Number(metrics.rating ?? 5.0);
  const listings = Number(metrics.listingsCount ?? metrics.activeListingCount ?? 0);
  return followers * 3 + deals * 5 + reviews * 4 + Math.round(rating * 10) + listings * 1;
}

export function RebrandHomeFeed() {
  const [feedPreference, setFeedPreference] = useState<HomeFeedPreference>("popular");
  const [allListings, setAllListings] = useState<HomeListingItem[]>([]);
  const [stores, setStores] = useState<HomeStoreItem[]>([]);
  const [loadingListings, setLoadingListings] = useState(true);
  const [loadingStores, setLoadingStores] = useState(true);
  const [savedIds, setSavedIds] = useState<Record<string, boolean>>({});

  // Pagination: progressive client-side disclosure
  // Mobile initial: 12 items. Desktop initial: 16 items.
  const [pageSize, setPageSize] = useState(12);
  const [visibleCount, setVisibleCount] = useState(12);

  // Load user feed preference from localStorage and listen to updates from Marketplace Settings
  useEffect(() => {
    try {
      const stored = localStorage.getItem("ch_home_feed_preference");
      if (stored === "popular" || stored === "recent" || stored === "both") {
        setFeedPreference(stored as HomeFeedPreference);
      }
    } catch {
      // Ignore storage errors
    }

    const handlePreferenceUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ preference: HomeFeedPreference }>;
      if (customEvent.detail?.preference) {
        setFeedPreference(customEvent.detail.preference);
      }
    };

    window.addEventListener("ch_home_feed_preference_update", handlePreferenceUpdate);
    return () => {
      window.removeEventListener("ch_home_feed_preference_update", handlePreferenceUpdate);
    };
  }, []);

  // Set responsive batch sizes based on viewport
  useEffect(() => {
    const isDesktop = window.innerWidth >= 1024;
    const initialSize = isDesktop ? 16 : 12;
    setPageSize(initialSize);
    setVisibleCount(initialSize);
  }, []);

  // Fetch listings and stores based on preference and device scale
  useEffect(() => {
    let isCancelled = false;

    async function loadFeedData() {
      setLoadingListings(true);
      try {
        const isDesktop = typeof window !== "undefined" && window.innerWidth >= 1024;
        // Default target: 50 on mobile, 100 on desktop
        const targetLimit = isDesktop ? 100 : 50;

        // Determine API sort param based on preference
        const sortParam = feedPreference === "recent" ? "recent" : "popular";
        const listingsRes = await fetch(
          `/api/listings?limit=${targetLimit}&status=active&sort=${sortParam}`
        );

        if (listingsRes.ok && !isCancelled) {
          const listJson = await listingsRes.json();
          if (listJson.success && Array.isArray(listJson.data)) {
            const mapped: HomeListingItem[] = listJson.data.map((l: any) => {
              const engScore = calculateListingEngagement(l);
              return {
                id: String(l._id || l.id),
                title: l.title || "Campus Item",
                price: Number(l.price || 0),
                priceFormatted: l.priceFormatted || `₦${Number(l.price || 0).toLocaleString()}`,
                landmark: l.location || l.landmark || l.campus || "On Campus",
                condition: l.condition || (l.listingType === "service" ? "Service" : "Good"),
                conditionTone:
                  l.condition === "Like New" || l.condition === "Brand New"
                    ? ("green" as const)
                    : ("neutral" as const),
                hasMorePhotos: Array.isArray(l.images) && l.images.length > 1,
                href: `/listings/${l.slug || l._id || l.id}`,
                imageUrl:
                  l.images?.[0] ||
                  "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80",
                imageAlt: l.title || "Campus Item",
                views: Number(l.views || 0),
                likes: Number(l.likes || 0),
                createdAt: l.createdAt || new Date().toISOString(),
                sellerName: l.storeName || l.sellerName || "Campus Seller",
                sellerHandle: l.storeSlug || l.sellerHandle || "campus",
                storeVerified: Boolean(l.storeVerified || l.isVerified),
                engagementScore: engScore,
              };
            });

            // Sort rules:
            // "popular" (default) -> Highest engagement first
            // "recent" -> Newest createdAt first
            // "both" -> Top half popular by engagement, followed by newest
            if (feedPreference === "popular") {
              mapped.sort((a, b) => b.engagementScore - a.engagementScore);
            } else if (feedPreference === "recent") {
              mapped.sort(
                (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              );
            } else {
              // "both": rank top engaged first, then balance with newest
              mapped.sort((a, b) => {
                if (b.engagementScore !== a.engagementScore) {
                  return b.engagementScore - a.engagementScore;
                }
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
              });
            }

            setAllListings(mapped);
          }
        }
      } catch (err) {
        console.warn("[RebrandHomeFeed] Could not load listings:", err);
      } finally {
        if (!isCancelled) setLoadingListings(false);
      }
    }

    async function loadStoresData() {
      setLoadingStores(true);
      try {
        // Fetch up to 12 stores sorted by popularity / engagement
        const storesRes = await fetch("/api/stores?limit=12&status=active&sort=popular");
        if (storesRes.ok && !isCancelled) {
          const storeJson = await storesRes.json();
          if (storeJson.success && Array.isArray(storeJson.data)) {
            const mappedStores: HomeStoreItem[] = storeJson.data.map((s: any) => {
              const engScore = calculateStoreEngagement(s);
              const metrics = s.metrics || {};
              return {
                id: String(s._id || s.id),
                name: s.name || "Student Store",
                handle: s.slug || String(s._id || s.id),
                slug: s.slug || String(s._id || s.id),
                category: s.category || "General",
                campus: s.campus || "Main Campus",
                tagline: s.description || s.tagline || "Active campus storefront.",
                logo: s.logo || s.avatar || "",
                isVerified: Boolean(s.isVerified),
                ratingFormatted: (Number(metrics.rating ?? 5.0)).toFixed(1),
                reviewsCount: Number(metrics.reviewsCount ?? metrics.reviewCount ?? 0),
                completedDeals: Number(metrics.completedDeals ?? 0),
                followersCount: Number(metrics.followersCount ?? 0),
                activeListingsCount: Number(metrics.listingsCount ?? metrics.activeListingCount ?? 0),
                engagementScore: engScore,
              };
            });

            // Sort stores strictly by highest engagement first
            mappedStores.sort((a, b) => b.engagementScore - a.engagementScore);
            setStores(mappedStores);
          }
        }
      } catch (err) {
        console.warn("[RebrandHomeFeed] Could not load stores:", err);
      } finally {
        if (!isCancelled) setLoadingStores(false);
      }
    }

    loadFeedData();
    loadStoresData();

    return () => {
      isCancelled = true;
    };
  }, [feedPreference]);

  // Load saved item state
  useEffect(() => {
    try {
      const stored = localStorage.getItem("ch_saved_listings");
      if (stored) {
        setSavedIds(JSON.parse(stored));
      }
    } catch {}
  }, []);

  const toggleSave = useCallback((id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSavedIds((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem("ch_saved_listings", JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  // Currently visible slice of listings (progressive disclosure)
  const visibleListings = useMemo(() => {
    return allListings.slice(0, visibleCount);
  }, [allListings, visibleCount]);

  const hasMore = visibleCount < allListings.length;

  const handleSeeMore = () => {
    setVisibleCount((prev) => Math.min(allListings.length, prev + pageSize));
  };

  // Title dynamically adapts to user's saved marketplace setting
  const feedTitle = useMemo(() => {
    if (feedPreference === "recent") return "Recently listed on campus";
    if (feedPreference === "both") return "Campus Discovery Feed";
    return "Popular on campus";
  }, [feedPreference]);

  return (
    <div
      style={{ fontFamily: "var(--font-plus-jakarta), sans-serif" }}
      className="w-full space-y-10 sm:space-y-14 py-4 sm:py-6"
    >
      {/* ===================================================================== */}
      {/* 1. MAIN LISTINGS FEED (Popular / Recent / Both, 50-100 items)         */}
      {/* ===================================================================== */}
      <section className="max-w-[1380px] mx-auto px-4 sm:px-8 lg:px-12">
        {/* Section Header with Horizontal Divider & See All Link */}
        <div className="flex items-center justify-between gap-4 mb-3.5 sm:mb-5">
          <h2 className="text-[16.5px] sm:text-[20px] font-bold tracking-[-0.02em] text-[#14171A] dark:text-white shrink-0">
            {feedTitle}
          </h2>

          <div
            className="hidden sm:block flex-1 h-[1px] bg-[#E8EAEE] dark:bg-white/10"
            aria-hidden="true"
          />

          <Link
            href="/explore"
            className="inline-flex items-center gap-1 text-[12.5px] sm:text-[13px] font-semibold text-[#D99B00] sm:text-[#22252A] dark:text-[#FFC928] sm:dark:text-neutral-300 hover:text-[#171717] dark:hover:text-white shrink-0 transition-colors"
          >
            <span>See All</span>
            <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
          </Link>
        </div>

        {/* Listings Grid */}
        {loadingListings ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 py-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div
                key={n}
                className="h-56 rounded-2xl bg-neutral-200 dark:bg-neutral-800 animate-pulse"
              />
            ))}
          </div>
        ) : allListings.length === 0 ? (
          <div className="py-12 text-center rounded-2xl border border-dashed border-[#E4E7EC] dark:border-white/10 bg-white dark:bg-[#14161D] p-6 space-y-3">
            <Store className="w-8 h-8 text-[#8C929C] mx-auto opacity-60" />
            <h3 className="text-[15px] font-bold text-[#171717] dark:text-white">
              No campus listings found
            </h3>
            <p className="text-[12.5px] text-[#68707A] dark:text-neutral-400 max-w-sm mx-auto">
              Be the first student to post an item or service to your university feed!
            </p>
            <Link
              href="/listings/create"
              className="radius-native inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#171717] dark:bg-white text-white dark:text-[#171717] text-[12.5px] font-bold shadow-xs hover:opacity-90 transition-opacity"
            >
              <span>Post a Listing</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-6 sm:space-y-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
              {visibleListings.map((item) => {
                const isSaved = Boolean(savedIds[item.id]);

                return (
                  <div
                    key={item.id}
                    className="radius-native group rounded-2xl bg-white dark:bg-[#14161D] border border-[#ECEEF2] dark:border-white/10 p-2.5 sm:p-3 shadow-[0_4px_20px_rgba(15,23,42,0.025)] hover:shadow-[0_8px_28px_rgba(15,23,42,0.06)] transition-all duration-200 flex flex-col justify-between"
                  >
                    <div>
                      {/* Product Image Container */}
                      <div className="radius-native relative h-[130px] sm:h-[160px] w-full rounded-xl bg-[#F6F7F9] dark:bg-white/5 overflow-hidden flex items-center justify-center">
                        <Link
                          href={item.href}
                          className="w-full h-full flex items-center justify-center"
                        >
                          <img
                            src={item.imageUrl}
                            alt={item.imageAlt}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        </Link>

                        {/* Top-Right Condition Badge + Save Button Stack */}
                        <div className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 flex flex-col items-end gap-1.5 z-10">
                          <div className="flex items-center gap-1">
                            <span
                              className={`radius-native inline-flex items-center px-2 py-0.5 rounded-full text-[9.5px] sm:text-[10.5px] font-semibold leading-tight shadow-xs ${
                                item.conditionTone === "green"
                                  ? "bg-[#E6F8EC] text-[#15803D] dark:bg-emerald-500/20 dark:text-emerald-300"
                                  : "bg-[#EDEEF2]/95 text-[#4A5058] dark:bg-neutral-800/90 dark:text-neutral-300"
                              }`}
                            >
                              {item.condition}
                            </span>
                            {item.hasMorePhotos && (
                              <span
                                className="hidden sm:inline text-[#68707A] dark:text-neutral-400"
                                aria-hidden="true"
                              >
                                <ChevronRight className="w-3.5 h-3.5" strokeWidth={2} />
                              </span>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={(e) => toggleSave(item.id, e)}
                            aria-label={
                              isSaved ? `Remove ${item.title} from saved` : `Save ${item.title}`
                            }
                            aria-pressed={isSaved}
                            className="radius-native w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/85 dark:bg-black/40 backdrop-blur-xs flex items-center justify-center text-[#5B636E] hover:text-[#171717] dark:text-neutral-300 transition-colors cursor-pointer"
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

                      {/* Product Title & Landmark */}
                      <div className="pt-2 sm:pt-3 px-0.5">
                        <Link href={item.href}>
                          <h3 className="text-[12.5px] sm:text-[13.5px] font-bold text-[#171717] dark:text-white leading-snug truncate group-hover:underline">
                            {item.title}
                          </h3>
                        </Link>

                        <div className="mt-0.5 sm:mt-1 flex items-center gap-1 text-[10.5px] sm:text-[11.5px] font-medium text-[#68707A] dark:text-neutral-400">
                          <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" strokeWidth={2} />
                          <span className="truncate">{item.landmark}</span>
                        </div>

                        {item.sellerName && (
                          <Link
                            href={`/stores/${item.sellerHandle || "campus"}`}
                            className="mt-0.5 block text-[10.5px] sm:text-[11px] text-[#8C929C] dark:text-neutral-500 hover:text-[#171717] dark:hover:text-white truncate"
                          >
                            {item.sellerName}
                          </Link>
                        )}
                      </div>
                    </div>

                    {/* Bottom Row: Price + Verified Check + View Item Action */}
                    <div className="mt-2.5 sm:mt-3 pt-1 px-0.5 flex items-center justify-between gap-1.5">
                      <Link href={item.href} className="min-w-0">
                        <span className="text-[13.5px] sm:text-[15px] font-extrabold text-[#14171A] dark:text-white tracking-[-0.015em]">
                          {item.priceFormatted}
                        </span>
                      </Link>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <Link
                          href={item.href}
                          className="hidden sm:inline-flex radius-native items-center gap-1 rounded-lg border border-[#E4E7EC] dark:border-white/15 bg-white dark:bg-white/5 hover:bg-[#F7F8FA] dark:hover:bg-white/10 px-2.5 py-1 text-[11px] sm:text-[11.5px] font-semibold text-[#171717] dark:text-white transition-colors"
                        >
                          <span>View</span>
                          <ArrowRight className="w-3 h-3" strokeWidth={2} />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls ("See More" / Progressive Load) */}
            {hasMore && (
              <div className="pt-2 sm:pt-4 flex justify-center">
                <button
                  type="button"
                  onClick={handleSeeMore}
                  className="radius-native inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white dark:bg-[#14161D] hover:bg-[#F7F8FA] dark:hover:bg-white/5 text-[#171717] dark:text-white text-[13px] font-bold border border-[#DCE0E6] dark:border-white/15 shadow-2xs hover:border-[#171717] dark:hover:border-white transition-all active:scale-[0.98] cursor-pointer"
                >
                  <span>See more</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ===================================================================== */}
      {/* 2. STORES SECTION AT THE END (Ranked by engagement)                  */}
      {/* ===================================================================== */}
      <section className="max-w-[1380px] mx-auto px-4 sm:px-8 lg:px-12 pt-2 sm:pt-4 border-t border-[#ECEEF2] dark:border-white/10">
        <div className="flex items-center justify-between gap-4 mb-3.5 sm:mb-5">
          <h2 className="text-[16.5px] sm:text-[20px] font-bold tracking-[-0.02em] text-[#14171A] dark:text-white shrink-0">
            Popular campus stores
          </h2>

          <div
            className="hidden sm:block flex-1 h-[1px] bg-[#E8EAEE] dark:bg-white/10"
            aria-hidden="true"
          />

          <Link
            href="/stores"
            className="inline-flex items-center gap-1 text-[12.5px] sm:text-[13px] font-semibold text-[#D99B00] sm:text-[#22252A] dark:text-[#FFC928] sm:dark:text-neutral-300 hover:text-[#171717] dark:hover:text-white shrink-0 transition-colors"
          >
            <span>See All</span>
            <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
          </Link>
        </div>

        {/* Stores Grid */}
        {loadingStores ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 lg:gap-5 py-4">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="h-44 rounded-2xl bg-neutral-200 dark:bg-neutral-800 animate-pulse"
              />
            ))}
          </div>
        ) : stores.length === 0 ? (
          <div className="py-8 text-center text-neutral-500 text-sm">
            No active stores found on campus.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 lg:gap-5">
            {stores.map((store) => (
              <div
                key={store.id}
                className="radius-native group rounded-2xl bg-white dark:bg-[#14161D] border border-[#ECEEF2] dark:border-white/10 p-3.5 sm:p-4 shadow-[0_4px_20px_rgba(15,23,42,0.025)] hover:shadow-[0_8px_28px_rgba(15,23,42,0.06)] transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  {/* Top Row: Store Avatar */}
                  <div className="flex items-start justify-between gap-2.5">
                    <Link
                      href={`/stores/${store.slug || store.handle}`}
                      className={`radius-native w-11 h-11 rounded-xl bg-[#F6F7F9] dark:bg-white/5 border border-[#ECEEF2] dark:border-white/10 overflow-hidden flex items-center justify-center shrink-0 transition-all ${
                        store.isVerified
                          ? "ring-2 ring-[#FFC928] ring-offset-1 ring-offset-white dark:ring-offset-[#14161D]"
                          : ""
                      }`}
                    >
                      {store.logo ? (
                        <img
                          src={store.logo}
                          alt={store.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <Store
                          className="w-5 h-5 text-[#22252A] dark:text-neutral-200"
                          strokeWidth={1.8}
                        />
                      )}
                    </Link>

                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#68707A] dark:text-neutral-400">
                      <span className="flex items-center gap-0.5 text-[#14171A] dark:text-white">
                        <span>{store.ratingFormatted}</span>
                        <Star className="w-3 h-3 fill-[#FFC928] text-[#FFC928]" />
                      </span>
                      <span>·</span>
                      <span>{store.activeListingsCount} items</span>
                    </div>
                  </div>

                  {/* Store Name, Category & Tagline */}
                  <div className="mt-3">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Link
                        href={`/stores/${store.slug || store.handle}`}
                        className="min-w-0 truncate"
                      >
                        <h3 className="text-[13.5px] sm:text-[14px] font-bold text-[#171717] dark:text-white leading-snug truncate group-hover:underline">
                          {store.name}
                        </h3>
                      </Link>
                    </div>

                    <p className="text-[11px] sm:text-[11.5px] font-medium text-[#8C929C] dark:text-neutral-400 mt-0.5">
                      {store.category} · {store.campus}
                    </p>

                    <p className="mt-1.5 text-[11.5px] sm:text-[12px] text-[#5B636E] dark:text-neutral-400 leading-[1.45] line-clamp-2">
                      {store.tagline}
                    </p>
                  </div>
                </div>

                {/* Bottom Row: Landmark + Visit Store Action */}
                <div className="mt-3.5 pt-2.5 border-t border-[#F1F3F6] dark:border-white/5 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 text-[11px] font-medium text-[#68707A] dark:text-neutral-400 min-w-0">
                    <Users className="w-3 h-3 shrink-0" strokeWidth={2} />
                    <span className="truncate">{store.followersCount} followers</span>
                  </div>

                  <Link
                    href={`/stores/${store.slug || store.handle}`}
                    className="radius-native inline-flex items-center gap-1 rounded-lg border border-[#E4E7EC] dark:border-white/15 bg-white dark:bg-white/5 hover:bg-[#F7F8FA] dark:hover:bg-white/10 px-2.5 py-1 text-[11px] sm:text-[11.5px] font-semibold text-[#171717] dark:text-white shrink-0 transition-colors"
                  >
                    <span>Visit store</span>
                    <ArrowRight className="w-3 h-3" strokeWidth={2} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
