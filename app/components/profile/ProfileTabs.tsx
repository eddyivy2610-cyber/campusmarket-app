"use client";

import { LayoutGrid, Star, User, Settings, Wallet, Bell, Package } from "lucide-react";

interface ProfileTabsProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
    isOwner?: boolean;
}

export function ProfileTabs({ activeTab, onTabChange, isOwner = false }: ProfileTabsProps) {
    const tabs = [
        { id: "listings", label: "Timeline", icon: LayoutGrid },
        { id: "about", label: "About", icon: User },
    ];

    const ownerSpecificTabs = [
        { id: "wallet", label: "Wallet", icon: Wallet },
        { id: "orders", label: "Orders", icon: Package },
        { id: "notifications", label: "Notifications", icon: Bell },
        { id: "settings", label: "Settings", icon: Settings },
    ];

    const allTabs = isOwner ? [...tabs, ...ownerSpecificTabs] : tabs;

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-8 border-b border-border/50">
                {allTabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={`group flex items-center gap-2 pb-3 relative whitespace-nowrap transition-all ${activeTab === tab.id
                            ? 'text-primary font-bold'
                            : 'text-muted-foreground font-medium hover:text-foreground'
                            }`}
                    >
                        {/* <tab.icon className="w-4 h-4" /> */}
                        <span className="text-sm">{tab.label}</span>

                        {/* Active Indicator */}
                        {activeTab === tab.id && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"></div>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}
