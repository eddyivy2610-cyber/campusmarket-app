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
    CheckCircle2,
    Instagram,
    Twitter,
    Linkedin,
    Phone
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/utils";
import { Profile } from "../../data/profiles";
import { ProfessionalListingsArea } from "./ProfessionalListingsArea";
import { ProfessionalPerformanceArea } from "./ProfessionalPerformanceArea";
import { IconTooltip } from "../common/IconTooltip";
import { ProUpgradePrompt } from "../shared/ProUpgradePrompt";

interface ProfessionalProfileTabsProps {
    profile: Profile;
    viewAs: "private" | "public";
}

export function ProfessionalProfileTabs({ profile, viewAs }: ProfessionalProfileTabsProps) {
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
        { name: "About", icon: Briefcase },
    ];

    const isLuckyJohn = profile.handle === 'luckyjohn';
    const tabs = (profile.type === 'vendor' ? vendorTabs : buyerTabs);

    return (
        <div className="w-full space-y-8 font-heading">
            {/* Tab Navigation */}
            <div className="flex overflow-x-hidden md:overflow-x-auto no-scrollbar md:border-b md:border-border/40 w-full md:justify-center">
                {tabs.map((tab) => (
                    <button
                        key={tab.name}
                        onClick={() => setActiveTab(tab.name)}
                        className={`flex-1 px-2 py-4 text-[10px] md:text-[13px] font-bold tracking-tight transition-all relative whitespace-nowrap ${activeTab === tab.name
                            ? "text-primary opacity-100"
                            : "text-muted-foreground/60 hover:text-foreground opacity-60 hover:opacity-100"
                            }`}
                    >
                        <div className="flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2">
                            <tab.icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            {tab.name}
                        </div>
                        {activeTab === tab.name && (
                            <motion.div
                                layoutId="activeTabUnderline"
                                className="absolute bottom-0 left-0 right-0 h-1.5 md:h-1 bg-orange-500 md:bg-primary rounded-t-full md:shadow-[0_-2px_10px_rgba(var(--primary-rgb),0.3)]"
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
                    {/* Unified About Section */}
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
                                profile.businessInfo && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                                        <div className="space-y-4">
                                            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50 flex items-center gap-2">
                                                <User className="w-3 h-3" /> ~profile
                                            </h3>
                                            <div className="space-y-4">
                                                {[
                                                    { label: "School Department", value: profile.department || "Computer Science" },
                                                    { label: "Date Joined", value: profile.joinedDateFull }
                                                ].map((item) => (
                                                    <div key={item.label} className="border-l-2 border-primary/10 pl-4 py-1">
                                                        <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60 block mb-0.5">{item.label}</span>
                                                        <span className="font-bold text-sm text-foreground/90">{item.value}</span>
                                                    </div>
                                                ))}

                                                {/* Social Links */}
                                                {(profile.socialLinks?.whatsapp || profile.socialLinks?.instagram || profile.socialLinks?.twitter || profile.socialLinks?.linkedin) && (
                                                    <div className="border-l-2 border-primary/10 pl-4 py-1">
                                                        <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60 block mb-2">Social Links</span>
                                                        <div className="flex items-center gap-3">
                                                            {profile.socialLinks.whatsapp && (
                                                                <IconTooltip content="WhatsApp" position="top">
                                                                    <a href={profile.socialLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="p-2 bg-green-500/10 text-green-600 rounded-xl hover:bg-green-500/20 transition-colors">
                                                                        <Phone className="w-4 h-4" />
                                                                    </a>
                                                                </IconTooltip>
                                                            )}
                                                            {profile.socialLinks.instagram && (
                                                                <IconTooltip content="Instagram" position="top">
                                                                    <a href={profile.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="p-2 bg-pink-500/10 text-pink-600 rounded-xl hover:bg-pink-500/20 transition-colors">
                                                                        <Instagram className="w-4 h-4" />
                                                                    </a>
                                                                </IconTooltip>
                                                            )}
                                                            {profile.socialLinks.twitter && (
                                                                <IconTooltip content="Twitter" position="top">
                                                                    <a href={profile.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="p-2 bg-blue-500/10 text-blue-600 rounded-xl hover:bg-blue-500/20 transition-colors">
                                                                        <Twitter className="w-4 h-4" />
                                                                    </a>
                                                                </IconTooltip>
                                                            )}
                                                            {profile.socialLinks.linkedin && (
                                                                <IconTooltip content="LinkedIn" position="top">
                                                                    <a href={profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 bg-indigo-500/10 text-indigo-600 rounded-xl hover:bg-indigo-500/20 transition-colors">
                                                                        <Linkedin className="w-4 h-4" />
                                                                    </a>
                                                                </IconTooltip>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary underline underline-offset-8 decoration-2 mb-6 inline-block">Extended Bio</h3>
                                            <p className="text-sm font-medium leading-relaxed text-muted-foreground">
                                                {profile.businessInfo?.extendedBio}
                                            </p>
                                        </div>

                                        <div className="space-y-4">
                                            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">Return Policies</h3>
                                            <p className="text-xs font-semibold leading-relaxed p-4 bg-orange-500/5 border border-orange-500/10 rounded-2xl text-orange-700/80">
                                                {profile.businessInfo?.policies}
                                            </p>
                                        </div>
                                        <div className="space-y-4">
                                            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">Business Hours</h3>
                                            <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/10 rounded-2xl">
                                                <Clock className="w-5 h-5 text-primary" />
                                                <span className="text-xs font-bold text-primary">{profile.businessInfo?.hours}</span>
                                            </div>
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    )}

                    {activeTab === "Listings" && (
                        !profile.isVerified ? (
                            <ProUpgradePrompt
                                title="Unlock Seller Listings"
                                featureName="your seller listings"
                                description="Upgrade to a Pro account to display your items to the Campus Market community."
                            />
                        ) : (
                            <ProfessionalListingsArea viewAs={viewAs} sellerId={profile.id} />
                        )
                    )}

                    {activeTab === "Performance" && (
                        <div className="space-y-8">
                            {!profile.isVerified ? (
                                <ProUpgradePrompt
                                    title="Unlock Performance Data"
                                    featureName="performance analytics"
                                    description="Upgrade to a Pro account to view analytics and track your sales."
                                />
                            ) : viewAs === "private" ? (
                                <ProfessionalPerformanceArea
                                    vendor={{
                                        activeListings: profile.activeListingsCount || 0,
                                        soldItems: profile.soldItems || 0,
                                        rating: profile.rating,
                                        recommended: profile.recommendedCount.toString(),
                                        notRecommended: profile.notRecommendedCount.toString()
                                    }}
                                />
                            ) : (
                                <div className="text-center py-16 bg-secondary/5 rounded-[32px] border-2 border-dashed border-border/10">
                                    <BarChart3 className="w-12 h-12 text-muted-foreground/5 mx-auto mb-4" />
                                    <h4 className="font-bold text-sm uppercase tracking-tight opacity-40">Performance data is private</h4>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "Reviews" && (
                        !profile.isVerified ? (
                            <ProUpgradePrompt
                                title="Unlock Customer Reviews"
                                featureName="customer reviews"
                                description="Upgrade to a Pro account to receive and manage feedback."
                            />
                        ) : (
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
                                        <IconTooltip content="Recommend" position="top">
                                            <button
                                                onClick={() => setIsRecommended(true)}
                                                className={cn(
                                                    "p-2 rounded-lg transition-all",
                                                    isRecommended === true ? "text-emerald-500 bg-emerald-500/10" : "text-muted-foreground/30 hover:text-emerald-500"
                                                )}
                                            >
                                                <CheckCircle2 className="w-4 h-4" />
                                            </button>
                                        </IconTooltip>
                                        <IconTooltip content="Do Not Recommend" position="top">
                                            <button
                                                onClick={() => setIsRecommended(false)}
                                                className={cn(
                                                    "p-2 rounded-lg transition-all",
                                                    isRecommended === false ? "text-red-500 bg-red-500/10" : "text-muted-foreground/30 hover:text-red-500"
                                                )}
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </IconTooltip>
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
                        )
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
