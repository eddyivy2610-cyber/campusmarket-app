"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState, useEffect } from "react";
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    MessageSquare,
    Bell,
    ArrowLeft,
    Search,
    Sun,
    Moon,
    BarChart3,
    Settings,
    Menu,
    X,
    PlusSquare,
    Megaphone,
    LineChart as LineChartIcon
} from "lucide-react";
import { useTheme } from "next-themes";
import { IconTooltip } from "../components/common/IconTooltip";
import { SearchDropdown } from "../components/dashboard/SearchDropdown";
import { CONVERSATIONS } from "../data/chat";
import { useAuth } from "../context/AuthContext";

import { DashboardOnboarding } from "../components/dashboard/DashboardOnboarding";
import { DashboardYearContext } from "../context/DashboardYearContext";

const NAV_ITEMS = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Products", href: "/dashboard/products", icon: Package },
    { name: "Orders", href: "/dashboard/orders", icon: ShoppingCart },
    { name: "Messages", href: "/messages", icon: MessageSquare },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
];



const MOBILE_QUICK_ACTIONS = [
    { title: "Add Listing", icon: PlusSquare, href: "/dashboard/products/add" },
    { title: "Messages", icon: MessageSquare, href: "/messages" },
    { title: "Settings", icon: Settings, href: "/dashboard/settings" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { user, refreshUser } = useAuth();
    const isPro = user?.role === "pro";
    const isStudentVerified = user?.studentVerified === true;
    const canAccessPro = isPro && isStudentVerified;
    const isMessagesRoute = pathname.startsWith("/messages");
    const [selectedYear] = useState(new Date().getFullYear());
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    const currentPageName = useMemo(() => {
        const matched = NAV_ITEMS.find((item) => pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href)));
        return matched ? matched.name : "Overview";
    }, [pathname]);

    // Hydration guard for next-themes
    useEffect(() => {
        setMounted(true);
    }, []);

    // Intelligent Global Search Logic
    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }

        const query = searchQuery.toLowerCase();
        const results: any[] = [];

        // 1. Search Products (from mock listings)
        Object.values(CONVERSATIONS).forEach(c => {
            if (c.listing && c.listing.title.toLowerCase().includes(query)) {
                if (!results.find(r => r.id === c.listing?.id && r.type === "product")) {
                    results.push({
                        id: c.listing.id,
                        type: "product",
                        title: c.listing.title,
                        subtitle: `₦${c.listing.price.toLocaleString()}`,
                        href: `/dashboard/products?id=${c.listing.id}`,
                        image: c.listing.image
                    });
                }
            }
        });

        // 2. Search Messages / Participants
        CONVERSATIONS.forEach(c => {
            if (c.participant.name.toLowerCase().includes(query) || c.lastMessage.toLowerCase().includes(query)) {
                results.push({
                    id: c.id,
                    type: "message",
                    title: c.participant.name,
                    subtitle: c.lastMessage,
                    href: `/messages?user=${c.participant.id}`,
                    image: c.participant.avatar
                });
            }
        });

        setSearchResults(results.slice(0, 8)); // Limit to top 8
    }, [searchQuery]);

    // ESC key to close search
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setIsSearchOpen(false);
                setSearchQuery("");
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark");
    };

    const userInitials = user?.name ? user.name.charAt(0).toUpperCase() : "U";
    const userTier = user?.tier || "new";
    if (user && !canAccessPro) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center px-6 py-16 bg-background text-foreground font-heading">
                <div className="max-w-md w-full rounded-2xl border border-border/60 bg-card p-8 text-center shadow-sm">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Verification Required</p>
                    <h1 className="mt-2 text-xl font-bold">Your student verification is pending</h1>
                    <p className="mt-3 text-sm text-muted-foreground">
                        You can browse listings and message sellers, but seller tools like Dashboard, Listings, and Ratings are locked until your student ID is approved.
                    </p>
                    <div className="mt-6 flex items-center justify-center gap-2">
                        <Link href="/home" className="px-4 py-2 rounded-lg bg-primary text-black text-xs font-bold uppercase tracking-widest">
                            Go Home
                        </Link>
                        <button
                            onClick={refreshUser}
                            className="px-4 py-2 rounded-lg border border-border text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground"
                        >
                            Refresh Status
                        </button>
                        <Link href="/settings" className="px-4 py-2 rounded-lg border border-border text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground">
                            Account Settings
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`dashboard-scope flex flex-col ${isMessagesRoute ? "h-screen overflow-hidden" : "min-h-screen"} w-full bg-background text-foreground font-heading transition-colors duration-500`}>
            {/* Dashboard Header - Part of flex flow for messages to auto-size height */}
            <header className={`${isMessagesRoute ? "relative shrink-0" : "sticky top-0 z-40"} border-b border-border/50 bg-card shadow-sm transition-all duration-300`}>
                <div className="max-w-[1780px] mx-auto px-3 md:px-6 py-3">
                    <div className="flex items-center gap-4">
                        {/* Mobile hamburger – left side */}
                        <button
                            className="md:hidden flex items-center justify-center h-9 w-9 rounded-xl bg-secondary/60 border border-border/50 text-foreground/70 hover:text-primary transition-colors shrink-0"
                            onClick={() => setIsMobileMenuOpen(true)}
                            aria-label="Open menu"
                        >
                            <Menu className="w-4 h-4" />
                        </button>

                        <div className="flex items-center gap-3">
                            <div>
                                <h1 className="text-base md:text-lg font-black text-foreground transition-colors tracking-tight uppercase">{currentPageName}</h1>
                            </div>
                        </div>
                        <div className="ml-auto flex items-center gap-2.5">
                            {/* Theme Toggle – desktop only; mobile lives in hamburger drawer */}
                            <button
                                onClick={toggleTheme}
                                className="hidden md:flex relative items-center h-8 w-14 rounded-full bg-secondary border border-border/50 p-1 transition-all active:scale-95 overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
                            >
                                <div
                                    className={`absolute inset-1 w-6 h-6 rounded-full bg-white dark:bg-primary shadow-lg flex items-center justify-center transition-all duration-300 transform ${
                                        mounted && theme === "dark" ? "translate-x-6" : "translate-x-0"
                                    }`}
                                >
                                    {mounted && theme === "dark" ? (
                                        <Moon className="w-3.5 h-3.5 text-[#1a1d33]" />
                                    ) : (
                                        <Sun className="w-3.5 h-3.5 text-amber-500" />
                                    )}
                                </div>
                                <div className="flex justify-between w-full px-1.5 opacity-20 dark:opacity-40">
                                    <Sun className="w-3 h-3 text-amber-500" />
                                    <Moon className="w-3 h-3 text-blue-400" />
                                </div>
                            </button>

                            {/* Global Search */}
                            <div className="relative group">
                                <div className={`hidden md:flex items-center h-9 w-[240px] rounded-full bg-secondary/50 border transition-all duration-300 ${isSearchOpen ? 'border-primary ring-4 ring-primary/10 bg-card' : 'border-border/50'} px-3 text-muted-foreground`}>
                                    <Search className={`w-4 h-4 transition-colors ${isSearchOpen ? 'text-primary' : 'text-muted-foreground/60'}`} />
                                    <input
                                        placeholder="Global search..."
                                        value={searchQuery}
                                        onChange={(e) => {
                                            setSearchQuery(e.target.value);
                                            setIsSearchOpen(true);
                                        }}
                                        onFocus={() => setIsSearchOpen(true)}
                                        onBlur={() => setIsSearchOpen(false)}
                                        className="bg-transparent border-none outline-none text-[11px] font-bold px-2 w-full text-foreground placeholder:text-muted-foreground/40"
                                    />
                                </div>
                                <SearchDropdown
                                    isVisible={isSearchOpen}
                                    results={searchResults}
                                    query={searchQuery}
                                    onClose={() => setIsSearchOpen(false)}
                                />
                            </div>

                            {/* Notification + Avatar pill — matches homepage header */}
                            <div className="flex items-center gap-1 bg-card/80 backdrop-blur-lg border border-border/60 rounded-lg px-1.5 py-1 shadow-sm">
                                {/* Bell */}
                                <button
                                    className="flex items-center justify-center p-1.5 rounded-lg hover:bg-secondary transition-colors text-foreground/70 relative group"
                                    title="Notifications"
                                >
                                    <Bell className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110 group-hover:text-primary" />
                                    <span className="absolute top-0.5 right-0.5 translate-x-1 -translate-y-1 bg-red-500 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full ring-2 ring-background animate-pulse">
                                        3
                                    </span>
                                </button>

                                <div className="w-px h-5 bg-border/60 mx-0.5" />

                                {/* Avatar */}
                                <button className="flex items-center gap-2 p-1 rounded-lg hover:bg-secondary transition-colors group text-left">
                                    <div className="bg-secondary p-1 rounded-md group-hover:bg-primary/10 transition-colors">
                                        <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-primary/80 to-primary/40 text-black flex items-center justify-center text-[9px] font-black">
                                            {userInitials}
                                        </div>
                                    </div>
                                    <div className="hidden sm:flex flex-col leading-tight pr-1">
                                        <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold group-hover:text-foreground transition-colors">
                                            {userTier} Vendor
                                        </span>
                                        <span className="text-[11px] font-bold text-foreground">
                                            {user?.name?.split(" ")[0]}
                                        </span>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* ── Mobile Hamburger Drawer ─────────────────────────────── */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 z-50 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                >
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

                    {/* Drawer panel */}
                    <div
                        className="absolute left-0 top-0 h-full w-72 bg-card border-r border-border/50 shadow-2xl flex flex-col p-5 gap-6 animate-in slide-in-from-left-4 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Drawer header */}
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Menu</span>
                            <button
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="h-8 w-8 rounded-lg bg-secondary/60 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Theme toggle row */}
                        <div className="flex items-center justify-between px-1">
                            <span className="text-sm font-bold text-foreground">
                                {mounted && theme === "dark" ? "Dark Mode" : "Light Mode"}
                            </span>
                            <button
                                onClick={toggleTheme}
                                className="relative flex items-center h-8 w-14 rounded-full bg-secondary border border-border/50 p-1 transition-all active:scale-95 overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
                            >
                                <div
                                    className={`absolute inset-1 w-6 h-6 rounded-full bg-white dark:bg-primary shadow-lg flex items-center justify-center transition-all duration-300 transform ${
                                        mounted && theme === "dark" ? "translate-x-6" : "translate-x-0"
                                    }`}
                                >
                                    {mounted && theme === "dark" ? (
                                        <Moon className="w-3.5 h-3.5 text-[#1a1d33]" />
                                    ) : (
                                        <Sun className="w-3.5 h-3.5 text-amber-500" />
                                    )}
                                </div>
                                <div className="flex justify-between w-full px-1.5 opacity-20 dark:opacity-40">
                                    <Sun className="w-3 h-3 text-amber-500" />
                                    <Moon className="w-3 h-3 text-blue-400" />
                                </div>
                            </button>
                        </div>

                        <div className="h-px bg-border/40" />

                        {/* Quick Actions */}
                        <div>
                            <p className="text-[10px] uppercase tracking-widest font-black text-muted-foreground mb-3">Quick Actions</p>
                            <div className="space-y-1">
                                {MOBILE_QUICK_ACTIONS.map((action) => {
                                    const Icon = action.icon;
                                    return (
                                        <Link
                                            key={action.title}
                                            href={action.href}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-secondary transition-all group"
                                        >
                                            <span className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-all">
                                                <Icon className="w-4 h-4" />
                                            </span>
                                            <span className="text-sm font-bold text-foreground">{action.title}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className={`flex-1 flex max-w-[1780px] mx-auto w-full gap-6 relative ${isMessagesRoute ? "pt-0 px-0 py-0 md:px-6 md:py-6 overflow-hidden min-h-0" : "px-2 md:px-6 py-4 md:py-6"}`}>
                {/* Sidebar Spacer */}
                <div className="hidden md:block w-16 shrink-0" />

                {/* Floating Sidebar */}
                <aside className={`w-16 hidden md:flex flex-col items-center py-4 bg-card border border-border/40 rounded-xl shadow-sm fixed ${isMessagesRoute ? "top-20" : "top-24"} left-3 md:left-6 h-[calc(100vh-8rem)] z-30`}>
                    {/* Back to Profile */}
                    <Link href="/profile" className="mb-8">
                        <IconTooltip content="Back to Profile" position="right">
                            <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground transition-all">
                                <ArrowLeft className="w-4 h-4" />
                            </div>
                        </IconTooltip>
                    </Link>

                    {/* Nav Links */}
                    <nav className="flex flex-col gap-4 flex-1">
                        {NAV_ITEMS.map((item) => {
                            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                            return (
                                <Link key={item.name} href={item.href}>
                                    <IconTooltip content={item.name} position="right">
                                        <div className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all ${isActive
                                            ? "bg-primary text-primary-foreground shadow-sm"
                                            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                                            }`}>
                                            <item.icon className="w-4.5 h-4.5" />
                                        </div>
                                    </IconTooltip>
                                </Link>
                            );
                        })}
                    </nav>
                </aside>

                {/* Mobile Sidebar Navigation (Bottom Bar) */}
                <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border/50 z-50 flex items-center justify-around px-2 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                        return (
                            <Link key={item.name} href={item.href} className={`p-3 rounded-xl transition-all ${isActive ? 'text-primary scale-110' : 'text-muted-foreground'}`}>
                                <item.icon className="w-[22px] h-[22px]" />
                            </Link>
                        );
                    })}
                </nav>

                <DashboardYearContext.Provider value={{ year: selectedYear, setYear: () => {} }}>
                    <main className={`flex-1 min-h-0 ${isMessagesRoute ? "overflow-hidden" : ""}`}>
                        {children}
                        {isPro && <DashboardOnboarding />}
                    </main>
                </DashboardYearContext.Provider>
            </div>
        </div>
    );
}
