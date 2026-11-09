"use client";

import React from "react";
import {
    Settings,
    Shield,
    Store,
    Lock,
    CheckCircle2,
    History,
    Users,
} from "lucide-react";
import Link from "next/link";
import {
    MAX_STORES_PER_USER,
    MAX_STUDENT_STORES_PER_USER,
    SLUG_RENAME_COOLDOWN_MS,
    SLUG_RESERVATION_DURATION_MS,
} from "@/constants/enums";

const STORE_SLUG_COOLDOWN_DAYS = Math.round(SLUG_RENAME_COOLDOWN_MS / (24 * 60 * 60 * 1000));
const STORE_SLUG_RESERVATION_DAYS = Math.round(SLUG_RESERVATION_DURATION_MS / (24 * 60 * 60 * 1000));
const RESERVED_STORE_SLUGS: string[] = [
    "admin",
    "api",
    "auth",
    "login",
    "register",
    "settings",
    "profile",
    "store",
    "stores",
    "marketplace",
    "search",
    "dashboard",
    "support",
    "help",
    "official",
    "campushive",
];

export default function SettingsPage() {
    return (
        <div className="space-y-6 pb-12 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-3 bg-card p-6 rounded-3xl border border-border/60 shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-foreground border border-border/50">
                    <Settings size={24} />
                </div>
                <div>
                    <h1 className="text-xl md:text-2xl font-black text-foreground tracking-tight">
                        Platform Governance & Security Policy Configuration
                    </h1>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Active architectural invariants, multi-store caps, privacy rules, and slug protection settings.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Multi-Store Rules */}
                <div className="p-6 rounded-3xl bg-card border border-border/60 space-y-4">
                    <div className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-foreground">
                        <Store className="w-4 h-4 text-primary" />
                        Multi-Store Ownership Rules
                    </div>
                    <div className="space-y-3 text-xs">
                        <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/30">
                            <span className="font-semibold text-muted-foreground">Max Stores Per User (`MAX_STORES_PER_USER`)</span>
                            <span className="font-black text-foreground">{MAX_STORES_PER_USER} Stores</span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/30">
                            <span className="font-semibold text-muted-foreground">Max Student Stores (`MAX_STUDENT_STORES_PER_USER`)</span>
                            <span className="font-black text-foreground">{MAX_STUDENT_STORES_PER_USER} Student Store</span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/30">
                            <span className="font-semibold text-muted-foreground">Store Slug Rename Cooldown</span>
                            <span className="font-black text-foreground">{STORE_SLUG_COOLDOWN_DAYS} Days</span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/30">
                            <span className="font-semibold text-muted-foreground">Old Slug Redirect Reservation TTL</span>
                            <span className="font-black text-foreground">{STORE_SLUG_RESERVATION_DAYS} Days</span>
                        </div>
                    </div>
                </div>

                {/* Privacy & Identity Invariants */}
                <div className="p-6 rounded-3xl bg-card border border-border/60 space-y-4">
                    <div className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-foreground">
                        <Lock className="w-4 h-4 text-emerald-500" />
                        Private User Identity & Store-Owned Listings
                    </div>
                    <div className="space-y-2.5 text-xs text-muted-foreground">
                        <div className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            <span>
                                <strong className="text-foreground">Private User Accounts:</strong> `/profile/[handle]` and public user handle lookups are disabled (`404`). Full identity is visible only to the account owner and admins.
                            </span>
                        </div>
                        <div className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            <span>
                                <strong className="text-foreground">Store-Owned Listings Only:</strong> Every listing requires a valid `storeId` owned by `sellerId`. Unlinked listings are disallowed.
                            </span>
                        </div>
                        <div className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            <span>
                                <strong className="text-foreground">Minimal Interaction Identity:</strong> Reviewers are shown as `First L.` + student badge; follower lists are private (`403`).
                            </span>
                        </div>
                        <div className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            <span>
                                <strong className="text-foreground">Append-Only Admin Audit Logs:</strong> Every administrative action is recorded in `admin_audit_logs` with sanitized before/after snapshots.
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Reserved Store Slugs */}
            <div className="p-6 rounded-3xl bg-card border border-border/60 space-y-3">
                <div className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-foreground">
                    <Shield className="w-4 h-4 text-amber-500" />
                    Protected & Reserved Store Slugs ({RESERVED_STORE_SLUGS.length})
                </div>
                <div className="flex flex-wrap gap-1.5">
                    {RESERVED_STORE_SLUGS.map((slug) => (
                        <span
                            key={slug}
                            className="px-2.5 py-1 rounded-lg bg-secondary text-[11px] font-mono font-bold text-foreground/80"
                        >
                            /{slug}
                        </span>
                    ))}
                </div>
            </div>

            {/* Quick Links */}
            <div className="flex flex-wrap gap-3">
                <Link
                    href="/admin/logs"
                    className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold flex items-center gap-2"
                >
                    <History className="w-4 h-4" />
                    Inspect Immutable Audit Logs
                </Link>
                <Link
                    href="/admin/users?role=admin"
                    className="px-4 py-2.5 rounded-xl bg-secondary text-foreground text-xs font-bold flex items-center gap-2"
                >
                    <Users className="w-4 h-4" />
                    Manage Administrator Accounts
                </Link>
            </div>
        </div>
    );
}
