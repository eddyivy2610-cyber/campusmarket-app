"use client";

import React, { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";

interface NewAuthCardProps {
  children: ReactNode;
  title: string;
  subtitle: string;
  showBackToHome?: boolean;
}

export function NewAuthCard({
  children,
  title,
  subtitle,
  showBackToHome = true,
}: NewAuthCardProps) {
  return (
    <div
      style={{ fontFamily: "var(--font-plus-jakarta), sans-serif" }}
      className="min-h-screen relative flex flex-col justify-center items-center bg-[#F7F8FA] dark:bg-[#0E1015] px-4 py-8 sm:py-12 overflow-hidden antialiased"
    >
      {/* Subtle Yellow Geometric Brand Motif in background (from design reference) */}
      <div
        className="pointer-events-none absolute -left-16 sm:left-4 top-1/2 -translate-y-1/2 w-48 sm:w-64 h-72 sm:h-96 rounded-r-full bg-[#FFE182]/25 dark:bg-[#FFC928]/5 blur-2xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-16 top-12 w-64 h-64 rounded-full bg-[#FFE182]/20 dark:bg-[#FFC928]/5 blur-3xl"
        aria-hidden="true"
      />

      {/* Main Centered Card Container */}
      <div className="relative z-10 w-full max-w-[440px]">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <Link
            href="/home"
            className="inline-flex items-center gap-2 group transition-transform active:scale-95"
          >
            {/* Minimal Hexagonal Brand Mark */}
            <div className="w-10 h-10 rounded-2xl bg-[#FFC928] flex items-center justify-center shadow-sm group-hover:bg-[#F2BD24] transition-colors">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 2L3 7V17L12 22L21 17V7L12 2Z"
                  stroke="#171717"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="12" cy="12" r="3" fill="#171717" />
              </svg>
            </div>
            <span className="text-[20px] font-black text-[#171717] dark:text-white tracking-tight">
              Campus Hive
            </span>
          </Link>
        </div>

        {/* Card Box */}
        <div className="radius-native bg-white dark:bg-[#14161D] rounded-3xl border border-[#ECEEF2] dark:border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.03)] p-6 sm:p-9 space-y-5">
          {/* Header Texts */}
          <div className="text-center space-y-1">
            <h1 className="text-[22px] sm:text-[24px] font-extrabold text-[#171717] dark:text-white tracking-[-0.02em]">
              {title}
            </h1>
            <p className="text-[13px] text-[#68707A] dark:text-neutral-400 leading-relaxed">
              {subtitle}
            </p>
          </div>

          {children}
        </div>

        {/* Footer Return Link */}
        {showBackToHome && (
          <div className="text-center mt-6">
            <Link
              href="/home"
              className="text-[12.5px] font-semibold text-[#8C929C] hover:text-[#171717] dark:hover:text-white transition-colors"
            >
              ← Back to Campus Hive
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
