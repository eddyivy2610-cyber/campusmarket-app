"use client";

import { LayoutGrid, Star, User, Settings, Wallet, Bell, ShoppingBag, Package } from "lucide-react";

interface ProfileTabsProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
    isOwner?: boolean;
}

export function ProfileTabs({ activeTab, onTabChange, isOwner = false }: ProfileTabsProps) {
    const tabs = [
        { id: "listings", label: "Work & Listings", icon: LayoutGrid },
        { id: "reviews", label: "Social Proof", icon: Star },
        { id: "about", label: "Identity Bio", icon: User },
    ];

    const ownerSpecificTabs = [
        { id: "wallet", label: "Wallet & Pay", icon: Wallet },
        { id: "orders", label: "Orders Hub", icon: Package },
        { id: "settings", label: "Core Settings", icon: Settings },
    ];

    const allTabs = isOwner ? [...tabs, ...ownerSpecificTabs] : tabs;

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth pb-1 border-b border-white/5">
                {allTabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={`group flex items-center gap-2.5 px-4 py-3 rounded-t-xl transition-all relative whitespace-nowrap ${activeTab === tab.id
                            ? 'text-foreground'
                            : 'text-gray-500 hover:text-gray-300'
                            }`}
                    >
                        <tab.icon className={`w-3.5 h-3.5 transition-transform group-hover:scale-110 ${activeTab === tab.id ? 'text-primary' : 'text-gray-600'
                            }`} />
                        <span className="font-sans font-black text-[10px] uppercase tracking-widest">{tab.label}</span>

                        {/* Active Indicator */}
                        {activeTab === tab.id && (
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full shadow-[0_-4px_10px_rgba(249,115,22,0.5)]"></div>
                        )}

                        {/* Notification Dot for specific owner tabs */}
                        {tab.id === "wallet" && isOwner && (
                            <div className="w-2 h-2 bg-primary rounded-full absolute top-3 right-4 animate-pulse"></div>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}
