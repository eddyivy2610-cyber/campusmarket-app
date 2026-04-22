"use client";

import { useState, useMemo } from "react";
import {
    Search,
    Calendar,
    ChevronDown,
    CheckCircle2,
    MessageSquareText,
    ChevronLeft,
    ChevronRight,
    Eye,
    Loader2
} from "lucide-react";

import { DashboardOrder, OrderStatus } from "../../data/dashboardOrders";
import { OrderDetailModal } from "./OrderDetailModal";
import { orderService } from "@/lib/orderService";
import { useEffect } from "react";
import { toast } from "sonner";

type FilterKey = "status" | "amount";

export function DashboardOrdersTable() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRows, setSelectedRows] = useState<string[]>([]);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [filters, setFilters] = useState<Record<FilterKey, string | null>>({
        status: null,
        amount: null,
    });
    const [activeFilterColumn, setActiveFilterColumn] = useState<FilterKey | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                const res = await orderService.getSellerOrders();
                if (res.success) {
                    setOrders(res.data);
                }
            } catch (error) {
                console.error("Fetch orders error:", error);
                toast.error("Failed to load orders");
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const STATUS_OPTIONS: OrderStatus[] = [
        "Pending",
        "Active",
        "Completed",
        "Failed",
        "Cancelled",
        "Pending Admin Verification"
    ];
    const AMOUNT_OPTIONS = ["<₦100k", "₦100k - ₦500k", ">₦500k"];

    const filteredOrders = useMemo(() => {
        return orders.filter((order) => {
            const statusFilter = filters.status;
            const amountFilter = filters.amount;

            if (statusFilter && order.status !== statusFilter) return false;

            if (amountFilter) {
                const amount = order.totalAmount || 0;
                if (amountFilter === "<₦100k" && amount >= 100000) return false;
                if (amountFilter === "₦100k - ₦500k" && (amount < 100000 || amount > 500000)) return false;
                if (amountFilter === ">₦500k" && amount <= 500000) return false;
            }

            return true;
        });
    }, [filters, orders]);

    const pageSize = 10;
    const pageOrders = filteredOrders.slice(0, pageSize);
    const totalEntries = filteredOrders.length;
    const showingTo = Math.min(pageSize, totalEntries);

    // Select all handler
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedRows(pageOrders.map(o => o._id));
        } else {
            setSelectedRows([]);
        }
    };

    // Single select handler
    const handleSelectRow = (id: string) => {
        setSelectedRows(prev =>
            prev.includes(id) ? prev.filter(rId => rId !== id) : [...prev, id]
        );
    };

    const toggleFilterMenu = (column: FilterKey) => {
        setActiveFilterColumn((prev) => (prev === column ? null : column));
    };

    const applyFilter = (column: FilterKey, value: string | null) => {
        setFilters((prev) => ({ ...prev, [column]: value }));
        setActiveFilterColumn(null);
    };

    const handleViewDetails = (order: DashboardOrder) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    const handleOrderAction = (orderId: string, action: "confirm" | "fail") => {
        setOrders((prev: any[]) => prev.map((o: any) => {
            if (o._id === orderId) {
                if (action === "confirm") {
                    return { ...o, status: "Pending Admin Verification", sellerConfirmed: true };
                } else {
                    return { ...o, status: "Failed", failureReason: "Marked as failed by seller" };
                }
            }
            return o;
        }));
        // Update selected order view
        setSelectedOrder((prev: any) => prev ? (prev._id === orderId ? { 
            ...prev, 
            status: action === "confirm" ? "Pending Admin Verification" : "Failed",
            sellerConfirmed: action === "confirm" ? true : prev.sellerConfirmed,
            failureReason: action === "fail" ? "Marked as failed by seller" : prev.failureReason
        } : prev) : null);
    };

    const renderFilterMenu = (column: FilterKey, options: string[]) => {
        if (activeFilterColumn !== column) return null;
        return (
            <div className="absolute left-0 top-full mt-1 z-30 w-[180px] rounded-2xl border border-border bg-popover p-2 shadow-2xl normal-case tracking-normal">
                {options.map((option: string) => (
                    <button
                        key={option}
                        onClick={() => applyFilter(column, option)}
                        className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-[11px] font-bold text-foreground/70 hover:bg-secondary transition-all"
                    >
                        {option}
                        {filters[column] === option && <span className="text-primary">●</span>}
                    </button>
                ))}
                <div className="mt-2 h-px bg-border/40" />
                <button
                    onClick={() => applyFilter(column, null)}
                    className="w-full rounded-xl px-3 py-2 text-[11px] font-bold text-foreground/50 hover:bg-secondary/20 transition-all"
                >
                    Clear Filter
                </button>
            </div>
        );
    };

    const getStatusStyles = (status: OrderStatus) => {
        switch (status) {
            case "Completed":
            case "Active":
                return "bg-[#10B981] text-white";
            case "Pending":
            case "Pending Admin Verification":
                return "bg-slate-200 text-slate-500";
            case "Failed":
            case "Cancelled":
                return "bg-red-100 text-red-600";
            default:
                return "bg-secondary text-muted-foreground";
        }
    };
    const getStatusDotClass = (status: OrderStatus) => {
        switch (status) {
            case "Completed":
            case "Active":
                return "bg-emerald-500";
            case "Pending":
            case "Pending Admin Verification":
                return "bg-slate-400";
            case "Failed":
            case "Cancelled":
                return "bg-rose-500";
            default:
                return "bg-muted-foreground/40";
        }
    };

    if (loading) {
        return (
            <div className="w-full bg-white dark:bg-card rounded-[20px] shadow-sm flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Loading Orders...</p>
            </div>
        );
    }

    return (
        <div className="w-full bg-white dark:bg-card rounded-[20px] shadow-sm flex flex-col overflow-hidden">
            <div className="p-4 md:p-5 border-b border-border/40">
                <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold font-heading">Orders</span>
                    <button
                        className="h-9 w-9 rounded-full border border-border/60 bg-secondary/40 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                        aria-label="Search orders"
                    >
                        <Search className="w-4 h-4" />
                    </button>
                </div>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 md:hidden">
                    <select
                        value={filters.status ?? ""}
                        onChange={(e) => applyFilter("status", e.target.value || null)}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[12px] font-semibold text-foreground/70"
                    >
                        <option value="">Status</option>
                        {STATUS_OPTIONS.map((option) => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                    <select
                        value={filters.amount ?? ""}
                        onChange={(e) => applyFilter("amount", e.target.value || null)}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[12px] font-semibold text-foreground/70"
                    >
                        <option value="">Amount</option>
                        {AMOUNT_OPTIONS.map((option) => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="md:hidden px-4 pt-4 pb-2 space-y-3">
                {pageOrders.map((order: any) => {
                    const isOpen = expandedId === order.id;
                    return (
                        <div key={order.id} className="rounded-2xl border border-border/60 bg-background/70 shadow-sm overflow-hidden">
                            <button
                                onClick={() => setExpandedId(isOpen ? null : order._id)}
                                className="w-full flex items-center justify-between gap-3 px-4 py-3"
                            >
                                <div className="min-w-0 text-left">
                                    <p className="text-sm font-semibold text-foreground truncate">{order.items?.[0]?.title || "Generic Product"}</p>
                                    <p className="text-[11px] text-muted-foreground">{order.buyerId?.profile?.displayName || "Guest"}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`w-2.5 h-2.5 rounded-full ${getStatusDotClass(order.status as OrderStatus)}`} aria-hidden />
                                    <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
                                </div>
                            </button>
                            {isOpen && (
                                <div className="px-4 pb-3">
                                    <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
                                            <div>
                                                <p className="uppercase tracking-widest text-[9px]">Order ID</p>
                                                <p className="font-semibold text-foreground/80">{order.orderId}</p>
                                            </div>
                                            <div>
                                                <p className="uppercase tracking-widest text-[9px]">Amount</p>
                                                <p className="font-semibold text-foreground/80">₦{order.totalAmount.toLocaleString()}</p>
                                            </div>
                                            <div>
                                                <p className="uppercase tracking-widest text-[9px]">Date</p>
                                                <p className="font-semibold text-foreground/80">{new Date(order.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        <div>
                                            <p className="uppercase tracking-widest text-[9px]">Status</p>
                                            <p className="font-semibold text-foreground/80">{order.status}</p>
                                        </div>
                                    </div>
                                    <div className="mt-3">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleViewDetails(order); }}
                                            className="w-full rounded-lg border border-border/60 px-3 py-2 text-[11px] font-semibold text-muted-foreground hover:bg-secondary"
                                        >
                                            Details
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="w-full overflow-x-auto custom-scrollbar pt-4 pb-2 hidden md:block" data-lenis-prevent>
                <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                        <tr className="border-b border-border/50 text-[13px] font-semibold text-muted-foreground/70 tracking-wide">
                            <th className="pb-4 font-medium pl-4 md:pl-6 w-12">
                                <div className="flex items-center">
                                        <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/20 bg-blue-50/50 cursor-pointer"
                                        checked={selectedRows.length === pageOrders.length && pageOrders.length > 0}
                                        onChange={handleSelectAll}
                                    />
                                </div>
                            </th>
                            <th className="pb-4 font-medium w-[15%]">Order ID</th>
                            <th className="pb-4 font-medium w-[20%]">Customer</th>
                            <th className="pb-4 font-medium w-[20%]">Product Name</th>
                            <th className="pb-4 font-medium w-[10%]">Date</th>
                            <th className="pb-4 font-medium w-[10%] relative">
                                <div className="inline-flex cursor-pointer items-center gap-1 group/filter hover:text-foreground transition-colors" onClick={() => toggleFilterMenu("amount")}>
                                    <span>Amount</span>
                                    <ChevronDown className="w-3.5 h-3.5 opacity-40 group-hover/filter:opacity-100 transition-opacity" />
                                </div>
                                {renderFilterMenu("amount", AMOUNT_OPTIONS)}
                            </th>
                            <th className="pb-4 font-medium w-[15%] relative">
                                <div className="inline-flex cursor-pointer items-center gap-1 group/filter hover:text-foreground transition-colors" onClick={() => toggleFilterMenu("status")}>
                                    <span>Status</span>
                                    <ChevronDown className="w-3.5 h-3.5 opacity-40 group-hover/filter:opacity-100 transition-opacity" />
                                </div>
                                {renderFilterMenu("status", STATUS_OPTIONS)}
                            </th>
                            <th className="pb-4 text-center font-medium pr-4 md:pr-6 w-[10%]">Options</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {pageOrders.map((order: any) => (
                            <tr key={order._id} className="border-b border-border/40 hover:bg-secondary/20 transition-colors group cursor-pointer" onClick={() => handleViewDetails(order)}>
                                <td className="py-3 pl-4 md:pl-6" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/20 bg-blue-50/50 cursor-pointer"
                                            checked={selectedRows.includes(order._id)}
                                            onChange={() => handleSelectRow(order._id)}
                                        />
                                    </div>
                                </td>
                                <td className="py-3 font-medium text-foreground/80">{order.orderId}</td>
                                <td className="py-3 font-medium text-foreground">{order.buyerId?.profile?.displayName || "Guest"}</td>
                                <td className="py-3 font-medium text-foreground/80">{order.items?.[0]?.title || "Generic Product"}</td>
                                <td className="py-3 font-medium text-foreground/80">{new Date(order.createdAt).toLocaleDateString()}</td>
                                <td className="py-3 font-medium text-foreground/80">₦{order.totalAmount.toLocaleString()}</td>
                                <td className="py-3">
                                    <span className={`px-4 py-1.5 text-[12px] font-medium rounded-md whitespace-nowrap ${getStatusStyles(order.status as OrderStatus)}`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td className="py-3 text-center relative pr-4 md:pr-6">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleViewDetails(order); }}
                                        className="text-[13px] font-medium text-foreground/80 hover:text-foreground transition-colors hover:bg-secondary/50 px-3 py-1.5 rounded-lg whitespace-nowrap"
                                    >
                                        Details
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="p-4 md:p-6 border-t border-border/40 flex flex-col md:flex-row items-center justify-between gap-4">
                <span className="text-[13px] font-medium text-muted-foreground order-2 md:order-1">Showing 1 to {showingTo} of {totalEntries} entries</span>
                <div className="flex flex-wrap items-center justify-center gap-1.5 order-1 md:order-2">
                    <button className="px-3 py-1.5 rounded-lg border border-border/50 bg-card text-xs font-semibold text-muted-foreground hover:bg-secondary transition-all">Prev</button>
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold bg-primary text-primary-foreground border-primary shadow-sm">1</button>
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-border/50 bg-card text-xs font-semibold text-muted-foreground hover:bg-secondary transition-all">2</button>
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-border/50 bg-card text-xs font-semibold text-muted-foreground hover:bg-secondary transition-all">3</button>
                    <span className="px-1 text-xs font-semibold text-muted-foreground">...</span>
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-border/50 bg-card text-xs font-semibold text-muted-foreground hover:bg-secondary transition-all">10</button>
                    <button className="px-3 py-1.5 rounded-lg border border-border/50 bg-card text-xs font-semibold text-muted-foreground hover:bg-secondary transition-all">Next</button>
                </div>
            </div>

            <OrderDetailModal 
                order={selectedOrder} 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onAction={handleOrderAction}
            />
        </div>
    );
}
