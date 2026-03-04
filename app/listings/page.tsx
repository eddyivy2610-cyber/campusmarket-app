"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState, useMemo, useEffect } from "react";
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
    const qParam = searchParams.get("q");
    const categoryParam = searchParams.get("category");

    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [priceRange, setPriceRange] = useState({ min: 0, max: Infinity });
    const [viewAs, setViewAs] = useState<ViewAs>("public");

    useEffect(() => {
        if (categoryParam) {
            setSelectedCategories([categoryParam]);
        } else {
            setSelectedCategories([]);
        }
    }, [categoryParam]);

    const filteredProducts = useMemo(() => {
        return PRODUCTS.filter((product: Product) => {
            const matchesSearch = !qParam || product.title.toLowerCase().includes(qParam.toLowerCase()) || product.description.toLowerCase().includes(qParam.toLowerCase()) || product.tags.some(t => t.toLowerCase().includes(qParam.toLowerCase()));
            const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(product.category);
            const matchesPrice = product.price >= priceRange.min && product.price <= priceRange.max;
            return matchesSearch && matchesCategory && matchesPrice;
        });
    }, [qParam, selectedCategories, priceRange]);

    // Infer category purely from search results
    const inferredCategory = useMemo(() => {
        if (filteredProducts.length > 0) {
            return filteredProducts[0].category;
        }
        return null; // Don't show dynamic filters if no results
    }, [filteredProducts]);

    return (
        <main className="min-h-screen bg-background text-foreground font-heading selection:bg-primary/20">

            <div className="bg-secondary/10 border-b border-border/50">
                <div className="max-w-[1780px] mx-auto px-4 md:px-8 flex items-center justify-between">
                    <Breadcrumb
                        items={[
                            { label: "Search Results", href: "/listings" },
                            ...(qParam ? [{ label: `"${qParam}"` }] : [])
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

            <div className="max-w-[1780px] mx-auto px-4 md:px-8 py-6 md:py-10">
                <div className="mb-6 flex flex-col gap-2">
                    <h1 className="text-2xl md:text-3xl font-bold font-heading text-foreground">
                        {qParam ? `Results for "${qParam}"` : "All Search Results"}
                    </h1>
                    <p className="text-sm text-muted-foreground font-body">
                        Showing {filteredProducts.length} items
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    <ShopSidebar
                        selectedCategories={selectedCategories}
                        setSelectedCategories={setSelectedCategories}
                        setPriceRange={setPriceRange}
                        hideCategoriesList={true}
                        forcedCategory={inferredCategory}
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
