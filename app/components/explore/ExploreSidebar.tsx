"use client";

import { useState } from "react";
import { Star, ChevronRight, Filter } from "lucide-react";
import Image from "next/image";

export function ExploreSidebar() {
    const [priceRange, setPriceRange] = useState(50000);

    const categories = [
        { name: "Best Seller", count: 24 },
        { name: "Bestsellers", count: 18 },
        { name: "Phones & Gadgets", count: 42 },
        { name: "Hostel Essentials", count: 31 },
        { name: "Laptops", count: 12 },
        { name: "Verified Sellers", count: 56 }
    ];

    return (
        <aside className="space-y-4">
            {/* Price Filter */}
            <div className="bg-secondary rounded-xl p-3 shadow-lg">
                <div className="flex items-center gap-1.5 mb-3">
                    <div className="w-1 h-4 bg-primary rounded-full"></div>
                    <h3 className="text-xs font-black text-foreground uppercase tracking-tight">Price filter</h3>
                </div>

                <input
                    type="range"
                    min="0"
                    max="500000"
                    step="5000"
                    value={priceRange}
                    onChange={(e) => setPriceRange(parseInt(e.target.value))}
                    className="w-full h-1 bg-foreground/10 rounded-lg appearance-none cursor-pointer accent-primary mb-3"
                />

                <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-500 text-[10px] font-black uppercase tracking-tight">₦0 — ₦{priceRange.toLocaleString()}</span>
                </div>

                <button className="w-full py-2 bg-primary text-white rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-orange-600 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-1.5">
                    <Filter className="w-3 h-3" />
                    <span>Apply</span>
                </button>
            </div>

            {/* Categories Sidebar */}
            <div className="bg-secondary rounded-xl p-3 shadow-lg">
                <div className="flex items-center gap-1.5 mb-3">
                    <div className="w-1 h-4 bg-primary rounded-full"></div>
                    <h3 className="text-xs font-black text-foreground uppercase tracking-tight">Categories</h3>
                </div>

                <ul className="space-y-0.5">
                    {categories.map((cat, i) => (
                        <li key={i}>
                            <button className="w-full flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-primary/10 transition-all group text-left">
                                <span className="text-gray-500 font-black text-[9px] uppercase tracking-wide group-hover:text-primary transition-colors">{cat.name}</span>
                                <div className="flex items-center gap-1 text-gray-700">
                                    <span className="text-[8px] font-black">({cat.count})</span>
                                    <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </aside>
    );
}
