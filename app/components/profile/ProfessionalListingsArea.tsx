"use client";

import React, { useState } from "react";
import {
    MoreHorizontal,
    ShoppingBag,
    PackageOpen
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PRODUCTS, Product } from "../../data/products";
import { ProductCard } from "../shop/ProductCard";


interface ProfessionalListingsAreaProps {
    viewAs: "private" | "public";
    sellerId: string;
}

export function ProfessionalListingsArea({ viewAs, sellerId }: ProfessionalListingsAreaProps) {
    const isHost = viewAs === "private";

    // Derive displayed listings based on view
    const sellerListings = PRODUCTS.filter(p => p.sellerId === sellerId);
    const visibleListings = sellerListings;


    return (
        <div className="w-full">
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
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                    <AnimatePresence mode="popLayout">
                        {visibleListings.map((listing, idx) => (
                            <motion.div
                                key={listing.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.2, delay: idx * 0.05 }}
                            >
                                <ProductCard
                                    product={{
                                        ...listing,
                                        price: listing.price,
                                        category: listing.category,
                                        recommendedCount: listing.recommendedCount,
                                        notRecommendedCount: listing.notRecommendedCount
                                    }}
                                    viewAs={viewAs}
                                />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
