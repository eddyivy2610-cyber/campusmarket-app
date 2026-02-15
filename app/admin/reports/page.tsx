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
                    <h1 className="text-2xl font-bold text-white">Moderation Queue</h1>
                    <p className="text-gray-400 text-sm">Review and action reported content.</p>
                </div>

                <div className="flex gap-2">
                    {['All', 'Unresolved', 'Listing', 'User', 'Chat'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === f
                                ? 'bg-blue-600 text-white'
                                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-[#121212] rounded-xl border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-400 uppercase bg-white/5">
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
                                <tr key={report.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-white">
                                            {report.type === 'Listing' && <AlertTriangle size={16} className="text-yellow-500" />}
                                            {report.type === 'User' && <User size={16} className="text-blue-500" />}
                                            {report.type === 'Chat' && <MessageSquare size={16} className="text-purple-500" />}
                                            {report.type}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-white">{report.item}</td>
                                    <td className="px-6 py-4 text-red-400">{report.reason}</td>
                                    <td className="px-6 py-4 text-gray-400">{report.date}</td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={report.status} />
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button className="flex items-center gap-1 px-2 py-1 bg-green-500/10 text-green-400 text-xs rounded hover:bg-green-500/20 transition-colors">
                                                <Check size={14} /> Resolve
                                            </button>
                                            <button className="flex items-center gap-1 px-2 py-1 bg-red-500/10 text-red-400 text-xs rounded hover:bg-red-500/20 transition-colors">
                                                <ShieldAlert size={14} /> Ban
                                            </button>
                                            <button className="flex items-center gap-1 px-2 py-1 bg-gray-500/10 text-gray-400 text-xs rounded hover:bg-gray-500/20 transition-colors">
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
}
