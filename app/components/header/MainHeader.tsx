"use client";

import { User, Bell, LayoutGrid, Heart, ChevronDown } from "lucide-react";
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
    const isDashboardPage = pathname?.startsWith("/dashboard");
    const isLegalPage = pathname?.startsWith("/(legal)") || pathname === "/about-us" || pathname === "/terms-of-service" || pathname === "/safety-guidelines" || pathname === "/community-rules" || pathname === "/usage-policy";

    // In Next.js App Router, (groups) aren't in the actual URL. 
    // Legal routes are /about-us, etc.
    const isActuallyLegal = ["/about-us", "/terms-of-service", "/safety-guidelines", "/community-rules", "/usage-policy"].includes(pathname);
    const isAdminPage = pathname?.startsWith("/admin");
    const { savedItems } = useSaved();

    const accountRef = useRef<HTMLDivElement>(null);
    useClickOutside(accountRef, () => setIsAccountOpen(false));

    if (isAdminPage || isAuthPage || isDashboardPage) return null;

    return (
        <>
            {/* ── Main header row ── */}
            <div className="bg-black/60 text-white py-[11px] border-b border-white/10 backdrop-blur-md shadow-sm relative z-40 transition-colors">
                <div className="w-full max-w-[1780px] mx-auto px-4 md:px-6 flex items-center gap-3 md:gap-4">

                    {/* Hamburger (mobile) */}
                    <button
                        onClick={() => setIsMenuOpen(true)}
                        className="md:hidden h-9 w-9 -ml-1 flex items-center justify-center rounded-md border border-white/20 bg-black/40 text-white hover:bg-black/60 transition-colors shrink-0"
                        aria-label="Open menu"
                    >
                        <LayoutGrid className="w-5 h-5" />
                    </button>

                    {/* Logo - Matching Landing Page */}
                    <div className="flex-1 md:flex-none flex md:block justify-center">
                        <Link href="/" className="flex items-center gap-0 group" aria-label="CampusMarket Home">
                            <span className="text-[20px] md:text-[22px] font-bold font-sans text-[#FFD700] whitespace-nowrap drop-shadow-sm">
                                Campus Hive
                            </span>
                        </Link>
                    </div>

                    {/* Desktop search */}
                    <div className="hidden md:flex flex-1 relative z-30">
                        <IntelligentSearch />
                    </div>

                    {/* Right actions */}
                    <div ref={accountRef} className="relative z-40 flex items-center gap-1 md:gap-1.5 shrink-0 bg-black/40 backdrop-blur-lg border border-white/10 rounded-lg px-1.5 py-1 md:px-2 md:py-1 shadow-sm text-white">

                        {/* Saved Items */}
                        <Link
                            href="/saved"
                            className="flex items-center justify-center p-1 rounded-lg hover:bg-white/10 transition-colors text-white/90 relative group"
                            title="Saved Items"
                        >
                            <Heart className="w-5 h-5 text-white shrink-0 transition-transform group-hover:scale-110 group-hover:text-[#FFD700]" strokeWidth={2} />
                            {savedItems.length > 0 && (
                                <span className="absolute top-0 right-0 translate-x-1 -translate-y-1 bg-[#FFD700] text-black text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full ring-2 ring-transparent">
                                    {savedItems.length}
                                </span>
                            )}
                        </Link>

                        {/* Notifications */}
                        <div className="relative z-40 hidden sm:flex">
                            <button
                                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                                className="flex items-center justify-center p-1 rounded-lg hover:bg-white/10 transition-colors text-white/90 relative group"
                                title="Notifications"
                            >
                                <Bell className="w-4 h-4 text-white shrink-0 transition-transform group-hover:scale-110 group-hover:text-[#FFD700]" strokeWidth={2} />
                                <span className="absolute top-0 right-0 translate-x-1 -translate-y-1 bg-red-500 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full ring-2 ring-transparent animate-pulse">
                                    3
                                </span>
                            </button>
                            <NotificationsModal isOpen={isNotificationOpen} onClose={() => setIsNotificationOpen(false)} />
                        </div>

                        <div className="w-px h-6 bg-white/20 mx-1"></div>

                        {/* Account — visible on mobile too */}
                        <div className="pl-1">
                            <button
                                onClick={() => setIsAccountOpen(!isAccountOpen)}
                                className="flex items-center gap-2 text-white hover:text-white transition-colors group p-1 rounded-lg hover:bg-white/10 text-left"
                            >
                                <div className="bg-white/10 p-1 rounded-md group-hover:bg-white/20 transition-colors border border-white/10">
                                    <User className="w-3.5 h-3.5 text-white group-hover:text-[#FFD700] transition-colors shrink-0" strokeWidth={2} />
                                </div>
                                <div className="hidden sm:flex flex-col leading-tight pr-1">
                                    <span className="text-[9px] uppercase tracking-widest text-[#FFD700]/90 font-bold transition-colors">
                                        {user ? user.role : "Guest"}
                                    </span>
                                    <span className="text-[12px] font-bold font-heading text-white tracking-wide">
                                        {user ? user.name.split(' ')[0] : "Account"}
                                    </span>
                                </div>
                                <ChevronDown className="w-3.5 h-3.5 text-white/70 hidden sm:block mr-1 transition-colors group-hover:text-white" />
                            </button>
                        </div>
                        <AccountDropdown isOpen={isAccountOpen} />
                    </div>
                </div>
            </div>

            {/* ── Mobile search bar (below header) ── */}
            {!isSettingsPage && !isAuthPage && (
                <div className="block md:hidden bg-gradient-to-r from-black/80 via-black/60 to-black/80 border-b border-white/10 px-3 py-1">
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
