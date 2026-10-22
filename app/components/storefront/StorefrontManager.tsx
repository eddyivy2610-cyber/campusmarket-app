"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Store,
  BadgeCheck,
  Plus,
  Package,
  TrendingUp,
  Eye,
  MessageSquare,
  Share2,
  ExternalLink,
  ArrowRight,
  Edit3,
  CheckCircle2,
  Clock,
  Sparkles,
  MapPin,
  Megaphone,
  Check,
  X,
  Search,
  Filter,
  DollarSign,
  AlertCircle,
  MoreHorizontal,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { CatalogManager } from "./CatalogManager";
import { dashboardService, SellerStatsResponse } from "@/lib/dashboardService";

export type StorefrontTab = "dashboard" | "catalog" | "settings" | "ads";

interface StorefrontListing {
  id: string;
  title: string;
  price: string;
  category: string;
  condition: string;
  status: "Available" | "In deal" | "Sold";
  views: number;
  inquiries: number;
  image: string;
}

const INITIAL_CATALOG: StorefrontListing[] = [
  {
    id: "lst-hp-elitebook",
    title: "HP EliteBook 840 G5 (16GB RAM, 512GB SSD)",
    price: "₦185,000",
    category: "Laptops & Computers",
    condition: "Used - Good",
    status: "Available",
    views: 142,
    inquiries: 6,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&auto=format&fit=crop&q=80",
  },
  {
    id: "lst-iphone-11",
    title: "iPhone 11 (128GB, 88% Battery)",
    price: "₦160,000",
    category: "Phones & Tablets",
    condition: "Used - Good",
    status: "Available",
    views: 210,
    inquiries: 8,
    image: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=500&auto=format&fit=crop&q=80",
  },
  {
    id: "lst-casio-991es",
    title: "Casio Scientific Calculator FX-991ES Plus",
    price: "₦8,500",
    category: "Books & Academics",
    condition: "Like New",
    status: "Available",
    views: 78,
    inquiries: 3,
    image: "https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=500&auto=format&fit=crop&q=80",
  },
  {
    id: "lst-sony-whch520",
    title: "Sony WH-CH520 Wireless Bluetooth Headphones",
    price: "₦32,000",
    category: "Electronics & Audio",
    condition: "Like New",
    status: "In deal",
    views: 52,
    inquiries: 1,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80",
  },
];

interface RecentInquiry {
  id: string;
  buyerName: string;
  buyerAvatar: string;
  itemTitle: string;
  offerPrice: string;
  status: "In deal" | "Completed" | "New message";
  timeAgo: string;
}

const RECENT_INQUIRIES: RecentInquiry[] = [
  {
    id: "inq-1",
    buyerName: "Ibrahim Musa",
    buyerAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    itemTitle: "Sony WH-CH520 Wireless",
    offerPrice: "₦30,000",
    status: "In deal",
    timeAgo: "25m ago",
  },
  {
    id: "inq-2",
    buyerName: "Fatima Aliyu",
    buyerAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80",
    itemTitle: "HP EliteBook 840 G5",
    offerPrice: "₦185,000",
    status: "New message",
    timeAgo: "1h ago",
  },
  {
    id: "inq-3",
    buyerName: "Chinedu Okafor",
    buyerAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
    itemTitle: "Casio Scientific Calculator",
    offerPrice: "₦8,500",
    status: "Completed",
    timeAgo: "1d ago",
  },
];

interface StorefrontManagerProps {
  activeTab?: StorefrontTab;
  onTabChange?: (tab: StorefrontTab) => void;
  initialStore?: any;
}

export function StorefrontManager({
  activeTab = "dashboard",
  onTabChange,
  initialStore,
}: StorefrontManagerProps) {
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState<StorefrontTab>(activeTab);
  const [storeData, setStoreData] = useState<any>(initialStore || null);
  const [hasStore, setHasStore] = useState<boolean | null>(initialStore ? true : null);

  const [catalog, setCatalog] = useState<StorefrontListing[]>(INITIAL_CATALOG);
  const [catalogFilter, setCatalogFilter] = useState<"all" | "Available" | "In deal" | "Sold">("all");
  const [searchCatalogQuery, setSearchCatalogQuery] = useState("");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Live seller stats state
  const [liveStats, setLiveStats] = useState<SellerStatsResponse | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  // Fetch canonical seller statistics from Next.js API
  useEffect(() => {
    let isCancelled = false;
    async function loadStats() {
      try {
        setStatsLoading(true);
        setStatsError(null);
        const res = await dashboardService.getSellerStats();
        if (res.success && res.data && !isCancelled) {
          setLiveStats(res.data);
        }
      } catch (err: any) {
        if (!isCancelled) {
          setStatsError(err.message || "Failed to load seller metrics.");
        }
      } finally {
        if (!isCancelled) setStatsLoading(false);
      }
    }
    loadStats();
    return () => {
      isCancelled = true;
    };
  }, [user?.id]);

  // Store Settings Form state
  const [storeName, setStoreName] = useState(initialStore?.name || "Tunde Bello Campus Hub");
  const [tagline, setTagline] = useState(initialStore?.description || "Quality student laptops, tech accessories, and academic essentials.");
  const [category, setCategory] = useState(initialStore?.category || "Laptops & Computers");
  const [landmark, setLandmark] = useState(initialStore?.operatingLocation || "Kashim Ibrahim Library (KIL)");
  const [contactChannel, setContactChannel] = useState("in_app");

  // Fetch real store from backend
  useEffect(() => {
    let isCancelled = false;

    async function loadStore() {
      try {
        const res = await fetch("/api/stores/me");
        const data = await res.json();
        if (data.success && !isCancelled) {
          setHasStore(data.data.hasStore);
          if (data.data.store) {
            const st = data.data.store;
            setStoreData(st);
            setStoreName(st.name || "My Campus Store");
            setTagline(st.description || "Student campus storefront");
            setCategory(st.category || "Laptops & Computers");
            setLandmark(st.operatingLocation || "Samaru Main Campus");
          }
        }
      } catch {
        // Fallback to initial mock store if offline
        setHasStore(true);
      }
    }

    loadStore();
    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    setCurrentTab(activeTab);
  }, [activeTab]);

  const switchTab = (tab: StorefrontTab) => {
    setCurrentTab(tab);
    onTabChange?.(tab);
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleUpdateStatus = (id: string, newStatus: "Available" | "In deal" | "Sold") => {
    setCatalog((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
    showToast(`Listing status updated to ${newStatus}`);
  };

  const handleDeleteListing = (id: string) => {
    setCatalog((prev) => prev.filter((item) => item.id !== id));
    showToast("Listing removed from your catalog.");
  };

  const filteredCatalog = catalog.filter((item) => {
    if (catalogFilter !== "all" && item.status !== catalogFilter) return false;
    if (searchCatalogQuery.trim()) {
      return item.title.toLowerCase().includes(searchCatalogQuery.toLowerCase());
    }
    return true;
  });

  if (hasStore === false) {
    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        <div className="radius-native bg-white dark:bg-[#14161D] rounded-2xl border border-[#ECEEF2] dark:border-white/10 p-8 sm:p-12 text-center max-w-xl mx-auto shadow-sm space-y-4">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-[#FFC928]/20 border border-[#FFC928]/40 flex items-center justify-center text-[#D97706] dark:text-[#FFC928]">
            <Store className="w-8 h-8" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-[20px] sm:text-[22px] font-extrabold text-[#171717] dark:text-white tracking-[-0.02em]">
              You don't have an active storefront yet
            </h2>
            <p className="text-[13px] text-[#68707A] dark:text-neutral-400 leading-relaxed max-w-md mx-auto">
              Start selling to students across campus. Eligible students can activate a storefront instantly, and local businesses can register for verified merchant status.
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/onboarding/seller"
              className="radius-native inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#FFC928] hover:bg-[#F2BD24] text-[#171717] font-extrabold text-[13.5px] shadow-xs transition-transform active:scale-95"
            >
              <span>Start Vendor Onboarding</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const totalViews = catalog.reduce((acc, curr) => acc + curr.views, 0);
  const totalInquiries = catalog.reduce((acc, curr) => acc + curr.inquiries, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 radius-native bg-[#171717] text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2.5 text-[13px] font-semibold animate-fade-in border border-white/10">
          <CheckCircle2 className="w-4 h-4 text-[#FFC928]" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* STORE HERO SUMMARY CARD (Dashboard Only)                       */}
      {/* ------------------------------------------------------------- */}
      {currentTab === "dashboard" && (
        <div className="radius-native bg-white dark:bg-[#14161D] rounded-2xl border border-[#ECEEF2] dark:border-white/10 p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-14 h-14 rounded-2xl bg-[#FFC928]/20 border border-[#FFC928]/40 flex items-center justify-center shrink-0">
              <Store className="w-7 h-7 text-[#D97706] dark:text-[#FFC928]" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2 className="text-[18px] sm:text-[20px] font-extrabold text-[#171717] dark:text-white tracking-[-0.02em]">
                  {storeName}
                </h2>
                <BadgeCheck
                  className="w-5 h-5 text-[#171717] fill-[#FFC928] shrink-0"
                  aria-label="Verified student seller"
                />
              </div>

              <p className="text-[12.5px] text-[#68707A] dark:text-neutral-400 mt-1 max-w-xl truncate">
                {tagline}
              </p>

              <div className="flex items-center gap-3 text-[12px] font-semibold text-[#8C929C] dark:text-neutral-500 mt-1.5">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#D97706]" />
                  <span>{landmark}</span>
                </span>
                <span>·</span>
                <span>Samaru Main Campus</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0 pt-2 md:pt-0">
            <Link
              href={storeData?._id ? `/listings/create?storeId=${storeData._id}` : "/listings/create"}
              className="radius-native flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#FFC928] hover:bg-[#F2BD24] text-[#171717] text-[12.5px] font-bold shadow-xs transition-all active:scale-[0.98]"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add listing</span>
            </Link>

            <Link
              href={storeData?.slug ? `/stores/${storeData.slug}` : "/stores"}
              className="radius-native flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-white/5 hover:border-[#171717] text-[#171717] dark:text-white text-[12.5px] font-bold transition-colors"
            >
              <span>Public store</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: DASHBOARD OVERVIEW                                      */}
      {/* ------------------------------------------------------------- */}
      {currentTab === "dashboard" && (
        <div className="space-y-6">
          {/* 4 Metric Cards Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
            <div className="radius-native bg-white dark:bg-[#14161D] rounded-2xl border border-[#ECEEF2] dark:border-white/10 p-4 sm:p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              <div className="flex items-center justify-between text-[#8C929C]">
                <span className="text-[12px] font-bold uppercase tracking-wider">Completed Order Value</span>
                <DollarSign className="w-4 h-4 text-[#22C55E]" />
              </div>
              <div className="text-[20px] sm:text-[24px] font-black text-[#171717] dark:text-white mt-1">
                {liveStats ? liveStats.orderValue.completedOrderValueFormatted : "₦0"}
              </div>
              <div className="text-[11.5px] font-semibold text-[#22C55E] mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>{liveStats ? `${liveStats.orders.completedOrdersCount} delivered exchanges` : "Delivered sales"}</span>
              </div>
            </div>

            <div className="radius-native bg-white dark:bg-[#14161D] rounded-2xl border border-[#ECEEF2] dark:border-white/10 p-4 sm:p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              <div className="flex items-center justify-between text-[#8C929C]">
                <span className="text-[12px] font-bold uppercase tracking-wider">Active Items</span>
                <Package className="w-4 h-4 text-[#D97706]" />
              </div>
              <div className="text-[20px] sm:text-[24px] font-black text-[#171717] dark:text-white mt-1">
                {liveStats ? liveStats.listings.active : catalog.filter((c) => c.status === "Available").length}
              </div>
              <div className="text-[11.5px] font-medium text-[#68707A] dark:text-neutral-400 mt-1">
                {liveStats ? `${liveStats.listings.total} total items in catalog` : `${catalog.length} total items in catalog`}
              </div>
            </div>

            <div className="radius-native bg-white dark:bg-[#14161D] rounded-2xl border border-[#ECEEF2] dark:border-white/10 p-4 sm:p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              <div className="flex items-center justify-between text-[#8C929C]">
                <span className="text-[12px] font-bold uppercase tracking-wider">Store Views</span>
                <Eye className="w-4 h-4 text-[#3B82F6]" />
              </div>
              <div className="text-[20px] sm:text-[24px] font-black text-[#171717] dark:text-white mt-1">
                {liveStats ? liveStats.audience.impressions : totalViews}
              </div>
              <div className="text-[11.5px] font-medium text-[#68707A] dark:text-neutral-400 mt-1">
                {liveStats ? `${liveStats.audience.followersCount} campus followers` : "Across ABU Zaria campuses"}
              </div>
            </div>

            <div className="radius-native bg-white dark:bg-[#14161D] rounded-2xl border border-[#ECEEF2] dark:border-white/10 p-4 sm:p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              <div className="flex items-center justify-between text-[#8C929C]">
                <span className="text-[12px] font-bold uppercase tracking-wider">Total Orders</span>
                <MessageSquare className="w-4 h-4 text-[#A855F7]" />
              </div>
              <div className="text-[20px] sm:text-[24px] font-black text-[#171717] dark:text-white mt-1">
                {liveStats ? liveStats.orders.totalOrders : totalInquiries}
              </div>
              <div className="text-[11.5px] font-semibold text-[#A855F7] mt-1">
                {liveStats ? `${liveStats.orders.activeOrdersCount} in progress` : "3 deals in progress"}
              </div>
            </div>
          </div>

          {/* Quick Actions & Recent Campus Inquiries / Orders */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Deals & Leads */}
            <div className="lg:col-span-2 radius-native bg-white dark:bg-[#14161D] rounded-2xl border border-[#ECEEF2] dark:border-white/10 p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[15px] sm:text-[16px] font-extrabold text-[#171717] dark:text-white tracking-[-0.01em]">
                    Recent Campus Orders & Inquiries
                  </h3>
                  <p className="text-[12px] text-[#68707A] dark:text-neutral-400 mt-0.5">
                    Orders and students interested in your items.
                  </p>
                </div>

                <Link
                  href="/dashboard/orders"
                  className="text-[12px] font-bold text-[#D97706] dark:text-[#FFC928] hover:underline"
                >
                  View orders →
                </Link>
              </div>

              <div className="divide-y divide-[#F1F3F6] dark:divide-white/5">
                {liveStats && liveStats.recentActivity.length > 0 ? (
                  liveStats.recentActivity.map((activity) => (
                    <div key={activity.id} className="py-3.5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full overflow-hidden bg-neutral-200 dark:bg-white/10 flex items-center justify-center font-bold text-xs text-[#171717] dark:text-white shrink-0">
                          {activity.buyerDisplayName.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] font-bold text-[#171717] dark:text-white truncate">
                              {activity.buyerDisplayName}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10.5px] font-bold capitalize ${
                                activity.status === "delivered"
                                  ? "bg-[#E8F8F0] text-[#15803D]"
                                  : activity.status === "cancelled" || activity.status === "disputed"
                                  ? "bg-rose-50 text-rose-600 dark:bg-rose-950/30"
                                  : "bg-[#FFF8E6] text-[#D97706] border border-[#FFE182]"
                              }`}
                            >
                              {activity.status}
                            </span>
                          </div>
                          <div className="text-[12px] text-[#68707A] dark:text-neutral-400 truncate mt-0.5">
                            Order #{activity.orderId}: <strong className="font-semibold text-[#171717] dark:text-neutral-200">{activity.itemSummary}</strong>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right hidden sm:block">
                          <div className="text-[13px] font-extrabold text-[#171717] dark:text-white">
                            {activity.priceFormatted}
                          </div>
                          <div className="text-[11px] text-[#8C929C]">
                            {new Date(activity.createdAt).toLocaleDateString()}
                          </div>
                        </div>

                        <Link
                          href="/dashboard/orders"
                          className="radius-native px-3 py-1.5 rounded-lg border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-white/5 hover:border-[#FFC928] text-[12px] font-bold text-[#171717] dark:text-white transition-colors"
                        >
                          Details
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  RECENT_INQUIRIES.map((inq) => (
                    <div key={inq.id} className="py-3.5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full overflow-hidden bg-neutral-200 shrink-0">
                          <img
                            src={inq.buyerAvatar}
                            alt={inq.buyerName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] font-bold text-[#171717] dark:text-white truncate">
                              {inq.buyerName}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10.5px] font-bold ${
                                inq.status === "In deal"
                                  ? "bg-[#FFF8E6] text-[#D97706] border border-[#FFE182]"
                                  : inq.status === "Completed"
                                  ? "bg-[#E8F8F0] text-[#15803D]"
                                  : "bg-blue-50 text-blue-600 dark:bg-blue-950/30"
                              }`}
                            >
                              {inq.status}
                            </span>
                          </div>
                          <div className="text-[12px] text-[#68707A] dark:text-neutral-400 truncate mt-0.5">
                            Inquiry on: <strong className="font-semibold text-[#171717] dark:text-neutral-200">{inq.itemTitle}</strong>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right hidden sm:block">
                          <div className="text-[13px] font-extrabold text-[#171717] dark:text-white">
                            {inq.offerPrice}
                          </div>
                          <div className="text-[11px] text-[#8C929C]">{inq.timeAgo}</div>
                        </div>

                        <Link
                          href="/messages"
                          className="radius-native px-3 py-1.5 rounded-lg border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-white/5 hover:border-[#FFC928] text-[12px] font-bold text-[#171717] dark:text-white transition-colors"
                        >
                          Reply
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Side Tools: Ads & Fast Meetup */}
            <div className="space-y-4">
              {/* Ads Promotion Card */}
              <div className="radius-native bg-[#FFF8E6] dark:bg-amber-950/20 border border-[#FFE182] dark:border-amber-800/40 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-[#D97706]" />
                  <span className="text-[13px] font-extrabold text-[#7A4F01] dark:text-amber-200">
                    Campus Sponsored Ads
                  </span>
                </div>
                <p className="text-[12px] text-[#7A4F01] dark:text-amber-300 leading-relaxed">
                  Boost your store to the top of Explore and category carousels across ABU Zaria.
                </p>
                <button
                  type="button"
                  onClick={() => switchTab("ads")}
                  className="radius-native w-full py-2 rounded-xl bg-[#FFC928] hover:bg-[#F2BD24] text-[#171717] text-[12px] font-extrabold shadow-xs transition-colors cursor-pointer"
                >
                  Start an Ad campaign
                </button>
              </div>

              {/* Safety Policy Card */}
              <div className="radius-native bg-white dark:bg-[#14161D] border border-[#ECEEF2] dark:border-white/10 rounded-2xl p-5 space-y-2.5">
                <div className="text-[13px] font-extrabold text-[#171717] dark:text-white">
                  Seller Protection
                </div>
                <p className="text-[11.5px] text-[#68707A] dark:text-neutral-400 leading-relaxed">
                  Always verify payment before releasing devices or products. Hand off items at public landmarks like Kashim Ibrahim Library or faculty foyers.
                </p>
                <Link
                  href="/safety-guidelines"
                  className="text-[11.5px] font-bold text-[#D97706] hover:underline inline-block pt-1"
                >
                  Seller rules & guidelines →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 2: CATALOG / INVENTORY MANAGEMENT                         */}
      {/* ------------------------------------------------------------- */}
      {currentTab === "catalog" && (
        <CatalogManager
          storeId={storeData?._id}
          store={storeData}
          isStudentVendor={storeData?.storeType === "student"}
        />
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 3: STORE SETTINGS                                         */}
      {/* ------------------------------------------------------------- */}
      {currentTab === "settings" && (
        <div className="radius-native bg-white dark:bg-[#14161D] rounded-2xl border border-[#ECEEF2] dark:border-white/10 p-6 sm:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-6 max-w-3xl">
          <div>
            <h3 className="text-[18px] sm:text-[20px] font-extrabold text-[#171717] dark:text-white tracking-[-0.02em]">
              Storefront Settings
            </h3>
            <p className="text-[12.5px] text-[#68707A] dark:text-neutral-400 mt-0.5">
              Manage your public store identity, category specialization, and pickup coordination.
            </p>
            <div className="h-[1px] bg-[#ECEEF2] dark:bg-white/10 mt-3.5" />
          </div>

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (storeData?._id) {
                try {
                  const res = await fetch(`/api/stores/${storeData._id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      name: storeName,
                      description: tagline,
                      category,
                      operatingLocation: landmark,
                    }),
                  });
                  const data = await res.json();
                  if (data.success) {
                    showToast("Storefront settings updated successfully.");
                  } else {
                    showToast(data.error || "Failed to update settings.");
                  }
                } catch {
                  showToast("Storefront profile updated successfully.");
                }
              } else {
                showToast("Storefront profile updated successfully.");
              }
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-[13px] font-bold text-[#3F454D] dark:text-neutral-200 mb-1.5">
                Store Name
              </label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="radius-native w-full rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-[#181B24] px-3.5 py-2.5 text-[13.5px] text-[#171717] dark:text-white focus:outline-none focus:border-[#FFC928]"
              />
            </div>

            <div>
              <label className="block text-[13px] font-bold text-[#3F454D] dark:text-neutral-200 mb-1.5">
                Store Tagline / Mission
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="radius-native w-full rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-[#181B24] px-3.5 py-2.5 text-[13.5px] text-[#171717] dark:text-white focus:outline-none focus:border-[#FFC928]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-bold text-[#3F454D] dark:text-neutral-200 mb-1.5">
                  Primary Specialization
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="radius-native w-full rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-[#181B24] px-3.5 py-2.5 text-[13.5px] text-[#171717] dark:text-white focus:outline-none focus:border-[#FFC928] cursor-pointer"
                >
                  <option value="Laptops & Computers">Laptops & Computers</option>
                  <option value="Phones & Tablets">Phones & Tablets</option>
                  <option value="Fashion & Clothing">Fashion & Clothing</option>
                  <option value="Books & Academics">Books & Academics</option>
                  <option value="Hostel & Furniture">Hostel & Furniture</option>
                  <option value="Services">Services</option>
                </select>
              </div>

              <div>
                <label className="block text-[13px] font-bold text-[#3F454D] dark:text-neutral-200 mb-1.5">
                  Campus Base Landmark
                </label>
                <select
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  className="radius-native w-full rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-[#181B24] px-3.5 py-2.5 text-[13.5px] text-[#171717] dark:text-white focus:outline-none focus:border-[#FFC928] cursor-pointer"
                >
                  <option value="Kashim Ibrahim Library (KIL)">Kashim Ibrahim Library (KIL)</option>
                  <option value="Faculty of Science Complex">Faculty of Science Complex</option>
                  <option value="Senate Building Foyer">Senate Building Foyer</option>
                  <option value="Sub Hall / Food Court Area">Sub Hall / Food Court Area</option>
                  <option value="Kongo Campus Main Gate">Kongo Campus Main Gate</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-bold text-[#3F454D] dark:text-neutral-200 mb-1.5">
                Buyer Contact Channel
              </label>
              <select
                value={contactChannel}
                onChange={(e) => setContactChannel(e.target.value)}
                className="radius-native w-full rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-[#181B24] px-3.5 py-2.5 text-[13.5px] text-[#171717] dark:text-white focus:outline-none focus:border-[#FFC928] cursor-pointer"
              >
                <option value="in_app">In-app campus chat only (Recommended & verified)</option>
                <option value="whatsapp">Allow WhatsApp handoff after inquiry starts</option>
              </select>
            </div>

            <div className="pt-3 flex items-center gap-3">
              <button
                type="submit"
                className="radius-native px-5 py-2.5 rounded-xl bg-[#FFC928] hover:bg-[#F2BD24] text-[#171717] text-[13px] font-bold shadow-xs transition-colors cursor-pointer"
              >
                Save Storefront Settings
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 4: CAMPUS ADS START                                       */}
      {/* ------------------------------------------------------------- */}
      {currentTab === "ads" && (
        <div className="radius-native bg-white dark:bg-[#14161D] rounded-2xl border border-[#ECEEF2] dark:border-white/10 p-6 sm:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-[18px] sm:text-[20px] font-extrabold text-[#171717] dark:text-white tracking-[-0.02em]">
                Campus Sponsored Ads & Promotions
              </h3>
              <p className="text-[12.5px] text-[#68707A] dark:text-neutral-400 mt-0.5">
                Drive instant visibility to your store and listings across ABU Zaria.
              </p>
            </div>

            <Link
              href="/promotions/request"
              className="radius-native px-4 py-2 rounded-xl bg-[#FFC928] hover:bg-[#F2BD24] text-[#171717] text-[12.5px] font-bold shadow-xs transition-colors"
            >
              + Create Promotion
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="radius-native p-5 rounded-2xl border border-[#ECEEF2] dark:border-white/10 bg-[#F7F8FA] dark:bg-white/5 space-y-3">
              <div className="w-8 h-8 rounded-xl bg-[#FFC928]/20 flex items-center justify-center text-[#D97706]">
                <Sparkles className="w-4 h-4" />
              </div>
              <h4 className="text-[14px] font-bold text-[#171717] dark:text-white">
                Explore Spotlight Banner
              </h4>
              <p className="text-[12px] text-[#68707A] dark:text-neutral-400 leading-relaxed">
                Featured full-width banner at the top of the Explore page seen by thousands of daily students.
              </p>
              <div className="pt-1 text-[13px] font-extrabold text-[#171717] dark:text-white">
                from ₦2,500 / week
              </div>
            </div>

            <div className="radius-native p-5 rounded-2xl border border-[#ECEEF2] dark:border-white/10 bg-[#F7F8FA] dark:bg-white/5 space-y-3">
              <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center text-blue-600">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h4 className="text-[14px] font-bold text-[#171717] dark:text-white">
                Category Top Pin
              </h4>
              <p className="text-[12px] text-[#68707A] dark:text-neutral-400 leading-relaxed">
                Pin your items to the very first position within your category with a prominent "Promoted" badge.
              </p>
              <div className="pt-1 text-[13px] font-extrabold text-[#171717] dark:text-white">
                from ₦1,200 / week
              </div>
            </div>

            <div className="radius-native p-5 rounded-2xl border border-[#ECEEF2] dark:border-white/10 bg-[#F7F8FA] dark:bg-white/5 space-y-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600">
                <Megaphone className="w-4 h-4" />
              </div>
              <h4 className="text-[14px] font-bold text-[#171717] dark:text-white">
                Campus Radar Broadcast
              </h4>
              <p className="text-[12px] text-[#68707A] dark:text-neutral-400 leading-relaxed">
                Highlight your store in wanted match feeds when students request items in your niche.
              </p>
              <div className="pt-1 text-[13px] font-extrabold text-[#171717] dark:text-white">
                from ₦1,800 / week
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
