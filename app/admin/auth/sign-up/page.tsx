"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Loader2, AlertCircle, ShieldCheck } from "lucide-react";
import { NewAuthCard } from "@/components/auth/NewAuthCard";
import { registerAdmin } from "@/lib/adminAuth";

export default function AdminSignUpPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F7F8FA] dark:bg-[#0E1015]">
          <div className="w-8 h-8 rounded-full border-2 border-[#171717] dark:border-[#FFC928] border-t-transparent animate-spin" />
        </div>
      }
    >
      <AdminSignUpContent />
    </Suspense>
  );
}

function AdminSignUpContent() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    username: "",
    password: "",
    key: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email.trim() || !form.username.trim() || !form.password || !form.key.trim()) {
      setError("All fields including administrator registration key are required.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    const result = await registerAdmin({
      email: form.email.trim(),
      username: form.username.trim(),
      password: form.password,
      key: form.key.trim(),
    });

    setIsSubmitting(false);

    if (!result.ok) {
      setError(result.error || "Failed to register administrator account.");
      return;
    }

    router.push("/admin/auth/sign-in");
  };

  return (
    <NewAuthCard
      title="Create Admin Account"
      subtitle="Register a new administrator using your secret platform key."
      showBackToHome={true}
    >
      {/* Error Banner */}
      {error && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-300 text-[12.5px] font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-3.5">
        {/* Email Field */}
        <div className="space-y-1.5">
          <label className="block text-[12px] font-bold text-[#171717] dark:text-neutral-200">
            Email Address
          </label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => {
              setForm((f) => ({ ...f, email: e.target.value }));
              setError("");
            }}
            placeholder="admin@campushive.edu.ng"
            required
            autoComplete="email"
            className="radius-native w-full px-3.5 py-2.5 rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-[#181B24] text-[13.5px] text-[#171717] dark:text-white placeholder-[#8C929C] focus:outline-none focus:border-[#171717] dark:focus:border-[#FFC928] transition-colors"
          />
        </div>

        {/* Username Field */}
        <div className="space-y-1.5">
          <label className="block text-[12px] font-bold text-[#171717] dark:text-neutral-200">
            Username
          </label>
          <input
            type="text"
            value={form.username}
            onChange={(e) => {
              setForm((f) => ({ ...f, username: e.target.value }));
              setError("");
            }}
            placeholder="admin_lead"
            required
            autoComplete="username"
            className="radius-native w-full px-3.5 py-2.5 rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-[#181B24] text-[13.5px] text-[#171717] dark:text-white placeholder-[#8C929C] focus:outline-none focus:border-[#171717] dark:focus:border-[#FFC928] transition-colors"
          />
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <label className="block text-[12px] font-bold text-[#171717] dark:text-neutral-200">
            Password (min 8 characters)
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={(e) => {
                setForm((f) => ({ ...f, password: e.target.value }));
                setError("");
              }}
              placeholder="••••••••"
              required
              minLength={8}
              autoComplete="new-password"
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

        {/* Admin Registration Key Field */}
        <div className="space-y-1.5">
          <label className="block text-[12px] font-bold text-[#171717] dark:text-neutral-200">
            Admin Registration Key
          </label>
          <div className="relative">
            <input
              type={showKey ? "text" : "password"}
              value={form.key}
              onChange={(e) => {
                setForm((f) => ({ ...f, key: e.target.value }));
                setError("");
              }}
              placeholder="Enter registration key"
              required
              className="radius-native w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-[#181B24] text-[13.5px] text-[#171717] dark:text-white placeholder-[#8C929C] focus:outline-none focus:border-[#171717] dark:focus:border-[#FFC928] transition-colors font-mono text-xs"
            />
            <button
              type="button"
              onClick={() => setShowKey((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C929C] hover:text-[#171717] dark:hover:text-white p-1 cursor-pointer"
              aria-label={showKey ? "Hide key" : "Show key"}
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="radius-native w-full py-2.5 rounded-xl bg-[#171717] hover:bg-[#262626] dark:bg-[#FFC928] dark:hover:bg-[#F2BD24] text-white dark:text-[#171717] font-bold text-[13px] inline-flex items-center justify-center gap-2 transition-all shadow-xs disabled:opacity-60 cursor-pointer pt-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Creating administrator account...</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" />
              <span>Create Admin Account</span>
            </>
          )}
        </button>
      </form>

      {/* Return to Sign-in */}
      <p className="text-center text-[12.5px] text-[#68707A] dark:text-neutral-400 pt-1">
        Already an administrator?{" "}
        <Link
          href="/admin/auth/sign-in"
          className="font-bold text-[#171717] dark:text-[#FFC928] hover:underline inline-flex items-center gap-1"
        >
          <span>Sign In</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </p>
    </NewAuthCard>
  );
}
