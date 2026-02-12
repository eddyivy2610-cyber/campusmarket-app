"use client";

import {
    User, Package, MessageSquare, Heart, LogOut, Sun, Moon
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import Link from "next/link";

interface AccountDropdownProps {
    isOpen: boolean;
}

export function AccountDropdown({ isOpen }: AccountDropdownProps) {
    const { theme, toggleTheme } = useTheme();

    return (
        <div
            className={`absolute top-full right-0 mt-1 w-56 bg-secondary text-foreground rounded-xl shadow-lg overflow-hidden transition-all duration-200 ease-in-out z-50 origin-top-right ${isOpen
                ? 'opacity-100 scale-100 visible'
                : 'opacity-0 scale-95 invisible'
                }`}
        >
            {/* Header */}
            <div className="px-4 py-3 bg-secondary/50">
                <p className="text-sm font-bold text-foreground truncate">Hi, Lucky</p>
                <p className="text-[10px] text-gray-500 truncate">lucky@example.com</p>
            </div>

            {/* Menu Links */}
            <div className="py-1.5">
                <Link href="/profile" className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-primary/10 hover:text-primary transition-colors text-foreground/80">
                    <User className="w-4 h-4" />
                    <span>My Account</span>
                </Link>
                <Link href="/coming-soon" className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-primary/10 hover:text-primary transition-colors text-foreground/80">
                    <Package className="w-4 h-4" />
                    <span>Orders</span>
                </Link>
                <Link href="/coming-soon" className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-primary/10 hover:text-primary transition-colors text-foreground/80">
                    <MessageSquare className="w-4 h-4" />
                    <span>Inbox</span>
                </Link>
                <Link href="/wishlist" className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-primary/10 hover:text-primary transition-colors text-foreground/80">
                    <Heart className="w-4 h-4" />
                    <span>Wishlist</span>
                </Link>
            </div>

            {/* Actions */}
            <div className="pt-1.5 pb-1">
                <button
                    onClick={toggleTheme}
                    className="w-full flex items-center justify-between px-4 py-2 text-sm hover:bg-primary/10 hover:text-primary transition-colors text-foreground/80 text-left"
                >
                    <div className="flex items-center gap-3">
                        {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                    </div>
                </button>

                <button className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-red-50 text-red-500 transition-colors text-left">
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
}
