"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, LayoutGrid, Sparkles } from "lucide-react";

interface ListingItem {
    id: number;
    title: string;
    price: number;
    image: string;
    category?: string;
}

interface RelatedProductsProps {
    vendorName: string;
    vendorListings: ListingItem[];
    similarItems: ListingItem[];
}

function ProductScroller({ title, items, badge, viewAllHref }: {
    title: string;
    items: ListingItem[];
    badge?: React.ReactNode;
    viewAllHref: string;
}) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    {badge}
                    <h2 className="text-sm font-bold font-heading tracking-wider uppercase">{title}</h2>
                </div>
                <Link
                    href={viewAllHref}
                    className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-primary hover:opacity-70 transition-opacity"
                >
                    All <ChevronRight className="w-3 h-3" />
                </Link>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
                {items.length > 0 ? (
                    items.map((item) => (
                        <Link
                            key={item.id}
                            href={`/listings/${item.id}`}
                            className="group flex-shrink-0 w-[140px] space-y-2.5"
                        >
                            <div className="relative aspect-square rounded-xl overflow-hidden bg-secondary border border-border/30 shadow-sm transition-transform group-hover:scale-[1.02]">
                                <Image src={item.image} alt={item.title} fill className="object-cover" />
                            </div>
                            <div className="space-y-0.5">
                                <h4 className="font-bold text-[11px] truncate leading-tight group-hover:text-primary transition-colors">
                                    {item.title}
                                </h4>
                                <p className="font-bold text-xs text-primary">
                                    {new Intl.NumberFormat("en-NG", {
                                        style: "currency",
                                        currency: "NGN",
                                        maximumFractionDigits: 0,
                                    }).format(item.price)}
                                </p>
                            </div>
                        </Link>
                    ))
                ) : (
                    <div className="w-full py-6 text-center text-[10px] uppercase tracking-widest font-bold text-muted-foreground/40 border border-dashed border-border/20 rounded-2xl">
                        No items
                    </div>
                )}
            </div>
        </div>
    );
}

export function RelatedProducts({ vendorName, vendorListings, similarItems }: RelatedProductsProps) {
    return (
        <div className="space-y-12">
            <ProductScroller
                title={`More from ${vendorName}`}
                items={vendorListings}
                viewAllHref="#"
                badge={
                    <div className="w-7 h-7 rounded-lg bg-primary/5 flex items-center justify-center text-primary shrink-0 border border-primary/10">
                        <LayoutGrid className="w-3.5 h-3.5 opacity-70" />
                    </div>
                }
            />

            <ProductScroller
                title="Similar Items"
                items={similarItems}
                viewAllHref="#"
                badge={
                    <div className="w-7 h-7 rounded-lg bg-amber-500/5 flex items-center justify-center text-amber-500 shrink-0 border border-amber-500/10">
                        <Sparkles className="w-3.5 h-3.5 fill-current opacity-70" />
                    </div>
                }
            />
        </div>
    );
}
