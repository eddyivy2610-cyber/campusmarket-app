"use client";

import React, { useState } from "react";
import Image, { ImageProps } from "next/image";
import { cn } from "@/lib/utils";

interface OptimizedImageProps extends Omit<ImageProps, "onLoadingComplete" | "onLoad"> {
    fallbackSrc?: string;
    containerClassName?: string;
}

export function OptimizedImage({
    src,
    alt,
    className,
    containerClassName,
    fallbackSrc = "/placeholder-product.png",
    ...props
}: OptimizedImageProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);

    return (
        <div className={cn("relative overflow-hidden bg-muted/20", containerClassName)}>
            {/* Shimmer Placeholder */}
            {isLoading && (
                <div className="absolute inset-0 z-10 animate-shimmer" />
            )}

            <Image
                src={error ? fallbackSrc : src}
                alt={alt}
                className={cn(
                    "transition-all duration-700 ease-in-out",
                    isLoading ? "scale-105 blur-sm opacity-0" : "scale-100 blur-0 opacity-100",
                    className
                )}
                onLoad={() => setIsLoading(false)}
                onError={() => {
                    setError(true);
                    setIsLoading(false);
                }}
                {...props}
            />
        </div>
    );
}
