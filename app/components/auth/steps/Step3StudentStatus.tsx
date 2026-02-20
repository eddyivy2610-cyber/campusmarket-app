"use client";

import React, { useState } from "react";
import { GraduationCap, Briefcase, ArrowLeft, Loader2, MessageSquare, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Step3Props {
    formData: any;
    updateFormData: (data: any) => void;
    onNext: () => void;
    onBack: () => void;
}

export function Step3StudentStatus({ formData, updateFormData, onNext, onBack }: Step3Props) {
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const isStudent = formData.isStudent === true;
    const isNotStudent = formData.isStudent === false;

    const handleNext = async () => {
        const newErrors: { [key: string]: string } = {};
        if (formData.isStudent === undefined) newErrors.isStudent = "Please select your status";
        if (isStudent && !formData.department) newErrors.department = "Department/Faculty is required";

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
            {/* Student Question */}
            <div className="space-y-4">
                <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground/70 text-left block">
                    Are you a student?
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                        onClick={() => {
                            updateFormData({ isStudent: true });
                            if (errors.isStudent) setErrors({ ...errors, isStudent: "" });
                        }}
                        className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all group ${isStudent
                            ? "border-primary bg-primary/5 shadow-lg shadow-primary/5"
                            : "border-border/50 hover:border-primary/30 hover:bg-secondary/20"
                            }`}
                    >
                        <div className="flex items-center gap-4 text-left">
                            <div className={`p-3 rounded-xl transition-colors ${isStudent ? 'bg-primary text-white' : 'bg-secondary text-muted-foreground group-hover:text-primary'}`}>
                                <GraduationCap className="w-6 h-6" />
                            </div>
                            <div>
                                <p className={`font-bold ${isStudent ? 'text-primary' : 'text-foreground'}`}>Yes, I'm a student</p>
                                <p className="text-xs text-muted-foreground">Display student badge on profile</p>
                            </div>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isStudent ? 'border-primary bg-primary' : 'border-border'}`}>
                            {isStudent && <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                    </button>

                    <button
                        onClick={() => {
                            updateFormData({ isStudent: false });
                            if (errors.isStudent) setErrors({ ...errors, isStudent: "" });
                        }}
                        className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all group ${isNotStudent
                            ? "border-primary bg-primary/5 shadow-lg shadow-primary/5"
                            : "border-border/50 hover:border-primary/30 hover:bg-secondary/20"
                            }`}
                    >
                        <div className="flex items-center gap-4 text-left">
                            <div className={`p-3 rounded-xl transition-colors ${isNotStudent ? 'bg-primary text-white' : 'bg-secondary text-muted-foreground group-hover:text-primary'}`}>
                                <Briefcase className="w-6 h-6" />
                            </div>
                            <div>
                                <p className={`font-bold ${isNotStudent ? 'text-primary' : 'text-foreground'}`}>No, I'm not</p>
                                <p className="text-xs text-muted-foreground">Register as an external user</p>
                            </div>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isNotStudent ? 'border-primary bg-primary' : 'border-border'}`}>
                            {isNotStudent && <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                    </button>
                </div>
                {errors.isStudent && <p className="text-xs font-bold text-red-500 ml-2">{errors.isStudent}</p>}
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
                                <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground/70 text-left block">
                                    Department / Faculty
                                </label>
                                <div className="relative group">
                                    <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${errors.department ? 'text-red-500' : 'text-muted-foreground group-focus-within:text-primary'}`}>
                                        <BookOpen className="w-5 h-5" />
                                    </div>
                                    <input
                                        type="text"
                                        value={formData.department || ""}
                                        onChange={(e) => {
                                            updateFormData({ department: e.target.value });
                                            if (errors.department) setErrors({ ...errors, department: "" });
                                        }}
                                        placeholder="e.g. Computer Science"
                                        className={`w-full bg-secondary/30 border-2 ${errors.department ? 'border-red-500/50' : 'border-border/50 focus:border-primary/50'} rounded-2xl py-4 pl-12 pr-4 outline-none transition-all font-medium placeholder:text-muted-foreground/40`}
                                    />
                                </div>
                                {errors.department && <p className="text-xs font-bold text-red-500 ml-2">{errors.department}</p>}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground/70 text-left block">
                                Short Bio <span className="text-muted-foreground/40 font-medium">(Optional)</span>
                            </label>
                            <div className="relative group">
                                <div className={`absolute left-4 top-4 transition-colors text-muted-foreground group-focus-within:text-primary`}>
                                    <MessageSquare className="w-5 h-5" />
                                </div>
                                <textarea
                                    value={formData.bio || ""}
                                    onChange={(e) => updateFormData({ bio: e.target.value })}
                                    placeholder="Tell us a bit about yourself..."
                                    rows={4}
                                    className={`w-full bg-secondary/30 border-2 border-border/50 focus:border-primary/50 rounded-2xl py-3 pl-12 pr-4 outline-none transition-all font-medium placeholder:text-muted-foreground/40 resize-none text-sm`}
                                />
                            </div>
                            <p className="text-right text-[10px] font-medium text-muted-foreground/40 italic">
                                {formData.bio?.length || 0} / 200 characters
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

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
