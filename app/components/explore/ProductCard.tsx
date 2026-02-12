"use client";

import { Heart, Repeat, Search, ShoppingCart, Star } from "lucide-react";
import Image from "next/image";
import { Tooltip } from "../shared/Tooltip";
import { useState } from "react";
import { QuickViewModal } from "./QuickViewModal";

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
    const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

    return (
        <>
            <div className="group bg-secondary rounded-xl p-1.5 transition-all duration-500 relative flex flex-col h-full shadow-md hover:shadow-xl hover:-translate-y-1">
                {/* Image Container */}
                <div className="relative aspect-square rounded-lg overflow-hidden bg-white/5 mb-2">
                    <Image
                        src={image}
                        alt={title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />

                    {/* Status Tags */}
                    <div className="absolute top-1.5 left-1.5 flex flex-col gap-1">
                        {isUrgent && (
                            <span className="bg-red-500 text-white text-[7px] font-black px-1.5 py-0.5 rounded shadow-lg animate-pulse">
                                URGENT
                            </span>
                        )}
                        {status && (
                            <span className="bg-primary text-white text-[7px] font-black px-1.5 py-0.5 rounded shadow-lg">
                                {status.toUpperCase()}
                            </span>
                        )}
                    </div>

                    {/* Quick Actions Overlay */}
                    <div className="absolute top-1.5 -right-10 group-hover:right-1.5 transition-all duration-300 flex flex-col gap-1">
                        <Tooltip content="Add to wishlist" position="left" bgClass="bg-primary">
                            <button className="w-6 h-6 rounded-full bg-secondary/80 backdrop-blur-md border border-white/10 flex items-center justify-center text-gray-500 hover:text-primary transition-all">
                                <Heart className="w-3 h-3" />
                            </button>
                        </Tooltip>
                        <Tooltip content="Compare" position="left" bgClass="bg-primary">
                            <button className="w-6 h-6 rounded-full bg-secondary/80 backdrop-blur-md border border-white/10 flex items-center justify-center text-gray-500 hover:text-primary transition-all">
                                <Repeat className="w-3 h-3" />
                            </button>
                        </Tooltip>
                        <Tooltip content="Quick view" position="left" bgClass="bg-primary">
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setIsQuickViewOpen(true);
                                }}
                                className="w-6 h-6 rounded-full bg-secondary/80 backdrop-blur-md border border-white/10 flex items-center justify-center text-gray-500 hover:text-primary transition-all"
                            >
                                <Search className="w-3 h-3" />
                            </button>
                        </Tooltip>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col px-1">
                    <div className="flex items-center justify-between mb-0.5">
                        <span className="text-primary text-[8px] font-black uppercase tracking-widest truncate max-w-[60%]">{category}</span>
                        <div className="flex items-center gap-0.5">
                            <Star className="w-2 h-2 fill-yellow-500 text-yellow-500" />
                            <span className="text-[9px] font-black text-gray-500">{rating}</span>
                        </div>
                    </div>

                    <h3 className="text-foreground font-black text-[10px] mb-1 leading-tight line-clamp-2 group-hover:text-primary transition-colors uppercase tracking-tight h-6">
                        {title}
                    </h3>

                    {seller && (
                        <p className="text-gray-600 text-[8px] mb-2 font-bold uppercase tracking-wide truncate">By <span className="text-gray-500">{seller}</span></p>
                    )}

                    <div className="mt-auto pt-1 flex items-center justify-between border-t border-black/5 dark:border-white/5">
                        <span className="text-xs font-black text-foreground">
                            ₦{price}
                        </span>
                        <button className="w-6 h-6 rounded-md bg-primary text-white flex items-center justify-center hover:bg-orange-600 transition-all shadow-md active:scale-95">
                            <ShoppingCart className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            </div>

            <QuickViewModal
                isOpen={isQuickViewOpen}
                onClose={() => setIsQuickViewOpen(false)}
                product={{ title, price, category, rating, image, status, seller, isUrgent }}
            />
        </>
    );
}
