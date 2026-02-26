"use client";

import React from "react";
import { ShieldCheck, ShoppingBag, ChevronRight } from "lucide-react";
import Link from "next/link";

export function AccountSettings() {
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
                                src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80"
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

                <div className="p-6 bg-primary/5 border border-primary/20 rounded-3xl space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-xl text-primary">
                            <ShoppingBag className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-sm">Upgrade to Pro Account</h3>
                            <p className="text-xs text-muted-foreground font-medium">Start selling your items to the campus community today.</p>
                        </div>
                    </div>
                    <Link href="/register">
                        <button className="w-full py-3 bg-primary text-white rounded-2xl text-xs font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2">
                            Get Started
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </Link>
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
