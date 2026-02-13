"use client";

import { Header } from "../components/header/Header";
import { Footer } from "../components/sections/Footer";
import { Heart, Home, ChevronRight, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function WishlistPage() {
    return (
        <main className="min-h-screen bg-background text-foreground overflow-x-hidden">
            <Header />

            <div className="container mx-auto px-4 py-8 max-w-7xl">
                {/* Breadcrumb */}
                <div className="flex flex-col gap-4 mb-8">
                    <div className="flex items-center gap-2 text-sm font-bold tracking-widest uppercase">
                        <Link href="/" className="text-primary hover:text-orange-600 transition-colors flex items-center gap-1">
                            <Home className="w-4 h-4 mb-0.5" />
                            <span>Home</span>
                        </Link>
                        <ChevronRight className="w-4 h-4 text-gray-300" />
                        <span className="text-primary">Wishlist</span>
                    </div>
                </div>

                {/* Empty Wishlist State */}
                <div className="flex flex-col items-center justify-center py-16 md:py-24">
                    <div className="relative mb-8">
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-secondary border border-border flex items-center justify-center">
                            <Heart className="w-16 h-16 md:w-20 md:h-20 text-gray-400" strokeWidth={1.5} />
                        </div>
                        {/* Decorative element */}
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary/20 rounded-full animate-pulse"></div>
                    </div>

                    <h2 className="text-2xl md:text-3xl font-bold font-sans text-center mb-3">
                        Your wishlist is currently empty
                    </h2>
                    <p className="text-gray-400 text-center mb-8 max-w-md mx-auto">
                        You don't have any products in the list yet. You will find a lot of interesting products when you explore our market.
                    </p>

                    <Link
                        href="/explore"
                        className="bg-primary text-white font-bold py-3 px-8 rounded-full shadow-lg shadow-primary/20 hover:bg-orange-600 hover:scale-105 transition-all duration-300 flex items-center gap-2"
                    >
                        Return to shop
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>

            <Footer />
        </main>
    );
}
