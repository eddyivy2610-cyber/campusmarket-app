"use client";

import { motion } from "framer-motion";
import { ArrowRight, TrendingUp } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export function CommunityHero() {
    return (
        <section className="relative w-full h-[200px] md:h-[260px] rounded-3xl overflow-hidden bg-gray-900 border border-border flex items-center shadow-lg">
            {/* Background Image */}
            <Image
                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=2000"
                alt="Community Background"
                fill
                priority
                className="object-cover opacity-50"
            />

            {/* Dark Overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-gray-900/60 to-transparent"></div>

            {/* Content */}
            <div className="relative z-10 w-full flex flex-col justify-center px-6 md:px-12 max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >

                    <h1 className="text-2xl md:text-4xl lg:text-5xl font-extrabold font-heading text-white mb-3 tracking-tight leading-tight">
                        Campus Market Community
                    </h1>

                    <p className="text-sm md:text-base text-white/80 max-w-xl leading-relaxed font-medium">
                        Discover the most popular products and sellers that are making waves in our community marketplace.
                    </p>
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
