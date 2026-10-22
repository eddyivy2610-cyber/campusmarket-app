"use client";

import React from "react";
import Link from "next/link";
import {
  FileText,
  Scale,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Gavel,
} from "lucide-react";
import { RebrandHeader } from "../../components/header/RebrandHeader";
import { RebrandFooter } from "../../components/sections/RebrandFooter";

export default function TermsOfServicePage() {
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
              Terms of Service
            </h1>
            <p className="text-[12.5px] text-[#8C929C] dark:text-neutral-400 mt-0.5 font-normal">
              Binding user agreement governing access to and transactions within Campus Hive.
            </p>
          </div>

          <div
            className="hidden sm:block flex-1 h-[1px] bg-[#E8EAEE] dark:bg-white/10"
            aria-hidden="true"
          />

          <Link
            href="/community-rules"
            className="radius-native inline-flex items-center gap-1.5 rounded-lg border border-[#E4E7EC] dark:border-white/15 bg-white dark:bg-white/5 hover:bg-[#F7F8FA] dark:hover:bg-white/10 px-3 py-1.5 text-[12px] font-semibold text-[#171717] dark:text-white shrink-0 transition-colors cursor-pointer"
          >
            <span>Community Rules</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Content Container */}
        <div className="space-y-6">
          {/* Agreement Notice Banner */}
          <div className="radius-native rounded-2xl border border-[#ECEEF2] dark:border-white/10 bg-white dark:bg-[#14161D] p-6 sm:p-8 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-[11px] font-bold text-[#8C929C] uppercase tracking-wider">
              <span>Effective Date: October 2026</span>
              <span>•</span>
              <span>Version 2.0 MVP</span>
            </div>
            <h2 className="text-[18px] sm:text-[20px] font-extrabold text-[#171717] dark:text-white tracking-[-0.01em]">
              Clear, transparent terms protecting campus buyers and sellers.
            </h2>
            <p className="text-[13px] text-[#5B636E] dark:text-neutral-300 leading-relaxed max-w-4xl">
              By accessing, browsing, or creating an account on Campus Hive, you enter into a legally binding agreement to follow these terms, our community guidelines, and university safety expectations.
            </p>
          </div>

          {/* 4 Core Terms Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {/* 1. Platform Intermediary Role */}
            <div className="radius-native rounded-2xl border border-[#ECEEF2] dark:border-white/10 bg-white dark:bg-[#14161D] p-5 sm:p-6 shadow-xs space-y-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Scale className="w-4 h-4 stroke-[2.2]" />
                </div>
                <h3 className="text-[14.5px] font-bold text-[#171717] dark:text-white">
                  1. Nature of the Service
                </h3>
              </div>
              <p className="text-[12.5px] text-[#5B636E] dark:text-neutral-400 leading-relaxed">
                Campus Hive provides digital connection infrastructure for university students.
              </p>
              <ul className="space-y-2 text-[12.5px] text-[#5B636E] dark:text-neutral-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Campus Hive connects independent student buyers and sellers. We are not the manufacturer, distributor, or direct retailer of listed goods.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>All price agreements, delivery handoffs, and payments are executed directly between buyers and sellers.</span>
                </li>
              </ul>
            </div>

            {/* 2. User Representations & Eligibility */}
            <div className="radius-native rounded-2xl border border-[#ECEEF2] dark:border-white/10 bg-white dark:bg-[#14161D] p-5 sm:p-6 shadow-xs space-y-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 stroke-[2.2]" />
                </div>
                <h3 className="text-[14.5px] font-bold text-[#171717] dark:text-white">
                  2. User Eligibility & Accounts
                </h3>
              </div>
              <p className="text-[12.5px] text-[#5B636E] dark:text-neutral-400 leading-relaxed">
                Account creation requires honest, verifiable academic student information.
              </p>
              <ul className="space-y-2 text-[12.5px] text-[#5B636E] dark:text-neutral-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>You must be an active student, faculty member, or approved campus business in Nigeria.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>You are responsible for safeguarding your login credentials and session tokens. Multiple accounts created to circumvent suspensions are immediately banned.</span>
                </li>
              </ul>
            </div>

            {/* 3. Transaction Disclaimers */}
            <div className="radius-native rounded-2xl border border-[#ECEEF2] dark:border-white/10 bg-white dark:bg-[#14161D] p-5 sm:p-6 shadow-xs space-y-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <AlertCircle className="w-4 h-4 stroke-[2.2]" />
                </div>
                <h3 className="text-[14.5px] font-bold text-[#171717] dark:text-white">
                  3. In-Person Inspection & Warranty
                </h3>
              </div>
              <p className="text-[12.5px] text-[#5B636E] dark:text-neutral-400 leading-relaxed">
                Peer-to-peer exchanges are concluded &lsquo;as-inspected&rsquo; at the meetup.
              </p>
              <ul className="space-y-2 text-[12.5px] text-[#5B636E] dark:text-neutral-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Buyers have the right and obligation to physically inspect items before paying.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Unless explicitly guaranteed in writing by a verified student store, second-hand student items do not carry post-delivery warranties.</span>
                </li>
              </ul>
            </div>

            {/* 4. Disputes & Account Terminations */}
            <div className="radius-native rounded-2xl border border-[#ECEEF2] dark:border-white/10 bg-white dark:bg-[#14161D] p-5 sm:p-6 shadow-xs space-y-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <Gavel className="w-4 h-4 stroke-[2.2]" />
                </div>
                <h3 className="text-[14.5px] font-bold text-[#171717] dark:text-white">
                  4. Dispute Resolution & Sanctions
                </h3>
              </div>
              <p className="text-[12.5px] text-[#5B636E] dark:text-neutral-400 leading-relaxed">
                Campus Hive maintains a student moderation panel to review transaction complaints.
              </p>
              <ul className="space-y-2 text-[12.5px] text-[#5B636E] dark:text-neutral-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>In disputes involving counterfeit items or misrepresented condition, moderators may mediate mutual returns or issue seller rating penalties.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Severe violations including physical assault, extortion, or fraudulent banking scams are escalated directly to university campus security.</span>
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
