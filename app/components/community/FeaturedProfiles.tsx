"use client";

import { ChevronRight, BadgeCheck, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface ProfileItem {
    id: string;
    name: string;
    handle?: string;
    bio: string;
    avatar: string;
    recommendedCount?: number;
    notRecommendedCount?: number;
}

const POPULAR_PROFILES: ProfileItem[] = [
    { id: "1", name: "Emma's Ceramics", bio: "Handmade pottery & home decor", avatar: "/placeholder-avatar-1.jpg" },
    { id: "2", name: "Vintage Treasures", bio: "Curated antiques & collectibles", avatar: "/placeholder-avatar-2.jpg" },
    { id: "3", name: "Digital Art Studio", bio: "Modern digital prints & designs", avatar: "/placeholder-avatar-3.jpg" },
];

const NEW_PROFILES: ProfileItem[] = [
    { id: "4", name: "Woodwork Wonders", bio: "Custom wooden furniture & decor", avatar: "/placeholder-avatar-4.jpg" },
    { id: "5", name: "Silver & Stone", bio: "Handcrafted jewelry & accessories", avatar: "/placeholder-avatar-5.jpg" },
    { id: "6", name: "Organic Essentials", bio: "Natural skincare & wellness products", avatar: "/placeholder-avatar-6.jpg" },
];

const NOTEWORTHY_PROFILES: ProfileItem[] = [
    { id: "7", name: "Sweet Creations", bio: "Artisanal baked goods & treats", avatar: "/placeholder-avatar-7.jpg" },
    { id: "8", name: "Tech Innovations", bio: "Unique tech gadgets & accessories", avatar: "/placeholder-avatar-8.jpg" },
    { id: "9", name: "Sustainable Living", bio: "Eco-friendly products & zero waste", avatar: "/placeholder-avatar-9.jpg" },
];

function ProfileList({ title, profiles }: { title: string; profiles: ProfileItem[] }) {
    return (
        <div className="bg-card border border-border/40 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg">{title}</h3>
                <Link href="#" className="text-xs font-semibold text-primary hover:underline">
                    View All
                </Link>
            </div>
            <div className="space-y-4">
                {profiles.map((profile) => (
                    <div key={profile.id} className="flex items-center gap-4 group cursor-pointer">
                        <div className="w-12 h-12 rounded-full bg-secondary overflow-hidden shrink-0 relative">
                            {/* Placeholder for avatar image */}
                            <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500 font-bold text-sm">
                                {profile.name.charAt(0)}
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                                {profile.name}
                            </h4>
                            <p className="text-xs text-muted-foreground truncate">
                                {profile.bio}
                            </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export function FeaturedProfiles() {
    return (
        <section className="py-8">
            <h2 className="text-2xl font-bold mb-8">Featured Marketplace Profiles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ProfileList title="Popular Profiles" profiles={POPULAR_PROFILES} />
                <ProfileList title="New Profiles" profiles={NEW_PROFILES} />
                <ProfileList title="Noteworthy Profiles" profiles={NOTEWORTHY_PROFILES} />
            </div>
        </section>
    );
}
