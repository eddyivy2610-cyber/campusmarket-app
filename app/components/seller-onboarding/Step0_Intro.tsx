"use client";

import { CheckCircle2, ShoppingBag, MessageCircle, ArrowRight, ShieldCheck, TrendingUp } from "lucide-react";
import Image from "next/image";

interface StepProps {
    onNext: () => void;
}

export function Step0_Intro({ onNext }: StepProps) {
    return (
        <div className="flex flex-col md:flex-row h-full">
            {/* Left Col: Info */}
            <div className="flex-1 p-6 flex flex-col justify-center animate-in fade-in slide-in-from-left-4 duration-500">
                <div className="mb-4">
                    <div className="flex gap-1.5 mb-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                        <span className="w-1.5 h-1.5 rounded-full bg-primary/20" />
                        <span className="w-1.5 h-1.5 rounded-full bg-primary/10" />
                    </div>
                    <h1 className="text-3xl md:text-3xl font-black font-heading text-foreground mb-2 leading-tight">
                        Start Selling on <br />
                        <span className="text-foreground tracking-tighter">Campus</span>
                        <span className="text-primary ml-0.5">Market</span>
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        Sell directly to students. No business required.
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3">
                    {[
                        { icon: ShieldCheck, text: "Credibility Badge", color: "bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400" },
                        { icon: TrendingUp, text: "More Visibility", color: "bg-purple-100 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400" },
                        { icon: MessageCircle, text: "Direct Chats", color: "bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400" },
                        { icon: ShoppingBag, text: "Easy Sales", color: "bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400" },
                    ].map((feature, i) => (
                        <div key={i} className="flex items-center gap-2 group">
                            <div className={`w-6 h-6 rounded-full ${feature.color} flex items-center justify-center`}>
                                <feature.icon className="w-3 h-3" />
                            </div>
                            <span className="font-bold text-xs text-foreground">{feature.text}</span>
                        </div>
                    ))}
                </div>

                {/* Mini Timeline */}
                <div className="bg-secondary/50 rounded-xl p-3 mb-3 border border-border/50">
                    <div className="flex justify-between items-center relative">
                        {/* Line */}
                        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-zinc-200 dark:bg-zinc-800 -z-10" />

                        {[
                            { num: 1, label: "Register" },
                            { num: 2, label: "Verify" },
                            { num: 3, label: "List" },
                            { num: 4, label: "Earn" },
                        ].map((step, i) => (
                            <div key={i} className="flex flex-col items-center gap-1 bg-background/0">
                                <div className="w-6 h-6 rounded-full bg-white dark:bg-zinc-800 border-2 border-primary/20 text-primary text-[10px] font-bold flex items-center justify-center shadow-sm">
                                    {step.num}
                                </div>
                                <span className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400">{step.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <button
                    onClick={onNext}
                    className="w-full py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm"
                >
                    Start Now
                    <ArrowRight className="w-4 h-4" />
                </button>
            </div>

            {/* Right Col: Illustration (Hidden on mobile) */}
            <div className="hidden md:block w-1/2 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center p-8">
                    <div className="relative w-full h-full flex items-center justify-center">
                        <Image
                            src="/freepik__flat-2d-vector-smiling-student-shop-owner-standing__50288-removebg-preview.png"
                            alt="Student Shop Owner"
                            className="object-contain"
                            fill
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
