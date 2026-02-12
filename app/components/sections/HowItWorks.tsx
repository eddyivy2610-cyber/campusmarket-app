"use client";

import { Search, MessageSquare, ShieldCheck, ArrowRight } from "lucide-react";

export function HowItWorks() {
    const steps = [
        {
            title: "Discover Items on Campus",
            description: "Browse listings posted by students around your campus. Find books, gadgets, fashion, and more — all within walking distance.",
            icon: Search,
            iconColor: "text-primary",
            iconBg: "bg-primary/10",
            imageBg: "bg-gradient-to-br from-primary/20 to-orange-500/5",
            graphic: (
                <div className="relative w-full h-full flex items-center justify-center">
                    <div className="absolute w-40 h-40 bg-primary/20 rounded-full blur-3xl"></div>
                    <div className="relative bg-secondary p-8 rounded-[2.5rem] border border-white/10 shadow-2xl scale-110">
                        <Search className="w-16 h-16 text-primary" />
                    </div>
                    <div className="absolute top-1/4 right-1/4 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 shadow-xl animate-bounce-slow">
                        <div className="w-12 h-2 bg-primary/40 rounded-full mb-2"></div>
                        <div className="w-8 h-2 bg-white/20 rounded-full"></div>
                    </div>
                </div>
            )
        },
        {
            title: "Chat & Agree",
            description: "Connect directly with the seller through in-app messaging. Ask questions, negotiate, and agree on meetup details.",
            icon: MessageSquare,
            iconColor: "text-emerald-500",
            iconBg: "bg-emerald-500/10",
            imageBg: "bg-gradient-to-br from-emerald-500/20 to-teal-500/5",
            graphic: (
                <div className="relative w-full h-full flex items-center justify-center">
                    <div className="absolute w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl"></div>
                    <div className="relative space-y-4 w-full max-w-[240px]">
                        <div className="bg-secondary p-4 rounded-2xl rounded-bl-none border border-white/10 shadow-xl self-start ml-4 transform -rotate-2">
                            <div className="w-24 h-2 bg-white/20 rounded-full"></div>
                        </div>
                        <div className="bg-primary p-4 rounded-2xl rounded-br-none shadow-xl self-end mr-4 transform rotate-2">
                            <div className="w-32 h-2 bg-white/40 rounded-full"></div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "Meet & Trade Safely",
            description: "Meet within campus to inspect items and complete your transaction safely — no delivery stress, no hidden fees.",
            icon: ShieldCheck,
            iconColor: "text-blue-500",
            iconBg: "bg-blue-500/10",
            imageBg: "bg-gradient-to-br from-blue-500/20 to-indigo-500/5",
            graphic: (
                <div className="relative w-full h-full flex items-center justify-center">
                    <div className="absolute w-40 h-40 bg-blue-500/20 rounded-full blur-3xl"></div>
                    <div className="relative bg-secondary p-10 rounded-full border-4 border-blue-500/30 shadow-2xl">
                        <ShieldCheck className="w-20 h-20 text-blue-500" />
                    </div>
                    <div className="absolute inset-0 border-2 border-dashed border-white/10 rounded-[3rem] m-8 rotate-12"></div>
                </div>
            )
        }
    ];

    return (
        <section className="py-10 bg-background relative overflow-hidden">
            <div className="max-w-[1780px] mx-auto px-4 md:px-12 relative z-10">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-4xl font-sans font-black text-foreground mb-4 uppercase tracking-tighter">
                        How <span className="text-primary italic">CampusMarket</span> Works
                    </h2>
                    <p className="text-gray-500 text-sm font-medium">
                        Buy and sell within your campus in just three simple steps.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {steps.map((step, index) => (
                        <div
                            key={index}
                            className="bg-secondary rounded-2xl p-6 border border-white/5 relative overflow-hidden group hover:-translate-y-1 transition-all duration-500 shadow-lg hover:shadow-xl"
                        >
                            {/* Ambient Background */}
                            <div className={`absolute -top-10 -right-10 w-40 h-40 rounded-full blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity ${step.iconBg.replace('bg-', 'bg-')}`}></div>

                            {/* Icon */}
                            <div className={`${step.iconBg} ${step.iconColor} w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-sm border border-white/5 relative z-10`}>
                                <step.icon className="w-5 h-5" />
                            </div>

                            {/* Content */}
                            <div className="relative z-10">
                                <h3 className="text-lg font-black text-foreground mb-2 font-sans uppercase tracking-tight">
                                    {step.title}
                                </h3>
                                <p className="text-gray-500 text-xs leading-relaxed mb-4 font-medium min-h-[48px]">
                                    {step.description}
                                </p>
                                <button className="flex items-center gap-1.5 text-primary font-black hover:gap-3 transition-all group underline-offset-8 hover:underline text-[10px] uppercase tracking-widest">
                                    <span>Learn more</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Background elements */}
            <div className="absolute top-1/4 -left-64 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-1/4 -right-64 w-96 h-96 bg-secondary/20 rounded-full blur-[100px] pointer-events-none"></div>
        </section>
    );
}
