"use client";

import { Heart, Repeat, Search, ShoppingCart, Star } from "lucide-react";
import Image from "next/image";

interface ProductCardProps {
    title: string;
    price: string;
    category: string;
    rating: number;
    image: string;
    status?: string;
    seller?: string;
    isUrgent?: boolean;
}

export function ProductCard({ title, price, category, rating, image, status, seller, isUrgent }: ProductCardProps) {
    return (
        <div className="group bg-secondary border border-white/5 rounded-xl p-2 hover:border-primary/30 transition-all duration-500 relative flex flex-col h-full shadow-lg">
            {/* Image Container */}
            <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-white/5 mb-3">
                <Image
                    src={image}
                    alt={title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                />

                {/* Status Tags */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {isUrgent && (
                        <span className="bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow-lg animate-pulse">
                            URGENT
                        </span>
                    )}
                    {status && (
                        <span className="bg-primary text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow-lg">
                            {status.toUpperCase()}
                        </span>
                    )}
                </div>

                {/* Quick Actions Overlay */}
                <div className="absolute top-2 -right-10 group-hover:right-2 transition-all duration-300 flex flex-col gap-1">
                    <button className="w-7 h-7 rounded-full bg-secondary/80 backdrop-blur-md border border-white/10 flex items-center justify-center text-gray-500 hover:text-primary transition-all">
                        <Heart className="w-3.5 h-3.5" />
                    </button>
                    <button className="w-7 h-7 rounded-full bg-secondary/80 backdrop-blur-md border border-white/10 flex items-center justify-center text-gray-500 hover:text-primary transition-all">
                        <Repeat className="w-3.5 h-3.5" />
                    </button>
                    <button className="w-7 h-7 rounded-full bg-secondary/80 backdrop-blur-md border border-white/10 flex items-center justify-center text-gray-500 hover:text-primary transition-all">
                        <Search className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col px-0.5">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-primary text-[9px] font-black uppercase tracking-widest">{category}</span>
                    <div className="flex items-center gap-0.5">
                        <Star className="w-2 h-2 fill-yellow-500 text-yellow-500" />
                        <span className="text-[9px] font-black text-gray-500">{rating}</span>
                    </div>
                </div>

                <h3 className="text-foreground font-black text-[11px] mb-1.5 line-clamp-2 leading-tight group-hover:text-primary transition-colors uppercase tracking-tight">
                    {title}
                </h3>

                {seller && (
                    <p className="text-gray-600 text-[9px] mb-3 font-bold uppercase tracking-wide">By <span className="text-gray-500">{seller}</span></p>
                )}

                <div className="mt-auto pt-2 flex items-center justify-between border-t border-white/5">
                    <span className="text-sm font-black text-foreground">
                        ₦{price}
                    </span>
                    <button className="w-7 h-7 rounded-lg bg-primary text-white flex items-center justify-center hover:bg-orange-600 transition-all shadow-lg active:scale-95">
                        <ShoppingCart className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
