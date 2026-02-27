"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PRODUCTS, Product } from "../../data/products";
import { PROFILES, Profile } from "../../data/profiles";
import { ProductGallery } from "../../components/listings/ProductGallery";
import { ProductHeader } from "../../components/listings/ProductHeader";
import { ProfessionalOffer } from "../../components/listings/ProfessionalOffer";
import { ListingActionBox } from "../../components/listings/ListingActionBox";
import { ProductDetails } from "../../components/listings/ProductDetails";
import { RelatedProducts } from "../../components/listings/RelatedProducts";
import { OfferModal } from "../../components/modals/OfferModal";
import { Header } from "../../components/header/Header";
import { Footer } from "../../components/sections/Footer";
import { Breadcrumb } from "../../components/common/Breadcrumb";
import { ChevronLeft } from "lucide-react";

export default function ListingPage() {
    const params = useParams();
    const router = useRouter();

    let product = PRODUCTS.find((p: Product) => p.id === Number(params.id));

    // Fallback for mocked grid items on the homepage (deal-1, best-2, explore-3)
    if (!product && typeof params.id === 'string' && (params.id.startsWith('deal-') || params.id.startsWith('best-') || params.id.startsWith('explore-'))) {
        product = PRODUCTS[0];
    }
    const vendor = PROFILES.find((p: Profile) => p.id === product?.sellerId);

    if (!product || !vendor) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <Header />
                <div className="flex-1 flex flex-col items-center justify-center p-4">
                    <h1 className="text-xl font-bold mb-4 uppercase tracking-tighter">Listing Not Found</h1>
                    <button onClick={() => router.back()} className="text-primary font-bold uppercase tracking-widest text-[10px]">Go Back</button>
                </div>
                <Footer />
            </div>
        );
    }

    // Mock related items
    const vendorListings = PRODUCTS.filter((p: Product) => p.sellerId === vendor.id && p.id !== product.id);
    const similarItems = PRODUCTS.filter((p: Product) => p.category === product.category && p.id !== product.id && p.sellerId !== vendor.id);

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />

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
                        <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-12 order-1 lg:order-none">
                            <ProductGallery images={product.images} />

                            <ProductDetails
                                description={product.description}
                                specs={product.specs}
                            />

                            {/* Related Products: Bottom on Mobile, Middle on Desktop */}
                            <div className="pt-8 md:pt-12 mt-8 md:mt-12 border-t border-border/40 order-3 lg:order-none">
                                <RelatedProducts
                                    vendorName={vendor.name}
                                    vendorListings={vendorListings}
                                    similarItems={similarItems}
                                />
                            </div>
                        </div>

                        {/* Right Column: Actions, Offer, Vendor, Safety */}
                        <div className="lg:col-span-5 xl:col-span-4 space-y-6 lg:sticky lg:top-24 h-fit order-2 lg:order-none">
                            <ProductHeader product={product} />

                            <ListingActionBox
                                product={product}
                                vendor={vendor}
                                onOfferOpen={() => router.push(`/chat?user=${vendor.id}&listing=${product.id}`)}
                            />

                            <ProfessionalOffer offer={product.offer} />
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
