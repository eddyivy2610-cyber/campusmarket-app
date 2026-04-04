"use client";

import React, { useState } from 'react';
import { 
    Check, 
    X, 
    Eye, 
    Clock, 
    AlertTriangle, 
    Package, 
    ChevronLeft, 
    ChevronRight,
    CheckCircle2,
    ShoppingBag
} from 'lucide-react';
import { cn } from '@/lib/utils';
import AdminListingDetailModal from '@/components/admin/AdminListingDetailModal';

const pendingListings: any[] = [];

export default function NewListingsPage() {
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [selectedListing, setSelectedListing] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const toggleSelect = (id: number) => {
        setSelectedItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleViewDetails = (listing: any) => {
        setSelectedListing(listing);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6">

            {/* Table Container */}
            <div className="w-full bg-white dark:bg-card rounded-[24px] shadow-sm flex flex-col overflow-hidden border border-border/40">
                <div className="p-4 flex w-full flex-col sm:flex-row items-center justify-between gap-4 border-b border-border/40 bg-emerald-50/50 dark:bg-emerald-500/5">
                    <div className="flex items-center gap-4">
                        <h2 className="text-[11px] font-bold tracking-widest text-emerald-600 uppercase px-2">Verification Queue</h2>
                        {selectedItems.length > 0 && (
                            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-200">
                                <div className="w-px h-4 bg-emerald-500/20 mx-1" />
                                <button className="text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all shadow-sm">
                                    Approve Selected ({selectedItems.length})
                                </button>
                                <button className="text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-all shadow-sm">
                                    Reject
                                </button>
                            </div>
                        )}
                    </div>
                    <button className="text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 border border-emerald-500/20 text-emerald-600 hover:bg-emerald-500/5 rounded-lg transition-all">
                        Approve All
                    </button>
                </div>

                <div className="w-full overflow-x-auto custom-scrollbar pt-4 pb-2">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead>
                            <tr className="border-b border-border/50 text-[11px] font-bold text-muted-foreground/50 tracking-widest uppercase">
                                <th className="pb-4 pl-6 w-[5%] font-bold text-[10px] uppercase tracking-widest text-muted-foreground/50">
                                     <input 
                                        type="checkbox" 
                                        className="rounded border-border/50 bg-secondary/10 text-primary w-4 h-4" 
                                        checked={selectedItems.length === pendingListings.length}
                                        onChange={() => setSelectedItems(selectedItems.length === pendingListings.length ? [] : pendingListings.map(l => l.id))}
                                    />
                                </th>
                                <th className="pb-4 w-[35%] font-bold text-[10px] uppercase tracking-widest text-muted-foreground/50">Listing Details</th>
                                <th className="pb-4 w-[20%] font-bold text-[10px] uppercase tracking-widest text-muted-foreground/50">Vendor</th>
                                <th className="pb-4 w-[15%] font-bold text-[10px] uppercase tracking-widest text-muted-foreground/50">Submitted</th>
                                <th className="pb-4 text-center pr-6 w-[25%] font-bold text-[10px] uppercase tracking-widest text-muted-foreground/50">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {pendingListings.map((listing) => (
                                <tr key={listing.id} className={cn(
                                    "border-b border-border/40 hover:bg-secondary/20 transition-all group",
                                    selectedItems.includes(listing.id) && "bg-primary/[0.03]"
                                )}>
                                    <td className="py-5 pl-6">
                                        <input 
                                            type="checkbox" 
                                            className="rounded border-border/50 bg-secondary/10 text-primary w-4 h-4" 
                                            checked={selectedItems.includes(listing.id)}
                                            onChange={() => toggleSelect(listing.id)}
                                        />
                                    </td>
                                    <td className="py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-2xl bg-secondary/20 border border-border/20 flex-shrink-0 relative overflow-hidden group-hover:scale-105 transition-transform">
                                                <Package className="absolute inset-0 m-auto opacity-20 text-foreground" size={20} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span 
                                                    onClick={() => handleViewDetails(listing)}
                                                    className="font-bold text-foreground group-hover:text-emerald-600 transition-colors cursor-pointer leading-tight mb-1"
                                                >
                                                    {listing.title}
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 bg-primary/5 text-primary rounded-md">
                                                        {listing.category}
                                                    </span>
                                                    <span className="text-[10px] font-black text-foreground/60 tracking-tight">₦{listing.price.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-5">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-foreground/80">{listing.seller}</span>
                                            <span className="text-[9px] font-bold uppercase tracking-widest opacity-30">Vendor Profile</span>
                                        </div>
                                    </td>
                                    <td className="py-5">
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">
                                            <Clock size={12} />
                                            {listing.time}
                                        </div>
                                    </td>
                                    <td className="py-5 text-center pr-6">
                                        <div className="flex items-center justify-center gap-2">
                                            <button 
                                                onClick={() => handleViewDetails(listing)}
                                                className="text-[9px] font-black uppercase tracking-widest px-4 py-2 border border-border/40 hover:border-primary hover:text-primary rounded-lg transition-all"
                                            >
                                                Review
                                            </button>
                                            <button className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all">
                                                <Check size={14} />
                                            </button>
                                            <button className="p-2 rounded-lg bg-rose-500/10 text-rose-600 hover:bg-rose-600 hover:text-white transition-all">
                                                <X size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 border-t border-border/40 flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/50">
                        {pendingListings.length} items awaiting review
                    </span>
                    <div className="flex items-center gap-2">
                        <button className="p-2 rounded-xl border border-border/50 bg-secondary/5 text-muted-foreground hover:bg-secondary/20 transition-all disabled:opacity-30" disabled>
                            <ChevronLeft size={16} />
                        </button>
                        <button className="w-8 h-8 rounded-xl bg-emerald-500 text-white text-[11px] font-bold shadow-lg shadow-emerald-500/20">1</button>
                        <button className="p-2 rounded-xl border border-border/50 bg-secondary/5 text-muted-foreground hover:bg-secondary/20 transition-all disabled:opacity-30" disabled>
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal */}
            <AdminListingDetailModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                listing={selectedListing}
            />
        </div>
    );
}
