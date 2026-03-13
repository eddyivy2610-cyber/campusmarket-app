"use client";

import React from "react";

export function SwitchAccountSettings() {
    return (
        <div className="space-y-6">
            <h2 className="text-sm font-semibold text-primary">Switch Account</h2>

            <div className="space-y-3">
                <div>
                    <h3 className="text-[12px] font-semibold text-foreground">Switch Account</h3>
                    <p className="text-[10px] text-muted-foreground mt-1">
                        Choose a different account to continue. You can sign back in anytime.
                    </p>
                </div>
                <button className="px-4 py-2 text-[11px] font-semibold text-foreground border border-border/60 bg-card hover:bg-secondary/40 transition-colors">
                    Switch Account
                </button>
            </div>
        </div>
    );
}