"use client";

import {
    Flame, DollarSign, Clock, Sparkles, Star, GraduationCap,
    Smartphone, Laptop, Headphones, BookOpen, Home, Shirt,
    UtensilsCrossed, Wrench, Repeat, ArrowRight
} from "lucide-react";

interface ExploreDropdownProps {
    isOpen: boolean;
}

export function ExploreDropdown({ isOpen }: ExploreDropdownProps) {
    return (
        <div
            className={`absolute top-full left-0 right-0 mt-2 bg-secondary text-foreground rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ease-in-out ${isOpen
                ? 'opacity-100 translate-y-0 visible'
                : 'opacity-0 -translate-y-4 invisible'
                }`}
        >
            <div className="flex p-6 gap-6">
                {/* Column 1: Top Tags */}
                <div className="flex-1">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Top Tags</h3>
                    <div className="space-y-1.5">
                        <a href="#" className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors text-sm">
                            <Flame className="w-3.5 h-3.5 text-primary" />
                            <span>Trending</span>
                        </a>
                        <a href="#" className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors text-sm">
                            <DollarSign className="w-3.5 h-3.5 text-primary" />
                            <span>Budget Deals</span>
                        </a>
                        <a href="#" className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors text-sm">
                            <Clock className="w-3.5 h-3.5 text-primary" />
                            <span>Urgent Sale</span>
                        </a>
                        <a href="#" className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors text-sm">
                            <Sparkles className="w-3.5 h-3.5 text-primary" />
                            <span>Just Listed</span>
                        </a>
                        <a href="#" className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors text-sm">
                            <Star className="w-3.5 h-3.5 text-primary" />
                            <span>Highly Rated</span>
                        </a>
                        <a href="#" className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors text-sm">
                            <GraduationCap className="w-3.5 h-3.5 text-primary" />
                            <span>Student Verified</span>
                        </a>
                    </div>
                </div>

                {/* Vertical Divider */}
                <div className="w-px bg-white/10"></div>

                {/* Column 2: New & Recents */}
                <div className="flex-1">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">New & Recents</h3>
                    <div className="space-y-1.5">
                        <a href="#" className="flex items-center py-1.5 px-2 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors text-sm">
                            New Today
                        </a>
                        <a href="#" className="flex items-center py-1.5 px-2 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors text-sm">
                            This Week
                        </a>
                        <a href="#" className="flex items-center py-1.5 px-2 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors text-sm">
                            Recently Viewed
                        </a>
                        <a href="#" className="flex items-center py-1.5 px-2 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors text-sm">
                            Recently Saved
                        </a>
                    </div>
                </div>

                {/* Vertical Divider */}
                <div className="w-px bg-white/10"></div>

                {/* Column 3: All Categories */}
                <div className="flex-[2]">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">All Categories</h3>
                    <div className="grid grid-cols-3 gap-1.5">
                        <a href="#" className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors text-sm">
                            <Smartphone className="w-3.5 h-3.5 text-primary" />
                            <span>Phones</span>
                        </a>
                        <a href="#" className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors text-sm">
                            <Laptop className="w-3.5 h-3.5 text-primary" />
                            <span>Laptops</span>
                        </a>
                        <a href="#" className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors text-sm">
                            <Headphones className="w-3.5 h-3.5 text-primary" />
                            <span>Accessories</span>
                        </a>
                        <a href="#" className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors text-sm">
                            <BookOpen className="w-3.5 h-3.5 text-primary" />
                            <span>Books</span>
                        </a>
                        <a href="#" className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors text-sm">
                            <Home className="w-3.5 h-3.5 text-primary" />
                            <span>Hostel</span>
                        </a>
                        <a href="#" className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors text-sm">
                            <Shirt className="w-3.5 h-3.5 text-primary" />
                            <span>Fashion</span>
                        </a>
                        <a href="#" className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors text-sm">
                            <UtensilsCrossed className="w-3.5 h-3.5 text-primary" />
                            <span>Food</span>
                        </a>
                        <a href="#" className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors text-sm">
                            <Wrench className="w-3.5 h-3.5 text-primary" />
                            <span>Services</span>
                        </a>
                        <a href="#" className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors text-sm">
                            <Repeat className="w-3.5 h-3.5 text-primary" />
                            <span>Swap/Free</span>
                        </a>
                    </div>

                    {/* Footer */}
                    <div className="mt-3 pt-3 border-t border-white/10">
                        <a href="/explore" className="flex items-center gap-2 text-primary hover:text-orange-400 transition-colors text-sm font-medium">
                            <span>View All Categories</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
