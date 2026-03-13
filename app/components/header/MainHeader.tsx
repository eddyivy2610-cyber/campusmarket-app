"use client";

import { User, Bell, LayoutGrid, Heart, ChevronDown } from "lucide-react";
import { useState, useRef } from "react";
import { AccountDropdown } from "./AccountDropdown";
import Link from "next/link";
import Image from "next/image";
import { useScrollReveal } from "../../hooks/useScrollReveal";
import { NotificationsModal } from "../notifications/NotificationsModal";
import { useClickOutside } from "../../hooks/useClickOutside";
import { HamburgerMenu } from "./HamburgerMenu";
import { IntelligentSearch } from "../search/IntelligentSearch";
import { MobileSearch } from "../search/MobileSearch";
import { usePathname } from "next/navigation";
import { useSaved } from "../../context/SavedContext";
import { useAuth } from "../../context/AuthContext";

export function MainHeader() {
    useScrollReveal();
    const [isAccountOpen, setIsAccountOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const pathname = usePathname();
    const { user } = useAuth();
    const isSettingsPage = pathname === "/settings";
    const isAuthPage = pathname?.startsWith("/login") || pathname?.startsWith("/register") || pathname?.startsWith("/forgot-password");
    const isLegalPage = pathname?.startsWith("/(legal)") || pathname === "/about-us" || pathname === "/terms-of-service" || pathname === "/safety-guidelines" || pathname === "/community-rules" || pathname === "/usage-policy";

    // In Next.js App Router, (groups) aren't in the actual URL. 
    // Legal routes are /about-us, etc.
    const isActuallyLegal = ["/about-us", "/terms-of-service", "/safety-guidelines", "/community-rules", "/usage-policy"].includes(pathname);
    const isAdminPage = pathname?.startsWith("/admin");
    const { savedItems } = useSaved();

    const accountRef = useRef<HTMLDivElement>(null);
    useClickOutside(accountRef, () => setIsAccountOpen(false));

    if (isAdminPage) return null;

    return (
        <>
            {/* ── Main header row ── */}
            <div className="bg-background text-foreground py-1 md:py-2 border-b border-border/30 shadow-sm relative z-40">
                <div className="w-full max-w-[1780px] mx-auto px-3 md:px-6 flex items-center gap-2 md:gap-4">

                    {/* Hamburger (mobile) */}
                    <button
                        onClick={() => setIsMenuOpen(true)}
                        className="md:hidden h-9 w-9 -ml-1 flex items-center justify-center rounded-md border border-border/60 bg-secondary/40 text-foreground hover:bg-secondary transition-colors shrink-0"
                        aria-label="Open menu"
                    >
                        <LayoutGrid className="w-5 h-5" />
                    </button>

                    {/* Logo */}
                    <div className="flex-1 md:flex-none flex md:block justify-center">
                        <Link href="/" className="flex items-center gap-0 group" aria-label="CampusMarket Home">
                            <Image
                                src="/LOGO.png"
                                alt="CampusMarket logo"
                                width={56}
                                height={56}
                                priority
                                className="h-6 md:h-7 w-auto shrink-0"
                            />
                            <span className="text-[12px] md:text-[15px] font-extrabold font-sans leading-none tracking-tight ml-1">
                                <span className="text-[#16325f]">Campus</span>{" "}
                                <span className="text-orange-500">Market</span>
                            </span>
                        </Link>
                    </div>

                    {/* Desktop search */}
                    <div className="hidden md:flex flex-1 relative z-30">
                        <IntelligentSearch />
                    </div>

                    {/* Right actions */}
                    <div ref={accountRef} className="relative z-40 flex items-center gap-1 md:gap-1.5 shrink-0 bg-secondary/20 backdrop-blur-lg border border-border/40 rounded-lg px-1.5 py-1 md:px-2 md:py-1 shadow-sm">

                        {/* Saved Items */}
                        <Link
                            href="/saved"
                            className="flex items-center justify-center p-1 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors text-muted-foreground relative group"
                            title="Saved Items"
                        >
                            <Heart className="w-5 h-5 shrink-0 transition-transform group-hover:scale-110" strokeWidth={2} />
                            {savedItems.length > 0 && (
                                <span className="absolute top-0 right-0 translate-x-1 -translate-y-1 bg-primary text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full ring-2 ring-background">
                                    {savedItems.length}
                                </span>
                            )}
                        </Link>

                        {/* Notifications */}
                        <div className="relative z-40 hidden sm:flex">
                            <button
                                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                                className="flex items-center justify-center p-1 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors text-muted-foreground relative group"
                                title="Notifications"
                            >
                                <Bell className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" strokeWidth={2} />
                                <span className="absolute top-0 right-0 translate-x-1 -translate-y-1 bg-red-500 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full ring-2 ring-background animate-pulse">
                                    3
                                </span>
                            </button>
                            <NotificationsModal isOpen={isNotificationOpen} onClose={() => setIsNotificationOpen(false)} />
                        </div>

                        <div className="w-px h-6 bg-border/60 mx-1"></div>

                        {/* Account — visible on mobile too */}
                        <div className="pl-1">
                            <button
                                onClick={() => setIsAccountOpen(!isAccountOpen)}
                            className="flex items-center gap-2 text-foreground hover:text-primary transition-colors group p-1 rounded-lg hover:bg-primary/5 text-left"
                            >
                                <div className="bg-secondary p-1 rounded-md group-hover:bg-primary/10 transition-colors">
                                    <User className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" strokeWidth={2} />
                                </div>
                                <div className="hidden sm:flex flex-col leading-tight pr-1">
                                    <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold group-hover:text-primary/80 transition-colors">
                                        {user ? user.role : "Guest"}
                                    </span>
                                    <span className="text-[11px] font-bold font-heading">
                                        {user ? user.name.split(' ')[0] : "Account"}
                                    </span>
                                </div>
                                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground hidden sm:block mr-1 group-hover:text-primary transition-colors" />
                            </button>
                        </div>
                        <AccountDropdown isOpen={isAccountOpen} />
                    </div>
                </div>
            </div>

            {/* ── Mobile search bar (below header) ── */}
            {!isSettingsPage && !isAuthPage && (
                <div className="block md:hidden bg-background border-b border-border/30 px-3 py-1">
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
