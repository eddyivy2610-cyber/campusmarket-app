"use client";

import Link from "next/link";

export function TopBar() {
    return (
        <>
            {/* Mobile-only: slim community strip */}
            <div className="block md:hidden bg-primary/5 border-b border-border/40 px-4 py-1.5">
                <div className="flex items-center justify-center gap-1">
                    <Link
                        href="/community"
                        className="text-[11px] font-heading font-bold text-primary hover:text-primary/80 transition-colors"
                    >
                        Community
                    </Link>
                </div>
            </div>

            {/* Desktop: full top bar */}
            <div className="bg-secondary/50 text-muted-foreground text-[11px] font-heading py-1.5 px-4 border-b border-border/40 hidden md:block">
                <div className="max-w-[1780px] mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link href="/sell" className="text-primary font-bold hover:text-primary/90 transition-colors">
                            Sell on Campus Market
                        </Link>
                        <div className="hidden lg:flex items-center gap-5 text-muted-foreground/80 font-medium">
                            <Link href="/community" className="hover:text-primary transition-colors">Community</Link>
                            <Link href="/feedback" className="hover:text-primary transition-colors">Feedback</Link>
                            <Link href="/help" className="hover:text-primary transition-colors">Help</Link>
                            <Link href="/support" className="hover:text-primary transition-colors">Support</Link>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-muted-foreground/60 font-medium">English</span>
                    </div>
                </div>
            </div>
        </>
    );
}
