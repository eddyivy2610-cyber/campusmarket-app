"use client";

import React from "react";
import Link from "next/link";
import { ShoppingBasket, ArrowLeft, Home } from "lucide-react";
import { motion } from "framer-motion";

interface AuthLayoutProps {
    children: React.ReactNode;
    illustration?: React.ReactNode;
    illustrationUrl?: string;
    title?: string;
    subtitle?: string;
    showBack?: boolean;
    onBack?: () => void;
    currentStep?: number;
    totalSteps?: number;
    isWide?: boolean;
}

export function AuthLayout({
    children,
    illustration,
    illustrationUrl,
    title,
    subtitle,
    showBack,
    onBack,
    currentStep,
    totalSteps,
    isWide,
}: AuthLayoutProps) {
    return (
        <div className="w-full flex flex-col md:flex-row bg-background overflow-hidden relative font-heading">
            {/* Decorative Blur Blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[120px] pointer-events-none" />

            {/* Left Panel: Illustration & Branding (Hidden on Small Mobile) */}
            <div className="hidden md:flex flex-1 flex-col items-center justify-center p-8 lg:p-16 relative overflow-hidden bg-secondary/20 border-r border-border/50 min-h-screen">
                <div className="relative z-10 w-full max-w-sm">
                    {/* Logo Section */}
                    <Link href="/" className="flex items-center gap-2 mb-8 group">
                        <div className="p-2.5 bg-primary rounded-xl shadow-lg shadow-primary/20 transition-transform group-hover:scale-110 group-hover:rotate-6">
                            <ShoppingBasket className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold tracking-tight font-heading bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                            CampusMarket
                        </span>
                    </Link>

                    {/* Dynamic Illustration Slot */}
                    <div className="aspect-square w-full relative mb-8">
                        {illustration ? (
                            illustration
                        ) : illustrationUrl ? (
                            <div className="w-full h-full rounded-[32px] overflow-hidden bg-secondary/20">
                                <img
                                    src={"https://plus.unsplash.com/premium_vector-1727516525558-61f528f7cf66?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8b25saW5lJTIwc2hvcHBpbmclMjBtb25leSUyMGlsbHVzdHJhdGlvbnN8ZW58MHx8MHx8fDA%3D"}
                                    alt="Auth Illustration"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ) : (
                            <div className="w-full h-full bg-secondary/40 backdrop-blur-xl rounded-[32px] border border-white/20 shadow-2xl flex items-center justify-center overflow-hidden">
                                <div className="text-center p-6">
                                    <div className="w-16 h-16 bg-primary/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                                        <ShoppingBasket className="w-8 h-8 text-primary animate-pulse" />
                                    </div>
                                    <h2 className="text-xl font-bold mb-1">Join Your Campus Marketplace</h2>
                                    <p className="text-sm text-muted-foreground leading-relaxed">Buy and sell with confidence in your student community.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Right Panel: Form Area
                Mobile  → fills exact viewport height so top-bar & bottom-brand are pinned
                Desktop → reverts to normal min-h-screen centered flex behaviour
            */}
            <div className="flex-1 flex flex-col h-[100dvh] md:h-auto md:min-h-screen bg-background relative z-10">

                {/* ── TOP BAR — pinned on mobile ── */}
                <div className="flex-shrink-0 flex items-center justify-between px-6 pt-6 pb-2 md:px-8 md:pt-8">
                    <div className="flex items-center gap-4">
                        {showBack && (
                            <button
                                onClick={onBack}
                                className="md:hidden flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors group"
                            >
                                <div className="p-2 rounded-full border border-border group-hover:border-primary/30 group-hover:bg-primary/5 transition-all">
                                    <ArrowLeft className="w-4 h-4" />
                                </div>
                                Back
                            </button>
                        )}

                        {/* Back to Home */}
                        <Link
                            href="/"
                            className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors group"
                        >
                            <div className="p-2 rounded-full border border-border group-hover:border-primary/30 group-hover:bg-primary/5 transition-all">
                                <Home className="w-4 h-4" />
                            </div>
                            <span className="hidden sm:inline">Home</span>
                        </Link>
                    </div>

                    {currentStep && totalSteps && (
                        <div className="flex flex-col items-end gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
                                Step {currentStep} of {totalSteps}
                            </span>
                            <div className="flex gap-1">
                                {Array.from({ length: totalSteps }).map((_, idx) => (
                                    <div
                                        key={idx}
                                        className={`h-1.5 rounded-full transition-all duration-500 ${idx + 1 === currentStep
                                            ? "w-8 bg-primary shadow-sm shadow-primary/20"
                                            : idx + 1 < currentStep
                                                ? "w-4 bg-primary/40"
                                                : "w-4 bg-secondary"
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* ── SCROLLABLE FORM AREA ── */}
                <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center px-6 py-6 md:px-8 md:py-8 lg:px-16">
                    <div className={`w-full transition-all duration-500 ${isWide ? 'max-w-xl' : 'max-w-sm'}`}>
                        {/* Form Header */}
                        {(title || subtitle) && (
                            <div className="mb-6 text-center md:text-left">
                                {title && (
                                    <h1 className="text-3xl font-bold font-heading tracking-tight mb-2 leading-tight">
                                        {title}
                                    </h1>
                                )}
                                {subtitle && <p className="text-muted-foreground text-sm leading-relaxed">{subtitle}</p>}
                            </div>
                        )}

                        {/* Form Content */}
                        <div className="relative">
                            {children}
                        </div>
                    </div>
                </div>

                {/* ── BOTTOM BRANDING — pinned on mobile ── */}
                <div className="flex-shrink-0 pb-6 pt-4 border-t border-border/50 flex items-center justify-center md:hidden">
                    <div className="flex items-center gap-2 grayscale brightness-200 opacity-30">
                        <ShoppingBasket className="w-5 h-5" />
                        <span className="text-sm font-bold font-heading uppercase tracking-tighter">CampusMarket</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
