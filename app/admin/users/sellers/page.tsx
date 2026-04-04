"use client";

import React, { useState } from 'react';
import AdminUserDetailsModal from '@/components/admin/AdminUserDetailsModal';
import { Star, Mail, Calendar, Package, TrendingUp, Store, Eye, MoreHorizontal } from 'lucide-react';

const vendors: any[] = [];

export default function VendorsPage() {
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
                    <h1 className="text-sm font-bold tracking-tight text-foreground uppercase px-2">Campus Sellers</h1>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 bg-secondary/20 px-3 py-1.5 rounded-lg">
                            Active Sellers: {vendors.length}
                        </span>
                    </div>
                </div>

                <div className="w-full overflow-x-auto custom-scrollbar pt-4 pb-2">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead>
                            <tr className="border-b border-border/50 text-[13px] font-semibold text-muted-foreground/70 tracking-wide uppercase">
                                <th className="pb-4 font-bold pl-4 md:pl-6 w-[25%]">Seller Profile</th>
                                <th className="pb-4 font-bold w-[20%]">Reputation</th>
                                <th className="pb-4 font-bold w-[20%]">Inventory</th>
                                <th className="pb-4 font-bold w-[20%]">Performance</th>
                                <th className="pb-4 text-center font-bold pr-4 md:pr-6 w-[15%]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {vendors.map((vendor) => (
                                <tr key={vendor.id} className="border-b border-border/40 hover:bg-secondary/20 transition-colors group">
                                    <td className="py-4 pl-4 md:pl-6">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center text-sm font-bold text-orange-600 border border-orange-500/20 shadow-inner">
                                                {vendor.avatar}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-foreground group-hover:text-primary transition-colors">{vendor.name}</span>
                                                <span className="text-[10px] font-bold uppercase tracking-widest opacity-30">{vendor.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                                                <Star size={12} className="text-yellow-500 fill-yellow-500" />
                                                {vendor.rating}
                                            </div>
                                            <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 bg-blue-500/10 text-blue-600 rounded-md self-start">
                                                {vendor.badge}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-4 font-medium text-foreground/80">
                                        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest">
                                            <Package size={14} className="opacity-40" />
                                            {vendor.listings} Listings
                                        </div>
                                    </td>
                                    <td className="py-4">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-emerald-600">
                                                <TrendingUp size={14} />
                                                {vendor.sales} Sales
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">
                                                <Calendar size={10} />
                                                Joined {vendor.joined}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 text-center pr-4 md:pr-6">
                                        <div className="flex items-center justify-center gap-2">
                                            <button 
                                                onClick={() => handleViewDetails(vendor)}
                                                className="p-2.5 rounded-xl bg-secondary/30 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all border border-transparent hover:border-primary/20" 
                                                title="View Profile"
                                            >
                                                <Eye size={15} />
                                            </button>
                                            <button className="p-2.5 rounded-xl bg-secondary/30 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all border border-transparent hover:border-primary/20" title="View Store">
                                                <Store size={15} />
                                            </button>
                                            <button className="p-2.5 rounded-xl bg-secondary/30 text-muted-foreground hover:text-foreground hover:bg-accent transition-all border border-transparent">
                                                <MoreHorizontal size={15} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 md:p-6 border-t border-border/40">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/50">Showing {vendors.length} entries</span>
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
