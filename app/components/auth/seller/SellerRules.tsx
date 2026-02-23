"use client";

import React from "react";
import { CheckCircle2, ShieldCheck, AlertCircle, ShoppingBasket, ArrowRight } from "lucide-react";

interface SellerRulesProps {
    onContinue: () => void;
}

const guidelines = [
    "Provide accurate descriptions and images of all products",
    "Respond to buyer inquiries within 24 hours if possible",
    "Ensure all listings comply with campus safety policies",
    "Maintain a professional and respectful attitude",
    "Payment should be handled safely (Escrow or Physical meetups)",
];

export function SellerRules({ onContinue }: SellerRulesProps) {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col items-center gap-3 text-center">
                <div className="p-3 bg-primary/10 rounded-[24px] text-primary">
                    <ShieldCheck className="w-10 h-10" />
                </div>
                <h2 className="text-xl font-bold font-heading">Seller Rules & Guidelines</h2>
                <p className="text-muted-foreground max-w-sm">
                    To maintain a safe community, all sellers must adhere to these basic principles.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-secondary/20 p-4 rounded-2xl border border-border/50">
                {guidelines.map((rule, idx) => (
                    <div key={idx} className="flex gap-3 items-start group">
                        <div className="mt-1 flex-shrink-0">
                            <CheckCircle2 className="w-4 h-4 text-primary" />
                        </div>
                        <p className="text-[11px] font-medium text-foreground/80 leading-snug group-hover:text-foreground transition-colors">
                            {rule}
                        </p>
                    </div>
                ))}
            </div>

            <div className="flex items-center gap-3 p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20 text-amber-600 dark:text-amber-400">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-[11px] font-bold uppercase tracking-tight leading-normal">
                    Violations may lead to permanent account suspension and loss of badges.
                </p>
            </div>

            <button
                onClick={onContinue}
                className="w-full bg-primary text-white font-bold uppercase tracking-widest py-3.5 rounded-xl shadow-xl shadow-primary/20 hover:shadow-primary/30 active:scale-95 transition-all flex items-center justify-center gap-3 group"
            >
                I Understand, Continue
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
        </div>
    );
}
