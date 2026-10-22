"use client";

import { X, Bell, Search, Tag, DollarSign, CheckCircle } from "lucide-react";
import { useState } from "react";

interface CreateAlertModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CreateAlertModal({ isOpen, onClose }: CreateAlertModalProps) {
    const [step, setStep] = useState<'form' | 'success'>('form');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStep('success');
        setTimeout(() => {
            onClose();
            setTimeout(() => setStep('form'), 300);
        }, 1500);
    };

    return (
        <>
            {/* Backdrop — only on sm+ */}
            <div
                className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200 hidden sm:block"
                onClick={onClose}
            />

            {/* Panel —
                Mobile:  fixed bottom sheet, full width, slides up, rounded top corners
                Desktop: centered modal, max-w-md
            */}
            <div className="fixed inset-x-0 bottom-0 z-50 sm:inset-0 sm:flex sm:items-center sm:justify-center sm:p-4 pointer-events-none">
                <div
                    className="
                        pointer-events-auto
                        bg-background w-full
                        rounded-t-3xl sm:rounded-3xl
                        border border-foreground/10 shadow-2xl overflow-hidden
                        animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200
                        sm:max-w-sm
                    "
                    onClick={(e) => e.stopPropagation()}
                >
                    {step === 'form' ? (
                        <form onSubmit={handleSubmit} className="p-5 space-y-4">
                            {/* Header */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="p-1.5 bg-primary/10 rounded-lg">
                                        <Bell className="w-4 h-4 text-primary" />
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-bold text-foreground">Create Alert</h2>
                                        <p className="text-[10px] text-muted-foreground font-medium">Get notified when items match</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-full transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Drag handle — mobile only */}
                            <div className="flex justify-center sm:hidden -mt-1 mb-1">
                                <div className="w-8 h-1 bg-border rounded-full" />
                            </div>

                            {/* Keyword */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">
                                    What are you looking for?
                                </label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                                    <input
                                        type="text"
                                        placeholder="e.g. iPhone 13, Study Desk, Textbooks…"
                                        className="w-full bg-secondary/30 border border-border/60 rounded-xl py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all placeholder:text-muted-foreground/60"
                                        autoFocus
                                    />
                                </div>
                            </div>

                            {/* Filters */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Category</label>
                                    <div className="relative">
                                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                                        <select className="w-full bg-secondary/30 border border-border/60 rounded-xl py-2 pl-8 pr-6 text-xs font-medium focus:outline-none focus:border-primary/50 appearance-none cursor-pointer">
                                            <option>Any Category</option>
                                            <option>Gadgets</option>
                                            <option>Furniture</option>
                                            <option>Books</option>
                                            <option>Fashion</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Max Price</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                                        <input
                                            type="number"
                                            placeholder="Any"
                                            className="w-full bg-secondary/30 border border-border/60 rounded-xl py-2 pl-8 pr-3 text-xs font-medium focus:outline-none focus:border-primary/50"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Submit */}
                            <div>
                                <button
                                    type="submit"
                                    className="w-full bg-foreground text-background font-bold py-3 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm"
                                >
                                    <Bell className="w-4 h-4" />
                                    Create Alert
                                </button>
                                <p className="text-[10px] text-center text-muted-foreground mt-2">
                                    We'll notify you instantly when a match is found.
                                </p>
                            </div>
                        </form>
                    ) : (
                        <div className="p-10 flex flex-col items-center justify-center text-center space-y-3">
                            <div className="w-14 h-14 bg-emerald-500/10 rounded-full flex items-center justify-center animate-in zoom-in spin-in-12 duration-500">
                                <CheckCircle className="w-7 h-7 text-emerald-500" />
                            </div>
                            <h3 className="text-base font-bold text-foreground">Alert Created!</h3>
                            <p className="text-sm text-muted-foreground max-w-[180px]">You'll be the first to know when we find a match.</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
