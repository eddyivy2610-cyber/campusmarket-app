"use client";

import { useState } from 'react';
import { 
    Eye, 
    Trash2, 
    MoreHorizontal, 
    Package, 
    AlertTriangle, 
    Download,
    Calendar,
    Tag,
    User,
    ChevronLeft,
    ChevronRight,
    Search
} from 'lucide-react';
import { cn } from '@/lib/utils';
import AdminListingDetailModal from '@/components/admin/AdminListingDetailModal';

const listingsData = [
    { id: 1, title: 'Vintage Leather Jacket', seller: 'CampusHive', date: '26 Oct, 2023', reports: 5, status: 'Active', category: 'Fashion', price: 1000 },
    { id: 2, title: 'MacBook Pro 2021', seller: 'John Doe', date: '27 Oct, 2023', reports: 0, status: 'Active', category: 'Electronics', price: 450000 },
    { id: 3, title: 'Organic Chemistry Textbook', seller: 'Michael O.', date: '25 Oct, 2023', reports: 2, status: 'Flagged', category: 'Books', price: 8500 },
    { id: 4, title: 'iPhone 12 - 128GB', seller: 'Sarah K.', date: '24 Oct, 2023', reports: 0, status: 'Active', category: 'Electronics', price: 320000 },
];

export default function AllListingsPage() {
    const [selectedListing, setSelectedListing] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleViewDetails = (listing: any) => {
        setSelectedListing(listing);
        setIsModalOpen(true);
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case "Active":
                return "bg-emerald-500 text-white";
            case "Pending":
                return "bg-amber-500 text-white";
            case "Flagged":
                return "bg-rose-500 text-white";
            case "Removed":
                return "bg-slate-400 text-white";
            default:
                return "bg-secondary text-muted-foreground";
        }
    };

    return (
        <div className="space-y-6">

            {/* Listings Table Container */}
            <div className="w-full bg-white dark:bg-card rounded-[24px] shadow-sm flex flex-col overflow-hidden border border-border/40">
                {/* Custom Header Bar */}
                <div className="p-4 flex w-full flex-col sm:flex-row items-center justify-between gap-4 border-b border-border/40 bg-muted/10">
                    <div className="flex items-center gap-4">
                        <h2 className="text-[11px] font-bold tracking-widest text-foreground/60 uppercase px-2">Catalog Items</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 border border-border/40 text-muted-foreground hover:bg-secondary/50 rounded-lg transition-all">
                            Export
                        </button>
                    </div>
                </div>

                <div className="w-full overflow-x-auto custom-scrollbar pt-4 pb-2">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead>
                            <tr className="border-b border-border/50 text-[11px] font-bold text-muted-foreground/50 tracking-widest uppercase">
                                <th className="pb-4 pl-6 w-[30%] font-bold uppercase tracking-widest text-[10px] text-muted-foreground/50">Item Details</th>
                                <th className="pb-4 w-[20%] font-bold uppercase tracking-widest text-[10px] text-muted-foreground/50">Vendor</th>
                                <th className="pb-4 w-[20%] font-bold uppercase tracking-widest text-[10px] text-muted-foreground/50">Market Data</th>
                                <th className="pb-4 w-[15%] font-bold uppercase tracking-widest text-[10px] text-muted-foreground/50">Status</th>
                                <th className="pb-4 text-center pr-6 w-[15%] font-bold uppercase tracking-widest text-[10px] text-muted-foreground/50">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {listingsData.map((listing) => (
                                <tr key={listing.id} className="border-b border-border/40 hover:bg-secondary/20 transition-all group">
                                    <td className="py-5 pl-6">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-2xl bg-secondary/20 border border-border/20 flex-shrink-0 relative overflow-hidden group-hover:scale-105 transition-transform">
                                                <Package className="absolute inset-0 m-auto opacity-20 text-foreground" size={20} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span 
                                                    onClick={() => handleViewDetails(listing)}
                                                    className="font-bold text-foreground group-hover:text-primary transition-colors cursor-pointer leading-tight mb-1"
                                                >
                                                    {listing.title}
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 bg-primary/5 text-primary rounded-md">
                                                        {listing.category}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-foreground/60 tracking-tight">₦{listing.price.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-5">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-6 h-6 rounded-full bg-blue-600/10 flex items-center justify-center text-[9px] font-bold text-blue-600 border border-blue-600/10 shadow-inner">
                                                {listing.seller.charAt(0)}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-foreground/80">{listing.seller}</span>
                                                <span className="text-[9px] font-bold uppercase tracking-widest opacity-30">Vendor Profile</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-5">
                                        <div className="flex flex-col gap-1.5">
                                            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                                                <AlertTriangle size={12} className={cn(listing.reports > 0 ? "text-rose-500" : "opacity-20")} />
                                                <span className={cn(listing.reports > 0 ? "text-rose-500" : "text-muted-foreground/40")}>
                                                    {listing.reports} Reports
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">
                                                <Calendar size={11} />
                                                {listing.date}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-5">
                                        <span className={cn(
                                            "inline-flex items-center px-4 py-1.5 text-[10px] font-black rounded-full uppercase tracking-widest",
                                            getStatusStyles(listing.status)
                                        )}>
                                            {listing.status}
                                        </span>
                                    </td>
                                    <td className="py-5 text-center pr-6">
                                        <button 
                                            onClick={() => handleViewDetails(listing)}
                                            className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/60 hover:text-primary transition-all hover:bg-primary/5 px-5 py-2.5 rounded-xl whitespace-nowrap border border-border/40 group-hover:border-primary/20 shadow-sm"
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer Pagination */}
                <div className="p-4 md:p-6 border-t border-border/40 flex items-center justify-between bg-muted/5">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/50">
                        Showing {listingsData.length} units in catalog
                    </span>
                    <div className="flex items-center gap-2">
                        <button className="p-2 rounded-xl border border-border/50 bg-secondary/5 text-muted-foreground hover:bg-secondary/20 transition-all">
                            <ChevronLeft size={16} />
                        </button>
                        <button className="w-8 h-8 rounded-xl bg-primary text-primary-foreground text-[11px] font-bold shadow-lg shadow-primary/20">1</button>
                        <button className="p-2 rounded-xl border border-border/50 bg-secondary/5 text-muted-foreground hover:bg-secondary/20 transition-all">
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
