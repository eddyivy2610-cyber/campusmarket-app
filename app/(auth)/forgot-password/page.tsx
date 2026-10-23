"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Mail, ArrowRight, CheckCircle2, Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { NewAuthCard } from "@/components/auth/NewAuthCard";

export default function ForgotPasswordPage() {
  const searchParams = useSearchParams();
  const resetToken = searchParams.get("token") || "";
  const [step, setStep] = useState<"email" | "verify" | "success">(resetToken ? "verify" : "email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }
    setIsLoading(true);
    setErrorMessage("");
    try {
      const response = await fetch("/api/auth/password-reset/request", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ email }) });
      if (!response.ok) throw new Error("Unable to process request.");
      setStep("verify");
    } catch (error: any) { setErrorMessage(error?.message || "Unable to process request."); }
    finally { setIsLoading(false); }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const submittedToken = code.trim() || resetToken;
    if (!submittedToken) {
      setErrorMessage("Open the reset link from your email to continue.");
      return;
    }
    if (newPassword.length < 8) {
      setErrorMessage("Password must be at least 8 characters.");
      return;
    }
    setIsLoading(true);
    setErrorMessage("");
    try {
      const response = await fetch("/api/auth/password-reset/confirm", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ token: submittedToken, password: newPassword }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || "Invalid or expired reset link.");
      setStep("success");
    } catch (error: any) { setErrorMessage(error?.message || "Unable to reset password."); }
    finally { setIsLoading(false); }
  };

  return (
    <NewAuthCard
      title={
        step === "email"
          ? "Reset password"
          : step === "verify"
          ? "Enter recovery code"
          : "Password updated!"
      }
      subtitle={
        step === "email"
          ? "Enter your university or personal email to receive a password reset code."
          : step === "verify"
          ? (resetToken ? "Choose a new password." : `We sent a reset link to ${email}.`)
          : "Your password has been successfully reset. You can now sign in."
      }
      showBackToHome={true}
    >
      {errorMessage && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-300 text-[12.5px] font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {step === "email" && (
        <form onSubmit={handleSendCode} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-[12px] font-bold text-[#171717] dark:text-neutral-200">
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrorMessage("");
              }}
              placeholder="your.email@university.edu.ng"
              required
              className="radius-native w-full px-3.5 py-2.5 rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-[#181B24] text-[13.5px] text-[#171717] dark:text-white placeholder-[#8C929C] focus:outline-none focus:border-[#171717] dark:focus:border-[#FFC928] transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="radius-native w-full py-2.5 sm:py-3 rounded-xl bg-[#171717] hover:bg-[#262626] dark:bg-[#FFC928] dark:hover:bg-[#F2BD24] text-white dark:text-[#171717] font-extrabold text-[13.5px] shadow-sm transition-all active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Send reset code</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      )}

      {step === "verify" && (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-[12px] font-bold text-[#171717] dark:text-neutral-200">
              Reset link token
            </label>
            <input
              type="text"
              maxLength={128}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste the token from your email"
              required
              className="radius-native w-full px-3.5 py-2.5 rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-[#181B24] text-[15px] font-extrabold tracking-widest text-[#171717] dark:text-white placeholder-[#8C929C] focus:outline-none focus:border-[#171717]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[12px] font-bold text-[#171717] dark:text-neutral-200">
              New password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                required
                className="radius-native w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-[#181B24] text-[13.5px] text-[#171717] dark:text-white placeholder-[#8C929C] focus:outline-none focus:border-[#171717]"
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C929C] hover:text-[#171717]"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="radius-native w-full py-2.5 sm:py-3 rounded-xl bg-[#171717] hover:bg-[#262626] dark:bg-[#FFC928] dark:hover:bg-[#F2BD24] text-white dark:text-[#171717] font-extrabold text-[13.5px] shadow-sm transition-all active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Update password</span>
          </button>
        </form>
      )}

      {step === "success" && (
        <div className="text-center space-y-4 pt-2">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <Link
            href="/login"
            className="radius-native w-full py-2.5 sm:py-3 rounded-xl bg-[#171717] text-white dark:bg-[#FFC928] dark:text-[#171717] font-extrabold text-[13.5px] block text-center shadow-sm"
          >
            Sign in with new password
          </Link>
        </div>
      )}

      {step !== "success" && (
        <div className="pt-2 text-center text-[13px] text-[#68707A] dark:text-neutral-400">
          Remember your password?{" "}
          <Link
            href="/login"
            className="font-extrabold text-[#171717] dark:text-[#FFC928] hover:underline"
          >
            Sign in
          </Link>
        </div>
      )}
    </NewAuthCard>
  );
}
