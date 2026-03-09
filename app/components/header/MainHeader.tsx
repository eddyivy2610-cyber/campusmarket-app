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
    const isLegalPage = pathname?.startsWith("/(legal)") || pathname === "/about-us" || pathname === "/terms-of-service" || pathname === "/safety-guidelines" || pathname === "/community-rules" || pathname === "/usage-policy";

    // In Next.js App Router, (groups) aren't in the actual URL. 
    // Legal routes are /about-us, etc.
    const isActuallyLegal = ["/about-us", "/terms-of-service", "/safety-guidelines", "/community-rules", "/usage-policy"].includes(pathname);
    const isAdminPage = pathname?.startsWith("/admin");
    const isAuthPage = pathname?.startsWith("/login") || pathname?.startsWith("/register") || pathname?.startsWith("/forgot-password");
    const { savedItems } = useSaved();

    const accountRef = useRef<HTMLDivElement>(null);
    useClickOutside(accountRef, () => setIsAccountOpen(false));

    if (isActuallyLegal || isAdminPage || isAuthPage) return null;

    return (
        <>
            {/* ── Main header row ── */}
            <div className="bg-background text-foreground py-2 md:py-3.5 border-b border-border/30 shadow-sm relative z-40">
                <div className="w-full max-w-[1780px] mx-auto px-4 md:px-8 flex items-center gap-3 md:gap-6">

                    {/* Hamburger (mobile) */}
                    <button
                        onClick={() => setIsMenuOpen(true)}
                        className="md:hidden p-2 -ml-1 text-foreground hover:bg-secondary rounded-full transition-all shrink-0"
                        aria-label="Open menu"
                    >
                        <LayoutGrid className="w-6 h-6" />
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
                                className="h-7 md:h-8 w-auto shrink-0"
                            />
                            <span className="text-[14px] md:text-[18px] font-extrabold font-sans leading-none tracking-tight ml-1">
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
                    <div ref={accountRef} className="relative z-40 flex items-center gap-1 md:gap-2 shrink-0 bg-secondary/20 backdrop-blur-lg border border-border/40 rounded-xl px-2 py-1.5 md:px-3 md:py-2 shadow-sm">

                        {/* Saved Items button — desktop only */}
                        <Link
                            href="/saved"
                            className="hidden sm:flex items-center justify-center p-2 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors text-muted-foreground relative group"
                            title="Saved Items"
                        >
                            <Heart className="w-5 h-5 shrink-0 transition-transform group-hover:scale-110" strokeWidth={2} />
                            {savedItems.length > 0 && (
                                <span className="absolute top-0 right-0 translate-x-1 -translate-y-1 bg-primary text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full ring-2 ring-background">
                                    {savedItems.length}
                                </span>
                            )}
                        </Link>

                        {/* Notifications — visible on mobile too */}
                        <div className="relative z-40 flex">
                            <button
                                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                                className="flex items-center justify-center p-2 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors text-muted-foreground relative group"
                                title="Notifications"
                            >
                                <Bell className="w-5 h-5 shrink-0 transition-transform group-hover:scale-110" strokeWidth={2} />
                                <span className="absolute top-0 right-0 translate-x-1 -translate-y-1 bg-red-500 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full ring-2 ring-background animate-pulse">
                                    3
                                </span>
                            </button>
                            <NotificationsModal isOpen={isNotificationOpen} onClose={() => setIsNotificationOpen(false)} />
                        </div>

                        <div className="hidden sm:block w-px h-6 bg-border/60 mx-1"></div>

                        {/* Account — visible on mobile too */}
                        <div className="pl-1">
                            <button
                                onClick={() => setIsAccountOpen(!isAccountOpen)}
                                className="flex items-center gap-2 text-foreground hover:text-primary transition-colors group p-1.5 rounded-lg hover:bg-primary/5 text-left"
                            >
                                <div className="bg-secondary p-1.5 rounded-md group-hover:bg-primary/10 transition-colors">
                                    <User className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" strokeWidth={2} />
                                </div>
                                <div className="hidden sm:flex flex-col leading-tight pr-1">
                                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold group-hover:text-primary/80 transition-colors">
                                        {user ? user.role : "Guest"}
                                    </span>
                                    <span className="text-xs font-bold font-heading">
                                        {user ? user.name.split(' ')[0] : "Account"}
                                    </span>
                                </div>
                                <ChevronDown className="w-4 h-4 text-muted-foreground hidden sm:block mr-1 group-hover:text-primary transition-colors" />
                            </button>
                        </div>
                        <AccountDropdown isOpen={isAccountOpen} />
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
