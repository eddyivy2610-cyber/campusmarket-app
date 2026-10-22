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
                <h2 className="text-2xl font-extrabold font-heading">Discover More Profiles</h2>
                <button className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
                    <RefreshCw className="w-4 h-4" />
                    <span className="hidden sm:inline">Refresh</span>
                </button>
            </div>

            {/* 3×3 grid — 1 col on mobile, 2 on sm, 3 on md+ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {DISCOVER_PROFILES.map((profile) => (
                    <div
                        key={profile.id}
                        className="bg-card border border-border/40 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group flex gap-3 p-3 relative"
                    >
                        {/* Avatar */}
                        <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-border/50 bg-secondary flex items-center justify-center text-lg font-bold">
                            {profile.name.charAt(0)}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <h3 className="font-bold text-sm text-foreground truncate group-hover:text-primary transition-colors pr-6">
                                {profile.name}
                            </h3>
                            <p className="text-xs text-muted-foreground truncate mb-1">
                                {profile.category}
                            </p>

                            <div className="flex items-center gap-1 mt-auto">
                                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                <span className="text-[10px] font-bold text-muted-foreground">
                                    {(profile.recommendedCount / (profile.recommendedCount + profile.notRecommendedCount || 1) * 100).toFixed(0)}% Recommended
                                </span>
                            </div>
                        </div>

                        {/* View Action overlay (hidden until hover) */}
                        <div className="absolute inset-0 bg-background/80 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                            <Link
                                href={`/profile/${profile.id}`}
                                className="bg-primary text-primary-foreground font-bold px-4 py-1.5 rounded-full text-xs pointer-events-auto transform translate-y-2 group-hover:translate-y-0 transition-all shadow-sm"
                            >
                                View Profile
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 flex justify-center">
                <button className="px-6 py-2.5 rounded-full border border-border/40 font-bold text-xs hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
                    Load More Profiles
                </button>
            </div>
        </section>
    );
}
