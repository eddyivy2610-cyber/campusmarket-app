"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Loader2, ArrowRight, CheckCircle2, RotateCw, AlertCircle } from "lucide-react";
import { NewAuthCard } from "@/components/auth/NewAuthCard";
import { apiPost } from "@/lib/apiClient";
import { useAuth } from "@/context/AuthContext";
import { AuthCardSkeleton, ButtonRing } from "../components/common/LoadingSystem";

export default function VerifyEmailRoute() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F7F8FA] dark:bg-[#0E1015] transition-colors">
          <AuthCardSkeleton />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [resendTimer, setResendTimer] = useState(45);
  const [canResend, setCanResend] = useState(false);
  const [resendFeedback, setResendFeedback] = useState("");

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const queryEmail = searchParams?.get("email");
    if (queryEmail) {
      setEmail(queryEmail);
    } else {
      try {
        const stored = localStorage.getItem("campus_pending_verification_email");
        if (stored) setEmail(stored);
      } catch {}
    }
  }, [searchParams]);

  // Countdown timer for code resend
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer((t) => t - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  const handleDigitChange = (index: number, val: string) => {
    const char = val.replace(/[^0-9]/g, "").slice(-1);
    const newDigits = [...digits];
    newDigits[index] = char;
    setDigits(newDigits);
    setErrorMessage("");

    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 6);
    if (!pasteData) return;

    const newDigits = [...digits];
    for (let i = 0; i < pasteData.length; i++) {
      newDigits[i] = pasteData[i];
    }
    setDigits(newDigits);

    const nextIndex = Math.min(pasteData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = digits.join("");
    if (code.length < 6) {
      setErrorMessage("Please enter the complete 6-digit confirmation code.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      if (email) {
        const res: any = await apiPost("auth/verify-otp", {
          email: email.toLowerCase().trim(),
          otp: code,
        });

        if (res?.user) {
          login({
            id: res.user.id,
            name: res.user.name || res.user.profile?.displayName || "Campus Student",
            email: res.user.email,
            handle: res.user.profile?.handle || res.user.id,
            role: res.user.role || "buyer",
            isStudent: Boolean(res.user.isStudent),
            studentVerified: Boolean(res.user.studentVerified),
            emailVerified: Boolean(res.user.emailVerified ?? true),
            sellerStatus: "none",
            onboardingStep: res.user.onboardingStep || "profile_completed",
            avatar: res.user.profile?.avatar,
            image: res.user.profile?.avatar,
          });
        }
      }

      // Mark email verified and clean up pending state
      try {
        localStorage.setItem("campus_email_verified", "true");
        localStorage.removeItem("campus_pending_verification_email");
      } catch {}

      // Move forward to Campus Profile Setup
      router.push("/onboarding");
    } catch (err: any) {
      setErrorMessage(err?.message || "Invalid or expired code. Please check your inbox or resend.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setCanResend(false);
    setResendTimer(45);
    try {
      if (email) {
        const res: any = await apiPost("auth/send-otp-to-email", {
          email: email.toLowerCase().trim(),
        });
        setResendFeedback(
          res?.message || "A fresh verification code has been dispatched to your email."
        );
      }
    } catch (err: any) {
      setErrorMessage(
        err?.message || "Failed to dispatch verification code. Please wait before retrying."
      );
    }
    setTimeout(() => setResendFeedback(""), 4000);
  };

  return (
    <NewAuthCard
      title="Verify your email"
      subtitle={`We sent a 6-digit verification code to ${
        email || "your email address"
      }.`}
      showBackToHome={false}
    >
      {/* Resend Success Banner */}
      {resendFeedback && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 text-[12.5px] font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{resendFeedback}</span>
        </div>
      )}

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-300 text-[12.5px] font-semibold flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleVerify} className="space-y-5">
        {/* 6 Digit Inputs */}
        <div className="flex items-center justify-between gap-2 sm:gap-2.5">
          {digits.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => {
                inputRefs.current[idx] = el;
              }}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={digit}
              onChange={(e) => handleDigitChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              onPaste={handlePaste}
              className={`w-11 sm:w-12 h-13 sm:h-14 text-center text-[20px] font-extrabold rounded-2xl border transition-all focus:outline-none ${
                digit
                  ? "border-[#171717] dark:border-[#FFC928] bg-white dark:bg-[#181B24] text-[#171717] dark:text-white"
                  : "border-[#DCE0E6] dark:border-white/15 bg-[#F7F8FA] dark:bg-[#181B24] text-[#171717] dark:text-white"
              } focus:border-[#171717] dark:focus:border-[#FFC928] focus:ring-1 focus:ring-[#171717] dark:focus:ring-[#FFC928]`}
              autoFocus={idx === 0}
            />
          ))}
        </div>

        {/* Primary Action Button */}
        <button
          type="submit"
          disabled={isLoading || digits.join("").length < 6}
          className="radius-native w-full py-2.5 sm:py-3 rounded-xl bg-[#171717] hover:bg-[#262626] dark:bg-[#FFC928] dark:hover:bg-[#F2BD24] text-white dark:text-[#171717] font-extrabold text-[13.5px] shadow-sm transition-all active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isLoading && <ButtonRing size="sm" />}
          <span>Verify & continue</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        {/* Resend Code Row */}
        <div className="flex items-center justify-between text-[12.5px] pt-1">
          <span className="text-[#68707A] dark:text-neutral-400">
            Didn&apos;t receive code?
          </span>

          {canResend ? (
            <button
              type="button"
              onClick={handleResend}
              className="font-extrabold text-[#171717] dark:text-[#FFC928] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Resend code</span>
            </button>
          ) : (
            <span className="font-semibold text-[#8C929C]">
              Resend in {resendTimer}s
            </span>
          )}
        </div>
      </form>

      {/* Change Email */}
      <div className="pt-2 text-center text-[12.5px]">
        <Link
          href="/register"
          className="font-bold text-[#8C929C] hover:text-[#171717] dark:hover:text-white hover:underline transition-colors"
        >
          Entered wrong email? Change it
        </Link>
      </div>
    </NewAuthCard>
  );
}
