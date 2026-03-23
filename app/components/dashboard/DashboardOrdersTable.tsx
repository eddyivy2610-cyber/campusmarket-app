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
    Eye
} from "lucide-react";

import { DASHBOARD_ORDERS, DashboardOrder, OrderStatus } from "../../data/dashboardOrders";
import { OrderDetailModal } from "./OrderDetailModal";

type FilterKey = "status" | "amount";

export function DashboardOrdersTable() {
    const [orders, setOrders] = useState<DashboardOrder[]>(DASHBOARD_ORDERS);
    const [selectedRows, setSelectedRows] = useState<string[]>([]);
    const [filters, setFilters] = useState<Record<FilterKey, string | null>>({
        status: null,
        amount: null,
    });
    const [activeFilterColumn, setActiveFilterColumn] = useState<FilterKey | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<DashboardOrder | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

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
                if (amountFilter === "<₦100k" && order.amount >= 100000) return false;
                if (amountFilter === "₦100k - ₦500k" && (order.amount < 100000 || order.amount > 500000)) return false;
                if (amountFilter === ">₦500k" && order.amount <= 500000) return false;
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
            setSelectedRows(pageOrders.map(o => o.id));
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
        setOrders(prev => prev.map(o => {
            if (o.id === orderId) {
                if (action === "confirm") {
                    return { ...o, status: "Pending Admin Verification", sellerConfirmed: true };
                } else {
                    return { ...o, status: "Failed", failureReason: "Marked as failed by seller" };
                }
            }
            return o;
        }));
        // Update selected order view
        setSelectedOrder(prev => prev ? (prev.id === orderId ? { 
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
                {options.map((option) => (
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

    return (
        <div className="w-full bg-white dark:bg-card rounded-[20px] shadow-sm flex flex-col overflow-hidden">
            <div className="w-full overflow-x-auto custom-scrollbar pt-4 pb-2" data-lenis-prevent>
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
                        {pageOrders.map((order) => (
                            <tr key={order.id} className="border-b border-border/40 hover:bg-secondary/20 transition-colors group cursor-pointer" onClick={() => handleViewDetails(order)}>
                                <td className="py-3 pl-4 md:pl-6" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/20 bg-blue-50/50 cursor-pointer"
                                            checked={selectedRows.includes(order.id)}
                                            onChange={() => handleSelectRow(order.id)}
                                        />
                                    </div>
                                </td>
                                <td className="py-3 font-medium text-foreground/80">{order.id}</td>
                                <td className="py-3 font-medium text-foreground">{order.customer}</td>
                                <td className="py-3 font-medium text-foreground/80">{order.productName}</td>
                                <td className="py-3 font-medium text-foreground/80">{order.date}</td>
                                <td className="py-3 font-medium text-foreground/80">₦{(order.amount / 1000).toFixed(0)}k</td>
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
