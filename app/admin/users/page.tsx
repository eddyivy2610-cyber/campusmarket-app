"use client";

import { UserPlus, User, Search, MoreHorizontal, ShieldOff, Mail, Calendar, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import React, { useState } from 'react';
import Link from 'next/link';

import AdminUserDetailsModal from '@/components/admin/AdminUserDetailsModal';

const startUsers = [
    { id: 1, name: 'Alex Mordern', email: 'alex@email.com', date: '20 Jan, 2022', status: 'Active', role: 'Regular', avatar: 'A' },
    { id: 2, name: 'Sarah Konnor', email: 'sarah@email.com', date: '22 Feb, 2022', status: 'Suspended', role: 'Vendor', avatar: 'S' },
    { id: 3, name: 'Bob Bansen', email: 'bob@email.com', date: '12 Mar, 2022', status: 'Banned', role: 'Regular', avatar: 'B' },
    { id: 4, name: 'John Doe', email: 'john@email.com', date: '05 Apr, 2022', status: 'Pending', role: 'Vendor', avatar: 'S' },
];

export default function UsersPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [expandedId, setExpandedId] = useState<number | null>(null);

    const handleViewDetails = (user: any) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case "Active":
                return "bg-[#10B981] text-white";
            case "Pending":
                return "bg-slate-200 text-slate-500";
            case "Suspended":
                return "bg-amber-100 text-amber-600";
            case "Banned":
                return "bg-red-100 text-red-600";
            default:
                return "bg-secondary text-muted-foreground";
        }
    };
    const getStatusDotClass = (status: string) => {
        switch (status) {
            case "Active":
                return "bg-emerald-500";
            case "Pending":
                return "bg-slate-400";
            case "Suspended":
                return "bg-amber-500";
            case "Banned":
                return "bg-rose-500";
            default:
                return "bg-muted-foreground/40";
        }
    };

    return (
        <div className="space-y-6">
            {/* Table Container */}
            <div className="w-full bg-white dark:bg-card rounded-[20px] shadow-sm flex flex-col overflow-hidden">
                {/* Custom Header Bar */}
                <div className="p-3 md:p-4 flex w-full items-center justify-between border-b border-border/40">
                    <h1 className="text-sm font-bold tracking-tight text-foreground uppercase px-2">All Users</h1>
                    <button className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold px-4 py-2 md:px-5 md:py-2.5 rounded-xl hover:bg-primary/90 transition-all text-sm shadow-sm">
                        <UserPlus className="w-4 h-4" />
                        <span className="hidden sm:inline uppercase tracking-widest text-[10px]">Add User</span>
                    </button>
                </div>

                <div className="md:hidden px-4 pt-4 pb-2 space-y-3">
                    {startUsers.map((user) => {
                        const isOpen = expandedId === user.id;
                        return (
                            <div key={user.id} className="rounded-2xl border border-border/60 bg-background/70 shadow-sm overflow-hidden">
                                <button
                                    onClick={() => setExpandedId(isOpen ? null : user.id)}
                                    className="w-full flex items-center justify-between gap-3 px-4 py-3"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary border border-primary/20 shrink-0">
                                            {user.avatar}
                                        </div>
                                        <div className="min-w-0 text-left">
                                            <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">ID: CPM-{user.id.toString().padStart(4, '0')}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`w-2.5 h-2.5 rounded-full ${getStatusDotClass(user.status)}`} aria-hidden />
                                        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
                                    </div>
                                </button>
                                {isOpen && (
                                    <div className="px-4 pb-3">
                                        <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
                                            <div>
                                                <p className="uppercase tracking-widest text-[9px]">Email</p>
                                                <p className="font-semibold text-foreground/80">{user.email}</p>
                                            </div>
                                            <div>
                                                <p className="uppercase tracking-widest text-[9px]">Role</p>
                                                <p className="font-semibold text-foreground/80">{user.role}</p>
                                            </div>
                                            <div>
                                                <p className="uppercase tracking-widest text-[9px]">Joined</p>
                                                <p className="font-semibold text-foreground/80">{user.date}</p>
                                            </div>
                                            <div>
                                                <p className="uppercase tracking-widest text-[9px]">Status</p>
                                                <p className="font-semibold text-foreground/80">{user.status}</p>
                                            </div>
                                        </div>
                                        <div className="mt-3">
                                            <button
                                                onClick={() => handleViewDetails(user)}
                                                className="w-full rounded-lg border border-border/60 px-3 py-2 text-[11px] font-semibold text-muted-foreground hover:bg-secondary"
                                            >
                                                Details
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="w-full overflow-x-auto custom-scrollbar pt-4 pb-2 hidden md:block">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="border-b border-border/50 text-[13px] font-bold text-muted-foreground/70 tracking-wide uppercase">
                                <th className="pb-4 font-bold pl-4 md:pl-6 w-[25%]">User Details</th>
                                <th className="pb-4 font-bold w-[25%]">Contact</th>
                                <th className="pb-4 font-bold w-[20%]">Account Info</th>
                                <th className="pb-4 font-bold w-[15%]">Status</th>
                                <th className="pb-4 text-center font-bold pr-4 md:pr-6 w-[15%]">Options</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {startUsers.map((user) => (
                                <tr key={user.id} className="border-b border-border/40 hover:bg-secondary/20 transition-colors group">
                                    <td className="py-4 pl-4 md:pl-6">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary border border-primary/20">
                                                {user.avatar}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-foreground group-hover:text-primary transition-colors">{user.name}</span>
                                                <span className="text-[10px] font-bold uppercase tracking-widest opacity-30">ID: CPM-{user.id.toString().padStart(4, '0')}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4">
                                        <div className="flex items-center gap-2 font-medium text-foreground/80">
                                            <Mail size={12} className="opacity-40" />
                                            {user.email}
                                        </div>
                                    </td>
                                    <td className="py-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/5 px-2 py-0.5 rounded-md self-start">
                                                {user.role}
                                            </span>
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">
                                                <Calendar size={10} />
                                                Joined {user.date}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4">
                                        <span className={cn(
                                            "px-4 py-1.5 text-[11px] font-bold rounded-md uppercase tracking-widest whitespace-nowrap",
                                            getStatusStyles(user.status)
                                        )}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="py-4 text-center pr-4 md:pr-6">
                                        <button 
                                            onClick={() => handleViewDetails(user)}
                                            className="text-[11px] font-bold uppercase tracking-widest text-foreground/60 hover:text-primary transition-colors hover:bg-primary/5 px-4 py-2 rounded-xl whitespace-nowrap border border-border/40 group-hover:border-primary/20"
                                        >
                                            Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer Pagination (Simplified, following Products table style) */}
                <div className="p-4 md:p-6 border-t border-border/40 flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/50">Showing {startUsers.length} entries</span>
                    <div className="flex items-center gap-2">
                        <button className="px-4 py-2 rounded-xl border border-border/50 bg-secondary/5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:bg-secondary/20 transition-all">Prev</button>
                        <button className="w-8 h-8 rounded-xl bg-primary text-primary-foreground text-[10px] font-bold shadow-lg shadow-primary/20">1</button>
                        <button className="px-4 py-2 rounded-xl border border-border/50 bg-secondary/5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:bg-secondary/20 transition-all">Next</button>
                    </div>
                </div>
            </div>

            {/* Modal */}
            <AdminUserDetailsModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                user={selectedUser}
            />
        </div>
    );
}
