import { useState } from "react";
import { Filter, Check } from "lucide-react";

export function ExploreSidebar() {
    const categories = [
        { name: "All Categories", count: 128 },
        { name: "Phones & Gadgets", count: 42 },
        { name: "Laptops & PCs", count: 12 },
        { name: "Hostel Essentials", count: 31 },
        { name: "Fashion & Wears", count: 22 },
        { name: "Books & Materials", count: 15 },
    ];

    const conditions = ["New", "Fairly Used", "Used"];
    const locations = ["Hostel Area", "Faculty Area", "Off Campus", "Anywhere"];
    const tags = ["Urgent Sale", "Negotiable", "Verified Seller"];

    return (
        <aside className="w-full space-y-8 p-1">

            {/* Header */}
            <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <Filter className="w-4 h-4" />
                </div>
                <h2 className="font-bold text-foreground tracking-tight">Filters</h2>
            </div>

            {/* Categories */}
            <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Category</h3>
                <ul className="space-y-2">
                    {categories.map((cat, i) => (
                        <li key={i}>
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="w-4 h-4 rounded border border-border flex items-center justify-center transition-colors group-hover:border-primary">
                                    {i === 0 && <div className="w-2.5 h-2.5 bg-primary rounded-sm"></div>}
                                </div>
                                <span className={`text-sm ${i === 0 ? 'font-bold text-foreground' : 'font-medium text-gray-600 dark:text-gray-400 group-hover:text-foreground'}`}>
                                    {cat.name}
                                </span>
                                <span className="ml-auto text-[10px] font-bold text-gray-400 bg-secondary px-1.5 py-0.5 rounded">
                                    {cat.count}
                                </span>
                            </label>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Price Range */}
            <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Price Range</h3>
                <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">₦</span>
                        <input
                            type="number"
                            placeholder="Min"
                            className="w-full bg-secondary rounded-xl py-2.5 pl-7 pr-3 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>
                    <span className="text-gray-400">-</span>
                    <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">₦</span>
                        <input
                            type="number"
                            placeholder="Max"
                            className="w-full bg-secondary rounded-xl py-2.5 pl-7 pr-3 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>
                </div>
            </div>

            {/* Condition */}
            <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Condition</h3>
                <div className="space-y-2">
                    {conditions.map((cond, i) => (
                        <label key={i} className="flex items-center gap-3 cursor-pointer group">
                            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/20" />
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-foreground transition-colors">
                                {cond}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Location */}
            <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Location</h3>
                <div className="space-y-2">
                    {locations.map((loc, i) => (
                        <label key={i} className="flex items-center gap-3 cursor-pointer group">
                            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/20" />
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-foreground transition-colors">
                                {loc}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Tags */}
            <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Tags</h3>
                <div className="flex flex-wrap gap-2">
                    {tags.map((tag, i) => (
                        <button key={i} className="px-3 py-1.5 rounded-lg border border-border bg-secondary hover:bg-primary/5 hover:border-primary/20 hover:text-primary transition-all text-[11px] font-bold text-gray-600">
                            {tag}
                        </button>
                    ))}
                </div>
            </div>

            {/* Apply Button */}
            <button className="w-full py-3 bg-foreground text-background rounded-xl font-bold text-sm hover:opacity-90 active:scale-[0.98] transition-all shadow-lg mt-4">
                Apply Filters
            </button>
        </aside>
    );
}
