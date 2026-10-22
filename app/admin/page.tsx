"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Building2, 
  Package, 
  Store, 
  Users, 
  ArrowRight, 
  CheckCircle2, 
  ExternalLink,
  ChevronRight,
  RefreshCw
} from "lucide-react";
import { apiGet } from "@/lib/apiClient";

interface OverviewStats {
  pendingApplications: number;
  approvedApplications: number;
  pendingListings: number;
  activeListings: number;
  totalListings: number;
  activeStores: number;
  totalStores: number;
  registeredUsers: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<OverviewStats>({
    pendingApplications: 0,
    approvedApplications: 0,
    pendingListings: 0,
    activeListings: 0,
    totalListings: 0,
    activeStores: 0,
    totalStores: 0,
    registeredUsers: 0,
  });
  const [recentApplications, setRecentApplications] = useState<any[]>([]);
  const [recentListings, setRecentListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOverview = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res: any = await apiGet("admin/overview");
      if (res?.success && res?.data) {
        setStats(res.data.stats || {});
        setRecentApplications(res.data.recentApplications || []);
        setRecentListings(res.data.recentListings || []);
      }
    } catch (err: any) {
      console.error("Failed to load admin overview:", err);
      setError(err?.message || "Failed to load dashboard metrics.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#14161D] p-6 rounded-3xl border border-border/60 dark:border-white/10 shadow-sm">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-[#171717] dark:text-white tracking-tight">
            Admin Overview
          </h1>
          <p className="text-sm text-muted-foreground dark:text-neutral-400 mt-1">
            Real-time verification queue, business applications, and platform storefront oversight.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchOverview}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#F2F4F7] dark:bg-white/10 hover:bg-[#E5E7EB] dark:hover:bg-white/15 text-xs font-bold text-[#171717] dark:text-white transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh Data
          </button>
          <Link
            href="/stores"
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#FFC928] hover:bg-[#FFC928]/90 text-[#171717] text-xs font-black transition-all shadow-sm active:scale-95"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Live Marketplace
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchOverview} className="underline font-bold text-xs">
            Retry
          </button>
        </div>
      )}

      {/* Primary Action Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {/* Pending Business Applications */}
        <Link
          href="/admin/business-applications?status=pending_review"
          className="group block p-5 rounded-3xl bg-white dark:bg-[#14161D] border border-border/60 dark:border-white/10 hover:border-[#FFC928] dark:hover:border-[#FFC928] transition-all hover:shadow-md relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            {stats.pendingApplications > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-white text-[11px] font-black uppercase tracking-wider animate-pulse">
                Action Needed
              </span>
            )}
          </div>
          <div className="mt-4">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground dark:text-neutral-400">
              Business Approvals
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-[#171717] dark:text-white">
                {isLoading ? "—" : stats.pendingApplications}
              </span>
              <span className="text-xs font-semibold text-muted-foreground dark:text-neutral-400">
                pending review
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-border/40 dark:border-white/10 flex items-center justify-between text-xs font-bold text-foreground/70 dark:text-neutral-300 group-hover:text-foreground dark:group-hover:text-white">
            <span>Review applications</span>
            <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Listings Awaiting Moderation */}
        <Link
          href="/admin/moderation?status=pending_review"
          className="group block p-5 rounded-3xl bg-white dark:bg-[#14161D] border border-border/60 dark:border-white/10 hover:border-[#FFC928] dark:hover:border-[#FFC928] transition-all hover:shadow-md relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            {stats.pendingListings > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500 text-white text-[11px] font-black uppercase tracking-wider">
                Pending
              </span>
            )}
          </div>
          <div className="mt-4">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground dark:text-neutral-400">
              Listing Moderation
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-[#171717] dark:text-white">
                {isLoading ? "—" : stats.pendingListings}
              </span>
              <span className="text-xs font-semibold text-muted-foreground dark:text-neutral-400">
                awaiting review
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-border/40 dark:border-white/10 flex items-center justify-between text-xs font-bold text-foreground/70 dark:text-neutral-300 group-hover:text-foreground dark:group-hover:text-white">
            <span>Moderate catalog</span>
            <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Active Storefronts */}
        <Link
          href="/admin/stores"
          className="group block p-5 rounded-3xl bg-white dark:bg-[#14161D] border border-border/60 dark:border-white/10 hover:border-[#FFC928] dark:hover:border-[#FFC928] transition-all hover:shadow-md relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Store className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-muted-foreground dark:text-neutral-400">
              Total {isLoading ? "—" : stats.totalStores}
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground dark:text-neutral-400">
              Active Storefronts
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-[#171717] dark:text-white">
                {isLoading ? "—" : stats.activeStores}
              </span>
              <span className="text-xs font-semibold text-muted-foreground dark:text-neutral-400">
                student & local stores
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-border/40 dark:border-white/10 flex items-center justify-between text-xs font-bold text-foreground/70 dark:text-neutral-300 group-hover:text-foreground dark:group-hover:text-white">
            <span>Manage storefronts</span>
            <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Registered Users */}
        <Link
          href="/admin/users"
          className="group block p-5 rounded-3xl bg-white dark:bg-[#14161D] border border-border/60 dark:border-white/10 hover:border-[#FFC928] dark:hover:border-[#FFC928] transition-all hover:shadow-md relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-muted-foreground dark:text-neutral-400">
              Platform Accounts
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground dark:text-neutral-400">
              Registered Users
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-[#171717] dark:text-white">
                {isLoading ? "—" : stats.registeredUsers}
              </span>
              <span className="text-xs font-semibold text-muted-foreground dark:text-neutral-400">
                students & vendors
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-border/40 dark:border-white/10 flex items-center justify-between text-xs font-bold text-foreground/70 dark:text-neutral-300 group-hover:text-foreground dark:group-hover:text-white">
            <span>Inspect accounts</span>
            <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>

      {/* Review Queues Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Business Applications Queue */}
        <div className="bg-white dark:bg-[#14161D] rounded-3xl border border-border/60 dark:border-white/10 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 md:p-6 border-b border-border/50 dark:border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-black uppercase tracking-wider text-[#171717] dark:text-white">
                Business Applications Queue
              </h2>
            </div>
            <Link
              href="/admin/business-applications"
              className="text-xs font-bold text-[#171717] dark:text-[#FFC928] hover:underline flex items-center gap-1"
            >
              View All ({stats.pendingApplications})
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-4 flex-1">
            {isLoading ? (
              <div className="space-y-3 p-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 bg-muted/40 dark:bg-white/5 animate-pulse rounded-2xl" />
                ))}
              </div>
            ) : recentApplications.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground dark:text-neutral-400">
                <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500/50 mb-2" />
                <p className="text-sm font-bold text-foreground dark:text-white">All caught up!</p>
                <p className="text-xs mt-0.5">No business applications currently pending review.</p>
              </div>
            ) : (
              <div className="divide-y divide-border/40 dark:divide-white/5">
                {recentApplications.map((app) => (
                  <div
                    key={app._id}
                    className="py-3 px-3 rounded-2xl hover:bg-[#F7F8FA] dark:hover:bg-white/5 transition-colors flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-foreground dark:text-white truncate">
                          {app.businessName}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            app.status === "approved"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                              : app.status === "pending_review"
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                              : app.status === "changes_requested"
                              ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                              : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                          }`}
                        >
                          {app.status.replace("_", " ")}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground dark:text-neutral-400 truncate mt-0.5">
                        {app.campus} • {app.businessCategory}
                      </p>
                    </div>

                    <Link
                      href={`/admin/business-applications?id=${app._id}`}
                      className="shrink-0 px-3 py-1.5 rounded-xl bg-[#F2F4F7] dark:bg-white/10 hover:bg-[#E5E7EB] dark:hover:bg-white/15 text-xs font-bold text-[#171717] dark:text-white transition-all"
                    >
                      Review
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Listings Moderation Queue */}
        <div className="bg-white dark:bg-[#14161D] rounded-3xl border border-border/60 dark:border-white/10 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 md:p-6 border-b border-border/50 dark:border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Package className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-black uppercase tracking-wider text-[#171717] dark:text-white">
                Catalog Submissions
              </h2>
            </div>
            <Link
              href="/admin/moderation"
              className="text-xs font-bold text-[#171717] dark:text-[#FFC928] hover:underline flex items-center gap-1"
            >
              Moderate ({stats.pendingListings})
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-4 flex-1">
            {isLoading ? (
              <div className="space-y-3 p-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 bg-muted/40 dark:bg-white/5 animate-pulse rounded-2xl" />
                ))}
              </div>
            ) : recentListings.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground dark:text-neutral-400">
                <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500/50 mb-2" />
                <p className="text-sm font-bold text-foreground dark:text-white">Clean Catalog!</p>
                <p className="text-xs mt-0.5">No product or service listings currently awaiting review.</p>
              </div>
            ) : (
              <div className="divide-y divide-border/40 dark:divide-white/5">
                {recentListings.map((item) => (
                  <div
                    key={item._id}
                    className="py-3 px-3 rounded-2xl hover:bg-[#F7F8FA] dark:hover:bg-white/5 transition-colors flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-muted dark:bg-white/10 overflow-hidden shrink-0 border border-border/40 dark:border-white/10">
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
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-foreground dark:text-white truncate max-w-[200px]">
                            {item.title}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                              item.listingType === "service"
                                ? "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                                : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                            }`}
                          >
                            {item.listingType}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground dark:text-neutral-400 truncate">
                          {item.priceFormatted || `₦${item.price?.toLocaleString()}`} • {item.campus}
                        </p>
                      </div>
                    </div>

                    <Link
                      href={`/admin/moderation?id=${item._id}`}
                      className="shrink-0 px-3 py-1.5 rounded-xl bg-[#F2F4F7] dark:bg-white/10 hover:bg-[#E5E7EB] dark:hover:bg-white/15 text-xs font-bold text-[#171717] dark:text-white transition-all"
                    >
                      Inspect
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
