"use client";

import { useState } from "react";
import { SignInForm } from "./SignInForm";
import { Step1_Account } from "./Step1_Account";
import { Step2_Photo } from "./Step2_Photo";
import { Step3_Identity } from "./Step3_Identity";
import { Step4_Success } from "./Step4_Success";
import { AnimatePresence, motion } from "framer-motion";

type AuthMode = 'signin' | 'signup';

export function AuthContainer() {
    const [mode, setMode] = useState<AuthMode>('signup');
    const [step, setStep] = useState(1);

    const handleNext = () => setStep(prev => prev + 1);
    const handleSkip = () => setStep(prev => prev + 1);

    // Switch to Sign In
    const switchToSignIn = () => {
        setMode('signin');
        setStep(1);
    };

    // Switch to Sign Up
    const switchToSignUp = () => {
        setMode('signup');
        setStep(1);
    };

    return (
        <div className="w-full max-w-md mx-auto">
            {/* Main Card */}
            <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden p-8">
                {/* Progress Indicator (Only for Signup) */}
                {mode === 'signup' && step < 4 && (
                    <div className="flex gap-2 mb-8 justify-center">
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className={`h-1.5 rounded-full transition-all duration-300 ${step >= i ? "w-8 bg-primary" : "w-4 bg-secondary"
                                    }`}
                            />
                        ))}
                    </div>
                )}

                {/* Content Area */}
                <div className="min-h-[300px]">
                    {mode === 'signin' ? (
                        <SignInForm onNext={() => { }} onSwitchMode={switchToSignUp} />
                    ) : (
                        <>
                            {step === 1 && <Step1_Account onNext={handleNext} onSwitchMode={switchToSignIn} />}
                            {step === 2 && <Step2_Photo onNext={handleNext} onSkip={handleSkip} />}
                            {step === 3 && <Step3_Identity onNext={handleNext} />}
                            {step === 4 && <Step4_Success />}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
