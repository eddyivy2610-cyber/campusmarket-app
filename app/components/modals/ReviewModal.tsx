"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star, PenLine } from "lucide-react";

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: {
        title: string;
        vendorName: string;
    };
}

export function ReviewModal({ isOpen, onClose, product }: ReviewModalProps) {
    const [recommended, setRecommended] = useState<boolean | null>(null);
    const [comment, setComment] = useState("");
    const [isAnonymous, setIsAnonymous] = useState(false);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="relative w-full max-w-sm sm:max-w-[400px] bg-card border border-border/50 rounded-[24px] shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
                    >
                        <div
                            className="p-5 space-y-5 overflow-y-auto flex-1 custom-scrollbar"
                            data-lenis-prevent
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                                        <PenLine className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h2 className="font-bold text-base tracking-tight uppercase leading-none">Review</h2>
                                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Share experience</p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-all border border-border/40"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            {/* Context */}
                            <div className="text-center space-y-1 py-3 border-b border-border/20">
                                <p className="font-bold text-sm tracking-tight leading-none">{product.title}</p>
                                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none">From {product.vendorName}</p>
                            </div>

                            {/* Inputs */}
                            <div className="space-y-6">
                                <div className="flex flex-col items-center gap-3">
                                    <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Do you recommend this?</label>
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => setRecommended(true)}
                                            className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${recommended === true
                                                ? "bg-emerald-500/10 border-emerald-500 text-emerald-600 shadow-lg shadow-emerald-500/10"
                                                : "bg-secondary/50 border-border/40 text-muted-foreground hover:border-emerald-500/30"
                                                }`}
                                        >
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${recommended === true ? "bg-emerald-500 text-white" : "bg-secondary text-muted-foreground"
                                                }`}>
                                                <svg className="w-6 h-6 fill-current" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <span className="text-[10px] font-bold uppercase tracking-widest">Recommended</span>
                                        </button>

                                        <button
                                            onClick={() => setRecommended(false)}
                                            className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${recommended === false
                                                ? "bg-red-500/10 border-red-500 text-red-600 shadow-lg shadow-red-500/10"
                                                : "bg-secondary/50 border-border/40 text-muted-foreground hover:border-red-500/30"
                                                }`}
                                        >
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${recommended === false ? "bg-red-500 text-white" : "bg-secondary text-muted-foreground"
                                                }`}>
                                                <X className="w-6 h-6" />
                                            </div>
                                            <span className="text-[10px] font-bold uppercase tracking-widest">Not Recommended</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Write your review *</label>
                                    <textarea
                                        placeholder="Tell us about it..."
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        className="w-full bg-secondary/50 border-2 border-border/40 focus:border-amber-500/50 rounded-xl p-4 text-xs font-medium outline-none transition-all h-24 resize-none"
                                        maxLength={500}
                                    />
                                    <div className="flex justify-end pr-2">
                                        <span className="text-[9px] font-bold text-muted-foreground/60">{comment.length}/500</span>
                                    </div>
                                </div>


                                <div className="flex items-center gap-2.5 pl-1 py-1">
                                    <button
                                        onClick={() => setIsAnonymous(!isAnonymous)}
                                        className={`w-4 h-4 rounded-md border-2 transition-all flex items-center justify-center ${isAnonymous ? "bg-primary border-primary" : "border-border/60 bg-transparent"
                                            }`}
                                    >
                                        {isAnonymous && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                    </button>
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Anonymous review</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex h-11 gap-2.5 mt-2">
                                <button
                                    onClick={onClose}
                                    className="flex-1 bg-secondary text-foreground font-bold rounded-xl hover:bg-secondary/80 transition-all uppercase tracking-widest text-[9px]"
                                >
                                    Cancel
                                </button>
                                <button className="flex-[2] bg-foreground text-background font-bold rounded-xl hover:bg-foreground/90 transition-all uppercase tracking-widest text-[9px]">
                                    Submit
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
