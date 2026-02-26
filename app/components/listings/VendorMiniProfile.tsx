"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
    Star,
    ShoppingBag,
    Calendar,
    Store,
    BadgeCheck
} from "lucide-react";

interface VendorMiniProfileProps {
    vendor: {
        id: string;
        name: string;
        avatar: string;
        recommendedCount: number;
        notRecommendedCount: number;
        totalSales: number;
        joinedDate: string;
        isVerified: boolean;
    };
}

export function VendorMiniProfile({ vendor }: VendorMiniProfileProps) {
    return (
        <div className="bg-card border border-border/40 rounded-2xl p-5 shadow-sm">
            <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3.5">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-secondary/30 ring-2 ring-background ring-offset-2 ring-offset-border/40 shadow-md">
                        <Image
                            src={vendor.avatar}
                            alt={vendor.name}
                            fill
                            className="object-cover"
                        />
                    </div>
                    <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                            <h3 className="font-bold text-sm tracking-tight leading-none truncate">
                                {vendor.name}
                            </h3>
                            {vendor.isVerified && (
                                <BadgeCheck className="w-4 h-4" fill="#1D9BF0" stroke="white" strokeWidth={1.5} />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <Link
                href={`/profile/${vendor.id}`}
                className="flex items-center justify-center gap-2 bg-secondary text-foreground font-bold h-11 px-4 rounded-xl hover:bg-secondary/80 transition-all active:scale-[0.98] text-[10px] uppercase tracking-widest border border-border/40 w-full shadow-sm"
            >
                <Store className="w-3.5 h-3.5 opacity-70" />
                View Profile
            </Link>
        </div>
    );
}
