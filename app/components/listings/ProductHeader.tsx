"use client";

import React from "react";
import {
    Handshake,
    Heart,
    Star,
    BadgeCheck,
    MapPin,
    Calendar,
    Share2
} from "lucide-react";

import { Product } from "../../data/products";
import { ListingShareModal } from "../manage-listings/ListingShareModal";

interface ProductHeaderProps {
    product: Product;
}

export function ProductHeader({ product }: ProductHeaderProps) {

    return (
        <div className="space-y-5">
            {/* Breadcrumbs (Simplified) */}
            <div className="flex items-center gap-2 text-[9px] font-heading font-bold text-muted-foreground tracking-[0.2em] uppercase">
                <span>Electronics</span>
                <span>/</span>
                <span className="text-foreground">Laptops</span>
            </div>

            <div className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                    <h1 className="text-2xl md:text-3xl font-bold font-heading tracking-tight leading-none text-foreground">
                        {product.title}
                    </h1>
                </div>
            </div>



            {/* Trust Indicators Bar */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-4 border-t border-border/40 text-muted-foreground/70">
                <div className="flex items-center gap-1.5">
                    <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="font-bold text-foreground text-[10px]">{product.recommendedCount}</span>
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">({product.recommendedCount + product.notRecommendedCount} reviews)</span>
                </div>

                <div className="flex items-center gap-1.5 text-[9px] font-bold text-blue-500 uppercase tracking-widest">
                    <BadgeCheck className="w-3.5 h-3.5" fill="#1D9BF0" stroke="white" strokeWidth={1.5} />
                    Verified
                </div>

                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-tight">
                    <MapPin className="w-3 h-3 opacity-60" />
                    {product.location}
                </div>

                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-tight">
                    <Calendar className="w-3 h-3 opacity-60" />
                    Posted {product.postedDate}
                </div>

                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-tight">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Available (1Qty)
                </div>

                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-tight">
                    Condition: {product.condition}
                </div>

            </div>
        </div>
    );
}
