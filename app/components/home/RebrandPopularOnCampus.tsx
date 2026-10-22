"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Heart, MapPin, Check, ChevronRight } from "lucide-react";

interface PopularCampusItem {
  id: string;
  title: string;
  landmark: string;
  priceFormatted: string;
  condition: string;
  conditionTone: "neutral" | "green";
  hasMorePhotos?: boolean;
  href: string;
  imageUrl: string;
  imageAlt: string;
}

export function RebrandPopularOnCampus() {
  const [items, setItems] = useState<PopularCampusItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedIds, setSavedIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let isMounted = true;
    async function loadPopularListings() {
      try {
        const res = await fetch("/api/listings?limit=8&status=active");
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data) && isMounted) {
            const mapped: PopularCampusItem[] = json.data.map((l: any) => ({
              id: l._id || l.id,
              title: l.title || "Campus Item",
              landmark: l.landmark || l.campus || "On Campus",
              priceFormatted: `₦${Number(l.price || 0).toLocaleString()}`,
              condition: l.condition || "Good",
              conditionTone: l.condition === "Like New" || l.condition === "Brand New" ? "green" : "neutral",
              hasMorePhotos: Array.isArray(l.images) && l.images.length > 1,
              href: `/listings/${l.slug || l._id || l.id}`,
              imageUrl: l.images?.[0] || "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80",
              imageAlt: l.title || "Campus Item",
            }));
            setItems(mapped);
          }
        }
      } catch (err) {
        console.error("Failed to load popular listings:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadPopularListings();
    return () => {
      isMounted = false;
    };
  }, []);

  const toggleSave = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSavedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <section
      style={{ fontFamily: "var(--font-plus-jakarta), sans-serif" }}
      className="w-full py-3.5 sm:py-6"
    >
      <div className="max-w-[1380px] mx-auto px-4 sm:px-8 lg:px-12">
        {/* Section Header with Horizontal Divider */}
        <div className="flex items-center justify-between gap-4 mb-3.5 sm:mb-5">
          <h2 className="text-[16.5px] sm:text-[20px] font-bold tracking-[-0.02em] text-[#14171A] dark:text-white shrink-0">
            Popular on campus
          </h2>

          <div
            className="hidden sm:block flex-1 h-[1px] bg-[#E8EAEE] dark:bg-white/10"
            aria-hidden="true"
          />

          <Link
            href="/explore"
            className="inline-flex items-center gap-1 text-[12.5px] sm:text-[13px] font-semibold text-[#D99B00] sm:text-[#22252A] dark:text-[#FFC928] sm:dark:text-neutral-300 hover:text-[#171717] dark:hover:text-white shrink-0 transition-colors"
          >
            <span>See All</span>
            <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
          </Link>
        </div>

        {/* Horizontal Scroll (~2.4 cards per screen) on Mobile, 4-Column Grid on Desktop */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 py-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-48 rounded-2xl bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="py-8 text-center text-neutral-500 dark:text-neutral-400 text-sm">
            No active listings found on campus right now.
          </div>
        ) : (
          <div className="flex lg:grid lg:grid-cols-4 overflow-x-auto lg:overflow-visible snap-x snap-mandatory gap-3 sm:gap-4 lg:gap-5 pb-2 lg:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none">
            {items.map((item) => {
              const isSaved = Boolean(savedIds[item.id]);

            return (
              <div
                key={item.id}
                className="radius-native w-[42vw] min-w-[152px] max-w-[185px] sm:w-[220px] sm:max-w-none lg:w-auto lg:min-w-0 shrink-0 snap-start group rounded-2xl bg-white dark:bg-[#14161D] border border-[#ECEEF2] dark:border-white/10 p-2.5 sm:p-3 shadow-[0_4px_20px_rgba(15,23,42,0.025)] hover:shadow-[0_8px_28px_rgba(15,23,42,0.06)] transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  {/* Product Image Container */}
                  <div className="radius-native relative h-[118px] sm:h-[160px] w-full rounded-xl bg-[#F6F7F9] dark:bg-white/5 overflow-hidden flex items-center justify-center">
                    <Link
                      href={item.href}
                      className="w-full h-full flex items-center justify-center"
                    >
                      <img
                        src={item.imageUrl}
                        alt={item.imageAlt}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </Link>

                    {/* Top-Right Condition Badge + Save Button Stack */}
                    <div className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 flex flex-col items-end gap-1.5 z-10">
                      <div className="flex items-center gap-1">
                        <span
                          className={`radius-native inline-flex items-center px-2 py-0.5 rounded-full text-[9.5px] sm:text-[10.5px] font-semibold leading-tight shadow-xs ${
                            item.conditionTone === "green"
                              ? "bg-[#E6F8EC] text-[#15803D] dark:bg-emerald-500/20 dark:text-emerald-300"
                              : "bg-[#EDEEF2]/95 text-[#4A5058] dark:bg-neutral-800/90 dark:text-neutral-300"
                          }`}
                        >
                          {item.condition}
                        </span>
                        {item.hasMorePhotos && (
                          <span
                            className="hidden sm:inline text-[#68707A] dark:text-neutral-400"
                            aria-hidden="true"
                          >
                            <ChevronRight className="w-3.5 h-3.5" strokeWidth={2} />
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={(e) => toggleSave(item.id, e)}
                        aria-label={
                          isSaved ? `Remove ${item.title} from saved` : `Save ${item.title}`
                        }
                        aria-pressed={isSaved}
                        className="radius-native w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/85 dark:bg-black/40 backdrop-blur-xs flex items-center justify-center text-[#5B636E] hover:text-[#171717] dark:text-neutral-300 transition-colors cursor-pointer"
                      >
                        <Heart
                          className={`w-3 h-3 sm:w-3.5 sm:h-3.5 transition-colors ${
                            isSaved ? "fill-rose-500 text-rose-500" : ""
                          }`}
                          strokeWidth={1.8}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Product Title & Landmark */}
                  <div className="pt-2 sm:pt-3 px-0.5">
                    <Link href={item.href}>
                      <h3 className="text-[12.5px] sm:text-[13.5px] font-bold text-[#171717] dark:text-white leading-snug truncate group-hover:text-[#14171A]">
                        {item.title}
                      </h3>
                    </Link>

                    <div className="mt-0.5 sm:mt-1 flex items-center gap-1 text-[10.5px] sm:text-[11.5px] font-medium text-[#68707A] dark:text-neutral-400">
                      <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" strokeWidth={2} />
                      <span className="truncate">{item.landmark}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Row: Price + Verified Check + View Item Action */}
                <div className="mt-2 sm:mt-3 pt-1 px-0.5 flex items-center justify-between gap-1.5">
                  <Link href={item.href} className="min-w-0">
                    <span className="text-[13.5px] sm:text-[15px] font-extrabold text-[#14171A] dark:text-white tracking-[-0.015em]">
                      {item.priceFormatted}
                    </span>
                  </Link>

                  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    <span
                      title="Verified campus seller"
                      className="radius-native w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-[#22C55E] flex items-center justify-center shrink-0"
                    >
                      <Check className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-white" strokeWidth={3} />
                    </span>

                    <Link
                      href={item.href}
                      className="hidden sm:inline-flex radius-native items-center gap-1 rounded-lg border border-[#E4E7EC] dark:border-white/15 bg-white dark:bg-white/5 hover:bg-[#F7F8FA] dark:hover:bg-white/10 px-2.5 py-1 text-[11.5px] font-semibold text-[#171717] dark:text-white transition-colors"
                    >
                      <span>View item</span>
                      <ArrowRight className="w-3 h-3" strokeWidth={2} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
          </div>
        )}
      </div>
    </section>
  );
}
