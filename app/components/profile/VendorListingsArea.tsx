"use client";

import React, { useState } from "react";
import {
    MoreHorizontal,
    ShoppingBag,
    Plus,
    PackageOpen
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AddListingModal } from "./AddListingModal";

interface Listing {
    id: string;
    title: string;
    price: string;
    status: "Available" | "Sold" | "Hidden";
    image: string;
}

const MOCK_LISTINGS: Listing[] = [
    { id: "1", title: "MacBook Pro 2023", price: "₦850,000", status: "Available", image: "" },
    { id: "2", title: "iPhone 14 Pro", price: "₦650,000", status: "Available", image: "" },
    { id: "3", title: "Sony WH-1000XM5", price: "₦125,000", status: "Available", image: "" },
    { id: "4", title: "iPad Air 2024", price: "₦420,000", status: "Available", image: "" },
];

interface VendorListingsAreaProps {
    viewAs: "host" | "visitor";
}

export function VendorListingsArea({ viewAs }: VendorListingsAreaProps) {
    const isHost = viewAs === "host";

    // Host can filter all statuses; visitor only sees Active
    const hostFilters = ["Active", "Sold", "Hidden"];
    const [activeFilter, setActiveFilter] = useState("Active");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Derive displayed listings based on view
    const visibleListings = isHost
        ? MOCK_LISTINGS.filter((l) => {
            if (activeFilter === "Active") return l.status === "Available";
            if (activeFilter === "Sold") return l.status === "Sold";
            if (activeFilter === "Hidden") return l.status === "Hidden";
            return true;
        })
        : MOCK_LISTINGS.filter((l) => l.status === "Available");

    return (
        <div className="w-full space-y-6 bg-secondary/5 rounded-[24px] p-5 md:p-8 border border-border/40">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        <ShoppingBag className="w-4 h-4" />
                    </div>
                    <h2 className="text-xl font-bold font-heading tracking-tight">
                        {isHost ? "My Listings" : "Their Listings"}
                    </h2>
                </div>

                {/* Host: full filter tabs */}
                {isHost && (
                    <div className="flex bg-secondary/20 p-1 rounded-xl border border-border/40">
                        {hostFilters.map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${activeFilter === filter
                                    ? "bg-background text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                )}

                {/* Visitor: static "Active" badge */}
                {!isHost && (
                    <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-xl">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700">
                            Active Listings Only
                        </span>
                    </div>
                )}
            </div>

            {/* Empty state for visitor when no active listings */}
            {!isHost && visibleListings.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="py-16 flex flex-col items-center justify-center gap-4 bg-secondary/10 rounded-2xl border-2 border-dashed border-border/30"
                >
                    <div className="w-14 h-14 rounded-2xl bg-secondary/30 flex items-center justify-center text-muted-foreground/40">
                        <PackageOpen className="w-8 h-8" />
                    </div>
                    <div className="text-center space-y-1">
                        <p className="text-sm font-bold text-foreground/60 uppercase tracking-widest">No Active Listings</p>
                        <p className="text-xs text-muted-foreground font-medium">This seller hasn&apos;t posted anything yet.</p>
                    </div>
                </motion.div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    <AnimatePresence mode="popLayout">
                        {/* Host only: Add New card */}
                        {isHost && (
                            <motion.button
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                onClick={() => setIsAddModalOpen(true)}
                                className="aspect-square bg-background rounded-2xl border-2 border-dashed border-border/40 flex flex-col items-center justify-center gap-3 group hover:border-primary/40 hover:bg-primary/5 transition-all relative overflow-hidden"
                            >
                                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                    <Plus className="w-6 h-6" />
                                </div>
                                <div className="text-center">
                                    <span className="block text-[11px] font-bold uppercase tracking-widest text-foreground">Add New</span>
                                </div>
                            </motion.button>
                        )}

                        {visibleListings.map((listing, idx) => (
                            <motion.div
                                key={listing.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.2, delay: idx * 0.05 }}
                                className="bg-background rounded-xl border border-border/40 overflow-hidden group hover:shadow-lg hover:shadow-primary/5 transition-all"
                            >
                                {/* Listing Image Placeholder */}
                                <div className="aspect-square bg-secondary/20 relative flex items-center justify-center overflow-hidden">
                                    {listing.image ? (
                                        <img src={listing.image} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <span className="text-[10px] font-bold text-muted-foreground/40 lowercase tracking-widest text-center px-2">{listing.title}</span>
                                    )}
                                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-background/90 backdrop-blur-md rounded-md border border-border/40 shadow-sm">
                                        <span className="text-[8px] font-bold uppercase tracking-widest text-foreground/70">
                                            {listing.status}
                                        </span>
                                    </div>
                                </div>

                                {/* Listing Details */}
                                <div className="p-3 space-y-1">
                                    <h3 className="font-bold text-[11px] leading-tight text-foreground/90 truncate">{listing.title}</h3>
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-bold text-primary">{listing.price}</p>
                                        {/* Host only: more options; visitor: no management controls */}
                                        {isHost && (
                                            <button className="p-1 hover:bg-secondary rounded-md transition-colors text-muted-foreground">
                                                <MoreHorizontal className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            <AddListingModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
            />
        </div>
    );
}
