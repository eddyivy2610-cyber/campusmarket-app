"use client";

import React, { useEffect, useState } from "react";
import {
    CheckCircle2,
    ShieldCheck,
    GraduationCap,
    Star,
    EyeOff,
    Flag,
    Trash2,
    RefreshCw,
    Loader2,
} from "lucide-react";
import { apiGet, apiPatch, apiDelete } from "@/lib/apiClient";

export default function BadgesAndReviewsPage() {
    const [activeTab, setActiveTab] = useState<"reviews" | "students">("reviews");
    const [reviews, setReviews] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [reviewStatusFilter, setReviewStatusFilter] = useState("all");
    const [isLoading, setIsLoading] = useState(true);
    const [feedback, setFeedback] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            if (activeTab === "reviews") {
                const url =
                    reviewStatusFilter !== "all"
                        ? `admin/reviews?status=${reviewStatusFilter}`
                        : "admin/reviews";
                const res: any = await apiGet(url);
                setReviews(res?.data || []);
            } else {
                const res: any = await apiGet("admin/users");
                setUsers(res?.data || []);
            }
        } catch (err) {
            console.error("Failed to load badges/reviews data:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [activeTab, reviewStatusFilter]);

    const handleModerateReview = async (
        reviewId: string,
        status: "published" | "flagged" | "hidden"
    ) => {
        try {
            const res: any = await apiPatch(`admin/reviews/${reviewId}`, {
                status,
                reason: `Admin set review status to ${status}`,
            });
            if (res?.success) {
                setFeedback(`Review updated to "${status}" and store rating recomputed.`);
                fetchData();
                setTimeout(() => setFeedback(null), 3500);
            }
        } catch (err: any) {
            alert(err?.message || "Failed to moderate review.");
        }
    };

    const handleDeleteReview = async (reviewId: string) => {
        try {
            const res: any = await apiDelete(`admin/reviews/${reviewId}`);
            if (res?.success) {
                setFeedback("Review deleted and store rating recomputed.");
                fetchData();
                setTimeout(() => setFeedback(null), 3500);
            }
        } catch (err: any) {
            alert(err?.message || "Failed to delete review.");
        }
    };

    const handleToggleStudentBadge = async (user: any) => {
        try {
            const action = user.studentVerified ? "revoke_verification" : "approve";
            const res: any = await apiPatch(`admin/users/${user._id}`, {
                action,
                reason: `Admin ${action} via Badges & Verification center`,
            });
            if (res?.success) {
                setFeedback(res.message || "Student verification updated.");
                fetchData();
                setTimeout(() => setFeedback(null), 3500);
            }
        } catch (err: any) {
            alert(err?.message || "Failed to update student badge.");
        }
    };

    return (
        <div className="space-y-6 pb-12 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-6 rounded-3xl border border-border/60 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                        <ShieldCheck size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl md:text-2xl font-black text-foreground tracking-tight">
                            Badges, Student Verification & Review Moderation
                        </h1>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Manage student verification badges and moderate store-scoped customer reviews.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setActiveTab("reviews")}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                            activeTab === "reviews"
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary text-muted-foreground"
                        }`}
                    >
                        Store Reviews Moderation
                    </button>
                    <button
                        onClick={() => setActiveTab("students")}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                            activeTab === "students"
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary text-muted-foreground"
                        }`}
                    >
                        Student Verification Badges
                    </button>
                    <button
                        onClick={fetchData}
                        className="p-2.5 rounded-xl bg-secondary hover:bg-secondary/80"
                    >
                        <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                    </button>
                </div>
            </div>

            {feedback && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    {feedback}
                </div>
            )}

            {activeTab === "reviews" ? (
                <div className="bg-card rounded-3xl border border-border/60 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between">
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Customer Reviews ({reviews.length})
                        </p>
                        <select
                            value={reviewStatusFilter}
                            onChange={(e) => setReviewStatusFilter(e.target.value)}
                            className="h-9 px-3 rounded-xl bg-background border border-border text-xs font-bold"
                        >
                            <option value="all">All Statuses</option>
                            <option value="published">Published</option>
                            <option value="flagged">Flagged</option>
                            <option value="hidden">Hidden</option>
                        </select>
                    </div>

                    {isLoading ? (
                        <div className="py-16 flex flex-col items-center justify-center text-muted-foreground">
                            <Loader2 className="w-7 h-7 animate-spin text-primary mb-2" />
                            <p className="text-xs font-bold uppercase">Loading reviews...</p>
                        </div>
                    ) : reviews.length === 0 ? (
                        <div className="py-16 text-center text-muted-foreground">
                            <Star className="w-10 h-10 mx-auto opacity-20 mb-2" />
                            <p className="text-sm font-bold text-foreground">No reviews found</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border/40">
                            {reviews.map((rev) => (
                                <div
                                    key={rev._id}
                                    className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                                >
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-500 text-xs font-black">
                                                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                                {rev.rating}.0
                                            </span>
                                            <span className="text-xs font-bold text-foreground">
                                                Store: {rev.storeName}
                                            </span>
                                            <span
                                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                                    rev.status === "published"
                                                        ? "bg-emerald-500/10 text-emerald-500"
                                                        : rev.status === "flagged"
                                                        ? "bg-amber-500/10 text-amber-500"
                                                        : "bg-rose-500/10 text-rose-500"
                                                }`}
                                            >
                                                {rev.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-foreground/90 font-medium">
                                            &ldquo;{rev.comment}&rdquo;
                                        </p>
                                        <p className="text-[11px] text-muted-foreground">
                                            Reviewer (Admin View): {rev.reviewer?.name} ({rev.reviewer?.email})
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        {rev.status !== "published" && (
                                            <button
                                                onClick={() => handleModerateReview(rev._id, "published")}
                                                className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-1"
                                            >
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                Publish
                                            </button>
                                        )}
                                        {rev.status !== "flagged" && (
                                            <button
                                                onClick={() => handleModerateReview(rev._id, "flagged")}
                                                className="px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-500 text-xs font-bold flex items-center gap-1"
                                            >
                                                <Flag className="w-3.5 h-3.5" />
                                                Flag
                                            </button>
                                        )}
                                        {rev.status !== "hidden" && (
                                            <button
                                                onClick={() => handleModerateReview(rev._id, "hidden")}
                                                className="px-3 py-1.5 rounded-xl bg-secondary text-foreground text-xs font-bold flex items-center gap-1"
                                            >
                                                <EyeOff className="w-3.5 h-3.5" />
                                                Hide
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDeleteReview(rev._id)}
                                            className="p-2 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500/20"
                                            title="Permanently Delete Review"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-card rounded-3xl border border-border/60 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-border/50">
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Student Status & Badge Verification ({users.length} users)
                        </p>
                    </div>
                    <div className="divide-y divide-border/40">
                        {users.map((u) => {
                            const displayName =
                                u.fullName || u.profile?.displayName || u.name || u.email;
                            return (
                                <div
                                    key={u._id}
                                    className="p-4 px-6 flex items-center justify-between gap-4"
                                >
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-foreground">
                                                {displayName}
                                            </span>
                                            {u.studentVerified ? (
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-500">
                                                    Verified Student
                                                </span>
                                            ) : (
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-secondary text-muted-foreground">
                                                    Unverified
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            {u.email} • Campus: {u.campus || "Not set"} • Stores:{" "}
                                            {u.storesCount || 0}/3
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleToggleStudentBadge(u)}
                                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
                                            u.studentVerified
                                                ? "bg-rose-500/10 text-rose-500 hover:bg-rose-500/20"
                                                : "bg-emerald-600 text-white hover:bg-emerald-700"
                                        }`}
                                    >
                                        <GraduationCap className="w-3.5 h-3.5" />
                                        {u.studentVerified ? "Revoke Badge" : "Grant Student Badge"}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
