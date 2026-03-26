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
        <div className="hidden md:block bg-white border-b border-black/10 text-black">
            <div className="max-w-[1780px] mx-auto px-8">
                <div className="flex items-center gap-8 h-14">

                    {/* All Categories Dropdown Trigger - Full Height Red Button */}
                    <div
                        className="relative h-full"
                        onMouseEnter={() => setIsExploreOpen(true)}
                        onMouseLeave={() => setIsExploreOpen(false)}
                    >
                        <button
                            className="bg-[#e31e24] text-white flex items-center gap-3 px-8 h-full font-bold font-heading text-sm hover:bg-[#c4191f] transition-colors tracking-wide uppercase"
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
                                className="text-sm font-bold font-heading text-black/70 hover:text-black transition-colors uppercase tracking-wider text-[11px]"
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    <div className="ml-auto text-xs font-medium text-black/60">
                        <span className="text-[#e31e24] font-bold">Free Shipping</span> on orders over ₦15,000
                    </div>

                </div>
            </div>
        </div>
    );
}
