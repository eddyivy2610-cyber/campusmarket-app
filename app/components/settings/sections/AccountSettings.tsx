"use client";

import React from "react";
import { ShieldCheck, ShoppingBag, ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "../../../lib/utils";
import { useAuth } from "../../../context/AuthContext";
import { BadgeCheck } from "lucide-react";

export function AccountSettings() {
    const { user } = useAuth();
    const isSeller = user?.role === "seller";
    const isApproved = user?.sellerStatus === "approved";

    return (
        <div className="max-w-2xl space-y-12">
            {/* Personal Information Section */}
            <div className="space-y-6">
                <div className="pb-4 border-b border-border/40">
                    <h2 className="text-base font-semibold">Personal Information</h2>
                </div>

                <div className="space-y-8">
                    {/* Profile Picture */}
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                            <img
                                src=""
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <button className="px-4 py-2 bg-muted/40 border border-border/20 rounded-xl text-xs font-semibold hover:bg-muted/60 transition-colors">
                            Change
                        </button>
                    </div>

                    {/* Name & Email Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-muted-foreground">Name</label>
                            <input
                                type="text"
                                defaultValue="Lucky John"
                                className="w-full bg-muted/30 border-none rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-muted-foreground">Email</label>
                            <div className="relative">
                                <input
                                    type="email"
                                    defaultValue="lucky@john.com"
                                    className="w-full bg-muted/30 border-none rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                />
                                <ShieldCheck className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Account Type / Upgrade Section */}
            <div className="space-y-6">
                <div className="pb-4 border-b border-border/40">
                    <h2 className="text-base font-semibold">Account Type</h2>
                </div>

                <div className={cn(
                    "p-6 border rounded-3xl space-y-4",
                    isApproved ? "bg-emerald-500/5 border-emerald-500/20" : "bg-primary/5 border-primary/20"
                )}>
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "p-2 rounded-xl",
                            isApproved ? "bg-emerald-500/10 text-emerald-500" : "bg-primary/10 text-primary"
                        )}>
                            {isApproved ? <BadgeCheck className="w-5 h-5" /> : <ShoppingBag className="w-5 h-5" />}
                        </div>
                        <div>
                            <h3 className="font-bold text-sm">
                                {isApproved ? "Verified Seller" : isSeller ? "Application Pending" : "Become a Seller"}
                            </h3>
                            <p className="text-xs text-muted-foreground font-medium">
                                {isApproved
                                    ? "Your account is verified and professional status is active."
                                    : isSeller 
                                        ? "Your application is currently being reviewed."
                                        : "Start selling your items to the campus community today."}
                            </p>
                        </div>
                    </div>
                    {!isSeller && !isApproved ? (
                        <Link href="/onboarding/seller">
                            <button className="w-full py-3 bg-primary text-white rounded-2xl text-xs font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2">
                                Apply Now
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </Link>
                    ) : (
                        <div className="pt-2">
                            <div className={cn(
                                "flex items-center gap-2 text-[10px] font-bold w-fit px-3 py-1 rounded-full uppercase tracking-wider",
                                isApproved ? "text-emerald-600 bg-emerald-100/50" : "text-amber-600 bg-amber-100/50"
                            )}>
                                {isApproved ? <BadgeCheck className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
                                {isApproved ? "Verified Seller" : "Under Review"}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Change Password Section */}
            <div className="space-y-6">
                <div className="pb-4 border-b border-border/40">
                    <h2 className="text-base font-semibold">Change Password</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">Old Password</label>
                        <input
                            type="password"
                            placeholder="Enter your password"
                            className="w-full bg-muted/30 border-none rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">New Password</label>
                        <input
                            type="password"
                            placeholder="Enter your password"
                            className="w-full bg-muted/30 border-none rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">New Password Again</label>
                        <input
                            type="password"
                            placeholder="Enter your password"
                            className="w-full bg-muted/30 border-none rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                        />
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className="pt-6">
                <button className="w-full lg:w-auto px-8 py-3.5 bg-primary text-white rounded-2xl text-sm font-bold shadow-lg shadow-primary/20 hover:opacity-95 transition-all active:scale-[0.98]">
                    Save Changes
                </button>
            </div>
        </div>
    );
}
