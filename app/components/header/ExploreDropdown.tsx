"use client";

import {
    MonitorSmartphone, BookOpen, Home, Shirt, Sparkles,
    Dumbbell, Music, Package, Bike, Calendar, AlertCircle, Wrench,
    ChevronRight
} from "lucide-react";
import { CATEGORIES } from "../../data/products";

const IconMap: { [key: string]: any } = {
    MonitorSmartphone, BookOpen, Home, Shirt, Sparkles,
    Dumbbell, Music, Package, Bike, Calendar, AlertCircle, Wrench
};

interface ExploreDropdownProps {
    isOpen: boolean;
}

export function ExploreDropdown({ isOpen }: ExploreDropdownProps) {
    return (
        <div
            className={`absolute top-full left-0 mt-1 w-64 bg-secondary text-foreground rounded-xl shadow-lg overflow-hidden transition-all duration-200 ease-in-out z-50 origin-top-left ${isOpen
                ? 'opacity-100 scale-100 visible'
                : 'opacity-0 scale-95 invisible'
                }`}
        >
            <div className="py-2">
                {CATEGORIES.map((category, index) => {
                    const Icon = IconMap[category.lucideIcon || "Package"];
                    return (
                        <a
                            key={index}
                            href={`/listings?category=${category.name}`}
                            className="flex items-center justify-between px-4 py-2.5 hover:bg-primary/10 hover:text-primary transition-colors group"
                        >
                            <div className="flex items-center gap-3">
                                <Icon className="w-4 h-4 text-gray-500 group-hover:text-primary transition-colors" />
                                <span className="text-sm font-bold">{category.name}</span>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-gray-400 opacity-0 group-hover:opacity-100 transition-all transform -translate-x-2 group-hover:translate-x-0" />
                        </a>
                    );
                })}
            </div>
        </div>
    );
}
