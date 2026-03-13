"use client";

import React from "react";

export function SignOutSettings() {
    return (
        <div className="space-y-6">
            <h2 className="text-sm font-semibold text-primary">Sign Out</h2>

            <div className="space-y-3">
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
