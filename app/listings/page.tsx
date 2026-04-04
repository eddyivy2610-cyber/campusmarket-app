"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState, useMemo, useEffect } from "react";
import { Breadcrumb } from "../components/common/Breadcrumb";
import { ShopSidebar } from "../components/shop/ShopSidebar";
import { ShopGrid } from "../components/shop/ShopGrid";
import { PRODUCTS, Product } from "../data/products";
import { Eye, Store, User, Loader2, Users } from "lucide-react";
import { searchProfiles } from "../lib/searchUtils";
import { ProfileSearchResult } from "../components/profile/ProfileSearchResult";
import type { Profile } from "../data/profiles";

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
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [isSearchingProfiles, setIsSearchingProfiles] = useState(false);

    useEffect(() => {
        if (categoryParam) {
            setSelectedCategories([categoryParam]);
        } else {
            setSelectedCategories([]);
        }
    }, [categoryParam]);

    // Fetch dynamic profiles from API
    useEffect(() => {
        const fetchProfiles = async () => {
            if (!qParam) {
                setProfiles([]);
                return;
            }
            try {
                setIsSearchingProfiles(true);
                const results = await searchProfiles(qParam);
                setProfiles(results);
            } catch (err) {
                console.error("[ShopPage] Profile search failed", err);
            } finally {
                setIsSearchingProfiles(false);
            }
        };

        fetchProfiles();
    }, [qParam]);

    const filteredProducts = useMemo(() => {
        return PRODUCTS.filter((product: Product) => {
            const matchesSearch = !qParam || product.title.toLowerCase().includes(qParam.toLowerCase()) || product.description.toLowerCase().includes(qParam.toLowerCase()) || product.tags.some(t => t.toLowerCase().includes(qParam.toLowerCase()));
            const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(product.category);
            const matchesPrice = product.price >= priceRange.min && product.price <= priceRange.max;
            return matchesSearch && matchesCategory && matchesPrice;
        });
    }, [qParam, selectedCategories, priceRange]);

    const inferredCategory = useMemo(() => {
        if (filteredProducts.length > 0) {
            return filteredProducts[0].category;
        }
        return null;
    }, [filteredProducts]);

    return (
        <main className="min-h-screen bg-background text-foreground font-heading">
            <div className="bg-secondary/10 border-b border-border/50">
                <div className="max-w-[1780px] mx-auto px-4 md:px-8 flex items-center justify-between">
                    <Breadcrumb
                        items={[
                            { label: "Search Results", href: "/listings" },
                            ...(qParam ? [{ label: `"${qParam}"` }] : [])
                        ]}
                    />

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

            <div className="max-w-[1780px] mx-auto px-4 md:px-8 py-10">
                <div className="mb-10 flex flex-col gap-2">
                    <h1 className="text-3xl md:text-4xl font-bold font-heading text-foreground">
                        {qParam ? `Results for "${qParam}"` : "All Listings"}
                    </h1>
                    <p className="text-sm text-muted-foreground font-body">
                        Found {filteredProducts.length} items {profiles.length > 0 && `& ${profiles.length} profiles`}
                    </p>
                </div>

                {/* Profiles Section (Dynamic from API) */}
                {qParam && (profiles.length > 0 || isSearchingProfiles) && (
                    <div className="mb-12">
                        <div className="flex items-center gap-3 mb-6">
                            <Users className="w-5 h-5 text-primary" />
                            <h2 className="text-xl font-bold font-heading uppercase tracking-wider">People & Vendors</h2>
                        </div>
                        
                        {isSearchingProfiles ? (
                            <div className="flex items-center gap-3 py-8 text-muted-foreground italic">
                                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                <span>Searching profiles...</span>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                {profiles.map(p => (
                                    <ProfileSearchResult key={p.id} profile={p} />
                                ))}
                            </div>
                        )}
                        <div className="mt-8 border-b border-border/40" />
                    </div>
                )}

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
        </main>
    );
}
