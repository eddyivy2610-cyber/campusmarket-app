"use client";

import { Search, Phone, ShoppingBasket, Heart, User, Bell } from "lucide-react";
import { useState } from "react";
import { AccountDropdown } from "./AccountDropdown";
import { CartDropdown } from "./CartDropdown";
import Link from "next/link";
import { useScrollReveal } from "../../hooks/useScrollReveal";

export function MainHeader() {
    useScrollReveal();
    const [isAccountOpen, setIsAccountOpen] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [cartCount, setCartCount] = useState(0);

    return (
        <div className="bg-background text-foreground py-3 border-b border-secondary flex flex-col items-center">
            <div className="w-full max-w-[1780px] px-4 md:px-12 flex flex-col md:flex-row items-center justify-between gap-6">

                {/* Left Section: Logo & Search */}
                <div className="flex flex-1 items-center gap-8 w-full md:w-auto">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 shrink-0 group">
                        <div className="text-xl font-black flex items-center font-sans tracking-tighter uppercase">
                            <span className="text-primary mr-1.5 transition-transform group-hover:scale-110">
                                <ShoppingBasket className="w-6 h-6" />
                            </span>
                            <span className="text-foreground transition-colors">Campus</span>
                            <span className="text-primary ml-0.5">Market</span>
                        </div>
                    </Link>

                    {/* Search Bar (Compact) */}
                    <div className="flex-1 max-w-md w-full relative group">
                        <input
                            type="text"
                            placeholder="What are you looking for?"
                            className="w-full bg-secondary text-foreground rounded-full py-2 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-300 ease-in-out placeholder:text-gray-500 text-xs font-medium"
                        />
                        <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors duration-200" title="Search">
                            <Search className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-6 shrink-0">
                    {/* Contact us */}
                    <div className="hidden lg:flex items-center gap-3" title="Call us for enquiries">
                        <div className="bg-secondary p-2.5 rounded-full">
                            <Phone className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex flex-col text-sm">
                            <span className="text-gray-400 text-xs">Contact us</span>
                            <span className="font-bold font-sans">234 708 106 6985</span>
                        </div>
                    </div>

                    {/* Icons */}
                    <div className="flex items-center gap-4">
                        {/* Notifications */}
                        <div className="relative cursor-pointer group" title="Notifications">
                            <div className="bg-secondary p-2 rounded-full group-hover:bg-primary transition-colors duration-300 border border-white/5">
                                <Bell className="w-4 h-4 group-hover:text-white transition-colors duration-300" />
                            </div>
                            <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                                0
                            </span>
                        </div>

                        <div
                            className="relative cursor-pointer group"
                            title="Shopping Cart"
                            onMouseEnter={() => setIsCartOpen(true)}
                            onMouseLeave={() => setIsCartOpen(false)}
                        >
                            <div className="bg-secondary p-2.5 rounded-full group-hover:bg-primary transition-colors duration-300">
                                <ShoppingBasket className="w-5 h-5 group-hover:text-white transition-colors duration-300" />
                            </div>
                            <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                                {cartCount}
                            </span>

                            <CartDropdown isOpen={isCartOpen} itemCount={cartCount} />
                        </div>

                        <div className="relative cursor-pointer group" title="Wishlist">
                            <div className="bg-secondary p-2.5 rounded-full group-hover:bg-primary transition-colors duration-300">
                                <Heart className="w-5 h-5 group-hover:text-white transition-colors duration-300" />
                            </div>
                            <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                                0
                            </span>
                        </div>

                        <div
                            className="relative cursor-pointer group"
                            onMouseEnter={() => setIsAccountOpen(true)}
                            onMouseLeave={() => setIsAccountOpen(false)}
                            title="Account"
                        >
                            <div className="bg-secondary p-2.5 rounded-full group-hover:bg-primary transition-colors duration-300">
                                <User className="w-5 h-5 group-hover:text-white transition-colors duration-300" />
                            </div>

                            <AccountDropdown isOpen={isAccountOpen} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
