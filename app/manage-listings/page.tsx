"use client";

import { MainHeader } from "../components/header/MainHeader";
import { Footer } from "../components/sections/Footer";
import { ListingsToolbar } from "../components/manage-listings/ListingsToolbar";
import { ListingsTable } from "../components/manage-listings/ListingsTable";
import { BulkActionBar } from "../components/manage-listings/BulkActionBar";
import { useState } from "react";
import { PRODUCTS, Product } from "../data/products";

export default function ManageListingsPage() {
    // In a real app, this would filter by the logged-in vendor's ID.
    const [listings, setListings] = useState<Product[]>(PRODUCTS);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedItems, setSelectedItems] = useState<number[]>([]);

    return (
        <main className="min-h-screen bg-background text-foreground">
            <MainHeader />

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

                    <ListingsTable
                        listings={listings}
                        selectedItems={selectedItems}
                        setSelectedItems={setSelectedItems}
                    />
                </div>
            </div>

            <BulkActionBar
                selectedCount={selectedItems.length}
                onClearSelection={() => setSelectedItems([])}
            />

            <Footer />
        </main>
    );
}
