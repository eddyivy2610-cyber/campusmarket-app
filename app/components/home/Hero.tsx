"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { readStoredHeroBanners } from "../../lib/heroBanners";

export function Hero() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [heroBanners, setHeroBanners] = useState<string[]>(["/hero-ad-banner.jpg"]);

    useEffect(() => {
        const loadBanners = () => {
            const storedBanners = readStoredHeroBanners();
            setHeroBanners(storedBanners.length > 0 ? storedBanners : ["/hero-ad-banner.jpg"]);
        };

        loadBanners();
        window.addEventListener("storage", loadBanners);
        window.addEventListener("hero-banners-updated", loadBanners);

        return () => {
            window.removeEventListener("storage", loadBanners);
            window.removeEventListener("hero-banners-updated", loadBanners);
        };
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev: number) => (prev + 1) % heroBanners.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [heroBanners.length]);

    useEffect(() => {
        if (currentSlide >= heroBanners.length) {
            setCurrentSlide(0);
        }
    }, [currentSlide, heroBanners.length]);

    return (
        <div className="pb-6 md:pb-8 pt-4 md:pt-6">
            <div className="flex flex-col lg:flex-row gap-4 lg:gap-5 h-auto lg:h-[340px] relative z-10 w-full">

                {/* Main Banner Carousel */}
                <div className="flex-1 h-[220px] sm:h-[300px] lg:h-full relative rounded-xl overflow-hidden shadow-md group border border-transparent">
                    <div
                        className="flex w-full h-full transition-transform duration-700 ease-out"
                        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                    >
                        {heroBanners.map((banner, index) => (
                            <div key={index} className="w-full h-full shrink-0 relative">
                                <Image
                                    src={banner}
                                    alt={`Hero banner ${index + 1}`}
                                    fill
                                    unoptimized
                                    className="object-cover"
                                />
                            </div>
                        ))}
                    </div>

                    {/* Carousel Controls */}
                    <div className="absolute bottom-4 left-0 right-0 z-30 flex justify-center gap-2.5">
                        {heroBanners.map((_, index) => (
                            <button
                                key={index}
                                onClick={(e) => { e.preventDefault(); setCurrentSlide(index); }}
                                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${currentSlide === index ? 'w-8 bg-white' : 'bg-white/50 hover:bg-white/80'}`}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
