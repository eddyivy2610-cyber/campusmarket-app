"use client";

import React, { useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
    X,
    Heart,
    Star,
    MapPin,
    ShieldAlert,
    BadgeCheck,
    Calendar,
    MessageSquare,
    ExternalLink,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useSaved } from "../../context/SavedContext";
import { PROFILES } from "../../data/profiles";

interface QuickViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: {
        id: number;
        title: string;
        price: number | string;
        image: string;
        images?: string[];
        category: string;
        recommendedCount: number;
        notRecommendedCount: number;
        location?: string;
        seller?: string;
        sellerId: string;
        description?: string;
        condition?: string;
        brand?: string;
        negotiable?: boolean;
        postedDate?: string;
        status?: string;
        isUrgent?: boolean;
        originalPrice?: number | string;
    };
}

export function QuickViewModal({ isOpen, onClose, product }: QuickViewModalProps) {
    const { toggleSaved, isSaved } = useSaved();
    const router = useRouter();

    const sellerProfile = useMemo(
        () => PROFILES.find((profile) => profile.id === product.sellerId),
        [product.sellerId]
    );

    const imageList = useMemo(() => {
        if (product.images && product.images.length > 0) return product.images;
        return [product.image];
    }, [product.image, product.images]);

    useEffect(() => {
        document.body.style.overflow = isOpen ? "hidden" : "unset";
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [onClose]);

    const formatPrice = (price: number | string) => {
        const n = typeof price === "string" ? parseFloat(price.replace(/,/g, "")) : price;
        return isNaN(n) ? price : n.toLocaleString();
    };

    const totalReviews = product.recommendedCount + product.notRecommendedCount;
    const starRating = Math.min(
        5,
        Math.max(1, Math.round((product.recommendedCount / (totalReviews || 1)) * 5))
    );

    const goToMessages = () => {
        onClose();
        router.push(`/dashboard/messages?user=${product.sellerId}&listing=${product.id}`);
    };

    const goToListing = () => {
        onClose();
        router.push(`/listings/${product.id}`);
    };

    const goToSellerProfile = () => {
        if (!sellerProfile) return;
        onClose();
        router.push(`/profile/${sellerProfile.handle}`);
    };

    if (typeof document === "undefined") return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/75"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 18 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 18 }}
                        transition={{ type: "spring", damping: 24, stiffness: 290 }}
                        className="relative w-full max-w-sm sm:max-w-[420px] bg-card rounded-[24px] overflow-hidden shadow-[0_32px_128px_-16px_rgba(0,0,0,0.5)] max-h-[88vh] flex flex-col"
                        onWheel={(e) => e.stopPropagation()}
                    >
                        <div className="absolute top-4 inset-x-4 z-20 flex items-start justify-between pointer-events-none">
                            <div className="px-2.5 py-1 bg-black rounded-full shadow-lg pointer-events-auto ring-1 ring-white/20">
                                <span className="text-[9px] font-bold uppercase tracking-widest text-white">{product.category}</span>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onClose();
                                }}
                                className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white border border-white/10 hover:bg-zinc-900 transition-colors pointer-events-auto"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-border" data-lenis-prevent>
                            <div className="p-4 pb-3">
                                <div className="grid grid-cols-4 grid-rows-3 gap-2 h-[220px] sm:h-[260px]">
                                    <div className="col-span-4 row-span-2 relative rounded-2xl overflow-hidden border border-border/40">
                                        <Image
                                            src={imageList[0]}
                                            alt={product.title}
                                            fill
                                            className="object-cover"
                                        />
                                        {product.isUrgent && (
                                            <span className="absolute top-2 left-2 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-sm">
                                                URGENT
                                            </span>
                                        )}
                                        {product.status === "sold" && (
                                            <span className="absolute top-2 right-2 bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-sm">
                                                SOLD
                                            </span>
                                        )}
                                    </div>

                                    {Array.from({ length: 4 }).map((_, idx) => {
                                        const thumb = imageList[idx + 1] ?? imageList[0];
                                        return (
                                            <div
                                                key={idx}
                                                className="col-span-1 row-span-1 relative rounded-xl overflow-hidden border border-border/40"
                                            >
                                                <Image src={thumb} alt="" fill className="object-cover" />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="px-5 pb-5 space-y-4">
                                <div className="flex items-start justify-between gap-3">
                                    <h2 className="text-base font-bold font-heading leading-tight text-foreground">{product.title}</h2>
                                    <div className="text-right shrink-0">
                                        <p className="text-lg font-price font-bold text-primary">N{formatPrice(product.price)}</p>
                                        {product.originalPrice && (
                                            <p className="text-[11px] text-muted-foreground line-through">
                                                N{formatPrice(product.originalPrice)}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-1.5 text-[9px] font-bold uppercase tracking-widest">
                                    <span className="px-2 py-1 rounded-lg border border-border/40 bg-secondary/60 text-foreground">
                                        {product.condition || "Condition not set"}
                                    </span>
                                    <span className="px-2 py-1 rounded-lg border border-border/40 bg-secondary/60 text-foreground flex items-center gap-1">
                                        <MapPin className="w-3 h-3" /> {product.location || "Campus"}
                                    </span>
                                    {product.postedDate && (
                                        <span className="px-2 py-1 rounded-lg border border-border/40 bg-secondary/60 text-foreground flex items-center gap-1">
                                            <Calendar className="w-3 h-3" /> {product.postedDate}
                                        </span>
                                    )}
                                </div>

                                <div className="p-3 bg-secondary/30 border border-border/40 rounded-2xl">
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <div className="flex items-center gap-0.5">
                                            {[1, 2, 3, 4, 5].map((s) => (
                                                <Star
                                                    key={s}
                                                    className={`w-3.5 h-3.5 ${s <= starRating ? "text-amber-400 fill-amber-400" : "text-muted-foreground/20"}`}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-[10px] font-bold text-muted-foreground">
                                            ({totalReviews} reviews)
                                        </span>
                                    </div>
                                    <p className="text-[11px] font-semibold text-foreground/80">
                                        {product.recommendedCount} recommended this listing
                                    </p>
                                </div>

                                <div className="space-y-2 bg-secondary/20 p-4 rounded-2xl border border-border/30">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Overview</p>
                                    <p className="text-xs text-foreground/80 leading-relaxed font-medium line-clamp-4">
                                        {product.description || "No description provided for this listing yet."}
                                    </p>
                                </div>

                                <div className="flex items-center gap-3 p-3 bg-card border border-border rounded-2xl">
                                    <div className="w-10 h-10 rounded-xl bg-secondary overflow-hidden relative border border-border shrink-0">
                                        <Image
                                            src={sellerProfile?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80"}
                                            alt={sellerProfile?.name || "Seller"}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5">
                                            <p className="text-sm font-bold text-foreground truncate">
                                                {sellerProfile?.name || product.seller || "Seller"}
                                            </p>
                                            {sellerProfile?.isVerified && (
                                                <BadgeCheck className="w-4 h-4 text-blue-500" />
                                            )}
                                        </div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                            {sellerProfile ? `@${sellerProfile.handle}` : "Campus seller"}
                                        </p>
                                    </div>
                                    {sellerProfile && (
                                        <button
                                            onClick={goToSellerProfile}
                                            className="h-8 px-3 rounded-xl bg-foreground text-background text-[9px] font-bold uppercase tracking-widest hover:bg-primary hover:text-white transition-all active:scale-95"
                                        >
                                            Profile
                                        </button>
                                    )}
                                </div>

                                <div className="flex gap-3 p-3 bg-orange-50 rounded-2xl border border-orange-200/60">
                                    <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
                                        <ShieldAlert className="w-4 h-4 text-orange-600" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-[9px] text-orange-950 font-bold uppercase tracking-wider">Campus Safety</p>
                                        <p className="text-[10px] text-orange-900/80 font-bold leading-snug">
                                            Meet in public campus areas and inspect the item before payment.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-3 border-t border-border/50 bg-card flex gap-2">
                            <button
                                onClick={goToMessages}
                                className="flex-1 h-11 rounded-xl font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 bg-primary text-white hover:scale-[1.01] active:scale-[0.98] transition-all"
                            >
                                <MessageSquare className="w-4 h-4" /> Message Seller
                            </button>

                            <button
                                onClick={goToListing}
                                className="h-11 px-3 rounded-xl border border-border text-foreground text-[10px] font-bold uppercase tracking-widest hover:bg-secondary transition-colors"
                            >
                                <ExternalLink className="w-4 h-4" />
                            </button>

                            <button
                                onClick={() =>
                                    toggleSaved({
                                        id: product.id,
                                        title: product.title,
                                        price: product.price,
                                        image: product.image,
                                        category: product.category,
                                        recommendedCount: product.recommendedCount,
                                        notRecommendedCount: product.notRecommendedCount,
                                        location: product.location,
                                        sellerId: product.sellerId,
                                    })
                                }
                                className={`h-11 w-11 rounded-xl flex items-center justify-center border-2 transition-all ${
                                    isSaved(product.id)
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
