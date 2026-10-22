"use client";

import React from "react";
import { MessageSquareWarning } from "lucide-react";

export default function DisputeCenterPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 border border-rose-500/20 shadow-inner">
                <MessageSquareWarning size={32} />
            </div>
            <div className="space-y-1">
                <h2 className="text-xl font-bold text-foreground">Disputes</h2>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto font-medium">Content not yet available. The dispute resolution center is currently empty.</p>
            </div>
        </div>
    );
}
