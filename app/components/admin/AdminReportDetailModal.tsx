"use client";

import React, { useState } from "react";
import { 
    X, 
    Flag, 
    User, 
    Clock, 
    AlertTriangle, 
    MessageCircle,
    FileText,
    ExternalLink,
    ShieldAlert,
    Ban,
    Trash2,
    CheckCircle2,
    MoreVertical,
    Mail
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface ReportDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    report: any;
    onResolve?: (id: string, resolution: string, notes: string) => void;
}

const RESOLUTION_OPTIONS = [
    { id: "none", label: "No action needed", icon: CheckCircle2 },
    { id: "warning", label: "Issue warning", icon: AlertTriangle },
    { id: "suspend", label: "Suspend user", icon: Ban },
    { id: "remove", label: "Remove listing", icon: Trash2 },
    { id: "ban", label: "Permanent ban", icon: ShieldAlert },
];

export default function AdminReportDetailModal({ isOpen, onClose, report, onResolve }: ReportDetailModalProps) {
    const [resolution, setResolution] = useState("");
    const [adminNotes, setAdminNotes] = useState("");

    if (!report) return null;

    const priorityColors = {
        High: "text-rose-500 bg-rose-500/10 border-rose-500/20",
        Medium: "text-amber-500 bg-amber-500/10 border-amber-500/20",
        Low: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
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
                                        <h2 className="text-lg font-bold text-foreground">Report #{report.id || "REP-2025-001"}</h2>
                                        <span className={cn(
                                            "px-2 py-0.5 rounded-full text-[10px] font-bold border",
                                            priorityColors[report.priority as keyof typeof priorityColors || "Medium"]
                                        )}>
                                            {report.priority || "Medium"} Priority
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 mt-0.5">
                                        <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest flex items-center gap-1">
                                            <Clock size={10} />
                                            {report.submittedAt || report.time || "Just now"}
                                        </span>
                                        <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest flex items-center gap-1">
                                            <div className={cn(
                                                "w-1.5 h-1.5 rounded-full",
                                                report.status === "Resolved" ? "bg-emerald-500" : "bg-rose-500 animate-pulse"
                                            )} />
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

                        {/* Content Area - Scrollable */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
                            
                            {/* Parties Involved Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Reporter */}
                                <div className="p-4 rounded-2xl bg-secondary/20 border border-border/50 space-y-3">
                                    <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Reported By</div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20">
                                            {report.reporter?.avatar || report.reporter?.name?.charAt(0) || "U"}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-foreground">{report.reporter?.name || "Michael O."}</div>
                                            <div className="text-[10px] font-bold text-muted-foreground/60">Buyer • Joined Jan 2025</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Against */}
                                <div className="p-4 rounded-2xl bg-secondary/20 border border-border/50 space-y-3">
                                    <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Against</div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 font-bold border border-rose-500/20">
                                            {report.against?.avatar || report.against?.name?.charAt(0) || "V"}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-foreground">{report.against?.name || "John Doe"}</div>
                                            <div className="text-[10px] font-bold text-muted-foreground/60">Vendor • 4.8★ (52 orders)</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Report Details */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between border-b border-border/50 pb-2">
                                    <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Report Details</h3>
                                    <div className="px-2 py-0.5 bg-secondary text-foreground text-[10px] font-bold rounded">
                                        {report.category || "Scam or fraud attempt"}
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <DetailItem 
                                            label="Context" 
                                            value={report.context || "Listing #LST-7890 - MacBook Pro 2021"} 
                                            icon={ExternalLink} 
                                        />
                                        <DetailItem 
                                            label="Reason" 
                                            value={report.reason || "Attempted off-platform payment"} 
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Description</label>
                                        <p className="text-sm text-foreground/80 leading-relaxed font-medium bg-secondary/10 p-4 rounded-2xl border border-border/30">
                                            {report.description || "The vendor asked me to pay outside the platform via bank transfer. When I refused, he said the item would be sold to someone else. This seems like a scam attempt."}
                                        </p>
                                    </div>

                                    {/* Evidence/Attachments */}
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Evidence & Attachments</label>
                                        <div className="flex flex-wrap gap-3">
                                            <AttachmentCard label="Chat Screenshot 1" />
                                            <AttachmentCard label="Chat Screenshot 2" />
                                            <AttachmentCard label="Listing View" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Admin Actions Quick Tools */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Investigation Tools</h3>
                                <div className="flex flex-wrap gap-2">
                                    <ActionLink icon={Mail} label="Contact Reporter" />
                                    <ActionLink icon={MessageCircle} label="Contact Vendor" />
                                    <ActionLink icon={ExternalLink} label="View Listing" />
                                    <ActionLink icon={FileText} label="View Chat Log" />
                                </div>
                            </div>

                            {/* Resolution Form */}
                            <div className="space-y-4 pt-4 border-t border-border/50">
                                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Resolution</h3>
                                
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
                                            <opt.icon size={16} className={cn(resolution === opt.id ? "text-primary" : "opacity-40")} />
                                            <span className="text-[11px] font-bold uppercase tracking-widest">{opt.label}</span>
                                        </button>
                                    ))}
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Internal Admin Notes</label>
                                    <textarea 
                                        value={adminNotes}
                                        onChange={(e) => setAdminNotes(e.target.value)}
                                        placeholder="Document your findings and reasons for this resolution..."
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
                                Close View
                            </button>
                            <button 
                                disabled={!resolution}
                                className={cn(
                                    "w-full sm:flex-[1.5] py-3 px-4 rounded-xl text-white text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2",
                                    resolution ? "bg-primary shadow-primary/20 hover:bg-primary/90" : "bg-muted-foreground/30 cursor-not-allowed"
                                )}
                            >
                                <CheckCircle2 size={14} />
                                Resolve Report
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

function DetailItem({ label, value, icon: Icon }: { label: string; value: string; icon?: any }) {
    return (
        <div className="space-y-1 group">
            <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40">{label}</span>
            <div className="flex items-center gap-2 text-sm font-bold text-foreground/80 group-hover:text-primary transition-colors cursor-pointer">
                {value}
                {Icon && <Icon size={12} className="opacity-40" />}
            </div>
        </div>
    );
}

function AttachmentCard({ label }: { label: string }) {
    return (
        <div className="flex items-center gap-3 p-2.5 bg-secondary/10 border border-border/40 rounded-xl hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer group group">
            <div className="w-8 h-8 rounded-lg bg-secondary/50 flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                <FileText size={16} />
            </div>
            <span className="text-[10px] font-bold text-muted-foreground/70 group-hover:text-foreground transition-colors">{label}</span>
        </div>
    );
}

function ActionLink({ icon: Icon, label }: { icon: any; label: string }) {
    return (
        <button className="flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all bg-secondary/30 text-muted-foreground hover:bg-primary/10 hover:text-primary border border-transparent hover:border-primary/20 active:scale-95">
            <Icon size={14} />
            {label}
        </button>
    );
}
