"use client";

import { LayoutGrid, Star, User, Settings, Wallet, Package } from "lucide-react";

interface ProfileTabsProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
    isOwner?: boolean;
}

export function ProfileTabs({ activeTab, onTabChange, isOwner = false }: ProfileTabsProps) {
    const tabs = [
        { id: "listings", label: "Listings", icon: LayoutGrid },
        { id: "reviews", label: "Reviews", icon: Star },
        { id: "about", label: "About", icon: User },
    ];

    const ownerSpecificTabs = [
        { id: "wallet", label: "Wallet", icon: Wallet },
        { id: "orders", label: "Orders", icon: Package },
        { id: "settings", label: "Settings", icon: Settings },
    ];

    const allTabs = isOwner ? [...tabs, ...ownerSpecificTabs] : tabs;

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-6 overflow-x-auto no-scrollbar scroll-smooth pb-0 border-b border-border">
                {allTabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={`group flex items-center gap-2 pb-4 px-2 relative whitespace-nowrap transition-all ${activeTab === tab.id
                            ? 'text-foreground'
                            : 'text-gray-500 hover:text-gray-400'
                            }`}
                    >
                        <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-foreground' : 'text-gray-500 group-hover:text-gray-400'}`} />
                        <span className="font-sans font-bold text-sm tracking-tight">{tab.label}</span>

                        {/* Active Indicator */}
                        {activeTab === tab.id && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground rounded-full"></div>
                        )}

                        {/* Notification Dot for specific owner tabs */}
                        {tab.id === "wallet" && isOwner && (
                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full absolute top-1 right-0 animate-pulse"></div>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}
