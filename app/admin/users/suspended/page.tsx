'use client';

import { ShieldAlert, ShieldCheck, Search, Filter, Mail, Calendar, Clock, AlertTriangle } from 'lucide-react';
import StatusBadge from '@/components/admin/StatusBadge';
import { cn } from '@/lib/utils';
import React, { useState } from 'react';

const suspendedUsers = [
    {
        id: 2,
        name: 'Bob Builder',
        email: 'bob@example.com',
        date: '2023-08-20',
        status: 'Suspended',
        role: 'Seller',
        avatar: 'B',
        reason: 'Multiple policy violations (Spam listings)',
        suspendedUntil: '2024-03-20',
        reportsCount: 5
    }
];

export default function SuspendedUsersPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground uppercase">Suspended Users</h1>
                    <p className="text-muted-foreground font-medium uppercase tracking-[0.2em] text-[9px]">Restricted Accounts: {suspendedUsers.length}</p>
                </div>
            </div>

            <div className="bg-card border border-border/50 rounded-[24px] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-secondary/5 border-b border-border/50">
                                <th className="px-6 py-4 text-left text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50">User</th>
                                <th className="px-6 py-4 text-left text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50">Suspension Reason</th>
                                <th className="px-6 py-4 text-left text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50">Duration</th>
                                <th className="px-6 py-4 text-right text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                            {suspendedUsers.map((user) => (
                                <tr key={user.id} className="group hover:bg-secondary/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-full bg-red-600/10 border border-red-600/20 flex items-center justify-center text-xs font-bold text-red-600">
                                                {user.avatar}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-foreground">{user.name}</span>
                                                <span className="text-[9px] font-bold uppercase tracking-widest opacity-30">{user.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col gap-1 max-w-sm">
                                            <div className="flex items-center gap-2 text-xs font-bold text-red-600">
                                                <AlertTriangle size={12} />
                                                {user.reason}
                                            </div>
                                            <span className="text-[9px] font-bold uppercase tracking-widest opacity-30">{user.reportsCount} Cumulative Reports</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-foreground/60">
                                                <Clock size={12} className="opacity-40" />
                                                Until {user.suspendedUntil}
                                            </div>
                                            <div className="w-24 h-1.5 bg-secondary/20 rounded-full overflow-hidden">
                                                <div className="w-2/3 h-full bg-red-500 rounded-full" />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-primary/20">
                                                Reactivate
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
