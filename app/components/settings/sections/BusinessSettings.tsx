"use client";

import React, { useState } from "react";
import { AchievementBadge } from "../../profile/BadgeSystem";
import { PROFILES } from "../../../data/profiles";

export function BusinessSettings() {
    const profile = PROFILES[0];
    const badges = profile.achievements || [];
    const badgeSlots = Array.from({ length: 9 }, (_, index) => badges[index] || null);
    const [isBusinessAccount, setIsBusinessAccount] = useState(profile.type === "vendor");

    return (
        <div className="space-y-5">
            <h2 className="text-sm font-semibold text-primary">Business Profile</h2>

            <div className="space-y-2 rounded-md border border-border/40 bg-card p-3">
                <div className="flex items-center justify-between gap-3">
                    <div className="text-[10px] text-muted-foreground">
                        {isBusinessAccount
                            ? "Business profile is enabled."
                            : "Upgrade to a business account to edit these fields."}
                    </div>
                    <label className="flex items-center gap-2 text-[10px] text-muted-foreground">
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
                        <div className="absolute inset-0 z-10 flex items-center justify-center">
                            <div className="bg-background/80 border border-border/40 text-[10px] text-muted-foreground px-3 py-1 rounded-md shadow-sm">
                                Upgrade to unlock business profile
                            </div>
                        </div>
                    )}

                    <div className={isBusinessAccount ? "space-y-3" : "space-y-3 opacity-40 pointer-events-none"}>
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-semibold text-foreground">Business Name</label>
                            <input
                                type="text"
                                defaultValue={profile.name}
                                className="w-full bg-muted/40 border border-transparent dark:border-border/40 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-semibold text-foreground">Badge Visibility</label>
                            <div className="grid grid-cols-3 gap-2">
                                {badgeSlots.map((badge, index) => (
                                    <div key={`${badge?.name || "slot"}-${index}`} className="min-h-[40px]">
                                        {badge ? (
                                            <label className="flex items-center justify-between gap-2 rounded-md border border-border/40 bg-card px-2.5 py-1.5">
                                                <div className="flex items-center gap-2">
                                                    <AchievementBadge achievement={badge} className="scale-75" />
                                                    <span className="text-[10px] font-semibold text-foreground">{badge.name}</span>
                                                </div>
                                                <input type="checkbox" defaultChecked className="accent-primary" />
                                            </label>
                                        ) : null}
                                    </div>
                                ))}
                            </div>
                            <p className="text-[10px] text-muted-foreground">
                                These badges will appear on your profile when visible.
                            </p>
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