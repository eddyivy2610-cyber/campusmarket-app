/**
 * @BACKEND: REGISTRATION PAGE — Multi-step user registration form, currently client-side only.
 *
 * Replace with:
 *   - POST /api/auth/register  → create new user account with all form data
 *   - POST /api/auth/verify-email → email verification step
 *   - Upload profile image to file storage (S3/Cloudinary)
 *   - Handle validation errors from the server (duplicate email, weak password, etc.)
 *   - Auto-login after successful registration or redirect to login
 */

"use client";

import React, { useState } from "react";
import { Step1EmailPassword } from "@/components/auth/steps/Step1EmailPassword";
import { Step2ProfileInfo } from "@/components/auth/steps/Step2ProfileInfo";
import { Step3StudentStatus } from "@/components/auth/steps/Step3StudentStatus";
import { Step4Intent } from "@/components/auth/steps/Step4Intent";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
export default function RegisterPage() {
    const [step, setStep] = useState(1);
    const [buyerComplete, setBuyerComplete] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        confirmPassword: "",
        fullName: "",
        displayName: "",
        profileImage: null,
        isStudent: undefined,
        department: "",
        bio: "",
        platformIntent: null,
        agreedToTerms: false,
    });
    const router = useRouter();

    const updateFormData = (data: Partial<typeof formData>) => {
        setFormData((prev) => ({ ...prev, ...data }));
    };

    const nextStep = () => setStep((prev) => prev + 1);
    const prevStep = () => setStep((prev) => prev - 1);

    const handleFinish = (intent: 'buy' | 'sell') => {
        if (intent === 'sell') {
            // Redirect to seller onboarding
            router.push("/register/seller");
        } else {
            setBuyerComplete(true);
            setTimeout(() => {
                router.replace("/login");
            }, 1200);
        }
    };

    const finishBuyerToLogin = async () => {
        setStep(4);
        setBuyerComplete(true);
        await new Promise((resolve) => setTimeout(resolve, 1200));
        router.replace("/login");
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <Step1EmailPassword
                        formData={formData}
                        updateFormData={updateFormData}
                        onNext={nextStep}
                    />
                );
            case 2:
                return (
                    <Step2ProfileInfo
                        formData={formData}
                        updateFormData={updateFormData}
                        onNext={nextStep}
                        onBack={prevStep}
                    />
                );
            case 3:
                return (
                    <Step3StudentStatus
                        formData={formData}
                        updateFormData={updateFormData}
                        onNext={nextStep}
                        onBack={prevStep}
                        onFinishBuyer={finishBuyerToLogin}
                    />
                );
            case 4:
                return (
                    <Step4Intent
                        formData={formData}
                        updateFormData={updateFormData}
                        onFinish={handleFinish}
                        onBack={prevStep}
                    />
                );
            default:
                return null;
        }
    };

    const stepInfo = {
        1: { title: "Create your account", subtitle: "Let's get started with your email and password" },
        2: { title: "Profile Information", subtitle: "Tell us about yourself" },
        3: { title: "Student Status", subtitle: "Help us personalize your experience" },
        4: buyerComplete
            ? { title: "Account Ready", subtitle: "You're set to browse as a buyer" }
            : { title: "Final Choice", subtitle: "How will you use Campus Hive?" },
    };

    return (
        <div className="bg-background">
            <div className="flex items-center justify-center px-4 pt-6 md:pt-10 min-h-[calc(100dvh-140px)] md:min-h-[calc(100dvh-80px)]">
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
                                    Step {step} of 4
                                </span>
                                <div className="mt-2 flex gap-2">
                                    {Array.from({ length: 4 }).map((_, idx) => (
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
                                        {step === 4 && buyerComplete ? (
                                            <div className="space-y-3">
                                                <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                                                    Registration complete. You can now sign in as a buyer.
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    Redirecting you to login...
                                                </p>
                                            </div>
                                        ) : (
                                            renderStep()
                                        )}
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
