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
            <div className="flex items-center h-10 bg-secondary/50 rounded-xl border border-border/40 overflow-hidden focus-within:border-primary/30 focus-within:bg-background transition-all">
                <div className="pl-3 text-muted-foreground shrink-0">
                    <Search className="w-4 h-4" />
                </div>
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search products, sellers..."
                    className="flex-1 h-full bg-transparent outline-none text-sm px-2 placeholder:text-muted-foreground/60 text-foreground"
                />
                {query && (
                    <button
                        type="button"
                        onClick={() => { setQuery(""); inputRef.current?.focus(); }}
                        className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
                <button
                    type="submit"
                    className="h-full px-4 bg-primary text-white text-xs font-bold rounded-r-xl hover:bg-primary/90 transition-colors"
                >
                    Go
                </button>
            </div>
        </form>
    );
}
