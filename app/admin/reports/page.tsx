"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
    Flag,
    User,
    ChevronRight,
    Search,
    RefreshCw,
    Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiGet } from "@/lib/apiClient";
import AdminReportDetailModal from "@/components/admin/AdminReportDetailModal";

export default function AdminReportsPage() {
    const [reports, setReports] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedReport, setSelectedReport] = useState<any>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [typeFilter, setTypeFilter] = useState("all");
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const fetchReports = async () => {
        try {
            setIsLoading(true);
            const params = new URLSearchParams();
            if (statusFilter !== "all") params.set("status", statusFilter);
            if (typeFilter !== "all") params.set("targetType", typeFilter);
            const url = params.toString() ? `admin/reports?${params.toString()}` : "admin/reports";
            const res: any = await apiGet(url);
            if (res?.success && Array.isArray(res.data)) {
                setReports(res.data);
            } else {
                setReports([]);
            }
        } catch (err) {
            console.error("Failed to fetch reports:", err);
            setReports([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, [statusFilter, typeFilter]);

    const filteredReports = useMemo(() => {
        if (!searchQuery.trim()) return reports;
        const q = searchQuery.toLowerCase();
        return reports.filter(
            (r) =>
                String(r.id || "").toLowerCase().includes(q) ||
                String(r.reporter?.name || "").toLowerCase().includes(q) ||
                String(r.against?.name || "").toLowerCase().includes(q) ||
                String(r.category || "").toLowerCase().includes(q) ||
                String(r.details || "").toLowerCase().includes(q)
        );
    }, [reports, searchQuery]);

    const handleViewReport = (report: any) => {
        setSelectedReport(report);
        setIsDetailModalOpen(true);
    };

    return (
        <div className="space-y-8 pb-10 max-w-7xl mx-auto">
            {/* Main Table Section */}
            <div className="bg-card border border-border/50 rounded-[32px] overflow-hidden shadow-sm">
                {/* Table Header */}
                <div className="px-6 py-5 border-b border-border/50 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-muted/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-secondary flex items-center justify-center text-muted-foreground">
                            <Flag size={20} />
                        </div>
                        <div>
                            <h3 className="text-[11px] font-bold tracking-widest text-muted-foreground uppercase">
                                Trust & Safety Queue
                            </h3>
                            <p className="text-sm font-bold text-foreground">
                                Active Reports & Flagged Content ({filteredReports.length})
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <div className="relative">
                            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search reports..."
                                className="h-9 pl-9 pr-3 rounded-xl bg-background border border-border text-xs font-medium outline-none"
                            />
                        </div>

                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="h-9 px-3 rounded-xl bg-background border border-border text-xs font-bold"
                        >
                            <option value="all">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="in_review">In Review</option>
                            <option value="resolved">Resolved</option>
                            <option value="dismissed">Dismissed</option>
                        </select>

                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="h-9 px-3 rounded-xl bg-background border border-border text-xs font-bold"
                        >
                            <option value="all">All Targets</option>
                            <option value="listing">Listings</option>
                            <option value="store">Stores</option>
                            <option value="user">Users</option>
                            <option value="review">Reviews</option>
                            <option value="radar">Campus Radar</option>
                        </select>

                        <button
                            onClick={fetchReports}
                            className="h-9 px-3 rounded-xl bg-secondary hover:bg-secondary/80 text-xs font-bold flex items-center gap-1.5"
                        >
                            <RefreshCw className={cn("w-3.5 h-3.5", isLoading && "animate-spin")} />
                            Refresh
                        </button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="py-16 flex flex-col items-center justify-center text-muted-foreground">
                        <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
                        <p className="text-xs font-bold uppercase tracking-wider">Loading reports queue...</p>
                    </div>
                ) : filteredReports.length === 0 ? (
                    <div className="py-16 text-center text-muted-foreground">
                        <Flag className="w-10 h-10 mx-auto opacity-20 mb-2" />
                        <p className="text-sm font-bold text-foreground">No reports in queue</p>
                        <p className="text-xs mt-1">All user-submitted reports matching your filters have been processed.</p>
                    </div>
                ) : (
                    <>
                        {/* Mobile Cards */}
                        <div className="md:hidden px-4 pt-4 pb-2 space-y-3">
                            {filteredReports.map((report) => {
                                const isOpen = expandedId === report.id;
                                return (
                                    <div
                                        key={report._id || report.id}
                                        className="rounded-2xl border border-border/60 bg-background/70 shadow-sm overflow-hidden"
                                    >
                                        <button
                                            onClick={() => setExpandedId(isOpen ? null : report.id)}
                                            className="w-full flex items-center justify-between gap-3 px-4 py-3"
                                        >
                                            <div className="min-w-0 text-left">
                                                <p className="text-sm font-semibold text-foreground truncate">
                                                    #{String(report.id).slice(0, 8)}
                                                </p>
                                                <p className="text-[11px] text-muted-foreground">
                                                    {report.against?.name}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className={cn(
                                                        "w-2.5 h-2.5 rounded-full",
                                                        report.status === "Pending"
                                                            ? "bg-amber-500"
                                                            : report.status === "In Review"
                                                            ? "bg-blue-500"
                                                            : "bg-emerald-500"
                                                    )}
                                                />
                                                <ChevronRight
                                                    className={`w-4 h-4 text-muted-foreground transition-transform ${
                                                        isOpen ? "rotate-90" : ""
                                                    }`}
                                                />
                                            </div>
                                        </button>
                                        {isOpen && (
                                            <div className="px-4 pb-3">
                                                <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
                                                    <div>
                                                        <p className="uppercase tracking-widest text-[9px]">Reporter</p>
                                                        <p className="font-semibold text-foreground/80">
                                                            {report.reporter?.name}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="uppercase tracking-widest text-[9px]">Status</p>
                                                        <p className="font-semibold text-foreground/80">
                                                            {report.status}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="uppercase tracking-widest text-[9px]">Category</p>
                                                        <p className="font-semibold text-foreground/80 uppercase">
                                                            {report.category}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="uppercase tracking-widest text-[9px]">Priority</p>
                                                        <p className="font-semibold text-foreground/80">
                                                            {report.priority}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="mt-3">
                                                    <button
                                                        onClick={() => handleViewReport(report)}
                                                        className="w-full rounded-lg border border-border/60 px-3 py-2 text-[11px] font-semibold text-muted-foreground hover:bg-secondary"
                                                    >
                                                        Investigate & Resolve
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Desktop Table */}
                        <div className="overflow-x-auto custom-scrollbar hidden md:block">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="border-b border-border/40">
                                        <th className="px-6 py-4 text-left text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">
                                            Report ID
                                        </th>
                                        <th className="px-6 py-4 text-left text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">
                                            Target
                                        </th>
                                        <th className="px-6 py-4 text-left text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">
                                            Reporter
                                        </th>
                                        <th className="px-6 py-4 text-left text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">
                                            Category
                                        </th>
                                        <th className="px-6 py-4 text-left text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">
                                            Priority
                                        </th>
                                        <th className="px-6 py-4 text-left text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">
                                            Status
                                        </th>
                                        <th className="px-6 py-4 text-right text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/30">
                                    {filteredReports.map((report) => (
                                        <tr
                                            key={report._id || report.id}
                                            className="hover:bg-muted/30 transition-colors group cursor-pointer"
                                            onClick={() => handleViewReport(report)}
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                                                        #{String(report.id).slice(0, 8)}
                                                    </span>
                                                    <span className="text-[10px] font-medium text-muted-foreground/60">
                                                        {report.submittedAt}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500 border border-rose-500/20">
                                                        <User size={14} />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-bold text-foreground">
                                                            {report.against?.name}
                                                        </span>
                                                        <span className="text-[10px] font-medium text-muted-foreground/60 uppercase">
                                                            {report.against?.type}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20 text-[10px] font-bold">
                                                        {String(report.reporter?.name || "U").charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="text-xs font-bold text-foreground">
                                                        {report.reporter?.name}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-xs font-bold uppercase text-foreground/70">
                                                    {report.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={cn(
                                                        "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight border",
                                                        report.priority === "High"
                                                            ? "text-rose-500 bg-rose-500/5 border-rose-500/20"
                                                            : report.priority === "Medium"
                                                            ? "text-amber-500 bg-amber-500/5 border-amber-500/20"
                                                            : "text-emerald-500 bg-emerald-500/5 border-emerald-500/20"
                                                    )}
                                                >
                                                    {report.priority}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1.5 whitespace-nowrap">
                                                    <div
                                                        className={cn(
                                                            "w-1.5 h-1.5 rounded-full shrink-0",
                                                            report.status === "Pending"
                                                                ? "bg-amber-500 animate-pulse"
                                                                : report.status === "In Review"
                                                                ? "bg-blue-500"
                                                                : "bg-emerald-500"
                                                        )}
                                                    />
                                                    <span className="text-xs font-bold text-foreground/80">
                                                        {report.status}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    className="px-3 py-1.5 bg-secondary hover:bg-secondary/80 rounded-lg transition-all text-[11px] font-bold text-foreground"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleViewReport(report);
                                                    }}
                                                >
                                                    Investigate
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {/* Table Footer */}
                <div className="px-6 py-4 border-t border-border/50 bg-muted/5 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                        Showing {filteredReports.length} of {reports.length} reports
                    </span>
                </div>
            </div>

            {/* Modal */}
            <AdminReportDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                report={selectedReport}
                onResolved={fetchReports}
            />
        </div>
    );
}
