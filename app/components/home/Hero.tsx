"use client";

import Link from "next/link";
import Image from "next/image";
import {
    ArrowRight, ChevronRight, MonitorSmartphone, BookOpen, Home, Shirt, Sparkles,
    Dumbbell, Music, Package, Bike, Calendar, AlertCircle, Wrench, UtensilsCrossed
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CATEGORIES } from "../../data/products";

const IconMap: { [key: string]: any } = {
    MonitorSmartphone, BookOpen, Home, Shirt, Sparkles,
    Dumbbell, Music, Package, Bike, Calendar, AlertCircle, Wrench, UtensilsCrossed
};

const HERO_SLIDES = [
    {
        id: 1,
        title: "Back to School",
        desc: "Get your hostel essentials sorted before resumption. Mattresses, curtains, and hotplates at student prices.",
        bg: "bg-blue-600",
        image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80"
    },
    {
        id: 2,
        title: "Tech Week",
        desc: "Fairly used UK laptops perfect for coding and projects. Pay small small allowed.",
        bg: "bg-[#e31e24]",
        image: "https://images.unsplash.com/photo-1588872657478-7c439f055ccf?auto=format&fit=crop&w=800&q=80"
    },
    {
        id: 3,
        title: "Fashion Drop",
        desc: "Thrift wears (Okrika) first grade. Look clean on campus without breaking the bank.",
        bg: "bg-purple-600",
        image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=800&q=80"
    },
    {
        id: 4,
        title: "Campus Eats",
        desc: "From home-cooked meals to snacks and provisions — get fed without leaving campus. Daily specials available.",
        bg: "bg-orange-600",
        image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80"
    },
    {
        id: 5,
        title: "Skills to Sell",
        desc: "Need a logo, a tutor, or a haircut? Browse student-run services and book in minutes.",
        bg: "bg-teal-600",
        image: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80"
    }
];

export function Hero() {
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="bg-secondary/20 border-b border-border/40">
            <div className="max-w-[1780px] mx-auto px-4 md:px-8">
                <div className="flex gap-6 py-4 md:py-6 h-[200px] md:h-[450px]">

                    {/* Sidebar Menu - Desktop Only */}
                    <div className="hidden lg:flex flex-col w-64 bg-secondary/20 backdrop-blur-md rounded-lg border border-border/50 shadow-xl shrink-0 overflow-hidden h-full">
                        <div className="p-4 border-b border-border/50 bg-primary/5">
                            <h3 className="font-bold font-heading text-sm uppercase tracking-wider text-foreground">Top Categories</h3>
                        </div>
                        <div className="flex-1 flex flex-col justify-between py-2 px-2 overflow-hidden">
                            {CATEGORIES.slice(0, 9).map((cat, idx) => {
                                const Icon = IconMap[cat.lucideIcon || "Package"];
                                return (
                                    <Link
                                        key={idx}
                                        href={`/listings?category=${cat.name}`}
                                        className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-primary/10 hover:text-primary transition-all duration-300 group"
                                    >
                                        <div className="flex items-center gap-2.5 text-[13px] font-medium text-foreground/80 group-hover:text-primary">
                                            <Icon className="w-3.5 h-3.5 shrink-0 transition-transform group-hover:scale-110" />
                                            <span>{cat.name}</span>
                                        </div>
                                        <ChevronRight className="w-3 h-3 text-muted-foreground/30 group-hover:text-primary transition-transform group-hover:translate-x-1" />
                                    </Link>
                                );
                            })}
                        </div>
                        <div className="p-3 bg-primary/5 border-t border-border/50 text-center">
                            <Link href="/listings" className="text-xs font-bold uppercase tracking-widest text-primary hover:opacity-80 transition-opacity">
                                View All
                            </Link>
                        </div>
                    </div>

                    {/* Main Slider */}
                    <div className="flex-1 relative rounded-xl overflow-hidden shadow-lg group bg-card">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentSlide}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.5 }}
                                className={`absolute inset-0 z-10`}
                            >
                                <div className={`w-full h-full ${HERO_SLIDES[currentSlide].bg} relative flex items-center overflow-hidden`}>
                                    {/* Background Image */}
                                    <Link href="/listings" className="absolute inset-0 z-0 block">
                                        <Image
                                            src={HERO_SLIDES[currentSlide].image}
                                            alt={HERO_SLIDES[currentSlide].title}
                                            fill
                                            className="object-cover opacity-60"
                                            priority
                                        />
                                        {/* Gradient Overlay for Text Legibility */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-10"></div>
                                    </Link>

                                    {/* Content */}
                                    <div className="relative pointer-events-none w-full pl-5 md:w-1/2 md:pl-20 pr-4 md:pr-8 z-20 text-white">
                                        <motion.h2
                                            initial={{ y: 20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ delay: 0.3 }}
                                            className="text-2xl md:text-6xl font-bold font-heading mb-2 md:mb-4 leading-tight"
                                        >
                                            {HERO_SLIDES[currentSlide].title}
                                        </motion.h2>
                                        <motion.p
                                            initial={{ y: 20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ delay: 0.4 }}
                                            className="text-sm md:text-xl text-white/90 mb-4 md:mb-8 font-medium max-w-lg leading-relaxed line-clamp-2 md:line-clamp-none"
                                        >
                                            {HERO_SLIDES[currentSlide].desc}
                                        </motion.p>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        {/* Dots */}
                        <div className="absolute bottom-6 left-12 md:left-20 z-30 flex gap-2">
                            {HERO_SLIDES.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentSlide(idx)}
                                    className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'}`}
                                />
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
