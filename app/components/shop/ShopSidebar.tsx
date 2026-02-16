"use client";

import { useState } from "react";
import { Filter, ChevronDown, ChevronUp } from "lucide-react";
import { CATEGORIES, PRODUCTS } from "../../data/products";

interface FilterSectionProps {
    title: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
}

function FilterSection({ title, children, defaultOpen = true }: FilterSectionProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="border-b border-border/50 py-5 last:border-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full font-bold font-heading text-sm text-foreground hover:text-primary transition-colors mb-4"
            >
                {title}
                {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>
            {isOpen && <div className="space-y-3 animation-fade-in">{children}</div>}
        </div>
    );
}

interface ShopSidebarProps {
    selectedCategories: string[];
    setSelectedCategories: (categories: string[]) => void;
    setPriceRange: (range: { min: number; max: number }) => void;
}

export function ShopSidebar({ selectedCategories, setSelectedCategories, setPriceRange }: ShopSidebarProps) {
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");

    const handleCategoryToggle = (category: string) => {
        if (selectedCategories.includes(category)) {
            setSelectedCategories(selectedCategories.filter(c => c !== category));
        } else {
            setSelectedCategories([...selectedCategories, category]);
        }
    };

    const handleApplyPrice = () => {
        const min = minPrice === "" ? 0 : parseFloat(minPrice);
        const max = maxPrice === "" ? Infinity : parseFloat(maxPrice);
        setPriceRange({ min, max });
    };

    return (
        <aside className="w-full lg:w-64 shrink-0 space-y-2">

            <div className="flex items-center gap-2 pb-4 mb-2 border-b border-border/50 lg:hidden">
                <Filter className="w-4 h-4" />
                <span className="font-bold">Filters</span>
            </div>

            {/* Price Filter - Text Inputs */}
            <FilterSection title="Price (₦)">
                <div className="flex items-center gap-2">
                    <div className="flex-1">
                        <input
                            type="number"
                            placeholder="Min"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                            className="w-full px-3 py-2 bg-secondary/30 rounded-lg border border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/10 outline-none text-sm font-medium transition-all"
                        />
                    </div>
                    <span className="text-muted-foreground">-</span>
                    <div className="flex-1">
                        <input
                            type="number"
                            placeholder="Max"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                            className="w-full px-3 py-2 bg-secondary/30 rounded-lg border border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/10 outline-none text-sm font-medium transition-all"
                        />
                    </div>
                </div>
                <button
                    onClick={handleApplyPrice}
                    className="w-full mt-2 py-2 bg-secondary hover:bg-primary hover:text-white text-foreground text-xs font-bold rounded-lg transition-colors uppercase tracking-wider"
                >
                    Apply Price
                </button>
            </FilterSection>

            {/* Categories */}
            <FilterSection title="Categories">
                {CATEGORIES.map((cat) => (
                    <label key={cat.name} className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative flex items-center">
                            <input
                                type="checkbox"
                                checked={selectedCategories.includes(cat.name)}
                                onChange={() => handleCategoryToggle(cat.name)}
                                className="peer w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/20"
                            />
                        </div>
                        <span className="text-sm text-muted-foreground group-hover:text-primary transition-colors">{cat.name}</span>
                        <span className="ml-auto text-xs text-muted-foreground/50">
                            ({PRODUCTS.filter(p => p.category === cat.name).length})
                        </span>
                    </label>
                ))}
            </FilterSection>

            {/* Condition */}
            <FilterSection title="Condition">
                {['Brand New', 'Like New', 'Used - Good', 'Refurbished'].map((cond) => (
                    <label key={cond} className="flex items-center gap-3 cursor-pointer group">
                        <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/20" />
                        <span className="text-sm text-muted-foreground group-hover:text-primary transition-colors">{cond}</span>
                    </label>
                ))}
            </FilterSection>

            {/* Rating */}
            <FilterSection title="Rating">
                {[5, 4, 3, 2, 1].map((star) => (
                    <label key={star} className="flex items-center gap-2 cursor-pointer group">
                        <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/20" />
                        <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                                <svg key={i} className={`w-3.5 h-3.5 ${i < star ? 'fill-current' : 'text-gray-200 fill-current'}`} viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            ))}
                        </div>
                        <span className="text-xs text-muted-foreground">& Up</span>
                    </label>
                ))}
            </FilterSection>

        </aside>
    );
}
