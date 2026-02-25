"use client";

import React, { useState } from "react";
import {
    Info,
    Star,
    User,
    Clock,
    BadgeCheck,
    X,
    MessageSquare,
    Activity,
    Store,
    BarChart3,
    ShieldCheck,
    Briefcase,
    CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/utils";
import { Profile } from "../../data/profiles";
import { BadgeSystem } from "./BadgeSystem";
import { VendorListingsArea } from "./VendorListingsArea";
import { VendorPerformanceArea } from "./VendorPerformanceArea";

interface VendorProfileTabsProps {
    profile: Profile;
    viewAs: "host" | "visitor";
}

export function VendorProfileTabs({ profile, viewAs }: VendorProfileTabsProps) {
    const [activeTab, setActiveTab] = useState(profile.type === 'vendor' ? "Listings" : "About");
    const [isRecommended, setIsRecommended] = useState<boolean | null>(null);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const buyerTabs = [
        { name: "About", icon: User },
        { name: "Activity", icon: Activity },
        { name: "Reviews", icon: Star },
    ];

    const vendorTabs = [
        { name: "Listings", icon: Store },
        { name: "Performance", icon: BarChart3 },
        { name: "Reviews", icon: Star },
        { name: "About Business", icon: Briefcase },
    ];

    const isLuckyJohn = profile.handle === 'luckyjohn';
    const tabs = isLuckyJohn ? [{ name: "About", icon: User }] : (profile.type === 'vendor' ? vendorTabs : buyerTabs);

    return (
        <div className="w-full space-y-8">
            {/* Tab Navigation */}
            <div className="flex border-b border-border/40 overflow-x-auto no-scrollbar scroll-contain">
                {tabs.map((tab) => (
                    <button
                        key={tab.name}
                        onClick={() => setActiveTab(tab.name)}
                        className={`px-8 py-4 text-[13px] font-bold tracking-tight transition-all relative whitespace-nowrap ${activeTab === tab.name
                            ? "text-primary opacity-100"
                            : "text-muted-foreground/60 hover:text-foreground opacity-60 hover:opacity-100"
                            }`}
                    >
                        <div className="flex items-center gap-2.5">
                            <tab.icon className="w-4 h-4" />
                            {tab.name}
                        </div>
                        {activeTab === tab.name && (
                            <motion.div
                                layoutId="activeTabUnderline"
                                className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full shadow-[0_-2px_10px_rgba(var(--primary-rgb),0.3)]"
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="min-h-[400px]"
                >
                    {/* Common About Section */}
                    {activeTab === "About" && (
                        <div className="max-w-3xl space-y-12">
                            {isLuckyJohn ? (
                                <div className="space-y-6">
                                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50 flex items-center gap-2">
                                        <Info className="w-3 h-3" /> About {profile.name}
                                    </h3>
                                    <p className="text-sm font-medium leading-relaxed text-muted-foreground">
                                        {profile.bio}
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-4">
                                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50 flex items-center gap-2">
                                            <User className="w-3 h-3" /> Profile Stats
                                        </h3>
                                        <div className="space-y-4">
                                            {[
                                                { label: "Department", value: profile.department || "General Store" },
                                                { label: "Joined Campus", value: profile.joinedDateFull },
                                                { label: "Identity Verified", value: profile.isVerified ? "Yes, Student ID" : "Pending" },
                                            ].map((item) => (
                                                <div key={item.label} className="border-l-2 border-primary/10 pl-4 py-1">
                                                    <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60 block mb-0.5">{item.label}</span>
                                                    <span className="font-bold text-sm text-foreground/90">{item.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50 flex items-center gap-2">
                                            <BadgeCheck className="w-3 h-3" /> Quick Stats
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-secondary/20 rounded-2xl p-4 border border-border/10">
                                                <span className="text-2xl font-bold block">{profile.transactions}</span>
                                                <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">Transactions</span>
                                            </div>
                                            <div className="bg-secondary/20 rounded-2xl p-4 border border-border/10">
                                                <span className="text-2xl font-bold block">100%</span>
                                                <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">Reliability</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}



                    {/* Vendor Specific Sections */}
                    {activeTab === "Listings" && (
                        <VendorListingsArea viewAs={viewAs} />
                    )}

                    {activeTab === "Performance" && (
                        <div className="space-y-8">
                            {viewAs === "host" ? (
                                <VendorPerformanceArea
                                    vendor={{
                                        activeListings: profile.transactions, // Placeholder mapping
                                        soldItems: profile.transactions,
                                        rating: profile.rating,
                                        recommended: String(profile.recommendedCount),
                                        notRecommended: String(profile.notRecommendedCount)
                                    }}
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 space-y-6 bg-secondary/10 rounded-[40px] border-2 border-dashed border-border/20">
                                    <BadgeSystem type="transaction" value={profile.transactions} className="scale-150" />
                                    <div className="text-center space-y-1">
                                        <h4 className="font-bold text-2xl uppercase tracking-tight">Verified Achievement</h4>
                                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
                                            {profile.transactions} Total Successful Sales
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "About Business" && profile.businessInfo && (
                        <div className="max-w-3xl space-y-10">
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-primary underline underline-offset-8 decoration-2 mb-6">Extended Bio</h3>
                                <p className="text-sm font-medium leading-relaxed text-muted-foreground">
                                    {profile.businessInfo.extendedBio}
                                </p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-4">
                                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/50">Return Policies</h3>
                                    <p className="text-xs font-semibold leading-relaxed p-4 bg-orange-500/5 border border-orange-500/10 rounded-2xl text-orange-700/80">
                                        {profile.businessInfo.policies}
                                    </p>
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/50">Business Hours</h3>
                                    <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/10 rounded-2xl">
                                        <Clock className="w-5 h-5 text-primary" />
                                        <span className="text-xs font-bold text-primary">{profile.businessInfo.hours}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "Reviews" && (
                        <div className="space-y-6">
                            {/* Condensed Single Textbox Review Input */}
                            <div className="relative group">
                                <input
                                    type="text"
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Leave a review..."
                                    className="w-full bg-secondary/10 border-2 border-border/20 rounded-2xl h-14 pl-5 pr-28 text-sm font-medium focus:border-primary focus:bg-background transition-all outline-none"
                                />
                                <div className="absolute right-2 top-1.5 bottom-1.5 flex items-center gap-1.5 bg-background rounded-xl px-2 border border-border/40">
                                    <button
                                        onClick={() => setIsRecommended(true)}
                                        className={cn(
                                            "p-2 rounded-lg transition-all",
                                            isRecommended === true ? "text-emerald-500 bg-emerald-500/10" : "text-muted-foreground/30 hover:text-emerald-500"
                                        )}
                                    >
                                        <CheckCircle2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setIsRecommended(false)}
                                        className={cn(
                                            "p-2 rounded-lg transition-all",
                                            isRecommended === false ? "text-red-500 bg-red-500/10" : "text-muted-foreground/30 hover:text-red-500"
                                        )}
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                    <button
                                        disabled={isRecommended === null || !comment.trim()}
                                        className="p-2 text-primary hover:bg-primary/5 rounded-lg disabled:opacity-20 transition-all font-bold text-[10px] uppercase"
                                    >
                                        Go
                                    </button>
                                </div>
                            </div>

                            <div className="text-center py-16 bg-secondary/5 rounded-[32px] border-2 border-dashed border-border/10">
                                <Star className="w-12 h-12 text-muted-foreground/5 mx-auto mb-4" />
                                <h4 className="font-bold text-sm uppercase tracking-tight opacity-40">No verified reviews yet</h4>
                            </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
