/**
 * @BACKEND: PROFILE HEADER — Avatar and cover photo uploads are client-side only (preview via URL.createObjectURL).
 *
 * Replace with:
 *   - POST /api/users/me/avatar  → upload avatar image to file storage, update user record
 *   - POST /api/users/me/cover   → upload cover photo to file storage, update user record
 *   - Profile data (name, rating, stats) should come from GET /api/users/:id
 */

"use client";

import React from "react";
import {
    MessageSquare,
    Settings,
    ShieldAlert,
    ThumbsUp,
    ThumbsDown,
    Star,
    LayoutGrid,
    CheckCircle,
    MoreHorizontal,
    Camera,
    BadgeCheck,
    Flag,
} from "lucide-react";
import { motion } from "framer-motion";
import { ReportDropdown } from "../common/ReportDropdown";
import { Profile } from "../../data/profiles";
import { StudentCapOverlay, AchievementBadge } from "./BadgeSystem";
import Link from "next/link";
import { IconTooltip } from "../common/IconTooltip";

interface ProfessionalProfileHeaderProps {
    profile: Profile;
    viewAs: "private" | "public";
}

export function ProfessionalProfileHeader({ profile, viewAs }: ProfessionalProfileHeaderProps) {
    const isHost = viewAs === "private";
    const avatarInputRef = React.useRef<HTMLInputElement>(null);
    const coverInputRef = React.useRef<HTMLInputElement>(null);
    const [previewAvatar, setPreviewAvatar] = React.useState<string | null>(null);
    const [previewCover, setPreviewCover] = React.useState<string | null>(null);

    const handleAvatarUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setPreviewAvatar(url);
        }
    };

    const handleCoverUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setPreviewCover(url);
        }
    };

    return (
        <div className="w-full space-y-6 font-heading">
            {/* Hidden Photo Inputs */}
            <input
                type="file"
                ref={avatarInputRef}
                onChange={handleAvatarUpdate}
                accept="image/*"
                className="hidden"
            />
            <input
                type="file"
                ref={coverInputRef}
                onChange={handleCoverUpdate}
                accept="image/*"
                className="hidden"
            />

            {/* Main Header Card - overflow-hidden removed so dropdown isn't clipped */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="bg-card border border-border/50 rounded-[24px] shadow-sm relative flex flex-col"
            >
                {/* TOP AREA: overflow-hidden + rounded-t-[24px] so cover photo still clips correctly */}
                <div className="relative w-full overflow-hidden rounded-t-[24px] p-5 md:p-7">
                    {/* Cover Photo Background */}
                    <div className="absolute inset-0 z-0">
                        {(previewCover || profile.coverPhoto) ? (
                            <img
                                src={previewCover || profile.coverPhoto}
                                alt="Cover"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-secondary/30" />
                        )}
                        {/* Adaptive Dark Overlay */}
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
                    </div>

                    {/* Edit Cover - host only */}
                    {isHost && (
                        <button
                            onClick={() => coverInputRef.current?.click()}
                            className="absolute top-4 right-4 flex items-center gap-2 bg-black/30 hover:bg-black/50 text-white px-3 py-2 rounded-lg backdrop-blur-md transition-all active:scale-95 border border-white/10 z-20"
                        >
                            <IconTooltip content="Edit Cover Photo" position="left">
                                <Camera className="w-4 h-4" />
                            </IconTooltip>
                            <span className="text-[10px] font-medium">Edit Cover</span>
                        </button>
                    )}

                    {/* Mobile/Desktop Layout Transition */}
                    <div className="relative z-10 flex flex-col md:grid md:grid-cols-3 gap-4 md:gap-8 items-center">

                        {/* Column 1: Trust Signals */}
                        <div className="hidden md:flex flex-col items-center md:items-start gap-4">
                            {profile.type === 'vendor' && (
                                <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-5 flex flex-col items-center gap-3 shadow-2xl transition-all hover:bg-white/10">
                                    <div className="flex items-center gap-0.5">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <Star
                                                key={s}
                                                className={`w-5 h-5 ${s <= Math.round(profile.rating) ? "fill-amber-300 text-amber-300/80" : "text-white/20"}`}
                                            />
                                        ))}
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xl font-bold text-white">{profile.rating}<span className="text-sm text-white/50">/5.0</span></p>
                                        <p className="text-[9px] font-medium text-white/40 mt-0.5">{profile.recommendedCount + profile.notRecommendedCount} Total Reviews</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Column 2: Central Profile Info */}
                        <div className="flex flex-col items-center text-center order-first md:order-none">
                            <div className="relative mb-3 md:mb-6 group/avatar">
                                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden ring-4 ring-white/30 ring-offset-4 ring-offset-transparent shadow-2xl bg-secondary/30 relative z-20 transition-all group-hover:ring-white/50">
                                    {previewAvatar || profile.avatar ? (
                                        <img
                                            src={previewAvatar || profile.avatar}
                                            alt={profile.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary text-3xl font-bold">
                                            {profile.name.charAt(0)}
                                        </div>
                                    )}
                                </div>

                                {isHost && (
                                    <button
                                        onClick={() => avatarInputRef.current?.click()}
                                        className="absolute -bottom-1 -right-1 w-8 h-8 md:w-9 md:h-9 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white shadow-xl active:scale-95 transition-all z-30 hover:bg-white/20"
                                    >
                                        <IconTooltip content="Edit Profile Photo" position="right">
                                            <Camera className="w-3.5 h-3.5" />
                                        </IconTooltip>
                                    </button>
                                )}
                            </div>

                            <div className="space-y-1 md:space-y-1.5">
                                <div className="flex items-center justify-center gap-2">
                                    <h1 className="text-lg md:text-2xl font-bold text-white tracking-tight drop-shadow-sm">
                                        {profile.name}
                                    </h1>
                                    {profile.isVerified && (
                                        <IconTooltip content="Pro Member" position="top">
                                            <BadgeCheck className="w-5 h-5 text-blue-300 fill-white/10" />
                                        </IconTooltip>
                                    )}
                                </div>
                                <div className="flex flex-col items-center text-center">
                                    <span className="text-[9px] md:text-[10px] font-semibold text-white/50 uppercase tracking-widest mb-0.5">
                                        {profile.type === 'vendor' ? "PRO MEMBER FROM" : "MEMBER FROM"}
                                    </span>
                                    <span className="text-xs md:text-sm font-semibold text-white/90">
                                        {profile.location}
                                    </span>
                                    <span className="text-[9px] md:text-[10px] font-medium text-white/30 mt-0.5">
                                        Joined {profile.joinedDate}
                                    </span>
                                </div>
                            </div>

                        </div>

                        {/* Column 3: Stats Board */}
                        <div className="flex justify-center md:justify-end md:gap-10 w-full md:w-auto">
                            {profile.type === 'vendor' && (
                                <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-3 md:p-4 flex items-center justify-between md:justify-start gap-4 md:gap-10 shadow-2xl w-full md:w-auto">
                                    {/* Star Rating - Mobile Only */}
                                    <div className="flex flex-col items-center gap-1 md:hidden">
                                        <div className="flex items-center gap-0.5">
                                            {[1, 2, 3, 4, 5].map((s) => (
                                                <Star
                                                    key={s}
                                                    className={`w-3.5 h-3.5 ${s <= Math.round(profile.rating) ? "fill-amber-300 text-amber-300/80" : "text-white/20"}`}
                                                />
                                            ))}
                                        </div>
                                        <p className="text-sm font-bold text-white">{profile.rating}<span className="text-[10px] text-white/50">/5</span></p>
                                        <p className="text-[8px] font-medium text-white/40">{profile.recommendedCount + profile.notRecommendedCount} reviews</p>
                                    </div>

                                    <div className="w-px h-8 bg-white/10 md:hidden" />

                                    <div className="flex items-center gap-4 md:gap-10">
                                        <div className="flex flex-col items-center text-center group">
                                            <IconTooltip content="Currently Active Items">
                                                <div className="p-2 bg-amber-400/10 border border-amber-400/20 rounded-xl mb-1 md:p-2.5 md:mb-1.5 transition-colors group-hover:bg-amber-400/20">
                                                    <LayoutGrid className="w-4 h-4 text-amber-300 md:w-5 md:h-5" />
                                                </div>
                                            </IconTooltip>
                                            <span className="text-[8px] md:text-[9px] font-medium text-white/40 mb-0.5">Active Items</span>
                                            <span className="text-sm md:text-lg font-semibold text-white">{profile.activeListingsCount || 0}</span>
                                        </div>
                                        <div className="flex flex-col items-center text-center group">
                                            <IconTooltip content="Successfully Sold Items">
                                                <div className="p-2 bg-emerald-400/10 border border-emerald-400/20 rounded-xl mb-1 md:p-2.5 md:mb-1.5 transition-colors group-hover:bg-emerald-400/20">
                                                    <CheckCircle className="w-4 h-4 text-emerald-300 md:w-5 md:h-5" />
                                                </div>
                                            </IconTooltip>
                                            <span className="text-[8px] md:text-[9px] font-medium text-white/40 mb-0.5">Sold Items</span>
                                            <span className="text-sm md:text-lg font-semibold text-white">{profile.soldItems || 0}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* BOTTOM AREA: Settings & Tools Section */}
                <div className="px-6 py-5 md:px-8 md:py-6 bg-card dark:bg-card/50 border-t border-border/50 flex flex-col md:flex-row items-center justify-center md:justify-between gap-4 relative min-h-[90px] md:min-h-0">
                    <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto">
                        {viewAs === 'private' ? (
                            <>
                                <Link href="/dashboard" className="flex-1 md:flex-none w-full md:w-auto">
                                    <button className="w-full flex items-center justify-center gap-2 bg-foreground text-background font-semibold px-4 md:px-8 py-2.5 md:py-3 rounded-lg md:rounded-xl hover:opacity-90 active:scale-95 transition-all text-[10px] md:text-[11px] uppercase tracking-wide shadow-lg shadow-black/5">
                                        Dashboard
                                    </button>
                                </Link>
                            </>
                        ) : (
                            <>
                                <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-foreground text-background font-semibold px-4 md:px-8 py-2.5 md:py-3 rounded-lg md:rounded-xl hover:opacity-90 active:scale-95 transition-all text-[10px] md:text-[11px] uppercase tracking-wide shadow-lg shadow-black/5">
                                    Message
                                </button>
                                <ReportDropdown
                                    reportType="profile"
                                    targetId={profile.handle}
                                    triggerClassName="p-2.5 md:p-3 bg-secondary/40 text-muted-foreground rounded-lg md:rounded-xl border border-border/30 hover:text-rose-500 hover:bg-rose-500/5 transition-all flex items-center justify-center"
                                    align="left"
                                />
                            </>
                        )}
                    </div>

                    {/* Absolute centered achievements row */}
                    <div className="flex-1 md:absolute md:left-1/2 md:-translate-x-1/2 flex items-center justify-center gap-3 px-2 py-2 md:py-0">
                        {profile.achievements?.map((achievement, idx) => (
                            <AchievementBadge
                                key={idx}
                                achievement={achievement}
                                className="scale-90 md:scale-100"
                            />
                        ))}
                    </div>

                    <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto justify-center md:justify-end md:min-w-[120px]">
                        {viewAs === 'private' && (
                            <Link href="/settings" className="w-full md:w-auto">
                                <button className="w-full flex items-center justify-center gap-2 bg-secondary/50 text-foreground font-semibold px-4 md:px-6 py-2.5 md:py-3 rounded-lg md:rounded-xl border border-border/40 hover:bg-secondary transition-all text-[10px] md:text-[11px] group">
                                    <IconTooltip content="Settings" position="top">
                                        <Settings className="w-3.5 h-3.5 md:w-4 md:h-4 text-muted-foreground group-hover:rotate-45 transition-transform" />
                                    </IconTooltip>
                                    Settings
                                </button>
                            </Link>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
