"use client";

import {
    BookOpen, Smartphone, Home, Shirt, UtensilsCrossed,
    Wrench, Key, Calendar, MoreHorizontal, ChevronRight
} from "lucide-react";

interface ExploreDropdownProps {
    isOpen: boolean;
}

export function ExploreDropdown({ isOpen }: ExploreDropdownProps) {
    const categories = [
        { icon: BookOpen, label: "Academic", href: "/coming-soon" },
        { icon: Smartphone, label: "Electronics", href: "/coming-soon" },
        { icon: Home, label: "Hostel & Living", href: "/coming-soon" },
        { icon: Shirt, label: "Fashion", href: "/coming-soon" },
        { icon: UtensilsCrossed, label: "Food", href: "/coming-soon" },
        { icon: Wrench, label: "Services", href: "/coming-soon" },
        { icon: Key, label: "Rentals & Accommodation", href: "/coming-soon" },
        { icon: Calendar, label: "Events", href: "/coming-soon" },
        { icon: MoreHorizontal, label: "Others", href: "/coming-soon" },
    ];

    return (
        <div
            className={`absolute top-full left-0 mt-1 w-60 bg-secondary text-foreground rounded-xl shadow-lg overflow-hidden transition-all duration-200 ease-in-out z-50 origin-top-left ${isOpen
                ? 'opacity-100 scale-100 visible'
                : 'opacity-0 scale-95 invisible'
                }`}
        >
            <div className="py-2">
                {categories.map((category, index) => (
                    <a
                        key={index}
                        href={category.href}
                        className="flex items-center justify-between px-4 py-2.5 hover:bg-primary/10 hover:text-primary transition-colors group"
                    >
                        <div className="flex items-center gap-3">
                            <category.icon className="w-4 h-4 text-gray-500 group-hover:text-primary transition-colors" />
                            <span className="text-sm font-medium">{category.label}</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-gray-400 opacity-0 group-hover:opacity-100 transition-all transform -translate-x-2 group-hover:translate-x-0" />
                    </a>
                ))}
            </div>
        </div>
    );
}
