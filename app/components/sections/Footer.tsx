"use client";

import { Send, Facebook, Twitter, Instagram, Phone, Mail, FileText, Shield, HelpCircle, RefreshCcw, ShoppingBag } from "lucide-react";
import { ShoppingBasket } from "lucide-react";

export function Footer() {
    return (
        <footer className="w-full bg-secondary text-foreground pt-16 pb-8 mt-12 relative flex flex-col items-center">
            {/* Newsletter Section - Overlapping */}
            <div className="w-full max-w-[1780px] px-4 md:px-12 absolute -top-10 left-1/2 -translate-x-1/2 z-20">
                <div className="bg-background rounded-2xl p-6 md:p-8 border border-white/5 shadow-2xl overflow-hidden relative group">
                    {/* SVG Pattern Background */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none rounded-2xl overflow-hidden">
                        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <path d="M0 10 L100 90 M20 0 L100 80 M0 20 L80 100" stroke="white" strokeWidth="0.5" fill="none" />
                            <circle cx="10" cy="10" r="2" fill="white" />
                            <circle cx="90" cy="90" r="2" fill="white" />
                        </svg>
                    </div>

                    <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
                        <h2 className="text-2xl md:text-3xl font-sans font-black text-foreground uppercase tracking-tighter">
                            Subscribe to <span className="text-primary italic">Newsletter</span>
                        </h2>

                        <div className="w-full max-w-lg relative group/input">
                            <input
                                type="email"
                                placeholder="Enter your email..."
                                className="w-full bg-secondary border border-white/10 rounded-full py-3 pl-6 pr-32 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-sans text-sm text-foreground"
                            />
                            <button className="absolute right-1.5 top-1.5 bottom-1.5 bg-primary hover:bg-orange-600 text-white px-5 rounded-full font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg active:scale-95">
                                <Send className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Subscribe</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full max-w-[1780px] px-4 md:px-12 mt-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 py-12 border-b border-white/5">

                    {/* Brand Section */}
                    <div className="space-y-8">
                        <div className="flex items-center gap-2">
                            <ShoppingBasket className="w-8 h-8 text-primary" />
                            <span className="text-2xl font-bold font-sans tracking-tight text-foreground">
                                Campus<span className="text-primary italic">Market</span>
                            </span>
                        </div>
                        <p className="text-gray-400 italic font-sans leading-relaxed max-w-xs">
                            "Be who you are and say what you feel, because those who mind don’t matter, and those who matter don’t mind."
                        </p>
                        <div className="flex gap-4">
                            <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary hover:scale-110 transition-all border border-white/5">
                                <Facebook className="w-5 h-5 fill-current" />
                            </button>
                            <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary hover:scale-110 transition-all border border-white/5">
                                <Twitter className="w-5 h-5 fill-current" />
                            </button>
                            <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary hover:scale-110 transition-all border border-white/5">
                                <Instagram className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Useful Links Section */}
                    <div>
                        <h3 className="text-xl font-bold mb-8 font-sans border-b border-white/5 pb-4 inline-block text-foreground">Useful Links</h3>
                        <ul className="space-y-4">
                            <li>
                                <a href="#" className="flex items-center gap-3 text-gray-400 hover:text-primary transition-colors group">
                                    <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary transition-colors">
                                        <HelpCircle className="w-3.5 h-3.5 text-primary group-hover:text-white" />
                                    </div>
                                    <span>Help Center</span>
                                </a>
                            </li>
                            <li>
                                <a href="#" className="flex items-center gap-3 text-gray-400 hover:text-primary transition-colors group">
                                    <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary transition-colors">
                                        <FileText className="w-3.5 h-3.5 text-primary group-hover:text-white" />
                                    </div>
                                    <span>Terms & Conditions</span>
                                </a>
                            </li>
                            <li>
                                <a href="#" className="flex items-center gap-3 text-gray-400 hover:text-primary transition-colors group">
                                    <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary transition-colors">
                                        <Shield className="w-3.5 h-3.5 text-primary group-hover:text-white" />
                                    </div>
                                    <span>Privacy Policy</span>
                                </a>
                            </li>
                            <li>
                                <a href="#" className="flex items-center gap-3 text-gray-400 hover:text-primary transition-colors group">
                                    <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary transition-colors">
                                        <RefreshCcw className="w-3.5 h-3.5 text-primary group-hover:text-white" />
                                    </div>
                                    <span>Refund Policy</span>
                                </a>
                            </li>
                            <li className="flex items-center gap-3 text-gray-400 pt-2">
                                <Phone className="w-4 h-4 text-primary" />
                                <span>+234 70 8106 6985</span>
                            </li>
                            <li className="flex items-center gap-3 text-gray-400">
                                <Mail className="w-4 h-4 text-primary" />
                                <span>campusmarket@gmail.com</span>
                            </li>
                        </ul>
                    </div>

                    {/* Seller CTA Section */}
                    <div className="bg-white/5 rounded-2xl p-6 border border-white/10 flex flex-col items-center text-center space-y-4">
                        <h3 className="text-lg font-black font-sans uppercase tracking-tight leading-tight text-foreground">
                            Interested in selling? <br />
                            <span className="text-primary italic">Join the Community</span>
                        </h3>
                        <p className="text-[11px] text-gray-500 leading-relaxed font-medium">
                            Join a trusted student marketplace where buying and selling happens safely, locally, and on your terms.
                        </p>
                        <button className="bg-primary hover:bg-orange-600 text-white font-black py-3 px-8 rounded-full shadow-xl shadow-primary/20 transition-all transform hover:-translate-y-1 active:scale-95 flex items-center gap-2 text-[10px] uppercase tracking-widest">
                            <ShoppingBag className="w-4 h-4" />
                            <span>Become a Seller</span>
                        </button>
                    </div>

                </div>

                {/* Bottom Bar */}
                <div className="py-8 flex flex-col md:flex-row items-center justify-between gap-6 opacity-60">
                    <p className="text-sm">
                        Copyright © 2026 CampusMarket.
                    </p>
                    <div className="flex gap-4">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4 w-auto grayscale brightness-200" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6 w-auto grayscale brightness-200" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-4 w-auto grayscale brightness-200" />
                    </div>
                </div>
            </div>

            {/* Scroll to Top Mockup */}
            <div className="fixed bottom-8 right-8 z-50">
                <button className="w-12 h-12 bg-primary rounded-full shadow-2xl flex items-center justify-center text-white hover:bg-orange-600 transition-all transform hover:-translate-y-1 shadow-primary/30 active:scale-95">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 15l7-7 7 7" />
                    </svg>
                </button>
            </div>
        </footer>
    );
}
