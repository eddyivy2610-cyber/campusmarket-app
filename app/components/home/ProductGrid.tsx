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
        <div className="py-8 md:py-12 flex flex-col gap-10 md:gap-16">
            <div className="max-w-[1780px] mx-auto px-4 md:px-8 w-full">

                {/* 1. Today's Deals Section (Carousel) */}
                <section className="mb-10 lg:mb-14 relative group">
                    <div className="flex items-end justify-between mb-4 md:mb-6">
                        <div className="flex items-center gap-3">
                            <h2 className="text-xl md:text-2xl font-bold font-heading text-foreground">Today's Deals</h2>
                            <span className="hidden md:inline-flex bg-red-50 text-red-600 font-bold text-[10px] px-2 py-0.5 rounded-sm uppercase tracking-wider">Ends in 04:23:59</span>
                        </div>
                        <Link href="/promotions/deals" className="text-xs font-bold text-primary hover:text-primary/80 transition-colors uppercase tracking-widest whitespace-nowrap hidden md:block">
                            View All Deals
                        </Link>
                    </div>

                    <div className="flex overflow-x-auto gap-3 md:gap-4 pb-4 snap-x snap-mandatory custom-scrollbar-hide">
                        {todaysDeals.map((product) => (
                            <div key={product.id} className="w-[160px] md:w-[220px] shrink-0 snap-start">
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </div>
                </section>

                {/* 2. Best Sellers Section (Carousel) */}
                <section className="mb-10 lg:mb-14 relative group">
                    <div className="flex items-end justify-between mb-4 md:mb-6">
                        <div>
                            <h2 className="text-xl md:text-2xl font-bold font-heading text-foreground">Best Sellers</h2>
                            <p className="text-muted-foreground mt-0.5 font-body text-[11px] md:text-sm">Trending on campus this week</p>
                        </div>
                        <Link href="/promotions/best-sellers" className="text-xs font-bold text-primary hover:text-primary/80 transition-colors uppercase tracking-widest whitespace-nowrap hidden md:block">
                            View More
                        </Link>
                    </div>

                    <div className="flex overflow-x-auto gap-3 md:gap-4 pb-4 snap-x snap-mandatory custom-scrollbar-hide">
                        {bestSellers.map((product) => (
                            <div key={product.id} className="w-[160px] md:w-[220px] shrink-0 snap-start">
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </div>
                </section>

                {/* 3. More to Explore Section (Grid) */}
                <section>
                    <div className="flex items-end justify-between mb-6 md:mb-8">
                        <div>
                            <h2 className="text-xl md:text-3xl font-bold font-heading text-foreground">More to Explore</h2>
                            <p className="text-muted-foreground mt-1 font-body text-xs md:text-sm">Discover based on your recent activity</p>
                        </div>
                    </div>

                    {/* Infinite Grid — responsive columns */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.1 }}
                        className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 md:gap-5"
                    >
                        {exploreItems.map((product) => (
                            <motion.div variants={itemVariants} key={product.id}>
                                <ProductCard product={product} />
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Lazy loading indicator mocker */}
                    <div className="mt-12 md:mt-16 flex justify-center pb-8 md:pb-12">
                        <button className="bg-secondary/50 hover:bg-secondary text-foreground font-bold px-8 py-3 rounded-full text-sm transition-all duration-300">
                            Load More
                        </button>
                    </div>
                </section>

            </div>
        </div>
    );
}
