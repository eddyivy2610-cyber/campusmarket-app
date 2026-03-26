"use client";

import Link from "next/link";
import { Clock, ArrowLeft } from "lucide-react";

export default function ComingSoonPage() {
    return (
        <div className="min-h-[70vh] flex items-center justify-center px-4">
            <div className="w-full max-w-md rounded-2xl border border-border/60 bg-card/70 p-6 md:p-8 shadow-sm text-center font-heading">
                <div className="mx-auto mb-4 h-12 w-12 rounded-full flex items-center justify-center bg-secondary/40 border border-border/60">
                    <Clock className="w-6 h-6 text-muted-foreground" />
                </div>
                <h1 className="text-lg md:text-xl font-bold mb-2">Coming Soon</h1>
                <p className="text-sm text-muted-foreground mb-6">
                    This feature is being built. Check back soon.
                </p>
                <Link
                    href="/home"
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-primary/90 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back Home
                </Link>
            </div>
        </div>
    );
}
