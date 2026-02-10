"use client";

import { useState } from "react";
import { Search, Filter, Plus, PackageOpen, CheckCircle, Archive } from "lucide-react";
import { ProductCard } from "../explore/ProductCard";

export function ListingGrid() {
    const [filter, setFilter] = useState<"active" | "sold" | "archived">("active");

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
            image: "https://images.unsplash.com/photo-1569770218135-bea267ed7e84?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bWFjYm9vayUyMHByb3xlbnwwfHwwfHx8MA%3D%3D",
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
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Action Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-2 bg-background/50 p-1 rounded-2xl border border-white/5 shadow-inner">
                    <button
                        onClick={() => setFilter("active")}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === "active" ? 'bg-primary text-white shadow-xl' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        <PackageOpen className="w-3.5 h-3.5" />
                        <span>Active ({listings.filter(l => l.status === "active").length})</span>
                    </button>
                    <button
                        onClick={() => setFilter("sold")}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === "sold" ? 'bg-emerald-500 text-white shadow-xl' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Sold ({listings.filter(l => l.status === "sold").length})</span>
                    </button>
                    <button
                        onClick={() => setFilter("archived")}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === "archived" ? 'bg-secondary text-white shadow-xl' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        <Archive className="w-3.5 h-3.5" />
                        <span>Archived (0)</span>
                    </button>
                </div>

                <button className="flex items-center gap-2 bg-white text-black font-black py-3 px-8 rounded-2xl shadow-xl hover:bg-gray-100 transition-all active:scale-95 text-[10px] uppercase tracking-widest">
                    <Plus className="w-4 h-4" />
                    <span>Create New Listing</span>
                </button>
            </div>

            {/* Grid */}
            {filteredListings.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredListings.map((item) => (
                        <div key={item.id} className="relative group">
                            <ProductCard {...item} />
                            {item.status === 'sold' && (
                                <div className="absolute inset-x-0 bottom-0 top-0 bg-background/60 backdrop-blur-[2px] rounded-3xl z-10 flex items-center justify-center p-6 text-center pointer-events-none">
                                    <div className="bg-emerald-500 text-white px-6 py-2 rounded-full font-black text-sm uppercase tracking-tighter transform -rotate-12 shadow-2xl border-4 border-white/20">
                                        Sold Successfully!
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-32 text-center bg-white/5 rounded-[2.5rem] border border-dashed border-white/10">
                    <div className="w-20 h-20 bg-secondary/50 rounded-full flex items-center justify-center mb-6">
                        <PackageOpen className="w-10 h-10 text-gray-700" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">No {filter} items yet</h3>
                    <p className="text-gray-500 text-sm max-w-xs mx-auto">Items you list for sale will appear here once they are published.</p>
                </div>
            )}
        </div>
    );
}
