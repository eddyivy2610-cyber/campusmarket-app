"use client";

import { MapPin, GraduationCap, Edit3, Share2, MoreHorizontal, Star, ShieldCheck, Mail, Check, Flag, MessageCircle, ShoppingBag, Zap } from "lucide-react";
import Image from "next/image";

interface ProfileHeaderProps {
    isOwner?: boolean;
}

export function ProfileHeader({ isOwner = false }: ProfileHeaderProps) {
    return (
        <div className="w-full max-w-5xl mx-auto mb-8">

            {/* Profile Bar */}
            <div className="px-4 md:px-10 pt-10 flex flex-col md:flex-row items-start md:items-end gap-4 md:gap-6">
                {/* Avatar */}
                <div className="w-28 h-28 md:w-36 md:h-36 rounded-full border-[5px] border-background bg-gray-100 shadow-md overflow-hidden relative shrink-0">
                    <Image
                        src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=400"
                        alt="Lucky John"
                        fill
                        className="object-cover"
                    />
                </div>

                {/* Identity Block */}
                <div className="flex-1 pb-1 pt-2 md:pt-0 w-full">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">Lucky John</h1>
                                <span className="bg-blue-600 text-white p-0.5 rounded-full" title="Verified Member">
                                    <Check className="w-3 h-3" strokeWidth={4} />
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                                <GraduationCap className="w-4 h-4 text-primary" />
                                <span>Engineering Student</span>
                                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                <span>Dangote Hostel</span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-3">
                            {isOwner ? (
                                <>
                                    <button className="flex-1 md:flex-none bg-secondary hover:bg-secondary/80 text-foreground font-bold py-2 px-6 rounded-xl transition-all active:scale-95 text-xs uppercase tracking-wider flex items-center justify-center gap-2">
                                        <Edit3 className="w-3.5 h-3.5" />
                                        <span>Edit</span>
                                    </button>
                                    <button className="bg-secondary hover:bg-secondary/80 text-foreground p-2 rounded-xl transition-all active:scale-95">
                                        <Share2 className="w-4 h-4" />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button className="flex-1 md:flex-none bg-primary hover:bg-orange-600 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95 text-xs uppercase tracking-wider flex items-center justify-center gap-2">
                                        <MessageCircle className="w-3.5 h-3.5" />
                                        <span>Message</span>
                                    </button>
                                    <button className="bg-secondary hover:bg-secondary/80 text-foreground p-2.5 rounded-xl transition-all active:scale-95 border border-black/5 dark:border-white/5">
                                        <MoreHorizontal className="w-4 h-4" />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bio & Reputation */}
            <div className="px-4 md:px-10 mt-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-5">
                    {/* Stats Row */}
                    <div className="flex flex-wrap gap-2 md:gap-4">
                        <div className="flex items-center gap-1.5 bg-secondary px-3 py-1.5 rounded-lg border border-black/5 dark:border-white/5">
                            <Star className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
                            <span className="text-xs font-bold text-foreground">4.9/5.0</span>
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">(42 Reviews)</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-secondary px-3 py-1.5 rounded-lg border border-black/5 dark:border-white/5">
                            <ShoppingBag className="w-3.5 h-3.5 text-blue-500" />
                            <span className="text-xs font-bold text-foreground">56 Sales</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-secondary px-3 py-1.5 rounded-lg border border-black/5 dark:border-white/5">
                            <Zap className="w-3.5 h-3.5 text-purple-500" />
                            <span className="text-xs font-bold text-foreground">Replies in ~1hr</span>
                        </div>
                    </div>

                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed max-w-2xl">
                        Interface and Brand Designer focused on premium tech gadgets. I sell high-quality used electronics and always ensure description matches the condition.
                    </p>
                </div>

                {/* Side Stats (Desktop Only) */}
                <div className="hidden md:block py-1">
                    <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Trust Score</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full w-[94%] bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full"></div>
                    </div>
                    <p className="text-right text-[10px] text-gray-400 mt-1 font-mono">94/100</p>
                </div>
            </div>
        </div>
    );
}
