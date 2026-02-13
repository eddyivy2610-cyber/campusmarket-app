"use client";

import { BellRing, ArrowLeft, Check } from "lucide-react";
import { OnboardingData } from "./OnboardingContainer";

interface StepProps {
    data: OnboardingData;
    updateData: (fields: Partial<OnboardingData>) => void;
    onNext: () => void;
    onBack: () => void;
}

export function Step3_Contact({ data, updateData, onNext, onBack }: StepProps) {
    const isComplete = data.phone.length > 5 && data.email.includes("@");

    return (
        <div className="h-full flex flex-col items-center justify-center p-6 md:p-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="w-full max-w-md space-y-4">

                <div className="text-center space-y-1">
                    <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-2">
                        <BellRing className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-black text-foreground">Approval Updates</h2>
                    <p className="text-muted-foreground text-xs">
                        How should we notify you once your seller account is approved?
                    </p>
                </div>

                <div className="space-y-3">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Phone Number <span className="text-red-500">*</span></label>
                        <input
                            type="tel"
                            placeholder="+234..."
                            value={data.phone}
                            onChange={(e) => updateData({ phone: e.target.value })}
                            className="w-full p-2.5 rounded-lg border-2 border-gray-100 dark:border-zinc-800 bg-transparent focus:border-primary focus:outline-none transition-colors font-medium placeholder:text-muted-foreground/50 text-sm text-foreground"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Email Address <span className="text-red-500">*</span></label>
                        <input
                            type="email"
                            placeholder="your.email@university.edu"
                            value={data.email}
                            onChange={(e) => updateData({ email: e.target.value })}
                            className="w-full p-2.5 rounded-lg border-2 border-gray-100 dark:border-zinc-800 bg-transparent focus:border-primary focus:outline-none transition-colors font-medium placeholder:text-muted-foreground/50 text-sm text-foreground"
                        />
                    </div>
                </div>

                <div className="pt-8 flex justify-between items-center">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </button>

                    <button
                        onClick={onNext}
                        disabled={!isComplete}
                        className="px-8 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                        Submit Application
                        <Check className="w-4 h-4" />
                    </button>
                </div>

            </div>
        </div>
    );
}
