"use client";

import React, { useState } from "react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { SellerRules } from "@/components/auth/seller/SellerRules";
import { SellerIdentity } from "@/components/auth/seller/SellerIdentity";
import { SellerDetails } from "@/components/auth/seller/SellerDetails";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Sparkles, Building2, ArrowLeft, ArrowRight, Loader2 } from "lucide-react";

export default function SellerRegisterPage() {
    const [step, setStep] = useState(0); // 0: Guidelines, 1: Business Name, 2: ID, 3: Details
    const [formData, setFormData] = useState({
        businessName: "",
        studentIdCard: null,
        businessCategory: "",
        businessDescription: "",
        agreedToSellerTerms: false,
    });
    const router = useRouter();

    const updateFormData = (data: Partial<typeof formData>) => {
        setFormData((prev) => ({ ...prev, ...data }));
    };

    const nextStep = () => setStep((prev) => prev + 1);
    const prevStep = () => setStep((prev) => prev - 1);

    const handleSubmit = () => {
        // Show success message and redirect
        setStep(4); // Success state
        setTimeout(() => {
            router.push("/");
        }, 3000);
    };

    const renderStep = () => {
        switch (step) {
            case 0:
                return <SellerRules onContinue={nextStep} />;
            case 1:
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="space-y-2">
                            <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground/70">
                                Step 1: Business Name
                            </label>
                            <p className="text-muted-foreground text-sm">
                                Choose a name for your campus storefront. This will be visible on all your listings.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                                    <Building2 className="w-5 h-5" />
                                </div>
                                <input
                                    type="text"
                                    value={formData.businessName}
                                    onChange={(e) => updateFormData({ businessName: e.target.value })}
                                    placeholder="e.g. ABU Tech Hub"
                                    className="w-full bg-secondary/30 border-2 border-border/50 focus:border-primary/50 rounded-2xl py-3 pl-12 pr-4 outline-none transition-all font-medium placeholder:text-muted-foreground/40 text-sm"
                                />
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button
                                onClick={prevStep}
                                className="hidden md:flex flex-1 bg-secondary text-foreground font-bold uppercase tracking-widest py-3.5 rounded-xl border-2 border-border/50 hover:bg-secondary/80 active:scale-95 transition-all text-xs items-center justify-center gap-2"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back
                            </button>
                            <button
                                onClick={nextStep}
                                className="flex-[2] bg-primary text-white font-bold uppercase tracking-widest py-3.5 rounded-xl shadow-xl shadow-primary/20 hover:shadow-primary/30 active:scale-95 transition-all flex items-center justify-center gap-3 group text-xs font-bold"
                            >
                                Next Step
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <SellerIdentity
                        formData={formData}
                        updateFormData={updateFormData}
                        onNext={nextStep}
                        onBack={prevStep}
                    />
                );
            case 3:
                return (
                    <SellerDetails
                        formData={formData}
                        updateFormData={updateFormData}
                        onSubmit={handleSubmit}
                        onBack={prevStep}
                    />
                );
            case 4:
                return (
                    <div className="text-center space-y-6 py-12 animate-in zoom-in duration-500">
                        <div className="w-24 h-24 bg-green-500/10 rounded-[32px] flex items-center justify-center mx-auto text-green-500">
                            <Sparkles className="w-12 h-12 animate-bounce" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-3xl font-bold font-heading">Application Submitted!</h2>
                            <p className="text-muted-foreground max-w-sm mx-auto">
                                Your seller application is under review. You'll be notified within 24 hours once approved.
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
        0: { title: "Become a Seller", subtitle: "Start your selling journey on Campus Market" },
        1: { title: "Brand Identity", subtitle: "Give your business a name" },
        2: { title: "Verification", subtitle: "Confirm your student status" },
        3: { title: "Store Setup", subtitle: "Tell us about your business" },
        4: { title: "Done!", subtitle: "Application successful" },
    };

    return (
        <AuthLayout
            currentStep={step === 4 ? undefined : step + 1}
            totalSteps={step === 4 ? undefined : 4}
            title={stepInfo[step as keyof typeof stepInfo].title}
            subtitle={stepInfo[step as keyof typeof stepInfo].subtitle}
            illustrationUrl="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=800"
            showBack={step > 0 && step < 4}
            onBack={prevStep}
            isWide={step < 4}
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
