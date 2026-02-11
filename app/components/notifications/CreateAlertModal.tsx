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
            // Reset after closing
            setTimeout(() => setStep('form'), 300);
        }, 1500);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="bg-background rounded-3xl w-full max-w-md border border-foreground/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {step === 'form' ? (
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-xl">
                                    <Bell className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-foreground">Create Alert</h2>
                                    <p className="text-xs text-gray-500 font-medium">Get notified when items match</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={onClose}
                                className="p-2 text-gray-400 hover:text-foreground hover:bg-secondary rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Keyword Input */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">What are you looking for?</label>
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="e.g. iPhone 13, Study Desk, Textbooks..."
                                        className="w-full bg-secondary/30 border border-foreground/10 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all placeholder:text-gray-400 font-medium"
                                        autoFocus
                                    />
                                </div>
                            </div>

                            {/* Filters (Optional) */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">Category</label>
                                    <div className="relative">
                                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                        <select className="w-full bg-secondary/30 border border-foreground/10 rounded-xl py-2.5 pl-9 pr-8 text-xs font-medium focus:outline-none focus:border-primary/50 appearance-none cursor-pointer">
                                            <option>Any Category</option>
                                            <option>Gadgets</option>
                                            <option>Furniture</option>
                                            <option>Books</option>
                                            <option>Fashion</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">Max Price</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                        <input
                                            type="number"
                                            placeholder="Any"
                                            className="w-full bg-secondary/30 border border-foreground/10 rounded-xl py-2.5 pl-9 pr-4 text-xs font-medium focus:outline-none focus:border-primary/50"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                className="w-full bg-foreground text-background font-bold py-3.5 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            >
                                <Bell className="w-4 h-4" />
                                Create Alert
                            </button>
                            <p className="text-[10px] text-center text-gray-400 mt-3 font-medium"> We'll notify you instantly when a match is found.</p>
                        </div>
                    </form>
                ) : (
                    <div className="p-12 flex flex-col items-center justify-center text-center space-y-4">
                        <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-2 animate-in zoom-in spin-in-12 duration-500">
                            <CheckCircle className="w-8 h-8 text-emerald-500" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground">Alert Created!</h3>
                        <p className="text-sm text-gray-500 font-medium max-w-[200px]">You'll be the first to know when we find a match.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
