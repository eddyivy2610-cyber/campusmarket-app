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
                    <h1 className="text-2xl font-bold text-white">Manage Listings</h1>
                    <p className="text-gray-400 text-sm">Monitor and moderate marketplace listings.</p>
                </div>

                <div className="flex gap-3">
                    <div className="p-4 bg-[#121212] rounded-xl border border-white/5 flex flex-col items-center justify-center min-w-[120px]">
                        <span className="text-2xl font-bold text-white">12,402</span>
                        <span className="text-xs text-gray-500">Active Listings</span>
                    </div>
                    <div className="p-4 bg-[#121212] rounded-xl border border-white/5 flex flex-col items-center justify-center min-w-[120px]">
                        <span className="text-2xl font-bold text-white">87</span>
                        <span className="text-xs text-gray-500">Under Review</span>
                    </div>
                    <div className="p-4 bg-[#121212] rounded-xl border border-white/5 flex flex-col items-center justify-center min-w-[120px]">
                        <span className="text-2xl font-bold text-red-400">15</span>
                        <span className="text-xs text-gray-500">Newly Reported</span>
                    </div>
                </div>
            </div>

            <div className="bg-[#121212] rounded-xl border border-white/5 overflow-hidden">
                <div className="p-4 border-b border-white/5 flex flex-col sm:flex-row gap-4 justify-between">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                            type="text"
                            placeholder="Search by title, seller, or ID..."
                            className="w-full bg-black/20 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-sm text-gray-300 hover:text-white transition-colors">
                            <Filter size={16} />
                            Filter
                        </button>
                        <button className="flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400 hover:bg-red-500/20 transition-colors">
                            <Trash2 size={16} />
                            Remove Selected
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-400 uppercase bg-white/5">
                            <tr>
                                <th className="px-6 py-4 w-10">
                                    <input type="checkbox" className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500 bg-opacity-20" />
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
                                <tr key={listing.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <input type="checkbox" className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500 bg-opacity-20" />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded bg-gray-800 flex-shrink-0 border border-white/10"></div>
                                            <span className="font-medium text-white">{listing.title}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-400">{listing.seller}</td>
                                    <td className="px-6 py-4 text-gray-400">{listing.date}</td>
                                    <td className="px-6 py-4">
                                        <span className={`font-medium ${listing.reports > 0 ? 'text-red-400' : 'text-gray-500'}`}>
                                            {listing.reports}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={listing.status} />
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors" title="View">
                                                <Eye size={16} />
                                            </button>
                                            <button className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors" title="Remove">
                                                <Trash2 size={16} />
                                            </button>
                                            <button className="p-1.5 text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/10 rounded transition-colors" title="Hide">
                                                <EyeOff size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 border-t border-white/5 flex items-center justify-between text-sm text-gray-400">
                    <span>Showing 1 to {filteredListings.length} of {filteredListings.length} entries</span>
                    <div className="flex gap-2">
                        <button className="px-3 py-1 rounded border border-white/10 hover:bg-white/5 disabled:opacity-50">Previous</button>
                        <button className="px-3 py-1 rounded border border-white/10 hover:bg-white/5 disabled:opacity-50">Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
