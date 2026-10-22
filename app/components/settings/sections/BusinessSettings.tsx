"use client";

import React, { useState } from "react";
import { AchievementBadge } from "../../profile/BadgeSystem";
import { PROFILES } from "../../../data/profiles";

export function BusinessSettings() {
    const profile = PROFILES[0] || {} as any;
    const badges = profile?.achievements || [];
    const badgeSlots = Array.from({ length: 9 }, (_, index) => badges[index] || null);
    const [isBusinessAccount, setIsBusinessAccount] = useState(profile?.type === "vendor");

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 pb-3">
                <div className="text-[11px] text-muted-foreground">
                    {isBusinessAccount
                        ? "Business profile is enabled."
                        : "Upgrade to a business account to edit these fields."}
                </div>
                <label className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    <span>Business account</span>
                    <input
                        type="checkbox"
                        checked={isBusinessAccount}
                        onChange={(e) => setIsBusinessAccount(e.target.checked)}
                        className="accent-primary"
                    />
                </label>
            </div>

            <div className="relative">
                {!isBusinessAccount && (
                    <div className="absolute inset-0 z-10 flex items-start justify-center pt-6">
                        <div className="bg-background/90 border border-border/40 text-[11px] text-muted-foreground px-3 py-1.5 rounded-md shadow-sm">
                            Upgrade to unlock business profile
                        </div>
                    </div>
                )}

                <div className={isBusinessAccount ? "space-y-5" : "space-y-5 opacity-40 pointer-events-none"}>
                    <div className="space-y-2">
                        <label className="text-[11px] font-semibold text-foreground">Business Name</label>
                        <input
                            type="text"
                            defaultValue={profile.name}
                            className="w-full bg-muted/40 border border-transparent dark:border-border/40 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>

                    <div className="space-y-3">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                            <label className="text-[11px] font-semibold text-foreground">Badge Visibility</label>
                            <p className="text-[10px] text-muted-foreground">
                                Visible badges appear on your profile.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {badgeSlots.map((badge, index) => (
                                <div key={`${badge?.name || "slot"}-${index}`} className="min-h-[44px]">
                                    {badge ? (
                                        <label className="flex items-center justify-between gap-3 rounded-lg border border-border/40 bg-secondary/20 px-3 py-2.5">
                                            <div className="flex items-center gap-2.5">
                                                <AchievementBadge achievement={badge} className="scale-90" />
                                                <span className="text-[11px] font-semibold text-foreground">{badge.name}</span>
                                            </div>
                                            <input type="checkbox" defaultChecked className="accent-primary" />
                                        </label>
                                    ) : (
                                        <div className="rounded-lg border border-dashed border-border/40 bg-secondary/10 px-3 py-2.5 text-[10px] text-muted-foreground">
                                            Empty slot
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-1">
                <button className="text-[12px] font-semibold text-muted-foreground hover:text-foreground transition-colors">
                    Cancel
                </button>
                <button className="px-5 py-2 bg-primary text-white text-[12px] font-semibold shadow-sm hover:opacity-90 transition-all">
                    Save Changes
                </button>
            </div>
        </div>
    );
}
