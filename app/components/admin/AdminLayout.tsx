"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useMemo, useState, useEffect } from "react";
import {
    LayoutDashboard,
    Users,
    UserCheck,
    Package,
    Flag,
    CheckCircle,
    FileText,
    Settings,
    MessageSquareWarning,
    BarChart3,
    Search,
    Sun,
    Moon,
    X,
    Bell,
    LogOut,
    PanelLeft,
    PanelRight,
    Star,
    History,
    Zap,
    ChevronDown,
    ChevronUp
} from "lucide-react";
import { useTheme } from "next-themes";
import { getAdminSession, clearAdminSession } from "@/lib/adminAuth";

const ADMIN_NAV_ITEMS = [
    { name: "Overview", href: "/admin", icon: LayoutDashboard },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Listings", href: "/admin/listings", icon: Package },
    { name: "Reports", href: "/admin/reports", icon: Flag },
    { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    { name: "Badges", href: "/admin/badges", icon: CheckCircle },
    { name: "Disputes", href: "/admin/dispute-center", icon: MessageSquareWarning },
    { name: "Logs", href: "/admin/logs", icon: FileText },
    { name: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [isReady, setIsReady] = useState(true);
    const [adminLabel, setAdminLabel] = useState("Admin");

    const [isLeftSidebarModalOpen, setIsLeftSidebarModalOpen] = useState(false); // For mobile menu
    const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState(false); // For desktop toggle
    const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);
    const [isUsersMenuOpen, setIsUsersMenuOpen] = useState(false);
    const [isListingsMenuOpen, setIsListingsMenuOpen] = useState(false);
    const [isReportsMenuOpen, setIsReportsMenuOpen] = useState(false);

    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    useEffect(() => {
        const session = getAdminSession();
        if (session?.username) {
            setAdminLabel(session.username);
        }
    }, []);

    const currentPageName = useMemo(() => {
        const matched = ADMIN_NAV_ITEMS.find((item) => pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href)));
        return matched ? matched.name : "Overview";
    }, [pathname]);

    const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");
    const handleLogout = () => { clearAdminSession(); router.replace("/admin/auth/sign-in"); };

    if (!isReady) {
        return (
            <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
        );
    }

    return (
        <div className="dashboard-scope flex h-[100dvh] w-full bg-background font-sans text-foreground overflow-hidden relative">

            {/* --- 1. LEFT SIDEBAR (Navigation & Logo) --- */}
            <aside className={`bg-card border-r border-border/50 hidden lg:flex flex-col shrink-0 transition-all duration-300 ease-in-out ${isLeftSidebarCollapsed ? 'w-0 overflow-hidden border-r-0' : 'w-[210px] xl:w-[230px]'}`}>
                {/* HIVE Logo Area (Top left) */}
                    <div className="h-[60px] flex items-center px-4 md:px-6 gap-3 shrink-0">
                        <span className="text-[20px] md:text-[22px] font-bold font-sans text-[#FFD700] whitespace-nowrap drop-shadow-sm">
                            Hive
                        </span>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider truncate">Admin Center</span>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5 no-scrollbar">
                        <div className="text-[10px] uppercase font-bold text-muted-foreground/70 tracking-widest px-3 mb-2 mt-2">Home</div>
                        {ADMIN_NAV_ITEMS.slice(0, 1).map((item) => {
                            const active = item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href);
                            return (
                                <Link key={item.name} href={item.href} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${active ? 'bg-secondary/80 text-foreground font-medium' : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'}`}>
                                    <item.icon className="w-4 h-4 opacity-70" />
                                    <span className="text-[13px]">{item.name}</span>
                                </Link>
                            );
                        })}


                        {/* Special Users Collapsible */}
                        <div className="mt-0.5">
                            <button 
                                onClick={() => setIsUsersMenuOpen(!isUsersMenuOpen)}
                                className={`flex items-center justify-between w-full px-3 py-2 rounded-lg transition-colors ${(pathname.startsWith("/admin/users") && !isUsersMenuOpen) ? 'bg-secondary/80 text-foreground font-medium' : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <Users className="w-4 h-4 opacity-70" />
                                    <span className="text-[13px]">Users</span>
                                </div>
                                {isUsersMenuOpen ? <ChevronUp className="w-3 h-3 opacity-40" /> : <ChevronDown className="w-3 h-3 opacity-40" />}
                            </button>
                            
                            {isUsersMenuOpen && (
                                <div className="ml-7 mt-1 flex flex-col gap-0.5 border-l border-border/40 pl-2">
                                    {[
                                        { name: "All Users", href: "/admin/users" },
                                        { name: "Pending", href: "/admin/users/pending" },
                                        { name: "Sellers", href: "/admin/users/sellers" },
                                        { name: "Suspended", href: "/admin/users/suspended" },
                                    ].map((sub) => {
                                        const active = pathname === sub.href;
                                        return (
                                            <Link 
                                                key={sub.name} 
                                                href={sub.href} 
                                                className={`px-3 py-1.5 rounded-md text-[12px] transition-colors ${active ? 'text-primary font-bold bg-primary/5' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/30'}`}
                                            >
                                                {sub.name}
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                        {/* Special Listings Collapsible */}
                        <div className="mt-0.5">
                            <button 
                                onClick={() => setIsListingsMenuOpen(!isListingsMenuOpen)}
                                className={`flex items-center justify-between w-full px-3 py-2 rounded-lg transition-colors ${(pathname.startsWith("/admin/listings") && !isListingsMenuOpen) ? 'bg-secondary/80 text-foreground font-medium' : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <Package className="w-4 h-4 opacity-70" />
                                    <span className="text-[13px]">Listings</span>
                                </div>
                                {isListingsMenuOpen ? <ChevronUp className="w-3 h-3 opacity-40" /> : <ChevronDown className="w-3 h-3 opacity-40" />}
                            </button>
                            
                            {isListingsMenuOpen && (
                                <div className="ml-7 mt-1 flex flex-col gap-0.5 border-l border-border/40 pl-2">
                                    {[
                                        { name: "All Listings", href: "/admin/listings" },
                                        { name: "New Submissions", href: "/admin/listings/new" },
                                        { name: "Flagged Items", href: "/admin/listings/flagged" },
                                    ].map((sub) => {
                                        const active = pathname === sub.href;
                                        return (
                                            <Link 
                                                key={sub.name} 
                                                href={sub.href} 
                                                className={`px-3 py-1.5 rounded-md text-[12px] transition-colors ${active ? 'text-primary font-bold bg-primary/5' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/30'}`}
                                            >
                                                {sub.name}
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Special Reports Collapsible */}
                        <div className="mt-0.5">
                            <button 
                                onClick={() => setIsReportsMenuOpen(!isReportsMenuOpen)}
                                className={`flex items-center justify-between w-full px-3 py-2 rounded-lg transition-colors ${(pathname.startsWith("/admin/reports") && !isReportsMenuOpen) ? 'bg-secondary/80 text-foreground font-medium' : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <Flag className="w-4 h-4 opacity-70" />
                                    <span className="text-[13px]">Reports</span>
                                </div>
                                {isReportsMenuOpen ? <ChevronUp className="w-3 h-3 opacity-40" /> : <ChevronDown className="w-3 h-3 opacity-40" />}
                            </button>
                            
                            {isReportsMenuOpen && (
                                <div className="ml-7 mt-1 flex flex-col gap-0.5 border-l border-border/40 pl-2">
                                    {[
                                        { name: "Report Queue", href: "/admin/reports" },
                                        { name: "Pending", href: "/admin/reports/pending" },
                                        { name: "In Review", href: "/admin/reports/in-review" },
                                        { name: "Resolved", href: "/admin/reports/resolved" },
                                    ].map((sub) => {
                                        const active = pathname === sub.href;
                                        return (
                                            <Link 
                                                key={sub.name} 
                                                href={sub.href} 
                                                className={`px-3 py-1.5 rounded-md text-[12px] transition-colors ${active ? 'text-primary font-bold bg-primary/5' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/30'}`}
                                            >
                                                {sub.name}
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                        {/* Analytics, Badges, Disputes, Logs, Settings */}
                        {ADMIN_NAV_ITEMS.slice(4).map((item) => {
                            const active = pathname.startsWith(item.href);
                            return (
                                <Link key={item.name} href={item.href} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${active ? 'bg-secondary/80 text-foreground font-medium' : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'}`}>
                                    <item.icon className="w-4 h-4 opacity-70" />
                                    <span className="text-[13px]">{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Bottom Admin Profile & Logout */}
                    <div className="p-4 border-t border-border/50 mt-auto flex flex-col gap-3">
                        <div className="flex items-center gap-3 px-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-500 to-orange-400 flex items-center justify-center text-white text-xs font-bold ring-2 ring-background shrink-0">
                                {adminLabel.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-xs font-bold tracking-tight text-foreground truncate">{adminLabel}</span>
                                <span className="text-[9px] text-muted-foreground uppercase tracking-wider">Administrator</span>
                            </div>
                        </div>
                        <button onClick={handleLogout} className="flex items-center justify-center gap-2 w-full px-3 py-2 text-xs font-medium text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                            <LogOut className="w-3.5 h-3.5" />
                            Sign Out
                        </button>
                    </div>
                </aside>


            {/* --- 2. MIDDLE SECTION (Header & Main) --- */}
            <div className="flex-1 flex flex-col min-w-0 bg-background relative">
                {/* Header */}
                <header className="h-[60px] border-b border-border/50 bg-background/80 backdrop-blur-md flex items-center justify-between px-3 md:px-5 shrink-0 z-10 transition-colors">
                    
                    {/* Left side of header (Breadcrumbs & Toggles) */}
                    <div className="flex items-center gap-1 md:gap-3 text-muted-foreground">
                        <button onClick={() => setIsLeftSidebarModalOpen(true)} className="p-1.5 hover:bg-secondary rounded-md lg:hidden transition-colors">
                            <PanelLeft className="w-4.5 h-4.5" />
                        </button>
                        <button onClick={() => setIsLeftSidebarCollapsed(!isLeftSidebarCollapsed)} className="p-1.5 hover:bg-secondary rounded-md hidden lg:block transition-colors">
                            <PanelLeft className={`w-4 h-4 transition-transform ${isLeftSidebarCollapsed ? 'rotate-180' : ''}`} />
                        </button>
                        <button className="p-1.5 hover:bg-secondary rounded-md hidden lg:block transition-colors">
                            <Star className="w-4 h-4" />
                        </button>
                        <div className="w-px h-3.5 bg-border/80 mx-1 hidden lg:block" />
                        {/* Breadcrumbs */}
                        <div className="flex items-center text-[12px] md:text-[13px] font-bold ml-1 md:ml-0 tracking-tight">
                            <span className="text-muted-foreground/50 hidden md:inline uppercase tracking-widest text-[9px]">Dashboards</span>
                            <span className="mx-2 text-muted-foreground/20 hidden md:inline">/</span>
                            <span className="text-foreground/80">{currentPageName}</span>
                        </div>
                    </div>

                    {/* Right side of header */}
                    <div className="flex items-center gap-0.5 md:gap-1.5">
                        {/* Search */}
                        <div className="relative group hidden md:flex items-center mr-2">
                            <Search className="w-3.5 h-3.5 absolute left-2.5 text-muted-foreground/70" />
                            <input 
                                placeholder="Search"
                                className="h-7 pl-8 pr-7 w-40 lg:w-48 bg-secondary/40 border border-transparent focus:border-border/80 focus:bg-secondary/60 rounded-md text-xs outline-none transition-all placeholder:text-muted-foreground/60 text-foreground"
                            />
                            <div className="absolute right-1.5 text-[9px] font-mono text-muted-foreground/60 bg-background/50 px-1 py-0.5 rounded border border-border/40">/</div>
                        </div>

                        <button onClick={toggleTheme} className="p-1.5 hover:bg-secondary rounded-md text-muted-foreground hover:text-foreground transition-colors">
                            {mounted && theme === "dark" ? <Sun className="w-4.5 h-4.5 md:w-4 md:h-4" /> : <Moon className="w-4.5 h-4.5 md:w-4 md:h-4" />}
                        </button>
                        <button onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)} className="p-1.5 hover:bg-secondary rounded-md text-muted-foreground hover:text-foreground transition-colors relative">
                            <Bell className="w-4.5 h-4.5 md:w-4 md:h-4" />
                            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-foreground border border-background rounded-full" />
                        </button>
                        <button onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)} className="p-1.5 hover:bg-secondary rounded-md text-muted-foreground hover:text-foreground transition-colors hidden xl:block ml-1">
                            <PanelRight className={`w-4 h-4 transition-transform ${!isRightSidebarOpen ? 'rotate-180' : ''}`} />
                        </button>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 no-scrollbar bg-secondary/10">
                    {children}
                </main>
            </div>

            {/* --- 3. RIGHT SIDEBAR (Notifications) --- */}
            <aside className={`bg-card border-l border-border/50 hidden xl:flex flex-col shrink-0 transition-all duration-300 ease-in-out ${!isRightSidebarOpen ? 'w-0 overflow-hidden border-l-0' : 'w-[210px] xl:w-[230px]'}`}>
                <div className="h-[60px] border-b border-border/50 flex items-center px-6 md:px-8 shrink-0">
                    <span className="text-[13px] font-bold uppercase tracking-widest text-foreground/80">Actions</span>
                </div>
                    
                <div className="flex-1 overflow-y-auto px-6 md:px-8 py-8 space-y-10 no-scrollbar">
                    {/* Shortcuts Section (Merged with Quick Actions) */}
                    <div>
                        <span className="text-[10px] uppercase font-bold text-muted-foreground/50 tracking-widest mb-4 block">Shortcuts</span>
                        <div className="max-h-[320px] overflow-y-auto no-scrollbar pr-1">
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { label: "Add User", icon: Users, color: "bg-blue-500/10 text-blue-500", href: "/admin/users" },
                                    { label: "Review Flags", icon: Flag, color: "bg-rose-500/10 text-rose-500", href: "/admin/reports" },
                                    { label: "Verifications", icon: UserCheck, color: "bg-emerald-500/10 text-emerald-500", href: "/admin/users/pending" },
                                    { label: "Moderate Items", icon: Package, color: "bg-amber-500/10 text-amber-500", href: "/admin/listings" },
                                    { label: "Dispute Center", icon: MessageSquareWarning, color: "bg-fuchsia-500/10 text-fuchsia-500", href: "/admin/dispute-center" },
                                    { label: "Audit Logs", icon: FileText, color: "bg-slate-500/10 text-slate-500", href: "/admin/logs" },
                                ].map((item) => (
                                    <Link 
                                        key={item.label} 
                                        href={item.href} 
                                        title={item.label} 
                                        className={`w-9 h-9 rounded-xl ${item.color} flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-sm border border-transparent hover:border-current/20 no-underline`}
                                    >
                                        <item.icon className="w-4 h-4" />
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                    
                    <div className="h-px bg-border/40 w-full" />

                    {/* Recent Activity (Admin) - Timeline Style */}
                    <div>
                        <span className="text-[10px] uppercase font-bold text-muted-foreground/50 tracking-widest mb-5 block">Recent activity</span>
                        <div className="max-h-[480px] overflow-y-auto no-scrollbar">
                            <div className="space-y-0 relative">
                                {/* Vertical Connectivity Line */}
                                <div className="absolute left-[7px] top-2 bottom-5 w-0.5 bg-border/40" />

                                {[
                                    { title: "You fixed a bug", time: "Just now", icon: CheckCircle, color: "bg-emerald-500" },
                                    { title: "Received 5 new reports", time: "10m ago", icon: MessageSquareWarning, color: "bg-rose-500" },
                                    { title: "System routine completed", time: "2h ago", icon: Zap, color: "bg-blue-500" },
                                    { title: "User 'Alex' verified", time: "5h ago", icon: UserCheck, color: "bg-emerald-500" },
                                    { title: "New listing approved", time: "Yest.", icon: Package, color: "bg-amber-500" },
                                    { title: "Dispute #12 resolved", time: "2d ago", icon: CheckCircle, color: "bg-fuchsia-500" },
                                    { title: "Database backup done", time: "3d ago", icon: FileText, color: "bg-slate-500" },
                                ].map((activity, idx) => (
                                    <div key={idx} className="relative pl-7 pb-5 last:pb-2 group">
                                        {/* Timeline Dot */}
                                        <div className={`absolute left-0 top-1 w-4 h-4 rounded-full border-[3px] border-card z-10 transition-transform group-hover:scale-125 ${activity.color} shadow-sm shadow-black/20`} />
                                        
                                        <div className="flex flex-col gap-0.5 min-w-0">
                                            <span className="text-[11px] font-bold text-foreground/80 group-hover:text-foreground transition-all leading-tight">{activity.title}</span>
                                            <span className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest">{activity.time}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
            
            {/* Mobile Sidebar Modal */}
            {isLeftSidebarModalOpen && (
                <div className="fixed inset-0 z-[100] lg:hidden" onClick={() => setIsLeftSidebarModalOpen(false)}>
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" />
                    <div className="absolute left-0 top-0 h-full w-[280px] sm:w-[320px] bg-card border-r border-border/50 shadow-2xl flex flex-col animate-in slide-in-from-left-6 duration-300" onClick={e => e.stopPropagation()}>
                        {/* Logo / Header */}
                        <div className="h-[65px] flex items-center justify-between px-6 border-b border-border/50 shrink-0 bg-secondary/5">
                            <div className="flex items-center gap-3">
                                <span className="text-[20px] md:text-[22px] font-bold font-sans text-[#FFD700] whitespace-nowrap drop-shadow-sm">
                                    Hive
                                </span>
                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider truncate">Admin Center</span>
                            </div>
                            <button onClick={() => setIsLeftSidebarModalOpen(false)} className="h-8 w-8 rounded-lg bg-secondary/60 flex items-center justify-center text-muted-foreground hover:text-foreground">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Combined Navigation & Shortcuts */}
                        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-10 no-scrollbar">
                            {/* Navigation section */}
                            <div>
                                <div className="text-[10px] uppercase font-bold text-muted-foreground/40 tracking-widest px-3 mb-4">Navigation</div>
                                <nav className="space-y-1">
                                    {ADMIN_NAV_ITEMS.map((item) => {
                                        if (item.name === "Users") {
                                            return (
                                                <div key={item.name} className="space-y-1">
                                                    <button 
                                                        onClick={() => setIsUsersMenuOpen(!isUsersMenuOpen)}
                                                        className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl transition-all ${pathname.startsWith("/admin/users") ? 'bg-secondary text-foreground font-semibold' : 'text-muted-foreground/60 hover:bg-secondary/40 hover:text-foreground'}`}
                                                    >
                                                        <div className="flex items-center gap-3.5">
                                                            <Users className={`w-[18px] h-[18px] ${pathname.startsWith("/admin/users") ? 'text-primary' : 'opacity-60'}`} />
                                                            <span className="text-[13px]">{item.name}</span>
                                                        </div>
                                                        {isUsersMenuOpen ? <ChevronUp className="w-3.5 h-3.5 opacity-40" /> : <ChevronDown className="w-3.5 h-3.5 opacity-40" />}
                                                    </button>
                                                    {isUsersMenuOpen && (
                                                        <div className="ml-9 flex flex-col gap-1 border-l border-border/40 pl-3 py-1">
                                                            {[
                                                                { name: "All Users", href: "/admin/users" },
                                                                { name: "Pending", href: "/admin/users/pending" },
                                                                { name: "Sellers", href: "/admin/users/sellers" },
                                                                { name: "Suspended", href: "/admin/users/suspended" },
                                                            ].map((sub) => {
                                                                const active = pathname === sub.href;
                                                                return (
                                                                    <Link 
                                                                        key={sub.name} 
                                                                        href={sub.href} 
                                                                        onClick={() => setIsLeftSidebarModalOpen(false)}
                                                                        className={`px-3 py-2 rounded-lg text-[13px] transition-all ${active ? 'text-primary font-bold bg-primary/5' : 'text-muted-foreground/60 hover:text-foreground'}`}
                                                                    >
                                                                        {sub.name}
                                                                    </Link>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        }
                                        if (item.name === "Reports") {
                                            return (
                                                <div key={item.name} className="space-y-1">
                                                    <button 
                                                        onClick={() => setIsReportsMenuOpen(!isReportsMenuOpen)}
                                                        className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl transition-all ${pathname.startsWith("/admin/reports") ? 'bg-secondary text-foreground font-semibold' : 'text-muted-foreground/60 hover:bg-secondary/40 hover:text-foreground'}`}
                                                    >
                                                        <div className="flex items-center gap-3.5">
                                                            <Flag className={`w-[18px] h-[18px] ${pathname.startsWith("/admin/reports") ? 'text-primary' : 'opacity-60'}`} />
                                                            <span className="text-[13px]">{item.name}</span>
                                                        </div>
                                                        {isReportsMenuOpen ? <ChevronUp className="w-3.5 h-3.5 opacity-40" /> : <ChevronDown className="w-3.5 h-3.5 opacity-40" />}
                                                    </button>
                                                    {isReportsMenuOpen && (
                                                        <div className="ml-9 flex flex-col gap-1 border-l border-border/40 pl-3 py-1">
                                                            {[
                                                                { name: "Report Queue", href: "/admin/reports" },
                                                                { name: "Pending", href: "/admin/reports/pending" },
                                                                { name: "In Review", href: "/admin/reports/in-review" },
                                                                { name: "Resolved", href: "/admin/reports/resolved" },
                                                            ].map((sub) => {
                                                                const active = pathname === sub.href;
                                                                return (
                                                                    <Link 
                                                                        key={sub.name} 
                                                                        href={sub.href} 
                                                                        onClick={() => setIsLeftSidebarModalOpen(false)}
                                                                        className={`px-3 py-2 rounded-lg text-[13px] transition-all ${active ? 'text-primary font-bold bg-primary/5' : 'text-muted-foreground/60 hover:text-foreground'}`}
                                                                    >
                                                                        {sub.name}
                                                                    </Link>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        }
                                        const active = item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href);
                                        return (
                                            <Link key={item.name} href={item.href} onClick={() => setIsLeftSidebarModalOpen(false)} className={`flex items-center gap-3.5 px-3 py-2.5 rounded-xl transition-all ${active ? 'bg-secondary text-foreground font-semibold shadow-sm ring-1 ring-border/50' : 'text-muted-foreground/60 hover:bg-secondary/40 hover:text-foreground'}`}>
                                                <item.icon className={`w-[18px] h-[18px] ${active ? 'text-primary' : 'opacity-60'}`} />
                                                <span className="text-[13px]">{item.name}</span>
                                            </Link>
                                        );
                                    })}
                                </nav>
                            </div>

                            {/* Shortcuts section (Mirrored from Right Sidebar) */}
                            <div>
                                <div className="text-[10px] uppercase font-bold text-muted-foreground/40 tracking-widest px-3 mb-4">Shortcuts</div>
                                <div className="grid grid-cols-3 gap-2 px-1">
                                    {[
                                        { label: "Add User", icon: Users, color: "bg-blue-500/10 text-blue-500", href: "/admin/users" },
                                        { label: "Review Flags", icon: Flag, color: "bg-rose-500/10 text-rose-500", href: "/admin/reports" },
                                        { label: "Verifications", icon: UserCheck, color: "bg-emerald-500/10 text-emerald-500", href: "/admin/users/pending" },
                                        { label: "Moderate Items", icon: Package, color: "bg-amber-500/10 text-amber-500", href: "/admin/listings" },
                                        { label: "Disputes", icon: MessageSquareWarning, color: "bg-fuchsia-500/10 text-fuchsia-500", href: "/admin/dispute-center" },
                                        { label: "Audit Logs", icon: FileText, color: "bg-slate-500/10 text-slate-500", href: "/admin/logs" },
                                    ].map((item) => (
                                        <Link 
                                            key={item.label} 
                                            href={item.href} 
                                            title={item.label}
                                            onClick={() => setIsLeftSidebarModalOpen(false)}
                                            className={`w-9 h-9 rounded-xl ${item.color} flex items-center justify-center transition-all active:scale-95 shadow-sm border border-transparent active:border-current/20 no-underline`}
                                        >
                                            <item.icon className="w-4 h-4" />
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Logout at bottom */}
                        <div className="p-5 border-t border-border/50 mt-auto bg-secondary/5">
                            <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 text-[13px] font-bold text-red-500 hover:bg-red-500/10 rounded-xl transition-all shadow-sm ring-1 ring-red-500/20 active:scale-95">
                                <LogOut className="w-[18px] h-[18px]" />
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
