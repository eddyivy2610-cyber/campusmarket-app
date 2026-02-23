"use client";

import { Facebook, Twitter, Instagram, Linkedin, MapPin, Mail, Phone, Clock, ShoppingBasket } from "lucide-react";
import Link from "next/link";

export function Footer() {
    return (
        <footer className="w-full bg-secondary text-foreground pt-14 pb-8 mt-12 border-t border-border">
            <div className="w-full max-w-[1780px] mx-auto px-4 md:px-12 space-y-10">

                {/* ── Main grid: Brand + Link groups ── */}
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-10 pb-10 border-b border-border/50">

                    {/* Brand */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground">
                                <ShoppingBasket className="w-5 h-5" />
                            </div>
                            <span className="text-xl font-bold font-sans tracking-tight text-foreground">CampusMarket</span>
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
                    </div>

                    {/* Link groups — hidden on mobile (accessible via hamburger), shown on sm+ */}
                    <div className="hidden sm:flex flex-row flex-wrap gap-x-10 gap-y-6">

                        {/* Quick Links */}
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-widest text-foreground mb-3">Quick Links</h3>
                            <div className="flex flex-col gap-2">
                                {[
                                    { label: "Home", href: "/" },
                                    { label: "Marketplace", href: "/community" },
                                    { label: "Events", href: "#" },
                                    { label: "About Us", href: "#" },
                                    { label: "Contact", href: "#" },
                                ].map(l => (
                                    <Link key={l.label} href={l.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">{l.label}</Link>
                                ))}
                            </div>
                        </div>

                        {/* Resources */}
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-widest text-foreground mb-3">Resources</h3>
                            <div className="flex flex-col gap-2">
                                {["Help Center", "Safety Guidelines", "Seller Resources", "Buyer Resources", "Community Rules", "FAQs"].map(l => (
                                    <Link key={l} href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">{l}</Link>
                                ))}
                            </div>
                        </div>

                        {/* Contact */}
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-widest text-foreground mb-3">Contact Us</h3>
                            <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
                                <li className="flex items-start gap-2"><MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" /><span>123 University Ave, Campus Center</span></li>
                                <li className="flex items-center gap-2"><Mail className="w-4 h-4 text-primary shrink-0" /><span>support@campusmarket.com</span></li>
                                <li className="flex items-center gap-2"><Phone className="w-4 h-4 text-primary shrink-0" /><span>(123) 456-7890</span></li>
                                <li className="flex items-center gap-2"><Clock className="w-4 h-4 text-primary shrink-0" /><span>Mon–Fri: 9am–5pm</span></li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* ── Newsletter — full-width horizontal strip ── */}
                <div className="bg-primary rounded-2xl px-6 py-5 text-primary-foreground shadow-lg flex flex-col sm:flex-row sm:items-center gap-5">
                    {/* Left: copy */}
                    <div className="sm:flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <Mail className="w-4 h-4" />
                            <h3 className="text-base font-bold font-sans">Stay in the loop</h3>
                        </div>
                        <p className="text-sm opacity-80 leading-snug">
                            Campus news, marketplace tips, and exclusive deals — straight to your inbox.
                        </p>
                    </div>
                    {/* Right: form */}
                    <form className="flex flex-col sm:flex-row gap-2 sm:items-center sm:shrink-0">
                        <input type="text" placeholder="Your name" className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 placeholder:text-white/50 text-sm focus:outline-none focus:border-white/50 text-white transition-colors w-full sm:w-36" />
                        <input type="email" placeholder="Your email" className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 placeholder:text-white/50 text-sm focus:outline-none focus:border-white/50 text-white transition-colors w-full sm:w-44" />
                        <button className="bg-white text-primary font-bold px-5 py-2 rounded-lg hover:bg-white/90 transition-colors text-sm shadow-sm whitespace-nowrap">
                            Subscribe
                        </button>
                    </form>
                </div>

                {/* ── Bottom bar ── */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
                    <p>© 2025 CampusMarket. All rights reserved.</p>
                    <div className="flex gap-6">
                        <Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
                        <Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link>
                        <Link href="#" className="hover:text-primary transition-colors">Cookie Policy</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
