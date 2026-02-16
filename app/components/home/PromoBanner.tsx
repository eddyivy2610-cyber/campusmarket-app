"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function PromoBanner() {
    return (
        <section className="py-12">
            <div className="max-w-[1780px] mx-auto px-4 md:px-8">
                <div className="bg-primary rounded-2xl p-8 md:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl shadow-primary/20">

                    {/* Background Accents */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

                    <div className="relative z-10 text-center md:text-left">
                        <h2 className="text-2xl md:text-4xl font-bold font-heading text-white mb-2">
                            Join our Student Community
                        </h2>
                        <p className="text-primary-foreground/90 font-body max-w-xl text-lg">
                            Connect with thousands of students. Buy securely, sell quickly, and find the best deals on campus.
                        </p>
                    </div>

                    <Link
                        href="/register"
                        className="relative z-10 bg-white text-primary px-8 py-4 rounded-full font-bold font-heading uppercase tracking-wider hover:bg-gray-50 transition-colors shadow-lg flex items-center gap-2 shrink-0"
                    >
                        Join Now
                        <ArrowRight className="w-4 h-4" />
                    </Link>

                </div>
            </div>
        </section>
    );
}
