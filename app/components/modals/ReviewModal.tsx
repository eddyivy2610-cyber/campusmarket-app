"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star, PenLine, Loader2 } from "lucide-react";
import { reviewClient } from "@/lib/reviewClient";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    title: string;
    vendorName: string;
    orderId?: string;
  };
  onSuccess?: (createdReview: any) => void;
}

export function ReviewModal({ isOpen, onClose, product, onSuccess }: ReviewModalProps) {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!product.orderId) {
      setErrorMessage("No verified order found to review.");
      return;
    }

    if (!comment.trim()) {
      setErrorMessage("Please write a short comment about your exchange.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const res = await reviewClient.submitReview({
        orderId: product.orderId,
        rating,
        comment: comment.trim(),
      });

      if (res.success) {
        onSuccess?.(res.data);
        onClose();
      } else {
        setErrorMessage(res.message || "Failed to submit review.");
      }
    } catch (err: any) {
      if (err.status === 409 || err.message?.includes("already reviewed")) {
        setErrorMessage("You have already submitted a review for this order.");
      } else if (err.status === 401) {
        setErrorMessage("Your session has expired. Please sign in again.");
      } else {
        setErrorMessage(err.message || "Failed to submit review. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

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
                  disabled={isSubmitting}
                  className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-all border border-border/40 disabled:opacity-50"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Context */}
              <div className="text-center space-y-1 py-3 border-b border-border/20">
                <p className="font-bold text-sm tracking-tight leading-none">{product.title}</p>
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none">From {product.vendorName}</p>
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 dark:text-red-400 text-xs font-medium">
                  {errorMessage}
                </div>
              )}

              {/* Star Rating Inputs */}
              <div className="space-y-4">
                <div className="flex flex-col items-center gap-2">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Select Rating</label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 focus:outline-none transition-transform hover:scale-110 active:scale-95"
                      >
                        <Star
                          className={`w-7 h-7 ${
                            star <= (hoverRating || rating)
                              ? "fill-amber-400 text-amber-400"
                              : "text-muted-foreground/30"
                          } transition-colors`}
                        />
                      </button>
                    ))}
                  </div>
                  <span className="text-[11px] font-bold text-amber-500">
                    {rating} of 5 Stars
                  </span>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Write your review *</label>
                  <textarea
                    placeholder="Tell other students about the item and meetup..."
                    value={comment}
                    disabled={isSubmitting}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full bg-secondary/50 border-2 border-border/40 focus:border-amber-500/50 rounded-xl p-4 text-xs font-medium outline-none transition-all h-24 resize-none disabled:opacity-50"
                    maxLength={1000}
                  />
                  <div className="flex justify-end pr-2">
                    <span className="text-[9px] font-bold text-muted-foreground/60">{comment.length}/1000</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex h-11 gap-2.5 mt-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="flex-1 bg-secondary text-foreground font-bold rounded-xl hover:bg-secondary/80 transition-all uppercase tracking-widest text-[9px] disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-[2] bg-foreground text-background font-bold rounded-xl hover:bg-foreground/90 transition-all uppercase tracking-widest text-[9px] flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Review"
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
