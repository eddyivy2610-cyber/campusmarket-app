"use client";

import React, { Suspense, useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Store,
  BadgeCheck,
  CheckCircle2,
  MapPin,
  Heart,
  ArrowRight,
  ArrowLeft,
  Plus,
  X,
  Shirt,
  Headphones,
  Printer,
  Scissors,
  BookOpen,
  Camera,
  LayoutDashboard,
  Layers,
  Settings as SettingsIcon,
  Megaphone,
  Search,
} from "lucide-react";

import { RebrandHeader } from "../components/header/RebrandHeader";
import { RebrandFooter } from "../components/sections/RebrandFooter";
import { PageSkeleton } from "../components/common/LoadingSystem";
import { StorefrontManager, StorefrontTab } from "../components/storefront/StorefrontManager";
import {
  StoreBusinessType,
  StoreCategory,
  StoreProfile,
} from "../data/storesData";

export default function StoresPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F7F8FA] dark:bg-[#0E1015] transition-colors">
          <RebrandHeader />
          <PageSkeleton title={true} cards={8} />
        </div>
      }
    >
      <StoresContent />
    </Suspense>
  );
}

function StoresContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const viewParam = searchParams.get("view");

  const [isStorefrontView, setIsStorefrontView] = useState(viewParam === "storefront");
  const [storefrontTab, setStorefrontTab] = useState<StorefrontTab>("dashboard");
  const [hasOpenedStore, setHasOpenedStore] = useState(true);

  const [activeFilterTab, setActiveFilterTab] = useState<
    "all" | "student_owned" | "approved_business" | "services"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCampus, setSelectedCampus] = useState("all");
  const [savedStoreIds, setSavedStoreIds] = useState<Record<string, boolean>>({});
  const [dbStores, setDbStores] = useState<StoreProfile[]>([]);

  // Modals
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // Fetch live active stores from /api/stores
  useEffect(() => {
    let isCancelled = false;
    async function fetchLiveStores() {
      try {
        const res = await fetch("/api/stores?status=active&limit=50");
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && !isCancelled) {
          const mapped: StoreProfile[] = json.data.map((item: any) => {
            const isStudent =
              item.storeType === "student_store" || item.storeType === "student_owned";
            return {
              id: item._id || item.id,
              slug: item.slug || item._id,
              name: item.name,
              businessType: isStudent ? "student_owned" : "approved_business",
              verificationBadgeText: isStudent
                ? "Verified student seller"
                : "Approved business",
              categoryTags: item.categoryTags || [item.category || "General"],
              primaryCategory: (item.category || "General") as StoreCategory,
              tagline: item.description?.slice(0, 100) || "Campus seller storefront.",
              description: item.description || "",
              campusName: item.campus || "ABU Samaru Main Campus",
              landmark: item.operatingLocation || item.campus || "Samaru Campus",
              openingHours: "Mon – Sat: 9:00 AM – 7:00 PM",
              responseTime: "Replies in ~15 mins",
              ratingScore: item.metrics?.rating ?? 4.8,
              reviewsCount: item.metrics?.reviewsCount ?? 12,
              avatarBg: "bg-[#FFC928]/10 text-[#855B00] dark:bg-[#FFC928]/20 dark:text-[#FFC928]",
              avatarIcon: "store",
              coverGradient: "from-amber-400 to-yellow-500",
              contactHandle: item.slug || item._id,
              products: Array(item.metrics?.listingsCount || 0).fill(null),
              services: [],
            };
          });
          setDbStores(mapped);
        }
      } catch (err) {
        console.warn("Could not load live stores:", err);
      }
    }
    fetchLiveStores();
    return () => {
      isCancelled = true;
    };
  }, []);

  // Check store existence with /api/stores/me
  useEffect(() => {
    let isCancelled = false;
    async function checkMyStore() {
      try {
        const res = await fetch("/api/stores/me");
        const data = await res.json();
        if (data.success && !isCancelled) {
          setHasOpenedStore(Boolean(data.data.hasStore));
        }
      } catch {
        // Fallback to localStorage
        try {
          const stored = localStorage.getItem("ch_has_opened_store_v1");
          if (stored !== null) setHasOpenedStore(stored === "true");
        } catch {}
      }
    }
    checkMyStore();
    return () => {
      isCancelled = true;
    };
  }, []);

  // Sync if URL query param changes
  useEffect(() => {
    if (viewParam === "storefront") {
      setIsStorefrontView(true);
    }
  }, [viewParam]);

  // Registration Form
  const [regStoreName, setRegStoreName] = useState("");
  const [regBusinessType, setRegBusinessType] = useState<StoreBusinessType>("student_owned");
  const [regCategory, setRegCategory] = useState<StoreCategory>("Fashion");
  const [regTagline, setRegTagline] = useState("");
  const [regLandmark, setRegLandmark] = useState("ABU Samaru Main Campus");

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 3000);
  };

  const toggleSaveStore = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const isNowSaved = !savedStoreIds[id];
    setSavedStoreIds((prev) => ({ ...prev, [id]: isNowSaved }));
    showToast(isNowSaved ? "Store saved to your favorites" : "Store removed from favorites");
  };

  // Canonical live stores from database
  const allStores = useMemo(() => {
    return dbStores;
  }, [dbStores]);

  const filteredStores = useMemo(() => {
    return allStores.filter((store) => {
      if (activeFilterTab === "student_owned" && store.businessType !== "student_owned") {
        return false;
      }
      if (activeFilterTab === "approved_business" && store.businessType !== "approved_business") {
        return false;
      }
      if (activeFilterTab === "services" && store.services.length === 0) {
        return false;
      }

      if (selectedCampus !== "all") {
        const campusMatch =
          store.campusName.toLowerCase().includes(selectedCampus.toLowerCase()) ||
          store.landmark.toLowerCase().includes(selectedCampus.toLowerCase());
        if (!campusMatch) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = store.name.toLowerCase().includes(q);
        const matchesDesc = (store.description || "").toLowerCase().includes(q);
        const matchesTag = (store.tagline || "").toLowerCase().includes(q);
        const matchesCat = (store.primaryCategory || "").toLowerCase().includes(q);
        const matchesLoc = (store.landmark || "").toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesTag && !matchesCat && !matchesLoc) {
          return false;
        }
      }

      return true;
    });
  }, [allStores, activeFilterTab, selectedCampus, searchQuery]);

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regStoreName.trim()) return;
    setIsRegisterModalOpen(false);
    setHasOpenedStore(true);
    try {
      localStorage.setItem("ch_has_opened_store_v1", "true");
    } catch {}
    setIsStorefrontView(true);
    showToast("Store created successfully! Welcome to your storefront.");
  };

  const handleOpenStoreClick = () => {
    if (hasOpenedStore) {
      setIsStorefrontView(true);
    } else {
      router.push("/onboarding/seller");
    }
  };

  const renderStoreIcon = (iconName: string, className = "w-7 h-7") => {
    switch (iconName) {
      case "shirt":
        return <Shirt className={className} />;
      case "headphones":
        return <Headphones className={className} />;
      case "printer":
        return <Printer className={className} />;
      case "scissors":
        return <Scissors className={className} />;
      case "book":
        return <BookOpen className={className} />;
      case "camera":
        return <Camera className={className} />;
      default:
        return <Store className={className} />;
    }
  };

  return (
    <div
      style={{ fontFamily: "var(--font-plus-jakarta), sans-serif" }}
      className="min-h-screen flex flex-col bg-[#F7F8FA] dark:bg-[#0E1015] text-[#171717] dark:text-white antialiased"
    >
      <RebrandHeader />

      {/* Floating feedback toast */}
      {feedbackToast && (
        <div className="fixed bottom-6 right-6 z-50 radius-native bg-[#171717] text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2.5 text-[13px] font-semibold animate-fade-in border border-white/10">
          <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
          <span>{feedbackToast}</span>
        </div>
      )}

      <main className="flex-1 w-full py-6 sm:py-8">
        <div className="max-w-[1380px] mx-auto px-5 sm:px-8 lg:px-12 space-y-6">
          {/* =============================================================== */}
          {/* DYNAMIC HEADER WITH DESKTOP POSITION EXCHANGE                   */}
          {/* =============================================================== */}
          {!isStorefrontView ? (
            /* NORMAL DIRECTORY STATE: Heading Left, Button Right */
            <div className="flex items-center justify-between gap-4 mb-2">
              <div>
                <h1 className="text-[18px] sm:text-[20px] font-extrabold tracking-[-0.02em] text-[#14171A] dark:text-white shrink-0">
                  Stores
                </h1>
                <p className="text-[12.5px] text-[#8C929C] dark:text-neutral-400 mt-0.5 font-normal">
                  Explore student entrepreneurs and campus sellers.
                </p>
              </div>

              <div
                className="hidden sm:block flex-1 h-[1px] bg-[#E8EAEE] dark:bg-white/10"
                aria-hidden="true"
              />

              <button
                type="button"
                onClick={handleOpenStoreClick}
                className="radius-native inline-flex items-center gap-1.5 rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-white/5 hover:border-[#FFC928] hover:bg-[#FFC928]/10 px-3.5 py-1.5 text-[12.5px] font-bold text-[#171717] dark:text-white shrink-0 transition-all cursor-pointer shadow-2xs"
              >
                {hasOpenedStore ? (
                  <>
                    <Store className="w-3.5 h-3.5 text-[#D97706] dark:text-[#FFC928]" />
                    <span>Manage store</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    <span>Open a store</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            /* STOREFRONT MODE: BUTTON/NAV MOVES TO LEFT, HEADING EXCHANGES TO RIGHT */
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-2 animate-in fade-in duration-200">
              {/* LEFT SIDE ON DESKTOP: Storefront Nav Tabs + Back to Directory */}
              <div className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
                <button
                  type="button"
                  onClick={() => setIsStorefrontView(false)}
                  className="radius-native inline-flex items-center gap-1.5 rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-white/5 hover:border-[#171717] px-3 py-1.5 text-[12px] font-bold text-[#5B636E] dark:text-neutral-300 transition-colors shrink-0 cursor-pointer"
                  title="Return to campus stores directory"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>All stores</span>
                </button>

                <div className="w-px h-5 bg-[#E8EAEE] dark:bg-white/10 hidden sm:block mx-1" />

                {(
                  [
                    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
                    { id: "catalog", label: "Catalog", icon: Layers },
                    { id: "settings", label: "Settings", icon: SettingsIcon },
                    { id: "ads", label: "Ads", icon: Megaphone },
                  ] as const
                ).map((tab) => {
                  const Icon = tab.icon;
                  const isActive = storefrontTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setStorefrontTab(tab.id)}
                      className={`radius-native inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-bold transition-all cursor-pointer shrink-0 ${
                        isActive
                          ? "bg-[#FFC928]/20 border border-[#FFC928]/50 text-[#171717] dark:text-white shadow-xs"
                          : "bg-white dark:bg-white/5 border border-[#ECEEF2] dark:border-white/10 text-[#68707A] dark:text-neutral-400 hover:text-[#171717] dark:hover:text-white"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* CENTER DIVIDER LINE */}
              <div
                className="hidden sm:block flex-1 h-[1px] bg-[#E8EAEE] dark:bg-white/10 mx-2"
                aria-hidden="true"
              />

              {/* RIGHT SIDE ON DESKTOP: Exchanged Heading "Storefront" */}
              <div className="text-left sm:text-right shrink-0">
                <h1 className="text-[18px] sm:text-[20px] font-extrabold tracking-[-0.02em] text-[#14171A] dark:text-white">
                  Storefront
                </h1>
                <p className="text-[12px] text-[#8C929C] dark:text-neutral-400 mt-0.5 font-normal">
                  Campus store manager & commerce insights.
                </p>
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* MAIN VIEW: STOREFRONT WORKSPACE OR STORES DIRECTORY             */}
          {/* =============================================================== */}
          {isStorefrontView ? (
            /* STOREFRONT WORKSPACE COMPONENT */
            <StorefrontManager
              activeTab={storefrontTab}
              onTabChange={setStorefrontTab}
            />
          ) : (
            /* STORES DIRECTORY VIEW */
            <>
              {/* Search and Filters Bar */}
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                {/* Filter Chips Bar */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {[
                    { id: "all", label: "All stores" },
                    { id: "student_owned", label: "Verified students" },
                    { id: "approved_business", label: "Non-student sellers" },
                    { id: "services", label: "Services" },
                  ].map((tab) => {
                    const isSelected = activeFilterTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveFilterTab(tab.id as any)}
                        className={`radius-native px-3 py-1.5 rounded-xl text-[12px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                          isSelected
                            ? "bg-[#171717] text-white dark:bg-white dark:text-[#171717] shadow-xs"
                            : "bg-white dark:bg-[#14161D] border border-[#ECEEF2] dark:border-white/10 text-[#5B636E] dark:text-neutral-300 hover:border-[#171717] dark:hover:border-white"
                        }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                {/* In-Directory Search & Campus Filter */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1 sm:w-60">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C929C]" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search stores or landmarks..."
                      className="radius-native w-full pl-9 pr-3 py-1.5 text-[12px] rounded-xl bg-white dark:bg-white/5 border border-[#ECEEF2] dark:border-white/10 focus:outline-none focus:border-[#FFC928] text-[#171717] dark:text-white"
                    />
                  </div>

                  <select
                    value={selectedCampus}
                    onChange={(e) => setSelectedCampus(e.target.value)}
                    className="radius-native px-3 py-1.5 text-[12px] rounded-xl bg-white dark:bg-white/5 border border-[#ECEEF2] dark:border-white/10 text-[#5B636E] dark:text-neutral-300 focus:outline-none focus:border-[#FFC928] cursor-pointer"
                  >
                    <option value="all">All Campuses</option>
                    <option value="Samaru">Samaru Main Campus</option>
                    <option value="Kongo">Kongo Campus</option>
                  </select>
                </div>
              </div>

              {/* Empty state if no stores found */}
              {filteredStores.length === 0 ? (
                <div className="radius-native py-16 px-4 text-center rounded-2xl bg-white dark:bg-[#14161D] border border-[#ECEEF2] dark:border-white/10">
                  <Store className="w-12 h-12 text-[#8C929C] mx-auto mb-3 opacity-40" />
                  <h3 className="text-[16px] font-bold text-[#171717] dark:text-white">
                    No stores found
                  </h3>
                  <p className="mt-1 text-[13px] text-[#7A818C] max-w-sm mx-auto">
                    {searchQuery
                      ? `No campus stores matching "${searchQuery}".`
                      : "No stores match the selected filter criteria."}
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
                /* 4-Column Uniform Storefront Card Grid */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                  {filteredStores.map((store) => {
                    const isSaved = Boolean(savedStoreIds[store.id]);
                    const isStudent = store.businessType === "student_owned";
                    const storeHref = `/stores/${store.slug || store.id}`;

                    return (
                      <div
                        key={store.id}
                        className="radius-native group rounded-2xl bg-white dark:bg-[#14161D] border border-[#ECEEF2] dark:border-white/10 p-3 shadow-[0_4px_20px_rgba(15,23,42,0.025)] hover:shadow-[0_8px_28px_rgba(15,23,42,0.06)] transition-all duration-200 flex flex-col justify-between"
                      >
                        <div>
                          {/* Visual Container */}
                          <Link
                            href={storeHref}
                            className={`radius-native relative h-[150px] sm:h-[160px] w-full rounded-xl ${store.avatarBg} overflow-hidden flex items-center justify-center cursor-pointer group-hover:scale-[1.01] transition-transform duration-200`}
                          >
                            {renderStoreIcon(store.avatarIcon, "w-10 h-10 opacity-75")}

                            {/* Top-Right Badge Stack: Category Pill + Save Button */}
                            <div className="absolute top-2.5 right-2.5 flex flex-col items-end gap-1.5 z-10">
                              <span className="radius-native inline-flex items-center px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold leading-tight bg-white/90 dark:bg-black/60 text-[#4A5058] dark:text-neutral-300 backdrop-blur-xs shadow-xs">
                                {store.primaryCategory}
                              </span>

                              <button
                                type="button"
                                onClick={(e) => toggleSaveStore(store.id, e)}
                                aria-label={isSaved ? "Remove store from saved" : "Save store"}
                                className="radius-native w-7 h-7 rounded-full bg-white/85 dark:bg-black/40 backdrop-blur-xs flex items-center justify-center text-[#5B636E] hover:text-[#171717] dark:text-neutral-300 transition-colors cursor-pointer"
                              >
                                <Heart
                                  className={`w-3.5 h-3.5 transition-colors ${
                                    isSaved ? "fill-rose-500 text-rose-500" : ""
                                  }`}
                                  strokeWidth={1.8}
                                />
                              </button>
                            </div>
                          </Link>

                          {/* Store Title & Location */}
                          <div className="pt-3 px-0.5">
                            <Link
                              href={storeHref}
                              className="flex items-center gap-1.5"
                            >
                              <h3 className="text-[13.5px] font-bold text-[#171717] dark:text-white leading-snug truncate group-hover:underline">
                                {store.name}
                              </h3>
                              {isStudent && (
                                <BadgeCheck
                                  className="w-4 h-4 text-[#171717] fill-[#FFC928] shrink-0"
                                  aria-label="Verified student seller"
                                />
                              )}
                            </Link>

                            <div className="mt-1 flex items-center gap-1 text-[11.5px] font-medium text-[#68707A] dark:text-neutral-400">
                              <MapPin className="w-3 h-3 shrink-0" strokeWidth={2} />
                              <span className="truncate">{store.landmark}</span>
                            </div>

                            <p className="mt-1.5 text-[12px] text-[#5B636E] dark:text-neutral-400 line-clamp-2 leading-relaxed">
                              {store.tagline}
                            </p>
                          </div>
                        </div>

                        {/* Bottom Row */}
                        <div className="mt-3 pt-2.5 px-0.5 border-t border-[#F2F4F7] dark:border-white/5 flex items-center justify-between gap-2">
                          <span className="text-[12px] font-bold text-[#14171A] dark:text-white tracking-tight">
                            {store.products.length + store.services.length} listings
                          </span>

                          <div className="flex items-center gap-2">
                            <Link
                              href={storeHref}
                              className="radius-native inline-flex items-center gap-1 rounded-lg border border-[#E4E7EC] dark:border-white/15 bg-white dark:bg-white/5 hover:bg-[#F7F8FA] dark:hover:bg-white/10 px-2.5 py-1 text-[11.5px] font-semibold text-[#171717] dark:text-white transition-colors"
                            >
                              <span>Visit store</span>
                              <ArrowRight className="w-3 h-3" strokeWidth={2} />
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal: Open a Store */}
        {isRegisterModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <div className="radius-native w-full max-w-md rounded-2xl bg-white dark:bg-[#14161D] border border-[#ECEEF2] dark:border-white/10 shadow-2xl p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#ECEEF2] dark:border-white/10">
                <div>
                  <h3 className="text-[16px] font-extrabold text-[#171717] dark:text-white">
                    Open a Campus Store
                  </h3>
                  <p className="text-[12px] text-[#8C929C]">
                    Create your storefront profile for campus discovery.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(false)}
                  className="p-1 rounded-full text-[#8C929C] hover:text-[#171717]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-4 text-[13px]">
                <div>
                  <label className="block font-bold text-[#171717] dark:text-white mb-1">
                    Store Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={regStoreName}
                    onChange={(e) => setRegStoreName(e.target.value)}
                    placeholder="e.g. Campus Closet or Zaria Tech"
                    className="radius-native w-full bg-[#F7F8FA] dark:bg-white/5 border border-[#ECEEF2] dark:border-white/10 rounded-xl px-3.5 py-2.5 text-[#171717] dark:text-white focus:outline-none focus:border-[#FFE182]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#171717] dark:text-white mb-1">
                    Store Tagline *
                  </label>
                  <input
                    type="text"
                    required
                    value={regTagline}
                    onChange={(e) => setRegTagline(e.target.value)}
                    placeholder="e.g. Affordable student thrift and accessories"
                    className="radius-native w-full bg-[#F7F8FA] dark:bg-white/5 border border-[#ECEEF2] dark:border-white/10 rounded-xl px-3.5 py-2.5 text-[#171717] dark:text-white focus:outline-none focus:border-[#FFE182]"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsRegisterModalOpen(false)}
                    className="px-4 py-2 text-[13px] font-medium text-[#68707A]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="radius-native px-5 py-2 rounded-xl bg-[#FFE182] hover:bg-[#FCD860] text-[#171717] font-extrabold text-[13px] shadow-xs"
                  >
                    Submit Store
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      {!isStorefrontView && <RebrandFooter />}
    </div>
  );
}
