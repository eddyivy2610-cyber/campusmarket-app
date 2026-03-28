"use client";

import React from "react";
import { X, Check, ShieldAlert, Building2, User, BookOpen, FileText, ExternalLink, Calendar, Mail } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import StatusBadge from "./StatusBadge";

interface SellerQuickViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    applicant: any;
    onApprove: (id: number) => void;
    onReject: (id: number, reason: string) => void;
}

export default function SellerQuickViewModal({ isOpen, onClose, applicant, onApprove, onReject }: SellerQuickViewModalProps) {
    const [rejectionReason, setRejectionReason] = React.useState("");
    if (!applicant) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
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
                        className="relative w-full max-w-2xl bg-card border border-border rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                    >
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-xl text-primary">
                                    <ShieldAlert className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold font-heading">Review Seller Application</h2>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">ID: #{applicant.id}</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body - Scrollable */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-8">
                            {/* Top Info Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Personal Info */}
                                <div className="space-y-4">
                                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50 border-b border-border pb-2 flex items-center gap-2">
                                        <User className="w-3 h-3" /> Personal Information
                                    </h3>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase">Full Name</p>
                                            <p className="text-sm font-semibold">{applicant.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase">School</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <BookOpen className="w-3.5 h-3.5 text-primary" />
                                                <p className="text-sm font-semibold">
                                                    {applicant.schoolName || applicant.department || "Not specified"}
                                                </p>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase">Email Address</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <Mail className="w-3.5 h-3.5 text-primary" />
                                                <p className="text-sm font-semibold">{applicant.email}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase">Date Applied</p>
                                            <div className="flex items-center gap-2 mt-0.5 text-muted-foreground">
                                                <Calendar className="w-3.5 h-3.5" />
                                                <p className="text-xs font-medium">{applicant.date}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Business Info */}
                                <div className="space-y-4">
                                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50 border-b border-border pb-2 flex items-center gap-2">
                                        <Building2 className="w-3 h-3" /> Business Identity
                                    </h3>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase">Brand Name</p>
                                            <p className="text-sm font-bold text-primary">{applicant.businessName || "Not Specified"}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase">Category</p>
                                            <span className="inline-block mt-1 px-2.5 py-1 bg-secondary rounded-lg text-[10px] font-bold uppercase tracking-wider text-secondary-foreground">
                                                {applicant.businessCategory || "General"}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase">Status</p>
                                            <div className="mt-1">
                                                <StatusBadge status={applicant.status} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Verification Document */}
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50 border-b border-border pb-2 flex items-center gap-2">
                                    <FileText className="w-3 h-3" /> Student ID Verification
                                </h3>
                                <div className="relative group aspect-[16/9] w-full rounded-2xl overflow-hidden border-2 border-border bg-muted/30">
                                    {applicant.studentIdCard ? (
                                        <>
                                            <img
                                                src={applicant.studentIdCard}
                                                alt="Student ID"
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <a
                                                    href={applicant.studentIdCard}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-3 bg-white text-primary rounded-full shadow-xl hover:scale-110 transition-transform"
                                                >
                                                    <ExternalLink className="w-6 h-6" />
                                                </a>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                                            <FileText className="w-12 h-12 mb-2 opacity-20" />
                                            <p className="text-xs font-medium">No ID Image Provided</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Business Description */}
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50 border-b border-border pb-2">
                                    Business Description
                                </h3>
                                <div className="p-4 bg-muted/50 rounded-2xl border border-border/50">
                                    <p className="text-sm text-foreground/80 leading-relaxed italic">
                                        "{applicant.businessDescription || "No description provided by the applicant."}"
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Footer - Actions */}
                        <div className="px-6 py-5 border-t border-border bg-muted/30 flex items-center gap-4">
                            <button
                                onClick={onClose}
                                className="px-6 py-3 rounded-xl border border-border bg-card text-foreground font-bold uppercase tracking-widest text-[10px] hover:bg-muted transition-all"
                            >
                                Close View
                            </button>
                            {applicant.status === "Pending" && (
                                <div className="flex-1 flex flex-col gap-3">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50 block">
                                            Rejection Reason (Optional)
                                        </label>
                                        <textarea
                                            value={rejectionReason}
                                            onChange={(e) => setRejectionReason(e.target.value)}
                                            placeholder="State why this application is being rejected..."
                                            className="w-full bg-red-500/5 border border-red-500/20 rounded-xl p-3 text-xs placeholder:text-red-500/30 resize-none focus:outline-none focus:border-red-500/50 h-20 transition-all font-medium"
                                        />
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => {
                                                onReject(applicant.id, rejectionReason);
                                                setRejectionReason("");
                                                onClose();
                                            }}
                                            className="flex-1 px-6 py-3 rounded-xl border-2 border-red-500/50 bg-red-500/5 text-red-500 font-bold uppercase tracking-widest text-[10px] hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2 group"
                                        >
                                            <X className="w-4 h-4" />
                                            Reject Applicant
                                        </button>
                                        <button
                                            onClick={() => {
                                                onApprove(applicant.id);
                                                onClose();
                                            }}
                                            className="flex-1 px-6 py-3 rounded-xl bg-green-600 text-white font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-green-600/20 hover:bg-green-700 hover:shadow-green-700/30 transition-all flex items-center justify-center gap-2"
                                        >
                                            <Check className="w-4 h-4" />
                                            Approve Seller
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
