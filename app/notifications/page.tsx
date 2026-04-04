"use client";

import { mockNotifications } from "../data/notifications";
import { useAuth } from "../context/AuthContext";
import Link from "next/link";

export default function NotificationsPage() {
    const { user, refreshUser } = useAuth();
    const isStudentPending = !!user?.isStudent && !user?.studentVerified;

    return (
        <div className="min-h-[70vh] bg-background text-foreground font-heading px-4 md:px-8 py-6">
            <div className="max-w-2xl mx-auto">
                <div className="hidden md:flex items-center justify-between mb-4">
                    <h1 className="text-lg font-bold">Notifications</h1>
                    <Link href="/home" className="text-xs font-bold uppercase tracking-widest text-primary">
                        Back Home
                    </Link>
                </div>

                <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
                    {isStudentPending && (
                        <div className="flex gap-3 px-4 py-3 bg-primary/5 border-b border-border/40">
                            <div className="w-8 h-8 rounded-lg bg-secondary border border-border flex items-center justify-center">
                                <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-start justify-between gap-2">
                                    <p className="text-sm font-bold">Student Verification Pending</p>
                                    <span className="text-[10px] text-muted-foreground">Now</span>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Your student ID is under review. Selling tools, dashboard, listings, and ratings are locked until approval.
                                </p>
                                <button
                                    onClick={() => refreshUser()}
                                    className="mt-1 text-[10px] font-bold text-primary hover:underline"
                                >
                                    Refresh status
                                </button>
                            </div>
                        </div>
                    )}

                    {mockNotifications.map((notif) => (
                        <div
                            key={notif.id}
                            className={`flex gap-3 px-4 py-3 border-b border-border/40 last:border-0 ${!notif.isRead ? "bg-primary/5" : ""}`}
                        >
                            <div className="w-8 h-8 rounded-lg overflow-hidden bg-secondary border border-border">
                                {notif.image ? (
                                    <img src={notif.image} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-secondary animate-pulse" />
                                )}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-start justify-between gap-2">
                                    <p className={`text-sm ${!notif.isRead ? "font-bold" : "font-semibold text-foreground/80"}`}>
                                        {notif.title}
                                    </p>
                                    <span className="text-[10px] text-muted-foreground">{notif.timestamp}</span>
                                </div>
                                <p className="text-xs text-muted-foreground">{notif.message}</p>
                                {notif.actions && notif.actions.length > 0 && (
                                    <button className="mt-1 text-[10px] font-bold text-primary hover:underline">
                                        {notif.actions[0]}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
