"use client";

import Link from "next/link";
import Image from "next/image";
import {
    ArrowRight, ChevronRight, MonitorSmartphone, BookOpen, Home, Shirt, Sparkles,
    Dumbbell, Music, Package, Bike, Calendar, AlertCircle, Wrench
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CATEGORIES } from "../../data/products";

const IconMap: { [key: string]: any } = {
    MonitorSmartphone, BookOpen, Home, Shirt, Sparkles,
    Dumbbell, Music, Package, Bike, Calendar, AlertCircle, Wrench
};

const HERO_SLIDES = [
    {
        id: 1,
        title: "Back to School",
        subtitle: "Unilag Special",
        desc: "Get your hostel essentials sorted before resumption. Mattresses, curtains, and hotplates at student prices.",
        cta: "Shop Hostel Gear",
        bg: "bg-blue-600",
        image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80"
    },
    {
        id: 2,
        title: "Tech Week",
        subtitle: "Laptop Deals",
        desc: "Fairly used UK laptops perfect for coding and projects. Pay small small allowed.",
        cta: "View Laptops",
        bg: "bg-[#e31e24]",
        image: "https://images.unsplash.com/photo-153129746-1136-82lw9z1m8j?auto=format&fit=crop&w=800&q=80"
    },
    {
        id: 3,
        title: "Fashion Drop",
        subtitle: "Yaba Market Style",
        desc: "Thrift wears (Okrika) first grade. Look clean on campus without breaking the bank.",
        cta: "Browse Wears",
        bg: "bg-purple-600",
        image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=800&q=80"
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
                        <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
                            {CATEGORIES.slice(0, 8).map((cat, idx) => {
                                const Icon = IconMap[cat.lucideIcon || "Package"];
                                return (
                                    <Link
                                        key={idx}
                                        href={`/listings?category=${cat.name}`}
                                        className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-primary/10 hover:text-primary transition-all duration-300 group"
                                    >
                                        <div className="flex items-center gap-3 text-sm font-medium text-foreground/80 group-hover:text-primary">
                                            <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                                            <span>{cat.name}</span>
                                        </div>
                                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-primary transition-transform group-hover:translate-x-1" />
                                    </Link>
                                );
                            })}
                        </div>
                        <div className="p-3 bg-primary/5 border-t border-border/50 text-center">
                            <Link href="/listings" className="text-xs font-black uppercase tracking-widest text-primary hover:opacity-80 transition-opacity">
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
                                    <div className="absolute inset-0 z-0">
                                        <Image
                                            src={HERO_SLIDES[currentSlide].image}
                                            alt={HERO_SLIDES[currentSlide].title}
                                            fill
                                            className="object-cover opacity-60"
                                            priority
                                        />
                                        {/* Gradient Overlay for Text Legibility */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-10"></div>
                                    </div>

                                    {/* Content */}
                                    <div className="relative w-full pl-5 md:w-1/2 md:pl-20 pr-4 md:pr-8 z-20 text-white">
                                        <motion.span
                                            initial={{ y: 20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ delay: 0.2 }}
                                            className="inline-block px-3 py-1 bg-white/20 text-white text-[10px] font-bold uppercase tracking-widest rounded-full mb-4 backdrop-blur-sm border border-accent/20"
                                        >
                                            {HERO_SLIDES[currentSlide].subtitle}
                                        </motion.span>
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
                                        <motion.div
                                            initial={{ y: 20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ delay: 0.5 }}
                                        >
                                            <Link
                                                href="/listings"
                                                className="inline-flex items-center gap-2 bg-white text-gray-900 px-4 md:px-8 py-2 md:py-3.5 rounded-full font-bold text-xs md:text-sm uppercase tracking-wide hover:bg-gray-100 transition-colors shadow-xl"
                                            >
                                                {HERO_SLIDES[currentSlide].cta}
                                                <ArrowRight className="w-4 h-4" />
                                            </Link>
                                        </motion.div>
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
