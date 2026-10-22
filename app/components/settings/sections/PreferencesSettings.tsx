"use client";

import React, { useMemo } from "react";
import { useTheme } from "../../../context/ThemeContext";

const NOTIFICATION_OPTIONS = [
    { id: "email", label: "Email notifications" },
    { id: "push", label: "Push notifications" },
    { id: "security", label: "Security alerts" },
    { id: "marketing", label: "Marketing updates" },
];

function Toggle({ checked }: { checked: boolean }) {
    return (
        <div className={"w-9 h-4 rounded-full transition-colors relative " + (checked ? "bg-primary" : "bg-secondary")}>
            <div className={"w-3 h-3 rounded-full bg-white shadow-sm transition-transform absolute top-0.5 " + (checked ? "translate-x-5" : "translate-x-1")}></div>
        </div>
    );
}

export function PreferencesSettings() {
    const { theme, setTheme } = useTheme();
    const isDark = useMemo(() => theme === "dark", [theme]);

    return (
        <div className="space-y-6">
            <h2 className="text-sm font-semibold text-primary">Preferences</h2>

            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-[12px] font-semibold text-foreground">Theme</h3>
                        <p className="text-[10px] text-muted-foreground">Toggle between light and dark mode.</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setTheme(isDark ? "light" : "dark")}
                        className="flex items-center gap-2 text-[10px] text-muted-foreground"
                    >
                        <Toggle checked={isDark} />
                    </button>
                </div>
            </div>

            <div className="space-y-3">
                <h3 className="text-[12px] font-semibold text-foreground">Notifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {NOTIFICATION_OPTIONS.map((option) => (
                        <div key={option.id} className="flex items-center justify-between rounded-md border border-border/40 bg-card px-3 py-2">
                            <span className="text-[11px] font-semibold text-foreground">{option.label}</span>
                            <Toggle checked={option.id !== "marketing"} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
