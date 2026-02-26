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
}

export function ProductCard({ product, isOwner = false, viewAs = "visitor" }: { product: ProductProps; isOwner?: boolean; viewAs?: "host" | "visitor" }) {
    const effectiveIsOwner = viewAs === "host" ? true : isOwner;
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
            className={`group relative bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border h-full flex flex-col ${effectiveIsOwner ? "border-primary/20" : "border-border/50 hover:border-primary/20"}`}
        >
            {/* Overlay Link for the whole card */}
            <Link
                href={`/listings/${product.id}`}
                className="absolute inset-0 z-0"
                aria-label={`View details for ${product.title}`}
            />

            {/* Image */}
            <div className="aspect-[4/3] bg-secondary/50 relative overflow-hidden pointer-events-none">
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
                    <div className="absolute top-0 right-0 left-0 aspect-[4/3] pointer-events-none z-10">
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

            {/* Content — tighter padding */}
            <div className="p-3 flex-1 flex flex-col relative z-2 pointer-events-none mb-3">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] font-bold text-primary uppercase tracking-wider bg-primary/5 px-1.5 py-0.5 rounded-sm truncate max-w-[70%]">
                        {product.category}
                    </span>
                    {product.location && (
                        <div className="flex items-center gap-0.5 text-[9px] text-muted-foreground">
                            <MapPin className="w-2.5 h-2.5" />
                            <span className="truncate max-w-[60px]">{product.location}</span>
                        </div>
                    )}
                </div>

                <h3 className="font-heading font-bold text-sm text-foreground mb-1.5 line-clamp-2 group-hover:text-primary transition-colors flex-1" title={product.title}>
                    {product.title}
                </h3>

                <div className="flex items-center justify-between mt-auto pt-2 border-t border-border/40">
                    <span className="font-price font-bold text-base text-foreground">
                        ₦{formatPrice(product.price)}
                    </span>
                    <div className="flex items-center gap-1">
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
