"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Heart, Star, ExternalLink } from "lucide-react";
import { Product } from "../../data/products";
import { Profile } from "../../data/profiles";

interface ProductHeaderProps {
    product: Product;
    vendor: Profile;
    onOfferOpen: () => void;
}

export function ProductHeader({ product, vendor, onOfferOpen }: ProductHeaderProps) {
    const [quantity, setQuantity] = useState(1);

    const rating = useMemo(() => {
        const total = product.recommendedCount + product.notRecommendedCount;
        if (!total) return 0;
        return Math.max(1, Math.min(5, Math.round((product.recommendedCount / total) * 5)));
    }, [product.notRecommendedCount, product.recommendedCount]);

    const formattedPrice = new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        maximumFractionDigits: 0,
    }).format(product.price);

    const shortDescription = product.description.split("\n")[0]?.slice(0, 140) || product.description;
    return (
        <div className="space-y-5 border border-border/50 rounded-md p-4 md:p-5 bg-card">
            <div className="space-y-1.5">
                <h1 className="text-xl md:text-2xl font-bold font-heading tracking-tight text-foreground">
                    {product.title}
                </h1>
                <div className="flex items-center gap-2 text-sm">
                    <div className="flex items-center text-amber-500">
                        {Array.from({ length: 5 }, (_, i) => (
                            <Star key={i} className={`w-3.5 h-3.5 ${i < rating ? "fill-current" : ""}`} />
                        ))}
                    </div>
                    <span className="text-xs text-muted-foreground">({product.recommendedCount + product.notRecommendedCount} Reviews)</span>
                    <span className="text-xs text-emerald-600">In Stock</span>
                </div>
            </div>

            <p className="text-sm text-foreground/70 leading-relaxed">
                {shortDescription}
            </p>

            <div className="text-2xl md:text-[28px] font-black font-price text-foreground">
                {formattedPrice}
            </div>

            <div className="flex items-center gap-2">
                <div className="h-10 rounded border border-border/60 bg-background flex items-center">
                    <button
                        onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                        className="w-9 h-full grid place-items-center text-foreground/70 hover:text-foreground"
                    >
                        <Minus className="w-4 h-4" />
                    </button>
                    <div className="w-9 text-center text-sm font-semibold">{quantity}</div>
                    <button
                        onClick={() => setQuantity((prev) => prev + 1)}
                        className="w-9 h-full grid place-items-center text-foreground/70 hover:text-foreground"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>
                <button
                    onClick={onOfferOpen}
                    className="flex-1 h-10 rounded bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90"
                >
                    Make Offer
                </button>
                <button className="w-10 h-10 rounded border border-border/60 grid place-items-center hover:bg-secondary/50">
                    <Heart className="w-4 h-4" />
                </button>
            </div>

            <div className="border border-border/60 rounded-md overflow-hidden bg-background">
                <div className="flex items-center justify-between gap-3 p-3">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="relative w-9 h-9 rounded-full overflow-hidden border border-border/60">
                            <Image src={vendor.avatar} alt={vendor.name} fill className="object-cover" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate">{vendor.name}</p>
                            <p className="text-[11px] text-muted-foreground">Verified Campus Seller</p>
                        </div>
                    </div>
                    <Link
                        href={`/profile/${vendor.id}`}
                        className="h-9 w-9 rounded-md border border-border/60 grid place-items-center hover:bg-secondary/50 shrink-0"
                        aria-label="Visit profile"
                    >
                        <ExternalLink className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
