"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Check,
  CheckCircle2,
  Image as ImageIcon,
  Loader2,
  MapPin,
  Package,
  Save,
  Sparkles,
  Store,
  Trash2,
  Upload,
} from "lucide-react";
import { RebrandHeader } from "../header/RebrandHeader";
import { RebrandFooter } from "../sections/RebrandFooter";
import { useAuth } from "../../context/AuthContext";
import { listingService } from "../../lib/listingService";
import { apiGet, apiPost } from "../../lib/apiClient";
import { SPRING_SMOOTH } from "@/lib/motion";

const DRAFT_STORAGE_KEY = "ch_create_listing_draft_v2";

const PRODUCT_CATEGORIES = [
  "Laptops & Computers",
  "Phones & Tablets",
  "Fashion & Clothing",
  "Books & Academics",
  "Hostel & Furniture",
  "Electronics & Audio",
];

const SERVICE_CATEGORIES = [
  "Services",
  "Design & Printing",
  "Tech & Repairs",
  "Hair & Beauty",
  "Academic Tutoring & Writing",
  "Photography & Video",
  "Cleaning & Errand",
];

const PRODUCT_CONDITIONS = [
  { value: "Brand New", label: "Brand New (Sealed / Unopened)" },
  { value: "Like New", label: "Like New (Barely used)" },
  { value: "Used - Good", label: "Used - Good (Normal cosmetic wear)" },
  { value: "Used - Fair", label: "Used - Fair (Functional with wear)" },
];

export function CreateListingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const storeIdParam = searchParams?.get("storeId") || null;
  const initialType = searchParams?.get("type") === "service" ? "service" : "product";

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null);
  const [showDraftToast, setShowDraftToast] = useState(false);
  const [publishedListingId, setPublishedListingId] = useState<string | null>(null);

  // Storefront Ownership State
  const [ownedStores, setOwnedStores] = useState<any[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<string>(storeIdParam || "");
  const [userStore, setUserStore] = useState<any | null>(null);

  // Essential Listing Fields
  const [listingType, setListingType] = useState<"product" | "service">(initialType);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(
    initialType === "service" ? "Services" : "Laptops & Computers"
  );
  const [condition, setCondition] = useState("Used - Good");
  const [servicePricingModel, setServicePricingModel] = useState<
    "fixed" | "hourly" | "negotiable" | "starting_at"
  >("fixed");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load authenticated user's active storefronts
  useEffect(() => {
    let isCancelled = false;
    async function loadStorefront() {
      try {
        const res = await apiGet<any>("/api/stores/me");
        if (!isCancelled && res?.success && res?.data) {
          const allStores: any[] = Array.isArray(res.data.stores)
            ? res.data.stores
            : res.data.store
            ? [res.data.store]
            : [];
          const activeStores = allStores.filter((s) => s.status === "active");
          setOwnedStores(activeStores);

          const chosen =
            (storeIdParam &&
              activeStores.find(
                (s) => String(s._id || s.id) === storeIdParam || s.slug === storeIdParam
              )) ||
            activeStores[0] ||
            res.data.store ||
            null;

          if (chosen) {
            setUserStore(chosen);
            setSelectedStoreId(String(chosen._id || chosen.id || ""));
          }
        }
      } catch {
        // Fallback if store fetch fails
      }
    }
    loadStorefront();
    return () => {
      isCancelled = true;
    };
  }, [user?.id, storeIdParam]);

  // Restore draft on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.listingType === "service" || parsed.listingType === "product") {
          setListingType(parsed.listingType);
        }
        if (parsed.title) setTitle(parsed.title);
        if (parsed.category) setCategory(parsed.category);
        if (parsed.condition) setCondition(parsed.condition);
        if (parsed.servicePricingModel) setServicePricingModel(parsed.servicePricingModel);
        if (parsed.price) setPrice(parsed.price);
        if (parsed.description) setDescription(parsed.description);
        if (Array.isArray(parsed.images) && parsed.images.length > 0) setImages(parsed.images);
        if (parsed.savedAt) setDraftSavedAt(parsed.savedAt);
      }
    } catch {
      // Ignore draft read errors
    }
  }, []);

  const handleSaveDraft = () => {
    const nowLabel = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    const draftPayload = {
      listingType,
      title,
      category,
      condition,
      servicePricingModel,
      price,
      description,
      images,
      savedAt: nowLabel,
    };
    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftPayload));
      setDraftSavedAt(nowLabel);
      setShowDraftToast(true);
      setTimeout(() => setShowDraftToast(false), 3000);
    } catch {
      // Ignore storage errors
    }
  };

  const handleImageFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setIsUploadingImages(true);
      const res = await listingService.uploadImages(Array.from(files));
      if (res.success && res.urls?.length) {
        setImages((prev) => [...prev, ...res.urls].slice(0, 8));
        setErrors((prev) => ({ ...prev, images: "" }));
      }
    } catch (uploadErr: any) {
      setErrors((prev) => ({
        ...prev,
        images: uploadErr.message || "Failed to upload images. Please check file format and size.",
      }));
    } finally {
      setIsUploadingImages(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSetPrimaryImage = (index: number) => {
    if (index === 0) return;
    setImages((prev) => {
      const copy = [...prev];
      const [item] = copy.splice(index, 1);
      copy.unshift(item);
      return copy;
    });
  };

  const handleBackToPrevious = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/stores?view=storefront");
    }
  };

  // Derive campus & pickup landmark automatically from selected store
  const resolvedStoreId =
    selectedStoreId || storeIdParam || userStore?._id || userStore?.id || undefined;
  const storeDisplayName =
    userStore?.name ||
    (user as any)?.profile?.displayName ||
    user?.name ||
    "Campus Storefront";
  const storeAvatar =
    userStore?.logo ||
    user?.avatar ||
    (user as any)?.profile?.avatar ||
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80";
  const defaultCampus = userStore?.campus || user?.campus || "Main University Campus";
  const defaultLandmark =
    userStore?.operatingLocation || userStore?.campus || user?.campus || "Main Campus";
  const storeSlugOrId = userStore?.slug || resolvedStoreId || user?.handle || "me";
  const storeIsVerified = Boolean(userStore?.isVerified);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!title.trim() || title.trim().length < 3) {
      newErrors.title = "Enter a clear title (at least 3 characters).";
    }
    const cleanPrice = Number(price.replace(/,/g, ""));
    if (!price.trim() || Number.isNaN(cleanPrice) || cleanPrice < 0) {
      newErrors.price = "Enter a valid price in Naira (₦).";
    }
    if (!description.trim() || description.trim().length < 10) {
      newErrors.description = "Add a short description (at least 10 characters).";
    }
    if (images.length === 0) {
      newErrors.images = "Upload at least 1 photo.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePublishListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors({});

    const cleanPrice = Number(price.replace(/,/g, ""));
    const newId = `lst-${Date.now().toString().slice(-6)}`;

    const newListingData = {
      id: newId,
      _id: newId,
      title: title.trim(),
      price: cleanPrice,
      priceFormatted: `₦${cleanPrice.toLocaleString()}`,
      category,
      condition: listingType === "product" ? condition : undefined,
      listingType,
      serviceDetails:
        listingType === "service"
          ? { pricingModel: servicePricingModel }
          : undefined,
      storeId: resolvedStoreId,
      status: "Available",
      description: description.trim(),
      images,
      imageUrl: images[0] || "/placeholder.png",
      landmark: defaultLandmark,
      campus: defaultCampus,
      location: defaultLandmark,
      sellerId: user?.id || "",
      sellerName: storeDisplayName,
      sellerHandle: storeSlugOrId,
      sellerAvatar: storeAvatar,
      sellerSubtitle: `${userStore?.category || "Student Storefront"} · ${defaultLandmark}`,
      sellerBio: userStore?.description || "Active storefront on Campus Hive.",
      sellerListingsCount: (userStore?.metrics?.listingsCount || 0) + 1,
      sellerRating:
        userStore?.metrics?.rating !== undefined
          ? Number(userStore.metrics.rating).toFixed(1)
          : "5.0",
      sellerReviewsCount: userStore?.metrics?.reviewsCount ?? 0,
      storeHref: resolvedStoreId ? `/stores/${storeSlugOrId}` : `/stores/${user?.handle || "me"}`,
      sellerType:
        userStore?.storeType === "local_business" ? "approved_business" : "student_seller",
      isStudentSeller: userStore?.storeType !== "local_business",
      isVerified: storeIsVerified,
      createdAt: new Date().toISOString(),
    };

    try {
      try {
        const result = await apiPost<any>("/api/listings", {
          title: newListingData.title,
          description: newListingData.description,
          price: newListingData.price,
          category: newListingData.category,
          condition: newListingData.condition,
          listingType: newListingData.listingType,
          serviceDetails: newListingData.serviceDetails,
          storeId: newListingData.storeId,
          images: newListingData.images,
          campus: newListingData.campus,
          location: newListingData.location,
        });
        if (result?.success && result?.data?._id) {
          newListingData.id = String(result.data._id);
          newListingData._id = String(result.data._id);
        }
      } catch {
        // Fallback to local listing entry if API unavailable
      }

      const existingStored = localStorage.getItem("ch_user_created_listings");
      const listArray = existingStored ? JSON.parse(existingStored) : [];
      listArray.unshift(newListingData);
      localStorage.setItem("ch_user_created_listings", JSON.stringify(listArray));

      localStorage.removeItem(DRAFT_STORAGE_KEY);
      setPublishedListingId(newListingData.id);
    } catch {
      setErrors({ submit: "Failed to publish listing. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formattedPriceNumber = Number(price.replace(/,/g, "") || 0).toLocaleString();

  if (publishedListingId) {
    return (
      <div
        style={{ fontFamily: "var(--font-plus-jakarta), sans-serif" }}
        className="min-h-screen flex flex-col bg-[#F7F8FA] dark:bg-[#0E1015] text-[#171717] dark:text-white antialiased"
      >
        <RebrandHeader />

        <main className="flex-1 max-w-[840px] w-full mx-auto px-5 sm:px-8 py-12 sm:py-16 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={SPRING_SMOOTH}
            className="radius-native w-full bg-white dark:bg-[#14161D] rounded-2xl border border-[#ECEEF2] dark:border-white/10 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-7 sm:p-10 text-center space-y-6"
          >
            <div className="w-16 h-16 rounded-full bg-[#FFC928]/20 border-2 border-[#FFC928] text-[#171717] dark:text-white flex items-center justify-center mx-auto shadow-sm">
              <Sparkles className="w-8 h-8 text-[#D97706] dark:text-[#FFC928]" />
            </div>

            <div>
              <span className="inline-block px-3 py-1 rounded-full text-[11.5px] font-bold bg-[#E8F8F0] dark:bg-emerald-500/10 text-[#15803D] dark:text-emerald-400 border border-[#A7F3D0] dark:border-emerald-500/20 mb-3">
                Listing Live on Campus
              </span>
              <h1 className="text-[24px] sm:text-[28px] font-extrabold text-[#171717] dark:text-white tracking-[-0.02em]">
                Your listing is now published!
              </h1>
              <p className="text-[13.5px] text-[#68707A] dark:text-neutral-400 max-w-md mx-auto mt-2 leading-relaxed">
                Students on your campus can now discover{" "}
                <strong className="text-[#171717] dark:text-white font-semibold">
                  &quot;{title}&quot;
                </strong>{" "}
                and message you directly.
              </p>
            </div>

            <div className="radius-native max-w-md mx-auto bg-[#F7F8FA] dark:bg-[#181B24] border border-[#ECEEF2] dark:border-white/10 rounded-xl p-3.5 flex items-center gap-3.5 text-left">
              <div className="w-16 h-16 rounded-lg bg-neutral-200 dark:bg-neutral-800 overflow-hidden shrink-0">
                <img
                  src={images[0] || "/placeholder.png"}
                  alt={title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[11.5px] font-semibold text-[#8C929C] dark:text-neutral-400">
                  {category}
                  {listingType === "product" ? ` · ${condition}` : ""}
                </div>
                <h4 className="text-[14px] font-bold text-[#171717] dark:text-white truncate">
                  {title}
                </h4>
                <div className="text-[15px] font-extrabold text-[#171717] dark:text-white mt-0.5">
                  ₦{formattedPriceNumber}
                </div>
              </div>
            </div>

            <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
              <Link
                href={`/listings/${publishedListingId}`}
                className="radius-native w-full sm:w-auto flex-1 px-5 py-2.5 rounded-xl bg-[#FFC928] hover:bg-[#F2BD24] text-[#171717] text-[13px] font-bold shadow-xs transition-all text-center"
              >
                View listing
              </Link>
              <Link
                href="/stores?view=storefront"
                className="radius-native w-full sm:w-auto flex-1 px-5 py-2.5 rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-white/5 text-[#171717] dark:text-white text-[13px] font-bold hover:border-[#171717] dark:hover:border-white transition-colors text-center"
              >
                Manage storefront
              </Link>
              <Link
                href="/explore"
                className="radius-native w-full sm:w-auto flex-1 px-5 py-2.5 rounded-xl bg-[#F2F4F8] dark:bg-white/5 hover:bg-[#E5E8EE] dark:hover:bg-white/10 text-[#5B636E] dark:text-neutral-300 text-[13px] font-bold transition-colors text-center"
              >
                Explore
              </Link>
            </div>
          </motion.div>
        </main>

        <RebrandFooter />
      </div>
    );
  }

  return (
    <div
      style={{ fontFamily: "var(--font-plus-jakarta), sans-serif" }}
      className="min-h-screen flex flex-col bg-[#F7F8FA] dark:bg-[#0E1015] text-[#171717] dark:text-white antialiased"
    >
      <RebrandHeader />

      {/* Top Action Bar */}
      <div className="bg-white dark:bg-[#14161D] border-b border-[#ECEEF2] dark:border-white/10 sticky top-[64px] z-30">
        <div className="max-w-[1160px] mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={handleBackToPrevious}
              className="radius-native inline-flex items-center justify-center w-8 h-8 rounded-full border border-[#DCE0E6] dark:border-white/15 text-[#5B636E] dark:text-neutral-300 hover:bg-[#F7F8FA] dark:hover:bg-white/5 transition-colors cursor-pointer shrink-0"
              aria-label="Go back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="min-w-0">
              <h1 className="text-[16px] sm:text-[18px] font-extrabold text-[#171717] dark:text-white tracking-[-0.015em] truncate">
                Create New Listing
              </h1>
              <p className="text-[11.5px] text-[#68707A] dark:text-neutral-400 truncate">
                Posting as <strong className="text-[#171717] dark:text-white">{storeDisplayName}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {draftSavedAt && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[11.5px] text-[#68707A] dark:text-neutral-400">
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                Draft {draftSavedAt}
              </span>
            )}
            <button
              type="button"
              onClick={handleSaveDraft}
              className="radius-native inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-white/5 text-[12.5px] font-bold text-[#171717] dark:text-white hover:border-[#171717] dark:hover:border-white transition-colors cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Draft</span>
            </button>
          </div>
        </div>
      </div>

      {showDraftToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#171717] dark:bg-white text-white dark:text-[#171717] px-4 py-2.5 rounded-xl text-[12.5px] font-bold shadow-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          <span>Draft saved locally</span>
        </div>
      )}

      <main className="flex-1 max-w-[1160px] w-full mx-auto px-4 sm:px-8 py-7 sm:py-9">
        <form onSubmit={handlePublishListing} className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
          {/* Left: Streamlined Essential Fields */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={SPRING_SMOOTH}
            className="lg:col-span-7 radius-native rounded-2xl bg-white dark:bg-[#14161D] border border-[#ECEEF2] dark:border-white/10 shadow-[0_4px_20px_rgba(15,23,42,0.025)] p-5 sm:p-7 space-y-5"
          >
            {/* 1. Storefront Selector (Only shown if user owns 2+ stores) */}
            {ownedStores.length > 1 && (
              <div>
                <label
                  htmlFor="listingStoreId"
                  className="block text-[13px] font-bold text-[#3F454D] dark:text-neutral-200 mb-1.5"
                >
                  Storefront <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Store className="w-4 h-4 text-[#8C929C] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    id="listingStoreId"
                    value={selectedStoreId}
                    onChange={(e) => {
                      const nextId = e.target.value;
                      setSelectedStoreId(nextId);
                      const found = ownedStores.find((s) => String(s._id || s.id) === nextId);
                      if (found) setUserStore(found);
                    }}
                    className="radius-native w-full rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-[#181B24] pl-10 pr-3.5 py-2.5 text-[13.5px] text-[#171717] dark:text-white focus:outline-none focus:border-[#FFC928] focus:ring-2 focus:ring-[#FFC928]/25 transition-all cursor-pointer"
                  >
                    {ownedStores.map((s) => {
                      const sid = String(s._id || s.id);
                      return (
                        <option key={sid} value={sid}>
                          {s.name} ({s.campus || "Main Campus"})
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
            )}

            {/* 2. Listing Type (Product vs Service) */}
            <div>
              <span className="block text-[13px] font-bold text-[#3F454D] dark:text-neutral-200 mb-2">
                Listing Type <span className="text-rose-500">*</span>
              </span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setListingType("product");
                    if (SERVICE_CATEGORIES.includes(category)) {
                      setCategory(PRODUCT_CATEGORIES[0]);
                    }
                  }}
                  className={`radius-native flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    listingType === "product"
                      ? "border-[#FFC928] bg-[#FFFBEB] dark:bg-[#FFC928]/10 text-[#171717] dark:text-white"
                      : "border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-[#181B24] text-[#5B636E] dark:text-neutral-300"
                  }`}
                >
                  <Package className="w-4 h-4 shrink-0" />
                  <div>
                    <div className="text-[13px] font-bold">Product</div>
                    <div className="text-[11px] opacity-75">Physical item for sale</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setListingType("service");
                    if (PRODUCT_CATEGORIES.includes(category)) {
                      setCategory(SERVICE_CATEGORIES[0]);
                    }
                  }}
                  className={`radius-native flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    listingType === "service"
                      ? "border-[#FFC928] bg-[#FFFBEB] dark:bg-[#FFC928]/10 text-[#171717] dark:text-white"
                      : "border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-[#181B24] text-[#5B636E] dark:text-neutral-300"
                  }`}
                >
                  <Briefcase className="w-4 h-4 shrink-0" />
                  <div>
                    <div className="text-[13px] font-bold">Service</div>
                    <div className="text-[11px] opacity-75">Skill, repair, or tutoring</div>
                  </div>
                </button>
              </div>
            </div>

            {/* 3. Title */}
            <div>
              <label
                htmlFor="listingTitle"
                className="block text-[13px] font-bold text-[#3F454D] dark:text-neutral-200 mb-1.5"
              >
                Title <span className="text-rose-500">*</span>
              </label>
              <input
                id="listingTitle"
                type="text"
                maxLength={100}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={
                  listingType === "service"
                    ? "e.g. Graphic Design & Event Flyers"
                    : "e.g. MacBook Air M1 8GB/256GB"
                }
                className="radius-native w-full rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-[#181B24] px-3.5 py-2.5 text-[13.5px] text-[#171717] dark:text-white placeholder:text-[#8C929C] focus:outline-none focus:border-[#FFC928] focus:ring-2 focus:ring-[#FFC928]/25 transition-all"
              />
              {errors.title && (
                <p className="mt-1 text-[11.5px] text-rose-500 font-medium">{errors.title}</p>
              )}
            </div>

            {/* 4 & 5. Category + Condition (or Pricing Model for Services) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="listingCategory"
                  className="block text-[13px] font-bold text-[#3F454D] dark:text-neutral-200 mb-1.5"
                >
                  Category <span className="text-rose-500">*</span>
                </label>
                <select
                  id="listingCategory"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="radius-native w-full rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-[#181B24] px-3.5 py-2.5 text-[13.5px] text-[#171717] dark:text-white focus:outline-none focus:border-[#FFC928] focus:ring-2 focus:ring-[#FFC928]/25 transition-all cursor-pointer"
                >
                  {(listingType === "service" ? SERVICE_CATEGORIES : PRODUCT_CATEGORIES).map(
                    (cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    )
                  )}
                </select>
              </div>

              {listingType === "service" ? (
                <div>
                  <label
                    htmlFor="pricingModel"
                    className="block text-[13px] font-bold text-[#3F454D] dark:text-neutral-200 mb-1.5"
                  >
                    Pricing Model
                  </label>
                  <select
                    id="pricingModel"
                    value={servicePricingModel}
                    onChange={(e) => setServicePricingModel(e.target.value as any)}
                    className="radius-native w-full rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-[#181B24] px-3.5 py-2.5 text-[13.5px] text-[#171717] dark:text-white focus:outline-none focus:border-[#FFC928] focus:ring-2 focus:ring-[#FFC928]/25 transition-all cursor-pointer"
                  >
                    <option value="fixed">Fixed Price</option>
                    <option value="starting_at">Starting at</option>
                    <option value="hourly">Hourly Rate</option>
                    <option value="negotiable">Negotiable</option>
                  </select>
                </div>
              ) : (
                <div>
                  <label
                    htmlFor="listingCondition"
                    className="block text-[13px] font-bold text-[#3F454D] dark:text-neutral-200 mb-1.5"
                  >
                    Condition <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="listingCondition"
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    className="radius-native w-full rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-[#181B24] px-3.5 py-2.5 text-[13.5px] text-[#171717] dark:text-white focus:outline-none focus:border-[#FFC928] focus:ring-2 focus:ring-[#FFC928]/25 transition-all cursor-pointer"
                  >
                    {PRODUCT_CONDITIONS.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* 6. Price */}
            <div>
              <label
                htmlFor="listingPrice"
                className="block text-[13px] font-bold text-[#3F454D] dark:text-neutral-200 mb-1.5"
              >
                Price (₦) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[14px] font-bold text-[#68707A]">
                  ₦
                </span>
                <input
                  id="listingPrice"
                  type="text"
                  inputMode="numeric"
                  value={price}
                  onChange={(e) => setPrice(e.target.value.replace(/[^\d,]/g, ""))}
                  placeholder="25000"
                  className="radius-native w-full rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-[#181B24] pl-8 pr-3.5 py-2.5 text-[14px] font-bold text-[#171717] dark:text-white placeholder:font-normal placeholder:text-[#8C929C] focus:outline-none focus:border-[#FFC928] focus:ring-2 focus:ring-[#FFC928]/25 transition-all"
                />
              </div>
              {errors.price && (
                <p className="mt-1 text-[11.5px] text-rose-500 font-medium">{errors.price}</p>
              )}
            </div>

            {/* 7. Description */}
            <div>
              <label
                htmlFor="listingDescription"
                className="block text-[13px] font-bold text-[#3F454D] dark:text-neutral-200 mb-1.5"
              >
                Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                id="listingDescription"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Include key details like specs, flaws, course code, or turnaround time. Buyers can ask anything else in chat."
                className="radius-native w-full rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-[#181B24] px-3.5 py-2.5 text-[13.5px] text-[#171717] dark:text-white placeholder:text-[#8C929C] focus:outline-none focus:border-[#FFC928] focus:ring-2 focus:ring-[#FFC928]/25 transition-all resize-y"
              />
              {errors.description && (
                <p className="mt-1 text-[11.5px] text-rose-500 font-medium">
                  {errors.description}
                </p>
              )}
            </div>

            {/* 8. Photos */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[13px] font-bold text-[#3F454D] dark:text-neutral-200">
                  Photos <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11.5px] text-[#8C929C]">
                  {images.length} / 8 uploaded
                </span>
              </div>

              <label className="radius-native flex flex-col items-center justify-center w-full border-2 border-dashed border-[#DCE0E6] dark:border-white/15 rounded-xl py-6 px-4 text-center cursor-pointer hover:border-[#FFC928] hover:bg-[#FFFDF5] dark:hover:bg-white/[0.02] transition-colors">
                {isUploadingImages ? (
                  <>
                    <Loader2 className="w-6 h-6 text-[#D99B00] animate-spin mb-1.5" />
                    <span className="text-[12.5px] font-semibold text-[#5B636E] dark:text-neutral-300">
                      Uploading photos...
                    </span>
                  </>
                ) : (
                  <>
                    <Upload className="w-6 h-6 text-[#8C929C] mb-1.5" />
                    <span className="text-[13px] font-bold text-[#171717] dark:text-white">
                      Click to upload photos
                    </span>
                    <span className="text-[11.5px] text-[#8C929C] mt-0.5">
                      JPG, PNG or WebP (first photo is your cover)
                    </span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  disabled={isUploadingImages || images.length >= 8}
                  onChange={handleImageFiles}
                  className="hidden"
                />
              </label>

              {images.length > 0 && (
                <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                  {images.map((imgUrl, idx) => (
                    <div
                      key={`${imgUrl}-${idx}`}
                      className="radius-native relative aspect-square rounded-xl overflow-hidden border border-[#ECEEF2] dark:border-white/10 group bg-[#F6F7F9] dark:bg-white/5"
                    >
                      <img
                        src={imgUrl}
                        alt={`Upload ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {idx === 0 && (
                        <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-[#FFC928] text-[#171717] text-[10px] font-extrabold">
                          Cover
                        </span>
                      )}
                      <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                        {idx !== 0 && (
                          <button
                            type="button"
                            onClick={() => handleSetPrimaryImage(idx)}
                            className="px-2 py-1 rounded bg-white text-[#171717] text-[10.5px] font-bold cursor-pointer"
                          >
                            Cover
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          aria-label="Remove image"
                          className="p-1.5 rounded bg-rose-600 text-white cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {errors.images && (
                <p className="mt-1.5 text-[11.5px] text-rose-500 font-medium">{errors.images}</p>
              )}
            </div>

            {errors.submit && (
              <div className="rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 px-3.5 py-2.5 text-[12.5px] text-rose-600 dark:text-rose-400 font-medium">
                {errors.submit}
              </div>
            )}

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="submit"
                disabled={isSubmitting || isUploadingImages}
                className="radius-native w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-[#FFC928] hover:bg-[#F2BD24] text-[#171717] text-[14px] font-extrabold shadow-xs transition-all disabled:opacity-60 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    <span>Publish Listing</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </motion.div>

          {/* Right: Live Card Preview */}
          <motion.aside
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...SPRING_SMOOTH, delay: 0.08 }}
            className="lg:col-span-5 sticky top-[140px] space-y-3"
          >
            <div className="text-[12px] font-bold uppercase tracking-wider text-[#8C929C]">
              Live Card Preview
            </div>

            <div className="radius-native rounded-2xl bg-white dark:bg-[#14161D] border border-[#ECEEF2] dark:border-white/10 p-3.5 shadow-[0_4px_20px_rgba(15,23,42,0.025)] max-w-[320px]">
              <div className="radius-native relative h-[180px] w-full rounded-xl bg-[#F6F7F9] dark:bg-white/5 overflow-hidden flex items-center justify-center">
                {images[0] ? (
                  <img
                    src={images[0]}
                    alt={title || "Listing preview"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center text-[#8C929C]">
                    <ImageIcon className="w-8 h-8 mb-1 opacity-50" />
                    <span className="text-[11.5px]">Photo preview</span>
                  </div>
                )}
                <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-white/90 dark:bg-black/60 text-[#171717] dark:text-white shadow-xs">
                  {listingType === "service" ? "Service" : condition}
                </span>
              </div>

              <div className="pt-3 px-0.5">
                <h3 className="text-[14px] font-bold text-[#171717] dark:text-white truncate">
                  {title.trim() || "Your listing title"}
                </h3>
                <div className="mt-1 flex items-center gap-1 text-[11.5px] font-medium text-[#68707A] dark:text-neutral-400">
                  <MapPin className="w-3 h-3 shrink-0" />
                  <span className="truncate">{defaultLandmark}</span>
                </div>
                <div className="mt-0.5 text-[11px] text-[#8C929C] truncate">
                  {storeDisplayName}
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-[#F2F4F7] dark:border-white/5 flex items-center justify-between">
                <span className="text-[15px] font-extrabold text-[#14171A] dark:text-white">
                  {price ? `₦${formattedPriceNumber}` : "₦0"}
                </span>
                <span className="text-[11.5px] font-semibold px-2.5 py-1 rounded-lg border border-[#E4E7EC] dark:border-white/15">
                  {listingType === "service" ? "Book" : "View"}
                </span>
              </div>
            </div>
          </motion.aside>
        </form>
      </main>

      <RebrandFooter />
    </div>
  );
}
