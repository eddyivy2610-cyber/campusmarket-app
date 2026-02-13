"use client";

import { CheckCircle2, ArrowLeft, ExternalLink, PartyPopper } from "lucide-react";
import Link from "next/link";

export function Step4_Success() {
    return (
        <div className="h-full flex flex-col items-center justify-center p-6 md:p-8 animate-in fade-in zoom-in-95 duration-500">
            <div className="w-full max-w-md text-center space-y-4">

                <div className="space-y-2">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto animate-[bounce_2s_infinite]">
                        <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <div className="flex justify-center items-center gap-2">
                        <PartyPopper className="w-5 h-5 text-orange-500 animate-pulse" />
                        <h2 className="text-2xl font-black text-foreground">Application Received</h2>
                        <PartyPopper className="w-5 h-5 text-orange-500 scale-x-[-1] animate-pulse" />
                    </div>
                    <p className="text-muted-foreground text-sm">
                        Your seller registration is being reviewed.<br />
                        Most approvals are completed within 24 hours.
                    </p>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 p-6 rounded-2xl text-left">
                    <div className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                            <span className="text-xs font-bold">i</span>
                        </div>
                        <div className="space-y-1">
                            <p className="font-bold text-blue-900 dark:text-blue-100 text-sm">What happens next?</p>
                            <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                                We'll send you an email notification once your application has been reviewed. You can then start listing your products and selling on our marketplace.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        href="/"
                        className="px-8 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Return to Marketplace
                    </Link>

                    <Link
                        href="/learn-to-sell" // Placeholder link
                        className="px-8 py-3 bg-background border border-gray-200 dark:border-zinc-800 text-foreground font-bold rounded-xl hover:bg-secondary transition-all flex items-center justify-center gap-2"
                    >
                        Learn Listing Tips
                        <ExternalLink className="w-4 h-4" />
                    </Link>
                </div>

            </div>
        </div>
    );
}
