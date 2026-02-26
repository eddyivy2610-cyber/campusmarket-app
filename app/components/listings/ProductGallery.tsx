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
    const [direction, setDirection] = useState(0);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);

    if (!images || images.length === 0) return null;

    const nextImage = () => {
        setDirection(1);
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = () => {
        setDirection(-1);
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    return (
        <div className="space-y-4">
            {/* Main Stage - Peeking Carousel */}
            <div className="relative w-full h-[250px] sm:h-[320px] rounded-3xl overflow-hidden group flex items-center justify-center bg-secondary/10 border border-border/40">

                {/* Background Side Images */}
                {images.length > 1 && (
                    <>
                        <div
                            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-[20%] w-[50%] h-[75%] opacity-40 blur-[2px] rounded-3xl overflow-hidden transition-all duration-500 cursor-pointer hover:opacity-60"
                            onClick={(e) => { e.stopPropagation(); prevImage(); }}
                        >
                            <Image
                                src={images[(currentIndex - 1 + images.length) % images.length]}
                                alt="Previous Image"
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div
                            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-[20%] w-[50%] h-[75%] opacity-40 blur-[2px] rounded-3xl overflow-hidden transition-all duration-500 cursor-pointer hover:opacity-60"
                            onClick={(e) => { e.stopPropagation(); nextImage(); }}
                        >
                            <Image
                                src={images[(currentIndex + 1) % images.length]}
                                alt="Next Image"
                                fill
                                className="object-cover"
                            />
                        </div>
                    </>
                )}

                {/* Center Image */}
                <AnimatePresence mode="popLayout" custom={direction}>
                    <motion.div
                        key={currentIndex}
                        custom={direction}
                        initial={{ opacity: 0, x: direction > 0 ? 100 : -100, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: direction > 0 ? -100 : 100, scale: 0.95 }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        className="relative z-10 w-[75%] sm:w-[65%] h-[90%] bg-background rounded-3xl border border-border/40 shadow-2xl overflow-hidden cursor-zoom-in"
                        onClick={() => setIsLightboxOpen(true)}
                    >
                        <Image
                            src={images[currentIndex]}
                            alt="Product Image"
                            fill
                            className="object-cover"
                            priority
                        />
                    </motion.div>
                </AnimatePresence>

                {/* Photo Counter */}
                <div className="absolute top-4 right-4 z-20 px-3 py-1 bg-black/40 backdrop-blur-md rounded-full border border-white/10 flex items-center gap-1.5 shadow-lg group-hover:scale-105 transition-transform duration-300">
                    <div className="w-1 h-1 bg-white rounded-full animate-pulse" />
                    <span className="text-[10px] font-bold text-white uppercase tracking-widest leading-none">
                        {currentIndex + 1} / {images.length}
                    </span>
                </div>

                {/* Navigation Arrows */}
                {images.length > 1 && (
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-between px-4 sm:px-8 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30">
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
                    className="absolute top-4 left-4 z-20 w-10 h-10 rounded-full bg-white/90 shadow-xl flex items-center justify-center text-foreground opacity-0 group-hover:opacity-100 transition-all hover:bg-white active:scale-95"
                >
                    <Maximize2 className="w-4 h-4" />
                </button>
            </div>

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
