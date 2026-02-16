"use client";

import { CommunityHero } from "../components/community/CommunityHero";
import { FeaturedProfiles } from "../components/community/FeaturedProfiles";
import { DiscoverProfiles } from "../components/community/DiscoverProfiles";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function CommunityPage() {
    return (
        <div className="space-y-8 pb-12">
            {/* Back to Home */}
            <div>
                <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-bold text-sm w-fit group">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Home
                </Link>
            </div>

            <CommunityHero />
            <FeaturedProfiles />
            <DiscoverProfiles />
        </div>
    );
}
