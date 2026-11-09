"use client";

import React, { useState } from "react";
import {
    X,
    Flag,
    Clock,
    AlertTriangle,
    ExternalLink,
    ShieldAlert,
    Ban,
    Trash2,
    CheckCircle2,
    Store,
    Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { apiPatch } from "@/lib/apiClient";

interface ReportDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    report: any;
    onResolved?: () => void;
}

const RESOLUTION_OPTIONS = [
    { id: "none", label: "Dismiss (No Violation)", icon: CheckCircle2 },
    { id: "warning", label: "Send Official Warning", icon: AlertTriangle },
    { id: "remove_listing", label: "Remove Listing", icon: Trash2 },
    { id: "suspend_store", label: "Suspend Storefront", icon: Store },
    { id: "suspend_user", label: "Suspend User Account", icon: Ban },
    { id: "ban_user", label: "Permanent Ban User", icon: ShieldAlert },
];

export default function AdminReportDetailModal({
    isOpen,
    onClose,
    report,
    onResolved,
}: ReportDetailModalProps) {
    const [resolution, setResolution] = useState("none");
    const [adminNotes, setAdminNotes] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    if (!report) return null;

    const priorityColors = {
        High: "text-rose-500 bg-rose-500/10 border-rose-500/20",
        Medium: "text-amber-500 bg-amber-500/10 border-amber-500/20",
        Low: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    };

    const handleResolveSubmit = async () => {
        if (!resolution) return;
        try {
            setIsSubmitting(true);
            setErrorMsg(null);
            const targetId = report._id || report.id;
            await apiPatch(`admin/reports/${targetId}`, {
                resolution,
                notes: adminNotes.trim(),
            });
            setAdminNotes("");
            onResolved?.();
            onClose();
        } catch (err: any) {
            setErrorMsg(err?.message || "Failed to resolve report.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-3xl bg-card border border-border rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                    >
                        {/* Header */}
                        <div className="px-6 py-5 border-b border-border/50 flex items-center justify-between bg-muted/20 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 border border-rose-500/20 shadow-inner">
                                    <Flag size={20} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-lg font-bold text-foreground">
                                            Report #{String(report.id || "").slice(0, 12)}
                                        </h2>
                                        <span
                                            className={cn(
                                                "px-2 py-0.5 rounded-full text-[10px] font-bold border",
                                                priorityColors[
                                                    (report.priority as keyof typeof priorityColors) || "Medium"
                                                ]
                                            )}
                                        >
                                            {report.priority || "Medium"} Priority
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 mt-0.5">
                                        <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest flex items-center gap-1">
                                            <Clock size={10} />
                                            {report.submittedAt || "Recent"}
                                        </span>
                                        <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest flex items-center gap-1">
                                            <span
                                                className={cn(
                                                    "w-1.5 h-1.5 rounded-full",
                                                    report.status === "Resolved"
                                                        ? "bg-emerald-500"
                                                        : "bg-rose-500 animate-pulse"
                                                )}
                                            />
                                            {report.status || "Pending"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground shrink-0"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
                            {errorMsg && (
                                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold">
                                    {errorMsg}
                                </div>
                            )}

                            {/* Parties Involved Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 rounded-2xl bg-secondary/20 border border-border/50 space-y-2">
                                    <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
                                        Reported By
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20">
                                            {String(report.reporter?.name || "U").charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-foreground">
                                                {report.reporter?.name || "Campus User"}
                                            </div>
                                            <div className="text-[10px] font-bold text-muted-foreground/60">
                                                {report.reporter?.email || `ID: ${report.reporter?.id || "N/A"}`}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 rounded-2xl bg-secondary/20 border border-border/50 space-y-2">
                                    <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
                                        Reported Target ({report.targetType || report.against?.type})
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 font-bold border border-rose-500/20">
                                            {String(report.against?.name || "T").charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-foreground">
                                                {report.against?.name || "Target"}
                                            </div>
                                            <div className="text-[10px] font-bold text-muted-foreground/60 uppercase">
                                                {report.against?.type || report.targetType} • Status:{" "}
                                                {report.against?.status || "active"}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Report Details */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between border-b border-border/50 pb-2">
                                    <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                                        Report Details
                                    </h3>
                                    <div className="px-2.5 py-0.5 bg-secondary text-foreground text-[10px] font-bold uppercase rounded">
                                        {report.category || report.reason || "Other"}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40">
                                                Target ID
                                            </span>
                                            <div className="flex items-center gap-2 text-xs font-mono font-bold text-foreground/80">
                                                {report.targetId}
                                                <ExternalLink size={12} className="opacity-40" />
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40">
                                                Violation Category
                                            </span>
                                            <div className="text-xs font-bold uppercase text-foreground/80">
                                                {report.category || report.reason}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
                                            Reporter Statement
                                        </label>
                                        <p className="text-sm text-foreground/80 leading-relaxed font-medium bg-secondary/10 p-4 rounded-2xl border border-border/30">
                                            {report.details || report.description || "No additional text provided."}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Resolution & 1-Click Enforcement Form */}
                            <div className="space-y-4 pt-4 border-t border-border/50">
                                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                                    1-Click Enforcement & Resolution
                                </h3>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                    {RESOLUTION_OPTIONS.map((opt) => (
                                        <button
                                            key={opt.id}
                                            onClick={() => setResolution(opt.id)}
                                            className={cn(
                                                "flex items-center gap-3 p-3 rounded-2xl border transition-all text-left",
                                                resolution === opt.id
                                                    ? "bg-primary/10 border-primary text-primary shadow-sm"
                                                    : "bg-background border-border hover:border-border/80 hover:bg-secondary/20 text-muted-foreground"
                                            )}
                                        >
                                            <opt.icon
                                                size={16}
                                                className={cn(resolution === opt.id ? "text-primary" : "opacity-40")}
                                            />
                                            <span className="text-[11px] font-bold uppercase tracking-widest">
                                                {opt.label}
                                            </span>
                                        </button>
                                    ))}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
                                        Audit & Resolution Notes
                                    </label>
                                    <textarea
                                        value={adminNotes}
                                        onChange={(e) => setAdminNotes(e.target.value)}
                                        placeholder="Document your findings and reasons for this resolution (recorded in admin_audit_logs)..."
                                        className="w-full min-h-[80px] p-4 bg-muted/30 border border-border/50 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="p-6 border-t border-border/50 bg-muted/20 flex flex-col sm:flex-row gap-3 mt-auto shrink-0">
                            <button
                                onClick={onClose}
                                className="w-full sm:flex-1 py-3 px-4 rounded-xl border border-border/50 bg-card text-[10px] font-bold uppercase tracking-widest hover:bg-muted transition-all active:scale-95 shadow-sm"
                            >
                                Cancel
                            </button>
                            <button
                                disabled={!resolution || isSubmitting}
                                onClick={handleResolveSubmit}
                                className={cn(
                                    "w-full sm:flex-[1.5] py-3 px-4 rounded-xl text-white text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2",
                                    resolution && !isSubmitting
                                        ? "bg-primary shadow-primary/20 hover:bg-primary/90"
                                        : "bg-muted-foreground/30 cursor-not-allowed"
                                )}
                            >
                                {isSubmitting ? (
                                    <Loader2 size={14} className="animate-spin" />
                                ) : (
                                    <CheckCircle2 size={14} />
                                )}
                                {isSubmitting ? "Applying Resolution..." : "Execute Resolution"}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
