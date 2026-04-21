"use client";

import React, { useState } from "react";
import { Step1EmailPassword } from "@/components/auth/steps/Step1EmailPassword";
import { Step3ProfileInfo } from "@/components/auth/steps/Step3ProfileInfo";
import { Step4Intent } from "@/components/auth/steps/Step4Intent";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { apiPost } from "@/lib/apiClient";
import { AuthErrorModal } from "@/components/modals/AuthErrorModal";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
    const [step, setStep] = useState(1);
    const [registerError, setRegisterError] = useState("");
    const [onboardingWarning, setOnboardingWarning] = useState("");
    const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        confirmPassword: "",
        fullName: "",
        agreedToTerms: true,
    });
    const router = useRouter();

    const updateFormData = (data: Partial<typeof formData>) => {
        setFormData((prev) => ({ ...prev, ...data }));
    };

    const nextStep = () => setStep((prev) => prev + 1);
    const prevStep = () => setStep((prev) => prev - 1);

    const handleFinishRegistration = async () => {
        setRegisterError("");
        try {
            const response: any = await apiPost("auth/register", {
                email: formData.email,
                password: formData.password,
                fullName: formData.fullName
            });

            if (response.status && response.status !== 200) {
                throw new Error(response.message || "Registration failed");
            }

            const rawUser = response.user || response.data?.savedUser;
            const token = response.token;

            if (rawUser && token) {
                // Map backend user doc to the AuthContext User shape
                const mappedUser = {
                    id: rawUser._id || rawUser.id,
                    name: rawUser.personalDetails?.fullName || rawUser.profile?.displayName || formData.fullName,
                    email: rawUser.email || formData.email,
                    handle: rawUser.profile?.handle || "",
                    role: rawUser.role || "buyer",
                    sellerStatus: rawUser.sellerStatus || "none",
                    onboardingStep: rawUser.onboardingStep || "profile_completed",
                    avatar: rawUser.profile?.avatar,
                    isStudent: rawUser.studentStatus?.isStudent || false,
                    studentVerified: rawUser.studentStatus?.isVerified || false,
                    tier: "new" as const,
                };
                login(mappedUser);
                localStorage.setItem("campus_token", token);
            }

            setStep(3);
        } catch (err: any) {
            console.error("Registration error:", err);
            const msg = err?.message || "Registration failed. Please try again.";
            setRegisterError(msg);
            setIsErrorModalOpen(true);
        }
    };

    const handleOnboardingChoice = async (action: 'buy' | 'sell_now' | 'skip') => {
        setOnboardingWarning("");
        if (action === 'buy' || action === 'skip') {
            try {
                await apiPost("onboarding/choice", { choice: "buy" });
            } catch (err) {
                console.warn("Onboarding choice sync failed (buy/skip). Continuing locally.", err);
                setOnboardingWarning("We could not sync your onboarding choice right now. You're still signed in and can continue.");
            }

            const storedUser = localStorage.getItem("campus_user");
            if (storedUser) {
                const parsed = JSON.parse(storedUser);
                const updated = { ...parsed, onboardingStep: "completed" };
                localStorage.setItem("campus_user", JSON.stringify(updated));
                login(updated);
            }
            router.replace("/home");
            return;
        }

        // action === "sell_now"
        try {
            await apiPost("onboarding/choice", { choice: "sell" });
        } catch (err) {
            console.warn("Onboarding choice sync failed (sell). Continuing to seller registration.", err);
            setOnboardingWarning("We could not sync your onboarding choice right now. Continuing to seller registration.");
        }

        const storedUser = localStorage.getItem("campus_user");
        if (storedUser) {
            const parsed = JSON.parse(storedUser);
            const updated = { ...parsed, onboardingStep: "onboarding_choice" };
            localStorage.setItem("campus_user", JSON.stringify(updated));
            login(updated);
        }
        router.push("/register/seller");
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
                    <Step3ProfileInfo
                        formData={formData}
                        updateFormData={updateFormData}
                        onNext={handleFinishRegistration}
                        onBack={prevStep}
                    />
                );
            case 3:
                return (
                    <Step4Intent
                        formData={formData}
                        updateFormData={updateFormData}
                        onFinish={handleOnboardingChoice}
                        onBack={() => router.replace("/home")} // Can't go back once registered
                    />
                );
            default:
                return null;
        }
    };

    const stepInfo = {
        1: { title: "Create your account", subtitle: "Let's get started with your email and password" },
        2: { title: "Finish Setup", subtitle: "Enter your name to complete your profile" },
        3: { title: "One Last Thing", subtitle: "How do you want to use Campus Market?" },
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
                                {step === 3 && onboardingWarning && (
                                    <div className="mb-4 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-700 dark:text-amber-300">
                                        {onboardingWarning}
                                    </div>
                                )}
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
            
            <AuthErrorModal 
                isOpen={isErrorModalOpen} 
                onClose={() => setIsErrorModalOpen(false)} 
                message={registerError} 
            />
        </div>
    );
}
