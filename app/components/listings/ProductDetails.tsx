"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface ProductDetailsProps {
    description: string;
    specs: Record<string, string>;
}

export function ProductDetails({ description, specs }: ProductDetailsProps) {
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

    return (
        <div className="space-y-10">
            {/* Description Section */}
            <div className="relative">
                <div
                    className={`text-foreground/70 leading-relaxed text-sm font-medium whitespace-pre-line transition-all duration-500 overflow-hidden ${!isDescriptionExpanded ? "max-h-32 md:max-h-none mb-0" : "max-h-[2000px] mb-6"
                        }`}
                >
                    {description}
                </div>

                {!isDescriptionExpanded && (
                    <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent md:hidden" />
                )}

                <button
                    onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                    className="flex items-center gap-1.5 mt-2 text-[9px] font-bold uppercase tracking-[0.2em] text-primary hover:opacity-70 transition-opacity md:hidden"
                >
                    {isDescriptionExpanded ? (
                        <>Collapse <ChevronUp className="w-3 h-3" /></>
                    ) : (
                        <>Read More <ChevronDown className="w-3 h-3" /></>
                    )}
                </button>
            </div>
        </div>
    );
}
