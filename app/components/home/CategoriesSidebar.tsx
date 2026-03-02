"use client";

import Link from "next/link";
import {
    ChevronRight, MonitorSmartphone, BookOpen, Home, Shirt, Sparkles,
    Dumbbell, Music, Package, Bike, Calendar, AlertCircle, Wrench, UtensilsCrossed
} from "lucide-react";
import { CATEGORIES } from "../../data/products";

const IconMap: { [key: string]: any } = {
    MonitorSmartphone, BookOpen, Home, Shirt, Sparkles,
    Dumbbell, Music, Package, Bike, Calendar, AlertCircle, Wrench, UtensilsCrossed
};

export function CategoriesSidebar() {
    return (
        <aside className="hidden lg:block w-56 shrink-0 sticky top-20 h-max z-40">
            <div className="bg-card rounded-xl border border-border/50 shadow-sm overflow-visible flex flex-col">
                <div className="px-3 py-2.5 border-b border-border/50 bg-secondary/30">
                    <h3 className="font-bold text-sm font-heading tracking-wide text-foreground">Top Categories</h3>
                </div>
                <div className="flex flex-col py-1.5 px-1.5">
                    {CATEGORIES.map((cat, idx) => {
                        const Icon = IconMap[cat.lucideIcon || "Package"];
                        return (
                            <Link
                                key={idx}
                                href={`/listings?category=${cat.name}`}
                                className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-secondary transition-all duration-200 group"
                            >
                                <div className="flex items-center gap-3 text-[12px] font-heading font-medium text-foreground/80 group-hover:text-primary">
                                    <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                                    <span>{cat.name}</span>
                                </div>
                                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-primary transition-transform group-hover:translate-x-1" />
                            </Link>
                        );
                    })}
                </div>
            </div>
        </aside>
    );
}
