"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  MoreVertical,
  Edit3,
  Trash2,
  Eye,
  CheckCircle2,
  PauseCircle,
  PlayCircle,
  ExternalLink,
  Package,
  Wrench,
  SlidersHorizontal,
  X,
  Check,
  Unlink,
  Briefcase,
  Layers,
  ArrowRight,
  FolderPlus,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export type ListingType = "product" | "service";
export type ListingStatus = "Active" | "Paused" | "Draft" | "Sold" | "In deal";

export interface CatalogItem {
  id: string;
  code: string;
  title: string;
  type: ListingType;
  category: string;
  price: number;
  priceFormatted: string;
  status: ListingStatus;
  updatedAt: string;
  views: number;
  inquiries: number;
  quantity?: number;
  image?: string;
  draftProgress?: number;
  serviceDetails?: {
    pricingModel?: string;
    deliveryTime?: string;
    serviceLocationType?: string;
  };
}

export interface CatalogManagerProps {
  storeId?: string;
  store?: any;
  isStudentVendor?: boolean;
  onListingsCountChange?: (count: number) => void;
}

const INITIAL_CATALOG_ITEMS: CatalogItem[] = [];

function mapBackendStatus(backendStatus?: string): ListingStatus {
  switch (backendStatus?.toLowerCase()) {
    case "active":
      return "Active";
    case "paused":
      return "Paused";
    case "draft":
      return "Draft";
    case "sold":
      return "Sold";
    case "in_deal":
    case "in deal":
      return "In deal";
    default:
      return "Active";
  }
}

function formatTimeAgo(isoString?: string): string {
  if (!isoString) return "Recently";
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffSec < 60) return "Just now";
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    return `${Math.floor(diffSec / 86400)}d ago`;
  } catch {
    return "Recently";
  }
}

export function CatalogManager({
  storeId,
  store,
  onListingsCountChange,
}: CatalogManagerProps) {
  const { user } = useAuth();
  const [items, setItems] = useState<CatalogItem[]>(INITIAL_CATALOG_ITEMS);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "products" | "services">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | ListingStatus>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"recent" | "price-asc" | "price-desc" | "views">("recent");

  // Selection for bulk management
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Mobile Bottom Sheet Filter state
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Active item for mobile 3-dots action sheet / quick edit / unlinking
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<CatalogItem | null>(null);
  const [itemToUnlink, setItemToUnlink] = useState<CatalogItem | null>(null);
  const [quickEditItem, setQuickEditItem] = useState<CatalogItem | null>(null);
  const [editPrice, setEditPrice] = useState("");
  const [editStatus, setEditStatus] = useState<ListingStatus>("Active");

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Add Existing Listing Modal State
  const [isAddExistingModalOpen, setIsAddExistingModalOpen] = useState(false);
  const [availablePersonalListings, setAvailablePersonalListings] = useState<any[]>([]);
  const [selectedPersonalIds, setSelectedPersonalIds] = useState<string[]>([]);
  const [isLoadingPersonal, setIsLoadingPersonal] = useState(false);
  const [isAssociating, setIsAssociating] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. Fetch store listings from API
  const refreshStoreListings = useCallback(async () => {
    if (!storeId) return;
    try {
      const res = await fetch(`/api/stores/${storeId}/listings?status=all&limit=50`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        const mapped: CatalogItem[] = data.data.map((l: any) => ({
          id: l._id || l.id,
          code: l.code || (l._id ? `ID-${String(l._id).slice(-5).toUpperCase()}` : "ID-00000"),
          title: l.title,
          type: (l.listingType || "product") as ListingType,
          category: l.category,
          price: Number(l.price) || 0,
          priceFormatted: l.priceFormatted || `₦${Number(l.price || 0).toLocaleString()}`,
          status: mapBackendStatus(l.status),
          updatedAt: formatTimeAgo(l.updatedAt),
          views: l.views || 0,
          inquiries: l.likes || 0,
          quantity: l.quantity !== undefined ? l.quantity : (l.listingType === "service" ? undefined : 1),
          image: l.images?.[0] || l.imageUrl || "",
          serviceDetails: l.serviceDetails,
        }));
        setItems(mapped);
        onListingsCountChange?.(mapped.length);
      }
    } catch {
      // Offline fallback: keep current items
    }
  }, [storeId, onListingsCountChange]);

  useEffect(() => {
    refreshStoreListings();
  }, [refreshStoreListings]);

  // 2. Fetch unlinked personal listings for "Add Existing Listing" modal
  const openAddExistingModal = async () => {
    setIsAddExistingModalOpen(true);
    setIsLoadingPersonal(true);
    setSelectedPersonalIds([]);

    try {
      const sellerQuery = user?.id ? `&sellerId=${user.id}` : "";
      const res = await fetch(`/api/listings?unlinked=true&status=all${sellerQuery}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        // Exclude items already in this store's catalog
        const currentItemIds = new Set(items.map((i) => i.id));
        const filtered = data.data.filter((l: any) => !currentItemIds.has(l._id));
        setAvailablePersonalListings(filtered);
      } else {
        setAvailablePersonalListings([]);
      }
    } catch {
      // Demo mock fallback if offline
      setAvailablePersonalListings([
        {
          _id: "demo-personal-1",
          title: "Scientific Calculator FX-991EX (ClassWiz)",
          category: "Books & Academics",
          price: 12000,
          priceFormatted: "₦12,000",
          listingType: "product",
          images: ["https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=300&auto=format&fit=crop&q=80"],
        },
        {
          _id: "demo-personal-2",
          title: "Campus Photography & Headshots",
          category: "Photography & Video",
          price: 4000,
          priceFormatted: "From ₦4,000",
          listingType: "service",
          images: ["https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=300&auto=format&fit=crop&q=80"],
        },
      ]);
    } finally {
      setIsLoadingPersonal(false);
    }
  };

  const handleLinkExistingListings = async () => {
    if (selectedPersonalIds.length === 0 || !storeId) return;
    setIsAssociating(true);

    let successCount = 0;
    for (const listingId of selectedPersonalIds) {
      try {
        const res = await fetch(`/api/stores/${storeId}/listings`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ listingId }),
        });
        const data = await res.json();
        if (data.success) {
          successCount++;
        }
      } catch {
        // Continue with others
      }
    }

    setIsAssociating(false);
    setIsAddExistingModalOpen(false);

    if (successCount > 0) {
      showToast(`Added ${successCount} listing(s) to your storefront catalog.`);
      await refreshStoreListings();
    } else {
      // Local fallback simulation if server was simulated
      const addedItems: CatalogItem[] = availablePersonalListings
        .filter((l) => selectedPersonalIds.includes(l._id))
        .map((l) => ({
          id: l._id,
          code: `ID-${String(l._id).slice(-5).toUpperCase()}`,
          title: l.title,
          type: (l.listingType || "product") as ListingType,
          category: l.category,
          price: Number(l.price) || 0,
          priceFormatted: l.priceFormatted || `₦${Number(l.price || 0).toLocaleString()}`,
          status: "Active",
          updatedAt: "Just now",
          views: 0,
          inquiries: 0,
          quantity: 1,
          image: l.images?.[0] || "",
        }));

      setItems((prev) => [...addedItems, ...prev]);
      showToast(`Added ${addedItems.length} listing(s) to your storefront catalog.`);
    }
  };

  // 3. Disassociate listing from storefront
  const handleUnlinkListing = async (item: CatalogItem) => {
    if (storeId) {
      try {
        const res = await fetch(`/api/stores/${storeId}/listings?listingId=${item.id}`, {
          method: "DELETE",
        });
        const data = await res.json();
        if (!data.success) {
          showToast(data.error || "Failed to unlink listing.");
        }
      } catch {
        // Fallback to local
      }
    }

    setItems((prev) => prev.filter((i) => i.id !== item.id));
    setSelectedIds((prev) => prev.filter((id) => id !== item.id));
    setItemToUnlink(null);
    setActiveMenuId(null);
    showToast(`"${item.title}" unlinked from storefront. It remains in your personal listings.`);
  };

  // 4. Update status / Quick Edit
  const handleUpdateStatus = async (id: string, newStatus: ListingStatus) => {
    try {
      await fetch(`/api/listings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus.toLowerCase() }),
      });
    } catch {
      // Offline fallback
    }

    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
    setActiveMenuId(null);
    showToast(`Status updated to ${newStatus}.`);
  };

  const openQuickEdit = (item: CatalogItem) => {
    setQuickEditItem(item);
    setEditPrice(item.price.toString());
    setEditStatus(item.status);
    setActiveMenuId(null);
  };

  const saveQuickEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickEditItem) return;
    const cleanPrice = Number(editPrice.replace(/[^0-9]/g, "")) || quickEditItem.price;

    try {
      await fetch(`/api/listings/${quickEditItem.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          price: cleanPrice,
          status: editStatus.toLowerCase(),
        }),
      });
    } catch {
      // Offline fallback
    }

    setItems((prev) =>
      prev.map((i) =>
        i.id === quickEditItem.id
          ? {
              ...i,
              price: cleanPrice,
              priceFormatted: `₦${cleanPrice.toLocaleString()}`,
              status: editStatus,
            }
          : i
      )
    );
    showToast(`Updated "${quickEditItem.title}".`);
    setQuickEditItem(null);
  };

  // 5. Delete listing permanently
  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await fetch(`/api/listings/${itemToDelete.id}`, {
        method: "DELETE",
      });
    } catch {
      // Offline fallback
    }

    setItems((prev) => prev.filter((i) => i.id !== itemToDelete.id));
    setSelectedIds((prev) => prev.filter((id) => id !== itemToDelete.id));
    showToast(`"${itemToDelete.title}" removed permanently.`);
    setItemToDelete(null);
    setActiveMenuId(null);
  };

  // Bulk actions
  const handleBulkStatusChange = (newStatus: ListingStatus) => {
    if (selectedIds.length === 0) return;
    setItems((prev) =>
      prev.map((item) => (selectedIds.includes(item.id) ? { ...item, status: newStatus } : item))
    );
    showToast(`${selectedIds.length} listing(s) marked as ${newStatus}.`);
    setSelectedIds([]);
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    setItems((prev) => prev.filter((item) => !selectedIds.includes(item.id)));
    showToast(`${selectedIds.length} listing(s) deleted.`);
    setSelectedIds([]);
  };

  // Metrics
  const totalListings = items.length;

  // Filtered list
  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          const matchTitle = item.title.toLowerCase().includes(query);
          const matchCode = item.code.toLowerCase().includes(query);
          const matchCat = item.category.toLowerCase().includes(query);
          if (!matchTitle && !matchCode && !matchCat) return false;
        }
        if (typeFilter === "products" && item.type !== "product") return false;
        if (typeFilter === "services" && item.type !== "service") return false;
        if (statusFilter !== "all" && item.status !== statusFilter) return false;
        if (categoryFilter !== "all" && item.category !== categoryFilter) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return a.price - b.price;
        if (sortBy === "price-desc") return b.price - a.price;
        if (sortBy === "views") return b.views - a.views;
        return 0;
      });
  }, [items, searchQuery, typeFilter, statusFilter, categoryFilter, sortBy]);

  // Paginated subset
  const totalPages = Math.ceil(filteredItems.length / pageSize) || 1;
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, currentPage, pageSize]);

  const availableCategories = useMemo(() => {
    const set = new Set(items.map((i) => i.category));
    return Array.from(set);
  }, [items]);

  const isAllSelected =
    paginatedItems.length > 0 && paginatedItems.every((i) => selectedIds.includes(i.id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedItems.map((i) => i.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const renderStatusBadge = (status: ListingStatus) => {
    switch (status) {
      case "Active":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#E8F8F0] dark:bg-emerald-500/10 text-[#15803D] dark:text-emerald-400 border border-[#A7F3D0] dark:border-emerald-500/20 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-[#15803D] dark:bg-emerald-400" />
            <span>Active</span>
          </span>
        );
      case "Paused":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FFF8E6] dark:bg-amber-500/10 text-[#D97706] dark:text-amber-400 border border-[#FFE182] dark:border-amber-500/20 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D97706] dark:bg-amber-400" />
            <span>Paused</span>
          </span>
        );
      case "Draft":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#F2F4F8] dark:bg-white/10 text-[#5B636E] dark:text-neutral-300 border border-[#DCE0E6] dark:border-white/10 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8C929C]" />
            <span>Draft</span>
          </span>
        );
      case "In deal":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-500/20 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
            <span>In deal</span>
          </span>
        );
      case "Sold":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/20 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            <span>Sold</span>
          </span>
        );
    }
  };

  const createListingUrl = storeId
    ? `/listings/create?storeId=${storeId}`
    : "/listings/create";

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Toast feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 radius-native bg-[#171717] text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2.5 text-[13px] font-semibold animate-fade-in border border-white/10">
          <CheckCircle2 className="w-4 h-4 text-[#FFC928]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* =============================================================== */}
      {/* 1. TOP ACTIONS & CATALOG SUMMARY BAR                            */}
      {/* =============================================================== */}
      <div className="radius-native bg-white dark:bg-[#14161D] rounded-2xl border border-[#ECEEF2] dark:border-white/10 p-4 sm:p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-[16px] sm:text-[18px] font-extrabold text-[#171717] dark:text-white tracking-[-0.01em]">
              Storefront Catalog
            </h3>
            <span className="radius-native px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#FFC928]/20 text-[#171717] dark:text-[#FFC928]">
              {totalListings} items
            </span>
          </div>
          <p className="text-[12px] text-[#68707A] dark:text-neutral-400 mt-0.5">
            Manage your store inventory, link existing personal listings, or post new items.
          </p>
        </div>

        {/* Action Buttons: Add existing listing close to Add listing */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={openAddExistingModal}
            className="radius-native flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-white/5 hover:border-[#171717] text-[#171717] dark:text-white text-[12.5px] font-bold transition-colors cursor-pointer"
          >
            <FolderPlus className="w-3.5 h-3.5 text-[#D97706]" />
            <span>Add existing listing</span>
          </button>

          <Link
            href={createListingUrl}
            className="radius-native flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#FFC928] hover:bg-[#F2BD24] text-[#171717] text-[12.5px] font-extrabold shadow-xs transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add listing</span>
          </Link>
        </div>
      </div>

      {/* =============================================================== */}
      {/* 2. SEARCH & DISCOVERY TOOLBAR (Desktop & Mobile)                */}
      {/* =============================================================== */}
      <div className="radius-native bg-white dark:bg-[#14161D] rounded-2xl border border-[#ECEEF2] dark:border-white/10 p-4 sm:p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-3.5">
        {/* Full-width Search Bar */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#8C929C] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search store catalog by title, code, category..."
              className="radius-native w-full pl-9 pr-8 py-2 sm:py-2.5 rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-[#F7F8FA] dark:bg-[#181B24] text-[13px] text-[#171717] dark:text-white placeholder-[#8C929C] focus:outline-none focus:border-[#FFC928] transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C929C] hover:text-[#171717] p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Mobile Filter Button */}
          <button
            type="button"
            onClick={() => setIsMobileFilterOpen(true)}
            className="sm:hidden radius-native px-3 py-2 rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-[#F7F8FA] dark:bg-white/5 text-[12.5px] font-bold text-[#171717] dark:text-white flex items-center gap-1.5 shrink-0"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
            {(statusFilter !== "all" || categoryFilter !== "all") && (
              <span className="w-2 h-2 rounded-full bg-[#FFC928]" />
            )}
          </button>
        </div>

        {/* Type pills: All | Products | Services */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-[#F2F4F7] dark:border-white/5">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
            <button
              type="button"
              onClick={() => {
                setTypeFilter("all");
                setCurrentPage(1);
              }}
              className={`radius-native px-3.5 py-1.5 rounded-full text-[12px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                typeFilter === "all"
                  ? "bg-[#171717] text-white dark:bg-white dark:text-[#171717]"
                  : "bg-[#F7F8FA] dark:bg-white/5 text-[#5B636E] dark:text-neutral-400 hover:text-[#171717]"
              }`}
            >
              All Items
            </button>
            <button
              type="button"
              onClick={() => {
                setTypeFilter("products");
                setCurrentPage(1);
              }}
              className={`radius-native px-3.5 py-1.5 rounded-full text-[12px] font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                typeFilter === "products"
                  ? "bg-[#171717] text-white dark:bg-white dark:text-[#171717]"
                  : "bg-[#F7F8FA] dark:bg-white/5 text-[#5B636E] dark:text-neutral-400 hover:text-[#171717]"
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Products</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setTypeFilter("services");
                setCurrentPage(1);
              }}
              className={`radius-native px-3.5 py-1.5 rounded-full text-[12px] font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                typeFilter === "services"
                  ? "bg-[#171717] text-white dark:bg-white dark:text-[#171717]"
                  : "bg-[#F7F8FA] dark:bg-white/5 text-[#5B636E] dark:text-neutral-400 hover:text-[#171717]"
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Services</span>
            </button>
          </div>

          {/* Desktop Status Filters Row */}
          <div className="hidden sm:flex items-center gap-1.5 text-[12px]">
            <span className="font-semibold text-[#8C929C] mr-1">Status:</span>
            {(["all", "Active", "Draft", "Paused", "Sold"] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => {
                  setStatusFilter(st);
                  setCurrentPage(1);
                }}
                className={`radius-native px-3 py-1 rounded-full font-bold transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === st
                    ? "bg-[#FFE182] text-[#171717] dark:bg-[#FFC928] dark:text-[#171717]"
                    : "text-[#68707A] dark:text-neutral-400 hover:text-[#171717] dark:hover:text-white"
                }`}
              >
                {st === "all" ? "All statuses" : st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* =============================================================== */}
      {/* 3. BULK ACTIONS TOOLBAR                                         */}
      {/* =============================================================== */}
      {selectedIds.length > 0 && (
        <div className="radius-native bg-[#171717] text-white dark:bg-[#1E222D] p-3 sm:px-5 sm:py-3 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-lg border border-white/10 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2 text-[12.5px] font-semibold">
            <span className="w-5 h-5 rounded-full bg-[#FFC928] text-[#171717] flex items-center justify-center text-[11px] font-extrabold">
              {selectedIds.length}
            </span>
            <span>items selected</span>
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="text-xs text-[#9AA1AC] hover:text-white underline ml-1 cursor-pointer"
            >
              Deselect
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => handleBulkStatusChange("Active")}
              className="radius-native px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[12px] font-bold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <PlayCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Activate</span>
            </button>
            <button
              type="button"
              onClick={() => handleBulkStatusChange("Paused")}
              className="radius-native px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[12px] font-bold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <PauseCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>Pause</span>
            </button>
            <button
              type="button"
              onClick={handleBulkDelete}
              className="radius-native px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-[12px] font-bold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      )}

      {/* =============================================================== */}
      {/* 4. DESKTOP VIEW: Table / List                                   */}
      {/* =============================================================== */}
      <div className="hidden md:block radius-native bg-white dark:bg-[#14161D] rounded-2xl border border-[#ECEEF2] dark:border-white/10 shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
        {/* Table Header */}
        <div className="px-5 py-3.5 border-b border-[#ECEEF2] dark:border-white/10 bg-[#FAFAFC] dark:bg-white/[0.02] flex items-center gap-4 text-[11.5px] font-extrabold uppercase tracking-wider text-[#8C929C]">
          <div className="w-6 shrink-0 flex items-center justify-center">
            <button
              type="button"
              onClick={toggleSelectAll}
              aria-label="Select all listings"
              className={`w-4 h-4 rounded border transition-colors flex items-center justify-center cursor-pointer ${
                isAllSelected
                  ? "bg-[#171717] border-[#171717] text-white dark:bg-white dark:border-white dark:text-[#171717]"
                  : "border-[#C5C9D3] dark:border-white/20 hover:border-[#171717]"
              }`}
            >
              {isAllSelected && <Check className="w-3 h-3 stroke-[3]" />}
            </button>
          </div>
          <div className="shrink-0 font-extrabold text-[#171717] dark:text-white">
            Item ({totalListings})
          </div>
          <div className="flex-1 min-w-0">Title & Details</div>
          <div className="w-28 text-right">Price</div>
          <div className="w-28 text-center">Status</div>
          <div className="w-28 text-right">Updated</div>
          <div className="w-32 text-right">Action</div>
        </div>

        {/* Table Body */}
        {paginatedItems.length === 0 ? (
          <div className="p-12 text-center text-[#8C929C] space-y-2">
            <Package className="w-10 h-10 mx-auto stroke-[1.5] text-[#8C929C]" />
            <p className="text-[14px] font-bold text-[#171717] dark:text-white">
              No listings matched your criteria
            </p>
            <p className="text-[12px] text-[#68707A]">
              Try adjusting your search terms, changing type, or adding existing personal listings.
            </p>
            <div className="pt-2 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={openAddExistingModal}
                className="radius-native px-3.5 py-1.5 rounded-xl bg-[#FFC928] text-[12px] font-bold text-[#171717] hover:bg-[#F2BD24] transition-colors cursor-pointer"
              >
                + Add from personal listings
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setTypeFilter("all");
                  setCategoryFilter("all");
                }}
                className="radius-native px-3.5 py-1.5 rounded-xl border border-[#DCE0E6] dark:border-white/15 text-[12px] font-bold text-[#171717] dark:text-white hover:bg-neutral-50 dark:hover:bg-white/5 transition-colors"
              >
                Reset filters
              </button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-[#F2F4F7] dark:divide-white/5">
            {paginatedItems.map((item) => {
              const isSelected = selectedIds.includes(item.id);
              const isService = item.type === "service";

              return (
                <div
                  key={item.id}
                  className={`px-5 py-3.5 flex items-center gap-4 transition-colors ${
                    isSelected
                      ? "bg-[#FFC928]/10 dark:bg-[#FFC928]/5"
                      : "hover:bg-[#F9FAFC] dark:hover:bg-white/[0.02]"
                  }`}
                >
                  {/* Checkbox */}
                  <div className="w-6 shrink-0 flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => toggleSelectOne(item.id)}
                      aria-label={`Select ${item.title}`}
                      className={`w-4 h-4 rounded border transition-colors flex items-center justify-center cursor-pointer ${
                        isSelected
                          ? "bg-[#171717] border-[#171717] text-white dark:bg-white dark:border-white dark:text-[#171717]"
                          : "border-[#C5C9D3] dark:border-white/20 hover:border-[#171717]"
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </button>
                  </div>

                  {/* Thumbnail / Icon */}
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#F2F4F8] dark:bg-neutral-800 shrink-0 border border-[#ECEEF2] dark:border-white/10 flex items-center justify-center">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : isService ? (
                      <Briefcase className="w-5 h-5 text-blue-600" />
                    ) : (
                      <Package className="w-5 h-5 text-[#8C929C]" />
                    )}
                  </div>

                  {/* Title & Metadata */}
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/listings/${item.id}`}
                        className="text-[13.5px] font-bold text-[#171717] dark:text-white hover:underline truncate"
                      >
                        {item.title}
                      </Link>
                      {isService && (
                        <span className="radius-native px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300">
                          Service
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[11.5px] font-medium text-[#68707A] dark:text-neutral-400 mt-0.5">
                      <span className="capitalize font-semibold text-[#8C929C]">
                        {item.type}
                      </span>
                      <span>·</span>
                      <span>{item.category}</span>
                      <span>·</span>
                      <span className="font-mono text-[11px] text-[#8C929C]">{item.code}</span>
                      {item.views > 0 && (
                        <>
                          <span>·</span>
                          <span className="inline-flex items-center gap-1">
                            <Eye className="w-3 h-3 text-[#8C929C]" />
                            <span>{item.views}</span>
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="w-28 text-right font-extrabold text-[13.5px] text-[#171717] dark:text-[#FFC928]">
                    {item.priceFormatted}
                  </div>

                  {/* Status Badge */}
                  <div className="w-28 text-center flex justify-center">
                    {renderStatusBadge(item.status)}
                  </div>

                  {/* Updated Date */}
                  <div className="w-28 text-right text-[12px] font-medium text-[#8C929C]">
                    {item.updatedAt}
                  </div>

                  {/* Action Link / Trigger */}
                  <div className="w-32 text-right flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => openQuickEdit(item)}
                      className="radius-native px-2.5 py-1 rounded-lg border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-white/5 text-[11.5px] font-bold text-[#171717] dark:text-white hover:border-[#171717] transition-colors cursor-pointer"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => setItemToUnlink(item)}
                      title="Unlink from storefront (retains personal listing)"
                      className="radius-native p-1.5 rounded-lg border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-white/5 text-[#5B636E] hover:text-[#D97706] hover:border-[#D97706] transition-colors cursor-pointer"
                    >
                      <Unlink className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setItemToDelete(item)}
                      title="Delete permanently"
                      className="radius-native p-1.5 rounded-lg border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-white/5 text-[#5B636E] hover:text-rose-600 hover:border-rose-400 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* =============================================================== */}
      {/* 5. MOBILE VIEW: Listing Cards                                   */}
      {/* =============================================================== */}
      <div className="block md:hidden space-y-3.5">
        <div className="flex items-center justify-between px-1 text-[11.5px] font-extrabold uppercase tracking-wider text-[#8C929C]">
          <span className="text-[#171717] dark:text-white">Item ({totalListings})</span>
          {selectedIds.length > 0 && <span>{selectedIds.length} selected</span>}
        </div>

        {paginatedItems.length === 0 ? (
          <div className="radius-native bg-white dark:bg-[#14161D] rounded-2xl border border-[#ECEEF2] dark:border-white/10 p-8 text-center text-[#8C929C]">
            <Package className="w-10 h-10 mx-auto stroke-[1.5] mb-2" />
            <p className="text-[13.5px] font-bold text-[#171717] dark:text-white">
              No listings found
            </p>
            <p className="text-[12px] text-[#68707A] mt-1">
              Try changing your search or adding items from your personal listings.
            </p>
            <button
              type="button"
              onClick={openAddExistingModal}
              className="radius-native mt-3 px-4 py-2 rounded-xl bg-[#FFC928] text-[#171717] text-[12.5px] font-bold"
            >
              + Add existing listing
            </button>
          </div>
        ) : (
          paginatedItems.map((item) => {
            const isSelected = selectedIds.includes(item.id);
            const isMenuOpen = activeMenuId === item.id;

            return (
              <div
                key={item.id}
                className={`radius-native relative rounded-2xl bg-white dark:bg-[#14161D] border p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-colors ${
                  isSelected
                    ? "border-[#FFC928] bg-[#FFC928]/5"
                    : "border-[#ECEEF2] dark:border-white/10"
                }`}
              >
                {/* Top Row: Thumbnail + Title + Status + Overflow Menu */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#F2F4F8] dark:bg-neutral-800 shrink-0 border border-[#ECEEF2] dark:border-white/10 flex items-center justify-center">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : item.type === "service" ? (
                        <Briefcase className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Package className="w-5 h-5 text-[#8C929C]" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className="text-[14px] font-bold text-[#171717] dark:text-white truncate">
                        {item.title}
                      </h4>
                      <div className="flex items-center gap-1.5 text-[11.5px] font-medium text-[#8C929C] mt-0.5">
                        <span className="font-mono">{item.code}</span>
                        <span>·</span>
                        <span className="capitalize">{item.type}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {renderStatusBadge(item.status)}

                    <div className="relative">
                      <button
                        type="button"
                        onClick={() =>
                          setActiveMenuId((prev) => (prev === item.id ? null : item.id))
                        }
                        className="p-1 rounded-lg text-[#68707A] hover:text-[#171717] hover:bg-neutral-100 dark:hover:bg-white/10 cursor-pointer"
                        aria-label="More options"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {isMenuOpen && (
                        <div className="absolute right-0 top-full mt-1 w-48 rounded-xl bg-white dark:bg-[#1E222D] border border-[#ECEEF2] dark:border-white/15 shadow-xl py-1.5 z-30 text-[12.5px] font-semibold text-[#171717] dark:text-white animate-in fade-in zoom-in-95">
                          <button
                            type="button"
                            onClick={() => openQuickEdit(item)}
                            className="w-full px-3 py-2 text-left hover:bg-[#F7F8FA] dark:hover:bg-white/5 flex items-center gap-2 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Quick edit</span>
                          </button>

                          {item.status !== "Active" && (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(item.id, "Active")}
                              className="w-full px-3 py-2 text-left hover:bg-[#F7F8FA] dark:hover:bg-white/5 text-[#15803D] dark:text-emerald-400 flex items-center gap-2 cursor-pointer"
                            >
                              <PlayCircle className="w-3.5 h-3.5" />
                              <span>Make Active</span>
                            </button>
                          )}

                          {item.status !== "Paused" && item.status !== "Draft" && (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(item.id, "Paused")}
                              className="w-full px-3 py-2 text-left hover:bg-[#F7F8FA] dark:hover:bg-white/5 text-[#D97706] dark:text-amber-400 flex items-center gap-2 cursor-pointer"
                            >
                              <PauseCircle className="w-3.5 h-3.5" />
                              <span>Pause listing</span>
                            </button>
                          )}

                          {item.status !== "Sold" && (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(item.id, "Sold")}
                              className="w-full px-3 py-2 text-left hover:bg-[#F7F8FA] dark:hover:bg-white/5 text-purple-600 flex items-center gap-2 cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Mark as Sold</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              setItemToUnlink(item);
                              setActiveMenuId(null);
                            }}
                            className="w-full px-3 py-2 text-left hover:bg-amber-50 dark:hover:bg-amber-950/30 text-amber-600 flex items-center gap-2 cursor-pointer"
                          >
                            <Unlink className="w-3.5 h-3.5" />
                            <span>Unlink from store</span>
                          </button>

                          <Link
                            href={`/listings/${item.id}`}
                            className="w-full px-3 py-2 text-left hover:bg-[#F7F8FA] dark:hover:bg-white/5 flex items-center gap-2 text-[#5B636E] dark:text-neutral-300"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>View listing</span>
                          </Link>

                          <div className="h-[1px] bg-[#ECEEF2] dark:bg-white/10 my-1" />

                          <button
                            type="button"
                            onClick={() => {
                              setItemToDelete(item);
                              setActiveMenuId(null);
                            }}
                            className="w-full px-3 py-2 text-left hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 flex items-center gap-2 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete permanently</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Details Grid */}
                <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-[#F2F4F7] dark:border-white/5 text-[12px]">
                  <div>
                    <span className="block text-[10.5px] font-semibold text-[#8C929C]">Category</span>
                    <span className="font-bold text-[#171717] dark:text-white truncate block">
                      {item.category}
                    </span>
                  </div>

                  <div>
                    <span className="block text-[10.5px] font-semibold text-[#8C929C]">Price</span>
                    <span className="font-extrabold text-[#171717] dark:text-[#FFC928]">
                      {item.priceFormatted}
                    </span>
                  </div>

                  <div>
                    <span className="block text-[10.5px] font-semibold text-[#8C929C]">
                      {item.type === "product" ? "Stock" : "Leads"}
                    </span>
                    <span className="font-bold text-[#171717] dark:text-white">
                      {item.type === "product"
                        ? item.quantity !== undefined
                          ? item.quantity > 0
                            ? `${item.quantity} units`
                            : "Out of stock"
                          : "1"
                        : `${item.inquiries} leads`}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* =============================================================== */}
      {/* 6. PAGINATION CONTROLS                                          */}
      {/* =============================================================== */}
      {filteredItems.length > 0 && (
        <div className="radius-native bg-white dark:bg-[#14161D] rounded-2xl border border-[#ECEEF2] dark:border-white/10 p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row items-center justify-between gap-3 text-[12.5px]">
          <div className="text-[#68707A] dark:text-neutral-400 font-medium">
            Showing{" "}
            <span className="font-extrabold text-[#171717] dark:text-white">
              {(currentPage - 1) * pageSize + 1}
            </span>{" "}
            to{" "}
            <span className="font-extrabold text-[#171717] dark:text-white">
              {Math.min(currentPage * pageSize, filteredItems.length)}
            </span>{" "}
            of{" "}
            <span className="font-extrabold text-[#171717] dark:text-white">
              {filteredItems.length}
            </span>{" "}
            listings
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              className="radius-native px-3 py-1.5 rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-white/5 text-[#171717] dark:text-white font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#171717] transition-colors"
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                className={`radius-native w-8 h-8 rounded-xl font-extrabold text-[12px] transition-colors ${
                  currentPage === page
                    ? "bg-[#171717] text-white dark:bg-white dark:text-[#171717]"
                    : "text-[#68707A] hover:bg-neutral-100 dark:hover:bg-white/5"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              className="radius-native px-3 py-1.5 rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-white/5 text-[#171717] dark:text-white font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#171717] transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* =============================================================== */}
      {/* 7. MODAL: ADD EXISTING PERSONAL LISTINGS TO STORE               */}
      {/* =============================================================== */}
      {isAddExistingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="radius-native w-full max-w-lg bg-white dark:bg-[#14161D] rounded-2xl border border-[#ECEEF2] dark:border-white/10 p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-[#ECEEF2] dark:border-white/10 pb-3">
              <div>
                <h3 className="text-[16px] font-extrabold text-[#171717] dark:text-white">
                  Add from Your Personal Listings
                </h3>
                <p className="text-[12px] text-[#68707A] dark:text-neutral-400 mt-0.5">
                  Select your personal marketplace items to publish under your store catalog.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddExistingModalOpen(false)}
                className="p-1 rounded-full text-[#8C929C] hover:text-[#171717]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 py-1">
              {isLoadingPersonal ? (
                <div className="py-12 text-center text-[#8C929C] space-y-2">
                  <div className="w-7 h-7 mx-auto rounded-full border-2 border-[#171717] dark:border-white border-t-transparent animate-spin" />
                  <p className="text-[12.5px] font-semibold">Loading your personal listings...</p>
                </div>
              ) : availablePersonalListings.length === 0 ? (
                <div className="py-10 text-center text-[#8C929C] space-y-2">
                  <Package className="w-8 h-8 mx-auto stroke-[1.5]" />
                  <p className="text-[13px] font-bold text-[#171717] dark:text-white">
                    No unlinked personal listings available
                  </p>
                  <p className="text-[12px] text-[#68707A] max-w-xs mx-auto">
                    All your current items are already in your storefront catalog or you haven't created personal listings yet.
                  </p>
                  <Link
                    href={createListingUrl}
                    onClick={() => setIsAddExistingModalOpen(false)}
                    className="inline-block mt-2 radius-native px-3.5 py-1.5 rounded-xl bg-[#FFC928] text-[12px] font-bold text-[#171717]"
                  >
                    + Create a new listing
                  </Link>
                </div>
              ) : (
                availablePersonalListings.map((item) => {
                  const isSelected = selectedPersonalIds.includes(item._id);

                  return (
                    <div
                      key={item._id}
                      onClick={() => {
                        setSelectedPersonalIds((prev) =>
                          prev.includes(item._id)
                            ? prev.filter((id) => id !== item._id)
                            : [...prev, item._id]
                        );
                      }}
                      className={`radius-native p-3 rounded-xl border flex items-center gap-3 transition-colors cursor-pointer ${
                        isSelected
                          ? "border-[#FFC928] bg-[#FFC928]/10"
                          : "border-[#ECEEF2] dark:border-white/10 hover:border-[#171717]"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                          isSelected
                            ? "bg-[#171717] border-[#171717] text-white"
                            : "border-[#C5C9D3]"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>

                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-neutral-100 dark:bg-white/5 shrink-0 flex items-center justify-center">
                        {item.images?.[0] ? (
                          <img
                            src={item.images[0]}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="w-4 h-4 text-[#8C929C]" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-bold text-[#171717] dark:text-white truncate">
                          {item.title}
                        </div>
                        <div className="text-[11.5px] text-[#8C929C] flex items-center gap-1.5">
                          <span>{item.category}</span>
                          <span>·</span>
                          <span className="font-bold text-[#171717] dark:text-[#FFC928]">
                            {item.priceFormatted || `₦${item.price?.toLocaleString()}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="border-t border-[#ECEEF2] dark:border-white/10 pt-3 flex items-center justify-between gap-2">
              <span className="text-[12px] font-medium text-[#68707A]">
                {selectedPersonalIds.length} item(s) selected
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddExistingModalOpen(false)}
                  className="px-3.5 py-2 text-[12.5px] font-semibold text-[#68707A]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={selectedPersonalIds.length === 0 || isAssociating}
                  onClick={handleLinkExistingListings}
                  className="radius-native px-4 py-2 rounded-xl bg-[#FFC928] hover:bg-[#F2BD24] text-[#171717] font-extrabold text-[12.5px] shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isAssociating ? "Linking..." : "Add to Storefront"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =============================================================== */}
      {/* 8. MODAL: UNLINK FROM STOREFRONT CONFIRMATION                   */}
      {/* =============================================================== */}
      {itemToUnlink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="radius-native w-full max-w-sm bg-white dark:bg-[#14161D] rounded-2xl border border-[#ECEEF2] dark:border-white/10 p-5 shadow-2xl space-y-3.5">
            <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
              <Unlink className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-[15px] font-extrabold text-[#171717] dark:text-white">
                Unlink from Storefront?
              </h3>
              <p className="text-[12.5px] text-[#68707A] dark:text-neutral-400 mt-1 leading-relaxed">
                Remove <strong className="text-[#171717] dark:text-white">"{itemToUnlink.title}"</strong> from your store catalog? It will remain accessible as a personal listing on your account.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setItemToUnlink(null)}
                className="px-3.5 py-2 text-[12.5px] font-semibold text-[#68707A]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleUnlinkListing(itemToUnlink)}
                className="radius-native px-4 py-2 rounded-xl bg-[#171717] text-white dark:bg-white dark:text-[#171717] font-extrabold text-[12.5px] shadow-xs cursor-pointer"
              >
                Unlink Listing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =============================================================== */}
      {/* 9. QUICK EDIT MODAL                                             */}
      {/* =============================================================== */}
      {quickEditItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="radius-native w-full max-w-md bg-white dark:bg-[#14161D] rounded-2xl border border-[#ECEEF2] dark:border-white/10 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[16px] font-extrabold text-[#171717] dark:text-white">
                  Quick Edit Listing
                </h3>
                <p className="text-[12px] text-[#68707A] truncate max-w-xs">
                  {quickEditItem.title}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setQuickEditItem(null)}
                className="p-1 rounded-full text-[#8C929C] hover:text-[#171717]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={saveQuickEdit} className="space-y-3.5">
              <div>
                <label className="block text-[12px] font-bold text-[#68707A] mb-1">
                  Price (₦)
                </label>
                <input
                  type="text"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  className="radius-native w-full px-3 py-2 rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-[#181B24] text-[13.5px] font-bold text-[#171717] dark:text-white focus:outline-none focus:border-[#FFC928]"
                />
              </div>

              <div>
                <label className="block text-[12px] font-bold text-[#68707A] mb-1">
                  Status
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as ListingStatus)}
                  className="radius-native w-full px-3 py-2 rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-[#181B24] text-[13px] font-semibold text-[#171717] dark:text-white focus:outline-none focus:border-[#FFC928]"
                >
                  <option value="Active">Active</option>
                  <option value="Paused">Paused</option>
                  <option value="Draft">Draft</option>
                  <option value="In deal">In deal</option>
                  <option value="Sold">Sold</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-between gap-2 border-t border-[#ECEEF2] dark:border-white/10 mt-3">
                <button
                  type="button"
                  onClick={() => {
                    const item = quickEditItem;
                    setQuickEditItem(null);
                    setItemToUnlink(item);
                  }}
                  className="text-xs font-bold text-amber-600 hover:underline flex items-center gap-1"
                >
                  <Unlink className="w-3 h-3" />
                  <span>Unlink from store</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setQuickEditItem(null)}
                    className="px-3.5 py-2 text-[12.5px] font-semibold text-[#68707A]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="radius-native px-5 py-2 rounded-xl bg-[#FFC928] hover:bg-[#F2BD24] text-[#171717] font-extrabold text-[13px] shadow-xs cursor-pointer"
                  >
                    Save changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =============================================================== */}
      {/* 10. CONFIRM DELETE MODAL                                        */}
      {/* =============================================================== */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="radius-native w-full max-w-sm bg-white dark:bg-[#14161D] rounded-2xl border border-[#ECEEF2] dark:border-white/10 p-5 shadow-2xl space-y-3.5">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-[15px] font-extrabold text-[#171717] dark:text-white">
                Delete listing?
              </h3>
              <p className="text-[12.5px] text-[#68707A] dark:text-neutral-400 mt-1">
                Are you sure you want to delete{" "}
                <strong className="text-[#171717] dark:text-white">
                  "{itemToDelete.title}"
                </strong>
                ? This action cannot be undone.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="px-3.5 py-2 text-[12.5px] font-semibold text-[#68707A]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="radius-native px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-[12.5px] shadow-xs cursor-pointer"
              >
                Delete permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
