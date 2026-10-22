"use client";

import { ReactNode } from "react";

interface TooltipProps {
    children: ReactNode;
    content: string;
    position?: "top" | "bottom" | "left" | "right";
    bgClass?: string;
}

export function Tooltip({ children, content, position = "bottom", bgClass = "bg-foreground" }: TooltipProps) {
    const positionClasses = {
        top: "bottom-full mb-2 left-1/2 -translate-x-1/2",
        bottom: "top-full mt-2 left-1/2 -translate-x-1/2",
        left: "right-full mr-2 top-1/2 -translate-y-1/2",
        right: "left-full ml-2 top-1/2 -translate-y-1/2"
    };

    const arrowClasses = {
        top: "top-full left-1/2 -translate-x-1/2 border-t-current border-l-transparent border-r-transparent border-b-transparent",
        bottom: "bottom-full left-1/2 -translate-x-1/2 border-b-current border-l-transparent border-r-transparent border-t-transparent",
        left: "left-full top-1/2 -translate-y-1/2 border-l-current border-t-transparent border-b-transparent border-r-transparent",
        right: "right-full top-1/2 -translate-y-1/2 border-r-current border-t-transparent border-b-transparent border-l-transparent"
    };

    return (
        <div className="relative group/tooltip flex items-center justify-center">
            {children}
            <div className={`absolute ${positionClasses[position]} px-3 py-1.5 ${bgClass} text-background text-[10px] font-bold rounded shadow-xl opacity-0 scale-95 group-hover/tooltip:opacity-100 group-hover/tooltip:scale-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50`}>
                {content}
                {/* Arrow */}
                <div className={`absolute border-4 ${arrowClasses[position]} ${bgClass.replace('bg-', 'text-')}`} />
            </div>
        </div>
    );
}
