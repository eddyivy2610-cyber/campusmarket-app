"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  MapPin,
  Share2,
  MessageSquare,
  Search,
  Store as StoreIcon,
  Star,
  AlertTriangle,
  Plus,
  Check,
  Settings,
  Calendar,
} from "lucide-react";
import { RebrandHeader } from "../header/RebrandHeader";
import { ProfileShareModal } from "../profile/ProfileShareModal";
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
  createdAt?: string;
  metrics?: {
    rating: number;
    reviewsCount: number;
    completedDeals: number;
    listingsCount: number;
    followersCount?: number;
  };
  vacationMode?: boolean;
}

interface StorefrontProfileViewProps {
  slug: string;
}

export function StorefrontProfileView({ slug }: StorefrontProfileViewProps) {
  const router = useRouter();
  const { user } = useAuth();

  const [store, setStore] = useState<PublicStoreData | null>(null);
  const [listings, setListings] = useState<PublicStoreListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<"all" | "products" | "services">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowPending, setIsFollowPending] = useState(false);
  const [followersCount, setFollowersCount] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    if (store?._id || store?.id) {
      const storeId = (store._id || store.id)!;
      setFollowersCount(store.metrics?.followersCount ?? 0);
      if ((store as any).isFollowing !== undefined) {
        setIsFollowing(Boolean((store as any).isFollowing));
      }

      if (user?.id) {
        followService
          .getStoreFollowStatus(storeId)
          .then((res: any) => {
            if (res?.success) {
              setIsFollowing(Boolean(res.isFollowing));
              if (typeof res.followersCount === "number") {
                setFollowersCount(res.followersCount);
              }
            }
          })
          .catch(() => {});
      }
    }
  }, [store?._id, store?.id, user?.id]);

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

        try {
          const listRes = await fetch(`/api/stores/${loadedStore._id || loadedStore.id}/listings`);
          const listJson = await listRes.json();
          if (listJson.success && Array.isArray(listJson.data)) {
            if (isMounted) setListings(listJson.data);
          }
        } catch (catErr) {
          console.warn("Could not load store listings:", catErr);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err?.message || "Storefront could not be found.");
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadStorefront();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  const handleFollowToggle = async () => {
    if (!user) {
      router.push("/register");
      return;
    }
    const storeId = store?._id || store?.id;
    if (!storeId) return;

    setIsFollowPending(true);
    const nextFollowing = !isFollowing;
    setIsFollowing(nextFollowing);
    setFollowersCount((prev) => (nextFollowing ? prev + 1 : Math.max(0, prev - 1)));

    try {
      const res: any = nextFollowing
        ? await followService.followStore(storeId)
        : await followService.unfollowStore(storeId);
      if (res?.success) {
        setIsFollowing(res.isFollowing);
        if (typeof res.followersCount === "number") {
          setFollowersCount(res.followersCount);
        }
        showToast(res.isFollowing ? `Following ${store?.name}` : `Unfollowed ${store?.name}`);
      } else {
        setIsFollowing(!nextFollowing);
        setFollowersCount((prev) => (nextFollowing ? Math.max(0, prev - 1) : prev + 1));
        showToast(res?.error || "Failed to update follow status.");
      }
    } catch (err: any) {
      setIsFollowing(!nextFollowing);
      setFollowersCount((prev) => (nextFollowing ? Math.max(0, prev - 1) : prev + 1));
      showToast(err?.message || "Failed to update follow status.");
    } finally {
      setIsFollowPending(false);
    }
  };

  const filteredListings = useMemo(() => {
    return listings.filter((item) => {
      if (activeTab === "products" && item.listingType !== "product") return false;
      if (activeTab === "services" && item.listingType !== "service") return false;
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        return (
          item.title.toLowerCase().includes(q) ||
          (item.category || "").toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [listings, activeTab, searchQuery]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F7F8FA] dark:bg-[#0E1015] text-[#171717] dark:text-white antialiased">
        <RebrandHeader />
        <main className="flex-1 w-full max-w-[1380px] mx-auto px-4 sm:px-8 lg:px-12 py-8">
          <div className="radius-native rounded-2xl bg-white dark:bg-[#14161D] border border-[#ECEEF2] dark:border-white/10 overflow-hidden animate-pulse">
            <div className="h-28 sm:h-32 w-full bg-[#E8ECF2] dark:bg-white/5" />
            <div className="p-6 flex items-center gap-5">
              <div className="w-24 h-24 rounded-full bg-[#E8ECF2] dark:bg-white/10 -mt-14 shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-6 w-48 bg-[#E8ECF2] dark:bg-white/10 rounded" />
                <div className="h-4 w-72 bg-[#E8ECF2] dark:bg-white/10 rounded" />
              </div>
            </div>
          </div>
        </main>
        <RebrandFooter />
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F7F8FA] dark:bg-[#0E1015] text-[#171717] dark:text-white antialiased">
        <RebrandHeader />
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="radius-native max-w-md w-full rounded-2xl bg-white dark:bg-[#14161D] border border-[#ECEEF2] dark:border-white/10 p-8 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
              <StoreIcon className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-extrabold">Storefront Unavailable</h1>
            <p className="text-[13px] text-[#68707A] dark:text-neutral-400">
              {error || "We could not find this campus storefront."}
            </p>
            <Link
              href="/stores"
              className="radius-native inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-[#FFC928] hover:bg-[#F2BD1E] text-[#171717] text-[13px] font-bold transition-colors"
            >
              Browse Store Directory
            </Link>
          </div>
        </main>
        <RebrandFooter />
      </div>
    );
  }

  const isPaused = store.status === "paused" || Boolean(store.vacationMode);
  const isOwner = Boolean(user?.id && store.ownerId && store.ownerId === user.id);
  const reviewsCount = store.metrics?.reviewsCount ?? 0;
  const rating = store.metrics?.rating ?? 5.0;
  const joinedLabel = store.createdAt
    ? new Date(store.createdAt).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "Recent";

  const messageUrl = user
    ? `/messages?${new URLSearchParams({
        from: "store",
        contextType: "store",
        storeId: store._id || store.id || "",
        participantId: store.ownerId || store._id || store.id || "",
        participantName: store.name || "Store",
        participantAvatar: store.logo || "",
        participantSubtitle:
          store.storeType === "student_store" || store.storeType === "student_owned"
            ? "Student Store"
            : "Approved Business",
        participantVerified: store.isVerified ? "true" : "false",
      }).toString()}`
    : "/register";

  const formatFollowers = (n: number) =>
    n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);

  return (
    <div
      style={{ fontFamily: "var(--font-plus-jakarta), sans-serif" }}
      className="min-h-screen flex flex-col bg-[#F7F8FA] dark:bg-[#0E1015] text-[#171717] dark:text-white antialiased"
    >
      <RebrandHeader />

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 radius-native bg-[#171717] text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2.5 text-[13px] font-semibold border border-white/10">
          <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {isPaused && (
        <div className="w-full bg-amber-500/10 border-b border-amber-500/20 py-2.5 px-4 text-center">
          <div className="max-w-[1380px] mx-auto flex items-center justify-center gap-2 text-[12.5px] font-semibold text-amber-800 dark:text-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>
              <strong>Store Temporarily Paused:</strong> This store is currently taking a break.
              Replies and new orders may be delayed.
            </span>
          </div>
        </div>
      )}

      <main className="flex-1 w-full max-w-[1380px] mx-auto px-4 sm:px-8 lg:px-12 py-6 sm:py-8 space-y-6">
        {/* Top Storefront Card (Unified Profile Design) */}
        <section className="radius-native relative rounded-2xl bg-white dark:bg-[#14161D] border border-[#ECEEF2] dark:border-white/10 shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
          <div className="relative h-28 sm:h-32 w-full bg-[#E8ECF2] dark:bg-white/5 rounded-t-2xl overflow-hidden">
            {store.coverImage ? (
              <img
                src={store.coverImage}
                alt={`${store.name} cover`}
                className="w-full h-full object-cover"
              />
            ) : null}
          </div>

          <div className="px-5 sm:px-7 pb-6 pt-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              {/* Left + Middle Identity Block */}
              <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-5 min-w-0 flex-1">
                <div className="-mt-14 sm:-mt-16 shrink-0 relative z-10">
                  {store.logo ? (
                    <img
                      src={store.logo}
                      alt={store.name}
                      className={`w-24 h-24 sm:w-[120px] sm:h-[120px] rounded-full object-cover border-4 border-white dark:border-[#14161D] shadow-md bg-white transition-all ${
                        store.isVerified
                          ? "ring-4 ring-[#FFC928] ring-offset-2 ring-offset-white dark:ring-offset-[#14161D]"
                          : ""
                      }`}
                    />
                  ) : (
                    <div
                      className={`w-24 h-24 sm:w-[120px] sm:h-[120px] rounded-full border-4 border-white dark:border-[#14161D] shadow-md bg-[#E8ECF2] dark:bg-white/10 flex items-center justify-center font-black text-3xl text-[#171717] dark:text-white transition-all ${
                        store.isVerified
                          ? "ring-4 ring-[#FFC928] ring-offset-2 ring-offset-white dark:ring-offset-[#14161D]"
                          : ""
                      }`}
                    >
                      {store.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <h1 className="text-[20px] sm:text-[22px] font-extrabold tracking-[-0.02em] text-[#171717] dark:text-white leading-tight">
                      {store.name}
                    </h1>
                    {store.slug && (
                      <span className="text-[13.5px] font-medium text-[#7A818C] dark:text-neutral-400">
                        @{store.slug}
                      </span>
                    )}
                    {store.category && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#F3F4F6] dark:bg-white/10 text-[#5B636E] dark:text-neutral-300">
                        {store.category}
                      </span>
                    )}
                  </div>

                  {store.description && (
                    <p className="text-[13px] text-[#3F454D] dark:text-neutral-300 leading-[1.55] max-w-[490px]">
                      {store.description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-y-1 gap-x-4 pt-0.5 text-[12.5px] font-medium text-[#68707A] dark:text-neutral-400">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#8C929C] shrink-0" />
                      <span>{store.operatingLocation || store.campus || "Campus"}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#8C929C] shrink-0" />
                      <span>Joined {joinedLabel}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Block: Stats + Action Buttons */}
              <div className="md:w-[320px] lg:w-[360px] shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-[#ECEEF2] dark:border-white/10 flex flex-col items-stretch justify-end gap-3">
                <div className="rounded-2xl border border-[#ECEEF2] dark:border-white/10 bg-[#F9FAFB] dark:bg-white/[0.03] p-3 sm:p-3.5 shadow-2xs">
                  <div className="grid grid-cols-3 divide-x divide-[#ECEEF2] dark:divide-white/10 text-center">
                    <div className="px-1 sm:px-2">
                      <div className="text-[15px] sm:text-[16.5px] font-extrabold text-[#171717] dark:text-white leading-tight">
                        {formatFollowers(followersCount)}
                      </div>
                      <div className="text-[11px] sm:text-[11.5px] font-medium text-[#7A818C] dark:text-neutral-400 mt-0.5">
                        Followers
                      </div>
                    </div>

                    <div className="px-1 sm:px-2">
                      <div className="text-[15px] sm:text-[16.5px] font-extrabold text-[#171717] dark:text-white leading-tight">
                        {reviewsCount}
                      </div>
                      <div className="text-[11px] sm:text-[11.5px] font-medium text-[#7A818C] dark:text-neutral-400 mt-0.5">
                        Reviews
                      </div>
                    </div>

                    <div className="px-1 sm:px-2">
                      <div className="inline-flex items-center justify-center gap-1 text-[15px] sm:text-[16.5px] font-extrabold text-[#171717] dark:text-white leading-tight">
                        <span>{reviewsCount > 0 ? rating : "—"}</span>
                        <Star className="w-3.5 h-3.5 fill-[#FFC928] text-[#FFC928] shrink-0 -translate-y-0.5" />
                      </div>
                      <div className="text-[11px] sm:text-[11.5px] font-medium text-[#7A818C] dark:text-neutral-400 mt-0.5">
                        Rating
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full">
                  {isOwner ? (
                    <Link
                      href="/stores?view=storefront"
                      className="radius-native flex-1 h-9 px-3 sm:px-3.5 rounded-lg bg-[#FFC928] hover:bg-[#F2BD1E] text-[#171717] text-[12.5px] font-bold inline-flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
                    >
                      <StoreIcon className="w-3.5 h-3.5 stroke-[2.2]" />
                      <span>Manage Store</span>
                    </Link>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={handleFollowToggle}
                        disabled={isFollowPending}
                        className={`radius-native flex-1 h-9 px-3 sm:px-3.5 rounded-lg text-[12.5px] font-bold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 ${
                          isFollowing
                            ? "border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-white/5 text-[#171717] dark:text-white"
                            : "bg-[#171717] dark:bg-white text-white dark:text-[#171717] hover:opacity-90"
                        }`}
                      >
                        {isFollowing ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Following</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Follow</span>
                          </>
                        )}
                      </button>

                      <Link
                        href={messageUrl}
                        className="radius-native flex-1 h-9 px-3 sm:px-3.5 rounded-lg bg-[#FFC928] hover:bg-[#F2BD1E] text-[#171717] text-[12.5px] font-bold inline-flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5 stroke-[2.2]" />
                        <span>Message</span>
                      </Link>
                    </>
                  )}

                  <button
                    type="button"
                    onClick={() => setIsShareModalOpen(true)}
                    aria-label="Share storefront"
                    title="Share storefront"
                    className="radius-native w-9 h-9 rounded-lg border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-white/5 hover:border-[#171717] dark:hover:border-white text-[#171717] dark:text-white flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                  >
                    <Share2 className="w-4 h-4 stroke-[2]" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom Listings Section (Unified Profile Design) */}
        <section className="radius-native rounded-2xl bg-white dark:bg-[#14161D] border border-[#ECEEF2] dark:border-white/10 p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-[16px] font-extrabold text-[#171717] dark:text-white tracking-[-0.01em]">
                Listings
              </h2>
              {listings.length > 0 && (
                <div className="flex items-center gap-1.5 ml-2">
                  {(["all", "products", "services"] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveTab(tab)}
                      className={`px-2.5 py-1 rounded-lg text-[11.5px] font-bold capitalize transition-colors cursor-pointer ${
                        activeTab === tab
                          ? "bg-[#171717] text-white dark:bg-white dark:text-[#171717]"
                          : "bg-[#F3F4F6] dark:bg-white/5 text-[#68707A] dark:text-neutral-400 hover:text-[#171717] dark:hover:text-white"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {listings.length > 0 && (
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-[#8C929C] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search in store..."
                  className="radius-native w-full pl-8 pr-3 py-1.5 rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-[#181B24] text-[12.5px] text-[#171717] dark:text-white placeholder-[#8C929C] focus:outline-none focus:border-[#FFC928]"
                />
              </div>
            )}
          </div>

          {filteredListings.length === 0 ? (
            <div className="py-12 text-center text-[13px] text-[#7A818C] dark:text-neutral-400">
              No active listings posted yet.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4">
              {filteredListings.map((item) => {
                const itemId = item._id || item.id;
                const thumb = item.images?.[0] || item.imageUrl;
                return (
                  <Link
                    key={itemId}
                    href={`/listings/${itemId}`}
                    className="radius-native group rounded-2xl border border-[#ECEEF2] dark:border-white/10 bg-[#FAFAFC] dark:bg-white/[0.02] overflow-hidden hover:border-[#FFC928] transition-all flex flex-col"
                  >
                    <div className="aspect-[4/3] w-full bg-[#F3F4F6] dark:bg-white/5 overflow-hidden">
                      {thumb ? (
                        <img
                          src={thumb}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#8C929C] text-[12px]">
                          No image
                        </div>
                      )}
                    </div>
                    <div className="p-3 space-y-1">
                      <h3 className="text-[13px] font-bold text-[#171717] dark:text-white truncate">
                        {item.title}
                      </h3>
                      <p className="text-[13px] font-extrabold text-[#171717] dark:text-[#FFC928]">
                        {item.priceFormatted || `₦${Number(item.price || 0).toLocaleString()}`}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <ProfileShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        profile={{
          name: store.name,
          avatar: store.logo,
          username: `@${store.slug}`,
          campus: store.operatingLocation || store.campus,
          bio: store.description,
          isVerified: store.isVerified,
          isStore: true,
          shareUrl:
            typeof window !== "undefined"
              ? `${window.location.origin}/store/${store.slug}`
              : `/store/${store.slug}`,
        }}
      />

      <RebrandFooter />
    </div>
  );
}
