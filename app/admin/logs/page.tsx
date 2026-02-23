'use client';

import { ScrollText, Search, Filter, Clock, User, Shield, AlertTriangle, CheckCircle2, ChevronRight, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import React, { useState } from 'react';

const logs = [
    { id: 1, action: 'User Suspended', target: 'Bob Builder (UID-882)', admin: 'Sarah Johnson', time: '2 mins ago', type: 'Security', icon: Shield, color: 'text-red-500 bg-red-500/10' },
    { id: 2, action: 'Listing Approved', target: 'MacBook Pro 16"', admin: 'System Auto', time: '15 mins ago', type: 'Moderation', icon: CheckCircle2, color: 'text-green-500 bg-green-500/10' },
    { id: 3, action: 'Report Resolved', target: 'Harassment ID #992', admin: 'Mike Ross', time: '1 hour ago', type: 'Moderation', icon: ScrollText, color: 'text-blue-500 bg-blue-500/10' },
    { id: 4, action: 'Bulk Removal', target: '12 Spam Listings', admin: 'Sarah Johnson', time: '3 hours ago', type: 'Admin', icon: AlertTriangle, color: 'text-orange-500 bg-orange-500/10' },
    { id: 5, action: 'Settings Updated', target: 'Auto-Flag Threshold', admin: 'Super Admin', time: '5 hours ago', type: 'System', icon: Shield, color: 'text-purple-500 bg-purple-500/10' },
];

export default function LogsPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground uppercase">Activity Logs</h1>
                    <p className="text-muted-foreground font-medium uppercase tracking-[0.2em] text-[9px]">Audit trail of all administrative actions</p>
                </div>

                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary/10 hover:bg-secondary/20 transition-all text-[10px] font-bold uppercase tracking-widest text-foreground/70">
                        <Download size={14} />
                        Export Audit
                    </button>
                </div>
            </div>

            {/* Logs Table */}
            <div className="bg-card border border-border/50 rounded-[32px] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-secondary/5 border-b border-border/50">
                                <th className="px-6 py-4 text-left text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50">Action Details</th>
                                <th className="px-6 py-4 text-left text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50">Admin</th>
                                <th className="px-6 py-4 text-left text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50">Timestamp</th>
                                <th className="px-6 py-4 text-right text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50">Trace ID</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                            {logs.map((log) => (
                                <tr key={log.id} className="group hover:bg-secondary/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={cn("p-2 rounded-xl", log.color)}>
                                                <log.icon size={16} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-foreground">{log.action}</span>
                                                <span className="text-[9px] font-bold uppercase tracking-widest opacity-30">{log.target}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2 text-xs font-bold text-foreground/70">
                                            <User size={12} className="opacity-40" />
                                            {log.admin}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest opacity-40">
                                            <Clock size={12} />
                                            {log.time}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right font-mono text-[10px] opacity-20 group-hover:opacity-40 transition-opacity">
                                        TRC-{Math.random().toString(36).substr(2, 9).toUpperCase()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
