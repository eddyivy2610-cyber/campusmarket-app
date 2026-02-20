"use client";

import React, { useState } from "react";
import { Tag, FileText, CheckCircle2, ArrowLeft, Loader2, Sparkles, LayoutGrid } from "lucide-react";

interface SellerDetailsProps {
    formData: any;
    updateFormData: (data: any) => void;
    onSubmit: () => void;
    onBack: () => void;
}

const categories = [
    "Electronics", "Fashion", "Books", "Services", "Hostel Items", "Food & Snacks", "Other"
];

export function SellerDetails({ formData, updateFormData, onSubmit, onBack }: SellerDetailsProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [agreed, setAgreed] = useState(false);

    const handleFinish = async () => {
        if (!formData.businessCategory) {
            setError("Please select a business category");
            return;
        }
        if (!agreed) {
            setError("Please confirm your information is accurate");
            return;
        }

        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 2000));
        setIsLoading(false);
        onSubmit();
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-2 text-center md:text-left">
                <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground/70">
                    Step 3: Final Details
                </label>
                <h3 className="text-lg font-black font-heading">Complete your seller profile</h3>
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-start">
                {/* Left: Category Selection */}
                <div className="flex-1 space-y-4 w-full">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 block">
                        What kind of business do you offer?
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => {
                                    updateFormData({ businessCategory: cat });
                                    setError("");
                                }}
                                className={`p-3 rounded-xl border-2 text-[10px] font-bold uppercase tracking-widest transition-all ${formData.businessCategory === cat
                                    ? "border-primary bg-primary/5 text-primary shadow-sm"
                                    : "border-border/40 hover:border-primary/30 hover:bg-secondary/10 text-muted-foreground"
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right: Description & Confirmation */}
                <div className="flex-1 space-y-4 w-full">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 block">
                                Business Description
                            </label>
                        </div>
                        <div className="relative group">
                            <div className="absolute left-4 top-4 text-muted-foreground group-focus-within:text-primary transition-colors">
                                <FileText className="w-5 h-5" />
                            </div>
                            <textarea
                                value={formData.businessDescription || ""}
                                onChange={(e) => updateFormData({ businessDescription: e.target.value })}
                                placeholder="Describe what you sell..."
                                rows={3}
                                className="w-full bg-secondary/30 border-2 border-border/50 focus:border-primary/50 rounded-2xl py-4 pl-12 pr-4 outline-none transition-all font-medium placeholder:text-muted-foreground/40 resize-none text-sm"
                            />
                        </div>
                    </div>

                    {/* Final Confirmation */}
                    <label className="flex items-start gap-3 cursor-pointer group p-3 bg-primary/5 rounded-xl border border-primary/10">
                        <div className="relative flex items-center mt-0.5">
                            <input
                                type="checkbox"
                                checked={agreed}
                                onChange={(e) => {
                                    setAgreed(e.target.checked);
                                    setError("");
                                }}
                                className="peer h-5 w-5 opacity-0 absolute cursor-pointer"
                            />
                            <div className={`h-5 w-5 border-2 rounded-lg transition-all ${agreed ? 'bg-primary border-primary flex items-center justify-center text-white' : 'border-border/60 bg-card'
                                }`}>
                                {agreed && <CheckCircle2 className="w-3 h-3" />}
                            </div>
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-[0.05em] text-foreground/70 leading-relaxed text-left flex-1">
                            I confirm accuracy and agree to the <span className="text-primary hover:underline italic">Seller Terms</span>.
                        </span>
                    </label>
                </div>
            </div>

            {error && <p className="text-xs font-bold text-red-500 text-center animate-shake">{error}</p>}

            <div className="flex gap-4 pt-4 border-t border-border/30 mt-6">
                <button
                    onClick={onBack}
                    className="hidden md:flex flex-1 bg-secondary text-foreground font-black uppercase tracking-widest py-3.5 rounded-xl border-2 border-border/50 hover:bg-secondary/80 active:scale-95 transition-all items-center justify-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </button>
                <button
                    onClick={handleFinish}
                    disabled={isLoading}
                    className="flex-[2] bg-primary text-white font-black uppercase tracking-widest py-3.5 rounded-xl shadow-xl shadow-primary/20 hover:shadow-primary/30 active:scale-95 transition-all flex items-center justify-center gap-3 group relative overflow-hidden"
                >
                    {isLoading ? (
                        <div className="flex items-center gap-3">
                            <Loader2 className="w-6 h-6 animate-spin" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">Submitting for review...</span>
                        </div>
                    ) : (
                        <>
                            Submit Application
                            <Sparkles className="w-5 h-5 group-hover:scale-125 transition-transform text-white/50" />
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
