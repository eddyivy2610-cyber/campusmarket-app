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
                  1. Designated Public Meetup Spots
                </h3>
              </div>
              <p className="text-[12.5px] text-[#5B636E] dark:text-neutral-400 leading-relaxed">
                Conduct all item handoffs in well-lit, populated campus hubs during daylight hours.
              </p>
              <ul className="space-y-2 text-[12.5px] text-[#5B636E] dark:text-neutral-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Recommended:</strong> Kashim Ibrahim Library lobby, Student Social Centre (SUB), Faculty auditoriums.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Bring a roommate or course mate along for high-value gadget transactions.</span>
                </li>
                <li className="flex items-start gap-2 text-red-600 dark:text-red-400">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>Avoid meeting after dark, in isolated bush paths, or in private quarters.</span>
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
                  2. Payment & Bank Transfer Security
                </h3>
              </div>
              <p className="text-[12.5px] text-[#5B636E] dark:text-neutral-400 leading-relaxed">
                Counter fake receipt scams and fake SMS alerts with mandatory live balance confirmation.
              </p>
              <ul className="space-y-2 text-[12.5px] text-[#5B636E] dark:text-neutral-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Log into your authentic banking app and confirm the balance credit yourself.</span>
                </li>
                <li className="flex items-start gap-2 text-red-600 dark:text-red-400">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span><strong>Never rely on screenshots:</strong> Fake transfer generator apps produce counterfeit receipt images in seconds.</span>
                </li>
                <li className="flex items-start gap-2 text-red-600 dark:text-red-400">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>Do not release goods until your bank reflects the cleared funds.</span>
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
                  3. In-Person Product Inspection
                </h3>
              </div>
              <p className="text-[12.5px] text-[#5B636E] dark:text-neutral-400 leading-relaxed">
                Take the time to thoroughly test and examine equipment before concluding any deal.
              </p>
              <ul className="space-y-2 text-[12.5px] text-[#5B636E] dark:text-neutral-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Phones & Laptops:</strong> Test Wi-Fi, camera, ports, charging, and battery cycle health.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Check for iCloud, Google FRP locks, or BIOS locks before the seller leaves.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Request original receipt or proof of purchase for high-end electronics.</span>
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
                  4. Keep Negotiations in Campus Hive
                </h3>
              </div>
              <p className="text-[12.5px] text-[#5B636E] dark:text-neutral-400 leading-relaxed">
                Keeping chat records inside the platform provides irrefutable evidence in dispute investigations.
              </p>
              <ul className="space-y-2 text-[12.5px] text-[#5B636E] dark:text-neutral-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Our audit logging protects both parties if a dispute arises.</span>
                </li>
                <li className="flex items-start gap-2 text-red-600 dark:text-red-400">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>Be skeptical of users demanding immediate external WhatsApp calls before an offer is made.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Always check the student verification tick on the seller&apos;s profile card.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Reporting Protocol Card */}
          <div className="radius-native rounded-2xl border border-[#ECEEF2] dark:border-white/10 bg-white dark:bg-[#14161D] p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-[14px] font-bold text-[#171717] dark:text-white">
                Spotted a suspicious listing or harassment?
              </h4>
              <p className="text-[12.5px] text-[#68707A] dark:text-neutral-400">
                Our student moderation team acts immediately on flagged listings, counterfeit goods, and safety complaints.
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
