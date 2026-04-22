"use client";

import React, { useState, useEffect } from 'react';
import { Check, X, Eye, Mail, Building, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiGet, apiPost } from '@/lib/apiClient';

import AdminUserDetailsModal from '@/components/admin/AdminUserDetailsModal';

export default function PendingUsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchPendingUsers = async () => {
        setIsLoading(true);
        try {
            const response: any = await apiGet("/api/users?sellerStatus=pending");
            setUsers(response?.data || []);
        } catch (err) {
            console.error("Failed to fetch pending users", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingUsers();
    }, []);

    const handleViewDetails = (user: any) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const handleApprove = async (userId: string) => {
        if (!confirm("Are you sure you want to approve this seller?")) return;
        try {
            await apiPost(`/api/onboarding/admin/approve/${userId}`, {});
            await fetchPendingUsers();
        } catch (err) {
            console.error("Approval failed", err);
            alert("Failed to approve seller");
        }
    };

    const handleReject = async (userId: string) => {
        const reason = prompt("Enter rejection reason:");
        if (reason === null) return;
        try {
            await apiPost(`/api/onboarding/admin/reject/${userId}`, { reason });
            await fetchPendingUsers();
        } catch (err) {
            console.error("Rejection failed", err);
            alert("Failed to reject seller");
        }
    };

    return (
        <div className="space-y-6">
            <div className="w-full bg-white dark:bg-card rounded-[20px] shadow-sm flex flex-col overflow-hidden text-foreground">
                <div className="p-3 md:p-4 flex w-full items-center justify-between border-b border-border/40">
                    <h1 className="text-sm font-bold tracking-tight text-foreground uppercase px-2">Pending Approvals</h1>
                    <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                        {users.length} Requests
                    </div>
                </div>

                <div className="w-full overflow-x-auto pt-4 pb-2">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead>
                            <tr className="border-b border-border/50 text-[13px] font-semibold text-muted-foreground/70 tracking-wide uppercase">
                                <th className="pb-4 font-bold pl-4 md:pl-6 w-[25%]">User Details</th>
                                <th className="pb-4 font-bold w-[25%]">Contact</th>
                                <th className="pb-4 font-bold w-[15%]">Applied At</th>
                                <th className="pb-4 font-bold w-[15%]">Verification Proof</th>
                                <th className="pb-4 text-center font-bold pr-4 md:pr-6 w-[20%]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center text-muted-foreground">Loading pending requests...</td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center text-muted-foreground">No pending seller applications.</td>
                                </tr>
                            ) : users.map((user) => (
                                <tr key={user._id} className="border-b border-border/40 hover:bg-secondary/20 transition-colors group">
                                    <td className="py-4 pl-4 md:pl-6">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center text-sm font-bold text-blue-500 border border-blue-500/20">
                                                {user.profile?.displayName?.charAt(0) || user.email.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span 
                                                    onClick={() => handleViewDetails(user)}
                                                    className="font-bold text-foreground group-hover:text-primary transition-colors cursor-pointer truncate"
                                                >
                                                    {user.profile?.displayName || "Prospective Seller"}
                                                </span>
                                                <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">
                                                    <Calendar size={10} />
                                                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown"}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4">
                                        <div className="flex flex-col gap-1 font-medium text-foreground/80 min-w-0">
                                            <div className="flex items-center gap-2 truncate">
                                                <Mail size={12} className="opacity-40 shrink-0" />
                                                {user.email}
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-muted-foreground/40 truncate">
                                                <Building size={10} className="shrink-0" />
                                                {user.studentStatus?.schoolName || "N/A"}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 text-muted-foreground font-medium">
                                        {user.sellerApplication?.appliedAt ? new Date(user.sellerApplication.appliedAt).toLocaleDateString() : "Just now"}
                                    </td>
                                    <td className="py-4">
                                        {user.sellerApplication?.idImage ? (
                                            <div 
                                                onClick={() => handleViewDetails(user)}
                                                className="relative h-10 w-16 rounded-lg overflow-hidden border border-border/50 bg-secondary/20 cursor-pointer group/id"
                                            >
                                                <img src={user.sellerApplication.idImage} alt="ID Preview" className="w-full h-full object-cover transition-transform group-hover/id:scale-110" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/id:opacity-100 transition-opacity flex items-center justify-center">
                                                    <Eye className="w-4 h-4 text-white" />
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="text-[10px] text-muted-foreground italic">No ID uploaded</span>
                                        )}
                                    </td>
                                    <td className="py-4 text-center pr-4 md:pr-6">
                                        <div className="flex items-center justify-center gap-2">
                                            <button 
                                                onClick={() => handleReject(user._id)}
                                                className="p-2.5 rounded-xl bg-red-500/10 text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm" 
                                                title="Reject"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleApprove(user._id)}
                                                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-primary/20"
                                            >
                                                <Check className="w-3.5 h-3.5" />
                                                Approve
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 md:p-6 border-t border-border/40">
                     <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/50">Showing {users.length} entries</span>
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
