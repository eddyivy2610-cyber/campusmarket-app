"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "../ui/Logo";
import { useAuth } from "../../context/AuthContext";
import { apiGet } from "@/lib/apiClient";
import {
  MessageCircleMore,
  User,
  Settings,
  Menu,
  X,
  Search,
  Bell,
  Home,
  Compass,
  Radio,
  Store,
  Laptop,
  Shirt,
  BookOpen,
  Building2,
  Sparkles,
  LayoutGrid,
  Tag,
  Megaphone,
  ChevronRight,
  Check,
  Clock,
} from "lucide-react";

const NAV_LINKS = [
  { label: "Home", href: "/home", isDefaultActive: true, icon: Home },
  { label: "Explore", href: "/explore", icon: Compass },
  { label: "Radar", href: "/wanted", icon: Radio },
  { label: "Stores", href: "/stores", icon: Store },
];

const MOBILE_CATEGORIES = [
  { label: "Electronics", href: "/explore?category=Electronics", icon: Laptop },
  { label: "Fashion", href: "/explore?category=Fashion", icon: Shirt },
  {
    label: "Books & Academic",
    href: "/explore?category=Books%20%26%20Academic%20Supplies",
    icon: BookOpen,
  },
  {
    label: "Hostel Essentials",
    href: "/explore?category=Hostel%20Essentials",
    icon: Building2,
  },
  { label: "Services", href: "/explore?category=Services", icon: Sparkles },
  { label: "More Categories", href: "/explore", icon: LayoutGrid },
];

const MOBILE_FEATURES = [
  {
    id: "sell",
    title: "Sell",
    price: "Post a listing",
    href: "/listings/create",
    icon: Tag,
    isReady: true,
  },
  {
    id: "storefront",
    title: "Storefront",
    price: "Dashboard & store manager",
    href: "/stores?view=storefront",
    icon: Store,
    isReady: true,
  },
  {
    id: "ads",
    title: "Ads",
    price: "Promote on campus",
    href: "/coming-soon?feature=ads",
    icon: Megaphone,
    isReady: false,
  },
];

export function RebrandHeader() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState<number>(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState<number>(0);

  // Fetch unread notification and message counts
  useEffect(() => {
    if (!user) {
      setNotificationCount(0);
      setUnreadMessagesCount(0);
      return;
    }
    let isMounted = true;
    apiGet("/api/notifications?limit=1")
      .then((res: any) => {
        if (isMounted && typeof res?.unreadCount === "number") {
          setNotificationCount(res.unreadCount);
        }
      })
      .catch(() => {
        if (isMounted) setNotificationCount(0);
      });

    apiGet("/api/messages/conversations?limit=30")
      .then((res: any) => {
        if (isMounted && Array.isArray(res?.conversations)) {
          const totalUnread = res.conversations.reduce(
            (sum: number, conv: any) => sum + (Number(conv?.unreadCount) || 0),
            0
          );
          setUnreadMessagesCount(totalUnread);
        }
      })
      .catch(() => {
        if (isMounted) setUnreadMessagesCount(0);
      });

    return () => {
      isMounted = false;
    };
  }, [user?.id, pathname]);

  // Prevent body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <header
        style={{ fontFamily: "var(--font-plus-jakarta), sans-serif" }}
        className="sticky top-0 z-50 w-full bg-white dark:bg-[#14161D] border-b border-[#ECEEF2] dark:border-white/10 transition-colors"
      >
        <div className="max-w-[1380px] mx-auto px-4 sm:px-8 lg:px-12 h-[64px] sm:h-[68px] flex items-center justify-between gap-4">
          {/* Left: Mobile Hamburger + Brand Logo + Desktop Navigation */}
          <div className="flex items-center gap-2.5 sm:gap-10 lg:gap-14">
            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-expanded={mobileMenuOpen}
              aria-label="Open navigation menu"
              className="radius-native md:hidden -ml-1.5 h-9 w-9 rounded-full flex items-center justify-center text-[#171717] dark:text-neutral-200 hover:bg-[#F3F4F6] dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              <Menu className="w-[21px] h-[21px]" strokeWidth={2} />
            </button>

            {/* Campus Hive Logo */}
            <Logo height={28} width={70} href="/home" />

            {/* Desktop Navigation Links */}
            <nav
              aria-label="Primary marketplace navigation"
              className="hidden md:flex items-center gap-7 lg:gap-8"
            >
              {NAV_LINKS.map((link) => {
                const isActive =
                  pathname === link.href ||
                  (link.href === "/wanted" && pathname === "/radar") ||
                  (link.isDefaultActive && (pathname === "/home" || pathname === "/" || pathname === "/temp-home"));

                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={`relative py-2 text-[13.5px] transition-colors ${
                      isActive
                        ? "font-semibold text-[#171717] dark:text-white"
                        : "font-medium text-[#636871] dark:text-neutral-400 hover:text-[#171717] dark:hover:text-white"
                    }`}
                  >
                    {link.label}
                    {isActive && (
                      <span
                        className="radius-native absolute left-0 right-0 -bottom-[3px] h-[2.5px] rounded-full bg-[#F5B800]"
                        aria-hidden="true"
                      />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right: Utility Icons (Mobile: Search, Notifications, Messages, Profile) */}
          <div className="flex items-center gap-1 sm:gap-3">
            <Link
              href="/search"
              aria-label="Search marketplace"
              title="Search"
              className="radius-native h-9 w-9 rounded-full flex items-center justify-center text-[#22252A] dark:text-neutral-200 hover:bg-[#F3F4F6] dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              <Search className="w-[19px] h-[19px]" strokeWidth={1.8} />
            </Link>

            <Link
              href="/notifications"
              aria-label="Notifications"
              title="Notifications"
              className={`radius-native relative h-9 w-9 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                pathname?.startsWith("/notifications")
                  ? "bg-[#FFF3C4] text-[#171717] dark:bg-[#FFC928]/20 dark:text-[#FFC928]"
                  : "text-[#22252A] dark:text-neutral-200 hover:bg-[#F3F4F6] dark:hover:bg-white/10"
              }`}
            >
              <Bell className="w-[19px] h-[19px]" strokeWidth={1.8} />
              {notificationCount > 0 && (
                <span
                  aria-label={`${notificationCount} unread notifications`}
                  className="
                    absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-[#EF4444] ring-2 ring-white dark:ring-[#14161D]
                  "
                />
              )}
            </Link>

            <Link
              href="/messages"
              aria-label="Messages"
              title="Messages"
              className={`radius-native relative h-9 w-9 rounded-full flex items-center justify-center transition-colors ${
                pathname?.startsWith("/messages")
                  ? "bg-[#FFF3C4] text-[#171717] dark:bg-[#FFC928]/20 dark:text-[#FFC928]"
                  : "text-[#22252A] dark:text-neutral-200 hover:bg-[#F3F4F6] dark:hover:bg-white/10"
              }`}
            >
              <MessageCircleMore className="w-[19px] h-[19px]" strokeWidth={1.8} />
              {unreadMessagesCount > 0 && (
                <span
                  aria-label={`${unreadMessagesCount} unread messages`}
                  className="
                    absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-[#EF4444] ring-2 ring-white dark:ring-[#14161D]
                  "
                />
              )}
            </Link>

            <Link
              href="/profile"
              aria-label="Profile"
              title="Profile"
              className="radius-native h-9 w-9 rounded-full flex items-center justify-center text-[#22252A] dark:text-neutral-200 hover:bg-[#F3F4F6] dark:hover:bg-white/10 transition-colors"
            >
              <User className="w-[19px] h-[19px]" strokeWidth={1.8} />
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Slide-Over Hamburger Drawer (Navigation + Categories + Around Your Campus) */}
      {mobileMenuOpen && (
        <div
          style={{ fontFamily: "var(--font-plus-jakarta), sans-serif" }}
          className="fixed inset-0 z-[100] md:hidden flex"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation menu"
        >
          {/* Dark Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-[1px] transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Slide-Over Panel */}
          <div className="relative z-10 w-[84%] max-w-[320px] h-full bg-white dark:bg-[#14161D] text-[#171717] dark:text-white shadow-2xl flex flex-col overflow-y-auto">
            {/* Drawer Header: Close X + Brand Logo */}
            <div className="sticky top-0 z-20 flex items-center gap-3 px-4 h-[60px] bg-white dark:bg-[#14161D] border-b border-[#ECEEF2] dark:border-white/10 shrink-0">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
                className="h-8 w-8 rounded-full flex items-center justify-center text-[#171717] dark:text-white hover:bg-[#F3F4F6] dark:hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" strokeWidth={2} />
              </button>

              <Logo
                height={28}
                width={70}
                href="/home"
                onClick={() => setMobileMenuOpen(false)}
              />
            </div>

            {/* 1. Primary Navigation Section */}
            <div className="py-2 border-b border-[#ECEEF2] dark:border-white/10">
              <div className="px-4 py-1.5 flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-[#8C929C] dark:text-neutral-400">
                  Navigation
                </span>
              </div>

              <div className="space-y-0.5">
                {NAV_LINKS.map((link) => {
                  const Icon = link.icon;
                  const isActive =
                    pathname === link.href ||
                    (link.href === "/wanted" && pathname === "/radar") ||
                    (link.isDefaultActive && (pathname === "/home" || pathname === "/" || pathname === "/temp-home"));

                  return (
                    <Link
                      key={link.label}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-4 py-2.5 text-[13.5px] transition-colors ${
                        isActive
                          ? "font-bold text-[#171717] dark:text-white bg-[#FFF8E1] dark:bg-[#FFC928]/10"
                          : "font-medium text-[#22252A] dark:text-neutral-300 hover:bg-[#F7F8FA] dark:hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`w-[18px] h-[18px] ${
                            isActive
                              ? "text-[#171717] dark:text-[#FFC928]"
                              : "text-[#5B636E] dark:text-neutral-400"
                          }`}
                          strokeWidth={1.8}
                        />
                        <span>{link.label}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#8C929C]" strokeWidth={1.8} />
                    </Link>
                  );
                })}

                {/* Mobile Drawer Notifications */}
                <Link
                  href="/notifications"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-4 py-2.5 text-[13.5px] transition-colors ${
                    pathname?.startsWith("/notifications")
                      ? "font-bold text-[#171717] dark:text-white bg-[#FFF8E1] dark:bg-[#FFC928]/10"
                      : "font-medium text-[#22252A] dark:text-neutral-300 hover:bg-[#F7F8FA] dark:hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Bell
                      className={`w-[18px] h-[18px] ${
                        pathname?.startsWith("/notifications")
                          ? "text-[#171717] dark:text-[#FFC928]"
                          : "text-[#5B636E] dark:text-neutral-400"
                      }`}
                      strokeWidth={1.8}
                    />
                    <span>Notifications</span>
                  </div>
                  {notificationCount > 0 ? (
                    <span className="min-w-[18px] h-[18px] px-1.5 rounded-full bg-[#EF4444] text-white text-[10px] font-bold flex items-center justify-center">
                      {notificationCount > 99 ? "99+" : notificationCount}
                    </span>
                  ) : (
                    <ChevronRight className="w-4 h-4 text-[#8C929C]" strokeWidth={1.8} />
                  )}
                </Link>
              </div>
            </div>

            {/* 2. Categories Section */}
            <div className="py-2.5 border-b border-[#ECEEF2] dark:border-white/10">
              <div className="px-4 py-1.5 flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-[#8C929C] dark:text-neutral-400">
                  Our Categories
                </span>
                <Link
                  href="/explore"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-[11.5px] font-bold text-[#D99B00] dark:text-[#FFC928] hover:underline"
                >
                  See All
                </Link>
              </div>

              <div className="space-y-0.5 mt-0.5">
                {MOBILE_CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <Link
                      key={cat.label}
                      href={cat.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between px-4 py-2.5 text-[13.5px] font-medium text-[#22252A] dark:text-neutral-300 hover:bg-[#F7F8FA] dark:hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className="w-[18px] h-[18px] text-[#5B636E] dark:text-neutral-400"
                          strokeWidth={1.8}
                        />
                        <span>{cat.label}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#8C929C]" strokeWidth={1.8} />
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* 3. Features Section with Pending Indicators */}
            <div className="py-2.5">
              <div className="px-4 py-1.5 flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-[#8C929C] dark:text-neutral-400">
                  Features
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F5F6F8] dark:bg-white/5 text-[#8C929C]">
                  Preview
                </span>
              </div>

              <div className="divide-y divide-[#F1F3F6] dark:divide-white/5 px-4">
                {MOBILE_FEATURES.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between py-2.5 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-[#F5F6F8] dark:bg-white/5 flex items-center justify-center text-[#22252A] dark:text-neutral-200 shrink-0">
                          <Icon className="w-[15px] h-[15px]" strokeWidth={1.8} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[13px] font-semibold text-[#171717] dark:text-white leading-tight truncate">
                            {item.title}
                          </p>
                          <p className="text-[11.5px] font-medium text-[#68707A] dark:text-neutral-400 mt-0.5">
                            {item.price}
                          </p>
                        </div>
                      </div>

                      {/* Indicator: Green Check for Ready, Amber Clock for Coming Soon */}
                      {item.isReady ? (
                        <span
                          title="Feature ready to use"
                          className="w-4 h-4 rounded-full bg-[#22C55E] flex items-center justify-center shrink-0"
                        >
                          <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                        </span>
                      ) : (
                        <span
                          title="Feature in development - Coming soon"
                          className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/25 flex items-center gap-1 shrink-0"
                        >
                          <Clock className="w-2.5 h-2.5 stroke-[2.2]" />
                          <span>Soon</span>
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

