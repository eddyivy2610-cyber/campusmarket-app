"use client";

import React from "react";
import Link from "next/link";
import {
  Lock,
  EyeOff,
  Database,
  ShieldCheck,
  CheckCircle2,
  FileText,
  SlidersHorizontal,
  ArrowRight,
} from "lucide-react";
import { RebrandHeader } from "../../components/header/RebrandHeader";
import { RebrandFooter } from "../../components/sections/RebrandFooter";

export default function UsagePolicyPage() {
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
              Privacy & Usage Policy
            </h1>
            <p className="text-[12.5px] text-[#8C929C] dark:text-neutral-400 mt-0.5 font-normal">
              How student data, account credentials, and platform exchanges are handled securely.
            </p>
          </div>

          <div
            className="hidden sm:block flex-1 h-[1px] bg-[#E8EAEE] dark:bg-white/10"
            aria-hidden="true"
          />

          <Link
            href="/settings/preferences"
            className="radius-native inline-flex items-center gap-1.5 rounded-lg border border-[#E4E7EC] dark:border-white/15 bg-white dark:bg-white/5 hover:bg-[#F7F8FA] dark:hover:bg-white/10 px-3 py-1.5 text-[12px] font-semibold text-[#171717] dark:text-white shrink-0 transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Manage Privacy</span>
          </Link>
        </div>

        {/* Content Container */}
        <div className="space-y-6">
          {/* Privacy Commitment Banner */}
          <div className="radius-native rounded-2xl border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50/60 dark:bg-emerald-950/20 p-5 sm:p-6 flex items-start gap-3.5 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5 font-bold shadow-xs">
              <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="space-y-1">
              <h2 className="text-[14.5px] font-bold text-emerald-900 dark:text-emerald-200">
                Student Data Protection Promise: We do not sell or monetize personal data.
              </h2>
              <p className="text-[12.5px] text-emerald-800/80 dark:text-neutral-300 leading-relaxed">
                Campus Hive only collects the minimum data required to verify active student standing, safeguard campus transactions, and facilitate peer-to-peer communication. Your information is never sold to third-party ad networks.
              </p>
            </div>
          </div>

          {/* Privacy Breakdown Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {/* 1. What Data We Collect */}
            <div className="radius-native rounded-2xl border border-[#ECEEF2] dark:border-white/10 bg-white dark:bg-[#14161D] p-5 sm:p-6 shadow-xs space-y-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Database className="w-4 h-4 stroke-[2.2]" />
                </div>
                <h3 className="text-[14.5px] font-bold text-[#171717] dark:text-white">
                  1. Information We Collect
                </h3>
              </div>
              <ul className="space-y-2.5 text-[12.5px] text-[#5B636E] dark:text-neutral-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Student Identity:</strong> Institutional email, full name, chosen handle, university campus, and academic department.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Marketplace Content:</strong> Product listings, photos, prices, descriptions, store profiles, and wanted requests.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Security Telemetry:</strong> Session tokens, hashed credentials, and device request IDs for fraud prevention.</span>
                </li>
              </ul>
            </div>

            {/* 2. How Data is Used */}
            <div className="radius-native rounded-2xl border border-[#ECEEF2] dark:border-white/10 bg-white dark:bg-[#14161D] p-5 sm:p-6 shadow-xs space-y-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <FileText className="w-4 h-4 stroke-[2.2]" />
                </div>
                <h3 className="text-[14.5px] font-bold text-[#171717] dark:text-white">
                  2. Purpose & Use of Data
                </h3>
              </div>
              <ul className="space-y-2.5 text-[12.5px] text-[#5B636E] dark:text-neutral-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Confirming university enrolment to award verified badges and protect community safety.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Routing real-time chat messages and order notifications between buyers and sellers.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Investigating trade disputes, scam reports, or prohibited contraband violations.</span>
                </li>
              </ul>
            </div>

            {/* 3. Granular Privacy Controls */}
            <div className="radius-native rounded-2xl border border-[#ECEEF2] dark:border-white/10 bg-white dark:bg-[#14161D] p-5 sm:p-6 shadow-xs space-y-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#FFC928]/20 text-[#171717] dark:text-[#FFC928] flex items-center justify-center">
                  <SlidersHorizontal className="w-4 h-4 stroke-[2.2]" />
                </div>
                <h3 className="text-[14.5px] font-bold text-[#171717] dark:text-white">
                  3. Your Privacy Controls
                </h3>
              </div>
              <ul className="space-y-2.5 text-[12.5px] text-[#5B636E] dark:text-neutral-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Sales Milestone Visibility:</strong> Choose whether to display confirmed sales milestones (25+, 50+, 100+) on your trust card.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Online Status:</strong> Toggle your live green presence indicator in chat threads on or off.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Message Permissions:</strong> Restrict incoming messages to verified students only or active listings only.</span>
                </li>
              </ul>
            </div>

            {/* 4. Deletion & Data Rights */}
            <div className="radius-native rounded-2xl border border-[#ECEEF2] dark:border-white/10 bg-white dark:bg-[#14161D] p-5 sm:p-6 shadow-xs space-y-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                  <EyeOff className="w-4 h-4 stroke-[2.2]" />
                </div>
                <h3 className="text-[14.5px] font-bold text-[#171717] dark:text-white">
                  4. Data Deletion & Account Closure
                </h3>
              </div>
              <ul className="space-y-2.5 text-[12.5px] text-[#5B636E] dark:text-neutral-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>You may deactivate your account or request complete account erasure anytime under Settings &gt; Account Status.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Upon permanent deletion, your personal profile, active listings, and tokens are removed from active databases.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Audit records required by law for fraud investigations are retained in protected append-only logs.</span>
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
