"use client";

import React, { useState, useRef } from "react";
import { Upload, FileText, X, CheckCircle2, ArrowRight, ArrowLeft, Loader2, Image as ImageIcon, AlertCircle } from "lucide-react";

interface SellerIdentityProps {
    formData: any;
    updateFormData: (data: any) => void;
    onNext: () => void;
    onBack: () => void;
}

export function SellerIdentity({ formData, updateFormData, onNext, onBack }: SellerIdentityProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(formData.studentIdCard || null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError("File is too large (max 5MB)");
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setPreview(result);
                updateFormData({ studentIdCard: result });
                setError("");
            };
            reader.readAsDataURL(file);
        }
    };

    const handleNext = async () => {
        if (!formData.studentIdCard) {
            setError("Please upload your student ID to proceed");
            return;
        }

        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setIsLoading(false);
        onNext();
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="flex-1 space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground/70">
                            Step 2: Student Verification
                        </label>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                            Upload a clear image of your student ID for verification. This helps us maintain a trusted campus community.
                        </p>
                    </div>

                    {/* Benefits Reminder */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-secondary/30 rounded-xl flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                            <span className="text-[10px] font-bold uppercase tracking-tight text-foreground/70">Verified Badge</span>
                        </div>
                        <div className="p-3 bg-secondary/30 rounded-xl flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                            <span className="text-[10px] font-bold uppercase tracking-tight text-foreground/70">Buyer Trust</span>
                        </div>
                    </div>
                </div>

                {/* Upload Zone */}
                <div className="flex-[1.2] w-full">
                    <div
                        onClick={() => !preview && fileInputRef.current?.click()}
                        className={`relative aspect-[16/10] w-full rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center p-5 cursor-pointer group ${preview
                            ? "border-primary/50 bg-primary/5 shadow-inner"
                            : "border-border/50 bg-secondary/10 hover:border-primary/50 hover:bg-secondary/20"
                            }`}
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*,.pdf"
                            className="hidden"
                        />

                        {preview ? (
                            <div className="w-full h-full relative rounded-2xl overflow-hidden group/preview">
                                <img src={preview} alt="ID Preview" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setPreview(null);
                                            updateFormData({ studentIdCard: null });
                                        }}
                                        className="p-3 bg-red-500 text-white rounded-full hover:scale-110 transition-transform shadow-xl"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center space-y-4">
                                <div className="w-16 h-16 bg-primary/10 rounded-[20px] flex items-center justify-center mx-auto text-primary group-hover:scale-110 group-hover:rotate-3 transition-transform">
                                    <Upload className="w-8 h-8" />
                                </div>
                                <div>
                                    <p className="font-bold uppercase tracking-widest text-xs text-foreground">Click to upload</p>
                                    <p className="text-[9px] font-bold text-muted-foreground mt-1">PNG, JPG or PDF up to 5MB</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex gap-4 pt-2 border-t border-border/30 mt-6">
                <button
                    onClick={onBack}
                    className="hidden md:flex flex-1 bg-secondary text-foreground font-bold uppercase tracking-widest py-3.5 rounded-xl border-2 border-border/50 hover:bg-secondary/80 active:scale-95 transition-all items-center justify-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </button>
                <button
                    onClick={handleNext}
                    disabled={isLoading}
                    className="flex-[2] bg-primary text-white font-bold uppercase tracking-widest py-3.5 rounded-xl shadow-xl shadow-primary/20 hover:shadow-primary/30 active:scale-95 transition-all flex items-center justify-center gap-3 group"
                >
                    {isLoading ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                        <>
                            Next Step
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}

