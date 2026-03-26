"use client";

import React, { useState } from "react";
import { 
    History, 
    Search, 
    Filter, 
    Download, 
    Calendar,
    ChevronLeft,
    ChevronRight,
    MoreHorizontal
} from "lucide-react";
import { cn } from "@/lib/utils";

const MOCK_LOGS = [
    { id: 1, text: "User 'Alex M.' viewed 'MacBook Pro' (Admin)", type: "View", user: "Alex M.", time: "10:45 AM", date: "Today" },
    { id: 2, text: "User 'Sarah K.' sent a message to 'Apple Store'", type: "Message", user: "Sarah K.", time: "10:41 AM", date: "Today" },
    { id: 3, text: "User 'John D.' updated their profile photo", type: "Update", user: "John D.", time: "10:33 AM", date: "Today" },
    { id: 4, text: "User 'Emma L.' added 'iPhone 14' to favorites", type: "Favorite", user: "Emma L.", time: "10:27 AM", date: "Today" },
    { id: 5, text: "User 'Chris P.' registered a new seller account", type: "Registration", user: "Chris P.", time: "10:20 AM", date: "Today" },
    { id: 6, text: "User 'Lily R.' reported a listing: 'Fake Watch'", type: "Report", user: "Lily R.", time: "10:13 AM", date: "Today" },
    { id: 7, text: "User 'Mike B.' completed their first purchase", type: "Purchase", user: "Mike B.", time: "10:00 AM", date: "Today" },
    { id: 8, text: "User 'Anna W.' joined the 'General' community", type: "Join", user: "Anna W.", time: "09:45 AM", date: "Today" },
    { id: 9, text: "Admin 'SuperUser' suspended 'Scammer99'", type: "Admin Action", user: "SuperUser", time: "09:30 AM", date: "Today" },
    { id: 10, text: "System clear-out: Expired listings removed (42)", type: "System", user: "System", time: "04:00 AM", date: "Today" },
];

export default function LogsPage() {
    const [timeFilter, setTimeFilter] = useState<"Day" | "Week" | "Month">("Day");
    const [expandedId, setExpandedId] = useState<number | null>(null);

    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-secondary flex items-center justify-center text-muted-foreground border border-border/50 shadow-inner">
                        <History size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-foreground leading-tight">System Logs</h2>
                        <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mt-0.5">Audit trail of all administrative and user activities</p>
                    </div>
                </div>

                {/* Time Filter Toggle */}
                <div className="flex items-center bg-secondary/30 p-1 rounded-xl border border-border/40">
                    {(["Day", "Week", "Month"] as const).map((period) => (
                        <button
                            key={period}
                            onClick={() => setTimeFilter(period)}
                            className={cn(
                                "px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all",
                                timeFilter === period 
                                    ? "bg-background text-primary shadow-sm" 
                                    : "text-muted-foreground hover:text-foreground hover:bg-background/40"
                            )}
                        >
                            {period}
                        </button>
                    ))}
                </div>
            </div>

            {/* Logs Table */}
            <div className="bg-card border border-border/50 rounded-[32px] overflow-hidden shadow-sm">
                <div className="px-6 py-5 border-b border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-secondary/20">
                    <div className="flex items-center gap-2">
                        <div className="px-3 py-1 bg-secondary text-foreground/70 text-[10px] font-bold rounded-full border border-border/60 uppercase tracking-tight">
                            Latest Activities
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                         <div className="relative group hidden sm:block">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                            <input 
                                type="text"
                                placeholder="Filter logs..."
                                className="h-9 pl-10 pr-4 bg-background border border-border rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all w-[200px] text-foreground placeholder:text-muted-foreground/50"
                            />
                        </div>
                        <button className="h-9 px-3 flex items-center gap-2 rounded-xl bg-background border border-border/50 text-[10px] font-bold uppercase tracking-widest hover:bg-secondary/50 transition-all">
                            <Download size={14} />
                            Export
                        </button>
                    </div>
                </div>

                <div className="md:hidden px-4 pt-4 pb-2 space-y-3">
                    {MOCK_LOGS.map((log) => {
                        const isOpen = expandedId === log.id;
                        const dotClass =
                            log.type === "Admin Action" ? "bg-rose-500" :
                            log.type === "Report" ? "bg-amber-500" :
                            log.type === "System" ? "bg-blue-500" :
                            "bg-muted-foreground/40";
                        return (
                            <div key={log.id} className="rounded-2xl border border-border/60 bg-background/70 shadow-sm overflow-hidden">
                                <button
                                    onClick={() => setExpandedId(isOpen ? null : log.id)}
                                    className="w-full flex items-center justify-between gap-3 px-4 py-3"
                                >
                                    <div className="min-w-0 text-left">
                                        <p className="text-sm font-semibold text-foreground truncate">{log.text}</p>
                                        <p className="text-[11px] text-muted-foreground">{log.user}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`w-2.5 h-2.5 rounded-full ${dotClass}`} aria-hidden />
                                        <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? "rotate-90" : ""}`} />
                                    </div>
                                </button>
                                {isOpen && (
                                    <div className="px-4 pb-3">
                                        <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
                                            <div>
                                                <p className="uppercase tracking-widest text-[9px]">Type</p>
                                                <p className="font-semibold text-foreground/80">{log.type}</p>
                                            </div>
                                            <div>
                                                <p className="uppercase tracking-widest text-[9px]">Time</p>
                                                <p className="font-semibold text-foreground/80">{log.time}</p>
                                            </div>
                                            <div>
                                                <p className="uppercase tracking-widest text-[9px]">Date</p>
                                                <p className="font-semibold text-foreground/80">{log.date}</p>
                                            </div>
                                            <div>
                                                <p className="uppercase tracking-widest text-[9px]">User</p>
                                                <p className="font-semibold text-foreground/80">{log.user}</p>
                                            </div>
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
                            <tr className="border-b border-border/60 bg-secondary/20">
                                <th className="px-6 py-4 text-left text-[10px] font-bold text-foreground/50 uppercase tracking-widest">Type</th>
                                <th className="px-6 py-4 text-left text-[10px] font-bold text-foreground/50 uppercase tracking-widest">Activity Detail</th>
                                <th className="px-6 py-4 text-left text-[10px] font-bold text-foreground/50 uppercase tracking-widest text-center">User</th>
                                <th className="px-6 py-4 text-right text-[10px] font-bold text-foreground/50 uppercase tracking-widest">Time</th>
                                <th className="px-6 py-4 w-[50px]"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40">
                            {MOCK_LOGS.map((log) => (
                                <tr key={log.id} className="hover:bg-secondary/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <span className={cn(
                                            "px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-tighter border",
                                            log.type === "Admin Action" ? "text-rose-600 bg-rose-500/10 border-rose-500/30" :
                                            log.type === "Report" ? "text-amber-600 bg-amber-500/10 border-amber-500/30" :
                                            log.type === "System" ? "text-blue-600 bg-blue-500/10 border-blue-500/30" :
                                            "text-foreground/60 bg-secondary border-border/60"
                                        )}>
                                            {log.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-[13px] font-bold text-foreground/80 group-hover:text-foreground transition-colors">{log.text}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center">
                                            <div className="px-2.5 py-1 rounded-md bg-secondary text-foreground/70 text-[11px] font-bold border border-border/50">
                                                {log.user}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex flex-col items-end">
                                            <span className="text-xs font-bold text-foreground/70">{log.time}</span>
                                            <span className="text-[9px] font-medium text-muted-foreground/40 uppercase">{log.date}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button className="p-1.5 hover:bg-secondary rounded-lg transition-all text-muted-foreground/30 hover:text-foreground">
                                            <MoreHorizontal size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Placeholder */}
                <div className="px-6 py-4 border-t border-border/50 bg-secondary/20 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">End of recent archive</span>
                    <div className="flex items-center gap-1">
                        <button className="h-8 w-8 rounded-lg border border-border/50 flex items-center justify-center text-muted-foreground/50 hover:bg-secondary disabled:opacity-30" disabled>
                            <ChevronLeft size={14} />
                        </button>
                        <button className="h-8 w-8 rounded-lg bg-primary text-white text-[11px] font-bold shadow-lg shadow-primary/20">1</button>
                        <button className="h-8 w-8 rounded-lg border border-border/50 flex items-center justify-center text-muted-foreground/50 hover:bg-secondary">
                            <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
