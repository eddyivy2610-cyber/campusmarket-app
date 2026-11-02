"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Loader2, AlertCircle, ShieldCheck } from "lucide-react";
import { NewAuthCard } from "@/components/auth/NewAuthCard";
import { getAdminSession, signInAdmin } from "@/lib/adminAuth";

export default function AdminSignInPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F7F8FA] dark:bg-[#0E1015]">
          <div className="w-8 h-8 rounded-full border-2 border-[#171717] dark:border-[#FFC928] border-t-transparent animate-spin" />
        </div>
      }
    >
      <AdminSignInContent />
    </Suspense>
  );
}

function AdminSignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams?.get("next") || "/admin";

  const [identity, setIdentity] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const session = getAdminSession();
    if (session) {
      router.replace(nextPath);
    }
  }, [nextPath, router]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identity.trim() || !password) {
      setError("Please enter your admin username or email and password.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    const result = await signInAdmin(identity.trim(), password);
    setIsSubmitting(false);

    if (!result.ok) {
      setError(result.error || "Invalid admin credentials.");
      return;
    }

    router.push(nextPath);
  };

  return (
    <NewAuthCard
      title="Admin Suite"
      subtitle="Sign in with your administrative credentials to continue."
      showBackToHome={true}
    >
      {/* Error Banner */}
      {error && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-300 text-[12.5px] font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        {/* Identity Field */}
        <div className="space-y-1.5">
          <label className="block text-[12px] font-bold text-[#171717] dark:text-neutral-200">
            Username or Email
          </label>
          <input
            type="text"
            value={identity}
            onChange={(e) => {
              setIdentity(e.target.value);
              setError("");
            }}
            placeholder="admin or admin@campushive.edu.ng"
            required
            autoComplete="username"
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
                setError("");
              }}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              className="radius-native w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-[#181B24] text-[13.5px] text-[#171717] dark:text-white placeholder-[#8C929C] focus:outline-none focus:border-[#171717] dark:focus:border-[#FFC928] transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C929C] hover:text-[#171717] dark:hover:text-white p-1 cursor-pointer"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="radius-native w-full py-2.5 rounded-xl bg-[#171717] hover:bg-[#262626] dark:bg-[#FFC928] dark:hover:bg-[#F2BD24] text-white dark:text-[#171717] font-bold text-[13px] inline-flex items-center justify-center gap-2 transition-all shadow-xs disabled:opacity-60 cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Verifying credentials...</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" />
              <span>Sign in as Administrator</span>
            </>
          )}
        </button>
      </form>

      {/* Admin Registration Link */}
      <p className="text-center text-[12.5px] text-[#68707A] dark:text-neutral-400 pt-1">
        Need to register a new admin account?{" "}
        <Link
          href="/admin/auth/sign-up"
          className="font-bold text-[#171717] dark:text-[#FFC928] hover:underline inline-flex items-center gap-1"
        >
          <span>Register with Key</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </p>
    </NewAuthCard>
  );
}
