"use client";

import { useState } from "react";
import { ImageUpload } from "./ImageUpload";
import { ListingHeader } from "./ListingHeader";
import { Tag, MapPin, DollarSign, ChevronRight, AlertCircle, Info } from "lucide-react";

export function ListingForm() {
    const [images, setImages] = useState<string[]>([]);
    const [title, setTitle] = useState("");
    const [price, setPrice] = useState("");
    const [isNegotiable, setIsNegotiable] = useState(false);
    const [category, setCategory] = useState("");
    const [condition, setCondition] = useState("");
    const [description, setDescription] = useState("");
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState("");
    const [location, setLocation] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const categories = [
        "Phones & Gadgets",
        "Laptops & Computers",
        "Fashion & Clothing",
        "Books & Study Materials",
        "Hostel Essentials",
        "Food & Snacks",
        "Services",
        "Electronics",
        "Other"
    ];

    const conditions = [
        { value: "new", label: "New", desc: "Unused, original packaging" },
        { value: "like-new", label: "Like New", desc: "Used once or twice" },
        { value: "used", label: "Used", desc: "Good working condition" },
        { value: "fair", label: "Fair", desc: "Acceptable, visible wear" }
    ];

    const handleAddTag = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const newTag = tagInput.trim();
            if (newTag && !tags.includes(newTag) && tags.length < 5) {
                setTags([...tags, newTag]);
                setTagInput("");
            }
        }
    };

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter(t => t !== tagToRemove));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsLoading(false);
        alert("Listing published! (Simulated)");
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl mx-auto pb-32">
            <ListingHeader />

            {/* Section 1: Images */}
            <section className="bg-card p-4 rounded-2xl border border-border shadow-sm">
                <ImageUpload images={images} onChange={setImages} />
            </section>

            {/* Section 2: Details */}
            <section className="bg-card p-4 rounded-2xl border border-border shadow-sm space-y-6">
                <div>
                    <label className="block text-sm font-medium mb-2">Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="What are you selling? (e.g. iPhone 13 Pro Max)"
                        className="w-full p-3 bg-secondary/50 rounded-xl border border-border focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground/50"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Category</label>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full p-3 bg-secondary/50 rounded-xl border border-border focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none cursor-pointer"
                        required
                    >
                        <option value="" disabled>Select a category</option>
                        {categories.map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-3">Condition</label>
                    <div className="grid grid-cols-2 gap-3">
                        {conditions.map((c) => (
                            <button
                                type="button"
                                key={c.value}
                                onClick={() => setCondition(c.value)}
                                className={`
                                    p-3 rounded-xl border text-left transition-all
                                    ${condition === c.value
                                        ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary'
                                        : 'border-border hover:border-primary/30 hover:bg-secondary/50 text-muted-foreground'}
                                `}
                            >
                                <span className="block text-sm font-bold">{c.label}</span>
                                <span className="text-[10px] opacity-80">{c.desc}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe your item clearly. Include any defects or important details."
                        className="w-full p-3 bg-secondary/50 rounded-xl border border-border focus:ring-2 focus:ring-primary/20 outline-none transition-all min-h-[120px] resize-none placeholder:text-muted-foreground/50"
                        required
                    />
                </div>
            </section>

            {/* Section 3: Price */}
            <section className="bg-card p-4 rounded-2xl border border-border shadow-sm">
                <label className="block text-sm font-medium mb-2">Price</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-muted-foreground font-bold">₦</span>
                    </div>
                    <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="0.00"
                        className="w-full pl-8 p-3 bg-secondary/50 rounded-xl border border-border focus:ring-2 focus:ring-primary/20 outline-none transition-all font-mono font-bold text-lg"
                        required
                    />
                </div>

                <div className="flex items-center gap-3 mt-4">
                    <button
                        type="button"
                        onClick={() => setIsNegotiable(!isNegotiable)}
                        className={`
                            relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                            ${isNegotiable ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}
                        `}
                    >
                        <span
                            className={`
                                inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                                ${isNegotiable ? 'translate-x-6' : 'translate-x-1'}
                            `}
                        />
                    </button>
                    <span className="text-sm text-muted-foreground">Open to negotiation</span>
                </div>
            </section>

            {/* Section 4: Tags & Location */}
            <section className="bg-card p-4 rounded-2xl border border-border shadow-sm space-y-6">
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Tags
                        <span className="text-muted-foreground font-normal ml-2 text-xs">(Enter to add)</span>
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                        {tags.map(tag => (
                            <span key={tag} className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                                #{tag}
                                <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500">
                                    <AlertCircle className="w-3 h-3 transform rotate-45" />
                                </button>
                            </span>
                        ))}
                    </div>
                    <div className="relative">
                        <Tag className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={handleAddTag}
                            placeholder="Add tags (e.g. iPhone, Urgent, Hostel)"
                            className="w-full pl-9 p-3 bg-secondary/50 rounded-xl border border-border focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                            disabled={tags.length >= 5}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Meetup Preference</label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="Where can buyers meet you? (e.g. Main Gate)"
                            className="w-full pl-9 p-3 bg-secondary/50 rounded-xl border border-border focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                            required
                        />
                    </div>
                </div>
            </section>

            {/* Guidelines */}
            <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-xl flex items-start gap-3">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <p>
                    By publishing, you agree to our listing guidelines. Please avoid prohibited items, misleading descriptions, or offensive content.
                </p>
            </div>

            {/* Bottom Actions */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border z-50 md:sticky md:bottom-4 md:bg-transparent md:border-none md:p-0">
                <div className="max-w-2xl mx-auto flex items-center gap-3">
                    <button
                        type="button"
                        className="flex-1 py-3.5 px-4 bg-secondary text-foreground font-bold rounded-xl hover:bg-secondary/80 transition-colors"
                    >
                        Preview
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-[2] py-3.5 px-4 bg-foreground text-background font-bold rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                    >
                        {isLoading ? 'Publishing...' : 'Publish Listing'}
                        {!isLoading && <ChevronRight className="w-4 h-4" />}
                    </button>
                </div>
            </div>
        </form>
    );
}
