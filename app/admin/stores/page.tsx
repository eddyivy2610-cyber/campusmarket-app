"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { 
  Store, 
  Search, 
  CheckCircle2, 
  ExternalLink, 
  GraduationCap, 
  Building2, 
  Loader2, 
  X, 
  Check, 
  Star,
  Package
} from "lucide-react";
import Link from "next/link";
import { apiGet, apiPatch } from "@/lib/apiClient";
import { NIGERIAN_UNIVERSITIES } from "@/lib/constants";

interface StoreItem {
  _id: string;
  ownerId: string;
  name: string;
  slug: string;
  description: string;
  storeType: "student_store" | "local_business";
  category: string;
  campus: string;
  operatingLocation: string;
  logo: string;
  status: "active" | "paused" | "suspended" | "pending_review";
  isVerified: boolean;
  verificationType: "student" | "business";
  suspensionReason?: string;
  metrics: {
    rating: number;
    reviewsCount: number;
    completedDeals: number;
    listingsCount: number;
  };
  createdAt: string;
  updatedAt: string;
}

export default function StoresOversightPageWrapper() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-[#FFC928] animate-spin" />
      </div>
    }>
      <StoresOversightPage />
    </Suspense>
  );
}

function StoresOversightPage() {
  const [stores, setStores] = useState<StoreItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedCampus, setSelectedCampus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Action modal
  const [targetStore, setTargetStore] = useState<StoreItem | null>(null);
  const [actionType, setActionType] = useState<"suspend" | "restore" | "pause" | null>(null);
  const [actionReason, setActionReason] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchStores = async () => {
    try {
      setIsLoading(true);
      setError(null);
      let url = "admin/stores";
      const params = new URLSearchParams();
      if (selectedStatus && selectedStatus !== "all") {
        params.append("status", selectedStatus);
      }
      if (selectedType && selectedType !== "all") {
        params.append("storeType", selectedType);
      }
      if (selectedCampus && selectedCampus !== "all") {
        params.append("campus", selectedCampus);
      }
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const res: any = await apiGet(url);
      if (res?.success && Array.isArray(res?.data)) {
        setStores(res.data);
      } else {
        setStores([]);
      }
    } catch (err: any) {
      console.error("Failed to load stores oversight:", err);
      setError(err?.message || "Failed to load storefronts.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, [selectedStatus, selectedType, selectedCampus]);

  const filteredStores = useMemo(() => {
    if (!searchQuery.trim()) return stores;
    const q = searchQuery.toLowerCase();
    return stores.filter(
      (s) =>
        s.name?.toLowerCase().includes(q) ||
        s.slug?.toLowerCase().includes(q) ||
        s.campus?.toLowerCase().includes(q) ||
        s.ownerId?.toLowerCase().includes(q)
    );
  }, [stores, searchQuery]);

  const handleActionSubmit = async () => {
    if (!targetStore || !actionType) return;

    if (actionType === "suspend" && !actionReason.trim()) {
      alert("A suspension reason is required for administrative audit.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res: any = await apiPatch(`admin/stores/${targetStore._id}`, {
        action: actionType,
        reason: actionReason.trim(),
      });

      if (res?.success) {
        setSuccessMsg(
          actionType === "suspend"
            ? `Store "${targetStore.name}" has been suspended.`
            : actionType === "restore"
            ? `Store "${targetStore.name}" restored to active status.`
            : `Store "${targetStore.name}" paused.`
        );

        setStores((prev) =>
          prev.map((s) => (s._id === targetStore._id ? res.data : s))
        );
        setTargetStore(null);
        setActionType(null);
        setActionReason("");

        setTimeout(() => setSuccessMsg(null), 4000);
      } else {
        alert(res?.error || "Failed to update store status.");
      }
    } catch (err: any) {
      alert(err?.message || "Error updating store status.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusTabs = [
    { id: "all", label: "All Storefronts" },
    { id: "active", label: "Active" },
    { id: "suspended", label: "Suspended" },
    { id: "paused", label: "Paused" },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <h1 className="text-2xl font-black text-[#171717] dark:text-white tracking-tight">
              Storefront Oversight
            </h1>
          </div>
          <p className="text-sm text-muted-foreground dark:text-neutral-400 mt-1">
            Monitor, inspect, and manage student vendors and verified local business storefronts.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-sm font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchStores} className="underline font-bold text-xs">
            Retry
          </button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white dark:bg-[#14161D] p-4 rounded-3xl border border-border/60 dark:border-white/10 shadow-sm space-y-4">
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

        <div className="flex flex-col md:flex-row items-center gap-3 pt-2 border-t border-border/40 dark:border-white/10">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-muted-foreground dark:text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by store name, slug, campus, owner ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-2xl bg-[#F7F8FA] dark:bg-white/5 border border-border/50 dark:border-white/10 focus:border-[#FFC928] focus:outline-none text-[#171717] dark:text-white placeholder:text-muted-foreground/60 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            {/* Store Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 text-xs rounded-2xl bg-[#F7F8FA] dark:bg-[#14161D] border border-border/50 dark:border-white/10 focus:border-[#FFC928] focus:outline-none text-[#171717] dark:text-white transition-colors font-medium dark:[&>option]:bg-[#14161D] dark:[&>option]:text-white"
            >
              <option value="all">All Store Types</option>
              <option value="student_store">Student Stores</option>
              <option value="local_business">Local Businesses</option>
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

      {/* Stores Table */}
      <div className="bg-white dark:bg-[#14161D] rounded-3xl border border-border/60 dark:border-white/10 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center text-muted-foreground dark:text-neutral-400">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-3" />
            <p className="text-xs font-bold uppercase tracking-wider">Loading storefronts...</p>
          </div>
        ) : filteredStores.length === 0 ? (
          <div className="p-16 text-center text-muted-foreground dark:text-neutral-400">
            <Store className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
            <h3 className="text-sm font-bold text-foreground dark:text-white">No storefronts found</h3>
            <p className="text-xs mt-1">There are no stores matching your current search or filter filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border/40 dark:border-white/10 bg-[#FAFBFD] dark:bg-white/[0.02] text-muted-foreground dark:text-neutral-400 uppercase tracking-wider font-black text-[10px]">
                  <th className="py-3.5 px-5">Store</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Campus & Location</th>
                  <th className="py-3.5 px-4">Listings</th>
                  <th className="py-3.5 px-4">Rating / Deals</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 dark:divide-white/5">
                {filteredStores.map((store) => (
                  <tr
                    key={store._id}
                    className="hover:bg-[#F7F8FA] dark:hover:bg-white/5 transition-colors group"
                  >
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-secondary dark:bg-white/10 overflow-hidden shrink-0 border border-border/50 dark:border-white/10">
                          {store.logo ? (
                            <img
                              src={store.logo}
                              alt={store.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs font-black text-[#FFC928]">
                              {store.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-sm text-foreground dark:text-white truncate max-w-[200px]">
                            {store.name}
                          </p>
                          <p className="text-[11px] font-mono text-muted-foreground dark:text-neutral-400 truncate">
                            @{store.slug}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                          store.storeType === "local_business"
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                            : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        }`}
                      >
                        {store.storeType === "local_business" ? (
                          <Building2 className="w-3 h-3" />
                        ) : (
                          <GraduationCap className="w-3 h-3" />
                        )}
                        {store.storeType === "local_business" ? "Local Business" : "Student Store"}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <p className="font-semibold text-foreground dark:text-white truncate max-w-[200px]">
                        {store.campus}
                      </p>
                      <p className="text-[11px] text-muted-foreground dark:text-neutral-400 truncate max-w-[200px]">
                        {store.operatingLocation}
                      </p>
                    </td>

                    <td className="py-4 px-4">
                      <span className="font-bold text-foreground dark:text-white flex items-center gap-1">
                        <Package className="w-3.5 h-3.5 text-muted-foreground dark:text-neutral-400" />
                        {store.metrics?.listingsCount || 0} active
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-foreground dark:text-white flex items-center gap-1 text-[11px]">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          {store.metrics?.rating ? store.metrics.rating.toFixed(1) : "5.0"}
                        </span>
                        <span className="text-[10px] text-muted-foreground dark:text-neutral-400">
                          {store.metrics?.completedDeals || 0} deals
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          store.status === "active"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            : store.status === "suspended"
                            ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                            : "bg-muted dark:bg-white/10 text-muted-foreground dark:text-neutral-300 border border-border/40"
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {store.status}
                      </span>
                    </td>

                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/profile/${store.slug}`}
                          target="_blank"
                          className="p-1.5 rounded-xl bg-[#F2F4F7] dark:bg-white/10 hover:bg-[#E5E7EB] dark:hover:bg-white/15 text-foreground dark:text-white transition-all"
                          title="View Public Store"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>

                        {store.status === "suspended" ? (
                          <button
                            onClick={() => {
                              setTargetStore(store);
                              setActionType("restore");
                              setActionReason("");
                            }}
                            className="px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] uppercase tracking-wider transition-all"
                          >
                            Restore
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setTargetStore(store);
                              setActionType("suspend");
                              setActionReason("");
                            }}
                            className="px-2.5 py-1 rounded-xl bg-rose-500/10 dark:bg-rose-500/20 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-[10px] uppercase tracking-wider transition-all"
                          >
                            Suspend
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Suspend / Restore Action Modal */}
      {targetStore && actionType && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#14161D] w-full max-w-md rounded-3xl border border-border dark:border-white/10 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${actionType === "suspend" ? "bg-rose-500" : "bg-emerald-500"}`} />
                <h3 className="font-black text-sm uppercase text-foreground dark:text-white">
                  {actionType === "suspend" ? "Suspend Storefront" : "Restore Storefront"}
                </h3>
              </div>
              <button
                onClick={() => {
                  setTargetStore(null);
                  setActionType(null);
                }}
                className="w-8 h-8 rounded-full bg-[#F2F4F7] dark:bg-white/10 hover:bg-[#E5E7EB] dark:hover:bg-white/15 flex items-center justify-center text-foreground dark:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground dark:text-neutral-400 leading-relaxed">
              {actionType === "suspend" ? (
                <>
                  Suspending <strong className="text-foreground dark:text-white">{targetStore.name}</strong> will remove all of its catalog listings from public search and store discovery immediately.
                </>
              ) : (
                <>
                  Restoring <strong className="text-foreground dark:text-white">{targetStore.name}</strong> will reactivate the store profile and re-enable public visibility.
                </>
              )}
            </p>

            {actionType === "suspend" && (
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground dark:text-neutral-400">
                  Audit Suspension Reason (Required)
                </label>
                <textarea
                  rows={3}
                  required
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder="e.g. Unfulfilled customer orders, reported scam activity, or counterfeit products."
                  className="w-full p-3 rounded-xl bg-[#F7F8FA] dark:bg-[#0E1015] border border-border/80 dark:border-white/10 focus:border-[#FFC928] focus:outline-none text-foreground dark:text-white placeholder:text-muted-foreground/50 text-xs"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setTargetStore(null);
                  setActionType(null);
                }}
                className="px-4 py-2.5 rounded-xl bg-[#F2F4F7] dark:bg-white/10 hover:bg-[#E5E7EB] dark:hover:bg-white/15 font-bold text-[#171717] dark:text-white text-xs"
              >
                Cancel
              </button>

              <button
                onClick={handleActionSubmit}
                disabled={isSubmitting}
                className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider text-white transition-all ${
                  actionType === "suspend"
                    ? "bg-rose-600 hover:bg-rose-700"
                    : "bg-emerald-600 hover:bg-emerald-700"
                } disabled:opacity-50 flex items-center gap-1.5`}
              >
                {isSubmitting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Confirm {actionType}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
