"use client";
import { Product } from "../../data/products";
import { ListingRow } from "./ListingRow";
import { CheckSquare } from "lucide-react";
import { useState } from "react";
import { ListingShareModal } from "./ListingShareModal";

interface ListingsTableProps {
    listings: Product[];
    selectedItems: number[];
    setSelectedItems: (items: number[] | ((prev: number[]) => number[])) => void;
}

export function ListingsTable({ listings, selectedItems, setSelectedItems }: ListingsTableProps) {
    const [shareListing, setShareListing] = useState<Product | null>(null);

    const handleSelectAll = () => {
        if (selectedItems.length === listings.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(listings.map(l => l.id));
        }
    };

    const handleSelectRow = (id: number) => {
        setSelectedItems(prev =>
            prev.includes(id)
                ? prev.filter(itemId => itemId !== id)
                : [...prev, id]
        );
    };

    return (
        <div className="w-full bg-background border border-border/50 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 bg-secondary/20 border-b border-border/50">
                        <tr>
                            <th scope="col" className="p-4 w-12 text-center">
                                <button
                                    onClick={handleSelectAll}
                                    className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedItems.length === listings.length && listings.length > 0
                                        ? "bg-primary border-primary text-primary-foreground"
                                        : "border-border hover:border-primary/50 text-transparent"
                                        }`}
                                >
                                    <CheckSquare className="w-3.5 h-3.5" />
                                </button>
                            </th>
                            <th scope="col" className="px-6 py-4">Listing Details</th>
                            <th scope="col" className="px-6 py-4">Price / Stock</th>
                            <th scope="col" className="px-6 py-4">Status</th>
                            <th scope="col" className="px-6 py-4">Performance</th>
                            <th scope="col" className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                        {listings.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                                    No listings found matching your criteria.
                                </td>
                            </tr>
                        ) : (
                            listings.map(listing => (
                                <ListingRow
                                    key={listing.id}
                                    listing={listing}
                                    isSelected={selectedItems.includes(listing.id)}
                                    onSelect={() => handleSelectRow(listing.id)}
                                    onViewShare={() => setShareListing(listing)}
                                />
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {shareListing && (
                <ListingShareModal
                    listing={shareListing}
                    onClose={() => setShareListing(null)}
                />
            )}
        </div>
    );
}
