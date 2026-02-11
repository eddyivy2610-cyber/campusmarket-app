"use client";

import { useState } from "react";
import { Search, Filter, Plus, PackageOpen, CheckCircle, Archive, LayoutGrid, List } from "lucide-react";
import { ProductCard } from "../explore/ProductCard";

export function ListingGrid() {
    const [filter, setFilter] = useState<"active" | "sold">("active");

    // Mock data for profiles
    const listings = [
        {
            id: 1,
            title: "iPhone 13 Pro Max - Pristine",
            price: "450,000",
            category: "Phones & Gadgets",
            image: "https://images.unsplash.com/photo-1569183091671-696402586b9c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8cGhvbmVzfGVufDB8fDB8fHww",
            status: "active",
            rating: 4.9,
            location: "Kilimanjaro Hall"
        },
        {
            id: 2,
            title: "Macbook Air M1 (Silver)",
            price: "520,000",
            category: "Laptops",
            image: "https://images.unsplash.com/photo-1569770218135-bea267ed7e84?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fG1hY2Jvb2slMjBwcm98ZW58MHx8MHx8fDA%3D",
            status: "active",
            rating: 4.8,
            location: "Faculty of Engineering"
        },
        {
            id: 3,
            title: "Student Study Desk",
            price: "15,000",
            category: "Hostel Essentials",
            image: "https://images.unsplash.com/photo-1611269154421-4e27233ac5c7?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fHN0dWR5JTIwZGVza3xlbnwwfHwwfHx8MA%3D%3D",
            status: "sold",
            rating: 4.5,
            location: "Abuja Hostel"
        }
    ];

    const filteredListings = listings.filter(l => l.status === filter);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* simple filter bar */}
            <div className="flex items-center gap-4 border-b border-foreground/5 pb-4">
                <button
                    onClick={() => setFilter("active")}
                    className={`text-xs font-bold uppercase tracking-tight transition-colors ${filter === 'active' ? 'text-foreground' : 'text-gray-400 hover:text-gray-300'}`}
                >
                    Active Listings <span className="text-[10px] ml-1 opacity-60">({listings.filter(l => l.status === "active").length})</span>
                </button>
                <div className="w-px h-3 bg-foreground/10"></div>
                <button
                    onClick={() => setFilter("sold")}
                    className={`text-xs font-bold uppercase tracking-tight transition-colors ${filter === 'sold' ? 'text-foreground' : 'text-gray-400 hover:text-gray-300'}`}
                >
                    Sold History <span className="text-[10px] ml-1 opacity-60">({listings.filter(l => l.status === "sold").length})</span>
                </button>
            </div>

            {/* Grid */}
            {filteredListings.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredListings.map((item) => (
                        <div key={item.id} className="relative group">
                            <ProductCard {...item} />
                            {item.status === 'sold' && (
                                <div className="absolute inset-x-0 bottom-0 top-0 bg-background/60 backdrop-blur-[1px] rounded-xl z-10 flex items-center justify-center p-6 text-center pointer-events-none">
                                    <div className="bg-emerald-500 text-white px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-tighter transform -rotate-6 shadow-xl border-2 border-white/20">
                                        Sold
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-24 text-center bg-secondary/30 rounded-2xl border border-dashed border-foreground/10">
                    <p className="text-gray-400 font-medium text-sm">No items found in this category.</p>
                </div>
            )}
        </div>
    );
}
