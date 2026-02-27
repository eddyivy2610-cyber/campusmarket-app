"use client";

import { useState } from "react";
import {
    Plus,
    ChevronDown,
    MoreHorizontal,
    Search,
    Edit,
    Trash2,
    EyeOff,
    TrendingUp,
    Ban,
    Share2,
    RefreshCcw
} from "lucide-react";
import { Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Mock data extending standard product with extra dashboard fields
const DASHBOARD_PRODUCTS = [
    {
        id: "39842-231",
        name: "Macbook Pro 15'",
        status: "Available",
        category: "Laptops",
        price: 2999000,
        dateListed: "20 Jan, 2022",
        review: 4.8,
        sold: 145,
        profit: 434855, // In thousands (e.g. 434.8k)
        image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=100&h=100&fit=crop"
    },
    {
        id: "39842-232",
        name: "Macbook Pro 13'",
        status: "In Review",
        category: "Laptops",
        price: 999000,
        dateListed: "22 Feb, 2022",
        review: 0.0,
        sold: 0,
        profit: 0,
        image: "https://images.unsplash.com/photo-1541807084-068b6eb0639d?w=100&h=100&fit=crop"
    },
    {
        id: "39842-233",
        name: "iPhone 13 Mini",
        status: "Sold Out",
        category: "Phones",
        price: 450000,
        dateListed: "22 Feb, 2022",
        review: 4.5,
        sold: 320,
        profit: 144000,
        image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=100&h=100&fit=crop"
    },
    {
        id: "39842-234",
        name: "iPhone 14",
        status: "Preorder",
        category: "Phones",
        price: 850000,
        dateListed: "22 Feb, 2022",
        review: 4.9,
        sold: 10,
        profit: 8500,
        image: "https://images.unsplash.com/photo-1629367494548-fd256f140032?w=100&h=100&fit=crop"
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
        image: "https://images.unsplash.com/photo-1606220588913-b3aecb4b39b5?w=100&h=100&fit=crop"
    }
];

export function DashboardProductsTable() {
    const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

    const getStatusStyles = (status: string) => {
        switch (status) {
            case "Available": return "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20";
            case "In Review": return "bg-amber-500/10 text-amber-500 border border-amber-500/20";
            case "Sold Out": return "bg-red-500/10 text-red-500 border border-red-500/20";
            case "Preorder": return "bg-blue-500/10 text-blue-500 border border-blue-500/20";
            default: return "bg-secondary text-muted-foreground border border-border/50";
        }
    };

    const toggleDropdown = (id: string) => {
        if (openDropdownId === id) setOpenDropdownId(null);
        else setOpenDropdownId(id);
    };

    return (
        <div className="w-full flex-1 min-h-[600px] flex flex-col overflow-hidden">
            {/* Header Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
                <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-foreground text-background font-bold px-6 py-3 rounded-full hover:opacity-90 transition-all text-xs tracking-wide">
                    <Plus className="w-4 h-4" />
                    Add Product
                </button>

                <div className="w-full sm:w-auto flex items-center gap-3">
                    <button className="flex-1 sm:flex-none flex items-center justify-between sm:justify-center gap-2 px-4 py-2.5 rounded-full border border-border text-xs font-bold text-muted-foreground hover:bg-secondary transition-colors">
                        Export data
                        <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    <button className="flex-1 sm:flex-none flex items-center justify-between sm:justify-center gap-2 px-4 py-2.5 rounded-full border border-border text-xs font-bold text-muted-foreground hover:bg-secondary transition-colors">
                        Sort by: ID
                        <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* Table Area */}
            <div className="w-full flex-1 overflow-auto custom-scrollbar pr-2 pb-4" data-lenis-prevent>
                <table className="w-full text-left border-collapse min-w-[1000px]">
                    <thead>
                        <tr className="border-b border-border/30">
                            <th className="pb-4 text-xs font-bold font-heading w-12 text-center">No</th>
                            <th className="pb-4 text-xs font-bold font-heading">Image & Name</th>
                            <th className="pb-4 text-xs font-bold font-heading">Status</th>
                            <th className="pb-4 text-xs font-bold font-heading">Category</th>
                            <th className="pb-4 text-xs font-bold font-heading">Price</th>
                            <th className="pb-4 text-xs font-bold font-heading text-center">review</th>
                            <th className="pb-4 text-xs font-bold font-heading text-center">Sold</th>
                            <th className="pb-4 text-xs font-bold font-heading text-right">Profit</th>
                            <th className="pb-4 text-xs font-bold font-heading text-right">Date Listed</th>
                            <th className="pb-4 text-xs font-bold font-heading w-16 text-center"></th>
                        </tr>
                    </thead>
                    <tbody className="text-xs">
                        {DASHBOARD_PRODUCTS.map((prod, idx) => (
                            <tr key={prod.id} className="border-b border-border/10 hover:bg-secondary/20 transition-colors group">
                                <td className="py-2.5 text-center text-[10px] font-bold text-muted-foreground">{idx + 1}</td>
                                <td className="py-2.5">
                                    <div className="flex items-center gap-3 pr-4">
                                        <div className="w-8 h-8 rounded-lg overflow-hidden bg-secondary shrink-0 border border-border/50">
                                            <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-xs leading-tight text-foreground transition-colors group-hover:text-primary">{prod.name}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-2.5">
                                    <span className={`px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider rounded-md whitespace-nowrap ${getStatusStyles(prod.status)}`}>
                                        {prod.status}
                                    </span>
                                </td>
                                <td className="py-2.5 font-medium text-muted-foreground">{prod.category}</td>
                                <td className="py-2.5 font-bold text-foreground">
                                    ₦{(prod.price / 1000).toFixed(0)}k
                                </td>
                                <td className="py-2.5">
                                    <div className="flex items-center justify-center gap-1.5 mx-auto">
                                        {prod.review > 0 ? (
                                            <>
                                                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                                <span className="font-bold text-xs">{prod.review.toFixed(1)}</span>
                                            </>
                                        ) : (
                                            <span className="text-xs text-muted-foreground font-medium">-</span>
                                        )}
                                    </div>
                                </td>
                                <td className="py-2.5 text-center font-bold text-muted-foreground">{prod.sold > 0 ? prod.sold : '-'}</td>
                                <td className="py-2.5 text-right font-bold text-emerald-600">
                                    {prod.profit > 0 ? `₦${(prod.profit / 1000).toFixed(1)}k` : '-'}
                                </td>
                                <td className="py-2.5 text-right text-xs font-bold text-muted-foreground whitespace-nowrap pl-4">{prod.dateListed}</td>

                                <td className="py-2.5 text-center relative">
                                    <button
                                        onClick={() => toggleDropdown(prod.id)}
                                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary text-muted-foreground transition-colors mx-auto"
                                    >
                                        <MoreHorizontal className="w-4 h-4" />
                                    </button>

                                    {/* Dropdown Menu */}
                                    <AnimatePresence>
                                        {openDropdownId === prod.id && (
                                            <>
                                                <div className="fixed inset-0 z-40" onClick={() => setOpenDropdownId(null)}></div>
                                                <motion.div
                                                    initial={{ opacity: 0, y: idx >= 3 ? 10 : -10, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: idx >= 3 ? 10 : -10, scale: 0.95 }}
                                                    transition={{ duration: 0.15, ease: "easeOut" }}
                                                    className={`absolute w-48 bg-card border border-border/50 rounded-2xl shadow-xl z-50 py-2 text-left flex flex-col gap-1 px-1 ${idx >= 3
                                                        ? "right-0 bottom-full mb-2 origin-bottom-right"
                                                        : "right-8 top-12 origin-top-right"
                                                        }`}
                                                >
                                                    <button className="flex items-center gap-3 px-3 py-2 text-xs font-bold text-foreground hover:bg-secondary rounded-xl transition-colors">
                                                        <Share2 className="w-4 h-4 text-indigo-500" />
                                                        Share
                                                    </button>
                                                    <button className="flex items-center gap-3 px-3 py-2 text-xs font-bold text-foreground hover:bg-secondary rounded-xl transition-colors">
                                                        <Edit className="w-4 h-4 text-blue-500" />
                                                        Edit
                                                    </button>
                                                    <button className="flex items-center gap-3 px-3 py-2 text-xs font-bold text-foreground hover:bg-secondary rounded-xl transition-colors">
                                                        <EyeOff className="w-4 h-4 text-muted-foreground" />
                                                        Hide
                                                    </button>
                                                    <button className="flex items-center gap-3 px-3 py-2 text-xs font-bold text-foreground hover:bg-secondary rounded-xl transition-colors">
                                                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                                                        Promote
                                                    </button>
                                                    {prod.status === "Sold Out" ? (
                                                        <button className="flex items-center gap-3 px-3 py-2 text-xs font-bold text-foreground hover:bg-secondary rounded-xl transition-colors">
                                                            <RefreshCcw className="w-4 h-4 text-emerald-500" />
                                                            Repost
                                                        </button>
                                                    ) : (
                                                        <button className="flex items-center gap-3 px-3 py-2 text-xs font-bold text-foreground hover:bg-secondary rounded-xl transition-colors">
                                                            <Ban className="w-4 h-4 text-amber-500" />
                                                            Mark Sold Out
                                                        </button>
                                                    )}
                                                    <div className="h-px w-full bg-border/40 my-1"></div>
                                                    <button className="flex items-center gap-3 px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-500/10 rounded-xl transition-colors">
                                                        <Trash2 className="w-4 h-4" />
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

            {/* Pagination Layer bottom */}
            <div className="mt-8 flex items-center justify-center gap-2">
                <button className="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold bg-foreground text-background shadow-sm">1</button>
                <button className="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold text-muted-foreground hover:bg-secondary transition-colors">2</button>
                <button className="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold text-muted-foreground hover:bg-secondary transition-colors">3</button>
                <button className="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold text-muted-foreground hover:bg-secondary transition-colors">4</button>
                <button className="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold text-muted-foreground hover:bg-secondary transition-colors">5</button>
                <span className="px-1 text-muted-foreground text-xs font-bold">...</span>
                <button className="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold text-muted-foreground hover:bg-secondary transition-colors">20</button>
            </div>
        </div >
    );
}
