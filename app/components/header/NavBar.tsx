"use client";

import { LayoutGrid, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ExploreDropdown } from "./ExploreDropdown";

export function NavBar() {
    const [isExploreOpen, setIsExploreOpen] = useState(false);

    return (
        <div className="hidden md:block bg-[#111] border-b border-accent/20 text-white">
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
                        {['Home', 'Listings', 'Vendors', 'Blog', 'Contact'].map((item) => (
                            <Link
                                key={item}
                                href={item === 'Home' ? '/' : (item === 'Vendors' ? '/profile/campus-market' : `/${item.toLowerCase()}`)}
                                className="text-sm font-bold font-heading text-gray-300 hover:text-white transition-colors uppercase tracking-wider text-[11px]"
                            >
                                {item}
                            </Link>
                        ))}
                    </nav>

                    <div className="ml-auto text-xs font-medium text-gray-400">
                        <span className="text-[#e31e24] font-bold">Free Shipping</span> on orders over ₦15,000
                    </div>

                </div>
            </div>
        </div>
    );
}
