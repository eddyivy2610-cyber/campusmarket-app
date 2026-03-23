"use client";

import Link from "next/link";
import { 
    Package, 
    ShoppingCart, 
    MessageSquare, 
    Search as SearchIcon,
    ArrowRight
} from "lucide-react";

interface SearchResult {
    id: string | number;
    type: "product" | "order" | "message";
    title: string;
    subtitle: string;
    href: string;
    image?: string;
}

interface SearchDropdownProps {
    results: SearchResult[];
    isVisible: boolean;
    onClose: () => void;
    query: string;
}

export function SearchDropdown({ results, isVisible, onClose, query }: SearchDropdownProps) {
    if (!isVisible || !query) return null;

    const categories = {
        product: results.filter(r => r.type === "product"),
        order: results.filter(r => r.type === "order"),
        message: results.filter(r => r.type === "message"),
    };

    return (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#262B52] border border-border/40 rounded-2xl shadow-2xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="max-h-[min(70vh,500px)] overflow-y-auto no-scrollbar pb-2">
                {results.length === 0 ? (
                    <div className="p-8 text-center">
                        <div className="w-12 h-12 bg-secondary/50 rounded-full flex items-center justify-center mx-auto mb-3">
                            <SearchIcon className="w-6 h-6 text-muted-foreground/40" />
                        </div>
                        <p className="text-sm font-medium text-foreground">No results found for "{query}"</p>
                        <p className="text-xs text-muted-foreground mt-1">Try a different keyword</p>
                    </div>
                ) : (
                    <div className="p-2 space-y-4">
                        {Object.entries(categories).map(([type, items]) => (
                            items.length > 0 && (
                                <div key={type} className="space-y-1">
                                    <div className="px-3 py-1 flex items-center justify-between">
                                        <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 flex items-center gap-1.5">
                                            {type === "product" && <Package className="w-3 h-3" />}
                                            {type === "order" && <ShoppingCart className="w-3 h-3" />}
                                            {type === "message" && <MessageSquare className="w-3 h-3" />}
                                            {type}s
                                        </h3>
                                        <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded text-muted-foreground font-medium">
                                            {items.length}
                                        </span>
                                    </div>
                                    <div className="space-y-0.5">
                                        {items.map((item) => (
                                            <Link
                                                key={`${item.type}-${item.id}`}
                                                href={item.href}
                                                onClick={onClose}
                                                className="flex items-center gap-3 p-2 rounded-xl h-14 hover:bg-secondary/80 transition-all group"
                                            >
                                                {item.image ? (
                                                    <img 
                                                        src={item.image} 
                                                        alt="" 
                                                        className="w-10 h-10 rounded-lg object-cover border border-border/10"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                                                        {item.type === "product" && <Package className="w-5 h-5 text-muted-foreground" />}
                                                        {item.type === "order" && <ShoppingCart className="w-5 h-5 text-muted-foreground" />}
                                                        {item.type === "message" && <MessageSquare className="w-5 h-5 text-muted-foreground" />}
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
                                                        {item.title}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground truncate opacity-70">
                                                        {item.subtitle}
                                                    </p>
                                                </div>
                                                <ArrowRight className="w-4 h-4 text-muted-foreground/20 group-hover:text-primary group-hover:translate-x-0.5 transition-all opacity-0 group-hover:opacity-100" />
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )
                        ))}
                    </div>
                )}
            </div>
            
            <div className="p-3 bg-secondary/30 border-t border-border/40 flex items-center justify-between">
                <p className="text-[10px] text-muted-foreground">
                    Tip: Search for product names, customers, or message content
                </p>
                <div className="flex items-center gap-2">
                     <kbd className="px-1.5 py-0.5 rounded border border-border/60 bg-background text-[9px] font-sans text-muted-foreground shadow-sm">ESC</kbd>
                     <span className="text-[9px] text-muted-foreground">to close</span>
                </div>
            </div>
        </div>
    );
}
