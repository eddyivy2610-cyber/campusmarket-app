"use client";

import React from "react";
import { ShieldCheck, RotateCcw, User, Phone, MessageSquare, Flag, Lightbulb, MapPin, Handshake, AlertTriangle, PlusCircle } from "lucide-react";
import { Product } from "../../data/products";
import { Profile } from "../../data/profiles";

interface ListingActionBoxProps {
    product: Product;
    vendor: Profile;
    onOfferOpen: () => void;
}

export function ListingActionBox({ product, vendor, onOfferOpen }: ListingActionBoxProps) {
    const formattedPrice = new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        maximumFractionDigits: 0,
    }).format(product.price);

    // Mock market price for UI effect
    const marketPriceMax = new Intl.NumberFormat("en-NG", { maximumFractionDigits: 0 }).format(product.price * 1.25);

    return (
        <div className="flex flex-col gap-5 font-body">

            {/* 1. Primary Trade Card: Unified Pricing & Vendor actions */}
            <div className="bg-card border border-border/60 rounded-2xl shadow-lg shadow-black/5 overflow-hidden">
                {/* Price Header (Gradient/Accent) */}
                <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 border-b border-border/40">
                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">Asking Price</p>
                    <div className="flex items-end gap-3">
                        <div className="text-3xl font-black text-foreground font-price tracking-tight">
                            {formattedPrice}
                        </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                        <span className="bg-emerald-500/10 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded-md">
                            Great Deal
                        </span>
                        <span className="text-[11px] font-bold text-muted-foreground">
                            Usually ₦{marketPriceMax}
                        </span>
                    </div>
                </div>

                {/* Vendor Mini-Profile */}
                <div className="p-6 pb-5 border-b border-border/40">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Listed by</p>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-bold bg-secondary px-2 py-0.5 rounded-full">
                            <MapPin className="w-3 h-3" />
                            {vendor.location || "Campus"}
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={vendor.avatar} alt={vendor.name} className="w-14 h-14 rounded-full object-cover border-2 border-background shadow-sm ring-2 ring-primary/20" />
                            {vendor.isVerified && (
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-background rounded-full flex items-center justify-center shadow-sm">
                                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-foreground text-[15px] truncate">{vendor.name}</h3>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                                <span className="text-muted-foreground text-[10px] font-bold flex items-center gap-1.5">
                                    <RotateCcw className="w-3 h-3 text-primary shrink-0" />
                                    Active Vendor
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Conversion Actions */}
                <div className="p-6 bg-secondary/10 space-y-3">
                    <button
                        onClick={onOfferOpen}
                        className="w-full h-12 bg-primary text-primary-foreground font-bold rounded-xl transition-all active:scale-[0.98] text-[14px] flex items-center justify-center gap-2.5 hover:bg-primary/90 shadow-md shadow-primary/25"
                    >
                        <Handshake className="w-4.5 h-4.5" /> Start Negotiation
                    </button>

                    <button className="w-full h-11 bg-card border border-border/80 text-foreground font-bold rounded-xl transition-colors hover:bg-secondary text-[13px] flex items-center justify-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" /> Show Contact Info
                    </button>
                </div>
            </div>

            {/* 2. Trust & Safety Hub */}
            <div className="bg-card border border-border/60 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-5 border-b border-border/40 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-600">
                        <Lightbulb className="w-4.5 h-4.5" />
                    </div>
                    <h3 className="font-bold text-foreground text-sm font-heading tracking-tight">Campus Trade Protocol</h3>
                </div>

                <div className="p-5 pb-6">
                    <ul className="space-y-4">
                        {[
                            "Meet in public, well-lit campus zones like the library or student union.",
                            "Never pay in advance before physically inspecting the item.",
                            "Keep all communications within the CampusMarket chat for your safety."
                        ].map((tip, i) => (
                            <li key={i} className="flex gap-3 text-[12px] font-bold text-muted-foreground leading-relaxed">
                                <span className="text-orange-500 shrink-0 mt-0.5">•</span>
                                {tip}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Sub-actions integrated elegantly */}
                <div className="px-5 py-4 bg-secondary/30 flex items-center justify-between text-[11px] font-bold border-t border-border/40">
                    <button className="text-muted-foreground hover:text-foreground transition-colors">
                        Mark Unavailable
                    </button>
                    <button className="text-red-500/80 hover:text-red-600 transition-colors flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" /> Report Listing
                    </button>
                </div>
            </div>

            {/* 3. Call to Action: Sell */}
            <button className="w-full group bg-gradient-to-r from-emerald-500/5 to-teal-500/5 border border-emerald-500/20 hover:border-emerald-500/40 rounded-2xl p-4 flex items-center justify-center gap-3 transition-all">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                    <PlusCircle className="w-4.5 h-4.5" />
                </div>
                <span className="font-bold text-emerald-700 dark:text-emerald-400 text-[13px]">
                    Have one to sell? Post it now
                </span>
            </button>

        </div>
    );
}
