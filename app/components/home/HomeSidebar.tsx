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

            {/* Latest Products Sidebar Widget */}
            <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 border-b border-border/50 bg-secondary/20">
                    <h3 className="font-bold text-[13px] font-heading uppercase tracking-widest text-foreground">Latest Products</h3>
                </div>
                <div className="p-3 flex flex-col gap-3">
                    {latestProducts.map((product, idx) => (
                        <Link key={idx} href={`/listings/${product.id}`} className="flex items-center gap-3 p-2 rounded-xl hover:bg-secondary/50 transition-colors group">
                            <div className="w-16 h-16 rounded-lg bg-muted relative shrink-0 overflow-hidden">
                                <Image src={product.image} alt={product.title} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-tight">{product.title}</h4>
                                <div className="flex items-center gap-0.5 mt-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={`w-2.5 h-2.5 ${i < 4 ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/30'}`} />
                                    ))}
                                    <span className="text-[9px] text-muted-foreground ml-1">({product.recommendedCount})</span>
                                </div>
                                <div className="mt-1 flex items-center gap-2">
                                    <span className="text-xs font-bold text-primary">₦{product.price.toLocaleString()}</span>
                                    {product.offer && <span className="text-[10px] text-muted-foreground line-through">₦{(product.price * 1.3).toLocaleString()}</span>}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Side Banner Ad */}
            <div className="h-48 rounded-2xl overflow-hidden bg-slate-900 relative group cursor-pointer border border-border/50 shadow-sm">
                <Image src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80" alt="Shoes Ad" fill className="object-cover opacity-60 group-hover:opacity-40 group-hover:scale-105 transition-all duration-700" />
                <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black/80 to-transparent">
                    <span className="text-amber-400 text-[10px] font-bold uppercase tracking-widest mb-1 block">New Arrivals</span>
                    <h3 className="text-white font-heading font-extrabold text-lg leading-tight">Trending Sneakers</h3>
                </div>
            </div>

        </aside>
    );
}