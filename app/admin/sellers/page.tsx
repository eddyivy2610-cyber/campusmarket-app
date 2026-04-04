"use client";

import React, { useEffect, useState } from 'react';
import { Check, X, Eye, FileText, ChevronRight, Loader2 } from 'lucide-react';
import StatusBadge from '@/components/admin/StatusBadge';
import SellerQuickViewModal from '@/components/admin/SellerQuickViewModal';
import { apiGet, apiPatch } from '@/lib/apiClient';

export default function SellerApprovalsPage() {
    const [applicants, setApplicants] = useState<any[]>([]);
    const [selectedApplicant, setSelectedApplicant] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [statusFilter, setStatusFilter] = useState<"pending" | "approved" | "rejected">("pending");

    const mapVerification = (verification: any) => {
        const user = verification?.userId || {};
        const profile = user?.profile || {};
        const personal = user?.personalDetails || {};
        const student = user?.studentStatus || {};
        const business = user?.businessProfile || {};

        return {
            id: verification._id,
            name: profile.displayName || personal.fullName || user.email || "Unknown",
            email: user.email || "Not provided",
            status: verification.status ? verification.status[0].toUpperCase() + verification.status.slice(1) : "Pending",
            schoolName: student.schoolName || "Not specified",
            date: verification.createdAt ? new Date(verification.createdAt).toLocaleDateString("en-US") : "Unknown",
            businessName: business.name || "Not specified",
            businessCategory: business.category || "General",
            businessDescription: business.description || "",
            studentIdCard: verification?.document?.frontImageUrl || student.idCardImage || ""
        };
    };

    useEffect(() => {
        const fetchVerifications = async () => {
            setIsLoading(true);
            setLoadError("");
            try {
                const response: any = await apiGet(`api/verification/all?status=${statusFilter}`);
                const data = response?.data || [];
                setApplicants(data.map(mapVerification));
            } catch (e: any) {
                setLoadError(e?.message || "Failed to load verification queue.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchVerifications();
    }, [statusFilter]);

    const handleReview = (applicant: any) => {
        setSelectedApplicant(applicant);
        setIsModalOpen(true);
    };

    const handleApprove = async (id: string) => {
        try {
            await apiPatch(`api/verification/review/${id}`, { status: "approved" });
            setApplicants(prev => prev.map(a => a.id === id ? { ...a, status: 'Approved' } : a));
        } catch (e) {
            console.error("Approve failed", e);
        }
    };

    const handleReject = async (id: string, reason: string) => {
        try {
            await apiPatch(`api/verification/review/${id}`, { status: "rejected", rejectionReason: reason || "Rejected" });
            setApplicants(prev => prev.map(a => a.id === id ? { ...a, status: 'Rejected' } : a));
        } catch (e) {
            console.error("Reject failed", e);
        }
    };
    const getStatusDotClass = (status: string) => {
        switch (status) {
            case "Approved":
                return "bg-emerald-500";
            case "Rejected":
                return "bg-rose-500";
            case "Pending":
                return "bg-amber-500";
            default:
                return "bg-muted-foreground/40";
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground font-heading">Seller Approvals</h1>
                    <p className="text-muted-foreground text-sm font-medium">Review student verification requests for seller accounts.</p>
                </div>
            </div>

            <div className="flex items-center gap-2">
                {(["pending", "approved", "rejected"] as const).map((status) => (
                    <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`px-4 py-2 rounded-lg border text-xs font-bold uppercase tracking-widest transition-all ${
                            statusFilter === status
                                ? "bg-primary text-black border-primary"
                                : "border-border text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        {status}
                    </button>
                ))}
            </div>

            <div className="bg-card rounded-2xl border border-border/50 overflow-hidden shadow-sm">
                {isLoading && (
                    <div className="p-6 flex items-center gap-2 text-muted-foreground text-xs font-semibold uppercase tracking-widest">
                        <Loader2 className="w-4 h-4 animate-spin" /> Loading verification queue...
                    </div>
                )}
                {!!loadError && !isLoading && (
                    <div className="p-6 text-xs font-semibold text-red-500">
                        {loadError}
                    </div>
                )}

                <div className="md:hidden px-4 pt-4 pb-2 space-y-3">
                    {applicants.map((applicant) => {
                        const isOpen = expandedId === applicant.id;
                        return (
                            <div key={applicant.id} className="rounded-2xl border border-border/60 bg-background/70 shadow-sm overflow-hidden">
                                <button
                                    onClick={() => setExpandedId(isOpen ? null : applicant.id)}
                                    className="w-full flex items-center justify-between gap-3 px-4 py-3"
                                >
                                    <div className="min-w-0 text-left">
                                        <p className="text-sm font-semibold text-foreground truncate">{applicant.name}</p>
                                        <p className="text-[11px] text-muted-foreground">{applicant.businessName}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`w-2.5 h-2.5 rounded-full ${getStatusDotClass(applicant.status)}`} aria-hidden />
                                        <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? "rotate-90" : ""}`} />
                                    </div>
                                </button>
                                {isOpen && (
                                    <div className="px-4 pb-3">
                                        <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
                                            <div>
                                                <p className="uppercase tracking-widest text-[9px]">Status</p>
                                                <p className="font-semibold text-foreground/80">{applicant.status}</p>
                                            </div>
                                            <div>
                                                <p className="uppercase tracking-widest text-[9px]">School</p>
                                                <p className="font-semibold text-foreground/80">{applicant.schoolName}</p>
                                            </div>
                                            <div>
                                                <p className="uppercase tracking-widest text-[9px]">Date</p>
                                                <p className="font-semibold text-foreground/80">{applicant.date}</p>
                                            </div>
                                            <div>
                                                <p className="uppercase tracking-widest text-[9px]">Category</p>
                                                <p className="font-semibold text-foreground/80">{applicant.businessCategory}</p>
                                            </div>
                                        </div>
                                        <div className="mt-3 flex items-center gap-2">
                                            <button
                                                onClick={() => handleReview(applicant)}
                                                className="flex-1 rounded-lg border border-border/60 px-3 py-2 text-[11px] font-semibold text-muted-foreground hover:bg-secondary"
                                            >
                                                Full Review
                                            </button>
                                            {applicant.status === "Pending" && statusFilter === "pending" && (
                                                <>
                                                    <button
                                                        onClick={() => handleApprove(applicant.id)}
                                                        className="px-3 py-2 rounded-lg bg-emerald-500 text-white text-[11px] font-bold uppercase tracking-widest"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(applicant.id, "")}
                                                        className="px-3 py-2 rounded-lg border border-border/60 text-rose-500 text-[11px] font-bold uppercase tracking-widest"
                                                    >
                                                        Reject
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="overflow-x-auto hidden md:block">
                    <table className="w-full text-sm text-left">
                        <thead className="text-[10px] text-muted-foreground uppercase bg-muted/30 font-bold tracking-widest">
                            <tr>
                                <th className="px-6 py-5">Applicant Name</th>
                                <th className="px-6 py-5">Verification</th>
                                <th className="px-6 py-5">School</th>
                                <th className="px-6 py-5">Date Applied</th>
                                <th className="px-6 py-5">Status</th>
                                <th className="px-6 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40">
                            {applicants.map((applicant) => (
                                <tr key={applicant.id} className="group hover:bg-muted/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-foreground">{applicant.name}</span>
                                            <span className="text-[10px] text-primary font-bold uppercase tracking-tight">{applicant.businessName}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-blue-500 font-bold text-[11px] uppercase tracking-wide">
                                            <div className="p-1 bg-blue-500/10 rounded-md">
                                                <FileText size={12} />
                                            </div>
                                            ID Uploaded
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground font-medium">{applicant.schoolName}</td>
                                    <td className="px-6 py-4 text-muted-foreground font-medium">{applicant.date}</td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={applicant.status} />
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleReview(applicant)}
                                                className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                                                title="Full Review"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            {applicant.status === 'Pending' && statusFilter === "pending" && (
                                                <>
                                                    <button
                                                        onClick={() => handleApprove(applicant.id)}
                                                        className="p-2 text-muted-foreground hover:text-green-500 hover:bg-green-500/10 rounded-xl transition-all"
                                                        title="Quick Approve"
                                                    >
                                                        <Check size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(applicant.id, "")}
                                                        className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                                                        title="Quick Reject"
                                                    >
                                                        <X size={18} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Quick View Modal */}
            <SellerQuickViewModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                applicant={selectedApplicant}
                onApprove={handleApprove}
                onReject={handleReject}
            />
        </div>
    );
}
