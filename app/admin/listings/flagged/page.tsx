"use client";

import { useState } from 'react';
import { 
    Eye, 
    Trash2, 
    AlertTriangle, 
    Package, 
    ChevronLeft, 
    ChevronRight,
    Flag,
    ShieldAlert,
    MessageCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import AdminListingDetailModal from '@/components/admin/AdminListingDetailModal';

const flaggedListings = [
    { id: 1, title: 'Vintage Leather Jacket', seller: 'CampusHive', date: '26 Oct, 2023', reports: 5, status: 'Flagged', category: 'Fashion', price: 1000, reason: "Multiple copyright reports" },
    { id: 2, title: 'Organic Chemistry Textbook', seller: 'Michael O.', date: '25 Oct, 2023', reports: 2, status: 'Flagged', category: 'Books', price: 8500, reason: "Price manipulation suspect" },
];

export default function FlaggedListingsPage() {
    const [selectedListing, setSelectedListing] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleViewDetails = (listing: any) => {
        setSelectedListing(listing);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6">

            {/* Flagged Table Container */}
            <div className="w-full bg-white dark:bg-card rounded-[24px] shadow-sm flex flex-col overflow-hidden border border-border/40">
                <div className="p-4 flex w-full flex-col sm:flex-row items-center justify-between gap-4 border-b border-border/40 bg-rose-50/50 dark:bg-rose-500/5">
                    <h2 className="text-[11px] font-bold tracking-widest text-rose-500 uppercase px-2">High Priority Flags</h2>
                    <button className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-all shadow-sm">
                        Bulk Moderation
                    </button>
                </div>

                <div className="w-full overflow-x-auto custom-scrollbar pt-4 pb-2">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead>
                            <tr className="border-b border-border/50 text-[11px] font-bold text-muted-foreground/50 tracking-widest uppercase">
                                <th className="pb-4 pl-6 w-[30%] font-bold uppercase tracking-widest text-[10px] text-muted-foreground/50">Item Details</th>
                                <th className="pb-4 w-[20%] font-bold uppercase tracking-widest text-[10px] text-muted-foreground/50">Violation / Reason</th>
                                <th className="pb-4 w-[15%] font-bold uppercase tracking-widest text-[10px] text-muted-foreground/50">Reports</th>
                                <th className="pb-4 w-[15%] font-bold uppercase tracking-widest text-[10px] text-muted-foreground/50">Vendor</th>
                                <th className="pb-4 text-center pr-6 w-[20%] font-bold uppercase tracking-widest text-[10px] text-muted-foreground/50">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {flaggedListings.map((listing) => (
                                <tr key={listing.id} className="border-b border-border/40 hover:bg-rose-500/[0.02] transition-all group">
                                    <td className="py-5 pl-6">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-2xl bg-rose-500/5 border border-rose-500/10 flex-shrink-0 relative overflow-hidden group-hover:scale-105 transition-transform">
                                                <Package className="absolute inset-0 m-auto opacity-20 text-rose-500" size={20} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span 
                                                    onClick={() => handleViewDetails(listing)}
                                                    className="font-bold text-foreground group-hover:text-rose-500 transition-colors cursor-pointer leading-tight mb-1"
                                                >
                                                    {listing.title}
                                                </span>
                                                <span className="text-[10px] font-bold text-foreground/60 tracking-tight">₦{listing.price.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-5">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs font-bold text-rose-600/80">{listing.reason}</span>
                                            <span className="text-[9px] font-bold uppercase tracking-widest opacity-30">Flagged {listing.date}</span>
                                        </div>
                                    </td>
                                    <td className="py-5">
                                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-rose-500">
                                            <AlertTriangle size={14} />
                                            {listing.reports} Reports
                                        </div>
                                    </td>
                                    <td className="py-5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 rounded-full bg-blue-600/10 flex items-center justify-center text-[8px] font-bold text-blue-600 border border-blue-600/10">
                                                {listing.seller.charAt(0)}
                                            </div>
                                            <span className="text-xs font-bold text-foreground/70">{listing.seller}</span>
                                        </div>
                                    </td>
                                    <td className="py-5 text-center pr-6">
                                        <div className="flex items-center justify-center gap-2">
                                            <button 
                                                onClick={() => handleViewDetails(listing)}
                                                className="p-2.5 rounded-xl bg-secondary/30 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all border border-transparent hover:border-primary/20"
                                            >
                                                <Eye size={15} />
                                            </button>
                                            <button className="p-2.5 rounded-xl bg-orange-500/10 text-orange-600 hover:bg-orange-600 hover:text-white transition-all border border-orange-500/10" title="Contact Vendor">
                                                <MessageCircle size={15} />
                                            </button>
                                            <button className="p-2.5 rounded-xl bg-rose-500/10 text-rose-600 hover:bg-rose-600 hover:text-white transition-all border border-rose-500/10" title="Remove Listing">
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 md:p-6 border-t border-border/40 flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/50">
                        {flaggedListings.length} items flagged for violation
                    </span>
                    <div className="flex items-center gap-2">
                        <button className="p-2 rounded-xl border border-border/50 bg-secondary/5 text-muted-foreground hover:bg-secondary/20 transition-all disabled:opacity-30" disabled>
                            <ChevronLeft size={16} />
                        </button>
                        <button className="w-8 h-8 rounded-xl bg-rose-500 text-white text-[11px] font-bold shadow-lg shadow-rose-500/20">1</button>
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
