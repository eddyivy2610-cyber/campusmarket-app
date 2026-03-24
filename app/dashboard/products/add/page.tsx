"use client";

import { useMemo, useState } from "react";
import { PhoneCall, Mail, ShieldCheck } from "lucide-react";
import { CATEGORIES } from "../../../data/products";

type SpecItem = { id: string; key: string; value: string };

export default function AddListingPage() {
    const [formData, setFormData] = useState({
        category: "",
        title: "",
        location: "",
        price: "",
        condition: "",
        description: "",
        tags: "",
        specs: [{ id: "spec-1", key: "Brand", value: "" }, { id: "spec-2", key: "Model", value: "" }],
        negotiable: false,
        minPrice: "",
        confirmHonesty: false,
        confirmSafety: false,
        requestPromo: false,
        promoNotes: "",
    });

    const summary = useMemo(() => ({
        value: formData.price ? `₦${formData.price}` : "TBD",
        category: formData.category || "Uncategorized",
        listingsInQueue: 3,
    }), [formData]);

    const setField = (key: keyof typeof formData, value: string | boolean | SpecItem[]) => {
        setFormData((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const updateSpec = (id: string, field: "key" | "value", value: string) => {
        setFormData((prev) => ({
            ...prev,
            specs: prev.specs.map((spec) => (spec.id === id ? { ...spec, [field]: value } : spec)),
        }));
    };

    const addSpec = () => {
        setFormData((prev) => ({
            ...prev,
            specs: [...prev.specs, { id: `spec-${Date.now()}`, key: "", value: "" }],
        }));
    };

    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground font-heading">
            <main className="flex-1 py-10 md:py-12 px-4 sm:px-6 xl:px-10">
                <div className="max-w-6xl mx-auto space-y-6">
                    <section className="grid gap-6 lg:grid-cols-[240px,1fr]">
                        <div className="border border-border/40 bg-card p-4 space-y-4 rounded-[var(--radius)] shadow-md">
                            <div className="space-y-2">
                                <h2 className="text-sm font-semibold">Need Help Listing?</h2>
                                <p className="text-[11px] text-muted-foreground">Our listing team reviews drafts within 2 hours.</p>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <span className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                                        <PhoneCall className="w-4 h-4" />
                                    </span>
                                    <div>
                                        <p className="text-[11px] text-muted-foreground">Phone</p>
                                        <p className="text-sm font-semibold">+234 803 000 0000</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                                        <Mail className="w-4 h-4" />
                                    </span>
                                    <div>
                                        <p className="text-[11px] text-muted-foreground">Email</p>
                                        <p className="text-sm font-semibold">support@campusmarket.ng</p>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-[var(--radius)] border border-border/40 bg-secondary/30 p-3 space-y-1">
                                <p className="text-[11px] uppercase tracking-[0.4em] text-muted-foreground">Summary</p>
                                <p className="text-lg font-bold">{summary.value}</p>
                                <p className="text-xs text-muted-foreground">{summary.category}</p>
                                <p className="text-[12px] text-muted-foreground">Listings in review queue: {summary.listingsInQueue}</p>
                            </div>
                        </div>

                        <form className="space-y-6 border border-border/40 bg-card rounded-[var(--radius)] p-6 shadow-xl">
                            <div>
                                <p className="text-base font-semibold">Basic Listing Details</p>
                                <p className="text-xs text-muted-foreground">Fill out the essentials before you move to specs and pricing.</p>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-semibold uppercase tracking-[0.4em] text-muted-foreground">Category</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setField("category", e.target.value)}
                                        className="w-full rounded-[var(--radius)] border border-border/60 px-4 py-3 text-sm"
                                    >
                                        <option value="">Select category</option>
                                        {CATEGORIES.map((cat) => (
                                            <option key={cat.name} value={cat.name}>
                                                {cat.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-semibold uppercase tracking-[0.4em] text-muted-foreground">Location</label>
                                    <input
                                        placeholder="Campus / City"
                                        value={formData.location}
                                        onChange={(e) => setField("location", e.target.value)}
                                        className="w-full rounded-[var(--radius)] border border-border/60 px-4 py-3 text-sm"
                                    />
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-semibold uppercase tracking-[0.4em] text-muted-foreground">Title</label>
                                    <input
                                        value={formData.title}
                                        onChange={(e) => setField("title", e.target.value.slice(0, 80))}
                                        placeholder="MacBook Pro 2021 • M1 Pro • 16GB RAM"
                                        className="w-full rounded-[var(--radius)] border border-border/60 px-4 py-3 text-sm"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-semibold uppercase tracking-[0.4em] text-muted-foreground">Images</label>
                                    <div className="grid gap-3 md:grid-cols-3">
                                        {[1, 2, 3].map((slot) => (
                                            <label key={slot} className="aspect-[1/1.1] rounded-[var(--radius)] border border-dashed border-border/60 bg-secondary/20 flex flex-col items-center justify-center text-[11px] text-muted-foreground">
                                                <span>Add photo</span>
                                                <input type="file" className="hidden" />
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-semibold uppercase tracking-[0.4em] text-muted-foreground">Description</label>
                                <textarea
                                    rows={5}
                                    value={formData.description}
                                    onChange={(e) => setField("description", e.target.value.slice(0, 2000))}
                                    placeholder="Share condition, usage history, and what buyers receive."
                                    className="w-full rounded-[var(--radius)] border border-border/60 px-4 py-3 text-sm resize-none"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-semibold uppercase tracking-[0.4em] text-muted-foreground">Tags (comma separated)</label>
                                <input
                                    value={formData.tags}
                                    onChange={(e) => setField("tags", e.target.value)}
                                    placeholder="apple, macbook, electronics"
                                    className="w-full rounded-[var(--radius)] border border-border/60 px-4 py-3 text-sm"
                                />
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-base font-semibold">Specifications</p>
                                        <p className="text-xs text-muted-foreground">Highlight key specs that show up on the listing card.</p>
                                    </div>
                                    <button type="button" onClick={addSpec} className="text-sm font-semibold uppercase tracking-[0.4em] text-primary">
                                        Add spec
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {formData.specs.map((spec) => (
                                        <div key={spec.id} className="grid grid-cols-2 gap-3">
                                            <input
                                                value={spec.key}
                                                onChange={(e) => updateSpec(spec.id, "key", e.target.value)}
                                                placeholder="Spec name"
                                                className="rounded-[var(--radius)] border border-border/60 px-3 py-2 text-sm"
                                            />
                                            <input
                                                value={spec.value}
                                                onChange={(e) => updateSpec(spec.id, "value", e.target.value)}
                                                placeholder="Spec value"
                                                className="rounded-[var(--radius)] border border-border/60 px-3 py-2 text-sm"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-semibold uppercase tracking-[0.4em] text-muted-foreground">Condition</label>
                                    <select
                                        value={formData.condition}
                                        onChange={(e) => setField("condition", e.target.value)}
                                        className="w-full rounded-[var(--radius)] border border-border/60 px-4 py-3 text-sm"
                                    >
                                        <option value="">Select condition</option>
                                        {["New", "Used - Like New", "Used - Good", "Used - Fair"].map((option) => (
                                            <option key={option} value={option}>
                                                {option}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-semibold uppercase tracking-[0.4em] text-muted-foreground">Price (NGN)</label>
                                    <input
                                        value={formData.price}
                                        onChange={(e) => setField("price", e.target.value.replace(/[^\d]/g, ""))}
                                        placeholder="450000"
                                        className="w-full rounded-[var(--radius)] border border-border/60 px-4 py-3 text-sm"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <label className="inline-flex items-center gap-2 text-sm font-semibold">
                                    <input type="checkbox" checked={formData.negotiable} onChange={(e) => setField("negotiable", e.target.checked)} className="accent-primary" />
                                    Negotiable
                                </label>
                                {formData.negotiable && (
                                    <input
                                        value={formData.minPrice}
                                        onChange={(e) => setField("minPrice", e.target.value.replace(/[^\d]/g, ""))}
                                        placeholder="Minimum price"
                                        className="flex-1 rounded-[var(--radius)] border border-border/60 px-3 py-2 text-sm"
                                    />
                                )}
                            </div>

                            <div className="space-y-2 rounded-[var(--radius)] border border-border/40 p-4 bg-secondary/10">
                                <label className="flex items-start gap-2 text-sm font-semibold">
                                    <input type="checkbox" checked={formData.confirmHonesty} onChange={(e) => setField("confirmHonesty", e.target.checked)} className="mt-1 accent-primary" />
                                    I confirm the listing details are accurate.
                                </label>
                                <label className="flex items-start gap-2 text-sm font-semibold">
                                    <input type="checkbox" checked={formData.confirmSafety} onChange={(e) => setField("confirmSafety", e.target.checked)} className="mt-1 accent-primary" />
                                    I agree to the Campus Hive safety and posting guidelines.
                                </label>
                            </div>

                            <div className="space-y-4 rounded-[var(--radius)] border border-border/40 p-4 bg-secondary/20">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                                    <h3 className="text-base font-semibold">Ready for Review</h3>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Once you submit, our moderation team verifies it for quality and safety. We might reach
                                    out through the email you used for your account.
                                </p>
                                <button className="w-full rounded-[var(--radius)] bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/30 hover:opacity-95 transition">
                                    Submit Listing
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            </main>
        </div>
    );
}
