"use client";

import { Check, Star, MessageCircle, MoreHorizontal } from "lucide-react";
import Link from "next/link";

interface ProfileHeaderProps {
    isOwner?: boolean;
}

export function ProfileHeader({ isOwner = false }: ProfileHeaderProps) {
    return (
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-3xl font-black text-foreground tracking-tight">Lucky John</h1>
                    <span className="bg-blue-600 text-white p-0.5 rounded-full" title="Verified Member">
                        <Check className="w-3 h-3" strokeWidth={4} />
                    </span>
                </div>
                <p className="text-primary font-bold text-sm mb-2">Product Designer</p>

                <div className="flex items-center gap-1.5">
                    <span className="text-2xl font-bold text-foreground">4.9</span>
                    <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className="w-4 h-4 fill-blue-500 text-blue-500" />
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3 mt-2 md:mt-0">
                <Link href="/inbox/1">
                    <button className="bg-background border border-border hover:bg-secondary text-foreground font-bold py-2.5 px-6 rounded-lg transition-all active:scale-95 text-xs uppercase tracking-wider flex items-center justify-center gap-2">
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Send Message</span>
                    </button>
                </Link>
                <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2.5 px-6 rounded-lg shadow-lg shadow-blue-500/20 transition-all active:scale-95 text-xs uppercase tracking-wider flex items-center justify-center gap-2">
                    <Check className="w-3.5 h-3.5" />
                    <span>Contacts</span>
                </button>
                <button className="bg-transparent hover:bg-secondary text-foreground p-2.5 rounded-lg transition-all active:scale-95 text-xs uppercase tracking-wider">
                    <span className="text-xs font-bold text-muted-foreground">Report User</span>
                </button>
            </div>
        </div>
    );
}
