'use client';

import { useState } from 'react';
import { Search, Filter, Eye, EyeOff, Trash2, CheckCircle, MoreHorizontal } from 'lucide-react';
import StatusBadge from '@/components/admin/StatusBadge';

const listingsData = [
    { id: 1, title: 'Vintage Leather Jacket', seller: 'AlexRider', date: '2023-10-26', reports: 5, status: 'Active', image: '/api/placeholder/40/40' },
    { id: 2, title: 'Rare Pokémon Card', seller: 'JennyP', date: '2023-10-26', reports: 12, status: 'Under Review', image: '/api/placeholder/40/40' },
    { id: 3, title: 'Handmade Pottery Vase', seller: 'ArtisanClay', date: '2023-10-25', reports: 0, status: 'Active', image: '/api/placeholder/40/40' },
    { id: 4, title: 'Designer Sunglasses', seller: 'FashionFinds', date: '2023-10-25', reports: 21, status: 'Removed', image: '/api/placeholder/40/40' },
    { id: 5, title: 'Retro Gaming Console', seller: 'GamerGeek', date: '2023-10-24', reports: 2, status: 'Active', image: '/api/placeholder/40/40' },
    { id: 6, title: 'Calculus Textbook', seller: 'StudyBuddy', date: '2023-10-23', reports: 1, status: 'Active', image: '/api/placeholder/40/40' },
];

export default function ListingsPage() {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredListings = listingsData.filter(listing =>
        listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.seller.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Manage Listings</h1>
                    <p className="text-muted-foreground text-sm">Monitor and moderate marketplace listings.</p>
                </div>

                <div className="flex gap-3">
                    <div className="p-4 bg-card rounded-xl border border-border flex flex-col items-center justify-center min-w-[120px]">
                        <span className="text-2xl font-bold text-foreground">12,402</span>
                        <span className="text-xs text-muted-foreground">Active Listings</span>
                    </div>
                    <div className="p-4 bg-card rounded-xl border border-border flex flex-col items-center justify-center min-w-[120px]">
                        <span className="text-2xl font-bold text-foreground">87</span>
                        <span className="text-xs text-muted-foreground">Under Review</span>
                    </div>
                    <div className="p-4 bg-card rounded-xl border border-border flex flex-col items-center justify-center min-w-[120px]">
                        <span className="text-2xl font-bold text-red-500">15</span>
                        <span className="text-xs text-muted-foreground">Newly Reported</span>
                    </div>
                </div>
            </div>

            <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-4 justify-between">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <input
                            type="text"
                            placeholder="Search by title, seller, or ID..."
                            className="w-full bg-background border border-input rounded-lg pl-10 pr-4 py-2 text-sm text-foreground focus:outline-none focus:border-blue-500/50"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-3 py-2 bg-background border border-input rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                            <Filter size={16} />
                            Filter
                        </button>
                        <button className="flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-500 hover:bg-red-500/20 transition-colors">
                            <Trash2 size={16} />
                            Remove Selected
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                            <tr>
                                <th className="px-6 py-4 w-10">
                                    <input type="checkbox" className="rounded border-border bg-background text-blue-600 focus:ring-blue-500" />
                                </th>
                                <th className="px-6 py-4">Listing</th>
                                <th className="px-6 py-4">Seller</th>
                                <th className="px-6 py-4">Date Posted</th>
                                <th className="px-6 py-4">Reports</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredListings.map((listing) => (
                                <tr key={listing.id} className="border-b border-border hover:bg-accent/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <input type="checkbox" className="rounded border-border bg-background text-blue-600 focus:ring-blue-500" />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded bg-muted flex-shrink-0 border border-border"></div>
                                            <span className="font-medium text-foreground">{listing.title}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground">{listing.seller}</td>
                                    <td className="px-6 py-4 text-muted-foreground">{listing.date}</td>
                                    <td className="px-6 py-4">
                                        <span className={`font-medium ${listing.reports > 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
                                            {listing.reports}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={listing.status} />
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded transition-colors" title="View">
                                                <Eye size={16} />
                                            </button>
                                            <button className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded transition-colors" title="Remove">
                                                <Trash2 size={16} />
                                            </button>
                                            <button className="p-1.5 text-muted-foreground hover:text-yellow-500 hover:bg-yellow-500/10 rounded transition-colors" title="Hide">
                                                <EyeOff size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 border-t border-border flex items-center justify-between text-sm text-muted-foreground">
                    <span>Showing 1 to {filteredListings.length} of {filteredListings.length} entries</span>
                    <div className="flex gap-2">
                        <button className="px-3 py-1 rounded border border-border hover:bg-accent disabled:opacity-50">Previous</button>
                        <button className="px-3 py-1 rounded border border-border hover:bg-accent disabled:opacity-50">Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
};
