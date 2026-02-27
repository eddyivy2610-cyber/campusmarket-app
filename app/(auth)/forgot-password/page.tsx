"use client";

import React, { useState } from "react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Mail, Lock, KeyRound, Eye, EyeOff, Loader2, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Step = "email" | "verify" | "reset" | "success";

export default function ForgotPasswordPage() {
    const [step, setStep] = useState<Step>("email");
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");

    const router = useRouter();

    const handleSendEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            setError("Please enter your email address");
            return;
        }
        setIsLoading(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setIsLoading(false);
        setStep("verify");
        setError("");
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!otp || otp.length < 6) {
            setError("Please enter a valid 6-digit verification code");
            return;
        }
        setIsLoading(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setIsLoading(false);
        setStep("reset");
        setError("");
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password || password.length < 8) {
            setError("Password must be at least 8 characters long");
            return;
        }
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        setIsLoading(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setIsLoading(false);
        setStep("success");
    };

    return (
        <AuthLayout
            title={
                step === "email" ? "Reset Password" :
                    step === "verify" ? "Check Your Email" :
                        step === "reset" ? "Create New Password" :
                            "Password Reset!"
            }
            subtitle={
                step === "email" ? "Enter your email to receive a password reset link." :
                    step === "verify" ? `We've sent a 6-digit verification code to ${email}` :
                        step === "reset" ? "Please choose a strong new password." :
                            "Your password has been successfully reset. You can now log in."
            }
            illustrationUrl="https://images.unsplash.com/photo-1541339907198-e08759dfc3ef?auto=format&fit=crop&q=80&w=800"
        >
            <div className="font-heading">
                {error && <p className="text-xs font-bold text-red-500 mb-4 animate-shake text-center">{error}</p>}

                {/* STEP 1: Email Form */}
                {step === "email" && (
                    <form onSubmit={handleSendEmail} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground/70">
                                Email Address
                            </label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => { setEmail(e.target.value); setError(""); }}
                                    placeholder="your.email@university.edu"
                                    className="w-full bg-secondary/30 border-2 border-border/50 focus:border-primary/50 rounded-2xl py-3 pl-12 pr-4 outline-none transition-all font-medium placeholder:text-muted-foreground/40 text-sm"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-primary text-white font-bold uppercase tracking-widest py-3.5 rounded-xl shadow-xl shadow-primary/20 hover:shadow-primary/30 active:scale-95 transition-all flex items-center justify-center gap-3 group mt-4"
                        >
                            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> :
                                <>Send Verification Code <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>}
                        </button>
                    </form>
                )}

                {/* STEP 2: Verify OTP Form */}
                {step === "verify" && (
                    <form onSubmit={handleVerifyOtp} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground/70">
                                Verification Code
                            </label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                                    <KeyRound className="w-5 h-5" />
                                </div>
                                <input
                                    type="text"
                                    maxLength={6}
                                    value={otp}
                                    onChange={(e) => { setOtp(e.target.value); setError(""); }}
                                    placeholder="123456"
                                    className="w-full bg-secondary/30 border-2 border-border/50 focus:border-primary/50 rounded-2xl py-3 pl-12 pr-4 outline-none transition-all font-bold tracking-widest text-center text-lg placeholder:font-normal placeholder:tracking-normal"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-primary text-white font-bold uppercase tracking-widest py-3.5 rounded-xl shadow-xl shadow-primary/20 hover:shadow-primary/30 active:scale-95 transition-all flex items-center justify-center gap-3 group mt-4"
                        >
                            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> :
                                <>Verify Code <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>}
                        </button>

                        <div className="text-center pt-2">
                            <button type="button" onClick={() => setStep("email")} className="text-[10px] font-bold text-muted-foreground hover:text-primary uppercase tracking-widest transition-colors">
                                Resend Code
                            </button>
                        </div>
                    </form>
                )}

                {/* STEP 3: Reset Password Form */}
                {step === "reset" && (
                    <form onSubmit={handleResetPassword} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground/70">
                                New Password
                            </label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                                    placeholder="••••••••"
                                    className="w-full bg-secondary/30 border-2 border-border/50 focus:border-primary/50 rounded-2xl py-3 pl-12 pr-12 outline-none transition-all font-medium placeholder:text-muted-foreground/40 text-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground/70">
                                Confirm New Password
                            </label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
                                    placeholder="••••••••"
                                    className="w-full bg-secondary/30 border-2 border-border/50 focus:border-primary/50 rounded-2xl py-3 pl-12 pr-12 outline-none transition-all font-medium placeholder:text-muted-foreground/40 text-sm"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-primary text-white font-bold uppercase tracking-widest py-3.5 rounded-xl shadow-xl shadow-primary/20 hover:shadow-primary/30 active:scale-95 transition-all flex items-center justify-center gap-3 group mt-4"
                        >
                            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> :
                                <>Reset Password <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>}
                        </button>
                    </form>
                )}

                {/* STEP 4: Success Message */}
                {step === "success" && (
                    <div className="flex flex-col items-center justify-center space-y-6 pt-4">
                        <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center animate-in zoom-in spin-in-12 duration-500">
                            <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <button
                            onClick={() => router.push("/login")}
                            className="w-full bg-primary text-white font-bold uppercase tracking-widest py-3.5 rounded-xl shadow-xl shadow-primary/20 hover:shadow-primary/30 active:scale-95 transition-all flex items-center justify-center gap-3 group"
                        >
                            Back to Sign In <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                )}

                {/* Back to Login Link */}
                {step !== "success" && (
                    <p className="text-center text-sm font-medium text-muted-foreground mt-6">
                        Remember your password?{" "}
                        <Link href="/login" className="text-primary font-bold hover:underline">
                            Sign In
                        </Link>
                    </p>
                )}
            </div>
        </AuthLayout>
    );
}
