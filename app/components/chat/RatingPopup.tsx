"use client";

import { useState } from "react";
import { Star, X, MessageSquare, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface RatingPopupProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (rating: number, comment: string) => void;
    itemTitle: string;
    vendorName: string;
}

export function RatingPopup({ isOpen, onClose, onSubmit, itemTitle, vendorName }: RatingPopupProps) {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleConfirm = async () => {
        if (rating === 0) return;
        setIsSubmitting(true);
        await onSubmit(rating, comment);
        setIsSubmitting(false);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-md bg-card border border-border/50 rounded-[32px] p-8 shadow-2xl overflow-hidden"
                    >
                        {/* Background Decorations */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 hover:bg-secondary rounded-full transition-colors text-muted-foreground hover:text-foreground"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex flex-col items-center text-center space-y-6">
                            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-2">
                                <ShieldCheck className="w-8 h-8 text-primary" />
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-2xl font-black text-foreground uppercase tracking-tight">Order Completed!</h3>
                                <p className="text-sm text-muted-foreground font-medium max-w-[280px]">
                                    Please rate your experience with <span className="text-foreground font-bold">{vendorName}</span> for the <span className="text-foreground font-bold">{itemTitle}</span>.
                                </p>
                            </div>

                            {/* Stars */}
                            <div className="flex items-center gap-2 py-4">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        onMouseEnter={() => setHover(star)}
                                        onMouseLeave={() => setHover(0)}
                                        onClick={() => setRating(star)}
                                        className="transition-transform active:scale-90"
                                    >
                                        <Star
                                            className={`w-10 h-10 transition-all duration-300 ${
                                                star <= (hover || rating)
                                                    ? "fill-amber-400 text-amber-400 filter drop-shadow-[0_0_8px_rgba(251,191,36,0.4)] scale-110"
                                                    : "text-muted-foreground/30"
                                            }`}
                                        />
                                    </button>
                                ))}
                            </div>

                            {/* Comment */}
                            <div className="w-full space-y-3">
                                <div className="relative">
                                    <MessageSquare className="absolute left-4 top-4 w-4 h-4 text-muted-foreground/40" />
                                    <textarea
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder="Add a comment about the item or seller..."
                                        className="w-full min-h-[120px] bg-secondary/30 border border-border/50 rounded-2xl p-4 pl-12 text-sm font-medium outline-none focus:border-primary/50 transition-all placeholder:text-muted-foreground/30 resize-none"
                                    />
                                </div>
                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                                    Your review helps keep the campus safe
                                </p>
                            </div>

                            <button
                                onClick={handleConfirm}
                                disabled={rating === 0 || isSubmitting}
                                className="w-full h-14 bg-primary text-black text-xs font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale"
                            >
                                {isSubmitting ? "Submitting..." : "Submit Review"}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
