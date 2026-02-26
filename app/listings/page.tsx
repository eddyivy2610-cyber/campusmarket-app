"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState, useMemo, useEffect } from "react";
import { Header } from "../components/header/Header";
import { Footer } from "../components/sections/Footer";
import { Breadcrumb } from "../components/common/Breadcrumb";
import { ShopSidebar } from "../components/shop/ShopSidebar";
import { ShopGrid } from "../components/shop/ShopGrid";
import { PRODUCTS, Product } from "../data/products";
import { Eye, Store, User } from "lucide-react";

type ViewAs = "private" | "public";

export default function ShopPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
        }>
            <ShopPageInner />
        </Suspense>
    );
}

function ShopPageInner() {
    const searchParams = useSearchParams();
    const categoryParam = searchParams.get("category");

    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [priceRange, setPriceRange] = useState({ min: 0, max: Infinity });
    const [viewAs, setViewAs] = useState<ViewAs>("public");

    useEffect(() => {
        if (categoryParam) {
            setSelectedCategories([categoryParam]);
        } else {
            setSelectedCategories([]);
            setPriceRange({ min: 0, max: Infinity });
        }
    }, [categoryParam]);

    const filteredProducts = useMemo(() => {
        return PRODUCTS.filter((product: Product) => {
            const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(product.category);
            const matchesPrice = product.price >= priceRange.min && product.price <= priceRange.max;
            return matchesCategory && matchesPrice;
        });
    }, [selectedCategories, priceRange]);

    return (
        <main className="min-h-screen bg-background text-foreground font-heading selection:bg-primary/20">
            <Header />

            <div className="bg-secondary/10 border-b border-border/50">
                <div className="max-w-[1780px] mx-auto px-4 md:px-8 flex items-center justify-between">
                    <Breadcrumb
                        items={[
                            { label: "Listings", href: selectedCategories.length === 1 ? "/listings" : undefined },
                            ...(selectedCategories.length === 1 ? [{ label: selectedCategories[0] }] : [])
                        ]}
                    />

                    {/* View As Toggle */}
                    <div className="flex items-center gap-2 py-2">
                        <Eye className="w-3.5 h-3.5 text-muted-foreground/60" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 hidden sm:block">
                            View as
                        </span>
                        <div className="flex items-center bg-secondary/40 border border-border/40 rounded-full p-0.5 gap-0.5">
                            <button
                                onClick={() => setViewAs("private")}
                                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${viewAs === "private"
                                    ? "bg-background text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                <Store className="w-3 h-3" />
                                Private
                            </button>
                            <button
                                onClick={() => setViewAs("public")}
                                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${viewAs === "public"
                                    ? "bg-background text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                <User className="w-3 h-3" />
                                Public
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-[1780px] mx-auto px-4 md:px-8 py-8 md:py-12">
                <div className="flex flex-col lg:flex-row gap-8">
                    <ShopSidebar
                        selectedCategories={selectedCategories}
                        setSelectedCategories={setSelectedCategories}
                        setPriceRange={setPriceRange}
                    />
                    <ShopGrid
                        products={filteredProducts}
                        viewAs={viewAs}
                        selectedCategories={selectedCategories}
                        setSelectedCategories={setSelectedCategories}
                        setPriceRange={setPriceRange}
                    />
                </div>
            </div>

            <Footer />
        </main>
    );
}
