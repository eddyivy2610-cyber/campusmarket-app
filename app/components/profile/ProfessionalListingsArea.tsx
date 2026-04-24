"use client";

import React, { useState, useEffect } from "react";
import { PackageOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ProductCard } from "../shop/ProductCard";

interface ProfessionalListingsAreaProps {
    viewAs: "private" | "public";
    sellerId: string;
}

export function ProfessionalListingsArea({ viewAs, sellerId }: ProfessionalListingsAreaProps) {
    const isHost = viewAs === "private";
    const [listings, setListings] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchListings = async () => {
            try {
                setIsLoading(true);
                const endpoint = isHost 
                    ? `${process.env.NEXT_PUBLIC_API_URL}/api/listing/user/all`
                    : `${process.env.NEXT_PUBLIC_API_URL}/api/listing/active?sellerId=${sellerId}`;
                
                const response = await fetch(endpoint, {
                    headers: isHost ? {
                        "Authorization": `Bearer ${localStorage.getItem("campus_token")}`
                    } : {}
                });
                
                const data = await response.json();

                if (data.success) {
                    setListings(data.data);
                }
            } catch (error) {
                console.error("Failed to fetch listings:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (sellerId) {
            fetchListings();
        }
    }, [sellerId, isHost]);

    if (isLoading) {
        return (
            <div className="flex justify-center py-20">
                <div className="w-8 h-8 border-4 border-[#FFD700] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* Empty state when no listings found */}
            {listings.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="py-16 flex flex-col items-center justify-center gap-4 bg-secondary/10 rounded-2xl border-2 border-dashed border-border/30"
                >
                    <div className="w-14 h-14 rounded-2xl bg-[#fff3c6] border border-[#FFD700]/20 flex items-center justify-center text-black">
                        <PackageOpen className="w-8 h-8" />
                    </div>
                    <div className="text-center space-y-1">
                        <p className="text-sm font-bold text-foreground/60 uppercase tracking-widest">
                            {isHost ? "No Listings Yet" : "No Active Listings"}
                        </p>
                        <p className="text-xs text-muted-foreground font-medium">
                            {isHost ? "Start selling to see your items here." : "This seller hasn't posted anything yet."}
                        </p>
                    </div>
                </motion.div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-1.5 md:gap-2.5">
                    <AnimatePresence mode="popLayout">
                        {listings.map((listing, idx) => (
                            <motion.div
                                key={listing._id}
                                layout
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.4, delay: (idx % 8) * 0.05, ease: "easeOut" }}
                                className="scale-[0.95] origin-top"
                            >
                                <ProductCard
                                    product={{
                                        ...listing,
                                        id: listing._id,
                                        // ProductCard expects 'title' and 'image' or 'images'
                                        // The listing object already has these from the backend
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
