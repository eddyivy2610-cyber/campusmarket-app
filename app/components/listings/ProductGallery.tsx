"use client";

import React, { useState } from "react";
import Image from "next/image";

interface ProductGalleryProps {
    images: string[];
}

export function ProductGallery({ images }: ProductGalleryProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    if (!images || images.length === 0) return null;

    return (
        <div className="grid grid-cols-[68px_1fr] sm:grid-cols-[84px_1fr] gap-3 md:gap-4">
            <div className="flex flex-col gap-2">
                {images.slice(0, 4).map((image, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`relative aspect-square rounded-md overflow-hidden border transition-all ${currentIndex === index ? "border-primary ring-1 ring-primary/30" : "border-border/50 hover:border-border"
                            }`}
                    >
                        <Image
                            src={image}
                            alt={`Product thumbnail ${index + 1}`}
                            fill
                            className="object-cover"
                        />
                    </button>
                ))}
            </div>

            <div className="relative min-h-[300px] sm:min-h-[380px] lg:min-h-[460px] rounded-md overflow-hidden border border-border/50 bg-secondary/20">
                <Image
                    src={images[currentIndex]}
                    alt="Product Image"
                    fill
                    className="object-contain p-4 sm:p-6"
                    priority
                />
                <div className="absolute top-2 right-2 px-2 py-1 rounded bg-black/55 text-white text-[10px] font-semibold">
                    {currentIndex + 1}/{images.length}
                </div>
            </div>
        </div>
    );
}
