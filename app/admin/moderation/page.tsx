"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { 
  Package, 
  Search, 
  CheckCircle2, 
  Store, 
  Loader2, 
  X, 
  Eye, 
  Check, 
  Wrench,
  ShoppingBag
} from "lucide-react";
import { apiGet, apiPatch } from "@/lib/apiClient";
import { NIGERIAN_UNIVERSITIES } from "@/lib/constants";

interface ListingItem {
  _id: string;
  sellerId: string;
  storeId?: string;
  listingType: "product" | "service";
  title: string;
  price: number;
  priceFormatted: string;
  description: string;
  category: string;
  campus: string;
  location: string;
  images: string[];
  condition?: string;
  serviceDetails?: {
    pricingModel?: string;
    deliveryTime?: string;
    serviceLocationType?: string;
    portfolio?: string[];
  };
  status: "active" | "draft" | "pending_review" | "paused" | "sold" | "rejected" | "removed";
  moderationNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  views: number;
  likes: number;
  createdAt: string;
  updatedAt: string;
}

export default function ListingModerationPageWrapper() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-[#FFC928] animate-spin" />
      </div>
    }>
      <ListingModerationPage />
    </Suspense>
  );
}

function ListingModerationPage() {
  const searchParams = useSearchParams();

  const [listings, setListings] = useState<ListingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedStatus, setSelectedStatus] = useState<string>(
    searchParams.get("status") || "pending_review"
  );
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedCampus, setSelectedCampus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Moderation modal
  const [selectedItem, setSelectedItem] = useState<ListingItem | null>(null);
  const [actionType, setActionType] = useState<"approve" | "reject" | "pause" | "remove" | null>(null);
  const [actionReason, setActionReason] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const fetchListings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      let url = "admin/listings";
      const params = new URLSearchParams();
      if (selectedStatus && selectedStatus !== "all") {
        params.append("status", selectedStatus);
      }
      if (selectedType && selectedType !== "all") {
        params.append("listingType", selectedType);
      }
      if (selectedCampus && selectedCampus !== "all") {
        params.append("campus", selectedCampus);
      }
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const res: any = await apiGet(url);
      if (res?.success && Array.isArray(res?.data)) {
        setListings(res.data);

        const idParam = searchParams.get("id");
        if (idParam) {
          const match = res.data.find((l: ListingItem) => l._id === idParam);
          if (match) setSelectedItem(match);
        }
      } else {
        setListings([]);
      }
    } catch (err: any) {
      console.error("Failed to load listings for moderation:", err);
      setError(err?.message || "Failed to load catalog submissions.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [selectedStatus, selectedType, selectedCampus]);

  const filteredListings = useMemo(() => {
    if (!searchQuery.trim()) return listings;
    const q = searchQuery.toLowerCase();
    return listings.filter(
      (l) =>
        l.title?.toLowerCase().includes(q) ||
        l.description?.toLowerCase().includes(q) ||
        l.category?.toLowerCase().includes(q) ||
        l.location?.toLowerCase().includes(q)
    );
  }, [listings, searchQuery]);

  const handleModerationSubmit = async () => {
    if (!selectedItem || !actionType) return;

    if (actionType === "reject" && !actionReason.trim()) {
      alert("A rejection reason is required for moderation audit.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res: any = await apiPatch(`admin/listings/${selectedItem._id}`, {
        action: actionType,
        reason: actionReason.trim(),
        notes: actionReason.trim(),
      });

      if (res?.success) {
        setActionSuccessMsg(
          actionType === "approve"
            ? "Listing approved and published to the marketplace!"
            : actionType === "reject"
            ? "Listing rejected."
            : actionType === "pause"
            ? "Listing paused."
            : "Listing removed."
        );

        setListings((prev) =>
          prev.map((l) => (l._id === selectedItem._id ? res.data : l))
        );
        setSelectedItem(res.data);
        setActionType(null);
        setActionReason("");

        setTimeout(() => setActionSuccessMsg(null), 4000);
      } else {
        alert(res?.error || "Failed to moderate listing.");
      }
    } catch (err: any) {
      alert(err?.message || "Error processing moderation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusTabs = [
    { id: "pending_review", label: "Awaiting Review" },
    { id: "active", label: "Active" },
    { id: "rejected", label: "Rejected" },
    { id: "paused", label: "Paused" },
    { id: "all", label: "All Items" },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <h1 className="text-2xl font-black text-[#171717] dark:text-white tracking-tight">
              Listing Moderation
            </h1>
          </div>
          <p className="text-sm text-muted-foreground dark:text-neutral-400 mt-1">
            Inspect, approve, or reject student and storefront product and service listings.
          </p>
        </div>
      </div>

      {actionSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-sm font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchListings} className="underline font-bold text-xs">
            Retry
          </button>
        </div>
      )}

      {/* Filters Card */}
      <div className="bg-white dark:bg-[#14161D] p-4 rounded-3xl border border-border/60 dark:border-white/10 shadow-sm space-y-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {statusTabs.map((tab) => {
            const isActive = selectedStatus === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedStatus(tab.id)}
                className={`px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap active:scale-95 ${
                  isActive
                    ? "bg-[#171717] text-white dark:bg-[#FFC928] dark:text-[#171717] shadow-sm"
                    : "bg-[#F2F4F7] dark:bg-white/5 text-[#5B636E] dark:text-neutral-300 hover:bg-[#E5E7EB] dark:hover:bg-white/10 hover:text-[#171717] dark:hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Sub-Filters: Type, Campus & Search */}
        <div className="flex flex-col md:flex-row items-center gap-3 pt-2 border-t border-border/40 dark:border-white/10">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-muted-foreground dark:text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title, category, description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-2xl bg-[#F7F8FA] dark:bg-white/5 border border-border/50 dark:border-white/10 focus:border-[#FFC928] focus:outline-none text-[#171717] dark:text-white placeholder:text-muted-foreground/60 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            {/* Listing Type Toggle */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 text-xs rounded-2xl bg-[#F7F8FA] dark:bg-[#14161D] border border-border/50 dark:border-white/10 focus:border-[#FFC928] focus:outline-none text-[#171717] dark:text-white transition-colors font-medium dark:[&>option]:bg-[#14161D] dark:[&>option]:text-white"
            >
              <option value="all">All Types</option>
              <option value="product">Products Only</option>
              <option value="service">Services Only</option>
            </select>

            {/* Campus dropdown */}
            <select
              value={selectedCampus}
              onChange={(e) => setSelectedCampus(e.target.value)}
              className="w-full md:w-56 px-3 py-2 text-xs rounded-2xl bg-[#F7F8FA] dark:bg-[#14161D] border border-border/50 dark:border-white/10 focus:border-[#FFC928] focus:outline-none text-[#171717] dark:text-white transition-colors font-medium truncate dark:[&>option]:bg-[#14161D] dark:[&>option]:text-white"
            >
              <option value="all">All Campuses</option>
              {NIGERIAN_UNIVERSITIES.slice(0, 30).map((u: string) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Listings Table / Grid */}
      <div className="bg-white dark:bg-[#14161D] rounded-3xl border border-border/60 dark:border-white/10 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center text-muted-foreground dark:text-neutral-400">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
            <p className="text-xs font-bold uppercase tracking-wider">Loading listings queue...</p>
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="p-16 text-center text-muted-foreground dark:text-neutral-400">
            <Package className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
            <h3 className="text-sm font-bold text-foreground dark:text-white">No listings found</h3>
            <p className="text-xs mt-1">There are no catalog submissions matching your criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border/40 dark:border-white/10 bg-[#FAFBFD] dark:bg-white/[0.02] text-muted-foreground dark:text-neutral-400 uppercase tracking-wider font-black text-[10px]">
                  <th className="py-3.5 px-5">Item</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Category & Campus</th>
                  <th className="py-3.5 px-4">Storefront</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 dark:divide-white/5">
                {filteredListings.map((item) => (
                  <tr
                    key={item._id}
                    className="hover:bg-[#F7F8FA] dark:hover:bg-white/5 transition-colors group cursor-pointer"
                    onClick={() => setSelectedItem(item)}
                  >
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-muted dark:bg-white/10 overflow-hidden shrink-0 border border-border/40 dark:border-white/10">
                          {item.images?.[0] ? (
                            <img
                              src={item.images[0]}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground dark:text-neutral-400">
                              <Package className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-sm text-foreground dark:text-white truncate max-w-[220px]">
                            {item.title}
                          </p>
                          <p className="text-[11px] text-muted-foreground dark:text-neutral-400 truncate max-w-[220px]">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 font-black text-sm text-foreground dark:text-white">
                      {item.priceFormatted || `₦${item.price?.toLocaleString()}`}
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                          item.listingType === "service"
                            ? "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                            : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                        }`}
                      >
                        {item.listingType === "service" ? (
                          <Wrench className="w-3 h-3" />
                        ) : (
                          <ShoppingBag className="w-3 h-3" />
                        )}
                        {item.listingType}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <p className="font-semibold text-foreground dark:text-white truncate max-w-[180px]">
                        {item.category}
                      </p>
                      <p className="text-[11px] text-muted-foreground dark:text-neutral-400 truncate max-w-[180px]">
                        {item.campus}
                      </p>
                    </td>

                    <td className="py-4 px-4">
                      {item.storeId ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FFC928]/15 text-[#171717] dark:text-[#FFC928] font-bold text-[10px]">
                          <Store className="w-3 h-3" />
                          Store Item
                        </span>
                      ) : (
                        <span className="text-[11px] text-muted-foreground dark:text-neutral-400">
                          Personal
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          item.status === "active"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            : item.status === "pending_review"
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                            : item.status === "paused"
                            ? "bg-muted dark:bg-white/10 text-muted-foreground dark:text-neutral-300 border border-border/40"
                            : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {item.status.replace("_", " ")}
                      </span>
                    </td>

                    <td className="py-4 px-5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedItem(item);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-[#F2F4F7] dark:bg-white/10 hover:bg-[#E5E7EB] dark:hover:bg-white/15 font-bold text-[#171717] dark:text-white text-xs transition-all active:scale-95 inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Moderate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Moderation Inspection Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#14161D] w-full max-w-3xl max-h-[90vh] rounded-3xl border border-border dark:border-white/10 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-6 border-b border-border/50 dark:border-white/10 flex items-center justify-between bg-[#FAFBFD] dark:bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black">
                  {selectedItem.listingType === "service" ? (
                    <Wrench className="w-5 h-5" />
                  ) : (
                    <ShoppingBag className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-black text-foreground dark:text-white truncate max-w-md">
                    {selectedItem.title}
                  </h2>
                  <p className="text-xs text-muted-foreground dark:text-neutral-400">
                    ID: <span className="font-mono">{selectedItem._id}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedItem(null);
                  setActionType(null);
                }}
                className="w-9 h-9 rounded-full bg-[#F2F4F7] dark:bg-white/10 hover:bg-[#E5E7EB] dark:hover:bg-white/15 flex items-center justify-center text-foreground dark:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* Image Preview Gallery */}
              {selectedItem.images && selectedItem.images.length > 0 && (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground dark:text-neutral-400 mb-2">
                    Listing Photos ({selectedItem.images.length})
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {selectedItem.images.map((imgUrl, i) => (
                      <a
                        key={i}
                        href={imgUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="aspect-square rounded-2xl overflow-hidden border border-border/60 dark:border-white/10 hover:opacity-90 transition-opacity bg-muted dark:bg-white/5 block"
                      >
                        <img
                          src={imgUrl}
                          alt={`Photo ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Price & Primary Specs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-[#F7F8FA] dark:bg-white/[0.04] border border-border/40 dark:border-white/10">
                  <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground dark:text-neutral-400">
                    Listing Price
                  </p>
                  <p className="text-xl font-black text-foreground dark:text-white mt-1">
                    {selectedItem.priceFormatted || `₦${selectedItem.price?.toLocaleString()}`}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#F7F8FA] dark:bg-white/[0.04] border border-border/40 dark:border-white/10">
                  <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground dark:text-neutral-400">
                    Type & Category
                  </p>
                  <p className="text-sm font-bold text-foreground dark:text-white mt-1 capitalize">
                    {selectedItem.listingType} • {selectedItem.category}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#F7F8FA] dark:bg-white/[0.04] border border-border/40 dark:border-white/10">
                  <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground dark:text-neutral-400">
                    Campus & Location
                  </p>
                  <p className="text-sm font-bold text-foreground dark:text-white mt-1 truncate">
                    {selectedItem.campus}
                  </p>
                  <p className="text-[11px] text-muted-foreground dark:text-neutral-400 truncate">
                    {selectedItem.location}
                  </p>
                </div>
              </div>

              {/* Specifics (Product condition or Service details) */}
              {selectedItem.listingType === "service" && selectedItem.serviceDetails && (
                <div className="p-4 rounded-2xl bg-purple-500/5 border border-purple-500/20 space-y-1.5">
                  <p className="text-[10px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400">
                    Service Specifics
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-foreground dark:text-white">
                    <div>
                      <span className="text-muted-foreground dark:text-neutral-400">Pricing Model: </span>
                      <strong className="capitalize">{selectedItem.serviceDetails.pricingModel || "Fixed"}</strong>
                    </div>
                    <div>
                      <span className="text-muted-foreground dark:text-neutral-400">Delivery: </span>
                      <strong>{selectedItem.serviceDetails.deliveryTime || "Negotiable"}</strong>
                    </div>
                    <div>
                      <span className="text-muted-foreground dark:text-neutral-400">Location Type: </span>
                      <strong className="capitalize">{selectedItem.serviceDetails.serviceLocationType?.replace("_", " ") || "On campus"}</strong>
                    </div>
                  </div>
                </div>
              )}

              {selectedItem.listingType === "product" && selectedItem.condition && (
                <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20">
                  <span className="text-muted-foreground dark:text-neutral-400 font-semibold">Product Condition: </span>
                  <span className="font-bold text-foreground dark:text-white">{selectedItem.condition}</span>
                </div>
              )}

              {/* Description */}
              <div className="p-4 rounded-2xl bg-[#F7F8FA] dark:bg-white/[0.04] border border-border/40 dark:border-white/10 space-y-1">
                <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground dark:text-neutral-400">
                  Description
                </p>
                <p className="text-foreground dark:text-white leading-relaxed whitespace-pre-line text-xs">
                  {selectedItem.description}
                </p>
              </div>

              {/* Moderation Notes & Audit Trail */}
              {selectedItem.moderationNotes && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    Moderation Note
                  </p>
                  <p className="text-foreground dark:text-white">
                    {selectedItem.moderationNotes}
                  </p>
                  {selectedItem.reviewedBy && (
                    <p className="text-[10px] text-muted-foreground dark:text-neutral-400">
                      Reviewed by {selectedItem.reviewedBy} on {selectedItem.reviewedAt ? new Date(selectedItem.reviewedAt).toLocaleString() : ""}
                    </p>
                  )}
                </div>
              )}

              {/* Decision Action Input */}
              {actionType && (
                <div className="p-5 rounded-2xl bg-[#F7F8FA] dark:bg-white/[0.04] border-2 border-blue-500 space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <h3 className="font-black text-sm text-foreground dark:text-white uppercase tracking-wide">
                      {actionType === "approve"
                        ? "Approve & Publish Listing"
                        : actionType === "reject"
                        ? "Reject Listing"
                        : actionType === "pause"
                        ? "Pause Listing"
                        : "Remove Listing"}
                    </h3>
                    <button
                      onClick={() => setActionType(null)}
                      className="text-muted-foreground hover:text-foreground dark:text-neutral-400 dark:hover:text-white text-xs font-bold"
                    >
                      Cancel
                    </button>
                  </div>

                  {actionType === "reject" && (
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground dark:text-neutral-400">
                        Rejection Reason (Required)
                      </label>
                      <textarea
                        rows={2}
                        required
                        value={actionReason}
                        onChange={(e) => setActionReason(e.target.value)}
                        placeholder="e.g. Prohibited item, copyright infringement, or incomplete description."
                        className="w-full p-3 rounded-xl bg-white dark:bg-[#0E1015] border border-border/80 dark:border-white/10 focus:border-blue-500 focus:outline-none text-foreground dark:text-white placeholder:text-muted-foreground/50"
                      />
                    </div>
                  )}

                  <button
                    onClick={handleModerationSubmit}
                    disabled={isSubmitting}
                    className={`w-full py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm ${
                      actionType === "approve"
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                        : actionType === "reject"
                        ? "bg-rose-600 hover:bg-rose-700 text-white"
                        : "bg-[#171717] dark:bg-white dark:text-[#171717] hover:bg-black text-white"
                    } disabled:opacity-50`}
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        Confirm {actionType}
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            {!actionType && (
              <div className="p-4 border-t border-border/50 dark:border-white/10 bg-[#FAFBFD] dark:bg-white/[0.02] flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={() => setSelectedItem(null)}
                  className="px-4 py-2.5 rounded-xl bg-[#F2F4F7] dark:bg-white/10 hover:bg-[#E5E7EB] dark:hover:bg-white/15 font-bold text-[#171717] dark:text-white text-xs"
                >
                  Close
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setActionType("pause");
                      setActionReason("");
                    }}
                    className="px-3.5 py-2.5 rounded-xl border border-border dark:border-white/10 hover:bg-[#F2F4F7] dark:hover:bg-white/10 text-foreground dark:text-white font-bold text-xs"
                  >
                    Pause
                  </button>

                  <button
                    onClick={() => {
                      setActionType("reject");
                      setActionReason("");
                    }}
                    className="px-4 py-2.5 rounded-xl border border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 font-black text-xs uppercase tracking-wider"
                  >
                    Reject
                  </button>

                  <button
                    onClick={() => {
                      setActionType("approve");
                      setActionReason("");
                    }}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider shadow-sm"
                  >
                    Approve Listing
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
