"use client";

import { LayoutGrid, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ExploreDropdown } from "./ExploreDropdown";

const NAV_ITEMS = [
    { label: "Home", href: "/home" },
    { label: "Listings", href: "/listings" },
    { label: "Vendors", href: "/profile/campus-market" },
    { label: "Blog", href: "/blog" },
    { label: "Help & Support", href: "/help-support" },
];

export function NavBar() {
    const [isExploreOpen, setIsExploreOpen] = useState(false);

    return (
        <div className="hidden md:block bg-background border-b border-border/60 text-foreground">
            <div className="max-w-[1780px] mx-auto px-8">
                <div className="flex items-center gap-8 h-14">

                    {/* All Categories Dropdown Trigger */}
                    <div
                        className="relative h-full"
                        onMouseEnter={() => setIsExploreOpen(true)}
                        onMouseLeave={() => setIsExploreOpen(false)}
                    >
                        <button
                            className="bg-primary text-primary-foreground flex items-center gap-3 px-8 h-full font-bold font-heading text-sm hover:bg-primary/90 transition-colors tracking-wide uppercase"
                        >
                            <LayoutGrid className="w-5 h-5" />
                            <span>All Categories</span>
                            <ChevronDown className="w-4 h-4 ml-2" />
                        </button>

                        <div className="absolute top-full left-0 z-50">
                            <ExploreDropdown isOpen={isExploreOpen} />
                        </div>
                    </div>

                    {/* Horizontal Menu Links */}
                    <nav className="flex items-center gap-8">
                        {NAV_ITEMS.map((item) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                className="text-[11px] font-bold font-heading text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider"
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    <div className="ml-auto text-xs font-medium text-muted-foreground">
                        <span className="text-primary font-bold">Free Shipping</span> on orders over ₦15,000
                    </div>

                </div>
            </div>
        </div>
    );
}
