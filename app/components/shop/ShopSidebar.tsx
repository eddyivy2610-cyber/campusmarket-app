"use client";

import { useState } from "react";
import { ChevronDown, Filter } from "lucide-react";
import { CATEGORIES, PRODUCTS } from "../../data/products";

interface DropdownSectionProps {
    title: string;
    children: React.ReactNode;
}

function DropdownSection({ title, children }: DropdownSectionProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b border-border/40 last:border-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full py-2.5 px-1 text-[11px] font-black uppercase tracking-widest text-foreground hover:text-primary transition-colors"
            >
                {title}
                <ChevronDown
                    className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                />
            </button>
            {isOpen && (
                <div className="pb-3 px-1 space-y-2 text-sm">
                    {children}
                </div>
            )}
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
        <aside className="hidden lg:block w-full lg:w-48 xl:w-52 shrink-0">
            {/* Sidebar label */}
            <div className="flex items-center gap-1.5 mb-3">
                <Filter className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Filters</span>
            </div>

            <div className="bg-card border border-border/40 rounded-xl overflow-hidden divide-y divide-border/40">

                {/* Price */}
                <DropdownSection title="Price (₦)">
                    <div className="flex items-center gap-1.5">
                        <input
                            type="number"
                            placeholder="Min"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                            className="w-full px-2 py-1.5 bg-secondary/40 rounded-md border border-border/50 focus:border-primary/50 outline-none text-xs transition-all"
                        />
                        <span className="text-muted-foreground text-xs">–</span>
                        <input
                            type="number"
                            placeholder="Max"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                            className="w-full px-2 py-1.5 bg-secondary/40 rounded-md border border-border/50 focus:border-primary/50 outline-none text-xs transition-all"
                        />
                    </div>
                    <button
                        onClick={handleApplyPrice}
                        className="w-full py-1.5 mt-1 bg-secondary hover:bg-primary hover:text-white text-foreground text-[10px] font-bold rounded-md transition-colors uppercase tracking-wider"
                    >
                        Apply
                    </button>
                </DropdownSection>

                {/* Categories */}
                <DropdownSection title="Category">
                    <div className="space-y-1.5 max-h-52 overflow-y-auto pr-0.5">
                        {CATEGORIES.map((cat) => (
                            <label key={cat.name} className="flex items-center gap-2 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={selectedCategories.includes(cat.name)}
                                    onChange={() => handleCategoryToggle(cat.name)}
                                    className="w-3.5 h-3.5 rounded border-border text-primary focus:ring-primary/20 shrink-0"
                                />
                                <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors flex-1 truncate">
                                    {cat.name}
                                </span>
                                <span className="text-[10px] text-muted-foreground/40 shrink-0">
                                    {PRODUCTS.filter(p => p.category === cat.name).length}
                                </span>
                            </label>
                        ))}
                    </div>
                </DropdownSection>

                {/* Condition */}
                <DropdownSection title="Condition">
                    {["Brand New", "Like New", "Used - Good", "Refurbished"].map((cond) => (
                        <label key={cond} className="flex items-center gap-2 cursor-pointer group">
                            <input type="checkbox" className="w-3.5 h-3.5 rounded border-border text-primary focus:ring-primary/20 shrink-0" />
                            <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">{cond}</span>
                        </label>
                    ))}
                </DropdownSection>

                {/* Rating */}
                <DropdownSection title="Rating">
                    {[5, 4, 3, 2].map((star) => (
                        <label key={star} className="flex items-center gap-2 cursor-pointer group">
                            <input type="checkbox" className="w-3.5 h-3.5 rounded border-border text-primary focus:ring-primary/20 shrink-0" />
                            <div className="flex gap-px text-yellow-400">
                                {[...Array(5)].map((_, i) => (
                                    <svg key={i} className={`w-3 h-3 ${i < star ? "fill-current" : "text-gray-200 fill-current"}`} viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                ))}
                            </div>
                            <span className="text-[10px] text-muted-foreground">& up</span>
                        </label>
                    ))}
                </DropdownSection>

            </div>
        </aside>
    );
}
