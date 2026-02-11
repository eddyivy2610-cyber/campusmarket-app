"use client";

import { Home, ChevronRight, LayoutGrid, List, MonitorSmartphone, Utensils, Zap, Sparkles, ChevronDown } from "lucide-react";
import Link from "next/link";

export function ExploreHeader() {
    const tabs = [
        { name: "All Items", count: 128, icon: LayoutGrid, active: true },
        { name: "Phones & Gadgets", count: 42, icon: MonitorSmartphone, active: false },
        { name: "Hostel Essentials", count: 31, icon: Zap, active: false },
        { name: "Services", count: 12, icon: Sparkles, active: false },
        { name: "Free Items", count: 8, icon: Utensils, active: false },
        { name: "Academics", count: 15, icon: LayoutGrid, active: false },
        { name: "Fashion", count: 22, icon: Sparkles, active: false }
    ];

    return (
        <div className="space-y-4">
            {/* Breadcrumbs */}
            <nav className="flex flex-col gap-4 mb-4 md:mb-6">
                <div className="flex items-center gap-2 text-sm font-bold tracking-widest uppercase">
                    <Link href="/" className="text-primary hover:text-orange-600 transition-colors flex items-center gap-1">
                        <Home className="w-4 h-4 mb-0.5" />
                        <span>Home</span>
                    </Link>
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                    <span className="text-primary">Marketplace</span>
                </div>
            </nav>

            {/* Controls Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 py-1 px-1">
                <p className="text-gray-500 text-[10px] font-black uppercase tracking-tight">Showing <span className="text-foreground">128</span> Campus Listings</p>

                <div className="flex items-center gap-2">
                    {/* View Toggles */}
                    <div className="flex items-center bg-secondary rounded-lg p-0.5 border border-foreground/10 shadow-inner">
                        <button className="p-1.5 rounded-md bg-primary text-white shadow-lg active:scale-95 transition-all">
                            <LayoutGrid className="w-3.5 h-3.5" />
                        </button>
                        <button className="p-1.5 rounded-md text-gray-500 hover:text-white transition-all">
                            <List className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    {/* Dropdowns */}
                    <div className="flex gap-1.5">
                        <button className="flex items-center gap-1.5 bg-secondary border border-foreground/10 rounded-lg px-3 py-1.5 shadow-sm hover:border-primary/50 transition-all group">
                            <span className="text-gray-500 font-black text-[9px] uppercase tracking-wide">Sort by Nearest</span>
                            <ChevronDown className="w-2.5 h-2.5 text-gray-600 group-hover:text-primary transition-colors" />
                        </button>
                        <button className="flex items-center gap-1.5 bg-secondary border border-foreground/10 rounded-lg px-3 py-1.5 shadow-sm hover:border-primary/50 transition-all group">
                            <span className="text-gray-500 font-black text-[9px] uppercase tracking-wide">Default</span>
                            <ChevronDown className="w-2.5 h-2.5 text-gray-600 group-hover:text-primary transition-colors" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Horizontal Tabs - Carousel Style */}
            <div className="relative group">
                {/* Left Fade/Scroll Shadow */}
                <div className="absolute left-0 top-0 bottom-3 w-12 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>

                <div className="flex items-center gap-2 overflow-x-auto pb-3 scrollbar-hide scroll-smooth snap-x snap-mandatory px-1 -mx-4 md:mx-0 px-4 md:px-0">
                    {tabs.map((tab, i) => (
                        <button
                            key={i}
                            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl shadow-lg transition-all whitespace-nowrap border snap-start shrink-0 ${tab.active ? 'bg-primary border-primary text-white scale-[1.01]' : 'bg-secondary border-foreground/10 text-gray-500 hover:border-primary/30'}`}
                        >
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${tab.active ? 'bg-white/20' : 'bg-secondary'}`}>
                                <tab.icon className={`w-3.5 h-3.5 ${tab.active ? 'text-white' : 'text-primary'}`} />
                            </div>
                            <div className="text-left">
                                <span className={`block font-black text-[10px] uppercase tracking-tight ${tab.active ? 'text-white' : 'text-gray-400'}`}>{tab.name}</span>
                                <span className={`text-[7px] uppercase font-black tracking-widest ${tab.active ? 'text-white/60' : 'text-gray-600'}`}>{tab.count} items</span>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Right Fade/Scroll Shadow */}
                <div className="absolute right-0 top-0 bottom-3 w-12 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none opacity-100 transition-opacity"></div>
            </div>
        </div>
    );
}
