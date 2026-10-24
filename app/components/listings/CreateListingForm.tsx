"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Briefcase,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Eye,
  FileText,
  HardDrive,
  Heart,
  HelpCircle,
  Image as ImageIcon,
  Info,
  Laptop,
  Layers,
  Lightbulb,
  Loader2,
  MapPin,
  Package,
  Plus,
  RotateCcw,
  Save,
  Shield,
  ShieldCheck,
  Shirt,
  Smartphone,
  Sparkles,
  Star,
  Trash2,
  Upload,
  User,
  X,
} from "lucide-react";
import { RebrandHeader } from "../header/RebrandHeader";
import { RebrandFooter } from "../sections/RebrandFooter";
import { useAuth } from "../../context/AuthContext";
import { listingService } from "../../lib/listingService";

export type ListingStep = 1 | 2 | 3 | 4 | 5;

export interface CategorySpecOption {
  key: string;
  label: string;
  type: "select" | "text";
  options?: string[];
  placeholder?: string;
}

export const CATEGORY_SPECS: Record<string, CategorySpecOption[]> = {
  "Laptops & Computers": [
    { key: "brand", label: "Brand", type: "select", options: ["HP", "Dell", "Apple (MacBook)", "Lenovo", "Asus", "Acer", "Other"] },
    { key: "ram", label: "RAM", type: "select", options: ["4 GB", "8 GB", "16 GB", "32 GB", "64 GB"] },
    { key: "storage", label: "Storage", type: "select", options: ["128 GB SSD", "256 GB SSD", "512 GB SSD", "1 TB SSD", "500 GB HDD", "1 TB HDD"] },
    { key: "processor", label: "Processor", type: "text", placeholder: "e.g. Intel Core i5 8th Gen / Apple M1" },
    { key: "batteryHealth", label: "Battery Status", type: "select", options: ["Excellent (4+ hrs)", "Good (2-4 hrs)", "Fair (1-2 hrs)", "Plug-in required"] },
  ],
  "Phones & Tablets": [
    { key: "brand", label: "Brand", type: "select", options: ["Apple (iPhone)", "Samsung", "Xiaomi / Redmi", "Tecno", "Infinix", "Google Pixel", "Other"] },
    { key: "storage", label: "Storage", type: "select", options: ["64 GB", "128 GB", "256 GB", "512 GB"] },
    { key: "batteryHealth", label: "Battery Health", type: "text", placeholder: "e.g. 88% or Original battery" },
    { key: "simType", label: "SIM Configuration", type: "select", options: ["Physical SIM + eSIM", "Dual Nano SIM", "Single Nano SIM"] },
  ],
  "Fashion & Clothing": [
    { key: "size", label: "Size", type: "select", options: ["XS", "S", "M", "L", "XL", "XXL", "Free Size"] },
    { key: "genderFit", label: "Gender & Fit", type: "select", options: ["Unisex", "Men", "Women", "Oversized"] },
    { key: "color", label: "Primary Color", type: "text", placeholder: "e.g. Black, Navy Blue, Beige" },
    { key: "material", label: "Material", type: "text", placeholder: "e.g. 100% Cotton, Denim, Silk" },
  ],
  "Books & Academics": [
    { key: "courseCode", label: "Course Code", type: "text", placeholder: "e.g. COSC 201, MATH 101, ENGR 301" },
    { key: "department", label: "Department / Faculty", type: "text", placeholder: "e.g. Computer Science, Faculty of Law" },
    { key: "edition", label: "Author & Edition", type: "text", placeholder: "e.g. Tanenbaum 5th Edition" },
    { key: "bookCondition", label: "Notes / Highlights", type: "select", options: ["Clean (no marks)", "Light pencil notes", "Highlighted pages", "Includes past questions"] },
  ],
  "Hostel & Furniture": [
    { key: "itemType", label: "Furniture Type", type: "select", options: ["Reading Desk & Chair", "Bed Frame / Bunk", "Mattress", "Wardrobe / Cupboard", "Fan / Standing Fan", "Gas Cylinder & Burner"] },
    { key: "deliveryHelp", label: "Hostel Pickup / Delivery", type: "select", options: ["Buyer picks up from hostel", "Seller can assist to hostel gate", "Campus transport required"] },
  ],
};

export const QUICK_FEATURE_PRESETS: Record<string, string[]> = {
  "Laptops & Computers": ["Good battery life", "Includes original charger", "Lightweight", "SSD upgraded", "Backlit keyboard", "Original box"],
  "Phones & Tablets": ["90%+ Battery health", "Screen protector attached", "Comes with case", "Fast charger included", "Face ID works perfectly"],
  "Fashion & Clothing": ["Brand new with tag", "Worn once (like new)", "Cotton blend", "Machine washable", "Vintage style"],
  "Books & Academics": ["Past questions included", "Current syllabus", "Summarized revision notes", "Clean unmarked pages"],
  "Hostel & Furniture": ["Disassembles easily", "Heavy duty metal", "Compact for room", "Well maintained"],
};

export const CAMPUS_LANDMARKS = [
  "University Main Library",
  "Senate Building Foyer",
  "Faculty of Science Complex",
  "Faculty of Engineering / Architecture",
  "Student Union (SUB) / Food Court Area",
  "Main Gate Security Post",
  "Student Hostels Common Area",
  "Gymnasium & Sports Complex",
  "Custom Agreed Public Spot",
];

const DEFAULT_SAMPLE_IMAGES: Record<string, string[]> = {
  "Laptops & Computers": [
    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80",
  ],
  "Phones & Tablets": [
    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop&q=80",
  ],
  "Fashion & Clothing": [
    "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80",
  ],
  "Books & Academics": [
    "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=80",
  ],
  "Hostel & Furniture": [
    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format&fit=crop&q=80",
  ],
};

const DRAFT_STORAGE_KEY = "ch_create_listing_draft_v1";

export function CreateListingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const storeIdParam = searchParams?.get("storeId") || null;
  const initialType = searchParams?.get("type") === "service" ? "service" : "product";

  const [currentStep, setCurrentStep] = useState<ListingStep>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null);
  const [showDraftToast, setShowDraftToast] = useState(false);
  const [customFeatureInput, setCustomFeatureInput] = useState("");
  const [showAddCustomFeature, setShowAddCustomFeature] = useState(false);
  const [publishedListingId, setPublishedListingId] = useState<string | null>(null);

  // Form State
  const [listingType, setListingType] = useState<"product" | "service">(initialType);
  const [title, setTitle] = useState(initialType === "service" ? "Graphic Design & Brand Identity" : "HP EliteBook 840 G5");
  const [category, setCategory] = useState(initialType === "service" ? "Services" : "Laptops & Computers");
  const [condition, setCondition] = useState("Used - Good");
  const [price, setPrice] = useState(initialType === "service" ? "5000" : "185000");
  const [availability, setAvailability] = useState("Available");
  const [isNegotiable, setIsNegotiable] = useState(true);

  // Service Details State
  const [servicePricingModel, setServicePricingModel] = useState<"fixed" | "hourly" | "negotiable" | "starting_at">("fixed");
  const [serviceDeliveryTime, setServiceDeliveryTime] = useState("24-48 hours");
  const [serviceLocationType, setServiceLocationType] = useState<"on_campus" | "remote" | "client_location" | "vendor_shop">("on_campus");

  // Step 2 State
  const [description, setDescription] = useState(
    "Reliable and powerful HP EliteBook 840 G5. Perfect for school, coding, and everyday campus use. Comes with original charger and tested battery."
  );
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([
    "Good battery life",
    "Includes original charger",
    "Lightweight",
  ]);
  const [specs, setSpecs] = useState<Record<string, string>>({
    brand: "HP",
    ram: "16 GB",
    storage: "512 GB SSD",
    processor: "Intel Core i5 8th Gen",
    batteryHealth: "Good (2-4 hrs)",
  });

  // Step 3 State: Images
  const [images, setImages] = useState<string[]>([
    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80",
  ]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 4 State: Location & Meetup
  const [campus, setCampus] = useState(user?.campus || "Main University Campus");
  const [campusBranch, setCampusBranch] = useState("Main Campus");
  const [landmark, setLandmark] = useState("University Main Library");
  const [meetupTiming, setMeetupTiming] = useState("Daylight public hours (10:00 AM – 5:00 PM)");
  const [meetupPreference, setMeetupPreference] = useState("In-person campus meetup (Recommended)");
  const [sellerNotes, setSellerNotes] = useState("Buyer can test the device thoroughly before making payment.");

  // Step 5 State: Terms
  const [confirmHonesty, setConfirmHonesty] = useState(true);
  const [confirmSafety, setConfirmSafety] = useState(true);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Restore Draft on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.title) setTitle(parsed.title);
        if (parsed.category) setCategory(parsed.category);
        if (parsed.condition) setCondition(parsed.condition);
        if (parsed.price) setPrice(parsed.price);
        if (parsed.availability) setAvailability(parsed.availability);
        if (parsed.description) setDescription(parsed.description);
        if (Array.isArray(parsed.selectedFeatures)) setSelectedFeatures(parsed.selectedFeatures);
        if (parsed.specs) setSpecs(parsed.specs);
        if (Array.isArray(parsed.images) && parsed.images.length > 0) setImages(parsed.images);
        if (parsed.landmark) setLandmark(parsed.landmark);
        if (parsed.campusBranch) setCampusBranch(parsed.campusBranch);
        if (parsed.meetupPreference) setMeetupPreference(parsed.meetupPreference);
        if (parsed.savedAt) setDraftSavedAt(parsed.savedAt);
      }
    } catch {
      // Ignore draft read errors
    }
  }, []);

  // Save Draft to LocalStorage
  const handleSaveDraft = (manual = true) => {
    const draftPayload = {
      title,
      category,
      condition,
      price,
      availability,
      description,
      selectedFeatures,
      specs,
      images,
      campus,
      campusBranch,
      landmark,
      meetupTiming,
      meetupPreference,
      sellerNotes,
      savedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftPayload));
      setDraftSavedAt(draftPayload.savedAt);
      if (manual) {
        setShowDraftToast(true);
        setTimeout(() => setShowDraftToast(false), 3000);
      }
    } catch {
      // Ignore
    }
  };

  // Change category: optionally populate sample images if user has none
  const handleCategoryChange = (newCat: string) => {
    setCategory(newCat);
    // Reset or adapt specs
    const newSpecsConfig = CATEGORY_SPECS[newCat] || [];
    const initialSpecs: Record<string, string> = {};
    newSpecsConfig.forEach((spec) => {
      initialSpecs[spec.key] = spec.options ? spec.options[0] : "";
    });
    setSpecs(initialSpecs);

    // If default demo images match previous category, swap to relevant demo images
    if (DEFAULT_SAMPLE_IMAGES[newCat]) {
      setImages(DEFAULT_SAMPLE_IMAGES[newCat]);
    }
  };

  const [isUploadingImages, setIsUploadingImages] = useState(false);

  // Image Upload handler
  const handleImageFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setIsUploadingImages(true);
      const res = await listingService.uploadImages(Array.from(files));
      if (res.success && res.urls?.length) {
        setImages((prev) => [...prev, ...res.urls].slice(0, 8));
      }
    } catch (uploadErr: any) {
      alert(uploadErr.message || "Failed to upload images. Please check file format and size.");
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

  // Feature tag toggle
  const toggleFeature = (feature: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(feature) ? prev.filter((f) => f !== feature) : [...prev, feature]
    );
  };

  const handleAddCustomFeature = () => {
    const trimmed = customFeatureInput.trim();
    if (trimmed && !selectedFeatures.includes(trimmed)) {
      setSelectedFeatures((prev) => [...prev, trimmed]);
      setCustomFeatureInput("");
      setShowAddCustomFeature(false);
    }
  };

  // Step Validation
  const validateCurrentStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!title.trim()) newErrors.title = "Please provide a clear listing title.";
      if (!price.trim() || isNaN(Number(price.replace(/,/g, ""))) || Number(price.replace(/,/g, "")) <= 0) {
        newErrors.price = "Please provide a valid price in Naira.";
      }
      if (!category) newErrors.category = "Please select a category.";
    } else if (currentStep === 2) {
      if (!description.trim() || description.length < 20) {
        newErrors.description = "Please share a brief description (at least 20 characters).";
      }
    } else if (currentStep === 3) {
      if (images.length === 0) {
        newErrors.images = "Please add at least one clear photo of your item.";
      }
    } else if (currentStep === 4) {
      if (!landmark) {
        newErrors.landmark = "Please select a campus landmark for meetup.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const goToNextStep = () => {
    if (validateCurrentStep()) {
      handleSaveDraft(false);
      setCurrentStep((prev) => Math.min(prev + 1, 5) as ListingStep);
      window.scrollTo({ top: 120, behavior: "smooth" });
    }
  };

  const goToPrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1) as ListingStep);
    window.scrollTo({ top: 120, behavior: "smooth" });
  };

  const handleBackToPrevious = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/stores?view=storefront");
    }
  };

  // Final Publish Handler
  const handlePublishListing = async () => {
    if (!confirmHonesty || !confirmSafety) {
      setErrors({ terms: "Please acknowledge the campus honesty and safety guidelines." });
      return;
    }

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
          ? {
              pricingModel: servicePricingModel,
              deliveryTime: serviceDeliveryTime,
              serviceLocationType,
            }
          : undefined,
      storeId: storeIdParam || undefined,
      status: availability,
      description,
      images,
      imageUrl: images[0] || "/placeholder.png",
      landmark,
      campus: `${campusBranch} · ${campus}`,
      location: `${landmark}, ${campusBranch}`,
      specs,
      features: selectedFeatures,
      sellerName: user?.name || "Campus Student",
      sellerHandle: user?.handle || "me",
      sellerType: user?.isStudent ? "student_seller" : "approved_business",
      isStudentSeller: true,
      isVerified: true,
      createdAt: new Date().toISOString(),
    };

    try {
      // 1. Save locally for instantaneous offline resolution in the app
      const existingStored = localStorage.getItem("ch_user_created_listings");
      const listArray = existingStored ? JSON.parse(existingStored) : [];
      listArray.unshift(newListingData);
      localStorage.setItem("ch_user_created_listings", JSON.stringify(listArray));

      // 2. Clear draft
      localStorage.removeItem(DRAFT_STORAGE_KEY);

      // 3. Post to real backend API endpoint
      try {
        const res = await fetch("/api/listings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
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
            specs: newListingData.specs,
          }),
        });
        const result = await res.json();
        if (result.success && result.data?._id) {
          newListingData.id = result.data._id;
          newListingData._id = result.data._id;
        }
      } catch {
        // Backend offline, local cache is already set
      }

      setPublishedListingId(newListingData.id);
    } catch {
      setErrors({ submit: "Failed to publish listing. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Numeric price formatter
  const formattedPriceNumber = Number(price.replace(/,/g, "") || 0).toLocaleString();

  // Active specs list for current category
  const activeSpecsConfig = CATEGORY_SPECS[category] || [];
  const quickFeatures = QUICK_FEATURE_PRESETS[category] || [
    "Tested & Working",
    "Clean condition",
    "Fast meetup",
    "Price negotiable",
  ];

  // --------------------------------------------------------------------------
  // SUCCESS VIEW: Shown when listing is published
  // --------------------------------------------------------------------------
  if (publishedListingId) {
    return (
      <div
        style={{ fontFamily: "var(--font-plus-jakarta), sans-serif" }}
        className="min-h-screen flex flex-col bg-[#F7F8FA] dark:bg-[#0E1015] text-[#171717] dark:text-white antialiased"
      >
        <RebrandHeader />

        <main className="flex-1 max-w-[840px] w-full mx-auto px-5 sm:px-8 py-12 sm:py-16 flex items-center justify-center">
          <div className="radius-native w-full bg-white dark:bg-[#14161D] rounded-2xl border border-[#ECEEF2] dark:border-white/10 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-7 sm:p-10 text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
            {/* Success Icon */}
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
                Students and verified members on your campus can now discover{" "}
                <strong className="text-[#171717] dark:text-white font-semibold">"{title}"</strong> and message you directly.
              </p>
            </div>

            {/* Quick Preview Card */}
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
                  {category} · {condition}
                </div>
                <h4 className="text-[14px] font-bold text-[#171717] dark:text-white truncate">
                  {title}
                </h4>
                <div className="text-[15px] font-extrabold text-[#171717] dark:text-white mt-0.5">
                  ₦{formattedPriceNumber}
                </div>
              </div>
            </div>

            {/* 3 Explicit Post-Publish Actions from user requirements */}
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
                Back to marketplace
              </Link>
            </div>
          </div>
        </main>

        <RebrandFooter />
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // MAIN CREATION VIEW
  // --------------------------------------------------------------------------
  return (
    <div
      style={{ fontFamily: "var(--font-plus-jakarta), sans-serif" }}
      className="min-h-screen flex flex-col bg-[#F7F8FA] dark:bg-[#0E1015] text-[#171717] dark:text-white antialiased"
    >
      <RebrandHeader />

      {/* Toast message for draft saving */}
      {showDraftToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#171717] text-white px-4 py-2.5 rounded-xl shadow-lg text-xs font-semibold flex items-center gap-2 border border-white/10 animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-[#FFC928] shrink-0" />
          <span>Draft saved successfully ({draftSavedAt})</span>
        </div>
      )}

      <main className="flex-1 w-full max-w-[1380px] mx-auto px-4 sm:px-8 lg:px-12 py-6 sm:py-8">
        {/* Top Breadcrumb & Action Row */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleBackToPrevious}
              className="radius-native inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-[#14161D] text-[12.5px] font-bold text-[#5B636E] dark:text-neutral-400 hover:text-[#171717] dark:hover:text-white hover:border-[#171717] dark:hover:border-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 stroke-[2.2]" />
              <span>Back</span>
            </button>
            <span className="hidden sm:inline text-xs font-bold text-[#9AA1AC]">·</span>
            <span className="hidden sm:inline text-xs font-semibold text-[#68707A] dark:text-neutral-400">
              Campus Seller Hub
            </span>
          </div>

          <div className="flex items-center gap-3">
            {draftSavedAt && (
              <span className="hidden sm:inline-flex items-center gap-1.5 text-[11.5px] font-medium text-[#8C929C] dark:text-neutral-400">
                <Save className="w-3 h-3" />
                <span>Draft saved at {draftSavedAt}</span>
              </span>
            )}
            <button
              type="button"
              onClick={() => handleSaveDraft(true)}
              className="radius-native px-3 py-1.5 rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-[#14161D] text-[12px] font-bold text-[#171717] dark:text-white hover:border-[#FFC928] transition-colors cursor-pointer"
            >
              Save draft
            </button>
          </div>
        </div>

        {/* 3-COLUMN WORKSPACE: Stepper | Single Step Form | Live Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr_360px] xl:grid-cols-[240px_1fr_380px] gap-6 lg:gap-8 items-start">
          
          {/* =============================================================== */}
          {/* COLUMN 1: 5-STEP VERTICAL STEPPER                                */}
          {/* =============================================================== */}
          <aside className="radius-native bg-white dark:bg-[#14161D] rounded-2xl border border-[#ECEEF2] dark:border-white/10 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <h2 className="text-[17px] font-extrabold text-[#171717] dark:text-white tracking-[-0.02em] mb-4">
              Create Listing
            </h2>

            <nav className="space-y-3" aria-label="Listing creation progress">
              {(
                [
                  { step: 1, title: "Basic details", desc: "Title, category, price" },
                  { step: 2, title: "Description", desc: "Details & specifications" },
                  { step: 3, title: "Photos", desc: "Add clear images" },
                  { step: 4, title: "Location & meetup", desc: "Where and how to meet" },
                  { step: 5, title: "Review & publish", desc: "Check your listing" },
                ] as const
              ).map((item) => {
                const isActive = currentStep === item.step;
                const isCompleted = currentStep > item.step;

                return (
                  <button
                    key={item.step}
                    type="button"
                    onClick={() => {
                      // Allow going back to any step or forward if validated
                      if (item.step < currentStep || validateCurrentStep()) {
                        setCurrentStep(item.step as ListingStep);
                      }
                    }}
                    className={`w-full text-left flex items-start gap-3 p-2.5 rounded-xl transition-all cursor-pointer ${
                      isActive
                        ? "bg-[#FFC928]/15 dark:bg-[#FFC928]/20 border border-[#FFC928]/40 shadow-xs"
                        : "hover:bg-[#F2F4F8] dark:hover:bg-white/5 border border-transparent"
                    }`}
                  >
                    {/* Step Number or Check */}
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-extrabold shrink-0 mt-0.5 transition-colors ${
                        isActive
                          ? "bg-[#FFC928] text-[#171717]"
                          : isCompleted
                          ? "bg-emerald-500 text-white"
                          : "bg-[#E5E8EE] dark:bg-white/10 text-[#68707A] dark:text-neutral-400"
                      }`}
                    >
                      {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : item.step}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div
                        className={`text-[13px] leading-tight ${
                          isActive
                            ? "font-extrabold text-[#171717] dark:text-white"
                            : isCompleted
                            ? "font-bold text-[#171717] dark:text-white"
                            : "font-semibold text-[#7A818C] dark:text-neutral-400"
                        }`}
                      >
                        {item.title}
                      </div>
                      <div className="text-[11px] text-[#8C929C] dark:text-neutral-500 mt-0.5 truncate">
                        {item.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </nav>

            <div className="mt-6 pt-4 border-t border-[#ECEEF2] dark:border-white/10">
              <div className="flex items-center justify-between text-[11px] font-bold text-[#68707A] dark:text-neutral-400 mb-1.5">
                <span>Progress</span>
                <span>{currentStep} of 5</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[#E5E8EE] dark:bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-[#FFC928] rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / 5) * 100}%` }}
                />
              </div>
            </div>
          </aside>

          {/* =============================================================== */}
          {/* COLUMN 2: ACTIVE STEP FORM (ONLY CURRENT STEP DISPLAYED)        */}
          {/* =============================================================== */}
          <section className="radius-native bg-white dark:bg-[#14161D] rounded-2xl border border-[#ECEEF2] dark:border-white/10 p-6 sm:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.02)] min-h-[560px] flex flex-col justify-between">
            <div>
              {/* STEP 1: BASIC DETAILS */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div>
                    <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#D97706] dark:text-[#FFC928] uppercase tracking-wider mb-1">
                      Step 1 of 5
                    </div>
                    <h3 className="text-[20px] sm:text-[22px] font-extrabold text-[#171717] dark:text-white tracking-[-0.02em]">
                      Basic details
                    </h3>
                    <p className="text-[12.5px] text-[#68707A] dark:text-neutral-400 mt-0.5">
                      Tell buyers what you're offering. Keep it clear, accurate, and honest.
                    </p>
                    <div className="h-[1px] bg-[#ECEEF2] dark:bg-white/10 mt-3.5" />
                  </div>

                  <div className="space-y-4">
                    {/* Storefront Context Banner if storeIdParam is provided */}
                    {storeIdParam && (
                      <div className="radius-native bg-[#FFF8E6] dark:bg-amber-950/20 border border-[#FFE182] dark:border-amber-800/40 rounded-xl p-3 flex items-center gap-2.5 text-[12.5px] font-semibold text-[#7A4F01] dark:text-amber-200">
                        <BadgeCheck className="w-4 h-4 text-[#D97706] shrink-0" />
                        <span>
                          Storefront Item — This listing will be automatically published under your campus store catalog.
                        </span>
                      </div>
                    )}

                    {/* Listing Type Toggle: Product vs Service */}
                    <div>
                      <label className="block text-[13px] font-bold text-[#3F454D] dark:text-neutral-200 mb-1.5">
                        Listing Type
                      </label>
                      <div className="grid grid-cols-2 gap-2.5">
                        <button
                          type="button"
                          onClick={() => {
                            setListingType("product");
                            if (category === "Services") setCategory("Laptops & Computers");
                          }}
                          className={`radius-native p-2.5 rounded-xl border text-[13px] font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                            listingType === "product"
                              ? "bg-[#171717] dark:bg-white text-white dark:text-[#171717] border-[#171717] dark:border-white shadow-xs"
                              : "bg-[#F7F8FA] dark:bg-white/5 border-[#ECEEF2] dark:border-white/10 text-[#68707A] dark:text-neutral-300 hover:border-[#171717]"
                          }`}
                        >
                          <Package className="w-4 h-4" />
                          <span>Product / Physical item</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setListingType("service");
                            setCategory("Services");
                          }}
                          className={`radius-native p-2.5 rounded-xl border text-[13px] font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                            listingType === "service"
                              ? "bg-[#171717] dark:bg-white text-white dark:text-[#171717] border-[#171717] dark:border-white shadow-xs"
                              : "bg-[#F7F8FA] dark:bg-white/5 border-[#ECEEF2] dark:border-white/10 text-[#68707A] dark:text-neutral-300 hover:border-[#171717]"
                          }`}
                        >
                          <Briefcase className="w-4 h-4" />
                          <span>Campus Service / Skill</span>
                        </button>
                      </div>
                    </div>

                    {/* Listing Title */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label
                          htmlFor="listingTitle"
                          className="text-[13px] font-bold text-[#3F454D] dark:text-neutral-200"
                        >
                          {listingType === "service" ? "Service title" : "Listing title"} <span className="text-rose-500">*</span>
                        </label>
                        <span className="text-[11px] text-[#8C929C] font-medium">
                          {title.length}/100
                        </span>
                      </div>
                      <input
                        id="listingTitle"
                        type="text"
                        maxLength={100}
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder={
                          listingType === "service"
                            ? "e.g. Graphic Design (Flyers & Branding) or Laptop Repair & SSD Upgrade"
                            : "e.g. HP EliteBook 840 G5 (16GB RAM, 512GB SSD)"
                        }
                        className={`radius-native w-full rounded-xl border ${
                          errors.title
                            ? "border-rose-500 focus:ring-rose-500/20"
                            : "border-[#DCE0E6] dark:border-white/15 focus:border-[#FFC928] focus:ring-[#FFC928]/25"
                        } bg-white dark:bg-[#181B24] px-3.5 py-2.5 text-[13.5px] text-[#171717] dark:text-white placeholder-[#8C929C] focus:outline-none focus:ring-2 transition-all shadow-xs`}
                      />
                      {errors.title && (
                        <p className="text-rose-500 text-[12px] font-semibold mt-1">
                          {errors.title}
                        </p>
                      )}
                    </div>

                    {/* Category & Condition/Service Option in 2 columns */}
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
                          onChange={(e) => handleCategoryChange(e.target.value)}
                          className="radius-native w-full rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-[#181B24] px-3.5 py-2.5 text-[13.5px] text-[#171717] dark:text-white focus:outline-none focus:border-[#FFC928] focus:ring-2 focus:ring-[#FFC928]/25 transition-all shadow-xs cursor-pointer"
                        >
                          {listingType === "service" ? (
                            <>
                              <option value="Services">Services (All)</option>
                              <option value="Design & Printing">Design & Printing</option>
                              <option value="Tech & Repairs">Tech & Repairs</option>
                              <option value="Hair & Beauty">Hair & Beauty</option>
                              <option value="Academic Tutoring & Writing">Academic Tutoring & Writing</option>
                              <option value="Photography & Video">Photography & Video</option>
                              <option value="Cleaning & Errand">Cleaning & Errand</option>
                            </>
                          ) : (
                            <>
                              <option value="Laptops & Computers">Laptops & Computers</option>
                              <option value="Phones & Tablets">Phones & Tablets</option>
                              <option value="Fashion & Clothing">Fashion & Clothing</option>
                              <option value="Books & Academics">Books & Academics</option>
                              <option value="Hostel & Furniture">Hostel & Furniture</option>
                              <option value="Electronics & Audio">Electronics & Audio</option>
                            </>
                          )}
                        </select>
                      </div>

                      {listingType === "service" ? (
                        <div>
                          <label
                            htmlFor="pricingModel"
                            className="block text-[13px] font-bold text-[#3F454D] dark:text-neutral-200 mb-1.5"
                          >
                            Pricing Model <span className="text-rose-500">*</span>
                          </label>
                          <select
                            id="pricingModel"
                            value={servicePricingModel}
                            onChange={(e) => setServicePricingModel(e.target.value as any)}
                            className="radius-native w-full rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-[#181B24] px-3.5 py-2.5 text-[13.5px] text-[#171717] dark:text-white focus:outline-none focus:border-[#FFC928] focus:ring-2 focus:ring-[#FFC928]/25 transition-all shadow-xs cursor-pointer"
                          >
                            <option value="fixed">Fixed Price (Per project/job)</option>
                            <option value="starting_at">Starting at (From ₦...)</option>
                            <option value="hourly">Hourly Rate (₦ / hr)</option>
                            <option value="negotiable">Custom Quote / Negotiable</option>
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
                            className="radius-native w-full rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-[#181B24] px-3.5 py-2.5 text-[13.5px] text-[#171717] dark:text-white focus:outline-none focus:border-[#FFC928] focus:ring-2 focus:ring-[#FFC928]/25 transition-all shadow-xs cursor-pointer"
                          >
                            <option value="Brand New">Brand New (Sealed / Unopened)</option>
                            <option value="Like New">Like New (Barely used)</option>
                            <option value="Used - Good">Used - Good (Normal cosmetic wear)</option>
                            <option value="Used - Fair">Used - Fair (Functional with wear)</option>
                          </select>
                        </div>
                      )}
                    </div>

                    {/* Extra Service Details Row if listingType === service */}
                    {listingType === "service" && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[13px] font-bold text-[#3F454D] dark:text-neutral-200 mb-1.5">
                            Estimated Turnaround Time
                          </label>
                          <select
                            value={serviceDeliveryTime}
                            onChange={(e) => setServiceDeliveryTime(e.target.value)}
                            className="radius-native w-full rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-[#181B24] px-3.5 py-2.5 text-[13.5px] text-[#171717] dark:text-white focus:outline-none focus:border-[#FFC928] cursor-pointer"
                          >
                            <option value="Same day">Same day (Within hours)</option>
                            <option value="24-48 hours">24–48 hours</option>
                            <option value="3-5 days">3–5 business days</option>
                            <option value="1 week+">1 week or custom</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[13px] font-bold text-[#3F454D] dark:text-neutral-200 mb-1.5">
                            Service Location
                          </label>
                          <select
                            value={serviceLocationType}
                            onChange={(e) => setServiceLocationType(e.target.value as any)}
                            className="radius-native w-full rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-[#181B24] px-3.5 py-2.5 text-[13.5px] text-[#171717] dark:text-white focus:outline-none focus:border-[#FFC928] cursor-pointer"
                          >
                            <option value="on_campus">On campus (Hall, Library, Faculty)</option>
                            <option value="remote">Remote / Online / Digital</option>
                            <option value="client_location">Client location (Hostel/Office)</option>
                            <option value="vendor_shop">My Workshop / Studio</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {/* Price & Availability in 2 columns */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="listingPrice"
                          className="block text-[13px] font-bold text-[#3F454D] dark:text-neutral-200 mb-1.5"
                        >
                          Price (NGN) <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-[14px] text-[#8C929C]">
                            ₦
                          </span>
                          <input
                            id="listingPrice"
                            type="text"
                            value={price}
                            onChange={(e) => {
                              const val = e.target.value.replace(/[^0-9]/g, "");
                              setPrice(val);
                            }}
                            placeholder="185,000"
                            className={`radius-native w-full rounded-xl border ${
                              errors.price
                                ? "border-rose-500 focus:ring-rose-500/20"
                                : "border-[#DCE0E6] dark:border-white/15 focus:border-[#FFC928] focus:ring-[#FFC928]/25"
                            } bg-white dark:bg-[#181B24] pl-8 pr-3.5 py-2.5 text-[14px] font-bold text-[#171717] dark:text-white placeholder-[#8C929C] focus:outline-none focus:ring-2 transition-all shadow-xs`}
                          />
                        </div>
                        {errors.price && (
                          <p className="text-rose-500 text-[12px] font-semibold mt-1">
                            {errors.price}
                          </p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="listingAvailability"
                          className="block text-[13px] font-bold text-[#3F454D] dark:text-neutral-200 mb-1.5"
                        >
                          Availability
                        </label>
                        <select
                          id="listingAvailability"
                          value={availability}
                          onChange={(e) => setAvailability(e.target.value)}
                          className="radius-native w-full rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-[#181B24] px-3.5 py-2.5 text-[13.5px] text-[#171717] dark:text-white focus:outline-none focus:border-[#FFC928] focus:ring-2 focus:ring-[#FFC928]/25 transition-all shadow-xs cursor-pointer"
                        >
                          <option value="Available">Available for instant sale</option>
                          <option value="In deal">In deal / negotiation</option>
                          <option value="Pre-order">Pre-order / Made to order</option>
                        </select>
                      </div>
                    </div>

                    {/* Pricing Tip Banner from wireframe */}
                    <div className="radius-native p-3.5 rounded-xl bg-[#FFF8E6] dark:bg-amber-950/20 border border-[#FFE182] dark:border-amber-800/40 flex items-start gap-3">
                      <Lightbulb className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
                      <div className="flex-1 text-[12.5px] text-[#7A4F01] dark:text-amber-200 leading-snug">
                        <span className="font-bold">Pricing tip: </span>
                        Check similar items around campus to set a competitive price for a faster deal.
                      </div>
                      <Link
                        href={`/explore?category=${encodeURIComponent(category)}`}
                        target="_blank"
                        className="text-[12px] font-bold text-[#D97706] hover:underline shrink-0"
                      >
                        View similar →
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: DESCRIPTION & CATEGORY-AWARE SPECS */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div>
                    <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#D97706] dark:text-[#FFC928] uppercase tracking-wider mb-1">
                      Step 2 of 5
                    </div>
                    <h3 className="text-[20px] sm:text-[22px] font-extrabold text-[#171717] dark:text-white tracking-[-0.02em]">
                      Description & Details
                    </h3>
                    <p className="text-[12.5px] text-[#68707A] dark:text-neutral-400 mt-0.5">
                      Share key details, condition, and specs. Clear listings sell 3x faster.
                    </p>
                    <div className="h-[1px] bg-[#ECEEF2] dark:bg-white/10 mt-3.5" />
                  </div>

                  <div className="space-y-4">
                    {/* Main Description */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label
                          htmlFor="listingDesc"
                          className="text-[13px] font-bold text-[#3F454D] dark:text-neutral-200"
                        >
                          Details & Overview <span className="text-rose-500">*</span>
                        </label>
                        <span className="text-[11px] text-[#8C929C] font-medium">
                          {description.length}/1000
                        </span>
                      </div>
                      <textarea
                        id="listingDesc"
                        rows={4}
                        maxLength={1000}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="e.g. Specifications, condition, included accessories, reason for selling..."
                        className={`radius-native w-full rounded-xl border ${
                          errors.description
                            ? "border-rose-500 focus:ring-rose-500/20"
                            : "border-[#DCE0E6] dark:border-white/15 focus:border-[#FFC928] focus:ring-[#FFC928]/25"
                        } bg-white dark:bg-[#181B24] px-3.5 py-2.5 text-[13.5px] text-[#171717] dark:text-white placeholder-[#8C929C] focus:outline-none focus:ring-2 transition-all shadow-xs resize-y`}
                      />
                      {errors.description && (
                        <p className="text-rose-500 text-[12px] font-semibold mt-1">
                          {errors.description}
                        </p>
                      )}
                    </div>

                    {/* Quick Features Chips (from wireframe) */}
                    <div>
                      <label className="block text-[12.5px] font-bold text-[#68707A] dark:text-neutral-400 mb-2">
                        Key features (optional)
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {quickFeatures.map((feat) => {
                          const isSel = selectedFeatures.includes(feat);
                          return (
                            <button
                              key={feat}
                              type="button"
                              onClick={() => toggleFeature(feat)}
                              className={`radius-native px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all cursor-pointer ${
                                isSel
                                  ? "bg-[#171717] text-white dark:bg-white dark:text-[#171717] shadow-xs"
                                  : "bg-[#F2F4F8] dark:bg-white/5 border border-[#ECEEF2] dark:border-white/10 text-[#5B636E] dark:text-neutral-300 hover:border-[#171717] dark:hover:border-white"
                              }`}
                            >
                              {isSel ? "✓ " : "+ "}
                              {feat}
                            </button>
                          );
                        })}

                        {/* Add custom feature chip */}
                        {showAddCustomFeature ? (
                          <div className="inline-flex items-center gap-1.5">
                            <input
                              type="text"
                              value={customFeatureInput}
                              onChange={(e) => setCustomFeatureInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handleAddCustomFeature();
                                }
                              }}
                              placeholder="Feature name..."
                              className="radius-native w-32 px-2.5 py-1 text-[12px] rounded-lg border border-[#DCE0E6] dark:border-white/20 bg-white dark:bg-[#181B24] focus:outline-none focus:border-[#FFC928]"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={handleAddCustomFeature}
                              className="px-2 py-1 bg-[#FFC928] text-[#171717] rounded-lg text-[11px] font-bold"
                            >
                              Add
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowAddCustomFeature(false)}
                              className="text-[#8C929C] hover:text-[#171717]"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setShowAddCustomFeature(true)}
                            className="radius-native px-3 py-1.5 rounded-lg text-[12px] font-bold border border-dashed border-[#DCE0E6] dark:border-white/20 text-[#68707A] dark:text-neutral-400 hover:border-[#FFC928] hover:text-[#FFC928] transition-colors"
                          >
                            + Add custom
                          </button>
                        )}
                      </div>
                    </div>

                    {/* CATEGORY-AWARE SPECIFICATIONS SUB-GRID */}
                    {activeSpecsConfig.length > 0 && (
                      <div className="pt-2">
                        <div className="flex items-center gap-2 mb-3">
                          <h4 className="text-[14px] font-extrabold text-[#171717] dark:text-white tracking-[-0.01em]">
                            {category} Specifications
                          </h4>
                          <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#8C929C] bg-[#F2F4F8] dark:bg-white/5 px-2 py-0.5 rounded-md">
                            Category-specific
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          {activeSpecsConfig.map((item) => (
                            <div key={item.key}>
                              <label
                                htmlFor={`spec-${item.key}`}
                                className="block text-[12px] font-bold text-[#68707A] dark:text-neutral-400 mb-1"
                              >
                                {item.label}
                              </label>

                              {item.type === "select" && item.options ? (
                                <select
                                  id={`spec-${item.key}`}
                                  value={specs[item.key] || item.options[0]}
                                  onChange={(e) =>
                                    setSpecs({ ...specs, [item.key]: e.target.value })
                                  }
                                  className="radius-native w-full rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-[#181B24] px-3 py-2 text-[13px] text-[#171717] dark:text-white focus:outline-none focus:border-[#FFC928] transition-colors cursor-pointer"
                                >
                                  {item.options.map((opt) => (
                                    <option key={opt} value={opt}>
                                      {opt}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <input
                                  id={`spec-${item.key}`}
                                  type="text"
                                  value={specs[item.key] || ""}
                                  onChange={(e) =>
                                    setSpecs({ ...specs, [item.key]: e.target.value })
                                  }
                                  placeholder={item.placeholder || `Enter ${item.label.toLowerCase()}`}
                                  className="radius-native w-full rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-[#181B24] px-3 py-2 text-[13px] text-[#171717] dark:text-white placeholder-[#8C929C] focus:outline-none focus:border-[#FFC928] transition-colors"
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 3: PHOTOS */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div>
                    <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#D97706] dark:text-[#FFC928] uppercase tracking-wider mb-1">
                      Step 3 of 5
                    </div>
                    <h3 className="text-[20px] sm:text-[22px] font-extrabold text-[#171717] dark:text-white tracking-[-0.02em]">
                      Item Photos
                    </h3>
                    <p className="text-[12.5px] text-[#68707A] dark:text-neutral-400 mt-0.5">
                      Add clear photos from multiple angles. First image will be used as the primary cover.
                    </p>
                    <div className="h-[1px] bg-[#ECEEF2] dark:bg-white/10 mt-3.5" />
                  </div>

                  <div className="space-y-4">
                    {/* Drag and Drop Upload Area from wireframe */}
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="radius-native border-2 border-dashed border-[#DCE0E6] dark:border-white/20 hover:border-[#FFC928] dark:hover:border-[#FFC928] rounded-2xl p-6 sm:p-8 text-center bg-[#F7F8FA] dark:bg-white/5 transition-all cursor-pointer group"
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageFiles}
                        className="hidden"
                      />
                      {isUploadingImages ? (
                        <div className="flex flex-col items-center justify-center py-2">
                          <Loader2 className="w-8 h-8 animate-spin text-[#D97706] dark:text-[#FFC928] mb-2" />
                          <p className="text-[13.5px] font-bold text-[#171717] dark:text-white">
                            Uploading photos securely to cloud storage...
                          </p>
                        </div>
                      ) : (
                        <>
                          <div className="w-12 h-12 rounded-full bg-white dark:bg-[#181B24] border border-[#ECEEF2] dark:border-white/10 flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform">
                            <Upload className="w-5 h-5 text-[#8C929C] group-hover:text-[#FFC928] transition-colors" />
                          </div>
                          <div className="text-[13.5px] font-bold text-[#171717] dark:text-white">
                            Drag and drop images here, or{" "}
                            <span className="text-[#D97706] dark:text-[#FFC928] underline">
                              click to upload
                            </span>
                          </div>
                          <p className="text-[11.5px] text-[#8C929C] mt-1">
                            JPG, PNG or WEBP · Max 8 images · Up to 10MB each
                          </p>
                        </>
                      )}
                    </div>

                    {errors.images && (
                      <p className="text-rose-500 text-[12px] font-semibold">
                        {errors.images}
                      </p>
                    )}

                    {/* Image Thumbnails Grid */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[12.5px] font-bold text-[#3F454D] dark:text-neutral-200">
                          Uploaded Photos ({images.length}/8)
                        </span>
                        <span className="text-[11px] text-[#8C929C]">
                          Click photo to set as primary cover
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {images.map((imgUrl, idx) => (
                          <div
                            key={idx}
                            onClick={() => handleSetPrimaryImage(idx)}
                            className={`radius-native group relative aspect-square rounded-xl overflow-hidden border ${
                              idx === 0
                                ? "border-[#FFC928] ring-2 ring-[#FFC928]/30"
                                : "border-[#ECEEF2] dark:border-white/10"
                            } bg-neutral-100 dark:bg-neutral-800 cursor-pointer`}
                          >
                            <img
                              src={imgUrl}
                              alt={`Item photo ${idx + 1}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />

                            {/* Badge for cover */}
                            {idx === 0 && (
                              <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded text-[10px] font-extrabold bg-[#FFC928] text-[#171717] shadow-xs">
                                Cover
                              </div>
                            )}

                            {/* Delete button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveImage(idx);
                              }}
                              className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 hover:bg-rose-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Remove image"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}

                        {/* Add More Slot */}
                        {images.length < 8 && (
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="radius-native aspect-square rounded-xl border-2 border-dashed border-[#DCE0E6] dark:border-white/20 hover:border-[#FFC928] dark:hover:border-[#FFC928] flex flex-col items-center justify-center text-[#8C929C] hover:text-[#FFC928] transition-colors cursor-pointer bg-white dark:bg-[#181B24]"
                          >
                            <Plus className="w-6 h-6 stroke-[2]" />
                            <span className="text-[11px] font-bold mt-1">Add photo</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: LOCATION & MEETUP */}
              {currentStep === 4 && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div>
                    <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#D97706] dark:text-[#FFC928] uppercase tracking-wider mb-1">
                      Step 4 of 5
                    </div>
                    <h3 className="text-[20px] sm:text-[22px] font-extrabold text-[#171717] dark:text-white tracking-[-0.02em]">
                      Location & Campus Meetup
                    </h3>
                    <p className="text-[12.5px] text-[#68707A] dark:text-neutral-400 mt-0.5">
                      Select public campus landmarks where you prefer to meet with buyers.
                    </p>
                    <div className="h-[1px] bg-[#ECEEF2] dark:bg-white/10 mt-3.5" />
                  </div>

                  <div className="space-y-4">
                    {/* University & Campus selection */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[13px] font-bold text-[#3F454D] dark:text-neutral-200 mb-1.5">
                          University / Campus
                        </label>
                        <input
                          type="text"
                          value={campus}
                          onChange={(e) => setCampus(e.target.value)}
                          placeholder="e.g. Your University Name"
                          className="radius-native w-full rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-[#181B24] px-3.5 py-2.5 text-[13.5px] text-[#171717] dark:text-white focus:outline-none focus:border-[#FFC928] transition-colors"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="campusBranchSelect"
                          className="block text-[13px] font-bold text-[#3F454D] dark:text-neutral-200 mb-1.5"
                        >
                          Campus Area
                        </label>
                        <select
                          id="campusBranchSelect"
                          value={campusBranch}
                          onChange={(e) => setCampusBranch(e.target.value)}
                          className="radius-native w-full rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-[#181B24] px-3.5 py-2.5 text-[13.5px] text-[#171717] dark:text-white focus:outline-none focus:border-[#FFC928] transition-colors cursor-pointer"
                        >
                          <option value="Main Campus">Main Campus</option>
                          <option value="Annex / Second Campus">Annex / Second Campus</option>
                          <option value="Student Hostels Area">Student Hostels Area</option>
                          <option value="Off-Campus">Off-Campus</option>
                        </select>
                      </div>
                    </div>

                    {/* Landmark Selection (Campus-first meetup) */}
                    <div>
                      <label
                        htmlFor="landmarkSelect"
                        className="block text-[13px] font-bold text-[#3F454D] dark:text-neutral-200 mb-1.5"
                      >
                        Preferred Meetup Landmark <span className="text-rose-500">*</span>
                      </label>
                      <select
                        id="landmarkSelect"
                        value={landmark}
                        onChange={(e) => setLandmark(e.target.value)}
                        className="radius-native w-full rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-[#181B24] px-3.5 py-2.5 text-[13.5px] text-[#171717] dark:text-white focus:outline-none focus:border-[#FFC928] focus:ring-2 focus:ring-[#FFC928]/25 transition-all shadow-xs cursor-pointer"
                      >
                        {CAMPUS_LANDMARKS.map((lm) => (
                          <option key={lm} value={lm}>
                            📍 {lm}
                          </option>
                        ))}
                      </select>
                      {errors.landmark && (
                        <p className="text-rose-500 text-[12px] font-semibold mt-1">
                          {errors.landmark}
                        </p>
                      )}
                    </div>

                    {/* Meetup Preferred Timing */}
                    <div>
                      <label
                        htmlFor="timingSelect"
                        className="block text-[13px] font-bold text-[#3F454D] dark:text-neutral-200 mb-1.5"
                      >
                        Meetup Hours & Schedule
                      </label>
                      <select
                        id="timingSelect"
                        value={meetupTiming}
                        onChange={(e) => setMeetupTiming(e.target.value)}
                        className="radius-native w-full rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-[#181B24] px-3.5 py-2.5 text-[13.5px] text-[#171717] dark:text-white focus:outline-none focus:border-[#FFC928] transition-colors cursor-pointer"
                      >
                        <option value="Daylight public hours (10:00 AM – 5:00 PM)">
                          Daylight public hours (10:00 AM – 5:00 PM)
                        </option>
                        <option value="Afternoon after classes (2:00 PM – 6:00 PM)">
                          Afternoon after classes (2:00 PM – 6:00 PM)
                        </option>
                        <option value="Weekends (Saturday & Sunday)">
                          Weekends (Saturday & Sunday)
                        </option>
                        <option value="Flexible / Coordinate in chat">
                          Flexible / Coordinate in chat
                        </option>
                      </select>
                    </div>

                    {/* Seller Meetup Note */}
                    <div>
                      <label
                        htmlFor="sellerNotes"
                        className="block text-[13px] font-bold text-[#3F454D] dark:text-neutral-200 mb-1.5"
                      >
                        Meetup instructions for buyer (optional)
                      </label>
                      <input
                        id="sellerNotes"
                        type="text"
                        value={sellerNotes}
                        onChange={(e) => setSellerNotes(e.target.value)}
                        placeholder="e.g. Bring your charger / Buyer can test thoroughly before payment"
                        className="radius-native w-full rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-[#181B24] px-3.5 py-2.5 text-[13.5px] text-[#171717] dark:text-white placeholder-[#8C929C] focus:outline-none focus:border-[#FFC928] transition-colors shadow-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5: REVIEW & PUBLISH */}
              {currentStep === 5 && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div>
                    <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#D97706] dark:text-[#FFC928] uppercase tracking-wider mb-1">
                      Step 5 of 5
                    </div>
                    <h3 className="text-[20px] sm:text-[22px] font-extrabold text-[#171717] dark:text-white tracking-[-0.02em]">
                      Review & Publish
                    </h3>
                    <p className="text-[12.5px] text-[#68707A] dark:text-neutral-400 mt-0.5">
                      Verify your listing details before publishing to the campus marketplace.
                    </p>
                    <div className="h-[1px] bg-[#ECEEF2] dark:bg-white/10 mt-3.5" />
                  </div>

                  <div className="space-y-4">
                    {/* Summary Overview Box */}
                    <div className="radius-native bg-[#F7F8FA] dark:bg-[#181B24] border border-[#ECEEF2] dark:border-white/10 rounded-xl p-4 sm:p-5 space-y-3.5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-[11.5px] font-bold text-[#8C929C] uppercase tracking-wider">
                            {category} · {condition}
                          </div>
                          <h4 className="text-[16px] font-extrabold text-[#171717] dark:text-white mt-0.5">
                            {title}
                          </h4>
                        </div>
                        <div className="text-[18px] font-black text-[#171717] dark:text-[#FFC928]">
                          ₦{formattedPriceNumber}
                        </div>
                      </div>

                      <p className="text-[13px] text-[#4A5058] dark:text-neutral-300 leading-relaxed">
                        {description}
                      </p>

                      {/* Specs Row */}
                      {Object.keys(specs).length > 0 && (
                        <div className="pt-2 border-t border-[#ECEEF2] dark:border-white/10 grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {Object.entries(specs).map(
                            ([k, v]) =>
                              v && (
                                <div key={k} className="text-[11.5px]">
                                  <span className="text-[#8C929C] capitalize">{k}: </span>
                                  <strong className="text-[#171717] dark:text-white font-semibold">
                                    {v}
                                  </strong>
                                </div>
                              )
                          )}
                        </div>
                      )}

                      {/* Meetup location */}
                      <div className="pt-2 border-t border-[#ECEEF2] dark:border-white/10 flex items-center gap-2 text-[12px] font-semibold text-[#5B636E] dark:text-neutral-300">
                        <MapPin className="w-3.5 h-3.5 text-[#D97706] shrink-0" />
                        <span>Meetup at {landmark} ({campusBranch})</span>
                      </div>
                    </div>

                    {/* Campus Guidelines Confirmation */}
                    <div className="space-y-2.5 pt-1">
                      <label className="flex items-start gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={confirmHonesty}
                          onChange={(e) => setConfirmHonesty(e.target.checked)}
                          className="mt-0.5 w-4 h-4 rounded text-[#FFC928] focus:ring-[#FFC928] accent-[#FFC928]"
                        />
                        <span className="text-[12.5px] text-[#4A5058] dark:text-neutral-300 leading-snug">
                          I confirm that this item is in my possession on campus and matches the photos and descriptions accurately.
                        </span>
                      </label>

                      <label className="flex items-start gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={confirmSafety}
                          onChange={(e) => setConfirmSafety(e.target.checked)}
                          className="mt-0.5 w-4 h-4 rounded text-[#FFC928] focus:ring-[#FFC928] accent-[#FFC928]"
                        />
                        <span className="text-[12.5px] text-[#4A5058] dark:text-neutral-300 leading-snug">
                          I agree to conduct meetups only at designated public campus areas during daylight hours and adhere to Campus Hive community rules.
                        </span>
                      </label>

                      {errors.terms && (
                        <p className="text-rose-500 text-[12px] font-semibold">
                          {errors.terms}
                        </p>
                      )}
                      {errors.submit && (
                        <p className="text-rose-500 text-[12px] font-semibold">
                          {errors.submit}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Step Navigation Actions */}
            <div className="pt-6 mt-6 border-t border-[#ECEEF2] dark:border-white/10 flex items-center justify-between gap-3">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={goToPrevStep}
                  className="radius-native inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-white/5 text-[13px] font-bold text-[#5B636E] dark:text-neutral-300 hover:text-[#171717] dark:hover:text-white hover:border-[#171717] transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSaveDraft(true)}
                  className="radius-native px-4 py-2.5 rounded-xl border border-[#DCE0E6] dark:border-white/15 bg-white dark:bg-white/5 text-[13px] font-bold text-[#5B636E] dark:text-neutral-300 hover:text-[#171717] transition-colors cursor-pointer"
                >
                  Save draft
                </button>
              )}

              {currentStep < 5 ? (
                <button
                  type="button"
                  onClick={goToNextStep}
                  className="radius-native inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#FFC928] hover:bg-[#F2BD24] text-[#171717] text-[13px] font-bold shadow-xs transition-all active:scale-[0.98] cursor-pointer"
                >
                  <span>
                    Next:{" "}
                    {currentStep === 1
                      ? "Description"
                      : currentStep === 2
                      ? "Photos"
                      : currentStep === 3
                      ? "Location & meetup"
                      : "Review & publish"}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handlePublishListing}
                  className="radius-native inline-flex items-center gap-2 px-7 py-2.5 rounded-xl bg-[#FFC928] hover:bg-[#F2BD24] text-[#171717] text-[13.5px] font-extrabold shadow-sm transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-[#171717] border-t-transparent animate-spin" />
                      <span>Publishing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 fill-[#171717]" />
                      <span>Publish listing</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </section>

          {/* =============================================================== */}
          {/* COLUMN 3: STICKY LIVE PREVIEW CARD                              */}
          {/* =============================================================== */}
          <aside className="space-y-4 lg:sticky lg:top-24">
            <div>
              <h3 className="text-[14px] font-extrabold text-[#171717] dark:text-white tracking-[-0.01em]">
                Listing preview
              </h3>
              <p className="text-[11.5px] text-[#8C929C] dark:text-neutral-400 mt-0.5">
                This is how your listing will appear to other users.
              </p>
            </div>

            {/* Live Product Card matching wireframe */}
            <div className="radius-native bg-white dark:bg-[#14161D] rounded-2xl border border-[#ECEEF2] dark:border-white/10 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
              {/* Image with status badge */}
              <div className="relative aspect-[16/10] bg-[#ECEEF2] dark:bg-white/5 overflow-hidden">
                {images.length > 0 ? (
                  <img
                    src={images[0]}
                    alt="Listing live preview"
                    className="w-full h-full object-cover transition-all"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-[#8C929C]">
                    <ImageIcon className="w-8 h-8 stroke-[1.5]" />
                    <span className="text-[11px] font-medium mt-1">Photo preview</span>
                  </div>
                )}

                <div className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#E8F8F0] text-[#15803D] dark:bg-emerald-500/20 dark:text-emerald-400 border border-[#A7F3D0]/60 shadow-xs">
                  {availability}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 sm:p-5 space-y-3">
                {/* Title & Price */}
                <div>
                  <h4 className="text-[16px] font-extrabold text-[#171717] dark:text-white leading-snug line-clamp-2">
                    {title || "Item title will appear here"}
                  </h4>
                  <div className="text-[18px] font-black text-[#171717] dark:text-[#FFC928] mt-1">
                    ₦{formattedPriceNumber}
                  </div>
                </div>

                {/* Meta details */}
                <div className="flex items-center gap-2 text-[12px] font-medium text-[#7A818C] dark:text-neutral-400 flex-wrap">
                  <span className="inline-flex items-center gap-1 font-semibold text-[#171717] dark:text-neutral-200">
                    <Laptop className="w-3.5 h-3.5 text-[#8C929C]" />
                    <span>{category}</span>
                  </span>
                  <span>·</span>
                  <span>{condition}</span>
                </div>

                {/* Description snippet */}
                <p className="text-[12px] text-[#5B636E] dark:text-neutral-300 line-clamp-3 leading-relaxed">
                  {description || "Add a description to tell other students what makes your item special."}
                </p>

                {/* Landmark pill */}
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F7F8FA] dark:bg-white/5 border border-[#ECEEF2] dark:border-white/10 text-[11.5px] font-bold text-[#5B636E] dark:text-neutral-300">
                  <MapPin className="w-3 h-3 text-[#D97706]" />
                  <span className="truncate max-w-[240px]">{landmark}</span>
                </div>

                {/* Seller Profile Pill matching wireframe */}
                <div className="pt-3 border-t border-[#ECEEF2] dark:border-white/10 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-[#ECEEF2] dark:border-white/10 bg-neutral-100 shrink-0">
                    <img
                      src={
                        user?.avatar ||
                        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                      }
                      alt="Seller avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <span className="text-[13px] font-bold text-[#171717] dark:text-white truncate">
                        {user?.name || "Campus Student"}
                      </span>
                      <BadgeCheck className="w-4 h-4 text-[#171717] fill-[#FFC928] shrink-0" />
                    </div>
                    <div className="text-[11px] text-[#7A818C] dark:text-neutral-400 truncate">
                      Student Seller · Computer Science
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-[#7A818C] dark:text-neutral-400 mt-0.5">
                      <Star className="w-3 h-3 text-[#FFC928] fill-[#FFC928]" />
                      <span className="font-bold text-[#171717] dark:text-white">4.8</span>
                      <span>(18 reviews)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Safety Card matching wireframe */}
            <div className="radius-native p-4 rounded-xl bg-white dark:bg-[#14161D] border border-[#ECEEF2] dark:border-white/10 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#FFC928] shrink-0" />
                <span className="text-[12.5px] font-extrabold text-[#171717] dark:text-white">
                  Stay safe on Campus Hive
                </span>
              </div>
              <ul className="text-[11.5px] text-[#68707A] dark:text-neutral-400 space-y-1.5 list-disc list-inside leading-snug">
                <li>Meet in a designated public place on campus.</li>
                <li>Avoid sharing personal or financial information.</li>
                <li>Report suspicious activity immediately.</li>
              </ul>
              <div className="pt-1">
                <Link
                  href="/safety-guidelines"
                  className="text-[11.5px] font-bold text-[#171717] dark:text-white hover:underline inline-flex items-center gap-1"
                >
                  <span>Learn more</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <RebrandFooter />
    </div>
  );
}
