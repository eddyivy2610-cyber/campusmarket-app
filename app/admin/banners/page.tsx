"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import {
  Plus,
  Upload,
  Calendar,
  Link as LinkIcon,
  Edit2,
  Trash2,
  Eye,
  Archive,
  RefreshCw,
  X,
  Loader2,
  Image as ImageIcon,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/apiClient";
import { uploadFileClient } from "@/lib/clientUpload";

interface BannerItem {
  id: string;
  _id?: string;
  imageUrl: string;
  ctaUrl?: string | null;
  placement: string;
  status: string;
  startAt?: string | null;
  endAt?: string | null;
  createdAt: string;
}

const RECOMMENDED_DIMENSIONS: Record<string, string> = {
  homepage_hero: "1200 × 360 px (WebP, landscape ~3.3:1)",
  category_banner: "1200 × 240 px (WebP, wide ~5:1)",
};

function toDatetimeLocalValue(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

export default function AdminBannersPageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
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
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<BannerItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Simplified Banner Form Fields
  const [imageUrl, setImageUrl] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");
  const [placement, setPlacement] = useState<"homepage_hero" | "category_banner">("homepage_hero");
  const [status, setStatus] = useState<"published" | "archived">("published");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const fetchBanners = async () => {
    try {
      setIsLoading(true);
      const res: any = await apiGet("admin/banners");
      const list = Array.isArray(res?.data) ? res.data : [];
      setBanners(list);
    } catch (err: any) {
      toast.error(err?.message || "Failed to load banners.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const openCreateModal = () => {
    setEditingBanner(null);
    setImageUrl("");
    setCtaUrl("");
    setPlacement("homepage_hero");
    setStatus("published");
    setStartAt("");
    setEndAt("");
    setIsModalOpen(true);
  };

  const openEditModal = (banner: BannerItem) => {
    setEditingBanner(banner);
    setImageUrl(banner.imageUrl || "");
    setCtaUrl(banner.ctaUrl || "");
    setPlacement(
      banner.placement === "category_banner" ? "category_banner" : "homepage_hero"
    );
    setStatus(banner.status === "archived" ? "archived" : "published");
    setStartAt(toDatetimeLocalValue(banner.startAt));
    setEndAt(toDatetimeLocalValue(banner.endAt));
    setIsModalOpen(true);
  };

  const handleWebpUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    const isWebp =
      file.type === "image/webp" || file.name.toLowerCase().endsWith(".webp");
    if (!isWebp) {
      toast.error("Please upload a .webp image for banners.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Banner image must be under 5MB.");
      return;
    }

    setIsUploading(true);
    try {
      const res = await uploadFileClient(file, "banner_image");
      if (res.success && res.url) {
        setImageUrl(res.url);
        toast.success("Banner image uploaded.");
      } else {
        throw new Error(res.error || "Upload failed");
      }
    } catch {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setImageUrl(reader.result);
          toast.success("Banner image ready.");
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl.trim()) {
      toast.error("Please upload a WebP banner image.");
      return;
    }
    if (startAt && endAt && new Date(endAt) <= new Date(startAt)) {
      toast.error("End time must be after start time.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        imageUrl: imageUrl.trim(),
        ctaUrl: ctaUrl.trim() || null,
        placement,
        status,
        headline: "Promotional Banner",
        description: null,
        ctaLabel: null,
        startAt: startAt ? new Date(startAt).toISOString() : null,
        endAt: endAt ? new Date(endAt).toISOString() : null,
      };

      if (editingBanner) {
        await apiPatch(`admin/banners/${editingBanner.id || editingBanner._id}`, payload);
        toast.success("Banner updated.");
      } else {
        await apiPost("admin/banners", payload);
        toast.success("Banner created.");
      }
      setIsModalOpen(false);
      fetchBanners();
    } catch (err: any) {
      toast.error(err?.message || "Failed to save banner.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (banner: BannerItem) => {
    const id = banner.id || banner._id;
    const nextStatus = banner.status === "published" ? "archived" : "published";
    try {
      await apiPatch(`admin/banners/${id}`, { status: nextStatus });
      toast.success(nextStatus === "published" ? "Banner published." : "Banner archived.");
      fetchBanners();
    } catch (err: any) {
      toast.error(err?.message || "Failed to update banner status.");
    }
  };

  const handleDelete = async (banner: BannerItem) => {
    const id = banner.id || banner._id;
    try {
      await apiDelete(`admin/banners/${id}`);
      toast.success("Banner deleted.");
      setBanners((prev) => prev.filter((b) => (b.id || b._id) !== id));
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete banner.");
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#14161D] p-6 rounded-3xl border border-border/60 dark:border-white/10 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-[#171717] dark:text-white tracking-tight">
            Banners
          </h1>
          <p className="text-xs text-muted-foreground dark:text-neutral-400 mt-1">
            Upload WebP banner images, set an active timeframe, and link to a store profile or listing.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchBanners}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-[#F2F4F7] dark:bg-white/10 hover:bg-[#E5E7EB] dark:hover:bg-white/15 text-xs font-bold text-[#171717] dark:text-white transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[#171717] hover:bg-[#262626] dark:bg-[#FFC928] dark:hover:bg-[#F2BD24] text-white dark:text-[#171717] text-xs font-black transition-colors cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New Banner
          </button>
        </div>
      </div>

      {/* Banner List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-56 rounded-3xl bg-white dark:bg-[#14161D] border border-border/50 dark:border-white/10 animate-pulse" />
          ))}
        </div>
      ) : banners.length === 0 ? (
        <div className="bg-white dark:bg-[#14161D] rounded-3xl border border-border/60 dark:border-white/10 p-12 text-center">
          <ImageIcon className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-sm font-bold text-foreground dark:text-white">No banners yet</p>
          <p className="text-xs text-muted-foreground dark:text-neutral-400 mt-1">
            Upload a WebP banner image to feature a store or listing on the marketplace.
          </p>
          <button
            onClick={openCreateModal}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FFC928] text-[#171717] text-xs font-black cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Upload Banner
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {banners.map((banner) => {
            const id = banner.id || banner._id || "";
            const isPublished = banner.status === "published";
            return (
              <div
                key={id}
                className="bg-white dark:bg-[#14161D] rounded-3xl border border-border/60 dark:border-white/10 overflow-hidden shadow-sm flex flex-col"
              >
                <div className="relative aspect-[16/5] bg-[#F7F8FA] dark:bg-black/30 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={banner.imageUrl}
                    alt="Banner"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        isPublished
                          ? "bg-emerald-500 text-white"
                          : "bg-neutral-800/80 text-neutral-200"
                      }`}
                    >
                      {banner.status}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-black/60 text-white text-[10px] font-bold">
                      {banner.placement === "category_banner" ? "Category" : "Homepage Hero"}
                    </span>
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between gap-3 text-xs">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-muted-foreground dark:text-neutral-400 truncate">
                      <LinkIcon className="w-3.5 h-3.5 shrink-0" />
                      {banner.ctaUrl ? (
                        <span className="font-semibold text-foreground dark:text-white truncate">
                          {banner.ctaUrl}
                        </span>
                      ) : (
                        <span className="italic">No destination link</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground dark:text-neutral-400">
                      <Calendar className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        {banner.startAt || banner.endAt
                          ? `${banner.startAt ? new Date(banner.startAt).toLocaleDateString() : "Now"} → ${
                              banner.endAt ? new Date(banner.endAt).toLocaleDateString() : "No end date"
                            }`
                          : "Always active"}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border/40 dark:border-white/10 flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleToggleStatus(banner)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#F2F4F7] dark:bg-white/10 hover:bg-[#E5E7EB] dark:hover:bg-white/15 font-bold text-foreground dark:text-white cursor-pointer"
                    >
                      {isPublished ? <Archive className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{isPublished ? "Archive" : "Publish"}</span>
                    </button>
                    <button
                      onClick={() => openEditModal(banner)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#F2F4F7] dark:bg-white/10 hover:bg-[#E5E7EB] dark:hover:bg-white/15 font-bold text-foreground dark:text-white cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(banner)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 font-bold text-rose-600 dark:text-rose-400 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Simple Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#14161D] w-full max-w-lg rounded-3xl border border-border dark:border-white/10 shadow-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border/50 dark:border-white/10 flex items-center justify-between">
              <h2 className="text-base font-black text-foreground dark:text-white">
                {editingBanner ? "Edit Banner" : "Upload Banner"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#F2F4F7] dark:bg-white/10 flex items-center justify-center text-foreground dark:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4 text-xs">
              {/* Placement */}
              <div className="space-y-1.5">
                <label className="block font-bold text-foreground dark:text-white">Placement</label>
                <div className="grid grid-cols-2 gap-2">
                  {(["homepage_hero", "category_banner"] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPlacement(p)}
                      className={`py-2 px-3 rounded-xl border font-bold text-center transition-colors cursor-pointer ${
                        placement === p
                          ? "border-[#171717] bg-[#171717] text-white dark:border-[#FFC928] dark:bg-[#FFC928] dark:text-[#171717]"
                          : "border-border dark:border-white/10 text-muted-foreground dark:text-neutral-300"
                      }`}
                    >
                      {p === "homepage_hero" ? "Homepage Hero" : "Category Banner"}
                    </button>
                  ))}
                </div>
              </div>

              {/* WebP Image Upload */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-foreground dark:text-white">
                    Banner Image (WebP)
                  </label>
                  <span className="text-[11px] text-muted-foreground dark:text-neutral-400">
                    Recommended: {RECOMMENDED_DIMENSIONS[placement]}
                  </span>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/webp"
                  onChange={handleWebpUpload}
                  className="hidden"
                />

                {imageUrl ? (
                  <div className="relative rounded-2xl overflow-hidden border border-border dark:border-white/10 aspect-[16/5] bg-black/5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imageUrl} alt="Banner preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-2.5 right-2.5 px-3 py-1.5 rounded-xl bg-black/75 text-white font-bold text-[11px] hover:bg-black cursor-pointer"
                    >
                      Replace WebP
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-full py-8 rounded-2xl border-2 border-dashed border-border dark:border-white/15 hover:border-[#FFC928] flex flex-col items-center justify-center gap-2 text-muted-foreground dark:text-neutral-400 transition-colors cursor-pointer"
                  >
                    {isUploading ? (
                      <Loader2 className="w-6 h-6 animate-spin text-[#FFC928]" />
                    ) : (
                      <Upload className="w-6 h-6" />
                    )}
                    <span className="font-bold text-foreground dark:text-white">
                      {isUploading ? "Uploading..." : "Click to upload .webp image"}
                    </span>
                    <span className="text-[11px]">{RECOMMENDED_DIMENSIONS[placement]}</span>
                  </button>
                )}
              </div>

              {/* Destination Link */}
              <div className="space-y-1.5">
                <label className="block font-bold text-foreground dark:text-white">
                  Link to Profile or Listing
                </label>
                <div className="relative">
                  <ExternalLink className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={ctaUrl}
                    onChange={(e) => setCtaUrl(e.target.value)}
                    placeholder="/stores/store-slug or /listing/listing-id"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-border dark:border-white/15 bg-white dark:bg-[#181B24] text-foreground dark:text-white placeholder:text-muted-foreground focus:outline-none focus:border-[#171717] dark:focus:border-[#FFC928]"
                  />
                </div>
              </div>

              {/* Timeframe */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block font-bold text-foreground dark:text-white">
                    Start Time (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={startAt}
                    onChange={(e) => setStartAt(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border dark:border-white/15 bg-white dark:bg-[#181B24] text-foreground dark:text-white focus:outline-none focus:border-[#171717] dark:focus:border-[#FFC928]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block font-bold text-foreground dark:text-white">
                    End Time (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={endAt}
                    onChange={(e) => setEndAt(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border dark:border-white/15 bg-white dark:bg-[#181B24] text-foreground dark:text-white focus:outline-none focus:border-[#171717] dark:focus:border-[#FFC928]"
                  />
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between pt-1">
                <label className="font-bold text-foreground dark:text-white">Publish immediately</label>
                <button
                  type="button"
                  onClick={() => setStatus((s) => (s === "published" ? "archived" : "published"))}
                  className={`px-3 py-1 rounded-full font-bold text-[11px] cursor-pointer ${
                    status === "published"
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {status === "published" ? "Published" : "Archived"}
                </button>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#F2F4F7] dark:bg-white/10 font-bold text-foreground dark:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isUploading}
                  className="px-5 py-2.5 rounded-xl bg-[#171717] hover:bg-[#262626] dark:bg-[#FFC928] dark:hover:bg-[#F2BD24] text-white dark:text-[#171717] font-black inline-flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingBanner ? "Save Changes" : "Publish Banner"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
