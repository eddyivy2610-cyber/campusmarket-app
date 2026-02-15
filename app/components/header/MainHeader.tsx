"use client";

import { Search, ShoppingBasket, Heart, User, Bell, LayoutGrid, ChevronDown, HelpCircle, PlusCircle, Users, Menu } from "lucide-react";
import { useState, useRef } from "react";
import { AccountDropdown } from "./AccountDropdown";
import { CartDropdown } from "./CartDropdown";
import { ExploreDropdown } from "./ExploreDropdown";
import Link from "next/link";
import { useScrollReveal } from "../../hooks/useScrollReveal";
import { NotificationSidebar } from "../notifications/NotificationSidebar";
import { useClickOutside } from "../../hooks/useClickOutside";
import { HamburgerMenu } from "./HamburgerMenu";

export function MainHeader() {
    useScrollReveal();
    const [isAccountOpen, setIsAccountOpen] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [isExploreOpen, setIsExploreOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [cartCount, setCartCount] = useState(0);

    const exploreRef = useRef<HTMLDivElement>(null);
    const accountRef = useRef<HTMLDivElement>(null);
    const cartRef = useRef<HTMLDivElement>(null);

    useClickOutside(exploreRef, () => setIsExploreOpen(false));
    useClickOutside(accountRef, () => setIsAccountOpen(false));
    useClickOutside(cartRef, () => setIsCartOpen(false));

    return (
        <>
            <div className="bg-background text-foreground py-3 border-b border-border sticky top-0 z-40 transition-shadow duration-300">
                <div className="w-full max-w-[1780px] mx-auto px-4 md:px-8 flex items-center justify-between gap-4 md:gap-8">

                    {/* Logo Area */}
                    <div className="flex items-center gap-3 shrink-0">
                        {/* Hamburger Menu Trigger (Mobile Only) */}
                        <button
                            onClick={() => setIsMenuOpen(true)}
                            className="md:hidden p-2 -ml-2 text-foreground hover:bg-secondary rounded-full transition-colors"
                        >
                            <Menu className="w-6 h-6" />
                        </button>

                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="text-2xl font-black flex items-center font-sans tracking-tighter uppercase relative">
                                <span className="text-primary mr-1 transition-transform group-hover:scale-110">
                                    <ShoppingBasket className="w-7 h-7" />
                                </span>
                                <span className="text-foreground tracking-tighter hidden sm:inline">Campus</span>
                                <span className="text-primary ml-0.5 hidden sm:inline">Market</span>
                                <span className="text-foreground tracking-tighter sm:hidden">CM</span>
                            </div>
                        </Link>
                    </div>

                    {/* Center: Search & Explore */}
                    <div ref={exploreRef} className="flex-1 w-full max-w-3xl relative z-30">
                        <div className="flex items-center w-full h-10 md:h-12 bg-gray-100/50 dark:bg-white/5 rounded-full overflow-hidden transition-all duration-300 shadow-sm group-focus-within:shadow-md ring-1 ring-transparent focus-within:ring-primary/20">

                            {/* Explore Button (Desktop Only) */}
                            <button
                                onClick={() => setIsExploreOpen(!isExploreOpen)}
                                className="hidden md:flex items-center gap-2 h-full px-3 md:px-5 bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0"
                            >
                                <LayoutGrid className="w-4 h-4" />
                                <span className="hidden lg:inline">Categories</span>
                                <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${isExploreOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Search Input */}
                            <input
                                type="text"
                                placeholder="Search..."
                                className="flex-1 h-full bg-transparent px-4 outline-none text-sm placeholder:text-gray-400 text-foreground font-medium w-full"
                            />

                            {/* Search Button */}
                            <button className="h-full px-4 md:px-6 bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors uppercase text-[10px] md:text-[11px] tracking-widest flex items-center gap-2">
                                <Search className="w-4 h-4" />
                                <span className="hidden sm:inline">Search</span>
                            </button>
                        </div>

                        {/* Dropdown Container (Desktop Only) */}
                        <div className="hidden md:block absolute top-full left-0 mt-2 w-64">
                            <ExploreDropdown isOpen={isExploreOpen} />
                        </div>
                    </div>

                    {/* Right Actions (Desktop Only) */}
                    <div className="hidden md:flex items-center gap-2 sm:gap-4 shrink-0">

                        {/* Help */}
                        <Link href="/coming-soon" className="hidden lg:flex flex-col items-center gap-0.5 text-gray-500 hover:text-primary transition-colors group p-2">
                            <HelpCircle className="w-5 h-5 mb-0.5" />
                            <span className="text-[10px] font-bold">Help</span>
                        </Link>

                        {/* Account */}
                        <div ref={accountRef} className="relative z-40">
                            <button
                                onClick={() => setIsAccountOpen(!isAccountOpen)}
                                className="flex flex-col items-center gap-0.5 text-gray-500 hover:text-primary transition-colors group p-2 bg-transparent border-none cursor-pointer"
                            >
                                <User className="w-5 h-5 mb-0.5" />
                                <span className="text-[10px] font-bold">Account</span>
                            </button>
                            <AccountDropdown isOpen={isAccountOpen} />
                        </div>

                        {/* Community */}
                        <Link href="/community" className="relative flex flex-col items-center gap-0.5 text-gray-500 hover:text-primary transition-colors group p-2 bg-transparent border-none cursor-pointer">
                            <Users className="w-5 h-5 mb-0.5" />
                            <span className="text-[10px] font-bold">Community</span>
                        </Link>

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
                        <div ref={cartRef} className="relative z-40">
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

            <HamburgerMenu
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                cartCount={cartCount}
                notificationCount={3} // Mocked for now
            />
        </>
    );
}

