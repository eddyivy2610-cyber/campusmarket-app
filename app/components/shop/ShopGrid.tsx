"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { ProductCard } from "./ProductCard";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { Product, CATEGORIES } from "../../data/products";
import { motion, Variants } from "framer-motion";

/* ─── Types ─────────────────────────────────────── */
interface ShopGridProps {
    products: Product[];
    viewAs?: "private" | "public";
    selectedCategories?: string[];
    setSelectedCategories?: (cats: string[]) => void;
    setPriceRange?: (range: { min: number; max: number }) => void;
}

const CONDITIONS = ["Brand New", "Like New", "Used - Good", "Refurbished"];

/* ─── Filter Pill with portal dropdown ─────────── */
function FilterPill({ label, children }: { label: string; children: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const [pos, setPos] = useState({ top: 0, left: 0 });
    const btnRef = useRef<HTMLButtonElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);

    // Position the portal panel under the button
    const reposition = useCallback(() => {
        if (!btnRef.current) return;
        const r = btnRef.current.getBoundingClientRect();
        const PANEL_WIDTH = 200;
        const GUTTER = 8;
        const rawLeft = r.left + window.scrollX;
        const maxLeft = window.innerWidth + window.scrollX - PANEL_WIDTH - GUTTER;
        setPos({
            top: r.bottom + window.scrollY + 6,
            left: Math.min(rawLeft, maxLeft),
        });
    }, []);

    useEffect(() => {
        if (open) reposition();
    }, [open, reposition]);

    // Close on outside click
    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            if (
                btnRef.current?.contains(e.target as Node) ||
                panelRef.current?.contains(e.target as Node)
            ) return;
            setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    return (
        <>
            <button
                ref={btnRef}
                onClick={() => setOpen((v) => !v)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full border text-[11px] font-bold transition-all whitespace-nowrap shrink-0 ${open
                    ? "bg-primary text-white border-primary"
                    : "bg-card border-border/50 text-foreground hover:border-primary/40"
                    }`}
            >
                {label}
                <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
            </button>

            {open && typeof document !== "undefined" &&
                createPortal(
                    <div
                        ref={panelRef}
                        style={{ position: "absolute", top: pos.top, left: pos.left, zIndex: 9999 }}
                        className="bg-background border border-border/50 rounded-xl shadow-2xl min-w-[190px] p-3 space-y-2"
                    >
                        {children}
                    </div>,
                    document.body
                )
            }
        </>
    );
}

const SORT_OPTIONS = ["Newest", "Popular", "Rated", "Unrated"] as const;

/* ─── ShopGrid ──────────────────────────────────── */
export function ShopGrid({
    products,
    viewAs = "public",
    selectedCategories = [],
    setSelectedCategories,
    setPriceRange,
}: ShopGridProps) {
    const isHost = viewAs === "private";

    const [sortLabel, setSortLabel] = useState<string>("Newest");
    // Local price state for mobile pill
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, scale: 0.95, y: 20 },
        visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
    };


    const toggleCategory = (cat: string) => {
        if (!setSelectedCategories) return;
        if (selectedCategories.includes(cat)) {
            setSelectedCategories(selectedCategories.filter((c) => c !== cat));
        } else {
            setSelectedCategories([...selectedCategories, cat]);
        }
    };

    const applyPrice = () => {
        if (!setPriceRange) return;
        const min = minPrice === "" ? 0 : parseFloat(minPrice);
        const max = maxPrice === "" ? Infinity : parseFloat(maxPrice);
        setPriceRange({ min, max });
    };

    return (
        <div className="flex-1 min-w-0">

            {/* ── Toolbar ── */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4 bg-card border border-border/40 px-3 py-2 rounded-xl">

                {/* Result count */}
                <p className="text-xs text-muted-foreground font-medium whitespace-nowrap order-1">
                    <span className="font-bold text-foreground">{products.length}</span> results
                </p>

                {/* ── Mobile-only filter pills ── */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar order-3 w-full lg:hidden">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-muted-foreground shrink-0" />

                    {/* Category pill */}
                    <FilterPill label={selectedCategories.length > 0 ? `Category (${selectedCategories.length})` : "Category"}>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Category</p>
                        <div className="space-y-1.5 max-h-48 overflow-y-auto">
                            {CATEGORIES.map((cat) => (
                                <label key={cat.name} className="flex items-center gap-2 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={selectedCategories.includes(cat.name)}
                                        onChange={() => toggleCategory(cat.name)}
                                        className="w-3.5 h-3.5 rounded border-border text-primary"
                                    />
                                    <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">{cat.name}</span>
                                </label>
                            ))}
                        </div>
                    </FilterPill>

                    {/* Price pill */}
                    <FilterPill label="Price">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Price (₦)</p>
                        <div className="flex items-center gap-1.5">
                            <input
                                type="number"
                                placeholder="Min"
                                value={minPrice}
                                onChange={(e) => setMinPrice(e.target.value)}
                                className="w-full px-2 py-1.5 bg-secondary/40 rounded-md border border-border/50 focus:border-primary/50 outline-none text-xs"
                            />
                            <span className="text-muted-foreground text-xs">–</span>
                            <input
                                type="number"
                                placeholder="Max"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(e.target.value)}
                                className="w-full px-2 py-1.5 bg-secondary/40 rounded-md border border-border/50 focus:border-primary/50 outline-none text-xs"
                            />
                        </div>
                        <button
                            onClick={applyPrice}
                            className="mt-2 w-full py-1.5 bg-primary text-white text-[10px] font-bold rounded-md uppercase tracking-wider"
                        >
                            Apply
                        </button>
                    </FilterPill>

                    {/* Condition pill */}
                    <FilterPill label="Condition">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Condition</p>
                        <div className="space-y-1.5">
                            {CONDITIONS.map((cond) => (
                                <label key={cond} className="flex items-center gap-2 cursor-pointer group">
                                    <input type="checkbox" className="w-3.5 h-3.5 rounded border-border text-primary" />
                                    <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">{cond}</span>
                                </label>
                            ))}
                        </div>
                    </FilterPill>
                </div>

                {/* ── Sort (always visible) ── */}
                <div className="flex items-center gap-2 order-2 ml-auto">
                    {isHost && (
                        <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/5 border border-primary/10 px-2 py-1 rounded-lg hidden sm:block">
                            Owner View
                        </span>
                    )}
                    <span className="text-xs text-muted-foreground hidden sm:block">Sort:</span>
                    <FilterPill label={sortLabel}>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Sort by</p>
                        {SORT_OPTIONS.map((opt) => (
                            <button
                                key={opt}
                                onClick={() => { setSortLabel(opt); }}
                                className={`block w-full text-left text-xs px-2 py-1.5 rounded-lg transition-colors ${sortLabel === opt
                                    ? "bg-primary/10 text-primary font-bold"
                                    : "text-muted-foreground hover:text-primary hover:bg-secondary/50"
                                    }`}
                            >
                                {opt}
                            </button>
                        ))}
                    </FilterPill>
                </div>
            </div>

            {/* ── Products Grid ── */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
                className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4"
            >
                {products.map((product) => (
                    <motion.div variants={itemVariants} key={product.id}>
                        <ProductCard product={product} viewAs={viewAs} />
                    </motion.div>
                ))}
                {products.length === 0 && (
                    <div className="col-span-full py-16 text-center">
                        <p className="text-muted-foreground italic">No products found matching your filters.</p>
                    </div>
                )}
            </motion.div>

            {/* ── Pagination ── */}
            <div className="flex items-center justify-center gap-1.5 mt-10">
                <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-border hover:bg-secondary transition-colors text-sm">&lt;</button>
                <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary text-white font-bold shadow-sm text-sm">1</button>
                <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-border hover:bg-secondary transition-colors text-sm">2</button>
                <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-border hover:bg-secondary transition-colors text-sm">3</button>
                <span className="px-1 text-muted-foreground text-sm">…</span>
                <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-border hover:bg-secondary transition-colors text-sm">8</button>
                <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-border hover:bg-secondary transition-colors text-sm">&gt;</button>
            </div>
        </div>
    );
}
