"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronRight,
  ArrowRight,
  Tag,
  Store,
  Megaphone,
  Clock,
  Sparkles,
  Check,
} from "lucide-react";
import type { PublicBannerDTO } from "@/lib/bannerService";

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

export function RebrandHero() {
  const [activeBanner, setActiveBanner] = useState<PublicBannerDTO | null>(null);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchHeroBanner() {
      try {
        const res = await fetch("/api/banners/active?placement=homepage_hero", {
          // Allow HTTP caching via Next.js
          next: { revalidate: 60 },
        });
        if (res.ok) {
          const json = await res.json();
          if (isMounted && json.success && json.data) {
            setActiveBanner(json.data);
            setImageFailed(false);
          }
        }
      } catch {
        // Fallback to default hero silently on network error
      }
    }

    fetchHeroBanner();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section
      style={{ fontFamily: "var(--font-plus-jakarta), sans-serif" }}
      className="w-full"
    >
      <div className="max-w-[1380px] mx-auto px-4 sm:px-8 lg:px-12 pt-4 sm:pt-6 pb-3 sm:pb-5">
        <div className="flex flex-col lg:flex-row items-stretch gap-5 lg:gap-6">
          {/* Left Column: Categories Navigation (Desktop only; packed into hamburger on mobile) */}
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

          {/* Center Column: Main Promotional Hero Banner */}
          {activeBanner ? (
            <div className="radius-native relative overflow-hidden flex-1 rounded-2xl bg-gradient-to-br from-[#FFE182] via-[#FFD54F] to-[#FFC928] dark:from-[#F5C84C] dark:via-[#E5B537] dark:to-[#D4A325] text-[#171717] min-h-[180px] sm:min-h-[255px] p-5 sm:p-8 flex flex-col justify-center">
              {/* Optional Responsive Background / Accompanying Image */}
              {activeBanner.imageUrl && !imageFailed && (
                <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
                  <picture>
                    {activeBanner.mobileImageUrl && (
                      <source
                        media="(max-width: 640px)"
                        srcSet={activeBanner.mobileImageUrl}
                      />
                    )}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={activeBanner.imageUrl}
                      alt={activeBanner.imageAlt || activeBanner.headline}
                      onError={() => setImageFailed(true)}
                      className="w-full h-full object-cover object-right opacity-30 sm:opacity-40 mix-blend-multiply transition-opacity duration-300"
                    />
                  </picture>
                  {/* Gradient mask to preserve high contrast for text on the left */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#FFE182] via-[#FFE182]/80 to-transparent dark:from-[#F5C84C] dark:via-[#F5C84C]/85" />
                </div>
              )}

              {/* Text & Action Content (Fully accessible and separate from image) */}
              <div className="relative z-10 max-w-[480px]">
                <h1 className="text-[21px] sm:text-[27px] lg:text-[29px] font-bold tracking-[-0.025em] text-[#171717] leading-[1.15]">
                  {activeBanner.headline}
                </h1>

                {activeBanner.description && (
                  <p className="mt-1.5 sm:mt-2 text-[13px] sm:text-[14px] font-normal text-[#262626] leading-[1.5]">
                    {activeBanner.description}
                  </p>
                )}

                <div className="mt-3.5 sm:mt-5">
                  <Link
                    href={activeBanner.ctaUrl}
                    className="radius-native inline-flex items-center gap-1.5 rounded-xl bg-[#1A1A1A] hover:bg-[#2B2B2B] text-white px-4 py-2 text-[12px] sm:text-[12.5px] font-semibold transition-colors shadow-xs"
                  >
                    <span>{activeBanner.ctaLabel}</span>
                    <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            /* Welcome to the Hive Community Hero Banner */
            <div className="radius-native relative overflow-hidden flex-1 rounded-2xl bg-white/70 dark:bg-white/[0.04] border border-[#ECEEF2] dark:border-white/10 shadow-[0_4px_24px_rgba(15,23,42,0.035)] backdrop-blur-md p-5 sm:p-6 lg:p-7 flex flex-col sm:flex-row items-center gap-5 sm:gap-7 transition-colors min-h-[180px] sm:min-h-[255px]">
              {/* Soft Ambient Background Glow */}
              <div
                aria-hidden="true"
                className="absolute -left-10 -top-10 w-44 h-44 rounded-full bg-[#FFC928]/15 dark:bg-[#FFC928]/5 blur-2xl pointer-events-none"
              />

              {/* Left: Illustration */}
              <div className="relative shrink-0 w-[130px] sm:w-[155px] md:w-[180px] lg:w-[205px] flex items-center justify-center">
                <Image
                  src="/Welcome-cuate.svg"
                  alt="Welcome to the hive community"
                  width={210}
                  height={210}
                  priority
                  className="w-full h-auto object-contain drop-shadow-xs select-none"
                />
              </div>

              {/* Right: Text and Actions */}
              <div className="relative z-10 flex-1 text-center sm:text-left space-y-2 sm:space-y-2.5 min-w-0">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FFC928]/15 dark:bg-[#FFC928]/20 border border-[#FFC928]/30 text-[#A06E00] dark:text-[#FFC928] text-[10.5px] font-bold tracking-wide uppercase">
                  <Sparkles className="w-3 h-3" />
                  <span>Campus Community</span>
                </div>

                <h1 className="text-[20px] sm:text-[23px] lg:text-[26px] font-extrabold text-[#171717] dark:text-white tracking-[-0.025em] leading-[1.2]">
                  Welcome to the Hive community
                </h1>

                <p className="text-[12.5px] sm:text-[13px] text-[#5B636E] dark:text-neutral-300 leading-relaxed font-normal">
                  Your student marketplace to discover deals, buy &amp; sell gear, and connect safely across campus.
                </p>

                <div className="pt-1 flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                  <Link
                    href="/explore"
                    className="radius-native inline-flex items-center gap-1.5 rounded-xl bg-[#171717] hover:bg-[#262626] dark:bg-[#FFC928] dark:hover:bg-[#F2BD24] text-white dark:text-[#171717] px-4 py-2 text-[12px] sm:text-[12.5px] font-bold shadow-xs transition-colors"
                  >
                    <span>Explore Marketplace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <Link
                    href="/listings/create"
                    className="radius-native inline-flex items-center gap-1.5 rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white/80 dark:bg-white/5 hover:border-[#171717] dark:hover:border-white/30 text-[#171717] dark:text-white px-3.5 py-2 text-[12px] sm:text-[12.5px] font-bold transition-colors"
                  >
                    <span>Post a Listing</span>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Right Column: Compact "Features" Card with Ready Ticks & Pending Indicators */}
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

                    {/* Indicator: Green Check for Ready, Amber Clock for Coming Soon */}
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
