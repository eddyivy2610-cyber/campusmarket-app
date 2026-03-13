"use client";

import {
    Settings, User, MessageSquare, ChevronRight
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";

interface AccountDropdownProps {
    isOpen: boolean;
}

export function AccountDropdown({ isOpen }: AccountDropdownProps) {
    const { user, logout } = useAuth();

    return (
        <div
            className={`absolute top-full right-0 left-auto mt-2 w-[min(84vw,250px)] max-h-[60vh] overflow-y-auto bg-secondary/65 dark:bg-secondary/75 backdrop-blur-md text-foreground font-heading rounded-md border border-border/50 shadow-sm transition-all duration-200 ease-in-out z-50 origin-top ${isOpen
                ? 'opacity-100 scale-100 visible'
                : 'opacity-0 scale-95 invisible'
                }`}
        >
            <div className="px-3 py-3 bg-secondary/20 border-b border-border/20 text-center">
                {!user ? (
                    <div className="flex flex-col gap-2">
                        <Link
                            href="/login"
                            className="w-full py-2 bg-primary text-white text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-primary/90 transition-all active:scale-95"
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
                            className="w-full py-2 bg-secondary border border-border/40 text-foreground text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 transition-all active:scale-95 mt-1"
                        >
                            Logout
                        </button>
                    </div>
                )}
            </div>

            {/* Menu Links */}
            <div className="py-1.5 px-1.5 space-y-0.5">
                <Link href="/profile/campus-market" className="flex items-center justify-between px-2.5 py-2 rounded-lg border border-transparent bg-secondary/40 hover:border-orange-200/80 hover:bg-orange-50 transition-all duration-200 group">
                    <div className="flex items-center gap-2 text-[11px] font-heading font-bold text-foreground group-hover:text-orange-700">
                        <span className="w-6 h-6 rounded-md bg-orange-100 text-orange-700 flex items-center justify-center transition-colors">
                            <User className="w-3.5 h-3.5" />
                        </span>
                        <span>My Profile</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-orange-600 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link href="/dashboard/messages" className="flex items-center justify-between px-2.5 py-2 rounded-lg border border-transparent bg-secondary/40 hover:border-orange-200/80 hover:bg-orange-50 transition-all duration-200 group">
                    <div className="flex items-center gap-2 text-[11px] font-heading font-bold text-foreground group-hover:text-orange-700">
                        <span className="w-6 h-6 rounded-md bg-orange-100 text-orange-700 flex items-center justify-center transition-colors">
                            <MessageSquare className="w-3.5 h-3.5" />
                        </span>
                        <span>Messages</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-orange-600 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link href="/settings" className="flex items-center justify-between px-2.5 py-2 rounded-lg border border-transparent bg-secondary/40 hover:border-orange-200/80 hover:bg-orange-50 transition-all duration-200 group">
                    <div className="flex items-center gap-2 text-[11px] font-heading font-bold text-foreground group-hover:text-orange-700">
                        <span className="w-6 h-6 rounded-md bg-orange-100 text-orange-700 flex items-center justify-center transition-colors">
                            <Settings className="w-3.5 h-3.5" />
                        </span>
                        <span>Settings</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-orange-600 transition-transform group-hover:translate-x-1" />
                </Link>
            </div>

        </div>
    );
}
