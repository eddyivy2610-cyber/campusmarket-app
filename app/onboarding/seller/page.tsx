"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Store,
  GraduationCap,
  Building2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowLeft,
  Upload,
  Camera,
  MapPin,
  Phone,
  FileText,
  Sparkles,
  Loader2,
  ShieldCheck,
  Calendar,
  UserCheck,
  ScanLine,
} from "lucide-react";
import { RebrandHeader } from "@/components/header/RebrandHeader";
import { RebrandFooter } from "@/components/sections/RebrandFooter";
import { useAuth } from "@/context/AuthContext";
import { uploadFileClient } from "@/lib/clientUpload";
import {
  evaluateStudentIdVerification,
  extractIdFieldsFromOcrText,
} from "@/lib/studentIdVerification";

const CATEGORIES = [
  "Electronics & Tech",
  "Phones & Tablets",
  "Fashion & Style",
  "Food & Treats",
  "Beauty & Wellness",
  "Books & Academic",
  "Hostel & Room Needs",
  "Campus Services",
  "Printing & Stationery",
  "Photography & Creative",
];

const CAMPUSES = [
  "Ahmadu Bello University (ABU)",
  "University of Lagos (UNILAG)",
  "University of Ibadan (UI)",
  "Obafemi Awolowo University (OAU)",
  "University of Nigeria, Nsukka (UNN)",
  "Bayero University Kano (BUK)",
  "Covenant University",
  "University of Ilorin (UNILORIN)",
  "Federal University of Technology, Akure (FUTA)",
  "University of Benin (UNIBEN)",
];

/**
 * Helper to create a compact data URL fallback when local dev has no Cloudinary credentials configured.
 */
async function fileToDataUrlFallback(file: File, maxDim = 900): Promise<string> {
  if (!file.type.startsWith("image/")) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("Failed to read file."));
      reader.readAsDataURL(file);
    });
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || "");
      const img = new Image();
      img.onload = () => {
        try {
          const scale = Math.min(1, maxDim / Math.max(img.width || 1, img.height || 1));
          const canvas = document.createElement("canvas");
          canvas.width = Math.max(1, Math.round(img.width * scale));
          canvas.height = Math.max(1, Math.round(img.height * scale));
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL("image/jpeg", 0.82));
            return;
          }
        } catch {
          // fallback to raw dataUrl
        }
        resolve(dataUrl);
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    };
    reader.onerror = () => resolve("");
    reader.readAsDataURL(file);
  });
}

async function safeUploadFile(
  file: File,
  purpose: "store_logo" | "business_document",
  maxDim = 900
): Promise<string> {
  try {
    const res = await uploadFileClient(file, purpose);
    return res.url;
  } catch {
    return await fileToDataUrlFallback(file, maxDim);
  }
}

export default function SellerOnboardingPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, login } = useAuth();
  const isAuthenticated = Boolean(user);

  const [checkingExisting, setCheckingExisting] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Core unified form fields
  const [fullName, setFullName] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [storeName, setStoreName] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [campus, setCampus] = useState(CAMPUSES[0]);
  const [about, setAbout] = useState("");
  const [contact, setContact] = useState("");

  // Student vs Non-Student Radio
  const [sellerType, setSellerType] = useState<"student" | "non_student">("student");

  // Student verification states
  const [studentIdFile, setStudentIdFile] = useState<File | null>(null);
  const [studentIdPreview, setStudentIdPreview] = useState<string>("");
  const [isScanningId, setIsScanningId] = useState(false);
  const [extractedIdName, setExtractedIdName] = useState("");
  const [cardValidationDate, setCardValidationDate] = useState("");
  const [hasScannedId, setHasScannedId] = useState(false);

  // Non-student business location verification states
  const [operatingLocation, setOperatingLocation] = useState("");
  const [locationProofFile, setLocationProofFile] = useState<File | null>(null);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const studentIdInputRef = useRef<HTMLInputElement>(null);
  const locationProofInputRef = useRef<HTMLInputElement>(null);

  // Pre-fill user details when available
  useEffect(() => {
    if (user?.name && !fullName) {
      setFullName(user.name);
    }
    if ((user?.avatar || user?.image) && !avatarPreview) {
      setAvatarPreview(user.avatar || user.image || "");
    }
    if (user?.isStudent === false) {
      setSellerType("non_student");
    }
  }, [user, fullName, avatarPreview]);

  // Check if user already has an active storefront
  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.push("/login?redirect=/onboarding/seller");
      return;
    }

    async function checkExistingStore() {
      try {
        const storeRes = await fetch("/api/stores/me", { credentials: "include" });
        if (storeRes.ok) {
          const storeJson = await storeRes.json();
          if (storeJson.success && storeJson.data) {
            router.push("/stores?view=storefront");
            return;
          }
        }
      } catch (err) {
        console.error("Failed to check existing seller status:", err);
      } finally {
        setCheckingExisting(false);
      }
    }

    checkExistingStore();
  }, [authLoading, isAuthenticated, router]);

  // Handle Avatar selection
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    const objectUrl = URL.createObjectURL(file);
    setAvatarPreview(objectUrl);
  };

  // Handle Student ID Card upload & automatic OCR extraction
  const handleStudentIdChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setStudentIdFile(file);
    const previewUrl = URL.createObjectURL(file);
    setStudentIdPreview(previewUrl);
    setIsScanningId(true);
    setHasScannedId(false);

    try {
      let ocrText = "";

      // Attempt dynamic browser OCR using Tesseract.js from CDN
      if (typeof window !== "undefined") {
        try {
          if (!(window as any).Tesseract) {
            await new Promise<void>((resolve, reject) => {
              const script = document.createElement("script");
              script.src =
                "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js";
              script.async = true;
              const timeout = setTimeout(() => reject(new Error("OCR load timeout")), 5000);
              script.onload = () => {
                clearTimeout(timeout);
                resolve();
              };
              script.onerror = () => {
                clearTimeout(timeout);
                reject(new Error("OCR script failed"));
              };
              document.head.appendChild(script);
            });
          }

          if ((window as any).Tesseract) {
            const result = await Promise.race([
              (window as any).Tesseract.recognize(file, "eng"),
              new Promise((_, reject) =>
                setTimeout(() => reject(new Error("OCR scan timeout")), 9000)
              ),
            ]);
            ocrText = (result as any)?.data?.text || "";
          }
        } catch {
          // Fallback if offline or CDN unreachable
        }
      }

      const extracted = extractIdFieldsFromOcrText(ocrText, fullName);

      if (extracted.extractedName) {
        setExtractedIdName(extracted.extractedName);
      } else if (fullName.trim()) {
        // Pre-fill with entered full name if OCR could not isolate text lines from stylized ID card
        setExtractedIdName(fullName.trim());
      }

      if (extracted.extractedDate) {
        setCardValidationDate(extracted.extractedDate);
      } else if (!cardValidationDate) {
        // Default to end of current academic year if not printed in standard numeric format
        const nextYear = new Date().getFullYear() + 1;
        setCardValidationDate(`${nextYear}-09-30`);
      }
    } finally {
      setIsScanningId(false);
      setHasScannedId(true);
    }
  };

  // Live evaluation of Student ID card (Name match against Fullname + Card Validation Date check)
  const idVerificationResult = useMemo(() => {
    if (!studentIdFile && !studentIdPreview) return null;
    if (!extractedIdName.trim() && !cardValidationDate.trim()) return null;

    return evaluateStudentIdVerification({
      enteredFullName: fullName,
      extractedIdName,
      cardValidationDate,
    });
  }, [studentIdFile, studentIdPreview, fullName, extractedIdName, cardValidationDate]);

  // Handle Unified "Open Store" Submission
  const handleOpenStore = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!avatarFile && !avatarPreview) {
      setError("Please upload a store avatar / logo.");
      return;
    }
    if (!storeName.trim()) {
      setError("Please enter your storefront name.");
      return;
    }
    if (!about.trim()) {
      setError("Please tell buyers a little about your store.");
      return;
    }
    if (!contact.trim()) {
      setError("Please provide a phone or WhatsApp contact number.");
      return;
    }

    // Validate Student vs Non-Student specific requirements
    if (sellerType === "student") {
      if (!studentIdFile && !studentIdPreview) {
        setError("Please upload your Student ID card image to verify your student status.");
        return;
      }
      if (!idVerificationResult || idVerificationResult.decision === "declined") {
        setError(
          idVerificationResult?.summary ||
            "Student ID verification declined. Please ensure the name on your ID card matches your Fullname and the card is not expired."
        );
        return;
      }
    } else {
      if (!operatingLocation.trim()) {
        setError("Please enter your primary operating location.");
        return;
      }
      if (!locationProofFile) {
        setError(
          "Please upload a proof document for your primary operating location (e.g. utility bill, tenancy receipt, or business certificate)."
        );
        return;
      }
    }

    setSubmitting(true);

    try {
      // 1. Upload Avatar
      let finalLogoUrl = avatarPreview;
      if (avatarFile) {
        finalLogoUrl = await safeUploadFile(avatarFile, "store_logo", 500);
      }

      // 2. Upload verification document depending on sellerType
      let uploadedStudentIdUrl = "";
      let uploadedLocationProofUrl = "";

      if (sellerType === "student" && studentIdFile) {
        uploadedStudentIdUrl = await safeUploadFile(
          studentIdFile,
          "business_document",
          1000
        );
      } else if (sellerType === "non_student" && locationProofFile) {
        uploadedLocationProofUrl = await safeUploadFile(
          locationProofFile,
          "business_document",
          1000
        );
      }

      // 3. Submit to POST /api/stores
      const res = await fetch("/api/stores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          fullName: fullName.trim(),
          logo: finalLogoUrl,
          name: storeName.trim(),
          category,
          campus,
          description: about.trim(),
          contact: {
            phone: contact.trim(),
            whatsapp: contact.trim(),
            email: user?.email || "",
          },
          sellerType,
          // Student verification fields
          studentIdImage: uploadedStudentIdUrl || studentIdPreview,
          extractedIdName: extractedIdName.trim(),
          cardValidationDate: cardValidationDate.trim(),
          // Non-student location verification fields
          operatingLocation:
            sellerType === "non_student"
              ? operatingLocation.trim()
              : `${campus} (Student Store)`,
          locationProofDocument: uploadedLocationProofUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Could not open store. Please check your details and try again.");
        setSubmitting(false);
        return;
      }

      // 4. Sync AuthContext user state immediately
      if (user) {
        login({
          ...user,
          name: fullName.trim(),
          avatar: finalLogoUrl || user.avatar,
          image: finalLogoUrl || user.image,
          role: "seller",
          sellerStatus: "approved",
          isStudent: sellerType === "student",
          studentVerified:
            sellerType === "student" ? true : Boolean(user.studentVerified),
          onboardingStep: "completed",
        });
      }

      router.push("/stores?view=storefront");
    } catch (err: any) {
      setError(err?.message || "Network error occurred while opening your store.");
      setSubmitting(false);
    }
  };

  if (authLoading || checkingExisting) {
    return (
      <div
        style={{ fontFamily: "var(--font-plus-jakarta), sans-serif" }}
        className="min-h-screen flex flex-col bg-[#F7F8FA] dark:bg-[#0E1015]"
      >
        <RebrandHeader />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-3 border-[#FFC928] border-t-transparent rounded-full animate-spin" />
            <p className="text-[13px] font-bold text-[#68707A] dark:text-neutral-400">
              Preparing seller setup...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{ fontFamily: "var(--font-plus-jakarta), sans-serif" }}
      className="min-h-screen flex flex-col bg-[#F7F8FA] dark:bg-[#0E1015] text-[#171717] dark:text-white antialiased"
    >
      <RebrandHeader />

      <main className="flex-1 relative py-6 sm:py-8 px-4 sm:px-6">
        {/* Subtle Brand Ambient Glow */}
        <div
          className="pointer-events-none absolute w-96 h-96 rounded-full bg-[#FFE182]/20 dark:bg-[#FFC928]/5 blur-3xl top-0 left-1/2 -translate-x-1/2"
          aria-hidden="true"
        />

        <div className="relative z-10 max-w-2xl mx-auto space-y-6">
          {/* Global Page Header Style: Text at Left, Back at Far Right */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-[18px] sm:text-[20px] font-extrabold tracking-[-0.02em] text-[#14171A] dark:text-white shrink-0">
                Open Your Campus Storefront
              </h1>
              <p className="text-[12.5px] text-[#8C929C] dark:text-neutral-400 mt-0.5 font-normal">
                Fill in your basic store details below to start selling to students and campus buyers.
              </p>
            </div>

            <div
              className="hidden sm:block flex-1 h-[1px] bg-[#E8EAEE] dark:bg-white/10"
              aria-hidden="true"
            />

            <Link
              href="/stores"
              className="radius-native inline-flex items-center gap-1.5 rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-white/5 hover:border-[#FFC928] hover:bg-[#FFC928]/10 px-3.5 py-1.5 text-[12.5px] font-bold text-[#171717] dark:text-white shrink-0 transition-all cursor-pointer shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </Link>
          </div>

          {/* Main Onboarding Card */}
          <div className="radius-native bg-white dark:bg-[#14161D] rounded-3xl border border-[#ECEEF2] dark:border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.03)] p-6 sm:p-9">
            {error && (
              <div className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 flex items-start gap-3 text-red-700 dark:text-red-300 text-[13px] font-medium">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleOpenStore} className="space-y-6">
              {/* 1. AVATAR & FULLNAME */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-5 p-4 rounded-2xl bg-[#F7F8FA] dark:bg-white/[0.02] border border-[#ECEEF2] dark:border-white/10">
                {/* Avatar Upload */}
                <div className="flex items-center gap-4">
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    className="group relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-dashed border-[#DCE0E6] dark:border-white/20 hover:border-[#171717] dark:hover:border-[#FFC928] bg-white dark:bg-[#181B24] flex flex-col items-center justify-center shrink-0 transition-all cursor-pointer shadow-xs"
                  >
                    {avatarPreview ? (
                      <>
                        <img
                          src={avatarPreview}
                          alt="Store Avatar"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-bold">
                          <Camera className="w-4 h-4 mb-0.5" />
                          Change
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-[#8C929C] group-hover:text-[#171717] dark:group-hover:text-[#FFC928] transition-colors">
                        <Camera className="w-5 h-5 mb-1" />
                        <span className="text-[10px] font-bold">Avatar *</span>
                      </div>
                    )}
                  </button>
                  <div className="sm:hidden">
                    <div className="text-[13px] font-bold text-[#171717] dark:text-white">
                      Store Avatar *
                    </div>
                    <p className="text-[11.5px] text-[#68707A] dark:text-neutral-400">
                      Tap to upload your logo or photo
                    </p>
                  </div>
                </div>

                {/* Fullname Input */}
                <div className="flex-1 space-y-1.5">
                  <label className="block text-[12.5px] font-bold text-[#171717] dark:text-neutral-200">
                    Fullname *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full legal name"
                    className="radius-native w-full px-3.5 py-2.5 rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-[#181B24] text-[13.5px] text-[#171717] dark:text-white placeholder-[#8C929C] focus:outline-none focus:border-[#171717] dark:focus:border-[#FFC928] transition-colors"
                  />
                  <p className="text-[11px] text-[#8C929C]">
                    For students, this must match the name printed on your Student ID card.
                  </p>
                </div>
              </div>

              {/* 2. STOREFRONT NAME & CONTACT */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[12.5px] font-bold text-[#171717] dark:text-neutral-200">
                    Storefront Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="e.g. Amina Tech Hub"
                    className="radius-native w-full px-3.5 py-2.5 rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-[#181B24] text-[13.5px] text-[#171717] dark:text-white placeholder-[#8C929C] focus:outline-none focus:border-[#171717] dark:focus:border-[#FFC928] transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[12.5px] font-bold text-[#171717] dark:text-neutral-200">
                    Contact (Phone / WhatsApp) *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#8C929C] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      placeholder="e.g. 08012345678"
                      className="radius-native w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-[#181B24] text-[13.5px] text-[#171717] dark:text-white placeholder-[#8C929C] focus:outline-none focus:border-[#171717] dark:focus:border-[#FFC928] transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* 3. PRIMARY CATEGORY & TARGET CAMPUS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[12.5px] font-bold text-[#171717] dark:text-neutral-200">
                    Primary Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="radius-native w-full px-3.5 py-2.5 rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-[#181B24] text-[13.5px] text-[#171717] dark:text-white focus:outline-none focus:border-[#171717] dark:focus:border-[#FFC928] transition-colors"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[12.5px] font-bold text-[#171717] dark:text-neutral-200">
                    Target Campus *
                  </label>
                  <select
                    value={campus}
                    onChange={(e) => setCampus(e.target.value)}
                    className="radius-native w-full px-3.5 py-2.5 rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-[#181B24] text-[13.5px] text-[#171717] dark:text-white focus:outline-none focus:border-[#171717] dark:focus:border-[#FFC928] transition-colors"
                  >
                    {CAMPUSES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 4. ABOUT */}
              <div className="space-y-1.5">
                <label className="block text-[12.5px] font-bold text-[#171717] dark:text-neutral-200">
                  About *
                </label>
                <textarea
                  rows={3}
                  required
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  placeholder="Describe what your store sells, delivery options, or campus pickup details..."
                  className="radius-native w-full px-3.5 py-2.5 rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-[#181B24] text-[13.5px] text-[#171717] dark:text-white placeholder-[#8C929C] focus:outline-none focus:border-[#171717] dark:focus:border-[#FFC928] transition-colors resize-none"
                />
              </div>

              {/* 5. STUDENT / NON-STUDENT RADIO */}
              <div className="space-y-3 pt-1">
                <label className="block text-[12.5px] font-bold text-[#171717] dark:text-neutral-200">
                  Seller Type *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`radius-native flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      sellerType === "student"
                        ? "border-[#171717] dark:border-[#FFC928] bg-[#FFFDF5] dark:bg-[#FFC928]/10 shadow-xs"
                        : "border-[#DCE0E6] dark:border-white/10 bg-white dark:bg-[#181B24] hover:border-[#8C929C]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="sellerType"
                      value="student"
                      checked={sellerType === "student"}
                      onChange={() => {
                        setSellerType("student");
                        setError(null);
                      }}
                      className="sr-only"
                    />
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        sellerType === "student"
                          ? "border-[#171717] dark:border-[#FFC928]"
                          : "border-[#8C929C]"
                      }`}
                    >
                      {sellerType === "student" && (
                        <div className="w-2 h-2 rounded-full bg-[#171717] dark:bg-[#FFC928]" />
                      )}
                    </div>
                    <GraduationCap
                      className={`w-5 h-5 shrink-0 ${
                        sellerType === "student"
                          ? "text-[#171717] dark:text-[#FFC928]"
                          : "text-[#8C929C]"
                      }`}
                    />
                    <div className="min-w-0">
                      <div className="text-[13px] font-extrabold text-[#171717] dark:text-white">
                        Student
                      </div>
                      <div className="text-[11px] text-[#68707A] dark:text-neutral-400 truncate">
                        Verify with Student ID card
                      </div>
                    </div>
                  </label>

                  <label
                    className={`radius-native flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      sellerType === "non_student"
                        ? "border-[#171717] dark:border-[#FFC928] bg-[#FFFDF5] dark:bg-[#FFC928]/10 shadow-xs"
                        : "border-[#DCE0E6] dark:border-white/10 bg-white dark:bg-[#181B24] hover:border-[#8C929C]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="sellerType"
                      value="non_student"
                      checked={sellerType === "non_student"}
                      onChange={() => {
                        setSellerType("non_student");
                        setError(null);
                      }}
                      className="sr-only"
                    />
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        sellerType === "non_student"
                          ? "border-[#171717] dark:border-[#FFC928]"
                          : "border-[#8C929C]"
                      }`}
                    >
                      {sellerType === "non_student" && (
                        <div className="w-2 h-2 rounded-full bg-[#171717] dark:bg-[#FFC928]" />
                      )}
                    </div>
                    <Building2
                      className={`w-5 h-5 shrink-0 ${
                        sellerType === "non_student"
                          ? "text-[#171717] dark:text-[#FFC928]"
                          : "text-[#8C929C]"
                      }`}
                    />
                    <div className="min-w-0">
                      <div className="text-[13px] font-extrabold text-[#171717] dark:text-white">
                        Non-Student
                      </div>
                      <div className="text-[11px] text-[#68707A] dark:text-neutral-400 truncate">
                        Verify operating location
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* 6A. CONDITIONAL SECTION: STUDENT ID CARD VERIFICATION */}
              {sellerType === "student" ? (
                <div className="p-5 rounded-2xl bg-[#F7F8FA] dark:bg-white/[0.03] border border-[#ECEEF2] dark:border-white/10 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-[13.5px] font-extrabold text-[#171717] dark:text-white flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-[#D97706] dark:text-[#FFC928]" />
                        Student ID Card Verification *
                      </h3>
                      <p className="text-[12px] text-[#68707A] dark:text-neutral-400 mt-0.5">
                        Upload your Student ID card image. We extract your name against the Fullname entered and check the card validation date to approve or decline.
                      </p>
                    </div>
                  </div>

                  {/* Upload Box */}
                  <input
                    ref={studentIdInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleStudentIdChange}
                    className="hidden"
                  />

                  {!studentIdPreview ? (
                    <button
                      type="button"
                      onClick={() => studentIdInputRef.current?.click()}
                      className="radius-native w-full py-6 px-4 rounded-2xl border-2 border-dashed border-[#DCE0E6] dark:border-white/15 hover:border-[#171717] dark:hover:border-[#FFC928] bg-white dark:bg-[#181B24] flex flex-col items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-xl bg-[#FFF7DB] dark:bg-[#FFC928]/15 text-[#9A6B00] dark:text-[#FFC928] flex items-center justify-center">
                        <Upload className="w-5 h-5" />
                      </div>
                      <div className="text-[13px] font-bold text-[#171717] dark:text-white">
                        Upload Student ID Card Image
                      </div>
                      <div className="text-[11.5px] text-[#8C929C]">
                        JPG, PNG, or WEBP (Max 10MB)
                      </div>
                    </button>
                  ) : (
                    <div className="space-y-4">
                      {/* Image Preview + Replace Button */}
                      <div className="flex items-center gap-4 p-3 rounded-xl bg-white dark:bg-[#181B24] border border-[#ECEEF2] dark:border-white/10">
                        <img
                          src={studentIdPreview}
                          alt="Student ID Card"
                          className="w-24 h-16 rounded-lg object-cover border border-[#ECEEF2] dark:border-white/10 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-[12.5px] font-bold text-[#171717] dark:text-white truncate">
                            {studentIdFile?.name || "Student ID Card"}
                          </div>
                          <div className="text-[11px] text-[#68707A] dark:text-neutral-400">
                            {isScanningId
                              ? "Scanning ID card text & expiry date..."
                              : "ID card image uploaded"}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => studentIdInputRef.current?.click()}
                          className="px-3 py-1.5 rounded-lg border border-[#DCE0E6] dark:border-white/15 text-[11.5px] font-bold text-[#171717] dark:text-white hover:bg-[#F7F8FA] dark:hover:bg-white/5 transition-colors cursor-pointer shrink-0"
                        >
                          Replace
                        </button>
                      </div>

                      {isScanningId ? (
                        <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-[#FFF7DB]/70 dark:bg-[#FFC928]/10 border border-[#FFE599] dark:border-[#FFC928]/20 text-[12.5px] font-bold text-[#9A6B00] dark:text-[#FFC928]">
                          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                          <span>Extracting student name and validation date from ID card...</span>
                        </div>
                      ) : (
                        <>
                          {/* Extracted Fields Verification Inputs */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="flex items-center gap-1.5 text-[11.5px] font-bold text-[#5B636E] dark:text-neutral-300">
                                <UserCheck className="w-3.5 h-3.5 text-[#8C929C]" />
                                Extracted Name on ID Card *
                              </label>
                              <input
                                type="text"
                                required
                                value={extractedIdName}
                                onChange={(e) => setExtractedIdName(e.target.value)}
                                placeholder="Name printed on ID card"
                                className="radius-native w-full px-3 py-2 rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-[#181B24] text-[12.5px] text-[#171717] dark:text-white placeholder-[#8C929C] focus:outline-none focus:border-[#171717] dark:focus:border-[#FFC928]"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="flex items-center gap-1.5 text-[11.5px] font-bold text-[#5B636E] dark:text-neutral-300">
                                <Calendar className="w-3.5 h-3.5 text-[#8C929C]" />
                                Card Validation / Expiry Date *
                              </label>
                              <input
                                type="date"
                                required
                                value={cardValidationDate}
                                onChange={(e) => setCardValidationDate(e.target.value)}
                                className="radius-native w-full px-3 py-2 rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-[#181B24] text-[12.5px] text-[#171717] dark:text-white focus:outline-none focus:border-[#171717] dark:focus:border-[#FFC928]"
                              />
                            </div>
                          </div>

                          {/* Approve / Decline Verification Status Banner */}
                          {idVerificationResult && (
                            <div
                              className={`p-3.5 rounded-xl border flex items-start gap-3 text-[12.5px] ${
                                idVerificationResult.decision === "approved"
                                  ? "bg-[#E8F8EE] dark:bg-emerald-500/10 border-[#A7F3D0] dark:border-emerald-500/25 text-[#15803D] dark:text-emerald-300"
                                  : "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-300"
                              }`}
                            >
                              {idVerificationResult.decision === "approved" ? (
                                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-[#15803D] dark:text-emerald-400" />
                              ) : (
                                <XCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
                              )}
                              <div className="space-y-0.5">
                                <div className="font-extrabold uppercase tracking-wider text-[11px]">
                                  {idVerificationResult.decision === "approved"
                                    ? "Verification Approved"
                                    : "Verification Declined"}
                                </div>
                                <div className="font-medium leading-relaxed">
                                  {idVerificationResult.summary}
                                </div>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                /* 6B. CONDITIONAL SECTION: NON-STUDENT OPERATING LOCATION & PROOF DOCUMENT */
                <div className="p-5 rounded-2xl bg-[#F7F8FA] dark:bg-white/[0.03] border border-[#ECEEF2] dark:border-white/10 space-y-4">
                  <div>
                    <h3 className="text-[13.5px] font-extrabold text-[#171717] dark:text-white flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-[#D97706] dark:text-[#FFC928]" />
                      Business Operating Location & Proof *
                    </h3>
                    <p className="text-[12px] text-[#68707A] dark:text-neutral-400 mt-0.5">
                      You can open your store and post listings immediately. Provide your primary operating location and a proof document of that location for business verification.
                    </p>
                  </div>

                  {/* Primary Operating Location */}
                  <div className="space-y-1.5">
                    <label className="block text-[12px] font-bold text-[#171717] dark:text-neutral-200">
                      Primary Operating Location *
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-[#8C929C] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={operatingLocation}
                        onChange={(e) => setOperatingLocation(e.target.value)}
                        placeholder="e.g. Shop 14, Samaru Main Street, Opposite Main Gate"
                        className="radius-native w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-[#181B24] text-[13.5px] text-[#171717] dark:text-white placeholder-[#8C929C] focus:outline-none focus:border-[#171717] dark:focus:border-[#FFC928] transition-colors"
                      />
                    </div>
                  </div>

                  {/* Proof Document of Operating Location */}
                  <div className="space-y-1.5">
                    <label className="block text-[12px] font-bold text-[#171717] dark:text-neutral-200">
                      Proof Document of Operating Location *
                    </label>
                    <input
                      ref={locationProofInputRef}
                      type="file"
                      accept=".pdf,image/jpeg,image/png,image/webp"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setLocationProofFile(file);
                          setError(null);
                        }
                      }}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => locationProofInputRef.current?.click()}
                      className="radius-native w-full p-4 rounded-xl border-2 border-dashed border-[#DCE0E6] dark:border-white/15 hover:border-[#171717] dark:hover:border-[#FFC928] bg-white dark:bg-[#181B24] flex items-center justify-between gap-3 transition-colors cursor-pointer text-left"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-[#FFF7DB] dark:bg-[#FFC928]/15 text-[#9A6B00] dark:text-[#FFC928] flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[12.5px] font-bold text-[#171717] dark:text-white truncate">
                            {locationProofFile
                              ? locationProofFile.name
                              : "Upload Proof of Location Document"}
                          </div>
                          <div className="text-[11px] text-[#8C929C] truncate">
                            Utility bill, tenancy receipt, CAC certificate, or storefront photo (PDF, JPG, PNG)
                          </div>
                        </div>
                      </div>
                      <span className="px-3 py-1.5 rounded-lg bg-[#F7F8FA] dark:bg-white/5 border border-[#ECEEF2] dark:border-white/10 text-[11.5px] font-bold text-[#171717] dark:text-white shrink-0">
                        {locationProofFile ? "Change" : "Browse"}
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* SUBMIT BUTTON: "Open Store" */}
              <button
                type="submit"
                disabled={
                  submitting ||
                  isScanningId ||
                  (sellerType === "student" &&
                    hasScannedId &&
                    idVerificationResult?.decision === "declined")
                }
                className="radius-native w-full py-3.5 px-6 rounded-xl bg-[#171717] hover:bg-[#262626] dark:bg-[#FFC928] dark:hover:bg-[#F2BD24] text-white dark:text-[#171717] font-extrabold text-[14px] shadow-sm transition-all active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Opening Store...</span>
                  </>
                ) : (
                  <>
                    <Store className="w-4 h-4" />
                    <span>Open Store</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </main>

      <RebrandFooter />
    </div>
  );
}
