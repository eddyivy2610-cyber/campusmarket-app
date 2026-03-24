"use client";

import React from "react";
import { CheckCircle } from "lucide-react";

export default function BadgesPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20 shadow-inner">
                <CheckCircle size={32} />
            </div>
            <div className="space-y-1">
                <h2 className="text-xl font-bold text-foreground">Badges & Verification</h2>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto font-medium">Content not yet available. User achievement and trust systems are in development.</p>
            </div>
        </div>
    );
}
