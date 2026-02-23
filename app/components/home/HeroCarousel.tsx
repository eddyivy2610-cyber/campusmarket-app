"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

const slides = [
    {
        id: 1,
        title: "Valentine's Special",
        subtitle: "Gifts for your campus crush",
        description: "Up to 50% off styling services, chocolates, and unique campus finds.",
        image: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&q=80&w=1200",
        primaryColor: "bg-pink-500",
        link: "/coming-soon"
    },
    {
        id: 2,
        title: "Sell Your Old Books",
        subtitle: "Turn clutter into cash",
        description: "Post your used textbooks and gadgets in seconds to thousands of students.",
        image: "https://images.unsplash.com/photo-1524578271613-d550eacf6090?auto=format&fit=crop&q=80&w=1200",
        primaryColor: "bg-primary",
        link: "/sell"
    },
    {
        id: 3,
        title: "Campus Buzz is Live",
        subtitle: "What's happening around you?",
        description: "Join the conversation, find events, and connect with your community.",
        image: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&q=80&w=1200",
        primaryColor: "bg-purple-600",
        link: "/community"
    }
];

export function HeroCarousel() {
    const [currentSlide, setCurrentSlide] = useState(0);

    // Auto-play
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    };

    return (
        <section className="py-6 px-4 md:px-8 max-w-[1780px] mx-auto">
            <div className="relative w-full aspect-[2/1] md:aspect-[3/1] lg:aspect-[3.5/1] rounded-2xl md:rounded-3xl overflow-hidden shadow-sm group">

                {/* Slides */}
                {slides.map((slide, index) => (
                    <div
                        key={slide.id}
                        className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"}`}
                    >
                        {/* Background Image */}
                        <div className="absolute inset-0">
                            <Image
                                src={slide.image}
                                alt={slide.title}
                                fill
                                className="object-cover"
                                priority={index === 0}
                            />
                            {/* Overlay Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
                        </div>

                        {/* Content */}
                        <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-16 lg:px-24">
                            <div className="max-w-xl text-white transform transition-all duration-700 translate-y-0 animate-fade-in-up">
                                <span className={`inline-block px-3 py-1 mb-4 text-[10px] md:text-xs font-bold uppercase tracking-widest rounded-full ${slide.primaryColor} text-white`}>
                                    {slide.subtitle}
                                </span>
                                <h2 className="text-3xl md:text-5xl font-bold mb-4 leading-tight font-sans">
                                    {slide.title}
                                </h2>
                                <p className="text-base md:text-lg text-gray-200 mb-8 font-medium line-clamp-2 md:line-clamp-none">
                                    {slide.description}
                                </p>
                                <Link
                                    href={slide.link}
                                    className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-transform hover:-translate-y-1 ${slide.primaryColor} hover:brightness-110 shadow-lg`}
                                >
                                    <span>Learn More</span>
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Controls */}
                <button
                    onClick={prevSlide}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/20 hover:bg-black/50 backdrop-blur-sm text-white flex items-center justify-center transition-all z-20 opacity-0 group-hover:opacity-100"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                    onClick={nextSlide}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/20 hover:bg-black/50 backdrop-blur-sm text-white flex items-center justify-center transition-all z-20 opacity-0 group-hover:opacity-100"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>

                {/* Indicators */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            className={`w-2 h-2 rounded-full transition-all ${index === currentSlide ? "bg-white w-6" : "bg-white/40 hover:bg-white/60"}`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
