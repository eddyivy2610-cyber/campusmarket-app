"use client";

import { ChevronDown } from "lucide-react";
import Link from "next/link";

export function TopBar() {
    return (
        <div className="bg-secondary/50 text-muted-foreground text-[11px] font-medium py-1.5 px-4 border-b border-border/40 hidden md:block">
            <div className="max-w-[1780px] mx-auto flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <Link href="/sell" className="text-primary font-bold hover:text-primary/90 transition-colors flex items-center gap-1">
                        Sell on Campus Market
                    </Link>
                    <div className="hidden lg:flex items-center gap-5 text-muted-foreground/80">
                        <Link href="/community" className="hover:text-primary transition-colors">Community</Link>
                        <Link href="/teams" className="hover:text-primary transition-colors">Teams</Link>
                        <Link href="/help" className="hover:text-primary transition-colors">Help</Link>
                        <Link href="/support" className="hover:text-primary transition-colors">Support</Link>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button className="flex items-center gap-1 hover:text-primary transition-colors">
                        <span>English</span>
                        <ChevronDown className="w-3 h-3" />
                    </button>
                    <button className="flex items-center gap-1 hover:text-primary transition-colors">
                        <span>USD</span>
                        <ChevronDown className="w-3 h-3" />
                    </button>
                </div>
            </div>
        </div>
    );
}
