"use client";

import { Facebook, Twitter, Instagram, Linkedin, MapPin, Mail, Phone, Clock, ShoppingBasket } from "lucide-react";
import Link from "next/link";

export function Footer() {
    return (
        <footer className="w-full bg-secondary text-foreground pt-16 pb-8 mt-12 border-t border-border">
            <div className="w-full max-w-[1780px] mx-auto px-4 md:px-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1.5fr] gap-6 pb-12 border-b border-border/50">

                    {/* Brand Section */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground">
                                <ShoppingBasket className="w-5 h-5" />
                            </div>
                            <span className="text-xl font-black font-sans tracking-tight text-foreground">
                                CampusMarket
                            </span>
                        </div>
                        <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
                            The premier marketplace and community hub for university students.
                        </p>
                        <div className="flex gap-4">
                            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                                <Facebook className="w-5 h-5" />
                            </Link>
                            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                                <Twitter className="w-5 h-5" />
                            </Link>
                            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                                <Instagram className="w-5 h-5" />
                            </Link>
                            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                                <Linkedin className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-bold mb-6 text-foreground">Quick Links</h3>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
                            <li><Link href="/community/blog" className="hover:text-primary transition-colors">Blog</Link></li>
                            <li><Link href="/community" className="hover:text-primary transition-colors">Marketplace</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors">Events</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors">About Us</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors">Contact</Link></li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h3 className="text-lg font-bold mb-6 text-foreground">Resources</h3>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li><Link href="#" className="hover:text-primary transition-colors">Help Center</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors">Safety Guidelines</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors">Seller Resources</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors">Buyer Resources</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors">Community Rules</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors">FAQs</Link></li>
                        </ul>
                    </div>

                    {/* Contact Us */}
                    <div>
                        <h3 className="text-lg font-bold mb-6 text-foreground">Contact Us</h3>
                        <ul className="space-y-4 text-sm text-muted-foreground">
                            <li className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                <span>123 University Ave, Campus Center, Building 4</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-primary shrink-0" />
                                <span>support@campusmarket.com</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-primary shrink-0" />
                                <span>(123) 456-7890</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Clock className="w-5 h-5 text-primary shrink-0" />
                                <span>Mon-Fri: 9am-5pm</span>
                            </li>
                        </ul>
                    </div>
                    {/* Newsletter Section */}
                    <div className="bg-primary rounded-2xl p-5 text-primary-foreground shadow-lg flex flex-col h-fit">
                        <div className="flex items-center gap-2 mb-3">
                            <Mail className="w-5 h-5" />
                            <h3 className="text-lg font-black font-sans">Newsletter</h3>
                        </div>
                        <p className="text-sm opacity-90 mb-3 leading-relaxed">
                            Get the latest campus news, marketplace tips, and exclusive content delivered to your inbox.
                        </p>
                        <form className="space-y-2.5">
                            <input
                                type="text"
                                placeholder="Your Name"
                                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 placeholder:text-white/60 text-sm focus:outline-none focus:bg-white/20 text-white transition-colors"
                            />
                            <input
                                type="email"
                                placeholder="Your Email"
                                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 placeholder:text-white/60 text-sm focus:outline-none focus:bg-white/20 text-white transition-colors"
                            />
                            <button className="w-full bg-white text-primary font-bold py-2 rounded-lg hover:bg-white/90 transition-colors text-sm shadow-sm mt-1">
                                Subscribe Now
                            </button>
                        </form>
                        <p className="text-[10px] mt-3 opacity-70 text-center leading-tight">
                            By subscribing, you agree to our Privacy Policy.
                        </p>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
                    <p>
                        © 2023 CampusMarket. All rights reserved.
                    </p>
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
