"use client";

import { UploadCloud } from "lucide-react";
import Link from "next/link";

export function EmptyListingCard() {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-secondary/30 rounded-2xl border-2 border-dashed border-border hover:border-primary/50 transition-colors group">
            <div className="mb-6 relative">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <UploadCloud className="w-8 h-8 text-primary" />
                </div>
            </div>

            <h3 className="text-xl font-bold text-foreground mb-2">Create your first listing</h3>
            <p className="text-muted-foreground max-w-sm mb-8 text-sm leading-relaxed">
                Show off your items to the campus community. Get buyers, build your reputation, and earn extra cash.
            </p>

            <Link href="/create">
                <button className="bg-foreground text-background font-bold py-3 px-8 rounded-full shadow-lg hover:bg-primary hover:text-white transition-all transform hover:-translate-y-1 active:scale-95">
                    Create New Listing
                </button>
            </Link>
        </div>
    );
}
