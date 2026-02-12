"use client";

import { X } from "lucide-react";
import { useState } from "react";

export function TopBar() {
    const [isVisible, setIsVisible] = useState(true);

    if (!isVisible) return null;

    return (
        <div className="bg-primary text-primary-foreground text-xs font-bold py-1.5 px-4 flex items-center justify-between relative z-50">
            <div className="flex-1 text-center">
                <span className="opacity-90">🚀 Valentine's Special: </span>
                <span className="underline decoration-white/50 hover:decoration-white cursor-pointer ml-1">
                    Get 50% off select listings today!
                </span>
            </div>
            <button
                onClick={() => setIsVisible(false)}
                className="opacity-70 hover:opacity-100 transition-opacity absolute right-4"
            >
                <X className="w-3.5 h-3.5" />
            </button>
        </div>
    );
}
