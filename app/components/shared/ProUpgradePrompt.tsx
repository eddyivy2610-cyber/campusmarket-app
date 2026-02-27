"use client";

import React from "react";
import { Lock, Zap, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface ProUpgradePromptProps {
    title?: string;
    description?: string;
    featureName?: string;
}

export function ProUpgradePrompt({
    title = "Upgrade to Pro",
    description,
    featureName = "this feature"
}: ProUpgradePromptProps) {
    return (
        <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center p-6 text-center">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="max-w-md w-full bg-card border border-border/50 rounded-3xl p-8 relative overflow-hidden shadow-sm"
            >
                {/* Background Decoration */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-[50px] pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-secondary/20 rounded-full blur-[50px] pointer-events-none" />

                <div className="relative z-10 flex flex-col items-center">
                    <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6 shadow-inner relative">
                        <Lock className="w-8 h-8" />
                        <Sparkles className="w-4 h-4 text-orange-500 absolute -top-1 -right-1" />
                    </div>

                    <h3 className="text-xl font-bold font-heading mb-3">{title}</h3>

                    <p className="text-sm text-muted-foreground leading-relaxed mb-8">
                        {description || `You need a Pro account to unlock ${featureName}. Upgrade your account to access advanced analytics, detailed listings, and priority support.`}
                    </p>

                    <div className="space-y-3 w-full text-left mb-8">
                        {[
                            "Unlimited Listings & Variations",
                            "Advanced Sales Analytics",
                            "Priority Inbox Features",
                            "Pro Verified Badge"
                        ].map((benefit, i) => (
                            <div key={i} className="flex items-center gap-3 text-sm text-foreground/80 font-medium">
                                <ShieldCheck className="w-4 h-4 text-primary" />
                                {benefit}
                            </div>
                        ))}
                    </div>

                    <button className="w-full bg-primary text-white font-bold uppercase tracking-widest text-xs py-4 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-95 transition-all flex items-center justify-center gap-2 group">
                        <Zap className="w-4 h-4 fill-white text-white" />
                        Upgrade Now
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform ml-1" />
                    </button>

                    <p className="mt-4 text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                        Billed annually or monthly
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
