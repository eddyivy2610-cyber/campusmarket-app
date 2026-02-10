"use client";

import { Home, ChevronRight, LayoutGrid, List, LayoutPanelLeft, ChevronDown, MonitorSmartphone, Utensils, Zap, Sparkles } from "lucide-react";

export function ExploreHeader() {
    const tabs = [
        { name: "All Items", count: 128, icon: LayoutGrid, active: true },
        { name: "Phones & Gadgets", count: 42, icon: MonitorSmartphone },
        { name: "Hostel Essentials", count: 31, icon: Zap },
        { name: "Services", count: 12, icon: Sparkles },
        { name: "Free Items", count: 8, icon: Utensils },
        { name: "Academics", count: 15, icon: LayoutGrid },
        { name: "Fashion", count: 22, icon: Sparkles }
    ];

    return (
        <div className="space-y-4">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest px-1">
                <a href="/" className="text-gray-500 hover:text-primary transition-colors flex items-center gap-1">
                    <Home className="w-2.5 h-2.5" />
                    <span>Home</span>
                </a>
                <ChevronRight className="w-2.5 h-2.5 text-foreground/10" />
                <span className="text-primary/80">Marketplace</span>
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

                <div className="flex items-center gap-2 overflow-x-auto pb-3 no-scrollbar scroll-smooth snap-x snap-mandatory px-1">
                    {tabs.map((tab, i) => (
                        <button
                            key={i}
                            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl shadow-lg transition-all whitespace-nowrap border snap-start ${tab.active ? 'bg-primary border-primary text-white scale-[1.01]' : 'bg-secondary border-foreground/10 text-gray-500 hover:border-primary/30'}`}
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

                {/* Hint for Scroll */}
                <div className="absolute -right-2 top-1/2 -translate-y-1/2 z-20 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 hidden md:block">
                    <div className="bg-primary/20 backdrop-blur-sm border border-primary/30 p-2 rounded-full text-primary shadow-2xl animate-pulse">
                        <ChevronRight className="w-4 h-4" />
                    </div>
                </div>
            </div>
        </div>
    );
}
