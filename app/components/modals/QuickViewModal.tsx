"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
    X, Heart, MessageSquare, Star, MapPin,
    ShieldAlert, BadgeCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useSaved } from "../../context/SavedContext";

interface QuickViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: {
        id: number;
        title: string;
        price: number | string;
        image: string;
        category: string;
        rating: number;
        location?: string;
        seller?: string;
        sellerId: string;
        description?: string;
        condition?: string;
        brand?: string;
        negotiable?: boolean;
    };
}

export function QuickViewModal({ isOpen, onClose, product }: QuickViewModalProps) {
    const [mounted, setMounted] = useState(false);
    const { toggleSaved, isSaved } = useSaved();
    const router = useRouter();

    useEffect(() => {
        setMounted(true);
        document.body.style.overflow = isOpen ? "hidden" : "unset";
        return () => { document.body.style.overflow = "unset"; };
    }, [isOpen]);

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [onClose]);

    const images = [
        product.image,
        "https://images.unsplash.com/photo-1517336712461-18d6e987c653?auto=format&fit=crop&w=400&q=80",
        "https://images.unsplash.com/photo-1519451241324-20a66d03f56e?auto=format&fit=crop&w=400&q=80",
        "https://images.unsplash.com/photo-1525547718571-039c6563636c?auto=format&fit=crop&w=400&q=80",
        "https://images.unsplash.com/photo-1515243142759-b1480f4f9f74?auto=format&fit=crop&w=400&q=80",
    ];

    const formatPrice = (price: number | string) => {
        const n = typeof price === "string" ? parseFloat(price.replace(/,/g, "")) : price;
        return isNaN(n) ? price : n.toLocaleString();
    };

    const handleMessageSeller = () => {
        onClose();
        router.push(`/chat?user=${product.sellerId}&listing=${product.id}`);
    };

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80"
                    />

                    {/* Modal — narrower, shorter max-h */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative w-full max-w-sm sm:max-w-[400px] bg-card shadow-[0_32px_128px_-16px_rgba(0,0,0,0.5)] rounded-[24px] overflow-hidden flex flex-col max-h-[88vh]"
                    >
                        {/* Header controls */}
                        <div className="absolute top-4 inset-x-4 z-20 flex justify-between items-start pointer-events-none">
                            <div className="px-2.5 py-1 bg-black rounded-full shadow-xl pointer-events-auto ring-1 ring-white/20">
                                <span className="text-[9px] font-black uppercase tracking-widest text-white">
                                    {product.category}
                                </span>
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); onClose(); }}
                                className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white border border-white/10 hover:bg-zinc-900 transition-colors pointer-events-auto shadow-xl"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Scrollable content */}
                        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-border">

                            {/* Image mosaic — shorter */}
                            <div className="p-4 pb-2">
                                <div className="grid grid-cols-4 grid-rows-3 gap-2 h-[220px] sm:h-[260px]">
                                    {/* Main image */}
                                    <motion.div
                                        whileHover={{ scale: 1.01 }}
                                        className="col-span-4 row-span-2 relative rounded-2xl overflow-hidden border border-border/40 shadow-md group/main"
                                    >
                                        <Image
                                            src={images[0]}
                                            alt={product.title}
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover/main:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover/main:opacity-100 transition-opacity" />
                                    </motion.div>

                                    {/* Thumbnails */}
                                    {images.slice(1, 5).map((img, idx) => (
                                        <motion.div
                                            key={idx}
                                            whileHover={{ scale: 1.05 }}
                                            className="col-span-1 row-span-1 relative rounded-xl overflow-hidden border border-border/40 shadow-sm cursor-pointer"
                                        >
                                            <Image src={img} alt="" fill className="object-cover" />
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            {/* Info section */}
                            <div className="px-5 pt-2 pb-5 space-y-4">

                                {/* Title + Price */}
                                <div className="flex justify-between items-start gap-3">
                                    <h2 className="text-base font-black font-heading tracking-tight leading-tight flex-1 text-foreground">
                                        {product.title}
                                    </h2>
                                    <p className="text-lg font-price font-bold text-primary whitespace-nowrap">
                                        ₦{formatPrice(product.price)}
                                    </p>
                                </div>

                                {/* Badges */}
                                <div className="flex flex-wrap gap-1.5">
                                    <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-foreground bg-secondary/80 px-2.5 py-1 rounded-lg border border-border/50">
                                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                        <span>{product.rating} Rating</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100/80">
                                        <BadgeCheck className="w-3 h-3" />
                                        <span>Verified</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-foreground bg-secondary/80 px-2.5 py-1 rounded-lg border border-border/50">
                                        <MapPin className="w-3 h-3" />
                                        <span>{product.location || "Main Campus"}</span>
                                    </div>
                                </div>

                                {/* Overview */}
                                <div className="space-y-2 bg-secondary/40 p-4 rounded-2xl border border-border/40">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1 h-3 bg-primary rounded-full" />
                                        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Overview</span>
                                    </div>
                                    <p className="text-xs text-foreground/80 leading-relaxed font-semibold">
                                        {product.description || "Top-tier quality Campus item in exceptional condition. Highly recommended for students seeking both value and performance."}
                                    </p>
                                </div>

                                {/* Seller */}
                                <div className="flex items-center gap-3 p-3 bg-card border border-border rounded-2xl hover:border-primary/40 hover:shadow-sm transition-all cursor-pointer">
                                    <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center overflow-hidden relative border border-border shrink-0">
                                        <Image src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80" alt="" fill className="object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-black text-foreground truncate">{product.seller || "Student Seller"}</p>
                                        <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Verified Campus Vendor</p>
                                    </div>
                                    <button className="h-8 px-3 rounded-xl bg-foreground text-background text-[9px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-sm active:scale-95">
                                        Profile
                                    </button>
                                </div>

                                {/* Safety */}
                                <div className="flex gap-3 p-3 bg-orange-50 rounded-2xl border border-orange-200/60">
                                    <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
                                        <ShieldAlert className="w-4 h-4 text-orange-600" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-[9px] text-orange-950 font-black uppercase tracking-wider">Campus Safety</p>
                                        <p className="text-[10px] text-orange-900/80 font-bold leading-snug">
                                            Meet in public campus areas. Inspect before payment.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer actions — smaller buttons */}
                        <div className="p-3 border-t border-border/50 bg-card flex gap-2 shadow-[0_-8px_40px_rgba(0,0,0,0.04)]">
                            <button
                                onClick={handleMessageSeller}
                                className="flex-1 h-11 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 bg-primary text-white hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/40 transition-all"
                            >
                                <MessageSquare className="w-4 h-4" />
                                Chat with Seller
                            </button>

                            <button
                                onClick={() => toggleSaved({
                                    id: product.id, title: product.title, price: product.price,
                                    image: product.image, category: product.category,
                                    rating: product.rating, location: product.location,
                                    sellerId: product.sellerId
                                })}
                                className={`h-11 w-11 rounded-xl flex items-center justify-center border-2 transition-all shadow-sm ${isSaved(product.id)
                                    ? "bg-red-50 border-red-200 text-red-500"
                                    : "border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground"
                                    }`}
                            >
                                <Heart className={`w-5 h-5 ${isSaved(product.id) ? "fill-current" : ""}`} />
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
}
