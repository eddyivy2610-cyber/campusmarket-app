"use client";

import { useState } from "react";
import { 
    CheckCircle2, 
    XCircle, 
    ShieldCheck, 
    ExternalLink, 
    Filter, 
    Search,
    ChevronLeft,
    ChevronRight,
    MoreVertical,
    Clock,
    AlertCircle
} from "lucide-react";
import { DASHBOARD_ORDERS, DashboardOrder } from "../../data/dashboardOrders";
import Link from "next/link";

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<DashboardOrder[]>(
        DASHBOARD_ORDERS.filter(o => o.status === "Pending Admin Verification")
    );

    const handleVerify = (orderId: string) => {
        setOrders(prev => prev.filter(o => o.id !== orderId));
        // @BACKEND: PATCH /api/orders/:id { status: 'Completed', adminVerified: true }
        console.log(`[ADMIN LOGIC] Order ${orderId} verified and completed.`);
    };

    const handleReject = (orderId: string) => {
        setOrders(prev => prev.filter(o => o.id !== orderId));
        // @BACKEND: PATCH /api/orders/:id { status: 'Failed', failureReason: 'Rejected by admin' }
        console.log(`[ADMIN LOGIC] Order ${orderId} rejected.`);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold tracking-tight mb-1">Order Verification</h1>
                    <p className="text-muted-foreground font-medium uppercase tracking-widest text-[8px]">Review and verify pending transactions</p>
                </div>
                
                <div className="flex items-center gap-2">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input 
                            type="text" 
                            placeholder="Search orders..." 
                            className="bg-card border border-border/50 rounded-xl pl-9 pr-4 py-2 text-[11px] font-medium focus:outline-none focus:ring-1 focus:ring-primary/20 w-full sm:w-64 transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Verification Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="bg-card border border-border/50 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Pending Approval</p>
                        <p className="text-xl font-bold">{orders.length}</p>
                    </div>
                </div>
                <div className="bg-card border border-border/50 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Verified Today</p>
                        <p className="text-xl font-bold">12</p>
                    </div>
                </div>
                <div className="bg-card border border-border/50 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
                        <AlertCircle className="w-5 h-5 text-rose-600" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Disputed / Flags</p>
                        <p className="text-xl font-bold">3</p>
                    </div>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-card border border-border/50 rounded-[28px] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-secondary/5 border-b border-border/50 font-bold text-[10px] uppercase tracking-widest text-muted-foreground">
                                <th className="px-6 py-4">Order Info</th>
                                <th className="px-6 py-4">Marketplace Transaction</th>
                                <th className="px-6 py-4">Verification Evidence</th>
                                <th className="px-6 py-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                            {orders.length > 0 ? (
                                orders.map((order) => (
                                    <tr key={order.id} className="group hover:bg-secondary/5 transition-colors">
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-xs font-bold text-foreground">Order {order.id}</span>
                                                <span className="text-[10px] font-medium text-muted-foreground">{order.date}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-sm font-bold text-foreground">{order.productName}</span>
                                                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                                                    <span className="text-primary">{order.customer}</span>
                                                    <span className="text-muted-foreground">→</span>
                                                    <span className="text-primary">Seller</span>
                                                </div>
                                                <div className="text-xs font-bold mt-1">₦{order.amount.toLocaleString()}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                                                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                                                    <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-600">Rating Left</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                                                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                                                    <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-600">Seller Confirmed</span>
                                                </div>
                                                <button className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-primary hover:underline">
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                    Chat Log
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center justify-center gap-2">
                                                <button 
                                                    onClick={() => handleVerify(order.id)}
                                                    className="px-4 py-2 rounded-xl bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-500/20 transition-all flex items-center gap-2"
                                                >
                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                    Verify
                                                </button>
                                                <button 
                                                    onClick={() => handleReject(order.id)}
                                                    className="px-4 py-2 rounded-xl bg-card border border-border/50 text-rose-500 text-[10px] font-bold uppercase tracking-widest hover:bg-rose-500/5 transition-all flex items-center gap-2"
                                                >
                                                    <XCircle className="w-3.5 h-3.5" />
                                                    Reject
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground italic text-sm">
                                        No orders currently awaiting verification.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Table Footer / Pagination */}
                <div className="px-6 py-4 bg-secondary/5 border-t border-border/50 flex items-center justify-between">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        Showing {orders.length} pending verifications
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-2 rounded-lg border border-border/50 bg-card hover:bg-secondary/5 transition-colors disabled:opacity-30" disabled>
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button className="w-8 h-8 rounded-lg bg-primary text-white text-[10px] font-bold">1</button>
                        <button className="p-2 rounded-lg border border-border/50 bg-card hover:bg-secondary/5 transition-colors disabled:opacity-30" disabled>
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
