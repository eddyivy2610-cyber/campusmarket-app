"use client";

import { useState, useEffect } from "react";

import Link from "next/link";
import {
    ChevronRight, MonitorSmartphone, Sparkles,
    Package,
    PlusCircle, ConciergeBell, MessageCircleQuestion
} from "lucide-react";

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

    const QUICK_ACTIONS = [
        {
            label: "Ads / Promote",
            description: "Request listing promotion",
            href: "/promotions/request",
            icon: PlusCircle,
            gradient: "from-primary/10 to-orange-500/10",
            iconColor: "text-primary",
            iconBg: "bg-primary/10",
            hoverBorder: "hover:border-primary/40",
        },
        {
            label: "Services",
            description: "Post or find campus services",
            href: "/services",
            icon: ConciergeBell,
            gradient: "from-indigo-500/10 to-purple-500/10",
            iconColor: "text-indigo-500",
            iconBg: "bg-indigo-500/10",
            hoverBorder: "hover:border-indigo-400/40",
        },
        {
            label: "Inquiries",
            description: "Chat with support rooms",
            href: "/help-center/chat-room",
            icon: MessageCircleQuestion,
            gradient: "from-emerald-500/10 to-teal-500/10",
            iconColor: "text-emerald-500",
            iconBg: "bg-emerald-500/10",
            hoverBorder: "hover:border-emerald-400/40",
        },
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev: number) => (prev + 1) % HERO_SLIDES.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [HERO_SLIDES.length]);

    return (
        <div className="bg-secondary/20 border-b border-border/40 pb-6 md:pb-8 pt-4 md:pt-6">
            <div className="flex flex-col lg:flex-row gap-4 lg:gap-5 h-auto lg:h-[340px] relative z-10 w-full">

                {/* Main Banner Carousel */}
                <div className="flex-1 h-[220px] sm:h-[260px] lg:h-full lg:min-h-0 relative rounded-2xl overflow-hidden shadow-md group border border-transparent">
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
                                    <div className="relative z-20 flex flex-col gap-1.5 md:gap-2 max-w-[85%] sm:max-w-md my-auto">
                                        <span className="bg-white/20 text-white text-[10px] md:text-xs font-bold uppercase tracking-widest py-1 px-3 rounded-full w-max backdrop-blur-sm shadow-sm ring-1 ring-white/30 truncate">
                                            {slide.badge}
                                        </span>
                                        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold font-heading leading-tight group-hover/slide:scale-[1.02] transition-transform origin-left text-balance drop-shadow-md">
                                            {slide.title}
                                        </h2>
                                        <p className="text-[11px] md:text-xs text-white/95 font-medium leading-snug drop-shadow-sm max-w-[95%]">
                                            {slide.description}
                                        </p>
                                        <div className="mt-1.5 flex items-center gap-1.5 text-[10px] sm:text-xs font-bold bg-white text-primary w-max px-3 sm:px-4 py-1.5 md:py-2 rounded-lg shadow-lg ring-1 ring-black/5 group-hover/slide:bg-gray-50 transition-colors">
                                            Explore Now <ChevronRight className="w-3.5 h-3.5 md:w-5 md:h-5 group-hover/slide:translate-x-1 transition-transform" />
                                        </div>
                                    </div>

                                    {/* Abstract Decor Elements */}
                                    <div className="absolute top-0 right-0 bottom-0 w-2/3 bg-gradient-to-l from-white/10 to-transparent skew-x-12 translate-x-1/4 group-hover/slide:translate-x-1/3 transition-transform duration-700 ease-out" />
                                    <div className="absolute -top-12 left-1/2 w-48 h-48 bg-white/20 rounded-full blur-3xl mix-blend-overlay pointer-events-none" />
                                    <SlideIcon className="absolute top-3 -right-4 sm:top-6 sm:right-4 md:top-8 md:right-20 w-24 h-24 sm:w-32 sm:h-32 md:w-32 md:h-32 text-white/10 sm:text-white/20 -rotate-12 group-hover/slide:rotate-12 group-hover/slide:scale-110 transition-all duration-700 drop-shadow-lg" strokeWidth={1} />
                                </Link>
                            );
                        })}
                    </div>

                    {/* Carousel Controls */}
                    <div className="absolute bottom-2.5 left-0 right-0 z-30 flex justify-center gap-2">
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

                {/* Right: Quick Actions + Promo Banner */}
                <div className="hidden xl:flex flex-col w-60 lg:w-68 shrink-0 gap-2.5 h-full">

                    {/* Quick Actions Card */}
                    <div className="bg-card rounded-2xl border border-border/50 shadow-sm flex-1 flex flex-col overflow-hidden">
                        <div className="px-3 py-2 border-b border-border/50 bg-secondary/30 flex items-center justify-between">
                            <h3 className="font-bold text-xs font-heading tracking-wide text-foreground">Quick Actions</h3>
                            <span className="text-[9px] font-heading font-semibold text-muted-foreground uppercase tracking-widest">Get started</span>
                        </div>
                        <div className="p-2 flex flex-col gap-2 flex-1 justify-center">
                            {QUICK_ACTIONS.map((action) => {
                                const ActionIcon = action.icon;
                                return (
                                    <Link
                                        key={action.label}
                                        href={action.href}
                                        className={`flex items-center gap-2.5 p-2 rounded-lg border border-border/40 ${action.hoverBorder} bg-gradient-to-r ${action.gradient} hover:shadow-sm transition-all duration-200 group/action`}
                                    >
                                        <div className={`w-7 h-7 rounded-md ${action.iconBg} flex items-center justify-center shrink-0 group-hover/action:scale-110 transition-transform duration-200`}>
                                            <ActionIcon className={`w-3.5 h-3.5 ${action.iconColor}`} strokeWidth={2} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[11px] font-heading font-bold text-foreground group-hover/action:text-foreground/90 leading-tight">{action.label}</p>
                                            <p className="text-[9px] font-heading text-muted-foreground mt-0.5 leading-tight truncate">{action.description}</p>
                                        </div>
                                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover/action:text-foreground/60 group-hover/action:translate-x-0.5 transition-all shrink-0" />
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* Special Promo Banner */}
                    <div className="h-[72px] rounded-xl overflow-hidden bg-gradient-to-r from-red-600 to-rose-500 relative flex items-center shrink-0 shadow-md group border border-transparent hover:border-white/20 transition-all cursor-pointer">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay"></div>
                        <div className="flex items-center gap-3 relative z-10 px-4 w-full">
                            <div>
                                <div className="text-rose-200 text-[9px] font-heading font-bold uppercase tracking-widest">Weekend Only</div>
                                <h4 className="text-white text-lg font-extrabold font-heading leading-tight group-hover:scale-105 transition-transform origin-left">SUPER SALE</h4>
                            </div>
                            <div className="ml-auto bg-white/20 backdrop-blur-sm text-white text-[9px] font-heading font-bold px-2 py-1 rounded-full border border-white/30 whitespace-nowrap">Up to 70% Off</div>
                        </div>
                        <Sparkles className="absolute top-2 right-2 w-4 h-4 text-yellow-300 opacity-70 animate-pulse" />
                        <Sparkles className="absolute bottom-2 left-2 w-3 h-3 text-yellow-300 opacity-50 animate-pulse" style={{ animationDelay: '1s' }} />
                    </div>
                </div>

            </div>
        </div>
    );
}
