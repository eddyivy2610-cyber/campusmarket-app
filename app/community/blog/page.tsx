"use client";

import { BlogHero } from "../../components/blog/BlogHero";
import { SidebarWidgets } from "../../components/blog/SidebarWidgets";
import { BlogFeatureGrid } from "../../components/blog/BlogFeatureGrid";
import { BlogSpotlight } from "../../components/blog/BlogSpotlight";
import { MarketplaceTips } from "../../components/blog/MarketplaceTips";
import { Announcements } from "../../components/blog/Announcements";

export default function BlogPage() {
    return (
        <div className="space-y-12">
            <BlogHero />

            <div className="flex flex-col lg:flex-row gap-12">
                {/* Main Content */}
                <div className="flex-1 min-w-0">
                    <BlogFeatureGrid />
                    <BlogSpotlight />
                    <MarketplaceTips />
                    <Announcements />
                </div>

                {/* Sidebar */}
                <aside className="w-full lg:w-80 shrink-0">
                    <SidebarWidgets />
                </aside>
            </div>
        </div>
    );
}
