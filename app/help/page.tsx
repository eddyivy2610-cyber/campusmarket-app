"use client";

import React, { useState } from "react";
import { Header } from "../components/header/Header";
import { Footer } from "../components/sections/Footer";
import { Search, BookOpen, MessageCircleQuestion, Users, ChevronDown } from "lucide-react";

// Types
interface AccordionItem {
    id: string;
    question: string;
    answer: string;
}

// Data
const GETTING_STARTED_ITEMS: AccordionItem[] = [
    {
        id: "gs-1",
        question: "General Description",
        answer: "Campus Market is a centralized platform for university students to buy, sell, and trade items safely within their campus community.",
    },
    {
        id: "gs-2",
        question: "Installation Guides",
        answer: "Our platform is accessible via any modern web browser. Simply navigate to campusmarket.com. For mobile users, you can add our progressive web app (PWA) to your home screen for quick access.",
    },
    {
        id: "gs-3",
        question: "Additional Options and Services",
        answer: "Beyond basic buying and selling, Campus Market offers premium professional profiles, integrated campus event ticketing, and community forums.",
    },
];

const SALES_QUESTIONS_ITEMS: AccordionItem[] = [
    {
        id: "sq-1",
        question: "Before Your Purchase",
        answer: "Always verify the seller's rating and review history. For high-value items, we recommend meeting in public, well-lit campus areas or designated 'safe trade' zones.",
    },
    {
        id: "sq-2",
        question: "Purchase Process",
        answer: "Once you agree on a price, you can use our secure in-app messaging to arrange a meeting time and place. Payment can be handled in cash or via your preferred peer-to-peer payment app.",
    },
    {
        id: "sq-3",
        question: "Payment & Purchase Troubleshooting",
        answer: "If an item significantly deviates from its description, please report the listing and the seller immediately using the 'Report' button on their profile or listing page.",
    },
];

const RECENT_ARTICLES = [
    {
        id: 1,
        title: "How to Price Your Used Textbooks",
        date: "December 19, 2023",
        authorImg: "bg-blue-200", // Using placeholder colors
        authorInitials: "bg-blue-600",
    },
    {
        id: 2,
        title: "7 Tips for Safe Swaps on Campus",
        date: "October 12, 2023",
        authorImg: "bg-purple-200",
        authorInitials: "bg-purple-600",
    },
    {
        id: 3,
        title: "The Best Spots to Meet for an Exchange",
        date: "September 20, 2023",
        authorImg: "bg-green-200",
        authorInitials: "bg-green-600",
    },
];

// Reusable Accordion Component
function Accordion({ items }: { items: AccordionItem[] }) {
    const [openId, setOpenId] = useState<string | null>(null);

    return (
        <div className="space-y-3">
            {items.map((item) => {
                const isOpen = openId === item.id;
                return (
                    <div
                        key={item.id}
                        className="bg-card border border-border/50 rounded-xl overflow-hidden transition-all shadow-sm"
                    >
                        <button
                            onClick={() => setOpenId(isOpen ? null : item.id)}
                            className="w-full flex items-center justify-between p-4 text-left bg-white hover:bg-secondary/20 transition-colors"
                        >
                            <span className="font-bold text-sm text-primary">
                                {item.question}
                            </span>
                            <div className={`w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}>
                                <ChevronDown className="w-3.5 h-3.5 text-primary" />
                            </div>
                        </button>
                        <div
                            className={`grid transition-all duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
                        >
                            <div className="overflow-hidden">
                                <p className="px-4 pb-4 pt-1 text-xs text-muted-foreground leading-relaxed">
                                    {item.answer}
                                </p>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default function HelpCenterPage() {
    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
            <Header />

            <main className="flex-1 relative overflow-hidden">

                {/* Decorative background grid (subtle) */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-10" />

                <div className="w-full max-w-[1400px] mx-auto relative flex justify-center pt-10 pb-16">

                    {/* Left Image Placeholders */}
                    <div className="hidden lg:flex absolute left-4 xl:left-8 top-10 w-[240px] xl:w-[280px] h-[600px] rounded-3xl border-2 border-dashed border-border/60 bg-secondary/30 items-center justify-center blueprint-label shadow-sm">
                        Left Image 1
                    </div>
                    <div className="hidden lg:flex absolute left-4 xl:left-8 top-[640px] w-[240px] xl:w-[280px] h-[600px] rounded-3xl border-2 border-dashed border-border/60 bg-secondary/30 items-center justify-center blueprint-label shadow-sm">
                        Left Image 2
                    </div>

                    <div className="max-w-3xl w-full px-4 sm:px-6 lg:px-8">

                        {/* Hero Section */}
                        <div className="text-center mb-12">
                            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-6">
                                How can we <span className="relative inline-block pb-1">
                                    help you?
                                    <div className="absolute bottom-0 left-0 w-full h-1 bg-primary/80 rounded-full" />
                                </span>
                            </h1>

                            <div className="relative max-w-xl mx-auto mb-5">
                                <input
                                    type="text"
                                    placeholder="Start typing your search..."
                                    className="w-full bg-white border border-border/80 shadow-sm rounded-full py-3 pl-5 pr-14 text-sm font-heading focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 transition-shadow"
                                />
                                <button className="absolute right-2 top-2 w-8 h-8 bg-orange-400 hover:bg-orange-500 rounded-full flex items-center justify-center text-white transition-colors shadow-md shadow-orange-500/20 active:scale-[0.98]">
                                    <Search className="w-4 h-4 font-bold" />
                                </button>
                            </div>

                            <p className="text-xs text-muted-foreground font-medium">
                                Or <strong className="text-foreground">choose</strong> an option below to find what you need.
                            </p>
                        </div>

                        {/* Category Cards */}
                        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-16">
                            {[
                                { icon: BookOpen, title: "Guides", desc: "Detailed walkthroughs and tutorials for all features." },
                                { icon: MessageCircleQuestion, title: "FAQ", desc: "Quick answers to the most common questions." },
                                { icon: Users, title: "Community", desc: "Connect with others and share experiences." },
                            ].map((card, idx) => (
                                <div key={idx} className="bg-white border border-border/50 rounded-xl sm:rounded-2xl p-3 sm:p-6 text-center shadow-lg shadow-black/5 hover:-translate-y-1 transition-transform duration-300 flex flex-col items-center justify-center">
                                    <div className="w-8 h-8 sm:w-12 sm:h-12 bg-primary/10 rounded-lg sm:rounded-xl flex items-center justify-center mb-2 sm:mb-4 text-primary shrink-0">
                                        <card.icon className="w-4 h-4 sm:w-6 sm:h-6" strokeWidth={1.5} />
                                    </div>
                                    <h3 className="font-bold text-[10px] sm:text-base leading-tight mb-0.5 sm:mb-1.5">{card.title}</h3>
                                    <p className="hidden sm:block text-[11px] text-muted-foreground leading-relaxed px-1">
                                        {card.desc}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Accordion Sections */}
                        <div className="space-y-12 mb-16">
                            {/* Getting Started */}
                            <section>
                                <div className="text-center mb-6">
                                    <h2 className="text-xl font-bold mb-1.5">Getting Started</h2>
                                    <p className="text-xs text-muted-foreground">Everything you need to know to get up and running.</p>
                                </div>
                                <Accordion items={GETTING_STARTED_ITEMS} />
                            </section>

                            {/* Sales Questions */}
                            <section>
                                <div className="text-center mb-6">
                                    <h2 className="text-xl font-bold mb-1.5">Sales Questions</h2>
                                    <p className="text-xs text-muted-foreground">Information regarding purchasing, selling, and transactions.</p>
                                </div>
                                <Accordion items={SALES_QUESTIONS_ITEMS} />
                            </section>
                        </div>

                        {/* Bottom Articles */}
                        <section>
                            <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory hide-scrollbar">
                                {RECENT_ARTICLES.map((article) => (
                                    <div key={article.id} className="min-w-[240px] sm:min-w-[280px] bg-white border border-border/50 rounded-xl p-4 shadow-sm snap-start shrink-0">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${article.authorImg}`}>
                                                <div className={`w-2.5 h-2.5 rounded-full ${article.authorInitials}`} />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-bold text-muted-foreground/80 uppercase tracking-wider">{article.date}</p>
                                            </div>
                                        </div>
                                        <h4 className="font-bold text-primary text-sm leading-snug mb-2.5">
                                            {article.title}
                                        </h4>
                                        <div className="w-full h-1 bg-secondary rounded-full overflow-hidden">
                                            <div className="w-1/3 h-full bg-primary/20 rounded-full" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                    </div>

                    {/* Right Image Placeholders */}
                    <div className="hidden lg:flex absolute right-4 xl:right-8 top-10 w-[240px] xl:w-[280px] h-[600px] rounded-3xl border-2 border-dashed border-border/60 bg-secondary/30 items-center justify-center blueprint-label shadow-sm">
                        Right Image 1
                    </div>
                    <div className="hidden lg:flex absolute right-4 xl:right-8 top-[640px] w-[240px] xl:w-[280px] h-[600px] rounded-3xl border-2 border-dashed border-border/60 bg-secondary/30 items-center justify-center blueprint-label shadow-sm">
                        Right Image 2
                    </div>

                </div>
            </main>

            <Footer />
        </div>
    );
}
