"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { useState } from "react";

const FILTER_PILLS = [
    "Handmade",
    "Digital Products",
    "Services",
    "Vintage",
    "Home Decor",
    "Clothing",
    "Textbooks"
];

export function CommunitySearch() {
    const [activeFilter, setActiveFilter] = useState<string | null>(null);

    return (
        <section className="py-8">
            <div className="w-full max-w-4xl mx-auto space-y-6">
                {/* Search Bar */}
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search for profiles, products, or services..."
                        className="block w-full pl-14 pr-24 py-4 md:py-5 bg-background border border-border/40 rounded-full text-base shadow-sm hover:shadow-md focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                    />
                    <div className="absolute inset-y-0 right-2 flex items-center">
                        <button className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2.5 px-6 rounded-full transition-colors text-sm">
                            Search
                        </button>
                    </div>
                </div>

                {/* Filter Pills */}
                <div className="flex flex-wrap items-center justify-center gap-2">
                    <button
                        className="p-2 rounded-full border border-dashed border-border/40 hover:border-primary/50 text-muted-foreground hover:text-primary transition-colors"
                        title="More Filters"
                    >
                        <SlidersHorizontal className="w-4 h-4" />
                    </button>
                    {FILTER_PILLS.map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(activeFilter === filter ? null : filter)}
                            className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ${activeFilter === filter
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-secondary/50 text-secondary-foreground border-transparent hover:bg-secondary hover:border-border/40"
                                }`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
}
