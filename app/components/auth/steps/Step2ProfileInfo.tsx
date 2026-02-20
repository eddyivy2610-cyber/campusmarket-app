"use client";

import React, { useState, useRef } from "react";
import { User, Camera, Building2, ArrowLeft, Loader2, X } from "lucide-react";

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
        if (!formData.displayName) newErrors.displayName = "Display Name is required";

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
                    <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground/70">
                        Profile Photo
                    </label>
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full border-4 border-secondary/50 bg-secondary/20 flex items-center justify-center overflow-hidden relative shadow-xl">
                            {previewUrl ? (
                                <>
                                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={removeImage}
                                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full shadow-lg hover:scale-110 transition-transform"
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
                            className="absolute bottom-1 right-1 p-3 bg-primary text-white rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all shadow-primary/20"
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
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
                            JPG or PNG, max 5MB
                        </p>
                        {errors.image && <p className="text-xs font-bold text-red-500 mt-1">{errors.image}</p>}
                    </div>
                </div>

                <div className="flex-1 space-y-4 w-full">
                    {/* Display Name */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground/70 text-left block">
                            Display Name
                        </label>
                        <div className="relative group">
                            <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${errors.displayName ? 'text-red-500' : 'text-muted-foreground group-focus-within:text-primary'}`}>
                                <User className="w-5 h-5" />
                            </div>
                            <input
                                type="text"
                                value={formData.displayName || ""}
                                onChange={(e) => {
                                    updateFormData({ displayName: e.target.value });
                                    if (errors.displayName) setErrors({ ...errors, displayName: "" });
                                }}
                                placeholder="e.g. Jane Smith"
                                className={`w-full bg-secondary/30 border-2 ${errors.displayName ? 'border-red-500/50' : 'border-border/50 focus:border-primary/50'} rounded-2xl py-3 pl-12 pr-4 outline-none transition-all font-medium placeholder:text-muted-foreground/40 text-sm`}
                            />
                        </div>
                        <p className="text-[10px] font-medium text-muted-foreground/60 ml-2 italic">
                            This is how others will see you
                        </p>
                        {errors.displayName && <p className="text-xs font-bold text-red-500 ml-2">{errors.displayName}</p>}
                    </div>

                    {/* Business Name */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground/70 text-left block">
                            Business Name <span className="text-muted-foreground/40 font-medium">(Optional)</span>
                        </label>
                        <div className="relative group">
                            <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors text-muted-foreground group-focus-within:text-primary`}>
                                <Building2 className="w-5 h-5" />
                            </div>
                            <input
                                type="text"
                                value={formData.businessName || ""}
                                onChange={(e) => updateFormData({ businessName: e.target.value })}
                                placeholder="Your brand or business"
                                className={`w-full bg-secondary/30 border-2 border-border/50 focus:border-primary/50 rounded-2xl py-3 pl-12 pr-4 outline-none transition-all font-medium placeholder:text-muted-foreground/40 text-sm`}
                            />
                        </div>
                        <p className="text-[10px] font-medium text-muted-foreground/60 ml-2 italic">
                            Leave blank if not applicable
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex gap-4 mt-8 pt-4 border-t border-border/30">
                <button
                    onClick={onBack}
                    className="hidden md:flex flex-1 bg-secondary text-foreground font-black uppercase tracking-widest py-3.5 rounded-xl border-2 border-border/50 hover:bg-secondary/80 active:scale-95 transition-all items-center justify-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </button>
                <button
                    onClick={handleNext}
                    disabled={isLoading}
                    className="flex-[2] bg-primary text-white font-black uppercase tracking-widest py-3.5 rounded-xl shadow-xl shadow-primary/20 hover:shadow-primary/30 active:scale-95 transition-all flex items-center justify-center gap-3 group"
                >
                    {isLoading ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                        <>
                            Next Step
                            <span className="p-1 bg-white/20 rounded-lg group-hover:translate-x-1 transition-transform">
                                <ArrowLeft className="w-4 h-4 rotate-180" />
                            </span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
