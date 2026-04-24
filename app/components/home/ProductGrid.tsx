"use client";

import { listingService } from "../../lib/listingService";
import { ProductCard } from "../shop/ProductCard";
import { motion, Variants } from "framer-motion";
import { useMemo, useEffect, useRef, useState } from "react";
import { InViewMount } from "../common/InViewMount";
import { SkeletonProductCard } from "../skeletons/SkeletonProductCard";
import { Loader2 } from "lucide-react";

const HOME_PAGE_SIZE = 20;

export function ProductGrid() {
    const [listings, setListings] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const sentinelRef = useRef<HTMLDivElement | null>(null);
    const [visibleCount, setVisibleCount] = useState(HOME_PAGE_SIZE);

    const fetchListings = async () => {
        try {
            setIsLoading(true);
            const res = await listingService.getActiveListings();
            setListings(res.data || []);
            setVisibleCount(HOME_PAGE_SIZE);
        } catch (err) {
            console.error("[ProductGrid] Failed to fetch listings", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchListings();
    }, []);

    const visibleItems = useMemo(() => listings.slice(0, visibleCount), [listings, visibleCount]);
    const hasMore = visibleCount < listings.length;

    const itemVariants: Variants = {
        hidden: { opacity: 0, scale: 0.95, y: 20 },
        visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
    };

    useEffect(() => {
        if (!hasMore || !sentinelRef.current) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisibleCount((prev) => Math.min(prev + HOME_PAGE_SIZE, listings.length));
                }
            },
            { root: null, rootMargin: "420px", threshold: 0.01 }
        );

        observer.observe(sentinelRef.current);
        return () => observer.disconnect();
    }, [hasMore, listings.length]);

    if (isLoading) {
        return (
            <div className="flex flex-col gap-10 md:gap-16 w-full">
                <section>
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-3.5 h-6 bg-[#FFD700]/80 rounded-none shadow-sm" />
                        <h2 className="text-sm md:text-base font-bold text-foreground uppercase tracking-wider">
                            More to Explore
                        </h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                            <SkeletonProductCard key={i} />
                        ))}
                    </div>
                </section>
            </div>
        );
    }

    // Empty state — no listings in DB yet
    if (listings.length === 0) {
        return (
            <div className="flex flex-col gap-10 md:gap-16 w-full">
                <section>
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-3.5 h-6 bg-[#FFD700]/80 rounded-none shadow-sm" />
                        <h2 className="text-sm md:text-base font-bold text-foreground uppercase tracking-wider">
                            More to Explore
                        </h2>
                    </div>
                    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                        <span className="text-4xl">🛍️</span>
                        <p className="text-sm font-semibold text-muted-foreground">No listings yet</p>
                        <p className="text-xs text-muted-foreground/70">Be the first to sell something on Campus Hive!</p>
                    </div>
                </section>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-10 md:gap-16 w-full">
            <section>
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-3.5 h-6 bg-[#FFD700]/80 rounded-none shadow-sm" />
                    <h2 className="text-sm md:text-base font-bold text-foreground uppercase tracking-wider">
                        More to Explore
                    </h2>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                    {visibleItems.map((product) => (
                        <InViewMount key={(product as { exploreKey?: string }).exploreKey || product.id} placeholder={<SkeletonProductCard />}>
                            <motion.div
                                variants={itemVariants}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, amount: 0.1 }}
                            >
                                <ProductCard product={product} />
                            </motion.div>
                        </InViewMount>
                    ))}
                </div>

                {hasMore && (
                    <div ref={sentinelRef} className="mt-8 flex justify-center pb-8">
                        <div className="w-7 h-7 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    </div>
                )}

                {!hasMore && (
                    <div className="mt-10 flex flex-col items-center gap-3 pb-8">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            You are all caught up for now
                        </p>
                        <button
                            onClick={fetchListings}
                            className="px-5 py-2 rounded-full bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest shadow-sm hover:bg-primary/90 transition-colors"
                        >
                            Refresh
                        </button>
                    </div>
                )}
            </section>
        </div>
    );
}
