"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  Building,
  Check,
  CheckCircle2,
  Camera,
  Upload,
  ArrowRight,
  Search,
  Sparkles,
  Layers,
  ShoppingBag,
  Store,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { NewAuthCard } from "@/components/auth/NewAuthCard";
import { ButtonRing } from "@/components/common/LoadingSystem";
import { useAuth } from "@/context/AuthContext";
import { uploadFileClient } from "@/lib/clientUpload";

const CAMPUSES = [
  { id: "abu-samaru", name: "Ahmadu Bello University (ABU Samaru Main Campus)", city: "Zaria, Kaduna" },
  { id: "abu-kongo", name: "ABU Zaria (Kongo Campus)", city: "Zaria, Kaduna" },
  { id: "unilag", name: "University of Lagos (UNILAG)", city: "Akoka, Lagos" },
  { id: "ui-ibadan", name: "University of Ibadan (UI)", city: "Ibadan, Oyo" },
  { id: "oau-ife", name: "Obafemi Awolowo University (OAU)", city: "Ile-Ife, Osun" },
  { id: "buk-kano", name: "Bayero University Kano (BUK)", city: "Kano" },
  { id: "unn-nsukka", name: "University of Nigeria, Nsukka (UNN)", city: "Nsukka, Enugu" },
  { id: "futo", name: "Federal University of Technology, Owerri (FUTO)", city: "Owerri, Imo" },
  { id: "abuth", name: "ABU Teaching Hospital (ABUTH)", city: "Shika, Zaria" },
];

const DEPARTMENTS = [
  "Computer Science & Engineering",
  "Electrical & Electronics Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Medicine & Surgery",
  "Pharmacy",
  "Accounting & Finance",
  "Business Administration",
  "Architecture",
  "Law",
  "Mass Communication",
  "Economics",
  "Biochemistry",
  "Agricultural Science",
  "Other / General Studies",
];

const LEVELS = ["100 Level", "200 Level", "300 Level", "400 Level", "500 Level", "Postgraduate"];

const SAMPLE_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, login } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<"profile" | "completed">("profile");

  // Form states
  const [selectedCampus, setSelectedCampus] = useState(CAMPUSES[0].name);
  const [campusSearch, setCampusSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [level, setLevel] = useState("300 Level");
  const [displayName, setDisplayName] = useState(user?.name || "Tunde Bello");
  const [avatarUrl, setAvatarUrl] = useState(SAMPLE_AVATARS[0]);
  const [isLoading, setIsLoading] = useState(false);

  // Search filtered campuses
  const filteredCampuses = CAMPUSES.filter((c) =>
    c.name.toLowerCase().includes(campusSearch.toLowerCase().trim()) ||
    c.city.toLowerCase().includes(campusSearch.toLowerCase().trim())
  );

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file (JPG, PNG, WEBP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be smaller than 5MB.");
      return;
    }

    try {
      setIsLoading(true);
      const res = await uploadFileClient(file, "avatar");
      if (res.success && res.url) {
        setAvatarUrl(res.url);
      } else {
        alert(res.error || "Failed to upload avatar image.");
      }
    } catch (err: any) {
      alert(err.message || "Failed to upload avatar.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinishSetup = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);

    // Save profile preferences
    const updatedUser = {
      id: user?.id || "usr-" + Date.now().toString().slice(-6),
      name: displayName || user?.name || "Campus Student",
      email: user?.email || "student@university.edu.ng",
      handle: (displayName || "student").toLowerCase().replace(/[^a-z0-9]/g, ""),
      role: "buyer" as const,
      isStudent: true,
      studentVerified: true,
      sellerStatus: "approved" as const,
      onboardingStep: "completed" as const,
      avatar: avatarUrl,
    };

    login(updatedUser);

    try {
      localStorage.setItem("ch_profile_identity_v1", JSON.stringify({
        name: displayName,
        username: `@${(displayName || "student").toLowerCase().replace(/[^a-z0-9]/g, "")}`,
        bio: `Student at ${selectedCampus}.`,
        location: `${selectedCampus.split("(")[0].trim()}`,
        avatar: avatarUrl,
      }));
    } catch {}

    // Show celebration screen
    setIsLoading(false);
    setStep("completed");
  };

  const handleSkip = () => {
    handleFinishSetup();
  };

  // --------------------------------------------------------------------------
  // STEP 2: CELEBRATION / FIRST VISIT (Matching Image 2 Reference)
  // --------------------------------------------------------------------------
  if (step === "completed") {
    return (
      <div
        style={{ fontFamily: "var(--font-plus-jakarta), sans-serif" }}
        className="min-h-screen relative flex flex-col justify-center items-center bg-[#F7F8FA] dark:bg-[#0E1015] px-4 py-8 antialiased"
      >
        {/* Subtle Brand Background Glow */}
        <div
          className="pointer-events-none absolute w-72 h-72 rounded-full bg-[#FFE182]/25 dark:bg-[#FFC928]/5 blur-3xl -top-12"
          aria-hidden="true"
        />

        <div className="relative z-10 w-full max-w-[460px]">
          {/* Card Box */}
          <div className="radius-native bg-white dark:bg-[#14161D] rounded-3xl border border-[#ECEEF2] dark:border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.03)] p-7 sm:p-9 text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
            {/* Green Tick Hexagonal Badge (From Image 2) */}
            <div className="w-16 h-16 rounded-2xl bg-[#E8F8EE] dark:bg-emerald-500/10 border border-[#A7F3D0] dark:border-emerald-500/20 text-[#15803D] dark:text-emerald-400 flex items-center justify-center mx-auto shadow-xs">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>

            <div className="space-y-2">
              <h1 className="text-[22px] sm:text-[25px] font-black text-[#171717] dark:text-white tracking-[-0.02em]">
                You&apos;re in! Welcome to Campus Hive
              </h1>
              <p className="text-[13px] text-[#68707A] dark:text-neutral-400 leading-relaxed max-w-sm mx-auto">
                Your campus profile is ready. Discover trusted listings, trade locally, and connect with verified peers at{" "}
                <span className="font-bold text-[#171717] dark:text-white">{selectedCampus.split("(")[0].trim()}</span>.
              </p>
            </div>

            {/* Suggested Categories Shortcut */}
            <div className="p-4 rounded-2xl bg-[#F7F8FA] dark:bg-white/[0.03] border border-[#ECEEF2] dark:border-white/5 space-y-2.5 text-left">
              <div className="text-[11.5px] font-extrabold uppercase tracking-wider text-[#8C929C]">
                Explore Campus Market
              </div>
              <div className="grid grid-cols-2 gap-2 text-[12px] font-bold">
                <Link
                  href="/explore?category=Electronics"
                  className="radius-native p-2.5 rounded-xl bg-white dark:bg-white/5 border border-[#ECEEF2] dark:border-white/10 hover:border-[#FFC928] flex items-center justify-between text-[#171717] dark:text-white transition-colors"
                >
                  <span>Electronics & Tech</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#8C929C]" />
                </Link>
                <Link
                  href="/explore?category=Academics"
                  className="radius-native p-2.5 rounded-xl bg-white dark:bg-white/5 border border-[#ECEEF2] dark:border-white/10 hover:border-[#FFC928] flex items-center justify-between text-[#171717] dark:text-white transition-colors"
                >
                  <span>Books & Study</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#8C929C]" />
                </Link>
                <Link
                  href="/stores"
                  className="radius-native p-2.5 rounded-xl bg-white dark:bg-white/5 border border-[#ECEEF2] dark:border-white/10 hover:border-[#FFC928] flex items-center justify-between text-[#171717] dark:text-white transition-colors"
                >
                  <span>Student Stores</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#8C929C]" />
                </Link>
                <Link
                  href="/services"
                  className="radius-native p-2.5 rounded-xl bg-white dark:bg-white/5 border border-[#ECEEF2] dark:border-white/10 hover:border-[#FFC928] flex items-center justify-between text-[#171717] dark:text-white transition-colors"
                >
                  <span>Campus Services</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#8C929C]" />
                </Link>
              </div>
            </div>

            {/* Primary Action Button */}
            <div className="space-y-3">
              <Link
                href="/explore"
                className="radius-native w-full py-3 rounded-xl bg-[#171717] hover:bg-[#262626] dark:bg-[#FFC928] dark:hover:bg-[#F2BD24] text-white dark:text-[#171717] font-extrabold text-[13.5px] shadow-sm transition-all active:scale-[0.99] block text-center cursor-pointer"
              >
                Start exploring
              </Link>

              {/* Subtle non-blocking seller prompt */}
              <div className="text-[12px] text-[#68707A] dark:text-neutral-400">
                Want to sell? You can open a student storefront anytime from your{" "}
                <Link
                  href="/stores?view=storefront"
                  className="font-bold text-[#171717] dark:text-[#FFC928] underline"
                >
                  Storefront manager
                </Link>
                .
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // STEP 1: CAMPUS PROFILE PERSONALIZATION
  // --------------------------------------------------------------------------
  return (
    <NewAuthCard
      title="Personalize profile"
      subtitle="Select your campus and study details to tailor your marketplace experience."
      showBackToHome={false}
    >
      {/* Top Progress & Skip Bar */}
      <div className="flex items-center justify-between text-[12px] pb-1 border-b border-[#F2F4F7] dark:border-white/5">
        <span className="font-extrabold text-[#171717] dark:text-white">
          Step 2 of 2 · Campus Setup
        </span>
        <button
          type="button"
          onClick={handleSkip}
          className="font-bold text-[#8C929C] hover:text-[#171717] dark:hover:text-white transition-colors cursor-pointer"
        >
          Skip for now
        </button>
      </div>

      <form onSubmit={handleFinishSetup} className="space-y-4">
        {/* Hidden file input for custom avatar upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleAvatarUpload}
          className="hidden"
        />

        {/* Avatar Selection */}
        <div className="flex items-center gap-3.5 pt-1">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="group relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-[#171717] dark:border-[#FFC928] shrink-0 bg-neutral-100 cursor-pointer shadow-xs"
            title="Click to upload custom picture"
          >
            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[9.5px] font-bold">
              <Camera className="w-4 h-4 mb-0.5" />
              <span>Upload</span>
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <label className="block text-[12px] font-bold text-[#171717] dark:text-neutral-200 mb-1">
              Choose profile avatar
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {SAMPLE_AVATARS.map((url, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setAvatarUrl(url)}
                  className={`w-7 h-7 rounded-lg overflow-hidden border-2 transition-transform cursor-pointer ${
                    avatarUrl === url
                      ? "border-[#171717] dark:border-[#FFC928] scale-110 shadow-xs"
                      : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={url} alt={`Option ${i}`} className="w-full h-full object-cover" />
                </button>
              ))}

              {/* Upload Custom Avatar Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`h-7 px-2.5 rounded-lg border text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  !SAMPLE_AVATARS.includes(avatarUrl)
                    ? "bg-[#171717] border-[#171717] text-white dark:bg-white dark:border-white dark:text-[#171717]"
                    : "border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-white/5 text-[#5B636E] dark:text-neutral-300 hover:border-[#171717] dark:hover:border-white hover:text-[#171717]"
                }`}
                title="Upload custom image from your device"
              >
                <Upload className="w-3 h-3" />
                <span>Upload</span>
              </button>
            </div>
          </div>
        </div>

        {/* Display Name */}
        <div className="space-y-1.5">
          <label className="block text-[12px] font-bold text-[#171717] dark:text-neutral-200">
            Display name
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your name or store name"
            required
            className="radius-native w-full px-3.5 py-2.5 rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-[#181B24] text-[13.5px] text-[#171717] dark:text-white placeholder-[#8C929C] focus:outline-none focus:border-[#171717] dark:focus:border-[#FFC928] transition-colors"
          />
        </div>

        {/* Searchable Campus Selector */}
        <div className="space-y-1.5">
          <label className="block text-[12px] font-bold text-[#171717] dark:text-neutral-200">
            Your university or campus
          </label>

          {/* Current selected campus pill (when not actively searching) */}
          {selectedCampus && !campusSearch.trim() && (
            <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#F7F8FA] dark:bg-white/5 border border-[#ECEEF2] dark:border-white/10 text-[12.5px]">
              <div className="flex items-center gap-2 min-w-0 pr-2">
                <Building className="w-4 h-4 text-[#8C929C] shrink-0" />
                <span className="font-semibold text-[#171717] dark:text-white truncate">
                  {selectedCampus}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setCampusSearch(" ")}
                className="text-[11.5px] font-bold text-[#8C929C] hover:text-[#171717] dark:hover:text-white shrink-0 underline cursor-pointer"
              >
                Change
              </button>
            </div>
          )}

          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#8C929C] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={campusSearch}
              onChange={(e) => setCampusSearch(e.target.value)}
              placeholder="Type to search campus (e.g. UNILAG, ABU, UI, BUK)..."
              className="radius-native w-full pl-9 pr-8 py-2.5 rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-[#181B24] text-[13px] text-[#171717] dark:text-white placeholder-[#8C929C] focus:outline-none focus:border-[#171717] dark:focus:border-[#FFC928] transition-colors"
            />
            {campusSearch && (
              <button
                type="button"
                onClick={() => setCampusSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C929C] hover:text-[#171717] dark:hover:text-white text-xs font-bold"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filtered Campus List: ONLY displayed when user begins typing/searching! */}
          {campusSearch.trim().length > 0 && (
            <div className="max-h-44 overflow-y-auto space-y-1 rounded-xl border border-[#ECEEF2] dark:border-white/10 p-1.5 bg-[#F7F8FA] dark:bg-[#181B24] shadow-sm animate-in fade-in slide-in-from-top-1 duration-150">
              {filteredCampuses.length > 0 ? (
                filteredCampuses.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setSelectedCampus(c.name);
                      setCampusSearch("");
                    }}
                    className={`radius-native w-full p-2.5 rounded-lg text-left text-[12.5px] transition-colors flex items-center justify-between cursor-pointer ${
                      selectedCampus === c.name
                        ? "bg-[#171717] text-white dark:bg-white dark:text-[#171717] font-bold"
                        : "text-[#171717] dark:text-neutral-200 hover:bg-neutral-200/60 dark:hover:bg-white/10"
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="font-semibold truncate">{c.name}</div>
                      <div className="text-[11px] opacity-75">{c.city}</div>
                    </div>
                    {selectedCampus === c.name && <Check className="w-4 h-4 shrink-0" />}
                  </button>
                ))
              ) : (
                <div className="p-3 text-center text-[12px] text-[#8C929C]">
                  No campuses matching &ldquo;{campusSearch.trim()}&rdquo;
                </div>
              )}
            </div>
          )}
        </div>

        {/* Department & Level Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Department */}
          <div className="space-y-1.5">
            <label className="block text-[12px] font-bold text-[#171717] dark:text-neutral-200">
              Department (optional)
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="radius-native w-full px-3 py-2.5 rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-[#181B24] text-[12.5px] text-[#171717] dark:text-white focus:outline-none focus:border-[#171717]"
            >
              <option value="">Select department</option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Academic Level */}
          <div className="space-y-1.5">
            <label className="block text-[12px] font-bold text-[#171717] dark:text-neutral-200">
              Level (optional)
            </label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="radius-native w-full px-3 py-2.5 rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-[#181B24] text-[12.5px] text-[#171717] dark:text-white focus:outline-none focus:border-[#171717]"
            >
              {LEVELS.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="radius-native w-full py-2.5 sm:py-3 rounded-xl bg-[#171717] hover:bg-[#262626] dark:bg-[#FFC928] dark:hover:bg-[#F2BD24] text-white dark:text-[#171717] font-extrabold text-[13.5px] shadow-sm transition-all active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 mt-2"
        >
          {isLoading && <ButtonRing size="sm" />}
          <span>Complete setup</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </NewAuthCard>
  );
}
