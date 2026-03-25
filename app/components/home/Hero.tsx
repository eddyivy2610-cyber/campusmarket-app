"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { readStoredHeroBanners } from "../../lib/heroBanners";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function Hero() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [heroBanners, setHeroBanners] = useState<string[]>(["/Frame 600.png"]);
    const [isPaused, setIsPaused] = useState(false);

    // Touch / drag state
    const touchStartX = useRef<number | null>(null);
    const touchStartY = useRef<number | null>(null);
    const isDragging = useRef(false);
    const dragOffset = useRef(0);
    const [visualOffset, setVisualOffset] = useState(0);

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

    // Auto-advance
    useEffect(() => {
        if (isPaused) return;
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % heroBanners.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [heroBanners.length, isPaused]);

    useEffect(() => {
        if (currentSlide >= heroBanners.length) setCurrentSlide(0);
    }, [currentSlide, heroBanners.length]);

    const goTo = useCallback(
        (idx: number) => {
            setCurrentSlide(((idx % heroBanners.length) + heroBanners.length) % heroBanners.length);
            setVisualOffset(0);
        },
        [heroBanners.length]
    );

    const goNext = useCallback(() => goTo(currentSlide + 1), [currentSlide, goTo]);
    const goPrev = useCallback(() => goTo(currentSlide - 1), [currentSlide, goTo]);

    // ─── Touch / Mouse handlers (mobile swipe) ───────────────────────────
    const onPointerDown = (e: React.PointerEvent) => {
        touchStartX.current = e.clientX;
        touchStartY.current = e.clientY;
        isDragging.current = false;
        dragOffset.current = 0;
        setIsPaused(true);
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: React.PointerEvent) => {
        if (touchStartX.current === null) return;
        const dx = e.clientX - touchStartX.current;
        const dy = e.clientY - (touchStartY.current ?? e.clientY);

        if (!isDragging.current && Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 6) {
            isDragging.current = true;
        }
        if (isDragging.current) {
            dragOffset.current = dx;
            setVisualOffset(dx);
        }
    };

    const onPointerUp = (e: React.PointerEvent) => {
        if (isDragging.current) {
            const threshold = (e.currentTarget as HTMLElement).offsetWidth * 0.2;
            if (dragOffset.current < -threshold) goNext();
            else if (dragOffset.current > threshold) goPrev();
            else setVisualOffset(0);
        }
        touchStartX.current = null;
        touchStartY.current = null;
        isDragging.current = false;
        dragOffset.current = 0;
        setIsPaused(false);
    };

    const baseTranslate = -(currentSlide * 100);
    // For mobile we add the visual drag offset in px (via extra style)
    const mobileStyle = {
        transform: `translateX(calc(${baseTranslate}% + ${visualOffset}px))`,
        transition: isDragging.current ? "none" : "transform 0.6s cubic-bezier(0.4,0,0.2,1)",
    };
    const desktopStyle = {
        transform: `translateX(${baseTranslate}%)`,
        transition: "transform 0.6s cubic-bezier(0.4,0,0.2,1)",
    };

    const multipleSlides = heroBanners.length > 1;

    return (
        <div className="w-full lg:flex-1">
            {/* ─── Carousel wrapper ──────────────────────────────────────────── */}
            <div
                className="w-full aspect-[1170/600] max-w-[1260px] h-auto relative overflow-hidden rounded-[28px] border border-[#efe3cf] bg-white shadow-[0_24px_60px_rgba(50,40,20,0.08)]"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
            >
                {/* ── Track ─────────────────────────────────────────────────── */}
                {/* Mobile track (touch-draggable) */}
                <div
                    className="flex w-full h-full md:hidden select-none cursor-grab active:cursor-grabbing"
                    style={mobileStyle}
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerUp}
                    onPointerCancel={onPointerUp}
                    draggable={false}
                >
                    {heroBanners.map((banner, index) => (
                        <div key={index} className="w-full h-full shrink-0 relative">
                            <Image
                                src={banner}
                                alt={`Hero banner ${index + 1}`}
                                fill
                                unoptimized
                                className="object-cover object-center"
                                draggable={false}
                            />
                        </div>
                    ))}
                </div>

                {/* Desktop track (auto/dot-driven, no drag) */}
                <div
                    className="hidden md:flex w-full h-full"
                    style={desktopStyle}
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

                {/* ── Desktop arrow buttons ──────────────────────────────────── */}
                {multipleSlides && (
                    <>
                        <button
                            onClick={goPrev}
                            aria-label="Previous banner"
                            className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 z-10 items-center justify-center w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm shadow-md border border-white/60 text-gray-700 hover:bg-white hover:scale-110 transition-all duration-200"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <button
                            onClick={goNext}
                            aria-label="Next banner"
                            className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 z-10 items-center justify-center w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm shadow-md border border-white/60 text-gray-700 hover:bg-white hover:scale-110 transition-all duration-200"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </>
                )}

                {/* ── Dot indicators ────────────────────────────────────────── */}
                {multipleSlides && (
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5">
                        {heroBanners.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => goTo(idx)}
                                aria-label={`Go to slide ${idx + 1}`}
                                className={`
                                    rounded-full transition-all duration-300
                                    ${idx === currentSlide
                                        ? "w-6 h-2 bg-white shadow-md"
                                        : "w-2 h-2 bg-white/50 hover:bg-white/80"
                                    }
                                `}
                            />
                        ))}
                    </div>
                )}

                {/* ── Mobile swipe hint (only shown once on first load) ──────── */}
                {multipleSlides && (
                    <div className="md:hidden absolute bottom-3 right-3 z-10 flex items-center gap-1 text-white/70 text-[10px] pointer-events-none select-none">
                        <ChevronLeft size={10} />
                        <span>swipe</span>
                        <ChevronRight size={10} />
                    </div>
                )}
            </div>
        </div>
    );
}
