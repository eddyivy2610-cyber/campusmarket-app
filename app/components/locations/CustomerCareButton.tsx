"use client";

import { Headset } from "lucide-react";
import { Tooltip } from "../shared/Tooltip";

export function CustomerCareButton() {
    return (
        <div className="fixed bottom-8 left-8 z-50">
            <Tooltip content="Need Help? Chat with us!">
                <button className="p-3.5 bg-foreground text-background rounded-full shadow-xl hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center group relative overflow-hidden">
                    <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Headset className="w-5 h-5" />
                </button>
            </Tooltip>
        </div>
    );
}
