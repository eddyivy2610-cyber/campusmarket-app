"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Upload, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiGet, apiPatch, apiPost } from "@/lib/apiClient";

const categories = [
    "Electronics",
    "Fashion",
    "Books",
    "Services",
    "Hostel Items",
    "Food & Snacks",
    "Other",
];

export default function SellerRegisterPage() {
    const router = useRouter();
    const { user, login } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccessToast, setShowSuccessToast] = useState(false);
    const [error, setError] = useState("");
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [idFile, setIdFile] = useState<File | null>(null);
    const [idPreview, setIdPreview] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        displayName: "",
        businessName: "",
        businessCategory: "",
        businessDescription: "",
    });

    useEffect(() => {
        const load = async () => {
            if (!user?.id) {
                router.replace("/login?next=/register/seller");
                return;
            }

            try {
                const response: any = await apiGet(`/api/user/${user.id}`);
                const data = response?.data || response || {};
                setFormData({
                    displayName: data?.profile?.displayName || user.name || "",
                    businessName: data?.businessProfile?.name || "",
                    businessCategory: data?.businessProfile?.category || "",
                    businessDescription: data?.businessProfile?.description || "",
                });
            } catch (err: any) {
                setError(err?.message || "Failed to load your profile.");
            } finally {
                setIsLoading(false);
            }
        };

        load();
    }, [router, user?.id, user?.name]);

    useEffect(() => {
        return () => {
            if (idPreview?.startsWith("blob:")) {
                URL.revokeObjectURL(idPreview);
            }
        };
    }, [idPreview]);

    const handleIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            setError("Only image files are supported for ID upload.");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setError("ID image is too large (max 5MB).");
            return;
        }
        const previewUrl = URL.createObjectURL(file);
        setIdFile(file);
        setIdPreview(previewUrl);
        setError("");
    };

    const handleSubmit = async () => {
        if (!user?.id) return;

        if (!formData.displayName.trim()) return setError("Display Name is required.");
        if (!formData.businessName.trim()) return setError("Business Name is required.");
        if (!formData.businessCategory.trim()) return setError("Business Category is required.");
        if (!formData.businessDescription.trim()) return setError("Business Description is required.");
        if (!idFile) return setError("Student ID image is required.");
        if (!agreedToTerms) return setError("You must agree to seller terms.");

        setError("");
        setIsSubmitting(true);
        try {
            await apiPatch(`/api/user/update/${user.id}`, {
                profile: { displayName: formData.displayName.trim() },
                businessProfile: {
                    name: formData.businessName.trim(),
                    category: formData.businessCategory.trim(),
                    description: formData.businessDescription.trim(),
                    tags: [],
                },
            });

            const uploadData = new FormData();
            uploadData.append("idImage", idFile);
            await apiPost("onboarding/apply-seller", uploadData);

            login({
                ...user,
                name: formData.displayName.trim(),
                sellerStatus: "pending",
                onboardingStep: "seller_pending",
            });
            setShowSuccessToast(true);
            setTimeout(() => {
                router.replace("/home");
            }, 1400);
        } catch (err: any) {
            setError(err?.message || "Failed to submit seller application.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="h-7 w-7 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="bg-background min-h-screen flex flex-col">
            {showSuccessToast && (
                <div className="fixed right-4 top-4 z-[120] rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-xs font-bold text-emerald-700 shadow-lg dark:text-emerald-300">
                    Seller application submitted successfully.
                </div>
            )}
            <div className="flex flex-1 items-center justify-center px-4 py-8 md:py-10">
                <div className="mx-auto flex w-full max-w-[1040px] flex-col overflow-hidden md:flex-row md:border md:border-border/40 md:rounded-xl md:shadow-sm md:min-h-[620px]">
                    <div className="hidden w-full items-center justify-center bg-[#cfe5eb] p-7 md:flex md:w-1/2 md:p-10">
                        <div className="w-full max-w-[420px]">
                            <img src="/mobile.png" alt="Shopping illustration" className="h-auto w-full object-contain" />
                        </div>
                    </div>

                    <div className="flex w-full items-center justify-center bg-background px-8 py-10 md:w-1/2 md:px-14">
                        <div className="w-full max-w-[420px] font-heading">
                            <h1 className="text-2xl font-semibold text-foreground">Seller Application</h1>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Complete this form once to request seller access.
                            </p>

                            <div className="mt-6 space-y-4">
                                <input
                                    value={formData.displayName}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, displayName: e.target.value }))}
                                    placeholder="Display Name"
                                    className="h-11 w-full rounded-xl border border-border/60 bg-secondary/20 px-3 text-sm outline-none focus:border-primary/40"
                                />
                                <input
                                    value={formData.businessName}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, businessName: e.target.value }))}
                                    placeholder="Business Name"
                                    className="h-11 w-full rounded-xl border border-border/60 bg-secondary/20 px-3 text-sm outline-none focus:border-primary/40"
                                />
                                <select
                                    value={formData.businessCategory}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, businessCategory: e.target.value }))}
                                    className="h-11 w-full rounded-xl border border-border/60 bg-secondary/20 px-3 text-sm outline-none focus:border-primary/40"
                                >
                                    <option value="">Select Business Category</option>
                                    {categories.map((cat) => (
                                        <option key={cat} value={cat}>
                                            {cat}
                                        </option>
                                    ))}
                                </select>
                                <textarea
                                    value={formData.businessDescription}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, businessDescription: e.target.value }))}
                                    rows={3}
                                    placeholder="Business Description"
                                    className="w-full rounded-xl border border-border/60 bg-secondary/20 px-3 py-2 text-sm outline-none focus:border-primary/40"
                                />

                                <div className="rounded-xl border border-border/60 bg-secondary/20 p-3">
                                    <label className="mb-2 block text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/80">
                                        Student ID Image
                                    </label>
                                    {idPreview ? (
                                        <div className="relative">
                                            <img src={idPreview} alt="ID preview" className="h-40 w-full rounded-lg object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setIdFile(null);
                                                    setIdPreview(null);
                                                }}
                                                className="absolute right-2 top-2 rounded-full bg-red-500 p-1.5 text-white"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="flex h-28 w-full cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-border/70 text-xs text-muted-foreground hover:border-primary/40">
                                            <Upload className="mb-2 h-4 w-4" />
                                            Upload ID Image (PNG/JPG, max 5MB)
                                            <input type="file" accept="image/*" onChange={handleIdChange} className="hidden" />
                                        </label>
                                    )}
                                </div>

                                <label className="flex items-start gap-2 text-xs text-muted-foreground">
                                    <input
                                        type="checkbox"
                                        checked={agreedToTerms}
                                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                                        className="mt-0.5"
                                    />
                                    I agree that the information provided is accurate and I accept seller terms.
                                </label>

                                {error && (
                                    <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-600">
                                        {error}
                                    </div>
                                )}

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => router.replace("/home")}
                                        disabled={isSubmitting}
                                        className="h-11 flex-1 rounded-xl border border-border/60 bg-secondary text-xs font-bold uppercase tracking-widest text-foreground hover:bg-secondary/80"
                                    >
                                        Home
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleSubmit}
                                        disabled={isSubmitting}
                                        className="h-11 flex-[1.3] rounded-xl bg-primary px-4 text-xs font-bold uppercase tracking-widest text-white hover:bg-primary/90 disabled:opacity-70"
                                    >
                                        {isSubmitting ? (
                                            <span className="inline-flex items-center gap-2">
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Submitting...
                                            </span>
                                        ) : (
                                            "Submit Seller Form"
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
