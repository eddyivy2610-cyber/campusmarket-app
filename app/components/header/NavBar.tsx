"use client";

import { ChevronDown, ShoppingBasket, ShoppingBag, LayoutGrid, Zap, Heart, Search, HelpCircle, Users2 } from "lucide-react";
import Link from "next/link";
import { ExploreDropdown } from "./ExploreDropdown";
import { BuzzDropdown } from "./BuzzDropdown";
import { QuickFindDropdown } from "./QuickFindDropdown";
import { SupportDropdown } from "./SupportDropdown";
import { useState } from "react";

export function NavBar() {
    const [isExploreOpen, setIsExploreOpen] = useState(false);
    const [buzzVisible, setBuzzVisible] = useState(false);
    const [quickVisible, setQuickVisible] = useState(false);
    const [supportVisible, setSupportVisible] = useState(false);

    return (
        <div className="hidden md:block bg-transparent pt-0 pb-4">
            <div className="max-w-[1780px] mx-auto px-4 md:px-12 leading-none">
                <div className="relative">
                    <div className="bg-secondary text-foreground rounded-full px-1.5 py-1 flex items-center justify-between shadow-lg border border-white/5">

                        {/* Left Navigation */}
                        <div className="flex items-center">
                            {/* Explore trigger */}
                            <button
                                className="flex items-center gap-2 py-2 px-6 hover:text-primary transition-colors font-medium whitespace-nowrap bg-transparent border-none cursor-pointer"
                                onMouseEnter={() => setIsExploreOpen(true)}
                                onMouseLeave={() => setIsExploreOpen(false)}
                                onClick={() => setIsExploreOpen(!isExploreOpen)}
                            >
                                <LayoutGrid className="w-4 h-4" />
                                <span>Explore</span>
                            </button>

                            <div className="h-6 w-px bg-white/10 mx-2"></div>

                            {/* Campus Buzz */}
                            <div
                                className="relative flex items-center"
                                onMouseEnter={() => setBuzzVisible(true)}
                                onMouseLeave={() => setBuzzVisible(false)}
                            >
                                <button
                                    className="flex items-center gap-2 py-2 px-4 hover:text-primary transition-colors cursor-pointer whitespace-nowrap group bg-transparent border-none"
                                    onClick={() => setBuzzVisible(!buzzVisible)}
                                >
                                    <Zap className="w-4 h-4 text-primary" />
                                    <span className="font-sans font-medium text-sm">Campus Buzz</span>
                                    <span className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded-full ml-1 font-bold">HOT</span>
                                    <ChevronDown className="w-3 h-3 text-gray-400 group-hover:text-primary transition-colors" />
                                </button>

                                <BuzzDropdown isOpen={buzzVisible} />
                            </div>

                            {/* Campus Deals */}
                            <a href="/coming-soon" className="flex items-center gap-2 py-2 px-4 hover:text-primary transition-colors cursor-pointer whitespace-nowrap group">
                                <Heart className="w-4 h-4 text-primary" />
                                <span className="font-sans font-medium text-sm">Campus Deals</span>
                                <ChevronDown className="w-3 h-3 text-gray-400 group-hover:text-primary transition-colors" />
                            </a>

                            {/* Quick find */}
                            <div
                                className="flex items-center gap-2 py-2 px-4 hover:text-primary transition-colors cursor-pointer whitespace-nowrap group relative"
                                onMouseEnter={() => setQuickVisible(true)}
                                onMouseLeave={() => setQuickVisible(false)}
                            >
                                <Search className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors" />
                                <span className="font-sans font-medium text-sm">Quick find</span>
                                <ChevronDown className="w-3 h-3 text-gray-400 group-hover:text-primary transition-colors" />

                                <QuickFindDropdown isOpen={quickVisible} />
                            </div>

                            {/* Support */}
                            <div
                                className="flex items-center gap-1.5 py-1.5 px-3 hover:text-primary transition-colors cursor-pointer whitespace-nowrap group relative"
                                onMouseEnter={() => setSupportVisible(true)}
                                onMouseLeave={() => setSupportVisible(false)}
                            >
                                <HelpCircle className="w-3.5 h-3.5 text-gray-500 group-hover:text-primary transition-colors" />
                                <span className="font-sans font-black text-[10px] uppercase tracking-wider">Support</span>
                                <ChevronDown className="w-2.5 h-2.5 text-gray-500 group-hover:text-primary transition-colors" />

                                <SupportDropdown isOpen={supportVisible} />
                            </div>

                            {/* Team */}
                            <a href="/coming-soon" className="flex items-center gap-1.5 py-1.5 px-3 hover:text-primary transition-colors cursor-pointer whitespace-nowrap group">
                                <Users2 className="w-3.5 h-3.5 text-gray-500 group-hover:text-primary transition-colors" />
                                <span className="font-sans font-black text-[10px] uppercase tracking-wider">Team</span>
                            </a>
                        </div>

                        {/* Right CTA */}
                        <div className="hidden md:block pl-2">
                            <Link href="/create" className="bg-primary text-primary-foreground font-black py-2.5 px-6 rounded-full flex items-center gap-2 shadow-lg shadow-primary/20 hover:bg-orange-600 transition-all text-[11px] uppercase tracking-widest active:scale-95 transform hover:-translate-y-0.5">
                                <ShoppingBasket className="w-4 h-4" />
                                <span>Become a Seller</span>
                            </Link>
                        </div>
                    </div>

                    {/* Dropdown positioned relative to navbar container */}
                    <div
                        onMouseEnter={() => setIsExploreOpen(true)}
                        onMouseLeave={() => setIsExploreOpen(false)}
                    >
                        <ExploreDropdown isOpen={isExploreOpen} />
                    </div>
                </div>
            </div>
        </div>
    );
}
