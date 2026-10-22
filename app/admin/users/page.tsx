"use client";

import { UserPlus, Search, Mail, Calendar, ChevronDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import React, { useState, useEffect } from 'react';
import { apiGet } from '@/lib/apiClient';

import AdminUserDetailsModal from '@/components/admin/AdminUserDetailsModal';

export default function UsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response: any = await apiGet("admin/users");
                if (response?.data) {
                    setUsers(response.data);
                }
            } catch (err) {
                console.error("Failed to fetch users", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const handleViewDetails = (user: any) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const getStatusStyles = (status: string) => {
        const s = (status || "Pending").toLowerCase();
        switch (s) {
            case "active":
                return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20";
            case "pending":
                return "bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-neutral-300";
            case "suspended":
                return "bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20";
            case "banned":
                return "bg-red-100 dark:bg-rose-500/10 text-red-700 dark:text-rose-400 border border-rose-500/20";
            default:
                return "bg-secondary text-muted-foreground";
        }
    };

    const getStatusDotClass = (status: string) => {
        const s = (status || "Pending").toLowerCase();
        switch (s) {
            case "active":
                return "bg-emerald-500";
            case "pending":
                return "bg-slate-400";
            case "suspended":
                return "bg-amber-500";
            case "banned":
                return "bg-rose-500";
            default:
                return "bg-muted-foreground/40";
        }
    };

    const formatDate = (dateStr: string) => {
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        } catch (e) {
            return dateStr;
        }
    };

    const filteredUsers = users.filter(u => 
        (u.profile?.displayName || u.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.email || "").toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 text-[#FFC928] animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-16">
            {/* Table Container */}
            <div className="w-full bg-white dark:bg-[#14161D] rounded-3xl border border-border/60 dark:border-white/10 shadow-sm flex flex-col overflow-hidden">
                {/* Custom Header Bar */}
                <div className="p-4 sm:p-5 flex w-full items-center justify-between border-b border-border/40 dark:border-white/10 bg-[#FAFBFD] dark:bg-white/[0.02]">
                    <div className="flex items-center gap-4 flex-1">
                        <h1 className="text-sm font-bold tracking-tight text-foreground dark:text-white uppercase px-2">
                            Platform Users ({filteredUsers.length})
                        </h1>
                        <div className="relative max-w-xs hidden md:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground dark:text-neutral-400" />
                            <input 
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by name or email..."
                                className="pl-9 pr-4 py-2 w-full bg-[#F7F8FA] dark:bg-white/5 border border-border/50 dark:border-white/10 focus:border-[#FFC928] rounded-xl text-xs text-[#171717] dark:text-white placeholder:text-muted-foreground/60 outline-none transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* Mobile Search */}
                <div className="md:hidden px-4 pt-4">
                     <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground dark:text-neutral-400" />
                        <input 
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search users..."
                            className="pl-9 pr-4 py-2.5 w-full bg-[#F7F8FA] dark:bg-white/5 border border-border/50 dark:border-white/10 rounded-xl text-xs text-[#171717] dark:text-white outline-none"
                        />
                    </div>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden px-4 pt-4 pb-2 space-y-3">
                    {filteredUsers.map((user) => {
                        const isOpen = expandedId === user._id;
                        return (
                            <div key={user._id} className="rounded-2xl border border-border/60 dark:border-white/10 bg-[#FAFBFD] dark:bg-white/[0.02] shadow-sm overflow-hidden">
                                <button
                                    onClick={() => setExpandedId(isOpen ? null : user._id)}
                                    className="w-full flex items-center justify-between gap-3 px-4 py-3"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="h-9 w-9 rounded-full bg-[#FFC928]/15 flex items-center justify-center text-sm font-bold text-[#171717] dark:text-[#FFC928] border border-[#FFC928]/30 shrink-0">
                                            {user.profile?.avatar ? <img src={user.profile.avatar} className="w-full h-full object-cover rounded-full" /> : (user.profile?.displayName || user.name || user.email || "?").charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0 text-left">
                                            <p className="text-sm font-semibold text-foreground dark:text-white truncate">{user.profile?.displayName || user.name || "Unnamed User"}</p>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground dark:text-neutral-400">
                                                ID: CPM-{user._id?.slice(-6)?.toUpperCase() || "------"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`w-2.5 h-2.5 rounded-full ${getStatusDotClass(user.accountStatus)}`} aria-hidden />
                                        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
                                    </div>
                                </button>
                                {isOpen && (
                                    <div className="px-4 pb-3">
                                        <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground dark:text-neutral-400">
                                            <div className="col-span-2">
                                                <p className="uppercase tracking-widest text-[9px]">Email</p>
                                                <p className="font-semibold text-foreground dark:text-white break-all">{user.email}</p>
                                            </div>
                                            <div>
                                                <p className="uppercase tracking-widest text-[9px]">Role</p>
                                                <p className="font-semibold text-foreground dark:text-white capitalize">{user.role}</p>
                                            </div>
                                            <div>
                                                <p className="uppercase tracking-widest text-[9px]">Joined</p>
                                                <p className="font-semibold text-foreground dark:text-white">{formatDate(user.createdAt)}</p>
                                            </div>
                                            <div>
                                                <p className="uppercase tracking-widest text-[9px]">Status</p>
                                                <p className="font-semibold text-foreground dark:text-white capitalize">{user.accountStatus || "active"}</p>
                                            </div>
                                        </div>
                                        <div className="mt-3">
                                            <button
                                                onClick={() => handleViewDetails(user)}
                                                className="w-full rounded-xl bg-[#F2F4F7] dark:bg-white/10 hover:bg-[#E5E7EB] dark:hover:bg-white/15 px-3 py-2 text-[11px] font-bold text-[#171717] dark:text-white"
                                            >
                                                View Complete Profile
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Desktop Table */}
                <div className="w-full overflow-x-auto custom-scrollbar pt-2 pb-2 hidden md:block">
                    <table className="w-full text-left border-collapse min-w-[800px] text-xs">
                        <thead>
                            <tr className="border-b border-border/40 dark:border-white/10 text-[11px] font-black text-muted-foreground dark:text-neutral-400 tracking-wider uppercase bg-[#FAFBFD] dark:bg-white/[0.02]">
                                <th className="py-3.5 pl-6 w-[25%]">User Details</th>
                                <th className="py-3.5 w-[25%]">Contact</th>
                                <th className="py-3.5 w-[20%]">Account Info</th>
                                <th className="py-3.5 w-[15%]">Status</th>
                                <th className="py-3.5 text-right pr-6 w-[15%]">Options</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40 dark:divide-white/5">
                            {filteredUsers.map((user) => (
                                <tr key={user._id} className="hover:bg-[#F7F8FA] dark:hover:bg-white/5 transition-colors group">
                                    <td className="py-4 pl-6">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-[#FFC928]/15 flex items-center justify-center text-sm font-bold text-[#171717] dark:text-[#FFC928] border border-[#FFC928]/30 shrink-0">
                                                {user.profile?.avatar ? <img src={user.profile.avatar} className="w-full h-full object-cover rounded-full" /> : (user.profile?.displayName || user.name || user.email || "?").charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="font-bold text-sm text-foreground dark:text-white truncate">{user.profile?.displayName || user.name || "Unnamed User"}</span>
                                                <span className="text-[10px] font-mono text-muted-foreground dark:text-neutral-400">
                                                    ID: CPM-{user._id?.slice(-6)?.toUpperCase() || "------"}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4">
                                        <div className="flex items-center gap-2 font-medium text-foreground dark:text-white">
                                            <Mail size={13} className="text-muted-foreground dark:text-neutral-400" />
                                            {user.email}
                                        </div>
                                    </td>
                                    <td className="py-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-[#171717] dark:text-[#FFC928] bg-[#FFC928]/15 px-2 py-0.5 rounded-md self-start">
                                                {user.role}
                                            </span>
                                            <div className="flex items-center gap-2 text-[10px] font-medium text-muted-foreground dark:text-neutral-400">
                                                <Calendar size={11} />
                                                Joined {formatDate(user.createdAt)}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4">
                                        <span className={cn(
                                            "px-3 py-1 text-[10px] font-black rounded-full uppercase tracking-wider whitespace-nowrap",
                                            getStatusStyles(user.accountStatus)
                                        )}>
                                            {user.accountStatus || "active"}
                                        </span>
                                    </td>
                                    <td className="py-4 text-right pr-6">
                                        <button 
                                            onClick={() => handleViewDetails(user)}
                                            className="text-xs font-bold bg-[#F2F4F7] dark:bg-white/10 hover:bg-[#E5E7EB] dark:hover:bg-white/15 text-[#171717] dark:text-white px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all"
                                        >
                                            Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer Pagination */}
                <div className="p-4 md:p-6 border-t border-border/40 dark:border-white/10 flex items-center justify-between bg-[#FAFBFD] dark:bg-white/[0.02]">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground dark:text-neutral-400">Showing {filteredUsers.length} entries</span>
                    <div className="flex items-center gap-2">
                        <button className="px-4 py-2 rounded-xl border border-border/50 dark:border-white/10 bg-secondary/5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground dark:text-neutral-300 hover:bg-secondary/20 transition-all">Prev</button>
                        <button className="w-8 h-8 rounded-xl bg-[#FFC928] text-[#171717] text-[10px] font-black">1</button>
                        <button className="px-4 py-2 rounded-xl border border-border/50 dark:border-white/10 bg-secondary/5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground dark:text-neutral-300 hover:bg-secondary/20 transition-all">Next</button>
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
