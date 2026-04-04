"use client";

import React, { useState, useMemo } from "react";
import { 
    Flag, 
    AlertTriangle,
    CheckCircle2,
    Clock,
    User,
    ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import AdminReportDetailModal from "@/components/admin/AdminReportDetailModal";

const MOCK_REPORTS: any[] = [];

export default function AdminReportsPage() {
    const [selectedReport, setSelectedReport] = useState<any>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const filteredReports = useMemo(() => {
        return MOCK_REPORTS.filter(r => 
            r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.reporter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.against.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.category.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery]);

    const handleViewReport = (report: any) => {
        setSelectedReport(report);
        setIsDetailModalOpen(true);
    };

    return (
        <div className="space-y-8 pb-10">


            {/* Main Table Section */}
            <div className="bg-card border border-border/50 rounded-[32px] overflow-hidden shadow-sm">
                {/* Table Header */}
                <div className="px-6 py-5 border-b border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-secondary flex items-center justify-center text-muted-foreground">
                            <Flag size={20} />
                        </div>
                        <div>
                            <h3 className="text-[11px] font-bold tracking-widest text-muted-foreground uppercase">Reports Queue</h3>
                            <p className="text-sm font-bold text-foreground">Active Investigations</p>
                        </div>
                    </div>


                </div>

                {/* Table Container */}
                <div className="md:hidden px-4 pt-4 pb-2 space-y-3">
                    {filteredReports.map((report) => {
                        const isOpen = expandedId === report.id;
                        return (
                            <div key={report.id} className="rounded-2xl border border-border/60 bg-background/70 shadow-sm overflow-hidden">
                                <button
                                    onClick={() => setExpandedId(isOpen ? null : report.id)}
                                    className="w-full flex items-center justify-between gap-3 px-4 py-3"
                                >
                                    <div className="min-w-0 text-left">
                                        <p className="text-sm font-semibold text-foreground truncate">#{report.id}</p>
                                        <p className="text-[11px] text-muted-foreground">{report.against.name}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={cn(
                                                "w-2.5 h-2.5 rounded-full",
                                                report.status === "Pending" ? "bg-amber-500" :
                                                report.status === "In Review" ? "bg-blue-500" :
                                                "bg-emerald-500"
                                            )}
                                            aria-hidden
                                        />
                                        <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? "rotate-90" : ""}`} />
                                    </div>
                                </button>
                                {isOpen && (
                                    <div className="px-4 pb-3">
                                        <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
                                            <div>
                                                <p className="uppercase tracking-widest text-[9px]">Reporter</p>
                                                <p className="font-semibold text-foreground/80">{report.reporter.name}</p>
                                            </div>
                                            <div>
                                                <p className="uppercase tracking-widest text-[9px]">Status</p>
                                                <p className="font-semibold text-foreground/80">{report.status}</p>
                                            </div>
                                            <div>
                                                <p className="uppercase tracking-widest text-[9px]">Category</p>
                                                <p className="font-semibold text-foreground/80">{report.category}</p>
                                            </div>
                                            <div>
                                                <p className="uppercase tracking-widest text-[9px]">Priority</p>
                                                <p className="font-semibold text-foreground/80">{report.priority}</p>
                                            </div>
                                        </div>
                                        <div className="mt-3">
                                            <button
                                                onClick={() => handleViewReport(report)}
                                                className="w-full rounded-lg border border-border/60 px-3 py-2 text-[11px] font-semibold text-muted-foreground hover:bg-secondary"
                                            >
                                                View Report
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="overflow-x-auto custom-scrollbar hidden md:block">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b border-border/40">
                                <th className="px-6 py-4 text-left text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">Report ID</th>
                                <th className="px-6 py-4 text-left text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">Target</th>
                                <th className="px-6 py-4 text-left text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">Reporter</th>
                                <th className="px-6 py-4 text-left text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">Category</th>
                                <th className="px-6 py-4 text-left text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">Priority</th>
                                <th className="px-6 py-4 text-left text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-right text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                            {filteredReports.map((report) => (
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
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5 whitespace-nowrap">
                                            <div className={cn(
                                                "w-1.5 h-1.5 rounded-full shrink-0",
                                                report.status === "Pending" ? "bg-amber-500 animate-pulse" :
                                                report.status === "In Review" ? "bg-blue-500" :
                                                "bg-emerald-500"
                                            )} />
                                            <span className="text-xs font-bold text-foreground/80">{report.status}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button 
                                            className="p-2 hover:bg-secondary rounded-lg transition-all text-muted-foreground hover:text-foreground"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleViewReport(report);
                                            }}
                                        >
                                            <ChevronRight size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Table Footer */}
                <div className="px-6 py-4 border-t border-border/50 bg-muted/5 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">Showing {filteredReports.length} of {MOCK_REPORTS.length} reports</span>
                    <div className="flex items-center gap-1">
                        <button className="h-8 w-8 rounded-lg border border-border/50 flex items-center justify-center text-muted-foreground hover:bg-secondary transition-all disabled:opacity-30" disabled>
                            <ChevronRight size={14} className="rotate-180" />
                        </button>
                        <button className="h-8 w-8 rounded-lg bg-primary text-white text-xs font-bold flex items-center justify-center shadow-lg shadow-primary/20">
                            1
                        </button>
                        <button className="h-8 w-8 rounded-lg border border-border/50 flex items-center justify-center text-muted-foreground hover:bg-secondary transition-all">
                            2
                        </button>
                        <button className="h-8 w-8 rounded-lg border border-border/50 flex items-center justify-center text-muted-foreground hover:bg-secondary transition-all">
                            <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <AdminReportDetailModal 
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                report={selectedReport}
            />
        </div>
    );
}
