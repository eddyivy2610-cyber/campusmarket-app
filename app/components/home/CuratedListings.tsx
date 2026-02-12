"use client";

import { ArrowRight, Zap, Sparkles } from "lucide-react";
import { ProductCard } from "../explore/ProductCard";
import Link from "next/link";

// Mock Data (reusing similar structure to ProductCard props)
const featuredProducts = [
    {
        id: "1",
        title: "MacBook Air M1 - Silver",
        price: "₦450,000",
        image: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&q=80&w=500",
        condition: "Like New",
        location: "Engineering Faculty",
        sellerName: "Sarah J",
        isVerified: true,
        category: "Electronics",
        rating: 4.8
    },
    {
        id: "2",
        title: "Ikea Desk Lamp",
        price: "₦12,000",
        image: "https://images.unsplash.com/photo-1534349762913-96c871302410?auto=format&fit=crop&q=80&w=500",
        condition: "Used",
        location: "Male Hostel",
        sellerName: "David K",
        isVerified: false,
        category: "Home",
        rating: 4.5
    },
    {
        id: "3",
        title: "Sony WH-1000XM4",
        price: "₦180,000",
        image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=500",
        condition: "New",
        location: "Main Gate",
        sellerName: "Tech Hub",
        isVerified: true,
        category: "Electronics",
        rating: 4.9
    },
    {
        id: "4",
        title: "Calculus Early Transcendentals",
        price: "₦8,000",
        image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=500",
        condition: "Used",
        location: "Library",
        sellerName: "James O",
        isVerified: true,
        category: "Books",
        rating: 4.2
    }
];

export function CuratedListings() {
    return (
        <section className="py-8 px-4 md:px-8 max-w-[1780px] mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <div className="bg-primary/10 p-2 rounded-full">
                        <Sparkles className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-foreground leading-none">Fresh on Campus</h2>
                        <p className="text-sm text-gray-500 font-medium">Recently listed items near you</p>
                    </div>
                </div>

                <Link
                    href="/explore"
                    className="flex items-center gap-1 text-sm font-bold text-primary hover:underline group"
                >
                    View All
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {featuredProducts.map(product => (
                    <ProductCard key={product.id} {...product} />
                ))}
            </div>

            {/* Banner / CTA */}
            <div className="mt-8 bg-secondary/30 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                    <div className="bg-primary p-3 rounded-xl shadow-lg shadow-primary/20 shrink-0">
                        <Zap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-foreground">Have something to sell?</h3>
                        <p className="text-sm text-gray-500 max-w-md">
                            Post your item in 30 seconds and reach thousands of students on campus. It's free!
                        </p>
                    </div>
                </div>
                <Link
                    href="/sell"
                    className="bg-foreground text-background px-6 py-3 rounded-full font-bold text-sm hover:opacity-90 transition-opacity whitespace-nowrap"
                >
                    Start Selling Now
                </Link>
            </div>
        </section>
    );
}
