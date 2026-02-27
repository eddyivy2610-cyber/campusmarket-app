"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export function PromoBanner() {
    return (
        <section className="py-0 overflow-hidden">
            <div className="max-w-[1780px] mx-auto px-4 md:px-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 30 }}
                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="bg-primary rounded-xl p-3 md:py-3 md:px-6 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-4 shadow-md shadow-primary/20"
                >

                    {/* Background accents */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

                    {/* Text */}
                    <div className="relative z-10 text-center md:text-left">
                        <h2 className="text-lg md:text-2xl font-bold font-heading text-white mb-0.5">
                            Join our Student Community
                        </h2>
                        <p className="text-primary-foreground/90 font-body max-w-2xl text-xs md:text-sm">
                            Connect with thousands of students. Buy securely, sell quickly, and find the best deals on campus.
                        </p>
                    </div>

                    {/* CTA — large button on desktop, underlined link on mobile */}
                    <div className="relative z-10 shrink-0 mt-2 md:mt-0">
                        {/* Mobile: button */}
                        <Link
                            href="/register"
                            className="md:hidden bg-white text-primary px-4 py-1.5 rounded-full font-bold uppercase tracking-wider text-[10px] hover:bg-gray-50 transition-colors shadow-sm items-center flex gap-1 font-heading"
                        >
                            Join Now <ArrowRight className="w-3 h-3" />
                        </Link>

                        {/* Desktop: styled button */}
                        <Link
                            href="/register"
                            className="hidden md:flex bg-white text-primary px-5 py-2 rounded-full font-bold font-heading uppercase tracking-wider text-xs hover:bg-gray-50 transition-colors shadow-sm items-center gap-1.5"
                        >
                            Join Now
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
