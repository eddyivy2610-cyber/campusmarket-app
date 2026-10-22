"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Handshake, Info, Calendar } from "lucide-react";

interface OfferModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: {
        title: string;
        price: number;
    };
}

export function OfferModal({ isOpen, onClose, product }: OfferModalProps) {
    const [offerAmount, setOfferAmount] = useState(product.price * 0.9);
    const [message, setMessage] = useState("");
    const [validity, setValidity] = useState("2 days");

    const formattedBasePrice = new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        maximumFractionDigits: 0,
    }).format(product.price);

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
                            className="p-5 space-y-4 overflow-y-auto flex-1 custom-scrollbar"
                            data-lenis-prevent
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                        <Handshake className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h2 className="font-bold text-base tracking-tight uppercase leading-none">Offer</h2>
                                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Negotiate Price</p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-all border border-border/40"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            {/* Product Summary */}
                            <div className="bg-secondary/30 rounded-xl p-3.5 border border-border/20">
                                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">{product.title}</p>
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-base text-foreground/80">{formattedBasePrice}</span>
                                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-500/10 text-green-600 rounded-full text-[8px] font-bold uppercase tracking-widest border border-green-500/10">
                                        Negotiable
                                    </div>
                                </div>
                            </div>

                            {/* Inputs */}
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Your Price *</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-base text-primary">₦</span>
                                        <input
                                            type="number"
                                            value={offerAmount}
                                            onChange={(e) => setOfferAmount(Number(e.target.value))}
                                            className="w-full bg-secondary/50 border-2 border-border/40 focus:border-primary/50 rounded-xl py-2.5 pl-9 pr-4 font-bold text-sm outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Message</label>
                                    <textarea
                                        placeholder="Note for vendor..."
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        className="w-full bg-secondary/50 border-2 border-border/40 focus:border-primary/50 rounded-xl p-4 text-xs font-medium outline-none transition-all h-24 resize-none"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Validity</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                                        <select
                                            value={validity}
                                            onChange={(e) => setValidity(e.target.value)}
                                            className="w-full bg-secondary/50 border-2 border-border/40 focus:border-primary/50 rounded-xl py-2.5 pl-10 pr-6 font-bold text-xs outline-none transition-all appearance-none cursor-pointer"
                                        >
                                            <option>2 days from now</option>
                                            <option>3 days from now</option>
                                            <option>7 days from now</option>
                                        </select>
                                    </div>
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
                                <button className="flex-[2] bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all uppercase tracking-widest text-[9px] shadow-lg shadow-primary/10">
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
