"use client";

import { X, MapPin, Star, User, Tag, ArrowRight, MessageCircle, Heart, Share2, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

interface QuickViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: {
        title: string;
        price: string;
        category: string;
        rating: number;
        image: string;
        status?: string;
        seller?: string;
        isUrgent?: boolean;
    };
}

export function QuickViewModal({ isOpen, onClose, product }: QuickViewModalProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            document.body.style.overflow = 'hidden';
        } else {
            setTimeout(() => setIsVisible(false), 200); // Wait for exit animation
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    if (!isVisible && !isOpen) return null;

    return (
        <div className={`fixed inset-0 z-[60] flex items-center justify-center p-4 transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className={`bg-background w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl relative flex flex-col md:flex-row overflow-hidden transition-all duration-300 transform ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>

                {/* Close Button (Mobile Absolute / Desktop Absolute) */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 p-2 bg-black/10 hover:bg-black/20 text-foreground rounded-full transition-colors backdrop-blur-md"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Left Column: Images */}
                <div className="w-full md:w-1/2 bg-secondary/30 p-6 md:p-8 flex flex-col justify-between relative">
                    <div className="relative aspect-square w-full rounded-2xl overflow-hidden shadow-lg mb-4 bg-white">
                        <Image
                            src={product.image}
                            alt={product.title}
                            fill
                            className="object-cover"
                        />
                        {product.isUrgent && (
                            <span className="absolute top-4 left-4 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded shadow-lg animate-pulse">
                                URGENT
                            </span>
                        )}
                    </div>

                    {/* Thumbnails (Mockup) */}
                    <div className="grid grid-cols-4 gap-3">
                        <div className="aspect-square rounded-lg overflow-hidden border-2 border-primary relative cursor-pointer">
                            <Image src={product.image} alt="Thumbnail 1" fill className="object-cover" />
                        </div>
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="aspect-square rounded-lg overflow-hidden border border-transparent opacity-60 hover:opacity-100 cursor-pointer transition-all bg-gray-100">
                                <Image src={`https://images.unsplash.com/photo-1550009${i}-b7d3d90920d${i}?auto=format&fit=crop&w=100&q=80`} alt="Thumbnail" fill className="object-cover" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Column: Details */}
                <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col h-full bg-background">

                    {/* Header Info */}
                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="px-2.5 py-1 rounded-full bg-secondary text-[10px] font-bold uppercase tracking-wider text-gray-500 border border-border">
                                {product.category}
                            </span>
                            {product.status && (
                                <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 text-[10px] font-bold uppercase tracking-wider">
                                    {product.status}
                                </span>
                            )}
                        </div>

                        <h2 className="text-2xl md:text-3xl font-black text-foreground mb-2 leading-tight">
                            {product.title}
                        </h2>

                        <div className="flex items-end gap-3 mb-4">
                            <span className="text-3xl font-black text-primary">₦{product.price}</span>
                            <span className="text-sm font-medium text-gray-400 mb-1.5 underline decoration-dotted">Negotiable</span>
                        </div>
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 gap-y-4 gap-x-2 mb-6 text-sm">
                        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="font-medium truncate">University Main Campus</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="font-medium truncate">{product.seller || "Student Seller"}</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                            <ShieldCheck className="w-4 h-4 text-emerald-500" />
                            <span className="font-medium text-emerald-600">Verified Student</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                            <Star className="w-4 h-4 text-orange-400 fill-orange-400" />
                            <span className="font-bold">{product.rating} <span className="text-gray-400 font-normal">(12 reviews)</span></span>
                        </div>
                    </div>

                    <div className="h-px w-full bg-gray-100 dark:bg-white/5 mb-6"></div>

                    {/* Description */}
                    <div className="mb-8">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Description</h4>
                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed line-clamp-3">
                            Ideally, this would be the full description passed down or fetched. For a quick view, we show a preview of the item's condition, features, and reason for selling. Click "View Full Details" to see more.
                        </p>
                        <button className="text-primary text-xs font-bold mt-2 flex items-center gap-1 hover:gap-2 transition-all">
                            View Full Details <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    {/* Actions - Stick to bottom on mobile? */}
                    <div className="mt-auto flex flex-col gap-3">
                        <button className="w-full py-3.5 rounded-xl bg-foreground text-background font-bold flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all shadow-xl">
                            <MessageCircle className="w-4 h-4" />
                            Message Seller
                        </button>
                        <div className="flex gap-3">
                            <button className="flex-1 py-3.5 rounded-xl bg-secondary text-foreground font-bold flex items-center justify-center gap-2 hover:bg-secondary/80 active:scale-[0.98] transition-all border border-border">
                                <Heart className="w-4 h-4" />
                                Save
                            </button>
                            <button className="py-3.5 px-4 rounded-xl bg-secondary text-foreground font-bold flex items-center justify-center hover:bg-secondary/80 active:scale-[0.98] transition-all border border-border">
                                <Share2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
