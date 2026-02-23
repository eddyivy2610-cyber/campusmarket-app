"use client";

import React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../../lib/utils";

interface NotificationToggleProps {
    label: string;
    isActive: boolean;
}

function PreferenceToggle({ label, isActive }: NotificationToggleProps) {
    return (
        <div className="flex items-center justify-between py-2">
            <span className="text-sm text-foreground">{label}</span>
            <button
                className={cn(
                    "w-8 h-4 rounded-full transition-colors relative",
                    isActive ? "bg-primary" : "bg-secondary"
                )}
            >
                <div className={cn(
                    "w-3 h-3 rounded-full bg-white shadow-sm transition-transform absolute top-0.5",
                    isActive ? "translate-x-4.5" : "translate-x-0.5"
                )} />
            </button>
        </div>
    );
}

export function NotificationSettings() {
    return (
        <div className="max-w-4xl space-y-12">
            {/* Preferences Section */}
            <div className="space-y-6">
                <div className="pb-4 border-b border-border/40">
                    <h2 className="text-base font-semibold">Preferences</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Theme */}
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">Theme</label>
                        <div className="relative">
                            <select className="w-full bg-muted/30 border-none rounded-2xl px-4 py-3 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer font-medium">
                                <option>Light Mode</option>
                                <option>Dark Mode</option>
                                <option>System</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                        </div>
                    </div>

                    {/* Language */}
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">Language</label>
                        <div className="relative">
                            <select className="w-full bg-muted/30 border-none rounded-2xl px-4 py-3 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer font-medium">
                                <option>English</option>
                                <option>Spanish</option>
                                <option>French</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                        </div>
                    </div>

                    {/* Timezone */}
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">Timezone</label>
                        <div className="relative">
                            <select className="w-full bg-transparent border border-border/60 rounded-lg px-3 py-2 text-sm appearance-none focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all cursor-pointer text-muted-foreground">
                                <option>Select timezone</option>
                                <option>UTC+1 (Lagos)</option>
                                <option>UTC+0 (London)</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Notification Toggles */}
            <div className="space-y-6">
                <div className="pb-4 border-b border-border/40">
                    <h2 className="text-base font-semibold">Notification Settings</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
                    <PreferenceToggle label="Email notifications" isActive={true} />
                    <PreferenceToggle label="Push notifications" isActive={true} />
                    <PreferenceToggle label="Security alerts" isActive={true} />
                    <PreferenceToggle label="Marketing emails" isActive={false} />
                </div>
            </div>

            {/* Save Button */}
            <div className="pt-6">
                <button className="px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity">
                    Save Changes
                </button>
            </div>
        </div>
    );
}
