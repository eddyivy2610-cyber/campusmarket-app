"use client";

import { Search, ShoppingBasket, User, Bell, LayoutGrid, Heart } from "lucide-react";
import { useState, useRef } from "react";
import { AccountDropdown } from "./AccountDropdown";
import Link from "next/link";
import { useScrollReveal } from "../../hooks/useScrollReveal";
import { NotificationsModal } from "../notifications/NotificationsModal";
import { useClickOutside } from "../../hooks/useClickOutside";
import { HamburgerMenu } from "./HamburgerMenu";
import { IntelligentSearch } from "../search/IntelligentSearch";
import { MobileSearch } from "../search/MobileSearch";
import { usePathname } from "next/navigation";
import { useSaved } from "../../context/SavedContext";

export function MainHeader() {
    useScrollReveal();
    const [isAccountOpen, setIsAccountOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const pathname = usePathname();
    const isSettingsPage = pathname === "/settings";
    const { savedItems } = useSaved();

    const accountRef = useRef<HTMLDivElement>(null);
    useClickOutside(accountRef, () => setIsAccountOpen(false));

    return (
        <>
            {/* ── Main header row ── */}
            <div className="bg-background text-foreground py-2 md:py-3.5 sticky top-0 z-40 border-b border-border/30 shadow-sm">
                <div className="w-full max-w-[1780px] mx-auto px-4 md:px-8 flex items-center gap-3 md:gap-6">

                    {/* Hamburger (mobile) */}
                    <button
                        onClick={() => setIsMenuOpen(true)}
                        className="md:hidden p-2 -ml-1 text-foreground hover:bg-secondary rounded-full transition-all shrink-0"
                        aria-label="Open menu"
                    >
                        <LayoutGrid className="w-6 h-6" />
                    </button>

                    {/* Logo — centered on mobile via flex-1 + justify-center trick */}
                    <div className="flex-1 md:flex-none flex md:block justify-center">
                        <Link href="/" className="flex items-center gap-2 group">
                            <span className="text-primary">
                                <ShoppingBasket className="w-7 h-7" />
                            </span>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80 font-heading">
                                CampusMarket
                            </span>
                        </Link>
                    </div>

                    {/* Desktop search */}
                    <div className="hidden md:flex flex-1 relative z-30">
                        <IntelligentSearch />
                    </div>

                    {/* Right actions */}
                    <div className="flex items-center gap-1 shrink-0">

                        {/* Account — visible on mobile too */}
                        <div ref={accountRef} className="relative z-40">
                            <button
                                onClick={() => setIsAccountOpen(!isAccountOpen)}
                                className="flex flex-col items-center gap-0.5 text-muted-foreground hover:text-primary transition-colors group p-2 rounded-lg hover:bg-secondary/50"
                            >
                                <User className="w-5 h-5" />
                                <span className="text-[9px] font-bold font-heading hidden sm:block">Account</span>
                            </button>
                            <AccountDropdown isOpen={isAccountOpen} />
                        </div>

                        {/* Notifications — visible on mobile too */}
                        <div className="relative z-40">
                            <button
                                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                                className="flex flex-col items-center gap-0.5 text-muted-foreground hover:text-primary transition-colors group p-2 rounded-lg hover:bg-secondary/50 relative"
                            >
                                <div className="relative">
                                    <Bell className="w-5 h-5" />
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold w-3.5 h-3.5 flex items-center justify-center rounded-full ring-2 ring-background animate-pulse">
                                        3
                                    </span>
                                </div>
                                <span className="text-[9px] font-bold font-heading hidden sm:block">Alerts</span>
                            </button>
                            <NotificationsModal isOpen={isNotificationOpen} onClose={() => setIsNotificationOpen(false)} />
                        </div>

                        {/* Saved Items button — desktop only */}
                        <Link
                            href="/saved"
                            className="flex flex-col items-center gap-0.5 text-muted-foreground hover:text-primary transition-colors group p-2 rounded-lg hover:bg-secondary/50 relative"
                        >
                            <div className="relative">
                                <Heart className="w-5 h-5" />
                                {savedItems.length > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-primary text-white text-[9px] font-bold w-3.5 h-3.5 flex items-center justify-center rounded-full ring-2 ring-background">
                                        {savedItems.length}
                                    </span>
                                )}
                            </div>
                            <span className="text-[9px] font-bold font-heading hidden sm:block">Saved</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* ── Mobile search bar (below header) ── */}
            {!isSettingsPage && (
                <div className="block md:hidden bg-background border-b border-border/30 px-3 py-2">
                    <MobileSearch />
                </div>
            )}

            <HamburgerMenu
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                notificationCount={3}
            />
        </>
    );
}
