"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
} from "lucide-react";
import { IconTooltip } from "../common/IconTooltip";

const ADMIN_NAV_ITEMS = [
    { name: "Overview", href: "/admin", icon: LayoutDashboard },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Sellers", href: "/admin/sellers", icon: UserCheck },
    { name: "Listings", href: "/admin/listings", icon: Package },
    { name: "Reports", href: "/admin/reports", icon: Flag },
    { name: "Dispute Center", href: "/admin/dispute-center", icon: MessageSquareWarning },
    { name: "Badges", href: "/admin/badges", icon: CheckCircle },
    { name: "Logs", href: "/admin/logs", icon: FileText },
    { name: "Settings", href: "/admin/settings", icon: Settings },
];

const MOBILE_NAV_ITEMS = ADMIN_NAV_ITEMS.filter((item) =>
    ["Overview", "Users", "Listings", "Dispute Center", "Settings"].includes(item.name)
);

const isActiveRoute = (pathname: string, href: string) => {
    if (href === "/admin") {
        return pathname === href;
    }
    return pathname.startsWith(href);
};

const AdminSidebar = () => {
    const pathname = usePathname();

    return (
        <>
            {/* Floating Sidebar */}
            <aside className="w-16 hidden md:flex flex-col items-center py-4 bg-card border border-border/40 rounded-xl shadow-sm fixed top-24 left-3 md:left-6 h-[calc(100vh-8rem)] z-30">
                <nav className="flex flex-col gap-3 flex-1">
                    {ADMIN_NAV_ITEMS.map((item) => {
                        const active = isActiveRoute(pathname, item.href);
                        return (
                            <Link key={item.name} href={item.href}>
                                <IconTooltip content={item.name} position="right">
                                    <div
                                        className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all ${active
                                            ? "bg-primary text-primary-foreground shadow-sm"
                                            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                                            }`}
                                    >
                                        <item.icon className="w-4.5 h-4.5" />
                                    </div>
                                </IconTooltip>
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 pb-[env(safe-area-inset-bottom)]">
                <div className="mx-auto w-full max-w-[560px] px-3 pb-3">
                    <div className="bg-card border border-border/50 rounded-2xl shadow-[0_-6px_24px_rgba(0,0,0,0.08)] px-2 py-2">
                        <div className="flex items-center gap-2 overflow-x-auto overflow-y-hidden no-scrollbar px-1 h-12">
                            {ADMIN_NAV_ITEMS.map((item) => {
                                const active = isActiveRoute(pathname, item.href);
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`p-2 rounded-xl transition-all flex items-center justify-center shrink-0 ${active ? "text-primary scale-105" : "text-muted-foreground"}`}
                                    >
                                        <item.icon className="w-[20px] h-[20px]" />
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </nav>
        </>
    );
};

export default AdminSidebar;
