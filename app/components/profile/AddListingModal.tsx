"use client";

import React, { useMemo, useState } from "react";
import {
    X,
    ChevronLeft,
    ChevronRight,
    Plus,
    Trash2,
    ShieldCheck,
    Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CATEGORIES, Product } from "../../data/products";

type ModalMode = "create" | "update";

interface AddListingModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode?: ModalMode;
    initialData?: Partial<Product>;
    onSubmitDraft?: (payload: {
        listing: Record<string, unknown>;
        promoRequest?: {
            placement: string;
            campaignBudget: string;
            promoPeriod: string;
            salesPeriod: string;
        };
    }) => void;
}

type SpecItem = { id: string; key: string; value: string };

type ListingFormData = {
    category: string;
    title: string;
    location: string;
    images: { id: string; url: string }[];
    description: string;
    tagsInput: string;
    specs: SpecItem[];
    condition: string;
    price: string;
    negotiable: boolean;
    minPrice: string;
    requestPromo: boolean;
    placement: string;
    campaignBudget: string;
    promoPeriod: string;
    salesPeriod: string;
    confirmHonesty: boolean;
    confirmSafety: boolean;
};

const CONDITION_OPTIONS = ["New", "Used - Like New", "Used - Good", "Used - Fair"];
const PROMO_PLACEMENTS = ["Homepage Spotlight", "Category Top Slot", "Search Boost", "Weekend Promo Banner"];
const TOTAL_STEPS = 6;

function toCurrencyInput(raw: string) {
    const number = raw.replace(/\D/g, "");
    return number ? new Intl.NumberFormat().format(parseInt(number, 10)) : "";
}

function parseInputTags(tagsInput: string) {
    return tagsInput
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean)
        .slice(0, 8);
}

export function AddListingModal({
    isOpen,
    onClose,
    mode = "create",
    initialData,
    onSubmitDraft,
}: AddListingModalProps) {
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const [formData, setFormData] = useState<ListingFormData>({
        category: initialData?.category || "",
        title: initialData?.title || "",
        location: initialData?.location || "",
        images: (initialData?.images || []).map((url, idx) => ({ id: `seed-${idx}`, url })),
        description: initialData?.description || "",
        tagsInput: (initialData?.tags || []).join(", "),
        specs:
            initialData?.specs && Object.keys(initialData.specs).length > 0
                ? Object.entries(initialData.specs).map(([key, value], idx) => ({ id: `spec-${idx}`, key, value }))
                : [{ id: "spec-1", key: "Brand", value: "" }, { id: "spec-2", key: "Model", value: "" }],
        condition: initialData?.condition || "",
        price: initialData?.price ? new Intl.NumberFormat().format(initialData.price) : "",
        negotiable: false,
        minPrice: "",
        requestPromo: false,
        placement: PROMO_PLACEMENTS[0],
        campaignBudget: "",
        promoPeriod: "",
        salesPeriod: "",
        confirmHonesty: false,
        confirmSafety: false,
    });

    const title = mode === "update" ? "Update Listing" : "Add Listing";

    const canProceed = useMemo(() => {
        if (step === 1) return !!formData.category && !!formData.title && !!formData.location;
        if (step === 2) return formData.images.length > 0;
        if (step === 3) return !!formData.description;
        if (step === 4) {
            return (
                formData.specs.length > 0 &&
                formData.specs.every((s) => s.key.trim().length > 0 && s.value.trim().length > 0)
            );
        }
        if (step === 5) return !!formData.condition && !!formData.price;
        if (step === 6) {
            const promoOk = !formData.requestPromo || (!!formData.campaignBudget && !!formData.promoPeriod);
            return formData.confirmHonesty && formData.confirmSafety && promoOk;
        }
        return false;
    }, [step, formData]);

    const setValue = <K extends keyof ListingFormData>(key: K, value: ListingFormData[K]) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || formData.images.length >= 6) return;
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData((prev) => ({
                ...prev,
                images: [...prev.images, { id: `img-${Date.now()}`, url: reader.result as string }],
            }));
        };
        reader.readAsDataURL(file);
    };

    const removeImage = (id: string) => {
        setFormData((prev) => ({ ...prev, images: prev.images.filter((img) => img.id !== id) }));
    };

    const addSpec = () => {
        setFormData((prev) => ({
            ...prev,
            specs: [...prev.specs, { id: `spec-${Date.now()}`, key: "", value: "" }],
        }));
    };

    const updateSpec = (id: string, field: "key" | "value", value: string) => {
        setFormData((prev) => ({
            ...prev,
            specs: prev.specs.map((spec) => (spec.id === id ? { ...spec, [field]: value } : spec)),
        }));
    };

    const removeSpec = (id: string) => {
        setFormData((prev) => ({ ...prev, specs: prev.specs.filter((spec) => spec.id !== id) }));
    };

    const next = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS));
    const back = () => setStep((s) => Math.max(s - 1, 1));

    const closeAndReset = () => {
        setStep(1);
        setIsSuccess(false);
        setIsSubmitting(false);
        onClose();
    };

    const submit = async () => {
        setIsSubmitting(true);

        const listingPayload = {
            category: formData.category,
            title: formData.title.trim(),
            location: formData.location.trim(),
            images: formData.images.map((i) => i.url),
            image: formData.images[0]?.url || "",
            description: formData.description.trim(),
            tags: parseInputTags(formData.tagsInput),
            specs: formData.specs.reduce<Record<string, string>>((acc, item) => {
                acc[item.key.trim()] = item.value.trim();
                return acc;
            }, {}),
            condition: formData.condition,
            price: Number(formData.price.replace(/,/g, "")) || 0,
            negotiable: formData.negotiable,
            minPrice: formData.minPrice ? Number(formData.minPrice.replace(/,/g, "")) : undefined,
            postedDate: "Just now",
        };

        const promoPayload = formData.requestPromo
            ? {
                  placement: formData.placement,
                  campaignBudget: formData.campaignBudget,
                  promoPeriod: formData.promoPeriod,
                  salesPeriod: formData.salesPeriod,
              }
            : undefined;

        await new Promise((resolve) => setTimeout(resolve, 1200));
        onSubmitDraft?.({ listing: listingPayload, promoRequest: promoPayload });
        setIsSubmitting(false);
        setIsSuccess(true);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-6 backdrop-blur-sm bg-background/80">
            <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="w-full max-w-5xl bg-card border border-border/50 font-heading rounded-[28px] shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
            >
                <div className="flex items-center justify-between p-5 md:p-6 border-b border-border/40 bg-secondary/5">
                    <div className="flex items-center gap-3">
                        <button onClick={closeAndReset} className="p-2 rounded-xl hover:bg-secondary transition-colors text-muted-foreground">
                            <X className="w-5 h-5" />
                        </button>
                        <div>
                            <h2 className="text-xl font-bold tracking-tight">{title}</h2>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
                                {isSuccess ? "Completed" : `Step ${step} of ${TOTAL_STEPS}`}
                            </p>
                        </div>
                    </div>

                    {!isSuccess && (
                        <div className="hidden md:flex items-center gap-1.5">
                            {Array.from({ length: TOTAL_STEPS }, (_, idx) => idx + 1).map((i) => (
                                <div
                                    key={i}
                                    className={`h-1.5 rounded-full transition-all ${
                                        i === step ? "w-8 bg-primary" : i < step ? "w-4 bg-primary/40" : "w-4 bg-secondary"
                                    }`}
                                />
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto p-5 md:p-8">
                    <AnimatePresence mode="wait">
                        {isSuccess ? (
                            <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-[380px] flex flex-col items-center justify-center text-center gap-5">
                                <div className="w-20 h-20 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                                    <ShieldCheck className="w-10 h-10" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold">Listing Submitted</h3>
                                    <p className="text-sm text-muted-foreground mt-2 max-w-md">
                                        Your listing draft is ready for catalog review.
                                        {formData.requestPromo ? " Promo request details were attached." : ""}
                                    </p>
                                </div>
                                <button onClick={closeAndReset} className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm">
                                    Done
                                </button>
                            </motion.div>
                        ) : (
                            <motion.div key={`step-${step}`} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
                                {step === 1 && (
                                    <>
                                        <div>
                                            <h3 className="text-xl font-bold">Basic Listing Info</h3>
                                            <p className="text-xs text-muted-foreground">Choose category, set title, and define listing location.</p>
                                        </div>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Category</label>
                                                <select value={formData.category} onChange={(e) => setValue("category", e.target.value)} className="w-full rounded-xl border border-border/50 bg-background px-4 py-3 text-sm">
                                                    <option value="">Select category</option>
                                                    {CATEGORIES.map((cat) => (
                                                        <option key={cat.name} value={cat.name}>
                                                            {cat.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Location</label>
                                                <input value={formData.location} onChange={(e) => setValue("location", e.target.value)} placeholder="e.g. ABU Main Campus, Samaru" className="w-full rounded-xl border border-border/50 bg-background px-4 py-3 text-sm" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Title</label>
                                            <input value={formData.title} onChange={(e) => setValue("title", e.target.value.slice(0, 80))} placeholder="e.g. MacBook Pro 2021 - M1 Pro" className="w-full rounded-xl border border-border/50 bg-background px-4 py-3 text-sm" />
                                        </div>
                                    </>
                                )}

                                {step === 2 && (
                                    <>
                                        <div>
                                            <h3 className="text-xl font-bold">Photos</h3>
                                            <p className="text-xs text-muted-foreground">Upload up to 6 images. The first image becomes the listing cover.</p>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                            {formData.images.map((img, idx) => (
                                                <div key={img.id} className="relative rounded-xl border border-border/50 overflow-hidden aspect-square bg-secondary/20">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img src={img.url} alt="Listing" className="w-full h-full object-cover" />
                                                    {idx === 0 && <span className="absolute top-2 left-2 text-[9px] font-bold px-2 py-1 rounded bg-primary text-white">Cover</span>}
                                                    <button onClick={() => removeImage(img.id)} className="absolute top-2 right-2 p-1.5 rounded bg-black/60 text-white">
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            ))}
                                            {formData.images.length < 6 && (
                                                <label className="aspect-square rounded-xl border-2 border-dashed border-border/60 bg-secondary/10 hover:border-primary/40 flex flex-col items-center justify-center gap-2 cursor-pointer">
                                                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                                                    <Plus className="w-5 h-5 text-muted-foreground" />
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Upload</span>
                                                </label>
                                            )}
                                        </div>
                                    </>
                                )}

                                {step === 3 && (
                                    <>
                                        <div>
                                            <h3 className="text-xl font-bold">Description & Tags</h3>
                                            <p className="text-xs text-muted-foreground">These are shown in card previews, quick view, and full listing page.</p>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Description</label>
                                            <textarea value={formData.description} onChange={(e) => setValue("description", e.target.value.slice(0, 2000))} rows={6} placeholder="Describe condition, usage history, and what is included." className="w-full rounded-xl border border-border/50 bg-background px-4 py-3 text-sm resize-none" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Tags (comma separated)</label>
                                            <input value={formData.tagsInput} onChange={(e) => setValue("tagsInput", e.target.value)} placeholder="apple, macbook, laptop, m1" className="w-full rounded-xl border border-border/50 bg-background px-4 py-3 text-sm" />
                                        </div>
                                    </>
                                )}

                                {step === 4 && (
                                    <>
                                        <div>
                                            <h3 className="text-xl font-bold">Specifications</h3>
                                            <p className="text-xs text-muted-foreground">Add specs that appear in listing details (e.g. Brand, Model, Storage).</p>
                                        </div>
                                        <div className="space-y-3">
                                            {formData.specs.map((spec) => (
                                                <div key={spec.id} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                                                    <input value={spec.key} onChange={(e) => updateSpec(spec.id, "key", e.target.value)} placeholder="Spec name" className="rounded-xl border border-border/50 bg-background px-3 py-2.5 text-sm" />
                                                    <input value={spec.value} onChange={(e) => updateSpec(spec.id, "value", e.target.value)} placeholder="Spec value" className="rounded-xl border border-border/50 bg-background px-3 py-2.5 text-sm" />
                                                    <button onClick={() => removeSpec(spec.id)} className="px-3 rounded-xl border border-border/50 text-muted-foreground hover:bg-secondary">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                            <button onClick={addSpec} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border/50 hover:bg-secondary text-sm font-semibold">
                                                <Plus className="w-4 h-4" /> Add spec
                                            </button>
                                        </div>
                                    </>
                                )}

                                {step === 5 && (
                                    <>
                                        <div>
                                            <h3 className="text-xl font-bold">Pricing & Condition</h3>
                                            <p className="text-xs text-muted-foreground">Set sale price and condition used in card and listing header.</p>
                                        </div>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Condition</label>
                                                <select value={formData.condition} onChange={(e) => setValue("condition", e.target.value)} className="w-full rounded-xl border border-border/50 bg-background px-4 py-3 text-sm">
                                                    <option value="">Select condition</option>
                                                    {CONDITION_OPTIONS.map((c) => (
                                                        <option key={c} value={c}>
                                                            {c}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Price (NGN)</label>
                                                <input value={formData.price} onChange={(e) => setValue("price", toCurrencyInput(e.target.value))} placeholder="450,000" className="w-full rounded-xl border border-border/50 bg-background px-4 py-3 text-sm" />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <label className="inline-flex items-center gap-2 text-sm font-semibold">
                                                <input type="checkbox" checked={formData.negotiable} onChange={(e) => setValue("negotiable", e.target.checked)} className="accent-primary" />
                                                Negotiable
                                            </label>
                                            {formData.negotiable && (
                                                <input value={formData.minPrice} onChange={(e) => setValue("minPrice", toCurrencyInput(e.target.value))} placeholder="Minimum acceptable price" className="flex-1 rounded-xl border border-border/50 bg-background px-4 py-2.5 text-sm" />
                                            )}
                                        </div>
                                    </>
                                )}

                                {step === 6 && (
                                    <>
                                        <div>
                                            <h3 className="text-xl font-bold">Review & Optional Promo</h3>
                                            <p className="text-xs text-muted-foreground">Confirm listing accuracy and attach optional ad/promo request.</p>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="rounded-2xl border border-border/50 p-4 bg-secondary/10 space-y-2">
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Listing Summary</p>
                                                <p className="text-sm font-bold">{formData.title || "Untitled listing"}</p>
                                                <p className="text-xs text-muted-foreground">{formData.category} | {formData.condition || "No condition"}</p>
                                                <p className="text-xs text-muted-foreground">{formData.location || "No location"}</p>
                                                <p className="text-base font-bold text-primary">NGN {formData.price || "0"}</p>
                                            </div>
                                            <div className="rounded-2xl border border-border/50 p-4 bg-secondary/10 space-y-3">
                                                <label className="inline-flex items-center gap-2 text-sm font-semibold">
                                                    <input type="checkbox" checked={formData.requestPromo} onChange={(e) => setValue("requestPromo", e.target.checked)} className="accent-primary" />
                                                    Request ad/promo support
                                                </label>

                                                {formData.requestPromo && (
                                                    <div className="space-y-2">
                                                        <select value={formData.placement} onChange={(e) => setValue("placement", e.target.value)} className="w-full rounded-xl border border-border/50 bg-background px-3 py-2.5 text-sm">
                                                            {PROMO_PLACEMENTS.map((p) => (
                                                                <option key={p} value={p}>{p}</option>
                                                            ))}
                                                        </select>
                                                        <input value={formData.campaignBudget} onChange={(e) => setValue("campaignBudget", toCurrencyInput(e.target.value))} placeholder="Campaign budget" className="w-full rounded-xl border border-border/50 bg-background px-3 py-2.5 text-sm" />
                                                        <input value={formData.promoPeriod} onChange={(e) => setValue("promoPeriod", e.target.value)} placeholder="Promo period (e.g. 7 days)" className="w-full rounded-xl border border-border/50 bg-background px-3 py-2.5 text-sm" />
                                                        <input value={formData.salesPeriod} onChange={(e) => setValue("salesPeriod", e.target.value)} placeholder="Sales period note (optional)" className="w-full rounded-xl border border-border/50 bg-background px-3 py-2.5 text-sm" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-2 rounded-xl border border-border/40 p-4">
                                            <label className="flex items-start gap-2 text-sm font-semibold">
                                                <input type="checkbox" checked={formData.confirmHonesty} onChange={(e) => setValue("confirmHonesty", e.target.checked)} className="mt-1 accent-primary" />
                                                I confirm listing details, specs, and photos are accurate.
                                            </label>
                                            <label className="flex items-start gap-2 text-sm font-semibold">
                                                <input type="checkbox" checked={formData.confirmSafety} onChange={(e) => setValue("confirmSafety", e.target.checked)} className="mt-1 accent-primary" />
                                                I agree to campus marketplace safety and posting policies.
                                            </label>
                                        </div>
                                    </>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {!isSuccess && (
                    <div className="p-5 md:p-6 border-t border-border/40 bg-secondary/5 flex items-center justify-between">
                        <button onClick={back} disabled={step === 1 || isSubmitting} className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold ${step === 1 ? "opacity-40 cursor-not-allowed" : "hover:bg-secondary text-muted-foreground"}`}>
                            <ChevronLeft className="w-4 h-4" /> Back
                        </button>

                        <button
                            onClick={step === TOTAL_STEPS ? submit : next}
                            disabled={!canProceed || isSubmitting}
                            className={`inline-flex items-center gap-2 px-7 py-3 rounded-xl font-bold text-sm ${!canProceed || isSubmitting ? "bg-secondary text-muted-foreground cursor-not-allowed" : "bg-primary text-primary-foreground"}`}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/35 border-t-white rounded-full animate-spin" />
                                    Submitting
                                </>
                            ) : (
                                <>
                                    {step === TOTAL_STEPS ? (
                                        <>
                                            <Sparkles className="w-4 h-4" /> Submit Listing
                                        </>
                                    ) : (
                                        <>
                                            Next <ChevronRight className="w-4 h-4" />
                                        </>
                                    )}
                                </>
                            )}
                        </button>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
