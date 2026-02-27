"use client";

import { useState, useRef, useEffect } from "react";
import {
    Search, X, Clock, TrendingUp, ChevronRight,
    MonitorSmartphone, BookOpen, Home, Shirt, Sparkles,
    Dumbbell, Music, Package, Bike, Calendar, AlertCircle, Wrench,
    MoreHorizontal
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { searchProducts, searchProfiles } from "../../lib/searchUtils";
import { PRODUCTS, Product, CATEGORIES } from "../../data/products";
import { PROFILES, Profile } from "../../data/profiles";
import { useClickOutside } from "../../hooks/useClickOutside";
import { AnimatePresence, motion } from "framer-motion";

const IconMap: { [key: string]: any } = {
    MonitorSmartphone, BookOpen, Home, Shirt, Sparkles,
    Dumbbell, Music, Package, Bike, Calendar, AlertCircle, Wrench,
    MoreHorizontal
};

export function IntelligentSearch() {
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [productResults, setProductResults] = useState<Product[]>([]);
    const [profileResults, setProfileResults] = useState<Profile[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useClickOutside(wrapperRef, () => setIsOpen(false));

    useEffect(() => {
        // Load recent searches on mount
        const saved = localStorage.getItem("recentSearches");
        if (saved) {
            setRecentSearches(JSON.parse(saved));
        }
    }, []);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);
        setIsOpen(true);

        if (value.trim().length > 0) {
            const products = searchProducts(value, PRODUCTS);
            const profiles = searchProfiles(value, PROFILES);
            setProductResults(products);
            setProfileResults(profiles);
        } else {
            setProductResults([]);
            setProfileResults([]);
        }
    };

    const addToRecent = (term: string) => {
        const newRecent = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
        setRecentSearches(newRecent);
        localStorage.setItem("recentSearches", JSON.stringify(newRecent));
    };

    const handleSelect = (term: string) => {
        setQuery(term);
        addToRecent(term);
        setIsOpen(false);
        router.push(`/listings?q=${encodeURIComponent(term)}`);
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            handleSelect(query);
        }
    };

    const clearRecent = () => {
        setRecentSearches([]);
        localStorage.removeItem("recentSearches");
    };

    return (
        <div ref={wrapperRef} className="relative w-full hidden md:block group z-50">
            {/* Search Input */}
            <form
                onSubmit={handleSearchSubmit}
                className={`
                flex items-center w-full h-12 bg-secondary/50 rounded-2xl overflow-hidden transition-all duration-300 
                border border-transparent
                ${isOpen ? 'bg-background ring-2 ring-primary/10 border-primary/20 shadow-lg rounded-b-none' : 'focus-within:ring-2 focus-within:ring-primary/10 focus-within:bg-background focus-within:border-primary/20'}
            `}>
                <div className="pl-5 pr-3 text-muted-foreground">
                    <Search className="w-5 h-5" />
                </div>

                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={handleSearch}
                    onFocus={() => setIsOpen(true)}
                    placeholder="Search for products, brands and more..."
                    className="flex-1 h-full bg-transparent outline-none text-sm placeholder:text-muted-foreground/70 text-foreground font-heading w-full"
                />

                {query && (
                    <button
                        type="button"
                        onClick={() => { setQuery(""); setProductResults([]); setProfileResults([]); inputRef.current?.focus(); }}
                        className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}

                <button type="submit" className="h-8 w-8 mr-2 bg-orange-400 hover:bg-orange-500 rounded-full flex items-center justify-center text-white transition-colors shadow-md shadow-orange-500/20 active:scale-[0.98] shrink-0">
                    <Search className="w-4 h-4 font-bold" />
                </button>
            </form>

            {/* Dropdown Results */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-12 left-0 right-0 bg-background border border-t-0 border-primary/20 rounded-b-2xl shadow-xl overflow-hidden max-h-[70vh] overflow-y-auto custom-scrollbar"
                    >
                        {query.trim().length === 0 ? (
                            // Default State: Recent & Trending
                            <div className="p-4">
                                {recentSearches.length > 0 && (
                                    <div className="mb-6">
                                        <div className="flex items-center justify-between mb-2 px-2">
                                            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Recent Searches</h3>
                                            <button onClick={clearRecent} className="text-[10px] text-primary hover:underline">Clear All</button>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {recentSearches.map(term => (
                                                <button
                                                    key={term}
                                                    onClick={() => handleSelect(term)}
                                                    className="flex items-center gap-2 px-3 py-1.5 bg-secondary/50 hover:bg-secondary rounded-lg text-sm text-foreground transition-colors"
                                                >
                                                    <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                                                    {term}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 px-2">Popular Categories</h3>
                                    <div className="grid grid-cols-5 gap-2">
                                        {CATEGORIES.filter(c => ["Fashion", "Electronics", "Personal Care", "Services"].includes(c.name)).map(cat => {
                                            const Icon = IconMap[cat.lucideIcon || "Package"];
                                            return (
                                                <Link
                                                    key={cat.name}
                                                    href={`/categories?category=${encodeURIComponent(cat.name)}`}
                                                    onClick={() => setIsOpen(false)}
                                                    className="flex flex-col items-center justify-center p-3 hover:bg-secondary/50 rounded-xl transition-colors text-center group border border-transparent hover:border-primary/20"
                                                >
                                                    <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center mb-2 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                                        <Icon className="w-5 h-5" />
                                                    </div>
                                                    <span className="text-[10px] font-bold text-foreground truncate w-full">{cat.name}</span>
                                                </Link>
                                            );
                                        })}
                                        {/* Others Category */}
                                        <Link
                                            href="/categories"
                                            onClick={() => setIsOpen(false)}
                                            className="flex flex-col items-center justify-center p-3 hover:bg-secondary/50 rounded-xl transition-colors text-center group border border-transparent hover:border-primary/20"
                                        >
                                            <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center mb-2 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                                <MoreHorizontal className="w-5 h-5" />
                                            </div>
                                            <span className="text-[10px] font-bold text-foreground truncate w-full">Others</span>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // Search Results State
                            <div className="py-2">
                                {(profileResults.length > 0 || productResults.length > 0) ? (
                                    <>
                                        {profileResults.length > 0 && (
                                            <>
                                                <div className="px-4 py-2 border-b border-border/40 bg-secondary/20">
                                                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Profiles</h3>
                                                </div>
                                                <ul>
                                                    {profileResults.slice(0, 3).map(profile => (
                                                        <li key={profile.id}>
                                                            <Link
                                                                href={`/profile/${profile.handle}`}
                                                                className="flex items-center gap-4 px-4 py-3 hover:bg-secondary/50 transition-colors group"
                                                                onClick={() => addToRecent(query)}
                                                            >
                                                                <div className="w-10 h-10 rounded-full bg-secondary relative overflow-hidden shadow-sm border border-border/50">
                                                                    <Image
                                                                        src={profile.avatar}
                                                                        alt={profile.name}
                                                                        fill
                                                                        className="object-cover"
                                                                    />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-2">
                                                                        <h4 className="font-bold text-foreground text-sm truncate group-hover:text-primary transition-colors">{profile.name}</h4>
                                                                        <span className="text-xs text-muted-foreground bg-secondary px-1.5 rounded-sm">{profile.handle}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                                                        <span className="truncate max-w-[200px]">{profile.bio}</span>
                                                                        <span className="w-1 h-1 rounded-full bg-border" />
                                                                        <div className="flex items-center gap-0.5">
                                                                            <span className="text-yellow-500">★</span>
                                                                            <span>{profile.rating}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                                            </Link>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </>
                                        )}

                                        {productResults.length > 0 && (
                                            <>
                                                <div className="px-4 py-2 border-b border-border/40 bg-secondary/20 border-t">
                                                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Products</h3>
                                                </div>
                                                <ul>
                                                    {productResults.slice(0, 5).map(product => (
                                                        <li key={product.id}>
                                                            <Link
                                                                href={`/shop/${product.id}`}
                                                                className="flex items-center gap-4 px-4 py-3 hover:bg-secondary/50 transition-colors group"
                                                                onClick={() => addToRecent(query)}
                                                            >
                                                                <div className="relative w-12 h-10 rounded-lg overflow-hidden bg-secondary">
                                                                    <Image
                                                                        src={product.image}
                                                                        alt={product.title}
                                                                        fill
                                                                        className="object-cover"
                                                                    />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <h4 className="font-bold text-foreground text-sm truncate group-hover:text-primary transition-colors">{product.title}</h4>
                                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                                        <span>{product.category}</span>
                                                                        <span className="w-1 h-1 rounded-full bg-border" />
                                                                        <span>{product.condition}</span>
                                                                    </div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <span className="font-bold text-primary text-sm">₦{product.price.toLocaleString()}</span>
                                                                </div>
                                                                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                                            </Link>
                                                        </li>
                                                    ))}
                                                </ul>
                                                <div className="p-2 border-t border-border/40">
                                                    <button
                                                        onClick={() => handleSelect(query)}
                                                        className="w-full py-2 text-center text-sm font-bold text-primary hover:bg-primary/5 rounded-lg transition-colors"
                                                    >
                                                        See all {productResults.length + profileResults.length} results
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </>
                                ) : (
                                    // No Results
                                    <div className="p-8 text-center flex flex-col items-center">
                                        <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mb-3">
                                            <Search className="w-6 h-6 text-muted-foreground" />
                                        </div>
                                        <h3 className="font-bold text-foreground mb-1">No results found</h3>
                                        <p className="text-muted-foreground text-sm mb-4">
                                            We couldn't find matches for "{query}".
                                        </p>
                                        <div className="flex flex-wrap justify-center gap-2">
                                            <span className="text-xs text-muted-foreground">Try searching for:</span>
                                            {['Laptop', 'Phone', 'Desk', 'Notes'].map(term => (
                                                <button
                                                    key={term}
                                                    onClick={() => { setQuery(term); handleSelect(term); }}
                                                    className="text-xs font-bold text-primary hover:underline"
                                                >
                                                    {term}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
