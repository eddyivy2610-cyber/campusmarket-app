"use client";

import { ListingsToolbar } from "../components/manage-listings/ListingsToolbar";
import { ListingsTable } from "../components/manage-listings/ListingsTable";
import { BulkActionBar } from "../components/manage-listings/BulkActionBar";
import { useState, useEffect } from "react";
import { listingService } from "../lib/listingService";
import { Loader2 } from "lucide-react";

export default function ManageListingsPage() {
    const [listings, setListings] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedItems, setSelectedItems] = useState<number[]>([]);

    useEffect(() => {
        const fetchUserListings = async () => {
            try {
                setIsLoading(true);
                const res = await listingService.getUserListings();
                setListings(res.data || []);
            } catch (err) {
                console.error("[ManageListings] Failed to fetch listings", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserListings();
    }, []);

    return (
        <main className="min-h-screen bg-background text-foreground font-heading">

            <div className="max-w-[1780px] mx-auto px-4 md:px-8 py-8 md:py-12">
                <div className="flex flex-col gap-6">
                    <div>
                        <h1 className="text-2xl font-bold font-heading">Manage Listings</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Control your inventory, track performance, and boost your sales.
                        </p>
                    </div>

                    <ListingsToolbar
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                    />

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="w-10 h-10 animate-spin text-primary" />
                            <p className="text-sm text-muted-foreground animate-pulse">Loading your listings...</p>
                        </div>
                    ) : (
                        <ListingsTable
                            listings={listings}
                            selectedItems={selectedItems}
                            setSelectedItems={setSelectedItems}
                        />
                    )}
                </div>
            </div>

            <BulkActionBar
                selectedCount={selectedItems.length}
                onClearSelection={() => setSelectedItems([])}
            />
        </main>
    );
}
