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
                className="w-full bg-black/30 border border-white/20 shadow-sm rounded-md py-3 pl-5 pr-14 text-sm font-heading focus:outline-none focus:ring-2 focus:ring-white/15 focus:border-white/30 transition-shadow text-white placeholder:text-white/70"
            />
            {query && (
                <button
                    type="button"
                    onClick={() => { setQuery(""); inputRef.current?.focus(); }}
                    className="absolute right-12 top-1/2 -translate-y-1/2 p-1.5 text-white/70 hover:text-white transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            )}
            <button
                type="submit"
                className="absolute right-2 top-2 w-8 h-8 bg-brand-yellow-tint hover-bg-brand-yellow-tint-hover rounded-md flex items-center justify-center text-black transition-colors shadow-md shadow-yellow-500/20 active:scale-[0.98]"
            >
                <Search className="w-4 h-4 font-bold" />
            </button>
        </form>
    );
}
