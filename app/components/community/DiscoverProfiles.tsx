"use client";

import { Star, RefreshCw } from "lucide-react";
import Link from "next/link";

interface DiscoverProfile {
    id: string;
    name: string;
    category: string;
    recommendedCount: number;
    notRecommendedCount: number;
    color: string;
}

const DISCOVER_PROFILES: DiscoverProfile[] = [
    { id: "1", name: "Michael's Workshop", category: "Custom furniture & woodworking", recommendedCount: 47, notRecommendedCount: 3, color: "bg-blue-500" },
    { id: "2", name: "Gems & Jewelry", category: "Handcrafted fine jewelry designs", recommendedCount: 50, notRecommendedCount: 0, color: "bg-fuchsia-500" },
];

export function DiscoverProfiles() {
    return (
        <section id="discover" className="py-8">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold">Discover More Profiles</h2>
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

                            {/* Recommendation Rate */}
                            <div className="flex items-center gap-1.5 mb-6 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span className="text-[10px] font-bold uppercase tracking-widest">
                                    {Math.round((profile.recommendedCount / (profile.recommendedCount + profile.notRecommendedCount || 1)) * 100)}% Match
                                </span>
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
