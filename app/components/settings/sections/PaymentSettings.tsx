"use client";

import React from "react";
import { CreditCard, Landmark, Wallet, Plus, Trash2 } from "lucide-react";
import { cn } from "../../../lib/utils";

interface CardProps {
    brand: string;
    last4: string;
    expiry: string;
    isDefault?: boolean;
}

function SavedCard({ brand, last4, expiry, isDefault }: CardProps) {
    return (
        <div className="flex items-center justify-between py-4 group bg-muted/20 px-4 rounded-2xl border border-border/10">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-secondary/50 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                    <CreditCard className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                        <h4 className="text-sm font-medium">{brand} •••• {last4}</h4>
                        {isDefault && (
                            <span className="px-1.5 py-0.5 bg-primary/10 text-primary rounded text-[10px] font-semibold">Default</span>
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground">Expires {expiry}</p>
                </div>
            </div>
            <button className="p-2 text-muted-foreground hover:text-red-500 transition-colors">
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
    );
}

export function PaymentSettings() {
    return (
        <div className="max-w-4xl space-y-12 relative pb-12">
            {/* Cards Section */}
            <div className="space-y-6">
                <div className="pb-4 border-b border-border/40 flex justify-between items-center">
                    <h2 className="text-base font-semibold">Payment Methods</h2>
                    <button className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:opacity-70 transition-opacity">
                        <Plus className="w-3.5 h-3.5" /> Add New
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <SavedCard brand="Visa" last4="4242" expiry="09/27" isDefault={true} />
                </div>
            </div>

            {/* Payouts Section */}
            <div className="space-y-6">
                <div className="pb-4 border-b border-border/40">
                    <h2 className="text-base font-semibold">Payout Methods</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-4 py-4 px-4 bg-muted/20 rounded-2xl border border-border/10">
                        <div className="w-10 h-10 rounded-lg bg-secondary/50 flex items-center justify-center text-muted-foreground">
                            <Landmark className="w-5 h-5" />
                        </div>
                        <div className="space-y-0.5">
                            <h4 className="text-sm font-medium">First Bank of Nigeria</h4>
                            <p className="text-xs text-muted-foreground">•••• 6789</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Coming Soon Overlay */}
            <div className="absolute inset-0 z-10 bg-background/40 backdrop-blur-[1px] flex items-center justify-center">
                <div className="bg-background border border-border/60 p-8 rounded-xl shadow-xl text-center max-w-sm space-y-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto mb-2">
                        <Wallet className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-base font-semibold">Payments Coming Soon</h3>
                        <p className="text-sm text-muted-foreground">We're finalizing our secure campus payment system. Be the first to know when it's live.</p>
                    </div>
                    <button className="w-full py-3.5 bg-primary text-white rounded-2xl text-sm font-bold shadow-lg shadow-primary/20 hover:opacity-95 transition-all active:scale-[0.98]">
                        Notify Me
                    </button>
                </div>
            </div>
        </div>
    );
}
