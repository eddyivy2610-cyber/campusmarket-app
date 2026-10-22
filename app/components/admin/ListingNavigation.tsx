"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package, PlusCircle, Flag, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_CARDS = [
    {
        name: "All Listings",
        description: "View and manage the complete product catalog",
        href: "/admin/listings",
        icon: Package,
        color: "text-blue-500",
        bgColor: "bg-blue-500/10",
        borderColor: "border-blue-500/20"
    },
    {
        name: "New Listings",
        description: "Pending approval and recently submitted items",
        href: "/admin/listings/new",
        icon: PlusCircle,
        color: "text-emerald-500",
        bgColor: "bg-emerald-500/10",
        borderColor: "border-emerald-500/20"
    },
    {
        name: "Flagged",
        description: "Items reported by users or flagged by system",
        href: "/admin/listings/flagged",
        icon: Flag,
        color: "text-rose-500",
        bgColor: "bg-rose-500/10",
        borderColor: "border-rose-500/20"
    }
];

export default function ListingNavigation() {
    const pathname = usePathname();

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {NAV_CARDS.map((card) => {
                const isActive = pathname === card.href;
                return (
                    <Link
                        key={card.name}
                        href={card.href}
                        className={cn(
                            "group relative p-5 rounded-[24px] border transition-all duration-300 overflow-hidden",
                            isActive 
                                ? "bg-card border-primary ring-1 ring-primary shadow-lg" 
                                : "bg-card/50 border-border/50 hover:border-primary/30 hover:bg-card hover:shadow-md"
                        )}
                    >
                        {/* Background Decoration */}
                        <div className={cn(
                            "absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-[0.03] transition-transform duration-500 group-hover:scale-150",
                            card.color.replace('text', 'bg')
                        )} />

                        <div className="flex items-start justify-between relative z-10">
                            <div className={cn("p-3 rounded-2xl", card.bgColor, card.color)}>
                                <card.icon size={22} />
                            </div>
                            <div className={cn(
                                "p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0 bg-primary/10 text-primary",
                                isActive && "opacity-100 translate-x-0"
                            )}>
                                <ArrowRight size={14} />
                            </div>
                        </div>

                        <div className="mt-4 relative z-10">
                            <h3 className={cn(
                                "text-sm font-bold uppercase tracking-widest transition-colors",
                                isActive ? "text-primary" : "text-foreground group-hover:text-primary"
                            )}>
                                {card.name}
                            </h3>
                            <p className="text-[11px] font-medium text-muted-foreground mt-1 leading-relaxed">
                                {card.description}
                            </p>
                        </div>

                        {isActive && (
                            <div className="absolute top-3 right-3 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-primary/50">Active</span>
                            </div>
                        )}
                    </Link>
                );
            })}
        </div>
    );
}
