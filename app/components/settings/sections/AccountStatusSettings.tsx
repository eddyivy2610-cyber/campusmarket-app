"use client";

import React from "react";

export function AccountStatusSettings() {
    return (
        <div className="space-y-6">
            <h2 className="text-sm font-semibold text-primary">Deactivation & Deletion</h2>

            <div className="space-y-3">
                <div>
                    <h3 className="text-[12px] font-semibold text-foreground">Deactivate Account</h3>
                    <p className="text-[10px] text-muted-foreground mt-1">
                        Temporarily disable your account. You can reactivate by signing back in.
                    </p>
                </div>
                <button className="px-4 py-2 text-[11px] font-semibold text-red-600 border border-red-200/80 bg-red-50 hover:bg-red-100 transition-colors">
                    Deactivate Account
                </button>
            </div>

            <div className="pt-3 border-t border-border/40 space-y-3">
                <div>
                    <h3 className="text-[12px] font-semibold text-foreground">Delete Account</h3>
                    <p className="text-[10px] text-muted-foreground mt-1">
                        Permanently delete your account and remove your data from Campus Market.
                    </p>
                </div>
                <button className="px-4 py-2 text-[11px] font-semibold text-red-700 border border-red-300/80 bg-red-100 hover:bg-red-200 transition-colors">
                    Delete Account
                </button>
            </div>
        </div>
    );
}