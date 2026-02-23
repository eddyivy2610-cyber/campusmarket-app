"use client";

import {
    MonitorSmartphone, BookOpen, Home, Shirt, Sparkles,
    Dumbbell, Music, Package, Bike, Calendar, AlertCircle, Wrench, UtensilsCrossed
} from "lucide-react";
import Link from "next/link";
import { CATEGORIES } from "../../data/products";

const IconMap: { [key: string]: any } = {
    MonitorSmartphone, BookOpen, Home, Shirt, Sparkles,
    Dumbbell, Music, Package, Bike, Calendar, AlertCircle, Wrench, UtensilsCrossed
};

export function CategoryPreview() {
    return (
        // Hidden on mobile — shown only on md+ screens
        <section className="hidden md:block py-12 bg-secondary/20">
            <div className="max-w-[1780px] mx-auto px-4 md:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold font-heading text-foreground">Browse Categories</h2>
                    <p className="text-muted-foreground mt-2 font-body">Find exactly what you&apos;re looking for</p>
                </div>

                <div className="grid grid-cols-4 lg:grid-cols-6 gap-4">
                    {CATEGORIES.map((cat, idx) => {
                        const Icon = IconMap[cat.lucideIcon || "Package"];
                        return (
                            <Link
                                key={idx}
                                href={`/listings?category=${cat.name}`}
                                className="flex flex-col items-center justify-center p-6 bg-card rounded-xl shadow-sm hover:shadow-md transition-all border border-border/50 hover:border-primary/30 group"
                            >
                                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors mb-4">
                                    <Icon className="w-8 h-8" />
                                </div>
                                <h3 className="font-bold font-heading text-sm text-foreground group-hover:text-primary transition-colors text-center">{cat.name}</h3>
                                <span className="text-[10px] text-muted-foreground mt-1">Explore items</span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
