"use client";

import { useState } from "react";
import { Step0_Intro } from "./Step0_Intro";
import { Step1_Status } from "./Step1_Status";
import { Step2_Verification } from "./Step2_Verification";
import { Step3_Contact } from "./Step3_Contact";
import { Step4_Success } from "./Step4_Success";

export type OnboardingData = {
    studentStatus: string;
    department: string;
    regNumber: string;
    phone: string;
    email: string;
};

export function OnboardingContainer() {
    const [step, setStep] = useState(0);
    const [data, setData] = useState<OnboardingData>({
        studentStatus: "",
        department: "",
        regNumber: "",
        phone: "",
        email: "",
    });

    const nextStep = () => setStep((prev) => Math.min(prev + 1, 4));
    const prevStep = () => setStep((prev) => Math.max(prev - 1, 0));

    const updateData = (fields: Partial<OnboardingData>) => {
        setData((prev) => ({ ...prev, ...fields }));
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 font-sans transition-colors duration-300">
            <div className="w-full max-w-6xl bg-card rounded-3xl shadow-xl shadow-black/10 dark:shadow-white/5 overflow-hidden border-2 border-border min-h-[600px] flex flex-col md:flex-row relative transition-all duration-300">

                {/* Progress Indicators (Only for steps 1-3) */}
                {step > 0 && step < 4 && (
                    <div className="absolute top-6 left-6 z-20 flex gap-2">
                        {[1, 2, 3].map((s) => (
                            <div
                                key={s}
                                className={`h-1.5 rounded-full transition-all duration-300 ${s <= step ? "w-8 bg-primary" : "w-1.5 bg-gray-200 dark:bg-zinc-800"
                                    }`}
                            />
                        ))}
                    </div>
                )}

                {step > 0 && step < 4 && (
                    <div className="absolute top-6 right-6 z-20 text-xs font-bold text-muted-foreground">
                        Step {step} of 3
                    </div>
                )}

                {/* Step Content */}
                <div className="flex-1 relative">
                    {step === 0 && <Step0_Intro onNext={nextStep} />}
                    {step === 1 && <Step1_Status data={data} updateData={updateData} onNext={nextStep} />}
                    {step === 2 && <Step2_Verification data={data} updateData={updateData} onNext={nextStep} onBack={prevStep} />}
                    {step === 3 && <Step3_Contact data={data} updateData={updateData} onNext={nextStep} onBack={prevStep} />}
                    {step === 4 && <Step4_Success />}
                </div>
            </div>
        </div>
    );
}
