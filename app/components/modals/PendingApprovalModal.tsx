"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, ShieldAlert, X } from "lucide-react";
import Link from "next/link";

interface PendingApprovalModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function PendingApprovalModal({ isOpen, onClose }: PendingApprovalModalProps) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                />

                {/* Modal Content */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-sm overflow-hidden rounded-[24px] border border-border/50 bg-card p-6 shadow-2xl relative"
                >
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground hover:bg-secondary transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>

                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
                        <Clock className="h-8 w-8" />
                    </div>

                    <div className="text-center space-y-3 font-heading">
                        <h2 className="text-xl font-bold text-foreground">
                            Application Pending
                        </h2>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Your seller application is currently under review by our team. We aim to review all applications within 24 hours.
                        </p>
                    </div>

                    <div className="mt-8 flex flex-col gap-3">
                        <button
                            onClick={onClose}
                            className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold uppercase tracking-widest text-primary-foreground transition-all hover:opacity-90 active:scale-95"
                        >
                            Okay, got it
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
