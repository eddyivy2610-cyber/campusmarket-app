"use client";

import { useMemo, useState } from "react";
import { PhoneCall, Mail, ShieldCheck, X, Loader2, CheckCircle2 } from "lucide-react";
import { CATEGORIES } from "../../../data/products";
import { listingService } from "../../../lib/listingService";
import { useRouter } from "next/navigation";

export default function AddListingPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadedImages, setUploadedImages] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        category: "",
        title: "",
        location: "",
        price: "",
        condition: "",
        description: "",
        tags: "",
        specs: {},
        negotiable: false,
        minPrice: "",
        confirmHonesty: false,
        confirmSafety: false,
    });

    const summary = useMemo(() => ({
        value: formData.price ? `₦${Number(formData.price).toLocaleString()}` : "TBD",
        category: formData.category || "Uncategorized",
        listingsInQueue: 3,
    }), [formData]);

    const setField = (key: keyof typeof formData, value: string | boolean) => {
        setFormData((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (uploadedImages.length + files.length > 5) {
            setError("Maximum 5 images allowed");
            return;
        }

        const newFiles = [...uploadedImages, ...files];
        setUploadedImages(newFiles);

        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviews([...previews, ...newPreviews]);
        setError(null);
    };

    const removeImage = (index: number) => {
        const newFiles = [...uploadedImages];
        newFiles.splice(index, 1);
        setUploadedImages(newFiles);

        const newPreviews = [...previews];
        URL.revokeObjectURL(newPreviews[index]);
        newPreviews.splice(index, 1);
        setPreviews(newPreviews);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.category || !formData.title || !formData.price || !formData.description) {
            setError("Please fill in all required fields");
            return;
        }

        if (!formData.confirmHonesty || !formData.confirmSafety) {
            setError("Please confirm the guidelines and honesty check");
            return;
        }

        if (uploadedImages.length === 0) {
            setError("Please upload at least one image");
            return;
        }

        try {
            setIsSubmitting(true);
            setError(null);

            // 1. Upload images to Cloudinary
            const uploadRes = await listingService.uploadImages(uploadedImages);
            const imageUrls = uploadRes.urls;

            // 2. Create listing
            const listingData = {
                ...formData,
                price: Number(formData.price),
                minPrice: formData.minPrice ? Number(formData.minPrice) : undefined,
                images: imageUrls,
                tags: formData.tags.split(",").map(t => t.trim()).filter(t => t !== ""),
            };

            await listingService.createListing(listingData);
            
            setSuccess(true);
            setTimeout(() => {
                router.push("/manage-listings");
            }, 2000);

        } catch (err: any) {
            console.error("Submission failed", err);
            setError(err.message || "Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <div className="max-w-md w-full text-center space-y-4 animate-in fade-in zoom-in duration-300">
                    <div className="flex justify-center">
                        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
                            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold">Listing Submitted!</h1>
                    <p className="text-muted-foreground">
                        Your listing is being reviewed and will be live shortly. Redirecting you to your dashboard...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground font-heading">
            <main className="flex-1 py-10 md:py-12 px-4 sm:px-6 xl:px-10">
                <div className="max-w-6xl mx-auto space-y-6">
                    <section className="grid gap-6 lg:grid-cols-[240px,1fr]">
                        <form onSubmit={handleSubmit} className="space-y-6 border border-border/40 bg-card rounded-[var(--radius)] p-6 shadow-xl">
                            <div>
                                <p className="text-base font-semibold">Basic Listing Details</p>
                                <p className="text-xs text-muted-foreground">Fill out the essentials before you move to specs and pricing.</p>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-semibold uppercase tracking-[0.4em] text-muted-foreground">Category</label>
                                    <select
                                        required
                                        value={formData.category}
                                        onChange={(e) => setField("category", e.target.value)}
                                        className="w-full rounded-[var(--radius)] border border-border/60 px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
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
                                        required
                                        placeholder="Campus / City"
                                        value={formData.location}
                                        onChange={(e) => setField("location", e.target.value)}
                                        className="w-full rounded-[var(--radius)] border border-border/60 px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-semibold uppercase tracking-[0.4em] text-muted-foreground">Title</label>
                                    <input
                                        required
                                        value={formData.title}
                                        onChange={(e) => setField("title", e.target.value.slice(0, 80))}
                                        placeholder="MacBook Pro 2021 • M1 Pro • 16GB RAM"
                                        className="w-full rounded-[var(--radius)] border border-border/60 px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-semibold uppercase tracking-[0.4em] text-muted-foreground">Tags (comma separated)</label>
                                    <input
                                        value={formData.tags}
                                        onChange={(e) => setField("tags", e.target.value)}
                                        placeholder="apple, macbook, electronics"
                                        className="w-full rounded-[var(--radius)] border border-border/60 px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-semibold uppercase tracking-[0.4em] text-muted-foreground">Description</label>
                                <textarea
                                    required
                                    rows={5}
                                    value={formData.description}
                                    onChange={(e) => setField("description", e.target.value.slice(0, 2000))}
                                    placeholder="Share condition, usage history, and what buyers receive."
                                    className="w-full rounded-[var(--radius)] border border-border/60 px-4 py-3 text-sm resize-none focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-semibold uppercase tracking-[0.4em] text-muted-foreground">Images (Max 5)</label>
                                <div className="grid gap-3 grid-cols-2 md:grid-cols-5">
                                    {previews.map((preview, idx) => (
                                        <div key={idx} className="relative aspect-[1/1.1] rounded-[var(--radius)] overflow-hidden border border-border/60 group">
                                            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                            <button 
                                                type="button"
                                                onClick={() => removeImage(idx)}
                                                className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                    {previews.length < 5 && (
                                        <label className="aspect-[1/1.1] rounded-[var(--radius)] border border-dashed border-border/60 bg-secondary/20 flex flex-col items-center justify-center text-[11px] text-muted-foreground hover:bg-secondary/40 hover:border-primary/40 cursor-pointer transition-all">
                                            <span>Add photo</span>
                                            <input 
                                                type="file" 
                                                multiple 
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                className="hidden" 
                                            />
                                        </label>
                                    )}
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-semibold uppercase tracking-[0.4em] text-muted-foreground">Condition</label>
                                    <select
                                        required
                                        value={formData.condition}
                                        onChange={(e) => setField("condition", e.target.value)}
                                        className="w-full rounded-[var(--radius)] border border-border/60 px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
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
                                        required
                                        value={formData.price}
                                        onChange={(e) => setField("price", e.target.value.replace(/[^\d]/g, ""))}
                                        placeholder="450000"
                                        className="w-full rounded-[var(--radius)] border border-border/60 px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <label className="inline-flex items-center gap-2 text-sm font-semibold cursor-pointer">
                                    <input type="checkbox" checked={formData.negotiable} onChange={(e) => setField("negotiable", e.target.checked)} className="accent-primary" />
                                    Negotiable
                                </label>
                                {formData.negotiable && (
                                    <input
                                        value={formData.minPrice}
                                        onChange={(e) => setField("minPrice", e.target.value.replace(/[^\d]/g, ""))}
                                        placeholder="Minimum price"
                                        className="flex-1 rounded-[var(--radius)] border border-border/60 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    />
                                )}
                            </div>

                            <div className="space-y-2 rounded-[var(--radius)] border border-border/40 p-4 bg-secondary/10">
                                <label className="flex items-start gap-2 text-sm font-semibold cursor-pointer">
                                    <input required type="checkbox" checked={formData.confirmHonesty} onChange={(e) => setField("confirmHonesty", e.target.checked)} className="mt-1 accent-primary" />
                                    I confirm the listing details are accurate.
                                </label>
                                <label className="flex items-start gap-2 text-sm font-semibold cursor-pointer">
                                    <input required type="checkbox" checked={formData.confirmSafety} onChange={(e) => setField("confirmSafety", e.target.checked)} className="mt-1 accent-primary" />
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
                                <button 
                                    disabled={isSubmitting}
                                    className="w-full rounded-[var(--radius)] bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/30 hover:opacity-95 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Uploading and Submitting...
                                        </>
                                    ) : (
                                        "Submit Listing"
                                    )}
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            </main>
        </div>
    );
}

