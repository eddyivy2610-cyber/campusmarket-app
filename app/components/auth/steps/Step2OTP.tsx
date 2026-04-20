"use client";

import React, { useState, useEffect } from "react";
import { Loader2, ArrowLeft, RefreshCw, Smartphone } from "lucide-react";
import { apiPost } from "@/lib/apiClient";

interface Step2Props {
    formData: any;
    onNext: () => void;
    onBack: () => void;
}

export function Step2OTP({ formData, onNext, onBack }: Step2Props) {
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [timer, setTimer] = useState(60);
    const [error, setError] = useState("");

    useEffect(() => {
        const interval = setInterval(() => {
            setTimer((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleChange = (index: number, value: string) => {
        if (!/^[0-9]?$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            nextInput?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`);
            prevInput?.focus();
        }
    };

    const handleVerify = async () => {
        const code = otp.join("");
        if (code.length < 6) {
            setError("Please enter the full 6-digit code");
            return;
        }

        setIsLoading(true);
        setError("");
        try {
            await apiPost("auth/verify-otp", { email: formData.email, otp: code });
            onNext();
        } catch (err: any) {
            setError(err.message || "Invalid or expired OTP");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        if (timer > 0) return;
        setIsResending(true);
        try {
            await apiPost("auth/send-otp-to-email", { email: formData.email });
            setTimer(60);
            setError("");
        } catch (err: any) {
            setError("Failed to resend OTP");
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col items-center justify-center text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                    <Smartphone className="w-6 h-6 text-primary" />
                </div>
                <p className="text-sm font-medium text-foreground">
                    We've sent a 6-digit code to <br />
                    <span className="font-bold text-primary">{formData.email}</span>
                </p>
            </div>

            <div className="flex justify-between gap-2 max-w-xs mx-auto">
                {otp.map((digit, idx) => (
                    <input
                        key={idx}
                        id={`otp-${idx}`}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleChange(idx, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(idx, e)}
                        className="w-12 h-14 border border-border bg-card text-center text-xl font-bold rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                ))}
            </div>

            {error && (
                <p className="text-center text-xs font-semibold text-red-500 animate-shake">
                    {error}
                </p>
            )}

            <div className="flex flex-col gap-4 pt-4">
                <button
                    onClick={handleVerify}
                    disabled={isLoading || otp.some(d => !d)}
                    className="w-full h-11 bg-primary text-white font-bold uppercase tracking-widest text-[10px] rounded-lg shadow-sm hover:bg-primary/90 active:scale-95 transition-all flex items-center justify-center disabled:opacity-50"
                >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify & Continue"}
                </button>

                <div className="flex items-center justify-between px-1">
                    <button
                        onClick={onBack}
                        className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" /> Change Email
                    </button>
                    
                    <button
                        onClick={handleResend}
                        disabled={timer > 0 || isResending}
                        className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-primary disabled:text-muted-foreground/50 transition-colors"
                    >
                        {isResending ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                            <RefreshCw className="w-3.5 h-3.5" />
                        )}
                        {timer > 0 ? `Resend in ${timer}s` : "Resend Code"}
                    </button>
                </div>
            </div>
        </div>
    );
}
