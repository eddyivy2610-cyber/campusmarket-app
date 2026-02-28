"use client";

import { useState, useEffect, useRef } from "react";

import Link from "next/link";
import Image from "next/image";
import {
    ChevronRight, ChevronLeft, MonitorSmartphone, BookOpen, Home, Shirt, Sparkles,
    Dumbbell, Music, Package, Bike, Calendar, AlertCircle, Wrench, UtensilsCrossed, Star
} from "lucide-react";
import { CATEGORIES, PRODUCTS } from "../../data/products";

const IconMap: { [key: string]: any } = {
    MonitorSmartphone, BookOpen, Home, Shirt, Sparkles,
    Dumbbell, Music, Package, Bike, Calendar, AlertCircle, Wrench, UtensilsCrossed
};

export function Hero() {
    const [currentSlide, setCurrentSlide] = useState(0);

    const HERO_SLIDES = [
        {
            id: "deals",
            badge: "Special Offer",
            title: "Student Deals Week",
            description: "Get up to 50% off on premium dorm essentials, electronics, and textbooks.",
            link: "/promotions",
            bgClass: "from-primary via-orange-500 to-rose-500",
            icon: Sparkles
        },
        {
            id: "tech",
            badge: "New Arrivals",
            title: "Latest Campus Tech",
            description: "Upgrade your study setup with the newest laptops, tablets, and accessories.",
            link: "/listings?category=Electronics",
            bgClass: "from-indigo-600 via-purple-600 to-fuchsia-600",
            icon: MonitorSmartphone
        },
        {
            id: "sell",
            badge: "Seller Hub",
            title: "Clear Out Your Dorm",
            description: "Make extra cash by selling your old textbooks and electronics securely.",
            link: "/register?type=vendor",
            bgClass: "from-emerald-600 via-teal-500 to-cyan-600",
            icon: Package
        }
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev: number) => (prev + 1) % HERO_SLIDES.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [HERO_SLIDES.length]);

    return (
        <div className="bg-secondary/20 border-b border-border/40 pb-6 md:pb-8 pt-4 md:pt-6">
            <div className="max-w-[1780px] mx-auto px-4 md:px-8">
                <div className="flex flex-col lg:flex-row gap-4 lg:gap-5 h-auto lg:h-[420px] relative z-10 w-full">

                    {/* Sidebar Menu - Desktop Only */}
                    <div className="hidden lg:flex flex-col w-56 bg-card rounded-xl border border-border/50 shadow-sm shrink-0 overflow-visible h-full z-50 relative">
                        <div className="p-3 border-b border-border/50 bg-secondary/30">
                            <h3 className="font-bold text-sm font-heading tracking-wide text-foreground">Top Categories</h3>
                        </div>
                        <div className="flex-1 flex flex-col py-1.5 px-1.5">
                            {CATEGORIES.slice(0, 8).map((cat, idx) => {
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

                        {/* Hoverable "More Categories" Dropdown */}
                        <div className="relative group mt-auto px-1.5 pb-1.5">
                            <div className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-primary/5 cursor-pointer transition-all duration-200 group-hover:bg-primary/5">
                                <div className="flex items-center gap-3 text-[12px] font-heading font-medium text-primary">
                                    <Package className="w-4 h-4 shrink-0" />
                                    <span>More Categories</span>
                                </div>
                                <ChevronRight className="w-3.5 h-3.5 text-primary group-hover:translate-x-1 transition-transform" />
                            </div>

                            {/* Flyout Menu (Jumia-style Tab) */}
                            <div className="absolute bottom-0 right-0 translate-x-[100%] ml-1 w-56 h-auto min-h-[50%] bg-card border border-border/50 rounded-xl rounded-bl-none shadow-[10px_0_30px_rgba(0,0,0,0.1)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[100] flex flex-col origin-bottom-left py-2 px-2 before:absolute before:top-0 before:bottom-0 before:-left-1 before:w-2 before:bg-transparent">
                                {CATEGORIES.slice(8).map((cat, idx) => {
                                    const Icon = IconMap[cat.lucideIcon || "Package"];
                                    return (
                                        <Link
                                            key={idx}
                                            href={`/listings?category=${cat.name}`}
                                            className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-secondary transition-all duration-200 group/item"
                                        >
                                            <div className="flex items-center gap-3 text-[12px] font-heading font-medium text-foreground/80 group-hover/item:text-primary">
                                                <Icon className="w-4 h-4 shrink-0 transition-transform group-hover/item:scale-110" />
                                                <span>{cat.name}</span>
                                            </div>
                                            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/30 group-hover/item:text-primary transition-transform group-hover/item:translate-x-1" />
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="p-2 bg-secondary/30 border-t border-border/50 text-center">
                            <Link href="/categories" className="text-xs font-bold uppercase tracking-widest text-primary hover:text-primary/80 transition-colors">
                                View Full Directory
                            </Link>
                        </div>
                    </div>

                    {/* Middle: Main Banner Carousel */}
                    <div className="flex-1 h-[300px] sm:h-[350px] lg:h-full lg:min-h-0 relative rounded-2xl overflow-hidden shadow-md group border border-transparent">
                        <div
                            className="flex w-full h-full transition-transform duration-700 ease-out"
                            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                        >
                            {HERO_SLIDES.map((slide) => {
                                const SlideIcon = slide.icon;

                                return (
                                    <Link
                                        key={slide.id}
                                        href={slide.link}
                                        className={`w-full h-full shrink-0 flex flex-col justify-center px-5 md:px-12 text-white bg-gradient-to-br ${slide.bgClass} relative overflow-hidden group/slide block`}
                                    >
                                        <div className="relative z-20 flex flex-col gap-2 md:gap-3 max-w-[85%] sm:max-w-md my-auto">
                                            <span className="bg-white/20 text-white text-[10px] md:text-xs font-bold uppercase tracking-widest py-1 px-3 rounded-full w-max backdrop-blur-sm shadow-sm ring-1 ring-white/30 truncate">
                                                {slide.badge}
                                            </span>
                                            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold font-heading leading-tight group-hover/slide:scale-[1.02] transition-transform origin-left text-balance drop-shadow-md">
                                                {slide.title}
                                            </h2>
                                            <p className="text-xs md:text-sm text-white/95 font-medium leading-relaxed drop-shadow-sm max-w-[95%]">
                                                {slide.description}
                                            </p>
                                            <div className="mt-2 flex items-center gap-1.5 text-[11px] sm:text-xs md:text-sm font-bold bg-white text-primary w-max px-4 sm:px-5 md:px-6 py-2 md:py-2.5 rounded-xl shadow-lg ring-1 ring-black/5 group-hover/slide:bg-gray-50 transition-colors">
                                                Explore Now <ChevronRight className="w-3.5 h-3.5 md:w-5 md:h-5 group-hover/slide:translate-x-1 transition-transform" />
                                            </div>
                                        </div>

                                        {/* Abstract Decor Elements */}
                                        <div className="absolute top-0 right-0 bottom-0 w-2/3 bg-gradient-to-l from-white/10 to-transparent skew-x-12 translate-x-1/4 group-hover/slide:translate-x-1/3 transition-transform duration-700 ease-out" />
                                        <div className="absolute -top-12 left-1/2 w-48 h-48 bg-white/20 rounded-full blur-3xl mix-blend-overlay pointer-events-none" />
                                        <SlideIcon className="absolute top-4 -right-4 sm:top-8 sm:right-4 md:top-12 md:right-24 w-32 h-32 sm:w-40 sm:h-40 md:w-36 md:h-36 text-white/10 sm:text-white/20 -rotate-12 group-hover/slide:rotate-12 group-hover/slide:scale-110 transition-all duration-700 drop-shadow-lg" strokeWidth={1} />
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Carousel Controls */}
                        <div className="absolute bottom-4 left-0 right-0 z-30 flex justify-center gap-2">
                            {HERO_SLIDES.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={(e) => { e.preventDefault(); setCurrentSlide(index); }}
                                    className={`w-2 h-2 rounded-full transition-all duration-300 ${currentSlide === index ? 'w-6 bg-white' : 'bg-white/50 hover:bg-white/80'}`}
                                    aria-label={`Go to slide ${index + 1}`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Right: Best Selling / Promos */}
                    <div className="hidden xl:flex flex-col w-64 lg:w-72 shrink-0 gap-4 h-full">
                        {/* Best Selling List Container */}
                        <div className="bg-card rounded-2xl border border-border/50 shadow-sm flex-1 flex flex-col overflow-hidden">
                            <div className="p-3 border-b border-border/50 bg-secondary/30 flex items-center justify-between">
                                <h3 className="font-bold text-sm font-heading tracking-wide text-foreground">Best Selling</h3>
                                <div className="flex items-center gap-1">
                                    <button className="w-5 h-5 rounded hover:bg-black/5 flex items-center justify-center transition-colors"><ChevronLeft className="w-3 h-3" /></button>
                                    <button className="w-5 h-5 rounded hover:bg-black/5 flex items-center justify-center transition-colors"><ChevronRight className="w-3 h-3" /></button>
                                </div>
                            </div>
                            <div className="p-3 flex flex-col gap-3 flex-1 overflow-y-auto custom-scrollbar">
                                {PRODUCTS.slice(0, 3).map((product) => (
                                    <Link key={product.id} href={`/listings/${product.id}`} className="flex items-center gap-3 group hover:bg-secondary/40 p-1.5 rounded-xl transition-colors shrink-0">
                                        <div className="w-14 h-14 rounded-lg bg-muted relative overflow-hidden shrink-0">
                                            <Image src={product.image} alt={product.title} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-0.5 mb-0.5">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} className={`w-2.5 h-2.5 ${i < 4 ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/30'}`} />
                                                ))}
                                                <span className="text-[9px] text-muted-foreground ml-1">({product.recommendedCount})</span>
                                            </div>
                                            <h4 className="text-xs font-medium text-foreground truncate group-hover:text-primary transition-colors">{product.title}</h4>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                {product.offer && <span className="text-[10px] text-muted-foreground line-through">₦{(product.price * 1.2).toLocaleString()}</span>}
                                                <span className="text-xs font-bold text-primary">₦{product.price.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Special Promo Banner */}
                        <div className="h-28 rounded-2xl overflow-hidden bg-gradient-to-r from-red-600 to-rose-500 relative flex items-center justify-center shrink-0 shadow-md group border border-transparent hover:border-white/20 transition-all cursor-pointer">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay"></div>
                            <div className="text-center relative z-10 p-4">
                                <div className="text-rose-200 text-[10px] font-bold uppercase tracking-widest mb-1">Weekend Only</div>
                                <h4 className="text-white text-xl font-extrabold font-heading leading-none group-hover:scale-105 transition-transform">SUPER<br />SALE</h4>
                                <div className="mt-2 bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full inline-block border border-white/30">Up to 70% Off</div>
                            </div>
                            <Sparkles className="absolute top-2 right-2 w-4 h-4 text-yellow-300 opacity-70 animate-pulse" />
                            <Sparkles className="absolute bottom-2 left-2 w-3 h-3 text-yellow-300 opacity-50 animate-pulse" style={{ animationDelay: '1s' }} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
