"use client";
import { Product } from "../../data/products";
import { MoreHorizontal, Edit2, Copy, Trash2, PowerOff, TrendingUp, AlertCircle, EyeOff, Star, MousePointerClick, ShoppingBag, Share2 } from "lucide-react";
import { useState, useRef } from "react";
import Image from "next/image";
import { useClickOutside } from "../../hooks/useClickOutside";

interface ListingRowProps {
    listing: Product;
    isSelected: boolean;
    onSelect: () => void;
    onViewShare: () => void;
}

export function ListingRow({ listing, isSelected, onSelect, onViewShare }: ListingRowProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useClickOutside(menuRef, () => setIsMenuOpen(false));

    // For demo purposes, pretending some are sold/hidden based on ID
    const isSold = listing.id === 2;
    const isHidden = false;

    // Status Badge Logic
    let StatusBadge = () => (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Active
        </span>
    );

    if (isSold) {
        StatusBadge = () => (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 border border-amber-500/20">
                Sold
            </span>
        );
    } else if (isHidden) {
        StatusBadge = () => (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-secondary/50 text-muted-foreground border border-border/50">
                <EyeOff className="w-3 h-3" />
                Hidden
            </span>
        );
    }

    return (
        <tr className={`hover:bg-secondary/10 transition-colors group ${isSelected ? 'bg-primary/5' : ''}`}>
            {/* Checkbox */}
            <td className="p-4 text-center border-r border-border/20">
                <button
                    onClick={onSelect}
                    className={`w-5 h-5 mx-auto rounded border flex items-center justify-center transition-colors ${isSelected
                        ? "bg-primary border-primary text-primary-foreground"
                        : "border-border hover:border-primary/50 text-transparent group-hover:border-primary/30"
                        }`}
                >
                    <div className={isSelected ? "block" : "hidden"}><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div>
                </button>
            </td>

            {/* Product Info */}
            <td className="px-6 py-4">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-secondary/30 border border-border/50 overflow-hidden relative shrink-0">
                        <Image
                            src={listing.image}
                            alt={listing.title}
                            fill
                            className="object-cover"
                            unoptimized  // For demo images
                        />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-base group-hover:text-primary transition-colors line-clamp-1">{listing.title}</h3>
                            {listing.category === 'Urgent' && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-500/10 text-red-600 uppercase">Urgent</span>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground font-medium line-clamp-1">{listing.category}</p>
                        <p className="text-[10px] text-muted-foreground/50 mt-1 uppercase tracking-wider">Posted {listing.postedDate}</p>
                    </div>
                </div>
            </td>

            {/* Price & Stock */}
            <td className="px-6 py-4">
                <div className="flex flex-col gap-1">
                    <span className="font-bold text-sm">₦{listing.price.toLocaleString()}</span>
                    {listing.offer && (
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full w-fit">
                            Sale Active
                        </span>
                    )}
                    <span className="text-xs text-muted-foreground">Qty: 1</span>
                </div>
            </td>

            {/* Status */}
            <td className="px-6 py-4">
                <StatusBadge />
            </td>

            {/* Performance */}
            <td className="px-6 py-4">
                <div className="flex items-center gap-4 text-muted-foreground">
                    <div className="flex flex-col items-center gap-1 group/stat cursor-pointer tooltip-trigger">
                        <div className="flex items-center gap-1 text-xs">
                            <Star className="w-3.5 h-3.5 group-hover/stat:text-yellow-500 transition-colors" />
                            <span className="font-medium">4.8</span>
                        </div>
                    </div>
                    <div className="flex flex-col items-center gap-1 group/stat cursor-pointer">
                        <div className="flex items-center gap-1 text-xs">
                            <ShoppingBag className="w-3.5 h-3.5 group-hover/stat:text-emerald-500 transition-colors" />
                            <span className="font-medium">15</span>
                        </div>
                    </div>
                    <div className="flex flex-col items-center gap-1 group/stat cursor-pointer">
                        <div className="flex items-center gap-1 text-xs">
                            <MousePointerClick className="w-3.5 h-3.5 group-hover/stat:text-blue-500 transition-colors" />
                            <span className="font-medium">89</span>
                        </div>
                    </div>
                </div>
            </td>

            {/* Actions */}
            <td className="px-6 py-4 text-right relative">
                <div ref={menuRef} className="inline-block">
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl transition-all"
                    >
                        <MoreHorizontal className="w-5 h-5" />
                    </button>

                    {/* Action Dropdown Menu */}
                    {isMenuOpen && (
                        <div className="absolute right-6 top-12 w-48 bg-background border border-border/50 rounded-2xl shadow-xl z-50 p-2 py-2 flex flex-col gap-1 origin-top-right animate-in fade-in zoom-in-95 duration-100">
                            <button className="flex items-center gap-2.5 w-full px-3 py-2 text-sm font-medium hover:bg-secondary rounded-xl transition-colors text-left">
                                <Edit2 className="w-4 h-4 text-muted-foreground" />
                                Edit Listing
                            </button>
                            <button className="flex items-center gap-2.5 w-full px-3 py-2 text-sm font-medium hover:bg-secondary rounded-xl transition-colors text-left">
                                <Copy className="w-4 h-4 text-muted-foreground" />
                                Duplicate
                            </button>
                            <button
                                onClick={() => {
                                    onViewShare();
                                    setIsMenuOpen(false);
                                }}
                                className="flex items-center gap-2.5 w-full px-3 py-2 text-sm font-medium hover:bg-secondary rounded-xl transition-colors text-left"
                            >
                                <Share2 className="w-4 h-4 text-muted-foreground" />
                                Share
                            </button>
                            <button className="flex items-center gap-2.5 w-full px-3 py-2 text-sm font-medium hover:bg-secondary rounded-xl transition-colors text-left">
                                <TrendingUp className="w-4 h-4 text-emerald-500" />
                                Promote Listing
                            </button>

                            <div className="h-px bg-border/40 my-1 w-full" />

                            <button className="flex items-center gap-2.5 w-full px-3 py-2 text-sm font-medium hover:bg-secondary rounded-xl transition-colors text-left">
                                <PowerOff className="w-4 h-4 text-amber-500" />
                                {isSold ? "Mark as Available" : "Mark as Sold"}
                            </button>

                            <div className="h-px bg-border/40 my-1 w-full" />

                            <button className="flex items-center gap-2.5 w-full px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-500/10 rounded-xl transition-colors text-left">
                                <Trash2 className="w-4 h-4" />
                                Delete Listing
                            </button>
                        </div>
                    )}
                </div>
            </td>
        </tr>
    );
}
