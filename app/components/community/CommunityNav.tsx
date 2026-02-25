"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, BookOpen, User, Search } from "lucide-react";

export function CommunityNav() {
    return (
        <div className="w-full bg-background border-b border-border sticky top-[73px] z-30">
            <div className="max-w-[1780px] mx-auto px-4 md:px-8">
                <div className="flex items-center justify-between h-14">
                    {/* Tabs */}
                    <div className="flex items-center gap-4 md:gap-8 h-full">
                        <Link
                            href="/community"
                            className="relative h-full flex items-center gap-2 text-sm font-bold transition-colors text-primary"
                        >
                            <ShoppingBag className="w-4 h-4" />
                            <span>Community</span>
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
