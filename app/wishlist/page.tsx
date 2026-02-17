"use client";

import { Header } from "../components/header/Header";
import { Footer } from "../components/sections/Footer";
import { Breadcrumb } from "../components/common/Breadcrumb";
import { Heart, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useWishlist } from "../context/WishlistContext";
import { ProductCard } from "../components/shop/ProductCard";

export default function WishlistPage() {
    const { wishlist } = useWishlist();
    return (
        <main className="min-h-screen bg-background text-foreground overflow-x-hidden">
            <Header />

            <div className="container mx-auto px-4 py-8 max-w-7xl">
                {/* Breadcrumb */}
                <div className="mb-8">
                    <Breadcrumb items={[{ label: "Wishlist", href: "/wishlist" }]} />
                </div>

                {/* Content */}
                {wishlist.length === 0 ? (
                    /* Empty Wishlist State */
                    <div className="flex flex-col items-center justify-center py-16 md:py-24">
                        <div className="relative mb-8">
                            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-secondary border border-border flex items-center justify-center">
                                <Heart className="w-16 h-16 md:w-20 md:h-20 text-gray-400" strokeWidth={1.5} />
                            </div>
                            {/* Decorative element */}
                            <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary/20 rounded-full animate-pulse"></div>
                        </div>

                        <h2 className="text-2xl md:text-3xl font-bold font-heading text-center mb-3">
                            Your wishlist is currently empty
                        </h2>
                        <p className="text-gray-400 text-center mb-8 max-w-md mx-auto">
                            You don't have any products in the list yet. You will find a lot of interesting products when you explore our market.
                        </p>

                        <Link
                            href="/listings"
                            className="bg-primary text-white font-bold py-3 px-8 rounded-full shadow-lg shadow-primary/20 hover:bg-orange-600 hover:scale-105 transition-all duration-300 flex items-center gap-2"
                        >
                            Return to listings
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                ) : (
                    /* Grid of Wishlist Items */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {wishlist.map((item) => (
                            <div key={item.id} className="relative">
                                <ProductCard product={{
                                    id: item.id,
                                    title: item.title,
                                    price: typeof item.price === 'string' ? parseFloat(item.price.replace(/[^0-9.]/g, '')) : item.price,
                                    image: item.image,
                                    category: item.category,
                                    rating: item.rating || 5, // Default if missing
                                    location: item.location,
                                    sellerId: item.sellerId
                                }} />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Footer />
        </main>
    );
}
