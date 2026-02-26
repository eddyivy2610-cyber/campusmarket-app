'use client';

import { Star, ShieldCheck, Mail, Calendar, Package, TrendingUp, Search, Filter, MoreHorizontal, User, Store } from 'lucide-react';
import StatusBadge from '@/components/admin/StatusBadge';
import { cn } from '@/lib/utils';
import React, { useState } from 'react';

const vendors = [
    {
        id: 1,
        name: 'Sarah Connor',
        email: 'sarah.c@university.edu',
        joined: '2023-09-15',
        status: 'Active',
        rating: 4.8,
        sales: 156,
        listings: 24,
        avatar: 'S',
        badge: 'Top Seller'
    },
    {
        id: 2,
        name: 'John Wick',
        email: 'john.w@campus.edu',
        joined: '2023-11-20',
        status: 'Active',
        rating: 4.9,
        sales: 89,
        listings: 12,
        avatar: 'J',
        badge: 'Verified'
    },
    {
        id: 3,
        name: 'Ellen Ripley',
        email: 'ripley.e@muni.edu',
        joined: '2024-01-10',
        status: 'Active',
        rating: 4.5,
        sales: 42,
        listings: 8,
        avatar: 'R',
        badge: 'Rising Star'
    }
];

export default function VendorsPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground uppercase">Campus Vendors</h1>
                    <p className="text-muted-foreground font-medium uppercase tracking-[0.2em] text-[9px]">Verified Marketplace Sellers: {vendors.length}</p>
                </div>
            </div>

            {/* Vendor Performance Grid */}
            <div className="bg-card border border-border/50 rounded-[24px] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-secondary/5 border-b border-border/50">
                                <th className="px-6 py-4 text-left text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50">Professional Profile</th>
                                <th className="px-6 py-4 text-left text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50">Reputation</th>
                                <th className="px-6 py-4 text-left text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50">Inventory</th>
                                <th className="px-6 py-4 text-left text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50">Performance</th>
                                <th className="px-6 py-4 text-right text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                            {vendors.map((vendor) => (
                                <tr key={vendor.id} className="group hover:bg-secondary/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-full bg-orange-600/10 border border-orange-600/20 flex items-center justify-center text-xs font-bold text-orange-600 shadow-inner">
                                                {vendor.avatar}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{vendor.name}</span>
                                                <span className="text-[9px] font-bold uppercase tracking-widest opacity-30">{vendor.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                                                <Star size={12} className="text-yellow-500 fill-yellow-500" />
                                                {vendor.rating}
                                            </div>
                                            <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 bg-blue-500/10 text-blue-600 rounded-md self-start">
                                                {vendor.badge}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-foreground/60">
                                                <Package size={12} className="opacity-40" />
                                                {vendor.listings} Active Listings
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-green-600">
                                                <TrendingUp size={12} />
                                                {vendor.sales} Total Sales
                                            </div>
                                            <span className="text-[9px] font-bold uppercase tracking-widest opacity-30">Joined {vendor.joined}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <button className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl transition-all" title="View Store">
                                                <Store size={15} />
                                            </button>
                                            <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-xl transition-all">
                                                <MoreHorizontal size={15} />
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
