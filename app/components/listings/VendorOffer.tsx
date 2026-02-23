"use client";

import React, { useState } from "react";
import { Zap, Calendar } from "lucide-react";

interface VendorOfferProps {
    offer?: {
        salesPeriod: string;
        promoPeriod: string;
    };
}

export function VendorOffer({ offer }: VendorOfferProps) {
    if (!offer) return null;

    return (
        <div className="bg-primary/5 border border-primary/10 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 space-y-3.5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white shrink-0">
                            <Zap className="w-3.5 h-3.5 fill-current" />
                        </div>
                        <span className="font-bold text-xs tracking-wider text-primary uppercase">
                            Special Offer
                        </span>
                    </div>
                    <div className="px-2 py-0.5 bg-primary/10 rounded-full text-[8px] font-bold text-primary uppercase tracking-widest border border-primary/10">
                        Active
                    </div>
                </div>

                <div className="space-y-2.5">
                    <div className="flex items-center gap-3 p-3 bg-white dark:bg-zinc-900/50 rounded-xl border border-primary/10">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                            <Calendar className="w-4 h-4" />
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-[0.15em]">Sales Period</p>
                            <p className="text-[11px] font-bold text-foreground uppercase tracking-tight">{offer.salesPeriod}</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-primary text-white rounded-xl shadow-lg shadow-primary/20">
                        <div className="space-y-0.5">
                            <p className="text-[8px] font-bold text-white/60 uppercase tracking-[0.15em]">Promo Event</p>
                            <p className="text-sm font-bold uppercase tracking-tight">{offer.promoPeriod}</p>
                        </div>
                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse shadow-[0_0_8px_white]" />
                    </div>
                </div>
            </div>
        </div>
    );
}
