"use client";

import { MapPin, GraduationCap, Edit3, Share2, MoreHorizontal, Star, ShieldCheck, Mail, Check, Flag, MessageCircle, ShoppingBag } from "lucide-react";
import Image from "next/image";

interface ProfileHeaderProps {
    isOwner?: boolean;
}

export function ProfileHeader({ isOwner = false }: ProfileHeaderProps) {
    return (
        <div className="flex flex-col lg:flex-row gap-8 items-start">

            {/* Left: Avatar & Identity Primary */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 flex-1">
                <div className="relative group">
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-secondary shadow-xl relative">
                        <Image
                            src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=400"
                            alt="Lucky John"
                            fill
                            className="object-cover"
                        />
                    </div>
                </div>

                <div className="flex-1 text-center md:text-left space-y-3">
                    <div>
                        <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                            <h1 className="text-2xl md:text-3xl font-sans font-black text-foreground uppercase tracking-tighter">
                                Lucky John
                            </h1>
                            <div className="bg-blue-500 text-white p-0.5 rounded-full shadow-sm" title="Verified Student">
                                <Check className="w-3 h-3" strokeWidth={4} />
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-gray-500 font-sans font-black text-[9px] uppercase tracking-widest">
                            <div className="flex items-center gap-1.5 bg-secondary px-2.5 py-1 rounded-lg border border-foreground/10">
                                <GraduationCap className="w-3 h-3 text-primary" />
                                <span>Engineering Student</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-secondary px-2.5 py-1 rounded-lg border border-foreground/10">
                                <MapPin className="w-3 h-3 text-primary" />
                                <span>UniAbuja</span>
                            </div>
                        </div>
                    </div>

                    {/* Trust Signals (Header Level) */}
                    <div className="flex items-center justify-center md:justify-start gap-4">
                        <div className="flex items-center gap-1.5">
                            <span className="text-lg font-black text-foreground">4.9</span>
                            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">(42 Reviews)</span>
                        </div>
                        <div className="w-px h-3 bg-gray-300"></div>
                        <div className="flex items-center gap-1.5">
                            <span className="text-lg font-black text-foreground">56</span>
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Sales</span>
                        </div>
                        <div className="w-px h-3 bg-gray-300"></div>
                        <div className="flex items-center gap-1.5">
                            <span className="text-lg font-black text-foreground">12</span>
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Active Listings</span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-center md:justify-start gap-2.5 pt-2">
                        {isOwner ? (
                            <>
                                <button className="bg-primary hover:bg-orange-600 text-white font-black py-2.5 px-6 rounded-full shadow-lg shadow-primary/20 transition-all transform hover:-translate-y-1 active:scale-95 flex items-center gap-2 text-[10px] uppercase tracking-widest">
                                    <Edit3 className="w-3.5 h-3.5" />
                                    <span>Edit Profile</span>
                                </button>
                                <button className="bg-secondary hover:bg-secondary/80 text-foreground font-black py-2.5 px-4 rounded-full border border-foreground/10 transition-all transform hover:-translate-y-1 active:scale-95 flex items-center gap-2.5 text-[10px] uppercase tracking-widest">
                                    <Share2 className="w-3.5 h-3.5" />
                                </button>
                            </>
                        ) : (
                            <>
                                <button className="bg-primary hover:bg-orange-600 text-white font-black py-2.5 px-8 rounded-full shadow-lg shadow-primary/20 transition-all transform hover:-translate-y-1 active:scale-95 flex items-center gap-2 text-[10px] uppercase tracking-widest">
                                    <MessageCircle className="w-3.5 h-3.5" />
                                    <span>Message</span>
                                </button>
                                <button className="bg-secondary hover:bg-secondary/80 text-foreground font-black py-2.5 px-6 rounded-full border border-foreground/10 transition-all transform hover:-translate-y-1 active:scale-95 flex items-center gap-2 text-[10px] uppercase tracking-widest">
                                    <ShoppingBag className="w-3.5 h-3.5" />
                                    <span>View Listings</span>
                                </button>
                                <button className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center border border-foreground/10 text-gray-400 hover:text-red-500 transition-all" title="Report User">
                                    <Flag className="w-3.5 h-3.5" />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Right: Clean Context Banner */}
            <div className="w-full lg:w-[320px] bg-gradient-to-br from-secondary to-secondary/50 rounded-2xl p-6 border border-foreground/5 shadow-lg relative overflow-hidden group">
                <div className="relative z-10 space-y-4">
                    <div className="flex items-start justify-between">
                        <div>
                            <span className="bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest inline-block mb-2">
                                Trusted Seller
                            </span>
                            <h3 className="text-base font-black text-foreground leading-tight">
                                Tech & Gadget Specialist
                            </h3>
                        </div>
                        <ShieldCheck className="w-8 h-8 text-foreground/10" />
                    </div>

                    <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
                        "Known for high-quality electronics and quick responses. Usually replies within 1 hour."
                    </p>

                    <div className="h-px bg-foreground/5 w-full"></div>

                    <div className="flex items-center gap-3">
                        <div className="flex -space-x-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-6 h-6 rounded-full border-2 border-secondary bg-gray-200"></div>
                            ))}
                        </div>
                        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-tight">
                            +42 Happy Buyers
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
