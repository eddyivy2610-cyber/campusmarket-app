"use client";

import {
    User, List, MessageSquare, Package, Wallet,
    Settings, LogOut, ChevronRight, Sun, Moon
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

interface AccountDropdownProps {
    isOpen: boolean;
}

export function AccountDropdown({ isOpen }: AccountDropdownProps) {
    const { theme, toggleTheme } = useTheme();
    const menuItems = [
        { icon: User, label: "My Profile", href: "/profile" },
        { icon: List, label: "My Listings", href: "/coming-soon" },
        { icon: MessageSquare, label: "Messages", href: "/coming-soon", badge: "2" },
        { icon: Package, label: "Orders", href: "/coming-soon" },
        { icon: Wallet, label: "Wallet", href: "/coming-soon" },
        { icon: Settings, label: "Settings", href: "/coming-soon" },
    ];

    return (
        <div
            className={`absolute top-full right-0 mt-3 w-64 bg-secondary text-foreground rounded-2xl shadow-2xl border border-white/5 overflow-hidden transition-all duration-300 ease-in-out z-50 ${isOpen
                ? 'opacity-100 translate-y-0 visible'
                : 'opacity-0 -translate-y-4 invisible'
                }`}
        >
            <div className="p-4 bg-white/5 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/30">
                        <User className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-foreground">Lucky John</span>
                        <span className="text-[10px] text-gray-400">Student Account</span>
                    </div>
                </div>
            </div>

            <div className="p-2">
                {menuItems.map((item, index) => (
                    <a
                        key={index}
                        href={item.href}
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-primary/10 group transition-all duration-200"
                    >
                        <div className="flex items-center gap-3">
                            <item.icon className="w-4 h-4 text-primary transition-colors" />
                            <span className="text-sm font-medium text-foreground transition-colors">{item.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            {item.badge && (
                                <span className="bg-primary text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                                    {item.badge}
                                </span>
                            )}
                            <ChevronRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-primary transition-transform group-hover:translate-x-1" />
                        </div>
                    </a>
                ))}
            </div>

            <div className="p-2 mt-1 border-t border-white/5">
                <button
                    onClick={toggleTheme}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-primary/10 group transition-all duration-200"
                >
                    <div className="flex items-center gap-3">
                        {theme === 'dark' ? (
                            <Sun className="w-4 h-4 text-primary transition-colors" />
                        ) : (
                            <Moon className="w-4 h-4 text-primary transition-colors" />
                        )}
                        <span className="text-sm font-medium text-foreground transition-colors">
                            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                        </span>
                    </div>
                    <div className={`w-8 h-4 rounded-full p-1 transition-colors duration-300 ${theme === 'light' ? 'bg-primary' : 'bg-gray-700'}`}>
                        <div className={`w-2 h-2 bg-white rounded-full transition-transform duration-300 ${theme === 'light' ? 'translate-x-4' : 'translate-x-0'}`} />
                    </div>
                </button>

                <button
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-500/10 group transition-all duration-200 text-gray-400 hover:text-red-400"
                >
                    <LogOut className="w-4 h-4 group-hover:animate-pulse" />
                    <span className="text-sm font-medium">Logout</span>
                </button>
            </div>
        </div>
    );
}
