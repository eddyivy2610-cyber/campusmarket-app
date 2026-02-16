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
        <div className="w-full max-w-5xl mx-auto">
            {/* Main Card */}
            <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-2 min-h-[600px]">

                {/* Left Column: Image Placeholder (Hidden on Mobile) */}
                <div className="hidden md:flex flex-col justify-center items-center bg-muted/30 p-12 text-center relative overflow-hidden">
                    <div className="w-full h-full absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 z-0" />
                    <div className="relative z-10 max-w-sm">
                        <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
                        </div>
                        <h2 className="text-2xl font-bold mb-3 text-foreground">Secure & Convenient</h2>
                        <p className="text-muted-foreground">Join thousands of students buying and selling on Campus Market.</p>
                    </div>
                </div>

                {/* Right Column: Form Content */}
                <div className="p-8 md:p-12 flex flex-col justify-center bg-card">
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
                    <div className="w-full">
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
        </div>
    );
}
