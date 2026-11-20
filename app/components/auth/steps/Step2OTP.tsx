"use client";

import React, { useState, useEffect } from "react";
import { AlertCircle, ArrowLeft, ArrowRight, Loader2, RotateCw } from "lucide-react";
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
    const clean = value.replace(/\D/g, "").slice(-1);
    const newOtp = [...otp];
    newOtp[index] = clean;
    setOtp(newOtp);
    setError("");

    if (clean && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const next = ["", "", "", "", "", ""];
    pasted.split("").forEach((ch, idx) => {
      next[idx] = ch;
    });
    setOtp(next);
    setError("");
    const focusIdx = Math.min(pasted.length, 5);
    document.getElementById(`otp-${focusIdx}`)?.focus();
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) {
      setError("Please enter the full 6-digit verification code.");
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      await apiPost("auth/verify-otp", { email: formData.email, otp: code });
      onNext();
    } catch (err: any) {
      setError(err?.message || "Invalid or expired verification code.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0 || isResending) return;
    setIsResending(true);
    try {
      await apiPost("auth/send-otp-to-email", { email: formData.email });
      setTimer(60);
      setError("");
    } catch {
      setError("Failed to resend verification code. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="space-y-5">
      <p className="text-[13px] text-[#68707A] dark:text-neutral-400 text-center leading-relaxed">
        We sent a 6-digit verification code to{" "}
        <span className="font-bold text-[#171717] dark:text-white">{formData.email}</span>.
      </p>

      {error && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-300 text-[12.5px] font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleVerify} className="space-y-5">
        <div className="flex items-center justify-between gap-2 sm:gap-2.5">
          {otp.map((digit, idx) => (
            <input
              key={idx}
              id={`otp-${idx}`}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              onPaste={handlePaste}
              autoFocus={idx === 0}
              className={`radius-native w-11 sm:w-12 h-12 sm:h-13 text-center text-[18px] font-extrabold rounded-xl border transition-all focus:outline-none ${
                digit
                  ? "border-[#171717] dark:border-[#FFC928] bg-white dark:bg-[#181B24] text-[#171717] dark:text-white"
                  : "border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-[#181B24] text-[#171717] dark:text-white"
              } focus:border-[#171717] dark:focus:border-[#FFC928]`}
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={isLoading || otp.some((d) => !d)}
          className="radius-native w-full py-2.5 sm:py-3 rounded-xl bg-[#171717] hover:bg-[#262626] dark:bg-[#FFC928] dark:hover:bg-[#F2BD24] text-white dark:text-[#171717] font-extrabold text-[13.5px] shadow-sm transition-all active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <span>Verify &amp; continue</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <div className="flex items-center justify-between text-[12.5px] pt-1">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1 font-bold text-[#8C929C] hover:text-[#171717] dark:hover:text-white hover:underline transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Change email</span>
          </button>

          {timer > 0 ? (
            <span className="font-semibold text-[#8C929C]">Resend in {timer}s</span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending}
              className="font-extrabold text-[#171717] dark:text-[#FFC928] hover:underline inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              {isResending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <RotateCw className="w-3.5 h-3.5" />
              )}
              <span>Resend code</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
