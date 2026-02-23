"use client";

import React from "react";
import {
    MapPin,
    MessageSquare,
    Pencil,
    Settings,
    ShieldAlert,
    Clock,
} from "lucide-react";
import { motion } from "framer-motion";
import { ReportDropdown } from "../common/ReportDropdown";
import { Profile } from "../../data/profiles";
import { BadgeSystem, StudentCapOverlay } from "./BadgeSystem";

interface VendorProfileHeaderProps {
    profile: Profile;
    viewAs: "host" | "visitor";
}

export function VendorProfileHeader({ profile, viewAs }: VendorProfileHeaderProps) {
    const isHost = viewAs === "host";

    return (
        <div className="w-full space-y-6">
            {/* Header Card */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-border/50 rounded-[16px] p-4 md:p-6 shadow-sm relative overflow-visible"
            >
                {/* Subtle Decorative Background */}
                <div className="absolute inset-0 rounded-[20px] overflow-hidden pointer-events-none">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-[60px] -mr-24 -mt-24" />
                </div>

                <div className="flex flex-col md:flex-row gap-6 items-start relative z-10">
                    {/* Profile Photo */}
                    <div className="relative shrink-0 group/avatar">
                        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-2 border-background shadow-lg bg-secondary/30 relative">
                            {profile.avatar ? (
                                <img
                                    src={profile.avatar}
                                    alt={profile.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary text-xl font-bold">
                                    {profile.name.charAt(0)}
                                </div>
                            )}
                        </div>

                        {/* Student Badge Overlay */}
                        {profile.isStudent && <StudentCapOverlay className="w-6 h-6 -top-0.5 -right-0.5" />}

                        {/* Edit avatar — host only */}
                        {isHost && (
                            <button className="absolute bottom-0 right-0 w-8 h-8 bg-background border border-border/50 rounded-full flex items-center justify-center text-foreground hover:text-primary hover:border-primary/30 hover:bg-primary/5 shadow-lg active:scale-95 transition-all duration-300 z-20 group-hover/avatar:scale-110">
                                <Pencil className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>

                    {/* Profile Info */}
                    <div className="flex-1 space-y-3 min-w-0">
                        <div className="space-y-0.5">
                            <div className="flex items-center gap-2.5 flex-wrap">
                                <h1 className="text-lg md:text-xl font-bold font-heading tracking-tight truncate">
                                    {profile.name}
                                </h1>
                                {/* Achievements / Badges Row */}
                                <div className="flex items-center gap-1.5">
                                    {profile.isVerified && (
                                        <BadgeSystem type="verified" tier={profile.verifiedTier} />
                                    )}
                                </div>
                            </div>

                            {/* Secondary Stats/Info */}
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                                <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-primary/60" />
                                    <span>Joined {profile.joinedDate}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-primary/60" />
                                    <span>{profile.location}</span>
                                </div>
                            </div>
                        </div>

                        <p className="text-muted-foreground leading-snug max-w-2xl text-[12px] font-medium">
                            {profile.bio}
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 w-full md:w-auto shrink-0 md:pt-1">
                        {isHost ? (
                            <>
                                <button className="flex-1 md:flex-none flex items-center justify-center gap-1.5 bg-primary text-white font-bold px-5 py-2.5 rounded-xl hover:opacity-90 active:scale-95 transition-all text-[11px] uppercase tracking-widest shadow-md shadow-primary/10">
                                    <Pencil className="w-3.5 h-3.5" />
                                    Edit Profile
                                </button>
                                <button className="p-2.5 bg-secondary/80 text-muted-foreground rounded-xl border border-border/30 hover:text-foreground hover:bg-secondary active:scale-95 transition-all" title="Settings">
                                    <Settings className="w-4 h-4" />
                                </button>
                            </>
                        ) : (
                            <>
                                <button className="flex-1 md:flex-none flex items-center justify-center gap-1.5 bg-primary text-white font-bold px-5 py-2.5 rounded-xl hover:opacity-90 active:scale-95 transition-all text-[11px] uppercase tracking-widest shadow-md shadow-primary/10">
                                    <MessageSquare className="w-3.5 h-3.5" />
                                    Message
                                </button>
                                <div className="flex items-center gap-1.5">
                                    <button className="p-2.5 bg-secondary/80 text-muted-foreground rounded-xl border border-border/30 hover:text-red-500 hover:bg-red-500/5 active:scale-95 transition-all" title="Block User">
                                        <ShieldAlert className="w-4 h-4" />
                                    </button>
                                    <ReportDropdown
                                        reportType="profile"
                                        targetId={profile.handle}
                                        triggerClassName="p-2.5 bg-secondary/80 text-muted-foreground rounded-xl border border-border/30 hover:text-orange-500 hover:bg-orange-500/5 transition-all flex items-center justify-center"
                                        align="right"
                                    />
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
