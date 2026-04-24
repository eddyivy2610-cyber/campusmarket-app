"use client";

import Link from "next/link";
import {
    ChevronRight, MonitorSmartphone, BookOpen, Home, Shirt, Sparkles,
    Dumbbell, Music, Package, Bike, Wrench, UtensilsCrossed
} from "lucide-react";
import { CATEGORIES } from "../../data/products";

const IconMap: { [key: string]: any } = {
    MonitorSmartphone, BookOpen, Home, Shirt, Sparkles,
    Dumbbell, Music, Package, Bike, Wrench, UtensilsCrossed
};

export function CategoriesSidebar() {
    const visibleCategories = CATEGORIES;

    return (
        <aside className="hidden lg:block w-56 shrink-0 z-[400]">
            <div className="rounded-2xl bg-white dark:bg-card border border-border/60 dark:border-border/30 shadow-xl dark:shadow-2xl overflow-visible flex flex-col">
                <div className="px-3 pt-3 pb-2">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-5 bg-primary rounded-none shadow-sm" />
                        <h3 className="text-sm md:text-[15px] font-bold font-heading tracking-wide uppercase text-foreground whitespace-nowrap">
                            Browse Categories
                        </h3>
                    </div>
                </div>
                <div className="relative flex flex-col py-1.5 px-1.5 gap-0.5">
                    {visibleCategories.map((cat, idx) => {
                        const Icon = IconMap[cat.lucideIcon || "Package"];
                        return (
                            <Link
                                key={idx}
                                href={cat.href || `/listings?category=${cat.name}`}
                                className="flex items-center justify-between px-2.5 py-2 rounded-xl border border-transparent transition-all duration-200 group hover:border-primary/40 hover:bg-primary/10 dark:hover:bg-white/10"
                            >
                                <div className="flex items-center gap-2 text-[11px] font-heading font-medium text-foreground">
                                    <span className="w-6 h-6 rounded-md bg-primary/20 dark:bg-white/10 text-primary flex items-center justify-center transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                                        <Icon className="w-3.5 h-3.5 shrink-0 transition-transform group-hover:scale-110" />
                                    </span>
                                    <span>{cat.name}</span>
                                </div>
                                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/70 transition-transform group-hover:translate-x-1" />
                            </Link>
                        );
                    })}
                </div>
            </div>
        </aside>
    );
}
