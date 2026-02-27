"use client";

import { useState } from "react";
import {
    Search,
    Calendar,
    ChevronDown,
    Eye,
    Edit,
    Trash2,
    ChevronLeft,
    ChevronRight
} from "lucide-react";

// Mock data extending standard order with dashboard fields
const DASHBOARD_ORDERS = [
    { id: "#ORD-1024", customer: "John Doe", productName: "Macbook Pro 15'", date: "12/1/2026", qty: 3, amount: 400000, status: "Pending" },
    { id: "#ORD-1023", customer: "Kabir Shing", productName: "iPhone 13 Mini", date: "12/1/2026", qty: 6, amount: 700000, status: "Processing" },
    { id: "#ORD-1044", customer: "Nazmul Basu", productName: "AirPods 2", date: "12/1/2026", qty: 2, amount: 250000, status: "Delivered" },
];

export function DashboardOrdersTable() {
    const [selectedRows, setSelectedRows] = useState<string[]>([]);

    // Select all handler
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedRows(DASHBOARD_ORDERS.map(o => o.id));
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

    const getStatusStyles = (status: string) => {
        switch (status) {
            case "Delivered": return "bg-emerald-500/10 text-emerald-500";
            case "Processing": return "bg-amber-500/10 text-amber-500";
            case "Pending": return "bg-orange-500/10 text-orange-500";
            default: return "bg-secondary text-muted-foreground";
        }
    };

    return (
        <div className="w-full flex-1 min-h-[600px] flex flex-col overflow-hidden">
            {/* Header Controls */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8">
                <div>
                    <h2 className="text-sm font-bold font-heading">Recent Orders</h2>
                </div>

                <div className="w-full lg:w-auto flex flex-col sm:flex-row items-center gap-3">
                    {/* Search */}
                    <div className="w-full sm:w-auto relative flex items-center">
                        <Search className="w-4 h-4 text-muted-foreground absolute left-3" />
                        <input
                            type="text"
                            placeholder="Search"
                            className="w-full sm:w-64 bg-secondary/50 border border-transparent focus:border-primary/30 focus:bg-background outline-none rounded-full py-2.5 pl-9 pr-4 text-xs font-medium transition-all"
                        />
                    </div>

                    <div className="w-full sm:w-auto flex items-center gap-3">
                        <button className="flex-1 sm:flex-none flex items-center justify-between sm:justify-center gap-2 px-4 py-2.5 rounded-full border border-border text-xs font-bold text-muted-foreground hover:bg-secondary transition-colors">
                            Date Range
                            <Calendar className="w-3.5 h-3.5 ml-1" />
                        </button>
                        <button className="flex-1 sm:flex-none flex items-center justify-between sm:justify-center gap-2 px-4 py-2.5 rounded-full border border-border text-xs font-bold text-muted-foreground hover:bg-secondary transition-colors">
                            All Status
                            <ChevronDown className="w-3.5 h-3.5 ml-1" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Table Area */}
            <div className="w-full flex-1 overflow-auto custom-scrollbar pr-2 pb-4" data-lenis-prevent>
                <table className="w-full text-left border-collapse min-w-[1000px]">
                    <thead>
                        <tr className="border-b border-border/30">
                            <th className="pb-4 w-12 pl-2">
                                <div className="flex items-center justify-center">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded border-border/50 text-primary focus:ring-primary/20 accent-primary cursor-pointer"
                                        checked={selectedRows.length === DASHBOARD_ORDERS.length && DASHBOARD_ORDERS.length > 0}
                                        onChange={handleSelectAll}
                                    />
                                </div>
                            </th>
                            <th className="pb-4 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Order ID</th>
                            <th className="pb-4 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Customer</th>
                            <th className="pb-4 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Product Name</th>
                            <th className="pb-4 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Date</th>
                            <th className="pb-4 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Quantity</th>
                            <th className="pb-4 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Amount</th>
                            <th className="pb-4 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Status</th>
                            <th className="pb-4 text-[11px] font-bold text-muted-foreground uppercase tracking-wider text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody className="text-xs">
                        {DASHBOARD_ORDERS.map((order) => (
                            <tr key={order.id} className="border-b border-border/10 hover:bg-secondary/20 transition-colors group">
                                <td className="py-2.5 pl-2">
                                    <div className="flex items-center justify-center">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 rounded border-border/50 text-primary focus:ring-primary/20 accent-primary cursor-pointer"
                                            checked={selectedRows.includes(order.id)}
                                            onChange={() => handleSelectRow(order.id)}
                                        />
                                    </div>
                                </td>
                                <td className="py-2.5 text-xs font-bold text-muted-foreground group-hover:text-foreground transition-colors">{order.id}</td>
                                <td className="py-4 font-bold text-sm text-foreground">{order.customer}</td>
                                <td className="py-4 font-bold text-sm text-foreground">{order.productName}</td>
                                <td className="py-4 text-xs font-medium text-muted-foreground whitespace-nowrap">{order.date}</td>
                                <td className="py-4 text-sm font-medium text-muted-foreground">{order.qty}</td>
                                <td className="py-4 text-sm font-bold text-foreground">
                                    ₦{(order.amount / 1000)}k
                                </td>
                                <td className="py-4">
                                    <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-xl whitespace-nowrap ${getStatusStyles(order.status)}`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td className="py-4">
                                    <div className="flex items-center justify-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                                        <button className="w-7 h-7 flex items-center justify-center rounded-md bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-colors" title="View">
                                            <Eye className="w-3.5 h-3.5" />
                                        </button>
                                        <button className="w-7 h-7 flex items-center justify-center rounded-md bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 transition-colors" title="Edit">
                                            <Edit className="w-3.5 h-3.5" />
                                        </button>
                                        <button className="w-7 h-7 flex items-center justify-center rounded-md bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors" title="Delete">
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Layer bottom */}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/30 pt-6">
                <div className="flex items-center gap-2">
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:bg-secondary transition-colors">
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold bg-indigo-500 text-white shadow-sm shadow-indigo-500/20">1</button>
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold text-muted-foreground hover:bg-secondary transition-colors">2</button>
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold text-muted-foreground hover:bg-secondary transition-colors">3</button>
                    <span className="px-1 text-muted-foreground text-xs font-bold">...</span>
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold text-muted-foreground hover:bg-secondary transition-colors">10</button>
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:bg-secondary transition-colors">
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
                    <span>Showing 1 to 10 of 50 entries</span>
                    <button className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg border border-border hover:bg-secondary transition-colors min-w-[90px]">
                        Show 10
                        <ChevronDown className="w-3 h-3" />
                    </button>
                </div>
            </div>
        </div>
    );
}
