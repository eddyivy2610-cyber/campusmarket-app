'use client';

import { Check, X, Eye, UserPlus, Mail, Calendar, MapPin, Building, Search, Filter } from 'lucide-react';
import StatusBadge from '@/components/admin/StatusBadge';
import { cn } from '@/lib/utils';
import React, { useState } from 'react';

const pendingUsers = [
    {
        id: 1,
        name: 'Michael Olusegun',
        email: 'michael.o@university.edu',
        date: '2024-02-23',
        type: 'Student',
        avatar: 'M',
        school: 'Engineering Dept',
        idPreview: 'https://images.unsplash.com/photo-1621243804936-775306a86c99?w=300&h=200&fit=crop'
    },
    {
        id: 2,
        name: 'Sarah Kimani',
        email: 'sarah.k@campus.edu',
        date: '2024-02-22',
        type: 'Vendor Candidate',
        avatar: 'S',
        school: 'Arts & Design',
        idPreview: 'https://images.unsplash.com/photo-1632333526746-618e9508273d?w=300&h=200&fit=crop'
    }
];

export default function PendingUsersPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground uppercase">Pending Approvals</h1>
                    <p className="text-muted-foreground font-medium uppercase tracking-[0.2em] text-[9px]">Verification Queue: {pendingUsers.length} Users Waiting</p>
                </div>

                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500 text-white hover:opacity-90 transition-all text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-green-500/20">
                        <Check size={14} />
                        Bulk Approve
                    </button>
                </div>
            </div>

            {/* Verification Queue Cards */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {pendingUsers.map((user) => (
                    <div key={user.id} className="bg-card border border-border/50 rounded-[24px] overflow-hidden shadow-sm flex flex-col md:flex-row">
                        {/* ID Side */}
                        <div className="w-full md:w-40 bg-secondary/20 relative group">
                            <img src={user.idPreview} alt="Student ID" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button className="p-2.5 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-all">
                                    <Eye size={18} />
                                </button>
                            </div>
                            <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[7px] font-bold uppercase text-white tracking-widest">
                                Identity Proof
                            </div>
                        </div>

                        {/* Info Side */}
                        <div className="flex-1 p-5 flex flex-col justify-between space-y-4">
                            <div className="space-y-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-full bg-blue-600/10 border border-blue-600/20 flex items-center justify-center text-xs font-bold text-blue-600">
                                            {user.avatar}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-base leading-tight">{user.name}</h3>
                                            <p className="text-[9px] font-bold uppercase tracking-widest text-primary">{user.type}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end opacity-40">
                                        <span className="text-[9px] font-bold uppercase tracking-widest">Submitted</span>
                                        <span className="text-[8px] font-semibold">{user.date}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <span className="block text-[8px] font-bold uppercase tracking-widest text-muted-foreground/50">Email Address</span>
                                        <span className="text-xs font-bold text-foreground/80 flex items-center gap-1.5">
                                            <Mail size={10} className="opacity-40" />
                                            {user.email}
                                        </span>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="block text-[8px] font-bold uppercase tracking-widest text-muted-foreground/50">Department / School</span>
                                        <span className="text-xs font-bold text-foreground/80 flex items-center gap-1.5">
                                            <Building size={10} className="opacity-40" />
                                            {user.school}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-2 flex items-center gap-2">
                                <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-secondary/10 hover:bg-red-500/10 hover:text-red-600 transition-all text-[9px] font-bold uppercase tracking-widest">
                                    <X size={14} />
                                    Reject
                                </button>
                                <button className="flex-[2] flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-all text-[9px] font-bold uppercase tracking-widest shadow-lg shadow-primary/20">
                                    <Check size={14} />
                                    Approve Account
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
