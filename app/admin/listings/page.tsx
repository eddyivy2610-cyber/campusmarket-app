"use client";

import { useState, useEffect } from 'react';
import { 
    Eye, 
    Trash2, 
    Package, 
    AlertTriangle, 
    Calendar,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Search,
    Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import AdminListingDetailModal from '@/components/admin/AdminListingDetailModal';
import { listingService } from '@/lib/listingService';
import { toast } from 'sonner';

export default function AllListingsPage() {
    const [listings, setListings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedListing, setSelectedListing] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState<string>("");

    const fetchListings = async () => {
        try {
            setLoading(true);
            const response = await listingService.getAllAdminListings(filterStatus);
            if (response.success) {
                setListings(response.data);
            }
        } catch (error) {
            console.error("Fetch listings error:", error);
            toast.error("Failed to load listings");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchListings();
    }, [filterStatus]);

    const handleViewDetails = (listing: any) => {
        setSelectedListing(listing);
        setIsModalOpen(true);
    };

    const handleApprove = async (id: string) => {
        try {
            const response = await listingService.approveListing(id);
            if (response.success) {
                toast.success("Listing approved successfully");
                setIsModalOpen(false);
                fetchListings();
            }
        } catch (error) {
            toast.error("Failed to approve listing");
        }
    };

    const handleReject = async (id: string, reason: string) => {
        try {
            const response = await listingService.rejectListing(id, reason);
            if (response.success) {
                toast.success("Listing rejected");
                setIsModalOpen(false);
                fetchListings();
            }
        } catch (error) {
            toast.error("Failed to reject listing");
        }
    };

    const getStatusStyles = (status: string) => {
        switch (status?.toLowerCase()) {
            case "active":
                return "bg-emerald-500 text-white";
            case "pending":
                return "bg-amber-500 text-white";
            case "rejected":
                return "bg-rose-500 text-white";
            case "removed":
                return "bg-slate-400 text-white";
            default:
                return "bg-secondary text-muted-foreground";
        }
    };
    const getStatusDotClass = (status: string) => {
        switch (status?.toLowerCase()) {
            case "active":
                return "bg-emerald-500";
            case "pending":
                return "bg-amber-500";
            case "rejected":
                return "bg-rose-500";
            case "removed":
                return "bg-slate-400";
            default:
                return "bg-muted-foreground/40";
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
                        <div className="h-4 w-[1px] bg-border/40 hidden sm:block" />
                        <select 
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="bg-transparent text-[10px] font-bold uppercase tracking-widest text-foreground/60 focus:outline-none cursor-pointer hover:text-primary transition-colors"
                        >
                            <option value="">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="active">Active</option>
                            <option value="rejected">Rejected</option>
                            <option value="sold">Sold</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 border border-border/40 text-muted-foreground hover:bg-secondary/50 rounded-lg transition-all">
                            Export
                        </button>
                    </div>
                </div>

                <div className="md:hidden px-4 pt-4 pb-2 space-y-3">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Fetching Catalog...</p>
                        </div>
                    ) : listings.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                            <Package className="w-12 h-12 text-muted-foreground/20" />
                            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">No listings found</p>
                        </div>
                    ) : (
                        listings.map((listing) => {
                            const isOpen = expandedId === listing._id;
                            return (
                                <div key={listing._id} className="rounded-2xl border border-border/60 bg-background/70 shadow-sm overflow-hidden">
                                    <button
                                        onClick={() => setExpandedId(isOpen ? null : listing._id)}
                                        className="w-full flex items-center justify-between gap-3 px-4 py-3"
                                    >
                                        <div className="min-w-0 text-left">
                                            <p className="text-sm font-semibold text-foreground truncate">{listing.title}</p>
                                            <p className="text-[11px] text-muted-foreground">₦{listing.price.toLocaleString()}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`w-2.5 h-2.5 rounded-full ${getStatusDotClass(listing.status)}`} aria-hidden />
                                            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
                                        </div>
                                    </button>
                                    {isOpen && (
                                        <div className="px-4 pb-3">
                                            <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
                                                <div>
                                                    <p className="uppercase tracking-widest text-[9px]">Seller</p>
                                                    <p className="font-semibold text-foreground/80">{listing.sellerId?.profile?.displayName || "N/A"}</p>
                                                </div>
                                                <div>
                                                    <p className="uppercase tracking-widest text-[9px]">Status</p>
                                                    <p className="font-semibold text-foreground/80">{listing.status}</p>
                                                </div>
                                                <div>
                                                    <p className="uppercase tracking-widest text-[9px]">Category</p>
                                                    <p className="font-semibold text-foreground/80">{listing.category}</p>
                                                </div>
                                                <div>
                                                    <p className="uppercase tracking-widest text-[9px]">Date</p>
                                                    <p className="font-semibold text-foreground/80">{new Date(listing.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <div className="mt-3">
                                                <button
                                                    onClick={() => handleViewDetails(listing)}
                                                    className="w-full rounded-lg border border-border/60 px-3 py-2 text-[11px] font-semibold text-muted-foreground hover:bg-secondary"
                                                >
                                                    View Details
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

                <div className="w-full overflow-x-auto custom-scrollbar pt-4 pb-2 hidden md:block">
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
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Fetching Catalog...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : listings.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Package className="w-12 h-12 text-muted-foreground/20" />
                                            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">No listings found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                listings.map((listing) => (
                                    <tr key={listing._id} className="border-b border-border/40 hover:bg-secondary/20 transition-all group">
                                        <td className="py-5 pl-6">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-2xl bg-secondary/20 border border-border/20 flex-shrink-0 relative overflow-hidden group-hover:scale-105 transition-transform">
                                                    {listing.images?.[0] ? (
                                                        <img src={listing.images[0]} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Package className="absolute inset-0 m-auto opacity-20 text-foreground" size={20} />
                                                    )}
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
                                                    {(listing.sellerId?.profile?.displayName || "U").charAt(0)}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-foreground/80">{listing.sellerId?.profile?.displayName || "Unknown User"}</span>
                                                    <span className="text-[9px] font-bold uppercase tracking-widest opacity-30">Vendor Profile</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-5">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">
                                                    <Calendar size={11} />
                                                    {new Date(listing.createdAt).toLocaleDateString()}
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
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer Pagination */}
                <div className="p-4 md:p-6 border-t border-border/40 flex items-center justify-between bg-muted/5">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/50">
                        Showing {listings.length} units in catalog
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
                onApprove={handleApprove}
                onReject={handleReject}
            />
        </div>
    );
}
