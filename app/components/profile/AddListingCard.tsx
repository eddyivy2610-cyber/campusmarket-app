"use client";

import { Plus } from "lucide-react";
import Link from "next/link";

export function AddListingCard() {
    return (
        <Link href="/create" className="group h-full min-h-[300px]">
            <div className="h-full flex flex-col items-center justify-center p-6 text-center bg-secondary/30 rounded-2xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-secondary/50 transition-all duration-300 cursor-pointer">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                    <Plus className="w-6 h-6 text-primary group-hover:text-white transition-colors" />
                </div>
                <span className="font-bold text-foreground group-hover:text-primary transition-colors">Add New Listing</span>
            </div>
        </Link>
    );
}
