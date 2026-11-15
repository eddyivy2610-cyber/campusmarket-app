"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldAlert,
  MapPin,
  CreditCard,
  MessageSquare,
  Eye,
  AlertTriangle,
  CheckCircle2,
  PhoneCall,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { RebrandHeader } from "../../components/header/RebrandHeader";
import { RebrandFooter } from "../../components/sections/RebrandFooter";

export default function SafetyGuidelinesPage() {
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
              Safety Guidelines
            </h1>
            <p className="text-[12.5px] text-[#8C929C] dark:text-neutral-400 mt-0.5 font-normal">
              Essential verification steps, physical meetup protocols, and fraud prevention for students.
            </p>
          </div>

          <div
            className="hidden sm:block flex-1 h-[1px] bg-[#E8EAEE] dark:bg-white/10"
            aria-hidden="true"
          />

          <Link
            href="/help-support"
            className="radius-native inline-flex items-center gap-1.5 rounded-lg border border-[#E4E7EC] dark:border-white/15 bg-white dark:bg-white/5 hover:bg-[#F7F8FA] dark:hover:bg-white/10 px-3 py-1.5 text-[12px] font-semibold text-[#171717] dark:text-white shrink-0 transition-colors cursor-pointer"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Contact Support</span>
          </Link>
        </div>

        {/* Content Container */}
        <div className="space-y-6">
          {/* Golden Rule Banner */}
          <div className="radius-native rounded-2xl border border-amber-200 dark:border-amber-500/20 bg-amber-50/60 dark:bg-amber-950/20 p-5 sm:p-6 flex items-start gap-3.5 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-[#FFC928] text-[#171717] flex items-center justify-center shrink-0 mt-0.5 font-bold shadow-xs">
              <ShieldAlert className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="space-y-1">
              <h2 className="text-[14.5px] font-bold text-[#171717] dark:text-amber-200">
                The Campus Golden Rule: Meet on campus, inspect in person, confirm bank alerts.
              </h2>
              <p className="text-[12.5px] text-[#5B636E] dark:text-neutral-300 leading-relaxed">
                Never pay upfront for an item you haven&apos;t seen or tested. Never meet in secluded off-campus locations or private hostel rooms with strangers. Always confirm payment arrival in your real banking application.
              </p>
            </div>
          </div>

          {/* 4 Core Safety Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {/* 1. Meetup Safety */}
            <div className="radius-native rounded-2xl border border-[#ECEEF2] dark:border-white/10 bg-white dark:bg-[#14161D] p-5 sm:p-6 shadow-xs space-y-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <MapPin className="w-4 h-4 stroke-[2.2]" />
                </div>
                <h3 className="text-[14.5px] font-bold text-[#171717] dark:text-white">
                  1. Safe Campus Meetup Spots
                </h3>
              </div>
              <p className="text-[12.5px] text-[#5B636E] dark:text-neutral-400 leading-relaxed">
                Conduct all item handoffs in well-lit, populated campus hubs during daylight hours.
              </p>
              <ul className="space-y-2 text-[12.5px] text-[#5B636E] dark:text-neutral-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Best spots:</strong> Always meet in busy, open places on campus.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Bring a roommate or course mate along when buying or selling expensive gadgets.</span>
                </li>
                <li className="flex items-start gap-2 text-red-600 dark:text-red-400">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>Avoid meeting at night, in quiet bush paths, or inside private hostel rooms.</span>
                </li>
              </ul>
            </div>

            {/* 2. Payment & Transfer Security */}
            <div className="radius-native rounded-2xl border border-[#ECEEF2] dark:border-white/10 bg-white dark:bg-[#14161D] p-5 sm:p-6 shadow-xs space-y-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <CreditCard className="w-4 h-4 stroke-[2.2]" />
                </div>
                <h3 className="text-[14.5px] font-bold text-[#171717] dark:text-white">
                  2. Payment &amp; Transfer Safety
                </h3>
              </div>
              <p className="text-[12.5px] text-[#5B636E] dark:text-neutral-400 leading-relaxed">
                Protect yourself from fake alerts and edited transfer receipts.
              </p>
              <ul className="space-y-2 text-[12.5px] text-[#5B636E] dark:text-neutral-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Open your banking app and confirm the money has landed in your balance.</span>
                </li>
                <li className="flex items-start gap-2 text-red-600 dark:text-red-400">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span><strong>Never trust screenshots or SMS alerts alone:</strong> Scammers use fake receipt apps to generate false proof of payment in seconds.</span>
                </li>
                <li className="flex items-start gap-2 text-red-600 dark:text-red-400">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>Do not hand over any item until your bank balance updates.</span>
                </li>
              </ul>
            </div>

            {/* 3. Gadget & Item Inspection */}
            <div className="radius-native rounded-2xl border border-[#ECEEF2] dark:border-white/10 bg-white dark:bg-[#14161D] p-5 sm:p-6 shadow-xs space-y-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <Eye className="w-4 h-4 stroke-[2.2]" />
                </div>
                <h3 className="text-[14.5px] font-bold text-[#171717] dark:text-white">
                  3. Inspect Items Before Paying
                </h3>
              </div>
              <p className="text-[12.5px] text-[#5B636E] dark:text-neutral-400 leading-relaxed">
                Check and test everything properly before sealing the deal.
              </p>
              <ul className="space-y-2 text-[12.5px] text-[#5B636E] dark:text-neutral-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Phones &amp; Laptops:</strong> Test the Wi-Fi, camera, charging port, speakers, and battery health.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Make sure there are no iCloud, Google, or BIOS locks before the seller leaves.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Ask for the original receipt or proof of purchase for expensive gadgets.</span>
                </li>
              </ul>
            </div>

            {/* 4. Chat Records & Communication */}
            <div className="radius-native rounded-2xl border border-[#ECEEF2] dark:border-white/10 bg-white dark:bg-[#14161D] p-5 sm:p-6 shadow-xs space-y-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#FFC928]/20 text-[#171717] dark:text-[#FFC928] flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 stroke-[2.2]" />
                </div>
                <h3 className="text-[14.5px] font-bold text-[#171717] dark:text-white">
                  4. Keep Chats Inside Campus Hive
                </h3>
              </div>
              <p className="text-[12.5px] text-[#5B636E] dark:text-neutral-400 leading-relaxed">
                Keeping your conversations on the app gives you clear proof if a dispute happens.
              </p>
              <ul className="space-y-2 text-[12.5px] text-[#5B636E] dark:text-neutral-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>In-app chat records help protect both buyers and sellers.</span>
                </li>
                <li className="flex items-start gap-2 text-red-600 dark:text-red-400">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>Be careful of anyone rushing you to move to WhatsApp before agreeing on a deal.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Always check for the student verification badge on the user&apos;s profile.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Reporting Protocol Card */}
          <div className="radius-native rounded-2xl border border-[#ECEEF2] dark:border-white/10 bg-white dark:bg-[#14161D] p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-[14px] font-bold text-[#171717] dark:text-white">
                Spotted a fake listing or bad behavior?
              </h4>
              <p className="text-[12.5px] text-[#68707A] dark:text-neutral-400">
                Report it right away. Our student moderation team acts fast on scams, fake items, and safety issues.
              </p>
            </div>
            <Link
              href="/help-support"
              className="radius-native px-4 py-2 rounded-xl bg-[#171717] text-white dark:bg-white dark:text-[#171717] text-[12.5px] font-bold hover:bg-[#333] dark:hover:bg-neutral-200 transition-colors shrink-0 cursor-pointer"
            >
              Report an Issue
            </Link>
          </div>
        </div>
      </main>

      <RebrandFooter />
    </div>
  );
}
