"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ProductGallery } from "../../components/listings/ProductGallery";
import { ProductHeader } from "../../components/listings/ProductHeader";
import { RelatedProducts } from "../../components/listings/RelatedProducts";
import { Breadcrumb } from "../../components/common/Breadcrumb";
import { ChevronLeft, Loader2 } from "lucide-react";
import { listingService } from "../../lib/listingService";

export default function ListingPage() {
    const params = useParams();
    const router = useRouter();
    const [product, setProduct] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProduct = async () => {
            if (!params.id) return;
            try {
                setIsLoading(true);
                const res = await listingService.getListingById(params.id as string);
                setProduct(res.data);
                setError(null);
            } catch (err: any) {
                console.error("[ListingPage] Failed to fetch product", err);
                setError(err.message || "Failed to load listing");
            } finally {
                setIsLoading(false);
            }
        };

        fetchProduct();
    }, [params.id]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                    <p className="text-sm font-medium text-muted-foreground animate-pulse uppercase tracking-[0.2em]">Loading Listing...</p>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background">
                <div className="max-w-md w-full text-center space-y-6 p-6">
                    <h1 className="text-2xl font-bold uppercase tracking-tighter">Listing Not Found</h1>
                    <p className="text-muted-foreground text-sm">
                        The listing you're looking for might have been sold, removed, or doesn't exist.
                    </p>
                    <button 
                        onClick={() => router.push("/listings")} 
                        className="px-6 py-3 bg-primary text-primary-foreground rounded-full font-bold uppercase tracking-widest text-[10px] hover:bg-primary/90 transition-all shadow-lg"
                    >
                        Browse Other Listings
                    </button>
                </div>
            </div>
        );
    }

    // Map backend sellerId population to the vendor format expected by components
    const vendor = {
        id: product.sellerId?._id || product.sellerId,
        name: product.sellerId?.profile?.displayName || "Unknown Seller",
        avatar: product.sellerId?.profile?.avatar || "/placeholder-avatar.png",
        studentVerified: product.sellerId?.studentStatus?.isVerified || false,
    };

    // For now, we'll keep empty placeholders for related items 
    // until we have a recommended/similar API endpoint
    const vendorListings: any[] = [];
    const similarItems: any[] = [];

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <main className="flex-1">
                {/* Refined Breadcrumbs Bar */}
                <div className="bg-secondary/10 border-b border-border/50">
                    <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
                        <Breadcrumb
                            items={[
                                { label: "Listings", href: "/listings" },
                                { label: product.category, href: `/listings?category=${product.category}` },
                                { label: product.title }
                            ]}
                        />
                        <button
                            onClick={() => router.back()}
                            className="hidden md:flex items-center gap-2 group text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors"
                        >
                            <ChevronLeft className="w-3.5 h-3.5" />
                            Back to Feed
                        </button>
                    </div>
                </div>

                <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-8 space-y-12">

                    {/* Content Grid */}
                    <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 md:gap-12">
                        {/* Left Column: Media, Details, Related (Desktop) */}
                        <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-8 md:gap-12 order-1 lg:order-none">
                            <ProductGallery images={product.images || [product.image]} />

                            {/* Primary Purchase Panel (Mobile) */}
                            <div className="block lg:hidden">
                                <ProductHeader
                                    product={product}
                                    vendor={vendor}
                                />
                            </div>

                            {/* Related Products: Bottom on Mobile, Middle on Desktop */}
                            <div className="pt-8 md:pt-12 mt-8 md:mt-12 border-t border-border/40 order-3 lg:order-none">
                                <RelatedProducts
                                    vendorName={vendor.name}
                                    vendorListings={vendorListings}
                                    similarItems={similarItems}
                                />
                            </div>
                        </div>

                        {/* Right Column: Primary Purchase Panel */}
                        <div className="hidden lg:block lg:col-span-5 xl:col-span-4 space-y-6 lg:sticky lg:top-24 h-fit order-2 lg:order-none">
                            <ProductHeader
                                product={product}
                                vendor={vendor}
                            />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
