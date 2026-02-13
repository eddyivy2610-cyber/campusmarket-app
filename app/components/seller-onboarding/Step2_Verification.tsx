"use client";

import { ScanFace, ArrowRight, ArrowLeft, Lock } from "lucide-react";
import { OnboardingData } from "./OnboardingContainer";

interface StepProps {
    data: OnboardingData;
    updateData: (fields: Partial<OnboardingData>) => void;
    onNext: () => void;
    onBack: () => void;
}

export function Step2_Verification({ data, updateData, onNext, onBack }: StepProps) {
    const isComplete = data.department.length > 2 && data.regNumber.length > 3;

    return (
        <div className="h-full flex flex-col items-center justify-center p-6 md:p-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="w-full max-w-md space-y-4">

                <div className="text-center space-y-1">
                    <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2 animate-pulse">
                        <ScanFace className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-black text-foreground">Student Verification</h2>
                    <p className="text-muted-foreground text-xs">
                        We use this only to verify campus affiliation.
                    </p>
                </div>

                <div className="space-y-3">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Department / Faculty <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            placeholder="e.g., Computer Science"
                            value={data.department}
                            onChange={(e) => updateData({ department: e.target.value })}
                            className="w-full p-2.5 rounded-lg border-2 border-gray-100 dark:border-zinc-800 bg-transparent focus:border-primary focus:outline-none transition-colors font-medium placeholder:text-muted-foreground/50 text-sm text-foreground"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Registration Number <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            placeholder="e.g., 2024CS001"
                            value={data.regNumber}
                            onChange={(e) => updateData({ regNumber: e.target.value })}
                            className="w-full p-2.5 rounded-lg border-2 border-gray-100 dark:border-zinc-800 bg-transparent focus:border-primary focus:outline-none transition-colors font-medium placeholder:text-muted-foreground/50 text-sm text-foreground"
                        />
                    </div>

                    <div className="p-2.5 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 rounded-lg flex gap-2 text-blue-700 dark:text-blue-400">
                        <Lock className="w-5 h-5 shrink-0" />
                        <p className="text-xs font-medium leading-relaxed">
                            Your data is encrypted and used <span className="font-bold">only</span> for verification. Verification is automated for privacy.
                        </p>
                    </div>
                </div>

                <div className="pt-4 flex justify-between items-center">
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
                        Continue
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>

            </div>
        </div>
    );
}
