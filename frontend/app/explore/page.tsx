"use client";

import { Header } from "../../components/header/Header";
import { Footer } from "../../components/sections/Footer";
import { ExploreHeader } from "../../components/explore/ExploreHeader";
import { ExploreSidebar } from "../../components/explore/ExploreSidebar";
import { ProductCard } from "../../components/explore/ProductCard";

export default function ExplorePage() {
    const products = [
        {
            title: "Macbook Air M1 (Silver) - 256GB/8GB",
            price: "450,000",
            category: "Laptops",
            rating: 4.8,
            image: "https://images.unsplash.com/photo-1517336713734-60284ed88272?auto=format&fit=crop&q=80&w=800",
            isUrgent: true,
            status: "Limited Edition",
            seller: "Victor (Hostel B)"
        },
        {
            title: "iPhone 13 Pro Max - Slightly Used",
            price: "680,000",
            category: "Phones",
            rating: 4.9,
            image: "https://images.unsplash.com/photo-1632661674596-df8be070a5c5?auto=format&fit=crop&q=80&w=800",
            seller: "Aisha (Medical Faculty)"
        },
        {
            title: "Large Study Table with Chair",
            price: "35,000",
            category: "Essentials",
            rating: 4.5,
            image: "https://images.unsplash.com/photo-1518455027359-f3f8139ca67e?auto=format&fit=crop&q=80&w=800",
            status: "Verified",
            seller: "Tobi (Off-Campus)"
        },
        {
            title: "Oxford Dictionary & Textbook Set",
            price: "12,000",
            category: "Education",
            rating: 4.7,
            image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=800",
            status: "New Arrival",
            seller: "Precious (Main Gate)"
        },
        {
            title: "Rechargeable Standing Fan",
            price: "45,000",
            category: "Electronics",
            rating: 4.2,
            image: "https://images.unsplash.com/photo-1601614013446-249ee4381fc0?auto=format&fit=crop&q=80&w=800",
            status: "Bestseller",
            seller: "David (Social Sci)"
        },
        {
            title: "Bluetooth Noise Cancelling Headset",
            price: "15,000",
            category: "Gadgets",
            rating: 4.6,
            image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800",
            isUrgent: true,
            seller: "Zainab (Hall 4)"
        }
    ];

    return (
        <main className="min-h-screen bg-background flex flex-col">
            <Header />

            <div className="flex-1 w-full py-6 flex flex-col items-center">
                <div className="w-full max-w-[1780px] px-4 md:px-12 flex flex-col lg:flex-row gap-8">

                    {/* Sidebar */}
                    <div className="lg:w-[220px] shrink-0">
                        <ExploreSidebar />
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 space-y-6">
                        <ExploreHeader />

                        <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
                            {products.map((product, index) => (
                                <ProductCard key={index} {...product} />
                            ))}
                        </div>

                        {/* Pagination or Load More could go here */}
                    </div>

                </div>
            </div>

            <Footer />
        </main>
    );
}
