"use client";

import React, { useEffect, useState } from "react";
import {
    MessageSquareWarning,
    CheckCircle2,
    XCircle,
    RefreshCw,
    Loader2,
    ShieldAlert,
    Clock,
} from "lucide-react";
import { orderService } from "@/lib/orderService";

export default function DisputeCenterPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterMode, setFilterMode] = useState<"disputed" | "all">("disputed");
    const [resolutionReason, setResolutionReason] = useState<Record<string, string>>({});
    const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

    const fetchDisputedOrders = async () => {
        try {
            setIsLoading(true);
            const res = await orderService.getAllOrdersAdmin();
            if (res?.success && Array.isArray(res.data)) {
                setOrders(res.data);
            } else {
                setOrders([]);
            }
        } catch (err) {
            console.error("Failed to load disputed orders:", err);
            setOrders([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDisputedOrders();
    }, []);

    const visibleOrders = orders.filter((o) =>
        filterMode === "disputed" ? o.status === "disputed" : true
    );

    const handleArbitrate = async (
        order: any,
        decision: "delivered" | "cancelled"
    ) => {
        const orderKey = String(order._id || order.orderId);
        const reason =
            (resolutionReason[orderKey] || "").trim() ||
            (decision === "delivered"
                ? "Dispute resolved by administrator in favor of fulfillment."
                : "Dispute resolved by administrator in favor of buyer cancellation.");

        try {
            const res = await orderService.updateOrderStatus(orderKey, decision, reason);
            if (res?.success) {
                setFeedbackMsg(
                    `Order #${order.orderId || orderKey.slice(-6)} transitioned to "${decision}".`
                );
                fetchDisputedOrders();
                setTimeout(() => setFeedbackMsg(null), 4000);
            } else {
                alert(res?.error || "Failed to arbitrate dispute.");
            }
        } catch (err: any) {
            alert(err?.message || "Failed to arbitrate dispute.");
        }
    };

    return (
        <div className="space-y-6 pb-12 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-6 rounded-3xl border border-border/60 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 border border-rose-500/20">
                        <MessageSquareWarning size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl md:text-2xl font-black text-foreground tracking-tight">
                            Dispute Resolution & Arbitration Center
                        </h1>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Investigate disputed campus orders, review status timelines, and issue binding administrative resolutions.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setFilterMode("disputed")}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                            filterMode === "disputed"
                                ? "bg-rose-500 text-white"
                                : "bg-secondary text-muted-foreground"
                        }`}
                    >
                        Active Disputes ({orders.filter((o) => o.status === "disputed").length})
                    </button>
                    <button
                        onClick={() => setFilterMode("all")}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                            filterMode === "all"
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary text-muted-foreground"
                        }`}
                    >
                        All Orders ({orders.length})
                    </button>
                    <button
                        onClick={fetchDisputedOrders}
                        className="p-2.5 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground"
                        title="Refresh"
                    >
                        <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                    </button>
                </div>
            </div>

            {feedbackMsg && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    {feedbackMsg}
                </div>
            )}

            {isLoading ? (
                <div className="py-20 flex flex-col items-center justify-center text-muted-foreground">
                    <Loader2 className="w-8 h-8 animate-spin text-rose-500 mb-2" />
                    <p className="text-xs font-bold uppercase tracking-wider">Loading dispute cases...</p>
                </div>
            ) : visibleOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[45vh] text-center space-y-3 bg-card rounded-3xl border border-border/50 p-10">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                        <CheckCircle2 size={28} />
                    </div>
                    <h2 className="text-lg font-bold text-foreground">Zero Active Order Disputes</h2>
                    <p className="text-xs text-muted-foreground max-w-sm">
                        There are currently no orders in disputed status requiring administrative arbitration.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {visibleOrders.map((o) => {
                        const key = String(o._id || o.orderId);
                        const itemTitle =
                            o.items?.[0]?.title || o.productName || "Marketplace Order";
                        const buyerName =
                            o.buyer?.displayName ||
                            o.buyerId?.fullName ||
                            o.buyerId?.name ||
                            o.buyerId?.email ||
                            "Buyer";
                        const storeName =
                            o.store?.storeName ||
                            o.storeId?.storeName ||
                            o.sellerId?.name ||
                            "Store";

                        return (
                            <div
                                key={key}
                                className="p-6 rounded-3xl bg-card border border-border/60 shadow-sm space-y-4"
                            >
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-4">
                                    <div>
                                        <div className="flex items-center gap-2.5">
                                            <span className="text-sm font-black text-foreground">
                                                #{o.orderId || key.slice(-8)}
                                            </span>
                                            <span
                                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                                    o.status === "disputed"
                                                        ? "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                                                        : "bg-secondary text-muted-foreground"
                                                }`}
                                            >
                                                {o.status}
                                            </span>
                                            <span className="text-xs font-bold text-primary">
                                                ₦{Number(o.totalAmount || 0).toLocaleString()}
                                            </span>
                                        </div>
                                        <p className="text-xs font-semibold text-foreground/80 mt-1">
                                            {itemTitle} • Buyer: <strong>{buyerName}</strong> • Store:{" "}
                                            <strong>{storeName}</strong>
                                        </p>
                                    </div>

                                    <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5" />
                                        Created{" "}
                                        {o.createdAt
                                            ? new Date(o.createdAt).toLocaleString()
                                            : "Recently"}
                                    </div>
                                </div>

                                {Array.isArray(o.history) && o.history.length > 0 && (
                                    <div className="space-y-1.5">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                            Order Status Audit Timeline
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {o.history.map((h: any, idx: number) => (
                                                <div
                                                    key={idx}
                                                    className="px-3 py-1.5 rounded-xl bg-secondary/40 border border-border/50 text-[11px]"
                                                >
                                                    <span className="font-bold uppercase">{h.status}</span>
                                                    {h.comment && (
                                                        <span className="text-muted-foreground">
                                                            {" "}
                                                            — {h.comment}
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {(o.status === "disputed" ||
                                    o.status === "pending" ||
                                    o.status === "confirmed") && (
                                    <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                        <input
                                            type="text"
                                            value={resolutionReason[key] || ""}
                                            onChange={(e) =>
                                                setResolutionReason((prev) => ({
                                                    ...prev,
                                                    [key]: e.target.value,
                                                }))
                                            }
                                            placeholder="Enter official arbitration decision note (recorded in audit history)..."
                                            className="flex-1 h-10 px-3.5 rounded-xl bg-background border border-border text-xs font-medium outline-none"
                                        />
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleArbitrate(o, "delivered")}
                                                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5"
                                            >
                                                <CheckCircle2 className="w-4 h-4" />
                                                Resolve: Mark Delivered
                                            </button>
                                            <button
                                                onClick={() => handleArbitrate(o, "cancelled")}
                                                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5"
                                            >
                                                <XCircle className="w-4 h-4" />
                                                Resolve: Cancel Order
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
