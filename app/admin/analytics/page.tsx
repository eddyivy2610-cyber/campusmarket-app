"use client";

import React, { useEffect, useState } from "react";
import {
    BarChart3,
    Users,
    Store,
    Package,
    ShoppingBag,
    ShieldAlert,
    Star,
    RefreshCw,
    Loader2,
} from "lucide-react";
import { apiGet } from "@/lib/apiClient";
import Link from "next/link";

export default function AnalyticsPage() {
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchAnalytics = async () => {
        try {
            setIsLoading(true);
            const res: any = await apiGet("admin/analytics");
            if (res?.success) {
                setData(res.data);
            }
        } catch (err) {
            console.error("Failed to fetch admin analytics:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, []);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[55vh] text-muted-foreground">
                <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
                <p className="text-xs font-bold uppercase tracking-wider">
                    Computing real-time platform analytics...
                </p>
            </div>
        );
    }

    const users = data?.users || {};
    const stores = data?.stores || {};
    const listings = data?.listings || {};
    const orders = data?.orders || {};
    const moderation = data?.moderation || {};
    const topStores = data?.topStores || [];

    return (
        <div className="space-y-6 pb-12 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-6 rounded-3xl border border-border/60 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                        <BarChart3 size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl md:text-2xl font-black text-foreground tracking-tight">
                            Platform Intelligence & Multi-Store Analytics
                        </h1>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Live aggregations across private user accounts, student & business stores, catalog distribution, and GMV.
                        </p>
                    </div>
                </div>
                <button
                    onClick={fetchAnalytics}
                    className="px-4 py-2 rounded-xl bg-secondary hover:bg-secondary/80 text-xs font-bold flex items-center gap-2 self-start sm:self-auto"
                >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Refresh Metrics
                </button>
            </div>

            {/* KPI Summary Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-3xl bg-card border border-border/60 space-y-2">
                    <div className="flex items-center justify-between text-muted-foreground">
                        <span className="text-[11px] font-bold uppercase tracking-wider">Private Users</span>
                        <Users className="w-4 h-4 text-primary" />
                    </div>
                    <p className="text-3xl font-black text-foreground">{users.total || 0}</p>
                    <p className="text-xs text-muted-foreground">
                        {users.verifiedStudents || 0} verified students • {users.multiStoreOwners || 0} multi-store owners
                    </p>
                </div>

                <div className="p-5 rounded-3xl bg-card border border-border/60 space-y-2">
                    <div className="flex items-center justify-between text-muted-foreground">
                        <span className="text-[11px] font-bold uppercase tracking-wider">Public Stores</span>
                        <Store className="w-4 h-4 text-emerald-500" />
                    </div>
                    <p className="text-3xl font-black text-foreground">{stores.active || 0}</p>
                    <p className="text-xs text-muted-foreground">
                        {stores.studentStores || 0} student • {stores.businessStores || 0} business ({stores.total || 0} total)
                    </p>
                </div>

                <div className="p-5 rounded-3xl bg-card border border-border/60 space-y-2">
                    <div className="flex items-center justify-between text-muted-foreground">
                        <span className="text-[11px] font-bold uppercase tracking-wider">Store Listings</span>
                        <Package className="w-4 h-4 text-blue-500" />
                    </div>
                    <p className="text-3xl font-black text-foreground">{listings.active || 0}</p>
                    <p className="text-xs text-muted-foreground">
                        {listings.pendingReview || 0} pending review • {listings.total || 0} total
                    </p>
                </div>

                <div className="p-5 rounded-3xl bg-card border border-border/60 space-y-2">
                    <div className="flex items-center justify-between text-muted-foreground">
                        <span className="text-[11px] font-bold uppercase tracking-wider">Completed GMV</span>
                        <ShoppingBag className="w-4 h-4 text-amber-500" />
                    </div>
                    <p className="text-3xl font-black text-foreground">
                        ₦{Number(orders.completedGmv || 0).toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {orders.delivered || 0} delivered • {orders.disputed || 0} disputed ({orders.total || 0} total)
                    </p>
                </div>
            </div>

            {/* Category & Campus Breakdowns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-6 rounded-3xl bg-card border border-border/60 space-y-4">
                    <h2 className="text-sm font-black uppercase tracking-wider text-foreground">
                        Active Listings by Category
                    </h2>
                    <div className="space-y-3">
                        {(listings.byCategory || []).length === 0 ? (
                            <p className="text-xs text-muted-foreground">No active listings yet.</p>
                        ) : (
                            (listings.byCategory || []).map((item: any) => {
                                const pct = listings.active
                                    ? Math.round((item.count / listings.active) * 100)
                                    : 0;
                                return (
                                    <div key={item.category} className="space-y-1">
                                        <div className="flex justify-between text-xs font-bold">
                                            <span className="capitalize">{item.category}</span>
                                            <span>
                                                {item.count} ({pct}%)
                                            </span>
                                        </div>
                                        <div className="h-2 rounded-full bg-secondary overflow-hidden">
                                            <div
                                                className="h-full bg-primary rounded-full"
                                                style={{ width: `${Math.max(pct, 4)}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                <div className="p-6 rounded-3xl bg-card border border-border/60 space-y-4">
                    <h2 className="text-sm font-black uppercase tracking-wider text-foreground">
                        Active Listings by Campus
                    </h2>
                    <div className="space-y-3">
                        {(listings.byCampus || []).length === 0 ? (
                            <p className="text-xs text-muted-foreground">No campus distribution data yet.</p>
                        ) : (
                            (listings.byCampus || []).map((item: any) => {
                                const pct = listings.active
                                    ? Math.round((item.count / listings.active) * 100)
                                    : 0;
                                return (
                                    <div key={item.campus} className="space-y-1">
                                        <div className="flex justify-between text-xs font-bold">
                                            <span>{item.campus}</span>
                                            <span>
                                                {item.count} ({pct}%)
                                            </span>
                                        </div>
                                        <div className="h-2 rounded-full bg-secondary overflow-hidden">
                                            <div
                                                className="h-full bg-emerald-500 rounded-full"
                                                style={{ width: `${Math.max(pct, 4)}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* Top Stores & Moderation Health */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-6 rounded-3xl bg-card border border-border/60 space-y-4">
                    <h2 className="text-sm font-black uppercase tracking-wider text-foreground">
                        Top Performing Stores
                    </h2>
                    <div className="divide-y divide-border/40">
                        {topStores.length === 0 ? (
                            <p className="text-xs text-muted-foreground py-4">No active stores yet.</p>
                        ) : (
                            topStores.map((st: any) => (
                                <div key={st._id} className="py-3 flex items-center justify-between">
                                    <div>
                                        <Link
                                            href={`/stores/${st.slug}`}
                                            target="_blank"
                                            className="text-sm font-bold text-foreground hover:text-primary"
                                        >
                                            {st.storeName}
                                        </Link>
                                        <p className="text-[11px] text-muted-foreground">
                                            /{st.slug} • {st.campus || "Campus"} •{" "}
                                            {st.storeType === "student_store" ? "Student Store" : "Business"}
                                        </p>
                                    </div>
                                    <div className="text-right text-xs font-bold">
                                        <span className="inline-flex items-center gap-1 text-amber-500">
                                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                                            {st.metrics?.rating || 0} ({st.metrics?.reviewsCount || 0})
                                        </span>
                                        <p className="text-[10px] text-muted-foreground">
                                            {st.metrics?.listingsCount || 0} active listings
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="p-6 rounded-3xl bg-card border border-border/60 space-y-4">
                    <h2 className="text-sm font-black uppercase tracking-wider text-foreground flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-rose-500" />
                        Moderation & Trust Queue Health
                    </h2>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                        <Link
                            href="/admin/reports"
                            className="p-4 rounded-2xl bg-secondary/30 border border-border/50 hover:border-primary"
                        >
                            <p className="text-muted-foreground uppercase text-[10px] font-bold">
                                Pending Reports
                            </p>
                            <p className="text-2xl font-black text-foreground mt-1">
                                {moderation.pendingReports || 0}
                            </p>
                        </Link>
                        <Link
                            href="/admin/business-applications"
                            className="p-4 rounded-2xl bg-secondary/30 border border-border/50 hover:border-primary"
                        >
                            <p className="text-muted-foreground uppercase text-[10px] font-bold">
                                Pending Business Apps
                            </p>
                            <p className="text-2xl font-black text-foreground mt-1">
                                {moderation.pendingBusinessApplications || 0}
                            </p>
                        </Link>
                        <Link
                            href="/admin/moderation"
                            className="p-4 rounded-2xl bg-secondary/30 border border-border/50 hover:border-primary"
                        >
                            <p className="text-muted-foreground uppercase text-[10px] font-bold">
                                Listings Pending Review
                            </p>
                            <p className="text-2xl font-black text-foreground mt-1">
                                {moderation.pendingListings || 0}
                            </p>
                        </Link>
                        <Link
                            href="/admin/badges"
                            className="p-4 rounded-2xl bg-secondary/30 border border-border/50 hover:border-primary"
                        >
                            <p className="text-muted-foreground uppercase text-[10px] font-bold">
                                Flagged Reviews
                            </p>
                            <p className="text-2xl font-black text-foreground mt-1">
                                {moderation.flaggedReviews || 0}
                            </p>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
