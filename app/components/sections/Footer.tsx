"use client";

import { Facebook, Twitter, Instagram, Linkedin, MapPin, Mail, Phone, Clock, CheckCircle2, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

export function Footer() {
    const [showSubscribeNotice, setShowSubscribeNotice] = useState(false);

    useEffect(() => {
        if (!showSubscribeNotice) return;
        const timer = setTimeout(() => setShowSubscribeNotice(false), 2600);
        return () => clearTimeout(timer);
    }, [showSubscribeNotice]);
    return (
        <footer className="w-full bg-black text-white pt-14 pb-8 border-t border-white/10 font-heading">
            <div className="w-full max-w-[1780px] mx-auto px-4 md:px-12 space-y-10">
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-10 pb-10 border-b border-white/10">
                    <div className="space-y-4">
                        <div className="flex items-center gap-0">
                            <span className="text-[20px] md:text-[22px] font-bold font-sans text-[#FFD700] whitespace-nowrap drop-shadow-sm">
                                Hive
                            </span>
                        </div>
                        <p className="text-white/70 text-sm leading-relaxed">
                            The premier marketplace and community hub for university students.
                        </p>
                        <div className="flex gap-4">
                            <Link href="/coming-soon" className="text-white/70 hover:text-yellow-300 transition-colors"><Facebook className="w-5 h-5" /></Link>
                            <Link href="/coming-soon" className="text-white/70 hover:text-yellow-300 transition-colors"><Twitter className="w-5 h-5" /></Link>
                            <Link href="/coming-soon" className="text-white/70 hover:text-yellow-300 transition-colors"><Instagram className="w-5 h-5" /></Link>
                            <Link href="/coming-soon" className="text-white/70 hover:text-yellow-300 transition-colors"><Linkedin className="w-5 h-5" /></Link>
                        </div>

                        <div className="pt-6 mt-4 border-t border-white/10">
                            <p className="text-xs font-bold uppercase tracking-widest text-white/80 mb-3">Our Core Team</p>
                            <div className="flex items-center">
                                {[
                                    { id: 1, name: "Abdurrahman Kabir.", role: "Project Manager", initials: "AK", color: "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-400" },
                                    { id: 2, name: "Al-Imam Ahmed.", role: "Backend & System Engineer", initials: "AA", color: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400" },
                                    { id: 3, name: "John Lucky.", role: "Frontend Developer", initials: "JL", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400" },
                                ].map((member, index, array) => {
                                    const isFirst = index === 0;
                                    const isLast = index === array.length - 1;
                                    // Use specific positions on mobile to prevent cut off
                                    const tooltipPosition = isFirst ? "left-0" : isLast ? "right-0" : "left-1/2 -translate-x-1/2";
                                    const arrowPosition = isFirst ? "left-4" : isLast ? "right-4" : "left-1/2 -translate-x-1/2";
                                    
                                    return (
                                    <button
                                        key={member.id}
                                        className="group relative w-10 h-10 rounded-full ring-2 ring-black bg-black/40 shadow-sm hover:z-10 hover:scale-110 focus:z-10 focus:scale-110 transition-all duration-300 -ml-3 flex items-center justify-center cursor-pointer first:ml-0"
                                    >
                                        <div className={`w-full h-full rounded-full flex items-center justify-center font-bold text-xs ${member.color}`}>
                                            {member.initials}
                                        </div>
                                        <div className={`absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-all duration-200 pointer-events-none w-max z-20 translate-y-2 group-hover:translate-y-0 group-focus:translate-y-0 ${tooltipPosition}`}>
                                            <div className="bg-white text-black text-xs px-3 py-2 rounded-lg shadow-xl flex flex-col items-center">
                                                <span className="font-bold whitespace-nowrap">{member.name}</span>
                                                <span className="text-[10px] text-black/70 whitespace-nowrap mt-0.5">{member.role}</span>
                                                <div className={`absolute top-full border-[5px] border-transparent border-t-white ${arrowPosition}`}></div>
                                            </div>
                                        </div>
                                    </button>
                                )})}
                            </div>
                        </div>
                    </div>

                    <div className="hidden sm:flex flex-row flex-wrap gap-x-10 gap-y-6">
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-widest text-white mb-3">Quick Links</h3>
                            <div className="flex flex-col gap-2">
                                {[
                                    { label: "Home", href: "/home" },
                                    { label: "Marketplace", href: "/listings" },
                                    { label: "About Us", href: "/about-us" },
                                    { label: "Contact Support", href: "/help-support" },
                                ].map((l) => (
                                    <Link key={l.label} href={l.href} className="text-sm text-white/70 hover:text-yellow-300 transition-colors">{l.label}</Link>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-widest text-white mb-3">Resources</h3>
                            <div className="flex flex-col gap-2">
                                {[
                                    { label: "Safety Guidelines", href: "/safety-guidelines" },
                                    { label: "Community Rules", href: "/community-rules" },
                                ].map((link) => (
                                    <Link key={link.label} href={link.href} className="text-sm text-white/70 hover:text-yellow-300 transition-colors">{link.label}</Link>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-widest text-white mb-3">Contact Us</h3>
                            <ul className="flex flex-col gap-2 text-sm text-white/70">
                                <li className="flex items-start gap-2"><MapPin className="w-4 h-4 text-yellow-300 shrink-0 mt-0.5" /><span>Ahmadu Bello University, Phase 2, ABU Zaria.</span></li>
                                <li className="flex items-center gap-2"><Mail className="w-4 h-4 text-yellow-300 shrink-0" /><span>campusmarket@gmail.com</span></li>
                                <li className="flex items-center gap-2"><Phone className="w-4 h-4 text-yellow-300 shrink-0" /><span>(234)-815-524-6233</span></li>
                                <li className="flex items-center gap-2"><Clock className="w-4 h-4 text-yellow-300 shrink-0" /><span>Mon-Fri: 9am-5pm</span></li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="bg-white/5 rounded-2xl px-6 py-5 text-white shadow-lg flex flex-col sm:flex-row sm:items-center gap-5 border border-white/10">
                    <div className="sm:flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <Mail className="w-4 h-4 text-yellow-300" />
                            <h3 className="text-base font-bold font-sans">Stay in the loop</h3>
                        </div>
                        <p className="text-sm text-white/70 leading-snug">
                            Campus news, marketplace tips, and exclusive deals - straight to your inbox.
                        </p>
                    </div>
                    <form
                        className="flex flex-col sm:flex-row gap-2 sm:items-center sm:shrink-0"
                        onSubmit={(e) => {
                            e.preventDefault();
                            setShowSubscribeNotice(true);
                        }}
                    >
                        <input type="text" placeholder="Your name" className="px-3 py-2 rounded-lg bg-black/40 border border-white/20 placeholder:text-white/50 text-sm focus:outline-none focus:border-yellow-300/60 text-white transition-colors w-full sm:w-36" />
                        <input type="email" placeholder="Your email" className="px-3 py-2 rounded-lg bg-black/40 border border-white/20 placeholder:text-white/50 text-sm focus:outline-none focus:border-yellow-300/60 text-white transition-colors w-full sm:w-44" />
                        <button className="bg-yellow-300 text-black font-bold px-5 py-2 rounded-lg hover:bg-yellow-200 transition-colors text-sm shadow-sm whitespace-nowrap">
                            Subscribe
                        </button>
                    </form>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-white/60">
                    <p>© 2025 Hive. All rights reserved.</p>
                    <div className="flex gap-6">
                        <Link href="/usage-policy" className="hover:text-yellow-300 transition-colors">Privacy Policy</Link>
                        <Link href="/terms-of-service" className="hover:text-yellow-300 transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </div>
            {showSubscribeNotice && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="w-full max-w-sm rounded-2xl bg-card border border-border/60 shadow-xl p-5 text-center">
                        <div className="mx-auto mb-3 h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        </div>
                        <h3 className="text-sm font-bold text-foreground mb-1">Subscription Confirmed</h3>
                        <p className="text-xs text-muted-foreground mb-4">
                            You will now receive updates from Hive.
                        </p>
                        <button
                            onClick={() => setShowSubscribeNotice(false)}
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-primary/90 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </footer>
    );
}

