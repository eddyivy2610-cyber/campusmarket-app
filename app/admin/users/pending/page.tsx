"use client";

import { Check, X, Eye, Mail, Building, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import React, { useState } from 'react';

import AdminUserDetailsModal from '@/components/admin/AdminUserDetailsModal';

const pendingUsers: any[] = [];

export default function PendingUsersPage() {
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleViewDetails = (user: any) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="w-full bg-white dark:bg-card rounded-[20px] shadow-sm flex flex-col overflow-hidden">
                <div className="p-3 md:p-4 flex w-full items-center justify-between border-b border-border/40">
                    <h1 className="text-sm font-bold tracking-tight text-foreground uppercase px-2">Pending Approvals</h1>
                    <button className="inline-flex items-center justify-center gap-2 bg-green-500 text-white font-semibold px-4 py-2 md:px-5 md:py-2.5 rounded-xl hover:opacity-90 transition-all text-sm shadow-sm shadow-green-500/20">
                        <Check className="w-4 h-4" />
                        <span className="hidden sm:inline uppercase tracking-widest text-[10px]">Bulk Approve</span>
                    </button>
                </div>

                <div className="w-full overflow-x-auto custom-scrollbar pt-4 pb-2">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead>
                            <tr className="border-b border-border/50 text-[13px] font-semibold text-muted-foreground/70 tracking-wide uppercase">
                                <th className="pb-4 font-bold pl-4 md:pl-6 w-[25%]">User Details</th>
                                <th className="pb-4 font-bold w-[25%]">Contact</th>
                                <th className="pb-4 font-bold w-[15%]">Account Type</th>
                                <th className="pb-4 font-bold w-[15%]">Verification Proof</th>
                                <th className="pb-4 text-center font-bold pr-4 md:pr-6 w-[20%]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {pendingUsers.map((user) => (
                                <tr key={user.id} className="border-b border-border/40 hover:bg-secondary/20 transition-colors group">
                                    <td className="py-4 pl-4 md:pl-6">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center text-sm font-bold text-blue-500 border border-blue-500/20">
                                                {user.avatar}
                                            </div>
                                            <div className="flex flex-col">
                                                <span 
                                                    onClick={() => handleViewDetails(user)}
                                                    className="font-bold text-foreground group-hover:text-primary transition-colors cursor-pointer"
                                                >
                                                    {user.name}
                                                </span>
                                                <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">
                                                    <Calendar size={10} />
                                                    {user.date}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4">
                                        <div className="flex flex-col gap-1 font-medium text-foreground/80">
                                            <div className="flex items-center gap-2">
                                                <Mail size={12} className="opacity-40" />
                                                {user.email}
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-muted-foreground/40">
                                                <Building size={10} />
                                                {user.school}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/5 px-2 py-0.5 rounded-md">
                                            {user.type}
                                        </span>
                                    </td>
                                    <td className="py-4">
                                        <div 
                                            onClick={() => handleViewDetails(user)}
                                            className="relative h-10 w-16 rounded-lg overflow-hidden border border-border/50 bg-secondary/20 cursor-pointer group/id"
                                        >
                                            <img src={user.idPreview} alt="ID Preview" className="w-full h-full object-cover transition-transform group-hover/id:scale-110" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/id:opacity-100 transition-opacity flex items-center justify-center">
                                                <Eye className="w-4 h-4 text-white" />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 text-center pr-4 md:pr-6">
                                        <div className="flex items-center justify-center gap-2">
                                            <button className="p-2.5 rounded-xl bg-red-500/10 text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm" title="Reject">
                                                <X className="w-4 h-4" />
                                            </button>
                                            <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-primary/20">
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
                     <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/50">Showing {pendingUsers.length} entries</span>
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
