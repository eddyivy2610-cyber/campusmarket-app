"use client";

import { GraduationCap, ArrowRight, User } from "lucide-react";
import { OnboardingData } from "./OnboardingContainer";

interface StepProps {
    data: OnboardingData;
    updateData: (fields: Partial<OnboardingData>) => void;
    onNext: () => void;
}

export function Step1_Status({ data, updateData, onNext }: StepProps) {
    const options = ["Undergraduate", "Graduate", "Postgraduate", "Other"];

    return (
        <div className="h-full flex flex-col items-center justify-center p-6 md:p-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="w-full max-w-md space-y-4">

                <div className="text-center space-y-1">
                    <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-2">
                        <GraduationCap className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-black text-foreground">Quick Seller Registration</h2>
                    <p className="text-muted-foreground text-xs">
                        To keep the marketplace student-only, we need a few basic details.
                    </p>
                </div>

                <div className="space-y-4">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Student Status <span className="text-red-500">*</span></label>
                    <div className="space-y-2">
                        {options.map((option) => (
                            <div
                                key={option}
                                onClick={() => updateData({ studentStatus: option })}
                                className={`
                                    relative p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 flex items-center gap-3 group
                                    ${data.studentStatus === option
                                        ? "border-primary bg-primary/5 dark:bg-primary/10 shadow-md"
                                        : "border-gray-100 dark:border-zinc-800 hover:border-gray-200 dark:hover:border-zinc-700 hover:bg-secondary/50 dark:hover:bg-zinc-800/50"}
                                `}
                            >
                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${data.studentStatus === option ? "border-primary" : "border-gray-300"}`}>
                                    {data.studentStatus === option && <div className="w-2 h-2 rounded-full bg-primary" />}
                                </div>
                                <span className={`text-sm font-semibold ${data.studentStatus === option ? "text-primary" : "text-foreground"}`}>{option}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="pt-2 flex justify-between items-center">
                    <button
                        disabled // Back button disabled on first step if needed, but Step 0 handles "Intro"
                        className="text-sm font-bold text-muted-foreground hover:text-foreground opacity-0 cursor-default" // Invisible placeholder for layout
                    >
                        Back
                    </button>

                    <button
                        onClick={onNext}
                        disabled={!data.studentStatus}
                        className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm"
                    >
                        Continue
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>

            </div>
        </div>
    );
}
