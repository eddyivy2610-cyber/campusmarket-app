"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileCheck,
  ShieldAlert,
  Store,
  Users,
  Settings,
  ArrowLeft,
  ExternalLink,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  Search,
  Shield,
  BadgeCheck,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Logo } from "../ui/Logo";
import { getAdminSession, clearAdminSession, signInAdmin } from "@/lib/adminAuth";

export interface AdminNavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  matchPrefixes?: string[];
}

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  {
    name: "Overview",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "Business Applications",
    href: "/admin/business-applications",
    icon: FileCheck,
    matchPrefixes: ["/admin/business-applications", "/admin/sellers"],
  },
  {
    name: "Listing Moderation",
    href: "/admin/moderation",
    icon: ShieldAlert,
    matchPrefixes: ["/admin/moderation", "/admin/listings"],
  },
  {
    name: "Stores",
    href: "/admin/stores",
    icon: Store,
    matchPrefixes: ["/admin/stores"],
  },
  {
    name: "Users",
    href: "/admin/users",
    icon: Users,
    matchPrefixes: ["/admin/users"],
  },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: Settings,
    matchPrefixes: ["/admin/settings"],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme, resolvedTheme } = useTheme();

  const [isMounted, setIsMounted] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const currentTheme = resolvedTheme || theme;

  useEffect(() => {
    setIsMounted(true);
    const existing = getAdminSession();
    const token = typeof window !== "undefined" ? localStorage.getItem("campus_token") : null;

    if (!existing || !token) {
      setSession(null);
      setIsCheckingAuth(false);
      return;
    }

    // Verify token validity with server admin endpoint
    fetch("/api/admin/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) {
          clearAdminSession();
          setSession(null);
        } else {
          setSession(existing);
        }
      })
      .catch(() => {
        setSession(existing);
      })
      .finally(() => {
        setIsCheckingAuth(false);
      });
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const activeNavItem = useMemo(() => {
    return (
      ADMIN_NAV_ITEMS.find((item) => {
        if (item.href === "/admin") return pathname === "/admin";
        if (item.matchPrefixes) {
          return item.matchPrefixes.some((prefix) => pathname.startsWith(prefix));
        }
        return pathname.startsWith(item.href);
      }) || ADMIN_NAV_ITEMS[0]
    );
  }, [pathname]);

  const handleSignOut = () => {
    clearAdminSession();
    setSession(null);
    router.replace("/admin/auth/sign-in");
  };

  const handleDemoSignIn = async () => {
    setIsCheckingAuth(true);
    const res = await signInAdmin("admin@campushive.edu.ng", "admin");
    if (res.ok && res.session) {
      setSession(res.session);
    }
    setIsCheckingAuth(false);
  };

  const toggleTheme = () => {
    setTheme(currentTheme === "dark" ? "light" : "dark");
  };

  // 1. Loading state
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F8FA] dark:bg-[#0E1015]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 rounded-full border-3 border-[#FFC928] border-t-transparent animate-spin" />
          <p className="text-[13px] font-semibold text-[#5B636E] dark:text-neutral-400">
            Verifying admin access...
          </p>
        </div>
      </div>
    );
  }

  // 2. Unauthorized state
  if (!session) {
    return (
      <div
        style={{ fontFamily: "var(--font-plus-jakarta), sans-serif" }}
        className="min-h-screen flex items-center justify-center bg-[#F7F8FA] dark:bg-[#0E1015] px-4 py-12 text-[#171717] dark:text-white"
      >
        <div className="radius-native w-full max-w-md rounded-3xl bg-white dark:bg-[#14161D] border border-[#E8E8E8] dark:border-white/10 shadow-xl p-7 text-center space-y-5">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-[#FFC928]/20 border border-[#FFC928]/40 flex items-center justify-center text-[#171717] dark:text-[#FFC928]">
            <Shield className="w-8 h-8 stroke-[2.2]" />
          </div>

          <div className="space-y-1.5">
            <h1 className="text-[20px] sm:text-[22px] font-extrabold tracking-[-0.02em]">
              Administrator Access Required
            </h1>
            <p className="text-[13px] text-[#68707A] dark:text-neutral-400 leading-relaxed">
              You must be signed in with administrative credentials to access the Campus Hive 2.0 Admin Suite.
            </p>
          </div>

          <div className="space-y-2.5 pt-2">
            <Link
              href={`/admin/auth/sign-in?next=${encodeURIComponent(pathname || "/admin")}`}
              className="radius-native w-full py-2.5 px-4 rounded-xl bg-[#171717] dark:bg-white hover:opacity-90 text-white dark:text-[#171717] text-[13px] font-bold inline-flex items-center justify-center gap-2 shadow-xs transition-opacity"
            >
              <span>Sign in as Administrator</span>
              <ChevronRight className="w-4 h-4" />
            </Link>

            <button
              type="button"
              onClick={handleDemoSignIn}
              className="radius-native w-full py-2.5 px-4 rounded-xl bg-[#FFC928] hover:bg-[#F2BD1E] text-[#171717] text-[13px] font-extrabold inline-flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Instant Dev / Demo Admin Sign-In</span>
            </button>

            <Link
              href="/stores"
              className="radius-native w-full py-2 px-4 rounded-xl border border-[#E8E8E8] dark:border-white/10 hover:border-[#171717] dark:hover:border-white text-[12.5px] font-semibold text-[#5B636E] dark:text-neutral-300 inline-flex items-center justify-center gap-2 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Campus Marketplace</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. Authorized Admin Workspace
  return (
    <div
      style={{ fontFamily: "var(--font-plus-jakarta), sans-serif" }}
      className="min-h-screen bg-[#F7F8FA] dark:bg-[#0E1015] text-[#171717] dark:text-white flex flex-col antialiased"
    >
      {/* =============================================================== */}
      {/* MOBILE SLIDE-OVER DRAWER                                       */}
      {/* =============================================================== */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer Sidebar */}
          <div className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-[#14161D] border-r border-[#E8E8E8] dark:border-white/10 shadow-2xl flex flex-col p-5 animate-in slide-in-from-left duration-200">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#ECEEF2] dark:border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-[19px] font-extrabold tracking-tight">Campus Hive</span>
                <span className="radius-native px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#FFC928] text-[#171717]">
                  ADMIN
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-[#68707A] hover:text-[#171717] dark:text-neutral-400 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nav list */}
            <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
              {ADMIN_NAV_ITEMS.map((item) => {
                const isActive = activeNavItem.name === item.name;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`radius-native flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-bold transition-all ${
                      isActive
                        ? "bg-[#FFC928] text-[#171717] shadow-xs"
                        : "text-[#5B636E] dark:text-neutral-300 hover:bg-[#F2F4F7] dark:hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </div>
                    {item.badge && (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-black/10 dark:bg-white/10">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Bottom Footer */}
            <div className="pt-4 border-t border-[#ECEEF2] dark:border-white/10 space-y-3">
              <Link
                href="/stores"
                className="radius-native flex items-center gap-2 text-[12.5px] font-semibold text-[#5B636E] dark:text-neutral-300 hover:text-[#171717]"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Campus Marketplace</span>
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="radius-native w-full py-2 px-3 rounded-xl border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 hover:bg-rose-50 text-[12.5px] font-bold flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =============================================================== */}
      {/* DESKTOP ROOT CONTAINER: SIDEBAR + MAIN AREA                     */}
      {/* =============================================================== */}
      <div className="flex-1 flex w-full">
        {/* DESKTOP FIXED SIDEBAR */}
        <aside className="hidden lg:flex w-64 flex-col shrink-0 bg-white dark:bg-[#14161D] border-r border-[#E8E8E8] dark:border-white/10 sticky top-0 h-screen z-30">
          {/* Logo Brand Header */}
          <div className="h-16 px-6 flex items-center justify-between border-b border-[#ECEEF2] dark:border-white/10">
            <div className="flex items-center gap-2">
              <Logo height={26} width={65} href="/admin" />
              <span className="radius-native px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#FFC928] text-[#171717]">
                ADMIN
              </span>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="flex-1 px-4 py-5 space-y-6 overflow-y-auto scrollbar-none">
            <div className="space-y-1">
              <div className="px-3 pb-2 text-[10.5px] font-bold uppercase tracking-wider text-[#8C929C] dark:text-neutral-500">
                Administration
              </div>

              {ADMIN_NAV_ITEMS.map((item) => {
                const isActive = activeNavItem.name === item.name;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`radius-native group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-bold transition-all ${
                      isActive
                        ? "bg-[#FFC928] text-[#171717] shadow-xs"
                        : "text-[#5B636E] dark:text-neutral-300 hover:bg-[#F7F8FA] dark:hover:bg-white/5 hover:text-[#171717] dark:hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon
                        className={`w-4 h-4 ${
                          isActive
                            ? "text-[#171717]"
                            : "text-[#8C929C] group-hover:text-[#171717] dark:group-hover:text-white"
                        }`}
                      />
                      <span>{item.name}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10.5px] font-extrabold ${
                          isActive
                            ? "bg-black/10 text-[#171717]"
                            : "bg-[#F2F4F7] dark:bg-white/10 text-[#5B636E] dark:text-neutral-300"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Quick Switcher to Marketplace */}
            <div className="pt-2 border-t border-[#ECEEF2] dark:border-white/10 space-y-1">
              <div className="px-3 pb-2 text-[10.5px] font-bold uppercase tracking-wider text-[#8C929C] dark:text-neutral-500">
                Front-Facing App
              </div>

              <Link
                href="/stores"
                className="radius-native flex items-center justify-between px-3.5 py-2 rounded-xl text-[12.5px] font-semibold text-[#5B636E] dark:text-neutral-300 hover:bg-[#F7F8FA] dark:hover:bg-white/5 hover:text-[#171717] transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <ArrowLeft className="w-3.5 h-3.5 text-[#8C929C]" />
                  <span>Campus Stores</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-[#8C929C]" />
              </Link>
            </div>
          </div>

          {/* Admin Profile & Sign Out Footer */}
          <div className="p-4 border-t border-[#ECEEF2] dark:border-white/10 bg-[#FAFBFD] dark:bg-white/2">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-[#171717] text-[#FFC928] dark:bg-white dark:text-[#171717] flex items-center justify-center font-black text-sm shrink-0">
                  {(session.username || "A").charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="text-[12.5px] font-bold text-[#171717] dark:text-white truncate">
                    {session.username || "Administrator"}
                  </div>
                  <div className="text-[10.5px] text-[#8C929C] truncate">
                    {session.email || "admin@campushive.edu.ng"}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSignOut}
                aria-label="Sign out"
                title="Sign out of admin"
                className="radius-native p-2 rounded-lg text-[#8C929C] hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>

        {/* MAIN REGION: TOP HEADER + CONTENT */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* TOP HEADER BAR */}
          <header className="h-16 bg-white dark:bg-[#14161D] border-b border-[#E8E8E8] dark:border-white/10 sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6 lg:px-8">
            {/* Left: Mobile hamburger & Breadcrumbs */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-xl border border-[#ECEEF2] dark:border-white/10 text-[#171717] dark:text-white"
                aria-label="Open navigation menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-1.5 text-[13px] font-bold">
                <span className="text-[#8C929C] dark:text-neutral-400 hidden sm:inline">Admin</span>
                <span className="text-[#8C929C] dark:text-neutral-500 hidden sm:inline">/</span>
                <span className="text-[#171717] dark:text-white">{activeNavItem.name}</span>
              </div>
            </div>

            {/* Right: Quick Actions + Theme Switcher + Marketplace Shortcut */}
            <div className="flex items-center gap-2.5">
              <div className="relative hidden md:block w-48 xl:w-60">
                <Search className="w-3.5 h-3.5 text-[#8C929C] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Quick search..."
                  className="radius-native w-full pl-8 pr-3 py-1.5 text-[12px] rounded-xl bg-[#F7F8FA] dark:bg-white/5 border border-[#ECEEF2] dark:border-white/10 text-[#171717] dark:text-white placeholder-[#8C929C] focus:outline-none focus:border-[#FFC928]"
                />
              </div>

              {/* Theme Toggle */}
              <button
                type="button"
                onClick={toggleTheme}
                aria-label="Toggle color theme"
                className="radius-native p-2 rounded-xl border border-[#ECEEF2] dark:border-white/10 hover:border-[#171717] dark:hover:border-white text-[#5B636E] dark:text-neutral-300 transition-colors cursor-pointer"
              >
                {isMounted && currentTheme === "dark" ? (
                  <Sun className="w-4 h-4 text-[#FFC928]" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </button>

              {/* Front-Facing Stores Shortcut */}
              <Link
                href="/stores"
                className="radius-native hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#ECEEF2] dark:border-white/10 bg-white dark:bg-white/5 hover:bg-[#F7F8FA] dark:hover:bg-white/10 text-[12px] font-bold text-[#171717] dark:text-white transition-colors"
              >
                <span>Marketplace</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </header>

          {/* MAIN SCROLLABLE CONTENT REGION */}
          <main className="flex-1 w-full p-4 sm:p-6 lg:p-8 max-w-[1440px] mx-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
