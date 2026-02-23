"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Maximize2, ChevronLeft, ChevronRight } from "lucide-react";

interface ProductGalleryProps {
    images: string[];
}

export function ProductGallery({ images }: ProductGalleryProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);

    if (!images || images.length === 0) return null;

    const nextImage = () => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = () => {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    return (
        <div className="space-y-4">
            {/* Main Stage */}
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-secondary/30 group border border-border/40">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="w-full h-full cursor-zoom-in"
                        onClick={() => setIsLightboxOpen(true)}
                    >
                        <Image
                            src={images[currentIndex]}
                            alt="Product Image"
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            priority
                        />
                    </motion.div>
                </AnimatePresence>

                {/* Photo Counter */}
                <div className="absolute top-4 right-4 z-10 px-3 py-1 bg-black/40 backdrop-blur-md rounded-full border border-white/10 flex items-center gap-1.5 shadow-lg group-hover:scale-105 transition-transform duration-300">
                    <div className="w-1 h-1 bg-white rounded-full animate-pulse" />
                    <span className="text-[10px] font-bold text-white uppercase tracking-widest leading-none">
                        {currentIndex + 1} / {images.length}
                    </span>
                </div>

                {/* Navigation Arrows */}
                {images.length > 1 && (
                    <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <button
                            onClick={(e) => { e.stopPropagation(); prevImage(); }}
                            className="w-10 h-10 rounded-full bg-white/90 shadow-xl flex items-center justify-center text-foreground hover:bg-white active:scale-95 transition-all pointer-events-auto"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); nextImage(); }}
                            className="w-10 h-10 rounded-full bg-white/90 shadow-xl flex items-center justify-center text-foreground hover:bg-white active:scale-95 transition-all pointer-events-auto"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {/* Fullscreen Trigger */}
                <button
                    onClick={() => setIsLightboxOpen(true)}
                    className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/90 shadow-xl flex items-center justify-center text-foreground opacity-0 group-hover:opacity-100 transition-all hover:bg-white active:scale-95"
                >
                    <Maximize2 className="w-4 h-4" />
                </button>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                    {images.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            className={`relative w-16 aspect-square rounded-xl overflow-hidden border-2 transition-all shrink-0 ${currentIndex === idx ? "border-primary shadow-sm scale-95" : "border-transparent opacity-60 hover:opacity-100"
                                }`}
                        >
                            <Image src={img} alt={`Thumb ${idx}`} fill className="object-cover" />
                        </button>
                    ))}
                </div>
            )}

            {/* Lightbox / Fullscreen Overlay (Simplified for now) */}
            <AnimatePresence>
                {isLightboxOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 md:p-8"
                        onClick={() => setIsLightboxOpen(false)}
                    >
                        <button className="absolute top-8 right-8 text-white text-sm font-bold tracking-widest uppercase hover:opacity-70 transition-opacity">
                            Close
                        </button>
                        <div className="relative w-full h-full max-w-6xl max-h-[80vh]">
                            <Image
                                src={images[currentIndex]}
                                alt="Main View"
                                fill
                                className="object-contain"
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
