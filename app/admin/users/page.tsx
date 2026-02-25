'use client';

import { MoreHorizontal, ShieldOff, User, Search, Filter, Download, UserCheck, Mail, Calendar } from 'lucide-react';
import StatusBadge from '@/components/admin/StatusBadge';
import { cn } from '@/lib/utils';
import React, { useState } from 'react';

const startUsers = [
    { id: 1, name: 'Active User', email: 'active@email.com', date: '2023-09-15', status: 'Active', role: 'Regular', avatar: 'A' },
    { id: 2, name: 'Suspended User', email: 'suspended@email.com', date: '2023-08-20', status: 'Suspended', role: 'Vendor', avatar: 'S' },
    { id: 3, name: 'Banned User', email: 'banned@email.com', date: '2023-11-12', status: 'Banned', role: 'Regular', avatar: 'B' },
    { id: 4, name: 'Pending User', email: 'pending@email.com', date: '2023-12-05', status: 'Pending', role: 'Vendor', avatar: 'S' },
];

export default function UsersPage() {
    const [searchQuery, setSearchQuery] = useState("");

    return (
        <div className="space-y-6">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground uppercase">All Users</h1>
                    <p className="text-muted-foreground font-medium uppercase tracking-[0.2em] text-[9px]">Total Platform Users: {startUsers.length}</p>
                </div>

                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary/10 hover:bg-secondary/20 transition-all text-[10px] font-bold uppercase tracking-widest">
                        <Download size={14} />
                        Export
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-all text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-primary/20">
                        <UserCheck size={14} />
                        Add User
                    </button>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row gap-4 p-4 bg-card border border-border/50 rounded-[24px]">
                <div className="flex-1 relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-primary transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search users by name, email or ID..."
                        className="w-full pl-12 pr-4 py-2.5 bg-secondary/5 border-none rounded-xl text-sm font-semibold focus:ring-2 focus:ring-primary/20 transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <select className="appearance-none pl-4 pr-10 py-3 bg-secondary/5 border-none rounded-xl text-[10px] font-bold uppercase tracking-widest cursor-pointer hover:bg-secondary/10 transition-all focus:ring-2 focus:ring-primary/20">
                            <option>All Roles</option>
                            <option>Regular</option>
                            <option>Vendors</option>
                            <option>Admins</option>
                        </select>
                        <Filter className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/30 pointer-events-none" size={12} />
                    </div>
                    <div className="relative">
                        <select className="appearance-none pl-4 pr-10 py-2.5 bg-secondary/5 border-none rounded-xl text-[9px] font-bold uppercase tracking-widest cursor-pointer hover:bg-secondary/10 transition-all focus:ring-2 focus:ring-primary/20">
                            <option>All Status</option>
                            <option>Active</option>
                            <option>Suspended</option>
                            <option>Banned</option>
                            <option>Pending</option>
                        </select>
                        <Filter className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/30 pointer-events-none" size={12} />
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-card border border-border/50 rounded-[32px] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-secondary/5 border-b border-border/50">
                                <th className="px-6 py-4 text-left text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50">User Details</th>
                                <th className="px-6 py-4 text-left text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50">Contact</th>
                                <th className="px-6 py-4 text-left text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50">Account Info</th>
                                <th className="px-6 py-4 text-left text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50">Status</th>
                                <th className="px-6 py-4 text-right text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                            {startUsers.map((user) => (
                                <tr key={user.id} className="group hover:bg-secondary/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-full bg-blue-600/10 border border-blue-600/20 flex items-center justify-center text-sm font-bold text-blue-600 shadow-inner">
                                                {user.avatar}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{user.name}</span>
                                                <span className="text-[9px] font-bold uppercase tracking-widest opacity-30">ID: CPM-{user.id.toString().padStart(4, '0')}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2 text-xs font-semibold text-foreground/70">
                                                <Mail size={12} className="opacity-40" />
                                                {user.email}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-foreground/60">
                                                <span className={cn(
                                                    "px-2 py-0.5 rounded-md",
                                                    user.role === 'Seller' ? "bg-orange-500/10 text-orange-600" : "bg-blue-500/10 text-blue-600"
                                                )}>{user.role}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.2em] opacity-30">
                                                <Calendar size={10} />
                                                Joined {user.date}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={user.status} />
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button className="p-2.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl transition-all" title="View Details">
                                                <User size={16} />
                                            </button>
                                            <button className="p-2.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all" title="Suspend User">
                                                <ShieldOff size={16} />
                                            </button>
                                            <button className="p-2.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded-xl transition-all">
                                                <MoreHorizontal size={16} />
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
