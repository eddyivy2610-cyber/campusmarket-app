"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  GraduationCap,
  Store,
  Building2,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  ArrowLeft,
  Upload,
  Camera,
  X,
  FileText,
  Loader2,
  Sparkles,
  MapPin,
  Phone,
  Mail,
  ShieldAlert,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiGet, apiPost } from "@/lib/apiClient";
import { toast } from "sonner";
import { uploadFileClient } from "@/lib/clientUpload";

const CAMPUS_OPTIONS = [
  "Ahmadu Bello University (ABU Samaru Main Campus)",
  "ABU Zaria (Kongo Campus)",
  "University of Lagos (UNILAG)",
  "University of Ibadan (UI)",
  "Obafemi Awolowo University (OAU)",
  "Bayero University Kano (BUK)",
  "University of Nigeria, Nsukka (UNN)",
  "Federal University of Technology, Owerri (FUTO)",
  "ABU Teaching Hospital (ABUTH)",
];

const STORE_CATEGORIES = [
  "Electronics & Tech Gadgets",
  "Fashion, Apparel & Shoes",
  "Books, Stationery & Academics",
  "Campus Services & Freelance",
  "Food, Snacks & Provisions",
  "Beauty, Grooming & Skincare",
  "Furniture & Hostel Essentials",
  "Other / General Store",
];

const SAMPLE_LOGOS = [
  "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=200&auto=format&fit=crop&q=80",
];

type OnboardingView = "select_path" | "student_form" | "business_form" | "status_view" | "success_view";

export default function StoreOnboardingPage() {
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [view, setView] = useState<OnboardingView>("select_path");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Existing store & business application states from /api/stores/me
  const [existingStore, setExistingStore] = useState<any>(null);
  const [existingApp, setExistingApp] = useState<any>(null);
  const [studentEligibility, setStudentEligibility] = useState<{ eligible: boolean; reason?: string | null }>({
    eligible: false,
    reason: null,
  });

  // Student Store Form State
  const [storeName, setStoreName] = useState("");
  const [storeCategory, setStoreCategory] = useState(STORE_CATEGORIES[0]);
  const [storeCampus, setStoreCampus] = useState(CAMPUS_OPTIONS[0]);
  const [storeLocation, setStoreLocation] = useState("");
  const [storeDesc, setStoreDesc] = useState("");
  const [storeLogo, setStoreLogo] = useState(SAMPLE_LOGOS[0]);
  const [storePhone, setStorePhone] = useState("");
  const [storeWhatsapp, setStoreWhatsapp] = useState("");
  const [logoUploading, setLogoUploading] = useState(false);

  // Business Application Form State
  const [bizName, setBizName] = useState("");
  const [bizRegName, setBizRegName] = useState("");
  const [bizCac, setBizCac] = useState("");
  const [bizCategory, setBizCategory] = useState(STORE_CATEGORIES[0]);
  const [bizCampus, setBizCampus] = useState(CAMPUS_OPTIONS[0]);
  const [bizLocation, setBizLocation] = useState("");
  const [bizPhone, setBizPhone] = useState("");
  const [bizEmail, setBizEmail] = useState("");
  const [bizNotes, setBizNotes] = useState("");
  const [bizDocuments, setBizDocuments] = useState<string[]>([]);
  const [docsUploading, setDocsUploading] = useState(false);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  // --------------------------------------------------------------------------
  // 1. INITIAL AUDIT & RESUME: Query /api/stores/me
  // --------------------------------------------------------------------------
  useEffect(() => {
    let isMounted = true;

    async function checkExistingState() {
      setIsLoading(true);
      try {
        const res: any = await apiGet("/stores/me");
        if (!isMounted) return;

        if (res && res.success && res.data) {
          const { hasStore, store, studentEligibility: elig, businessApplication: app } = res.data;

          if (hasStore && store) {
            setExistingStore(store);
            setView("status_view");
            setIsLoading(false);
            return;
          }

          if (elig) {
            setStudentEligibility(elig);
          }

          if (app) {
            setExistingApp(app);
            // If user already submitted a business application, display the status view immediately!
            setView("status_view");
            setIsLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn("[Store Onboarding] /api/stores/me query notice:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);

          // Support query parameter e.g. /onboarding/seller?type=business or type=student
          const typeParam = searchParams.get("type");
          if (typeParam === "business") {
            setView("business_form");
          } else if (typeParam === "student") {
            setView("student_form");
          }
        }
      }
    }

    checkExistingState();

    return () => {
      isMounted = false;
    };
  }, [searchParams]);

  // --------------------------------------------------------------------------
  // File Upload Helper: Uses canonical secure upload flow
  // --------------------------------------------------------------------------
  const uploadFile = async (
    file: File,
    purpose: "store_logo" | "business_document" = "store_logo"
  ): Promise<string | null> => {
    try {
      const res = await uploadFileClient(file, purpose);
      if (res.success && res.url) {
        return res.url;
      }
      throw new Error(res.error || "Upload failed");
    } catch (err: any) {
      toast.error(err.message || "File upload failed. Please try again.");
      return null;
    }
  };

  // Handle Logo Upload
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (PNG, JPG, WEBP).");
      return;
    }

    setLogoUploading(true);
    const uploadedUrl = await uploadFile(file, "store_logo");
    if (uploadedUrl) {
      setStoreLogo(uploadedUrl);
      toast.success("Store logo uploaded!");
    }
    setLogoUploading(false);
  };

  // Handle Document Upload
  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setDocsUploading(true);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const uploadedUrl = await uploadFile(file, "business_document");
      if (uploadedUrl) {
        setBizDocuments((prev) => [...prev, uploadedUrl]);
      }
    }
    setDocsUploading(false);
    toast.success("Document uploaded securely.");
  };

  const removeDocument = (index: number) => {
    setBizDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  // --------------------------------------------------------------------------
  // SUBMIT STUDENT STORE: POST /api/stores
  // --------------------------------------------------------------------------
  const handleSubmitStudentStore = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const payload = {
        name: storeName.trim(),
        category: storeCategory,
        campus: storeCampus,
        operatingLocation: storeLocation.trim(),
        description: storeDesc.trim(),
        logo: storeLogo,
        contact: {
          phone: storePhone.trim() || undefined,
          whatsapp: storeWhatsapp.trim() || undefined,
        },
      };

      const res: any = await apiPost("/stores", payload);
      if (res && res.success && res.data) {
        setExistingStore(res.data);
        toast.success("Storefront created and activated successfully!");
        setView("success_view");
      } else {
        throw new Error(res?.error || "Failed to create storefront.");
      }
    } catch (err: any) {
      const msg = err.message || "Failed to create storefront. Please check your details.";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --------------------------------------------------------------------------
  // SUBMIT BUSINESS APPLICATION: POST /api/stores/business-application
  // --------------------------------------------------------------------------
  const handleSubmitBusinessApp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const payload = {
        businessName: bizName.trim(),
        registeredBusinessName: bizRegName.trim() || undefined,
        cacNumber: bizCac.trim() || undefined,
        businessCategory: bizCategory,
        campus: bizCampus,
        operatingLocation: bizLocation.trim(),
        contactPhone: bizPhone.trim(),
        contactEmail: bizEmail.trim().toLowerCase(),
        supportingDocuments: bizDocuments,
        notes: bizNotes.trim() || undefined,
      };

      const res: any = await apiPost("/stores/business-application", payload);
      if (res && res.success && res.data) {
        setExistingApp(res.data);
        toast.success("Business application submitted for review!");
        setView("status_view");
      } else {
        throw new Error(res?.error || "Failed to submit business application.");
      }
    } catch (err: any) {
      const msg = err.message || "Failed to submit application. Please check your details.";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --------------------------------------------------------------------------
  // LOADING STATE
  // --------------------------------------------------------------------------
  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center antialiased">
        <Loader2 className="w-8 h-8 animate-spin text-[#171717] dark:text-[#FFC928] mb-3" />
        <p className="text-[13px] font-semibold text-[#68707A] dark:text-neutral-400">
          Checking your store eligibility and application status...
        </p>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // VIEW: STATUS VIEW (Resume Existing Store or View Application Progress)
  // --------------------------------------------------------------------------
  if (view === "status_view") {
    // 1. Existing Active Storefront Detected
    if (existingStore) {
      return (
        <div className="min-h-screen bg-[#F7F8FA] dark:bg-[#0E1015] px-4 py-12 flex justify-center items-center antialiased">
          <div className="w-full max-w-lg bg-white dark:bg-[#14161D] rounded-3xl border border-[#ECEEF2] dark:border-white/10 shadow-sm p-7 sm:p-9 text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-[#E8F8EE] dark:bg-emerald-500/10 border border-[#A7F3D0] dark:border-emerald-500/20 text-[#15803D] dark:text-emerald-400 flex items-center justify-center mx-auto shadow-xs">
              <Store className="w-8 h-8 stroke-[2.2]" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[11px] font-extrabold uppercase tracking-wider">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Storefront Active</span>
              </div>
              <h1 className="text-[22px] sm:text-[25px] font-black text-[#171717] dark:text-white tracking-tight">
                {existingStore.name}
              </h1>
              <p className="text-[13px] text-[#68707A] dark:text-neutral-400 max-w-sm mx-auto leading-relaxed">
                You already own an active storefront serving{" "}
                <strong className="text-[#171717] dark:text-white">{existingStore.campus}</strong>. Each account manages one storefront.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F7F8FA] dark:bg-white/[0.03] border border-[#ECEEF2] dark:border-white/5 text-left text-[12.5px] space-y-2">
              <div className="flex justify-between items-center text-[#68707A] dark:text-neutral-400">
                <span>Category</span>
                <span className="font-bold text-[#171717] dark:text-white">{existingStore.category}</span>
              </div>
              <div className="flex justify-between items-center text-[#68707A] dark:text-neutral-400">
                <span>Location</span>
                <span className="font-bold text-[#171717] dark:text-white truncate max-w-[200px]">{existingStore.operatingLocation}</span>
              </div>
              <div className="flex justify-between items-center text-[#68707A] dark:text-neutral-400">
                <span>Type</span>
                <span className="font-bold text-[#171717] dark:text-white capitalize">
                  {existingStore.storeType === "student_store" ? "Verified Student Vendor" : "Approved Local Business"}
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <Link
                href="/stores?view=storefront"
                className="radius-native w-full py-3 rounded-xl bg-[#FFC928] hover:bg-[#F2BD1E] text-[#171717] font-extrabold text-[13.5px] shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <Store className="w-4 h-4 stroke-[2.2]" />
                <span>Open Storefront Manager</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/explore"
                className="block text-[12.5px] font-semibold text-[#8C929C] hover:text-[#171717] dark:hover:text-white transition-colors"
              >
                Back to Marketplace
              </Link>
            </div>
          </div>
        </div>
      );
    }

    // 2. Existing Business Application Progress
    if (existingApp) {
      const isPending = existingApp.status === "pending_review";
      const isApproved = existingApp.status === "approved";
      const isRejected = existingApp.status === "rejected";
      const isChangesRequested =
        existingApp.status === "changes_requested" ||
        existingApp.status === "more_info_needed";

      return (
        <div className="min-h-screen bg-[#F7F8FA] dark:bg-[#0E1015] px-4 py-12 flex justify-center items-center antialiased">
          <div className="w-full max-w-lg bg-white dark:bg-[#14161D] rounded-3xl border border-[#ECEEF2] dark:border-white/10 shadow-sm p-7 sm:p-9 text-center space-y-6">
            {/* Status Icon */}
            {isPending && (
              <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-xs">
                <Clock className="w-8 h-8 stroke-[2.2]" />
              </div>
            )}
            {isApproved && (
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-8 h-8 stroke-[2.2]" />
              </div>
            )}
            {isRejected && (
              <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto shadow-xs">
                <ShieldAlert className="w-8 h-8 stroke-[2.2]" />
              </div>
            )}
            {isChangesRequested && (
              <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto shadow-xs">
                <AlertCircle className="w-8 h-8 stroke-[2.2]" />
              </div>
            )}

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-neutral-100 dark:bg-white/10 text-[#171717] dark:text-white">
                <span>
                  {isPending && "Under Review"}
                  {isApproved && "Application Approved"}
                  {isRejected && "Application Rejected"}
                  {isChangesRequested && "Changes Requested"}
                </span>
              </div>
              <h1 className="text-[22px] sm:text-[25px] font-black text-[#171717] dark:text-white tracking-tight">
                {existingApp.businessName}
              </h1>
              <p className="text-[13px] text-[#68707A] dark:text-neutral-400 max-w-sm mx-auto leading-relaxed">
                {isPending && "Your application is currently being reviewed by Campus Hive administrators. We verify operating credentials to maintain platform trust."}
                {isApproved && "Congratulations! Your business application has been approved and your storefront is ready to manage."}
                {isRejected && (existingApp.adminDecision?.reason || "Your application was not approved during administrative review.")}
                {isChangesRequested && (existingApp.adminDecision?.adminNotes || existingApp.adminDecision?.reason || "Changes or additional documentation were requested by the review team.")}
              </p>
            </div>

            {/* Application Summary Card */}
            <div className="p-4 rounded-2xl bg-[#F7F8FA] dark:bg-white/[0.03] border border-[#ECEEF2] dark:border-white/5 text-left text-[12.5px] space-y-2">
              <div className="flex justify-between items-center text-[#68707A] dark:text-neutral-400">
                <span>Campus Market</span>
                <span className="font-bold text-[#171717] dark:text-white">{existingApp.campus}</span>
              </div>
              <div className="flex justify-between items-center text-[#68707A] dark:text-neutral-400">
                <span>Category</span>
                <span className="font-bold text-[#171717] dark:text-white">{existingApp.businessCategory}</span>
              </div>
              <div className="flex justify-between items-center text-[#68707A] dark:text-neutral-400">
                <span>Submitted</span>
                <span className="font-bold text-[#171717] dark:text-white">
                  {new Date(existingApp.createdAt).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              {isApproved ? (
                <Link
                  href="/stores?view=storefront"
                  className="radius-native w-full py-3 rounded-xl bg-[#FFC928] hover:bg-[#F2BD1E] text-[#171717] font-extrabold text-[13.5px] shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <Store className="w-4 h-4 stroke-[2.2]" />
                  <span>Open Store Manager</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : isRejected ? (
                <button
                  type="button"
                  onClick={() => {
                    setExistingApp(null);
                    setView("business_form");
                  }}
                  className="radius-native w-full py-3 rounded-xl bg-[#171717] hover:bg-[#262626] dark:bg-[#FFC928] dark:hover:bg-[#F2BD24] text-white dark:text-[#171717] font-extrabold text-[13.5px] transition-all cursor-pointer"
                >
                  Submit New Application
                </button>
              ) : (
                <Link
                  href="/explore"
                  className="radius-native w-full py-3 rounded-xl bg-[#171717] hover:bg-[#262626] dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-[#171717] font-extrabold text-[13.5px] transition-all flex items-center justify-center gap-2"
                >
                  <span>Explore Campus Hive</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}

              <button
                type="button"
                onClick={() => setView("select_path")}
                className="text-[12px] font-semibold text-[#8C929C] hover:text-[#171717] dark:hover:text-white underline cursor-pointer"
              >
                Change Onboarding Type
              </button>
            </div>
          </div>
        </div>
      );
    }
  }

  // --------------------------------------------------------------------------
  // VIEW: SUCCESS VIEW (After student store created)
  // --------------------------------------------------------------------------
  if (view === "success_view") {
    return (
      <div className="min-h-screen bg-[#F7F8FA] dark:bg-[#0E1015] px-4 py-12 flex justify-center items-center antialiased">
        <div className="w-full max-w-lg bg-white dark:bg-[#14161D] rounded-3xl border border-[#ECEEF2] dark:border-white/10 shadow-sm p-7 sm:p-9 text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-2xl bg-[#E8F8EE] dark:bg-emerald-500/10 border border-[#A7F3D0] dark:border-emerald-500/20 text-[#15803D] dark:text-emerald-400 flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
          </div>

          <div className="space-y-2">
            <h1 className="text-[22px] sm:text-[25px] font-black text-[#171717] dark:text-white tracking-tight">
              Your Storefront is Live!
            </h1>
            <p className="text-[13px] text-[#68707A] dark:text-neutral-400 max-w-sm mx-auto leading-relaxed">
              <strong className="text-[#171717] dark:text-white">{storeName}</strong> is now registered at {storeCampus.split("(")[0].trim()}. Start adding products and services to your catalog.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <Link
              href="/stores?view=storefront"
              className="radius-native w-full py-3 rounded-xl bg-[#FFC928] hover:bg-[#F2BD1E] text-[#171717] font-extrabold text-[13.5px] shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Store className="w-4 h-4 stroke-[2.2]" />
              <span>Go to Store Manager</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/listings/create"
              className="block text-[12.5px] font-semibold text-[#8C929C] hover:text-[#171717] dark:hover:text-white transition-colors"
            >
              Add First Listing to Catalog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // VIEW: 2. SELECT PATH (Entry Choice: Student Vendor vs Local Business)
  // --------------------------------------------------------------------------
  if (view === "select_path") {
    const isStudentVerified = user?.isStudent && user?.studentVerified;
    const isStudentUnverified = user?.isStudent && !user?.studentVerified;

    return (
      <div className="min-h-screen bg-[#F7F8FA] dark:bg-[#0E1015] px-4 py-12 antialiased flex flex-col justify-center items-center">
        <div className="w-full max-w-2xl space-y-8">
          {/* Header */}
          <div className="text-center space-y-2.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFC928]/20 text-[#171717] dark:text-[#FFC928] text-[11.5px] font-extrabold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Campus Hive Storefronts</span>
            </div>
            <h1 className="text-[26px] sm:text-[32px] font-black text-[#171717] dark:text-white tracking-tight">
              Start Selling on Campus Hive
            </h1>
            <p className="text-[13.5px] text-[#68707A] dark:text-neutral-400 max-w-md mx-auto leading-relaxed">
              Open a verified storefront tailored for campus life. Choose the path that matches your affiliation.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* 1. Student Vendor Card */}
            <div className="radius-native bg-white dark:bg-[#14161D] rounded-3xl border border-[#ECEEF2] dark:border-white/10 shadow-sm p-6 flex flex-col justify-between hover:border-[#171717] dark:hover:border-[#FFC928] transition-all">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#FFF8E6] dark:bg-[#FFC928]/10 text-[#171717] dark:text-[#FFC928] flex items-center justify-center border border-[#FFE182]/50">
                  <GraduationCap className="w-6 h-6 stroke-[2.2]" />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-[18px] font-extrabold text-[#171717] dark:text-white">
                      Student Vendor
                    </h2>
                    {isStudentVerified && (
                      <span className="text-[10.5px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                        Eligible
                      </span>
                    )}
                  </div>
                  <p className="text-[12.5px] text-[#68707A] dark:text-neutral-400 leading-relaxed">
                    For active students selling gadgets, fashion, textbooks, or campus freelance services directly from their hall or faculty.
                  </p>
                </div>

                <ul className="text-[12px] text-[#5B636E] dark:text-neutral-300 space-y-2 pt-1">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Instant storefront activation</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Verified Student Seller trust badge</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Hall-to-hall & campus meetup tags</span>
                  </li>
                </ul>

                {/* Eligibility Notice if unverified */}
                {isStudentUnverified && (
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-[11.5px] text-amber-800 dark:text-amber-200 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                    <div>
                      <span>
                        {studentEligibility.reason || "Campus verification required. Complete your student setup to activate."}
                      </span>
                      <Link href="/onboarding" className="block font-bold underline mt-0.5">
                        Complete Verification →
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-6">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage(null);
                    setView("student_form");
                  }}
                  className="radius-native w-full py-3 rounded-xl bg-[#171717] hover:bg-[#262626] dark:bg-[#FFC928] dark:hover:bg-[#F2BD24] text-white dark:text-[#171717] font-extrabold text-[13px] shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Become a Student Vendor</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 2. Local Business Card */}
            <div className="radius-native bg-white dark:bg-[#14161D] rounded-3xl border border-[#ECEEF2] dark:border-white/10 shadow-sm p-6 flex flex-col justify-between hover:border-[#171717] dark:hover:border-[#FFC928] transition-all">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-white/5 text-[#171717] dark:text-white flex items-center justify-center border border-[#ECEEF2] dark:border-white/10">
                  <Building2 className="w-6 h-6 stroke-[2.2]" />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-[18px] font-extrabold text-[#171717] dark:text-white">
                      Local Business
                    </h2>
                    <span className="text-[10.5px] font-extrabold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300">
                      Admin Review
                    </span>
                  </div>
                  <p className="text-[12.5px] text-[#68707A] dark:text-neutral-400 leading-relaxed">
                    For registered enterprises, local shops, and external campus providers looking to cater to university communities.
                  </p>
                </div>

                <ul className="text-[12px] text-[#5B636E] dark:text-neutral-300 space-y-2 pt-1">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>Approved Campus Business badge</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>Dedicated store catalog & discovery</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>Commercial support & official review</span>
                  </li>
                </ul>
              </div>

              <div className="pt-6">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage(null);
                    setView("business_form");
                  }}
                  className="radius-native w-full py-3 rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-white/5 hover:border-[#171717] text-[#171717] dark:text-white font-extrabold text-[13px] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Register a Local Business</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          <div className="text-center pt-2">
            <Link
              href="/stores"
              className="text-[12.5px] font-bold text-[#8C929C] hover:text-[#171717] dark:hover:text-white transition-colors"
            >
              ← Back to Stores Directory
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // VIEW: 3. STUDENT VENDOR FORM (Direct Setup)
  // --------------------------------------------------------------------------
  if (view === "student_form") {
    return (
      <div className="min-h-screen bg-[#F7F8FA] dark:bg-[#0E1015] px-4 py-10 antialiased flex justify-center items-center">
        <div className="w-full max-w-xl bg-white dark:bg-[#14161D] rounded-3xl border border-[#ECEEF2] dark:border-white/10 shadow-sm p-6 sm:p-9 space-y-6">
          {/* Back button */}
          <button
            type="button"
            onClick={() => setView("select_path")}
            className="inline-flex items-center gap-1.5 text-[12px] font-bold text-[#8C929C] hover:text-[#171717] dark:hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Path Selection</span>
          </button>

          <div className="space-y-1">
            <h1 className="text-[22px] sm:text-[25px] font-black text-[#171717] dark:text-white tracking-tight">
              Create Your Student Storefront
            </h1>
            <p className="text-[13px] text-[#68707A] dark:text-neutral-400">
              Set up your public vendor profile and start publishing products or services.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 text-rose-700 dark:text-rose-300 text-[12.5px] flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmitStudentStore} className="space-y-4">
            {/* Store Logo Picker */}
            <div className="space-y-1.5">
              <label className="block text-[12px] font-bold text-[#171717] dark:text-neutral-200">
                Store Logo / Avatar
              </label>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
              <div className="flex items-center gap-3">
                <div
                  onClick={() => logoInputRef.current?.click()}
                  className="group relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-[#171717] dark:border-[#FFC928] shrink-0 bg-neutral-100 cursor-pointer shadow-xs"
                >
                  <img src={storeLogo} alt="Store Logo" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[9px] font-bold">
                    <Camera className="w-4 h-4 mb-0.5" />
                    <span>Upload</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {SAMPLE_LOGOS.map((url, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setStoreLogo(url)}
                      className={`w-7 h-7 rounded-lg overflow-hidden border-2 transition-transform cursor-pointer ${
                        storeLogo === url ? "border-[#171717] dark:border-[#FFC928] scale-110" : "border-transparent opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img src={url} alt={`Option ${i}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    disabled={logoUploading}
                    className="h-7 px-2.5 rounded-lg border border-[#DCE0E6] dark:border-white/15 text-[11px] font-bold flex items-center gap-1 text-[#5B636E] dark:text-neutral-300 hover:border-[#171717] cursor-pointer"
                  >
                    {logoUploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                    <span>Upload</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Store Name */}
            <div className="space-y-1.5">
              <label className="block text-[12px] font-bold text-[#171717] dark:text-neutral-200">
                Storefront Name *
              </label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="e.g. Samaru Gadget Hub or Bello's Print Shop"
                className="radius-native w-full px-3.5 py-2.5 rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-[#181B24] text-[13px] text-[#171717] dark:text-white placeholder-[#8C929C] focus:outline-none focus:border-[#171717] dark:focus:border-[#FFC928]"
              />
            </div>

            {/* Category & Campus */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-[12px] font-bold text-[#171717] dark:text-neutral-200">
                  Primary Category *
                </label>
                <select
                  value={storeCategory}
                  onChange={(e) => setStoreCategory(e.target.value)}
                  className="radius-native w-full px-3 py-2.5 rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-[#181B24] text-[12.5px] text-[#171717] dark:text-white focus:outline-none focus:border-[#171717]"
                >
                  {STORE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[12px] font-bold text-[#171717] dark:text-neutral-200">
                  Target Campus *
                </label>
                <select
                  value={storeCampus}
                  onChange={(e) => setStoreCampus(e.target.value)}
                  className="radius-native w-full px-3 py-2.5 rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-[#181B24] text-[12.5px] text-[#171717] dark:text-white focus:outline-none focus:border-[#171717]"
                >
                  {CAMPUS_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c.split("(")[0].trim()}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Operating Location */}
            <div className="space-y-1.5">
              <label className="block text-[12px] font-bold text-[#171717] dark:text-neutral-200">
                Hostel / Hall / Campus Meetup Location *
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-[#8C929C] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={storeLocation}
                  onChange={(e) => setStoreLocation(e.target.value)}
                  placeholder="e.g. Ribadu Hall, Room 42 or ICT Complex"
                  className="radius-native w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-[#181B24] text-[13px] text-[#171717] dark:text-white placeholder-[#8C929C] focus:outline-none focus:border-[#171717] dark:focus:border-[#FFC928]"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="block text-[12px] font-bold text-[#171717] dark:text-neutral-200">
                Store Bio & Description *
              </label>
              <textarea
                required
                rows={3}
                value={storeDesc}
                onChange={(e) => setStoreDesc(e.target.value)}
                placeholder="Describe what your store provides, operating hours, delivery or meetup details..."
                className="radius-native w-full px-3.5 py-2.5 rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-[#181B24] text-[13px] text-[#171717] dark:text-white placeholder-[#8C929C] focus:outline-none focus:border-[#171717] dark:focus:border-[#FFC928] resize-none"
              />
            </div>

            {/* Contact Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-[12px] font-bold text-[#171717] dark:text-neutral-200">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#8C929C] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={storePhone}
                    onChange={(e) => setStorePhone(e.target.value)}
                    placeholder="080 1234 5678"
                    className="radius-native w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-[#181B24] text-[13px] text-[#171717] dark:text-white placeholder-[#8C929C] focus:outline-none focus:border-[#171717]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[12px] font-bold text-[#171717] dark:text-neutral-200">
                  WhatsApp Contact
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#8C929C] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={storeWhatsapp}
                    onChange={(e) => setStoreWhatsapp(e.target.value)}
                    placeholder="080 1234 5678"
                    className="radius-native w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-[#181B24] text-[13px] text-[#171717] dark:text-white placeholder-[#8C929C] focus:outline-none focus:border-[#171717]"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="radius-native w-full py-3 rounded-xl bg-[#171717] hover:bg-[#262626] dark:bg-[#FFC928] dark:hover:bg-[#F2BD24] text-white dark:text-[#171717] font-extrabold text-[13.5px] shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Store className="w-4 h-4" />}
                <span>Activate Student Storefront</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // VIEW: 4. LOCAL BUSINESS APPLICATION FORM
  // --------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#F7F8FA] dark:bg-[#0E1015] px-4 py-10 antialiased flex justify-center items-center">
      <div className="w-full max-w-xl bg-white dark:bg-[#14161D] rounded-3xl border border-[#ECEEF2] dark:border-white/10 shadow-sm p-6 sm:p-9 space-y-6">
        {/* Back button */}
        <button
          type="button"
          onClick={() => setView("select_path")}
          className="inline-flex items-center gap-1.5 text-[12px] font-bold text-[#8C929C] hover:text-[#171717] dark:hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Path Selection</span>
        </button>

        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 text-[11px] font-extrabold uppercase tracking-wider">
            <span>Official Business Application</span>
          </div>
          <h1 className="text-[22px] sm:text-[25px] font-black text-[#171717] dark:text-white tracking-tight">
            Register a Local Business
          </h1>
          <p className="text-[13px] text-[#68707A] dark:text-neutral-400">
            Submit your business profile for administrative review and official verification.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 text-rose-700 dark:text-rose-300 text-[12.5px] flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmitBusinessApp} className="space-y-4">
          {/* Business Name */}
          <div className="space-y-1.5">
            <label className="block text-[12px] font-bold text-[#171717] dark:text-neutral-200">
              Business Trading Name *
            </label>
            <input
              type="text"
              required
              value={bizName}
              onChange={(e) => setBizName(e.target.value)}
              placeholder="e.g. Apex Tech Solutions or Royal Bakery Samaru"
              className="radius-native w-full px-3.5 py-2.5 rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-[#181B24] text-[13px] text-[#171717] dark:text-white placeholder-[#8C929C] focus:outline-none focus:border-[#171717]"
            />
          </div>

          {/* Registered Name & CAC */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-[12px] font-bold text-[#171717] dark:text-neutral-200">
                Registered Name (optional)
              </label>
              <input
                type="text"
                value={bizRegName}
                onChange={(e) => setBizRegName(e.target.value)}
                placeholder="Legal entity name"
                className="radius-native w-full px-3.5 py-2.5 rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-[#181B24] text-[13px] text-[#171717] dark:text-white placeholder-[#8C929C] focus:outline-none focus:border-[#171717]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[12px] font-bold text-[#171717] dark:text-neutral-200">
                CAC Reg Number (optional)
              </label>
              <input
                type="text"
                value={bizCac}
                onChange={(e) => setBizCac(e.target.value)}
                placeholder="RC-1234567 or BN-7654321"
                className="radius-native w-full px-3.5 py-2.5 rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-[#181B24] text-[13px] text-[#171717] dark:text-white placeholder-[#8C929C] focus:outline-none focus:border-[#171717]"
              />
            </div>
          </div>

          {/* Category & Campus */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-[12px] font-bold text-[#171717] dark:text-neutral-200">
                Business Category *
              </label>
              <select
                value={bizCategory}
                onChange={(e) => setBizCategory(e.target.value)}
                className="radius-native w-full px-3 py-2.5 rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-[#181B24] text-[12.5px] text-[#171717] dark:text-white focus:outline-none focus:border-[#171717]"
              >
                {STORE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[12px] font-bold text-[#171717] dark:text-neutral-200">
                Primary Campus Market *
              </label>
              <select
                value={bizCampus}
                onChange={(e) => setBizCampus(e.target.value)}
                className="radius-native w-full px-3 py-2.5 rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-[#181B24] text-[12.5px] text-[#171717] dark:text-white focus:outline-none focus:border-[#171717]"
              >
                {CAMPUS_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c.split("(")[0].trim()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Operating Location */}
          <div className="space-y-1.5">
            <label className="block text-[12px] font-bold text-[#171717] dark:text-neutral-200">
              Physical Operating Address *
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-[#8C929C] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={bizLocation}
                onChange={(e) => setBizLocation(e.target.value)}
                placeholder="e.g. Samaru Main Street, Opposite Gate 1, Zaria"
                className="radius-native w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-[#181B24] text-[13px] text-[#171717] dark:text-white placeholder-[#8C929C] focus:outline-none focus:border-[#171717]"
              />
            </div>
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-[12px] font-bold text-[#171717] dark:text-neutral-200">
                Business Phone *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#8C929C] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  value={bizPhone}
                  onChange={(e) => setBizPhone(e.target.value)}
                  placeholder="080 1234 5678"
                  className="radius-native w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-[#181B24] text-[13px] text-[#171717] dark:text-white placeholder-[#8C929C] focus:outline-none focus:border-[#171717]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[12px] font-bold text-[#171717] dark:text-neutral-200">
                Business Email *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#8C929C] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={bizEmail}
                  onChange={(e) => setBizEmail(e.target.value)}
                  placeholder="contact@business.com"
                  className="radius-native w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-[#181B24] text-[13px] text-[#171717] dark:text-white placeholder-[#8C929C] focus:outline-none focus:border-[#171717]"
                />
              </div>
            </div>
          </div>

          {/* Supporting Documents Upload */}
          <div className="space-y-1.5">
            <label className="block text-[12px] font-bold text-[#171717] dark:text-neutral-200">
              Supporting Documents (ID, CAC Certificate, Utility Bill)
            </label>
            <input
              ref={docInputRef}
              type="file"
              multiple
              accept="image/*,application/pdf"
              onChange={handleDocumentUpload}
              className="hidden"
            />
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => docInputRef.current?.click()}
                disabled={docsUploading}
                className="radius-native w-full py-2.5 px-3 rounded-xl border border-dashed border-[#DCE0E6] dark:border-white/20 hover:border-[#171717] dark:hover:border-white text-[12.5px] font-semibold text-[#5B636E] dark:text-neutral-300 flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                {docsUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                <span>Upload Document (PDF, PNG, JPG)</span>
              </button>

              {bizDocuments.length > 0 && (
                <div className="space-y-1.5">
                  {bizDocuments.map((docUrl, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#F7F8FA] dark:bg-white/5 border border-[#ECEEF2] dark:border-white/10 text-[12px]"
                    >
                      <div className="flex items-center gap-2 truncate pr-2">
                        <FileText className="w-3.5 h-3.5 text-[#8C929C] shrink-0" />
                        <span className="truncate text-[#171717] dark:text-white font-medium">{docUrl.split("/").pop()}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeDocument(i)}
                        className="text-[#8C929C] hover:text-rose-600 transition-colors cursor-pointer"
                        title="Remove file"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Overview Notes */}
          <div className="space-y-1.5">
            <label className="block text-[12px] font-bold text-[#171717] dark:text-neutral-200">
              Overview & Additional Notes for Review
            </label>
            <textarea
              rows={2}
              value={bizNotes}
              onChange={(e) => setBizNotes(e.target.value)}
              placeholder="Provide context regarding services, years of operation, or physical shop signage..."
              className="radius-native w-full px-3.5 py-2.5 rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-[#181B24] text-[13px] text-[#171717] dark:text-white placeholder-[#8C929C] focus:outline-none focus:border-[#171717] resize-none"
            />
          </div>

          {/* Submit Application Button */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="radius-native w-full py-3 rounded-xl bg-[#171717] hover:bg-[#262626] dark:bg-[#FFC928] dark:hover:bg-[#F2BD24] text-white dark:text-[#171717] font-extrabold text-[13.5px] shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Building2 className="w-4 h-4" />}
              <span>Submit Application for Review</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
