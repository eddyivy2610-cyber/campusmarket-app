"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, X } from "lucide-react";

interface AuthErrorModalProps {
    isOpen: boolean;
    onClose: () => void;
    message: string;
    title?: string;
}

export function AuthErrorModal({ isOpen, onClose, message, title = "Registration Error" }: AuthErrorModalProps) {
    if (!isOpen) return null;

    // Detect specific error types to customize the title/icon
    const isConflict = message.toLowerCase().includes("already in use") || message.toLowerCase().includes("exists");

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
                    className="relative w-full max-w-sm overflow-hidden rounded-[24px] border border-red-500/20 bg-card p-6 shadow-2xl"
                >
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground hover:bg-secondary transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>

                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-red-500">
                        <AlertCircle className="h-8 w-8" />
                    </div>

                    <div className="text-center space-y-3 font-heading">
                        <h2 className="text-xl font-bold text-foreground">
                            {isConflict ? "Account Exists" : title}
                        </h2>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {message}
                        </p>
                    </div>

                    <div className="mt-8 flex flex-col gap-3">
                        <button
                            onClick={onClose}
                            className="w-full rounded-xl bg-primary px-4 py-3 text-xs font-bold uppercase tracking-widest text-primary-foreground transition-all hover:opacity-90 active:scale-95 text-center"
                        >
                            Try Again
                        </button>
                        {isConflict && (
                            <button
                                onClick={() => {
                                    onClose();
                                    // You could add navigation to login here if you have router access
                                    window.location.href = "/login";
                                }}
                                className="w-full rounded-xl border border-border px-4 py-3 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-all"
                            >
                                Log In Instead
                            </button>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
