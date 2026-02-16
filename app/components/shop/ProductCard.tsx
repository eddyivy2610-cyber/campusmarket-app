"use client";

import { Tooltip } from "../shared/Tooltip";
import {
    Heart, ShoppingBag, Star, Eye, MapPin,
    Edit3, Trash2, Tag, MoreHorizontal, MessageCircle, ShoppingCart
} from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useWishlist } from "../../context/WishlistContext";
import { useCart } from "../../context/CartContext";

interface ProductProps {
    id: number;
    title: string;
    price: number | string;
    image: string;
    category: string;
    rating: number;
    location?: string;
    status?: string;
    seller?: string;
    sellerId: string;
    isUrgent?: boolean;
}

export function ProductCard({ product, isOwner = false }: { product: ProductProps; isOwner?: boolean }) {
    const { toggleWishlist, isInWishlist } = useWishlist();
    const { addToCart } = useCart();

    // Helper to format price
    const formatPrice = (price: number | string) => {
        const numPrice = typeof price === 'string' ? parseFloat(price.replace(/,/g, '')) : price;
        return isNaN(numPrice) ? price : numPrice.toLocaleString();
    };

    // Placeholder handlers for owner actions
    const handleEdit = (e: React.MouseEvent) => { e.preventDefault(); console.log("Edit", product.title); };
    const handleDelete = (e: React.MouseEvent) => { e.preventDefault(); console.log("Delete", product.title); };
    const handleToggleStatus = (e: React.MouseEvent) => { e.preventDefault(); console.log("Toggle Status", product.title); };
    const handleMoreActions = (e: React.MouseEvent) => { e.preventDefault(); console.log("More Actions", product.title); };

    return (
        <motion.div
            whileHover={{ y: -5 }}
            className={`group relative bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border h-full flex flex-col ${isOwner ? 'border-primary/20' : 'border-border/50 hover:border-primary/20'}`}
        >
            {/* Image Placeholder */}
            <div className="aspect-[4/3] bg-secondary/50 relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
                <Image
                    src={product.image}
                    alt={product.title}
                    fill
                    className="object-cover"
                />

                {/* Status Tags */}
                <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                    {product.isUrgent && (
                        <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-sm animate-pulse">
                            URGENT
                        </span>
                    )}
                    {product.status === 'sold' && (
                        <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-sm">
                            SOLD
                        </span>
                    )}
                </div>

                {/* Quick View Overlay (Visitor Only) */}
                {!isOwner && (
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-white text-slate-900 px-6 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 hover:bg-primary hover:text-white flex items-center gap-2"
                        >
                            <Eye className="w-3.5 h-3.5" />
                            Quick View
                        </motion.button>
                    </div>
                )}

                {/* Hover Actions (Top Right) - Visitor Only */}
                {!isOwner && (
                    <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0 z-10">
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleWishlist({
                                    id: product.id,
                                    title: product.title,
                                    price: product.price,
                                    image: product.image,
                                    category: product.category,
                                    rating: product.rating,
                                    location: product.location
                                });
                            }}
                            className={`h-9 w-9 rounded-full flex items-center justify-center shadow-lg transition-colors ${isInWishlist(product.id)
                                ? "bg-red-50 text-red-500 hover:bg-red-100"
                                : "bg-white text-slate-900 hover:bg-primary hover:text-white"
                                }`}
                            title={isInWishlist(product.id) ? "Remove from Wishlist" : "Add to Wishlist"}
                        >
                            <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? "fill-current" : ""}`} />
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const numPrice = typeof product.price === 'string' ? parseFloat(product.price.replace(/,/g, '')) : product.price;
                                addToCart({
                                    id: product.id,
                                    title: product.title,
                                    price: numPrice,
                                    image: product.image,
                                    category: product.category,
                                    location: product.location,
                                    sellerId: product.sellerId
                                });
                            }}
                            className="h-9 w-9 bg-white text-slate-900 rounded-full flex items-center justify-center shadow-lg hover:bg-primary hover:text-white transition-colors" title="Add to Cart"
                        >
                            <ShoppingBag className="w-4 h-4" />
                        </motion.button>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider bg-primary/5 px-2 py-0.5 rounded-sm">
                        {product.category}
                    </span>
                    {product.location && (
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            <span className="truncate max-w-[80px]">{product.location}</span>
                        </div>
                    )}
                </div>

                <h3 className="font-heading font-bold text-base text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors flex-1" title={product.title}>
                    {product.title}
                </h3>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                    <span className="font-price font-bold text-lg text-foreground">
                        ₦{formatPrice(product.price)}
                    </span>
                    <div className="flex items-center gap-0.5">
                        <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs font-bold text-muted-foreground ml-0.5">{product.rating}</span>
                    </div>
                </div>

                {/* Owner Actions */}
                {isOwner && (
                    <div className="mt-3 pt-3 flex items-center justify-between gap-2 border-t border-border/50">
                        <div className="flex items-center gap-1">
                            <Tooltip content="Edit Listing">
                                <button onClick={handleEdit} className="p-2 hover:bg-secondary rounded-lg text-gray-500 hover:text-blue-500 transition-colors">
                                    <Edit3 className="w-4 h-4" />
                                </button>
                            </Tooltip>
                            <Tooltip content="Mark as Sold / Toggle Status">
                                <button onClick={handleToggleStatus} className="p-2 hover:bg-secondary rounded-lg text-gray-500 hover:text-green-500 transition-colors">
                                    <Tag className="w-4 h-4" />
                                </button>
                            </Tooltip>
                            <Tooltip content="Delete Listing">
                                <button onClick={handleDelete} className="p-2 hover:bg-secondary rounded-lg text-gray-500 hover:text-red-500 transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </Tooltip>
                        </div>
                        <Tooltip content="More Actions">
                            <button onClick={handleMoreActions} className="p-2 hover:bg-secondary rounded-lg text-gray-500 hover:text-foreground transition-colors">
                                <MoreHorizontal className="w-4 h-4" />
                            </button>
                        </Tooltip>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
