"use client";

import {
    Heart, Sun, Moon, Settings, User, MessageSquare
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";

interface AccountDropdownProps {
    isOpen: boolean;
}

export function AccountDropdown({ isOpen }: AccountDropdownProps) {
    const { theme, setTheme } = useTheme();
    const { user, logout } = useAuth();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div
            className={`absolute top-full right-0 mt-1 w-56 bg-secondary text-foreground font-heading rounded-xl shadow-lg overflow-hidden transition-all duration-200 ease-in-out z-50 origin-top-right ${isOpen
                ? 'opacity-100 scale-100 visible'
                : 'opacity-0 scale-95 invisible'
                }`}
        >
            {/* Header / Auth Actions */}
            <div className="px-4 py-4 bg-secondary/50 border-b border-border/10 text-center">
                {!user ? (
                    <div className="flex flex-col gap-2">
                        <Link
                            href="/login"
                            className="w-full py-2 bg-primary text-white text-xs font-bold uppercase tracking-widest rounded-lg shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-95"
                        >
                            Login
                        </Link>
                        <p className="text-[10px] text-muted-foreground font-medium">
                            New here? <Link href="/register" className="text-primary font-bold hover:underline">Create account</Link>
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        <div className="text-left mb-1">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">Signed in as</p>
                            <p className="text-sm font-bold text-foreground truncate">{user.name}</p>
                            <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
                        </div>
                        <button
                            onClick={logout}
                            className="w-full py-2 bg-secondary border border-border/20 text-foreground text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 transition-all active:scale-95 mt-1"
                        >
                            Logout
                        </button>
                    </div>
                )}
            </div>

            {/* Menu Links */}
            <div className="py-1.5 border-b border-border/10">
                <Link href="/profile/campus-market" className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-primary/10 hover:text-primary transition-colors text-foreground/80">
                    <User className="w-4 h-4" />
                    <span>My Profile</span>
                </Link>
                <Link href="/dashboard/messages" className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-primary/10 hover:text-primary transition-colors text-foreground/80">
                    <MessageSquare className="w-4 h-4" />
                    <span>Messages</span>
                </Link>
                <Link href="/settings" className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-primary/10 hover:text-primary transition-colors text-foreground/80">
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                </Link>
            </div>

            {/* Actions */}
            <div className="pt-1.5 pb-1">
                <button
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="w-full flex items-center justify-between px-4 py-2 text-sm hover:bg-primary/10 hover:text-primary transition-colors text-foreground/80 text-left"
                >
                    <div className="flex items-center gap-3">
                        {mounted && (
                            theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />
                        )}
                        {!mounted && <span className="w-4 h-4" />}
                        <span>{mounted ? (theme === 'dark' ? 'Light Mode' : 'Dark Mode') : 'Theme'}</span>
                    </div>
                </button>
            </div>
        </div>
    );
}
