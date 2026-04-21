"use client";

import React, { useState } from "react";
import { Step1EmailPassword } from "@/components/auth/steps/Step1EmailPassword";
import { Step3ProfileInfo } from "@/components/auth/steps/Step3ProfileInfo";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { apiPost } from "@/lib/apiClient";
import { AuthErrorModal } from "@/components/modals/AuthErrorModal";

export default function RegisterPage() {
    const [step, setStep] = useState(1);
    const [registerError, setRegisterError] = useState("");
    const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
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

            // First login after signup should show the one-time usage choice modal.
            localStorage.setItem("campus_first_session_choice_pending", "true");
            router.replace("/login?registered=true");
        } catch (err: any) {
            console.error("Registration error:", err);
            const msg = err?.message || "Registration failed. Please try again.";
            setRegisterError(msg);
            setIsErrorModalOpen(true);
        }
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
            default:
                return null;
        }
    };

    const stepInfo = {
        1: { title: "Create your account", subtitle: "Let's get started with your email and password" },
        2: { title: "Finish Setup", subtitle: "Enter your name to complete your profile" },
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
                                    Step {step} of 2
                                </span>
                                <div className="mt-2 flex gap-2">
                                    {Array.from({ length: 2 }).map((_, idx) => (
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
            
            <AuthErrorModal 
                isOpen={isErrorModalOpen} 
                onClose={() => setIsErrorModalOpen(false)} 
                message={registerError} 
            />
        </div>
    );
}
