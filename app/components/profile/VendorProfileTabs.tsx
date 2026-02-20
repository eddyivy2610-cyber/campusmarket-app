"use client";

import React, { useState } from "react";
import {
    Info,
    Star,
    User,
    CheckCircle2,
    Clock,
    BadgeCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface VendorProfileTabsProps {
    vendor: {
        name: string;
        category: string;
        department: string;
        joinedDateRelative: string;
        activeListings: number;
        soldItems: number;
        rating: number;
        responseRate: string;
        responseTime: string;
    };
}

export function VendorProfileTabs({ vendor }: VendorProfileTabsProps) {
    const [activeTab, setActiveTab] = useState("About");

    const tabs = [
        { name: "About", icon: Info },
        { name: "Reviews", icon: Star },
        { name: "About the Seller", icon: User },
    ];

    return (
        <div className="w-full space-y-6">
            {/* Tab Navigation */}
            <div className="flex border-b border-border/40 overflow-x-auto no-scrollbar scroll-contain">
                {tabs.map((tab) => (
                    <button
                        key={tab.name}
                        onClick={() => setActiveTab(tab.name)}
                        className={`px-6 py-3 text-[13px] font-bold tracking-tight transition-all relative whitespace-nowrap ${activeTab === tab.name
                            ? "text-primary"
                            : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <tab.icon className="w-3.5 h-3.5" />
                            {tab.name}
                        </div>
                        {activeTab === tab.name && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full"
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.15 }}
                >
                    {activeTab === "About" && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
                            {/* Business Information */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-black font-heading uppercase tracking-widest text-muted-foreground/50">
                                    Business Information
                                </h3>
                                <div className="space-y-3">
                                    {[
                                        { label: "Business Name", value: vendor.name },
                                        { label: "Category", value: vendor.category },
                                        { label: "Department", value: vendor.department },
                                        { label: "Joined", value: vendor.joinedDateRelative },
                                    ].map((item) => (
                                        <div key={item.label} className="flex flex-col border-b border-border/20 pb-2.5">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">{item.label}</span>
                                            <span className="font-bold text-sm text-foreground/90">{item.value}</span>
                                        </div>
                                    ))}
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Account Status</span>
                                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                            <div className="flex items-center gap-1 px-2.5 py-0.5 bg-primary/5 text-primary rounded-full border border-primary/10">
                                                <BadgeCheck className="w-3 h-3" />
                                                <span className="text-[8px] font-black uppercase tracking-widest">Vendor</span>
                                            </div>
                                            <div className="flex items-center gap-1 px-2.5 py-0.5 bg-green-500/5 text-green-500 rounded-full border border-green-500/10">
                                                <CheckCircle2 className="w-3 h-3" />
                                                <span className="text-[8px] font-black uppercase tracking-widest">Student</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Performance Overview */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-black font-heading uppercase tracking-widest text-muted-foreground/50">
                                    Performance
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex flex-col border-b border-border/20 pb-2.5">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Active Listings</span>
                                        <span className="font-bold text-sm">{vendor.activeListings} items</span>
                                    </div>
                                    <div className="flex flex-col border-b border-border/20 pb-2.5">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Sold Items</span>
                                        <span className="font-bold text-sm">{vendor.soldItems} items</span>
                                    </div>
                                    <div className="flex flex-col border-b border-border/20 pb-2.5">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Rating</span>
                                        <div className="flex items-center gap-1 text-amber-500">
                                            <span className="font-bold text-sm text-foreground mr-1">{vendor.rating}</span>
                                            {[1, 2, 3, 4, 5].map((s) => (
                                                <Star key={s} className={`w-3 h-3 ${s <= Math.floor(vendor.rating) ? "fill-current" : "text-gray-200"}`} />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Response</span>
                                        <span className="font-bold text-sm">{vendor.responseRate} <span className="text-[10px] opacity-40 font-medium">({vendor.responseTime})</span></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}


                    {activeTab === "Reviews" && (
                        <div className="text-center py-10 bg-secondary/5 rounded-2xl border-2 border-dashed border-border/30">
                            <Star className="w-10 h-10 text-muted-foreground/20 mx-auto mb-2" />
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">No reviews yet</p>
                        </div>
                    )}

                    {activeTab === "About the Seller" && (
                        <div className="max-w-xl space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                                    <User className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-black text-lg leading-none">Member since 2024</h4>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter mt-1">Verified Student Vendor</p>
                                </div>
                            </div>
                            <p className="text-muted-foreground text-xs leading-relaxed font-medium">
                                Verified student vendor with a high reputation for fast delivery and quality communication within the campus community.
                            </p>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
