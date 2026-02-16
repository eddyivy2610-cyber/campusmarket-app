'use client';

import { useState } from 'react';
import { Filter, AlertTriangle, Check, X, ShieldAlert, MessageSquare, User } from 'lucide-react';
import StatusBadge from '@/components/admin/StatusBadge';

const reportsData = [
    { id: 1, type: 'Listing', item: 'Scam Post #123', reason: 'Fraudulent Item', date: '10 mins ago', status: 'Pending', reporter: 'User_99' },
    { id: 2, type: 'User', item: 'JohnDoe', reason: 'Harassment', date: '2 hours ago', status: 'Review', reporter: 'AliceW' },
    { id: 3, type: 'Chat', item: 'Chat ID #554', reason: 'Inappropriate Content', date: '1 day ago', status: 'Resolved', reporter: 'SysAdmin' },
    { id: 4, type: 'Listing', item: 'Fake iPad', reason: 'Counterfeit', date: 'Yesterday', status: 'Dismissed', reporter: 'Buyer123' },
];

export default function ReportsPage() {
    const [filter, setFilter] = useState('All');

    const filteredReports = filter === 'All'
        ? reportsData
        : reportsData.filter(r => r.type === filter || r.status === filter);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Moderation Queue</h1>
                    <p className="text-muted-foreground text-sm">Review and action reported content.</p>
                </div>

                <div className="flex gap-2">
                    {['All', 'Unresolved', 'Listing', 'User', 'Chat'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === f
                                ? 'bg-blue-600 text-white'
                                : 'bg-card border border-border text-muted-foreground hover:bg-accent hover:text-foreground'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                            <tr>
                                <th className="px-6 py-4">Report Type</th>
                                <th className="px-6 py-4">Reported Item</th>
                                <th className="px-6 py-4">Reason</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredReports.map((report) => (
                                <tr key={report.id} className="border-b border-border hover:bg-accent/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-foreground">
                                            {report.type === 'Listing' && <AlertTriangle size={16} className="text-yellow-500" />}
                                            {report.type === 'User' && <User size={16} className="text-blue-500" />}
                                            {report.type === 'Chat' && <MessageSquare size={16} className="text-purple-500" />}
                                            {report.type}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-foreground">{report.item}</td>
                                    <td className="px-6 py-4 text-red-500">{report.reason}</td>
                                    <td className="px-6 py-4 text-muted-foreground">{report.date}</td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={report.status} />
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button className="flex items-center gap-1 px-2 py-1 bg-green-500/10 text-green-500 text-xs rounded hover:bg-green-500/20 transition-colors">
                                                <Check size={14} /> Resolve
                                            </button>
                                            <button className="flex items-center gap-1 px-2 py-1 bg-red-500/10 text-red-500 text-xs rounded hover:bg-red-500/20 transition-colors">
                                                <ShieldAlert size={14} /> Ban
                                            </button>
                                            <button className="flex items-center gap-1 px-2 py-1 bg-muted text-muted-foreground text-xs rounded hover:bg-accent transition-colors">
                                                <X size={14} /> Dismiss
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
