"use client";

import { Search, Mail, Calendar, ChevronDown, Loader2, Store, GraduationCap, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import React, { useState, useEffect } from "react";
import { apiGet } from "@/lib/apiClient";
import AdminUserDetailsModal from "@/components/admin/AdminUserDetailsModal";

export default function UsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const fetchUsers = async () => {
        try {
            setIsLoading(true);
            const params = new URLSearchParams();
            if (roleFilter !== "all") params.set("role", roleFilter);
            if (statusFilter !== "all") params.set("status", statusFilter);
            const url = params.toString() ? `admin/users?${params.toString()}` : "admin/users";
            const response: any = await apiGet(url);
            if (response?.data) {
                setUsers(response.data);
            }
        } catch (err) {
            console.error("Failed to fetch users", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [roleFilter, statusFilter]);

    const handleViewDetails = (user: any) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const getStatusStyles = (status: string) => {
        const s = (status || "active").toLowerCase();
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
        const s = (status || "active").toLowerCase();
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
            return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
        } catch {
            return dateStr;
        }
    };

    const filteredUsers = users.filter((u) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
            (u.fullName || u.profile?.displayName || u.name || "").toLowerCase().includes(q) ||
            (u.email || "").toLowerCase().includes(q) ||
            (u.campus || "").toLowerCase().includes(q)
        );
    });

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
                <div className="p-4 sm:p-5 flex flex-wrap w-full items-center justify-between gap-4 border-b border-border/40 dark:border-white/10 bg-[#FAFBFD] dark:bg-white/[0.02]">
                    <div className="flex items-center gap-4 flex-1 min-w-[240px]">
                        <h1 className="text-sm font-bold tracking-tight text-foreground dark:text-white uppercase px-2">
                            Platform Users ({filteredUsers.length})
                        </h1>
                        <div className="relative max-w-xs hidden md:block flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground dark:text-neutral-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by name, email, or campus..."
                                className="pl-9 pr-4 py-2 w-full bg-[#F7F8FA] dark:bg-white/5 border border-border/50 dark:border-white/10 focus:border-[#FFC928] rounded-xl text-xs text-[#171717] dark:text-white placeholder:text-muted-foreground/60 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="h-9 px-3 rounded-xl bg-[#F7F8FA] dark:bg-white/5 border border-border/50 dark:border-white/10 text-xs font-bold text-foreground"
                        >
                            <option value="all">All Roles</option>
                            <option value="user">Buyers (User)</option>
                            <option value="seller">Sellers</option>
                            <option value="admin">Admins</option>
                        </select>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="h-9 px-3 rounded-xl bg-[#F7F8FA] dark:bg-white/5 border border-border/50 dark:border-white/10 text-xs font-bold text-foreground"
                        >
                            <option value="all">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="suspended">Suspended</option>
                            <option value="banned">Banned</option>
                        </select>
                        <button
                            onClick={fetchUsers}
                            className="h-9 px-3 rounded-xl bg-[#F2F4F7] dark:bg-white/10 hover:bg-[#E5E7EB] text-xs font-bold flex items-center gap-1.5"
                        >
                            <RefreshCw className="w-3.5 h-3.5" />
                            Refresh
                        </button>
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
                        const displayName = user.fullName || user.profile?.displayName || user.name || "Unnamed User";
                        return (
                            <div key={user._id} className="rounded-2xl border border-border/60 dark:border-white/10 bg-[#FAFBFD] dark:bg-white/[0.02] shadow-sm overflow-hidden">
                                <button
                                    onClick={() => setExpandedId(isOpen ? null : user._id)}
                                    className="w-full flex items-center justify-between gap-3 px-4 py-3"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="h-9 w-9 rounded-full bg-[#FFC928]/15 flex items-center justify-center text-sm font-bold text-[#171717] dark:text-[#FFC928] border border-[#FFC928]/30 shrink-0">
                                            {user.profile?.avatar ? (
                                                <img src={user.profile.avatar} alt={displayName} className="w-full h-full object-cover rounded-full" />
                                            ) : (
                                                (displayName || user.email || "?").charAt(0).toUpperCase()
                                            )}
                                        </div>
                                        <div className="min-w-0 text-left">
                                            <p className="text-sm font-semibold text-foreground dark:text-white truncate">{displayName}</p>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground dark:text-neutral-400">
                                                Stores: {user.storesCount || 0}/3 • {user.role || "user"}
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
                                                <p className="font-semibold text-foreground dark:text-white capitalize">{user.role || "user"}</p>
                                            </div>
                                            <div>
                                                <p className="uppercase tracking-widest text-[9px]">Joined</p>
                                                <p className="font-semibold text-foreground dark:text-white">{formatDate(user.createdAt)}</p>
                                            </div>
                                        </div>
                                        <div className="mt-3">
                                            <button
                                                onClick={() => handleViewDetails(user)}
                                                className="w-full rounded-xl bg-[#F2F4F7] dark:bg-white/10 hover:bg-[#E5E7EB] dark:hover:bg-white/15 px-3 py-2 text-[11px] font-bold text-[#171717] dark:text-white"
                                            >
                                                Manage Private Account & Stores
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
                    <table className="w-full text-left border-collapse min-w-[860px] text-xs">
                        <thead>
                            <tr className="border-b border-border/40 dark:border-white/10 text-[11px] font-black text-muted-foreground dark:text-neutral-400 tracking-wider uppercase bg-[#FAFBFD] dark:bg-white/[0.02]">
                                <th className="py-3.5 pl-6 w-[25%]">Private Identity</th>
                                <th className="py-3.5 w-[22%]">Contact & Campus</th>
                                <th className="py-3.5 w-[20%]">Stores & Verification</th>
                                <th className="py-3.5 w-[18%]">Role & Joined</th>
                                <th className="py-3.5 w-[10%]">Status</th>
                                <th className="py-3.5 text-right pr-6 w-[10%]">Manage</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40 dark:divide-white/5">
                            {filteredUsers.map((user) => {
                                const displayName =
                                    user.fullName || user.profile?.displayName || user.name || "Unnamed User";
                                return (
                                    <tr key={user._id} className="hover:bg-[#F7F8FA] dark:hover:bg-white/5 transition-colors group">
                                        <td className="py-4 pl-6">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-[#FFC928]/15 flex items-center justify-center text-sm font-bold text-[#171717] dark:text-[#FFC928] border border-[#FFC928]/30 shrink-0">
                                                    {user.profile?.avatar ? (
                                                        <img src={user.profile.avatar} alt={displayName} className="w-full h-full object-cover rounded-full" />
                                                    ) : (
                                                        (displayName || user.email || "?").charAt(0).toUpperCase()
                                                    )}
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="font-bold text-sm text-foreground dark:text-white truncate">
                                                        {displayName}
                                                    </span>
                                                    <span className="text-[10px] font-mono text-muted-foreground dark:text-neutral-400">
                                                        ID: CPM-{user._id?.slice(-6)?.toUpperCase() || "------"}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2 font-medium text-foreground dark:text-white">
                                                    <Mail size={13} className="text-muted-foreground dark:text-neutral-400" />
                                                    {user.email}
                                                </div>
                                                {user.campus && (
                                                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                        <GraduationCap size={11} />
                                                        {user.campus}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-4">
                                            <div className="flex flex-wrap items-center gap-1.5">
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-secondary text-foreground">
                                                    <Store size={11} />
                                                    {user.storesCount || 0} / 3 Stores
                                                </span>
                                                {user.studentVerified && (
                                                    <span className="px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                                        Student Verified
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-4">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-[#171717] dark:text-[#FFC928] bg-[#FFC928]/15 px-2 py-0.5 rounded-md self-start">
                                                    {user.role || "user"}
                                                </span>
                                                <div className="flex items-center gap-2 text-[10px] font-medium text-muted-foreground dark:text-neutral-400">
                                                    <Calendar size={11} />
                                                    Joined {formatDate(user.createdAt)}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4">
                                            <span
                                                className={cn(
                                                    "px-3 py-1 text-[10px] font-black rounded-full uppercase tracking-wider whitespace-nowrap",
                                                    getStatusStyles(user.accountStatus)
                                                )}
                                            >
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
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="p-4 md:p-6 border-t border-border/40 dark:border-white/10 flex items-center justify-between bg-[#FAFBFD] dark:bg-white/[0.02]">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground dark:text-neutral-400">
                        Showing {filteredUsers.length} entries
                    </span>
                </div>
            </div>

            {/* Modal */}
            <AdminUserDetailsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                user={selectedUser}
                onUpdated={fetchUsers}
            />
        </div>
    );
}
