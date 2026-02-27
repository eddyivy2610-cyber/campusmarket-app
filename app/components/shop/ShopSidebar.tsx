"use client";

import { useState } from "react";
import { ChevronDown, Filter } from "lucide-react";
import { CATEGORIES, PRODUCTS } from "../../data/products";
import { CATEGORY_FILTERS, DynamicFilter } from "../../data/filters";

interface DropdownSectionProps {
    title: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
}

function DropdownSection({ title, children, defaultOpen = false }: DropdownSectionProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="border-b border-border/40 last:border-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full py-2.5 px-1 text-[11px] font-bold uppercase tracking-widest text-foreground hover:text-primary transition-colors"
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
    hideCategoriesList?: boolean;
    forcedCategory?: string | null;
}

export function ShopSidebar({ selectedCategories, setSelectedCategories, setPriceRange, hideCategoriesList, forcedCategory }: ShopSidebarProps) {
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");

    // State to hold dynamic filter selections just for UI showcase
    const [dynamicSelections, setDynamicSelections] = useState<Record<string, string[]>>({});

    const handleCategoryToggle = (category: string) => {
        if (selectedCategories.includes(category)) {
            setSelectedCategories(selectedCategories.filter(c => c !== category));
            setDynamicSelections({}); // Reset dynamic filters when category changes
        } else {
            // For a search page, usually it's better to only allow one category at a time to show specific filters
            setSelectedCategories([category]);
            setDynamicSelections({});
        }
    };

    const handleApplyPrice = () => {
        const min = minPrice === "" ? 0 : parseFloat(minPrice);
        const max = maxPrice === "" ? Infinity : parseFloat(maxPrice);
        setPriceRange({ min, max });
    };

    const handleDynamicToggle = (filterId: string, value: string) => {
        setDynamicSelections(prev => {
            const current = prev[filterId] || [];
            if (current.includes(value)) {
                return { ...prev, [filterId]: current.filter(v => v !== value) };
            } else {
                return { ...prev, [filterId]: [...current, value] };
            }
        });
    };

    const renderDynamicFilter = (filter: DynamicFilter) => {
        if (filter.type === "multi-select" || filter.type === "checkbox") {
            return (
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-0.5 custom-scrollbar">
                    {filter.options?.map((opt) => (
                        <label key={opt.value} className="flex items-center gap-2 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={(dynamicSelections[filter.id] || []).includes(opt.value)}
                                onChange={() => handleDynamicToggle(filter.id, opt.value)}
                                className="w-3.5 h-3.5 rounded border-border text-primary focus:ring-primary/20 shrink-0"
                            />
                            <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors flex-1 truncate">
                                {opt.label}
                            </span>
                        </label>
                    ))}
                </div>
            );
        } else if (filter.type === "range" && filter.rangeConfig) {
            return (
                <div className="flex items-center gap-1.5">
                    <input
                        type="number"
                        placeholder={filter.rangeConfig.minPlaceholder}
                        className="w-full px-2 py-1.5 bg-secondary/40 rounded-md border border-border/50 focus:border-primary/50 outline-none text-xs transition-all"
                    />
                    <span className="text-muted-foreground text-xs">–</span>
                    <input
                        type="number"
                        placeholder={filter.rangeConfig.maxPlaceholder}
                        className="w-full px-2 py-1.5 bg-secondary/40 rounded-md border border-border/50 focus:border-primary/50 outline-none text-xs transition-all"
                    />
                </div>
            );
        }
        return null;
    };

    const activeCategory = forcedCategory || (selectedCategories.length === 1 ? selectedCategories[0] : null);
    const dynamicFilters = activeCategory ? CATEGORY_FILTERS[activeCategory] : undefined;

    return (
        <aside className="hidden lg:block w-full lg:w-48 xl:w-52 shrink-0">
            {/* Sidebar label */}
            <div className="flex items-center gap-1.5 mb-3">
                <Filter className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Filters</span>
            </div>

            <div className="bg-card border border-border/40 rounded-xl overflow-hidden divide-y divide-border/40">

                {/* Categories - Hidden on Search Page */}
                {!hideCategoriesList && (
                    <DropdownSection title="Category" defaultOpen={true}>
                        <div className="space-y-1.5 max-h-52 overflow-y-auto pr-0.5 custom-scrollbar">
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
                )}

                {/* Price */}
                <DropdownSection title="Price (₦)" defaultOpen={true}>
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

                {/* Dynamic Filters based on Category */}
                {dynamicFilters ? (
                    dynamicFilters.map((filter) => (
                        <DropdownSection key={filter.id} title={filter.label}>
                            {renderDynamicFilter(filter)}
                        </DropdownSection>
                    ))
                ) : (
                    <>
                        {/* Fallback general filters if no single category is selected */}
                        <DropdownSection title="Condition">
                            {["Brand New", "Like New", "Used - Good", "Refurbished"].map((cond) => (
                                <label key={cond} className="flex items-center gap-2 cursor-pointer group">
                                    <input type="checkbox" className="w-3.5 h-3.5 rounded border-border text-primary focus:ring-primary/20 shrink-0" />
                                    <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">{cond}</span>
                                </label>
                            ))}
                        </DropdownSection>

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
                    </>
                )}

            </div>
        </aside>
    );
}
