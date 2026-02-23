"use client";

import React from "react";
import { Star, BadgeCheck, PenLine, X } from "lucide-react";

interface Review {
    id: string;
    userName: string;
    recommended: boolean;
    date: string;
    comment: string;
    isVerifiedBuyer: boolean;
    vendorResponse?: string;
}

interface ProductReviewsProps {
    recommendedCount: number;
    notRecommendedCount: number;
    reviews: Review[];
    onWriteReview: () => void;
}

export function ProductReviews({ recommendedCount, notRecommendedCount, reviews, onWriteReview }: ProductReviewsProps) {
    const totalReviews = recommendedCount + notRecommendedCount;
    const recommendationRate = Math.round((recommendedCount / (totalReviews || 1)) * 100);

    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
                <div className="space-y-1.5">
                    <h2 className="text-xl font-bold font-heading tracking-tight uppercase">Reviews & Ratings</h2>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-xl border border-emerald-500/20 shadow-sm">
                            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            <span className="text-lg font-bold">{recommendationRate}%</span>
                        </div>
                        <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em] whitespace-nowrap">
                            Recommendation Rate <span className="mx-1 opacity-20">•</span> {totalReviews} Reviews
                        </div>
                    </div>
                </div>

                <button
                    onClick={onWriteReview}
                    className="flex items-center justify-center gap-2 bg-secondary text-foreground font-bold px-5 py-3 rounded-xl hover:bg-secondary/80 transition-all active:scale-[0.98] text-[9px] uppercase tracking-widest border border-border/40 shadow-sm"
                >
                    <PenLine className="w-3 h-3" />
                    Write Review
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Stats Section */}
                <div className="lg:col-span-4">
                    <div className="bg-secondary/20 p-5 rounded-2xl border border-border/20 space-y-4">
                        <div className="space-y-1">
                            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-emerald-600">
                                <span>Recommended</span>
                                <span>{recommendedCount} Ticks</span>
                            </div>
                            <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500" style={{ width: `${(recommendedCount / (totalReviews || 1)) * 100}%` }} />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-red-500">
                                <span>Not Recommended</span>
                                <span>{notRecommendedCount} X</span>
                            </div>
                            <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                <div className="h-full bg-red-500" style={{ width: `${(notRecommendedCount / (totalReviews || 1)) * 100}%` }} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reviews List */}
                <div className="lg:col-span-8 space-y-4">
                    {reviews.length > 0 ? (
                        <>
                            {reviews.map((review) => (
                                <div key={review.id} className="bg-secondary/5 border border-border/20 rounded-xl p-3.5 space-y-2 transition-all hover:bg-secondary/10">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-1.5">
                                            {review.recommended ? (
                                                <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 text-emerald-600 rounded-lg border border-emerald-500/20">
                                                    <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                    <span className="text-[8px] font-bold uppercase tracking-widest">Recommended</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1 px-2 py-0.5 bg-red-500/10 text-red-600 rounded-lg border border-red-500/20">
                                                    <X className="w-2.5 h-2.5" />
                                                    <span className="text-[8px] font-bold uppercase tracking-widest">Not Recommended</span>
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-[12px] font-medium text-foreground/80 leading-relaxed italic">
                                            "{review.comment}"
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between pt-1 border-t border-border/5">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">
                                                by {review.userName.split(' ')[0]}
                                            </span>
                                            {review.isVerifiedBuyer && (
                                                <BadgeCheck className="w-2.5 h-2.5 text-blue-500" fill="currentColor" stroke="white" strokeWidth={2} />
                                            )}
                                        </div>
                                        <span className="text-[8px] font-bold text-muted-foreground/60 uppercase tracking-[0.1em]">
                                            {review.date}
                                        </span>
                                    </div>

                                    {review.vendorResponse && (
                                        <div className="mt-2 pl-3 border-l-2 border-primary/20 space-y-1 opacity-90">
                                            <p className="text-[10px] font-medium text-foreground/70 leading-relaxed bg-primary/5 p-2 rounded-lg border border-primary/10">
                                                {review.vendorResponse}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                            <button className="w-full py-3 text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground/60 hover:text-primary transition-all border-y border-border/10">
                                More Reviews
                            </button>
                        </>
                    ) : (
                        <div className="text-center py-12 bg-secondary/5 rounded-3xl border border-dashed border-border/30">
                            <div className="w-12 h-12 bg-secondary/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-border/40">
                                <PenLine className="w-6 h-6 text-muted-foreground/30" />
                            </div>
                            <h4 className="font-bold text-sm mb-1 uppercase tracking-tight">No reviews yet</h4>
                            <p className="text-[10px] text-muted-foreground mb-4 uppercase tracking-widest">Be the first to share experience</p>
                            <button
                                onClick={onWriteReview}
                                className="bg-primary text-white font-bold px-6 py-2.5 rounded-xl hover:bg-primary/90 transition-all active:scale-95 text-[9px] uppercase tracking-widest shadow-lg shadow-primary/20"
                            >
                                Write Review
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
