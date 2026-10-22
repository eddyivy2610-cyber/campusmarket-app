"use client";

import React from "react";

const SESSIONS = [
    { id: "current", device: "Chrome on Windows", location: "Zaria, Nigeria", status: "Active now" },
    { id: "mobile", device: "Safari on iPhone", location: "Lagos, Nigeria", status: "Active 2 hours ago" },
    { id: "tablet", device: "Edge on iPad", location: "Abuja, Nigeria", status: "Active 3 days ago" },
];

export function SecuritySettings() {
    return (
        <div className="space-y-6">
            <h2 className="text-sm font-semibold text-primary">Security Settings</h2>

            <div className="space-y-3">
                <h3 className="text-[12px] font-semibold text-foreground">Password Reset</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-semibold text-foreground">Current Password</label>
                        <input
                            type="password"
                            placeholder="Current Password"
                            className="w-full bg-muted/40 border border-transparent dark:border-border/40 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-semibold text-foreground">New Password</label>
                        <input
                            type="password"
                            placeholder="New Password"
                            className="w-full bg-muted/40 border border-transparent dark:border-border/40 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-semibold text-foreground">Confirm Password</label>
                        <input
                            type="password"
                            placeholder="Confirm New Password"
                            className="w-full bg-muted/40 border border-transparent dark:border-border/40 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>
                </div>
                <div className="flex justify-end">
                    <button className="px-5 py-2 bg-primary text-white text-[12px] font-semibold shadow-sm hover:opacity-90 transition-all">
                        Update Password
                    </button>
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="text-[12px] font-semibold text-foreground">Session Management</h3>
                    <button className="text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors">
                        Sign out of all devices
                    </button>
                </div>
                <div className="space-y-2">
                    {SESSIONS.map((session) => (
                        <div
                            key={session.id}
                            className="flex items-center justify-between gap-3 rounded-md border border-border/40 bg-card px-3 py-2"
                        >
                            <div>
                                <p className="text-[11px] font-semibold text-foreground">{session.device}</p>
                                <p className="text-[10px] text-muted-foreground">{session.location}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-muted-foreground">{session.status}</p>
                                {session.id !== "current" && (
                                    <button className="text-[10px] font-semibold text-primary hover:text-primary/80 transition-colors">
                                        Sign out
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="pt-2 border-t border-border/40 space-y-3">
                <div>
                    <h3 className="text-[12px] font-semibold text-foreground">Log Out</h3>
                    <p className="text-[10px] text-muted-foreground mt-1">
                        Sign out of your account on this device.
                    </p>
                </div>
                <button className="px-4 py-2 text-[11px] font-semibold text-muted-foreground border border-border/60 bg-secondary/30 hover:bg-secondary/50 transition-colors">
                    Log Out
                </button>
            </div>
        </div>
    );
}
