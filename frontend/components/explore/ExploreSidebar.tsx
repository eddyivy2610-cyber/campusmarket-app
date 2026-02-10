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

    const reviews = [
        { name: "Macbook Air M1", user: "Laura", rating: 5, image: "https://images.unsplash.com/photo-1517336713734-60284ed88272?auto=format&fit=crop&q=80&w=200" },
        { name: "Study Table", user: "Sophie", rating: 4, image: "https://images.unsplash.com/photo-1518455027359-f3f8139ca67e?auto=format&fit=crop&q=80&w=200" },
        { name: "iPhone 13 Pro", user: "Emily", rating: 5, image: "https://images.unsplash.com/photo-1632661674596-df8be070a5c5?auto=format&fit=crop&q=80&w=200" }
    ];

    return (
        <aside className="space-y-4">
            {/* Price Filter */}
            <div className="bg-secondary rounded-xl p-3 border border-foreground/10 shadow-xl">
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
            <div className="bg-secondary rounded-xl p-3 border border-foreground/10 shadow-xl">
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

            {/* Recent Reviews Panel */}
            <div className="bg-secondary rounded-[1.2rem] p-4 border border-foreground/10 shadow-xl">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-5 bg-primary rounded-full"></div>
                    <h3 className="text-sm font-black text-foreground uppercase tracking-tight">Recent reviews</h3>
                </div>

                <div className="space-y-4">
                    {reviews.map((rev, i) => (
                        <div key={i} className="flex gap-3 group cursor-pointer border-b border-foreground/10 pb-4 last:border-0 last:pb-0">
                            <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-foreground/10 shrink-0">
                                <Image src={rev.image} alt={rev.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-[11px] font-bold text-foreground truncate group-hover:text-primary transition-colors uppercase tracking-tight">{rev.name}</h4>
                                <div className="flex items-center gap-0.5 mb-0.5">
                                    {[...Array(5)].map((_, star) => (
                                        <Star key={star} className={`w-2 h-2 ${star < rev.rating ? 'fill-yellow-400 text-yellow-400' : 'text-foreground/10'}`} />
                                    ))}
                                </div>
                                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">by <span className="text-gray-400">{rev.user}</span></p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </aside>
    );
}
