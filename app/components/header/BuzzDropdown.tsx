"use client";

import {
    Megaphone, TrendingUp, ShieldCheck, Sparkles,
    Users, Calendar, ChevronRight
} from "lucide-react";

interface BuzzDropdownProps {
    isOpen: boolean;
}

export function BuzzDropdown({ isOpen }: BuzzDropdownProps) {
    const buzzItems = [
        { icon: Megaphone, label: "Announcements", href: "/coming-soon" },
        { icon: TrendingUp, label: "Market update", href: "/coming-soon", badge: "Live" },
        { icon: ShieldCheck, label: "Safety tips", href: "/coming-soon" },
        { icon: Sparkles, label: "New releases", href: "/coming-soon" },
        { icon: Users, label: "Community highlights", href: "/coming-soon" },
        { icon: Calendar, label: "Events", href: "/coming-soon" },
    ];

    return (
        <div
            className={`absolute top-full left-0 mt-3 w-72 bg-secondary text-foreground rounded-2xl shadow-2xl border border-border overflow-hidden transition-all duration-300 ease-in-out z-50 ${isOpen
                ? 'opacity-100 translate-y-0 visible'
                : 'opacity-0 -translate-y-4 invisible'
                }`}
        >
            <div className="p-4 bg-white/5 border-b border-border uppercase tracking-widest text-[10px] font-bold text-gray-400">
                Campus Buzz
            </div>

            <div className="p-2">
                {buzzItems.map((item, index) => (
                    <a
                        key={index}
                        href={item.href}
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-primary/10 group transition-all duration-200"
                    >
                        <div className="flex items-center gap-3">
                            <item.icon className="w-4 h-4 text-primary transition-colors" />
                            <span className="text-sm font-medium text-foreground transition-colors">{item.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            {item.badge && (
                                <span className="bg-primary/20 text-primary text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                                    {item.badge}
                                </span>
                            )}
                            <ChevronRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-primary transition-transform group-hover:translate-x-1" />
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
}
