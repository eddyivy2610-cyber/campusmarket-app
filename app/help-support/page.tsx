"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Mail,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  ShieldAlert,
  ArrowRight,
  MessageSquare,
} from "lucide-react";
import { RebrandHeader } from "../components/header/RebrandHeader";
import { RebrandFooter } from "../components/sections/RebrandFooter";

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    question: "How do campus meetups and payments work?",
    answer:
      "When you agree on a price with a buyer or seller in chat, pick a daylight meetup spot at a prominent campus landmark (such as the library lobby, student social centre, or faculty auditorium). Inspect the item thoroughly. Once satisfied, send payment via direct bank transfer or cash and confirm receipt in your authentic banking app.",
  },
  {
    question: "How do I get the yellow verified student seller badge?",
    answer:
      "Go to Settings > Trust & Verification. Enter your official university institutional email address (e.g. name@abu.edu.ng) and verify the 6-digit OTP sent to your inbox. Once verified, your account automatically receives the gold-and-black verification badge on your profile and listings.",
  },
  {
    question: "What should I do if a seller doesn't show up or cancels?",
    answer:
      "Never pay upfront before meeting. If a user ghosts after an agreement, you can flag their profile in chat or report the conversation to moderation. Users with chronic no-show records receive rating deductions and temporary scheduling restrictions.",
  },
  {
    question: "How can I open my own verified student storefront?",
    answer:
      "Any verified student or approved campus business can open a storefront. Navigate to the Stores tab and select 'Open a Store' to set your store name, handle, business type, and operating location on campus.",
  },
];

export default function HelpSupportPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("verification");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedToast, setSubmittedToast] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmittedToast(true);
      setName("");
      setEmail("");
      setMessage("");
      setTimeout(() => setSubmittedToast(false), 4500);
    }, 600);
  };

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
              Help & Support
            </h1>
            <p className="text-[12.5px] text-[#8C929C] dark:text-neutral-400 mt-0.5 font-normal">
              Assistance with student verification, order disputes, safety reports, and platform inquiries.
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
          {submittedToast && (
            <div className="radius-native p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 text-[13px] font-semibold flex items-center gap-2.5 shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Thank you! Your support request has been logged. A student moderator will reply via your campus email within 2 hours.</span>
            </div>
          )}

          {/* Contact Information & Interactive Form Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6 items-start">
            {/* Left: Verified Campus Help Desk Info */}
            <div className="space-y-4">
              <div className="radius-native rounded-2xl border border-[#ECEEF2] dark:border-white/10 bg-white dark:bg-[#14161D] p-5 sm:p-6 shadow-xs space-y-4">
                <div className="space-y-1">
                  <h2 className="text-[16px] font-extrabold text-[#171717] dark:text-white">
                    Campus Help Desk
                  </h2>
                  <p className="text-[12.5px] text-[#68707A] dark:text-neutral-400">
                    Reach our student operations and dispute resolution team directly.
                  </p>
                </div>

                <div className="space-y-3 pt-1">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#FFC928]/20 text-[#171717] dark:text-[#FFC928] flex items-center justify-center shrink-0 mt-0.5">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[12px] font-bold text-[#171717] dark:text-white">Email Inquiries</div>
                      <a href="mailto:campushive@gmail.com" className="text-[12.5px] text-[#5B636E] dark:text-neutral-400 hover:text-[#171717] dark:hover:text-white transition-colors">
                        campushive@gmail.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[12px] font-bold text-[#171717] dark:text-white">Campus Desk</div>
                      <div className="text-[12.5px] text-[#5B636E] dark:text-neutral-400">
                        Student Social Centre (SUB) · Main Campus
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[12px] font-bold text-[#171717] dark:text-white">Operating Hours</div>
                      <div className="text-[12.5px] text-[#5B636E] dark:text-neutral-400">
                        Mon – Sat: 8:00 AM – 8:00 PM (WAT)
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#ECEEF2] dark:border-white/10 space-y-2">
                  <div className="text-[11.5px] font-bold uppercase tracking-wider text-[#8C929C]">Emergency Escalation</div>
                  <p className="text-[12px] text-[#5B636E] dark:text-neutral-400 leading-snug">
                    For active safety incidents on campus, contact your University Campus Security Division or report immediately via our safety protocol.
                  </p>
                </div>
              </div>

              {/* Direct Link to Chat Room */}
              <Link
                href="/help-center/chat-room"
                className="radius-native rounded-2xl border border-[#ECEEF2] dark:border-white/10 bg-white dark:bg-[#14161D] p-4.5 shadow-xs flex items-center justify-between gap-3 group hover:border-[#FFC928] dark:hover:border-[#FFC928] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#FFC928]/20 flex items-center justify-center text-[#171717] dark:text-[#FFC928]">
                    <MessageSquare className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h3 className="text-[13px] font-bold text-[#171717] dark:text-white group-hover:text-[#D97706] dark:group-hover:text-[#FFC928] transition-colors">
                      Live Support Chat Room
                    </h3>
                    <p className="text-[11.5px] text-[#68707A] dark:text-neutral-400">
                      Message a student moderator in real-time
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#8C929C] group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {/* Right: Modern Support Form */}
            <form onSubmit={handleSubmit} className="radius-native rounded-2xl border border-[#ECEEF2] dark:border-white/10 bg-white dark:bg-[#14161D] p-6 sm:p-8 shadow-xs space-y-5">
              <div>
                <h2 className="text-[16px] font-extrabold text-[#171717] dark:text-white">
                  Send a Support Request
                </h2>
                <p className="text-[12.5px] text-[#68707A] dark:text-neutral-400 mt-0.5">
                  Our moderators investigate reports, assist with verification, and resolve deal discrepancies.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[12.5px] font-bold text-[#3F454D] dark:text-neutral-300">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Amina Lawal"
                    className="radius-native w-full rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-[#181B24] px-3.5 py-2.5 text-[13px] text-[#171717] dark:text-white placeholder-[#8C929C] focus:outline-none focus:border-[#FFC928]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[12.5px] font-bold text-[#3F454D] dark:text-neutral-300">
                    Campus Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@abu.edu.ng"
                    className="radius-native w-full rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-[#181B24] px-3.5 py-2.5 text-[13px] text-[#171717] dark:text-white placeholder-[#8C929C] focus:outline-none focus:border-[#FFC928]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[12.5px] font-bold text-[#3F454D] dark:text-neutral-300">
                  Topic / Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="radius-native w-full rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-[#181B24] px-3.5 py-2.5 text-[13px] text-[#171717] dark:text-white focus:outline-none focus:border-[#FFC928] cursor-pointer"
                >
                  <option value="verification">Student Verification / Institutional Email Issue</option>
                  <option value="dispute">Transaction or Deal Dispute with Another Student</option>
                  <option value="report">Report a Scammer, Stolen Good, or Prohibited Listing</option>
                  <option value="store">Storefront Setup & Vendor Status Inquiries</option>
                  <option value="technical">Account Bug, Session Error, or Password Reset</option>
                  <option value="general">General Feedback / Campus Expansion Suggestion</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[12.5px] font-bold text-[#3F454D] dark:text-neutral-300">
                  Detailed Message *
                </label>
                <textarea
                  rows={5}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your issue with relevant details (listing titles, handles, order references)..."
                  className="radius-native w-full rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-[#181B24] px-3.5 py-2.5 text-[13px] text-[#171717] dark:text-white placeholder-[#8C929C] focus:outline-none focus:border-[#FFC928] resize-y"
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="radius-native inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FFC928] hover:bg-[#F2BD24] text-[#171717] text-[13px] font-bold shadow-xs transition-all active:scale-98 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? "Submitting..." : "Send Request"}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Frequently Asked Questions Accordion */}
          <div className="radius-native rounded-2xl border border-[#ECEEF2] dark:border-white/10 bg-white dark:bg-[#14161D] p-6 sm:p-8 shadow-xs space-y-4">
            <div className="space-y-1">
              <h2 className="text-[16px] font-extrabold text-[#171717] dark:text-white">
                Frequently Asked Questions
              </h2>
              <p className="text-[12.5px] text-[#68707A] dark:text-neutral-400">
                Instant answers to the most common questions from campus buyers and sellers.
              </p>
            </div>

            <div className="divide-y divide-[#ECEEF2] dark:divide-white/10 pt-1">
              {FAQS.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div key={faq.question} className="py-3.5">
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full flex items-center justify-between gap-3 text-left cursor-pointer group"
                    >
                      <span className="text-[13.5px] font-bold text-[#171717] dark:text-white group-hover:text-[#D97706] dark:group-hover:text-[#FFC928] transition-colors">
                        {faq.question}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-[#8C929C] shrink-0 transition-transform duration-200 ${
                          isOpen ? "rotate-180 text-[#171717] dark:text-white" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <p className="mt-2 text-[12.5px] text-[#5B636E] dark:text-neutral-300 leading-relaxed max-w-3xl animate-in fade-in duration-150">
                        {faq.answer}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      <RebrandFooter />
    </div>
  );
}
