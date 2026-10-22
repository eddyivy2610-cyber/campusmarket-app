"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import type { PublicBannerDTO } from "@/lib/bannerService";

interface PromotionalStripProps {
  placement?: "promo_strip" | "category_promo";
  category?: string;
  className?: string;
}

export function PromotionalStrip({
  placement = "promo_strip",
  category,
  className = "",
}: PromotionalStripProps) {
  const [banners, setBanners] = useState<PublicBannerDTO[]>([]);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let isMounted = true;
    async function loadPromos() {
      try {
        const params = new URLSearchParams({ placement });
        if (category) params.set("category", category);
        const res = await fetch(`/api/banners/active?${params.toString()}`);
        if (res.ok) {
          const json = await res.json();
          if (isMounted && json.success && Array.isArray(json.data)) {
            setBanners(json.data);
          }
        }
      } catch {
        // Silently omit on failure
      }
    }
    loadPromos();
    return () => {
      isMounted = false;
    };
  }, [placement, category]);

  if (banners.length === 0) return null;

  return (
    <div
      className={`w-full max-w-[1380px] mx-auto px-4 sm:px-8 lg:px-12 py-3 sm:py-4 ${className}`}
    >
      <div
        className={`grid gap-4 ${
          banners.length === 1
            ? "grid-cols-1"
            : banners.length === 2
            ? "grid-cols-1 md:grid-cols-2"
            : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        }`}
      >
        {banners.map((b) => {
          const hasImage = b.imageUrl && !failedImages[b.id];
          return (
            <div
              key={b.id}
              className="radius-native group relative overflow-hidden rounded-2xl bg-white dark:bg-[#14161D] border border-[#ECEEF2] dark:border-white/10 p-5 flex flex-col justify-between shadow-[0_4px_20px_rgba(15,23,42,0.03)] hover:border-[#FFC928]/60 transition-all duration-200"
            >
              {hasImage && (
                <div className="absolute inset-0 pointer-events-none opacity-20 dark:opacity-15 group-hover:opacity-25 transition-opacity overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={b.imageUrl}
                    alt={b.imageAlt || b.headline}
                    onError={() =>
                      setFailedImages((prev) => ({ ...prev, [b.id]: true }))
                    }
                    className="w-full h-full object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-[#14161D] via-transparent to-transparent" />
                </div>
              )}

              <div className="relative z-10">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#B45309] dark:text-[#FFC928] uppercase tracking-wider mb-1.5">
                  <Sparkles className="w-3 h-3" />
                  <span>Campus Highlight</span>
                </div>
                <h3 className="text-[16px] sm:text-[17px] font-bold text-[#171717] dark:text-white tracking-tight leading-snug">
                  {b.headline}
                </h3>
                {b.description && (
                  <p className="mt-1 text-[13px] text-[#5B636E] dark:text-neutral-300 line-clamp-2">
                    {b.description}
                  </p>
                )}
              </div>

              <div className="relative z-10 mt-4 pt-3 border-t border-[#F1F3F6] dark:border-white/5 flex items-center justify-between">
                <span className="text-[12.5px] font-bold text-[#171717] dark:text-white group-hover:text-[#B45309] dark:group-hover:text-[#FFC928] transition-colors">
                  {b.ctaLabel}
                </span>
                <Link
                  href={b.ctaUrl}
                  className="radius-native w-7 h-7 rounded-full bg-[#FFC928] group-hover:bg-[#F2BD1E] text-[#171717] flex items-center justify-center transition-transform group-hover:translate-x-0.5"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
