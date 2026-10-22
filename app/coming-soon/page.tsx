"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Clock, ArrowLeft, Compass, Sparkles } from "lucide-react";
import { RebrandHeader } from "../components/header/RebrandHeader";
import { RebrandFooter } from "../components/sections/RebrandFooter";

function ComingSoonContent() {
  const searchParams = useSearchParams();
  const featureParam = searchParams.get("feature");

  let featureTitle = "This feature";
  let featureDescription =
    "We are currently finalizing this feature for campus students. It will be available in an upcoming release.";

  if (featureParam === "sell") {
    featureTitle = "Listing Creation";
    featureDescription =
      "The direct student listing composer is receiving polish and safety verifications before launch. You can browse active listings on Explore in the meantime.";
  } else if (featureParam === "storefront") {
    featureTitle = "Storefront Management";
    featureDescription =
      "Campus business and student store management tools are being upgraded. Verified sellers will be able to manage inventory and view insights soon.";
  } else if (featureParam === "ads") {
    featureTitle = "Campus Promotions & Ads";
    featureDescription =
      "Campus billboard and banner placements for student businesses and campus events are currently in testing and will open soon.";
  }

  return (
    <div
      style={{ fontFamily: "var(--font-plus-jakarta), sans-serif" }}
      className="min-h-screen flex flex-col bg-[#F7F8FA] dark:bg-[#0E1015] text-[#171717] dark:text-white antialiased"
    >
      <RebrandHeader />

      <main className="flex-1 flex items-center justify-center px-4 py-16 sm:py-24">
        <div className="w-full max-w-lg rounded-3xl border border-[#ECEEF2] dark:border-white/10 bg-white dark:bg-[#14161D] p-6 sm:p-10 shadow-[0_4px_30px_rgba(15,23,42,0.04)] text-center relative overflow-hidden">
          {/* Subtle Accent Glow */}
          <div
            aria-hidden="true"
            className="absolute -top-12 -left-12 w-44 h-44 rounded-full bg-[#FFC928]/15 dark:bg-[#FFC928]/5 blur-2xl pointer-events-none"
          />

          {/* Icon */}
          <div className="mx-auto mb-5 w-14 h-14 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Clock className="w-7 h-7 stroke-[2]" />
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 text-[11px] font-bold tracking-wide uppercase mb-3">
            <Sparkles className="w-3 h-3" />
            <span>Feature in Development</span>
          </div>

          {/* Heading */}
          <h1 className="text-[22px] sm:text-[26px] font-extrabold text-[#171717] dark:text-white tracking-[-0.02em] leading-tight mb-2.5">
            {featureTitle} is coming soon
          </h1>

          {/* Description */}
          <p className="text-[13.5px] text-[#5B636E] dark:text-neutral-300 leading-relaxed max-w-md mx-auto mb-8 font-normal">
            {featureDescription}
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/home"
              className="radius-native w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#171717] hover:bg-[#262626] dark:bg-[#FFC928] dark:hover:bg-[#F2BD24] text-white dark:text-[#171717] px-5 py-2.5 text-[13px] font-bold shadow-xs transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back Home</span>
            </Link>

            <Link
              href="/explore"
              className="radius-native w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-white/5 hover:border-[#171717] dark:hover:border-white/30 text-[#171717] dark:text-white px-5 py-2.5 text-[13px] font-bold transition-colors"
            >
              <Compass className="w-4 h-4" />
              <span>Explore Marketplace</span>
            </Link>
          </div>
        </div>
      </main>

      <RebrandFooter />
    </div>
  );
}

export default function ComingSoonPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F7F8FA] dark:bg-[#0E1015]">
          <div className="w-6 h-6 border-2 border-[#FFC928] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ComingSoonContent />
    </Suspense>
  );
}
