"use client";

import React, { useState, useRef } from "react";
import { GraduationCap, Briefcase, ArrowLeft, Loader2, Upload, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface Step3Props {
    formData: any;
    updateFormData: (data: any) => void;
    onNext: () => void;
    onBack: () => void;
    onFinishBuyer: () => void;
}

export function Step3StudentStatus({ formData, updateFormData, onNext, onBack, onFinishBuyer }: Step3Props) {
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(formData.studentIdCard || null);

    const isStudent = formData.isStudent === true;
    const isNotStudent = formData.isStudent === false;

    const handleNext = async () => {
        const newErrors: { [key: string]: string } = {};
        if (formData.isStudent === undefined) newErrors.isStudent = "Please select your status";
        if (isStudent && !formData.schoolName) newErrors.schoolName = "School name is required";
        if (isStudent && !formData.studentIdCard) newErrors.studentIdCard = "Student ID is required";
        if (isNotStudent && !formData.agreedToTerms) newErrors.agreedToTerms = "You must agree to the Terms of Service";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 800));
        setIsLoading(false);

        onNext();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            setErrors((prev) => ({ ...prev, studentIdCard: "File is too large (max 5MB)" }));
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            setPreview(result);
            updateFormData({ studentIdCard: result });
            setErrors((prev) => ({ ...prev, studentIdCard: "" }));
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="space-y-6">
            <div className="h-[420px] md:h-[460px] max-h-[60vh] overflow-y-auto pr-1 space-y-6">
                {/* Student Question */}
                <div className="space-y-4">
                    <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/70 text-left block">
                        Are you a student?
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                            onClick={() => {
                                updateFormData({ isStudent: true });
                                if (errors.isStudent) setErrors({ ...errors, isStudent: "" });
                            }}
                            className={`flex items-center justify-between p-4 rounded-lg border transition-all group ${isStudent
                                ? "border-primary bg-primary/5"
                                : "border-border/50 hover:border-primary/30 hover:bg-secondary/20"
                                }`}
                        >
                            <div className="flex items-center gap-4 text-left">
                                <div className={`p-3 rounded-lg transition-colors ${isStudent ? 'bg-primary text-white' : 'bg-secondary text-muted-foreground group-hover:text-primary'}`}>
                                    <GraduationCap className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className={`font-semibold text-sm ${isStudent ? 'text-primary' : 'text-foreground'}`}>Yes, I'm a student</p>
                                    <p className="text-[10px] text-muted-foreground">Display student badge on profile</p>
                                </div>
                            </div>
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${isStudent ? 'border-primary bg-primary' : 'border-border'}`}>
                                {isStudent && <div className="w-2 h-2 bg-white rounded-full" />}
                            </div>
                        </button>

                        <button
                            onClick={() => {
                                updateFormData({ isStudent: false, studentIdCard: null });
                                setPreview(null);
                                if (errors.isStudent) setErrors({ ...errors, isStudent: "" });
                            }}
                            className={`flex items-center justify-between p-4 rounded-lg border transition-all group ${isNotStudent
                                ? "border-primary bg-primary/5"
                                : "border-border/50 hover:border-primary/30 hover:bg-secondary/20"
                                }`}
                        >
                            <div className="flex items-center gap-4 text-left">
                                <div className={`p-3 rounded-lg transition-colors ${isNotStudent ? 'bg-primary text-white' : 'bg-secondary text-muted-foreground group-hover:text-primary'}`}>
                                    <Briefcase className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className={`font-semibold text-sm ${isNotStudent ? 'text-primary' : 'text-foreground'}`}>No, I'm not</p>
                                    <p className="text-[10px] text-muted-foreground">Register as a buyer only</p>
                                </div>
                            </div>
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${isNotStudent ? 'border-primary bg-primary' : 'border-border'}`}>
                                {isNotStudent && <div className="w-2 h-2 bg-white rounded-full" />}
                            </div>
                        </button>
                    </div>
                    {errors.isStudent && <p className="text-[11px] font-semibold text-red-500">{errors.isStudent}</p>}
                </div>

                {/* Conditional Fields */}
                <AnimatePresence mode="wait">
                    {(isStudent || isNotStudent) && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-6 overflow-hidden"
                        >
                            {isStudent && (
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/70 text-left block">
                                        School Name
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.schoolName || ""}
                                        onChange={(e) => {
                                            updateFormData({ schoolName: e.target.value });
                                            if (errors.schoolName) setErrors({ ...errors, schoolName: "" });
                                        }}
                                        placeholder="e.g. University of Lagos"
                                        className={`w-full border-b ${errors.schoolName ? "border-red-500/60" : "border-border"} bg-transparent pb-2 text-sm font-medium outline-none placeholder:text-muted-foreground/40 focus:border-primary/60`}
                                    />
                                    {errors.schoolName && <p className="text-[11px] font-semibold text-red-500">{errors.schoolName}</p>}
                                </div>
                            )}

                            {isStudent && (
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/70 text-left block">
                                        Student ID (Clear Photo)
                                    </label>
                                    <div
                                        onClick={() => !preview && fileInputRef.current?.click()}
                                        className={`relative aspect-[16/10] w-full rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center p-4 cursor-pointer ${preview
                                            ? "border-primary/50 bg-primary/5"
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
                                            <div className="w-full h-full relative rounded-xl overflow-hidden">
                                                <img src={preview} alt="Student ID Preview" className="w-full h-full object-cover" />
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setPreview(null);
                                                        updateFormData({ studentIdCard: null });
                                                    }}
                                                    className="absolute right-2 top-2 p-2 bg-red-500 text-white rounded-full hover:scale-105 transition-transform shadow"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="text-center space-y-2">
                                                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto text-primary">
                                                    <Upload className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold uppercase tracking-widest text-[10px] text-foreground">Click to upload</p>
                                                    <p className="text-[9px] font-semibold text-muted-foreground mt-1">PNG, JPG or PDF up to 5MB</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    {errors.studentIdCard && <p className="text-[11px] font-semibold text-red-500">{errors.studentIdCard}</p>}
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/70 text-left block">
                                    Short Bio <span className="text-muted-foreground/40 font-medium">(Optional)</span>
                                </label>
                                <textarea
                                    value={formData.bio || ""}
                                    onChange={(e) => updateFormData({ bio: e.target.value })}
                                    placeholder="Tell us a bit about yourself..."
                                    rows={4}
                                    className="w-full border-b border-border bg-transparent pb-2 text-sm font-medium outline-none placeholder:text-muted-foreground/40 focus:border-primary/60 resize-none"
                                />
                                <p className="text-right text-[10px] font-medium text-muted-foreground/40 italic">
                                    {formData.bio?.length || 0} / 200 characters
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="space-y-2">
                    <label className="flex items-start gap-3 cursor-pointer group px-2 text-left">
                        <div className="relative flex items-center mt-0.5">
                            <input
                                type="checkbox"
                                checked={!!formData.agreedToTerms}
                                onChange={(e) => {
                                    updateFormData({ agreedToTerms: e.target.checked });
                                    if (errors.agreedToTerms) setErrors({ ...errors, agreedToTerms: "" });
                                }}
                                className="peer h-5 w-5 opacity-0 absolute cursor-pointer"
                            />
                            <div className={`h-5 w-5 border rounded-md transition-all ${formData.agreedToTerms ? 'bg-primary border-primary' : 'border-border peer-hover:border-primary/50'
                                } flex items-center justify-center text-white`}>
                                {formData.agreedToTerms && <div className="w-3 h-3 bg-white rounded-full" />}
                            </div>
                        </div>
                        <span className="text-[11px] text-muted-foreground leading-relaxed">
                            I agree to the{" "}
                            <Link href="/terms-of-service" className="text-primary font-semibold hover:underline">
                                Terms of Service
                            </Link>{" "}
                            and Privacy Policy.
                        </span>
                    </label>
                    {errors.agreedToTerms && <p className="text-[11px] font-semibold text-red-500">{errors.agreedToTerms}</p>}
                </div>
            </div>

            <div className="flex gap-4 mt-8 pt-4 border-t border-border/30">
                <button
                    onClick={onBack}
                    className="hidden md:flex flex-1 bg-secondary text-foreground font-semibold uppercase tracking-widest text-xs py-2.5 rounded-md border border-border/50 hover:bg-secondary/80 active:scale-95 transition-all items-center justify-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </button>
                <button
                    onClick={handleNext}
                    disabled={isLoading}
                    className="flex-[2] bg-primary text-white font-semibold uppercase tracking-widest text-xs py-2.5 rounded-md shadow-sm hover:bg-primary/90 active:scale-95 transition-all flex items-center justify-center gap-3 group"
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
            <button
                onClick={onBack}
                className="md:hidden mt-4 w-full border border-border/40 rounded-md py-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground flex items-center justify-center gap-2 hover:border-primary/70 hover:text-primary transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                Go back
            </button>
        </div>
    );
}
