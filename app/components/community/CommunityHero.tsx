"use client";

import { motion } from "framer-motion";
import { ArrowRight, TrendingUp } from "lucide-react";
import Link from "next/link";

export function CommunityHero() {
    return (
        <section className="relative w-full h-[300px] md:h-[400px] rounded-3xl overflow-hidden bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border border-border shadow-2xl">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-20">
                <div className="absolute inset-0" style={{
                    backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                    backgroundSize: '40px 40px',
                }}></div>
            </div>

            {/* Content */}
            <div className="relative z-10 h-full flex flex-col justify-center px-8 md:px-16 max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-6 border border-primary/20 w-fit">
                        <TrendingUp className="w-3 h-3" />
                        <span>News</span>
                    </span>

                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight leading-tight">
                        Trending This Month
                    </h1>

                    <p className="text-lg text-white/70 mb-8 max-w-xl leading-relaxed">
                        Discover the most popular products and sellers that are making waves in our community marketplace.
                    </p>

                    <button className="bg-primary-foreground text-foreground hover:bg-primary-foreground/90 transition-colors px-8 py-3.5 rounded-full font-bold flex items-center gap-2 w-fit group">
                        <span>Explore Trends</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                </motion.div>
            </div>

            {/* Vector Illustration Placeholder (Right Side) */}
            <div className="absolute right-0 bottom-0 top-0 w-1/2 opacity-30 md:opacity-100 pointer-events-none">
                {/* We can use an image or svg here later */}
                <div className="w-full h-full bg-gradient-to-l from-primary/10 to-transparent" />
            </div>
        </section>
    );
}
