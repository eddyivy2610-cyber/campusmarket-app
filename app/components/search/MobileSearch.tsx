"use client";

import { useState, useRef } from "react";
import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";

/**
 * Lightweight full-width search bar for mobile header.
 * Desktop uses IntelligentSearch instead.
 */
export function MobileSearch() {
    const [query, setQuery] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/listings?q=${encodeURIComponent(query.trim())}`);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="relative w-full">
            <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products, sellers..."
                className="w-full bg-white border border-border/80 shadow-sm rounded-full py-3 pl-5 pr-14 text-sm font-heading focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 transition-shadow text-foreground placeholder:text-muted-foreground/60"
            />
            {query && (
                <button
                    type="button"
                    onClick={() => { setQuery(""); inputRef.current?.focus(); }}
                    className="absolute right-12 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            )}
            <button
                type="submit"
                className="absolute right-2 top-2 w-8 h-8 bg-orange-400 hover:bg-orange-500 rounded-full flex items-center justify-center text-white transition-colors shadow-md shadow-orange-500/20 active:scale-[0.98]"
            >
                <Search className="w-4 h-4 font-bold" />
            </button>
        </form>
    );
}
