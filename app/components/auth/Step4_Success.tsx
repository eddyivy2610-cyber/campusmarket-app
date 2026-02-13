"use client";

import { ShoppingBag, Search, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function Step4_Success() {
    const [choice, setChoice] = useState<'sell' | 'buy' | null>(null);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-2">
                <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400">
                        <CheckCircle className="w-8 h-8" />
                    </div>
                </div>
                <h2 className="text-2xl font-bold tracking-tight">Welcome to Campus Market</h2>
                <p className="text-muted-foreground">Your account is ready.</p>
            </div>

            <p className="font-medium text-center text-sm">What would you like to use Campus Market for?</p>

            <div className="space-y-3">
                <button
                    onClick={() => setChoice('sell')}
                    className={`
                        w-full p-4 border rounded-xl transition-all text-left flex items-center gap-4 group hover:shadow-md
                        ${choice === 'sell' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border bg-card hover:border-primary/50'}
                    `}
                >
                    <div className={`p-3 rounded-lg ${choice === 'sell' ? 'bg-primary text-white' : 'bg-secondary text-primary group-hover:bg-primary group-hover:text-white transition-colors'}`}>
                        <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="block font-bold text-sm">I want to sell items</span>
                        <span className="text-xs text-muted-foreground">List items and start receiving buyer messages.</span>
                    </div>
                </button>

                <button
                    onClick={() => setChoice('buy')}
                    className={`
                        w-full p-4 border rounded-xl transition-all text-left flex items-center gap-4 group hover:shadow-md
                        ${choice === 'buy' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border bg-card hover:border-primary/50'}
                    `}
                >
                    <div className={`p-3 rounded-lg ${choice === 'buy' ? 'bg-primary text-white' : 'bg-secondary text-primary group-hover:bg-primary group-hover:text-white transition-colors'}`}>
                        <Search className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="block font-bold text-sm">I'm here to find good deals</span>
                        <span className="text-xs text-muted-foreground">Browse listings from students on your campus.</span>
                    </div>
                </button>
            </div>

            <div className="pt-4 animate-in fade-in duration-300">
                {choice === 'sell' ? (
                    <Link href="/sell" className="inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 h-12 w-full shadow-lg shadow-primary/20">
                        Register as a Seller
                    </Link>
                ) : choice === 'buy' ? (
                    <Link href="/" className="inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 h-12 w-full shadow-lg shadow-primary/20">
                        Start Exploring
                    </Link>
                ) : (
                    <button disabled className="inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-colors bg-secondary text-muted-foreground h-12 w-full cursor-not-allowed opacity-50">
                        Continue
                    </button>
                )}
            </div>
        </div>
    );
}
