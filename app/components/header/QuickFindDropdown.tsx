"use client";

import {
    Info, Package, Users, HelpCircle,
    LifeBuoy, ChevronRight
} from "lucide-react";

interface QuickFindDropdownProps {
    isOpen: boolean;
}

export function QuickFindDropdown({ isOpen }: QuickFindDropdownProps) {
    const quickItems = [
        { icon: Info, label: "About", href: "/coming-soon" },
        { icon: Package, label: "Orders", href: "/coming-soon" },
        { icon: Users, label: "Engagements", href: "/coming-soon" },
        { icon: HelpCircle, label: "FAQ", href: "/coming-soon" },
        { icon: LifeBuoy, label: "Help Center", href: "/coming-soon" },
    ];

    return (
        <div
            className={`absolute top-full left-0 mt-3 w-64 bg-secondary text-foreground rounded-2xl shadow-2xl border border-border overflow-hidden transition-all duration-300 ease-in-out z-50 ${isOpen
                ? 'opacity-100 translate-y-0 visible'
                : 'opacity-0 -translate-y-4 invisible'
                }`}
        >
            <div className="p-4 bg-white/5 border-b border-border uppercase tracking-widest text-[10px] font-bold text-gray-400">
                Quick Find
            </div>

            <div className="p-2">
                {quickItems.map((item, index) => (
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
