"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { NewAuthCard } from "@/components/auth/NewAuthCard";
import { useAuth } from "@/context/AuthContext";
import { apiPost } from "@/lib/apiClient";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F7F8FA] dark:bg-[#0E1015]">
          <div className="w-8 h-8 rounded-full border-2 border-[#171717] dark:border-white border-t-transparent animate-spin" />
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const redirectUrl = searchParams?.get("redirect") || "/home";
  const registered = searchParams?.get("registered") === "true";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [canResendVerification, setCanResendVerification] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    setCanResendVerification(false);

    try {
      const response: any = await apiPost("auth/login", {
        email: email.trim(),
        password,
      });

      const serverUser = response?.user || response?.data?.user || response?.data;
      if (!serverUser) throw new Error("Unable to load your account.");
      login({
        id: serverUser.id || serverUser._id,
        name: serverUser.name || serverUser.profile?.displayName || "Campus Student",
        email: serverUser.email,
        handle: serverUser.profile?.handle || serverUser.handle,
        role: serverUser.role || "buyer",
        isStudent: Boolean(serverUser.isStudent),
        studentVerified: Boolean(serverUser.studentVerified),
        emailVerified: Boolean(serverUser.emailVerified ?? true),
        sellerStatus: serverUser.sellerStatus || "none",
        onboardingStep: serverUser.onboardingStep || "profile_completed",
        avatar: serverUser.profile?.avatar || serverUser.avatar,
        image: serverUser.profile?.avatar || serverUser.avatar,
      });

      // If user came with a specific redirect, route there; otherwise to explore or home
      router.push(redirectUrl);
    } catch (err: any) {
      setErrorMessage(err?.message || "Unable to sign in. Please try again.");
      setCanResendVerification(Boolean(err?.data?.canResendVerification));
    } finally {
      setIsLoading(false);
    }
  };

  const resendVerification = async () => {
    setIsLoading(true);
    try {
      await apiPost("auth/resend-verification", { email: email.trim(), password });
      router.push(`/verify-email?email=${encodeURIComponent(email.trim())}`);
    } catch (err: any) {
      setErrorMessage(err?.message || "Unable to resend verification code.");
    } finally {
      setIsLoading(false);
    }
  };

  const googleEnabled = process.env.NEXT_PUBLIC_ENABLE_GOOGLE_AUTH === "true";

  return (
    <NewAuthCard
      title="Welcome back!"
      subtitle="Please enter your details."
      showBackToHome={true}
    >
      {/* Registration Success Banner */}
      {registered && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 text-[12.5px] font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>Account created! Please sign in with your credentials.</span>
        </div>
      )}

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-300 text-[12.5px] font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {canResendVerification && (
        <button type="button" onClick={resendVerification} disabled={isLoading} className="w-full text-left text-[12px] font-bold text-primary hover:underline disabled:opacity-50">
          Verify your email or resend the code
        </button>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        {/* Email Field */}
        <div className="space-y-1.5">
          <label className="block text-[12px] font-bold text-[#171717] dark:text-neutral-200">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setErrorMessage("");
            }}
            placeholder="Enter your email"
            required
            autoComplete="email"
            className="radius-native w-full px-3.5 py-2.5 rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-[#181B24] text-[13.5px] text-[#171717] dark:text-white placeholder-[#8C929C] focus:outline-none focus:border-[#171717] dark:focus:border-[#FFC928] transition-colors"
          />
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <label className="block text-[12px] font-bold text-[#171717] dark:text-neutral-200">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrorMessage("");
              }}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              className="radius-native w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-[#181B24] text-[13.5px] text-[#171717] dark:text-white placeholder-[#8C929C] focus:outline-none focus:border-[#171717] dark:focus:border-[#FFC928] transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C929C] hover:text-[#171717] dark:hover:text-white p-1"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Remember for 30 days & Forgot Password Row */}
        <div className="flex items-center justify-between text-[12.5px] pt-0.5">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-[#C5C9D3] text-[#171717] focus:ring-0 accent-[#171717] dark:accent-[#FFC928]"
            />
            <span className="text-[#68707A] dark:text-neutral-400 font-medium">
              Remember for 30 days
            </span>
          </label>

          <Link
            href="/forgot-password"
            className="font-bold text-[#171717] dark:text-[#FFC928] hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        {/* Primary Action Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="radius-native w-full py-2.5 sm:py-3 rounded-xl bg-[#171717] hover:bg-[#262626] dark:bg-[#FFC928] dark:hover:bg-[#F2BD24] text-white dark:text-[#171717] font-extrabold text-[13.5px] shadow-sm transition-all active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          <span>Log in</span>
        </button>

        {googleEnabled && (
          <button type="button" disabled className="radius-native w-full py-2.5 sm:py-3 rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-white/5 text-[#171717] dark:text-white font-bold text-[13px] flex items-center justify-center gap-2.5 transition-colors cursor-not-allowed opacity-60">
            <img src="/google.svg" alt="Google" className="w-4 h-4" />
            <span>Google sign-in unavailable</span>
          </button>
        )}
      </form>

      {/* Switch to Register */}
      <div className="pt-2 text-center text-[13px] text-[#68707A] dark:text-neutral-400">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-extrabold text-[#171717] dark:text-[#FFC928] hover:underline"
        >
          Sign Up
        </Link>
      </div>
    </NewAuthCard>
  );
}
