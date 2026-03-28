"use client";

import React, { useState } from 'react';
import { Check, X, Eye, FileText, ChevronRight } from 'lucide-react';
import StatusBadge from '@/components/admin/StatusBadge';
import SellerQuickViewModal from '@/components/admin/SellerQuickViewModal';

const INITIAL_APPLICANTS = [
    {
        id: 1,
        name: 'Sarah Connor',
        email: 'sarah.connor@university.edu',
        status: 'Pending',
        schoolName: 'Computer Science',
        date: '2023-10-27',
        businessName: 'Sarah\'s Tech Solutions',
        businessCategory: 'Electronics',
        businessDescription: 'Affordable laptop repairs and software installation for students.',
        studentIdCard: 'https://images.unsplash.com/photo-1544717297-fa95b35c76d5?auto=format&fit=crop&q=80&w=800'
    },
    {
        id: 2,
        name: 'John Wick',
        email: 'john.wick@university.edu',
        status: 'Pending',
        schoolName: 'Architecture',
        date: '2023-10-26',
        businessName: 'Continental Supplies',
        businessCategory: 'Services',
        businessDescription: 'High-quality drafting materials and architectural model building services.',
        studentIdCard: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&q=80&w=800'
    },
    {
        id: 3,
        name: 'Ellen Ripley',
        email: 'ellen.ripley@university.edu',
        status: 'Approved',
        schoolName: 'Engineering',
        date: '2023-10-25',
        businessName: 'Nostromo Tools',
        businessCategory: 'Hostel Items',
        businessDescription: 'Heavy-duty tools and storage solutions for engineering dorms.',
        studentIdCard: 'https://images.unsplash.com/photo-1554126807-6b10f6f6692a?auto=format&fit=crop&q=80&w=800'
    },
    {
        id: 4,
        name: 'Marty McFly',
        email: 'marty.mcfly@university.edu',
        status: 'Rejected',
        schoolName: 'History',
        date: '2023-10-24',
        businessName: 'Outatime Records',
        businessCategory: 'Fashion',
        businessDescription: 'Vintage 80s wear and accessories for the retro lover.',
        studentIdCard: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&q=80&w=800'
    },
];

export default function SellerApprovalsPage() {
    const [applicants, setApplicants] = useState(INITIAL_APPLICANTS);
    const [selectedApplicant, setSelectedApplicant] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [expandedId, setExpandedId] = useState<number | null>(null);

    const handleReview = (applicant: any) => {
        setSelectedApplicant(applicant);
        setIsModalOpen(true);
    };

    const handleApprove = (id: number) => {
        setApplicants(prev => prev.map(a => a.id === id ? { ...a, status: 'Approved' } : a));
    };

    const handleReject = (id: number, reason: string) => {
        console.log(`Rejecting applicant ${id} for reason: ${reason}`);
        setApplicants(prev => prev.map(a => a.id === id ? { ...a, status: 'Rejected' } : a));
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

            <div className="bg-card rounded-2xl border border-border/50 overflow-hidden shadow-sm">
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
                                            {applicant.status === "Pending" && (
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
                                            {applicant.status === 'Pending' && (
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
