"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PRODUCTS, Product } from "../../data/products";
import { PROFILES, Profile } from "../../data/profiles";
import { ProductGallery } from "../../components/listings/ProductGallery";
import { ProductHeader } from "../../components/listings/ProductHeader";
import { VendorOffer } from "../../components/listings/VendorOffer";
import { VendorMiniProfile } from "../../components/listings/VendorMiniProfile";
import { ProductDetails } from "../../components/listings/ProductDetails";
import { ProductReviews } from "../../components/listings/ProductReviews";
import { RelatedProducts } from "../../components/listings/RelatedProducts";
import { OfferModal } from "../../components/modals/OfferModal";
import { ReviewModal } from "../../components/modals/ReviewModal";
import { Header } from "../../components/header/Header";
import { Footer } from "../../components/sections/Footer";
import { Breadcrumb } from "../../components/common/Breadcrumb";
import { ChevronLeft, ShieldAlert, Flag } from "lucide-react";
import { ReportDropdown } from "../../components/common/ReportDropdown";

export default function ListingPage() {
    const params = useParams();
    const router = useRouter();
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

    const product = PRODUCTS.find((p: Product) => p.id === Number(params.id));
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

                    {/* Top Section: Gallery & Primary Context */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-16">
                        {/* Left: Gallery */}
                        <div className="lg:col-span-7">
                            <ProductGallery images={product.images} />
                        </div>

                        {/* Right: Actions & Vendor Hub */}
                        <div className="lg:col-span-5 space-y-6">
                            <ProductHeader
                                product={product}
                                onOfferOpen={() => router.push(`/chat?user=${vendor.id}&listing=${product.id}`)}
                            />

                            <VendorOffer offer={product.offer} />

                            <VendorMiniProfile vendor={vendor} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-12 border-t border-border/40">
                        <div className="lg:col-span-8 space-y-16">
                            {/* Details Grid & Description */}
                            <ProductDetails
                                description={product.description}
                                specs={product.specs}
                            />

                            {/* Reviews */}
                            <ProductReviews
                                recommendedCount={product.recommendedCount}
                                notRecommendedCount={product.notRecommendedCount}
                                reviews={product.reviews}
                                onWriteReview={() => setIsReviewModalOpen(true)}
                            />

                            {/* Related Products */}
                            <RelatedProducts
                                vendorName={vendor.name}
                                vendorListings={vendorListings}
                                similarItems={similarItems}
                            />
                        </div>

                        {/* Sidebar: Safety & Context */}
                        <div className="lg:col-span-4 lg:sticky lg:top-24 h-fit">
                            <div className="bg-secondary/15 border border-border/40 rounded-2xl p-6 space-y-5">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600">
                                        <ShieldAlert className="w-4 h-4" />
                                    </div>
                                    <h3 className="font-bold text-xs tracking-wider uppercase">Buyer Safety Guarantee</h3>
                                </div>

                                <ul className="space-y-3.5">
                                    {[
                                        "Exchange items in public campus areas",
                                        "Verify item condition before payment",
                                        "Use the secure in-app messaging",
                                        "Report suspicious listing behavior"
                                    ].map((tip, i) => (
                                        <li key={i} className="flex gap-3 group">
                                            <span className="text-primary font-bold mt-0.5 opacity-40">•</span>
                                            <p className="text-[11px] font-bold text-muted-foreground/70 leading-relaxed group-hover:text-foreground transition-colors">
                                                {tip}
                                            </p>
                                        </li>
                                    ))}
                                </ul>

                                <div className="pt-2">
                                    <ReportDropdown
                                        reportType="listing"
                                        targetId={product.id}
                                        triggerClassName="w-full h-11"
                                    >
                                        <div className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-red-500/10 text-red-500/60 font-bold rounded-xl hover:bg-red-500/5 hover:text-red-500 transition-all text-[9px] uppercase tracking-widest">
                                            <Flag className="w-3.5 h-3.5" />
                                            Report Suspicious Item
                                        </div>
                                    </ReportDropdown>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />

            {/* Modals */}
            <ReviewModal
                isOpen={isReviewModalOpen}
                onClose={() => setIsReviewModalOpen(false)}
                product={{ title: product.title, vendorName: vendor.name }}
            />
        </div>
    );
}
