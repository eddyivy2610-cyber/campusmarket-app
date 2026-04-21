"use client";

import React, { useState } from "react";
import { SellerRules } from "@/components/auth/seller/SellerRules";
import { SellerIdentity } from "@/components/auth/seller/SellerIdentity";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiPost } from "@/lib/apiClient";

export default function SellerRegisterPage() {
    const [step, setStep] = useState(1); // 1: Terms, 2: ID, 3: Processing
    const [formData, setFormData] = useState({
        studentIdCardFile: null as File | null,
        studentIdCardPreview: null as string | null,
    });
    const [submitError, setSubmitError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();
    const { user, login } = useAuth();

    const updateFormData = (data: Partial<typeof formData>) => {
        setFormData((prev) => ({ ...prev, ...data }));
    };

    const nextStep = () => setStep((prev) => prev + 1);
    const prevStep = () => setStep((prev) => prev - 1);

    const handleSubmit = async () => {
        setSubmitError("");
        if (!user) {
            router.push("/login?next=/register/seller");
            return;
        }

        if (!formData.studentIdCardFile) {
            setSubmitError("Please upload your student ID to continue.");
            return;
        }

        setIsSubmitting(true);
        try {
            const uploadData = new FormData();
            uploadData.append("idImage", formData.studentIdCardFile);
            await apiPost("onboarding/apply-seller", uploadData);

            login({ ...user, sellerStatus: "pending", onboardingStep: "seller_pending" });

            setStep(3);
            setTimeout(() => {
                router.push("/home");
            }, 3000);
        } catch (err: any) {
            setSubmitError(err?.message || "Failed to submit application. Please try again.");
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return <SellerRules onContinue={nextStep} />;
            case 2:
                return (
                    <div className="space-y-4">
                        {submitError && (
                            <div className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-600">
                                {submitError}
                            </div>
                        )}
                        <SellerIdentity
                            formData={formData}
                            updateFormData={updateFormData}
                            onNext={handleSubmit}
                            onBack={prevStep}
                        />
                        {isSubmitting && (
                            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-primary">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Submitting ID...
                            </div>
                        )}
                    </div>
                );
            case 3:
                return (
                    <div className="text-center space-y-6 py-12 animate-in zoom-in duration-500">
                        <div className="w-24 h-24 bg-green-500/10 rounded-[32px] flex items-center justify-center mx-auto text-green-500">
                            <Sparkles className="w-12 h-12 animate-bounce" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-3xl font-bold font-heading">Application Submitted!</h2>
                            <p className="text-muted-foreground max-w-sm mx-auto">
                                Your ID has been received and is now processing. We will notify you once review is complete.
                            </p>
                        </div>
                        <div className="flex items-center justify-center gap-2 text-primary font-bold animate-pulse uppercase tracking-[0.2em] text-xs pt-4">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Returning to homepage...</span>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    const stepInfo = {
        1: { title: "Become a Seller", subtitle: "Start your selling journey on Campus Market" },
        2: { title: "Identity Verification", subtitle: "Upload your ID to request seller access" },
        3: { title: "Done!", subtitle: "Application submitted" },
    };

    return (
        <div className="bg-background min-h-screen flex flex-col">
            <div className="flex flex-1 items-center justify-center px-4 py-8 md:py-10">
                <div className="mx-auto flex w-full max-w-[1040px] flex-col overflow-hidden md:flex-row md:border md:border-border/40 md:rounded-xl md:shadow-sm md:min-h-[620px]">
                    <div className="hidden w-full items-center justify-center bg-[#cfe5eb] p-7 md:flex md:w-1/2 md:p-10">
                        <div className="w-full max-w-[420px]">
                            <img
                                src="/mobile.png"
                                alt="Shopping illustration"
                                className="h-auto w-full object-contain"
                            />
                        </div>
                    </div>

                    <div className="flex w-full items-center justify-center bg-background px-8 py-10 md:w-1/2 md:px-14">
                        <div className="w-full max-w-[420px] font-heading">
                            <div className="mb-4">
                                <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground/60 font-sans">
                                    Step {step} of 3
                                </span>
                                <div className="mt-2 flex gap-2">
                                    {Array.from({ length: 3 }).map((_, idx) => (
                                        <div
                                            key={idx}
                                            className={`h-1.5 rounded-full transition-all ${idx + 1 === step
                                                ? "w-8 bg-primary"
                                                : idx + 1 < step
                                                    ? "w-6 bg-primary/50"
                                                    : "w-6 bg-secondary"
                                                }`}
                                        />
                                    ))}
                                </div>
                            </div>

                            <h1 className="text-2xl font-semibold text-foreground">
                                {stepInfo[step as keyof typeof stepInfo].title}
                            </h1>
                            <p className="mt-2 text-sm text-muted-foreground">
                                {stepInfo[step as keyof typeof stepInfo].subtitle}
                            </p>

                            <div className="mt-6">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={step}
                                        initial={{ x: 20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        exit={{ x: -20, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                    >
                                        {renderStep()}
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
