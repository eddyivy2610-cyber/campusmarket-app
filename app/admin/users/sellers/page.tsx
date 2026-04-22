"use client";

import React, { useState, useEffect } from 'react';
import AdminUserDetailsModal from '@/components/admin/AdminUserDetailsModal';
import { Star, Mail, Calendar, Package, TrendingUp, Store, Eye, MoreHorizontal } from 'lucide-react';
import { apiGet } from '@/lib/apiClient';

export default function VendorsPage() {
    const [vendors, setVendors] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchSellers = async () => {
        setIsLoading(true);
        try {
            const response: any = await apiGet("users?role=seller");
            setVendors(response?.data || []);
        } catch (err) {
            console.error("Failed to fetch sellers", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSellers();
    }, []);

    const handleViewDetails = (user: any) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="w-full bg-white dark:bg-card rounded-[20px] shadow-sm flex flex-col overflow-hidden text-foreground">
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
                                <th className="pb-4 font-bold w-[20%]">Contact</th>
                                <th className="pb-4 font-bold w-[20%]">Status</th>
                                <th className="pb-4 font-bold w-[20%]">Performance</th>
                                <th className="pb-4 text-center font-bold pr-4 md:pr-6 w-[15%]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center text-muted-foreground">Loading sellers...</td>
                                </tr>
                            ) : vendors.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center text-muted-foreground">No sellers found.</td>
                                </tr>
                            ) : vendors.map((vendor) => (
                                <tr key={vendor._id} className="border-b border-border/40 hover:bg-secondary/20 transition-colors group">
                                    <td className="py-4 pl-4 md:pl-6">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center text-sm font-bold text-orange-600 border border-orange-500/20 shadow-inner">
                                                {vendor.profile?.displayName?.charAt(0) || vendor.email.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span 
                                                    onClick={() => handleViewDetails(vendor)}
                                                    className="font-bold text-foreground group-hover:text-primary transition-colors cursor-pointer truncate"
                                                >
                                                    {vendor.profile?.displayName || "Merchant"}
                                                </span>
                                                <span className="text-[10px] font-bold uppercase tracking-widest opacity-30 truncate">
                                                    {vendor.businessProfile?.category || "General Seller"}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4">
                                        <div className="flex flex-col gap-1 font-medium text-foreground/80 truncate">
                                            <div className="flex items-center gap-2 truncate">
                                                <Mail size={12} className="opacity-40" />
                                                {vendor.email}
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">
                                                <Calendar size={10} />
                                                Joined {vendor.createdAt ? new Date(vendor.createdAt).toLocaleDateString() : "N/A"}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 font-medium">
                                        <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 bg-emerald-500/10 text-emerald-600 rounded-md">
                                            Verified
                                        </span>
                                    </td>
                                    <td className="py-4">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-foreground">
                                                <Package size={14} className="opacity-40" />
                                                0 Listings
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">
                                                <TrendingUp size={14} className="opacity-40" />
                                                0 Sales
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
