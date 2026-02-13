import { Heart, Repeat, Search, ShoppingCart, Star, MapPin, MessageCircle } from "lucide-react";
import Image from "next/image";
import { Tooltip } from "../shared/Tooltip";
import { useState } from "react";
import { QuickViewModal } from "./QuickViewModal";
import Link from "next/link";

interface ProductCardProps {
    title: string;
    price: string;
    category: string;
    rating: number;
    image: string;
    status?: string;
    seller?: string;
    isUrgent?: boolean;
    location?: string;
}

export function ProductCard({ title, price, category, rating, image, status, seller, isUrgent, location = "Campus" }: ProductCardProps) {
    const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

    return (
        <>
            <div className="group bg-background border border-border rounded-2xl p-3 hover:shadow-lg transition-all duration-300 flex flex-col h-full relative">
                {/* Image Container */}
                <div className="relative aspect-square rounded-xl overflow-hidden bg-secondary mb-3">
                    <Image
                        src={image}
                        alt={title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />

                    {/* Status Tags */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                        {isUrgent && (
                            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-sm animate-pulse">
                                URGENT
                            </span>
                        )}
                    </div>

                    {/* Quick Actions Overlay (Cart, Wishlist, QuickView) */}
                    <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button className="w-8 h-8 rounded-full bg-white/90 text-gray-600 hover:text-primary flex items-center justify-center shadow-sm backdrop-blur-sm transition-colors">
                            <ShoppingCart className="w-4 h-4" />
                        </button>
                        <button className="w-8 h-8 rounded-full bg-white/90 text-gray-600 hover:text-red-500 flex items-center justify-center shadow-sm backdrop-blur-sm transition-colors">
                            <Heart className="w-4 h-4" />
                        </button>
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setIsQuickViewOpen(true);
                            }}
                            className="w-8 h-8 rounded-full bg-white/90 text-gray-600 hover:text-primary flex items-center justify-center shadow-sm backdrop-blur-sm transition-colors"
                        >
                            <Search className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col gap-1">
                    {/* Title */}
                    <h3 className="text-sm font-bold text-foreground line-clamp-2 leading-tight" title={title}>
                        {title}
                    </h3>

                    {/* Price & Condition */}
                    <div className="flex items-center flex-wrap gap-2 mt-0.5">
                        <span className="text-lg font-black text-primary">₦{price}</span>
                        {status && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-secondary text-gray-600 border border-border">
                                {status}
                            </span>
                        )}
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-1.5 text-gray-500 text-xs mt-1">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{location}</span>
                    </div>

                    {/* Seller */}
                    {seller && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1 mb-2">
                            <div className="w-4 h-4 rounded-full bg-secondary border border-border flex items-center justify-center text-[8px] font-bold">
                                {seller.charAt(0)}
                            </div>
                            <span className="truncate">{seller}</span>
                        </div>
                    )}

                    {/* Primary Action */}
                    <Link
                        href="/inbox/1"
                        className="mt-auto w-full py-2.5 bg-foreground text-background rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all shadow-sm"
                    >
                        <MessageCircle className="w-4 h-4" />
                        Message Seller
                    </Link>
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
