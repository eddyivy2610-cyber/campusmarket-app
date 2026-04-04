"use client";

import React, { useState } from "react";
import { 
    Flag, 
    Clock,
    User,
    ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import AdminReportDetailModal from "@/components/admin/AdminReportDetailModal";

const MOCK_REPORTS: any[] = [];

export default function PendingReportsPage() {
    const [selectedReport, setSelectedReport] = useState<any>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const handleViewReport = (report: any) => {
        setSelectedReport(report);
        setIsDetailModalOpen(true);
    };

    return (
        <div className="space-y-6 pb-10">
            {/* Simple Header for Sub-queue */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20 shadow-inner">
                        <Clock size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-foreground leading-tight">Pending Triage</h2>
                        <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mt-0.5">Newly reported items requiring initial review</p>
                    </div>
                </div>
            </div>

            <div className="bg-card border border-border/50 rounded-[32px] overflow-hidden shadow-sm">
                {/* Table Header */}
                <div className="px-6 py-5 border-b border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/10">
                    <div className="flex items-center gap-2">
                        <div className="px-3 py-1 bg-amber-500/10 text-amber-500 text-[10px] font-bold rounded-full border border-amber-500/20">
                            {MOCK_REPORTS.length} PENDING
                        </div>
                    </div>

                </div>

                {/* Table Container */}
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b border-border/40">
                                <th className="px-6 py-4 text-left text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">Report ID</th>
                                <th className="px-6 py-4 text-left text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">Target</th>
                                <th className="px-6 py-4 text-left text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">Reporter</th>
                                <th className="px-6 py-4 text-left text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">Category</th>
                                <th className="px-6 py-4 text-left text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">Priority</th>
                                <th className="px-6 py-4 text-right text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                            {MOCK_REPORTS.map((report) => (
                                <tr 
                                    key={report.id} 
                                    className="hover:bg-muted/30 transition-colors group cursor-pointer"
                                    onClick={() => handleViewReport(report)}
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">#{report.id}</span>
                                            <span className="text-[10px] font-medium text-muted-foreground/60">{report.submittedAt}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500 border border-rose-500/20">
                                                <User size={14} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-foreground">{report.against.name}</span>
                                                <span className="text-[10px] font-medium text-muted-foreground/60">{report.against.type}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20 text-[10px] font-bold">
                                                {report.reporter.avatar}
                                            </div>
                                            <span className="text-xs font-bold text-foreground">{report.reporter.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-xs font-medium text-foreground/70">{report.category}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={cn(
                                            "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight border",
                                            report.priority === "High" ? "text-rose-500 bg-rose-500/5 border-rose-500/20" :
                                            report.priority === "Medium" ? "text-amber-500 bg-amber-500/5 border-amber-500/20" :
                                            "text-emerald-500 bg-emerald-500/5 border-emerald-500/20"
                                        )}>
                                            {report.priority}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="h-8 px-3 rounded-lg bg-secondary/50 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:bg-primary hover:text-white transition-all">
                                            Triage
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <AdminReportDetailModal 
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                report={selectedReport}
            />
        </div>
    );
}
