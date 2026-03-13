"use client";

import React, { useState } from "react";
import { Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

interface Step1Props {
    formData: any;
    updateFormData: (data: any) => void;
    onNext: () => void;
}

export function Step1EmailPassword({ formData, updateFormData, onNext }: Step1Props) {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const passwordStrength = (password: string) => {
        if (!password) return 0;
        let strength = 0;
        if (password.length >= 8) strength += 25;
        if (/[A-Z]/.test(password)) strength += 25;
        if (/[0-9]/.test(password)) strength += 25;
        if (/[^A-Za-z0-9]/.test(password)) strength += 25;
        return strength;
    };

    const strength = passwordStrength(formData.password || "");

    const handleNext = async () => {
        const newErrors: { [key: string]: string } = {};
        if (!formData.email) newErrors.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email format";
        else if (!/(gmail|yahoo)\./i.test(formData.email.split("@")[1] || "")) {
            newErrors.email = "Use your Gmail or Yahoo for verification";
        }

        if (!formData.password) newErrors.password = "Password is required";
        else if (formData.password.length < 8) newErrors.password = "Minimum 8 characters";

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsLoading(true);
        // Mimic backend check/verification
        await new Promise((resolve) => setTimeout(resolve, 800));
        setIsLoading(false);
        onNext();
    };

    return (
        <div className="space-y-5">
            {/* Email Field */}
            <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
                    Email Address
                </label>
                <input
                    type="email"
                    value={formData.email || ""}
                    onChange={(e) => {
                        updateFormData({ email: e.target.value });
                        if (errors.email) setErrors({ ...errors, email: "" });
                    }}
                    placeholder="jane.smith@gmail.com"
                    className={`w-full border-b ${errors.email ? 'border-red-500/60' : 'border-border'} bg-transparent pb-2 text-sm font-medium outline-none placeholder:text-muted-foreground/40 focus:border-primary/60`}
                />
                {errors.email ? (
                    <p className="text-[11px] font-semibold text-red-500">{errors.email}</p>
                ) : (
                    <p className="text-[11px] font-medium text-muted-foreground/60 italic">
                        * Use your Gmail or Yahoo for verification
                    </p>
                )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
                    Create Password
                </label>
                <div className="relative">
                    <input
                        type={showPassword ? "text" : "password"}
                        value={formData.password || ""}
                        onChange={(e) => {
                            updateFormData({ password: e.target.value });
                            if (errors.password) setErrors({ ...errors, password: "" });
                        }}
                        placeholder="Min. 8 characters"
                        className={`w-full border-b ${errors.password ? 'border-red-500/60' : 'border-border'} bg-transparent pb-2 pr-8 text-sm font-medium outline-none placeholder:text-muted-foreground/40 focus:border-primary/60`}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                </div>

                {/* Strength Indicator */}
                <div className="px-2 space-y-2">
                    <div className="flex gap-1.5 h-1.5">
                        {[25, 50, 75, 100].map((level) => (
                            <div
                                key={level}
                                className={`flex-1 rounded-full transition-all duration-500 ${strength >= level
                                    ? strength <= 25 ? "bg-red-500" : strength <= 50 ? "bg-orange-500" : strength <= 75 ? "bg-yellow-500" : "bg-green-500"
                                    : "bg-secondary"
                                    }`}
                            />
                        ))}
                    </div>
                    <div className="flex justify-between items-center text-[9px] font-semibold uppercase tracking-tighter">
                        <span className={strength <= 25 ? "text-red-500" : strength <= 50 ? "text-orange-500" : strength <= 75 ? "text-yellow-500" : "text-green-500"}>
                            {strength <= 25 ? "Weak" : strength <= 50 ? "Fair" : strength <= 75 ? "Strong" : "Very Strong"}
                        </span>
                        <span className="text-muted-foreground/40 italic">Strength indicator</span>
                    </div>
                </div>
                {errors.password && <p className="text-[11px] font-semibold text-red-500">{errors.password}</p>}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-4 pt-2">
                <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
                        Confirm Password
                    </label>
                    <input
                        type={showPassword ? "text" : "password"}
                        value={formData.confirmPassword || ""}
                        onChange={(e) => {
                            updateFormData({ confirmPassword: e.target.value });
                            if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: "" });
                        }}
                        placeholder="Repeat password"
                        className={`w-full border-b ${errors.confirmPassword ? 'border-red-500/60' : 'border-border'} bg-transparent pb-2 text-sm font-medium outline-none placeholder:text-muted-foreground/40 focus:border-primary/60`}
                    />
                    {errors.confirmPassword && <p className="text-[11px] font-semibold text-red-500">{errors.confirmPassword}</p>}
                </div>
            </div>

            <button
                onClick={handleNext}
                disabled={isLoading}
                className="w-full bg-primary text-white font-semibold uppercase tracking-widest text-xs py-2.5 rounded-md shadow-sm hover:bg-primary/90 active:scale-95 transition-all flex items-center justify-center gap-3 group mt-4"
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

            <p className="text-center text-sm font-medium text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="text-primary font-semibold hover:underline">
                    Log in
                </Link>
            </p>
        </div>
    );
}
