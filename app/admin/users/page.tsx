"use client";

import { UserPlus, User, Search, MoreHorizontal, ShieldOff, Mail, Calendar, ChevronDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
                const response: any = await apiGet("/api/user");
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
                return "bg-[#10B981] text-white";
            case "pending":
                return "bg-slate-200 text-slate-500";
            case "suspended":
                return "bg-amber-100 text-amber-600";
            case "banned":
                return "bg-red-100 text-red-600";
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
        (u.profile?.displayName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.email || "").toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Table Container */}
            <div className="w-full bg-white dark:bg-card rounded-[20px] shadow-sm flex flex-col overflow-hidden">
                {/* Custom Header Bar */}
                <div className="p-3 md:p-4 flex w-full items-center justify-between border-b border-border/40">
                    <div className="flex items-center gap-4 flex-1">
                        <h1 className="text-sm font-bold tracking-tight text-foreground uppercase px-2">All Users</h1>
                        <div className="relative max-w-xs hidden md:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                            <input 
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by name or email..."
                                className="pl-9 pr-4 py-1.5 w-full bg-secondary/20 border border-transparent focus:border-primary/20 rounded-lg text-xs outline-none transition-all"
                            />
                        </div>
                    </div>
                    <button className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold px-4 py-2 md:px-5 md:py-2.5 rounded-xl hover:bg-primary/90 transition-all text-sm shadow-sm">
                        <UserPlus className="w-4 h-4" />
                        <span className="hidden sm:inline uppercase tracking-widest text-[10px]">Add User</span>
                    </button>
                </div>

                {/* Mobile Search - Only visible on small screens */}
                <div className="md:hidden px-4 pt-4">
                     <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                        <input 
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search users..."
                            className="pl-9 pr-4 py-2.5 w-full bg-secondary/20 border border-transparent rounded-xl text-xs outline-none"
                        />
                    </div>
                </div>

                <div className="md:hidden px-4 pt-4 pb-2 space-y-3">
                    {filteredUsers.map((user) => {
                        const isOpen = expandedId === user._id;
                        return (
                            <div key={user._id} className="rounded-2xl border border-border/60 bg-background/70 shadow-sm overflow-hidden">
                                <button
                                    onClick={() => setExpandedId(isOpen ? null : user._id)}
                                    className="w-full flex items-center justify-between gap-3 px-4 py-3"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary border border-primary/20 shrink-0">
                                            {user.profile?.avatar ? <img src={user.profile.avatar} className="w-full h-full object-cover rounded-full" /> : (user.profile?.displayName || user.email || "?").charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0 text-left">
                                            <p className="text-sm font-semibold text-foreground truncate">{user.profile?.displayName || "Unnamed User"}</p>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
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
                                        <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
                                            <div className="col-span-2">
                                                <p className="uppercase tracking-widest text-[9px]">Email</p>
                                                <p className="font-semibold text-foreground/80 break-all">{user.email}</p>
                                            </div>
                                            <div>
                                                <p className="uppercase tracking-widest text-[9px]">Role</p>
                                                <p className="font-semibold text-foreground/80 capitalize">{user.role}</p>
                                            </div>
                                            <div>
                                                <p className="uppercase tracking-widest text-[9px]">Joined</p>
                                                <p className="font-semibold text-foreground/80">{formatDate(user.createdAt)}</p>
                                            </div>
                                            <div>
                                                <p className="uppercase tracking-widest text-[9px]">Status</p>
                                                <p className="font-semibold text-foreground/80 capitalize">{user.accountStatus || "active"}</p>
                                            </div>
                                        </div>
                                        <div className="mt-3">
                                            <button
                                                onClick={() => handleViewDetails(user)}
                                                className="w-full rounded-lg border border-border/60 px-3 py-2 text-[11px] font-semibold text-muted-foreground hover:bg-secondary"
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
                            {filteredUsers.map((user) => (
                                <tr key={user._id} className="border-b border-border/40 hover:bg-secondary/20 transition-colors group">
                                    <td className="py-4 pl-4 md:pl-6">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary border border-primary/20 shrink-0">
                                                {user.profile?.avatar ? <img src={user.profile.avatar} className="w-full h-full object-cover rounded-full" /> : (user.profile?.displayName || user.email || "?").charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-foreground group-hover:text-primary transition-colors">{user.profile?.displayName || "Unnamed User"}</span>
                                                <span className="text-[10px] font-bold uppercase tracking-widest opacity-30">
                                                    ID: CPM-{user._id?.slice(-6)?.toUpperCase() || "------"}
                                                </span>
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
                                                Joined {formatDate(user.createdAt)}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4">
                                        <span className={cn(
                                            "px-4 py-1.5 text-[11px] font-bold rounded-md uppercase tracking-widest whitespace-nowrap",
                                            getStatusStyles(user.accountStatus)
                                        )}>
                                            {user.accountStatus || "active"}
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

                {/* Footer Pagination */}
                <div className="p-4 md:p-6 border-t border-border/40 flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/50">Showing {filteredUsers.length} entries</span>
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
