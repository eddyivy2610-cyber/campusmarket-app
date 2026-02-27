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
];

const NEW_PROFILES: ProfileItem[] = [
    { id: "4", name: "Woodwork Wonders", bio: "Custom wooden furniture & decor", avatar: "/placeholder-avatar-4.jpg" },
];

const NOTEWORTHY_PROFILES: ProfileItem[] = [
    { id: "7", name: "Sweet Creations", bio: "Artisanal baked goods & treats", avatar: "/placeholder-avatar-7.jpg" },
];

function ProfileList({ title, profiles }: { title: string; profiles: ProfileItem[] }) {
    return (
        <div className="bg-card border border-border/40 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold font-heading text-lg">{title}</h3>
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
            <h2 className="text-2xl font-extrabold font-heading mb-8">Featured Marketplace Profiles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ProfileList title="Popular Profiles" profiles={POPULAR_PROFILES} />
                <ProfileList title="New Profiles" profiles={NEW_PROFILES} />
                <ProfileList title="Noteworthy Profiles" profiles={NOTEWORTHY_PROFILES} />
            </div>
        </section>
    );
}
