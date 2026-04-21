"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, CheckCircle2 } from "lucide-react";

import { SellerRules } from "@/components/auth/seller/SellerRules";
import { SellerIdentity } from "@/components/auth/seller/SellerIdentity";
import { apiPost } from "@/lib/apiClient";
import { useAuth } from "@/context/AuthContext";
import { AuthErrorModal } from "@/components/modals/AuthErrorModal";

export default function SellerOnboardingPage() {
    const [step, setStep] = useState(1);
    const [error, setError] = useState("");
    const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        studentIdCard: null as string | null,
        studentIdFile: null as File | null,
    });
    
    const router = useRouter();
    const { refreshUser } = useAuth();

    const updateFormData = (data: Partial<typeof formData>) => {
        setFormData((prev) => ({ ...prev, ...data }));
    };

    const nextStep = () => setStep((prev) => prev + 1);
    const prevStep = () => setStep((prev) => prev - 1);

    const handleSubmitApplication = async () => {
        if (!formData.studentIdFile) {
            setError("Identification card file is required.");
            setIsErrorModalOpen(true);
            return;
        }

        try {
            const formDataObj = new FormData();
            formDataObj.append("idImage", formData.studentIdFile);

            await apiPost("onboarding/apply-seller", formDataObj);
            
            setStep(3); // Move to processing
            await refreshUser();
            
            // Redirect home after some delay to show the success state
            setTimeout(() => {
                router.replace("/home");
            }, 3000);
        } catch (err: any) {
            console.error("Application error:", err);
            setError(err.message || "An error occurred during upload.");
            setIsErrorModalOpen(true);
        }
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return <SellerRules onContinue={nextStep} />;
            case 2:
                return (
                    <SellerIdentity 
                        formData={formData} 
                        updateFormData={updateFormData} 
                        onNext={handleSubmitApplication} 
                        onBack={prevStep} 
                    />
                );
            case 3:
                return (
                    <motion.div 
                        key="processing"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center text-center space-y-6 py-10"
                    >
                        <div className="relative">
                            <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                            </div>
                            <motion.div 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.5, type: "spring" }}
                                className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center border-4 border-card"
                            >
                                <Search className="w-3 h-3 text-white" />
                            </motion.div>
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-xl font-bold text-foreground">Under Review</h2>
                            <p className="text-sm text-muted-foreground leading-relaxed max-w-[320px]">
                                Your application has been received and is currently being processed by our moderation team.
                            </p>
                        </div>

                        <div className="w-full max-w-[280px] bg-secondary/20 p-4 rounded-2xl border border-border/40">
                            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
                                <span>Progress</span>
                                <span className="text-emerald-600">Pending</span>
                            </div>
                            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: "65%" }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    className="h-full bg-emerald-500" 
                                />
                            </div>
                        </div>

                        <p className="text-[10px] text-muted-foreground italic mt-4">
                            Redirecting you to homepage...
                        </p>
                    </motion.div>
                );
            default:
                return null;
        }
    };

    const stepInfo: Record<number, { title: string; subtitle: string }> = {
        1: { title: "Seller Agreement", subtitle: "Review and accept our community guidelines" },
        2: { title: "Identity Verification", subtitle: "Upload your student ID for verification" },
        3: { title: "Application Received", subtitle: "We are reviewing your application" },
    };

    return (
        <div className="bg-background min-h-screen flex flex-col">
            <div className="flex flex-1 items-center justify-center px-4 py-8 md:py-10">
                <div className="mx-auto flex w-full max-w-[1040px] flex-col overflow-hidden md:flex-row md:border md:border-border/40 md:rounded-xl md:shadow-sm md:min-h-[620px]">
                    <div className="hidden w-full items-center justify-center bg-[#fdf3c7] p-7 md:flex md:w-1/2 md:p-10">
                        <div className="w-full max-w-[420px]">
                            <img
                                src="/seller-illustration.png"
                                alt="Seller illustration"
                                className="h-auto w-full object-contain drop-shadow-xl"
                            />
                        </div>
                    </div>

                    <div className="flex w-full items-center justify-center bg-background px-8 py-10 md:w-1/2 md:px-14">
                        <div className="w-full max-w-[420px] font-heading">
                            {step !== 3 && (
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
                            )}

                            <h1 className="text-2xl font-semibold text-foreground">
                                {stepInfo[step]?.title}
                            </h1>
                            <p className="mt-2 text-sm text-muted-foreground">
                                {stepInfo[step]?.subtitle}
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
                message={error} 
            />
        </div>
    );
}
