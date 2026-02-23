"use client";

import React, { useState } from "react";
import { ShoppingCart, Store, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

interface Step4Props {
    formData: any;
    updateFormData: (data: any) => void;
    onFinish: (intent: 'buy' | 'sell') => void;
    onBack: () => void;
}

export function Step4Intent({ formData, updateFormData, onFinish, onBack }: Step4Props) {
    const [isLoading, setIsLoading] = useState(false);
    const [agreed, setAgreed] = useState(formData.agreedToTerms || false);
    const [error, setError] = useState("");

    const handleFinish = async (intent: 'buy' | 'sell') => {
        if (!agreed) {
            setError("You must agree to the Privacy Policy to proceed");
            return;
        }

        setIsLoading(true);
        updateFormData({ platformIntent: intent, agreedToTerms: true });
        await new Promise((resolve) => setTimeout(resolve, 1200));
        setIsLoading(false);
        onFinish(intent);
    };

    return (
        <div className="space-y-6 text-center">
            <div className="space-y-2">
                <h2 className="text-2xl font-bold font-heading">Almost there!</h2>
                <p className="text-muted-foreground">What do you want to use Campus Market for?</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* Buy Option */}
                <button
                    onClick={() => handleFinish('buy')}
                    disabled={isLoading}
                    className={`flex flex-col items-center gap-3 p-5 rounded-[24px] border-2 transition-all group relative overflow-hidden ${formData.platformIntent === 'buy'
                        ? "border-primary bg-primary/5 shadow-lg"
                        : "border-border/50 hover:border-primary/30 hover:bg-secondary/20"
                        }`}
                >
                    <div className={`p-4 rounded-2xl transition-colors ${formData.platformIntent === 'buy' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-secondary text-muted-foreground group-hover:text-primary'}`}>
                        <ShoppingCart className="w-8 h-8" />
                    </div>
                    <div>
                        <p className={`font-bold uppercase tracking-widest text-sm ${formData.platformIntent === 'buy' ? 'text-primary' : 'text-foreground'}`}>Buy</p>
                        <p className="text-[10px] text-muted-foreground font-medium">Find great deals</p>
                    </div>
                </button>

                {/* Sell Option */}
                <button
                    onClick={() => handleFinish('sell')}
                    disabled={isLoading}
                    className={`flex flex-col items-center gap-3 p-5 rounded-[24px] border-2 transition-all group relative overflow-hidden ${formData.platformIntent === 'sell'
                        ? "border-primary bg-primary/5 shadow-lg"
                        : "border-border/50 hover:border-primary/30 hover:bg-secondary/20"
                        }`}
                >
                    <div className={`p-4 rounded-2xl transition-colors ${formData.platformIntent === 'sell' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-secondary text-muted-foreground group-hover:text-primary'}`}>
                        <Store className="w-8 h-8" />
                    </div>
                    <div>
                        <p className={`font-bold uppercase tracking-widest text-sm ${formData.platformIntent === 'sell' ? 'text-primary' : 'text-foreground'}`}>Sell</p>
                        <p className="text-[10px] text-muted-foreground font-medium">Start selling</p>
                    </div>
                </button>
            </div>

            {/* Terms & Conditions */}
            <div className="pt-4 space-y-4">
                <label className="flex items-start gap-3 cursor-pointer group px-4">
                    <div className="relative flex items-center mt-0.5">
                        <input
                            type="checkbox"
                            checked={agreed}
                            onChange={(e) => {
                                setAgreed(e.target.checked);
                                setError("");
                            }}
                            className="peer h-5 w-5 opacity-0 absolute cursor-pointer"
                        />
                        <div className={`h-5 w-5 border-2 rounded-md transition-all ${agreed ? 'bg-primary border-primary' : 'border-border peer-hover:border-primary/50'
                            } flex items-center justify-center text-white`}>
                            {agreed && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </div>
                    </div>
                    <span className="text-xs text-muted-foreground text-left leading-relaxed">
                        I agree to the <span className="text-primary font-bold hover:underline">Privacy Policy</span> and <span className="text-primary font-bold hover:underline">Terms of Service</span>.
                    </span>
                </label>
                {error && <p className="text-xs font-bold text-red-500 animate-pulse">{error}</p>}
            </div>

            {isLoading && (
                <div className="flex flex-col items-center gap-2 py-4">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    <p className="text-xs font-bold text-primary animate-pulse italic uppercase tracking-widest">
                        {formData.platformIntent === 'sell' ? "Redirecting to Seller verification..." : "Creating your buyer profile..."}
                    </p>
                </div>
            )}

            <div className="pt-4 border-t border-border/30">
                <button
                    onClick={onBack}
                    disabled={isLoading}
                    className="hidden md:flex text-sm font-bold text-muted-foreground hover:text-primary transition-colors items-center gap-2 mx-auto py-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to step 3
                </button>
            </div>
        </div>
    );
}
