"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export function WelcomeBanner() {
  return (
    <section
      aria-label="Welcome to the Hive Community"
      style={{ fontFamily: "var(--font-plus-jakarta), sans-serif" }}
      className="w-full max-w-[1380px] mx-auto px-4 sm:px-8 lg:px-12 my-3 sm:my-5"
    >
      <div className="radius-native relative overflow-hidden rounded-2xl border border-[#ECEEF2] dark:border-white/10 bg-white/40 dark:bg-white/[0.03] backdrop-blur-md p-4 sm:p-6 lg:p-7 flex flex-col sm:flex-row items-center gap-5 sm:gap-8 lg:gap-10 transition-colors">
        {/* Subtle Ambient Background Highlight that adapts to themes */}
        <div
          aria-hidden="true"
          className="absolute -left-12 -top-12 w-48 h-48 rounded-full bg-[#FFC928]/10 dark:bg-[#FFC928]/5 blur-2xl pointer-events-none"
        />

        {/* Left: Illustration */}
        <div className="relative shrink-0 w-[130px] sm:w-[160px] md:w-[190px] lg:w-[220px] flex items-center justify-center">
          <Image
            src="/Welcome-cuate.svg"
            alt="Welcome to the hive community"
            width={220}
            height={220}
            priority
            className="w-full h-auto object-contain drop-shadow-xs select-none"
          />
        </div>

        {/* Right: Text Content */}
        <div className="relative z-10 flex-1 text-center sm:text-left space-y-2 sm:space-y-2.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FFC928]/15 dark:bg-[#FFC928]/20 border border-[#FFC928]/30 text-[#B27D00] dark:text-[#FFC928] text-[11px] font-bold tracking-wide uppercase">
            <Sparkles className="w-3 h-3" />
            <span>Campus Marketplace</span>
          </div>

          <h2 className="text-[20px] sm:text-[24px] lg:text-[27px] font-extrabold text-[#171717] dark:text-white tracking-[-0.025em] leading-[1.2]">
            Welcome to the hive community
          </h2>

          <p className="text-[13px] sm:text-[13.5px] text-[#5B636E] dark:text-neutral-300 max-w-2xl leading-relaxed font-normal">
            Your verified campus marketplace to discover student deals, buy & sell textbooks or gadgets, and support student-owned businesses across campus.
          </p>

          {/* Quick CTA Actions */}
          <div className="pt-1 flex flex-wrap items-center justify-center sm:justify-start gap-2.5 sm:gap-3">
            <Link
              href="/explore"
              className="radius-native inline-flex items-center gap-1.5 rounded-xl bg-[#171717] hover:bg-[#262626] dark:bg-[#FFC928] dark:hover:bg-[#F2BD24] text-white dark:text-[#171717] px-4 py-2 text-[12.5px] font-bold shadow-xs transition-all active:scale-[0.99] cursor-pointer"
            >
              <span>Explore Marketplace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              href="/listings/create"
              className="radius-native inline-flex items-center gap-1.5 rounded-xl border border-[#E4E7EC] dark:border-white/15 bg-white/70 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 text-[#171717] dark:text-white px-3.5 py-2 text-[12.5px] font-semibold transition-colors cursor-pointer"
            >
              <span>Post a Listing</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
