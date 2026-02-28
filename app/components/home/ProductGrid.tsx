"use client";

import Link from "next/link";
import { PRODUCTS } from "../../data/products";
import { ProductCard } from "../shop/ProductCard";
import { motion, Variants } from "framer-motion";

export function ProductGrid() {
    // Generate mock arrays by copying the first product multiple times
    const sampleProduct = { ...PRODUCTS[0], originalPrice: PRODUCTS[0].price * 1.5 }; // Add 50% original price

    // Arrays for different sections
    const todaysDeals = Array(15).fill(sampleProduct).map((item, index) => ({ ...item, id: `deal-${index}` }));
    const bestSellers = Array(15).fill(sampleProduct).map((item, index) => ({ ...item, id: `best-${index}` }));
    const exploreItems = Array(40).fill(sampleProduct).map((item, index) => ({ ...item, id: `explore-${index}` }));

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.05 },
        },
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, scale: 0.95, y: 20 },
        visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
    };

    return (
        <div className="flex flex-col gap-10 md:gap-16 w-full">

            {/* 1. Today's Deals Section (Carousel) */}
            <section className="mb-10 lg:mb-14 relative group">
                <div className="flex items-center justify-between mb-4 border-b-2 border-primary pb-2">
                    <div className="flex items-center gap-3 bg-primary text-primary-foreground px-4 py-1.5 rounded-t-lg">
                        <h2 className="text-sm md:text-base font-bold uppercase tracking-wider">Today's Deals</h2>
                    </div>
                    <Link href="/promotions/deals" className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest hidden md:block">
                        View All Deals
                    </Link>
                </div>

                <div className="flex overflow-x-auto gap-3 md:gap-4 pb-4 snap-x snap-mandatory custom-scrollbar-hide">
                    {todaysDeals.map((product) => (
                        <div key={product.id} className="w-[160px] md:w-[200px] shrink-0 snap-start">
                            <ProductCard product={product} />
                        </div>
                    ))}
                </div>
            </section>

            {/* 2. Best Sellers Section (Carousel) */}
            <section className="mb-10 lg:mb-14 relative group">
                <div className="flex items-center justify-between mb-4 border-b-2 border-rose-500 pb-2">
                    <div className="flex items-center gap-3 bg-rose-500 text-white px-4 py-1.5 rounded-t-lg">
                        <h2 className="text-sm md:text-base font-bold uppercase tracking-wider">Best Sellers</h2>
                    </div>
                    <Link href="/promotions/best-sellers" className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest hidden md:block">
                        Top Trending
                    </Link>
                </div>

                <div className="flex overflow-x-auto gap-3 md:gap-4 pb-4 snap-x snap-mandatory custom-scrollbar-hide">
                    {bestSellers.map((product) => (
                        <div key={product.id} className="w-[160px] md:w-[200px] shrink-0 snap-start">
                            <ProductCard product={product} />
                        </div>
                    ))}
                </div>
            </section>

            {/* 3. More to Explore Section (Grid) */}
            <section>
                <div className="flex items-center justify-between mb-6 border-b-2 border-blue-500 pb-2">
                    <div className="flex items-center gap-3 bg-blue-500 text-white px-4 py-1.5 rounded-t-lg">
                        <h2 className="text-sm md:text-base font-bold uppercase tracking-wider">More to Explore</h2>
                    </div>
                </div>

                {/* Infinite Grid — updated for narrower content area */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.1 }}
                    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4"
                >
                    {exploreItems.map((product) => (
                        <motion.div variants={itemVariants} key={product.id}>
                            <ProductCard product={product} />
                        </motion.div>
                    ))}
                </motion.div>

                {/* Lazy loading indicator mocker */}
                <div className="mt-10 flex justify-center pb-8">
                    <button className="bg-secondary hover:bg-secondary/80 text-foreground font-bold px-8 py-3 rounded-xl text-sm transition-all duration-300">
                        Load More Products
                    </button>
                </div>
            </section>
        </div>
    );
}
