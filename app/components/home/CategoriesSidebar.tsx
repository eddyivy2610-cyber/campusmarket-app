"use client";

import { useState } from "react";
import Link from "next/link";
import {
    ChevronRight, MonitorSmartphone, BookOpen, Home, Shirt, Sparkles,
    Dumbbell, Music, Package, Bike, Calendar, AlertCircle, Wrench, UtensilsCrossed, Ellipsis
} from "lucide-react";
import { CATEGORIES } from "../../data/products";

const IconMap: { [key: string]: any } = {
    MonitorSmartphone, BookOpen, Home, Shirt, Sparkles,
    Dumbbell, Music, Package, Bike, Calendar, AlertCircle, Wrench, UtensilsCrossed
};

export function CategoriesSidebar() {
    const PRIMARY_COUNT = 9;
    const primaryCategories = CATEGORIES.slice(0, PRIMARY_COUNT);
    const overflowCategories = CATEGORIES.slice(PRIMARY_COUNT);
    const [isMoreOpen, setIsMoreOpen] = useState(false);

    return (
        <aside className="hidden lg:block w-56 shrink-0 sticky top-20 h-max z-[400]">
            <div className="rounded-xl bg-[#f8fafc] dark:bg-transparent overflow-visible flex flex-col">
                <div className="px-2.5 pt-2.5 pb-1.5 border-b border-border/40 dark:border-white/10">
                    <div className="border-b-2 border-orange-500 pb-2">
                        <div className="radius-native inline-flex items-center gap-2 bg-orange-500 dark:bg-orange-600 text-white px-2.5 py-1 rounded-t-md">
                            <h3 className="font-bold text-[11px] font-heading tracking-wider uppercase">Explore Categories</h3>
                        </div>
                    </div>
                </div>
                <div
                    className="relative flex flex-col py-1.5 px-1.5 gap-0.5"
                    onMouseLeave={() => setIsMoreOpen(false)}
                >
                    {primaryCategories.map((cat, idx) => {
                        const Icon = IconMap[cat.lucideIcon || "Package"];
                        return (
                            <Link
                                key={idx}
                                href={cat.href || `/listings?category=${cat.name}`}
                                className="flex items-center justify-between px-2.5 py-2 rounded-lg border border-orange-100/90 dark:border-transparent bg-white hover:border-orange-300 dark:hover:border-orange-500/30 hover:bg-orange-50 dark:hover:bg-orange-500/15 transition-all duration-200 group"
                            >
                                <div className="flex items-center gap-2 text-[11px] font-heading font-bold text-foreground group-hover:text-orange-700 dark:group-hover:text-orange-300">
                                    <span className="w-6 h-6 rounded-md bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300 flex items-center justify-center group-hover:bg-orange-200 dark:group-hover:bg-orange-500/30 transition-colors">
                                        <Icon className="w-3.5 h-3.5 shrink-0 transition-transform group-hover:scale-110" />
                                    </span>
                                    <span>{cat.name}</span>
                                </div>
                                <ChevronRight className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400/70 group-hover:text-orange-700 dark:group-hover:text-orange-300 transition-transform group-hover:translate-x-1" />
                            </Link>
                        );
                    })}

                    {overflowCategories.length > 0 && (
                        <div
                            className="relative"
                            onMouseEnter={() => setIsMoreOpen(true)}
                        >
                            <button
                                type="button"
                                className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg border border-orange-100/90 dark:border-transparent bg-white hover:border-orange-300 dark:hover:border-orange-500/30 hover:bg-orange-50 dark:hover:bg-orange-500/15 transition-all duration-200"
                            >
                                <div className="flex items-center gap-2 text-[11px] font-heading font-bold text-foreground">
                                    <span className="w-6 h-6 rounded-md bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300 flex items-center justify-center transition-colors">
                                        <Ellipsis className="w-3.5 h-3.5 shrink-0" />
                                    </span>
                                    <span>More</span>
                                </div>
                                <ChevronRight className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400/70 transition-transform" />
                            </button>
                        </div>
                    )}

                    {overflowCategories.length > 0 && (
                        <div
                            className={`absolute left-full top-0 bottom-0 ml-2 w-56 rounded-xl border border-border/50 bg-secondary/65 dark:bg-secondary/75 backdrop-blur-md p-1.5 flex flex-col gap-0.5 z-[500] transition-all duration-200 ease-out origin-left ${isMoreOpen
                                ? "opacity-100 translate-x-0 scale-100 pointer-events-auto"
                                : "opacity-0 -translate-x-1 scale-95 pointer-events-none"
                                }`}
                            onMouseEnter={() => setIsMoreOpen(true)}
                        >
                            {overflowCategories.map((cat, idx) => {
                                const Icon = IconMap[cat.lucideIcon || "Package"];
                                return (
                                    <Link
                                        key={`more-${idx}`}
                                        href={cat.href || `/listings?category=${cat.name}`}
                                        className="flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-secondary transition-all duration-200 group/item"
                                    >
                                        <div className="flex items-center gap-2 text-[11px] font-heading font-bold text-foreground group-hover/item:text-primary">
                                            <span className="w-6 h-6 rounded-md bg-primary/10 text-primary flex items-center justify-center transition-colors">
                                                <Icon className="w-3.5 h-3.5 shrink-0" />
                                            </span>
                                            <span>{cat.name}</span>
                                        </div>
                                        <ChevronRight className="w-3.5 h-3.5 text-primary/70 group-hover/item:text-primary transition-transform group-hover/item:translate-x-1" />
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
}
