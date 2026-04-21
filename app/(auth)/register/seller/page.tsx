"use client";

import React, { useState } from "react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { SellerRules } from "@/components/auth/seller/SellerRules";
import { SellerIdentity } from "@/components/auth/seller/SellerIdentity";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Sparkles, Home, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiPost } from "@/lib/apiClient";

export default function SellerRegisterPage() {
    const [step, setStep] = useState(0); // 0: Guidelines, 1: ID, 2: Processing
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

            setStep(2);
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
            case 0:
                return (
                    <div className="space-y-4">
                        <SellerRules onContinue={nextStep} />
                        <button
                            onClick={() => router.replace("/home")}
                            className="w-full bg-secondary text-foreground font-bold uppercase tracking-widest py-3 rounded-xl border border-border/50 hover:bg-secondary/80 transition-all text-xs flex items-center justify-center gap-2"
                        >
                            <Home className="w-4 h-4" />
                            Home
                        </button>
                    </div>
                );
            case 1:
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
            case 2:
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
        0: { title: "Become a Seller", subtitle: "Start your selling journey on Campus Hive" },
        1: { title: "Verification", subtitle: "Confirm your student status" },
        2: { title: "Done!", subtitle: "Application submitted" },
    };

    return (
        <AuthLayout
            currentStep={step === 2 ? undefined : step + 1}
            totalSteps={step === 2 ? undefined : 2}
            title={stepInfo[step as keyof typeof stepInfo].title}
            subtitle={stepInfo[step as keyof typeof stepInfo].subtitle}
            illustrationUrl=""
            showBack={step > 0 && step < 2}
            onBack={prevStep}
            isWide={step < 2}
        >
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
        </AuthLayout>
    );
}
