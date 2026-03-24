"use client";

import { AlertTriangle, Clock, Mail, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import React from 'react';

const suspendedUsers = [
    {
        id: 2,
        name: 'Bob Builder',
        email: 'bob@example.com',
        date: '20 Aug, 2023',
        status: 'Suspended',
        role: 'Seller',
        avatar: 'B',
        reason: 'Multiple policy violations (Spam listings)',
        suspendedUntil: '20 Mar, 2024',
        reportsCount: 5
    }
];

export default function SuspendedUsersPage() {
    return (
        <div className="space-y-6">
            <div className="w-full bg-white dark:bg-card rounded-[20px] shadow-sm flex flex-col overflow-hidden">
                <div className="p-3 md:p-4 flex w-full items-center justify-between border-b border-border/40">
                    <h1 className="text-sm font-bold tracking-tight text-foreground uppercase px-2">Suspended Accounts</h1>
                    <div className="flex items-center gap-2">
                         <span className="text-[10px] font-bold uppercase tracking-widest text-red-500 bg-red-500/10 px-3 py-1.5 rounded-lg">
                            Restricted: {suspendedUsers.length}
                        </span>
                    </div>
                </div>

                <div className="w-full overflow-x-auto custom-scrollbar pt-4 pb-2">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead>
                            <tr className="border-b border-border/50 text-[13px] font-semibold text-muted-foreground/70 tracking-wide uppercase">
                                <th className="pb-4 font-bold pl-4 md:pl-6 w-[25%]">User</th>
                                <th className="pb-4 font-bold w-[35%]">Suspension Reason</th>
                                <th className="pb-4 font-bold w-[25%]">Duration & Progress</th>
                                <th className="pb-4 text-center font-bold pr-4 md:pr-6 w-[15%]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {suspendedUsers.map((user) => (
                                <tr key={user.id} className="border-b border-border/40 hover:bg-secondary/20 transition-colors group">
                                    <td className="py-4 pl-4 md:pl-6">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center text-sm font-bold text-red-600 border border-red-500/20 shadow-inner">
                                                {user.avatar}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-foreground group-hover:text-red-600 transition-colors">{user.name}</span>
                                                <span className="text-[10px] font-bold uppercase tracking-widest opacity-30">{user.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4">
                                        <div className="flex flex-col gap-1 max-w-sm">
                                            <div className="flex items-center gap-2 text-[11px] font-bold text-red-600 uppercase tracking-widest">
                                                <AlertTriangle size={14} />
                                                {user.reason}
                                            </div>
                                            <span className="text-[10px] font-bold uppercase tracking-widest opacity-30 px-1">{user.reportsCount} Cumulative Reports</span>
                                        </div>
                                    </td>
                                    <td className="py-4">
                                        <div className="flex flex-col gap-2 pr-8">
                                            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                                                <div className="flex items-center gap-2 text-foreground/60">
                                                    <Clock size={12} className="opacity-40" />
                                                    Until {user.suspendedUntil}
                                                </div>
                                                <span className="text-red-500">65%</span>
                                            </div>
                                            <div className="w-full h-1.5 bg-secondary/20 rounded-full overflow-hidden">
                                                <div className="w-[65%] h-full bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.4)]" />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 text-center pr-4 md:pr-6">
                                        <button className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-primary/20">
                                            Reactivate
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 md:p-6 border-t border-border/40">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/50">Showing {suspendedUsers.length} entries</span>
                </div>
            </div>
        </div>
    );
}
