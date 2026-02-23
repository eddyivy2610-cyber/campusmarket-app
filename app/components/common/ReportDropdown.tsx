"use client";

import React, { useState, useRef, useEffect } from "react";
import { Flag, Send, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/utils";

interface ReportDropdownProps {
    reportType: "listing" | "profile";
    targetId: string | number;
    triggerClassName?: string;
    align?: "left" | "right";
    children?: React.ReactNode;
}

export function ReportDropdown({ reportType, targetId, triggerClassName, align = "right", children }: ReportDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [reason, setReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const charLimit = 200;

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
            // Reset states when closed
            if (!isSubmitting) {
                setTimeout(() => {
                    setReason("");
                    setIsSuccess(false);
                }, 300);
            }
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen, isSubmitting]);

    const handleReport = async () => {
        if (!reason.trim()) return;

        setIsSubmitting(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        setIsSubmitting(false);
        setIsSuccess(true);

        // Close after a delay to show success
        setTimeout(() => {
            setIsOpen(false);
        }, 2000);
    };

    return (
        <div className="relative inline-block" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "relative transition-all active:scale-95 group",
                    !children && "p-2 hover:bg-secondary rounded-lg",
                    triggerClassName
                )}
                title={`Report ${reportType}`}
            >
                {children ? children : (
                    <Flag className={cn("w-3.5 h-3.5", isOpen ? "text-red-500" : "opacity-70 group-hover:text-red-500")} />
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className={cn(
                            "absolute z-50 mt-2 w-72 bg-card border border-border/60 rounded-2xl shadow-2xl p-4 overflow-hidden",
                            align === "right" ? "right-0" : "left-0"
                        )}
                    >
                        {isSuccess ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex flex-col items-center justify-center py-6 text-center space-y-3"
                            >
                                <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500">
                                    <svg className="w-6 h-6 fill-current" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold uppercase tracking-tight">Report Received</h4>
                                    <p className="text-[10px] text-muted-foreground font-medium mt-1">Our moderators will review this shortly.</p>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-foreground flex items-center gap-2">
                                        <Flag className="w-3 h-3 text-red-500" />
                                        Report {reportType}
                                    </h3>
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="p-1 hover:bg-secondary rounded-lg transition-colors"
                                    >
                                        <X className="w-3 h-3 opacity-50" />
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    <div className="relative">
                                        <textarea
                                            value={reason}
                                            onChange={(e) => setReason(e.target.value.slice(0, charLimit))}
                                            placeholder={`Why are you reporting this ${reportType}?`}
                                            className="w-full bg-secondary/30 border border-border/40 rounded-xl p-3 text-xs font-medium placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/30 min-h-[100px] resize-none leading-relaxed"
                                            disabled={isSubmitting}
                                        />
                                        <div className={cn(
                                            "absolute bottom-2 right-3 text-[9px] font-bold tracking-tighter transition-colors",
                                            reason.length >= charLimit ? "text-red-500" : "text-muted-foreground/30"
                                        )}>
                                            {reason.length}/{charLimit}
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleReport}
                                    disabled={!reason.trim() || isSubmitting}
                                    className="w-full flex items-center justify-center gap-2 bg-foreground text-background font-bold py-2.5 rounded-xl hover:bg-foreground/90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 text-[10px] uppercase tracking-widest"
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                        <Send className="w-3.5 h-3.5" />
                                    )}
                                    {isSubmitting ? "Sending..." : "Send Report"}
                                </button>
                            </div>
                        )}

                        {/* Decorative background flair */}
                        <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-red-500/5 rounded-full blur-2xl pointer-events-none" />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
