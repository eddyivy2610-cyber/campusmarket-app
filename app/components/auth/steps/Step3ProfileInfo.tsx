"use client";

import React, { useState } from "react";
import { ArrowLeft, Loader2, UserCheck } from "lucide-react";

interface Step3Props {
    formData: any;
    updateFormData: (data: any) => void;
    onNext: () => Promise<void> | void;
    onBack: () => void;
}

export function Step3ProfileInfo({ formData, updateFormData, onNext, onBack }: Step3Props) {
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const handleNext = async () => {
        const newErrors: { [key: string]: string } = {};
        if (!formData.fullName) newErrors.fullName = "Full Name is required";
        else if (formData.fullName.trim().split(" ").length < 2) {
            newErrors.fullName = "Please enter your first and last name";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsLoading(true);
        try {
            // Progress will happen in the RegisterPage handleFinish now
            await onNext();
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8 py-4">
            <div className="flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-1 border border-emerald-500/20 shadow-sm">
                    <UserCheck className="w-7 h-7 text-emerald-600" />
                </div>
                <div className="space-y-1">
                    <h2 className="text-lg font-bold text-foreground">Tell us your name</h2>
                    <p className="text-xs text-muted-foreground max-w-[280px] leading-relaxed">
                        Your real name helps build trust in the campus hive community.
                    </p>
                </div>
            </div>

            <div className="space-y-6 max-w-sm mx-auto w-full">
                {/* Full Name */}
                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80 block ml-1">
                        Full Name
                    </label>
                    <input
                        type="text"
                        autoFocus
                        value={formData.fullName || ""}
                        onChange={(e) => {
                            updateFormData({ fullName: e.target.value });
                            if (errors.fullName) setErrors({ ...errors, fullName: "" });
                        }}
                        placeholder="e.g. John Doe"
                        className={`w-full h-12 bg-secondary/30 rounded-xl border-2 ${errors.fullName ? 'border-red-500/40' : 'border-transparent'} px-4 text-sm font-medium outline-none focus:border-primary/40 focus:bg-background transition-all placeholder:text-muted-foreground/30`}
                    />
                    {errors.fullName && (
                        <p className="text-[10px] font-bold text-red-500 ml-1 mt-1.5 uppercase tracking-wide">
                            {errors.fullName}
                        </p>
                    )}
                </div>

                <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
                    <p className="text-[11px] text-primary/80 font-medium leading-relaxed italic">
                        Tip: We will generate a unique username for you based on this name. You can change your public display name later if you apply as a seller.
                    </p>
                </div>
            </div>

            <div className="flex gap-4 mt-8 pt-6 border-t border-border/40">
                <button
                    onClick={onBack}
                    className="flex-1 h-11 bg-secondary/50 text-foreground font-bold uppercase tracking-widest py-2 rounded-xl border border-border/60 hover:bg-secondary/80 active:scale-95 transition-all items-center justify-center gap-2 text-[10px]"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back
                </button>
                <button
                    onClick={handleNext}
                    disabled={isLoading || !formData.fullName?.trim()}
                    className="flex-[2] h-11 bg-primary text-white font-bold uppercase tracking-widest py-2 rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-95 transition-all flex items-center justify-center gap-3 group text-[10px] disabled:opacity-50"
                >
                    {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <>
                            Create Account
                            <ArrowLeft className="w-4 h-4 rotate-180 group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
