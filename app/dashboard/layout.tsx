"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    MessageSquare,
    Bell,
    ArrowLeft
} from "lucide-react";
import { IconTooltip } from "../components/common/IconTooltip";
import { useAuth } from "../context/AuthContext";

import { DashboardOnboarding } from "../components/dashboard/DashboardOnboarding";
import { ProUpgradePrompt } from "../components/shared/ProUpgradePrompt";
const NAV_ITEMS = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Products", href: "/dashboard/products", icon: Package },
    { name: "Orders", href: "/dashboard/orders", icon: ShoppingCart },
    { name: "Messages", href: "/dashboard/messages", icon: MessageSquare },
    { name: "Alerts", href: "/dashboard/alerts", icon: Bell },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { user } = useAuth();
    const isPro = user?.role === "pro";
    const [showUpgradeGate, setShowUpgradeGate] = useState(true);
    const isMessagesRoute = pathname.startsWith("/dashboard/messages");
    const isAlertsRoute = pathname.startsWith("/dashboard/alerts");
    const isFreePath = isMessagesRoute || isAlertsRoute;

    return (
        <div className="dashboard-scope flex flex-col min-h-screen w-full bg-secondary/10 overflow-x-hidden text-foreground font-heading">
            {/* Global Header */}

            <div className={`flex flex-1 max-w-[1780px] mx-auto w-full gap-6 relative ${isMessagesRoute ? "px-0 py-0 md:px-6 md:py-6" : "px-2 md:px-6 py-4 md:py-6"
                }`}>
                {/* Sidebar Spacer */}
                <div className="hidden md:block w-16 shrink-0" />

                {/* Floating Sidebar */}
                <aside className="w-16 hidden md:flex flex-col items-center py-4 bg-card border border-border/40 rounded-xl shadow-sm fixed top-24 left-3 md:left-6 h-[calc(100vh-8rem)] z-30">
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

                <main className={`flex-1 min-h-0 overflow-y-auto ${isMessagesRoute ? "pb-0" : "pb-20 md:pb-0"}`}>
                    <div className={`bg-card border border-border/50 shadow-sm min-h-full ${isMessagesRoute ? "rounded-none p-0 md:rounded-2xl md:p-6" : "rounded-2xl p-4 md:p-6"
                        }`}>
                        {!isPro && !isFreePath && showUpgradeGate ? (
                            <div className="py-20 flex items-center justify-center">
                                <ProUpgradePrompt
                                    title="Unlock Professional Dashboard"
                                    description="Upgrade to a Pro account to access professional management tools, analytics, and business growth features."
                                    featureName="professional dashboard tools"
                                />
                            </div>
                        ) : (
                            <>
                                {!isPro && !isFreePath && (
                                    <div className="mb-4 flex items-center justify-end">
                                        <button
                                            type="button"
                                            onClick={() => setShowUpgradeGate(true)}
                                            className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
                                        >
                                            Show upgrade prompt
                                        </button>
                                    </div>
                                )}
                                {children}
                                {isPro && <DashboardOnboarding />}
                            </>
                        )}
                        {!isPro && !isFreePath && showUpgradeGate && (
                            <div className="mt-6 flex items-center justify-center">
                                <button
                                    type="button"
                                    onClick={() => setShowUpgradeGate(false)}
                                    className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
                                >
                                    View content
                                </button>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
