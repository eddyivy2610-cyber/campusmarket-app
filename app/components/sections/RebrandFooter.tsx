"use client";

import React from "react";
import Link from "next/link";
import { Logo } from "../ui/Logo";
import {
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  ShieldCheck,
} from "lucide-react";

export function RebrandFooter() {
  return (
    <footer
      style={{ fontFamily: "var(--font-plus-jakarta), sans-serif" }}
      className="w-full bg-white dark:bg-[#14161D] text-[#171717] dark:text-white pt-10 pb-8 border-t border-[#ECEEF2] dark:border-white/10 transition-colors"
    >
      <div className="w-full max-w-[1380px] mx-auto px-5 sm:px-8 lg:px-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10 pb-8 border-b border-[#ECEEF2] dark:border-white/10">
          {/* Brand Info (2 columns on large screens) */}
          <div className="lg:col-span-2 space-y-3.5">
            <Logo height={34} width={85} href="/home" />

            <p className="text-[#5B636E] dark:text-neutral-400 text-[13px] leading-relaxed max-w-[340px]">
              The trusted student marketplace for Ahmadu Bello University. Buy, sell, and connect safely across campus.
            </p>

            <div className="flex items-center gap-2 pt-1">
              {[
                { icon: Twitter, label: "Twitter", href: "/coming-soon" },
                { icon: Instagram, label: "Instagram", href: "/coming-soon" },
                { icon: Linkedin, label: "LinkedIn", href: "/coming-soon" },
                { icon: Mail, label: "Email", href: "mailto:campushive@gmail.com" },
              ].map(({ icon: Icon, label, href }) => (
                <Link
                  key={label}
                  href={href}
                  aria-label={label}
                  className="radius-native w-8 h-8 rounded-lg bg-[#F5F6F8] dark:bg-white/5 border border-[#ECEEF2] dark:border-white/10 flex items-center justify-center text-[#5B636E] dark:text-neutral-300 hover:bg-[#FFE182] hover:border-[#FFE182] hover:text-[#171717] transition-colors"
                >
                  <Icon className="w-3.5 h-3.5" strokeWidth={1.8} />
                </Link>
              ))}
            </div>
          </div>

          {/* Column 1: Marketplace */}
          <div className="space-y-3">
            <h3 className="text-[11.5px] font-bold uppercase tracking-[0.1em] text-[#171717] dark:text-white">
              Marketplace
            </h3>
            <ul className="space-y-2 text-[13px]">
              {[
                { label: "Home", href: "/home" },
                { label: "Explore Items", href: "/explore" },
                { label: "Campus Radar", href: "/wanted" },
                { label: "Store Directory", href: "/stores" },
                { label: "List a Product", href: "/dashboard/products/add" },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-[#5B636E] dark:text-neutral-400 hover:text-[#171717] dark:hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Safety & Community */}
          <div className="space-y-3">
            <h3 className="text-[11.5px] font-bold uppercase tracking-[0.1em] text-[#171717] dark:text-white">
              Safety & Trust
            </h3>
            <ul className="space-y-2 text-[13px]">
              {[
                { label: "Safety Guidelines", href: "/safety-guidelines" },
                { label: "Community Rules", href: "/community-rules" },
                { label: "Student Verification", href: "/settings?section=verification" },
                { label: "Usage Policy", href: "/usage-policy" },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-[#5B636E] dark:text-neutral-400 hover:text-[#171717] dark:hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Support */}
          <div className="space-y-3">
            <h3 className="text-[11.5px] font-bold uppercase tracking-[0.1em] text-[#171717] dark:text-white">
              Support
            </h3>
            <ul className="space-y-2 text-[13px]">
              {[
                { label: "Help & Support", href: "/help-support" },
                { label: "About Campus Hive", href: "/about-us" },
                { label: "Terms of Service", href: "/terms-of-service" },
                { label: "Privacy Policy", href: "/usage-policy" },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-[#5B636E] dark:text-neutral-400 hover:text-[#171717] dark:hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[12px] text-[#7A818C] dark:text-neutral-400">
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} Campus Hive. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-1.5 text-[11.5px] text-[#8C929C] dark:text-neutral-400">
            <MapPin className="w-3 h-3 text-[#FFC928]" />
            <span>ABU Zaria · Samaru & Kongo Campuses</span>
          </div>

          <div className="flex items-center gap-4 text-[12px]">
            <Link
              href="/usage-policy"
              className="hover:text-[#171717] dark:hover:text-white transition-colors"
            >
              Privacy
            </Link>
            <span className="text-[#D5D9E0] dark:text-white/20">·</span>
            <Link
              href="/terms-of-service"
              className="hover:text-[#171717] dark:hover:text-white transition-colors"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
