"use client";

import { ShoppingBag, UserPlus, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function Hero() {
    return (
        <section className="py-10 bg-background relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 -skew-x-12 translate-x-1/4 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

            <div className="max-w-[1780px] mx-auto px-4 md:px-12 relative z-10">
                <div className="flex flex-col md:flex-row items-center gap-10 lg:gap-16">

                    {/* Text Content */}
                    <div className="flex-1 text-center md:text-left">
                        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3.5 py-1 rounded-full text-[11px] font-black uppercase tracking-widest mb-4 animate-fade-in shadow-lg border border-primary/20">
                            <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary"></span>
                            </span>
                            Campus Market
                        </div>

                        <h1 className="text-4xl lg:text-5xl font-sans font-black text-foreground mb-4 leading-[1.05] tracking-tighter uppercase">
                            Your Campus, <br />
                            <span className="text-primary italic relative">
                                Your Vibe
                                <svg className="absolute -bottom-1 left-0 w-full h-1.5 text-primary/30" viewBox="0 0 100 10" preserveAspectRatio="none">
                                    <path d="M0 5 Q 25 0, 50 5 T 100 5" fill="none" stroke="currentColor" strokeWidth="2" />
                                </svg>
                            </span>
                        </h1>

                        <p className="text-base text-gray-500 mb-8 max-w-lg leading-relaxed font-medium">
                            The spot to buy, sell, and discover unique stuff from people on your campus. Join the community and vibe with the best deals around.
                        </p>

                        <div className="flex flex-wrap justify-center md:justify-start gap-3">
                            <Link
                                href="/explore"
                                className="bg-primary text-white font-black py-3 px-6 rounded-full flex items-center gap-2 hover:bg-orange-600 transition-all duration-300 shadow-xl shadow-primary/20 transform hover:-translate-y-1 group text-xs uppercase tracking-widest"
                            >
                                <ShoppingBag className="w-4 h-4" />
                                <span>Explore Market</span>
                                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                            </Link>

                            <a href="/coming-soon" className="bg-secondary text-foreground font-black py-3 px-6 rounded-full flex items-center gap-2 hover:bg-secondary/80 transition-all duration-300 transform hover:-translate-y-1 text-xs uppercase tracking-widest shadow-md">
                                <UserPlus className="w-4 h-4" />
                                <span>Sign-up</span>
                            </a>
                        </div>

                        {/* Stats/Social Proof */}
                        <div className="mt-12 flex items-center justify-center md:justify-start gap-8 border-t border-white/5 pt-8">
                            <div className="flex flex-col">
                                <span className="text-2xl font-bold text-foreground font-sans tracking-tight">2.5k+</span>
                                <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Students</span>
                            </div>
                            <div className="h-8 w-px bg-white/10"></div>
                            <div className="flex flex-col">
                                <span className="text-2xl font-bold text-foreground font-sans tracking-tight">500+</span>
                                <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Daily Listings</span>
                            </div>
                        </div>
                    </div>

                    {/* Image Section */}
                    <div className="flex-1 relative w-full max-w-2xl animate-fade-in-right">
                        <div className="relative aspect-[4/3] rounded-3xl overflow-hidden">
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Image
                                    src="https://campusmarketng.vercel.app/online-market-cuate.svg"
                                    alt="Campus Market Students"
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            </div>
                            {/* Floating Overlay Elements 
                            <div className="absolute top-8 -right-8 bg-white p-4 rounded-2xl shadow-2xl animate-bounce-slow hidden lg:block">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                                        $
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs text-gray-400 font-bold uppercase">Great Deal</span>
                                        <span className="text-sm font-bold text-gray-900">Vintage Jacket</span>
                                    </div>
                                </div>
                            </div>*/}
                        </div>

                        {/* Shadow blobs */}
                        <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/10 rounded-full blur-[100px]"></div>
                    </div>
                </div>
            </div>
        </section>
    );
}
