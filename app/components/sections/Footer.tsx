"use client";

import { Facebook, Twitter, Instagram, Linkedin, MapPin, Mail, Phone, Clock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export function Footer() {
    return (
        <footer className="w-full bg-secondary text-foreground pt-14 pb-8 mt-12 border-t border-border font-heading">
            <div className="w-full max-w-[1780px] mx-auto px-4 md:px-12 space-y-10">
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-10 pb-10 border-b border-border/50">
                    <div className="space-y-4">
                        <div className="flex items-center gap-0">
                            <Image
                                src="/LOGO.png"
                                alt="CampusMarket logo"
                                width={56}
                                height={56}
                                className="h-7 w-auto shrink-0"
                            />
                            <span className="text-lg font-extrabold font-sans tracking-tight text-foreground leading-none">
                                <span className="text-[#16325f]">Campus</span>{" "}
                                <span className="text-orange-500">Market</span>
                            </span>
                        </div>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                            The premier marketplace and community hub for university students.
                        </p>
                        <div className="flex gap-4">
                            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors"><Facebook className="w-5 h-5" /></Link>
                            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors"><Twitter className="w-5 h-5" /></Link>
                            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors"><Instagram className="w-5 h-5" /></Link>
                            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors"><Linkedin className="w-5 h-5" /></Link>
                        </div>

                        <div className="pt-6 mt-4 border-t border-border/50">
                            <p className="text-xs font-bold uppercase tracking-widest text-foreground/80 mb-3">Our Core Team</p>
                            <div className="flex items-center">
                                {[
                                    { id: 1, name: "Abdurrahman Kabir.", role: "Project Manager", initials: "AK", color: "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-400" },
                                    { id: 2, name: "Al-Imam Ahmed.", role: "Backend & System Engineer", initials: "AA", color: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400" },
                                    { id: 3, name: "John Lucky.", role: "Frontend Developer", initials: "JL", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400" },
                                ].map((member) => (
                                    <button
                                        key={member.id}
                                        className="group relative w-10 h-10 rounded-full ring-2 ring-secondary bg-background shadow-sm hover:z-10 hover:scale-110 focus:z-10 focus:scale-110 transition-all duration-300 -ml-3 flex items-center justify-center cursor-pointer first:ml-0"
                                    >
                                        <div className={`w-full h-full rounded-full flex items-center justify-center font-bold text-xs ${member.color}`}>
                                            {member.initials}
                                        </div>
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-all duration-200 pointer-events-none w-max z-20 translate-y-2 group-hover:translate-y-0 group-focus:translate-y-0">
                                            <div className="bg-foreground text-background text-xs px-3 py-2 rounded-lg shadow-xl flex flex-col items-center">
                                                <span className="font-bold whitespace-nowrap">{member.name}</span>
                                                <span className="text-[10px] text-background/80 whitespace-nowrap mt-0.5">{member.role}</span>
                                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-foreground"></div>
                                            </div>
                                        </div>Regular profile cant access dashboards, switch
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="hidden sm:flex flex-row flex-wrap gap-x-10 gap-y-6">
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-widest text-foreground mb-3">Quick Links</h3>
                            <div className="flex flex-col gap-2">
                                {[
                                    { label: "Home", href: "/" },
                                    { label: "Marketplace", href: "/listings" },
                                    { label: "Events", href: "#" },
                                    { label: "About Us", href: "/about-us" },
                                    { label: "Contact Support", href: "/help-support" },
                                ].map((l) => (
                                    <Link key={l.label} href={l.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">{l.label}</Link>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-widest text-foreground mb-3">Resources</h3>
                            <div className="flex flex-col gap-2">
                                <Link href="/help" className="text-sm text-muted-foreground hover:text-primary transition-colors">Help Center</Link>
                                <Link href="/feedback" className="text-sm text-muted-foreground hover:text-primary transition-colors">Feedback</Link>
                                {[
                                    { label: "Safety Guidelines", href: "/safety-guidelines" },
                                    { label: "Community Rules", href: "/community-rules" },
                                ].map((link) => (
                                    <Link key={link.label} href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">{link.label}</Link>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-widest text-foreground mb-3">Contact Us</h3>
                            <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
                                <li className="flex items-start gap-2"><MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" /><span>Computer Science Department, Phase 2, ABU Zaria.</span></li>
                                <li className="flex items-center gap-2"><Mail className="w-4 h-4 text-primary shrink-0" /><span>campusmarket@gmail.com</span></li>
                                <li className="flex items-center gap-2"><Phone className="w-4 h-4 text-primary shrink-0" /><span>(234)-815-524-6233</span></li>
                                <li className="flex items-center gap-2"><Clock className="w-4 h-4 text-primary shrink-0" /><span>Mon-Fri: 9am-5pm</span></li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="bg-primary rounded-2xl px-6 py-5 text-primary-foreground shadow-lg flex flex-col sm:flex-row sm:items-center gap-5">
                    <div className="sm:flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <Mail className="w-4 h-4" />
                            <h3 className="text-base font-bold font-sans">Stay in the loop</h3>
                        </div>
                        <p className="text-sm opacity-80 leading-snug">
                            Campus news, marketplace tips, and exclusive deals - straight to your inbox.
                        </p>
                    </div>
                    <form className="flex flex-col sm:flex-row gap-2 sm:items-center sm:shrink-0">
                        <input type="text" placeholder="Your name" className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 placeholder:text-white/50 text-sm focus:outline-none focus:border-white/50 text-white transition-colors w-full sm:w-36" />
                        <input type="email" placeholder="Your email" className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 placeholder:text-white/50 text-sm focus:outline-none focus:border-white/50 text-white transition-colors w-full sm:w-44" />
                        <button className="bg-white text-primary font-bold px-5 py-2 rounded-lg hover:bg-white/90 transition-colors text-sm shadow-sm whitespace-nowrap">
                            Subscribe
                        </button>
                    </form>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
                    <p>© 2025 CampusMarket. All rights reserved.</p>
                    <div className="flex gap-6">
                        <Link href="/usage-policy" className="hover:text-primary transition-colors">Privacy Policy</Link>
                        <Link href="/terms-of-service" className="hover:text-primary transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}

