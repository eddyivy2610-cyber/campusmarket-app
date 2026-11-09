"use client";

import React, { useState, useEffect } from "react";
import {
    History,
    Search,
    Download,
    ChevronDown,
    RefreshCw,
    Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiGet } from "@/lib/apiClient";

export default function LogsPage() {
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [logs, setLogs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [typeFilter, setTypeFilter] = useState<string>("all");
    const [fromDate, setFromDate] = useState<string>("");
    const [toDate, setToDate] = useState<string>("");
    const [userSearch, setUserSearch] = useState<string>("");

    const fetchLogs = async () => {
        try {
            setIsLoading(true);
            const params = new URLSearchParams();
            params.set("limit", "250");
            if (typeFilter !== "all") params.set("targetType", typeFilter);
            if (fromDate) params.set("from", fromDate);
            if (toDate) params.set("to", toDate);
            const response: any = await apiGet(`admin/logs?${params.toString()}`);
            setLogs(response?.data || []);
        } catch (err) {
            console.error("Failed to fetch logs", err);
            setLogs([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [typeFilter, fromDate, toDate]);

    const displayLogs = logs.filter((log: any) => {
        if (!userSearch.trim()) return true;
        const q = userSearch.toLowerCase();
        const actor = String(log.actorEmail || log.user || "").toLowerCase();
        const msg = String(log.message || log.action || "").toLowerCase();
        const targetId = String(log.targetId || "").toLowerCase();
        return actor.includes(q) || msg.includes(q) || targetId.includes(q);
    });

    const handleExportCsv = () => {
        if (!displayLogs.length) return;
        const headers = ["Timestamp", "ActorEmail", "TargetType", "TargetId", "Action", "Reason", "RequestId"];
        const rows = displayLogs.map((l) => [
            l.createdAt || "",
            l.actorEmail || l.user || "",
            l.targetType || "",
            l.targetId || "",
            l.action || "",
            `"${String(l.reason || "").replace(/"/g, '""')}"`,
            l.requestId || "",
        ]);
        const csvContent =
            "data:text/csv;charset=utf-8," +
            [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `campus-hive-audit-logs-${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6 pb-10 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-secondary flex items-center justify-center text-muted-foreground border border-border/50 shadow-inner">
                        <History size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-foreground leading-tight">
                            Immutable Admin Audit Logs (`admin_audit_logs`)
                        </h2>
                        <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mt-0.5">
                            Append-only cryptographic audit trail with before/after state snapshots
                        </p>
                    </div>
                </div>

                <button
                    onClick={fetchLogs}
                    className="h-9 px-3 rounded-xl bg-secondary hover:bg-secondary/80 text-xs font-bold flex items-center gap-1.5 self-start md:self-auto"
                >
                    <RefreshCw className={cn("w-3.5 h-3.5", isLoading && "animate-spin")} />
                    Refresh Logs
                </button>
            </div>

            {/* Logs Table */}
            <div className="bg-card border border-border/50 rounded-[32px] overflow-hidden shadow-sm">
                <div className="px-6 py-5 border-b border-border/50 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-secondary/20">
                    <div className="flex items-center gap-2">
                        <div className="px-3 py-1 bg-secondary text-foreground/70 text-[10px] font-bold rounded-full border border-border/60 uppercase tracking-tight">
                            {displayLogs.length} Audit Entries
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <div className="relative group">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                value={userSearch}
                                onChange={(e) => setUserSearch(e.target.value)}
                                placeholder="Filter by admin, action, or ID..."
                                className="h-9 pl-9 pr-4 bg-background border border-border rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all w-[220px] text-foreground placeholder:text-muted-foreground/50"
                            />
                        </div>
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="h-9 px-3 bg-background border border-border rounded-xl text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-all"
                        >
                            <option value="all">All Target Types</option>
                            <option value="user">Users</option>
                            <option value="store">Stores</option>
                            <option value="listing">Listings</option>
                            <option value="business_application">Business Applications</option>
                            <option value="report">Reports</option>
                            <option value="review">Reviews</option>
                            <option value="order">Orders</option>
                            <option value="banner">Banners</option>
                        </select>
                        <input
                            type="date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            className="h-9 px-2 bg-background border border-border rounded-xl text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                        />
                        <input
                            type="date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            className="h-9 px-2 bg-background border border-border rounded-xl text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                        />
                        <button
                            onClick={handleExportCsv}
                            disabled={displayLogs.length === 0}
                            className="h-9 px-3 flex items-center gap-2 rounded-xl bg-background border border-border/50 text-[10px] font-bold uppercase tracking-widest hover:bg-secondary/50 transition-all disabled:opacity-40"
                        >
                            <Download size={14} />
                            Export CSV
                        </button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="py-16 flex flex-col items-center justify-center text-muted-foreground">
                        <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
                        <p className="text-xs font-bold uppercase tracking-wider">Loading audit log stream...</p>
                    </div>
                ) : displayLogs.length === 0 ? (
                    <div className="py-16 text-center text-muted-foreground">
                        <History className="w-10 h-10 mx-auto opacity-20 mb-2" />
                        <p className="text-sm font-bold text-foreground">No audit entries found</p>
                        <p className="text-xs mt-1">Administrative actions will automatically appear here.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b border-border/60 bg-secondary/20">
                                    <th className="px-6 py-4 text-left text-[10px] font-bold text-foreground/50 uppercase tracking-widest">
                                        Target Type
                                    </th>
                                    <th className="px-6 py-4 text-left text-[10px] font-bold text-foreground/50 uppercase tracking-widest">
                                        Action & Reason
                                    </th>
                                    <th className="px-6 py-4 text-center text-[10px] font-bold text-foreground/50 uppercase tracking-widest">
                                        Actor (Admin)
                                    </th>
                                    <th className="px-6 py-4 text-right text-[10px] font-bold text-foreground/50 uppercase tracking-widest">
                                        Timestamp
                                    </th>
                                    <th className="px-6 py-4 text-right text-[10px] font-bold text-foreground/50 uppercase tracking-widest">
                                        Snapshot
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/40">
                                {displayLogs.map((log) => {
                                    const isOpen = expandedId === (log._id || log.id);
                                    return (
                                        <React.Fragment key={log._id || log.id}>
                                            <tr className="hover:bg-secondary/30 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <span className="px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider border text-primary bg-primary/10 border-primary/20">
                                                        {log.targetType || log.type}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-[13px] font-bold text-foreground">
                                                        {log.action || log.message}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-0.5">
                                                        {log.reason || log.message}
                                                    </p>
                                                    <p className="text-[10px] font-mono text-muted-foreground/60 mt-0.5">
                                                        Target ID: {log.targetId}
                                                    </p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex justify-center">
                                                        <div className="px-2.5 py-1 rounded-md bg-secondary text-foreground/80 text-[11px] font-bold border border-border/50">
                                                            {log.actorEmail || log.user || "Admin"}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-xs font-bold text-foreground/80">
                                                            {log.createdAt
                                                                ? new Date(log.createdAt).toLocaleTimeString()
                                                                : ""}
                                                        </span>
                                                        <span className="text-[10px] font-medium text-muted-foreground/60 uppercase">
                                                            {log.createdAt
                                                                ? new Date(log.createdAt).toLocaleDateString()
                                                                : ""}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() =>
                                                            setExpandedId(
                                                                isOpen ? null : log._id || log.id
                                                            )
                                                        }
                                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-secondary hover:bg-secondary/80 text-[10px] font-bold uppercase text-foreground"
                                                    >
                                                        Diff
                                                        <ChevronDown
                                                            size={12}
                                                            className={cn(
                                                                "transition-transform",
                                                                isOpen && "rotate-180"
                                                            )}
                                                        />
                                                    </button>
                                                </td>
                                            </tr>
                                            {isOpen && (
                                                <tr className="bg-secondary/10">
                                                    <td colSpan={5} className="px-6 py-4">
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                                                            <div className="p-3 rounded-xl bg-background border border-border">
                                                                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                                                                    Before Snapshot
                                                                </p>
                                                                <pre className="text-[11px] font-mono overflow-x-auto text-foreground/80">
                                                                    {JSON.stringify(log.before || {}, null, 2)}
                                                                </pre>
                                                            </div>
                                                            <div className="p-3 rounded-xl bg-background border border-border">
                                                                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                                                                    After Snapshot
                                                                </p>
                                                                <pre className="text-[11px] font-mono overflow-x-auto text-foreground/80">
                                                                    {JSON.stringify(log.after || {}, null, 2)}
                                                                </pre>
                                                            </div>
                                                            <div className="p-3 rounded-xl bg-background border border-border">
                                                                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                                                                    Metadata & Details
                                                                </p>
                                                                <pre className="text-[11px] font-mono overflow-x-auto text-foreground/80">
                                                                    {JSON.stringify(
                                                                        {
                                                                            requestId: log.requestId,
                                                                            actorId: log.actorId,
                                                                            ...(log.details || {}),
                                                                        },
                                                                        null,
                                                                        2
                                                                    )}
                                                                </pre>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
