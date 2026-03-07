"use client";

import Link from "next/link";
import Image from "next/image";
import {
    ChevronRight, MonitorSmartphone, BookOpen, Home, Shirt, Sparkles,
    Dumbbell, Music, Package, Bike, Calendar, AlertCircle, Wrench, UtensilsCrossed, Star
} from "lucide-react";
import { CATEGORIES, PRODUCTS } from "../../data/products";

const IconMap: { [key: string]: any } = {
    MonitorSmartphone, BookOpen, Home, Shirt, Sparkles,
    Dumbbell, Music, Package, Bike, Calendar, AlertCircle, Wrench, UtensilsCrossed
};

export function HomeSidebar() {
    const latestProducts = PRODUCTS.slice(5, 10);

    return (
        <aside className="hidden lg:flex flex-col w-[260px] xl:w-[280px] shrink-0 gap-6 self-start sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto custom-scrollbar">

            {/* Top Categories */}
            <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 border-b border-border/50 bg-secondary/20">
                    <h3 className="font-bold text-[13px] font-heading uppercase tracking-widest text-foreground">Top Categories</h3>
                </div>
                <div className="flex flex-col py-1.5 px-1.5">
                    {CATEGORIES.map((cat, idx) => {
                        const Icon = IconMap[cat.lucideIcon || "Package"];
                        return (
                            <Link
                                key={idx}
                                href={cat.href || `/listings?category=${cat.name}`}
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