"use client";

import React from "react";
import { Settings } from "lucide-react";

export default function SettingsPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center text-muted-foreground border border-border/50 shadow-inner">
                <Settings size={32} />
            </div>
            <div className="space-y-1">
                <h2 className="text-xl font-bold text-foreground">Settings</h2>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto font-medium">Content not yet available. Administrative configuration options are coming soon.</p>
            </div>
        </div>
    );
}
