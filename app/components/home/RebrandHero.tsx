"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  Tag,
  Store,
  Megaphone,
  Sparkles,
  Check,
  Clock,
} from "lucide-react";
import type { PublicBannerDTO } from "@/lib/bannerService";

export interface HeroSlide {
  id: string;
  badge?: string;
  badgeIcon?: React.ComponentType<{ className?: string }>;
  headline: string;
  description?: string;
  ctaLabel: string;
  ctaUrl: string;
  secondaryCtaLabel?: string;
  secondaryCtaUrl?: string;
  imageUrl?: string;
  mobileImageUrl?: string;
  imageAlt?: string;
  illustration?: string;
  theme?: "gold" | "white";
  isFullGraphic?: boolean;
}

const HERO_CATEGORIES = [
  { label: "Electronics", href: "/explore?category=Electronics" },
  { label: "Fashion", href: "/explore?category=Fashion" },
  { label: "Books", href: "/explore?category=Books%20%26%20Academic%20Supplies" },
  { label: "Hostel", href: "/explore?category=Hostel%20Essentials" },
  { label: "Services", href: "/explore?category=Services" },
  { label: "More...", href: "/explore" },
];

const FEATURE_ITEMS = [
  {
    id: "sell",
    title: "Sell",
    subtitle: "Post a listing",
    href: "/listings/create",
    icon: Tag,
    isReady: true,
  },
  {
    id: "storefront",
    title: "Storefront",
    subtitle: "Dashboard & store manager",
    href: "/stores?view=storefront",
    icon: Store,
    isReady: true,
  },
  {
    id: "ads",
    title: "Ads",
    subtitle: "Promote on campus",
    href: "/coming-soon?feature=ads",
    icon: Megaphone,
    isReady: false,
  },
];

const DEFAULT_HERO_SLIDES: HeroSlide[] = [
  {
    id: "hero-christmas-sale",
    headline: "Modern Christmas Sale",
    ctaLabel: "Shop Sale",
    ctaUrl: "/explore",
    imageUrl: "/Blue Modern Christmas Sale Banner.webp",
    isFullGraphic: true,
    theme: "white",
  },
  {
    id: "hero-fashion-promo",
    headline: "Modern Fashion Style Promo",
    ctaLabel: "Shop Fashion",
    ctaUrl: "/explore?category=Fashion",
    imageUrl: "/Colorful Bold Modern Fashion Style Promo Facebook Ad (1840 x 800 px).webp",
    isFullGraphic: true,
    theme: "white",
  },
  {
    id: "hero-leems-sale",
    headline: "Leems Mega Sale",
    ctaLabel: "View Deals",
    ctaUrl: "/explore",
    imageUrl: "/Leems Sale  (1840 x 800 px).webp",
    isFullGraphic: true,
    theme: "white",
  },
  {
    id: "hero-food-promo",
    headline: "Food Menu Promo",
    ctaLabel: "Explore Food",
    ctaUrl: "/explore",
    imageUrl: "/Orange and Yellow Modern Food Menu Promo Banner (1840 x 800 px).webp",
    isFullGraphic: true,
    theme: "white",
  },
  {
    id: "hero-headphone-sale",
    headline: "Headphone Sale Promo",
    ctaLabel: "Shop Audio",
    ctaUrl: "/explore?category=Electronics",
    imageUrl: "/Purple White and Red Modern Headphone Sale Promo Banner (1840 x 800 px).webp",
    isFullGraphic: true,
    theme: "white",
  },
  {
    id: "hero-black-friday-electronics",
    headline: "Black Friday Electronic Sale",
    ctaLabel: "Shop Electronics",
    ctaUrl: "/explore?category=Electronics",
    imageUrl: "/Red Modern Black Friday Electronic Sale Facebook Ad (1840 x 800 px).webp",
    isFullGraphic: true,
    theme: "white",
  },
];

export function RebrandHero() {
  const [slides, setSlides] = useState<HeroSlide[]>(DEFAULT_HERO_SLIDES);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const touchStartXRef = useRef<number | null>(null);
  const preloadedUrls = useRef<Set<string>>(new Set());

  // Cache & Pre-decode all banner images into memory and browser Cache API
  useEffect(() => {
    if (!slides || slides.length === 0) return;

    slides.forEach((slide) => {
      const url = slide.imageUrl;
      if (!url || preloadedUrls.current.has(url)) return;
      preloadedUrls.current.add(url);

      // 1. In-memory pre-decode to ensure instant rendering without blank flash
      if (typeof window !== "undefined") {
        const img = new window.Image();
        img.src = url;
        if ("decode" in img) {
          img.decode().catch(() => {});
        }

        // 2. Browser Cache Storage API so subsequent loads never require network
        if ("caches" in window) {
          caches.open("campushive-banner-cache-v1").then((cache) => {
            cache.match(url).then((matching) => {
              if (!matching) {
                cache.add(url).catch(() => {});
              }
            });
          }).catch(() => {});
        }
      }
    });
  }, [slides]);

  // Fetch active promotional banners from the server queue
  useEffect(() => {
    let isMounted = true;

    async function fetchHeroBanners() {
      try {
        const res = await fetch("/api/banners/active?placement=homepage_hero&multiple=true", {
          next: { revalidate: 60 },
        });

        if (res.ok) {
          const json = await res.json();
          if (isMounted && json.success) {
            let activeItems: PublicBannerDTO[] = [];

            if (Array.isArray(json.data)) {
              activeItems = json.data;
            } else if (Array.isArray(json.items)) {
              activeItems = json.items;
            } else if (json.data && typeof json.data === "object") {
              activeItems = [json.data];
            }

            if (activeItems.length > 0) {
              const apiSlides: HeroSlide[] = activeItems.map((b) => ({
                id: b.id,
                badge: b.targetCategory ? `${b.targetCategory} Promotion` : "Featured Spotlight",
                badgeIcon: Sparkles,
                headline: b.headline,
                description: b.description,
                ctaLabel: b.ctaLabel || "Explore now",
                ctaUrl: b.ctaUrl || "/explore",
                imageUrl: b.imageUrl,
                mobileImageUrl: b.mobileImageUrl,
                imageAlt: b.imageAlt || b.headline,
                isFullGraphic: Boolean(b.imageUrl && (!b.description || b.description.trim() === "")),
                theme: "white",
              }));

              if (apiSlides.length > 1) {
                setSlides(apiSlides);
              } else {
                const remainingDefaults = DEFAULT_HERO_SLIDES.filter(
                  (d) => !apiSlides.some((a) => a.imageUrl === d.imageUrl)
                );
                setSlides([...apiSlides, ...remainingDefaults]);
              }
            }
          }
        }
      } catch {
        // Silently retain default slides on network failure
      }
    }

    fetchHeroBanners();
    return () => {
      isMounted = false;
    };
  }, []);

  const slideCount = slides.length;

  const handleNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % slideCount);
  }, [slideCount]);

  const handlePrev = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + slideCount) % slideCount);
  }, [slideCount]);

  const handleDotClick = useCallback(
    (index: number) => {
      if (index === currentIndex) return;
      setDirection(index > currentIndex ? 1 : -1);
      setCurrentIndex(index);
    },
    [currentIndex]
  );

  // Reset progress bar on slide change
  useEffect(() => {
    setProgress(0);
  }, [currentIndex]);

  // Auto-scroll progress timer: rotates every 5s unless paused by user interaction
  useEffect(() => {
    if (isPaused || slideCount <= 1) return;

    const stepMs = 50;
    const durationMs = 5000;
    const increment = (stepMs / durationMs) * 100;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev + increment >= 100) {
          handleNext();
          return 0;
        }
        return prev + increment;
      });
    }, stepMs);

    return () => clearInterval(interval);
  }, [isPaused, slideCount, handleNext]);

  // Touch Swipe Handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsPaused(false);
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const deltaX = touchStartXRef.current - touchEndX;

    if (deltaX > 45) {
      handleNext();
    } else if (deltaX < -45) {
      handlePrev();
    }
    touchStartXRef.current = null;
  };

  return (
    <section
      style={{ fontFamily: "var(--font-plus-jakarta), sans-serif" }}
      className="w-full"
    >
      <div className="max-w-[1380px] mx-auto px-4 sm:px-8 lg:px-12 pt-4 sm:pt-6 pb-3 sm:pb-5">
        <div className="flex flex-col lg:flex-row items-stretch gap-5 lg:gap-6">
          {/* Left Column: Categories Navigation */}
          <aside
            aria-label="Product categories"
            className="hidden lg:flex w-full lg:w-[195px] xl:w-[210px] shrink-0 flex-col justify-between py-0.5"
          >
            <div>
              <h2 className="text-[14px] font-bold text-[#171717] dark:text-white px-2 mb-2 tracking-[-0.01em]">
                Categories
              </h2>

              <ul className="space-y-0.5">
                {HERO_CATEGORIES.map((category) => (
                  <li key={category.label}>
                    <Link
                      href={category.href}
                      className="radius-native group flex items-center justify-between px-2 py-2 rounded-lg text-[13px] font-medium text-[#363A40] dark:text-neutral-300 hover:text-[#171717] dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
                    >
                      <span>{category.label}</span>
                      <ChevronRight
                        className="w-3.5 h-3.5 text-[#8C929C] group-hover:text-[#171717] dark:group-hover:text-white transition-transform duration-150 group-hover:translate-x-0.5"
                        strokeWidth={1.8}
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Center Column: Animated Hero Banner Carousel with Navigation Dots */}
          <div
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="radius-native relative overflow-hidden flex-1 rounded-2xl aspect-[16/9] sm:aspect-[2.1/1] lg:aspect-auto min-h-[170px] sm:min-h-[240px] lg:h-[285px] lg:min-h-[285px] lg:max-h-[285px] flex items-stretch select-none bg-transparent"
            role="region"
            aria-roledescription="carousel"
            aria-label="Campus Marketplace Highlights"
          >
            {/* Continuous GPU-Accelerated Banner Slider Track (Zero Remounting, Zero Blank Flash) */}
            <div
              className="relative w-full h-full flex transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] will-change-transform bg-transparent"
              style={{
                transform: `translateX(-${currentIndex * 100}%)`,
              }}
            >
              {slides.map((slide) => {
                const isFullGraphic =
                  slide.isFullGraphic || (!slide.description && Boolean(slide.imageUrl));
                const isBroken = Boolean(slide.imageUrl && imageErrors[slide.id]);
                const BadgeIcon = slide.badgeIcon || Sparkles;

                return (
                  <div
                    key={slide.id}
                    className="w-full h-full shrink-0 relative bg-transparent overflow-hidden rounded-2xl flex items-center justify-center"
                    style={{ minWidth: "100%" }}
                  >
                    {isFullGraphic && slide.imageUrl && !isBroken ? (
                      <div className="relative w-full h-full bg-transparent overflow-hidden rounded-2xl">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={slide.imageUrl}
                          alt={slide.imageAlt || slide.headline}
                          loading="eager"
                          decoding="async"
                          onError={() =>
                            setImageErrors((prev) => ({ ...prev, [slide.id]: true }))
                          }
                          className="w-full h-full object-cover object-center select-none rounded-2xl pointer-events-none"
                        />
                        <Link
                          href={slide.ctaUrl || "/explore"}
                          className="absolute inset-0 z-10"
                          aria-label={slide.headline}
                        />
                      </div>
                    ) : (
                      /* Standard Banner Content Layout */
                      <div className="relative z-10 w-full h-full p-5 sm:p-7 lg:p-8 flex flex-col justify-center bg-transparent">
                        <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4 sm:gap-6 lg:gap-8 h-full">
                          {slide.illustration && (
                            <div className="relative shrink-0 w-[110px] sm:w-[145px] md:w-[165px] lg:w-[190px] flex items-center justify-center">
                              <Image
                                src={slide.illustration}
                                alt={slide.headline}
                                width={190}
                                height={190}
                                priority
                                className="w-full h-auto object-contain drop-shadow-xs select-none"
                              />
                            </div>
                          )}

                          <div className="flex-1 text-center sm:text-left space-y-2 sm:space-y-2.5 max-w-xl">
                            {slide.badge && (
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold tracking-wide uppercase bg-black/5 dark:bg-white/10 text-[#171717] dark:text-white">
                                <BadgeIcon className="w-3 h-3" />
                                <span>{slide.badge}</span>
                              </div>
                            )}

                            <h1 className="text-[20px] sm:text-[24px] lg:text-[27px] font-extrabold tracking-[-0.025em] leading-[1.18] text-[#171717] dark:text-white">
                              {slide.headline}
                            </h1>

                            {slide.description && (
                              <p className="text-[12.5px] sm:text-[13px] leading-relaxed font-normal max-w-lg text-[#5B636E] dark:text-neutral-300">
                                {slide.description}
                              </p>
                            )}

                            <div className="pt-1 flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                              <Link
                                href={slide.ctaUrl || "/explore"}
                                className="radius-native inline-flex items-center gap-1.5 rounded-xl bg-[#171717] hover:bg-[#262626] dark:bg-[#FFC928] dark:hover:bg-[#F2BD24] text-white dark:text-[#171717] px-4 py-2 text-[12px] sm:text-[12.5px] font-bold shadow-xs transition-colors cursor-pointer"
                              >
                                <span>{slide.ctaLabel}</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </Link>

                              {slide.secondaryCtaLabel && slide.secondaryCtaUrl && (
                                <Link
                                  href={slide.secondaryCtaUrl}
                                  className="radius-native inline-flex items-center gap-1.5 rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white/70 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 text-[#171717] dark:text-white px-3.5 py-2 text-[12px] sm:text-[12.5px] font-bold transition-colors cursor-pointer"
                                >
                                  <span>{slide.secondaryCtaLabel}</span>
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Carousel Controls: Left / Right Arrows & Animated Progress Countdown Counter */}
            {slideCount > 1 && (
              <div
                className="absolute bottom-3 right-3 sm:bottom-4 sm:right-6 z-20 flex items-center gap-2"
                role="region"
                aria-label="Carousel navigation"
              >
                {/* Button 1: Left Arrow ( ← ) */}
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Previous banner"
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#1E2024]/90 hover:bg-[#2A2D33] text-white flex items-center justify-center transition-all shadow-md active:scale-95 cursor-pointer backdrop-blur-sm border border-white/10"
                >
                  <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" strokeWidth={2.2} />
                </button>

                {/* Button 2: Right Arrow ( → ) */}
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Next banner"
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#1E2024]/90 hover:bg-[#2A2D33] text-white flex items-center justify-center transition-all shadow-md active:scale-95 cursor-pointer backdrop-blur-sm border border-white/10"
                >
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" strokeWidth={2.2} />
                </button>

                {/* Button 3: Progress Ring with Two-Digit Counter ( 00 ) */}
                <button
                  type="button"
                  onClick={() => setIsPaused((prev) => !prev)}
                  title={isPaused ? "Resume autoplay" : "Pause autoplay"}
                  aria-label={`Slide ${currentIndex + 1} of ${slideCount}. Click to ${isPaused ? "play" : "pause"}`}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#1E2024]/90 hover:bg-[#2A2D33] flex items-center justify-center relative cursor-pointer shadow-md active:scale-95 transition-all backdrop-blur-sm border border-white/10"
                >
                  <svg
                    className="w-full h-full -rotate-90 absolute inset-0 pointer-events-none p-[2px]"
                    viewBox="0 0 36 36"
                  >
                    {/* Background Track Circle */}
                    <circle
                      cx="18"
                      cy="18"
                      r="15"
                      fill="none"
                      stroke="rgba(255, 255, 255, 0.15)"
                      strokeWidth="2"
                    />
                    {/* Animated Sky Blue Progress Ring */}
                    <circle
                      cx="18"
                      cy="18"
                      r="15"
                      fill="none"
                      stroke="#38BDF8"
                      strokeWidth="2"
                      strokeDasharray="94.25"
                      strokeDashoffset={94.25 - (94.25 * Math.min(progress, 100)) / 100}
                      strokeLinecap="round"
                      className="transition-[stroke-dashoffset] duration-75 ease-linear"
                    />
                  </svg>
                  <span className="text-[11px] sm:text-[12px] font-mono font-bold text-white relative z-10 tabular-nums select-none tracking-tight">
                    {String(currentIndex).padStart(2, "0")}
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Features Card */}
          <div className="hidden lg:flex radius-native w-full lg:w-[260px] xl:w-[275px] shrink-0 rounded-2xl bg-white dark:bg-[#14161D] border border-[#ECEEF2] dark:border-white/10 shadow-[0_6px_24px_rgba(15,23,42,0.035)] p-4 sm:p-5 flex-col justify-between">
            {/* Card Header */}
            <div className="flex items-center justify-between pb-2">
              <h2 className="text-[13.5px] font-bold text-[#171717] dark:text-white tracking-[-0.01em]">
                Features
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F5F6F8] dark:bg-white/5 text-[#8C929C]">
                Ready &amp; Preview
              </span>
            </div>

            {/* Items List */}
            <div className="divide-y divide-[#F1F3F6] dark:divide-white/5 flex-1 flex flex-col justify-center">
              {FEATURE_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className="group flex items-center justify-between py-2.5 first:pt-1.5 last:pb-0.5 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="radius-native w-8 h-8 rounded-full bg-[#F5F6F8] dark:bg-white/5 flex items-center justify-center text-[#22252A] dark:text-neutral-200 group-hover:bg-[#FFE182]/40 transition-colors shrink-0">
                        <Icon className="w-[15px] h-[15px]" strokeWidth={1.8} />
                      </div>
                      <div>
                        <p className="text-[12.5px] font-semibold text-[#171717] dark:text-white leading-tight">
                          {item.title}
                        </p>
                        <p className="text-[11.5px] font-medium text-[#68707A] dark:text-neutral-400 mt-0.5">
                          {item.subtitle}
                        </p>
                      </div>
                    </div>

                    {item.isReady ? (
                      <span
                        title="Feature ready to use"
                        className="radius-native w-4 h-4 rounded-full bg-[#22C55E] flex items-center justify-center shrink-0"
                      >
                        <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                      </span>
                    ) : (
                      <span
                        title="Feature in development - Coming soon"
                        className="radius-native px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/25 flex items-center gap-1 shrink-0"
                      >
                        <Clock className="w-2.5 h-2.5 stroke-[2.2]" />
                        <span>Soon</span>
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
