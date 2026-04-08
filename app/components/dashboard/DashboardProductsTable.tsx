"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
    Plus,
    MoreHorizontal,
    Edit,
    Trash2,
    EyeOff,
    Share2,
    ChevronDown,
    Search,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { EditListingModal } from "./EditListingModal";

type FilterKey = "status" | "price" | "stock" | "orders";

export interface DashboardProductRow {
    id: string;
    name: string;
    status: string;
    category: string;
    price: number;
    dateListed: string;
    review: number;
    sold: number;
    profit: number;
    image: string;
    messages: number;
    views: number;
    offers: number;
    orders: number;
}

const DASHBOARD_PRODUCTS: DashboardProductRow[] = [
    {
        id: "39842-231",
        name: "Macbook Pro 15'",
        status: "Available",
        category: "Electronics",
        price: 2999000,
        dateListed: "20 Jan, 2022",
        review: 4.8,
        sold: 145,
        profit: 434855,
        image: "",
        messages: 8,
        views: 124,
        offers: 6,
        orders: 4,
    },
    {
        id: "39842-232",
        name: "Macbook Pro 13'",
        status: "In Review",
        category: "Electronics",
        price: 999000,
        dateListed: "22 Feb, 2022",
        review: 0.0,
        sold: 0,
        profit: 0,
        image: "",
        messages: 3,
        views: 92,
        offers: 1,
        orders: 0,
    },
    {
        id: "39842-233",
        name: "iPhone 13 Mini",
        status: "Sold Out",
        category: "Electronics",
        price: 450000,
        dateListed: "22 Feb, 2022",
        review: 4.5,
        sold: 320,
        profit: 144000,
        image: "",
        messages: 5,
        views: 98,
        offers: 2,
        orders: 2,
    },
    {
        id: "39842-234",
        name: "iPhone 14",
        status: "Preorder",
        category: "Electronics",
        price: 850000,
        dateListed: "22 Feb, 2022",
        review: 4.9,
        sold: 10,
        profit: 8500,
        image: "",
        messages: 6,
        views: 80,
        offers: 1,
        orders: 1,
    },
    {
        id: "39842-235",
        name: "AirPods 2",
        status: "Available",
        category: "Electronics",
        price: 150000,
        dateListed: "22 Feb, 2022",
        review: 4.2,
        sold: 450,
        profit: 67500,
        image: "",
        messages: 4,
        views: 76,
        offers: 5,
        orders: 6,
    },
];

const getStatusText = (status: string) => {
    switch (status) {
        case "Available":
            return "Active";
        case "In Review":
        case "Preorder":
            return "Pending";
        default:
            return status;
    }
};

export function DashboardProductsTable() {
    const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [editingListing, setEditingListing] = useState<DashboardProductRow | null>(null);
    const [filters, setFilters] = useState<Record<FilterKey, string | null>>({
        status: null,
        price: null,
        stock: null,
        orders: null,
    });
    const [activeFilterColumn, setActiveFilterColumn] = useState<FilterKey | null>(null);

    const STATUS_OPTIONS = useMemo(() => Array.from(new Set(DASHBOARD_PRODUCTS.map((p) => getStatusText(p.status)))), []);
    const PRICE_OPTIONS = ["<₦1.0M", "₦1.0M - ₦3.0M", ">₦3.0M"];
    const STOCK_OPTIONS = ["<50", "50-100", ">100"];
    const ORDERS_OPTIONS = ["<50", "50-100", ">100"];

    const filteredProducts = useMemo(() => {
        return DASHBOARD_PRODUCTS.filter((product) => {
            if (filters.status && getStatusText(product.status) !== filters.status) return false;

            if (filters.price) {
                if (filters.price === "<₦1.0M" && product.price >= 1000000) return false;
                if (filters.price === "₦1.0M - ₦3.0M" && (product.price < 1000000 || product.price > 3000000)) return false;
                if (filters.price === ">₦3.0M" && product.price <= 3000000) return false;
            }

            if (filters.stock) {
                if (filters.stock === "<50" && product.views >= 50) return false;
                if (filters.stock === "50-100" && (product.views < 50 || product.views > 100)) return false;
                if (filters.stock === ">100" && product.views <= 100) return false;
            }

            if (filters.orders) {
                const total = product.orders + product.views;
                if (filters.orders === "<50" && total >= 50) return false;
                if (filters.orders === "50-100" && (total < 50 || total > 100)) return false;
                if (filters.orders === ">100" && total <= 100) return false;
            }

            return true;
        });
    }, [filters]);

    const getStatusStyles = (status: string) => {
        switch (status) {
            case "Available":
                return "bg-[#10B981] text-white"; // Green Active
            case "In Review":
            case "Preorder":
                return "bg-slate-200 text-slate-500"; // Grayish Pending
            case "Sold Out":
                return "bg-red-100 text-red-600";
            default:
                return "bg-secondary text-muted-foreground";
        }
    };
    const getStatusDotClass = (status: string) => {
        switch (status) {
            case "Available":
                return "bg-emerald-500";
            case "In Review":
            case "Preorder":
                return "bg-slate-400";
            case "Sold Out":
                return "bg-rose-500";
            default:
                return "bg-muted-foreground/40";
        }
    };

    const toggleFilterMenu = (column: FilterKey) => {
        setActiveFilterColumn((prev) => (prev === column ? null : column));
    };

    const applyFilter = (column: FilterKey, value: string | null) => {
        setFilters((prev) => ({ ...prev, [column]: value }));
        setActiveFilterColumn(null);
    };

    const renderFilterMenu = (column: FilterKey, options: string[]) => {
        if (activeFilterColumn !== column) return null;
        return (
            <div className="absolute left-0 top-full mt-1 z-30 w-[180px] rounded-2xl border border-border bg-popover p-2 shadow-xl normal-case tracking-normal">
                {options.map((option) => (
                    <button
                        key={option}
                        onClick={() => applyFilter(column, option)}
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-[12px] font-medium text-foreground/80 hover:bg-secondary hover:text-foreground transition-all"
                    >
                        {option}
                        {filters[column] === option && <span className="text-primary">●</span>}
                    </button>
                ))}
                <div className="mt-1 h-px bg-border/40" />
                <button
                    onClick={() => applyFilter(column, null)}
                    className="w-full mt-1 rounded-lg px-3 py-2 text-[12px] font-medium text-foreground/50 hover:bg-secondary/20 transition-all text-left"
                >
                    Clear Filter
                </button>
            </div>
        );
    };

    const toggleDropdown = (id: string) => {
        if (openDropdownId === id) setOpenDropdownId(null);
        else setOpenDropdownId(id);
    };

    return (
        <div className="w-full bg-white dark:bg-card rounded-[20px] shadow-sm flex flex-col overflow-hidden">
            <div className="p-4 md:p-5 border-b border-border/40">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold font-heading">Products</span>
                    </div>
                    <button
                        className="h-9 w-9 rounded-full border border-border/60 bg-secondary/40 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                        aria-label="Search products"
                    >
                        <Search className="w-4 h-4" />
                    </button>
                </div>
                <div className="mt-3 flex items-center justify-between gap-2">
                    <Link
                        href="/dashboard/products/add"
                        className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold px-4 py-2 md:px-5 md:py-2.5 rounded-xl hover:bg-primary/90 transition-all text-sm shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        <span className="hidden sm:inline">Add Listing</span>
                        <span className="sm:hidden">Create New</span>
                    </Link>
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
                        value={filters.price ?? ""}
                        onChange={(e) => applyFilter("price", e.target.value || null)}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[12px] font-semibold text-foreground/70"
                    >
                        <option value="">Price</option>
                        {PRICE_OPTIONS.map((option) => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="md:hidden px-4 pt-4 pb-2 space-y-3">
                {filteredProducts.map((prod) => {
                    const isOpen = expandedId === prod.id;
                    return (
                        <div key={prod.id} className="rounded-2xl border border-border/60 bg-background/70 shadow-sm overflow-hidden">
                            <button
                                onClick={() => setExpandedId(isOpen ? null : prod.id)}
                                className="w-full flex items-center justify-between gap-3 px-4 py-3"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-9 h-9 rounded-xl overflow-hidden border border-border/40 bg-secondary/50 shrink-0">
                                        <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="min-w-0 text-left">
                                        <p className="text-sm font-semibold text-foreground truncate">{prod.name}</p>
                                        <p className="text-[11px] text-muted-foreground">â‚¦{(prod.price / 1000).toFixed(0)}k</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`w-2.5 h-2.5 rounded-full ${getStatusDotClass(prod.status)}`} aria-hidden />
                                    <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
                                </div>
                            </button>
                            <AnimatePresence>
                                {isOpen && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="px-4 pb-3"
                                    >
                                        <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
                                            <div>
                                                <p className="uppercase tracking-widest text-[9px]">Tracking</p>
                                                <p className="font-semibold text-foreground/80">#{prod.id.split("-")[1] || prod.id}</p>
                                            </div>
                                            <div>
                                                <p className="uppercase tracking-widest text-[9px]">In Stock</p>
                                                <p className="font-semibold text-foreground/80">{prod.views}</p>
                                            </div>
                                            <div>
                                                <p className="uppercase tracking-widest text-[9px]">Total Order</p>
                                                <p className="font-semibold text-foreground/80">{prod.orders + prod.views}</p>
                                            </div>
                                            <div>
                                                <p className="uppercase tracking-widest text-[9px]">Category</p>
                                                <p className="font-semibold text-foreground/80">{prod.category}</p>
                                            </div>
                                        </div>
                                        <div className="mt-3 flex items-center gap-2">
                                            <button
                                                onClick={() => toggleDropdown(prod.id)}
                                                className="flex-1 rounded-lg border border-border/60 px-3 py-2 text-[11px] font-semibold text-muted-foreground hover:bg-secondary"
                                            >
                                                Details
                                            </button>
                                        </div>
                                        <AnimatePresence>
                                            {openDropdownId === prod.id && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 6 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: 6 }}
                                                    transition={{ duration: 0.18, ease: "easeOut" }}
                                                    className="mt-2 w-full bg-popover border border-border rounded-xl shadow-xl z-50 py-1.5 text-left flex flex-col gap-0.5 px-1"
                                                >
                                                    <button className="flex items-center gap-2.5 px-3 py-2 text-[12px] font-medium text-foreground/80 hover:bg-secondary hover:text-foreground rounded-lg transition-all">
                                                        <Share2 className="w-3.5 h-3.5" />
                                                        Share
                                                    </button>
                                                    <button
                                                        className="flex items-center gap-2.5 px-3 py-2 text-[12px] font-medium text-foreground/80 hover:bg-secondary hover:text-foreground rounded-lg transition-all"
                                                        onClick={() => {
                                                            setEditingListing(prod);
                                                            setOpenDropdownId(null);
                                                        }}
                                                    >
                                                        <Edit className="w-3.5 h-3.5" />
                                                        Edit Content
                                                    </button>
                                                    <button className="flex items-center gap-2.5 px-3 py-2 text-[12px] font-medium text-foreground/80 hover:bg-secondary hover:text-foreground rounded-lg transition-all">
                                                        <EyeOff className="w-3.5 h-3.5" />
                                                        Hide Listing
                                                    </button>
                                                    <div className="h-px w-full bg-border/40 my-0.5" />
                                                    <button className="flex items-center gap-2.5 px-3 py-2 text-[12px] font-medium text-red-500 hover:bg-red-500/10 rounded-lg transition-all">
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                        Delete
                                                    </button>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </div>

            <div className="w-full overflow-x-auto custom-scrollbar pt-4 pb-2 hidden md:block" data-lenis-prevent>
                <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                        <tr className="border-b border-border/50 text-[13px] font-semibold text-muted-foreground/70 tracking-wide">
                            <th className="pb-4 font-medium pl-4 md:pl-6 w-[15%]">Tracking</th>
                            <th className="pb-4 font-medium w-[25%]">Product Name</th>
                            <th className="pb-4 font-medium w-[10%] relative">
                                <div className="inline-flex cursor-pointer items-center gap-1 group/filter hover:text-foreground transition-colors" onClick={() => toggleFilterMenu("price")}>
                                    <span>Price</span>
                                    <ChevronDown className="w-3.5 h-3.5 opacity-40 group-hover/filter:opacity-100 transition-opacity" />
                                </div>
                                {renderFilterMenu("price", PRICE_OPTIONS)}
                            </th>
                            <th className="pb-4 font-medium w-[10%] relative">
                                <div className="inline-flex cursor-pointer items-center gap-1 group/filter hover:text-foreground transition-colors" onClick={() => toggleFilterMenu("stock")}>
                                    <span>In Stock</span>
                                    <ChevronDown className="w-3.5 h-3.5 opacity-40 group-hover/filter:opacity-100 transition-opacity" />
                                </div>
                                {renderFilterMenu("stock", STOCK_OPTIONS)}
                            </th>
                            <th className="pb-4 font-medium w-[15%] relative">
                                <div className="inline-flex cursor-pointer items-center gap-1 group/filter hover:text-foreground transition-colors" onClick={() => toggleFilterMenu("orders")}>
                                    <span>Total Order</span>
                                    <ChevronDown className="w-3.5 h-3.5 opacity-40 group-hover/filter:opacity-100 transition-opacity" />
                                </div>
                                {renderFilterMenu("orders", ORDERS_OPTIONS)}
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
                        {filteredProducts.map((prod, idx) => (
                            <tr key={prod.id} className="border-b border-border/40 hover:bg-secondary/20 transition-colors group">
                                <td className="py-3 pl-4 md:pl-6">
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/20 bg-blue-50/50"
                                        />
                                        <span className="font-medium text-foreground/80">
                                            #{prod.id.split('-')[1] || prod.id}
                                        </span>
                                    </div>
                                </td>
                                <td className="py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded overflow-hidden bg-secondary/50 border border-border/30 shrink-0">
                                            <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
                                        </div>
                                        <span className="font-medium text-foreground whitespace-nowrap">{prod.name}</span>
                                    </div>
                                </td>
                                <td className="py-3 font-medium text-foreground/80">₦{(prod.price / 1000).toFixed(0)}k</td>
                                <td className="py-3 font-medium text-foreground/80">{prod.views}</td>
                                <td className="py-3">
                                    <span className="px-3 py-1.5 text-[12px] font-bold rounded-md bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 whitespace-nowrap">
                                        {prod.orders + prod.views}
                                    </span>
                                </td>
                                <td className="py-3">
                                    <span className={`px-4 py-1.5 text-[12px] font-medium rounded-md whitespace-nowrap ${getStatusStyles(prod.status)}`}>
                                        {getStatusText(prod.status)}
                                    </span>
                                </td>
                                <td className="py-3 text-center relative pr-4 md:pr-6">
                                    <button
                                        onClick={() => toggleDropdown(prod.id)}
                                        className="text-[13px] font-medium text-foreground/80 hover:text-foreground transition-colors hover:bg-secondary/50 px-3 py-1.5 rounded-lg whitespace-nowrap"
                                    >
                                        Details
                                    </button>
                                    <AnimatePresence>
                                        {openDropdownId === prod.id && (
                                            <>
                                                <div className="fixed inset-0 z-40" onClick={() => setOpenDropdownId(null)}></div>
                                                <motion.div
                                                    initial={{ opacity: 0, y: idx >= 3 ? 10 : -10, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: idx >= 3 ? 10 : -10, scale: 0.95 }}
                                                    transition={{ duration: 0.18, ease: "easeOut" }}
                                                    className={`absolute w-40 bg-popover border border-border rounded-xl shadow-xl z-50 py-1.5 text-left flex flex-col gap-0.5 px-1 right-8 md:right-10 ${idx >= 3 ? "bottom-full mb-2" : "top-10"}`}
                                                >
                                                    <button className="flex items-center gap-2.5 px-3 py-2 text-[12px] font-medium text-foreground/80 hover:bg-secondary hover:text-foreground rounded-lg transition-all">
                                                        <Share2 className="w-3.5 h-3.5" />
                                                        Share
                                                    </button>
                                                    <button
                                                        className="flex items-center gap-2.5 px-3 py-2 text-[12px] font-medium text-foreground/80 hover:bg-secondary hover:text-foreground rounded-lg transition-all"
                                                        onClick={() => {
                                                            setEditingListing(prod);
                                                            setOpenDropdownId(null);
                                                        }}
                                                    >
                                                        <Edit className="w-3.5 h-3.5" />
                                                        Edit Content
                                                    </button>
                                                    <button className="flex items-center gap-2.5 px-3 py-2 text-[12px] font-medium text-foreground/80 hover:bg-secondary hover:text-foreground rounded-lg transition-all">
                                                        <EyeOff className="w-3.5 h-3.5" />
                                                        Hide Listing
                                                    </button>
                                                    <div className="h-px w-full bg-border/40 my-0.5" />
                                                    <button className="flex items-center gap-2.5 px-3 py-2 text-[12px] font-medium text-red-500 hover:bg-red-500/10 rounded-lg transition-all">
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                        Delete
                                                    </button>
                                                </motion.div>
                                            </>
                                        )}
                                    </AnimatePresence>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="p-4 md:p-6 border-t border-border/40 flex flex-col md:flex-row items-center justify-between gap-4">
                <span className="text-[13px] font-medium text-muted-foreground order-2 md:order-1">Showing {filteredProducts.length} entries</span>
                <div className="flex flex-wrap items-center justify-center gap-1.5 order-1 md:order-2">
                    <button className="px-3 py-1.5 rounded-lg border border-border/50 bg-card text-xs font-semibold text-muted-foreground hover:bg-secondary transition-all">Prev</button>
                    {[1, 2, 3].map((page) => (
                        <button
                            key={page}
                            className={`w-8 h-8 rounded-lg border text-xs font-semibold transition-all ${page === 1
                                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                : "bg-card border-border/50 text-muted-foreground hover:bg-secondary"}`}
                        >
                            {page}
                        </button>
                    ))}
                    <span className="text-xs font-semibold text-muted-foreground px-1">...</span>
                    <button className="w-8 h-8 rounded-lg border border-border/50 bg-card text-xs font-semibold text-muted-foreground hover:bg-secondary transition-all">
                        10
                    </button>
                    <button className="px-3 py-1.5 rounded-lg border border-border/50 bg-card text-xs font-semibold text-muted-foreground hover:bg-secondary transition-all">Next</button>
                </div>
            </div>

            <EditListingModal
                listing={editingListing ?? DASHBOARD_PRODUCTS[0]}
                isOpen={Boolean(editingListing)}
                onClose={() => setEditingListing(null)}
            />
        </div>
    );
}
