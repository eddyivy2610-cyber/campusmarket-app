'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Eye, EyeOff, Trash2, CheckCircle, MoreHorizontal, Package, AlertTriangle, ShieldCheck, Download, Trash, Tag, User } from 'lucide-react';
import StatusBadge from '@/components/admin/StatusBadge';
import { cn } from '@/lib/utils';
import { useSearchParams } from 'next/navigation';

const listingsData = [
    { id: 1, title: 'Vintage Leather Jacket', seller: 'AlexRider', date: '2023-10-26', reports: 5, status: 'Active', category: 'Fashion', price: '$85.00' },
    { id: 2, title: 'Rare Pokémon Card', seller: 'JennyP', date: '2023-10-26', reports: 12, status: 'Flagged', category: 'Collectibles', price: '$450.00' },
    { id: 3, title: 'Handmade Pottery Vase', seller: 'ArtisanClay', date: '2023-10-25', reports: 0, status: 'Active', category: 'Home', price: '$120.00' },
    { id: 4, title: 'Designer Sunglasses', seller: 'FashionFinds', date: '2023-10-25', reports: 21, status: 'Removed', category: 'Fashion', price: '$210.00' },
    { id: 5, title: 'Retro Gaming Console', seller: 'GamerGeek', date: '2023-10-24', reports: 2, status: 'Active', category: 'Electronics', price: '$190.00' },
    { id: 6, title: 'Calculus Textbook', seller: 'StudyBuddy', date: '2023-10-23', reports: 1, status: 'Pending', category: 'Education', price: '$65.00' },
];

export default function ListingsPage() {
    const searchParams = useSearchParams();
    const statusFilter = searchParams.get('status');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedItems, setSelectedItems] = useState<number[]>([]);

    const filteredListings = listingsData.filter(listing => {
        const matchesSearch = listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            listing.seller.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = !statusFilter || listing.status.toLowerCase() === statusFilter.toLowerCase();
        return matchesSearch && matchesStatus;
    });

    const toggleSelect = (id: number) => {
        setSelectedItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    return (
        <div className="space-y-6">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground uppercase">
                        {statusFilter ? `${statusFilter} Listings` : 'All Listings'}
                    </h1>
                    <p className="text-muted-foreground font-medium uppercase tracking-[0.2em] text-[8px]">
                        Catalog: {filteredListings.length} results matching criteria
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary/10 hover:bg-secondary/20 transition-all text-[10px] font-bold uppercase tracking-widest text-foreground/70">
                        <Download size={14} />
                        Report
                    </button>
                    {selectedItems.length > 0 && (
                        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500 text-white hover:opacity-90 transition-all text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-red-500/20">
                            <Trash size={14} />
                            Remove ({selectedItems.length})
                        </button>
                    )}
                </div>
            </div>

            {/* Metrics Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Total Active", value: "12,402", color: "text-green-500", icon: ShieldCheck },
                    { label: "Pending Review", value: "87", color: "text-orange-500", icon: Package },
                    { label: "Flagged Listings", value: "15", color: "text-red-500", icon: AlertTriangle },
                    { label: "Daily New", value: "+342", color: "text-blue-500", icon: Tag },
                ].map((stat) => (
                    <div key={stat.label} className="p-5 bg-card border border-border/50 rounded-[20px] flex items-center justify-between shadow-sm">
                        <div className="space-y-1">
                            <span className="block text-[8px] font-bold uppercase tracking-widest text-muted-foreground/60">{stat.label}</span>
                            <span className={cn("text-lg font-bold block", stat.color)}>{stat.value}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-secondary/10">
                            <stat.icon size={20} className={cn("opacity-40", stat.color)} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row gap-4 p-4 bg-card border border-border/50 rounded-[24px]">
                <div className="flex-1 relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-primary transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Filter by title, vendor, category..."
                        className="w-full pl-12 pr-4 py-2.5 bg-secondary/5 border-none rounded-xl text-sm font-semibold focus:ring-2 focus:ring-primary/20 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <select className="appearance-none pl-4 pr-10 py-2.5 bg-secondary/5 border-none rounded-xl text-[9px] font-bold uppercase tracking-widest cursor-pointer hover:bg-secondary/10 transition-all focus:ring-2 focus:ring-primary/20">
                            <option>All Categories</option>
                            <option>Electronics</option>
                            <option>Fashion</option>
                            <option>Education</option>
                        </select>
                        <Filter className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/30 pointer-events-none" size={12} />
                    </div>
                </div>
            </div>

            {/* Listings Table */}
            <div className="bg-card border border-border/50 rounded-[32px] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-secondary/5 border-b border-border/50">
                                <th className="px-6 py-5 w-10 text-center">
                                    <input
                                        type="checkbox"
                                        className="rounded-md border-border/50 bg-secondary/5 text-primary focus:ring-primary transition-all cursor-pointer"
                                        checked={selectedItems.length === filteredListings.length && filteredListings.length > 0}
                                        onChange={() => {
                                            if (selectedItems.length === filteredListings.length) {
                                                setSelectedItems([]);
                                            } else {
                                                setSelectedItems(filteredListings.map(l => l.id));
                                            }
                                        }}
                                    />
                                </th>
                                <th className="px-5 py-4 text-left text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50">Item Details</th>
                                <th className="px-5 py-4 text-left text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50">Vendor</th>
                                <th className="px-5 py-4 text-left text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50">Market Metrics</th>
                                <th className="px-5 py-4 text-left text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50">Status</th>
                                <th className="px-6 py-4 text-right text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                            {filteredListings.map((listing) => (
                                <tr key={listing.id} className={cn(
                                    "group transition-all duration-200",
                                    selectedItems.includes(listing.id) ? "bg-primary/[0.02]" : "hover:bg-secondary/5"
                                )}>
                                    <td className="px-6 py-6 text-center">
                                        <input
                                            type="checkbox"
                                            className="rounded-md border-border/50 bg-secondary/5 text-primary focus:ring-primary transition-all cursor-pointer"
                                            checked={selectedItems.includes(listing.id)}
                                            onChange={() => toggleSelect(listing.id)}
                                        />
                                    </td>
                                    <td className="px-5 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="h-11 w-11 rounded-xl bg-secondary/20 border border-border/20 flex-shrink-0 relative overflow-hidden group-hover:scale-105 transition-transform">
                                                <Package className="absolute inset-0 m-auto opacity-20" size={18} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors leading-tight">{listing.title}</span>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 bg-secondary/10 text-muted-foreground rounded-md">{listing.category}</span>
                                                    <span className="text-[10px] font-bold text-foreground/80">{listing.price}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="flex items-center gap-2 text-xs font-bold text-foreground/70">
                                            <div className="w-5 h-5 rounded-full bg-blue-600/10 flex items-center justify-center text-[8px] text-blue-600 border border-blue-600/10">
                                                {listing.seller.charAt(0)}
                                            </div>
                                            {listing.seller}
                                        </div>
                                    </td>
                                    <td className="px-5 py-5">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest">
                                                <AlertTriangle size={10} className={cn(listing.reports > 0 ? "text-red-500" : "opacity-20")} />
                                                {listing.reports} Reports
                                            </div>
                                            <div className="text-[8px] font-bold uppercase tracking-[0.2em] opacity-30">
                                                Listed {listing.date}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <StatusBadge status={listing.status} />
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl transition-all" title="View Details">
                                                <Eye size={16} />
                                            </button>
                                            <button className="p-2.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all" title="Remove Listing">
                                                <Trash2 size={16} />
                                            </button>
                                            <button className="p-2.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded-xl transition-all">
                                                <MoreHorizontal size={16} />
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
