"use client";

import React, { useState } from "react";
import { 
    X, 
    AlertTriangle, 
    Ban, 
    MessageSquare, 
    Clock, 
    Mail,
    ChevronDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface SuspendUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: any;
    onConfirm: (data: SuspensionData) => void;
}

export interface SuspensionData {
    duration: string;
    reason: string;
    notes: string;
    notifyEmail: boolean;
}

const DURATIONS = [
    { id: "24h", label: "24 hours" },
    { id: "7d", label: "7 days" },
    { id: "30d", label: "30 days" },
    { id: "permanent", label: "Permanent" },
];

const REASONS = [
    "Multiple policy violations - Harassment",
    "Spamming content",
    "Fraudulent activity",
    "Inappropriate profile information",
    "Terms of service violation",
    "Other"
];

export default function AdminSuspendUserModal({ isOpen, onClose, user, onConfirm }: SuspendUserModalProps) {
    const [duration, setDuration] = useState("30d");
    const [reason, setReason] = useState(REASONS[0]);
    const [notes, setNotes] = useState(`Your account has been suspended for 30 days due to multiple harassment complaints. Please review our community guidelines before returning.`);
    const [notifyEmail, setNotifyEmail] = useState(true);

    if (!user) return null;

    const handleConfirm = () => {
        onConfirm({
            duration,
            reason,
            notes,
            notifyEmail
        });
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-lg bg-card border border-border rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                    >
                        {/* Header */}
                        <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-muted/30">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-rose-500/10 rounded-xl text-rose-500">
                                    <Ban className="w-5 h-5" />
                                </div>
                                <h2 className="text-lg font-bold font-heading">Suspend User: {user.name}</h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
                            {/* Warning Banner */}
                            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-4">
                                <div className="p-2 bg-amber-500/20 rounded-lg text-amber-600 dark:text-amber-500">
                                    <AlertTriangle className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-amber-700 dark:text-amber-400">Warning</p>
                                    <p className="text-xs text-amber-600/80 dark:text-amber-500/80 mt-0.5">
                                        You are about to suspend this user's account. They will lose access to all features for the duration of the suspension.
                                    </p>
                                </div>
                            </div>

                            {/* Suspension Duration */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50 border-b border-border pb-2 flex items-center gap-2">
                                    <Clock className="w-3 h-3" /> Suspension Duration
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    {DURATIONS.map((d) => (
                                        <button
                                            key={d.id}
                                            onClick={() => setDuration(d.id)}
                                            className={cn(
                                                "px-4 py-3 rounded-2xl border text-sm font-bold transition-all flex items-center gap-3",
                                                duration === d.id 
                                                    ? "bg-primary/10 border-primary text-primary shadow-sm"
                                                    : "bg-card border-border hover:border-primary/50 text-muted-foreground"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all",
                                                duration === d.id ? "border-primary" : "border-muted-foreground/30"
                                            )}>
                                                {duration === d.id && <div className="w-2 h-2 rounded-full bg-primary" />}
                                            </div>
                                            {d.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Reason for Suspension */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50 border-b border-border pb-2 flex items-center gap-2">
                                    <AlertTriangle className="w-3 h-3" /> Reason for Suspension
                                </label>
                                <div className="relative">
                                    <select
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        className="w-full h-12 pl-4 pr-10 bg-muted/30 border border-border rounded-2xl text-sm font-bold appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
                                    >
                                        {REASONS.map((r) => (
                                            <option key={r} value={r}>{r}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                                </div>
                            </div>

                            {/* Additional Notes */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50 border-b border-border pb-2 flex items-center gap-2">
                                    <MessageSquare className="w-3 h-3" /> Additional Notes (visible to user)
                                </label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Enter details about why the user is being suspended..."
                                    className="w-full min-h-[100px] p-4 bg-muted/30 border border-border rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                                />
                            </div>

                            {/* Email Notification */}
                            <button 
                                onClick={() => setNotifyEmail(!notifyEmail)}
                                className="flex items-center gap-3 group cursor-pointer"
                            >
                                <div className={cn(
                                    "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all",
                                    notifyEmail ? "bg-primary border-primary" : "border-muted-foreground/30 group-hover:border-primary/50"
                                )}>
                                    {notifyEmail && <X className="w-3.5 h-3.5 text-white" />}
                                </div>
                                <div className="flex items-center gap-2 text-sm font-bold text-foreground/80">
                                    <Mail className="w-4 h-4 text-muted-foreground" />
                                    Notify user via email
                                </div>
                            </button>
                        </div>

                        {/* Footer */}
                        <div className="p-4 sm:p-6 border-t border-border bg-muted/30 flex flex-col sm:flex-row items-center justify-between gap-4 mt-auto">
                            <button
                                onClick={onClose}
                                className="w-full sm:flex-1 py-3 px-4 rounded-xl border border-border bg-card text-foreground font-bold uppercase tracking-widest text-[10px] hover:bg-muted transition-all active:scale-95 shadow-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirm}
                                className="w-full sm:flex-[1.5] py-3 px-4 rounded-xl bg-rose-500 text-white font-bold uppercase tracking-widest text-[10px] hover:bg-rose-600 transition-all active:scale-95 shadow-md flex items-center justify-center gap-2 shadow-rose-500/20"
                            >
                                <Ban className="w-3.5 h-3.5" />
                                Confirm Suspension
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
