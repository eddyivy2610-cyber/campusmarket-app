"use client";

import { CheckCircle2, MapPin, GraduationCap, Building2, Calendar, Edit3, Share2, MoreHorizontal, Star, ShieldCheck, Mail, Phone, BadgeCheck } from "lucide-react";
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
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-[2rem] overflow-hidden border-4 border-secondary shadow-xl relative">
                        <Image
                            src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=400"
                            alt="Lucky John"
                            fill
                            className="object-cover"
                        />
                    </div>
                    {isOwner && (
                        <button className="absolute -bottom-1 -right-1 bg-primary text-white p-2 rounded-xl shadow-lg hover:scale-110 transition-all border-2 border-background active:scale-95">
                            <Edit3 className="w-3.5 h-3.5" />
                        </button>
                    )}
                    <div className="absolute -top-2 -left-2 bg-emerald-500 text-white px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter flex items-center gap-1 shadow-lg border-2 border-background">
                        <BadgeCheck className="w-3 h-3" />
                        <span>Verified Student</span>
                    </div>
                </div>

                <div className="flex-1 text-center md:text-left space-y-3">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-sans font-black text-foreground uppercase tracking-tighter mb-1">
                            Lucky John
                        </h1>
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-gray-500 font-sans font-black text-[9px] uppercase tracking-widest">
                            <div className="flex items-center gap-1.5 bg-secondary px-2.5 py-1 rounded-lg border border-foreground/10">
                                <GraduationCap className="w-3 h-3 text-primary" />
                                <span>Faculty of Engineering</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-secondary px-2.5 py-1 rounded-lg border border-foreground/10">
                                <MapPin className="w-3 h-3 text-primary" />
                                <span>University of Abuja</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-sm">
                        <div className="flex items-center gap-2 text-gray-400 text-[10px] font-medium bg-secondary p-2.5 rounded-xl border border-foreground/10">
                            <Building2 className="w-3.5 h-3.5 text-primary/60" />
                            <span>Hostel: ICSA Hall (Room B32)</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400 text-[10px] font-medium bg-secondary p-2.5 rounded-xl border border-foreground/10">
                            <Calendar className="w-3.5 h-3.5 text-primary/60" />
                            <span>Joined: February 2026</span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-center md:justify-start gap-2.5 pt-1">
                        {isOwner ? (
                            <>
                                <button className="bg-primary hover:bg-orange-600 text-white font-black py-2.5 px-6 rounded-xl shadow-lg shadow-primary/20 transition-all transform hover:-translate-y-1 active:scale-95 flex items-center gap-2 text-[10px] uppercase tracking-widest">
                                    <Edit3 className="w-3.5 h-3.5" />
                                    <span>Edit Profile</span>
                                </button>
                                <button className="bg-secondary hover:bg-secondary/80 text-foreground font-black py-2.5 px-4 rounded-xl border border-foreground/10 transition-all transform hover:-translate-y-1 active:scale-95 flex items-center gap-2.5 text-[10px] uppercase tracking-widest">
                                    <Share2 className="w-3.5 h-3.5" />
                                </button>
                            </>
                        ) : (
                            <>
                                <button className="bg-primary hover:bg-orange-600 text-white font-black py-2.5 px-8 rounded-xl shadow-lg shadow-primary/20 transition-all transform hover:-translate-y-1 active:scale-95 flex items-center gap-2 text-[10px] uppercase tracking-widest">
                                    <Mail className="w-3.5 h-3.5" />
                                    <span>Message Seller</span>
                                </button>
                                <button className="bg-secondary hover:bg-secondary/80 text-foreground font-black py-2.5 px-6 rounded-xl border border-foreground/10 transition-all transform hover:-translate-y-1 active:scale-95 flex items-center gap-2 text-[10px] uppercase tracking-widest">
                                    <span>Follow Seller</span>
                                </button>
                            </>
                        )}
                        <button className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center border border-foreground/10 text-gray-500 hover:text-primary transition-all">
                            <MoreHorizontal className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Right: Reputation & Trust Signals */}
            <div className="w-full lg:w-[280px] bg-secondary rounded-[1.5rem] p-5 border border-foreground/10 shadow-xl relative overflow-hidden group backdrop-blur-sm">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 -skew-x-12 translate-x-1/4 -translate-y-1/4 pointer-events-none group-hover:scale-110 transition-transform duration-700"></div>

                <div className="relative space-y-4">
                    <div className="flex items-end justify-between">
                        <div className="space-y-0.5">
                            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Seller Reputation</span>
                            <div className="flex items-center gap-1.5">
                                <span className="text-3xl font-sans font-black text-foreground">4.9</span>
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-0.5">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
                                        ))}
                                    </div>
                                    <span className="text-[8px] font-bold text-gray-500 uppercase tracking-tighter">42 Reviews</span>
                                </div>
                            </div>
                        </div>
                        <div className="bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20">
                            <ShieldCheck className="w-5 h-5 text-emerald-400" />
                        </div>
                    </div>

                    <div className="h-px bg-foreground/10"></div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between group/sig">
                            <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover/sig:scale-110 transition-transform">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                </div>
                                <span className="text-[9px] font-black text-foreground uppercase tracking-tight">Student ID Verified</span>
                            </div>
                            <span className="text-[7px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-400/10 px-1.5 py-0.5 rounded-md">Trusted</span>
                        </div>
                        <div className="flex items-center justify-between group/sig">
                            <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover/sig:scale-110 transition-transform">
                                    <Mail className="w-3.5 h-3.5 text-emerald-400" />
                                </div>
                                <span className="text-[9px] font-black text-foreground uppercase tracking-tight">Email Verified</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-primary/10 rounded-xl p-3 border border-primary/20">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-[8px] font-black text-primary/80 uppercase tracking-widest">Completed Sales</span>
                            <span className="text-[10px] font-black text-foreground">56 Items</span>
                        </div>
                        <div className="w-full h-1 bg-secondary rounded-full overflow-hidden">
                            <div className="w-[85%] h-full bg-primary rounded-full shadow-[0_0_8px_rgba(249,115,22,0.4)]"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
