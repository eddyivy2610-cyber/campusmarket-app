import React from "react";
import { Star, MessageSquare } from "lucide-react";
import Image from "next/image";
import { MainHeader } from "../components/header/MainHeader";
import { Footer } from "../components/sections/Footer";

// Mock Data for Reviews
const MOCK_REVIEWS = [
    {
        id: 1,
        name: "Rachel Patel",
        date: "October 5, 2023",
        rating: 5,
        comment:
            "Found the exact Bio textbook I needed for half the price of the campus bookstore. The seller was super responsive and we met up at the library within an hour. Great experience!",
        avatarColor: "bg-blue-100",
        avatarInitial: "bg-blue-500",
    },
    {
        id: 2,
        name: "Christopher Lee",
        date: "June 25, 2023",
        rating: 4.5,
        comment:
            "Got a mini-fridge for my dorm that works perfectly! It was exactly as described in the listing. Docked half a star because the seller was running about 15 minutes late to our meetup spot, but otherwise smooth transaction.",
        avatarColor: "bg-purple-100",
        avatarInitial: "bg-purple-500",
    },
    {
        id: 3,
        name: "Brian Chen",
        date: "April 15, 2022",
        rating: 4,
        comment:
            "The desk lamp I bought is super bright and looks great on my study desk. I found the base to be slightly wobbly which wasn't mentioned, but for the price I really can't complain. Definitely beats buying brand new.",
        avatarColor: "bg-rose-100",
        avatarInitial: "bg-rose-500",
    },
];

const RATING_BREAKDOWN = [
    { stars: 5, percentage: 90 },
    { stars: 4, percentage: 60 },
    { stars: 3, percentage: 40 },
    { stars: 2, percentage: 30 },
    { stars: 1, percentage: 0 },
];

export default function FeedbackPage() {
    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground">
            <MainHeader />

            <main className="flex-1 py-10 md:py-16 relative overflow-hidden">
                <div className="w-full max-w-[1400px] mx-auto relative flex justify-start px-4 sm:px-6 xl:px-12">

                    <div className="max-w-4xl w-full flex flex-col lg:flex-row gap-10 lg:gap-14 lg:pr-[300px] xl:pr-0">

                        {/* Left Column: Average Rating Breakdown */}
                        <div className="w-full lg:w-[300px] shrink-0">
                            <h2 className="text-xl font-bold font-heading mb-5 tracking-tight">Average Rating</h2>

                            <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm">
                                {/* Score & Stars */}
                                <div className="flex items-end gap-3 mb-6">
                                    <span className="text-4xl font-black tracking-tighter leading-none">4.5</span>
                                    <div className="flex flex-col gap-1 pb-0.5">
                                        <div className="flex items-center gap-1">
                                            {[1, 2, 3, 4, 5].map((s) => (
                                                <Star
                                                    key={s}
                                                    className={`w-3.5 h-3.5 ${s <= 4.5
                                                        ? "fill-orange-400 text-orange-400"
                                                        : s === 5 && 4.5 % 1 !== 0 // Half star logic (visual only for this mock)
                                                            ? "fill-orange-400/50 text-orange-400/50"
                                                            : "text-muted-foreground/20"
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-xs text-muted-foreground font-medium">50k Reviews</span>
                                    </div>
                                </div>

                                {/* Progress Bars */}
                                <div className="space-y-3 mb-8">
                                    {RATING_BREAKDOWN.map((item) => (
                                        <div key={item.stars} className="flex items-center gap-3">
                                            <span className="w-3 text-xs font-bold text-foreground/80">{item.stars}</span>
                                            <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-orange-400 rounded-full"
                                                    style={{ width: `${item.percentage}%` }}
                                                />
                                            </div>
                                            <span className="w-8 text-right text-xs font-semibold text-muted-foreground">
                                                {item.percentage}%
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* Write Review Form */}
                                <div className="pt-6 border-t border-border/50">
                                    <textarea
                                        className="w-full bg-secondary/30 border border-border/50 rounded-xl p-3 text-sm placeholder:text-muted-foreground/50 resize-none focus:outline-none focus:border-orange-400 mb-4 h-24 transition-colors"
                                        placeholder="Write your review here..."
                                    />
                                    <button className="w-full bg-orange-400 hover:bg-orange-500 text-white font-bold py-2.5 px-5 text-sm rounded-xl transition-all shadow-md shadow-orange-500/20 active:scale-[0.98]">
                                        Submit Review
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Customer Feedback List */}
                        <div className="flex-1 min-w-0">
                            <h2 className="text-xl font-bold font-heading mb-5 tracking-tight">Customer Feedback</h2>

                            <div className="space-y-5">
                                {MOCK_REVIEWS.map((review) => (
                                    <div
                                        key={review.id}
                                        className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm transition-all hover:shadow-md"
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                                            <div className="flex items-center gap-3">
                                                {/* Avatar Mock */}
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${review.avatarColor}`}>
                                                    <div className={`w-2.5 h-2.5 rounded-full ${review.avatarInitial}`} />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-sm text-foreground">{review.name}</h4>
                                                    <span className="text-[11px] font-medium text-muted-foreground">{review.date}</span>
                                                </div>
                                            </div>

                                            {/* Stars */}
                                            <div className="flex items-center gap-0.5">
                                                {[1, 2, 3, 4, 5].map((s) => (
                                                    <Star
                                                        key={s}
                                                        className={`w-3.5 h-3.5 ${s <= Math.floor(review.rating)
                                                            ? "fill-orange-400 text-orange-400"
                                                            : s === Math.ceil(review.rating) && review.rating % 1 !== 0
                                                                ? "fill-orange-400/50 text-orange-400"
                                                                : "text-muted-foreground/20"
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            {review.comment}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Load More Button */}
                            <div className="mt-8 flex justify-center">
                                <button className="px-6 py-2.5 bg-secondary hover:bg-secondary/80 text-foreground text-sm font-bold rounded-xl transition-colors">
                                    Load More Reviews
                                </button>
                            </div>
                        </div>

                    </div>

                    {/* Right Illustration Placeholder */}
                    <div className="hidden lg:flex absolute right-4 xl:right-12 top-0 w-[300px] xl:w-[400px] h-[700px] rounded-3xl border-2 border-dashed border-border/60 bg-secondary/30 items-center justify-center text-muted-foreground/40 font-bold text-sm tracking-widest uppercase shadow-sm">
                        Illustration Placeholder
                    </div>

                </div>
            </main>

            <Footer />
        </div>
    );
}
