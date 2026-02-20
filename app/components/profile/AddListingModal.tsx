"use client";

import React, { useState, useEffect } from "react";
import {
    X,
    ChevronLeft,
    ChevronRight,
    Check,
    Laptop,
    BookOpen,
    Shirt,
    Home,
    Utensils,
    Wrench,
    Gamepad,
    Sparkles,
    Image as ImageIcon,
    Plus,
    Trash2,
    GripVertical,
    AlertCircle,
    Calendar,
    Eye,
    Tag,
    Clock,
    ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AddListingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const CATEGORIES = [
    { id: "electronics", name: "Electronics", icon: Laptop, desc: "Phones, laptops, and gadgets" },
    { id: "books", name: "Study Materials", icon: BookOpen, desc: "Textbooks, notes, and stationery" },
    { id: "fashion", name: "Fashion", icon: Shirt, desc: "Clothes, bags, and accessories" },
    { id: "home", name: "Dorm Essentials", icon: Home, desc: "Furniture, decor, and bedding" },
    { id: "food", name: "Food & Snacks", icon: Utensils, desc: "Meals, drinks, and snacks" },
    { id: "services", name: "Services", icon: Wrench, desc: "Tutoring, repairs, and more" },
    { id: "hobbies", name: "Hobbies", icon: Gamepad, desc: "Games, sports, and music" },
    { id: "other", name: "Other", icon: Sparkles, desc: "Anything else you're selling" },
];

const CONDITIONS = ["Brand New", "Like New", "Gently Used", "Fair Condition"];

export function AddListingModal({ isOpen, onClose }: AddListingModalProps) {
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [formData, setFormData] = useState({
        category: "",
        title: "",
        images: [] as { id: string, url: string }[],
        description: "",
        condition: "",
        price: "",
        negotiable: false,
        minPrice: "",
        confirmHonesty: false,
        confirmSafety: false,
        postTiming: "immediate" as "immediate" | "schedule",
    });

    // Auto-save logic
    useEffect(() => {
        const savedData = localStorage.getItem("pending_listing");
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                setFormData(prev => ({ ...prev, ...parsed }));
            } catch (e) {
                console.error("Failed to load saved listing", e);
            }
        }
    }, []);

    useEffect(() => {
        if (formData.category || formData.title) {
            const dataToSave = { ...formData };
            // @ts-ignore - index signature
            delete dataToSave.images; // Don't save base64 images to localstorage to avoid quota issues
            localStorage.setItem("pending_listing", JSON.stringify(dataToSave));
        }
    }, [formData]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && formData.images.length < 5) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({
                    ...formData,
                    images: [...formData.images, { id: Math.random().toString(36).substr(2, 9), url: reader.result as string }]
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = (id: string) => {
        setFormData({ ...formData, images: formData.images.filter(img => img.id !== id) });
    };

    const reorderImages = (fromIndex: number, toIndex: number) => {
        const newImages = [...formData.images];
        const [removed] = newImages.splice(fromIndex, 1);
        newImages.splice(toIndex, 0, removed);
        setFormData({ ...formData, images: newImages });
    };

    const formatPrice = (value: string) => {
        const number = value.replace(/\D/g, "");
        return number ? new Intl.NumberFormat().format(parseInt(number)) : "";
    };

    const handleNext = () => setStep(s => Math.min(s + 1, 5));
    const handleBack = () => setStep(s => Math.max(s - 1, 1));

    const handleSubmit = async () => {
        setIsSubmitting(true);
        // Simulate API call
        await new Promise(r => setTimeout(r, 2000));
        setIsSubmitting(false);
        setIsSuccess(true);
        localStorage.removeItem("pending_listing");
    };

    const resetModal = () => {
        setStep(1);
        setIsSuccess(false);
        setFormData({
            category: "",
            title: "",
            images: [],
            description: "",
            condition: "",
            price: "",
            negotiable: false,
            minPrice: "",
            confirmHonesty: false,
            confirmSafety: false,
            postTiming: "immediate",
        });
        onClose();
    };

    if (!isOpen) return null;

    const isStepDisabled = () => {
        if (step === 1) return !formData.category;
        if (step === 2) return !formData.title || formData.images.length === 0;
        if (step === 3) return !formData.description || !formData.condition;
        if (step === 4) return !formData.price;
        if (step === 5) return !formData.confirmHonesty || !formData.confirmSafety;
        return false;
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 backdrop-blur-sm bg-background/80">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="w-full max-w-4xl bg-card border border-border/50 rounded-[32px] shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden"
            >
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-border/40 bg-secondary/5">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-secondary rounded-xl transition-colors text-muted-foreground"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <div>
                            <h2 className="text-xl font-black font-heading tracking-tight">Add New Listing</h2>
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50">
                                {isSuccess ? "Success" : `Step ${step} of 5`}
                            </p>
                        </div>
                    </div>

                    {!isSuccess && (
                        <div className="flex gap-1.5 hidden md:flex">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div
                                    key={i}
                                    className={`h-1.5 rounded-full transition-all duration-500 ${i === step ? "w-8 bg-primary" : i < step ? "w-4 bg-primary/40" : "w-4 bg-secondary"
                                        }`}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Modal Body */}
                <div className="flex-1 overflow-y-auto p-6 md:p-10 scrollbar-thin scrollbar-thumb-border">
                    <AnimatePresence mode="wait">
                        {isSuccess ? (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 0.9 }}
                                className="h-full flex flex-col items-center justify-center text-center space-y-6 py-10"
                            >
                                <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center text-green-500">
                                    <ShieldCheck className="w-12 h-12" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-3xl font-black font-heading tracking-tight">Sent for Review!</h3>
                                    <p className="text-muted-foreground max-w-sm mx-auto">
                                        Your listing has been submitted. Our admins will review it within 24 hours to ensure campus safety guidelines.
                                    </p>
                                </div>
                                <button
                                    onClick={resetModal}
                                    className="px-10 py-4 bg-primary text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                                >
                                    Done
                                </button>
                            </motion.div>
                        ) : (
                            <>
                                {step === 1 && (
                                    <motion.div key="step1" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
                                        <div className="text-center md:text-left space-y-1">
                                            <h3 className="text-xl font-black tracking-tight font-heading">Category</h3>
                                            <p className="text-muted-foreground text-xs font-medium">Where does your item belong?</p>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            {CATEGORIES.map((cat) => (
                                                <button
                                                    key={cat.id}
                                                    onClick={() => setFormData({ ...formData, category: cat.id })}
                                                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center text-center gap-2 group relative ${formData.category === cat.id
                                                        ? "border-primary bg-primary/5 shadow-md shadow-primary/5 text-primary"
                                                        : "border-border/40 bg-secondary/10 hover:border-primary/20 hover:bg-secondary/20 text-foreground"
                                                        }`}
                                                >
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${formData.category === cat.id ? "bg-primary text-white scale-110" : "bg-background text-muted-foreground group-hover:bg-primary/5 group-hover:text-primary"
                                                        }`}>
                                                        <cat.icon className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <span className="block text-[10px] font-black uppercase tracking-widest leading-none">{cat.name}</span>
                                                    </div>
                                                    {formData.category === cat.id && (
                                                        <div className="absolute top-2 right-2 w-4 h-4 bg-primary rounded-full flex items-center justify-center text-white shadow-sm">
                                                            <Check className="w-2.5 h-2.5" strokeWidth={4} />
                                                        </div>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {step === 2 && (
                                    <motion.div key="step2" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-8">
                                        <div className="text-center md:text-left space-y-1">
                                            <h3 className="text-xl font-black tracking-tight font-heading">Title & Photos</h3>
                                            <p className="text-muted-foreground text-xs font-medium">Use high-quality photos for better reach.</p>
                                        </div>
                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-end">
                                                    <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Title</label>
                                                    <span className={`text-[9px] font-bold ${formData.title.length > 50 ? 'text-red-500' : 'text-muted-foreground'}`}>{formData.title.length}/60</span>
                                                </div>
                                                <input
                                                    type="text"
                                                    value={formData.title}
                                                    onChange={(e) => setFormData({ ...formData, title: e.target.value.slice(0, 60) })}
                                                    placeholder="e.g., iPhone 14 Pro Max"
                                                    className="w-full bg-secondary/10 border-2 border-border/40 rounded-xl p-3.5 text-base font-bold placeholder:text-muted-foreground/30 focus:border-primary focus:bg-background transition-all outline-none"
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Photos</label>
                                                <div className="grid grid-cols-5 gap-3">
                                                    {formData.images.map((img, idx) => (
                                                        <motion.div key={img.id} layout className="aspect-square rounded-2xl bg-secondary/30 relative overflow-hidden group border border-border/50 shadow-sm">
                                                            <img src={img.url} className="w-full h-full object-cover" alt="" />
                                                            <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex justify-between">
                                                                <button onClick={() => removeImage(img.id)} className="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600">
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </button>
                                                                <div className="flex gap-1">
                                                                    {idx > 0 && <button onClick={() => reorderImages(idx, idx - 1)} className="p-1.5 bg-white/20 text-white rounded-lg hover:bg-white/30 backdrop-blur-md"><ChevronLeft className="w-3.5 h-3.5" /></button>}
                                                                    {idx < formData.images.length - 1 && <button onClick={() => reorderImages(idx, idx + 1)} className="p-1.5 bg-white/20 text-white rounded-lg hover:bg-white/30 backdrop-blur-md"><ChevronRight className="w-3.5 h-3.5" /></button>}
                                                                </div>
                                                            </div>
                                                            {idx === 0 && <div className="absolute top-2 left-2 px-2 py-0.5 bg-primary text-white text-[8px] font-black uppercase tracking-widest rounded-md">Cover</div>}
                                                            <div className="absolute top-2 right-2 p-1 bg-black/20 backdrop-blur-md rounded-md cursor-grab active:cursor-grabbing text-white opacity-0 group-hover:opacity-100 transition-opacity"><GripVertical className="w-3.5 h-3.5" /></div>
                                                        </motion.div>
                                                    ))}
                                                    {formData.images.length < 5 && (
                                                        <label className="aspect-square rounded-2xl border-2 border-dashed border-border/50 bg-secondary/10 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all group">
                                                            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                                            <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors shadow-sm"><Plus className="w-5 h-5" /></div>
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Upload</span>
                                                        </label>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] font-medium text-muted-foreground opacity-60"><AlertCircle className="w-3 h-3" /> Drag images or use arrows to reorder. The first image is the cover.</div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {step === 3 && (
                                    <motion.div key="step3" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-8">
                                        <div className="text-center md:text-left space-y-1">
                                            <h3 className="text-xl font-black tracking-tight font-heading">Description</h3>
                                            <p className="text-muted-foreground text-xs font-medium">Be honest about the condition.</p>
                                        </div>
                                        <div className="space-y-6">
                                            <div className="space-y-3">
                                                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Condition</label>
                                                <div className="flex flex-wrap gap-2">
                                                    {CONDITIONS.map((cond) => (
                                                        <button
                                                            key={cond}
                                                            onClick={() => setFormData({ ...formData, condition: cond })}
                                                            className={`px-4 py-2 rounded-xl text-[10px] font-bold transition-all border-2 ${formData.condition === cond ? "bg-primary text-white border-primary shadow-md shadow-primary/5" : "bg-secondary/10 text-muted-foreground border-border/40 hover:border-primary/20"
                                                                }`}
                                                        >
                                                            {cond}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-end">
                                                    <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Description</label>
                                                    <span className={`text-[9px] font-bold ${formData.description.length > 400 ? 'text-amber-500' : 'text-muted-foreground'}`}>{formData.description.length}/1000</span>
                                                </div>
                                                <textarea
                                                    value={formData.description}
                                                    onChange={(e) => setFormData({ ...formData, description: e.target.value.slice(0, 1000) })}
                                                    rows={4}
                                                    placeholder="Tell buyers what makes this item great..."
                                                    className="w-full bg-secondary/10 border-2 border-border/40 rounded-xl p-4 text-sm font-medium placeholder:text-muted-foreground/30 focus:border-primary focus:bg-background transition-all outline-none resize-none"
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {step === 4 && (
                                    <motion.div key="step4" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-8">
                                        <div className="text-center md:text-left space-y-1">
                                            <h3 className="text-xl font-black tracking-tight font-heading">Price</h3>
                                            <p className="text-muted-foreground text-xs font-medium">Fair pricing leads to faster sales.</p>
                                        </div>
                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Listing Price</label>
                                                <div className="relative group max-w-xs">
                                                    <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-xl font-black text-foreground/40 group-focus-within:text-primary transition-colors">₦</div>
                                                    <input
                                                        type="text"
                                                        value={formData.price}
                                                        onChange={(e) => setFormData({ ...formData, price: formatPrice(e.target.value) })}
                                                        placeholder="0.00"
                                                        className="w-full bg-secondary/10 border-2 border-border/40 rounded-xl p-4 pl-12 text-2xl font-black placeholder:text-muted-foreground/30 focus:border-primary focus:bg-background transition-all outline-none"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Negotiable?</label>
                                                <div className="grid grid-cols-2 gap-3 max-w-sm">
                                                    {[{ id: true, label: "Negotiable" }, { id: false, label: "Fixed" }].map((opt) => (
                                                        <button
                                                            key={opt.id.toString()}
                                                            onClick={() => setFormData({ ...formData, negotiable: opt.id })}
                                                            className={`p-4 rounded-2xl border-2 transition-all text-left ${formData.negotiable === opt.id ? "border-primary bg-primary/5 shadow-md shadow-primary/5 text-primary" : "border-border/40 bg-secondary/10 hover:border-primary/20 text-foreground"
                                                                }`}
                                                        >
                                                            <span className="block text-[10px] font-black uppercase tracking-widest leading-none">{opt.label}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            {formData.negotiable && (
                                                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-2 p-5 bg-secondary/10 rounded-2xl border border-border/40 max-w-xs">
                                                    <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Hidden Minimum</label>
                                                    <div className="relative group">
                                                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-base font-black text-foreground/40 group-focus-within:text-primary transition-colors">₦</div>
                                                        <input
                                                            type="text"
                                                            value={formData.minPrice}
                                                            onChange={(e) => setFormData({ ...formData, minPrice: formatPrice(e.target.value) })}
                                                            placeholder="0.00"
                                                            className="w-full bg-background/50 border-2 border-border/40 rounded-lg p-3 pl-10 text-lg font-bold transition-all outline-none"
                                                        />
                                                    </div>
                                                </motion.div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}

                                {step === 5 && (
                                    <motion.div key="step5" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="grid md:grid-cols-5 gap-8">
                                        <div className="md:col-span-2 space-y-4">
                                            <div className="aspect-[4/5] bg-secondary/10 rounded-2xl overflow-hidden border border-border/50 relative group">
                                                {formData.images[0] && <img src={formData.images[0].url} className="w-full h-full object-cover" alt="" />}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent p-4 flex flex-col justify-end">
                                                    <span className="text-[8px] font-black uppercase tracking-widest text-white/60 mb-1">{formData.category}</span>
                                                    <h4 className="text-lg font-black text-white leading-tight mb-1">{formData.title}</h4>
                                                    <p className="text-xl font-black text-primary">₦ {formData.price}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="md:col-span-3 space-y-6">
                                            <div className="space-y-3">
                                                <h3 className="text-xl font-black tracking-tight font-heading">Final Review</h3>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="p-3 bg-secondary/10 rounded-xl border border-border/40">
                                                        <span className="block text-[7px] font-black uppercase tracking-widest text-muted-foreground">Condition</span>
                                                        <span className="text-xs font-bold">{formData.condition}</span>
                                                    </div>
                                                    <div className="p-3 bg-secondary/10 rounded-xl border border-border/40">
                                                        <span className="block text-[7px] font-black uppercase tracking-widest text-muted-foreground">Status</span>
                                                        <span className="text-xs font-bold">Admin Review</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-3 bg-secondary/5 p-4 rounded-xl border border-border/30">
                                                <label className="flex items-start gap-2.5 cursor-pointer group">
                                                    <input type="checkbox" checked={formData.confirmHonesty} onChange={() => setFormData({ ...formData, confirmHonesty: !formData.confirmHonesty })} className="mt-1 w-4 h-4 rounded border-2 border-border/50 transition-all checked:bg-primary" />
                                                    <div className="flex-1">
                                                        <span className="block text-xs font-bold text-foreground">Accurate listing</span>
                                                    </div>
                                                </label>
                                                <label className="flex items-start gap-2.5 cursor-pointer group">
                                                    <input type="checkbox" checked={formData.confirmSafety} onChange={() => setFormData({ ...formData, confirmSafety: !formData.confirmSafety })} className="mt-1 w-4 h-4 rounded border-2 border-border/50 checked:bg-primary" />
                                                    <div className="flex-1">
                                                        <span className="block text-xs font-bold text-foreground">Safety guidelines</span>
                                                    </div>
                                                </label>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </>
                        )}
                    </AnimatePresence>
                </div>

                {/* Modal Footer */}
                {!isSuccess && (
                    <div className="p-6 border-t border-border/40 bg-secondary/5 flex items-center justify-between">
                        <button
                            onClick={handleBack}
                            disabled={step === 1 || isSubmitting}
                            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${step === 1 ? "opacity-0 pointer-events-none" : "hover:bg-secondary text-muted-foreground"
                                }`}
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Back
                        </button>

                        <button
                            onClick={step === 5 ? handleSubmit : handleNext}
                            disabled={isStepDisabled() || isSubmitting}
                            className={`group flex items-center gap-2 px-8 py-3.5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all ${isStepDisabled() || isSubmitting
                                ? "bg-secondary text-muted-foreground cursor-not-allowed"
                                : "bg-primary text-white shadow-xl shadow-primary/20 hover:scale-105 active:scale-95"
                                }`}
                        >
                            {isSubmitting ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Posting...
                                </div>
                            ) : (
                                <>
                                    {step === 5 ? "Submit Listing" : "Next Step"}
                                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                </>
                            )}
                        </button>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
