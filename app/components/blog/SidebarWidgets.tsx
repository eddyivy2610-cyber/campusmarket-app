"use client";

import Link from "next/link";
import { ArrowRight, Tag } from "lucide-react";
import { CATEGORIES } from "../../data/products";

interface TrendingPost {
    id: string;
    title: string;
    reads: string;
    time: string;
    rank: number;
}

const TRENDING_POSTS: TrendingPost[] = [
    { id: "1", rank: 1, title: "The Ultimate Guide to Finding Off-Campus Housing", reads: "1.2K reads", time: "5 days ago" },
    { id: "2", rank: 2, title: "How I Made $3,000 Selling My Old Course Materials", reads: "986 reads", time: "1 week ago" },
    { id: "3", rank: 3, title: "5 Campus Study Spots No One Knows About", reads: "754 reads", time: "2 weeks ago" },
    { id: "4", rank: 4, title: "The Freshman's Guide to Campus Marketplace", reads: "621 reads", time: "3 weeks ago" },
    { id: "5", rank: 5, title: "Dorm Room Essentials You Can Find Used", reads: "589 reads", time: "3 weeks ago" },
];


export function SidebarWidgets() {
    return (
        <div className="space-y-8 sticky top-24">

            {/* Trending Posts */}
            <div className="bg-card border border-border/40 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <span className="text-primary">🔥</span> Trending Posts
                    </h3>
                </div>
                <div className="space-y-5">
                    {TRENDING_POSTS.map((post) => (
                        <Link key={post.id} href="#" className="flex gap-4 group">
                            <span className="text-2xl font-black text-gray-200 group-hover:text-primary/50 transition-colors w-8 text-center shrink-0">
                                {String(post.rank).padStart(2, '0')}
                            </span>
                            <div>
                                <h4 className="font-semibold text-sm leading-snug mb-1 group-hover:text-primary transition-colors line-clamp-2">
                                    {post.title}
                                </h4>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span>{post.reads}</span>
                                    <span>•</span>
                                    <span>{post.time}</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Categories */}
            <div className="bg-card border border-border/40 rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-primary" /> Categories
                </h3>
                <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((cat) => (
                        <Link key={cat.name} href="#" className="px-3 py-1.5 bg-secondary text-secondary-foreground text-xs font-semibold rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors">
                            {cat.name}
                        </Link>
                    ))}
                </div>
            </div>

            {/* Newsletter Removed (Now in Footer) */}

        </div>
    );
}
