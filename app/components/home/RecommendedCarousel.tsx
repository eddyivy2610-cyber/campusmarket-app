"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "../../data/products";

interface RecommendedCarouselProps {
    products: Product[];
}

export function RecommendedCarousel({ products }: RecommendedCarouselProps) {
    const scrollerRef = useRef<HTMLDivElement | null>(null);
    const directionRef = useRef<1 | -1>(1);
    const [canAutoScroll, setCanAutoScroll] = useState(false);
    const [isPageVisible, setIsPageVisible] = useState(true);

    const items = useMemo(() => products.slice(0, 24), [products]);

    useEffect(() => {
        const onVisibilityChange = () => setIsPageVisible(document.visibilityState === "visible");
        onVisibilityChange();
        document.addEventListener("visibilitychange", onVisibilityChange);
        return () => document.removeEventListener("visibilitychange", onVisibilityChange);
    }, []);

    useEffect(() => {
        const measure = () => {
            const scroller = scrollerRef.current;
            if (!scroller) return;
            const hasOverflow = scroller.scrollWidth > scroller.clientWidth + 4;
            setCanAutoScroll(hasOverflow);
        };

        measure();
        window.addEventListener("resize", measure);
        return () => window.removeEventListener("resize", measure);
    }, [items.length]);

    useEffect(() => {
        const scroller = scrollerRef.current;
        if (!scroller || !canAutoScroll || !isPageVisible) return;

        let rafId = 0;
        const step = window.innerWidth < 768 ? 0.35 : 0.55;

        const tick = () => {
            const maxScroll = scroller.scrollWidth - scroller.clientWidth;
            if (maxScroll <= 0) return;

            let next = scroller.scrollLeft + step * directionRef.current;

            if (next >= maxScroll) {
                next = maxScroll;
                directionRef.current = -1;
            } else if (next <= 0) {
                next = 0;
                directionRef.current = 1;
            }

            scroller.scrollLeft = next;
            rafId = requestAnimationFrame(tick);
        };

        rafId = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(rafId);
    }, [canAutoScroll, isPageVisible]);

    return (
        <section className="w-full pt-4 pb-2">
            <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-5 bg-[#FFD700]/80 rounded-none shadow-sm" />
                <h2 className="text-sm md:text-base font-bold text-black dark:text-foreground uppercase tracking-wider">
                    Recommended For You
                </h2>
            </div>

            <div
                ref={scrollerRef}
                className="overflow-x-auto scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                aria-label="Recommended products carousel"
            >
                <div className="flex gap-2 min-w-max">
                    {items.map((product) => (
                        <Link
                            key={product.id}
                            href={`/listings/${product.id}`}
                            className="relative h-[88px] w-[88px] sm:h-[106px] sm:w-[106px] lg:h-[124px] lg:w-[124px] rounded-xl overflow-hidden border border-[#efe3cf] dark:border-border/70 bg-white dark:bg-card shadow-[0_8px_18px_rgba(40,30,10,0.06)] dark:shadow-[0_10px_24px_rgba(0,0,0,0.35)] shrink-0 hover:-translate-y-0.5 transition-transform duration-200"
                        >
                            <Image src={product.image} alt={product.title} fill className="object-cover" />
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
