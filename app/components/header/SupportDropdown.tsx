"use client";

import {
    HelpCircle, AlertTriangle, Shield, Headset,
    BookOpen, ChevronRight
} from "lucide-react";

interface SupportDropdownProps {
    isOpen: boolean;
}

export function SupportDropdown({ isOpen }: SupportDropdownProps) {
    const supportItems = [
        { icon: HelpCircle, label: "Help Center", href: "/coming-soon" },
        { icon: AlertTriangle, label: "Report an Issue", href: "/coming-soon" },
        { icon: Shield, label: "Safety Guidelines", href: "/coming-soon" },
        { icon: Headset, label: "Contact Support", href: "/coming-soon" },
        { icon: BookOpen, label: "Community Standards", href: "/coming-soon" },
    ];

    return (
        <div
            className={`absolute top-full left-0 mt-3 w-64 bg-secondary text-foreground rounded-2xl shadow-2xl border border-white/5 overflow-hidden transition-all duration-300 ease-in-out z-50 ${isOpen
                ? 'opacity-100 translate-y-0 visible'
                : 'opacity-0 -translate-y-4 invisible'
                }`}
        >
            <div className="p-4 bg-white/5 border-b border-white/10 uppercase tracking-widest text-[10px] font-bold text-gray-400">
                Support & Safety
            </div>

            <div className="p-2">
                {supportItems.map((item, index) => (
                    <a
                        key={index}
                        href={item.href}
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-primary/10 group transition-all duration-200"
                    >
                        <div className="flex items-center gap-3">
                            <item.icon className="w-4 h-4 text-primary transition-colors" />
                            <span className="text-sm font-medium text-foreground transition-colors">{item.label}</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-primary transition-transform group-hover:translate-x-1" />
                    </a>
                ))}
            </div>
        </div>
    );
}
