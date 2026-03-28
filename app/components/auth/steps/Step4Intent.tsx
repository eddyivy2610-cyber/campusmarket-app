"use client";

import React, { useState } from "react";
import { ShoppingCart, Store, ArrowLeft, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface Step4Props {
    formData: any;
    updateFormData: (data: any) => void;
    onFinish: (intent: 'buy' | 'sell') => Promise<void> | void;
    onBack: () => void;
}

export function Step4Intent({ formData, updateFormData, onFinish, onBack }: Step4Props) {
    const [isLoading, setIsLoading] = useState(false);

    const handleFinish = async (intent: 'buy' | 'sell') => {
        setIsLoading(true);
        updateFormData({ platformIntent: intent });
        try {
            await onFinish(intent);
        } catch (err) {
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6 text-center">
            <div className="space-y-2">
                <h2 className="text-xl font-semibold font-heading">Almost there!</h2>
                <p className="text-sm text-muted-foreground">What do you want to use Campus Hive for?</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* Buy Option */}
                <button
                    onClick={() => handleFinish('buy')}
                    disabled={isLoading}
                    className={`flex flex-col items-center gap-3 p-4 rounded-lg border transition-all group relative overflow-hidden ${formData.platformIntent === 'buy'
                        ? "border-primary bg-primary/5"
                        : "border-border/50 hover:border-primary/30 hover:bg-secondary/20"
                        }`}
                >
                    <div className={`p-3 rounded-lg transition-colors ${formData.platformIntent === 'buy' ? 'bg-primary text-white' : 'bg-secondary text-muted-foreground group-hover:text-primary'}`}>
                        <ShoppingCart className="w-6 h-6" />
                    </div>
                    <div>
                        <p className={`font-semibold uppercase tracking-widest text-xs ${formData.platformIntent === 'buy' ? 'text-primary' : 'text-foreground'}`}>Buy</p>
                        <p className="text-[10px] text-muted-foreground font-medium">Find great deals</p>
                    </div>
                </button>

                {/* Sell Option */}
                <button
                    onClick={() => handleFinish('sell')}
                    disabled={isLoading}
                    className={`flex flex-col items-center gap-3 p-4 rounded-lg border transition-all group relative overflow-hidden ${formData.platformIntent === 'sell'
                        ? "border-primary bg-primary/5"
                        : "border-border/50 hover:border-primary/30 hover:bg-secondary/20"
                        }`}
                >
                    <div className={`p-3 rounded-lg transition-colors ${formData.platformIntent === 'sell' ? 'bg-primary text-white' : 'bg-secondary text-muted-foreground group-hover:text-primary'}`}>
                        <Store className="w-6 h-6" />
                    </div>
                    <div>
                        <p className={`font-semibold uppercase tracking-widest text-xs ${formData.platformIntent === 'sell' ? 'text-primary' : 'text-foreground'}`}>Sell</p>
                        <p className="text-[10px] text-muted-foreground font-medium">Start selling</p>
                    </div>
                </button>
            </div>

            {isLoading && (
                <div className="flex flex-col items-center gap-2 py-4">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    <p className="text-[10px] font-semibold text-primary animate-pulse italic uppercase tracking-widest">
                        {formData.platformIntent === 'sell' ? "Redirecting to Seller verification..." : "Creating your buyer profile..."}
                    </p>
                </div>
            )}

            <div className="pt-4 border-t border-border/30">
                <button
                    onClick={onBack}
                    disabled={isLoading}
                    className="hidden md:flex text-xs font-semibold text-muted-foreground hover:text-primary transition-colors items-center gap-2 mx-auto py-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to step 3
                </button>
                <button
                    onClick={onBack}
                    disabled={isLoading}
                    className="md:hidden mt-3 w-full flex items-center justify-center gap-2 rounded-md border border-border/40 bg-secondary/70 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground hover:border-primary/70 hover:text-primary transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Go back
                </button>
            </div>
        </div>
    );
}
