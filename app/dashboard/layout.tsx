"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    MessageSquare,
    Bell,
    Info,
    ArrowLeft
} from "lucide-react";
import { IconTooltip } from "../components/common/IconTooltip";

import { MainHeader } from "../components/header/MainHeader";

const NAV_ITEMS = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Products", href: "/dashboard/products", icon: Package },
    { name: "Orders", href: "/dashboard/orders", icon: ShoppingCart },
    { name: "Messages", href: "/dashboard/messages", icon: MessageSquare },
    { name: "Alerts", href: "/dashboard/alerts", icon: Bell },
    { name: "Info", href: "/dashboard/info", icon: Info },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <div className="flex flex-col min-h-screen w-full bg-secondary/10 overflow-hidden text-foreground font-heading">
            {/* Global Header */}
            <MainHeader />

            <div className="flex flex-1 max-w-[1780px] mx-auto w-full px-2 md:px-6 py-4 md:py-6 gap-6 relative">
                {/* Floating Sidebar */}
                <aside className="w-20 hidden md:flex flex-col items-center py-6 bg-card border border-border/50 rounded-2xl shadow-sm sticky top-24 h-[calc(100vh-8rem)] z-20">
                    {/* Back to Profile */}
                    <Link href="/profile" className="mb-8">
                        <IconTooltip content="Back to Profile" position="right">
                            <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground transition-all">
                                <ArrowLeft className="w-5 h-5" />
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
                                        <div className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all ${isActive
                                            ? "bg-primary text-primary-foreground shadow-md"
                                            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                                            }`}>
                                            <item.icon className="w-5 h-5" />
                                        </div>
                                    </IconTooltip>
                                </Link>
                            );
                        })}
                    </nav>
                </aside>

                {/* Mobile Sidebar Navigation (Bottom Bar) */}
                <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border/50 z-50 flex items-center justify-around px-2 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                    {NAV_ITEMS.slice(0, 5).map((item) => {
                        const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                        return (
                            <Link key={item.name} href={item.href} className={`p-3 rounded-xl transition-all ${isActive ? 'text-primary scale-110' : 'text-muted-foreground'}`}>
                                <item.icon className="w-[22px] h-[22px]" />
                            </Link>
                        );
                    })}
                </nav>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
                    <div className="bg-card border border-border/50 rounded-2xl p-4 md:p-6 shadow-sm min-h-[calc(100vh-8rem)]">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
