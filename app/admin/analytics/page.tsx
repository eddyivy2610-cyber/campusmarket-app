"use client";

import React from "react";
import { BarChart3 } from "lucide-react";

export default function AnalyticsPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-inner">
                <BarChart3 size={32} />
            </div>
            <div className="space-y-1">
                <h2 className="text-xl font-bold text-foreground">Analytics</h2>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto font-medium">Content not yet available. We're building deep insights for your platform.</p>
            </div>
        </div>
    );
}
