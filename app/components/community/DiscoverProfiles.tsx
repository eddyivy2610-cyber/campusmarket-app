"use client";

import { Star, RefreshCw } from "lucide-react";
import Link from "next/link";

interface DiscoverProfile {
    id: string;
    name: string;
    category: string;
    rating: number;
    color: string;
}

const DISCOVER_PROFILES: DiscoverProfile[] = [
    { id: "1", name: "Michael's Workshop", category: "Custom furniture & woodworking", rating: 4.7, color: "bg-blue-500" },
    { id: "2", name: "Gems & Jewelry", category: "Handcrafted fine jewelry designs", rating: 5.0, color: "bg-fuchsia-500" },
    { id: "3", name: "Organic Delights", category: "Homemade organic food products", rating: 4.2, color: "bg-emerald-500" },
    { id: "4", name: "Tech Accessories Pro", category: "Innovative tech products & gadgets", rating: 4.6, color: "bg-amber-500" },
    { id: "5", name: "Campus Prints", category: "Custom T-shirts & merch printing", rating: 4.4, color: "bg-rose-500" },
    { id: "6", name: "Study Buddy", category: "Tutoring & academic help services", rating: 4.9, color: "bg-indigo-500" },
    { id: "7", name: "Fresh Eats", category: "Homemade meals & snacks on campus", rating: 4.3, color: "bg-orange-500" },
    { id: "8", name: "Laundry Champs", category: "Pickup & drop laundry services", rating: 4.5, color: "bg-teal-500" },
    { id: "9", name: "Photo & Film Co.", category: "Photography for events & portraits", rating: 4.8, color: "bg-violet-500" },
];

export function DiscoverProfiles() {
    return (
        <section className="py-8">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black">Discover More Profiles</h2>
                <button className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
                    <RefreshCw className="w-4 h-4" />
                    <span className="hidden sm:inline">Refresh</span>
                </button>
            </div>

            {/* 3×3 grid — 1 col on mobile, 2 on sm, 3 on md+ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {DISCOVER_PROFILES.map((profile) => (
                    <div
                        key={profile.id}
                        className="bg-card border border-border/40 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col"
                    >
                        {/* Colour header */}
                        <div className={`h-24 ${profile.color} w-full`} />

                        {/* Body */}
                        <div className="px-6 pb-6 pt-0 flex-1 flex flex-col items-center -mt-10">
                            {/* Avatar */}
                            <div className="w-20 h-20 rounded-full border-4 border-card bg-secondary flex items-center justify-center text-xl font-bold mb-3 shadow-sm z-10">
                                {profile.name.charAt(0)}
                            </div>

                            <h3 className="font-bold text-center text-lg leading-tight mb-1">
                                {profile.name}
                            </h3>

                            <p className="text-xs text-muted-foreground text-center mb-3 line-clamp-2 h-8">
                                {profile.category}
                            </p>

                            {/* Stars */}
                            <div className="flex items-center gap-1 mb-6 text-amber-500">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        className={`w-3.5 h-3.5 ${star <= Math.round(profile.rating) ? "fill-current" : "text-gray-300 fill-gray-300"}`}
                                    />
                                ))}
                                <span className="text-xs font-bold text-foreground ml-1">{profile.rating}</span>
                            </div>

                            <Link
                                href={`/profile/${profile.id}`}
                                className="mt-auto w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2.5 rounded-full transition-colors text-sm text-center"
                            >
                                View Profile
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-12 flex justify-center">
                <button className="px-8 py-3 rounded-full border border-border/40 font-bold text-sm hover:bg-secondary transition-colors">
                    Load More Profiles
                </button>
            </div>
        </section>
    );
}
