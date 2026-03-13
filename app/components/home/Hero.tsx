"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { readStoredHeroBanners } from "../../lib/heroBanners";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function Hero() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [heroBanners, setHeroBanners] = useState<string[]>(["/Frame 600.png"]);

    useEffect(() => {
        const loadBanners = () => {
            const storedBanners = readStoredHeroBanners();
            setHeroBanners(storedBanners.length > 0 ? storedBanners : ["/Frame 600.png"]);
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
        <div className="pb-0 pt-0 mt-0 mb-0">
            <div className="flex flex-col lg:flex-row gap-4 h-auto relative z-10 w-full">

                {/* Main Banner Carousel */}
                <div className="w-full h-[220px] sm:h-[300px] lg:max-w-[1170px] lg:h-[460px] lg:flex-none relative overflow-hidden">
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
                                    className="object-contain object-left scale-100 sm:scale-[0.92] lg:scale-[0.85] origin-left"
                                />
                            </div>
                        ))}
                    </div>
                </div>
                <div className="hidden lg:block flex-1 min-h-[460px]" />
            </div>
        </div>
    );
}
