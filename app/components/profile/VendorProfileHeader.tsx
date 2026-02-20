"use client";

import React from "react";
import {
    BadgeCheck,
    Star,
    Calendar,
    MapPin,
    MessageSquare,
    LayoutGrid,
    Flag,
    Pencil,
    Settings,
    Inbox
} from "lucide-react";
import { motion } from "framer-motion";

interface VendorProfileHeaderProps {
    vendor: {
        name: string;
        avatar: string;
        rating: number;
        reviewCount: number;
        joinedDate: string;
        location: string;
        bio: string;
        category: string;
        isVerified: boolean;
    };
    viewAs: "host" | "visitor";
}

export function VendorProfileHeader({ vendor, viewAs }: VendorProfileHeaderProps) {
    const isHost = viewAs === "host";

    return (
        <div className="w-full space-y-6">

            {/* Header Card */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-border/50 rounded-[20px] p-5 md:p-8 shadow-sm relative overflow-hidden"
            >
                {/* Subtle Decorative Background */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-[60px] -mr-24 -mt-24 pointer-events-none" />

                <div className="flex flex-col md:flex-row gap-6 items-start relative z-10">
                    {/* Profile Photo */}
                    <div className="relative shrink-0 group/avatar">
                        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-2 border-background shadow-lg bg-secondary/30 relative">
                            {vendor.avatar ? (
                                <img
                                    src={vendor.avatar}
                                    alt={vendor.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary text-2xl font-black">
                                    {vendor.name.charAt(0)}
                                </div>
                            )}
                        </div>

                        {/* Edit avatar — host only */}
                        {isHost && (
                            <button className="absolute bottom-0 right-0 w-8 h-8 bg-background border border-border/50 rounded-full flex items-center justify-center text-foreground hover:text-primary hover:border-primary/30 hover:bg-primary/5 shadow-lg active:scale-95 transition-all duration-300 z-20 group-hover/avatar:scale-110">
                                <Pencil className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>

                    {/* Vendor Info */}
                    <div className="flex-1 space-y-3 min-w-0">
                        <div className="space-y-0.5">
                            <h1 className="text-2xl md:text-3xl font-black font-heading tracking-tight flex items-center gap-2 truncate">
                                {vendor.name}
                                {vendor.isVerified && (
                                    <BadgeCheck className="w-5 h-5 text-blue-500 fill-blue-500/10 shrink-0" />
                                )}
                            </h1>

                            {/* Trust Signals */}
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-medium text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <div className="flex items-center gap-0.5 text-amber-500">
                                        <Star className="w-3.5 h-3.5 fill-current" />
                                        <span className="font-bold text-foreground">{vendor.rating}</span>
                                    </div>
                                    <span className="opacity-60">({vendor.reviewCount})</span>
                                </div>
                                <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-tighter opacity-70">
                                    <MapPin className="w-3 h-3" />
                                    <span>{vendor.location}</span>
                                </div>
                                <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-tighter opacity-70">
                                    <Calendar className="w-3 h-3" />
                                    <span>{vendor.joinedDate}</span>
                                </div>
                            </div>
                        </div>

                        <p className="text-muted-foreground leading-snug max-w-2xl text-xs font-medium line-clamp-2">
                            {vendor.bio}
                        </p>
                    </div>

                    {/* Action Buttons — changes based on viewAs */}
                    <div className="flex items-center gap-2 w-full md:w-auto shrink-0 md:pt-1">
                        {isHost ? (
                            <>
                                {/* Host: Messages + Settings */}
                                <button className="flex-1 md:flex-none flex items-center justify-center gap-1.5 bg-foreground text-background font-bold px-5 py-2.5 rounded-xl hover:bg-foreground/90 active:scale-95 transition-all text-[11px] uppercase tracking-wider">
                                    <Inbox className="w-3.5 h-3.5" />
                                    Messages
                                </button>
                                <button className="p-2.5 bg-secondary text-muted-foreground rounded-xl border-2 border-border/40 hover:text-foreground hover:border-foreground/30 hover:bg-secondary/80 active:scale-95 transition-all" title="Settings">
                                    <Settings className="w-3.5 h-3.5" />
                                </button>
                            </>
                        ) : (
                            <>
                                {/* Visitor: Message + Listings + Report */}
                                <button className="flex-1 md:flex-none flex items-center justify-center gap-1.5 bg-foreground text-background font-bold px-5 py-2.5 rounded-xl hover:bg-foreground/90 active:scale-95 transition-all text-[11px] uppercase tracking-wider">
                                    <MessageSquare className="w-3.5 h-3.5" />
                                    Message
                                </button>
                                <button className="flex-1 md:flex-none flex items-center justify-center gap-1.5 bg-secondary text-foreground font-bold px-5 py-2.5 rounded-xl border-2 border-border/40 hover:bg-secondary/80 active:scale-95 transition-all text-[11px] uppercase tracking-wider">
                                    <LayoutGrid className="w-3.5 h-3.5" />
                                    Listings
                                </button>
                                <button className="p-2.5 bg-secondary text-muted-foreground rounded-xl border-2 border-border/40 hover:text-red-500 hover:border-red-500/30 hover:bg-red-500/5 active:scale-95 transition-all" title="Report">
                                    <Flag className="w-3.5 h-3.5" />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
