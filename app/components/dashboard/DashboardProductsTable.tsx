"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { listingService } from "@/lib/listingService";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
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
    _id?: string;
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



const getStatusText = (status: string) => {
    switch (status) {
        case "Available":
            return "Active";
        case "In Review":
        case "pending":
        case "Preorder":
            return "Pending";
        default:
            return status;
    }
};

export function DashboardProductsTable() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [editingListing, setEditingListing] = useState<any | null>(null);
    const [filters, setFilters] = useState<Record<FilterKey, string | null>>({
        status: null,
        price: null,
        stock: null,
        orders: null,
    });
    const [activeFilterColumn, setActiveFilterColumn] = useState<FilterKey | null>(null);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const res = await listingService.getUserListings();
            if (res.success) {
                setProducts(res.data);
            }
        } catch (error) {
            console.error("Fetch products error:", error);
            toast.error("Failed to load your products");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const STATUS_OPTIONS = useMemo(() => Array.from(new Set(products.map((p: any) => getStatusText(p.status)))), [products]);
    const PRICE_OPTIONS = ["<₦1.0M", "₦1.0M - ₦3.0M", ">₦3.0M"];
    const STOCK_OPTIONS = ["<50", "50-100", ">100"];
    const ORDERS_OPTIONS = ["<50", "50-100", ">100"];

    const filteredProducts = useMemo(() => {
        return products.filter((product) => {
            if (filters.status && getStatusText(product.status) !== filters.status) return false;

            if (filters.price) {
                if (filters.price === "<₦1.0M" && product.price >= 1000000) return false;
                if (filters.price === "₦1.0M - ₦3.0M" && (product.price < 1000000 || product.price > 3000000)) return false;
                if (filters.price === ">₦3.0M" && product.price <= 3000000) return false;
            }

            if (filters.stock) {
                const stock = product.views || 0; // Mocking stock with views for now
                if (filters.stock === "<50" && stock >= 50) return false;
                if (filters.stock === "50-100" && (stock < 50 || stock > 100)) return false;
                if (filters.stock === ">100" && stock <= 100) return false;
            }

            return true;
        });
    }, [filters, products]);

    const getStatusStyles = (status: string) => {
        switch (status) {
            case "Available":
                return "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20";
            case "In Review":
            case "pending":
            case "Preorder":
                return "bg-amber-500/10 text-amber-500 border border-amber-500/20";
            case "Sold Out":
                return "bg-red-500/10 text-red-500 border border-red-500/20";
            default:
                return "bg-secondary text-muted-foreground border border-border/50";
        }
    };
    const getStatusDotClass = (status: string) => {
        switch (status) {
            case "Available":
                return "bg-emerald-500";
            case "In Review":
            case "pending":
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
                {options.map((option: string) => (
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



    if (loading) {
        return (
            <div className="w-full bg-card rounded-[20px] shadow-sm flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Loading Products...</p>
            </div>
        );
    }



    return (
        <div className="w-full bg-card rounded-[20px] shadow-sm flex flex-col relative">
            <div className="flex flex-col rounded-[20px]">
            <div className="p-4 md:p-5 border-b border-border/40 rounded-t-[20px] overflow-hidden">
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
                        {STATUS_OPTIONS.map((option: string) => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                    <select
                        value={filters.price ?? ""}
                        onChange={(e) => applyFilter("price", e.target.value || null)}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[12px] font-semibold text-foreground/70"
                    >
                        <option value="">Price</option>
                        {PRICE_OPTIONS.map((option: string) => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="md:hidden px-4 pt-4 pb-2 space-y-3">
                {filteredProducts.map((prod: any) => {
                    const isOpen = expandedId === prod._id;
                    return (
                        <div key={prod._id} className="rounded-2xl border border-border/60 bg-background/70 shadow-sm overflow-hidden">
                            <button
                                onClick={() => setExpandedId(isOpen ? null : prod._id)}
                                className="w-full flex items-center justify-between gap-3 px-4 py-3"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-9 h-9 rounded-xl overflow-hidden border border-border/40 bg-secondary/50 shrink-0 flex items-center justify-center">
                                        {prod.images?.[0] ? (
                                            <img src={prod.images[0]} alt={prod.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <Edit className="w-4 h-4 text-muted-foreground/40" />
                                        )}
                                    </div>
                                    <div className="min-w-0 text-left">
                                        <p className="text-sm font-semibold text-foreground truncate">{prod.title}</p>
                                        <p className="text-[11px] text-muted-foreground">₦{prod.price.toLocaleString()}</p>
                                    </div>
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
                                                <p className="uppercase tracking-widest text-[9px]">Views</p>
                                                <p className="font-semibold text-foreground/80">{prod.views || 0}</p>
                                            </div>
                                            <div>
                                                <p className="uppercase tracking-widest text-[9px]">Status</p>
                                                <p className="font-semibold text-foreground/80 uppercase">{prod.status}</p>
                                            </div>
                                            <div>
                                                <p className="uppercase tracking-widest text-[9px]">Category</p>
                                                <p className="font-semibold text-foreground/80">{prod.category}</p>
                                            </div>
                                        </div>
                                        <div className="mt-3 flex items-center gap-2">
                                            <button 
                                                className="flex-1 rounded-lg border border-border/60 bg-secondary/30 px-3 py-2 text-[11px] font-semibold text-muted-foreground hover:bg-secondary flex items-center justify-center gap-2 transition-all"
                                                title="Share Listing"
                                            >
                                                <Share2 className="w-3.5 h-3.5" />
                                                <span>Share</span>
                                            </button>
                                            <button 
                                                onClick={() => setEditingListing(prod)}
                                                className="flex-1 rounded-lg border border-border/60 bg-primary/10 px-3 py-2 text-[11px] font-semibold text-primary hover:bg-primary hover:text-white flex items-center justify-center gap-2 transition-all"
                                                title="Edit Listing"
                                            >
                                                <Edit className="w-3.5 h-3.5" />
                                                <span>Edit</span>
                                            </button>
                                            <button 
                                                className="p-2 rounded-lg border border-border/60 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                                                title="Delete Listing"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </div>

            <div className="w-full overflow-x-auto custom-scrollbar pt-4 pb-4 hidden md:block" data-lenis-prevent>
                <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                        <tr className="border-b border-border/50 text-[11px] uppercase font-black text-muted-foreground/50 tracking-[0.1em] bg-muted/5 dark:bg-muted/2">
                            <th className="pb-4 font-medium pl-4 md:pl-6 w-[15%]">Tracking</th>
                            <th className="pb-4 font-medium w-[25%]">Product Name</th>
                            <th 
                                className="pb-4 font-medium w-[10%] relative cursor-pointer group/th hover:bg-muted/10 transition-colors"
                                onClick={() => toggleFilterMenu("price")}
                            >
                                <div className="inline-flex items-center gap-1 group/filter">
                                    <span className="group-hover/th:text-foreground transition-colors">Price</span>
                                    <ChevronDown className="w-3.5 h-3.5 opacity-40 group-hover/filter:opacity-100 transition-opacity" />
                                </div>
                                {renderFilterMenu("price", PRICE_OPTIONS)}
                            </th>
                            <th 
                                className="pb-4 font-medium w-[10%] relative cursor-pointer group/th hover:bg-muted/10 transition-colors"
                                onClick={() => toggleFilterMenu("stock")}
                            >
                                <div className="inline-flex items-center gap-1 group/filter">
                                    <span className="group-hover/th:text-foreground transition-colors">In Stock</span>
                                    <ChevronDown className="w-3.5 h-3.5 opacity-40 group-hover/filter:opacity-100 transition-opacity" />
                                </div>
                                {renderFilterMenu("stock", STOCK_OPTIONS)}
                            </th>
                            <th 
                                className="pb-4 font-medium w-[15%] relative cursor-pointer group/th hover:bg-muted/10 transition-colors"
                                onClick={() => toggleFilterMenu("orders")}
                            >
                                <div className="inline-flex items-center gap-1 group/filter">
                                    <span className="group-hover/th:text-foreground transition-colors">Total Order</span>
                                    <ChevronDown className="w-3.5 h-3.5 opacity-40 group-hover/filter:opacity-100 transition-opacity" />
                                </div>
                                {renderFilterMenu("orders", ORDERS_OPTIONS)}
                            </th>
                            <th 
                                className="pb-4 font-medium w-[15%] relative cursor-pointer group/th hover:bg-muted/10 transition-colors"
                                onClick={() => toggleFilterMenu("status")}
                            >
                                <div className="inline-flex items-center gap-1 group/filter">
                                    <span className="group-hover/th:text-foreground transition-colors">Status</span>
                                    <ChevronDown className="w-3.5 h-3.5 opacity-40 group-hover/filter:opacity-100 transition-opacity" />
                                </div>
                                {renderFilterMenu("status", STATUS_OPTIONS)}
                            </th>
                            <th className="pb-4 text-center font-medium pr-4 md:pr-6 w-[10%]">Options</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {filteredProducts.map((prod) => (
                            <tr key={prod._id} className="border-b border-border/40 hover:bg-secondary/20 transition-colors group">
                                <td className="py-3 pl-4 md:pl-6">
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/20 bg-blue-50/50"
                                        />
                                        <span className="font-medium text-foreground/80">
                                            #{prod.listingCode || prod._id.slice(-6)}
                                        </span>
                                    </div>
                                </td>
                                <td className="py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded overflow-hidden bg-secondary/50 border border-border/30 shrink-0 flex items-center justify-center">
                                            {prod.images?.[0] ? (
                                                <img src={prod.images[0]} alt={prod.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <Edit className="w-4 h-4 text-muted-foreground/40" />
                                            )}
                                        </div>
                                        <span className="font-medium text-foreground whitespace-nowrap truncate max-w-[200px]">{prod.title}</span>
                                    </div>
                                </td>
                                <td className="py-3 font-medium text-foreground/80">₦{prod.price.toLocaleString()}</td>
                                <td className="py-3 font-medium text-foreground/80">{prod.views || 0}</td>
                                <td className="py-3">
                                    <span className="px-3 py-1.5 text-[11px] font-bold rounded-xl bg-primary/10 text-primary border border-primary/20 whitespace-nowrap uppercase tracking-wider">
                                        {prod.category}
                                    </span>
                                </td>
                                <td className="py-3">
                                    <span className={`px-4 py-1.5 text-[12px] font-medium rounded-md whitespace-nowrap ${getStatusStyles(prod.status)}`}>
                                        {getStatusText(prod.status)}
                                    </span>
                                </td>
                                <td className="py-3 pr-4 md:pr-6 text-right">
                                    <div className="flex items-center justify-end gap-1.5">
                                        <button 
                                            className="p-2 rounded-lg hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-all active:scale-90 border border-transparent hover:border-border/50"
                                            title="Share Listing"
                                        >
                                            <Share2 className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => setEditingListing(prod)}
                                            className="p-2 rounded-lg hover:bg-secondary/80 text-muted-foreground hover:text-primary transition-all active:scale-90 border border-transparent hover:border-border/50"
                                            title="Edit Content"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button 
                                            className="p-2 rounded-lg hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-all active:scale-90 border border-transparent hover:border-border/50"
                                            title="Hide Listing"
                                        >
                                            <EyeOff className="w-4 h-4" />
                                        </button>
                                        <div className="w-px h-4 bg-border/40 mx-1" />
                                        <button 
                                            className="p-2 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-all active:scale-90 border border-transparent hover:border-red-500/20"
                                            title="Delete Listing"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="p-4 md:p-6 border-t border-border/40 flex flex-col md:flex-row items-center justify-between gap-4 rounded-b-[20px] bg-card">
                <span className="text-[13px] font-medium text-muted-foreground order-2 md:order-1">Showing {filteredProducts.length} entries</span>
                <div className="flex flex-wrap items-center justify-center gap-1.5 order-1 md:order-2">
                    <button className="px-3 py-1.5 rounded-lg border border-border/50 bg-card text-xs font-semibold text-muted-foreground hover:bg-secondary transition-all">Prev</button>
                    {[1, 2, 3].map((page: number) => (
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

            {editingListing && (
                <EditListingModal
                    listing={editingListing}
                    isOpen={Boolean(editingListing)}
                    onClose={() => setEditingListing(null)}
                    onSuccess={fetchProducts}
                />
            )}
            </div>
        </div>
    );
}
