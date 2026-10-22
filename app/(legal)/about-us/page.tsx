"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  GraduationCap,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  MapPin,
  CheckCircle2,
  Users,
  Repeat,
} from "lucide-react";
import { RebrandHeader } from "../../components/header/RebrandHeader";
import { RebrandFooter } from "../../components/sections/RebrandFooter";

export default function AboutUsPage() {
  return (
    <div
      style={{ fontFamily: "var(--font-plus-jakarta), sans-serif" }}
      className="min-h-screen flex flex-col bg-[#F7F8FA] dark:bg-[#0E1015] text-[#171717] dark:text-white antialiased"
    >
      <RebrandHeader />

      <main className="flex-1 w-full max-w-[1380px] mx-auto px-5 sm:px-8 lg:px-12 pt-7 pb-16">
        {/* Section Header with Divider Line matching Explore / Radar */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-[18px] sm:text-[20px] font-bold tracking-[-0.02em] text-[#14171A] dark:text-white shrink-0">
              About Campus Hive
            </h1>
            <p className="text-[12.5px] text-[#8C929C] dark:text-neutral-400 mt-0.5 font-normal">
              The trusted peer-to-peer student commerce ecosystem built for Nigerian universities.
            </p>
          </div>

          <div
            className="hidden sm:block flex-1 h-[1px] bg-[#E8EAEE] dark:bg-white/10"
            aria-hidden="true"
          />

          <Link
            href="/explore"
            className="radius-native inline-flex items-center gap-1.5 rounded-lg border border-[#E4E7EC] dark:border-white/15 bg-white dark:bg-white/5 hover:bg-[#F7F8FA] dark:hover:bg-white/10 px-3 py-1.5 text-[12px] font-semibold text-[#171717] dark:text-white shrink-0 transition-colors cursor-pointer"
          >
            <span>Browse Items</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Content Container */}
        <div className="space-y-6">
          {/* Mission Hero Banner */}
          <div className="radius-native rounded-2xl border border-[#ECEEF2] dark:border-white/10 bg-white dark:bg-[#14161D] p-6 sm:p-8 md:p-10 shadow-xs relative overflow-hidden">
            <div className="max-w-3xl space-y-4">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#FFC928]/20 text-[#171717] dark:text-[#FFC928] border border-[#FFC928]/40">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Our Purpose & Campus Vision</span>
              </span>

              <h2 className="text-[22px] sm:text-[26px] font-extrabold text-[#171717] dark:text-white tracking-[-0.02em] leading-snug">
                Building a safer, affordable, and circular marketplace on every campus.
              </h2>

              <p className="text-[13.5px] text-[#5B636E] dark:text-neutral-300 leading-relaxed">
                Campus Hive was created to solve a problem every university student knows too well: fragmented WhatsApp groups, sketchy off-campus transactions, and overpriced hostel essentials. We provide a single, dedicated platform where verified students can safely buy, sell, exchange textbooks, and find reliable student services within their own institution.
              </p>
            </div>
          </div>

          {/* 4 Pillars Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="radius-native rounded-2xl border border-[#ECEEF2] dark:border-white/10 bg-white dark:bg-[#14161D] p-5 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#FFC928]/20 flex items-center justify-center text-[#171717] dark:text-[#FFC928]">
                <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
              </div>
              <h3 className="text-[14.5px] font-bold text-[#171717] dark:text-white">
                Institutional Verification
              </h3>
              <p className="text-[12.5px] text-[#68707A] dark:text-neutral-400 leading-relaxed">
                Every member is verified via institutional email and student status, filtering out anonymous bad actors and external scammers.
              </p>
            </div>

            <div className="radius-native rounded-2xl border border-[#ECEEF2] dark:border-white/10 bg-white dark:bg-[#14161D] p-5 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <MapPin className="w-5 h-5 stroke-[2.2]" />
              </div>
              <h3 className="text-[14.5px] font-bold text-[#171717] dark:text-white">
                Campus Safe Zones
              </h3>
              <p className="text-[12.5px] text-[#68707A] dark:text-neutral-400 leading-relaxed">
                All physical deal handoffs are organized around public, well-lit campus landmarks like the library lobby, faculty complexes, and student centres.
              </p>
            </div>

            <div className="radius-native rounded-2xl border border-[#ECEEF2] dark:border-white/10 bg-white dark:bg-[#14161D] p-5 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Repeat className="w-5 h-5 stroke-[2.2]" />
              </div>
              <h3 className="text-[14.5px] font-bold text-[#171717] dark:text-white">
                Circular Campus Economy
              </h3>
              <p className="text-[12.5px] text-[#68707A] dark:text-neutral-400 leading-relaxed">
                Course textbooks, lab coats, laptops, and room furniture transition seamlessly from graduating seniors to incoming freshmen at honest rates.
              </p>
            </div>

            <div className="radius-native rounded-2xl border border-[#ECEEF2] dark:border-white/10 bg-white dark:bg-[#14161D] p-5 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 stroke-[2.2]" />
              </div>
              <h3 className="text-[14.5px] font-bold text-[#171717] dark:text-white">
                Student Enterprise Hub
              </h3>
              <p className="text-[12.5px] text-[#68707A] dark:text-neutral-400 leading-relaxed">
                Supporting student entrepreneurs, tech repairers, graphics designers, and vendors with free storefronts and verified badges.
              </p>
            </div>
          </div>

          {/* Community Standards Banner */}
          <div className="radius-native rounded-2xl border border-[#ECEEF2] dark:border-white/10 bg-white dark:bg-[#14161D] p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1.5 max-w-2xl">
              <h3 className="text-[16px] font-extrabold text-[#171717] dark:text-white">
                Integrity, Trust, and Accountability
              </h3>
              <p className="text-[13px] text-[#5B636E] dark:text-neutral-400 leading-relaxed">
                Our platform rules, dispute resolution workflows, and moderation guidelines are designed in consultation with campus leaders to keep students protected.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/safety-guidelines"
                className="radius-native px-4 py-2 rounded-xl bg-[#FFC928] hover:bg-[#F2BD24] text-[#171717] text-[12.5px] font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                Safety Guidelines
              </Link>
              <Link
                href="/community-rules"
                className="radius-native px-4 py-2 rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-white/5 text-[12.5px] font-bold text-[#5B636E] dark:text-neutral-300 hover:text-[#171717] dark:hover:text-white transition-colors"
              >
                Community Rules
              </Link>
            </div>
          </div>
        </div>
      </main>

      <RebrandFooter />
    </div>
  );
}
