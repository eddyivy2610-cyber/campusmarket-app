"use client";

import React from "react";
import Link from "next/link";
import {
  Users,
  Ban,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Gavel,
  ArrowRight,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { RebrandHeader } from "../../components/header/RebrandHeader";
import { RebrandFooter } from "../../components/sections/RebrandFooter";

export default function CommunityRulesPage() {
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
              Community Rules
            </h1>
            <p className="text-[12.5px] text-[#8C929C] dark:text-neutral-400 mt-0.5 font-normal">
              Standards of conduct, prohibited item policies, and student trade ethics across campus.
            </p>
          </div>

          <div
            className="hidden sm:block flex-1 h-[1px] bg-[#E8EAEE] dark:bg-white/10"
            aria-hidden="true"
          />

          <Link
            href="/safety-guidelines"
            className="radius-native inline-flex items-center gap-1.5 rounded-lg border border-[#E4E7EC] dark:border-white/15 bg-white dark:bg-white/5 hover:bg-[#F7F8FA] dark:hover:bg-white/10 px-3 py-1.5 text-[12px] font-semibold text-[#171717] dark:text-white shrink-0 transition-colors cursor-pointer"
          >
            <span>Safety Guidelines</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Content Container */}
        <div className="space-y-6">
          {/* Core Principle */}
          <div className="radius-native rounded-2xl border border-[#ECEEF2] dark:border-white/10 bg-white dark:bg-[#14161D] p-6 sm:p-8 shadow-xs space-y-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#FFC928]/20 text-[#171717] dark:text-[#FFC928] border border-[#FFC928]/40">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Campus Code of Conduct</span>
            </span>
            <h2 className="text-[18px] sm:text-[20px] font-extrabold text-[#171717] dark:text-white tracking-[-0.01em]">
              Respect, transparency, and accountability between fellow students.
            </h2>
            <p className="text-[13px] text-[#5B636E] dark:text-neutral-300 leading-relaxed max-w-4xl">
              Campus Hive is a closed educational community. When you list an item or respond to a request, you are dealing with a classmate, hall-mate, or future alumnus. We expect all interactions to reflect mutual courtesy, honesty in product descriptions, and respect for university regulations.
            </p>
          </div>

          {/* Rules Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {/* 1. Authentic Identity & Listings */}
            <div className="radius-native rounded-2xl border border-[#ECEEF2] dark:border-white/10 bg-white dark:bg-[#14161D] p-5 sm:p-6 shadow-xs space-y-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 stroke-[2.2]" />
                </div>
                <h3 className="text-[14.5px] font-bold text-[#171717] dark:text-white">
                  1. Authentic Items & Accurate Photos
                </h3>
              </div>
              <ul className="space-y-2.5 text-[12.5px] text-[#5B636E] dark:text-neutral-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Use real, original photos of the exact item you have in your possession. Do not use promotional stock photos for used goods.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Disclose all flaws, scratches, battery issues, or replaced parts honestly in your description.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Set realistic, non-misleading prices. Listing items at ₦0 or ₦1 to manipulate search visibility is prohibited.</span>
                </li>
              </ul>
            </div>

            {/* 2. Prohibited Goods & Services */}
            <div className="radius-native rounded-2xl border border-[#ECEEF2] dark:border-white/10 bg-white dark:bg-[#14161D] p-5 sm:p-6 shadow-xs space-y-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center">
                  <Ban className="w-4 h-4 stroke-[2.2]" />
                </div>
                <h3 className="text-[14.5px] font-bold text-[#171717] dark:text-white">
                  2. Strictly Prohibited Goods & Services
                </h3>
              </div>
              <ul className="space-y-2.5 text-[12.5px] text-[#5B636E] dark:text-neutral-300">
                <li className="flex items-start gap-2 text-red-600 dark:text-red-400">
                  <Ban className="w-4 h-4 shrink-0 mt-0.5" />
                  <span><strong>Academic Dishonesty:</strong> Exam questions, impersonation test services, forged medical reports, or graded assignments.</span>
                </li>
                <li className="flex items-start gap-2 text-red-600 dark:text-red-400">
                  <Ban className="w-4 h-4 shrink-0 mt-0.5" />
                  <span><strong>Dangerous Contraband:</strong> Weapons, knives, firearms, illicit drugs, prescription pharmaceuticals, or stolen goods.</span>
                </li>
                <li className="flex items-start gap-2 text-red-600 dark:text-red-400">
                  <Ban className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>Pyramid schemes, forex signals, crypto doubling offers, or unauthorized financial loan solicitation.</span>
                </li>
              </ul>
            </div>

            {/* 3. Deal Etiquette & Communication */}
            <div className="radius-native rounded-2xl border border-[#ECEEF2] dark:border-white/10 bg-white dark:bg-[#14161D] p-5 sm:p-6 shadow-xs space-y-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Users className="w-4 h-4 stroke-[2.2]" />
                </div>
                <h3 className="text-[14.5px] font-bold text-[#171717] dark:text-white">
                  3. Deal Etiquette & Anti-Ghosting
                </h3>
              </div>
              <ul className="space-y-2.5 text-[12.5px] text-[#5B636E] dark:text-neutral-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>If you agree on an offer and meeting time, communicate promptly if your schedule changes.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Mark your item as &ldquo;Sold&rdquo; immediately after handover so other buyers aren&apos;t left hanging.</span>
                </li>
                <li className="flex items-start gap-2 text-red-600 dark:text-red-400">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>Zero tolerance for harassment, vulgar language, intimidation, or hate speech in campus chat threads.</span>
                </li>
              </ul>
            </div>

            {/* 4. Enforcement & Suspensions */}
            <div className="radius-native rounded-2xl border border-[#ECEEF2] dark:border-white/10 bg-white dark:bg-[#14161D] p-5 sm:p-6 shadow-xs space-y-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Gavel className="w-4 h-4 stroke-[2.2]" />
                </div>
                <h3 className="text-[14.5px] font-bold text-[#171717] dark:text-white">
                  4. Graduated Enforcement Policy
                </h3>
              </div>
              <ul className="space-y-2.5 text-[12.5px] text-[#5B636E] dark:text-neutral-300">
                <li className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                  <span><strong>First Notice:</strong> Minor listing infractions result in listing removal and an advisory message.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-orange-500/20 text-orange-800 dark:text-orange-300 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                  <span><strong>Temporary Suspension:</strong> Repeated policy evasion or dispute non-cooperation results in a 14-day trade freeze.</span>
                </li>
                <li className="flex items-start gap-2 text-red-600 dark:text-red-400">
                  <span className="w-4 h-4 rounded-full bg-red-500/20 text-red-800 dark:text-red-300 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
                  <span><strong>Permanent Expulsion:</strong> Confirmed scams, violent harassment, or sale of stolen goods results in immediate permanent ban.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <RebrandFooter />
    </div>
  );
}
