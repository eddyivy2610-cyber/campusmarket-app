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
        <div className="w-full lg:flex-1">
            {/* Main Banner Carousel */}
            <div className="w-full aspect-[1170/600] max-w-[1260px] h-auto relative overflow-hidden rounded-[28px] border border-[#efe3cf] bg-white shadow-[0_24px_60px_rgba(50,40,20,0.08)]">
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
                                className="object-cover object-center"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
