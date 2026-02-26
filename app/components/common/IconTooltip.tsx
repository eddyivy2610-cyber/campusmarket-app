"use client";

import React, { useState } from "react";
import { cn } from "../../lib/utils";

interface IconTooltipProps {
    children: React.ReactNode;
    content: React.ReactNode;
    position?: "top" | "bottom" | "left" | "right";
    className?: string;
    containerClassName?: string;
}

export function IconTooltip({
    children,
    content,
    position = "top",
    className,
    containerClassName,
}: IconTooltipProps) {
    const [isVisible, setIsVisible] = useState(false);

    const positionClasses = {
        top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
        bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
        left: "right-full top-1/2 -translate-y-1/2 mr-2",
        right: "left-full top-1/2 -translate-y-1/2 ml-2",
    };

    return (
        <div
            className={cn("relative inline-flex items-center justify-center cursor-help", containerClassName)}
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
            onClick={() => setIsVisible(!isVisible)}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    setIsVisible(!isVisible);
                }
            }}
            tabIndex={0}
        >
            {children}

            {/* Tooltip Wrapper */}
            <div
                className={cn(
                    "absolute z-50 px-2.5 py-1.5 text-[10px] sm:text-xs font-medium text-white whitespace-nowrap",
                    "bg-black/40 backdrop-blur-md border border-white/20 rounded-lg shadow-xl",
                    "pointer-events-none transition-all duration-200 ease-out",
                    isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95",
                    positionClasses[position],
                    className
                )}
                role="tooltip"
                aria-hidden={!isVisible}
            >
                {content}
            </div>
        </div>
    );
}
