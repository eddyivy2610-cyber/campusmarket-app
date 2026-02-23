'use client';

import { useState } from 'react';
import { Filter, AlertTriangle, Check, X, ShieldAlert, MessageSquare, User, Flag, Search, Eye, MoreHorizontal, AlertCircle, Clock, ChevronRight } from 'lucide-react';
import StatusBadge from '@/components/admin/StatusBadge';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const reportsData = [
    { id: 1, type: 'Listing', item: 'Scam Post #123', reason: 'Fraudulent Item', date: '10 mins ago', status: 'Pending', reporter: 'User_99', priority: 'High', urgencyColor: 'text-red-500 bg-red-500/10' },
    { id: 2, type: 'User', item: 'Sarah_K', reason: 'Identity Theft', date: '2 hours ago', status: 'In Review', reporter: 'AliceW', priority: 'High', urgencyColor: 'text-red-500 bg-red-500/10' },
    { id: 3, type: 'Listing', item: 'Misleading Description', reason: 'Inaccurate Info', date: '5 hours ago', status: 'Pending', reporter: 'Mike_R', priority: 'Medium', urgencyColor: 'text-orange-500 bg-orange-500/10' },
    { id: 4, type: 'Chat', item: 'Chat ID #554', reason: 'Spam Messages', date: '1 day ago', status: 'Resolved', reporter: 'System', priority: 'Low', urgencyColor: 'text-blue-500 bg-blue-500/10' },
    { id: 5, type: 'User', item: 'John_Doe', reason: 'Suspicious Activity', date: '2 days ago', status: 'Dismissed', reporter: 'Moderator_A', priority: 'Low', urgencyColor: 'text-blue-500 bg-blue-500/10' },
];

export default function ReportsPage() {
    const [filter, setFilter] = useState('All');

    const filteredReports = filter === 'All'
        ? reportsData
        : reportsData.filter(r => r.type === filter || r.status === filter || r.priority === filter);

    return (
        <div className="space-y-6">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground uppercase">Reports Queue</h1>
                    <p className="text-muted-foreground font-medium uppercase tracking-[0.2em] text-[9px]">Moderate Community Behavior & Content</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="w-7 h-7 rounded-full border-2 border-background bg-secondary/20 flex items-center justify-center text-[9px] font-bold">M</div>
                        ))}
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">3 Admins Online</span>
                </div>
            </div>

            {/* Priority Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "High Priority", value: "08", color: "text-red-500", icon: AlertCircle },
                    { label: "Pending Review", value: "23", color: "text-orange-500", icon: Clock },
                    { label: "Avg Response", value: "14m", color: "text-blue-500", icon: ShieldAlert },
                    { label: "Resolved Today", value: "142", color: "text-green-500", icon: Check },
                ].map((stat) => (
                    <div key={stat.label} className="p-5 bg-card border border-border/50 rounded-[20px] flex items-center justify-between shadow-sm">
                        <div className="space-y-1">
                            <span className="block text-[8px] font-bold uppercase tracking-widest text-muted-foreground/60">{stat.label}</span>
                            <span className={cn("text-lg font-bold block", stat.color)}>{stat.value}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-secondary/10">
                            <stat.icon size={20} className={cn("opacity-40", stat.color)} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Management Bar */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-primary transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search by ID, item name or reporter..."
                        className="w-full pl-12 pr-4 py-2.5 bg-card border border-border/50 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                    />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                    {['All', 'High', 'Medium', 'Low'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={cn(
                                "px-5 py-2.5 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all whitespace-nowrap border border-border/50 shadow-sm",
                                filter === f
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "bg-card text-muted-foreground hover:bg-accent hover:text-foreground"
                            )}
                        >
                            {f === 'All' ? 'All Priority' : `${f} Priority`}
                        </button>
                    ))}
                </div>
            </div>

            {/* Reports Queue List */}
            <div className="space-y-4">
                {filteredReports.map((report) => (
                    <div key={report.id} className="group bg-card border border-border/50 rounded-[28px] p-5 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
                        <div className="flex flex-col md:flex-row md:items-center gap-6">
                            {/* Type & Priority */}
                            <div className="flex items-center gap-3 min-w-[120px]">
                                <div className={cn("p-3 rounded-xl", report.urgencyColor)}>
                                    {report.type === 'Listing' ? <AlertTriangle size={20} /> : report.type === 'User' ? <User size={20} /> : <MessageSquare size={20} />}
                                </div>
                                <div>
                                    <span className="block text-[10px] font-bold uppercase tracking-widest text-foreground/80">{report.type}</span>
                                    <span className={cn("text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-md mt-0.5 inline-block", report.urgencyColor)}>
                                        {report.priority}
                                    </span>
                                </div>
                            </div>

                            {/* Content Details */}
                            <div className="flex-1 min-w-0">
                                <Link href={`/admin/reports/${report.id}`} className="group/link inline-flex items-center gap-2 mb-0.5">
                                    <h3 className="text-base font-bold tracking-tight text-foreground group-hover/link:text-primary transition-colors">{report.item}</h3>
                                    <ChevronRight size={16} className="opacity-0 group-hover/link:opacity-100 group-hover/link:translate-x-1 transition-all text-primary" />
                                </Link>
                                <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5">
                                    <div className="flex items-center gap-1.5 text-xs font-semibold text-red-600">
                                        <Flag size={12} className="opacity-50" />
                                        {report.reason}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest opacity-40">
                                        <User size={10} />
                                        Reported by {report.reporter}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest opacity-40">
                                        <Clock size={10} />
                                        {report.date}
                                    </div>
                                </div>
                            </div>

                            {/* Status & Actions */}
                            <div className="flex items-center gap-6">
                                <StatusBadge status={report.status} />
                                <div className="flex items-center gap-2">
                                    <Link href={`/admin/reports/${report.id}`} className="p-3 bg-secondary/10 hover:bg-primary/10 hover:text-primary rounded-2xl transition-all shadow-inner">
                                        <Eye size={20} />
                                    </Link>
                                    <button className="p-3 bg-secondary/10 hover:bg-red-500/10 hover:text-red-500 rounded-2xl transition-all shadow-inner">
                                        <ShieldAlert size={20} />
                                    </button>
                                    <button className="p-3 bg-secondary/10 hover:bg-accent rounded-2xl transition-all shadow-inner">
                                        <MoreHorizontal size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
