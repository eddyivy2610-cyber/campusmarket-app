"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, X } from "lucide-react";
import Link from "next/link";

interface SellerRegistrationPromptModalProps {
    isOpen: boolean;
    onClose: () => void;
    isPending?: boolean;
    isStudent?: boolean;
}

export function SellerRegistrationPromptModal({ isOpen, onClose, isPending, isStudent }: SellerRegistrationPromptModalProps) {
    if (!isOpen) return null;
    const isEligible = isStudent !== false;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-sm overflow-hidden rounded-[24px] border border-border/50 bg-card p-6 shadow-2xl"
                >
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground hover:bg-secondary transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>

                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <ShieldCheck className="h-8 w-8" />
                    </div>

                    <div className="text-center space-y-3 font-heading">
                        <h2 className="text-xl font-bold text-foreground">
                            {isEligible
                                ? (isPending ? "Seller Verification Pending" : "Become a Seller")
                                : "Students Only"}
                        </h2>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {isEligible
                                ? (isPending
                                    ? "Your seller request is still under review. You can resubmit your verification if needed."
                                    : "Start selling on Campus Market by completing student verification.")
                                : "Only verified students can sell on Campus Market. You can still browse, message, and buy."}
                        </p>
                    </div>

                    <div className="mt-8 flex flex-col gap-3">
                        {isEligible && (
                            <Link
                                href="/register/seller"
                                onClick={onClose}
                                className="w-full rounded-xl bg-primary px-4 py-3 text-xs font-bold uppercase tracking-widest text-primary-foreground transition-all hover:opacity-90 active:scale-95 text-center"
                            >
                                {isPending ? "Resend / Continue" : "Go to Seller Registration"}
                            </Link>
                        )}
                        <button
                            onClick={onClose}
                            className="w-full rounded-xl border border-border px-4 py-3 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-all"
                        >
                            Okay
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
