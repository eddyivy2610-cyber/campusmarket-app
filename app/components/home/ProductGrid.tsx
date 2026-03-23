"use client";

import { PRODUCTS } from "../../data/products";
import { ProductCard } from "../shop/ProductCard";
import { motion, Variants } from "framer-motion";
import { useMemo, useEffect, useRef, useState } from "react";
import { InViewMount } from "../common/InViewMount";
import { SkeletonProductCard } from "../skeletons/SkeletonProductCard";

const HOME_PAGE_SIZE = 20;
const EXPLORE_POOL_SIZE = 120;

export function ProductGrid() {
    const sentinelRef = useRef<HTMLDivElement | null>(null);
    const [visibleCount, setVisibleCount] = useState(HOME_PAGE_SIZE);

    const exploreItems = useMemo(() => {
        return Array.from({ length: EXPLORE_POOL_SIZE }, (_, index) => {
            const base = PRODUCTS[index % PRODUCTS.length];
            return {
                ...base,
                id: 100000 + index,
                originalPrice: Math.round(base.price * 1.2),
            };
        });
    }, []);

    const visibleItems = useMemo(() => exploreItems.slice(0, visibleCount), [exploreItems, visibleCount]);
    const hasMore = visibleCount < exploreItems.length;

    const itemVariants: Variants = {
        hidden: { opacity: 0, scale: 0.95, y: 20 },
        visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
    };

    useEffect(() => {
        if (!hasMore || !sentinelRef.current) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisibleCount((prev) => Math.min(prev + HOME_PAGE_SIZE, exploreItems.length));
                }
            },
            { root: null, rootMargin: "420px", threshold: 0.01 }
        );

        observer.observe(sentinelRef.current);
        return () => observer.disconnect();
    }, [hasMore, exploreItems.length]);

    return (
        <div className="flex flex-col gap-10 md:gap-16 w-full">
            <section>
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-3.5 h-6 bg-[#FFD700]/80 rounded-none shadow-sm" />
                    <h2 className="text-sm md:text-base font-bold text-[#1f1f1f] uppercase tracking-wider">
                        More to Explore
                    </h2>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                    {visibleItems.map((product) => (
                        <InViewMount key={product.id} placeholder={<SkeletonProductCard />}>
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
            </section>
        </div>
    );
}


