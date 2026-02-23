"use client";

import React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../../lib/utils";

interface ToggleProps {
    label: string;
    description?: string;
    enabled: boolean;
    onChange: (val: boolean) => void;
}

function PrivacyToggle({ label, description, enabled, onChange }: ToggleProps) {
    return (
        <div className="flex items-center justify-between py-2">
            <div className="space-y-0.5">
                <span className="text-sm text-foreground">{label}</span>
                {description && <p className="text-xs text-muted-foreground">{description}</p>}
            </div>
            <button
                onClick={() => onChange(!enabled)}
                className={cn(
                    "w-8 h-4 rounded-full transition-colors relative",
                    enabled ? "bg-primary" : "bg-secondary"
                )}
            >
                <div className={cn(
                    "w-3 h-3 rounded-full bg-white shadow-sm transition-transform absolute top-0.5",
                    enabled ? "translate-x-4.5" : "translate-x-0.5"
                )} />
            </button>
        </div>
    );
}

export function PrivacySettings() {
    return (
        <div className="max-w-4xl space-y-12 pb-12">
            {/* Profile Visibility Section */}
            <div className="space-y-6">
                <div className="pb-4 border-b border-border/40">
                    <h2 className="text-base font-semibold">Profile Visibility</h2>
                </div>

                <div className="space-y-8">
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">Who can see my profile?</label>
                        <div className="relative">
                            <select className="w-full bg-muted/30 border-none rounded-2xl px-4 py-3 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer font-medium">
                                <option>Everyone (Public)</option>
                                <option>Registered Users Only</option>
                                <option>Private (Only Me)</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                        <PrivacyToggle
                            label="Show email address"
                            description="Visible to confirmed buyers"
                            enabled={false}
                            onChange={() => { }}
                        />
                        <PrivacyToggle
                            label="Show phone number"
                            description="Visible to authorized users"
                            enabled={false}
                            onChange={() => { }}
                        />
                        <PrivacyToggle
                            label="Public wishlist"
                            description="Make your saved items visible"
                            enabled={false}
                            onChange={() => { }}
                        />
                        <PrivacyToggle
                            label="Search indexing"
                            description="Allow search engines to find you"
                            enabled={true}
                            onChange={() => { }}
                        />
                    </div>
                </div>
            </div>

            {/* Messaging Section */}
            <div className="space-y-6">
                <div className="pb-4 border-b border-border/40">
                    <h2 className="text-base font-semibold">Messaging Privacy</h2>
                </div>

                <div className="space-y-8">
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">Who can message me?</label>
                        <div className="relative">
                            <select className="w-full bg-transparent border border-border/60 rounded-lg px-3 py-2 text-sm appearance-none focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all cursor-pointer text-muted-foreground">
                                <option>Anyone on CampusMarket</option>
                                <option>Only users I've interacted with</option>
                                <option>No one</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <PrivacyToggle
                            label="Filter new accounts"
                            description="Block messages from users $< 30$ days old"
                            enabled={true}
                            onChange={() => { }}
                        />
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className="pt-6">
                <button className="px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity">
                    Update Privacy
                </button>
            </div>
        </div>
    );
}
