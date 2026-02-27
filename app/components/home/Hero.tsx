"use client";

import Link from "next/link";
import Image from "next/image";
import {
    ChevronRight, MonitorSmartphone, BookOpen, Home, Shirt, Sparkles,
    Dumbbell, Music, Package, Bike, Calendar, AlertCircle, Wrench, UtensilsCrossed
} from "lucide-react";
import { CATEGORIES } from "../../data/products";

const IconMap: { [key: string]: any } = {
    MonitorSmartphone, BookOpen, Home, Shirt, Sparkles,
    Dumbbell, Music, Package, Bike, Calendar, AlertCircle, Wrench, UtensilsCrossed
};

export function Hero() {
    return (
        <div className="bg-secondary/20 border-b border-border/40 pb-6 md:pb-8 pt-4 md:pt-6">
            <div className="max-w-[1780px] mx-auto px-4 md:px-8">
                <div className="flex flex-col lg:flex-row gap-4 h-auto lg:h-[350px]">

                    {/* Sidebar Menu - Desktop Only */}
                    <div className="hidden lg:flex flex-col w-56 bg-card rounded-xl border border-border/50 shadow-sm shrink-0 overflow-hidden h-full">
                        <div className="p-3 border-b border-border/50 bg-secondary/30">
                            <h3 className="font-bold text-sm font-heading tracking-wide text-foreground">Top Categories</h3>
                        </div>
                        <div className="flex-1 flex flex-col py-1.5 px-1.5 overflow-y-auto custom-scrollbar">
                            {CATEGORIES.slice(0, 7).map((cat, idx) => {
                                const Icon = IconMap[cat.lucideIcon || "Package"];
                                return (
                                    <Link
                                        key={idx}
                                        href={`/listings?category=${cat.name}`}
                                        className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-secondary transition-all duration-200 group"
                                    >
                                        <div className="flex items-center gap-3 text-[13px] font-heading font-medium text-foreground/80 group-hover:text-primary">
                                            <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                                            <span>{cat.name}</span>
                                        </div>
                                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-primary transition-transform group-hover:translate-x-1" />
                                    </Link>
                                );
                            })}
                        </div>
                        <div className="p-2 bg-secondary/30 border-t border-border/50 text-center">
                            <Link href="/categories" className="text-xs font-bold uppercase tracking-widest text-primary hover:text-primary/80 transition-colors">
                                Explore by Category
                            </Link>
                        </div>
                    </div>

                    {/* Right Content Area */}
                    <div className="flex-1 flex flex-col gap-3 md:gap-4 h-[300px] sm:h-[400px] lg:h-full">

                        {/* Top: Banner Ad Container */}
                        <Link href="/promotions" className="flex-1 min-h-[150px] rounded-xl overflow-hidden shadow-sm relative group bg-white border border-border/50 block">
                            {/* Example placeholder banner mimicking AliExpress scale/style */}
                            <Image
                                src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1600&q=80"
                                alt="Main Ad Banner"
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                                priority
                            />
                            {/* Slight gradient if text was layered, but here the ad image itself usually contains the text */}
                            <div className="absolute inset-0 bg-black/10 transition-opacity group-hover:bg-transparent" />
                        </Link>

                        {/* Bottom: Feature Shortcuts */}
                        <div className="grid grid-cols-3 gap-3 md:gap-4 h-[90px] md:h-[130px] shrink-0">
                            {/* Services Shortcut */}
                            <Link href="/services" className="rounded-xl overflow-hidden shadow-sm relative group bg-card border border-border/50 text-white flex flex-col justify-end p-3 md:p-4">
                                <Image src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=600&q=80" alt="Services" fill className="object-cover z-0 transition-transform duration-500 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
                                <div className="relative z-20 transition-transform duration-300 group-hover:-translate-y-1">
                                    <h4 className="font-bold font-heading text-sm md:text-lg mb-0.5 group-hover:text-orange-400 transition-colors">Services</h4>
                                    <p className="text-[10px] md:text-xs text-white/80 font-medium hidden md:block">Find local talent</p>
                                </div>
                            </Link>

                            {/* Jobs Shortcut */}
                            <Link href="/jobs" className="rounded-xl overflow-hidden shadow-sm relative group bg-card border border-border/50 text-white flex flex-col justify-end p-3 md:p-4">
                                {/* Fixed broken image link with a valid Unsplash image */}
                                <Image src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=600&q=80" alt="Jobs" fill className="object-cover z-0 transition-transform duration-500 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
                                <div className="relative z-20 transition-transform duration-300 group-hover:-translate-y-1">
                                    <h4 className="font-bold font-heading text-sm md:text-lg mb-0.5 group-hover:text-orange-400 transition-colors">Jobs</h4>
                                    <p className="text-[10px] md:text-xs text-white/80 font-medium hidden md:block">Campus opportunities</p>
                                </div>
                            </Link>

                            {/* Community Shortcut */}
                            <Link href="/community" className="rounded-xl overflow-hidden shadow-sm relative group bg-card border border-border/50 text-white flex flex-col justify-end p-3 md:p-4">
                                <Image src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=600&q=80" alt="Community" fill className="object-cover z-0 transition-transform duration-500 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
                                <div className="relative z-20 transition-transform duration-300 group-hover:-translate-y-1">
                                    <h4 className="font-bold font-heading text-sm md:text-lg mb-0.5 group-hover:text-orange-400 transition-colors">Community</h4>
                                    <p className="text-[10px] md:text-xs text-white/80 font-medium hidden md:block">Join the discussion</p>
                                </div>
                            </Link>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
