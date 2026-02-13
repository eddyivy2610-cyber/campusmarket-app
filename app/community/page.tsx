"use client";

import { CommunityHero } from "../components/community/CommunityHero";
import { CommunitySearch } from "../components/community/CommunitySearch";
import { FeaturedProfiles } from "../components/community/FeaturedProfiles";
import { DiscoverProfiles } from "../components/community/DiscoverProfiles";

export default function CommunityPage() {
    return (
        <div className="space-y-8 pb-12">
            <CommunityHero />
            <CommunitySearch />
            <FeaturedProfiles />
            <DiscoverProfiles />
        </div>
    );
}
