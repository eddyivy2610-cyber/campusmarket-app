"use client";

import React, { useState } from "react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Step1EmailPassword } from "@/components/auth/steps/Step1EmailPassword";
import { Step2ProfileInfo } from "@/components/auth/steps/Step2ProfileInfo";
import { Step3StudentStatus } from "@/components/auth/steps/Step3StudentStatus";
import { Step4Intent } from "@/components/auth/steps/Step4Intent";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        confirmPassword: "",
        displayName: "",
        businessName: "",
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
            // Redirect to home
            router.push("/");
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
        4: { title: "Final Choice", subtitle: "How will you use Campus Market?" },
    };

    return (
        <AuthLayout
            currentStep={step}
            totalSteps={4}
            title={stepInfo[step as keyof typeof stepInfo].title}
            subtitle={stepInfo[step as keyof typeof stepInfo].subtitle}
            illustrationUrl=""
            showBack={step > 1}
            onBack={prevStep}
            isWide={step > 1}
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
