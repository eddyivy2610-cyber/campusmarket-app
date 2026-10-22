/**
 * @BACKEND: PROFILE TABS — Review submission is client-only, listings use mock data.
 *
 * Replace with:
 *   - POST /api/users/:id/reviews  → submit a star rating + comment review
 *   - GET /api/users/:id/reviews   → fetch existing reviews (paginated)
 *   - GET /api/users/:id/listings  → fetch vendor's listings (already handled by ProfessionalListingsArea)
 */

"use client";

import React, { useMemo, useState, useEffect } from "react";
import {
    Info,
    Star,
    User,
    Clock,
    BadgeCheck,
    MessageSquare,
    Store,
    ShieldCheck,
    Briefcase,
    Instagram,
    Twitter,
    Linkedin,
    Phone
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/utils";
import { Profile } from "../../data/profiles";
import { ProfessionalListingsArea } from "./ProfessionalListingsArea";
import { IconTooltip } from "../common/IconTooltip";
import { ProUpgradePrompt } from "../shared/ProUpgradePrompt";
import { ProfessionalPerformanceArea } from "./ProfessionalPerformanceArea";

import { useAuth } from "../../context/AuthContext";

interface ProfessionalProfileTabsProps {
    profile: Profile;
    viewAs: "private" | "public";
}

export function ProfessionalProfileTabs({ profile, viewAs }: ProfessionalProfileTabsProps) {
    const isProAccount = profile.accountType === "Pro";
    const [reviewRating, setReviewRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const buyerTabs = [
        { name: "About", icon: User },
        { name: "Reviews", icon: Star },
    ];

    const vendorTabs = [
        { name: "Listings", icon: Store },
        { name: "Reviews", icon: Star },
        { name: "About", icon: Briefcase },
    ];

    const tabs = useMemo(() => {
        if (!isProAccount) {
            return buyerTabs;
        }
        return vendorTabs;
    }, [isProAccount]);

    const defaultTab = tabs[0]?.name ?? "About";
    const [activeTab, setActiveTab] = useState(defaultTab);

    useEffect(() => {
        if (!tabs.some((tab) => tab.name === activeTab)) {
            setActiveTab(defaultTab);
        }
    }, [activeTab, tabs, defaultTab]);

    const [reviews, setReviews] = useState<any[]>([]);
    const [isLoadingReviews, setIsLoadingReviews] = useState(false);
    const { user } = useAuth();

    const fetchReviews = async () => {
        try {
            setIsLoadingReviews(true);
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reviews/seller/${profile.id}`);
            const data = await response.json();
            if (data.data) {
                setReviews(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch reviews:", error);
        } finally {
            setIsLoadingReviews(false);
        }
    };

    useEffect(() => {
        if (activeTab === "Reviews") {
            fetchReviews();
        }
    }, [activeTab, profile.id]);

    const handleReviewSubmit = async () => {
        if (!user) return;
        try {
            setIsSubmitting(true);
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reviews`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("campus_token")}`
                },
                body: JSON.stringify({
                    sellerId: profile.id,
                    rating: reviewRating,
                    comment
                })
            });

            if (response.ok) {
                setComment("");
                setReviewRating(0);
                fetchReviews();
            }
        } catch (error) {
            console.error("Failed to submit review:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full space-y-8 font-heading">
            {/* Tab Navigation */}
            <div className="flex overflow-x-hidden md:overflow-x-auto no-scrollbar md:border-b md:border-border/40 w-full md:justify-center">
                {tabs.map((tab) => (
                    <button
                        key={tab.name}
                        onClick={() => setActiveTab(tab.name)}
                        className={`flex-1 px-2 py-4 text-[10px] md:text-[13px] font-bold tracking-tight transition-all relative whitespace-nowrap ${activeTab === tab.name
                            ? "text-[#FFD700] opacity-100"
                            : "text-muted-foreground/60 hover:text-black opacity-60 hover:opacity-100"
                            }`}
                    >
                        <div className="flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2">
                            <tab.icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            {tab.name}
                        </div>
                        {activeTab === tab.name && (
                            <motion.div
                                layoutId="activeTabUnderline"
                                className="absolute bottom-0 left-0 right-0 h-1.5 md:h-1 bg-[#FFD700] rounded-t-full md:shadow-[0_-2px_10px_rgba(255,215,0,0.35)]"
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                                <div className="space-y-4">
                                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50 flex items-center gap-2">
                                        <User className="w-3 h-3" /> ~profile
                                    </h3>
                                    <div className="space-y-4">
                                        {[
                                            {
                                                label: profile.userStatus === 'student' ? "Student from" : 
                                                       profile.userStatus === 'alumni' ? "Alumni from" : 
                                                       "Community Member",
                                                value: profile.userStatus === 'community' ? "Community Member" : profile.location,
                                            },
                                            { label: "Date Joined", value: profile.joinedDateFull },
                                            { label: "Verified Member", value: profile.isVerified ? "Yes (Verified via Email)" : "No" }
                                        ].map((item) => (
                                            <div key={item.label} className="border-l-2 border-[#FFD700]/20 pl-4 py-1">
                                                <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60 block mb-0.5">{item.label}</span>
                                                {item.label !== "Community Member" && (
                                                    <span className="font-bold text-sm text-foreground/90">{item.value}</span>
                                                )}
                                            </div>
                                        ))}

                                        {/* Social Links */}
                                        {(profile.socialLinks?.whatsapp || profile.socialLinks?.instagram || profile.socialLinks?.twitter || profile.socialLinks?.linkedin) && (
                                            <div className="border-l-2 border-[#FFD700]/20 pl-4 py-1">
                                                <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60 block mb-2">Social Links</span>
                                                <div className="flex items-center gap-3">
                                                    {profile.socialLinks?.whatsapp && (
                                                        <IconTooltip content="WhatsApp" position="top">
                                                            <a href={profile.socialLinks?.whatsapp} target="_blank" rel="noopener noreferrer" className="p-2 bg-green-500/10 text-green-600 rounded-xl hover:bg-green-500/20 transition-colors">
                                                                <Phone className="w-4 h-4" />
                                                            </a>
                                                        </IconTooltip>
                                                    )}
                                                    {profile.socialLinks?.instagram && (
                                                        <IconTooltip content="Instagram" position="top">
                                                            <a href={profile.socialLinks?.instagram} target="_blank" rel="noopener noreferrer" className="p-2 bg-pink-500/10 text-pink-600 rounded-xl hover:bg-pink-500/20 transition-colors">
                                                                <Instagram className="w-4 h-4" />
                                                            </a>
                                                        </IconTooltip>
                                                    )}
                                                    {profile.socialLinks?.twitter && (
                                                        <IconTooltip content="Twitter" position="top">
                                                            <a href={profile.socialLinks?.twitter} target="_blank" rel="noopener noreferrer" className="p-2 bg-blue-500/10 text-blue-600 rounded-xl hover:bg-blue-500/20 transition-colors">
                                                                <Twitter className="w-4 h-4" />
                                                            </a>
                                                        </IconTooltip>
                                                    )}
                                                    {profile.socialLinks?.linkedin && (
                                                        <IconTooltip content="LinkedIn" position="top">
                                                            <a href={profile.socialLinks?.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 bg-indigo-500/10 text-indigo-600 rounded-xl hover:bg-indigo-500/20 transition-colors">
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
                                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary underline underline-offset-8 decoration-2 mb-6 inline-block">Bio / About</h3>
                                    <p className="text-sm font-medium leading-relaxed text-muted-foreground">
                                        {profile.bio}
                                    </p>
                                </div>

                                {isProAccount && (
                                    <div className="md:col-span-2 pt-6">
                                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50 mb-4 flex items-center gap-2">
                                            Performance Metrics
                                        </h3>
                                        <ProfessionalPerformanceArea 
                                            vendor={{
                                                activeListings: profile.activeListingsCount || 0,
                                                soldItems: profile.soldItems || 0,
                                                rating: profile.rating || 0,
                                                recommended: String(profile.recommendedCount || 0),
                                                notRecommended: String(profile.notRecommendedCount || 0)
                                            }} 
                                        />
                                    </div>
                                )}

                                {isProAccount && profile.businessInfo && (
                                    <>
                                        <div className="space-y-4">
                                            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">Return Policies</h3>
                                            <p className="text-xs font-semibold leading-relaxed p-4 bg-[#fff3c6] border border-[#FFD700]/20 rounded-2xl text-black/70">
                                                {profile.businessInfo?.policies}
                                            </p>
                                        </div>
                                        <div className="space-y-4">
                                            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">Business Hours</h3>
                                            <div className="flex items-center gap-3 p-4 bg-[#fff3c6] border border-[#FFD700]/20 rounded-2xl">
                                                <Clock className="w-5 h-5 text-black" />
                                                <span className="text-xs font-bold text-black">{profile.businessInfo?.hours}</span>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === "Listings" && (
                        isProAccount ? (
                            <ProfessionalListingsArea viewAs={viewAs} sellerId={profile.id} />
                        ) : (
                            <ProUpgradePrompt
                                title="Unlock Seller Listings"
                                featureName="your seller listings"
                                description="Apply for a seller account to display your items to the Hive community."
                            />
                        )
                    )}


                    {activeTab === "Reviews" && (
                        <div className="space-y-8">
                            {/* Condensed Single Textbox Review Input */}
                            {viewAs === 'public' && user && (
                                <div className="relative group">
                                    <input
                                        type="text"
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder="Leave a review..."
                                        className="w-full bg-secondary/10 border-2 border-border/20 rounded-2xl h-14 pl-5 pr-28 text-sm font-medium focus:border-[#FFD700] focus:bg-background transition-all outline-none"
                                    />
                                    <div className="absolute right-2 top-1.5 bottom-1.5 flex items-center gap-1 bg-background rounded-xl px-2 border border-border/40">
                                        <div className="flex items-center gap-0.5 pr-1">
                                            {[1, 2, 3, 4, 5].map((s) => (
                                                <button
                                                    key={s}
                                                    type="button"
                                                    onClick={() => setReviewRating(s)}
                                                    onMouseEnter={() => setHoverRating(s)}
                                                    onMouseLeave={() => setHoverRating(0)}
                                                    className="p-0.5 transition-transform hover:scale-125"
                                                >
                                                    <Star
                                                        className={`w-4 h-4 transition-colors ${s <= (hoverRating || reviewRating)
                                                            ? 'text-amber-400 fill-amber-400'
                                                            : 'text-muted-foreground/20'
                                                            }`}
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                        <button
                                            onClick={handleReviewSubmit}
                                            disabled={isSubmitting || reviewRating === 0 || !comment.trim()}
                                            className="p-2 text-[#FFD700] hover:bg-[#FFD700]/10 rounded-lg disabled:opacity-20 transition-all font-bold text-[10px] uppercase"
                                        >
                                            {isSubmitting ? "..." : "Go"}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {isLoadingReviews ? (
                                <div className="flex justify-center py-20">
                                    <div className="w-8 h-8 border-4 border-[#FFD700] border-t-transparent rounded-full animate-spin" />
                                </div>
                            ) : reviews.length > 0 ? (
                                <div className="grid gap-6">
                                    {reviews.map((review) => (
                                        <div key={review._id} className="p-6 bg-secondary/5 rounded-[24px] border border-border/40 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full overflow-hidden bg-secondary/20">
                                                        {review.reviewerId?.profile?.avatar ? (
                                                            <img src={review.reviewerId.profile.avatar} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-primary font-bold">
                                                                {review.reviewerId?.profile?.displayName?.charAt(0) || "U"}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold">{review.reviewerId?.profile?.displayName || "Anonymous"}</p>
                                                        <div className="flex items-center gap-0.5">
                                                            {[1, 2, 3, 4, 5].map((s) => (
                                                                <Star
                                                                    key={s}
                                                                    className={`w-3 h-3 ${s <= review.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/20"}`}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                                <span className="text-[10px] font-medium text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-sm text-muted-foreground leading-relaxed italic">"{review.comment}"</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16 bg-secondary/5 rounded-[32px] border-2 border-dashed border-border/10">
                                    <Star className="w-12 h-12 text-muted-foreground/5 mx-auto mb-4" />
                                    <h4 className="font-bold text-sm uppercase tracking-tight opacity-40">No verified reviews yet</h4>
                                </div>
                            )}
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
