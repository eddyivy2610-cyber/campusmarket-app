"use client";

import Link from "next/link";
import { PRODUCTS } from "../../data/products";
import { ProductCard } from "../shop/ProductCard";

export function ProductGrid() {
    return (
        <section className="py-8 md:py-24">
            <div className="max-w-[1780px] mx-auto px-3 md:px-8">

                {/* Section Header */}
                <div className="flex items-end justify-between mb-6 md:mb-10">
                    <div>
                        <h2 className="text-xl md:text-3xl font-bold font-heading text-foreground">Featured Products</h2>
                        <p className="text-muted-foreground mt-1 font-body text-xs md:text-base">Fresh deals from students around you</p>
                    </div>
                    <Link
                        href="/listings"
                        className="text-xs font-bold font-heading text-primary hover:text-primary/80 transition-colors uppercase tracking-widest border-b-2 border-primary/20 pb-0.5 hover:border-primary whitespace-nowrap"
                    >
                        View All
                    </Link>
                </div>

                {/* Grid — 2 cols on mobile, 3 on md, 4 on lg */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-8">
                    {PRODUCTS.map((product) => (
                        <Link key={product.id} href={`/listings/${product.id}`}>
                            <ProductCard product={product} />
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
