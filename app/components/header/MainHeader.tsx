"use client";

import { Search, ShoppingBasket, Heart, User, Bell, LayoutGrid, ChevronDown, HelpCircle, PlusCircle } from "lucide-react";
import { useState } from "react";
import { AccountDropdown } from "./AccountDropdown";
import { CartDropdown } from "./CartDropdown";
import { ExploreDropdown } from "./ExploreDropdown";
import Link from "next/link";
import { useScrollReveal } from "../../hooks/useScrollReveal";
import { NotificationSidebar } from "../notifications/NotificationSidebar";

export function MainHeader() {
    useScrollReveal();
    const [isAccountOpen, setIsAccountOpen] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [isExploreOpen, setIsExploreOpen] = useState(false);
    const [cartCount, setCartCount] = useState(0);

    return (
        <>
            <div className="bg-background text-foreground py-3 border-b border-black/5 dark:border-white/5 sticky top-0 z-40 transition-shadow duration-300">
                <div className="w-full max-w-[1780px] mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8">

                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 shrink-0 group">
                        <div className="text-2xl font-black flex items-center font-sans tracking-tighter uppercase relative">
                            <span className="text-primary mr-1 transition-transform group-hover:scale-110">
                                <ShoppingBasket className="w-7 h-7" />
                            </span>
                            <span className="text-foreground tracking-tighter">Campus</span>
                            <span className="text-primary ml-0.5">Market</span>
                        </div>
                    </Link>

                    {/* Center: Search & Explore */}
                    <div className="flex-1 w-full max-w-3xl relative z-50">
                        <div className="flex items-center w-full bg-gray-100/50 dark:bg-white/5 rounded-full overflow-hidden transition-all duration-300 shadow-sm group-focus-within:shadow-md ring-1 ring-transparent focus-within:ring-primary/20">

                            {/* Explore Button */}
                            <button
                                onClick={() => setIsExploreOpen(!isExploreOpen)}
                                className="hidden md:flex items-center gap-2 px-5 py-3 bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-bold transition-colors cursor-pointer whitespace-nowrap"
                            >
                                <LayoutGrid className="w-4 h-4" />
                                <span>Categories</span>
                                <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${isExploreOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Search Input */}
                            <input
                                type="text"
                                placeholder="Search products, brands, and categories..."
                                className="flex-1 bg-transparent px-4 py-3 outline-none text-sm placeholder:text-gray-400 text-foreground font-medium w-full"
                            />

                            {/* Search Button */}
                            <button className="px-6 py-3 bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors uppercase text-[11px] tracking-widest flex items-center gap-2">
                                <Search className="w-4 h-4" />
                                <span className="hidden sm:inline">Search</span>
                            </button>
                        </div>

                        {/* Dropdown Container */}
                        <div className="absolute top-full left-0 mt-2 w-full md:w-64">
                            <ExploreDropdown isOpen={isExploreOpen} />
                        </div>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-2 sm:gap-4 shrink-0">

                        {/* Help */}
                        <Link href="/coming-soon" className="hidden lg:flex flex-col items-center gap-0.5 text-gray-500 hover:text-primary transition-colors group p-2">
                            <HelpCircle className="w-5 h-5 mb-0.5" />
                            <span className="text-[10px] font-bold">Help</span>
                        </Link>

                        {/* Account */}
                        <div className="relative z-40">
                            <button
                                onClick={() => setIsAccountOpen(!isAccountOpen)}
                                className="flex flex-col items-center gap-0.5 text-gray-500 hover:text-primary transition-colors group p-2 bg-transparent border-none cursor-pointer"
                            >
                                <User className="w-5 h-5 mb-0.5" />
                                <span className="text-[10px] font-bold">Account</span>
                            </button>
                            <AccountDropdown isOpen={isAccountOpen} />
                        </div>

                        {/* Notifications */}
                        <button
                            onClick={() => setIsNotificationOpen(true)}
                            className="relative flex flex-col items-center gap-0.5 text-gray-500 hover:text-primary transition-colors group p-2 bg-transparent border-none cursor-pointer"
                        >
                            <div className="relative">
                                <Bell className="w-5 h-5 mb-0.5" />
                                <span className="absolute -top-1 -right-1 bg-primary text-white text-[9px] font-bold w-3.5 h-3.5 flex items-center justify-center rounded-full animate-pulse ring-2 ring-background">
                                    3
                                </span>
                            </div>
                            <span className="text-[10px] font-bold">Alerts</span>
                        </button>

                        {/* Cart */}
                        <div className="relative z-40">
                            <button
                                onClick={() => setIsCartOpen(!isCartOpen)}
                                className="flex flex-col items-center gap-0.5 text-gray-500 hover:text-primary transition-colors group p-2 bg-transparent border-none cursor-pointer"
                            >
                                <div className="relative">
                                    <ShoppingBasket className="w-5 h-5 mb-0.5" />
                                    <span className="absolute -top-1 -right-1 bg-primary text-white text-[9px] font-bold w-3.5 h-3.5 flex items-center justify-center rounded-full ring-2 ring-background">
                                        {cartCount}
                                    </span>
                                </div>
                                <span className="text-[10px] font-bold">Cart</span>
                            </button>
                            <CartDropdown isOpen={isCartOpen} itemCount={cartCount} />
                        </div>

                        {/* Sell Button */}
                        <Link href="/sell" className="hidden sm:flex items-center gap-2 bg-primary/10 hover:bg-primary text-primary hover:text-white border border-primary/20 hover:border-primary transition-all duration-300 px-5 py-2.5 rounded-full group ml-2">
                            <PlusCircle className="w-4 h-4" />
                            <span className="text-xs font-black uppercase tracking-wider">Sell</span>
                        </Link>
                    </div>
                </div>
            </div>

            <NotificationSidebar
                isOpen={isNotificationOpen}
                onClose={() => setIsNotificationOpen(false)}
            />
        </>
    );
}

