"use client";

import React, { useEffect, useState } from "react";
import { ChevronDown, Sun, Moon, Monitor } from "lucide-react";
import { cn } from "../../../lib/utils";
import { useTheme } from "../../../context/ThemeContext";

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
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div className="max-w-4xl space-y-12">
            {/* Preferences Section */}
            <div className="space-y-6">
                <div className="pb-4 border-b border-border/40">
                    <h2 className="text-base font-semibold">Preferences</h2>
                </div>

                <div className="space-y-6">
                    {/* Theme Preference - Primary Toggle */}
                    <div className="space-y-3">
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Theme Preference</label>
                        <div className="grid grid-cols-3 gap-4">
                            {[
                                { id: 'light', label: 'Light', icon: Sun },
                                { id: 'dark', label: 'Dark', icon: Moon },
                                { id: 'system', label: 'System', icon: Monitor },
                            ].map((mode) => (
                                <button
                                    key={mode.id}
                                    onClick={() => setTheme(mode.id)}
                                    className={cn(
                                        "flex flex-col items-center justify-center gap-3 p-6 rounded-3xl border-2 transition-all duration-200 group",
                                        (mounted && theme === mode.id)
                                            ? "border-primary bg-primary/5 text-primary shadow-lg shadow-primary/10"
                                            : "border-border/40 bg-muted/20 text-muted-foreground hover:border-primary/30 hover:bg-primary/5 hover:text-foreground"
                                    )}
                                >
                                    <mode.icon className={cn(
                                        "w-6 h-6 transition-transform group-hover:scale-110",
                                        (mounted && theme === mode.id) ? "animate-in zoom-in-50 duration-300" : ""
                                    )} />
                                    <span className="text-xs font-bold uppercase tracking-wider">{mode.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
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
                                <select className="w-full bg-muted/30 border-none rounded-2xl px-4 py-3 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer font-medium">
                                    <option>UTC+1 (Lagos)</option>
                                    <option>UTC+0 (London)</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                            </div>
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
