"use client";

import React, { useState, useEffect, useMemo, useRef, Suspense } from "react";
import Link from "next/link";
import {
  Megaphone,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  Sparkles,
  Eye,
  Edit2,
  Copy,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Archive,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  X,
  Smartphone,
  Monitor,
  Image as ImageIcon,
  Check,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  Tag,
  Loader2,
} from "lucide-react";
import { apiGet, apiPost, apiPatch } from "@/lib/apiClient";
import type { BannerPlacement, BannerStatus } from "@/models/Banner";

interface BannerItem {
  id: string;
  _id?: string;
  name: string;
  headline: string;
  description?: string;
  imageUrl: string;
  mobileImageUrl?: string;
  imageAlt: string;
  ctaLabel: string;
  ctaUrl: string;
  placement: BannerPlacement;
  targetCategory?: string;
  status: BannerStatus;
  startAt: string;
  endAt?: string | null;
  priority: number;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
  isCurrentActiveHero?: boolean;
}

const CATEGORY_OPTIONS = [
  "Electronics",
  "Fashion",
  "Books & Academic Supplies",
  "Hostel Essentials",
  "Services",
  "Food & Groceries",
  "Sports & Fitness",
  "General",
];

export default function AdminBannersPageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[450px]">
          <Loader2 className="w-8 h-8 text-[#FFC928] animate-spin" />
        </div>
      }
    >
      <AdminBannersPage />
    </Suspense>
  );
}

function AdminBannersPage() {
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [activeHomepageHeroId, setActiveHomepageHeroId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [placementFilter, setPlacementFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Editor Modal State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<BannerItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  // Form Fields
  const [formName, setFormName] = useState("");
  const [formHeadline, setFormHeadline] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formMobileImageUrl, setFormMobileImageUrl] = useState("");
  const [formImageAlt, setFormImageAlt] = useState("");
  const [formCtaLabel, setFormCtaLabel] = useState("Explore now");
  const [formCtaUrl, setFormCtaUrl] = useState("/explore");
  const [formPlacement, setFormPlacement] = useState<BannerPlacement>("homepage_hero");
  const [formCategory, setFormCategory] = useState("Electronics");
  const [formStatus, setFormStatus] = useState<BannerStatus>("draft");
  const [formStartAt, setFormStartAt] = useState("");
  const [formEndAt, setFormEndAt] = useState("");
  const [isIndefinite, setIsIndefinite] = useState(true);
  const [formPriority, setFormPriority] = useState<number>(10);

  // Preview Mode in Editor
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [previewImageError, setPreviewImageError] = useState(false);

  // Confirmation Modals
  const [confirmAction, setConfirmAction] = useState<{
    type: "publish" | "unpublish" | "archive";
    banner: BannerItem;
  } | null>(null);
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  // Upload States
  const [isUploadingDesktop, setIsUploadingDesktop] = useState(false);
  const [isUploadingMobile, setIsUploadingMobile] = useState(false);
  const desktopFileInputRef = useRef<HTMLInputElement | null>(null);
  const mobileFileInputRef = useRef<HTMLInputElement | null>(null);

  // Fetch Banners
  const fetchBanners = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20",
        status: statusFilter,
        placement: placementFilter,
        search: searchQuery,
      });
      if (categoryFilter) params.set("category", categoryFilter);

      const res: any = await apiGet(`admin/banners?${params.toString()}`);
      if (res?.success) {
        setBanners(res.data || []);
        setActiveHomepageHeroId(res.activeHomepageHeroId || null);
        setTotalPages(res.pagination?.pages || 1);
        setTotalCount(res.pagination?.total || 0);
      } else {
        setError(res?.error || "Failed to load banners.");
      }
    } catch (err: any) {
      console.error("Failed to load banners:", err);
      setError(err?.message || "Failed to connect to banner service.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, [currentPage, statusFilter, placementFilter, categoryFilter]);

  // Handle Search Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBanners();
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Open Editor for Creating New Banner
  const handleOpenCreate = () => {
    const now = new Date();
    // Default start time formatted for datetime-local
    const nowStr = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);

    setEditingBanner(null);
    setFormName("");
    setFormHeadline("");
    setFormDescription("");
    setFormImageUrl("");
    setFormMobileImageUrl("");
    setFormImageAlt("");
    setFormCtaLabel("Explore now");
    setFormCtaUrl("/explore");
    setFormPlacement("homepage_hero");
    setFormCategory("Electronics");
    setFormStatus("draft");
    setFormStartAt(nowStr);
    setFormEndAt("");
    setIsIndefinite(true);
    setFormPriority(10);
    setFormError(null);
    setConflictWarning(null);
    setPreviewImageError(false);
    setIsEditorOpen(true);
  };

  // Open Editor for Editing Existing Banner
  const handleOpenEdit = (b: BannerItem) => {
    setEditingBanner(b);
    setFormName(b.name);
    setFormHeadline(b.headline);
    setFormDescription(b.description || "");
    setFormImageUrl(b.imageUrl);
    setFormMobileImageUrl(b.mobileImageUrl || "");
    setFormImageAlt(b.imageAlt);
    setFormCtaLabel(b.ctaLabel);
    setFormCtaUrl(b.ctaUrl);
    setFormPlacement(b.placement);
    setFormCategory(b.targetCategory || "Electronics");
    setFormStatus(b.status);

    const start = new Date(b.startAt);
    const startStr = new Date(start.getTime() - start.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    setFormStartAt(startStr);

    if (b.endAt) {
      const end = new Date(b.endAt);
      const endStr = new Date(end.getTime() - end.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      setFormEndAt(endStr);
      setIsIndefinite(false);
    } else {
      setFormEndAt("");
      setIsIndefinite(true);
    }

    setFormPriority(b.priority);
    setFormError(null);
    setConflictWarning(null);
    setPreviewImageError(false);
    setIsEditorOpen(true);
  };

  // Upload handler for Cloudinary
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "desktop" | "mobile"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === "desktop") setIsUploadingDesktop(true);
    else setIsUploadingMobile(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("purpose", "banner_image");

      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("campus_token")
          : null;

      const res = await fetch("/api/upload", {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to upload image.");
      }

      const uploadedUrl = json.urls?.[0] || json.url;
      if (!uploadedUrl) throw new Error("No URL returned from upload.");

      if (type === "desktop") {
        setFormImageUrl(uploadedUrl);
        setPreviewImageError(false);
      } else {
        setFormMobileImageUrl(uploadedUrl);
      }
    } catch (err: any) {
      setFormError(err.message || "Failed to upload image.");
    } finally {
      if (type === "desktop") setIsUploadingDesktop(false);
      else setIsUploadingMobile(false);
      e.target.value = "";
    }
  };

  // Save Banner (Create or Update)
  const handleSaveBanner = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setFormError(null);
    setConflictWarning(null);

    // Validation
    if (!formName.trim()) {
      setFormError("Internal banner name is required.");
      return;
    }
    if (!formHeadline.trim()) {
      setFormError("Banner headline is required.");
      return;
    }
    if (!formImageUrl.trim()) {
      setFormError("Desktop image URL is required.");
      return;
    }
    if (!formImageAlt.trim()) {
      setFormError("Image alt text is required for accessibility.");
      return;
    }
    if (!formCtaLabel.trim()) {
      setFormError("CTA button label is required.");
      return;
    }
    if (!formCtaUrl.trim()) {
      setFormError("CTA destination URL is required.");
      return;
    }
    if (formPlacement === "category_promo" && !formCategory.trim()) {
      setFormError("Target category is required for category promotions.");
      return;
    }

    const start = new Date(formStartAt);
    if (isNaN(start.getTime())) {
      setFormError("Invalid start date and time.");
      return;
    }

    let end: Date | null = null;
    if (!isIndefinite && formEndAt) {
      end = new Date(formEndAt);
      if (isNaN(end.getTime())) {
        setFormError("Invalid end date and time.");
        return;
      }
      if (end.getTime() <= start.getTime()) {
        setFormError("End date must be strictly after start date.");
        return;
      }
    }

    const payload = {
      name: formName.trim(),
      headline: formHeadline.trim(),
      description: formDescription.trim(),
      imageUrl: formImageUrl.trim(),
      mobileImageUrl: formMobileImageUrl.trim() || undefined,
      imageAlt: formImageAlt.trim(),
      ctaLabel: formCtaLabel.trim(),
      ctaUrl: formCtaUrl.trim(),
      placement: formPlacement,
      targetCategory:
        formPlacement === "category_promo" ? formCategory : undefined,
      status: formStatus,
      startAt: start.toISOString(),
      endAt: end ? end.toISOString() : null,
      priority: Number(formPriority) || 0,
    };

    setIsSubmitting(true);
    try {
      let res: any;
      if (editingBanner) {
        res = await apiPatch(`admin/banners/${editingBanner.id}`, payload);
      } else {
        res = await apiPost("admin/banners", payload);
      }

      if (res?.success) {
        setSuccessMessage(
          editingBanner
            ? "Banner successfully updated."
            : "Banner successfully created."
        );
        setTimeout(() => setSuccessMessage(null), 4000);

        if (res.conflictWarning) {
          setConflictWarning(res.conflictWarning);
        } else {
          setIsEditorOpen(false);
        }
        await fetchBanners();
      } else {
        setFormError(res?.error || "Failed to save banner.");
      }
    } catch (err: any) {
      setFormError(err?.message || "Failed to save banner.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Duplicate Banner
  const handleDuplicate = async (bannerId: string) => {
    try {
      const res: any = await apiPost(`admin/banners/${bannerId}/duplicate`, {});
      if (res?.success) {
        setSuccessMessage("Banner duplicated as a new draft.");
        setTimeout(() => setSuccessMessage(null), 4000);
        await fetchBanners();
      } else {
        setError(res?.error || "Failed to duplicate banner.");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to duplicate banner.");
    }
  };

  // Execute Confirmed Transition Action (Publish / Unpublish / Archive)
  const handleExecuteConfirmedAction = async () => {
    if (!confirmAction) return;
    const { type, banner } = confirmAction;

    setIsProcessingAction(true);
    try {
      const endpoint = `admin/banners/${banner.id}/${type}`;
      const res: any = await apiPost(endpoint, {});

      if (res?.success) {
        setSuccessMessage(res.message || `Banner successfully ${type}ed.`);
        setTimeout(() => setSuccessMessage(null), 4000);
        setConfirmAction(null);
        await fetchBanners();
      } else {
        setError(res?.error || `Failed to ${type} banner.`);
      }
    } catch (err: any) {
      setError(err?.message || `Failed to ${type} banner.`);
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Currently Active Hero Finder
  const currentActiveHero = useMemo(() => {
    return banners.find((b) => b.id === activeHomepageHeroId) || null;
  }, [banners, activeHomepageHeroId]);

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* 1. Header & Active Homepage Hero Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#14161D] p-6 rounded-3xl border border-[#ECEEF2] dark:border-white/10 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#FFC928]/20 flex items-center justify-center text-[#171717] dark:text-[#FFC928]">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-[#171717] dark:text-white tracking-tight">
                Banner Management
              </h1>
              <p className="text-xs sm:text-sm text-[#5B636E] dark:text-neutral-400 mt-0.5">
                Dynamic advertisement, homepage hero, and promotional campaign engine.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={fetchBanners}
            disabled={isLoading}
            className="radius-native inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[#DCE1E7] dark:border-white/10 bg-white dark:bg-white/5 text-[13px] font-semibold text-[#171717] dark:text-white hover:bg-black/[0.03] dark:hover:bg-white/[0.05] transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="radius-native inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FFC928] hover:bg-[#F2BD1E] text-[#171717] font-bold text-[13px] shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Create Banner</span>
          </button>
        </div>
      </div>

      {/* 2. Active Hero Indicator Card */}
      <div className="bg-[#FFF8E6] dark:bg-[#2B230B] border border-[#FFE182] dark:border-[#52410D] rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-[#FFC928] flex items-center justify-center text-[#171717] shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#B45309] dark:text-[#FFC928]">
                Homepage Hero Status
              </span>
              <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
            </div>

            {currentActiveHero ? (
              <div className="mt-1">
                <p className="text-[14px] font-bold text-[#171717] dark:text-white">
                  &ldquo;{currentActiveHero.headline}&rdquo;
                  <span className="text-[12px] font-normal text-[#5B636E] dark:text-neutral-400 ml-2">
                    (Campaign: {currentActiveHero.name})
                  </span>
                </p>
                <div className="flex flex-wrap items-center gap-3 text-[11.5px] text-[#5B636E] dark:text-neutral-300 mt-0.5">
                  <span>Priority: {currentActiveHero.priority}</span>
                  <span>·</span>
                  <span>CTA: &ldquo;{currentActiveHero.ctaLabel}&rdquo; → {currentActiveHero.ctaUrl}</span>
                  <span>·</span>
                  <span>
                    Ends: {currentActiveHero.endAt ? new Date(currentActiveHero.endAt).toLocaleDateString() : "Indefinite"}
                  </span>
                </div>
              </div>
            ) : (
              <div className="mt-1">
                <p className="text-[14px] font-bold text-[#171717] dark:text-white">
                  Default Fallback Hero Active
                </p>
                <p className="text-[12px] text-[#5B636E] dark:text-neutral-300">
                  Rendering native &ldquo;Aspire Elevation&rdquo; fallback card. Publish an eligible hero banner to override.
                </p>
              </div>
            )}
          </div>
        </div>

        <Link
          href="/"
          target="_blank"
          className="radius-native inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-black/30 border border-[#E2B734]/40 text-[12px] font-bold text-[#171717] dark:text-white hover:bg-white/80 transition-colors self-start md:self-center shrink-0"
        >
          <span>View Live Site</span>
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>

      {/* Success Alert */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-[#DCFCE7] dark:bg-green-950/40 border border-[#86EFAC] dark:border-green-800 text-[#15803D] dark:text-green-300 text-[13px] font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Global Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-[#FEE2E2] dark:bg-red-950/40 border border-[#FCA5A5] dark:border-red-800 text-[#B91C1C] dark:text-red-300 text-[13px] font-semibold flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-red-500 hover:text-red-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 3. Search and Filtering Bar */}
      <div className="bg-white dark:bg-[#14161D] p-4 rounded-2xl border border-[#ECEEF2] dark:border-white/10 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#8C929C] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search banners by name or headline..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#F7F8FA] dark:bg-white/5 border border-[#E2E6EC] dark:border-white/10 text-[13px] text-[#171717] dark:text-white placeholder:text-[#8C929C] focus:outline-none focus:border-[#FFC928]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 rounded-xl bg-[#F7F8FA] dark:bg-white/5 border border-[#E2E6EC] dark:border-white/10 text-[12.5px] font-semibold text-[#171717] dark:text-white focus:outline-none focus:border-[#FFC928]"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="scheduled">Scheduled</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>

          {/* Placement Filter */}
          <select
            value={placementFilter}
            onChange={(e) => {
              setPlacementFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 rounded-xl bg-[#F7F8FA] dark:bg-white/5 border border-[#E2E6EC] dark:border-white/10 text-[12.5px] font-semibold text-[#171717] dark:text-white focus:outline-none focus:border-[#FFC928]"
          >
            <option value="all">All Placements</option>
            <option value="homepage_hero">Homepage Hero</option>
            <option value="promo_strip">Promotional Strip</option>
            <option value="category_promo">Category Promo</option>
          </select>
        </div>
      </div>

      {/* 4. Banner List / Table */}
      <div className="bg-white dark:bg-[#14161D] rounded-2xl border border-[#ECEEF2] dark:border-white/10 shadow-xs overflow-hidden">
        {isLoading && banners.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Loader2 className="w-8 h-8 text-[#FFC928] animate-spin mb-3" />
            <p className="text-[13px] text-[#5B636E] dark:text-neutral-400">
              Loading promotional banners...
            </p>
          </div>
        ) : banners.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="w-14 h-14 rounded-full bg-[#F5F6F8] dark:bg-white/5 flex items-center justify-center text-[#8C929C] mb-3">
              <Megaphone className="w-7 h-7" />
            </div>
            <h3 className="text-[15px] font-bold text-[#171717] dark:text-white">
              No banners found
            </h3>
            <p className="text-[13px] text-[#5B636E] dark:text-neutral-400 max-w-sm mt-1">
              {searchQuery || statusFilter !== "all" || placementFilter !== "all"
                ? "No promotional banners match your search or filter criteria."
                : "No banners created yet. Create your first promotional banner to showcase on the homepage."}
            </p>
            <button
              type="button"
              onClick={handleOpenCreate}
              className="mt-4 radius-native inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FFC928] hover:bg-[#F2BD1E] text-[#171717] font-bold text-[12.5px] shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Banner</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#ECEEF2] dark:border-white/10 bg-[#FAFAFA] dark:bg-white/[0.02] text-[11.5px] font-bold uppercase tracking-wider text-[#68707A] dark:text-neutral-400">
                  <th className="py-3 px-4">Banner & Headline</th>
                  <th className="py-3 px-4">Placement</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Schedule</th>
                  <th className="py-3 px-4">Updated</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ECEEF2] dark:divide-white/5 text-[13px]">
                {banners.map((b) => {
                  const isHeroWinner = b.id === activeHomepageHeroId;
                  const nowMs = Date.now();
                  const startMs = new Date(b.startAt).getTime();
                  const isScheduledFuture =
                    b.status === "published" && startMs > nowMs;

                  return (
                    <tr
                      key={b.id}
                      className="hover:bg-[#F9FAFB] dark:hover:bg-white/[0.02] transition-colors"
                    >
                      {/* Thumbnail & Title */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-9 rounded-lg bg-[#F1F3F6] dark:bg-white/5 overflow-hidden shrink-0 border border-[#E2E6EC] dark:border-white/10 relative">
                            {b.imageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={b.imageUrl}
                                alt={b.imageAlt || b.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[#8C929C]">
                                <ImageIcon className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 max-w-xs">
                            <p className="font-bold text-[#171717] dark:text-white truncate">
                              {b.name}
                            </p>
                            <p className="text-[12px] text-[#5B636E] dark:text-neutral-400 truncate">
                              &ldquo;{b.headline}&rdquo;
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Placement */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col items-start gap-1">
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#F1F3F6] dark:bg-white/10 text-[#3B4148] dark:text-neutral-300 capitalize">
                            {b.placement.replace("_", " ")}
                          </span>
                          {b.placement === "category_promo" && b.targetCategory && (
                            <span className="text-[11px] text-[#B45309] dark:text-[#FFC928] font-semibold">
                              {b.targetCategory}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Priority */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-[12px] font-bold text-[#171717] dark:text-white">
                          P: {b.priority}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col items-start gap-1">
                          {isHeroWinner ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-extrabold bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC]">
                              <Sparkles className="w-2.5 h-2.5" />
                              <span>Active Hero</span>
                            </span>
                          ) : isScheduledFuture ? (
                            <span className="px-2 py-0.5 rounded-full text-[10.5px] font-extrabold bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]">
                              Scheduled
                            </span>
                          ) : b.status === "published" ? (
                            <span className="px-2 py-0.5 rounded-full text-[10.5px] font-extrabold bg-[#DCFCE7] text-[#15803D]">
                              Published
                            </span>
                          ) : b.status === "draft" ? (
                            <span className="px-2 py-0.5 rounded-full text-[10.5px] font-extrabold bg-[#F1F3F6] text-[#5B636E]">
                              Draft
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10.5px] font-extrabold bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                              Archived
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Schedule */}
                      <td className="py-3.5 px-4 text-[12px] text-[#5B636E] dark:text-neutral-400">
                        <div>
                          <span>Start: {new Date(b.startAt).toLocaleDateString()}</span>
                        </div>
                        <div>
                          <span>
                            End: {b.endAt ? new Date(b.endAt).toLocaleDateString() : "Indefinite"}
                          </span>
                        </div>
                      </td>

                      {/* Updated */}
                      <td className="py-3.5 px-4 text-[12px] text-[#8C929C]">
                        {new Date(b.updatedAt || b.createdAt).toLocaleDateString()}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            title="Edit banner"
                            onClick={() => handleOpenEdit(b)}
                            className="p-1.5 rounded-lg text-[#5B636E] dark:text-neutral-400 hover:text-[#171717] dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/10 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            title="Duplicate as draft"
                            onClick={() => handleDuplicate(b.id)}
                            className="p-1.5 rounded-lg text-[#5B636E] dark:text-neutral-400 hover:text-[#171717] dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/10 transition-colors"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          {b.status !== "published" && b.status !== "archived" && (
                            <button
                              type="button"
                              onClick={() =>
                                setConfirmAction({ type: "publish", banner: b })
                              }
                              className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#DCFCE7] text-[#15803D] hover:bg-[#BBF7D0] transition-colors"
                            >
                              Publish
                            </button>
                          )}

                          {b.status === "published" && (
                            <button
                              type="button"
                              onClick={() =>
                                setConfirmAction({ type: "unpublish", banner: b })
                              }
                              className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#FFF3C4] text-[#92400E] hover:bg-[#FDE68A] transition-colors"
                            >
                              Unpublish
                            </button>
                          )}

                          {b.status !== "archived" && (
                            <button
                              type="button"
                              title="Archive banner"
                              onClick={() =>
                                setConfirmAction({ type: "archive", banner: b })
                              }
                              className="p-1.5 rounded-lg text-[#8C929C] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                            >
                              <Archive className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-[#ECEEF2] dark:border-white/10 flex items-center justify-between text-[12.5px] text-[#5B636E] dark:text-neutral-400">
            <span>
              Showing page {currentPage} of {totalPages} ({totalCount} total banners)
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1 rounded-lg border border-[#DCE1E7] dark:border-white/10 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-black/[0.03] transition-colors"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1 rounded-lg border border-[#DCE1E7] dark:border-white/10 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-black/[0.03] transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 5. Banner Editor Modal with Interactive Live Preview */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-[#14161D] w-full max-w-5xl rounded-3xl border border-[#ECEEF2] dark:border-white/15 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#ECEEF2] dark:border-white/10 flex items-center justify-between bg-[#FAFAFA] dark:bg-white/[0.02]">
              <div>
                <h2 className="text-[17px] font-black text-[#171717] dark:text-white">
                  {editingBanner ? "Edit Promotional Banner" : "Create New Promotional Banner"}
                </h2>
                <p className="text-[12px] text-[#68707A] dark:text-neutral-400">
                  Configure campaign copy, media assets, schedule intervals, and priority weighting.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#68707A] hover:text-[#171717] dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Split Editor & Live Preview */}
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Form Inputs (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                {formError && (
                  <div className="p-3.5 rounded-xl bg-[#FEE2E2] dark:bg-red-950/40 border border-[#FCA5A5] text-[#B91C1C] dark:text-red-300 text-[12.5px] font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {conflictWarning && (
                  <div className="p-3.5 rounded-xl bg-[#FFF3C4] dark:bg-amber-950/40 border border-[#FDE68A] text-[#92400E] dark:text-amber-300 text-[12px] font-medium flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{conflictWarning}</span>
                  </div>
                )}

                {/* Banner Name & Placement */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[12px] font-bold text-[#171717] dark:text-white mb-1">
                      Internal Campaign Name *
                    </label>
                    <input
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g. Back to School Tech Promo"
                      className="w-full px-3 py-2 rounded-xl bg-[#F7F8FA] dark:bg-white/5 border border-[#DCE1E7] dark:border-white/10 text-[13px] text-[#171717] dark:text-white focus:outline-none focus:border-[#FFC928]"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-bold text-[#171717] dark:text-white mb-1">
                      Placement *
                    </label>
                    <select
                      value={formPlacement}
                      onChange={(e) =>
                        setFormPlacement(e.target.value as BannerPlacement)
                      }
                      className="w-full px-3 py-2 rounded-xl bg-[#F7F8FA] dark:bg-white/5 border border-[#DCE1E7] dark:border-white/10 text-[13px] text-[#171717] dark:text-white focus:outline-none focus:border-[#FFC928]"
                    >
                      <option value="homepage_hero">Homepage Hero (Single Active)</option>
                      <option value="promo_strip">Promotional Strip (Multi-card)</option>
                      <option value="category_promo">Category Promotion</option>
                    </select>
                  </div>
                </div>

                {/* Target Category if Category Promo */}
                {formPlacement === "category_promo" && (
                  <div>
                    <label className="block text-[12px] font-bold text-[#171717] dark:text-white mb-1">
                      Target Category *
                    </label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#F7F8FA] dark:bg-white/5 border border-[#DCE1E7] dark:border-white/10 text-[13px] text-[#171717] dark:text-white focus:outline-none focus:border-[#FFC928]"
                    >
                      {CATEGORY_OPTIONS.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Headline & Description */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[12px] font-bold text-[#171717] dark:text-white">
                      Headline *
                    </label>
                    <span className="text-[11px] text-[#8C929C]">
                      {formHeadline.length}/150
                    </span>
                  </div>
                  <input
                    type="text"
                    value={formHeadline}
                    maxLength={150}
                    onChange={(e) => setFormHeadline(e.target.value)}
                    placeholder="e.g. Elevate Your Semester with Tech Deals."
                    className="w-full px-3 py-2 rounded-xl bg-[#F7F8FA] dark:bg-white/5 border border-[#DCE1E7] dark:border-white/10 text-[13px] text-[#171717] dark:text-white focus:outline-none focus:border-[#FFC928]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[12px] font-bold text-[#171717] dark:text-white">
                      Description (Optional)
                    </label>
                    <span className="text-[11px] text-[#8C929C]">
                      {formDescription.length}/300
                    </span>
                  </div>
                  <textarea
                    rows={2}
                    value={formDescription}
                    maxLength={300}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="e.g. Verified laptops, power banks, and accessories from campus stores."
                    className="w-full px-3 py-2 rounded-xl bg-[#F7F8FA] dark:bg-white/5 border border-[#DCE1E7] dark:border-white/10 text-[13px] text-[#171717] dark:text-white focus:outline-none focus:border-[#FFC928]"
                  />
                </div>

                {/* Desktop Image Upload & URL */}
                <div>
                  <label className="block text-[12px] font-bold text-[#171717] dark:text-white mb-1">
                    Desktop Image URL *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formImageUrl}
                      onChange={(e) => {
                        setFormImageUrl(e.target.value);
                        setPreviewImageError(false);
                      }}
                      placeholder="https://... or upload below"
                      className="flex-1 px-3 py-2 rounded-xl bg-[#F7F8FA] dark:bg-white/5 border border-[#DCE1E7] dark:border-white/10 text-[13px] text-[#171717] dark:text-white focus:outline-none focus:border-[#FFC928]"
                    />
                    <input
                      type="file"
                      ref={desktopFileInputRef}
                      onChange={(e) => handleFileUpload(e, "desktop")}
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                    />
                    <button
                      type="button"
                      disabled={isUploadingDesktop}
                      onClick={() => desktopFileInputRef.current?.click()}
                      className="px-3 py-2 rounded-xl bg-[#171717] hover:bg-[#2B2B2B] text-white text-[12.5px] font-bold inline-flex items-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      {isUploadingDesktop ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Upload className="w-3.5 h-3.5" />
                      )}
                      <span>Upload</span>
                    </button>
                  </div>
                </div>

                {/* Mobile Image (Optional) & Image Alt */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[12px] font-bold text-[#171717] dark:text-white mb-1">
                      Mobile Image URL (Optional)
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={formMobileImageUrl}
                        onChange={(e) => setFormMobileImageUrl(e.target.value)}
                        placeholder="Optional portrait asset"
                        className="flex-1 px-3 py-2 rounded-xl bg-[#F7F8FA] dark:bg-white/5 border border-[#DCE1E7] dark:border-white/10 text-[12.5px] text-[#171717] dark:text-white focus:outline-none focus:border-[#FFC928]"
                      />
                      <input
                        type="file"
                        ref={mobileFileInputRef}
                        onChange={(e) => handleFileUpload(e, "mobile")}
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                      />
                      <button
                        type="button"
                        disabled={isUploadingMobile}
                        onClick={() => mobileFileInputRef.current?.click()}
                        className="px-2.5 py-2 rounded-xl bg-gray-200 dark:bg-white/10 text-[#171717] dark:text-white text-[12px] font-semibold"
                      >
                        {isUploadingMobile ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[12px] font-bold text-[#171717] dark:text-white mb-1">
                      Image Alt Text * (Accessibility)
                    </label>
                    <input
                      type="text"
                      value={formImageAlt}
                      onChange={(e) => setFormImageAlt(e.target.value)}
                      placeholder="e.g. Student studying with laptop"
                      className="w-full px-3 py-2 rounded-xl bg-[#F7F8FA] dark:bg-white/5 border border-[#DCE1E7] dark:border-white/10 text-[13px] text-[#171717] dark:text-white focus:outline-none focus:border-[#FFC928]"
                    />
                  </div>
                </div>

                {/* CTA Button Label & Destination URL */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[12px] font-bold text-[#171717] dark:text-white mb-1">
                      CTA Button Label *
                    </label>
                    <input
                      type="text"
                      value={formCtaLabel}
                      onChange={(e) => setFormCtaLabel(e.target.value)}
                      placeholder="e.g. Explore now"
                      className="w-full px-3 py-2 rounded-xl bg-[#F7F8FA] dark:bg-white/5 border border-[#DCE1E7] dark:border-white/10 text-[13px] text-[#171717] dark:text-white focus:outline-none focus:border-[#FFC928]"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-bold text-[#171717] dark:text-white mb-1">
                      CTA Destination URL *
                    </label>
                    <input
                      type="text"
                      value={formCtaUrl}
                      onChange={(e) => setFormCtaUrl(e.target.value)}
                      placeholder="/explore or https://..."
                      className="w-full px-3 py-2 rounded-xl bg-[#F7F8FA] dark:bg-white/5 border border-[#DCE1E7] dark:border-white/10 text-[13px] text-[#171717] dark:text-white focus:outline-none focus:border-[#FFC928]"
                    />
                  </div>
                </div>

                {/* Schedule: Start, Indefinite, End, Priority */}
                <div className="p-4 rounded-2xl bg-[#F7F8FA] dark:bg-white/[0.03] border border-[#ECEEF2] dark:border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-bold text-[#171717] dark:text-white flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#B45309]" />
                      <span>Campaign Schedule & Priority</span>
                    </span>

                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isIndefinite}
                        onChange={(e) => setIsIndefinite(e.target.checked)}
                        className="w-4 h-4 rounded text-[#FFC928] focus:ring-[#FFC928]"
                      />
                      <span className="text-[12px] font-medium text-[#171717] dark:text-white">
                        Run Indefinitely
                      </span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-[#68707A] dark:text-neutral-400 mb-1">
                        Start Date & Time (Server UTC)
                      </label>
                      <input
                        type="datetime-local"
                        value={formStartAt}
                        onChange={(e) => setFormStartAt(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-black/30 border border-[#DCE1E7] dark:border-white/10 text-[12px] text-[#171717] dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#68707A] dark:text-neutral-400 mb-1">
                        End Date & Time
                      </label>
                      <input
                        type="datetime-local"
                        disabled={isIndefinite}
                        value={formEndAt}
                        onChange={(e) => setFormEndAt(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-black/30 border border-[#DCE1E7] dark:border-white/10 text-[12px] text-[#171717] dark:text-white disabled:opacity-40 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-bold text-[#68707A] dark:text-neutral-400 mb-1">
                        Display Priority (0 - 1000)
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={1000}
                        value={formPriority}
                        onChange={(e) => setFormPriority(parseInt(e.target.value, 10) || 0)}
                        className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-black/30 border border-[#DCE1E7] dark:border-white/10 text-[12px] text-[#171717] dark:text-white"
                      />
                      <p className="text-[10.5px] text-[#8C929C] mt-0.5">
                        Higher priority wins homepage hero position.
                      </p>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#68707A] dark:text-neutral-400 mb-1">
                        Publication Status
                      </label>
                      <select
                        value={formStatus}
                        onChange={(e) => setFormStatus(e.target.value as BannerStatus)}
                        className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-black/30 border border-[#DCE1E7] dark:border-white/10 text-[12px] text-[#171717] dark:text-white"
                      >
                        <option value="draft">Draft (Private)</option>
                        <option value="scheduled">Scheduled (Starts at start time)</option>
                        <option value="published">Published (Live if schedule permits)</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Interactive Live Preview (5 cols) */}
              <div className="lg:col-span-5 flex flex-col space-y-3">
                <div className="flex items-center justify-between pb-1">
                  <span className="text-[12px] font-bold text-[#171717] dark:text-white flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-[#B45309]" />
                    <span>Live Frontend Preview</span>
                  </span>

                  <div className="flex items-center gap-1 bg-[#F1F3F6] dark:bg-white/10 p-0.5 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setPreviewDevice("desktop")}
                      className={`px-2 py-1 rounded text-[11px] font-bold flex items-center gap-1 transition-colors ${
                        previewDevice === "desktop"
                          ? "bg-white dark:bg-black text-[#171717] dark:text-white shadow-xs"
                          : "text-[#68707A] hover:text-[#171717]"
                      }`}
                    >
                      <Monitor className="w-3 h-3" />
                      <span>Desktop</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewDevice("mobile")}
                      className={`px-2 py-1 rounded text-[11px] font-bold flex items-center gap-1 transition-colors ${
                        previewDevice === "mobile"
                          ? "bg-white dark:bg-black text-[#171717] dark:text-white shadow-xs"
                          : "text-[#68707A] hover:text-[#171717]"
                      }`}
                    >
                      <Smartphone className="w-3 h-3" />
                      <span>Mobile</span>
                    </button>
                  </div>
                </div>

                {/* Preview Box Frame */}
                <div
                  className={`border border-[#DCE1E7] dark:border-white/10 rounded-2xl p-4 bg-[#F7F8FA] dark:bg-black/20 flex items-center justify-center min-h-[300px] transition-all ${
                    previewDevice === "mobile" ? "max-w-[340px] mx-auto w-full" : "w-full"
                  }`}
                >
                  {formPlacement === "homepage_hero" ? (
                    /* Hero Banner Preview (matching RebrandHero center column) */
                    <div className="radius-native relative overflow-hidden w-full rounded-2xl bg-gradient-to-br from-[#FFE182] via-[#FFD54F] to-[#FFC928] dark:from-[#F5C84C] dark:via-[#E5B537] dark:to-[#D4A325] text-[#171717] p-5 sm:p-6 flex flex-col justify-center min-h-[190px] shadow-sm">
                      {/* Image background layer */}
                      {formImageUrl && !previewImageError && (
                        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={
                              previewDevice === "mobile" && formMobileImageUrl
                                ? formMobileImageUrl
                                : formImageUrl
                            }
                            alt={formImageAlt || formHeadline || "Preview"}
                            onError={() => setPreviewImageError(true)}
                            className="w-full h-full object-cover object-right opacity-35 mix-blend-multiply"
                          />
                          <div className="absolute inset-0 bg-gradient-to-r from-[#FFE182] via-[#FFE182]/85 to-transparent" />
                        </div>
                      )}

                      <div className="relative z-10 max-w-[380px]">
                        <h3 className="text-[18px] sm:text-[22px] font-bold tracking-tight text-[#171717] leading-tight">
                          {formHeadline || "Headline will appear here."}
                        </h3>

                        {formDescription && (
                          <p className="mt-1.5 text-[12px] sm:text-[13px] text-[#262626] line-clamp-3">
                            {formDescription}
                          </p>
                        )}

                        <div className="mt-4">
                          <span className="radius-native inline-flex items-center gap-1 rounded-xl bg-[#1A1A1A] text-white px-3.5 py-1.5 text-[11.5px] font-semibold shadow-xs">
                            <span>{formCtaLabel || "Explore now"}</span>
                            <span>→</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Promo Strip / Category Promo Card Preview */
                    <div className="radius-native relative overflow-hidden w-full rounded-2xl bg-white dark:bg-[#14161D] border border-[#ECEEF2] dark:border-white/10 p-5 flex flex-col justify-between shadow-xs">
                      {formImageUrl && !previewImageError && (
                        <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={formImageUrl}
                            alt={formImageAlt || formHeadline}
                            onError={() => setPreviewImageError(true)}
                            className="w-full h-full object-cover object-center"
                          />
                        </div>
                      )}

                      <div className="relative z-10">
                        <div className="flex items-center gap-1.5 text-[10.5px] font-bold text-[#B45309] dark:text-[#FFC928] uppercase tracking-wider mb-1">
                          <Sparkles className="w-3 h-3" />
                          <span>
                            {formPlacement === "category_promo"
                              ? `${formCategory} Promotion`
                              : "Campus Highlight"}
                          </span>
                        </div>
                        <h4 className="text-[15px] font-bold text-[#171717] dark:text-white leading-snug">
                          {formHeadline || "Promotion headline preview"}
                        </h4>
                        {formDescription && (
                          <p className="mt-1 text-[12px] text-[#5B636E] dark:text-neutral-300 line-clamp-2">
                            {formDescription}
                          </p>
                        )}
                      </div>

                      <div className="relative z-10 mt-3 pt-2.5 border-t border-[#F1F3F6] dark:border-white/5 flex items-center justify-between">
                        <span className="text-[11.5px] font-bold text-[#171717] dark:text-white">
                          {formCtaLabel || "Learn more"}
                        </span>
                        <div className="w-6 h-6 rounded-full bg-[#FFC928] text-[#171717] flex items-center justify-center text-[10px] font-black">
                          →
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-[#F7F8FA] dark:bg-white/[0.03] text-[11.5px] text-[#5B636E] dark:text-neutral-400 space-y-1">
                  <div className="flex justify-between">
                    <span>Placement:</span>
                    <strong className="text-[#171717] dark:text-white capitalize">
                      {formPlacement.replace("_", " ")}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Status on Save:</span>
                    <strong className="text-[#171717] dark:text-white capitalize">
                      {formStatus}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Destination:</span>
                    <strong className="text-[#171717] dark:text-white truncate max-w-[180px]">
                      {formCtaUrl}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-[#ECEEF2] dark:border-white/10 flex items-center justify-between bg-[#FAFAFA] dark:bg-white/[0.02]">
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="px-4 py-2 rounded-xl border border-[#DCE1E7] dark:border-white/10 text-[13px] font-semibold text-[#171717] dark:text-white hover:bg-black/[0.03] transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSaveBanner}
                className="radius-native inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FFC928] hover:bg-[#F2BD1E] text-[#171717] font-bold text-[13px] shadow-xs transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 stroke-[2.5]" />
                    <span>{editingBanner ? "Update Banner" : "Create & Save"}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Confirmation Modals */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#14161D] w-full max-w-md rounded-3xl border border-[#ECEEF2] dark:border-white/15 p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                  confirmAction.type === "publish"
                    ? "bg-[#DCFCE7] text-[#15803D]"
                    : confirmAction.type === "unpublish"
                    ? "bg-[#FFF3C4] text-[#92400E]"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {confirmAction.type === "publish" ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : confirmAction.type === "unpublish" ? (
                  <AlertTriangle className="w-5 h-5" />
                ) : (
                  <Archive className="w-5 h-5" />
                )}
              </div>
              <div>
                <h3 className="text-[16px] font-black text-[#171717] dark:text-white capitalize">
                  {confirmAction.type} Banner
                </h3>
                <p className="text-[12px] text-[#68707A] dark:text-neutral-400">
                  {confirmAction.banner.name}
                </p>
              </div>
            </div>

            <p className="text-[13px] text-[#3B4148] dark:text-neutral-200 leading-relaxed">
              {confirmAction.type === "publish" &&
                "Publishing this banner will make it eligible for public rendering according to its start/end schedule and priority ranking. Are you sure you want to proceed?"}
              {confirmAction.type === "unpublish" &&
                "Unpublishing this banner will immediately remove it from public display and revert it to Draft status. Are you sure you want to proceed?"}
              {confirmAction.type === "archive" &&
                "Archiving will remove this banner from active rotation while permanently retaining its configuration and audit history. This action cannot be undone directly."}
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmAction(null)}
                className="px-4 py-2 rounded-xl border border-[#DCE1E7] dark:border-white/10 text-[12.5px] font-semibold text-[#171717] dark:text-white hover:bg-black/[0.03] transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isProcessingAction}
                onClick={handleExecuteConfirmedAction}
                className={`radius-native inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12.5px] font-bold text-white shadow-xs transition-colors disabled:opacity-50 ${
                  confirmAction.type === "publish"
                    ? "bg-[#15803D] hover:bg-[#166534]"
                    : confirmAction.type === "unpublish"
                    ? "bg-[#D97706] hover:bg-[#B45309]"
                    : "bg-[#DC2626] hover:bg-[#B91C1C]"
                }`}
              >
                {isProcessingAction && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span className="capitalize">{confirmAction.type} Banner</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
