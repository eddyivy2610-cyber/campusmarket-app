"use client";

import { useState, useMemo } from "react";
import { Header } from "../components/header/Header";
import { Footer } from "../components/sections/Footer";
import { Breadcrumb } from "../components/common/Breadcrumb";
import { ShopSidebar } from "../components/shop/ShopSidebar";
import { ShopGrid } from "../components/shop/ShopGrid";
import { PRODUCTS } from "../data/products";

export default function ShopPage() {
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [priceRange, setPriceRange] = useState({ min: 0, max: Infinity });

    const filteredProducts = useMemo(() => {
        return PRODUCTS.filter(product => {
            // Category Filter
            const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(product.category);

            // Price Filter
            const matchesPrice = product.price >= priceRange.min && product.price <= priceRange.max;

            return matchesCategory && matchesPrice;
        });
    }, [selectedCategories, priceRange]);

    return (
        <main className="min-h-screen bg-background text-foreground selection:bg-primary/20">
            <Header />

            <div className="bg-secondary/10 border-b border-border/50">
                <div className="max-w-[1780px] mx-auto px-4 md:px-8">
                    <Breadcrumb
                        items={[
                            { label: "Listings", href: "/listings" },
                            { label: "All Products" }
                        ]}
                    />
                </div>
            </div>

            <div className="max-w-[1780px] mx-auto px-4 md:px-8 py-8 md:py-12">
                <div className="flex flex-col lg:flex-row gap-8">
                    <ShopSidebar
                        selectedCategories={selectedCategories}
                        setSelectedCategories={setSelectedCategories}
                        setPriceRange={setPriceRange}
                    />
                    <ShopGrid products={filteredProducts} />
                </div>
            </div>

            <Footer />
        </main>
    );
}
