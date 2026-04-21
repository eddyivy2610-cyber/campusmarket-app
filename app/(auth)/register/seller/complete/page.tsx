"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiGet, apiPatch } from "@/lib/apiClient";

const categories = [
    "Electronics",
    "Fashion",
    "Books",
    "Services",
    "Hostel Items",
    "Food & Snacks",
    "Other",
];

export default function CompleteSellerApplicationPage() {
    const router = useRouter();
    const { user, login } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        displayName: "",
        businessName: "",
        businessCategory: "",
        businessDescription: "",
    });

    useEffect(() => {
        const load = async () => {
            if (!user?.id) {
                router.replace("/login?next=/register/seller/complete");
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

    const handleSubmit = async () => {
        if (!user?.id) return;

        if (!formData.displayName.trim()) {
            setError("Display Name is required.");
            return;
        }
        if (!formData.businessName.trim()) {
            setError("Business Name is required.");
            return;
        }
        if (!formData.businessCategory.trim()) {
            setError("Business Category is required.");
            return;
        }
        if (!formData.businessDescription.trim()) {
            setError("Business Description is required.");
            return;
        }

        setError("");
        setIsSaving(true);
        try {
            const payload = {
                profile: {
                    displayName: formData.displayName.trim(),
                },
                businessProfile: {
                    name: formData.businessName.trim(),
                    category: formData.businessCategory.trim(),
                    description: formData.businessDescription.trim(),
                    tags: [],
                },
            };

            await apiPatch(`/api/user/update/${user.id}`, payload);
            login({ ...user, name: formData.displayName.trim(), role: "seller", onboardingStep: "completed" });
            router.replace("/home");
        } catch (err: any) {
            setError(err?.message || "Failed to save seller details.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-7 h-7 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background px-4 py-10">
            <div className="mx-auto w-full max-w-xl rounded-2xl border border-border/50 bg-card p-6 md:p-8">
                <div className="mb-6">
                    <h1 className="text-xl font-bold text-foreground">Complete Seller Application</h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Your seller account was approved. Add the final details below to complete setup.
                    </p>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/80">
                            Display Name
                        </label>
                        <input
                            value={formData.displayName}
                            onChange={(e) => setFormData((prev) => ({ ...prev, displayName: e.target.value }))}
                            placeholder="How buyers should see your name"
                            className="h-11 w-full rounded-xl border border-border/60 bg-secondary/20 px-3 text-sm outline-none focus:border-primary/40"
                        />
                    </div>

                    <div>
                        <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/80">
                            Business Name
                        </label>
                        <input
                            value={formData.businessName}
                            onChange={(e) => setFormData((prev) => ({ ...prev, businessName: e.target.value }))}
                            placeholder="Your store or brand name"
                            className="h-11 w-full rounded-xl border border-border/60 bg-secondary/20 px-3 text-sm outline-none focus:border-primary/40"
                        />
                    </div>

                    <div>
                        <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/80">
                            Business Category
                        </label>
                        <select
                            value={formData.businessCategory}
                            onChange={(e) => setFormData((prev) => ({ ...prev, businessCategory: e.target.value }))}
                            className="h-11 w-full rounded-xl border border-border/60 bg-secondary/20 px-3 text-sm outline-none focus:border-primary/40"
                        >
                            <option value="">Select a category</option>
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/80">
                            Business Description
                        </label>
                        <textarea
                            value={formData.businessDescription}
                            onChange={(e) => setFormData((prev) => ({ ...prev, businessDescription: e.target.value }))}
                            rows={4}
                            placeholder="Tell buyers what you sell."
                            className="w-full rounded-xl border border-border/60 bg-secondary/20 px-3 py-2 text-sm outline-none focus:border-primary/40"
                        />
                    </div>
                </div>

                {error && (
                    <div className="mt-4 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-600">
                        {error}
                    </div>
                )}

                <div className="mt-6 flex gap-3">
                    <button
                        onClick={() => router.replace("/home")}
                        disabled={isSaving}
                        className="h-11 flex-1 rounded-xl border border-border/60 bg-secondary text-xs font-bold uppercase tracking-widest text-foreground hover:bg-secondary/80"
                    >
                        Home
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSaving}
                        className="h-11 flex-[1.4] rounded-xl bg-primary px-4 text-xs font-bold uppercase tracking-widest text-white hover:bg-primary/90 disabled:opacity-70"
                    >
                        {isSaving ? (
                            <span className="inline-flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Saving...
                            </span>
                        ) : (
                            "Save and Continue"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
