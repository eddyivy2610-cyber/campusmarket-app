"use client";

import { Home, ChevronRight, ChevronDown, SlidersHorizontal, ArrowUpDown, LayoutGrid } from "lucide-react";
import Link from "next/link";

export function ExploreHeader() {
    return (
        <div className="space-y-2">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-gray-400 mb-2">
                <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1">
                    <Home className="w-3.5 h-3.5 mb-0.5" />
                    <span>Home</span>
                </Link>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-primary">Marketplace</span>
            </nav>

            {/* Desktop Header Content */}
            <div className="hidden lg:flex items-end justify-between border-b border-border pb-4">
                <div>
                    <h1 className="text-2xl font-black text-foreground tracking-tight">Explore Listings</h1>
                    <p className="text-sm text-gray-500 font-medium mt-1">Showing <span className="text-foreground font-bold">128</span> items near you</p>
                </div>

                <button className="flex items-center gap-2 bg-secondary hover:bg-secondary/80 px-4 py-2 rounded-xl transition-all font-bold text-sm text-foreground">
                    <span>Sort by: <span className="text-primary">Newest</span></span>
                    <ChevronDown className="w-4 h-4" />
                </button>
            </div>

            {/* Mobile Sticky Controls (Categories, Sort, Filters) */}
            <div className="lg:hidden sticky top-[60px] z-20 bg-background/95 backdrop-blur-xl -mx-4 px-4 py-2 border-b border-border flex items-center justify-between gap-2 shadow-sm">
                <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-secondary rounded-xl text-xs font-bold text-foreground active:scale-95 transition-all">
                    <LayoutGrid className="w-3.5 h-3.5" />
                    Categories
                </button>
                <div className="w-px h-6 bg-gray-200 dark:bg-white/10"></div>
                <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-secondary rounded-xl text-xs font-bold text-foreground active:scale-95 transition-all">
                    <ArrowUpDown className="w-3.5 h-3.5" />
                    Sort
                </button>
                <div className="w-px h-6 bg-gray-200 dark:bg-white/10"></div>
                <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary text-white rounded-xl text-xs font-bold active:scale-95 transition-all shadow-lg shadow-primary/20">
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    Filters
                </button>
            </div>
        </div>
    );
}
