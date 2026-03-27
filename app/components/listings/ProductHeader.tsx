"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Star, ExternalLink, MapPin, Tag, Handshake } from "lucide-react";
import { Product } from "../../data/products";
import { Profile } from "../../data/profiles";
import { useRouter } from "next/navigation";

interface ProductHeaderProps {
    product: Product;
    vendor: Profile;
}

export function ProductHeader({ product, vendor }: ProductHeaderProps) {
    const [isOfferOpen, setIsOfferOpen] = useState(false);
    const [offerNote, setOfferNote] = useState("");
    const router = useRouter();

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

            <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                {product.location && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-secondary/40 px-2 py-1">
                        <MapPin className="w-3 h-3" /> {product.location}
                    </span>
                )}
                {product.tags?.length > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-secondary/40 px-2 py-1">
                        <Tag className="w-3 h-3" /> {product.tags.slice(0, 3).join(", ")}
                    </span>
                )}
                {product.negotiable && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-2 py-1">
                        <Handshake className="w-3 h-3" /> Negotiable
                        {product.minPrice ? ` • Min ₦${product.minPrice.toLocaleString()}` : ""}
                    </span>
                )}
            </div>

            <div className="text-2xl md:text-[28px] font-black font-price text-amber-800 dark:text-amber-300">
                {formattedPrice}
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={() => setIsOfferOpen((prev) => !prev)}
                    aria-expanded={isOfferOpen}
                    className="flex-1 h-10 rounded bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90"
                >
                    Make Inquiry
                </button>
                <button className="w-10 h-10 rounded border border-border/60 grid place-items-center hover:bg-secondary/50">
                    <Heart className="w-4 h-4" />
                </button>
            </div>

            {isOfferOpen && (
                <div className="rounded-lg border border-border/60 bg-background p-3 space-y-3 font-sans">
                    <div className="space-y-1.5">
                        <textarea
                            value={offerNote}
                            onChange={(e) => setOfferNote(e.target.value)}
                            placeholder="Type your offer message to start a chat..."
                            className="w-full min-h-[96px] rounded-md border border-border/60 bg-secondary/30 p-3 text-xs font-medium outline-none focus:border-primary/60"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsOfferOpen(false)}
                            className="flex-1 h-9 rounded-md border border-border/60 bg-secondary/40 text-[10px] font-bold uppercase tracking-widest hover:bg-secondary/60"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => {
                                const message = offerNote.trim();
                                if (!message) return;
                                setIsOfferOpen(false);
                                const query = `&message=${encodeURIComponent(message)}`;
                                router.push(`/chat?user=${vendor.id}&listing=${product.id}${query}`);
                                setOfferNote("");
                            }}
                            disabled={!offerNote.trim()}
                            className="flex-[2] h-9 rounded-md bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Send
                        </button>
                    </div>
                </div>
            )}

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
