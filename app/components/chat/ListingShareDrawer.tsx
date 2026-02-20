"use client";

import { useState } from "react";
import Image from "next/image";
import { X, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ChatListing, CHAT_LISTINGS } from "../../data/chat";

interface ListingShareDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (listing: ChatListing) => void;
}

const MY_LISTINGS: ChatListing[] = Object.values(CHAT_LISTINGS);

export function ListingShareDrawer({ isOpen, onClose, onSelect }: ListingShareDrawerProps) {
    const [query, setQuery] = useState("");

    const filtered = MY_LISTINGS.filter(l =>
        l.title.toLowerCase().includes(query.toLowerCase())
    );

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 z-40"
                    />

                    {/* Drawer panel */}
                    <motion.div
                        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                        className="fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-2xl shadow-2xl max-h-[70vh] flex flex-col"
                    >
                        {/* Handle */}
                        <div className="flex justify-center pt-3 pb-1">
                            <div className="w-10 h-1 bg-border rounded-full" />
                        </div>

                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-3 border-b border-border/40">
                            <p className="text-sm font-black text-foreground">Share a Listing</p>
                            <button onClick={onClose} className="p-1.5 hover:bg-secondary rounded-lg transition-colors text-muted-foreground">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Search */}
                        <div className="px-4 py-3 border-b border-border/30">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Search your listings..."
                                    value={query}
                                    onChange={e => setQuery(e.target.value)}
                                    className="w-full pl-8 pr-3 py-2 bg-secondary/40 border border-border/40 rounded-xl text-xs outline-none focus:border-primary/40"
                                />
                            </div>
                        </div>

                        {/* Listings */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                            {filtered.length === 0
                                ? <p className="text-center text-sm text-muted-foreground py-8 italic">No listings found.</p>
                                : filtered.map(listing => (
                                    <button
                                        key={listing.id}
                                        onClick={() => onSelect(listing)}
                                        className="w-full flex items-center gap-4 p-3 bg-card border border-border/40 rounded-xl hover:border-primary/40 hover:bg-secondary/20 transition-all text-left group"
                                    >
                                        <div className="w-14 h-12 rounded-lg overflow-hidden relative bg-secondary shrink-0">
                                            <Image src={listing.image} alt={listing.title} fill className="object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">{listing.title}</p>
                                            <p className="text-sm font-black text-primary mt-0.5">₦{listing.price.toLocaleString()}</p>
                                            <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full ${listing.status === "available" ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-500"}`}>
                                                {listing.status}
                                            </span>
                                        </div>
                                    </button>
                                ))
                            }
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
