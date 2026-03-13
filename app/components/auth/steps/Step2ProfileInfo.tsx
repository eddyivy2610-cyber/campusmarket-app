"use client";

import React, { useState, useRef } from "react";
import { User, Camera, ArrowLeft, Loader2, X } from "lucide-react";

interface Step2Props {
    formData: any;
    updateFormData: (data: any) => void;
    onNext: () => void;
    onBack: () => void;
}

export function Step2ProfileInfo({ formData, updateFormData, onNext, onBack }: Step2Props) {
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(formData.profileImage || null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setErrors({ ...errors, image: "Max file size is 5MB" });
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setPreviewUrl(result);
                updateFormData({ profileImage: result });
                if (errors.image) setErrors({ ...errors, image: "" });
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setPreviewUrl(null);
        updateFormData({ profileImage: null });
    };

    const handleNext = async () => {
        const newErrors: { [key: string]: string } = {};
        if (!formData.fullName) newErrors.fullName = "Full Name is required";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 800));
        setIsLoading(false);
        onNext();
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-8 items-start">
                {/* Profile Image Section */}
                <div className="flex flex-col items-center gap-4 shrink-0 mx-auto md:mx-0">
                    <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
                        Profile Photo
                    </label>
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full border border-border/60 bg-secondary/20 flex items-center justify-center overflow-hidden relative">
                            {previewUrl ? (
                                <>
                                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={removeImage}
                                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:scale-110 transition-transform"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </>
                            ) : (
                                <User className="w-16 h-16 text-muted-foreground/30" />
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute bottom-1 right-1 p-3 bg-primary text-white rounded-full shadow-sm hover:scale-110 active:scale-95 transition-all"
                        >
                            <Camera className="w-5 h-5" />
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageChange}
                            accept="image/*"
                            className="hidden"
                        />
                    </div>
                    <div className="text-center">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40">
                            JPG or PNG, max 5MB
                        </p>
                        {errors.image && <p className="text-[11px] font-semibold text-red-500 mt-1">{errors.image}</p>}
                    </div>
                </div>

                <div className="flex-1 space-y-4 w-full">
                    {/* Full Name */}
                    <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/70 text-left block">
                            Full Name
                        </label>
                        <input
                            type="text"
                            value={formData.fullName || ""}
                            onChange={(e) => {
                                updateFormData({ fullName: e.target.value });
                                if (errors.fullName) setErrors({ ...errors, fullName: "" });
                            }}
                            placeholder="e.g. Jane Smith"
                            className={`w-full border-b ${errors.fullName ? 'border-red-500/60' : 'border-border'} bg-transparent pb-2 text-sm font-medium outline-none placeholder:text-muted-foreground/40 focus:border-primary/60`}
                        />
                        <p className="text-[11px] font-medium text-muted-foreground/60 italic">
                            Your legal name for account verification
                        </p>
                        {errors.fullName && <p className="text-[11px] font-semibold text-red-500">{errors.fullName}</p>}
                    </div>

                    {/* Display Name */}
                    <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/70 text-left block">
                            Display Name <span className="text-muted-foreground/40 font-medium">(Optional)</span>
                        </label>
                        <input
                            type="text"
                            value={formData.displayName || ""}
                            onChange={(e) => updateFormData({ displayName: e.target.value })}
                            placeholder="What should we call you?"
                            className="w-full border-b border-border bg-transparent pb-2 text-sm font-medium outline-none placeholder:text-muted-foreground/40 focus:border-primary/60"
                        />
                        <p className="text-[11px] font-medium text-muted-foreground/60 italic">
                            This is how others will see you in the market
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex gap-4 mt-8 pt-4 border-t border-border/30">
                <button
                    onClick={onBack}
                    className="hidden md:flex flex-1 bg-secondary text-foreground font-semibold uppercase tracking-widest py-2.5 rounded-md border border-border/50 hover:bg-secondary/80 active:scale-95 transition-all items-center justify-center gap-2 text-xs"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </button>
                <button
                    onClick={handleNext}
                    disabled={isLoading}
                    className="flex-[2] bg-primary text-white font-semibold uppercase tracking-widest py-2.5 rounded-md shadow-sm hover:bg-primary/90 active:scale-95 transition-all flex items-center justify-center gap-3 group text-xs"
                >
                    {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <>
                            Next Step
                            <ArrowLeft className="w-4 h-4 rotate-180 group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
