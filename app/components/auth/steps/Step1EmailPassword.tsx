"use client";

import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";
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
        else if (!formData.email.split("@")[1].includes("gmail")) newErrors.email = "Use your Gmail for verification";

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
        <div className="space-y-4">
            {/* Email Field */}
            <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground/70">
                    Email Address
                </label>
                <div className="relative group">
                    <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${errors.email ? 'text-red-500' : 'text-muted-foreground group-focus-within:text-primary'}`}>
                        <Mail className="w-5 h-5" />
                    </div>
                    <input
                        type="email"
                        value={formData.email || ""}
                        onChange={(e) => {
                            updateFormData({ email: e.target.value });
                            if (errors.email) setErrors({ ...errors, email: "" });
                        }}
                        placeholder="jane.smith@gmail.com"
                        className={`w-full bg-secondary/30 border-2 ${errors.email ? 'border-red-500/50' : 'border-border/50 focus:border-primary/50'} rounded-2xl py-3 pl-12 pr-4 outline-none transition-all font-medium placeholder:text-muted-foreground/40 text-sm`}
                    />
                </div>
                {errors.email ? (
                    <p className="text-xs font-bold text-red-500 ml-2">{errors.email}</p>
                ) : (
                    <p className="text-[10px] font-medium text-muted-foreground/60 ml-2 italic">
                        * Use your Gmail for verification
                    </p>
                )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground/70">
                    Create Password
                </label>
                <div className="relative group">
                    <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${errors.password ? 'text-red-500' : 'text-muted-foreground group-focus-within:text-primary'}`}>
                        <Lock className="w-5 h-5" />
                    </div>
                    <input
                        type={showPassword ? "text" : "password"}
                        value={formData.password || ""}
                        onChange={(e) => {
                            updateFormData({ password: e.target.value });
                            if (errors.password) setErrors({ ...errors, password: "" });
                        }}
                        placeholder="Min. 8 characters"
                        className={`w-full bg-secondary/30 border-2 ${errors.password ? 'border-red-500/50' : 'border-border/50 focus:border-primary/50'} rounded-2xl py-3 pl-12 pr-12 outline-none transition-all font-medium placeholder:text-muted-foreground/40 text-sm`}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
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
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-tighter">
                        <span className={strength <= 25 ? "text-red-500" : strength <= 50 ? "text-orange-500" : strength <= 75 ? "text-yellow-500" : "text-green-500"}>
                            {strength <= 25 ? "Weak" : strength <= 50 ? "Fair" : strength <= 75 ? "Strong" : "Very Strong"}
                        </span>
                        <span className="text-muted-foreground/40 italic">Strength indicator</span>
                    </div>
                </div>
                {errors.password && <p className="text-xs font-bold text-red-500 ml-2">{errors.password}</p>}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-4 pt-2">
                <div className="space-y-2">
                    <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground/70">
                        Confirm Password
                    </label>
                    <div className="relative group">
                        <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${errors.confirmPassword ? 'text-red-500' : 'text-muted-foreground group-focus-within:text-primary'}`}>
                            <Lock className="w-5 h-5" />
                        </div>
                        <input
                            type={showPassword ? "text" : "password"}
                            value={formData.confirmPassword || ""}
                            onChange={(e) => {
                                updateFormData({ confirmPassword: e.target.value });
                                if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: "" });
                            }}
                            placeholder="Repeat password"
                            className={`w-full bg-secondary/30 border-2 ${errors.confirmPassword ? 'border-red-500/50' : 'border-border/50 focus:border-primary/50'} rounded-2xl py-3 pl-12 pr-4 outline-none transition-all font-medium placeholder:text-muted-foreground/40 text-sm`}
                        />
                    </div>
                    {errors.confirmPassword && <p className="text-xs font-bold text-red-500 ml-2">{errors.confirmPassword}</p>}
                </div>
            </div>

            <button
                onClick={handleNext}
                disabled={isLoading}
                className="w-full bg-primary text-white font-bold uppercase tracking-widest py-3.5 rounded-xl shadow-xl shadow-primary/20 hover:shadow-primary/30 active:scale-95 transition-all flex items-center justify-center gap-3 group mt-4"
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

            <p className="text-center text-sm font-medium text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="text-primary font-bold hover:underline">
                    Log in
                </Link>
            </p>
        </div>
    );
}
