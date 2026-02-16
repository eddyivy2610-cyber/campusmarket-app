"use client";

import Link from "next/link";
import { PRODUCTS } from "../../data/products";
import { ProductCard } from "../shop/ProductCard";

export function ProductGrid() {
    return (
        <section className="py-16 md:py-24">
            <div className="max-w-[1780px] mx-auto px-4 md:px-8">

                {/* Section Header */}
                <div className="flex items-end justify-between mb-10">
                    <div>
                        <h2 className="text-3xl font-bold font-heading text-foreground">Featured Products</h2>
                        <p className="text-muted-foreground mt-2 font-body">Fresh deals from students around you</p>
                    </div>
                    <Link href="/listings" className="text-sm font-bold font-heading text-primary hover:text-primary/80 transition-colors uppercase tracking-widest border-b-2 border-primary/20 pb-0.5 hover:border-primary">
                        View All Products
                    </Link>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
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
