"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Check, MapPin } from "lucide-react";
import { toast } from "sonner";
import { NewAuthCard } from "@/components/auth/NewAuthCard";
import { apiGet, apiPost } from "@/lib/apiClient";
import { validateDisplayName } from "@/lib/nameValidation";
import {
  CAMPUS_COLLECTION,
  CampusDirectoryEntry,
  CapturedSafetyLocation,
  requestNearestCampusAndSafetyCoords,
} from "@/data/campuses";

export default function RegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Campus directory & sign-up-only nearest-campus detection (precise coords kept confidential)
  const [campuses, setCampuses] = useState<CampusDirectoryEntry[]>(CAMPUS_COLLECTION);
  const [selectedCampus, setSelectedCampus] = useState<string>(CAMPUS_COLLECTION[0].name);
  const [hasUserPickedCampus, setHasUserPickedCampus] = useState(false);
  const [isMatchingCampus, setIsMatchingCampus] = useState(false);
  const [matchedNearestLabel, setMatchedNearestLabel] = useState<string | null>(null);
  const [safetyLocation, setSafetyLocation] = useState<CapturedSafetyLocation | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let list = CAMPUS_COLLECTION;
      try {
        const res: any = await apiGet("/api/campuses");
        if (Array.isArray(res?.data) && res.data.length > 0) {
          list = res.data;
          if (!cancelled) setCampuses(list);
        }
      } catch {}

      if (cancelled) return;
      setIsMatchingCampus(true);
      const loc = await requestNearestCampusAndSafetyCoords({
        highAccuracy: false,
        timeoutMs: 8000,
        campuses: list,
      });
      if (cancelled) return;
      setIsMatchingCampus(false);

      if (loc.granted) {
        setSafetyLocation(loc.safetyLocation);
        setMatchedNearestLabel(loc.nearestCampus.shortName);
        setSelectedCampus((prev) => (hasUserPickedCampus ? prev : loc.nearestCampus.name));
      }
    })();

    return () => {
      cancelled = true;
    };
    // Run once when the user opens the Sign-Up page
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Live name & password validation
  const nameCheck = validateDisplayName(fullName);
  const hasLength = password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isPasswordValid = hasLength && hasLetter && hasNumber;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameCheck.valid) {
      toast.error(nameCheck.error || "Please enter a valid display name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      toast.error("Please enter a valid university or personal email address.");
      return;
    }
    if (!isPasswordValid) {
      toast.error("Please ensure your password meets all requirements.");
      return;
    }
    if (!agreedTerms) {
      toast.error("Please agree to the Terms of Service and Hive Rules.");
      return;
    }

    setIsLoading(true);

    try {
      await apiPost("auth/register", {
        fullName: nameCheck.normalized,
        email: email.trim().toLowerCase(),
        password,
        campus: selectedCampus,
        ...(safetyLocation ? { safetyLocation } : {}),
      });

      // Save pending registration session for verify step
      try {
        localStorage.setItem(
          "campus_pending_verification_email",
          email.trim().toLowerCase()
        );
        localStorage.setItem("campus_pending_fullname", nameCheck.normalized);
        localStorage.setItem("campus_pending_campus", selectedCampus);
      } catch {}

      toast.success("Account created! Check your email for the verification code.");
      // Route to email verification step
      router.push(`/verify-email?email=${encodeURIComponent(email.trim().toLowerCase())}`);
    } catch (err: any) {
      console.error("Registration error:", err);
      toast.error(
        err?.message || "Failed to create account. Please check your information and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const googleEnabled = process.env.NEXT_PUBLIC_ENABLE_GOOGLE_AUTH === "true";

  return (
    <NewAuthCard
      title="Create account"
      subtitle="Start buying, selling, and connecting on your campus."
      showBackToHome={true}
    >
      <form onSubmit={handleRegister} className="space-y-4">
        {/* Full Name */}
        <div className="space-y-1.5">
          <label htmlFor="register-fullName" className="block text-[12px] font-bold text-[#171717] dark:text-neutral-200">
            Full name or display name
          </label>
          <input
            id="register-fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="e.g. Tunde Bello"
            maxLength={40}
            required
            autoComplete="name"
            className="radius-native w-full px-3.5 py-2.5 rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-[#181B24] text-[13.5px] text-[#171717] dark:text-white placeholder-[#8C929C] focus:outline-none focus:border-[#171717] dark:focus:border-[#FFC928] transition-colors"
          />
          {fullName.trim().length > 0 && !nameCheck.valid ? (
            <p className="text-[11.5px] text-rose-600 dark:text-rose-400 font-medium">
              {nameCheck.error}
            </p>
          ) : (
            <p className="text-[11px] text-[#8C929C] dark:text-neutral-400">
              2–40 characters using letters, spaces, hyphens, or apostrophes. Official/system names are reserved.
            </p>
          )}
        </div>

        {/* Email Address */}
        <div className="space-y-1.5">
          <label htmlFor="register-email" className="block text-[12px] font-bold text-[#171717] dark:text-neutral-200">
            Email address
          </label>
          <input
            id="register-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your.email@university.edu.ng"
            required
            autoComplete="email"
            className="radius-native w-full px-3.5 py-2.5 rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-[#181B24] text-[13.5px] text-[#171717] dark:text-white placeholder-[#8C929C] focus:outline-none focus:border-[#171717] dark:focus:border-[#FFC928] transition-colors"
          />
        </div>

        {/* Nearest Campus / University Default Selection */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <label htmlFor="register-campus" className="block text-[12px] font-bold text-[#171717] dark:text-neutral-200">
              Campus / University
            </label>
            {isMatchingCampus ? (
              <span className="inline-flex items-center gap-1 text-[11px] text-[#8C929C] dark:text-neutral-400">
                <Loader2 className="w-3 h-3 animate-spin" />
                Matching nearest campus...
              </span>
            ) : matchedNearestLabel ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                <MapPin className="w-3 h-3" />
                Nearest: {matchedNearestLabel}
              </span>
            ) : null}
          </div>
          <select
            id="register-campus"
            value={selectedCampus}
            onChange={(e) => {
              setHasUserPickedCampus(true);
              setSelectedCampus(e.target.value);
            }}
            className="radius-native w-full px-3.5 py-2.5 rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-[#181B24] text-[13.5px] text-[#171717] dark:text-white focus:outline-none focus:border-[#171717] dark:focus:border-[#FFC928] transition-colors"
          >
            {campuses.map((c) => (
              <option key={c.slug} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label htmlFor="register-password" className="block text-[12px] font-bold text-[#171717] dark:text-neutral-200">
            Password
          </label>
          <div className="relative">
            <input
              id="register-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a strong password"
              required
              autoComplete="new-password"
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

          {/* Dynamic Requirements Helper */}
          {password.length > 0 && (
            <div className="p-2.5 rounded-xl bg-[#F7F8FA] dark:bg-white/5 text-[11.5px] space-y-1 mt-1 border border-[#ECEEF2] dark:border-white/5">
              <div
                className={`flex items-center gap-1.5 font-medium ${
                  hasLength ? "text-[#15803D]" : "text-[#8C929C]"
                }`}
              >
                <Check
                  className={`w-3.5 h-3.5 ${
                    hasLength ? "text-[#15803D]" : "text-[#C5C9D3]"
                  }`}
                />
                <span>At least 8 characters</span>
              </div>
              <div
                className={`flex items-center gap-1.5 font-medium ${
                  hasLetter && hasNumber ? "text-[#15803D]" : "text-[#8C929C]"
                }`}
              >
                <Check
                  className={`w-3.5 h-3.5 ${
                    hasLetter && hasNumber ? "text-[#15803D]" : "text-[#C5C9D3]"
                  }`}
                />
                <span>Contains both letters and numbers</span>
              </div>
            </div>
          )}
        </div>

        {/* Terms & Conditions */}
        <div className="pt-0.5">
          <label className="flex items-start gap-2.5 cursor-pointer text-[12px] leading-relaxed">
            <input
              type="checkbox"
              checked={agreedTerms}
              onChange={(e) => setAgreedTerms(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-[#C5C9D3] text-[#171717] focus:ring-0 accent-[#171717] dark:accent-[#FFC928]"
            />
            <span className="text-[#68707A] dark:text-neutral-400">
              I agree to the{" "}
              <Link
                href="/terms-of-service"
                target="_blank"
                onClick={(e) => e.stopPropagation()}
                className="font-bold text-[#171717] dark:text-white underline"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/community-rules"
                target="_blank"
                onClick={(e) => e.stopPropagation()}
                className="font-bold text-[#171717] dark:text-white underline"
              >
                Hive Rules
              </Link>
              .
            </span>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="radius-native w-full py-2.5 sm:py-3 rounded-xl bg-[#171717] hover:bg-[#262626] dark:bg-[#FFC928] dark:hover:bg-[#F2BD24] text-white dark:text-[#171717] font-extrabold text-[13.5px] shadow-sm transition-all active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          <span>Create account</span>
        </button>

        {googleEnabled && (
          <button type="button" disabled className="radius-native w-full py-2.5 sm:py-3 rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-white/5 text-[#171717] dark:text-white font-bold text-[13px] flex items-center justify-center gap-2.5 transition-colors cursor-not-allowed opacity-60">
            <img src="/google.svg" alt="Google" className="w-4 h-4" />
            <span>Google sign-in unavailable</span>
          </button>
        )}
      </form>

      {/* Switch to Sign In */}
      <div className="pt-2 text-center text-[13px] text-[#68707A] dark:text-neutral-400">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-extrabold text-[#171717] dark:text-[#FFC928] hover:underline"
        >
          Log in
        </Link>
      </div>
    </NewAuthCard>
  );
}
