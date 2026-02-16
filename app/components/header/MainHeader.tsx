"use client";

import { Search, ShoppingBasket, User, Bell, LayoutGrid, ChevronDown, HelpCircle, Heart } from "lucide-react";
import { useState, useRef } from "react";
import { AccountDropdown } from "./AccountDropdown";
import { CartDropdown } from "./CartDropdown";
import { ExploreDropdown } from "./ExploreDropdown";
import Link from "next/link";
import { useScrollReveal } from "../../hooks/useScrollReveal";
import { NotificationsModal } from "../notifications/NotificationsModal";
import { useClickOutside } from "../../hooks/useClickOutside";
import { HamburgerMenu } from "./HamburgerMenu";
import { IntelligentSearch } from "../search/IntelligentSearch";
import { useCart } from "../../context/CartContext";

export function MainHeader() {
    useScrollReveal();
    const { totalItems } = useCart();
    const [isAccountOpen, setIsAccountOpen] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [isExploreOpen, setIsExploreOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const exploreRef = useRef<HTMLDivElement>(null);
    const accountRef = useRef<HTMLDivElement>(null);
    const cartRef = useRef<HTMLDivElement>(null);

    useClickOutside(exploreRef, () => setIsExploreOpen(false));
    useClickOutside(accountRef, () => setIsAccountOpen(false));
    useClickOutside(cartRef, () => setIsCartOpen(false));

    return (
        <>
            <div className="bg-background text-foreground py-5 sticky top-0 z-40 transition-shadow duration-300">
                <div className="w-full max-w-[1780px] mx-auto px-4 md:px-8 flex items-center justify-between gap-6 md:gap-12">

                    {/* Logo Area */}
                    <div className="flex items-center gap-3 shrink-0">
                        {/* Hamburger Menu Trigger (Mobile Only) */}
                        <button
                            onClick={() => setIsMenuOpen(true)}
                            className="md:hidden p-2 -ml-2 text-foreground hover:bg-secondary rounded-full transition-colors"
                        >
                            <LayoutGrid className="w-6 h-6" />
                        </button>

                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="flex items-center font-heading tracking-tight relative">
                                <span className="text-primary mr-2 transition-transform group-hover:scale-110">
                                    <ShoppingBasket className="w-8 h-8" />
                                </span>
                                <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80">CampusMarket</span>
                            </div>
                        </Link>
                    </div>



                    {/* Center: Search */}
                    <div className="hidden md:flex flex-1 max-w-2xl relative z-30">
                        <IntelligentSearch />
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-1 sm:gap-2 shrink-0">

                        {/* Account */}
                        <div ref={accountRef} className="relative z-40 hidden sm:block">
                            <button
                                onClick={() => setIsAccountOpen(!isAccountOpen)}
                                className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors group p-2 rounded-lg hover:bg-secondary/50"
                            >
                                <User className="w-5 h-5" />
                                <span className="text-[10px] font-bold font-heading">Account</span>
                            </button>
                            <AccountDropdown isOpen={isAccountOpen} />
                        </div>

                        {/* Wishlist */}
                        <Link href="/wishlist" className="hidden sm:flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors group p-2 rounded-lg hover:bg-secondary/50">
                            <Heart className="w-5 h-5" />
                            <span className="text-[10px] font-bold font-heading">Wishlist</span>
                        </Link>

                        {/* Notifications */}
                        <div className="relative z-40 hidden sm:block">
                            <button
                                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                                className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors group p-2 rounded-lg hover:bg-secondary/50 relative"
                            >
                                <div className="relative">
                                    <Bell className="w-5 h-5" />
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold w-3.5 h-3.5 flex items-center justify-center rounded-full ring-2 ring-background animate-pulse">
                                        3
                                    </span>
                                </div>
                                <span className="text-[10px] font-bold font-heading">Alerts</span>
                            </button>
                            <NotificationsModal isOpen={isNotificationOpen} onClose={() => setIsNotificationOpen(false)} />
                        </div>

                        {/* Cart */}
                        <div ref={cartRef} className="relative z-40">
                            <button
                                onClick={() => setIsCartOpen(!isCartOpen)}
                                className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors group p-2 rounded-lg hover:bg-secondary/50"
                            >
                                <div className="relative">
                                    <ShoppingBasket className="w-5 h-5" />
                                    <span className="absolute -top-1 -right-1 bg-primary text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full ring-2 ring-background">
                                        {totalItems}
                                    </span>
                                </div>
                                <span className="text-[10px] font-bold font-heading">Cart</span>
                            </button>
                            <CartDropdown isOpen={isCartOpen} />
                        </div>
                    </div>
                </div>
            </div>


            <HamburgerMenu
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                cartCount={totalItems}
                notificationCount={3} // Mocked for now
            />
        </>
    );
}

