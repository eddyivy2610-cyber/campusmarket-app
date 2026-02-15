"use client";

import Link from "next/link";
import { X } from "lucide-react";

export function ListingHeader() {
    return (
        <div className="flex items-center justify-between mb-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Create Listing</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Share what you want to sell. Clear listings get faster responses.
                </p>
            </div>

            <Link
                href="/profile"
                className="p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                title="Cancel and go back"
            >
                <X className="w-5 h-5" />
            </Link>
        </div>
    );
}
