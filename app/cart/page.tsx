"use client";

import { Header } from "../components/header/Header";
import { Footer } from "../components/sections/Footer";
import { ProductCard } from "../components/explore/ProductCard";
import { ShoppingBasket, Home, ChevronRight, Heart, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function CartPage() {
    // Mock data for recommendations
    const recommendedProducts = [
        {
            id: 1,
            title: "Sony WH-1000XM5",
            price: "250,000",
            category: "Electronics",
            rating: 4.8,
            image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=2588&auto=format&fit=crop",
            status: "Verified",
            seller: "TechHub Store",
            isUrgent: true,
        },
        {
            id: 2,
            title: "Calculus Early Transcendentals",
            price: "15,000",
            category: "Books",
            rating: 4.5,
            image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=2574&auto=format&fit=crop",
            seller: "Sarah Johnson",
        },
        {
            id: 3,
            title: "Ikea Study Desk",
            price: "45,000",
            category: "Furniture",
            rating: 4.2,
            image: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?q=80&w=2535&auto=format&fit=crop",
            status: "New",
            seller: "Furniture Plus",
        },
        {
            id: 4,
            title: "Apple iPad Air 5",
            price: "450,000",
            category: "Electronics",
            rating: 4.9,
            image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=2615&auto=format&fit=crop",
            status: "Verified",
            seller: "Campus Tech",
        },
    ];

    return (
        <main className="min-h-screen bg-background text-foreground overflow-x-hidden">
            <Header />

            <div className="container mx-auto px-4 py-8 max-w-7xl">
                {/* Breadcrumb */}
                {/* Breadcrumb */}
                <div className="flex flex-col gap-4 mb-8">
                    <div className="flex items-center gap-2 text-sm font-bold tracking-widest uppercase">
                        <Link href="/" className="text-primary hover:text-orange-600 transition-colors flex items-center gap-1">
                            <Home className="w-4 h-4 mb-0.5" />
                            <span>Home</span>
                        </Link>
                        <ChevronRight className="w-4 h-4 text-gray-300" />
                        <span className="text-primary">Cart</span>
                    </div>
                </div>

                {/* Empty Cart State */}
                <div className="flex flex-col items-center justify-center py-16 md:py-24">
                    <div className="relative mb-8">
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-secondary border border-white/5 flex items-center justify-center">
                            <ShoppingBasket className="w-16 h-16 md:w-20 md:h-20 text-gray-400" strokeWidth={1.5} />
                        </div>
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary/20 rounded-full animate-pulse"></div>
                    </div>

                    <h2 className="text-2xl md:text-3xl font-bold font-sans text-center mb-3">
                        Looks like your cart is empty!
                    </h2>
                    <p className="text-gray-400 text-center mb-8">
                        Time to start your shopping
                    </p>

                    <Link
                        href="/explore"
                        className="bg-primary text-white font-bold py-3 px-8 rounded-full shadow-lg shadow-primary/20 hover:bg-orange-600 hover:scale-105 transition-all duration-300 flex items-center gap-2"
                    >
                       Visit Market
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {/* You may be interested in... */}
                <div className="mt-12 md:mt-16">
                    <div className="bg-primary text-white py-3 px-6 rounded-t-2xl inline-block">
                        <h3 className="font-bold font-sans">You may be interested in ...</h3>
                    </div>
                    <div className="w-full h-1 bg-primary mb-8 rounded-r-full opacity-50"></div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                        {recommendedProducts.map((product) => (
                            <div key={product.id} className="h-full">
                                <ProductCard
                                    title={product.title}
                                    price={product.price}
                                    category={product.category}
                                    rating={product.rating}
                                    image={product.image}
                                    status={product.status}
                                    seller={product.seller}
                                    isUrgent={product.isUrgent}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
