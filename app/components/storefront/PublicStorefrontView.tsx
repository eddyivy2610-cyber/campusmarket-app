"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  CheckCircle2,
  MapPin,
  Heart,
  Share2,
  MessageSquare,
  Search,
  Store as StoreIcon,
  ShoppingBag,
  Wrench,
  Info,
  Clock,
  ShieldCheck,
  Phone,
  Mail,
  ExternalLink,
  ArrowLeft,
  AlertTriangle,
  XCircle,
  Copy,
  Check,
  Plus,
} from "lucide-react";
import { RebrandHeader } from "../header/RebrandHeader";
import { useAuth } from "../../context/AuthContext";
import { followService } from "@/lib/followService";
import { RebrandFooter } from "../sections/RebrandFooter";

export interface PublicStoreListing {
  _id?: string;
  id?: string;
  title: string;
  price: number;
  priceFormatted: string;
  category: string;
  listingType: "product" | "service";
  description: string;
  condition?: string;
  serviceDetails?: {
    pricingModel?: "fixed" | "hourly" | "negotiable" | "starting_at";
    deliveryTime?: string;
    serviceLocationType?: "on_campus" | "remote" | "client_location" | "vendor_shop";
    portfolio?: string[];
  };
  images?: string[];
  imageUrl?: string;
  location?: string;
  campus?: string;
  status?: string;
}

export interface PublicStoreData {
  _id?: string;
  id?: string;
  ownerId?: string;
  name: string;
  slug: string;
  description: string;
  storeType: "student_store" | "local_business" | "student_owned" | "approved_business";
  category: string;
  categoryTags?: string[];
  campus: string;
  operatingLocation: string;
  logo: string;
  coverImage?: string;
  status: "active" | "paused" | "suspended" | "pending_review";
  isVerified: boolean;
  verificationType?: "student" | "business";
  contact?: {
    phone?: string;
    whatsapp?: string;
    email?: string;
  };
  metrics?: {
    rating: number;
    reviewsCount: number;
    completedDeals: number;
    listingsCount: number;
    followersCount?: number;
  };
  openingHours?: string;
  responseTime?: string;
}

interface PublicStorefrontViewProps {
  initialStore?: PublicStoreData | null;
  initialListings?: PublicStoreListing[];
  slug: string;
  errorMessage?: string | null;
}

export function PublicStorefrontView({
  initialStore,
  initialListings = [],
  slug,
  errorMessage: initialError = null,
}: PublicStorefrontViewProps) {
  const router = useRouter();

  const [store, setStore] = useState<PublicStoreData | null>(initialStore || null);
  const [listings, setListings] = useState<PublicStoreListing[]>(initialListings);
  const [isLoading, setIsLoading] = useState(!initialStore && !initialError);
  const [error, setError] = useState<string | null>(initialError);

  const [activeTab, setActiveTab] = useState<"all" | "products" | "services" | "about">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowPending, setIsFollowPending] = useState(false);
  const [followersCount, setFollowersCount] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Check saved state from localStorage
  useEffect(() => {
    if (store?._id || store?.id) {
      const storeId = (store._id || store.id)!;
      setFollowersCount(store.metrics?.followersCount ?? 0);
      try {
        const key = `ch_saved_store_${storeId}`;
        setIsSaved(localStorage.getItem(key) === "true");
      } catch {}

      if (user?.id) {
        followService
          .getStoreFollowStatus(storeId)
          .then((res) => {
            if (res?.success) setIsFollowing(Boolean(res.isFollowing));
          })
          .catch(() => {});
      }
    }
  }, [store, user?.id]);

  const handleFollowToggle = async () => {
    if (!user) {
      showToast("Please sign in to follow stores.");
      router.push("/login");
      return;
    }
    const storeId = store?._id || store?.id;
    if (!storeId) return;

    setIsFollowPending(true);
    const nextFollowing = !isFollowing;
    setIsFollowing(nextFollowing);
    setFollowersCount((prev) => (nextFollowing ? prev + 1 : Math.max(0, prev - 1)));

    try {
      const res = nextFollowing
        ? await followService.followStore(storeId)
        : await followService.unfollowStore(storeId);
      if (res?.success) {
        setIsFollowing(res.isFollowing);
        showToast(res.isFollowing ? `Following ${store?.name}` : `Unfollowed ${store?.name}`);
      } else {
        setIsFollowing(!nextFollowing);
        setFollowersCount((prev) => (nextFollowing ? Math.max(0, prev - 1) : prev + 1));
        showToast((res as any)?.error || "Failed to update follow status.");
      }
    } catch (err: any) {
      setIsFollowing(!nextFollowing);
      setFollowersCount((prev) => (nextFollowing ? Math.max(0, prev - 1) : prev + 1));
      showToast(err.message || "Failed to update follow status.");
    } finally {
      setIsFollowPending(false);
    }
  };

  // Fetch store and listings if not provided or to ensure fresh live data
  useEffect(() => {
    let isMounted = true;

    async function loadStorefront() {
      if (!slug) return;
      setIsLoading(true);
      setError(null);

      try {
        const storeRes = await fetch(`/api/stores/${encodeURIComponent(slug)}`);
        const storeJson = await storeRes.json();

        if (!storeRes.ok || !storeJson.success) {
          // If suspended or forbidden
          if (storeRes.status === 403) {
            if (isMounted) {
              setError(storeJson.error || "This storefront is suspended.");
              setIsLoading(false);
            }
            return;
          }
          throw new Error(storeJson.error || "Store not found");
        }

        const loadedStore: PublicStoreData = storeJson.data;
        if (!isMounted) return;
        setStore(loadedStore);

        // Fetch store catalog items
        try {
          const listRes = await fetch(`/api/stores/${loadedStore._id || loadedStore.id}/listings`);
          const listJson = await listRes.json();
          if (listJson.success && Array.isArray(listJson.data)) {
            if (isMounted) setListings(listJson.data);
          }
        } catch (catErr) {
          console.warn("Could not load dynamic store listings:", catErr);
        }
      } catch (err: any) {
        // Check if slug matches static seed store in STORES_DATABASE as fallback
        try {
          const { STORES_DATABASE } = await import("../../data/storesData");
          const seedStore = STORES_DATABASE.find(
            (s) => s.slug.toLowerCase() === slug.toLowerCase() || s.id === slug
          );

          if (seedStore && isMounted) {
            const mappedStore: PublicStoreData = {
              id: seedStore.id,
              slug: seedStore.slug,
              name: seedStore.name,
              description: seedStore.description,
              storeType: seedStore.businessType,
              category: seedStore.primaryCategory,
              categoryTags: seedStore.categoryTags,
              campus: seedStore.campusName,
              operatingLocation: seedStore.landmark,
              logo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=320&auto=format&fit=crop&q=80",
              coverImage: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1400&auto=format&fit=crop&q=80",
              status: "active",
              isVerified: true,
              verificationType: "student",
              openingHours: seedStore.openingHours,
              responseTime: seedStore.responseTime,
              metrics: {
                rating: seedStore.ratingScore,
                reviewsCount: seedStore.reviewsCount,
                completedDeals: 36,
                listingsCount: seedStore.products.length + seedStore.services.length,
              },
            };

            const mappedListings: PublicStoreListing[] = [
              ...seedStore.products.map((p) => ({
                id: p.id,
                _id: p.id,
                title: p.title,
                price: p.price,
                priceFormatted: p.priceFormatted,
                category: p.category,
                listingType: "product" as const,
                condition: p.condition,
                description: p.description,
                images: ["https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&auto=format&fit=crop&q=80"],
                location: seedStore.landmark,
                campus: seedStore.campusName,
                status: "active",
              })),
              ...seedStore.services.map((s) => ({
                id: s.id,
                _id: s.id,
                title: s.title,
                price: s.rate,
                priceFormatted: s.rateFormatted,
                category: s.category,
                listingType: "service" as const,
                description: s.description,
                serviceDetails: {
                  pricingModel: "starting_at" as const,
                  deliveryTime: s.turnaroundTime,
                  serviceLocationType: "on_campus" as const,
                },
                location: seedStore.landmark,
                campus: seedStore.campusName,
                status: "active",
              })),
            ];

            setStore(mappedStore);
            setListings(mappedListings);
            setIsLoading(false);
            return;
          }
        } catch {}

        if (isMounted) {
          setError(err.message || "Failed to load store.");
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    if (!initialStore) {
      loadStorefront();
    } else {
      setIsLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [slug, initialStore]);

  const toggleSave = () => {
    if (!store) return;
    const key = `ch_saved_store_${store._id || store.id}`;
    const next = !isSaved;
    setIsSaved(next);
    try {
      localStorage.setItem(key, String(next));
    } catch {}
    showToast(next ? "Store saved to your favorites" : "Store removed from favorites");
  };

  const copyShareLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      showToast("Store link copied to clipboard!");
    }
  };

  // Filter listings
  const filteredListings = useMemo(() => {
    return listings.filter((item) => {
      if (activeTab === "products" && item.listingType !== "product") return false;
      if (activeTab === "services" && item.listingType !== "service") return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesCategory = item.category.toLowerCase().includes(q);
        const matchesDesc = (item.description || "").toLowerCase().includes(q);
        if (!matchesTitle && !matchesCategory && !matchesDesc) return false;
      }
      return true;
    });
  }, [listings, activeTab, searchQuery]);

  const productsCount = useMemo(
    () => listings.filter((l) => l.listingType === "product").length,
    [listings]
  );
  const servicesCount = useMemo(
    () => listings.filter((l) => l.listingType === "service").length,
    [listings]
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F7F8FA] dark:bg-[#0E1015]">
        <RebrandHeader />
        <main className="flex-1 flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-[#171717] dark:border-white border-t-transparent animate-spin" />
            <p className="text-[13px] text-[#5B636E] dark:text-neutral-400 font-medium">
              Loading campus storefront...
            </p>
          </div>
        </main>
        <RebrandFooter />
      </div>
    );
  }

  // Suspended or not found error state
  if (error || !store) {
    const isSuspended = (error || "").toLowerCase().includes("suspended");

    return (
      <div className="min-h-screen flex flex-col bg-[#F7F8FA] dark:bg-[#0E1015] text-[#171717] dark:text-white">
        <RebrandHeader />
        <main className="flex-1 max-w-[720px] mx-auto px-5 py-20 flex flex-col items-center text-center">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-5 ${
              isSuspended
                ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
            }`}
          >
            {isSuspended ? (
              <XCircle className="w-8 h-8" />
            ) : (
              <StoreIcon className="w-8 h-8" />
            )}
          </div>

          <h1 className="text-[22px] sm:text-[24px] font-extrabold tracking-tight">
            {isSuspended ? "Storefront Suspended" : "Storefront Not Found"}
          </h1>

          <p className="mt-2 text-[14px] text-[#5B636E] dark:text-neutral-400 max-w-md">
            {error ||
              "We couldn't find an active store matching this address. It may have been renamed, moved, or deleted."}
          </p>

          <div className="mt-6 flex items-center gap-3">
            <Link
              href="/stores"
              className="radius-native inline-flex items-center gap-2 rounded-xl bg-[#171717] dark:bg-white text-white dark:text-[#171717] px-5 py-2.5 text-[13px] font-bold shadow-xs hover:opacity-90 transition-opacity"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Browse All Stores</span>
            </Link>
          </div>
        </main>
        <RebrandFooter />
      </div>
    );
  }

  const isStudentSeller =
    store.storeType === "student_store" || store.storeType === "student_owned";
  const isPaused = store.status === "paused";
  const isOwner = Boolean(user?.id && store.ownerId && store.ownerId === user.id);

  const messageUrl = `/messages?recipient=${encodeURIComponent(
    store.ownerId || store._id || store.id || ""
  )}&store=${encodeURIComponent(store._id || store.id || "")}`;

  return (
    <div
      style={{ fontFamily: "var(--font-plus-jakarta), sans-serif" }}
      className="min-h-screen flex flex-col bg-[#F7F8FA] dark:bg-[#0E1015] text-[#171717] dark:text-white antialiased"
    >
      <RebrandHeader />

      {/* Floating feedback toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 radius-native bg-[#171717] text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2.5 text-[13px] font-semibold animate-fade-in border border-white/10">
          <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Notice Banner if Store is Paused */}
      {isPaused && (
        <div className="w-full bg-amber-500/10 border-b border-amber-500/20 py-2.5 px-4 text-center">
          <div className="max-w-[1380px] mx-auto flex items-center justify-center gap-2 text-[12.5px] font-semibold text-amber-800 dark:text-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>
              <strong>Store Temporarily Paused:</strong> This store is currently taking a break. You
              can still browse the catalog, but replies and new orders may be delayed.
            </span>
          </div>
        </div>
      )}

      <main className="flex-1 w-full py-6 sm:py-8">
        <div className="max-w-[1380px] mx-auto px-5 sm:px-8 lg:px-12 space-y-6">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-[12px] font-medium text-[#7A818C] dark:text-neutral-400">
            <Link href="/stores" className="hover:text-[#171717] dark:hover:text-white transition-colors">
              Stores
            </Link>
            <span>/</span>
            <span className="text-[#171717] dark:text-white font-semibold truncate max-w-[200px]">
              {store.name}
            </span>
          </div>

          {/* =============================================================== */}
          {/* HERO PROFILE CARD                                              */}
          {/* =============================================================== */}
          <section className="radius-native relative rounded-2xl bg-white dark:bg-[#14161D] border border-[#E8E8E8] dark:border-white/10 shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
            {/* Cover Banner */}
            <div className="relative h-36 sm:h-48 w-full bg-gradient-to-r from-[#FFC928]/30 via-[#FFE182]/20 to-neutral-200 dark:to-neutral-900 overflow-hidden">
              {store.coverImage ? (
                <img
                  src={store.coverImage}
                  alt={`${store.name} banner`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-end pr-8 opacity-20">
                  <StoreIcon className="w-32 h-32 text-[#171717] dark:text-white" />
                </div>
              )}
            </div>

            {/* Profile Identity Details */}
            <div className="px-5 sm:px-8 pb-6 pt-3">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                {/* Left Block: Logo + Brand Info */}
                <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-5 min-w-0 flex-1">
                  {/* Logo overlapping cover */}
                  <div className="-mt-14 sm:-mt-16 shrink-0 relative z-10">
                    {store.logo ? (
                      <img
                        src={store.logo}
                        alt={store.name}
                        className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-white dark:border-[#14161D] shadow-md bg-white"
                      />
                    ) : (
                      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-4 border-white dark:border-[#14161D] shadow-md bg-[#FFC928] text-[#171717] flex items-center justify-center font-black text-3xl">
                        {store.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Title & Tagline */}
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-[20px] sm:text-[24px] font-extrabold tracking-[-0.02em] text-[#171717] dark:text-white leading-tight">
                        {store.name}
                      </h1>

                      {store.isVerified && (
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#FFC928]/20 text-[#855B00] dark:text-[#FFC928] border border-[#FFC928]/40"
                          title="Verified campus vendor"
                        >
                          <BadgeCheck className="w-3.5 h-3.5 text-[#171717] fill-[#FFC928]" />
                          <span>{isStudentSeller ? "Verified Student Seller" : "Verified Business"}</span>
                        </span>
                      )}

                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#F2F4F7] dark:bg-white/10 text-[#5B636E] dark:text-neutral-300">
                        {store.category}
                      </span>
                    </div>

                    <p className="text-[13.5px] text-[#4A5058] dark:text-neutral-300 leading-relaxed max-w-2xl">
                      {store.description}
                    </p>

                    <div className="flex items-center gap-4 flex-wrap text-[12px] font-medium text-[#68707A] dark:text-neutral-400 pt-1">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#8C929C]" />
                        <span>{store.operatingLocation || store.campus}</span>
                      </div>

                      {store.openingHours && (
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#8C929C]" />
                          <span>{store.openingHours}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Block: Stats & Action CTAs */}
                <div className="md:w-[280px] shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-[#ECEEF2] dark:border-white/10 flex flex-col items-stretch gap-4">
                  {/* Milestones / Metrics */}
                  <div className="flex items-center justify-between px-2 py-2 rounded-xl bg-[#F7F8FA] dark:bg-white/5 border border-[#ECEEF2] dark:border-white/10">
                    <div className="text-center flex-1">
                      <div className="text-[16px] font-extrabold text-[#171717] dark:text-white leading-tight">
                        {store.metrics?.completedDeals ?? 24}
                      </div>
                      <div className="text-[11px] font-medium text-[#7A818C] dark:text-neutral-400 mt-0.5">
                        Deals
                      </div>
                    </div>

                    <span className="text-[#DCE0E6] dark:text-white/20 select-none">|</span>

                    <div className="text-center flex-1">
                      <div className="text-[16px] font-extrabold text-[#171717] dark:text-white leading-tight flex items-center justify-center gap-1">
                        <span>{store.metrics?.rating ?? 4.8}</span>
                        <span className="text-amber-500 text-xs">★</span>
                      </div>
                      <div className="text-[11px] font-medium text-[#7A818C] dark:text-neutral-400 mt-0.5">
                        {store.metrics?.reviewsCount ?? 12} reviews
                      </div>
                    </div>

                    <span className="text-[#DCE0E6] dark:text-white/20 select-none">|</span>

                    <div className="text-center flex-1">
                      <div className="text-[16px] font-extrabold text-[#171717] dark:text-white leading-tight">
                        {listings.length}
                      </div>
                      <div className="text-[11px] font-medium text-[#7A818C] dark:text-neutral-400 mt-0.5">
                        Listings
                      </div>
                    </div>

                    <span className="text-[#DCE0E6] dark:text-white/20 select-none">|</span>

                    <div className="text-center flex-1">
                      <div className="text-[16px] font-extrabold text-[#171717] dark:text-white leading-tight">
                        {followersCount}
                      </div>
                      <div className="text-[11px] font-medium text-[#7A818C] dark:text-neutral-400 mt-0.5">
                        Followers
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {!isOwner && (
                      <button
                        type="button"
                        onClick={handleFollowToggle}
                        disabled={isFollowPending}
                        className={`radius-native h-10 px-3.5 sm:px-4 rounded-xl text-[12.5px] sm:text-[13px] font-bold inline-flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                          isFollowing
                            ? "bg-[#171717] dark:bg-white text-white dark:text-[#171717] shadow-xs"
                            : "border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-white/5 hover:border-[#171717] text-[#171717] dark:text-white"
                        }`}
                      >
                        {isFollowing ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-[#22C55E]" />
                            <span>Following</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Follow</span>
                          </>
                        )}
                      </button>
                    )}
                    <Link
                      href={messageUrl}
                      className="radius-native flex-1 h-10 px-4 rounded-xl bg-[#FFC928] hover:bg-[#F2BD1E] text-[#171717] text-[13px] font-bold inline-flex items-center justify-center gap-2 shadow-xs transition-colors"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Message Seller</span>
                    </Link>

                    <button
                      type="button"
                      onClick={copyShareLink}
                      aria-label="Share storefront"
                      title="Share link"
                      className="radius-native w-10 h-10 rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-white/5 hover:border-[#171717] text-[#5B636E] dark:text-neutral-300 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={toggleSave}
                      aria-label={isSaved ? "Remove from saved" : "Save store"}
                      title="Save store"
                      className="radius-native w-10 h-10 rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-white/5 hover:border-[#171717] text-[#5B636E] dark:text-neutral-300 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Heart
                        className={`w-4 h-4 transition-colors ${
                          isSaved ? "fill-rose-500 text-rose-500" : ""
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* =============================================================== */}
          {/* CATALOG SECTION: TABS & SEARCH                                 */}
          {/* =============================================================== */}
          <div className="space-y-4">
            {/* Filter Tabs & In-Store Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-2 border-b border-[#ECEEF2] dark:border-white/10">
              {/* Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                <button
                  type="button"
                  onClick={() => setActiveTab("all")}
                  className={`radius-native px-3.5 py-1.5 rounded-xl text-[12.5px] font-bold transition-all cursor-pointer ${
                    activeTab === "all"
                      ? "bg-[#171717] text-white dark:bg-white dark:text-[#171717]"
                      : "text-[#5B636E] dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-white/5"
                  }`}
                >
                  All Items ({listings.length})
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("products")}
                  className={`radius-native px-3.5 py-1.5 rounded-xl text-[12.5px] font-bold transition-all cursor-pointer ${
                    activeTab === "products"
                      ? "bg-[#171717] text-white dark:bg-white dark:text-[#171717]"
                      : "text-[#5B636E] dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-white/5"
                  }`}
                >
                  Products ({productsCount})
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("services")}
                  className={`radius-native px-3.5 py-1.5 rounded-xl text-[12.5px] font-bold transition-all cursor-pointer ${
                    activeTab === "services"
                      ? "bg-[#171717] text-white dark:bg-white dark:text-[#171717]"
                      : "text-[#5B636E] dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-white/5"
                  }`}
                >
                  Services ({servicesCount})
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("about")}
                  className={`radius-native px-3.5 py-1.5 rounded-xl text-[12.5px] font-bold transition-all cursor-pointer ${
                    activeTab === "about"
                      ? "bg-[#171717] text-white dark:bg-white dark:text-[#171717]"
                      : "text-[#5B636E] dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-white/5"
                  }`}
                >
                  About & Trust
                </button>
              </div>

              {/* Store Catalog Search */}
              {activeTab !== "about" && (
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C929C]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search in store..."
                    className="radius-native w-full pl-9 pr-3 py-1.5 text-[12.5px] rounded-xl bg-white dark:bg-white/5 border border-[#DCE0E6] dark:border-white/15 focus:outline-none focus:border-[#FFC928] text-[#171717] dark:text-white"
                  />
                </div>
              )}
            </div>

            {/* Content Switcher */}
            {activeTab === "about" ? (
              /* ABOUT TAB */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="radius-native p-6 rounded-2xl bg-white dark:bg-[#14161D] border border-[#ECEEF2] dark:border-white/10 space-y-4">
                  <h3 className="text-[15px] font-bold text-[#171717] dark:text-white flex items-center gap-2">
                    <Info className="w-4 h-4 text-[#FFC928]" />
                    <span>Store Story & Identity</span>
                  </h3>
                  <p className="text-[13px] text-[#5B636E] dark:text-neutral-300 leading-relaxed">
                    {store.description}
                  </p>

                  <div className="pt-2 border-t border-[#ECEEF2] dark:border-white/10 space-y-2 text-[12.5px]">
                    <div className="flex justify-between">
                      <span className="text-[#8C929C]">Campus Location:</span>
                      <span className="font-semibold">{store.operatingLocation || store.campus}</span>
                    </div>
                    {store.openingHours && (
                      <div className="flex justify-between">
                        <span className="text-[#8C929C]">Operating Hours:</span>
                        <span className="font-semibold">{store.openingHours}</span>
                      </div>
                    )}
                    {store.contact?.phone && (
                      <div className="flex justify-between">
                        <span className="text-[#8C929C]">Contact Phone:</span>
                        <span className="font-semibold">{store.contact.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="radius-native p-6 rounded-2xl bg-white dark:bg-[#14161D] border border-[#ECEEF2] dark:border-white/10 space-y-4">
                  <h3 className="text-[15px] font-bold text-[#171717] dark:text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>Campus Safety & Verification</span>
                  </h3>
                  <ul className="text-[12.5px] text-[#5B636E] dark:text-neutral-300 space-y-2.5">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>
                        <strong>Public Campus Meetups:</strong> Coordinate deals in open campus spaces
                        like the Library or Student Centre.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>
                        <strong>Inspect Before Payment:</strong> Never pay before receiving and testing
                        gadgets, clothes, or printed materials.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>
                        <strong>Contextual Chat:</strong> Contact this vendor directly using the
                        in-app messaging system.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            ) : filteredListings.length === 0 ? (
              /* EMPTY CATALOG STATE */
              <div className="radius-native py-16 px-4 text-center rounded-2xl bg-white dark:bg-[#14161D] border border-[#ECEEF2] dark:border-white/10">
                <ShoppingBag className="w-12 h-12 text-[#8C929C] mx-auto mb-3 opacity-40" />
                <h3 className="text-[16px] font-bold text-[#171717] dark:text-white">
                  No listings found
                </h3>
                <p className="mt-1 text-[13px] text-[#7A818C] max-w-sm mx-auto">
                  {searchQuery
                    ? `No items matching "${searchQuery}" in this store.`
                    : "This storefront currently has no active listings in this category."}
                </p>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="mt-4 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-neutral-100 dark:bg-white/10 hover:bg-neutral-200"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            ) : (
              /* LISTINGS GRID */
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                {filteredListings.map((item) => {
                  const itemId = item._id || item.id || "";
                  const isService = item.listingType === "service";
                  const imageUrl =
                    item.images?.[0] ||
                    item.imageUrl ||
                    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80";

                  // Service pricing model display
                  const pricingModel = item.serviceDetails?.pricingModel || "fixed";
                  let pricePrefix = "";
                  let priceSuffix = "";
                  if (pricingModel === "starting_at") pricePrefix = "From ";
                  if (pricingModel === "hourly") priceSuffix = "/hr";
                  if (pricingModel === "negotiable") pricePrefix = "Approx. ";

                  const detailHref = `/listings/${itemId}`;
                  const enquireHref = `/messages?recipient=${encodeURIComponent(
                    store.ownerId || store._id || ""
                  )}&store=${encodeURIComponent(store._id || store.id || "")}&service=${encodeURIComponent(
                    itemId
                  )}&title=${encodeURIComponent(item.title)}`;

                  return (
                    <div
                      key={itemId}
                      className="radius-native group flex flex-col justify-between rounded-2xl bg-white dark:bg-[#14161D] border border-[#ECEEF2] dark:border-white/10 hover:border-[#171717] dark:hover:border-white transition-all overflow-hidden p-3 shadow-2xs hover:shadow-xs"
                    >
                      <div>
                        {/* Image / Thumbnail Container */}
                        <div className="relative aspect-4/3 w-full rounded-xl overflow-hidden bg-neutral-100 dark:bg-white/5 mb-3">
                          <img
                            src={imageUrl}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                          />

                          {/* Top Tag Badges */}
                          <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                            {isService ? (
                              <span className="radius-native inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#171717]/80 text-white backdrop-blur-xs">
                                <Wrench className="w-2.5 h-2.5 text-[#FFC928]" />
                                <span>Service</span>
                              </span>
                            ) : item.condition ? (
                              <span className="radius-native inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/90 dark:bg-black/80 text-[#171717] dark:text-white backdrop-blur-xs">
                                {item.condition}
                              </span>
                            ) : null}
                          </div>

                          {/* Service turnaround time badge */}
                          {isService && item.serviceDetails?.deliveryTime && (
                            <div className="absolute bottom-2 left-2 z-10">
                              <span className="radius-native inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white/90 dark:bg-black/80 text-[#171717] dark:text-white backdrop-blur-xs">
                                <Clock className="w-2.5 h-2.5 text-[#171717] dark:text-[#FFC928]" />
                                <span>{item.serviceDetails.deliveryTime}</span>
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Title & Category */}
                        <div className="space-y-1">
                          <span className="text-[11px] font-medium text-[#7A818C] dark:text-neutral-400">
                            {item.category}
                          </span>
                          <Link href={detailHref} className="block">
                            <h3 className="text-[13.5px] font-bold text-[#171717] dark:text-white leading-snug line-clamp-2 group-hover:underline">
                              {item.title}
                            </h3>
                          </Link>
                        </div>
                      </div>

                      {/* Price & Action Row */}
                      <div className="mt-3 pt-2.5 border-t border-[#F2F4F7] dark:border-white/5 flex items-center justify-between gap-2">
                        <div>
                          <div className="text-[13.5px] sm:text-[14px] font-extrabold text-[#171717] dark:text-white">
                            {pricePrefix}
                            {item.priceFormatted || `₦${Number(item.price).toLocaleString()}`}
                            {priceSuffix}
                          </div>
                          {isService && (
                            <span className="text-[10px] text-[#7A818C] dark:text-neutral-400 capitalize">
                              {pricingModel.replace("_", " ")}
                            </span>
                          )}
                        </div>

                        {isService ? (
                          <Link
                            href={enquireHref}
                            className="radius-native px-2.5 py-1 rounded-lg bg-[#FFC928] hover:bg-[#F2BD1E] text-[#171717] text-[11px] font-bold transition-colors shrink-0"
                          >
                            Enquire
                          </Link>
                        ) : (
                          <Link
                            href={detailHref}
                            className="radius-native px-2.5 py-1 rounded-lg border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-white/5 hover:border-[#171717] text-[#171717] dark:text-white text-[11px] font-semibold transition-colors shrink-0"
                          >
                            View
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      <RebrandFooter />
    </div>
  );
}
