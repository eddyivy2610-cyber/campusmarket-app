import React, { useState } from "react";
import { Tooltip } from "../shared/Tooltip";
import {
    Heart, Star, Eye, MapPin,
    Edit3, Trash2, Tag, MoreHorizontal
} from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useSaved } from "../../context/SavedContext";
import { QuickViewModal } from "../modals/QuickViewModal";
import Link from "next/link";

interface ProductProps {
    id: number;
    title: string;
    price: number | string;
    image: string;
    category: string;
    recommendedCount: number;
    notRecommendedCount: number;
    location?: string;
    status?: string;
    seller?: string;
    sellerId: string;
    isUrgent?: boolean;
    originalPrice?: number | string;
}

export function ProductCard({ product, isOwner = false, viewAs = "public" }: { product: ProductProps; isOwner?: boolean; viewAs?: "private" | "public" }) {
    const effectiveIsOwner = viewAs === "private" ? true : isOwner;
    const { toggleSaved, isSaved } = useSaved();
    const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

    const formatPrice = (price: number | string) => {
        const numPrice = typeof price === "string" ? parseFloat(price.replace(/,/g, "")) : price;
        return isNaN(numPrice) ? price : numPrice.toLocaleString();
    };

    const handleEdit = (e: React.MouseEvent) => { e.preventDefault(); };
    const handleDelete = (e: React.MouseEvent) => { e.preventDefault(); };
    const handleToggleStatus = (e: React.MouseEvent) => { e.preventDefault(); };
    const handleMoreActions = (e: React.MouseEvent) => { e.preventDefault(); };

    return (
        <motion.div
            whileHover={{ y: -3 }}
            className={`group relative bg-transparent overflow-hidden transition-all duration-300 h-full flex flex-col`}
        >
            {/* Overlay Link for the whole card */}
            <Link
                href={`/listings/${product.id}`}
                className="absolute inset-0 z-0"
                aria-label={`View details for ${product.title}`}
            />

            {/* Image */}
            <div className="aspect-square bg-secondary/30 relative overflow-hidden pointer-events-none rounded-2xl w-full">
                <Image
                    src={product.image}
                    alt={product.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Status badges */}
                <div className="absolute top-1.5 left-1.5 flex flex-col gap-1 z-10">
                    {product.isUrgent && (
                        <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-sm animate-pulse">URGENT</span>
                    )}
                    {product.status === "sold" && (
                        <span className="bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-sm">SOLD</span>
                    )}
                </div>
            </div>

            {/* Interactive Overlays (QuickView & Save) - Must be above z-0 link */}
            {!effectiveIsOwner && (
                <>
                    <div className="absolute top-0 right-0 left-0 aspect-square pointer-events-none z-10 rounded-2xl overflow-hidden">
                        {/* Quick view overlay */}
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsQuickViewOpen(true); }}
                                className="bg-card text-foreground px-4 py-2 rounded-full font-bold text-[10px] uppercase tracking-wider shadow-lg transform translate-y-3 group-hover:translate-y-0 transition-transform duration-300 hover:bg-primary hover:text-white flex items-center gap-1.5 pointer-events-auto"
                            >
                                <Eye className="w-3 h-3" />
                                Quick View
                            </motion.button>
                        </div>

                        {/* Save button */}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    toggleSaved({
                                        id: product.id,
                                        title: product.title,
                                        price: product.price,
                                        image: product.image,
                                        category: product.category,
                                        recommendedCount: product.recommendedCount,
                                        notRecommendedCount: product.notRecommendedCount,
                                        location: product.location,
                                        sellerId: product.sellerId
                                    });
                                }}
                                className={`h-7 w-7 rounded-full flex items-center justify-center shadow-md transition-colors pointer-events-auto ${isSaved(product.id) ? "bg-red-50 text-red-500" : "bg-card text-foreground hover:bg-primary hover:text-white"}`}
                            >
                                <Heart className={`w-3.5 h-3.5 ${isSaved(product.id) ? "fill-current" : ""}`} />
                            </motion.button>
                        </div>
                    </div>
                </>
            )}

            {/* Content — completely transparent, close-knit text */}
            <div className="pt-2 pb-1 flex-1 flex flex-col relative z-2 pointer-events-none bg-transparent">
                <h3 className="font-heading font-medium text-[13px] md:text-sm text-foreground/90 leading-snug line-clamp-2 group-hover:text-primary transition-colors flex-1" title={product.title}>
                    {product.title}
                </h3>

                <div className="flex items-end gap-1.5 mt-1.5">
                    <span className="font-price font-bold text-sm md:text-base text-foreground">
                        ₦{formatPrice(product.price)}
                    </span>
                    {product.originalPrice && (
                        <span className="text-[10px] md:text-xs text-muted-foreground line-through font-medium mb-0.5">
                            ₦{formatPrice(product.originalPrice)}
                        </span>
                    )}
                </div>

                <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-muted-foreground font-medium bg-secondary/50 px-1 py-0.5 rounded-sm">
                            {product.category}
                        </span>
                        <Tooltip content={`${product.recommendedCount} Recommended`}>
                            <div className="flex items-center gap-0.5 text-emerald-600 font-bold">
                                <span className="text-[10px]">{product.recommendedCount}</span>
                                <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </Tooltip>
                    </div>
                </div>

            </div>

            <QuickViewModal
                isOpen={isQuickViewOpen}
                onClose={() => setIsQuickViewOpen(false)}
                product={product}
            />
        </motion.div>
    );
}
