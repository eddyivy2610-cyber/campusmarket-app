"use client";

import React from "react";
import Link from "next/link";
import {
  ChevronRight,
  ArrowRight,
  Tag,
  Store,
  Megaphone,
  Check,
} from "lucide-react";

const HERO_CATEGORIES = [
  { label: "Electronics", href: "/explore?category=Electronics" },
  { label: "Fashion", href: "/explore?category=Fashion" },
  { label: "Books", href: "/explore?category=Books%20%26%20Academic%20Supplies" },
  { label: "Hostel", href: "/explore?category=Hostel%20Essentials" },
  { label: "Services", href: "/explore?category=Services" },
  { label: "More...", href: "/explore" },
];

const AROUND_CAMPUS_ITEMS = [
  {
    id: "sell",
    title: "Sell",
    price: "Post a listing",
    href: "/listings/create",
    icon: Tag,
  },
  {
    id: "storefront",
    title: "Storefront",
    price: "Manage your store",
    href: "/stores?view=storefront",
    icon: Store,
  },
  {
    id: "ads",
    title: "Ads",
    price: "Promote on campus",
    href: "/promotions/request",
    icon: Megaphone,
  },
];

export function RebrandHero() {
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
          <div className="radius-native flex-1 rounded-2xl bg-[#FFE182] dark:bg-[#F5C84C] text-[#171717] min-h-[180px] sm:min-h-[255px] p-5 sm:p-8 flex flex-col justify-center">
            <div className="max-w-[440px]">
              <h1 className="text-[21px] sm:text-[27px] lg:text-[29px] font-bold tracking-[-0.025em] text-[#171717] leading-[1.15]">
                Aspire Elevation.
              </h1>

              <p className="mt-1.5 sm:mt-2 text-[13px] sm:text-[14px] font-normal text-[#262626] leading-[1.5]">
                Discover deals, businesses, and opportunities around your campus.
              </p>

              <div className="mt-3.5 sm:mt-5">
                <Link
                  href="/explore"
                  className="radius-native inline-flex items-center gap-1.5 rounded-xl bg-[#1A1A1A] hover:bg-[#2B2B2B] text-white px-4 py-2 text-[12px] sm:text-[12.5px] font-semibold transition-colors"
                >
                  <span>Explore now</span>
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column: Compact "Around your campus" Card (Desktop only; packed into hamburger on mobile) */}
          <div className="hidden lg:flex radius-native w-full lg:w-[260px] xl:w-[275px] shrink-0 rounded-2xl bg-white dark:bg-[#14161D] border border-[#ECEEF2] dark:border-white/10 shadow-[0_6px_24px_rgba(15,23,42,0.035)] p-4 sm:p-5 flex-col justify-between">
            {/* Card Header */}
            <div className="flex items-center justify-between pb-2">
              <h2 className="text-[13.5px] font-bold text-[#171717] dark:text-white tracking-[-0.01em]">
                Around your campus
              </h2>
              <Link
                href="/explore"
                aria-label="Explore all campus items"
                className="radius-native w-6 h-6 rounded-full flex items-center justify-center text-[#5B636E] hover:text-[#171717] dark:text-neutral-400 dark:hover:text-white hover:bg-[#F3F4F6] dark:hover:bg-white/10 transition-colors"
              >
                <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.8} />
              </Link>
            </div>

            {/* Items List */}
            <div className="divide-y divide-[#F1F3F6] dark:divide-white/5 flex-1 flex flex-col justify-center">
              {AROUND_CAMPUS_ITEMS.map((item) => {
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
                          {item.price}
                        </p>
                      </div>
                    </div>

                    {/* Green Verification Check */}
                    <span
                      title="Verified campus listing"
                      className="radius-native w-3.5 h-3.5 rounded-full bg-[#22C55E] flex items-center justify-center shrink-0"
                    >
                      <Check className="w-2 h-2 text-white" strokeWidth={3} />
                    </span>
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
